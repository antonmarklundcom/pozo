<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/lib/lead-delivery.php';
$base = sys_get_temp_dir() . '/crm-delivery-test-' . bin2hex(random_bytes(8));
mkdir($base . '/web', 0700, true);
$queue = new VenderCrmDelivery(['outbox_dir' => $base . '/private'], $base . '/web');
$checks = 0;
function check(bool $condition, string $label): void { global $checks; if (!$condition) throw new RuntimeException($label); $checks++; }
function payload(string $identity): array { return ['phone' => '0981000000', 'name' => 'Synthetic fixture', 'idempotency_key' => $identity]; }
try {
    $id = $queue->enqueue(payload('synthetic-retry-1'));
    check($queue->status()['pending'] === 1, 'Durable pending before network');
    $message = "Línea uno: åäö ñ 😀\nSegunda línea completa";
    $messagePayload = [...payload('full-message-fixture'), 'message' => $message, 'fields' => ['answer' => 'Respuesta completa']];
    $messageId = $queue->enqueue($messagePayload);
    $messageSeen = null;
    $queue->deliver($messageId, static function(array $body) use (&$messageSeen): array { $messageSeen = $body; return ['received'=>true,'status'=>201,'code'=>'received']; }, 1);
    check($messageSeen === $messagePayload, 'Unicode/newlines/all answers survive durable roundtrip');
    check($queue->enqueue(payload('synthetic-retry-1')) === $id && $queue->status()['pending'] === 1, 'Duplicate form enqueue does not duplicate');
    $failed = $queue->deliver($id, static fn(array $body): array => ['received' => false, 'status' => 503, 'code' => 'http'], 1000);
    check(!$failed['received'] && $queue->status()['pending'] === 1, 'Network rejection remains pending');
    $called = false;
    $waiting = $queue->deliver($id, static function () use (&$called): array { $called = true; return []; }, 1001);
    check(!$called && $waiting['code'] === 'waiting', 'Retry respects backoff');
    $seen = null;
    $restarted = new VenderCrmDelivery(['outbox_dir' => $base . '/private'], $base . '/web');
    $received = $restarted->deliver($id, static function (array $body) use (&$seen): array { $seen = $body['idempotency_key']; return ['received' => true, 'status' => 200, 'code' => 'received']; }, 1060);
    check($received['received'] && $seen === 'synthetic-retry-1', 'Restart reuses original CRM identity');
    check($restarted->status()['delivered'] === 2 && $restarted->status()['pending'] === 0, 'Confirmed receipt is recorded');
    $restarted->deliver($id, static function (): never { throw new RuntimeException('Must not send delivered entry'); }, 2000);
    check($restarted->status()['delivered'] === 2, 'Delivered entry is never sent again');
    $crashId = $queue->enqueue(payload('synthetic-crash'));
    try { $queue->deliver($crashId, static function (): never { throw new RuntimeException('Crash after external acceptance'); }, 2000); } catch (RuntimeException $error) {}
    check($queue->status()['pending'] === 1, 'Interrupted delivery stays pending for safe replay');
    $queue->deliver($crashId, static function (array $body): array { check($body['idempotency_key'] === 'synthetic-crash', 'Crash retry retains original identity'); return ['received' => true, 'status' => 200, 'code' => 'received']; }, 2001);
    try { $queue->enqueue([...payload('synthetic-retry-1'), 'name' => 'Changed']); throw new LogicException('Collision accepted'); } catch (RuntimeException $error) { check($error->getMessage() === 'identity-conflict', 'Different content cannot overwrite an existing identity'); }
    $valid = ['ok' => true, 'status' => 201, 'body' => ['contactId' => str_repeat('A', 26), 'submissionId' => str_repeat('B', 26)]];
    check(VenderCrmDelivery::receipt($valid), 'Accepts actual CRM receipt contract');
    foreach ([['ok' => true, 'status' => 200, 'body' => null], ['ok' => true, 'status' => 200, 'body' => ['contactId' => 'blank']], [...$valid, 'status' => 302], [...$valid, 'ok' => false]] as $bad) check(!VenderCrmDelivery::receipt($bad), 'Rejects blank, malformed, redirected and transport-failed receipts');
    foreach ([$base . '/web/queue', 'relative/queue'] as $unsafe) {
        try { (new VenderCrmDelivery(['outbox_dir' => $unsafe], $base . '/web'))->enqueue(payload('unsafe-identity')); throw new LogicException('Unsafe directory accepted'); }
        catch (RuntimeException $error) { check($error->getMessage() === 'private-directory-required', 'Queue must be private and absolute'); }
    }
    $utf8 = $queue->enqueue([...payload('synthetic-utf8'), 'name' => "Invalid \xFF byte"]);
    check(is_string($utf8) && $queue->status()['unreadable'] === 0, 'Malformed UTF-8 is retained as valid JSON');
    file_put_contents($base . '/private/' . str_repeat('f', 64) . '.json', '{broken');
    check($queue->status()['unreadable'] === 1 && is_file($base . '/private/' . str_repeat('f', 64) . '.json'), 'Corrupt entry is reported and preserved');
    check(!(new VenderCrmDelivery([], $base . '/web'))->send(payload('unconfigured'))['received'], 'Missing configuration never claims receipt');
    check(!(new VenderCrmDelivery([], $base . '/web'))->check()['canReceive'], 'Unconfigured probe is false without PHP warnings');
    $held = new VenderCrmDelivery(['outbox_dir' => $base . '/held'], $base . '/web');
    $heldId = $held->enqueue(payload('held-validation-error'));
    $held->deliver($heldId, static fn(array $body): array => ['received' => false, 'status' => 422, 'code' => 'http'], 1);
    $heldRetry = $held->retry(20);
    check($heldRetry['examined'] === 0 && $heldRetry['needs_review'] === 1, 'Automatic retries hold validation failures for review');
    check($held->status()['pending'] === 1 && $held->status()['needs_review'] === 1, 'Held enquiry stays visible and retained');
    $held->deliver($heldId, static function(): never { throw new LogicException('Held failure was resent'); }, 100000);
    check($held->status()['needs_review'] === 1, 'Ordinary browser replay cannot bypass held failure');
    try { $queue->enqueue(['idempotency_key'=>'x']); throw new LogicException('Short identity accepted'); } catch(RuntimeException $error) { check($error->getMessage()==='invalid-identity','Invalid identity fails without PHP warnings'); }
    $blocked = $base . '/blocked'; file_put_contents($blocked, 'not a directory');
    $noDisk = new VenderCrmDelivery(['outbox_dir'=>$blocked.'/queue'], $base.'/web');
    $accept = $noDisk->accept(payload('disk-failure-fixture'), static fn(array $body): array => ['received'=>false,'status'=>503,'code'=>'http']);
    check(!$accept['retained'] && !$accept['received'], 'Disk and CRM failure cannot claim acceptance');
    $accept = $noDisk->accept(payload('disk-failure-received'), static fn(array $body): array => ['received'=>true,'status'=>201,'code'=>'received']);
    check(!$accept['retained'] && $accept['received'], 'Verified CRM storage is sufficient when local disk fails');
    echo "PASS: $checks durable delivery checks (fictional data only).\n";
} finally {
    // Remove only this test's unique directory below the verified temp root.
    $resolved = realpath($base);
    $temp = realpath(sys_get_temp_dir());
    if ($resolved && $temp && str_starts_with($resolved, $temp . DIRECTORY_SEPARATOR . 'crm-delivery-test-')) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($resolved, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($iterator as $entry) $entry->isDir() ? rmdir($entry->getPathname()) : unlink($entry->getPathname());
        rmdir($resolved);
    }
}
