export const SITE = {
  name: 'Pozo.com.py',
  url: 'https://pozo.com.py',
  tagline: 'Pozos artesianos y desagüe de pozos ciegos en Paraguay',
  city: 'Asunción',
  region: 'Capital',
  country: 'PY',
  languages: ['es-PY', 'gn'],
  hoursText: 'Lun a Sáb 07:00–19:00 · Urgencias de desagüe, también domingo',
  whatsapp: '595992279599',
  phoneDisplay: '+595 992 279 599',
  phoneHref: '+595992279599',
  leadEmail: '',
  venderCrmUrl: 'https://crm.clientes.com.py',
  capacity: '8 m³',
  assetVersion: '20261001-1',
  // Organization logo for structured data (512 x 512 PNG of the favicon mark).
  logo: '/assets/images/logo-pozo-512.png',
  // Official profiles of the business (Google Business Profile, Facebook,
  // Instagram…). Empty until the owner confirms them; never guess a URL.
  sameAs: [],
};

export const DEMO_MODE = false;

// Client-facing rates in guaraníes (Gs). Operator quote of 2026-09-30 (80.000 Gs/m
// drilling, 6.500.000 Gs installation kit) plus ~5%, rounded to clean numbers.
// Never publish the operator's own rates. null = "A cotizar".
export const PRICES = {
  drillingSoilPerMeter: 84000,   // includes casing (entubado) and gravel pack (engravado)
  drillingMixedPerMeter: 84000,  // same quote covered the zone's soil; confirm mixed on site
  drillingRockPerMeter: null,    // no operator quote yet
  installationKit: 6800000,      // 1 hp pump + panel, hydropneumatic tank, pipes, fittings
  drainageTrip8m3: null,
};

// WhatsApp texts (launcher rows, page CTAs, calculator, form redirect) live in
// content/wa-messages.mjs, the single message map.

// form_id -> VenderCRM source. Unknown form_id falls back to 'contacto'.
export const CONTACT_SOURCES = {
  contacto: 'site:pozo.com.py:contacto',
  ficha: 'site:pozo.com.py:ficha-rapida',
  calculadora: 'site:pozo.com.py:calculadora',
};
