// THE ONLY SOURCE of pre-written WhatsApp messages on pozo.com.py.
//
// Every wa.me link on the site is https://wa.me/<SITE.whatsapp>?text=<encodeURIComponent(text)>
// and every text comes from this file:
//   - build.mjs: page CTAs, launcher rows, contact page rows (waText()).
//   - assets/js/site.js: the calculator reads CALCULATOR_TEMPLATE, which
//     build.mjs writes into data attributes on #estimate.
//   - contacto.php: the post-form redirect reads FORM_FALLBACK, which build.mjs
//     writes into config/site.generated.php.
//
// Writing rules: Paraguayan Spanish with voseo, written as the visitor would
// write it. No prices or amounts (PYG only, and only if a verified price ever
// exists — it does not today). Each text names the site and the page, names
// the service, and asks for what the operator needs to help: zona, fotos o
// medidas, and cuándo. tools/qa.mjs fails the build if a wa.me link uses
// another number, has no text, or misses the site/page line.

import { ZONES } from './zones.mjs';
import { GUIDES, guidePath, HAS_GUIDE_HUB, GUIDE_HUB } from './guides.mjs';

export const SITE_LABEL = 'pozo.com.py';

const WHEN = 'Para cuándo lo necesito (hoy, esta semana, sin apuro): ___';
const WHEN_URGENT = 'Para cuándo: hoy mismo / mañana / esta semana';
const WHEN_PROJECT = 'Para cuándo lo quiero hacer (este mes, en 1 a 3 meses, estoy averiguando): ___';
const zoneLine = (zone) => `Ciudad y barrio: ${zone ? `${zone}, barrio ___` : '___'}`;

