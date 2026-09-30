import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, PRICES, DEMO_MODE } from './site.config.mjs';
import { TOPICS, LAUNCHER_TOPICS, PAGES, waText, CALCULATOR_TEMPLATE, FORM_FALLBACK } from './content/wa-messages.mjs';
import { ZONES, COVERAGE_CITIES } from './content/zones.mjs';
import { CROSS_LINKS } from './content/cross-links.mjs';
import { criticalCss, minifyCss, minifyHtml, minifyJs } from './tools/kit/minify.mjs';
import { PUBLISHED_GUIDES, DRAFT_GUIDES, HAS_GUIDE_HUB, GUIDE_HUB, guidePath, anchorId } from './content/guides.mjs';

const root = dirname(fileURLToPath(import.meta.url));

// --- Performance: critical CSS inline, the rest non-blocking, minified assets ---
// assets/css/site.css and assets/js/site.js stay the editable sources; the build
// writes site.min.css / site.min.js next to them. CRITICAL_COMPONENTS are the
// class prefixes that can appear in the first screen of any page (header,
// heroes, fixed WhatsApp controls); their rules plus base element styles are
// inlined. tools/browser-check.mjs fails when the first screen lays out
// differently without the full stylesheet, i.e. when a prefix is missing here.
const CRITICAL_COMPONENTS = [
  'js', 'skip-link', 'sr-only', 'shell', 'site-header', 'utility-bar', 'utility-status', 'utility-hours', 'nav-wrap', 'brand',
  'brand-mark', 'main-nav', 'nav-services', 'services-menu', 'submenu-toggle', 'nav-actions', 'contact-toggle', 'menu-toggle',
  'breadcrumbs', 'eyebrow', 'button', 'text-link', 'arrow-link', 'lede', 'microcopy', 'reveal', 'image-label',
  'decision-hero', 'depth-ruler', 'path-cards', 'path-card', 'page-hero', 'hero-actions', 'hero-media', 'send-strip', 'urgent-box',
  'services-hero', 'guide-hero', 'contact-hero', 'legal-hero', 'not-found', 'trust-bar', '=wa-launcher', 'wa-launcher__fab', '=wa-launcher__fab-label', '=wa-launcher__glyph', 'contact-bar', 'has-contact-bar',
  // Start of the first section, visible in the first screen at 1366 x 900:
  'section', 'section-heading', 'article-grid', 'prose', 'side-panel', 'calculator-grid', 'calculator', 'field', 'input-suffix',
  'contact-grid', 'contact-channels', 'contact-option-list', 'contact-option', 'legal-copy', 'service-card__image',
  'intro', 'estimate', 'zone-grid', 'zone-card', 'contact-form-block', 'lead-form', 'hp-field', 'choice-group', 'choice', 'consent', 'form-note',
  // Short pages (/gracias/, 404) show the footer in the first screen:
  'site-footer', 'footer-grid', 'footer-base',
];
const sourceCss = await readFile(join(root, 'assets', 'css', 'site.css'), 'utf8');
const inlineCss = criticalCss(sourceCss, CRITICAL_COMPONENTS).replace(/<\/style/gi, '<\\/style');
await writeFile(join(root, 'assets', 'css', 'site.min.css'), `${minifyCss(sourceCss)}\n`, 'utf8');
await writeFile(join(root, 'assets', 'js', 'site.min.js'), `${minifyJs(await readFile(join(root, 'assets', 'js', 'site.js'), 'utf8'))}\n`, 'utf8');

// Preload for the page's LCP image (the first fetchpriority="high" <img>).
function lcpPreload(html) {
  const tag = html.match(/<img\s[^>]*fetchpriority="high"[^>]*>/)?.[0];
  if (!tag) return '';
  const attr = (name) => tag.match(new RegExp(`\\s${name}="([^"]+)"`))?.[1];
  const srcset = attr('srcset');
  return `<link rel="preload" as="image" href="${attr('src')}"${srcset ? ` imagesrcset="${srcset}" imagesizes="${attr('sizes') || '100vw'}"` : ''} fetchpriority="high">`;
}
// Widths of the smaller WebP copies written by tools/prepare-images.py.
const imageManifest = JSON.parse(await readFile(join(root, 'assets', 'images', 'manifest.json'), 'utf8'));
const areas = COVERAGE_CITIES;
const barrios = ['Villa Morra', 'Recoleta', 'Carmelitas', 'Sajonia', 'Trinidad', 'Barrio Jara'];

// serviceType (schema.org Service) per page that renders a Service node, and
// for the business's offer catalog. Structured data only: no visible copy.
const SERVICE_TYPES = {
  '/servicios/artesiano/': 'Perforación de pozos artesianos',
  '/servicios/precio-pozo/': 'Perforación de pozos artesianos',
  '/servicios/pozo-ciego/': 'Construcción y mantenimiento de pozos ciegos',
  '/servicios/desague/': 'Desagüe de pozos ciegos con camión atmosférico',
  '/servicios/pozo-lleno/': 'Desagüe de pozos ciegos con camión atmosférico',
  '/servicios/septico/': 'Cámaras sépticas y biodigestores',
  '/servicios/agua/': 'Tratamiento de agua de pozo',
};
const ZONE_SERVICE_TYPE = 'Desagüe de pozos ciegos con camión atmosférico';

const services = [
  { href: '/servicios/artesiano/', label: 'Pozos artesianos', text: 'Perforación, entubado, filtro, bomba y tablero según el terreno y la profundidad.', image: 'pozo-artesiano-servicio.webp', alt: 'Ilustración de una perforadora sobre camión con dos operarios con casco y agua saliendo del pozo' },
  { href: '/servicios/pozo-ciego/', label: 'Pozos ciegos', text: 'Construcción, mantenimiento y revisión de pozos ciegos según el terreno y el uso.', image: 'pozo-septico-instalacion.webp', alt: 'Ilustración de una cámara de hormigón con tapas y cañerías grises, colocada en una excavación de tierra roja' },
  { href: '/servicios/desague/', label: 'Desagüe de pozo ciego', text: 'Extracción con camión atmosférico de 8 m³ y coordinación de urgencias.', image: 'desague-pozo-ciego-camion.webp', alt: 'Ilustración de un camión atmosférico blanco con manguera conectada a la tapa abierta de un pozo, junto a una casa' },
  { href: '/servicios/pozo-lleno/', label: 'Pozo ciego lleno', text: 'Guía de seguridad y diagnóstico para rebalse, olor o drenaje lento.', image: 'pozo-ciego-lleno-inspeccion.webp', alt: 'Ilustración de un técnico con tableta junto a la tapa de un pozo ciego y tierra húmeda alrededor' },
  { href: '/servicios/septico/', label: 'Sistemas sépticos', text: 'Orientación sobre cámaras sépticas, biodigestores, mantenimiento y disposición.', image: 'pozo-septico-instalacion.webp', alt: 'Ilustración de una cámara de hormigón con tapas y cañerías, enterrada en una excavación' },
  { href: '/servicios/agua/', label: 'Tratamiento de agua', text: 'Opciones para sarro, hierro, color, sedimentos y cloración según análisis.', image: 'tratamiento-agua-filtros.webp', alt: 'Ilustración de un equipo de tratamiento de agua con filtro previo, tanque de hierro, tanque de carbón y tanque de presión' },
];

const faqs = [
  ['¿Cuánto cuesta un pozo artesiano en Paraguay?', 'Depende de la profundidad, el tipo de suelo, el diámetro, el entubado, el filtro, la bomba y el tablero. En Gran Asunción son habituales proyectos de 30 a 120 metros, pero la profundidad final se define durante la perforación. Pedí una cotización con la ubicación y el alcance previsto.'],
  ['¿Cuál es el precio del desagüe de un pozo ciego?', 'Se cotiza por viaje del camión de 8 m³, ubicación, acceso, distancia y urgencia. Compartí el barrio, el estado del pozo y la distancia desde la calle para confirmar el monto antes de coordinar.'],
  ['¿Pozo ciego, cámara séptica y biodigestor son lo mismo?', 'No. El pozo ciego recibe e infiltra efluentes; la cámara séptica separa sólidos y hace un tratamiento primario; el biodigestor es un sistema prefabricado con tratamiento anaeróbico. La solución apropiada depende del suelo, espacio y normativa aplicable.'],
  ['¿Atienden urgencias de desagüe?', 'El horario regular es de lunes a sábado de 07:00 a 19:00. También se coordinan urgencias de desagüe los domingos, sujetas a disponibilidad y zona.'],
  ['¿El presupuesto o la visita tienen costo?', 'El costo de visita, diagnóstico o presupuesto debe confirmarse antes de coordinar. El sitio no lo presenta como gratuito hasta recibir la política real del operador.'],
  ['¿El agua de un pozo artesiano es potable?', 'No se debe asumir. La apariencia del agua no confirma su potabilidad. Se recomienda análisis físico-químico y microbiológico, y definir tratamiento o desinfección según el resultado.'],
];

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
}

function whatsappLink(message) {
  return SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}` : '';
}

// --- WhatsApp click tracking (wa.php) ------------------------------------------
// Every wa.me text belongs to one (page, topic) pair of the message map. The
// HTML keeps the direct wa.me link (works without JS); data-wa-track tells
// site.js which /wa.php?p=&t= URL to use at the moment of the click.
const WA_TRACK = new Map();
for (const [path, page] of Object.entries(PAGES)) {
  for (const topicId of [page.topic, ...Object.keys(TOPICS)]) {
    const text = waText(path, topicId);
    if (!WA_TRACK.has(text)) WA_TRACK.set(text, { path, topic: topicId });
  }
}

function trackWaLinks(html) {
  return html.replace(/(<a\s[^>]*?href="https:\/\/wa\.me\/\d+\?text=([^"]*)")(?![^>]*data-wa-track=)/g, (tag, _, encoded) => {
    const hit = WA_TRACK.get(decodeURIComponent(encoded));
    if (!hit) return tag;
    return `${tag} data-wa-track="p=${encodeURIComponent(hit.path)}&amp;t=${encodeURIComponent(hit.topic)}"`;
  });
}

function phoneLink(label = SITE.phoneDisplay, className = '') {
  return `<a${className ? ` class="${className}"` : ''} href="tel:${esc(SITE.phoneHref)}">${esc(label)}</a>`;
}

function cta(label, message, className = 'button button--primary') {
  const href = whatsappLink(message);
  return href
    ? `<a class="${className}" href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
    : `<span class="${className} is-disabled" role="link" aria-disabled="true" title="Configurá el número en site.config.mjs">WhatsApp por configurar</span>`;
}

// --- Inline SVG icons -------------------------------------------------------
// One source for every glyph. Each entry returns a complete <svg> string that
// is decorative by definition: the surrounding link or button carries the name.
const icons = {
  wa: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" fill="currentColor"/>',
  phone: '<path d="M6.6 3.5 9 3.9l1 3.4-1.9 1.5a12 12 0 0 0 6.1 6.1l1.5-1.9 3.4 1 .4 2.4a1.7 1.7 0 0 1-1.7 1.9A14.7 14.7 0 0 1 4.7 5.2 1.7 1.7 0 0 1 6.6 3.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  chat: '<path d="M3.5 5.2h17v11.2h-9.3L6 20v-3.6H3.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7.6 9.1h8.8M7.6 12.5h5.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  alert: '<path d="M12 3.6 21.4 20H2.6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9.6v4.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="16.7" r="1.1" fill="currentColor"/>',
  drop: '<path d="M12 3.2c3.9 4.5 5.9 7.7 5.9 10.2A5.9 5.9 0 0 1 6.1 13.4C6.1 10.9 8.1 7.7 12 3.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  close: '<path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  form: '<path d="M5 3.6h14v16.8H5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.4 8.2h7.2M8.4 12h7.2M8.4 15.8h4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
};

function svg(name, className = '') {
  const body = icons[name];
  if (!body) return '';
  return `<svg${className ? ` class="${className}"` : ''} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">${body}</svg>`;
}

// --- WhatsApp messages --------------------------------------------------------
// Every text lives in content/wa-messages.mjs. waMessage(topic, path) is the
// only way build.mjs gets one: the page path names the page in the greeting
// and prefills the zone, the topic names the service and the questions.
function waMessage(topic, path) {
  return waText(path, topic);
}

// --- Launcher and header contact control ------------------------------------
function contactToggle() {
  return `<a class="contact-toggle" href="#wa-launcher" data-launcher-trigger><span class="contact-toggle__icon">${svg('chat')}</span><span class="contact-toggle__label">Contacto</span><span class="sr-only">Abrir opciones de contacto</span></a>`;
}

// Lead triage controls shared by the contact form and the ficha rápida.
const URGENCY_TEXT = { hoy: 'Hoy', semana: 'Esta semana', 'sin-apuro': 'Sin apuro' };
function urgencyField(prefix) {
  return `<fieldset class="choice-group"><legend>¿Para cuándo lo necesitás?</legend><div class="choice-group__options">${Object.keys(FORM_FALLBACK.urgency).map((value, index) => `<label class="choice" for="${prefix}-urg-${value}"><input id="${prefix}-urg-${value}" type="radio" name="urgencia" value="${value}"${index === 0 ? ' required' : ''}><span>${URGENCY_TEXT[value]}</span></label>`).join('')}</div></fieldset>`;
}
function zonaField(prefix) {
  return `<div class="field"><label for="${prefix}-zona">Ciudad</label><select id="${prefix}-zona" name="zona" required><option value="">Elegí tu ciudad</option>${COVERAGE_CITIES.map((city) => `<option>${esc(city)}</option>`).join('')}<option value="Otra">Otra ciudad</option></select></div><div class="field"><label for="${prefix}-barrio">Barrio o referencia <span>(opcional)</span></label><input id="${prefix}-barrio" name="barrio" maxlength="200" autocomplete="address-level3"></div>`;
}

