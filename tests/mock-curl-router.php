<?php
declare(strict_types=1);
// Test router only: php -n with mbstring, deliberately WITHOUT native cURL.
// It cannot contact a CRM or mail provider. Captures payloads, never headers.
if (PHP_SAPI !== 'cli-server' || extension_loaded('curl')) { http_response_code(503); exit; }
foreach (['CURLOPT_RETURNTRANSFER','CURLOPT_FOLLOWLOCATION','CURLOPT_TIMEOUT','CURLOPT_CONNECTTIMEOUT','CURLOPT_HTTPHEADER','CURLOPT_WRITEFUNCTION','CURLOPT_POST','CURLOPT_POSTFIELDS','CURLINFO_HTTP_CODE','CURLOPT_SSL_VERIFYPEER','CURLOPT_SSL_VERIFYHOST','CURLOPT_PROTOCOLS','CURLPROTO_HTTPS','CURLINFO_RESPONSE_CODE'] as $i=>$constant) if(!defined($constant)) define($constant,$i+1);
if (!extension_loaded('curl')) {
function curl_init(?string $url=null): object { return (object)['url'=>$url,'options'=>[],'mode'=>[]]; }
function curl_setopt_array(object $ch,array $options): bool { $ch->options=$options+$ch->options; return true; }
function curl_setopt(object $ch,int $option,mixed $value): bool { $ch->options[$option]=$value; return true; }
function curl_exec(object $ch): mixed {
 if (!str_starts_with((string)$ch->url,'https://crm.example.com/')) throw new RuntimeException('Unexpected test destination');
 $ch->mode=json_decode((string)file_get_contents((string)getenv('CRM_TEST_MODE_FILE')),true);
 $payload=json_decode((string)($ch->options[CURLOPT_POSTFIELDS]??''),true);
 file_put_contents((string)getenv('CRM_TEST_CAPTURE'),json_encode(['path'=>parse_url((string)$ch->url,PHP_URL_PATH),'payload'=>$payload],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)."\n",FILE_APPEND|LOCK_EX);
 if(!empty($ch->mode['network'])) return false;
 $body=(string)($ch->mode['body']??'');
 if(isset($ch->options[CURLOPT_WRITEFUNCTION])) { $ch->options[CURLOPT_WRITEFUNCTION]($ch,$body); return true; }
 return $body;
}
function curl_getinfo(object $ch,?int $option=null): mixed { return $ch->mode['status']??0; }
function curl_error(object $ch): string { return !empty($ch->mode['network'])?'synthetic network failure':''; }
function curl_errno(object $ch): int { return !empty($ch->mode['network'])?7:0; }
function curl_close(object $ch): void {}
}
$source=(string)getenv('CRM_TEST_SOURCE'); $site=(string)getenv('CRM_TEST_SITE');
$mode=json_decode((string)file_get_contents((string)getenv('CRM_TEST_MODE_FILE')),true);
if(isset($mode['outbox'])) putenv('VENDERCRM_OUTBOX_DIR='.$mode['outbox']);
$identity=(string)($_POST['idempotency_key']??$_POST['submission_id']??'get');
$_SERVER['REMOTE_ADDR']='203.0.113.'.(1+(abs(crc32($identity))%240));
$uri=parse_url($_SERVER['REQUEST_URI']??'/',PHP_URL_PATH);
if($uri==='/__fixture/retry') {
 $queue=require $source.'/lib/lead-delivery-config.php';
 header('Content-Type: application/json'); echo json_encode($queue->retry(20)); return true;
}
if($uri==='/lib/lead-delivery-cli.php') { require $source.'/lib/lead-delivery-cli.php'; return true; }
if($site==='sitiosweb.html') { require $source.'/index.php'; return true; }
if($site==='ciberseguridad' && $uri==='/enviar/') { require $source.'/public_html/enviar.php'; return true; }
if($uri==='/enviar.php' || $uri==='/contacto.php') { require $source.($site==='pozo'?'/contacto.php':'/enviar.php'); return true; }
if($site==='ciberseguridad') { require $source.'/tests/router.php'; return true; }
if($site==='pozo') { require $source.'/tools/router.php'; return true; }
require $source.'/router.php'; return true;