// --- Topics: what the visitor needs --------------------------------------------
// label/hint are the visible row texts in the launcher and on /contacto/.
// need = the first line after the greeting. asks(zone) = what the operator needs.
export const TOPICS = {
  urgente: {
    label: 'Desagüe urgente / pozo rebalsado',
    hint: 'Camión atmosférico, hoy si hay disponibilidad',
    urgent: true,
    need: 'Necesito un desagüe urgente: el pozo ciego está lleno o rebalsando.',
    asks: (zone) => [zoneLine(zone), '¿Está rebalsando ahora? (sí/no): ___', '¿Puede entrar el camión hasta cerca del pozo? (sí/no/no sé): ___', 'Distancia aproximada del portón a la tapa: ___ pasos', 'Les mando una foto del acceso y otra de la tapa, sin abrirla.', WHEN_URGENT],
  },
  artesiano: {
    label: 'Cotizar pozo artesiano',
    hint: 'Perforación, entubado, bomba y tablero',
    need: 'Quiero cotizar la perforación de un pozo artesiano.',
    asks: (zone) => [zoneLine(zone), 'Uso del agua (casa, quinta, comercio, riego, obra): ___', 'Profundidad de pozos vecinos, si la sé: ___ m', 'Les mando fotos del terreno y del acceso para el equipo.', WHEN_PROJECT],
  },
  precio: {
    label: 'Precio de pozo artesiano por metro',
    hint: 'Profundidad, suelo y componentes',
    need: 'Quiero saber el precio por metro de un pozo artesiano para mi terreno.',
    asks: (zone) => [zoneLine(zone), 'Profundidad estimada: ___ m', 'Tipo de suelo, si lo sé (tierra, mixto, roca): ___', 'Incluir: entubado / filtro / bomba / tablero', 'Les mando fotos del terreno y del acceso.', WHEN_PROJECT],
  },
  ciego: {
    label: 'Consulta por pozo ciego o séptico',
    hint: 'Construcción, mantenimiento, biodigestor',
    need: 'Tengo una consulta por un pozo ciego (construcción, revisión o mantenimiento).',
    asks: (zone) => [zoneLine(zone), 'Qué necesito (pozo nuevo, se llena seguido, revisión): ___', 'Cantidad de personas que usan el baño: ___', 'Les mando fotos del patio y de la tapa, con medidas aproximadas del espacio.', WHEN],
  },
  desague: {
    label: 'Desagüe de pozo ciego',
    hint: 'Camión atmosférico de 8 m³',
    need: 'Necesito un desagüe de pozo ciego con camión atmosférico.',
    asks: (zone) => [zoneLine(zone), '¿Está rebalsando? (sí/no): ___', 'Fecha aproximada del último desagüe: ___', 'Distancia del portón a la tapa: ___ pasos', 'Les mando una foto del acceso y otra de la tapa.', WHEN],
  },
  'desague-acceso': {
    label: 'Foto del acceso',
    need: 'Quiero coordinar un desagüe de pozo ciego. Les mando la foto del acceso desde la calle.',
    asks: (zone) => [zoneLine(zone), 'Ancho del portón o pasillo: ___ m', '¿Hay cables bajos, alero o árboles en la entrada? ___', WHEN],
  },
  'desague-tapa': {
    label: 'Foto de la tapa',
    need: 'Quiero coordinar un desagüe de pozo ciego. Les mando la foto de la tapa (sin abrirla).',
    asks: (zone) => [zoneLine(zone), '¿Está rebalsando? (sí/no): ___', 'Fecha aproximada del último desagüe: ___', WHEN],
  },
  'desague-distancia': {
    label: 'Distancia en pasos',
    need: 'Quiero coordinar un desagüe de pozo ciego. Les paso la distancia del camión a la tapa.',
    asks: (zone) => [zoneLine(zone), 'Del portón a la tapa hay unos ___ pasos', '¿El camión puede quedar en la calle frente a la casa? (sí/no): ___', WHEN],
  },
  lleno: {
    label: 'Pozo ciego lleno',
    hint: 'Olor, drenaje lento o rebalse',
    urgent: true,
    need: 'Mi pozo ciego está lleno: hay olor, drenaje lento o rebalse.',
    asks: (zone) => [zoneLine(zone), 'Qué pasa y desde cuándo: ___', '¿Afecta a un solo baño o a toda la casa? ___', 'Fecha del último desagüe: ___', 'Les mando fotos tomadas desde distancia segura.', WHEN_URGENT],
  },
  septico: {
    label: 'Cámara séptica o biodigestor',
    hint: 'Dimensionamiento, instalación, mantenimiento',
    need: 'Quiero consultar por una cámara séptica o un biodigestor.',
    asks: (zone) => [zoneLine(zone), 'Tipo de propiedad y cantidad de personas: ___', 'Espacio disponible (medidas aproximadas): ___ x ___ m', 'Sistema actual, si hay: ___', 'Les mando fotos del lugar donde iría.', WHEN_PROJECT],
  },
  agua: {
    label: 'Tratamiento / análisis de agua',
    hint: 'Sarro, hierro, color, cloración',
    need: 'Quiero consultar por el tratamiento del agua de mi pozo.',
    asks: (zone) => [zoneLine(zone), 'Qué noto en el agua (sarro, hierro, color, olor, sedimento): ___', 'Análisis de laboratorio (sí/no): ___ Si lo tengo, les mando foto del informe.', 'Uso del agua y cantidad de personas: ___', WHEN],
  },
  otro: {
    label: 'Hablar sobre otro caso',
    hint: 'Contanos qué pasa y dónde',
    need: 'Tengo otra consulta sobre pozos, desagüe o agua.',
    asks: (zone) => [zoneLine(zone), 'Qué necesito: ___', 'Les mando fotos si ayudan a entender el caso.', WHEN],
  },
  privacidad: {
    label: 'Consulta sobre mis datos',
    need: 'Quiero hacer una consulta sobre mis datos personales.',
    asks: () => ['Nombre y teléfono con los que escribí: ___', 'Qué necesito (ver, corregir o borrar mis datos): ___'],
  },
};

// The five rows of the floating launcher and the contact page, in order.
export const LAUNCHER_TOPICS = ['urgente', 'artesiano', 'ciego', 'agua', 'otro'];

