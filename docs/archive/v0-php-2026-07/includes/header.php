<?php
/**
 * includes/header.php
 * Cada página define ANTES del include:
 *   $page          (clave obligatoria de $PAGES)
 *   $FAQ           (opcional) array de ['q'=>, 'a'=>] → genera FAQPage y se renderiza en el body
 *   $SERVICE       (opcional) nombre del servicio → genera schema Service
 *   $OG_TYPE       (opcional)
 */
require_once __DIR__ . '/config.php';
if (!isset($page)) { $page = 'home'; }
$P = pg();

/* ── JSON-LD ───────────────────────────────────────────── */
$business = [
  '@type'       => 'ProfessionalService',
  '@id'         => SITE_URL . '/#negocio',
  'name'        => SITE_NAME,
  'description' => 'Perforación de pozos artesianos, desagüe de pozos ciegos, cámaras sépticas y tratamiento de agua en Asunción y Gran Asunción.',
  'url'         => SITE_URL,
  'telephone'   => TEL_LINK,
  'priceRange'  => 'Gs.',
  'address'     => [
    '@type'           => 'PostalAddress',
    'addressLocality' => CITY,
    'addressRegion'   => REGION,
    'addressCountry'  => 'PY',
  ],
  'areaServed'  => array_map(fn($z) => ['@type' => 'City', 'name' => $z], $GLOBALS['ZONAS']),
  'openingHoursSpecification' => [[
    '@type'     => 'OpeningHoursSpecification',
    'dayOfWeek' => ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    'opens'     => '07:00',
    'closes'    => '19:00',
  ]],
  'knowsLanguage' => ['es-PY','gn'],
];

$graph = [$business];

if (!empty($SERVICE)) {
  $graph[] = [
    '@type'       => 'Service',
    'name'        => $SERVICE,
    'serviceType' => $SERVICE,
    'url'         => canonical(),
    'provider'    => ['@id' => SITE_URL . '/#negocio'],
    'areaServed'  => array_map(fn($z) => ['@type' => 'City', 'name' => $z], $GLOBALS['ZONAS']),
    'availableChannel' => [
      '@type'        => 'ServiceChannel',
      'serviceUrl'   => canonical(),
      'servicePhone' => TEL_LINK,
    ],
  ];
}

if (!empty($FAQ)) {
  $graph[] = [
    '@type'      => 'FAQPage',
    'mainEntity' => array_map(fn($f) => [
      '@type'          => 'Question',
      'name'           => $f['q'],
      'acceptedAnswer' => ['@type' => 'Answer', 'text' => strip_tags($f['a'])],
    ], $FAQ),
  ];
}

if ($page !== 'home') {
  $items = [['@type'=>'ListItem','position'=>1,'name'=>'Inicio','item'=>SITE_URL.'/']];
  $pos = 2;
  if (!empty($P['parent'])) {
    $par = $GLOBALS['PAGES'][$P['parent']];
    $items[] = ['@type'=>'ListItem','position'=>$pos++,'name'=>$par['crumb'],'item'=>rtrim(SITE_URL,'/').$par['url']];
  }
  $items[] = ['@type'=>'ListItem','position'=>$pos,'name'=>$P['crumb'],'item'=>canonical()];
  $graph[] = ['@type'=>'BreadcrumbList','itemListElement'=>$items];
}

$jsonld = json_encode(
  ['@context' => 'https://schema.org', '@graph' => $graph],
  JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
);

/* ── navegación ────────────────────────────────────────── */
$NAV = [
  'pozos-artesianos'   => 'Pozos artesianos',
  'pozos-ciegos'       => 'Pozos ciegos',
  'desague-pozo-ciego' => 'Desagüe',
  'pozos-septicos'     => 'Pozos sépticos',
  'tratamiento-agua'   => 'Tratamiento de agua',
];
?><!DOCTYPE html>
<html lang="es-PY">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($P['title']) ?></title>
<meta name="description" content="<?= e($P['desc']) ?>">
<link rel="canonical" href="<?= e(canonical()) ?>">
<?php if (DEMO_MODE): ?><meta name="robots" content="noindex,nofollow">
<?php elseif (!empty($P['noindex'])): ?><meta name="robots" content="noindex,follow">
<?php endif; ?>
<meta name="theme-color" content="#22201C">
<meta name="geo.region" content="PY-ASU">
<meta name="geo.placename" content="Asunción">

<meta property="og:type" content="<?= e($OG_TYPE ?? 'website') ?>">
<meta property="og:locale" content="es_PY">
<meta property="og:site_name" content="<?= e(SITE_NAME) ?>">
<meta property="og:title" content="<?= e($P['title']) ?>">
<meta property="og:description" content="<?= e($P['desc']) ?>">
<meta property="og:url" content="<?= e(canonical()) ?>">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/css/site.css">

<script type="application/ld+json"><?= $jsonld ?></script>
</head>
<body>

<header class="hdr">
  <div class="wrap hdr-in">
    <a class="brand" href="/" aria-label="<?= e(SITE_NAME) ?> — inicio">
      <span class="brand-mark" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M12 2v13"/><path d="M8 15h8l-1.4 6.2a1 1 0 0 1-1 .8h-3.2a1 1 0 0 1-1-.8Z"/><path d="M6 6h4"/><path d="M14 10h4"/>
        </svg>
      </span>
      <span class="brand-txt">pozo<span>.com.py</span></span>
    </a>

    <nav class="nav" aria-label="Principal">
      <?php foreach ($NAV as $k => $label): ?>
        <a href="<?= e($PAGES[$k]['url']) ?>"<?= $page === $k ? ' aria-current="page"' : '' ?>><?= e($label) ?></a>
      <?php endforeach; ?>
    </nav>

    <a class="hdr-tel" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
    <a class="btn btn-wa hdr-cta" href="<?= e(wa()) ?>" target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.73 2.64 4.19 3.7.58.26 1.04.41 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z"/></svg>
      Escribinos
    </a>

    <button class="burger" id="burger" aria-expanded="false" aria-controls="mobmenu" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
  </div>

  <div class="mobmenu" id="mobmenu">
    <div class="wrap">
      <?php foreach ($NAV as $k => $label): ?>
        <a href="<?= e($PAGES[$k]['url']) ?>"><?= e($label) ?></a>
      <?php endforeach; ?>
      <a href="<?= e($PAGES['pozos-artesianos-precio-metro']['url']) ?>">Precio por metro</a>
      <a href="<?= e($PAGES['desague-san-lorenzo']['url']) ?>">Desagüe en San Lorenzo</a>
      <a class="btn btn-wa" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Escribinos por WhatsApp</a>
      <a class="btn btn-ghost" href="tel:<?= e(TEL_LINK) ?>">Llamanos al <?= e(TEL_TEXT) ?></a>
    </div>
  </div>
</header>

<?php if ($page !== 'home'): ?>
<nav class="crumbs wrap" aria-label="Migas de pan">
  <ol>
    <li><a href="/">Inicio</a></li>
    <?php if (!empty($P['parent'])): $par = $PAGES[$P['parent']]; ?>
      <li><a href="<?= e($par['url']) ?>"><?= e($par['crumb']) ?></a></li>
    <?php endif; ?>
    <li aria-current="page"><?= e($P['crumb']) ?></li>
  </ol>
</nav>
<?php endif; ?>

<main id="main">
