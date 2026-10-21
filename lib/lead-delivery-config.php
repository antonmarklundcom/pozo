<?php
declare(strict_types=1);
require_once __DIR__ . '/lead-delivery.php';
$webRoot = dirname(__DIR__);
$documentRoot = $webRoot;
$privateConfig = [];
$privateFile = (string)(getenv('POZO_CONFIG') ?: dirname($webRoot) . '/private/pozo.php');
if (is_readable($privateFile)) { $loaded = require $privateFile; if(is_array($loaded)) $privateConfig = $loaded; }
require_once $webRoot . '/lib/site-vendercrm.php';
$settings = pozo_crm_settings($webRoot, $privateConfig, 'https://crm.clientes.com.py', (string)(getenv('VENDERCRM_CONFIG') ?: dirname($webRoot).'/private/vendercrm.php'), null, false);
$config = ['url'=>$settings['url'], 'api_key'=>$settings['key']];
$config['site_domain'] = 'pozo.com.py';
$config['outbox_dir'] = getenv('VENDERCRM_OUTBOX_DIR') ?: dirname($webRoot) . '/.vendercrm-outbox';
return new VenderCrmDelivery($config, $webRoot);
