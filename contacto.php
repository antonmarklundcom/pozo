<?php
declare(strict_types=1);

const VENDERCRM_DEFAULT_URL = 'https://crm.clientes.com.py';
const THANK_YOU_PATH = '/gracias/';
const CONTACT_PATH = '/contacto/';
const RESEND_API_BASE_DEFAULT = 'https://api.resend.com';

// form_id -> VenderCRM source. Mirrors CONTACT_SOURCES in site.config.mjs.
// Keep in sync manually: this file has no JS import, PHP reads a plain array.
const CONTACT_SOURCES = [
    'contacto' => 'site:pozo.com.py:contacto',
    'ficha' => 'site:pozo.com.py:ficha-rapida',
    'calculadora' => 'site:pozo.com.py:calculadora',
];

function redirectTo(string $location): never
{
    header('Location: ' . $location, true, 303);
    exit;
}

function value(string $key, int $maxLength): string
{
    $input = trim((string)($_POST[$key] ?? ''));
    return function_exists('mb_substr') ? mb_substr($input, 0, $maxLength) : substr($input, 0, $maxLength);
}

function stripControlChars(string $text): string
{
    return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $text) ?? $text;
}

// --- Generated site config (number, site URL, CRM default URL) --------------
$generatedConfigPath = __DIR__ . '/config/site.generated.php';
$generatedConfig = [];
if (is_readable($generatedConfigPath)) {
    $loaded = require $generatedConfigPath;
    if (is_array($loaded)) {
        $generatedConfig = $loaded;
    }
}

// The number and every WhatsApp text come from config/site.generated.php, which
// build.mjs writes from site.config.mjs and content/wa-messages.mjs.
$whatsappNumber = preg_replace('/\D+/', '', (string)($generatedConfig['whatsapp'] ?? '')) ?? '';
$waForm = is_array($generatedConfig['wa_form'] ?? null) ? $generatedConfig['wa_form'] : [];
$siteUrl = (string)($generatedConfig['site_url'] ?? 'https://pozo.com.py');
$crmDefaultUrl = (string)($generatedConfig['crm_url'] ?? VENDERCRM_DEFAULT_URL);

function whatsappFallback(array $lead, string $whatsappNumber, array $waForm, string $formId, string $page): never
{
    if ($whatsappNumber === '') {
        // Never send a visitor to a wa.me link without a number.
        error_log('[pozo] WhatsApp redirect skipped: config/site.generated.php has no number (run node build.mjs).');
        redirectTo(THANK_YOU_PATH);
    }
    $intro = (array)($waForm['intro'] ?? []);
    $labels = (array)($waForm['labels'] ?? []);
    $pageName = (string)(parse_url($page, PHP_URL_PATH) ?: '/');
    $lines = [str_replace('{page}', $pageName, (string)($intro[$formId] ?? $intro['contacto'] ?? ''))];
    foreach (['name', 'phone', 'service', 'zona', 'urgencia', 'message', 'email'] as $field) {
        if (($lead[$field] ?? '') !== '') {
            $lines[] = ($labels[$field] ?? ucfirst($field)) . ': ' . $lead[$field];
        }
    }
    foreach ((array)($waForm['outro'] ?? []) as $line) {
        $lines[] = (string)$line;
    }
    if (($lead['urgencia'] ?? '') === '') {
        $lines[] = (string)($waForm['ask_when'] ?? '');
    }
    $lines = array_values(array_filter($lines, static fn($line) => $line !== ''));
    // The full enquiry is already retained. Avoid oversized HTTP Location headers.
    $target = 'https://wa.me/' . $whatsappNumber . '?text=' . rawurlencode(implode("\n", $lines));
    redirectTo(strlen($target) > 2000 ? THANK_YOU_PATH : $target);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    echo 'Método no permitido.';
    exit;
}

header('Cache-Control: no-store, max-age=0');

// Honeypot: bots receive a normal-looking success without reaching the CRM.
if (value('website', 200) !== '') {
    redirectTo(THANK_YOU_PATH);
}

$formId = value('form_id', 40) ?: 'contacto';
$source = CONTACT_SOURCES[$formId] ?? CONTACT_SOURCES['contacto'];

