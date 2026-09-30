<?php
/**
 * pozo.com.py — configuración central
 * Todo lo editable vive acá. Ninguna página define datos de negocio por su cuenta.
 */

/* ─────────────────────────────────────────────────────────────
   1. NEGOCIO / NAP
   ───────────────────────────────────────────────────────────── */
define('SITE_NAME',   'Pozo.com.py');
define('SITE_URL',    'https://pozo.com.py');
define('SITE_TAG',    'Pozos artesianos y desagüe de pozos ciegos en Paraguay');

// ⚠️ PLACEHOLDER — reemplazar por el número real del socio operador.
define('WA_NUMBER',   '595981234567');              // formato wa.me, sin + ni espacios
define('TEL_LINK',    '+595981234567');             // formato tel:
define('TEL_TEXT',    '+595 981 234 567');          // visible, con espacios finos

define('CITY',        'Asunción');
define('REGION',      'Capital');
define('HOURS_TEXT',  'Lun a Sáb 07:00–19:00 · Urgencias de desagüe, también domingo');

// Modo demo: sacar esta constante (o ponerla en false) el día del lanzamiento.
define('DEMO_MODE',   true);

// Destino de los leads del formulario. ⚠️ Crear la casilla en hPanel > Emails.
define('LEAD_EMAIL',  'leads@pozo.com.py');
define('LEAD_FROM',   'web@pozo.com.py');   // debe existir en el dominio o Hostinger descarta el mail
define('LEAD_LOG',    __DIR__ . '/../leads.log');   // respaldo en disco por si el mail falla

/* ─────────────────────────────────────────────────────────────
   2. TARIFAS DE REFERENCIA — ⚠️ CARGAR VALORES REALES DEL SOCIO
   Todo lo que muestra un número en guaraníes sale de acá.
   No hay precios hardcodeados en ninguna página.
   ───────────────────────────────────────────────────────────── */
$RATES = [
    // Perforación, guaraníes por metro lineal, según terreno
    'perf_tierra_min'   => 350000,
    'perf_tierra_max'   => 550000,
    'perf_mixto_min'    => 550000,
    'perf_mixto_max'    => 850000,
    'perf_roca_min'     => 850000,
    'perf_roca_max'     => 1400000,

    // Componentes (precio por unidad / global)
    'entubado_ml_min'   => 90000,
    'entubado_ml_max'   => 160000,
    'filtro_min'        => 900000,
    'filtro_max'        => 2200000,
    'bomba_min'         => 3500000,
    'bomba_max'         => 12000000,
    'tablero_min'       => 800000,
    'tablero_max'       => 2500000,

    // Desagüe con camión atmosférico, por viaje
    'desague_viaje_min' => 350000,
    'desague_viaje_max' => 700000,
    'desague_m3'        => 8,       // capacidad típica del camión, m³

    // Profundidad habitual en Gran Asunción (para el rango por defecto del cotizador)
    'prof_min'          => 30,
    'prof_max'          => 120,
];

// Fecha de última revisión de tarifas (se muestra al usuario — honestidad de precio)
define('RATES_UPDATED', '2026-07-29');

/* ─────────────────────────────────────────────────────────────
   3. ZONAS DE COBERTURA
   ───────────────────────────────────────────────────────────── */
$ZONAS = [
    'Asunción', 'San Lorenzo', 'Luque', 'Lambaré', 'Fernando de la Mora',
    'Mariano Roque Alonso', 'Capiatá', 'Ñemby', 'Villa Elisa', 'Limpio',
];

$BARRIOS_ASU = ['Villa Morra', 'Recoleta', 'Carmelitas', 'Sajonia', 'Trinidad', 'Barrio Jara'];

/* ─────────────────────────────────────────────────────────────
   4. MAPA DE PÁGINAS — meta, H1, breadcrumb, texto de WhatsApp
   Título ≤ 60 caracteres. Meta description 145–155.
   ───────────────────────────────────────────────────────────── */
