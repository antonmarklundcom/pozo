<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
try {
 $delivery = require __DIR__ . '/lead-delivery-config.php';
 $command = $argv[1] ?? 'status';
 $result = match($command) {
  'status' => $delivery->status(),
  'check' => $delivery->check(),
  'retry' => $delivery->retry((int)($argv[2]??20)),
  'heartbeat' => $delivery->heartbeat(),
  'export-review' => $delivery->exportReview((string)($argv[2]??''),(int)($argv[3]??10)),
  'retry-reviewed' => $delivery->retryReviewed((string)($argv[2]??'')),
  default => throw new RuntimeException('unknown-command'),
 };
 echo VenderCrmDelivery::json($result).PHP_EOL;
 if (($result['unreadable']??0)>0 || ($command==='check'&&!$result['canReceive']) || ($command==='heartbeat'&&!$result['reported'])) exit(1);
} catch(Throwable $error) { fwrite(STDERR, "Delivery operation failed; review private configuration and storage permissions.\n"); exit(1); }