// Triage: "¿Para cuándo?" only accepts the values the forms offer (labels come
// from FORM_FALLBACK.urgency via config/site.generated.php); anything else is
// ignored. zona is the city select (or free text from an older cached page);
// barrio is optional and only shown next to it.
$urgencyLabels = (array)($waForm['urgency'] ?? []);
$urgencyKey = value('urgencia', 20);
$urgencyKey = isset($urgencyLabels[$urgencyKey]) ? $urgencyKey : '';
$city = value('zona', 200);
$barrio = value('barrio', 200);

$lead = [
    'name' => value('name', 200),
    'phone' => value('phone', 30),
    'email' => value('email', 320),
    'service' => value('service', 120),
    'message' => value('message', 5000),
    'zona' => implode(', ', array_filter([$city, $barrio], static fn($part) => $part !== '')),
    'urgencia' => $urgencyKey !== '' ? (string)$urgencyLabels[$urgencyKey] : '',
];
$isUrgent = $urgencyKey === 'hoy';

// Calculator scope (form_id calculadora): validated, kept in the CRM, and used to
// rebuild the estimate on /gracias/. The price itself is never trusted from the
// URL; the thank-you page recomputes it from the published rates.
$calc = [];
if ($formId === 'calculadora') {
    $calcDepth = (int)value('depth', 4);
    $calcSoil = value('soil', 12);
    $calc = [
        'profundidad_m' => ($calcDepth >= 10 && $calcDepth <= 300) ? $calcDepth : null,
        'suelo' => in_array($calcSoil, ['tierra', 'mixto', 'roca', 'desconocido'], true) ? $calcSoil : null,
        'instalacion_completa' => value('install', 1) === '1' ? 'sí' : 'no',
        'estimacion_gs' => ctype_digit(value('estimate', 12)) ? (int)value('estimate', 12) : null,
    ];
}

if (
    $lead['name'] === '' ||
    $lead['phone'] === '' ||
    $lead['service'] === '' ||
    $lead['message'] === '' ||
    empty($_POST['consent'])
) {
    redirectTo(CONTACT_PATH . '?error=campos#lead-form');
}

if (!preg_match('/^[0-9+() .-]{6,30}$/', $lead['phone'])) {
    redirectTo(CONTACT_PATH . '?error=telefono#lead-form');
}

if ($lead['email'] !== '' && !filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) {
    redirectTo(CONTACT_PATH . '?error=campos#lead-form');
}

$digits = preg_replace('/\D+/', '', $lead['phone']) ?: '';
if (str_starts_with($digits, '0')) {
    $digits = '595' . substr($digits, 1);
}
$idempotencyKey = value('idempotency_key', 100);
if (strlen($idempotencyKey) < 8) $idempotencyKey = bin2hex(random_bytes(16));

$attr = [];
if (!empty($_COOKIE['vc_attr'])) {
    $decoded = json_decode(rawurldecode((string)$_COOKIE['vc_attr']), true);
    if (is_array($decoded)) {
        $attr = $decoded;
    }
}

// The converting page (this form_id/page) is kept separate from the CRM's
// landing_page semantics, which stays first-touch via the attribution cookie.
$convertingPage = value('page_url', 2000);

$payload = [
    'phone' => $lead['phone'],
    'name' => $lead['name'],
    'email' => $lead['email'],
    'message' => $lead['message'],
    'source' => $source,
    'page_url' => $attr['landing_page'] ?? $convertingPage,
    'referrer' => $attr['referrer'] ?? null,
    'utm_source' => $attr['utm_source'] ?? null,
    'utm_medium' => $attr['utm_medium'] ?? null,
    'utm_campaign' => $attr['utm_campaign'] ?? null,
    'utm_term' => $attr['utm_term'] ?? null,
    'utm_content' => $attr['utm_content'] ?? null,
    'gclid' => $attr['gclid'] ?? null,
    'fbclid' => $attr['fbclid'] ?? null,
    'fields' => array_filter([
        'servicio' => $lead['service'],
        'pagina' => $convertingPage,
        'zona' => $city,
        'barrio' => $barrio,
        'urgencia' => $lead['urgencia'],
    ] + $calc, static fn($item) => $item !== null && $item !== ''),
    'idempotency_key' => $idempotencyKey,
];
$payload = array_filter($payload, static fn($item) => $item !== null && $item !== '');