$PAGES = [

'home' => [
  'url'   => '/',
  'title' => 'Pozos Artesianos y Desagüe de Pozos | Pozo.com.py',
  'desc'  => 'Perforación de pozos artesianos, desagüe de pozo ciego y cámaras sépticas en Asunción y Gran Asunción. Presupuesto sin costo. Escribinos por WhatsApp.',
  'wa'    => 'Hola, vi pozo.com.py y quiero un presupuesto.',
  'crumb' => null,
],

'pozos-artesianos' => [
  'url'   => '/pozos-artesianos',
  'title' => 'Perforación de Pozos Artesianos en Paraguay',
  'desc'  => 'Perforación de pozos artesianos y semisurgentes para casas, fincas e industrias en Paraguay. Entubado, filtro y bomba. Presupuesto gratis por WhatsApp.',
  'wa'    => 'Hola, quiero consultar por la perforación de un pozo artesiano.',
  'crumb' => 'Pozos artesianos',
],

'pozos-artesianos-precio-metro' => [
  'url'   => '/pozos-artesianos/precio-metro',
  'title' => 'Precio por Metro de Pozo Artesiano en Paraguay',
  'desc'  => 'Cuánto cuesta perforar un pozo artesiano por metro en Paraguay según suelo, profundidad, entubado y bomba. Cotizador en línea y presupuesto sin costo.',
  'wa'    => 'Hola, quiero saber el precio por metro para perforar un pozo.',
  'crumb' => 'Precio por metro',
  'parent'=> 'pozos-artesianos',
],

'pozos-ciegos' => [
  'url'   => '/pozos-ciegos',
  'title' => 'Pozos Ciegos: Construcción y Desagüe | Pozo.com.py',
  'desc'  => 'Construcción, mantenimiento y desagüe de pozos ciegos en Asunción y Central. Medidas reglamentarias, camión desagotador y soluciones de absorción.',
  'wa'    => 'Hola, quiero consultar por un pozo ciego.',
  'crumb' => 'Pozos ciegos',
],

'desague-pozo-ciego' => [
  'url'   => '/desague-pozo-ciego',
  'title' => 'Desagüe de Pozo Ciego Urgente | Camión Atmosférico',
  'desc'  => 'Servicio de desagüe de pozo ciego con camión atmosférico en Asunción y Gran Asunción. Vaciado, limpieza y desobstrucción. Pedí tu presupuesto por WhatsApp.',
  'wa'    => 'Hola, necesito desagüe de pozo ciego urgente.',
  'crumb' => 'Desagüe de pozo ciego',
],

'pozo-ciego-lleno' => [
  'url'   => '/pozo-ciego-lleno',
  'title' => 'Pozo Ciego Lleno o Que No Absorbe: Soluciones',
  'desc'  => 'Por qué se llena rápido el pozo ciego y cómo recuperar la absorción: grasa, napas altas y lluvias. Soluciones reales y prevención del colapso del pozo.',
  'wa'    => 'Hola, mi pozo ciego se llena muy rápido y necesito una solución.',
  'crumb' => 'Pozo ciego lleno',
],

'pozos-septicos' => [
  'url'   => '/pozos-septicos',
  'title' => 'Pozos Sépticos y Cámaras Sépticas en Paraguay',
  'desc'  => 'Instalación de pozos sépticos, cámaras sépticas y biodigestores en Paraguay. Medidas, planos, modelos de plástico y mantenimiento preventivo del tanque.',
  'wa'    => 'Hola, quiero consultar por la instalación de un pozo séptico.',
  'crumb' => 'Pozos sépticos',
],

'tratamiento-agua' => [
  'url'   => '/tratamiento-agua',
  'title' => 'Filtros y Tratamiento de Agua de Pozo | Paraguay',
  'desc'  => 'Filtros y tratamiento de agua de pozo para consumo: sarro, hierro, color amarillo y cloración. Análisis de agua en Paraguay y guía para elegir tu filtro.',
  'wa'    => 'Hola, quiero consultar por un filtro para el agua de mi pozo.',
  'crumb' => 'Tratamiento de agua',
],

'desague-san-lorenzo' => [
  'url'   => '/desague-san-lorenzo',
  'title' => 'Desagüe de Pozo Ciego en San Lorenzo | Rápido',
  'desc'  => 'Desagüe y limpieza de pozos ciegos en San Lorenzo con camión atmosférico. Atención en todos los barrios, precios accesibles y presupuesto por WhatsApp.',
  'wa'    => 'Hola, necesito desagüe de pozo ciego en San Lorenzo.',
  'crumb' => 'Desagüe en San Lorenzo',
],

'desague-mariano-roque-alonso' => [
  'url'   => '/desague-mariano-roque-alonso',
  'title' => 'Desagüe de Pozo Ciego en Mariano Roque Alonso',
  'desc'  => 'Desagüe de pozo ciego en Mariano Roque Alonso con camión desagotador. Vaciado de pozos y cámaras sépticas, zona Expo y Transchaco. Presupuesto gratis.',
  'wa'    => 'Hola, necesito desagüe de pozo ciego en Mariano Roque Alonso.',
  'crumb' => 'Desagüe en Mariano Roque Alonso',
],

'privacidad' => [
  'url'   => '/privacidad',
  'title' => 'Política de Privacidad | Pozo.com.py',
  'desc'  => 'Cómo usamos los datos que dejás en el formulario y en WhatsApp, para qué los usamos y cómo pedir que los borremos. Ley 6534/2020 de Paraguay.',
  'wa'    => 'Hola, tengo una consulta sobre mis datos personales.',
  'crumb' => 'Política de privacidad',
  'noindex' => true,
],

'404' => [
  'url'   => '/404',
  'title' => 'Página no encontrada | Pozo.com.py',
  'desc'  => 'La página que buscabas no existe o cambió de dirección. Mirá los servicios de pozos artesianos, desagüe y sistemas sépticos, o escribinos por WhatsApp.',
  'wa'    => 'Hola, no encontré lo que buscaba en la web y quiero consultar.',
  'crumb' => 'Página no encontrada',
  'noindex' => true,
],

];

/* ─────────────────────────────────────────────────────────────
   5. HELPERS
   ───────────────────────────────────────────────────────────── */

/** Datos de la página actual. $page se define arriba de cada include del header. */
function pg($key = null) {
    global $PAGES, $page;
    $p = $PAGES[$page] ?? $PAGES['home'];
    return $key === null ? $p : ($p[$key] ?? '');
}

/** Enlace de WhatsApp con texto prellenado. Sin texto → usa el de la página. */
function wa($text = null) {
    $t = $text ?? pg('wa');
    return 'https://wa.me/' . WA_NUMBER . '?text=' . rawurlencode($t);
}

/** Guaraníes con punto como separador de miles: 1500000 → "Gs. 1.500.000" */
function gs($n) {
    return 'Gs. ' . number_format((float)$n, 0, ',', '.');
}

/** Rango de guaraníes: "Gs. 350.000 – 550.000" */
function gs_rango($min, $max) {
    return gs($min) . ' – ' . number_format((float)$max, 0, ',', '.');
}

/** Escape corto */
function e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

/** URL absoluta canónica de la página actual */
function canonical() { return rtrim(SITE_URL, '/') . pg('url'); }