function launcherOption(id, path) {
  const option = TOPICS[id];
  const href = whatsappLink(waMessage(id, path));
  const className = `wa-option${option.urgent ? ' wa-option--urgent' : ''}`;
  return `<li><a class="${className}" href="${href}" target="_blank" rel="noopener noreferrer"><span class="wa-option__icon">${svg(option.urgent ? 'alert' : 'wa')}</span><span class="wa-option__text"><strong>${esc(option.label)}</strong><span>${esc(option.hint)}</span></span><span class="wa-option__arrow" aria-hidden="true">${svg('arrow')}</span></a></li>`;
}

// Ficha rápida (section 5.6). Sixth row, a plain POST form so a launcher
// interaction can become a CRM contact — a wa.me click never reveals a number.
function fichaRow() {
  const options = LAUNCHER_TOPICS.map((id) => `<option value="${esc(TOPICS[id].label)}">${esc(TOPICS[id].label)}</option>`).join('');
  return `<li class="wa-ficha-row"><details class="wa-ficha" id="ficha-rapida">
    <summary class="wa-ficha__toggle"><span class="wa-option__icon">${svg('form')}</span><span class="wa-option__text"><strong>Dejar mi teléfono y que me escriban</strong><span>Si preferís no abrir WhatsApp ahora</span></span><span class="wa-ficha__chevron" aria-hidden="true">+</span></summary>
    <form class="wa-ficha__form" action="/contacto.php" method="POST">
      <input type="hidden" name="form_id" value="ficha">
      <input type="hidden" name="page_url" value="">
      <input type="hidden" name="message" value="Ficha rápida enviada desde el sitio. Pido que me escriban por WhatsApp.">
      <div class="hp-field" aria-hidden="true"><label for="ficha-website">Dejá este campo vacío</label><input id="ficha-website" name="website" tabindex="-1" autocomplete="off"></div>
      <div class="field"><label for="ficha-name">Nombre</label><input id="ficha-name" name="name" autocomplete="name" maxlength="200" required></div>
      <div class="field"><label for="ficha-phone">WhatsApp o teléfono</label><input id="ficha-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="30" placeholder="09xx xxx xxx" required></div>
      <div class="field"><label for="ficha-service">¿Qué necesitás?</label><select id="ficha-service" name="service" required><option value="">Elegí una opción</option>${options}</select></div>
      ${zonaField('ficha')}
      ${urgencyField('ficha')}
      <label class="consent"><input id="ficha-consent" type="checkbox" name="consent" value="1" required><span>Leí la <a href="/privacidad/">política de privacidad</a> y acepto el uso de estos datos para responder mi consulta.</span></label>
      <button class="button button--primary" type="submit">Enviar y continuar en WhatsApp</button>
    </form>
  </details></li>`;
}

function launcher(page) {
  const rows = LAUNCHER_TOPICS.map((id) => launcherOption(id, page.path)).join('');
  return `<details class="wa-launcher" id="wa-launcher">
  <summary class="wa-launcher__fab" aria-label="Abrir opciones de contacto por WhatsApp">${svg('wa', 'wa-launcher__glyph')}<span class="wa-launcher__fab-label">WhatsApp</span></summary>
  <div class="wa-launcher__panel" role="dialog" aria-labelledby="wa-launcher-title">
    <header class="wa-launcher__head"><p class="eyebrow">Escribinos por WhatsApp</p><h2 id="wa-launcher-title">¿Qué necesitás resolver?</h2><button type="button" class="wa-launcher__close" hidden><span class="sr-only">Cerrar</span>${svg('close')}</button></header>
    <ul class="wa-launcher__list">${rows}${fichaRow()}</ul>
    <footer class="wa-launcher__foot"><a class="wa-launcher__phone" href="tel:${esc(SITE.phoneHref)}">${svg('phone')}<span>Llamar al ${esc(SITE.phoneDisplay)}</span></a><span class="wa-launcher__hours">${SITE.hoursText}</span><a class="wa-launcher__form-link" href="/contacto/">Dejar mis datos en el formulario</a></footer>
  </div>
</details>`;
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Migas de pan"><ol>${items.map(([href, label], index) => `<li>${index === items.length - 1 ? esc(label) : `<a href="${href}">${esc(label)}</a>`}</li>`).join('')}</ol></nav>`;
}

// JSON-LD graph. Ids: /#website, /#organization, /#business (the local
// business, part of the organization), <page>#service, <page>#article.
// No ratings, reviews or prices anywhere (qa.mjs enforces it).
function baseSchema(page) {
  const cityList = (names) => names.map((name) => ({ '@type': 'City', name }));
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: `${SITE.url}/`,
    name: SITE.name,
    inLanguage: 'es-PY',
    publisher: { '@id': `${SITE.url}/#organization` },
  };
  const organization = {
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: `${SITE.url}/`,
    logo: { '@type': 'ImageObject', url: `${SITE.url}${SITE.logo}`, width: 512, height: 512 },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
  const professional = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    url: `${SITE.url}/`,
    description: SITE.tagline,
    logo: `${SITE.url}${SITE.logo}`,
    parentOrganization: { '@id': `${SITE.url}/#organization` },
    image: `${SITE.url}/assets/images/pozo-artesiano-perforacion.webp`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    areaServed: cityList(areas),
    knowsLanguage: SITE.languages,
    openingHours: ['Mo-Sa 07:00-19:00'],
    // What the business offers, without prices (none are verified).
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios de pozos, desagüe y agua',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: service.label, serviceType: SERVICE_TYPES[service.href], url: `${SITE.url}${service.href}` },
      })),
    },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
  if (SITE.phoneDisplay !== 'Contacto pendiente') professional.telephone = SITE.phoneDisplay;
  if (SITE.phoneDisplay !== 'Contacto pendiente') {
    professional.contactPoint = {
      '@type': 'ContactPoint',
      telephone: SITE.phoneDisplay,
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'Guarani'],
    };
  }
  const graph = [website, organization, professional];
  if (page.service) {
    graph.push({
      '@type': 'Service',
      '@id': `${SITE.url}${page.path}#service`,
      name: page.h1,
      serviceType: page.zone ? ZONE_SERVICE_TYPE : SERVICE_TYPES[page.path],
      provider: { '@id': `${SITE.url}/#business` },
      // A zone page serves its own city; service pages the whole coverage.
      areaServed: cityList(page.zone ? [page.zone] : areas),
      url: `${SITE.url}${page.path}`,
      description: page.description,
    });
  }
  if (page.collection) {
    graph.push({
      '@type': 'CollectionPage',
      name: page.h1,
      url: `${SITE.url}${page.path}`,
      description: page.description,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: (page.itemList || services.map((service) => [service.href, service.label])).map(([href, name], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name,
          url: `${SITE.url}${href}`,
        })),
      },
    });
  }
  if (page.article) {
    const url = `${SITE.url}${page.path}`;
    graph.push({
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: page.h1,
      description: page.description,
      url,
      mainEntityOfPage: url,
      isPartOf: { '@id': `${SITE.url}/#website` },
      inLanguage: 'es-PY',
      datePublished: page.article.published,
      dateModified: page.article.updated || page.article.published,
      author: { '@id': `${SITE.url}/#business` },
      publisher: { '@id': `${SITE.url}/#business` },
      ...(page.image ? { image: `${SITE.url}/assets/images/${page.image}` } : {}),
    });
  }
  if (page.faqs?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
    });
  }
  if (page.crumbs?.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: page.crumbs.map(([path, name], position) => ({ '@type': 'ListItem', position: position + 1, name, item: `${SITE.url}${path}` })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph.map(({ '@context': _, ...item }) => item) };
}

function header() {
  return `<header class="site-header">
    <div class="utility-bar"><div class="shell utility-bar__inner"><span class="utility-hours">${SITE.hoursText}</span><span class="utility-status"><i></i>${phoneLink()}<span class="utility-status__zone"> · Gran Asunción</span></span></div></div>
    <div class="shell nav-wrap">
      <a class="brand" href="/" aria-label="Pozo.com.py, inicio"><span class="brand-mark" aria-hidden="true"><b></b></span><span><strong>POZO</strong><small>.COM.PY</small></span></a>
      <nav class="main-nav" id="main-nav" aria-label="Navegación principal">
        <div class="nav-services">
          <a class="nav-services__link" href="/servicios/">Servicios</a>
          <button class="submenu-toggle" type="button" aria-expanded="false" aria-controls="services-menu" aria-label="Mostrar servicios"><span aria-hidden="true">⌄</span></button>
          <div class="services-menu" id="services-menu">
            <a href="/servicios/artesiano/"><strong>Pozo artesiano</strong><span>Perforación y equipamiento</span></a>
            <a href="/servicios/precio-pozo/"><strong>Precio por metro</strong><span>Calculadora de alcance</span></a>
            <a href="/servicios/pozo-ciego/"><strong>Pozo ciego</strong><span>Construcción y mantenimiento</span></a>
            <a href="/servicios/desague/"><strong>Desagüe</strong><span>Camión atmosférico</span></a>
            <a href="/servicios/pozo-lleno/"><strong>Pozo lleno</strong><span>Señales y qué hacer</span></a>
            <a href="/servicios/septico/"><strong>Sistema séptico</strong><span>Cámaras y biodigestores</span></a>
            <a href="/servicios/agua/"><strong>Tratamiento de agua</strong><span>Filtros y cloración</span></a>
          </div>
        </div>
        <a href="/servicios/artesiano/">Pozo artesiano</a>
        <a href="/servicios/desague/">Desagüe</a>
        <a href="/contacto/">Contacto</a>
      </nav>
      <div class="nav-actions">
        ${contactToggle()}
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Abrir menú</span></button>
      </div>
    </div>
  </header>`;
}

function footer() {
  const email = SITE.leadEmail ? `<a href="mailto:${esc(SITE.leadEmail)}">${esc(SITE.leadEmail)}</a>` : '';
  return `<footer class="site-footer">
    <div class="shell footer-grid">
      <div><a class="brand brand--footer" href="/"><span class="brand-mark" aria-hidden="true"><b></b></span><span><strong>POZO</strong><small>.COM.PY</small></span></a><p>${SITE.tagline}</p><p class="editorial-note">Las imágenes del sitio son ilustrativas: no muestran trabajos, equipos ni personal reales.</p></div>
      <div><h2>Servicios</h2><a href="/servicios/">Ver todos</a><a href="/servicios/artesiano/">Pozos artesianos</a><a href="/servicios/pozo-ciego/">Pozos ciegos</a><a href="/servicios/desague/">Camión atmosférico</a><a href="/servicios/agua/">Tratamiento de agua</a>${HAS_GUIDE_HUB ? `<a href="${GUIDE_HUB}">Guías</a>` : ''}</div>
      <div><h2>Cobertura</h2><a href="/zonas/">Todas las zonas</a>${ZONES.map((zone) => `<a href="${zone.path}">${esc(zone.city)}</a>`).join('')}<span>Asunción y Gran Asunción</span></div>
      <div><h2>Contacto</h2>${phoneLink()}${email}<span>${SITE.hoursText}</span><a href="/privacidad/">Privacidad</a></div>
    </div>
    <div class="shell footer-base"><span>© ${new Date().getFullYear()} Pozo.com.py</span><span>Asunción, Paraguay</span></div>
  </footer>`;
}

function serviceHero(config) {
  const { eyebrow, h1, lead, image, alt } = config;
  const message = waMessage(null, config.path);
  return `<section class="page-hero"><div class="shell page-hero__grid"><div class="page-hero__copy">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${h1}</h1><p class="lede">${lead}</p><div class="hero-actions">${cta(`${svg('wa')}<span>Consultar por WhatsApp</span>`, message, 'button button--wa')}${phoneLink('Llamar', 'text-link text-link--phone')}<a class="text-link" href="#contenido">Ver detalles <span aria-hidden="true">↓</span></a></div><p class="microcopy">Respuesta y cobertura sujetas a confirmación del operador.</p>${config.leadBox || ''}</div><figure class="hero-media"><img src="/assets/images/${image}" alt="${alt}" width="1200" height="675" fetchpriority="high" data-sizes="(max-width: 700px) calc(100vw - 32px), 420px"><figcaption>Imagen ilustrativa</figcaption></figure></div></section>`;
}

// A large tappable decision card: icon, title, one line, action, side link.
function pathCard({ tone = 'water', icon = 'drop', kicker, title, line, actionLabel, message, link, linkLabel, depth, reveal = false }) {
  return `<article class="path-card path-card--${tone}${reveal ? ' reveal' : ''}">
    <span class="path-card__icon" aria-hidden="true">${svg(icon)}</span>
    ${depth ? `<span class="path-card__depth">${esc(depth)}</span>` : ''}
    <p class="path-card__kicker">${esc(kicker)}</p>
    <h2 class="path-card__title">${esc(title)}</h2>
    <p class="path-card__line">${esc(line)}</p>
    ${cta(`${svg('wa')}<span>${esc(actionLabel)}</span>`, message, `button button--wa path-card__action`)}
    ${link ? `<a class="arrow-link path-card__link" href="${link}">${esc(linkLabel)} <span aria-hidden="true">→</span></a>` : ''}
  </article>`;
}