// --- Private secrets: one file for VenderCRM + Resend -----------------------
// Lookup order: env vars override; file path from POZO_CONFIG env, else
// dirname(DOCUMENT_ROOT)/private/pozo.php. Legacy private/vendercrm.php
// (VenderCRM only) is still honoured for a site upgraded from v1.
$privateConfig = [];
$documentRoot = (string)($_SERVER['DOCUMENT_ROOT'] ?? __DIR__);

$pozoConfigPath = (string)(getenv('POZO_CONFIG') ?: dirname($documentRoot) . '/private/pozo.php');
if (is_readable($pozoConfigPath)) {
    $loadedConfig = require $pozoConfigPath;
    if (is_array($loadedConfig)) {
        $privateConfig = $loadedConfig;
    }
}

$legacyVenderCrmPath = (string)(getenv('VENDERCRM_CONFIG') ?: dirname($documentRoot) . '/private/vendercrm.php');
require_once __DIR__ . '/lib/site-vendercrm.php';
$crmSettings = pozo_crm_settings(__DIR__, $privateConfig, $crmDefaultUrl, $legacyVenderCrmPath, null, PHP_SAPI === 'cli-server');
$crmUrl = $crmSettings['url'];
$apiKey = $crmSettings['key'];
$validCrmUrl = $crmSettings['valid'];
$resendApiKey = (string)(getenv('RESEND_API_KEY') ?: ($privateConfig['resend_key'] ?? ''));
$resendFrom = (string)(getenv('RESEND_FROM') ?: ($privateConfig['resend_from'] ?? ''));
$resendApiBase = rtrim((string)(getenv('RESEND_API_BASE') ?: RESEND_API_BASE_DEFAULT), '/');
$notifyToEnv = getenv('LEAD_NOTIFY_TO');
$notifyTo = $notifyToEnv !== false
    ? array_values(array_filter(array_map('trim', explode(',', $notifyToEnv))))
    : (array)($privateConfig['notify_to'] ?? []);

$crmStatusLog = 'skipped';
$resendStatusLog = 'skipped';
$crmResultSummary = 'no enviado';

// --- [1] Save the complete enquiry privately before any delivery. ---------
require_once __DIR__ . '/lib/lead-delivery.php';
$delivery = new VenderCrmDelivery([
    'url'=>$crmUrl, 'api_key'=>$apiKey, 'site_domain'=>'pozo.com.py',
    'outbox_dir'=>getenv('VENDERCRM_OUTBOX_DIR') ?: dirname($documentRoot).'/.vendercrm-outbox',
], $documentRoot);
try { $result = $delivery->accept($payload); }
catch (RuntimeException $error) { redirectTo(CONTACT_PATH . '?error=campos#lead-form'); }
if (empty($result['retained']) && empty($result['received'])) {
    http_response_code(503);
    echo 'No pudimos guardar tu consulta. Volvé a intentar.';
    exit;
}
$crmStatusLog = !empty($result['received']) ? 'received' : 'pending';
$crmResultSummary = $crmStatusLog;
if (($result['code'] ?? '') === 'already-received') $resendApiKey = '';