// --- Pages: where the visitor is --------------------------------------------------
// label = the page name written in the greeting. topic = the page's main CTA.
// zone = prefilled city on zone pages. Every generated page must be listed:
// build.mjs throws for a path that is missing here.
export const PAGES = {
  '/': { label: 'Inicio', topic: 'otro' },
  '/servicios/': { label: 'Servicios', topic: 'otro' },
  '/servicios/artesiano/': { label: 'Pozos artesianos', topic: 'artesiano' },
  '/servicios/precio-pozo/': { label: 'Precio de pozo artesiano por metro', topic: 'precio' },
  '/servicios/pozo-ciego/': { label: 'Pozos ciegos', topic: 'ciego' },
  '/servicios/desague/': { label: 'Desagüe de pozo ciego', topic: 'desague' },
  '/servicios/pozo-lleno/': { label: 'Pozo ciego lleno', topic: 'lleno' },
  '/servicios/septico/': { label: 'Pozos sépticos y biodigestores', topic: 'septico' },
  '/servicios/agua/': { label: 'Tratamiento de agua de pozo', topic: 'agua' },
  '/zonas/': { label: 'Zonas de cobertura', topic: 'otro' },
  '/contacto/': { label: 'Contacto', topic: 'otro' },
  '/privacidad/': { label: 'Privacidad', topic: 'privacidad' },
  '/gracias/': { label: 'Consulta recibida', topic: 'otro' },
  '/404': { label: 'Página no encontrada', topic: 'otro' },
};
for (const zone of ZONES) {
  PAGES[zone.path] = { label: zone.short, topic: zone.topic || 'desague', zone: zone.city };
}
// Guides (content/guides.mjs). Drafts get an entry too: build.mjs renders them
// to the git-ignored .preview/ folder, never to the site.
if (HAS_GUIDE_HUB) PAGES[GUIDE_HUB] = { label: 'Guías', topic: 'otro' };
for (const guide of GUIDES) {
  PAGES[guidePath(guide)] = { label: guide.short || guide.h1, topic: guide.topic || PAGES[guide.relatedServices?.[0]]?.topic || 'otro' };
}

export function waText(path, topicId) {
  const page = PAGES[path];
  if (!page) throw new Error(`wa-messages: page "${path}" is not in PAGES`);
  const id = topicId || page.topic;
  const topic = TOPICS[id];
  if (!topic) throw new Error(`wa-messages: unknown topic "${id}"`);
  return [`Hola, les escribo desde ${SITE_LABEL} (página: ${page.label}).`, topic.need, ...topic.asks(page.zone || '')].join('\n');
}

// --- Calculator (/servicios/precio-pozo/) --------------------------------------------
// Filled in the browser by site.js. Tokens: {depth} {soil} {components}.
export const CALCULATOR_TEMPLATE = [
  `Hola, les escribo desde ${SITE_LABEL} (página: Precio de pozo artesiano por metro).`,
  'Quiero cotizar este alcance de pozo artesiano:',
  'Profundidad estimada: {depth} m',
  'Tipo de suelo esperado: {soil}',
  'Componentes: {components}',
  zoneLine(''),
  'Les mando fotos del terreno y del acceso para el equipo.',
  WHEN_PROJECT,
].join('\n');

// --- Form redirect (contacto.php) ------------------------------------------------------
// After a form POST the visitor continues in WhatsApp with this text. {page} is
// the page the form was sent from. Labels prefix each submitted field.
export const FORM_FALLBACK = {
  intro: {
    contacto: `Hola, les escribo desde ${SITE_LABEL}: acabo de enviar el formulario de contacto.`,
    ficha: `Hola, les escribo desde ${SITE_LABEL}: acabo de dejar mis datos en la ficha rápida ({page}).`,
  },
  labels: { name: 'Nombre', phone: 'Teléfono', service: 'Servicio', zona: 'Ciudad y barrio', message: 'Consulta', email: 'Correo' },
  outro: ['Si hace falta, les mando fotos o medidas por acá.', WHEN],
};