function contactBar(page) {
  const href = whatsappLink(waMessage(null, page.path));
  if (!href) return '';
  return `<nav class="contact-bar" aria-label="Contacto rápido"><a class="contact-bar__btn contact-bar__btn--wa" href="${href}" target="_blank" rel="noopener noreferrer">${svg('wa')}<span>WhatsApp</span></a><a class="contact-bar__btn contact-bar__btn--call" href="tel:${esc(SITE.phoneHref)}">${svg('phone')}<span>Llamar</span></a></nav>`;
}

function priceRows() {
  const rows = [
    ['Perforación — suelo de tierra (incluye entubado y engravado)', 'por metro', PRICES.drillingSoilPerMeter],
    ['Perforación — suelo mixto (incluye entubado y engravado)', 'por metro', PRICES.drillingMixedPerMeter],
    ['Perforación — roca', 'por metro', PRICES.drillingRockPerMeter],
    ['Instalación completa: bomba 1 hp, tablero, tanque hidroneumático, cañerías y accesorios', 'kit completo', PRICES.installationKit],
    [`Desagüe — camión ${SITE.capacity}`, 'por viaje', PRICES.drainageTrip8m3],
  ];
  const money = (value) => value == null ? '<span class="pending">A cotizar</span>' : `${formatGs(value)}`;
  return rows.map(([name, unit, value]) => `<tr><th scope="row" data-label="Concepto">${name}</th><td data-label="Unidad">${unit}</td><td data-label="Precio">${money(value)}</td></tr>`).join('');
}

// Guaraníes with dot thousands: 21920000 -> "21.920.000 Gs". The same format is in site.js.
function formatGs(value) {
  return `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Gs`;
}

// What the price covers. Shown inside the calculator panel and in its own section.
// `install: true` groups belong to the installation kit and hide when it is unticked.
const INCLUDED = [
  { title: 'Perforación', install: false, items: ['Perforación del pozo por metro', 'Entubado', 'Engravado (filtro de grava)', 'Tapa de pozo'] },
  { title: 'Bombeo y electricidad', install: true, items: ['Motor bomba de 1 hp', 'Tablero de comando', 'Cable 3x2 (70 m)', 'Piola de 8 (70 m)', 'Presostato', 'Manómetro'] },
  { title: 'Tanque y cañerías', install: true, items: ['Tanque hidroneumático', 'Distribuidor de 5 vías', 'Manguera flexible de 1"', 'Caño roscable de 10 kg', 'Válvula, uniones y codos', 'Cintas, buje y accesorios'] },
];
const includedColumns = () => INCLUDED.map((group) => `<div class="included-col"${group.install ? ' data-needs-install' : ''}><h4>${group.title}</h4><ul class="included-list">${group.items.map((item) => `<li>${item}</li>`).join('')}</ul></div>`).join('');

const RATES_JSON = JSON.stringify({ soil: PRICES.drillingSoilPerMeter, mixed: PRICES.drillingMixedPerMeter, rock: PRICES.drillingRockPerMeter, kit: PRICES.installationKit });

// Lead form under the estimate: posts the scope to contacto.php (form_id calculadora),
// which stores it in the CRM and sends the visitor to /gracias/ with the estimate.
function calculatorLeadForm(depth, estimateTotal) {
  const message = `Presupuesto desde la calculadora: pozo artesiano de ${depth} m, suelo tierra, con instalación completa. Estimación del sitio: ${formatGs(estimateTotal)}.`;
  return `<form class="calc-lead" id="calc-lead" action="/contacto.php" method="POST"><input type="hidden" name="form_id" value="calculadora"><input type="hidden" name="page_url" value=""><input type="hidden" name="service" value="Cotizar pozo artesiano"><input type="hidden" name="message" value="${esc(message)}"><input type="hidden" name="depth" value="${depth}"><input type="hidden" name="soil" value="tierra"><input type="hidden" name="install" value="1"><input type="hidden" name="estimate" value="${estimateTotal}"><div class="hp-field" aria-hidden="true"><label for="calc-website">Dejá este campo vacío</label><input id="calc-website" name="website" tabindex="-1" autocomplete="off"></div><h3>Recibí tu presupuesto</h3><p>Dejá tus datos y el operador confirma el valor final con vos.</p><div class="calc-lead__fields"><div><label for="calc-name">Nombre</label><input id="calc-name" name="name" autocomplete="name" maxlength="200" required></div><div><label for="calc-phone">WhatsApp o teléfono</label><input id="calc-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="30" required></div></div><label class="consent"><input id="calc-consent" type="checkbox" name="consent" value="1" required><span>Leí la <a href="/privacidad/">política de privacidad</a> y acepto el uso de estos datos para responder mi consulta.</span></label><button class="button button--primary" type="submit">Quiero este presupuesto</button></form>`;
}

// Initial (server-rendered) calculator estimate: 100 m, tierra, installation included.
const CALC_DEFAULT_DEPTH = 100;
function calculatorEstimate(depth, install) {
  const rate = PRICES.drillingSoilPerMeter;
  const drilling = depth * rate;
  const kit = install ? PRICES.installationKit : 0;
  return { drilling, kit, total: drilling + kit, extra20: 20 * rate };
}

// One contextual link to the right sibling site (content/cross-links.mjs).
function crossLink(path) {
  const link = CROSS_LINKS[path];
  return link ? `<p class="cross-link">${esc(link.lead)} <a href="${esc(link.href)}">${esc(link.text)} <span aria-hidden="true">→</span></a></p>` : '';
}

// "Guías relacionadas": published guides that list this page in relatedServices.
function relatedGuides(path) {
  const related = PUBLISHED_GUIDES.filter((guide) => guide.relatedServices.includes(path));
  if (!related.length) return '';
  return `<aside class="related-guides" aria-labelledby="related-guides-title"><h2 id="related-guides-title">Guías relacionadas</h2><ul>${related.map((guide) => `<li><a href="${guidePath(guide)}">${esc(guide.h1)}</a><span>${esc(guide.description)}</span></li>`).join('')}</ul></aside>`;
}

// Internal link blocks (docs/seo/link-graph.md, checked by tools/link-graph.mjs):
// related services per service page, and the zone pages from the desagüe pages.
const RELATED_SERVICES = {
  '/servicios/artesiano/': ['/servicios/precio-pozo/', '/servicios/agua/'],
  '/servicios/precio-pozo/': ['/servicios/artesiano/', '/servicios/agua/'],
  '/servicios/pozo-ciego/': ['/servicios/desague/', '/servicios/pozo-lleno/', '/servicios/septico/'],
  '/servicios/desague/': ['/servicios/pozo-lleno/', '/servicios/pozo-ciego/', '/servicios/septico/'],
  '/servicios/pozo-lleno/': ['/servicios/desague/', '/servicios/pozo-ciego/', '/servicios/septico/'],
  '/servicios/septico/': ['/servicios/pozo-ciego/', '/servicios/desague/', '/servicios/pozo-lleno/'],
  '/servicios/agua/': ['/servicios/artesiano/', '/servicios/precio-pozo/'],
};
const ZONE_RELATED_SERVICES = ['/servicios/desague/', '/servicios/pozo-lleno/', '/servicios/pozo-ciego/'];
const ZONE_LINK_PAGES = ['/servicios/desague/', '/servicios/pozo-lleno/'];
const linkLabel = (href) => services.find((service) => service.href === href)?.label || PAGES[href]?.label || href;

function relatedLinks(path, isZone) {
  const related = isZone ? ZONE_RELATED_SERVICES : RELATED_SERVICES[path] || [];
  const zoneBlock = ZONE_LINK_PAGES.includes(path) && ZONES.length
    ? `<div class="related-services"><h2>Desagüe por zona</h2><ul>${ZONES.map((zone) => `<li><a class="arrow-link" href="${zone.path}">${esc(zone.short)} <span aria-hidden="true">→</span></a></li>`).join('')}<li><a class="arrow-link" href="/zonas/">Todas las zonas <span aria-hidden="true">→</span></a></li></ul></div>`
    : '';
  const serviceBlock = related.length
    ? `<div class="related-services"><h2>Servicios relacionados</h2><ul>${related.map((href) => `<li><a class="arrow-link" href="${href}">${esc(linkLabel(href))} <span aria-hidden="true">→</span></a></li>`).join('')}</ul></div>`
    : '';
  return serviceBlock + zoneBlock;
}

function faqBlock(items) {
  return `<div class="faq-list">${items.map(([question, answer]) => `<details><summary>${question}<span aria-hidden="true">+</span></summary><p>${answer}</p></details>`).join('')}</div>`;
}

const strata = '<div class="strata" aria-hidden="true"><span></span><span></span><span></span></div>';

function trustBar() {
  return `<section class="trust-bar"><div class="shell trust-bar__inner"><span>Imágenes ilustrativas</span><span>Presupuesto antes de coordinar</span><span>Cada visita se confirma con el operador</span></div></section>`;
}

const home = {
  path: '/',
  short: 'Inicio',
  title: 'Pozos artesianos y desagüe en Paraguay | Pozo.com.py',
  description: 'Pozos artesianos, desagüe de pozos ciegos y soluciones sépticas en Asunción y Gran Asunción. Consultá cobertura y disponibilidad.',
  h1: 'Pozos artesianos y desagüe en Paraguay',
  faqs,
  body: `<main>
    <section class="decision-hero">
      <div class="decision-hero__media"><img src="/assets/images/pozo-artesiano-perforacion.webp" alt="Ilustración de una perforadora sobre camión con un chorro de agua, en un terreno de tierra rojiza con palmeras" width="2000" height="1116" fetchpriority="high"><span class="image-label">Imagen ilustrativa</span></div>
      <div class="shell decision-hero__inner">
        <div class="decision-hero__copy">
          <p class="eyebrow eyebrow--light">Agua · saneamiento · Gran Asunción</p>
          <h1>Pozos artesianos y desagüe de pozos ciegos en Gran Asunción</h1>
          <p class="decision-hero__kicker">Soluciones que llegan más profundo.</p>
        </div>
        <div class="decision-hero__paths">
          <p class="decision-hero__ask">Elegí por dónde empezar</p>
          <div class="path-cards path-cards--hero">
            ${pathCard({
              tone: 'clay', icon: 'alert', depth: 'Desagüe · camión 8 m³',
              kicker: 'Es urgente', title: 'Pozo lleno o rebalsando',
              line: 'Camión atmosférico de 8 m³. Se confirma acceso, distancia y disponibilidad antes de salir.',
              actionLabel: 'Pedir desagüe ahora', message: waMessage('urgente', '/'),
              link: '/servicios/pozo-lleno/', linkLabel: 'Qué hacer mientras esperás',
            })}
            ${pathCard({
              tone: 'water', icon: 'drop', depth: 'Pozo artesiano · 30 a 120 m',
              kicker: 'Es un proyecto', title: 'Quiero mi propio pozo',
              line: 'Perforación, entubado, filtro, bomba y tablero según suelo, uso y profundidad.',
              actionLabel: 'Cotizar pozo artesiano', message: waMessage('artesiano', '/'),
              link: '/servicios/precio-pozo/', linkLabel: 'Ver cómo se cotiza',
            })}
          </div>
          <p class="microcopy microcopy--light">${SITE.hoursText} (sujetas a disponibilidad).</p>
        </div>
      </div>
      <div class="depth-ruler" aria-hidden="true"><span>0 m</span><i></i><span>30 m</span><i></i><span>60 m</span><i></i><span>90 m</span><i></i><span>120 m</span></div>
    </section>
    ${trustBar()}
    <section class="fact-strip"><div class="shell fact-strip__grid"><div class="fact-card reveal"><strong>30–120 m</strong><span>profundidad típica informada en Gran Asunción</span></div><div class="fact-card reveal"><strong>8 m³</strong><span>capacidad informada del camión atmosférico</span></div><div class="fact-card reveal"><strong>10 ciudades</strong><span>zona de cobertura declarada</span></div><div class="fact-card reveal"><strong>Domingos</strong><span>urgencias de desagüe, sujetas a disponibilidad</span></div></div></section>
    ${strata}
    <section class="section" id="servicios"><div class="shell"><div class="section-heading"><div><p class="eyebrow">Qué necesitás resolver</p><h2>Del agua subterránea al saneamiento</h2></div><p>Elegí el servicio según el problema. Cada visita, capacidad y precio se confirma antes de coordinar.</p></div><div class="service-grid">${services.map((service) => `<article class="service-card reveal"><a class="service-card__image" href="${service.href}"><img src="/assets/images/${service.image}" alt="${service.alt}" width="800" height="533" loading="lazy"><span>Imagen ilustrativa</span></a><div><h3><a href="${service.href}">${service.label}</a></h3><p>${service.text}</p><a class="arrow-link" href="${service.href}">Ver servicio <span>→</span></a></div></article>`).join('')}</div></div></section>
    <section class="section section--ink"><div class="shell diagnose-grid"><div class="diagnose-copy"><p class="eyebrow eyebrow--light">Guía rápida</p><h2>¿No sabés qué servicio pedir?</h2><p>Empezá por la señal más visible. La inspección confirma la causa y el trabajo necesario.</p></div><div class="symptom-list"><a class="symptom-router reveal" href="/servicios/pozo-lleno/"><span class="symptom-router__icon" aria-hidden="true">${svg('alert')}</span><span class="symptom-router__text"><strong>Olor, rebalse o drenaje lento</strong><span>Revisar pozo lleno</span></span><span class="symptom-router__arrow" aria-hidden="true">${svg('arrow')}</span></a><a class="symptom-router reveal" href="/servicios/desague/"><span class="symptom-router__icon" aria-hidden="true">${svg('drop')}</span><span class="symptom-router__text"><strong>Necesitás vaciado inmediato</strong><span>Coordinar desagüe</span></span><span class="symptom-router__arrow" aria-hidden="true">${svg('arrow')}</span></a><a class="symptom-router reveal" href="/servicios/agua/"><span class="symptom-router__icon" aria-hidden="true">${svg('drop')}</span><span class="symptom-router__text"><strong>Agua con sarro, hierro o color</strong><span>Ver tratamiento de agua</span></span><span class="symptom-router__arrow" aria-hidden="true">${svg('arrow')}</span></a><a class="symptom-router reveal" href="/servicios/artesiano/"><span class="symptom-router__icon" aria-hidden="true">${svg('drop')}</span><span class="symptom-router__text"><strong>Buscás una fuente propia de agua</strong><span>Planificar perforación</span></span><span class="symptom-router__arrow" aria-hidden="true">${svg('arrow')}</span></a></div></div></section>
    <section class="section"><div class="shell process-grid"><div class="sticky-copy"><p class="eyebrow">Cómo se coordina</p><h2>Datos primero. Trabajo después.</h2><p>Una consulta bien detallada permite evaluar acceso, equipo y alcance sin prometer resultados antes de inspeccionar.</p>${cta(`${svg('wa')}<span>Describir mi caso</span>`, waMessage('otro', '/'), 'button button--wa')}</div><ol class="process-list"><li><span>01</span><div><h3>Contanos la ubicación</h3><p>Ciudad, barrio, referencias de acceso y si puede ingresar un camión o equipo de perforación.</p></div></li><li><span>02</span><div><h3>Identificamos el servicio</h3><p>Perforación, desagüe, mantenimiento, sistema séptico o tratamiento de agua.</p></div></li><li><span>03</span><div><h3>Confirmamos alcance y costo</h3><p>El operador valida disponibilidad, visita, tarifa, materiales y condiciones antes de comenzar.</p></div></li><li><span>04</span><div><h3>Ejecutamos y verificamos</h3><p>El cierre debe incluir revisión del trabajo y recomendaciones de uso o mantenimiento.</p></div></li></ol></div></section>
    <section class="section section--sand"><div class="shell"><div class="section-heading"><div><p class="eyebrow">Cómo se cotiza</p><h2>Un presupuesto según el trabajo real</h2></div><p>La perforación se calcula por profundidad y tipo de suelo; el desagüe considera viaje, ubicación, acceso y urgencia. Consultá el precio actualizado antes de coordinar.</p></div><div class="table-wrap"><table><thead><tr><th>Concepto</th><th>Unidad</th><th>Precio</th></tr></thead><tbody>${priceRows()}</tbody></table></div><p class="table-note">La profundidad, el suelo, el acceso y los materiales pueden modificar el presupuesto final.</p></div></section>
    <section class="section"><div class="shell coverage-grid"><div><p class="eyebrow">Cobertura declarada</p><h2>Asunción y Gran Asunción</h2><p>Coordinación en ${areas.join(', ')}.</p><div class="place-cloud">${areas.map((area) => `<span>${area}</span>`).join('')}</div></div><div class="coverage-card"><h3>Barrios de Asunción</h3><p>${barrios.join(', ')}.</p><hr><h3>Horario</h3><p>${SITE.hoursText}</p><a class="arrow-link" href="/contacto/">Ver contacto y cobertura <span>→</span></a></div></div></section>
    <section class="section section--faq"><div class="shell faq-grid"><div><p class="eyebrow">Preguntas frecuentes</p><h2>Antes de perforar o desagotar</h2><p>Respuestas claras, sin presentar precios, potabilidad o disponibilidad como hechos no confirmados.</p></div>${faqBlock(faqs)}</div></section>
    <section class="closing-cta"><div class="shell"><p class="eyebrow eyebrow--light">Contanos el problema y la zona</p><h2>Empecemos por una evaluación clara.</h2><div class="closing-cta__actions">${cta(`${svg('wa')}<span>Consultar por WhatsApp</span>`, waMessage(null, '/'), 'button button--wa')}${phoneLink(`Llamar al ${SITE.phoneDisplay}`, 'button button--ghost')}</div></div></section>
  </main>`,
};