// --- [2] Resend notify: try, never blocks the WhatsApp redirect ------------
if ($resendApiKey === '' || empty($notifyTo)) {
    if ($resendApiKey === '') {
        error_log('[pozo] resend skipped: RESEND_API_KEY is empty');
    } else {
        error_log('[pozo] resend skipped: notify_to is empty');
    }
} elseif (!function_exists('curl_init')) {
    error_log('[pozo] resend skipped: PHP cURL extension is unavailable');
} else {
    $safeName = stripControlChars($lead['name']);
    $safeService = stripControlChars($lead['service']);
    $subject = stripControlChars(($isUrgent ? '[URGENTE] ' : '') . sprintf('Consulta: %s · %s', $safeService, $safeName));

    $waLink = 'https://wa.me/' . $digits;
    $textLines = [
        'Nueva consulta desde Pozo.com.py',
        '',
        'Nombre: ' . $safeName,
        'Teléfono: ' . $lead['phone'],
        'Servicio: ' . $safeService,
        'Ciudad y barrio: ' . (stripControlChars($lead['zona']) ?: '—'),
        'Para cuándo: ' . ($lead['urgencia'] ?: '—'),
        'Mensaje: ' . stripControlChars($lead['message']),
    ];
    if ($lead['email'] !== '') {
        $textLines[] = 'Correo: ' . $lead['email'];
    }
    $textLines[] = 'Página: ' . $convertingPage;
    $textLines[] = 'Origen: ' . $source;
    $textLines[] = 'CRM: ' . $crmResultSummary;
    $textLines[] = 'WhatsApp: ' . $waLink;
    $textBody = implode("\n", $textLines);

    $htmlRows = [
        ['Nombre', $safeName],
        ['Teléfono', $lead['phone']],
        ['Servicio', $safeService],
        ['Ciudad y barrio', stripControlChars($lead['zona']) ?: '—'],
        ['Para cuándo', $lead['urgencia'] ?: '—'],
        ['Mensaje', stripControlChars($lead['message'])],
    ];
    if ($lead['email'] !== '') {
        $htmlRows[] = ['Correo', $lead['email']];
    }
    $htmlRows[] = ['Página', $convertingPage];
    $htmlRows[] = ['Origen', $source];
    $htmlRows[] = ['CRM', $crmResultSummary];
    $htmlRowsMarkup = implode('', array_map(
        static fn($row) => '<tr><td><strong>' . htmlspecialchars($row[0], ENT_QUOTES, 'UTF-8') . '</strong></td><td>' . nl2br(htmlspecialchars($row[1], ENT_QUOTES, 'UTF-8')) . '</td></tr>',
        $htmlRows
    ));
    $htmlBody = '<table>' . $htmlRowsMarkup . '</table><p><a href="' . htmlspecialchars($waLink, ENT_QUOTES, 'UTF-8') . '">Abrir WhatsApp</a></p>';

    $resendPayload = array_filter([
        'from' => $resendFrom,
        'to' => $notifyTo,
        'reply_to' => ($lead['email'] !== '' && filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) ? $lead['email'] : null,
        'subject' => $subject,
        'text' => $textBody,
        'html' => $htmlBody,
    ], static fn($item) => $item !== null && $item !== '');

    $resendCurl = curl_init($resendApiBase . '/emails');
    curl_setopt_array($resendCurl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $resendApiKey,
            'Idempotency-Key: ' . $idempotencyKey,
        ],
        CURLOPT_POSTFIELDS => json_encode($resendPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);

    $resendResponse = curl_exec($resendCurl);
    $resendStatus = (int)curl_getinfo($resendCurl, CURLINFO_HTTP_CODE);
    $resendError = curl_error($resendCurl);
    curl_close($resendCurl);

    $resendStatusLog = (string)$resendStatus;

    if ($resendStatus !== 200) {
        error_log(sprintf(
            '[pozo] Resend notify failed [%d] response=%s curl=%s',
            $resendStatus,
            substr((string)$resendResponse, 0, 500),
            substr($resendError, 0, 500)
        ));
    }
}

// --- [3] Always end in WhatsApp with the enquiry prefilled ------------------
error_log(sprintf('[pozo] crm=%s resend=%s', $crmStatusLog, $resendStatusLog));
// Calculator leads land on the thank-you page, which shows their estimate and
// what is included, with a WhatsApp button.
if ($formId === 'calculadora' && $calc['profundidad_m'] !== null && $calc['suelo'] !== null) {
    redirectTo(THANK_YOU_PATH . '?' . http_build_query([
        'd' => $calc['profundidad_m'],
        's' => $calc['suelo'],
        'i' => $calc['instalacion_completa'] === 'sí' ? '1' : '0',
    ]));
}
whatsappFallback($lead, $whatsappNumber, $waForm, isset(CONTACT_SOURCES[$formId]) ? $formId : 'contacto', $convertingPage);
