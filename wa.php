<?php
/**
 * WhatsApp click counter: /wa.php?p=<page path>&t=<topic>
 *
 * The site's wa.me links stay direct in the HTML (they work without JS).
 * assets/js/site.js swaps a link to this URL only at the moment of the click.
 * The handler looks the text up in config/site.generated.php (build.mjs writes
 * the full PAGES x TOPICS table from content/wa-messages.mjs), appends one JSON
 * line to a log OUTSIDE public_html and answers 302 to wa.me with that text.
 *
 * Logged per click: UTC time, page, topic, referrer host, first-touch utm_*
 * from the vc_attr cookie. Never the IP address, user agent or a phone number.
 *
 * Log file: env POZO_WA_LOG, else 'wa_log' in private/pozo.php, else
 * dirname(DOCUMENT_ROOT)/private/wa-clicks.log. A path inside the document root
 * is refused. Summarise with: node tools/wa-report.mjs <log>
 */
declare(strict_types=1);

header('Cache-Control: no-store, max-age=0');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: no-referrer');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'HEAD') {
    header('Allow: GET, HEAD');
    http_response_code(405);
    exit;
}

$config = [];
$generatedConfigPath = __DIR__ . '/config/site.generated.php';
if (is_readable($generatedConfigPath)) {
    $loaded = require $generatedConfigPath;
    if (is_array($loaded)) {
        $config = $loaded;
    }
}
$number = preg_replace('/\D+/', '', (string)($config['whatsapp'] ?? '')) ?? '';
$pages = is_array($config['wa_pages'] ?? null) ? $config['wa_pages'] : [];
$siteHost = (string)(parse_url((string)($config['site_url'] ?? ''), PHP_URL_HOST) ?: '');

if ($number === '' || !isset($pages['/'])) {
    error_log('[pozo] wa.php: config/site.generated.php has no number or wa_pages (run node build.mjs).');
    header('Location: /', true, 302);
    exit;
}

// Only known pages and topics are used, both for the text and for the log line.
$requestedPage = is_string($_GET['p'] ?? null) ? $_GET['p'] : '';
$requestedTopic = is_string($_GET['t'] ?? null) ? $_GET['t'] : '';
$pagePath = isset($pages[$requestedPage]) ? $requestedPage : '/';
$page = $pages[$pagePath];
$topic = isset($page['texts'][$requestedTopic]) ? $requestedTopic : (string)$page['topic'];
$text = (string)($page['texts'][$topic] ?? '');

function clip(mixed $value, int $max): string
{
    $text = preg_replace('/[\x00-\x1F\x7F]/', '', is_string($value) ? $value : '') ?? '';
    return function_exists('mb_substr') ? mb_substr($text, 0, $max) : substr($text, 0, $max);
}

// Referrer host: an external HTTP referrer, else the first-touch referrer.
$attribution = [];
if (!empty($_COOKIE['vc_attr'])) {
    $decoded = json_decode(rawurldecode((string)$_COOKIE['vc_attr']), true);
    if (is_array($decoded)) {
        $attribution = $decoded;
    }
}
$refHost = strtolower((string)(parse_url((string)($_SERVER['HTTP_REFERER'] ?? ''), PHP_URL_HOST) ?: ''));
if ($refHost === '' || $refHost === $siteHost || $refHost === 'www.' . $siteHost || $refHost === '127.0.0.1' || $refHost === 'localhost') {
    $refHost = strtolower((string)(parse_url(clip($attribution['referrer'] ?? '', 2000), PHP_URL_HOST) ?: ''));
}
$utm = [];
foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as $key) {
    $value = clip($attribution[$key] ?? '', 100);
    if ($value !== '') {
        $utm[$key] = $value;
    }
}

$line = [
    'ts' => gmdate('Y-m-d\TH:i:s\Z'),
    'page' => $pagePath,
    'topic' => $topic,
    'requested' => $pagePath === $requestedPage && $topic === $requestedTopic,
    'ref' => clip($refHost, 120),
    'utm' => (object)$utm,
];

// Resolve the log path; never write inside the public document root.
$documentRoot = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? __DIR__), '/');
$privateConfig = [];
$privatePath = (string)(getenv('POZO_CONFIG') ?: dirname($documentRoot) . '/private/pozo.php');
if (is_readable($privatePath)) {
    $loadedPrivate = require $privatePath;
    if (is_array($loadedPrivate)) {
        $privateConfig = $loadedPrivate;
    }
}
$logPath = (string)(getenv('POZO_WA_LOG') ?: ($privateConfig['wa_log'] ?? '') ?: dirname($documentRoot) . '/private/wa-clicks.log');
$logDir = realpath(dirname($logPath));
$publicRoot = realpath($documentRoot) ?: $documentRoot;
if ($method === 'GET') {
    if ($logDir === false) {
        error_log('[pozo] wa.php: log folder does not exist: ' . dirname($logPath));
    } elseif ($logDir === $publicRoot || str_starts_with($logDir . '/', rtrim($publicRoot, '/') . '/')) {
        error_log('[pozo] wa.php: refusing to write the click log inside the document root.');
    } elseif (@file_put_contents($logPath, json_encode($line, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX) === false) {
        error_log('[pozo] wa.php: could not append to the click log.');
    }
}

header('Location: https://wa.me/' . $number . '?text=' . rawurlencode($text), true, 302);