function genericServicePage(config) {
  const pageFaqs = config.faqs || [];
  const crumbItems = config.crumbs || [['/', 'Inicio'], ['/servicios/', 'Servicios'], [config.path, config.short]];
  const message = waMessage(null, config.path);
  return {
    ...config,
    service: true,
    stickyBar: true,
    faqs: pageFaqs,
    crumbs: crumbItems,
    body: `<main>${breadcrumbs(crumbItems)}${serviceHero(config)}
      <section class="section" id="contenido"><div class="shell article-grid"><article class="prose"><p class="intro">${config.intro}</p>${config.sections.map(([heading, html]) => `<h2>${heading}</h2>${html}`).join('')}${relatedLinks(config.path, Boolean(config.zone))}${relatedGuides(config.path)}${crossLink(config.path)}</article><aside class="side-panel"><p class="eyebrow">Datos para consultar</p><ul>${config.checklist.map((item) => `<li>${item}</li>`).join('')}</ul>${cta(`${svg('wa')}<span>Enviar estos datos</span>`, message, 'button button--wa')}<a class="side-panel__phone" href="tel:${esc(SITE.phoneHref)}">${svg('phone')}<span>${esc(SITE.phoneDisplay)}</span></a><p class="side-note">Sin precios ni disponibilidad automática: el operador confirma cada caso.</p></aside></div></section>
      ${pageFaqs.length ? `<section class="section section--faq"><div class="shell faq-grid"><div><p class="eyebrow">Preguntas frecuentes</p><h2>Lo esencial antes de coordinar</h2></div>${faqBlock(pageFaqs)}</div></section>` : ''}
      <section class="closing-cta"><div class="shell"><p class="eyebrow eyebrow--light">${config.short}</p><h2>${config.ctaTitle}</h2><div class="closing-cta__actions">${cta(`${svg('wa')}<span>Consultar ahora</span>`, message, 'button button--wa')}${phoneLink(`Llamar al ${SITE.phoneDisplay}`, 'button button--ghost')}</div></div></section>
    </main>`,
  };
}

const pages = [home];

const servicesPage = {
  path: '/servicios/', short: 'Servicios', collection: true,
  title: 'Servicios de pozos y desagüe | Pozo.com.py',
  description: 'Servicios de pozos artesianos, pozos ciegos, desagüe, sistemas sépticos y tratamiento de agua en Gran Asunción.',
  h1: 'Servicios de pozos, desagüe y agua',
  image: 'desague-pozo-ciego-camion.webp',
  crumbs: [['/', 'Inicio'], ['/servicios/', 'Servicios']],
  body: `<main>${breadcrumbs([['/', 'Inicio'], ['/servicios/', 'Servicios']])}<section class="services-hero"><div class="shell"><p class="eyebrow eyebrow--light">Asunción y Gran Asunción</p><h1>Servicios de pozos, desagüe y agua</h1><p>Encontrá el servicio según tu proyecto o problema. Cada trabajo se confirma por ubicación, acceso, alcance y disponibilidad.</p><div class="hero-actions">${cta(`${svg('wa')}<span>Consultar por WhatsApp</span>`, waMessage(null, '/servicios/'), 'button button--wa')}${phoneLink(`Llamar al ${SITE.phoneDisplay}`, 'button button--ghost')}</div></div></section><section class="section" id="contenido"><div class="shell"><div class="section-heading"><div><p class="eyebrow">Todos los servicios</p><h2>Una ruta clara para cada necesidad</h2></div><p>Las páginas separan perforación, saneamiento y calidad de agua para responder mejor cada búsqueda y consulta.</p></div><div class="service-grid service-grid--overview">${services.map((service) => `<article class="service-card reveal"><a class="service-card__image" href="${service.href}"><img src="/assets/images/${service.image}" alt="${service.alt}" width="800" height="800" loading="lazy"><span>Imagen ilustrativa</span></a><div><h2><a href="${service.href}">${service.label}</a></h2><p>${service.text}</p><a class="arrow-link" href="${service.href}">Ver detalles <span>→</span></a></div></article>`).join('')}</div></div></section><section class="section section--sand"><div class="shell services-support"><div><p class="eyebrow">Herramienta</p><h2>Calculá el alcance de un pozo artesiano</h2><p>Indicá profundidad, suelo y componentes. El cálculo prepara la solicitud sin mostrar cifras hasta cargar tarifas verificadas.</p><a class="button button--outline" href="/servicios/precio-pozo/">Abrir calculadora</a></div><div><p class="eyebrow">Cobertura local</p><h2>Desagüe por zona</h2><p>Información específica para coordinar acceso y urgencias en San Lorenzo y Mariano Roque Alonso.</p><a class="arrow-link" href="/zonas/san-lorenzo/">San Lorenzo <span>→</span></a><br><a class="arrow-link" href="/zonas/mra/">Mariano Roque Alonso <span>→</span></a></div></div></section><section class="closing-cta"><div class="shell"><p class="eyebrow eyebrow--light">¿No sabés cuál elegir?</p><h2>Contanos el problema y la ubicación.</h2><div><div class="closing-cta__actions">${cta(`${svg('wa')}<span>Pedir orientación</span>`, waMessage('otro', '/servicios/'), 'button button--wa')}${phoneLink(`Llamar al ${SITE.phoneDisplay}`, 'button button--ghost')}</div></div></div></section></main>`,
};
pages.push(servicesPage);

pages.push(genericServicePage({
  path: '/servicios/artesiano/', short: 'Pozos artesianos', eyebrow: 'Perforación · Gran Asunción',
  title: 'Pozos artesianos en Paraguay | Pozo.com.py', description: 'Perforación de pozos artesianos con entubado, filtro, bomba y tablero en Asunción y Gran Asunción.',
  h1: 'Pozos artesianos en Paraguay', lead: 'Planificación y perforación con entubado, filtro, bomba y tablero según el suelo, el caudal buscado y la profundidad.', image: 'pozo-artesiano-servicio.webp', alt: 'Ilustración de dos operarios con casco junto a una perforadora, con agua saliendo del pozo y conos de señalización',
  intro: 'Un pozo artesiano no se cotiza solamente por “hacer un agujero”. El proyecto combina perforación, entubado, zona filtrante, desarrollo, bomba, conducción y protección eléctrica. En Gran Asunción se informan profundidades típicas de 30 a 120 metros, aunque la profundidad útil depende de la geología y de lo que se encuentre durante el trabajo.',
  sections: [
    ['Qué incluye el alcance', '<p>La perforación abre el diámetro necesario; el entubado protege la estructura; el filtro permite el ingreso de agua reduciendo sólidos; y la bomba impulsa el caudal hacia el sistema de almacenamiento. El tablero protege y controla el equipo. Cada componente debe dimensionarse en conjunto.</p><div class="content-cards"><div><strong>Perforación</strong><span>Suelo de tierra, mixto o roca</span></div><div><strong>Terminación</strong><span>Entubado y filtro</span></div><div><strong>Impulsión</strong><span>Bomba y tablero</span></div></div>'],
    ['Antes de perforar', '<p>Se debe verificar el acceso del equipo, el espacio de maniobra, las instalaciones enterradas, la ubicación propuesta y el destino del agua. También conviene definir si será para vivienda, riego, comercio u obra, porque el consumo esperado influye en bomba, tanque y distribución.</p>'],
    ['Calidad y potabilidad', '<p>Encontrar agua no equivale a demostrar que sea potable. Después de la terminación y limpieza del pozo, un análisis físico-químico y microbiológico permite decidir si hace falta desinfección, filtrado o tratamiento específico. No recomendamos consumir el agua basándose solamente en su color u olor.</p>'],
    ['Cómo se calcula el precio', '<p>La tarifa combina metros perforados (con entubado y engravado), la instalación completa con bomba y tablero, y los trabajos complementarios. Los valores de referencia están en la calculadora; el suelo de roca y los trabajos especiales se cotizan aparte.</p><p><a class="arrow-link" href="/servicios/precio-pozo/">Abrir calculadora de alcance <span>→</span></a></p>'],
    ['El acceso cambia mucho de un terreno a otro', '<p>No es lo mismo entrar con el equipo a un lote despejado en Capiatá que trabajar detrás de una vivienda en Villa Morra o Recoleta. Un portón angosto, cables bajos, árboles, pisos terminados o poco espacio para maniobrar pueden cambiar la forma de encarar el trabajo. Por eso pedimos ubicación y fotos antes de hablar de fechas.</p><p>También ayuda saber dónde quedarán el tanque, la bomba y la alimentación eléctrica. Resolver esos puntos desde el comienzo evita improvisar conexiones cuando la perforación ya está terminada.</p>'],
  ],
  checklist: ['Ciudad y barrio', 'Uso previsto del agua', 'Acceso para el equipo', 'Profundidad estimada, si existe estudio', 'Fotos o video del terreno'],
  ctaTitle: 'Planificá la perforación con los datos correctos.',
  faqs: [['¿Qué profundidad puede necesitar un pozo?', 'En Gran Asunción se informan como típicos 30 a 120 m, pero no es una garantía. La geología y el punto de perforación determinan el resultado.'], ['¿La bomba está incluida?', 'Se cotiza como componente separado o dentro de un alcance integral, según la propuesta real del operador. La potencia depende de profundidad, caudal y uso.'], ['¿Cuánto tarda la perforación?', 'No damos un plazo fijo sin conocer acceso, profundidad y tipo de suelo. El operador confirma una estimación después de revisar los datos del terreno.']],
}));

