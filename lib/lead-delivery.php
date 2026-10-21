<?php
declare(strict_types=1);

// Private, durable server-side delivery. Never include an API key in an entry.
final class VenderCrmDelivery
{
    private array $config;
    private string $webRoot;

    public function __construct(array $config, string $webRoot)
    {
        $this->config = $config;
        $this->webRoot = realpath($webRoot) ?: $webRoot;
    }

    public static function json(array $value): string
    {
        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR);
    }

    private function directory(): string
    {
        $dir = (string)($this->config['outbox_dir'] ?? dirname($this->webRoot) . '/.vendercrm-outbox');
        if (!preg_match('~^(?:/|[A-Za-z]:[/\\\\])~', $dir)) throw new RuntimeException('private-directory-required');
        // Resolve the nearest existing ancestor before creating anything.
        $ancestor = $dir;
        while (!file_exists($ancestor) && dirname($ancestor) !== $ancestor) $ancestor = dirname($ancestor);
        $resolved = realpath($ancestor);
        if (!$resolved || $this->insideWebRoot($resolved)) throw new RuntimeException('private-directory-required');
        if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) throw new RuntimeException('queue-unavailable');
        $resolved = realpath($dir);
        if (!$resolved || $this->insideWebRoot($resolved) || !is_writable($resolved)) throw new RuntimeException('queue-unavailable');
        return $resolved;
    }

    private function insideWebRoot(string $path): bool
    {
        $path = str_replace('\\', '/', $path);
        $root = rtrim(str_replace('\\', '/', $this->webRoot), '/');
        if (PHP_OS_FAMILY === 'Windows') { $path = strtolower($path); $root = strtolower($root); }
        return $path === $root || str_starts_with($path, $root . '/');
    }

    private function locked(string $id, callable $operation): mixed
    {
        if (!preg_match('/^[a-f0-9]{64}$/D', $id)) throw new RuntimeException('invalid-entry');
        $dir = $this->directory();
        $lockPath = $dir . '/' . $id . '.lock';
        if (is_link($lockPath) || is_link($dir . '/' . $id . '.json')) throw new RuntimeException('invalid-entry');
        $lock = @fopen($lockPath, 'c');
        if (!$lock) throw new RuntimeException('queue-unavailable');
        @chmod($lockPath, 0600);
        try {
            if (!flock($lock, LOCK_EX)) throw new RuntimeException('queue-unavailable');
            return $operation($dir . '/' . $id . '.json');
        } finally { flock($lock, LOCK_UN); fclose($lock); }
    }

    private function read(string $file): array
    {
        if (is_link($file)) throw new RuntimeException('invalid-entry');
        $bytes = @file_get_contents($file);
        if ($bytes === false) throw new RuntimeException('queue-unavailable');
        $entry = json_decode($bytes, true, 32, JSON_THROW_ON_ERROR);
        if (!is_array($entry) || ($entry['version'] ?? null) !== 1 || !is_array($entry['payload'] ?? null) || !is_string($entry['payload']['idempotency_key'] ?? null) || $entry['payload']['idempotency_key'] === '' || !in_array($entry['state'] ?? '', ['pending', 'delivered'], true) || !is_string($entry['created_at'] ?? null) || strtotime($entry['created_at']) === false || !is_int($entry['attempts'] ?? null) || $entry['attempts'] < 0 || !is_int($entry['next_attempt_at'] ?? null) || $entry['next_attempt_at'] < 0) throw new RuntimeException('invalid-entry');
        if (basename($file, '.json') !== hash('sha256', $entry['payload']['idempotency_key'])) throw new RuntimeException('invalid-entry');
        return $entry;
    }

    private function write(string $file, array $entry): void
    {
        $bytes = self::json($entry) . "\n";
        $temp = tempnam(dirname($file), '.write-');
        if ($temp === false) throw new RuntimeException('queue-unavailable');
        @chmod($temp, 0600);
        try {
            $handle = @fopen($temp, 'wb');
            if (!$handle) throw new RuntimeException('queue-unavailable');
            try {
                $offset = 0;
                while ($offset < strlen($bytes)) {
                    $written = fwrite($handle, substr($bytes, $offset));
                    if (!$written) throw new RuntimeException('queue-unavailable');
                    $offset += $written;
                }
                if (!fflush($handle) || (function_exists('fsync') && !fsync($handle))) throw new RuntimeException('queue-unavailable');
            } finally { fclose($handle); }
            if (!@rename($temp, $file)) throw new RuntimeException('queue-unavailable');
        } finally { if (is_file($temp)) @unlink($temp); }
    }

    public function enqueue(array $payload): string
    {
        if (!is_string($payload['idempotency_key'] ?? null) || strlen($payload['idempotency_key']) < 8 || strlen($payload['idempotency_key']) > 100) throw new RuntimeException('invalid-identity');
        $payload = json_decode(self::json($payload), true, 32, JSON_THROW_ON_ERROR);
        $id = hash('sha256', (string)$payload['idempotency_key']);
        return $this->locked($id, function (string $file) use ($payload, $id): string {
            if (is_file($file)) {
                if ($this->read($file)['payload'] !== $payload) throw new RuntimeException('identity-conflict');
            } else {
                $this->write($file, ['version' => 1, 'payload' => $payload, 'created_at' => gmdate('c'), 'state' => 'pending', 'attempts' => 0, 'next_attempt_at' => 0]);
            }
            return $id;
        });
    }

    /** Save before sending. A verified CRM receipt is the only fallback when disk is unavailable. */
    public function accept(array $payload, ?callable $transport = null): array
    {
        try { $id = $this->enqueue($payload); }
        catch (RuntimeException $error) {
            if (in_array($error->getMessage(), ['identity-conflict', 'invalid-identity', 'invalid-entry'], true)) throw $error;
            $result = $transport ? $transport($payload) : $this->send($payload);
            return ['retained' => false, ...$result];
        }
        try { return ['retained' => true, ...$this->deliver($id, $transport)]; }
        catch (Throwable $error) { return ['retained' => true, 'received' => false, 'code' => 'queue-unavailable']; }
    }

    private function request(string $endpoint, ?array $payload, array $extraHeaders = []): array
    {
        $base = rtrim((string)($this->config['url'] ?? ''), '/');
        $key = (string)($this->config['api_key'] ?? '');
        $parts = parse_url($base);
        // Production is HTTPS, with no redirect or credential-bearing URL.
        $fixture = in_array(PHP_SAPI, ['cli', 'cli-server'], true)
            && ($parts['scheme'] ?? '') === 'http' && ($parts['host'] ?? '') === '127.0.0.1'
            && in_array($key, ['test-key-not-a-secret', 'stub-not-a-real-key', 'test-key'], true);
        if (!$parts || (!$fixture && ($parts['scheme'] ?? '') !== 'https') || empty($parts['host']) || isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment']) || $key === '' || preg_match('/[\r\n]/', $key)) return ['ok' => false, 'code' => 'configuration', 'status' => 0];
        if (!function_exists('curl_init')) return ['ok' => false, 'code' => 'curl-unavailable', 'status' => 0];
        $body = '';
        $ch = curl_init($base . $endpoint);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => false, CURLOPT_FOLLOWLOCATION => false, CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/json', 'X-Api-Key: ' . $key], $extraHeaders),
            CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (&$body): int { if (strlen($body) + strlen($chunk) > 16384) return 0; $body .= $chunk; return strlen($chunk); }]);
        if ($payload !== null) { curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, self::json($payload)); }
        $ok = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $decoded = json_decode($body, true);
        return ['ok' => $ok !== false, 'status' => $status, 'body' => is_array($decoded) ? $decoded : null, 'code' => $ok === false ? 'network' : 'http'];
    }

    public static function receipt(array $response): bool
    {
        $body = $response['body'] ?? null;
        return ($response['ok'] ?? false) && in_array($response['status'] ?? 0, [200, 201], true) && is_array($body)
            && is_string($body['contactId'] ?? null) && preg_match('/^[A-Z0-9]{26}$/D', $body['contactId']) === 1
            && is_string($body['submissionId'] ?? null) && preg_match('/^[A-Z0-9]{26}$/D', $body['submissionId']) === 1;
    }

    public function send(array $payload): array
    {
        $response = $this->request('/api/v1/leads', $payload);
        $received = self::receipt($response);
        return ['received' => $received, 'status' => $response['status'], 'code' => $received ? 'received' : (($response['status'] === 200 || $response['status'] === 201) ? 'invalid-receipt' : $response['code']), 'receipt' => $received ? array_intersect_key($response['body'], array_flip(['contactId', 'submissionId', 'dealId'])) : []];
    }

    public function deliver(string $id, ?callable $transport = null, ?int $now = null, ?string $expectedFingerprint = null): array
    {
        $now ??= time();
        return $this->locked($id, function (string $file) use ($transport, $now, $expectedFingerprint, $id): array {
            $entry = $this->read($file);
            if ($expectedFingerprint !== null && (!hash_equals($id, hash('sha256', (string)$entry['payload']['idempotency_key'])) || !hash_equals($expectedFingerprint, self::fingerprint($entry['payload'])))) throw new RuntimeException('review-changed');
            if ($entry['state'] === 'delivered') return ['received' => true, 'code' => 'already-received', 'receipt' => $entry['receipt'] ?? []];
            if ($expectedFingerprint === null && (in_array($entry['last_status'] ?? 0, [401, 403, 422], true) || ($entry['last_code'] ?? '') === 'invalid-receipt')) return ['received' => false, 'code' => 'needs-review'];
            if ($entry['next_attempt_at'] > $now) return ['received' => false, 'code' => 'waiting'];
            // Lock covers delivery and marking it. A crash is safe: next retry uses the same CRM identity.
            $result = $transport ? $transport($entry['payload']) : $this->send($entry['payload']);
            $entry['attempts']++;
            $entry['last_attempt_at'] = gmdate('c', $now);
            $entry['last_status'] = (int)($result['status'] ?? 0);
            $entry['last_code'] = in_array($result['code'] ?? '', ['received', 'network', 'http', 'invalid-receipt', 'configuration', 'curl-unavailable'], true) ? $result['code'] : 'unknown';
            $entry['state'] = !empty($result['received']) ? 'delivered' : 'pending';
            $entry['next_attempt_at'] = $now + min(21600, 60 * (2 ** min(9, $entry['attempts'] - 1)));
            if ($entry['state'] === 'delivered') {
                $entry['delivered_at'] = gmdate('c', $now);
                $entry['receipt'] = array_intersect_key((array)($result['receipt'] ?? []), array_flip(['contactId', 'submissionId', 'dealId']));
            }
            $this->write($file, $entry);
            return ['received' => $entry['state'] === 'delivered', 'code' => $entry['last_code'], 'status' => $entry['last_status'], 'receipt' => $entry['receipt'] ?? []];
        });
    }

    public function status(): array
    {
        $counts = ['pending' => 0, 'delivered' => 0, 'unreadable' => 0, 'needs_review' => 0, 'oldest_pending_at' => null];
        foreach (glob($this->directory() . '/*.json') ?: [] as $file) {
            try {
                $entry = $this->read($file);
                if (!in_array($entry['state'] ?? '', ['pending', 'delivered'], true)) throw new RuntimeException('invalid-entry');
                $counts[$entry['state']]++;
                if ($entry['state'] === 'pending' && (in_array($entry['last_status'] ?? 0, [401, 403, 422], true) || ($entry['last_code'] ?? '') === 'invalid-receipt')) $counts['needs_review']++;
                if ($entry['state'] === 'pending' && (!$counts['oldest_pending_at'] || $entry['created_at'] < $counts['oldest_pending_at'])) $counts['oldest_pending_at'] = $entry['created_at'];
            } catch (Throwable $error) { $counts['unreadable']++; }
        }
        return $counts;
    }

    public function retry(int $limit): array
    {
        $counts = ['examined' => 0, 'delivered' => 0, 'pending' => 0, 'unreadable' => 0, 'needs_review' => 0];
        $files = glob($this->directory() . '/*.json') ?: [];
        sort($files, SORT_STRING);
        foreach ($files as $file) {
            try {
                $entry = $this->read($file);
                if ($entry['state'] === 'delivered') continue;
                if (in_array($entry['last_status'] ?? 0, [401, 403, 422], true) || ($entry['last_code'] ?? '') === 'invalid-receipt') { $counts['needs_review']++; continue; }
                if ($entry['next_attempt_at'] > time()) continue;
                if ($counts['examined'] >= max(1, min(50, $limit))) break;
                $counts['examined']++;
                $result = $this->deliver(basename($file, '.json'));
                $counts[$result['received'] ? 'delivered' : 'pending']++;
            } catch (Throwable $error) { $counts['unreadable']++; }
        }
        return $counts;
    }

    public function check(): array
    {
        $response = $this->request('/api/v1/sites/connection', null);
        $body = $response['body'] ?? null;
        if ($response['ok'] && $response['status'] === 200 && ($body['scope'] ?? '') === 'configuration-only') {
            return ['status' => 200, 'scope' => 'configuration-only', 'canReceive' => $body['canReceive'] ?? false, 'checks' => $body['checks'] ?? [], 'warnings' => $body['warnings'] ?? []];
        }
        return ['status' => $response['status'], 'code' => $response['code'], 'canReceive' => false];
    }

    /** Canonical UTF-8 JSON: byte-sorted object keys, preserved list order. */
    public static function fingerprint(array $payload): string
    {
        $encode = static function (mixed $value) use (&$encode): string {
            if (is_array($value)) {
                if (array_is_list($value)) return '[' . implode(',', array_map($encode, $value)) . ']';
                $keys = array_keys($value); sort($keys, SORT_STRING);
                $pairs = [];
                foreach ($keys as $key) $pairs[] = json_encode((string)$key, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_LINE_TERMINATORS | JSON_THROW_ON_ERROR) . ':' . $encode($value[$key]);
                return '{' . implode(',', $pairs) . '}';
            }
            if (is_int($value) && abs($value) > 9007199254740991) throw new RuntimeException('review-number-unsupported');
            $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_LINE_TERMINATORS | JSON_THROW_ON_ERROR);
            if (!is_float($value)) return $json;
            if ($value == 0) return '0';
            // Match ECMAScript JSON number thresholds and exponent notation.
            if (!str_contains($json, 'e')) return $json;
            [$mantissa, $exponent] = explode('e', $json);
            $negative = str_starts_with($mantissa, '-');
            if ($negative) $mantissa = substr($mantissa, 1);
            if (str_contains($mantissa, '.')) $mantissa = rtrim(rtrim($mantissa, '0'), '.');
            $power = (int)$exponent;
            if ($power < -6 || $power >= 21) return ($negative ? '-' : '') . $mantissa . 'e' . ($power >= 0 ? '+' : '') . $power;
            $digits = str_replace('.', '', $mantissa); $position = $power + 1;
            if ($position <= 0) $decimal = '0.' . str_repeat('0', -$position) . $digits;
            elseif ($position >= strlen($digits)) $decimal = $digits . str_repeat('0', $position - strlen($digits));
            else $decimal = substr($digits, 0, $position) . '.' . substr($digits, $position);
            return ($negative ? '-' : '') . $decimal;
        };
        return hash('sha256', $encode($payload));
    }

    public function heartbeat(?callable $transport = null, ?int $now = null): array
    {
        $now ??= time();
        $counts = $this->status();
        $error = $counts['unreadable'] > 0 ? 'queue-unreadable' : null;
        foreach (glob($this->directory() . '/*.json') ?: [] as $file) {
            try {
                if (is_link($file)) { $error = 'queue-unreadable'; continue; }
                $entry = $this->read($file);
                if (($entry['state'] ?? '') !== 'pending' || !isset($entry['last_code'])) continue;
                if ($error === 'queue-unreadable') continue;
                $error = in_array($entry['last_code'], ['network', 'curl-unavailable'], true) ? 'network-unavailable' : 'delivery-rejected';
            } catch (Throwable $ignored) { $error = 'queue-unreadable'; }
        }
        $report = ['pending' => min(1000000, $counts['pending']), 'unreadable' => min(1000000, $counts['unreadable']),
            'oldestAgeSeconds' => $counts['oldest_pending_at'] ? min(31536000, max(0, $now - (strtotime($counts['oldest_pending_at']) ?: $now))) : 0, 'error' => $error];
        $timestamp = (string)$now;
        $raw = self::json($report);
        $key = (string)($this->config['api_key'] ?? '');
        $headers = ['X-Delivery-Timestamp: ' . $timestamp, 'X-Delivery-Signature: ' . hash_hmac('sha256', $timestamp . "\n" . $raw, $key)];
        $response = $transport ? $transport('/api/v1/sites/heartbeat', $raw, $headers) : $this->request('/api/v1/sites/heartbeat', $report, $headers);
        return ['reported' => !empty($response['ok']) && ($response['status'] ?? 0) === 204, 'status' => (int)($response['status'] ?? 0), ...$report];
    }

    private function privateReviewPath(string $path, bool $mustExist): string
    {
        if (!preg_match('~^(?:/|[A-Za-z]:[/\\\\])~', $path) || is_link($path)) throw new RuntimeException('private-review-path-required');
        $ancestor = dirname($path);
        while (true) {
            if (is_link($ancestor)) throw new RuntimeException('private-review-path-required');
            if (dirname($ancestor) === $ancestor) break;
            $ancestor = dirname($ancestor);
        }
        $parent = realpath(dirname($path));
        if (!$parent || $this->insideWebRoot($parent)) throw new RuntimeException('private-review-path-required');
        $resolved = $parent . DIRECTORY_SEPARATOR . basename($path);
        if ($mustExist && (!is_file($resolved) || is_link($resolved))) throw new RuntimeException('private-review-path-required');
        return $resolved;
    }

    public function exportReview(string $output, int $limit = 10): array
    {
        if ($limit < 1 || $limit > 50) throw new RuntimeException('review-limit');
        $output = $this->privateReviewPath($output, false);
        if (file_exists($output)) throw new RuntimeException('review-output-exists');
        $entries = []; $unreadable = 0;
        $files = glob($this->directory() . '/*.json') ?: []; sort($files, SORT_STRING);
        foreach ($files as $file) {
            if (count($entries) >= $limit) break;
            try {
                $id = basename($file, '.json');
                $entry = $this->locked($id, fn(string $lockedFile): array => $this->read($lockedFile));
                if (($entry['state'] ?? '') !== 'pending') continue;
                if (!hash_equals($id, hash('sha256', (string)$entry['payload']['idempotency_key']))) throw new RuntimeException('invalid-entry');
                self::fingerprint($entry['payload']);
                $entries[] = ['id' => $id, 'payload' => $entry['payload']];
            } catch (Throwable $ignored) { $unreadable++; }
        }
        $oldMask = umask(0077);
        try { $handle = @fopen($output, 'x+b'); } finally { umask($oldMask); }
        if (!$handle) throw new RuntimeException('review-output-unavailable');
        try {
            if (!@chmod($output, 0600)) throw new RuntimeException('review-output-permissions');
            $bytes = self::json(['version' => 1, 'siteDomain' => (string)($this->config['site_domain'] ?? ''), 'entries' => $entries]) . "\n";
            $offset = 0;
            while ($offset < strlen($bytes)) { $written = fwrite($handle, substr($bytes, $offset)); if (!$written) throw new RuntimeException('review-output-unavailable'); $offset += $written; }
            if (!fflush($handle) || (function_exists('fsync') && !fsync($handle))) throw new RuntimeException('review-output-unavailable');
        } finally { fclose($handle); }
        return ['exported' => count($entries), 'unreadable' => $unreadable];
    }

    public function retryReviewed(string $manifestPath, ?callable $transport = null, ?int $now = null): array
    {
        $now ??= time();
        $manifestPath = $this->privateReviewPath($manifestPath, true);
        if (filesize($manifestPath) > 65536) throw new RuntimeException('review-invalid');
        $manifest = json_decode((string)file_get_contents($manifestPath), true, 32, JSON_THROW_ON_ERROR);
        $reviewed = is_string($manifest['reviewedAt'] ?? null) ? strtotime($manifest['reviewedAt']) : false;
        if (($manifest['version'] ?? null) !== 1 || ($manifest['siteDomain'] ?? null) !== (string)($this->config['site_domain'] ?? '') || !$reviewed || $reviewed > $now || $now - $reviewed > 600 || !is_array($manifest['entries'] ?? null) || !array_is_list($manifest['entries']) || count($manifest['entries']) > 50) throw new RuntimeException('review-invalid');
        $retry = []; $seen = []; $skipped = 0;
        foreach ($manifest['entries'] as $row) {
            if (!is_array($row) || !is_string($row['id'] ?? null) || !preg_match('/^[a-f0-9]{64}$/D', $row['id']) || !is_string($row['fingerprint'] ?? null) || !preg_match('/^[a-f0-9]{64}$/D', $row['fingerprint']) || isset($seen[$row['id']]) || !in_array($row['action'] ?? '', ['retry', 'received', 'conflict', 'invalid'], true)) throw new RuntimeException('review-invalid');
            $seen[$row['id']] = true;
            if ($row['action'] !== 'retry') { $skipped++; continue; }
            $entry = $this->locked($row['id'], fn(string $file): array => $this->read($file));
            if ($entry['state'] !== 'pending' || !hash_equals($row['id'], hash('sha256', (string)$entry['payload']['idempotency_key'])) || !hash_equals($row['fingerprint'], self::fingerprint($entry['payload']))) throw new RuntimeException('review-changed');
            $retry[] = $row;
        }
        $counts = ['reviewed' => count($manifest['entries']), 'delivered' => 0, 'pending' => 0, 'skipped' => $skipped];
        foreach ($retry as $row) {
            $result = $this->deliver($row['id'], $transport, $now, $row['fingerprint']);
            $counts[$result['received'] ? 'delivered' : 'pending']++;
        }
        return $counts;
    }
}
