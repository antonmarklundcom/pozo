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
  assetVersion: '20260930-1',
};

export const DEMO_MODE = false;

export const PRICES = {
  drillingSoilPerMeter: null,
  drillingMixedPerMeter: null,
  drillingRockPerMeter: null,
  casingPerMeter: null,
  filter: null,
  pump: null,
  controlPanel: null,
  drainageTrip8m3: null,
};

// WhatsApp texts (launcher rows, page CTAs, calculator, form redirect) live in
// content/wa-messages.mjs, the single message map.

// form_id -> VenderCRM source. Unknown form_id falls back to 'contacto'.
export const CONTACT_SOURCES = {
  contacto: 'site:pozo.com.py:contacto',
  ficha: 'site:pozo.com.py:ficha-rapida',
};