const calculatorPage = {
  path: '/servicios/precio-pozo/', short: 'Precio por metro', eyebrow: 'Estimación de referencia',
  title: 'Precio de pozo artesiano por metro | Pozo.com.py', description: 'Calculadora de alcance para pozo artesiano por profundidad, suelo, entubado, filtro, bomba y tablero. Solicitá cotización.',
  h1: 'Precio de pozo artesiano por metro', image: 'bomba-pozo-artesiano.webp', service: true,
  crumbs: [['/', 'Inicio'], ['/servicios/', 'Servicios'], ['/servicios/artesiano/', 'Pozos artesianos'], ['/servicios/precio-pozo/', 'Precio por metro']],
  body: `<main>${breadcrumbs([['/', 'Inicio'], ['/servicios/', 'Servicios'], ['/servicios/artesiano/', 'Pozos artesianos'], ['/servicios/precio-pozo/', 'Precio por metro']])}${serviceHero({eyebrow:'Calculadora de alcance', h1:'Precio de pozo artesiano por metro', lead:'Calculá un precio de referencia en guaraníes según profundidad y suelo. El operador confirma el valor final.', image:'bomba-pozo-artesiano.webp', alt:'Ilustración de una bomba, un tanque de presión y un tablero eléctrico en un cuarto técnico', path:'/servicios/precio-pozo/', short:'Precio por metro'})}
    <section class="section" id="contenido"><div class="shell calculator-grid"><form class="calculator" id="well-calculator"><div class="field"><label for="depth">Profundidad estimada</label><div class="input-suffix"><input id="depth" name="depth" type="number" min="10" max="300" step="1" value="${CALC_DEFAULT_DEPTH}" required><span>metros</span></div></div><div class="field"><label for="soil">Tipo de suelo esperado</label><select id="soil" name="soil"><option value="tierra">Tierra</option><option value="mixto">Mixto</option><option value="roca">Roca</option><option value="desconocido">No sé</option></select></div><fieldset><legend>Qué incluir</legend><p class="form-note">La perforación siempre incluye entubado y engravado.</p><label class="check"><input type="checkbox" name="install" checked> Instalación completa: bomba 1 hp, tablero, tanque hidroneumático y cañerías</label></fieldset><p class="calc-live"><span aria-hidden="true">↻</span> El precio se actualiza solo cuando cambiás los datos.</p></form><div class="estimate" id="estimate" data-rates='${RATES_JSON}' data-wa-base="${esc(whatsappLink(''))}" data-wa-template="${esc(CALCULATOR_TEMPLATE)}"><div id="estimate-result" aria-live="polite">${(() => { const e = calculatorEstimate(CALC_DEFAULT_DEPTH, true); return `<p class="eyebrow">Estimación inicial</p><h2>${CALC_DEFAULT_DEPTH} metros · suelo de tierra</h2><ul><li><span>Perforación con entubado y engravado</span><strong>${formatGs(e.drilling)}</strong></li><li><span>Instalación completa</span><strong>${formatGs(e.kit)}</strong></li></ul><div class="estimate-total"><span>Estimado</span><strong>${formatGs(e.total)}</strong></div><p>Precio de referencia. Si hace falta perforar 20 m más, suma ${formatGs(e.extra20)}. El operador confirma el valor final al revisar suelo, profundidad y acceso.</p>`; })()}<div class="estimate-actions"><button class="button button--outline" id="copy-estimate" type="button">Copiar solicitud</button>${cta(`${svg('wa')}<span>Enviar por WhatsApp</span>`, waMessage('precio', '/servicios/precio-pozo/'), 'button button--wa')}</div></div>${(() => { const e = calculatorEstimate(CALC_DEFAULT_DEPTH, true); return calculatorLeadForm(CALC_DEFAULT_DEPTH, e.total); })()}<details class="included-toggle" id="included-toggle"><summary><span class="included-toggle__icon" aria-hidden="true">✓</span><span>Ver todo lo que incluye</span><span class="included-toggle__chev" aria-hidden="true"></span></summary><div class="included-cols">${includedColumns()}</div></details></div></div></section>
    <section class="section" id="incluye"><div class="shell"><div class="section-heading"><div><p class="eyebrow">Todo incluido</p><h2>Qué incluye el precio</h2></div><p>Sin sorpresas: esto es lo que trae el pozo terminado y funcionando.</p></div><div class="included-card included-cols">${includedColumns()}</div><p class="table-note">La profundidad real, el tipo de suelo y el acceso pueden modificar el valor final. El operador lo confirma antes de empezar.</p></div></section><section class="section section--sand"><div class="shell"><div class="section-heading"><div><p class="eyebrow">Conceptos del presupuesto</p><h2>Qué incluye la cotización</h2></div><p>Confirmamos cada componente de forma separada para que puedas comparar perforación, entubado, filtro, bomba y tablero.</p></div><div class="table-wrap"><table><thead><tr><th>Concepto</th><th>Unidad</th><th>Precio</th></tr></thead><tbody>${priceRows()}</tbody></table></div><div class="prose">${relatedLinks('/servicios/precio-pozo/', false)}${relatedGuides('/servicios/precio-pozo/')}${crossLink('/servicios/precio-pozo/')}</div></div></section>
    <section class="closing-cta"><div class="shell"><p class="eyebrow eyebrow--light">Pozo artesiano</p><h2>Compartí profundidad, suelo y ubicación.</h2><div><div class="closing-cta__actions">${cta(`${svg('wa')}<span>Pedir cotización</span>`, waMessage('precio', '/servicios/precio-pozo/'), 'button button--wa')}${phoneLink(`Llamar al ${SITE.phoneDisplay}`, 'button button--ghost')}</div></div></div></section></main>`,
};
pages.push(calculatorPage);

pages.push(genericServicePage({
  path: '/servicios/pozo-ciego/', short: 'Pozos ciegos', eyebrow: 'Construcción · Mantenimiento · Desagüe', title: 'Pozos ciegos en Asunción | Pozo.com.py', description: 'Construcción, mantenimiento y desagüe de pozos ciegos en Asunción y Gran Asunción.', h1: 'Pozos ciegos: construcción y mantenimiento', lead: 'Orientación para dimensionar, mantener y desagotar el sistema según uso, suelo, acceso y estado actual.', image: 'pozo-septico-instalacion.webp', alt: 'Ilustración de una cámara de hormigón con tapas y cañerías, colocada en una excavación de tierra roja',
  intro: 'El pozo ciego recibe efluentes y permite su infiltración en el terreno. Su desempeño depende del suelo, la carga diaria, la separación de sólidos y el mantenimiento. Cuando se llena con frecuencia, hay olor o aparece humedad alrededor, el problema puede ser de capacidad, saturación o ingreso excesivo de agua, no solamente falta de vaciado.',
  sections: [['Construcción y ubicación', '<p>Antes de construir se revisan dimensiones, nivel del terreno, acceso para mantenimiento y distancias de seguridad respecto de fuentes de agua y estructuras. La solución debe ajustarse a las condiciones del inmueble y a la normativa municipal o sanitaria aplicable.</p>'], ['Mantenimiento preventivo', '<p>No conviene esperar al rebalse. Registrar la frecuencia de uso, evitar arrojar sólidos, grasas o químicos y revisar tapas, ventilación y cañerías ayuda a detectar problemas antes de una urgencia. La periodicidad de desagüe depende del tamaño y del uso real.</p>'], ['Cuándo pedir un desagüe', '<p>Señales frecuentes: drenajes lentos en varios puntos, gorgoteos, olor persistente, humedad cerca del pozo o retorno de efluentes. Ante rebalse, reducí el consumo de agua y evitá el contacto con el líquido hasta coordinar atención.</p>'], ['¿Conviene cambiar a sistema séptico?', '<p>En algunos casos una cámara séptica o biodigestor mejora el tratamiento primario antes de la disposición. No existe una respuesta universal: hay que evaluar espacio, suelo, carga, mantenimiento y requisitos locales.</p>'], ['Cuando la frecuencia empieza a cambiar', '<p>Muchas consultas aparecen porque un pozo que antes duraba bastante tiempo ahora necesita desagüe cada vez más seguido. Ese cambio importa. Puede coincidir con más personas en la vivienda, una pérdida de agua, ingreso de lluvia o menor capacidad de infiltración.</p><p>Anotá las fechas de los últimos servicios y contanos si cambió el uso del inmueble. Ese dato sencillo suele ser más útil que intentar calcular el volumen mirando solamente la tapa.</p>']],
  checklist: ['Ciudad y barrio', 'Cantidad de usuarios', 'Fecha del último desagüe', 'Síntomas observados', 'Acceso para camión'], ctaTitle: 'Revisá el sistema antes de que el problema crezca.',
  faqs: [['¿Cada cuánto se desagota un pozo ciego?', 'No hay un intervalo único. Depende de capacidad, cantidad de usuarios, infiltración y uso. Un aumento brusco de frecuencia puede indicar saturación o una falla.'], ['¿Se puede construir encima del pozo?', 'No conviene planificar una construcción sin revisar estructura, acceso de mantenimiento y requisitos aplicables. El sistema debe seguir siendo inspeccionable y seguro.']],
}));

pages.push(genericServicePage({
  path: '/servicios/desague/', short: 'Desagüe de pozo ciego', eyebrow: 'Camión atmosférico · Capacidad 8 m³', title: 'Desagüe de pozo ciego en Asunción | Pozo.com.py', description: 'Desagüe de pozo ciego con camión atmosférico de 8 m³ en Asunción y Gran Asunción. Urgencias sujetas a disponibilidad.', h1: 'Desagüe de pozo ciego', lead: 'Coordinación de vaciado con camión atmosférico para viviendas, comercios y propiedades de Gran Asunción.', image: 'desague-pozo-ciego-camion.webp', alt: 'Ilustración de un camión atmosférico blanco con manguera conectada a la tapa abierta de un pozo, junto a una casa',
  leadBox: `<div class="send-strip"><p class="send-strip__label">Qué mandar por WhatsApp</p><ul class="send-strip__chips">${['desague-acceso', 'desague-tapa', 'desague-distancia'].map((id) => `<li><a href="${whatsappLink(waMessage(id, '/servicios/desague/'))}" target="_blank" rel="noopener noreferrer">${esc(TOPICS[id].label)}</a></li>`).join('')}</ul></div>`,
  intro: 'El desagüe extrae el contenido acumulado para recuperar capacidad y permitir una inspección básica del sistema. La capacidad informada del camión es de 8 m³. Antes de enviar el equipo, se confirma la ubicación, el acceso, la distancia de manguera, el volumen estimado y si existe una situación de rebalse.',
  sections: [['Qué informar al coordinar', '<p>Compartí ciudad y barrio, una referencia de acceso, fotos del portón o pasillo y la distancia aproximada entre el punto donde puede estacionar el camión y la tapa del pozo. También indicá si el pozo está rebalsando o si hay riesgo de contacto con personas o animales.</p>'], ['Durante una urgencia', '<p>Reducí duchas, lavado y descarga de inodoros. Mantené a niños y mascotas lejos del área. No ingreses al pozo ni agregues productos químicos: puede haber gases peligrosos y el contacto con efluentes representa un riesgo sanitario.</p>'], ['Qué puede cambiar el precio', '<p>La tarifa se estructura por viaje, pero puede variar por ubicación, acceso, distancia, horario, urgencia y volumen. Compartí esos datos para recibir el monto correspondiente antes de confirmar el servicio.</p>'], ['Después del vaciado', '<p>Si el pozo vuelve a llenarse demasiado rápido, conviene investigar infiltración deficiente, ingreso de agua de lluvia, cañerías con pérdidas, dimensiones insuficientes o necesidad de mejorar el tratamiento. Vaciado frecuente no resuelve una falla estructural.</p>'], ['Dos fotos ahorran muchas idas y vueltas', '<p>Una foto del acceso desde la calle y otra de la tapa, tomadas sin abrir el pozo, ayudan a preparar la visita. En calles angostas de Asunción o en propiedades con portón, alero y cables bajos, también necesitamos saber dónde puede quedar estacionado el camión.</p><p>Si no conocés la distancia exacta, contá los pasos desde el portón hasta la tapa. No reemplaza una medición, pero sirve para una primera conversación más concreta.</p>']],
  checklist: ['Ciudad y barrio', '¿Está rebalsando?', 'Distancia desde la calle', 'Ancho y altura del acceso', 'Fecha del último desagüe'], ctaTitle: 'Pasá la ubicación y el estado del pozo.',
  faqs: [['¿Atienden los domingos?', 'Se coordinan urgencias de desagüe también los domingos, sujetas a disponibilidad del equipo y cobertura.'], ['¿Cuánto extrae el camión?', 'La capacidad informada es de 8 m³. El volumen real a extraer y la cantidad de viajes se confirman según el caso.'], ['¿Un viaje siempre alcanza?', 'No se puede asegurar sin conocer el volumen y el estado del sistema. Antes de coordinar se explica la capacidad del camión y cómo se manejaría un volumen mayor.']],
}));

pages.push(genericServicePage({
  path: '/servicios/pozo-lleno/', short: 'Pozo ciego lleno', eyebrow: 'Diagnóstico rápido · Seguridad primero', title: 'Pozo ciego lleno: qué hacer | Pozo.com.py', description: 'Qué hacer si el pozo ciego está lleno, rebalsa, huele mal o drena lento. Guía y desagüe en Gran Asunción.', h1: 'Pozo ciego lleno: señales y qué hacer', lead: 'Una guía práctica para reducir el riesgo, identificar la urgencia y compartir los datos necesarios al pedir ayuda.', image: 'pozo-ciego-lleno-inspeccion.webp', alt: 'Ilustración de un técnico con tableta junto a la tapa de un pozo ciego y tierra húmeda alrededor',
  intro: 'Un drenaje lento aislado puede ser una cañería; varios drenajes lentos, gorgoteos, olor y humedad cerca del pozo apuntan a un problema del sistema. Si ya hay retorno de efluentes o rebalse exterior, tratá la situación como urgente y evitá el contacto.',
  leadBox: `<div class="urgent-box"><p class="urgent-box__label">${svg('alert')}<span>Ahora mismo</span></p><ol class="urgent-box__steps"><li>Reducí inmediatamente el uso de agua.</li><li>Aislá el área y mantené lejos a niños y mascotas.</li><li>No abras ni ingreses al pozo.</li><li>No agregues ácidos, solventes ni productos caseros.</li><li>Sacá fotos desde distancia segura del acceso y de la tapa.</li></ol>${cta(`${svg('wa')}<span>Pedir desagüe urgente</span>`, waMessage('lleno', '/servicios/pozo-lleno/'), 'button button--wa urgent-box__action')}</div>`,
  sections: [['Señales que ayudan a diagnosticar', '<p>Indicá cuándo comenzó, si afecta todos los baños o solamente uno, si llovió recientemente, cuándo fue el último desagüe y cuántas personas usan la instalación. Esa secuencia ayuda a separar una obstrucción puntual de un pozo saturado.</p>'], ['Por qué vuelve a llenarse rápido', '<p>Puede existir suelo saturado, nivel freático alto, ingreso de lluvia, pérdida continua, exceso de carga o capacidad insuficiente. También puede faltar tratamiento primario. Si la frecuencia cambió, conviene inspeccionar en vez de repetir el vaciado indefinidamente.</p>'], ['Riesgos que no se deben improvisar', '<p>Los espacios confinados pueden acumular gases peligrosos y tener poco oxígeno. La inspección interna no es una tarea doméstica. El sitio ofrece orientación inicial, pero la evaluación presencial determina el trabajo seguro.</p>'], ['No todo drenaje lento significa pozo lleno', '<p>Si solamente una pileta o un baño descarga mal, puede haber una obstrucción en ese ramal. Cuando el problema aparece al mismo tiempo en varios puntos, se escuchan gorgoteos y además hay olor o humedad cerca del pozo, la sospecha cambia.</p><p>Al escribirnos, contá qué artefacto falló primero y qué pasó después. Es una explicación mucho más útil que decir solamente “no corre el agua”.</p>']],
  checklist: ['Síntoma principal', 'Cuándo comenzó', 'Último desagüe', 'Lluvias o pérdidas recientes', 'Fotos desde distancia segura'], ctaTitle: 'Reducí el uso de agua y coordiná la revisión.',
  faqs: [['¿Puedo vaciarlo por mi cuenta?', 'No es recomendable. Hay exposición a efluentes, gases y riesgo de caída. Se requiere equipo adecuado y manejo seguro.'], ['¿Puedo seguir usando agua mientras espero?', 'Si hay rebalse o retorno, reducí el uso al mínimo para no agravar la situación. Evitá lavar, ducharte o descargar agua innecesariamente.']],
}));

pages.push(genericServicePage({
  path: '/servicios/septico/', short: 'Pozos sépticos', eyebrow: 'Cámaras sépticas · Biodigestores', title: 'Pozos sépticos y biodigestores | Pozo.com.py', description: 'Cámaras sépticas, biodigestores y orientación de saneamiento para propiedades en Asunción y Gran Asunción.', h1: 'Pozos sépticos, cámaras y biodigestores', lead: 'Sistemas para separar sólidos y tratar efluentes antes de su disposición, dimensionados según uso y terreno.', image: 'pozo-septico-instalacion.webp', alt: 'Ilustración de una cámara de hormigón con tapas y cañerías, colocada en una excavación',
  intro: 'Una cámara séptica hace tratamiento primario: retiene sólidos y permite procesos anaeróbicos antes de enviar el efluente a una etapa de disposición. Un biodigestor cumple una función semejante mediante un equipo prefabricado. Ambos requieren dimensionamiento, ventilación, acceso para mantenimiento y una disposición final compatible con el suelo.',
  sections: [['Diferencias básicas', '<p>El pozo ciego se enfoca en acumulación e infiltración. La cámara séptica separa y trata parcialmente antes de la disposición. El biodigestor integra ese tratamiento en un tanque diseñado para el proceso. Ninguno elimina la necesidad de mantenimiento ni convierte automáticamente el efluente en agua segura.</p>'], ['Qué define el tamaño', '<p>La cantidad de usuarios, tipo de inmueble, consumo diario y picos de uso. Una vivienda familiar, un local gastronómico y una obra tienen cargas distintas. También se considera el espacio, la topografía y la posibilidad de ingreso para limpieza futura.</p>'], ['Instalación y acceso', '<p>La ubicación debe permitir inspección y extracción de lodos sin romper pisos o atravesar interiores. Se revisan pendientes, ventilación, conexiones y protección contra ingreso de lluvia. Las distancias y permisos deben confirmarse según municipio y autoridad competente.</p>'], ['Mantenimiento', '<p>No arrojes grasas, pañales, toallitas, solventes ni productos que alteren el proceso. La frecuencia de extracción se define por acumulación real y uso. Olor persistente, retorno o humedad requieren revisión, no solamente aditivos.</p>'], ['Pensá en la próxima limpieza antes de cerrar la obra', '<p>Una tapa escondida bajo un contrapiso o detrás de una ampliación convierte un mantenimiento normal en un problema. En una obra nueva conviene dejar claro por dónde se inspecciona, por dónde se extraen lodos y hasta dónde puede acercarse el camión.</p><p>En sistemas existentes, una foto del patio y un croquis sencillo ayudan a entender qué se puede conservar y qué habría que modificar.</p>']],
  checklist: ['Tipo de propiedad', 'Cantidad de usuarios', 'Espacio disponible', 'Sistema actual', 'Municipio y barrio'], ctaTitle: 'Definí el sistema desde el uso real del inmueble.',
  faqs: [['¿Un biodigestor no necesita mantenimiento?', 'Sí necesita. La frecuencia y el procedimiento dependen del modelo, la carga y las indicaciones técnicas del fabricante.'], ['¿Qué conviene: pozo ciego o sistema séptico?', 'Depende del suelo, el espacio, la cantidad de usuarios y los requisitos locales. Primero se define la carga y después se compara la solución.']],
}));

pages.push(genericServicePage({
  path: '/servicios/agua/', short: 'Tratamiento de agua', eyebrow: 'Análisis · Filtrado · Cloración', title: 'Tratamiento de agua de pozo | Pozo.com.py', description: 'Filtros para sarro, hierro, color y sedimentos, más cloración según análisis del agua de pozo en Paraguay.', h1: 'Tratamiento de agua de pozo', lead: 'Elegí filtrado y desinfección a partir de un análisis, no solamente del aspecto o sabor del agua.', image: 'tratamiento-agua-filtros.webp', alt: 'Ilustración de un equipo de tratamiento de agua con filtro previo, tanque de hierro, tanque de carbón y tanque de presión',
  intro: 'El tratamiento correcto empieza con dos datos: para qué se usará el agua y qué muestra el análisis. Sarro, hierro, color, sedimentos, olor y contaminación microbiológica son problemas distintos. Un solo filtro no resuelve todo, y el agua transparente no necesariamente es potable.',
  sections: [['Sarro y dureza', '<p>La dureza se relaciona con calcio y magnesio. Puede generar incrustaciones en griferías, termocalefones y cañerías. El equipo se dimensiona según concentración, caudal y consumo; no conviene elegirlo solamente por el diámetro de la conexión.</p>'], ['Hierro, color y sedimentos', '<p>El hierro puede manchar y generar sabor u olor; los sedimentos requieren etapas de retención acordes a su tamaño y carga. En algunos casos se combina oxidación, filtrado y carbón activado. La secuencia depende del análisis.</p>'], ['Cloración y microbiología', '<p>La desinfección busca controlar microorganismos. La dosis, tiempo de contacto y verificación deben definirse técnicamente. Instalar un filtro mecánico no reemplaza la desinfección cuando existe contaminación microbiológica.</p>'], ['Mantenimiento del sistema', '<p>Todos los equipos tienen consumibles, retrolavado, limpieza o recambio. Antes de comprar, pedí frecuencia estimada, disponibilidad de repuestos y costo de mantenimiento. Un sistema sin mantenimiento pierde desempeño.</p><figure class="content-image"><img src="/assets/images/analisis-calidad-agua.webp" alt="Ilustración de un técnico de laboratorio con guantes tomando una muestra de agua de un frasco" width="1024" height="1024" loading="lazy"><figcaption>Imagen ilustrativa: el análisis debe realizarlo un laboratorio competente.</figcaption></figure>'], ['No compres un filtro solamente por el síntoma', '<p>“Tiene gusto”, “deja sarro” o “sale amarillenta” son buenos puntos de partida, pero no alcanzan para elegir un equipo. Dos aguas que se ven parecidas pueden necesitar tratamientos distintos. También importa cuántos litros se usan y cuál es el caudal máximo de la casa o el comercio.</p><p>Si ya tenés un análisis, mandá una foto completa del informe. Si todavía no lo hiciste, primero definimos qué parámetros conviene medir según el uso que tendrá el agua.</p>']],
  checklist: ['Uso del agua', 'Resultado de análisis, si existe', 'Síntoma: sarro, hierro, color u olor', 'Consumo diario estimado', 'Fotos del sistema actual'], ctaTitle: 'Compartí el análisis o el problema observado.',
  faqs: [['¿Un filtro vuelve potable el agua?', 'No necesariamente. La potabilidad se confirma mediante análisis y depende de que el tratamiento sea adecuado y esté mantenido.'], ['¿Necesito un análisis antes de consultar?', 'Podés hacer una consulta inicial sin análisis, pero no conviene definir el tratamiento final solamente por color, olor o sabor.']],
}));

function locationPage({ path, city, short, nearby, title, description, h1, local = [], faqs: zoneFaqs = [] }) {
  return genericServicePage({
    path, short: short || `Desagüe en ${city}`, zone: city, eyebrow: `${city} · Servicio por zona`, title, description: description || `Desagüe de pozo ciego con camión atmosférico de 8 m³ en ${city}. Consultá acceso, disponibilidad y tarifa.`, h1: h1 || `Desagüe de pozo ciego en ${city}`, lead: `Coordinación por barrio, acceso y urgencia para viviendas, comercios y propiedades de ${city}.`, image: 'desague-pozo-ciego-camion.webp', alt: `Ilustración de un camión atmosférico blanco con manguera conectada a la tapa abierta de un pozo, junto a una casa`,
    crumbs: [['/', 'Inicio'], ['/servicios/', 'Servicios'], ['/servicios/desague/', 'Desagüe'], [path, short || `Desagüe en ${city}`]],
    intro: `Para coordinar un desagüe en ${city}, el dato más importante es el acceso real al pozo. La capacidad informada del camión es de 8 m³, pero antes de confirmar un viaje se revisan el barrio, la distancia desde la calle, el ancho y altura de ingreso, el estado del pozo y si existe rebalse. Con esos datos se confirma disponibilidad y precio.`,
    sections: [...local, ['Cobertura y referencias', `<p>La atención se coordina en ${city} y zonas cercanas como ${nearby}. Compartí ubicación por mapa, barrio y una referencia visible. La cobertura final depende de disponibilidad y logística del día.</p>`], ['Prepará el acceso', '<p>La tapa debe poder localizarse sin ingresar a áreas inseguras. Retirá vehículos u objetos que bloqueen el paso, pero no abras el pozo ni manipules efluentes. Si el camión queda en la calle, indicá la distancia aproximada hasta el punto de extracción.</p>'], ['Si está rebalsando', '<p>Reducí el uso de agua, aislá el área y mantené lejos a niños y animales. Informá si el rebalse llegó a patios, baños o desagües. No mezcles químicos: pueden generar gases y complicar la operación.</p>'], ['Después del servicio', '<p>Registrá la fecha y observá cuánto tarda en repetirse el problema. Si el intervalo es cada vez más corto, puede existir saturación del suelo, entrada de lluvia, pérdidas o capacidad insuficiente. En ese caso conviene una revisión más amplia del sistema.</p>']],
    checklist: [`Barrio de ${city}`, 'Ubicación por mapa', 'Distancia desde calle', '¿Hay rebalse?', 'Último desagüe'], ctaTitle: `Coordiná el desagüe en ${city} con ubicación y acceso.`,
    faqs: [...zoneFaqs, ['¿El precio es fijo para toda la ciudad?', 'No. Se confirma por viaje, acceso, distancia, horario y urgencia antes de coordinar el servicio.']],
  });
}

for (const zone of ZONES) pages.push(locationPage(zone));

const zonasFaqs = [
  ['¿Cómo sé si llegan a mi barrio?', 'Mandá la ubicación por mapa o el barrio con una referencia. La cobertura se confirma según la logística del día, el acceso y el tipo de trabajo antes de coordinar.'],
  ['¿La distancia cambia el presupuesto?', 'Puede cambiarlo. En el desagüe se considera el viaje, el acceso y la distancia de manguera; en una perforación, el traslado y la maniobra del equipo. Todo se confirma antes de empezar.'],
  ['¿Atienden fuera de Gran Asunción?', 'La cobertura declarada es Asunción y Gran Asunción. Para otra ciudad, escribinos con la ubicación y el trabajo, y te confirmamos si es posible.'],
];
const zonasPage = {
  path: '/zonas/', short: 'Zonas', collection: true,
  title: 'Zonas de cobertura en Gran Asunción | Pozo.com.py',
  description: 'Zonas donde se coordina desagüe de pozo ciego y pozos artesianos en Asunción y Gran Asunción.',
  h1: 'Zonas de cobertura',
  image: 'desague-pozo-ciego-camion.webp',
  crumbs: [['/', 'Inicio'], ['/zonas/', 'Zonas']],
  itemList: ZONES.map((zone) => [zone.path, zone.short]),
  faqs: zonasFaqs,
  body: `<main>${breadcrumbs([['/', 'Inicio'], ['/zonas/', 'Zonas']])}<section class="services-hero"><div class="shell"><p class="eyebrow eyebrow--light">Asunción y Gran Asunción</p><h1>Zonas de cobertura</h1><p>Se coordina en ${areas.join(', ')}. La cobertura final depende de disponibilidad y logística del día.</p><div class="hero-actions">${cta(`${svg('wa')}<span>Consultar por WhatsApp</span>`, waMessage(null, '/zonas/'), 'button button--wa')}${phoneLink(`Llamar al ${SITE.phoneDisplay}`, 'button button--ghost')}</div></div></section>
    <section class="section" id="contenido"><div class="shell"><div class="section-heading"><div><p class="eyebrow">Páginas por zona</p><h2>Información local de desagüe</h2></div><p>Acceso, urgencias y preparación del pozo en cada zona.</p></div><div class="zone-grid">${ZONES.map((zone) => `<a class="zone-card reveal" href="${zone.path}"><strong>${esc(zone.short)}</strong><span>También cerca: ${esc(zone.nearby)}</span><span class="zone-card__arrow" aria-hidden="true">${svg('arrow')}</span></a>`).join('')}</div></div></section>
    <section class="section section--sand"><div class="shell coverage-grid"><div><p class="eyebrow">Ciudades</p><h2>Dónde se coordina cada servicio</h2><p>En todas las ciudades de la lista se coordinan <a href="/servicios/desague/">desagüe con camión atmosférico</a>, <a href="/servicios/pozo-ciego/">pozos ciegos</a>, <a href="/servicios/artesiano/">pozos artesianos</a> y <a href="/servicios/agua/">tratamiento de agua</a>. Lo que cambia de una zona a otra es el acceso: calles angostas, portones, cables bajos o lotes con poco espacio de maniobra.</p><div class="place-cloud">${areas.map((area) => `<span>${area}</span>`).join('')}</div></div><div class="coverage-card"><h3>Para confirmar si llegamos</h3><ol class="plain-steps"><li>Ubicación por mapa o barrio con una referencia.</li><li>Foto del acceso desde la calle.</li><li>Qué necesitás y para cuándo.</li></ol><hr><h3>Horario</h3><p>${SITE.hoursText}</p></div></div></section>
    <section class="section section--faq"><div class="shell faq-grid"><div><p class="eyebrow">Preguntas frecuentes</p><h2>Cobertura y traslados</h2></div>${faqBlock(zonasFaqs)}</div></section>
    <section class="closing-cta"><div class="shell"><p class="eyebrow eyebrow--light">¿Tu barrio no está en la lista?</p><h2>Escribinos con la ubicación y confirmamos si llegamos.</h2><div class="closing-cta__actions">${cta(`${svg('wa')}<span>Consultar mi zona</span>`, waMessage(null, '/zonas/'), 'button button--wa')}${phoneLink(`Llamar al ${SITE.phoneDisplay}`, 'button button--ghost')}</div></div></section></main>`,
};
pages.push(zonasPage);

// --- Guides (content/guides.mjs) ------------------------------------------------
const serviceLabel = (path) => services.find((service) => service.href === path)?.label || PAGES[path]?.label || path;

function guidePage(guide) {
  const path = guidePath(guide);
  const short = guide.short || guide.h1;
  const crumbItems = [['/', 'Inicio'], [GUIDE_HUB, 'Guías'], [path, short]];
  const message = waMessage(null, path);
  const toc = `<nav class="toc" aria-labelledby="toc-title"><p class="toc__title" id="toc-title">En esta guía</p><ol>${guide.sections.map(([heading]) => `<li><a href="#${anchorId(heading)}">${heading}</a></li>`).join('')}${guide.faqs?.length ? '<li><a href="#preguntas-frecuentes">Preguntas frecuentes</a></li>' : ''}</ol></nav>`;
  const figure = guide.image ? `<figure class="content-image"><img src="/assets/images/${guide.image}" alt="${esc(guide.alt)}" width="1200" height="675" loading="lazy"><figcaption>Imagen ilustrativa</figcaption></figure>` : '';
  const relatedServices = `<div class="related-services"><h2 id="servicios-relacionados">Servicios relacionados</h2><ul>${guide.relatedServices.map((href) => `<li><a class="arrow-link" href="${href}">${esc(serviceLabel(href))} <span aria-hidden="true">→</span></a></li>`).join('')}</ul></div>`;
  return {
    path, short, title: guide.title, description: guide.description, h1: guide.h1,
    image: guide.image, article: { published: guide.published, updated: guide.updated },
    faqs: guide.faqs || [], crumbs: crumbItems, stickyBar: true,
    body: `<main>${breadcrumbs(crumbItems)}<section class="services-hero guide-hero"><div class="shell"><p class="eyebrow eyebrow--light">Guía</p><h1>${guide.h1}</h1><p>${guide.lead}</p><div class="hero-actions">${cta(`${svg('wa')}<span>Consultar por WhatsApp</span>`, message, 'button button--wa')}${phoneLink(`Llamar al ${SITE.phoneDisplay}`, 'button button--ghost')}</div></div></section>
      <section class="section" id="contenido"><div class="shell article-grid"><article class="prose"><p class="intro">${guide.intro}</p>${toc}${figure}${guide.sections.map(([heading, html]) => `<h2 id="${anchorId(heading)}">${heading}</h2>${html}`).join('')}${relatedServices}</article><aside class="side-panel"><p class="eyebrow">¿Necesitás ayuda?</p><p class="side-note">Mandanos la ubicación y, si ayudan, fotos tomadas desde un lugar seguro. El operador confirma cada caso.</p>${cta(`${svg('wa')}<span>Escribir por WhatsApp</span>`, message, 'button button--wa')}<a class="side-panel__phone" href="tel:${esc(SITE.phoneHref)}">${svg('phone')}<span>${esc(SITE.phoneDisplay)}</span></a></aside></div></section>
      ${guide.faqs?.length ? `<section class="section section--faq" id="preguntas-frecuentes"><div class="shell faq-grid"><div><p class="eyebrow">Preguntas frecuentes</p><h2>Dudas sobre este tema</h2></div>${faqBlock(guide.faqs)}</div></section>` : ''}
      <section class="closing-cta"><div class="shell"><p class="eyebrow eyebrow--light">${esc(short)}</p><h2>Contanos tu caso y la zona.</h2><div class="closing-cta__actions">${cta(`${svg('wa')}<span>Consultar ahora</span>`, message, 'button button--wa')}${phoneLink(`Llamar al ${SITE.phoneDisplay}`, 'button button--ghost')}</div></div></section>
    </main>`,
  };
}

for (const guide of PUBLISHED_GUIDES) pages.push(guidePage(guide));

// The hub exists only once at least one guide is published (no empty page).
if (HAS_GUIDE_HUB) {
  const hubCrumbs = [['/', 'Inicio'], [GUIDE_HUB, 'Guías']];
  pages.push({
    path: GUIDE_HUB, short: 'Guías', collection: true,
    title: 'Guías sobre pozos, desagüe y agua | Pozo.com.py',
    description: 'Guías prácticas sobre pozos artesianos, pozos ciegos, desagüe y agua de pozo en Asunción y Gran Asunción.',
    h1: 'Guías sobre pozos, desagüe y agua',
    crumbs: hubCrumbs,
    itemList: PUBLISHED_GUIDES.map((guide) => [guidePath(guide), guide.h1]),
    body: `<main>${breadcrumbs(hubCrumbs)}<section class="services-hero"><div class="shell"><p class="eyebrow eyebrow--light">Guías</p><h1>Guías sobre pozos, desagüe y agua</h1><p>Respuestas prácticas para preparar una consulta, entender el problema y saber qué datos mandar.</p><div class="hero-actions">${cta(`${svg('wa')}<span>Consultar por WhatsApp</span>`, waMessage(null, GUIDE_HUB), 'button button--wa')}${phoneLink(`Llamar al ${SITE.phoneDisplay}`, 'button button--ghost')}</div></div></section>
      <section class="section" id="contenido"><div class="shell"><div class="zone-grid">${PUBLISHED_GUIDES.map((guide) => `<a class="zone-card reveal" href="${guidePath(guide)}"><strong>${esc(guide.h1)}</strong><span>${esc(guide.description)}</span><span class="zone-card__arrow" aria-hidden="true">${svg('arrow')}</span></a>`).join('')}</div></div></section>
      <section class="closing-cta"><div class="shell"><p class="eyebrow eyebrow--light">¿No encontraste tu caso?</p><h2>Contanos el problema y la ubicación.</h2><div class="closing-cta__actions">${cta(`${svg('wa')}<span>Pedir orientación</span>`, waMessage('otro', GUIDE_HUB), 'button button--wa')}${phoneLink(`Llamar al ${SITE.phoneDisplay}`, 'button button--ghost')}</div></div></section></main>`,
  });
}

const contactPage = {
  path: '/contacto/', short: 'Contacto', title: 'Contacto y cobertura | Pozo.com.py', description: 'Consultá por pozos artesianos, desagüe y sistemas sépticos en Asunción y Gran Asunción.', h1: 'Contacto y cobertura', crumbs: [['/', 'Inicio'], ['/contacto/', 'Contacto']],
  body: `<main>${breadcrumbs([['/', 'Inicio'], ['/contacto/', 'Contacto']])}
    <section class="contact-hero"><div class="shell"><p class="eyebrow eyebrow--light">Asunción · Gran Asunción</p><h1>Contanos qué necesitás y dónde.</h1><p>Con ubicación, fotos seguras y acceso podemos orientar la consulta antes de coordinar.</p></div></section>
    ${trustBar()}
    <section class="section"><div class="shell contact-grid">
      <div class="contact-channels">
        <p class="eyebrow">Escribir ahora</p>
        <h2>Elegí el caso y seguí en WhatsApp</h2>
        <ul class="contact-option-list">${LAUNCHER_TOPICS.map((id) => [id, TOPICS[id]]).map(([id, option]) => `<li><a class="contact-option${option.urgent ? ' contact-option--urgent' : ''}" href="${whatsappLink(waMessage(id, '/contacto/'))}" target="_blank" rel="noopener noreferrer"><span class="contact-option__icon">${svg(option.urgent ? 'alert' : 'wa')}</span><span class="contact-option__text"><strong>${esc(option.label)}</strong><span>${esc(option.hint)}</span></span><span class="contact-option__arrow" aria-hidden="true">${svg('arrow')}</span></a></li>`).join('')}</ul>
        <div class="contact-direct"><a class="contact-direct__phone" href="tel:${esc(SITE.phoneHref)}">${svg('phone')}<span>Llamar al ${esc(SITE.phoneDisplay)}</span></a><p class="contact-direct__hours">${SITE.hoursText}</p></div>
      </div>
      <div class="contact-form-block">
        <p class="eyebrow">Solicitá contacto</p>
        <h2>Datos para responderte mejor</h2>
        <p class="contact-form-block__lead">Enviá tu teléfono, servicio y ubicación. Registramos la solicitud y después abrimos WhatsApp con el mensaje preparado.</p>
        <form class="lead-form" id="lead-form" action="/contacto.php" method="POST"><input type="hidden" name="form_id" value="contacto"><input type="hidden" name="page_url" value=""><div class="hp-field" aria-hidden="true"><label for="lead-website">Dejá este campo vacío</label><input id="lead-website" name="website" tabindex="-1" autocomplete="off"></div><div class="field"><label for="lead-name">Nombre</label><input id="lead-name" name="name" autocomplete="name" maxlength="200" required></div><div class="field"><label for="lead-phone">WhatsApp o teléfono</label><input id="lead-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="30" placeholder="0992 279 599" required></div><div class="field"><label for="lead-email">Correo <span>(opcional)</span></label><input id="lead-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="320"></div>${zonaField('lead')}${urgencyField('lead')}<div class="field"><label for="lead-service">Servicio</label><select id="lead-service" name="service" required><option value="">Elegí una opción</option><option>Pozos artesianos</option><option>Precio por metro</option><option>Pozos ciegos</option><option>Desagüe de pozo ciego</option><option>Pozo ciego lleno</option><option>Sistema séptico</option><option>Tratamiento de agua</option><option>Otra consulta</option></select></div><div class="field"><label for="lead-message">¿Qué necesitás y dónde?</label><textarea id="lead-message" name="message" rows="5" maxlength="5000" required></textarea></div><label class="consent"><input type="checkbox" name="consent" value="1" required><span>Leí la <a href="/privacidad/">política de privacidad</a> y acepto el uso de estos datos para responder mi consulta.</span></label><button class="button button--primary" type="submit">Enviar y continuar en WhatsApp</button><p class="form-note">Registramos la consulta, avisamos al equipo y abrimos WhatsApp con tu mensaje.</p><p class="form-status" id="form-status" aria-live="polite"></p></form>
      </div>
    </div></section>
    ${strata}
    <section class="section section--sand"><div class="shell coverage-grid"><div><p class="eyebrow">Cobertura</p><h2>Ciudades atendidas</h2><p>Coordinación en ${areas.join(', ')}.</p><div class="place-cloud">${areas.map((area) => `<span>${area}</span>`).join('')}</div><h3>Barrios de Asunción</h3><p>${barrios.join(', ')}.</p></div><div class="coverage-card"><h3>Antes de coordinar</h3><p>Confirmá zona, disponibilidad, acceso, precio y cualquier costo de visita.</p><hr><h3>Horario</h3><p>${SITE.hoursText}</p><p class="side-note">La ubicación exacta del servicio se coordina directamente con el equipo.</p></div></div></section>
  </main>`,
};
pages.push(contactPage);

const privacyPage = {
  path: '/privacidad/', short: 'Privacidad', title: 'Política de privacidad | Pozo.com.py', description: 'Política de tratamiento de datos de contacto enviados a Pozo.com.py.', h1: 'Política de privacidad', crumbs: [['/', 'Inicio'], ['/privacidad/', 'Privacidad']],
  body: `<main>${breadcrumbs([['/', 'Inicio'], ['/privacidad/', 'Privacidad']])}<section class="legal-hero"><div class="shell"><p class="eyebrow">Información legal</p><h1>Política de privacidad</h1><p>Cómo usamos y protegemos los datos enviados en una consulta.</p></div></section><section class="section"><article class="shell legal-copy"><p><strong>Responsable del sitio:</strong> Pozo.com.py, con base de atención en Asunción, Paraguay. Podés comunicarte al <a href="tel:${esc(SITE.phoneHref)}">${esc(SITE.phoneDisplay)}</a>.</p><h2>Datos que recibimos</h2><p>Cuando hacés una consulta podemos recibir nombre, teléfono, correo opcional, ubicación, servicio solicitado, descripción del trabajo, procedencia de la visita y mensajes. Si continuás por WhatsApp también podés compartir fotografías. No solicitamos datos sensibles ni información que no sea necesaria para responder.</p><h2>Para qué los usamos</h2><p>Usamos los datos para responder la consulta, evaluar cobertura, preparar una cotización, coordinar el servicio y registrar el origen comercial de la solicitud. No vendemos los datos ni los usamos para finalidades incompatibles con la consulta.</p><h2>Clics en los botones de WhatsApp</h2><p>Cuando tocás un botón de WhatsApp del sitio, antes de abrir la conversación registramos la fecha y hora, la página, el tema del botón, el sitio desde el que llegaste y, si existe, la campaña de origen de tu primera visita. No registramos tu dirección IP, tu número de teléfono ni el contenido de la conversación. Usamos este registro solamente para saber qué páginas y temas ayudan a las personas a escribirnos. Si JavaScript está desactivado, el botón abre WhatsApp directamente y no se registra nada.</p><h2>Proveedores y canales</h2><p>El formulario puede enviar la solicitud a nuestro sistema de gestión comercial y generar un aviso por correo electrónico a través de un proveedor de envío transaccional. WhatsApp, el proveedor de correo y el proveedor de alojamiento procesan información bajo sus propias condiciones. Solamente compartimos los datos necesarios para operar estos canales y atender el pedido.</p><h2>Conservación y seguridad</h2><p>Conservamos la información durante el tiempo necesario para gestionar la consulta, realizar seguimiento y cumplir obligaciones aplicables. Aplicamos acceso limitado y medidas razonables de seguridad. Ningún sistema es completamente infalible, por eso recomendamos no enviar documentos personales, información financiera ni imágenes innecesarias.</p><h2>Tus opciones</h2><p>Podés solicitar información, corrección o eliminación de los datos vinculados a tu consulta escribiendo por WhatsApp al <a href="${whatsappLink(waMessage(null, '/privacidad/'))}" target="_blank" rel="noopener noreferrer">${esc(SITE.phoneDisplay)}</a>. La solicitud puede requerir una verificación razonable de identidad.</p><h2>Marco aplicable</h2><p>Tratamos los datos conforme al marco paraguayo aplicable. La <a href="https://www.bacn.gov.py/leyes-paraguayas/9417/ley" target="_blank" rel="noopener">Ley N.º 6534/2020</a> regula datos personales crediticios. La <a href="https://www.bacn.gov.py/leyes-paraguayas/12924/ley-n-75932025-de-proteccion-de-datos-personales-en-la-republica-del-paraguay" target="_blank" rel="noopener">Ley N.º 7593/2025</a> establece un régimen general de protección de datos y prevé su entrada en vigor después del plazo indicado en su artículo 57. Esta política se actualizará cuando corresponda.</p><p class="side-note">Última actualización: 30 de septiembre de 2026.</p></article></section></main>`,
};
pages.push(privacyPage);

pages.push({
  path: '/gracias/', short: 'Gracias', title: 'Consulta recibida | Pozo.com.py', description: 'Confirmación de consulta enviada a Pozo.com.py.', h1: 'Consulta recibida', noindex: true, excludeSitemap: true,
  body: `<main><section class="contact-hero"><div class="shell"><p class="eyebrow eyebrow--light">Gracias por contactarnos</p><h1>Recibimos tu consulta.</h1><p>Vamos a revisar los datos y responder por teléfono o WhatsApp. Si se trata de una urgencia, también podés escribirnos directamente.</p><div class="hero-actions">${cta(`${svg('wa')}<span>Escribir por WhatsApp</span>`, waMessage(null, '/gracias/'), 'button button--wa')}<a class="button button--ghost" href="/">Volver al inicio</a></div></div></section><section class="section" id="gracias-estimate" hidden data-rates='${RATES_JSON}' data-wa-base="${esc(whatsappLink(''))}" data-wa-template="${esc(CALCULATOR_TEMPLATE)}"><div class="shell"><div class="thanks-grid"><div class="estimate" id="gracias-estimate-result"></div><div class="included-card"><h2>Qué incluye tu presupuesto</h2><div class="included-cols">${includedColumns()}</div></div></div><ol class="thanks-steps"><li><strong>Revisamos tus datos.</strong> Suelo, profundidad y acceso del terreno.</li><li><strong>Te contactamos.</strong> Por WhatsApp o teléfono, para confirmar el valor final.</li><li><strong>Coordinamos el trabajo.</strong> Fecha y detalles, una vez confirmado el presupuesto.</li></ol></div></section></main>`,
});

// Adds srcset/sizes to every site image that has smaller copies, so a phone
// downloads the 480 px file instead of the full-width original. The LCP hero
// (fetchpriority="high") spans the viewport unless the tag sets data-sizes;
// everything else is at most half the viewport.
function responsiveImages(html) {
  return html.replace(/<img src="\/assets\/images\/([a-z0-9-]+\.webp)"([^>]*)>/g, (tag, name, rest) => {
    const entry = imageManifest[name];
    if (!entry || !entry.variants.length || /\ssrcset=/.test(rest)) return tag;
    const stem = name.slice(0, -5);
    const srcset = [...entry.variants.map((width) => `/assets/images/${stem}-${width}.webp ${width}w`), `/assets/images/${name} ${entry.width}w`].join(', ');
    const explicit = rest.match(/\sdata-sizes="([^"]+)"/);
    const sizes = explicit ? explicit[1] : /fetchpriority="high"/.test(rest) ? '100vw' : '(max-width: 700px) 100vw, (max-width: 1080px) 50vw, 400px';
    // Lazy images yield bandwidth to the hero (LCP) while it is still loading.
    const priority = /loading="lazy"/.test(rest) && !/fetchpriority=/.test(rest) ? ' fetchpriority="low"' : '';
    return `<img src="/assets/images/${name}" srcset="${srcset}" sizes="${sizes}"${rest.replace(/\sdata-sizes="[^"]+"/, '')}${priority}>`;
  });
}

function render(page) {
  const canonical = page.noCanonical ? '' : `${SITE.url}${page.path}`;
  const socialImage = `${SITE.url}/assets/images/${page.image || 'pozo-artesiano-perforacion.webp'}`;
  const robots = page.noindex ? 'noindex,follow' : (DEMO_MODE ? 'noindex,nofollow,noarchive' : 'index,follow');
  const schema = JSON.stringify(baseSchema(page)).replace(/</g, '\\u003c');
  const body = responsiveImages(page.body).replace(/<main(?![^>]*\bid=)([^>]*)>/, '<main id="main-content"$1>');
  const css = `/assets/css/site.min.css?v=${esc(SITE.assetVersion)}`;
  return minifyHtml(trackWaLinks(`<!doctype html>
<html lang="es-PY">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  <meta name="robots" content="${robots}">
  ${canonical ? `<link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="es-PY" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">` : ''}
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_PY">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  ${canonical ? `<meta property="og:url" content="${canonical}">` : ''}
  <meta property="og:image" content="${socialImage}">
  <meta property="og:image:alt" content="${esc(page.h1)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)}">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${socialImage}">
  <meta name="theme-color" content="#0b2731">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  ${lcpPreload(body)}
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/barlow-condensed-700.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/inter-latin-var.woff2" crossorigin>
  <style>${inlineCss}</style>
  <link rel="stylesheet" href="${css}" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="${css}"></noscript>
  <script type="application/ld+json">${schema}</script>
</head>
<body data-page-label="${esc(page.short || page.h1 || '')}" data-vc-src="${esc(SITE.venderCrmUrl)}/vc-attribution.js"${page.stickyBar ? ' class="has-contact-bar"' : ''}>
  <a class="skip-link" href="#main-content">Saltar al contenido</a>
  ${header()}
  ${body}
  ${footer()}
  ${page.stickyBar ? contactBar(page) : ''}
  ${launcher(page)}
  <script src="/assets/js/site.min.js?v=${esc(SITE.assetVersion)}" defer></script>
</body>
</html>`));
}

async function outputPath(path) {
  return path === '/' ? join(root, 'index.html') : join(root, path.slice(1), 'index.html');
}

// guias/ is fully generated: clear it so an unpublished guide leaves no page behind.
await rm(join(root, 'guias'), { recursive: true, force: true });
for (const page of pages) {
  const target = await outputPath(page.path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, render(page), 'utf8');
}

const notFoundPage = {
  path: '/404',
  short: 'Página no encontrada',
  title: 'Página no encontrada | Pozo.com.py',
  description: 'La página solicitada no existe. Volvé al inicio o elegí un servicio.',
  h1: 'Esta página no está donde esperábamos.',
  noindex: true,
  excludeSitemap: true,
  noCanonical: true,
  body: `<main class="not-found"><div class="shell"><p class="eyebrow">Error 404</p><h1>Esta página no está donde esperábamos.</h1><p>Volvé al inicio o elegí un servicio.</p><div class="hero-actions"><a class="button button--primary" href="/">Ir al inicio</a><a class="button button--outline" href="/servicios/">Ver servicios</a></div></div></main>`,
};
await writeFile(join(root, '404.html'), render(notFoundPage), 'utf8');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((page) => !page.excludeSitemap).map((page) => `  <url><loc>${SITE.url}${page.path}</loc><changefreq>${page.path === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${page.path === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`;
await writeFile(join(root, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(join(root, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /wa.php\n\nSitemap: ${SITE.url}/sitemap.xml\n`, 'utf8');

function phpString(value) {
  return "'" + String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

const generatedConfigPath = join(root, 'config', 'site.generated.php');
await mkdir(dirname(generatedConfigPath), { recursive: true });
const generatedConfig = `<?php
// Auto-generated by build.mjs from site.config.mjs. Do not edit by hand.
return [
    'whatsapp' => ${phpString(SITE.whatsapp)},
    'phone_display' => ${phpString(SITE.phoneDisplay)},
    'site_url' => ${phpString(SITE.url)},
    'crm_url' => ${phpString(SITE.venderCrmUrl)},
    'wa_form' => [
        'intro' => [${Object.entries(FORM_FALLBACK.intro).map(([key, text]) => `${phpString(key)} => ${phpString(text)}`).join(', ')}],
        'labels' => [${Object.entries(FORM_FALLBACK.labels).map(([key, text]) => `${phpString(key)} => ${phpString(text)}`).join(', ')}],
        'urgency' => [${Object.entries(FORM_FALLBACK.urgency).map(([key, text]) => `${phpString(key)} => ${phpString(text)}`).join(', ')}],
        'outro' => [${FORM_FALLBACK.outro.map(phpString).join(', ')}],
        'ask_when' => ${phpString(FORM_FALLBACK.askWhen)},
    ],
    // Read by wa.php: every page of the message map with its default topic and
    // the text for each topic (content/wa-messages.mjs).
    'wa_pages' => [
${Object.entries(PAGES).map(([path, page]) => `        ${phpString(path)} => ['topic' => ${phpString(page.topic)}, 'texts' => [${Object.keys(TOPICS).map((topicId) => `${phpString(topicId)} => ${phpString(waText(path, topicId))}`).join(', ')}]],`).join('\n')}
    ],
    'generated_at' => ${phpString(new Date().toISOString())},
];
`;
await writeFile(generatedConfigPath, generatedConfig, 'utf8');

// Draft guides: rendered for review and for qa.mjs, never to the site.
await rm(join(root, '.preview'), { recursive: true, force: true });
for (const guide of DRAFT_GUIDES) {
  const target = join(root, '.preview', 'guias', guide.slug, 'index.html');
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, render(guidePage(guide)), 'utf8');
}

console.log(`Built ${pages.length} pages (${PUBLISHED_GUIDES.length} guides, ${DRAFT_GUIDES.length} drafts in .preview/). DEMO_MODE=${DEMO_MODE}`);
