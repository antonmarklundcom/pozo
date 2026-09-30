// Static + HTTP QA for pozo.com.py. Fails (exit 1) on any issue.
//
//   php -S 127.0.0.1:8765 tools/router.php     (router emulates .htaccess)
//   node tools/qa.mjs [http://127.0.0.1:8765]
//
// Runs on Windows and Linux: every path is compared in POSIX form.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../site.config.mjs';
import { TOPICS, PAGES, waText, CALCULATOR_TEMPLATE, FORM_FALLBACK } from '../content/wa-messages.mjs';
import { ZONES, GRANDFATHERED_ZONES, COVERAGE_CITIES } from '../content/zones.mjs';
import { GUIDES, PUBLISHED_GUIDES, DRAFT_GUIDES, SERVICE_MEANING_GROUPS, GUIDE_HUB, HAS_GUIDE_HUB, guidePath, guideWordCount, anchorId } from '../content/guides.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const base = (process.argv[2] || 'http://127.0.0.1:8765').replace(/\/$/, '');
const failures = [];
const fail = (message) => failures.push(message);

const NUMBER = SITE.whatsapp;
const NUMBER_DISPLAY = SITE.phoneDisplay;
const TEL = SITE.phoneHref.replace(/\D/g, '');
// Demo placeholder kept only in the archived July v0 config (never published).
const ARCHIVE_PLACEHOLDERS = new Set([['595', '981', '234', '567'].join('')]);

if (NUMBER !== '595992279599' || TEL !== NUMBER || NUMBER_DISPLAY.replace(/\D/g, '') !== NUMBER) {
  fail(`site.config.mjs: whatsapp/phoneHref/phoneDisplay must all be 595992279599 (got ${NUMBER}, ${SITE.phoneHref}, ${NUMBER_DISPLAY})`);
}

const posix = (file) => relative(root, file).split(sep).join('/');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const allFiles = await walk(root);
const fileSet = new Set(allFiles.map(posix));
// .preview/ holds draft guides (never deployed); qa-screens/ is browser-check output.
const NOT_SITE = /^(?:docs|\.preview|qa-screens)\//;
const htmlFiles = allFiles.filter((file) => file.endsWith('.html') && !NOT_SITE.test(posix(file)));
const TEXT_EXT = /\.(html|php|mjs|js|json|md|txt|xml|css|py|ps1|example)$|(^|\/)\.htaccess$/;

function existsAsRoute(urlPath) {
  const clean = urlPath.split(/[?#]/)[0].replace(/^\//, '');
  if (!clean) return fileSet.has('index.html');
  return fileSet.has(clean) || fileSet.has(`${clean.replace(/\/$/, '')}/index.html`);
}

function pathOf(relativeHtml) {
  if (relativeHtml === 'index.html') return '/';
  if (relativeHtml === '404.html') return '/404';
  return `/${relativeHtml.replace(/index\.html$/, '')}`;
}

// --- 1. Contact number: one number, everywhere, in every file ---------------
for (const file of allFiles) {
  const rel = posix(file);
  if (!TEXT_EXT.test(rel)) continue;
  const text = await readFile(file, 'utf8');
  // Source files build links from SITE.whatsapp (wa.me/${...}); any literal digits must be ours.
  for (const [link, digits] of text.matchAll(/wa\.me\/(\d+)/g)) {
    if (digits !== NUMBER) fail(`${rel}: wa.me link with a number other than ${NUMBER}: ${link}`);
  }
  for (const [, digits] of text.matchAll(/tel:\+?(\d[\d ]*)/g)) {
    if (digits.replace(/\D/g, '') !== TEL) fail(`${rel}: tel: link with a number other than +${TEL}`);
  }
  // Any Paraguayan mobile-looking number (595 + 9 digits, spaced or not) that is not ours.
  for (const [match] of text.matchAll(/(?<!\d)595[ .-]?9\d{2}[ .-]?\d{3}[ .-]?\d{3}(?!\d)/g)) {
    const digits = match.replace(/\D/g, '');
    if (digits !== NUMBER && !(ARCHIVE_PLACEHOLDERS.has(digits) && rel.startsWith('docs/archive/'))) {
      fail(`${rel}: foreign phone number ${match}`);
    }
  }
}

// --- 2. WhatsApp messages: the map is complete and the texts are valid ------
const PRICE = /₲|\bGs\.?\s?\d|\bguaran[ií]es?\b\s*\d|\d[\d.]*\s*(?:Gs|₲)/i;
for (const [path, page] of Object.entries(PAGES)) {
  for (const topicId of [page.topic, ...Object.keys(TOPICS)]) {
    let text = '';
    try { text = waText(path, topicId); } catch (error) { fail(`wa-messages: ${error.message}`); continue; }
    if (!text.includes('pozo.com.py') || !text.includes(`(página: ${page.label})`)) fail(`wa-messages: ${path}/${topicId} does not name the site and page`);
    if (PRICE.test(text)) fail(`wa-messages: ${path}/${topicId} mentions a price`);
  }
  if (page.zone && !waText(path).includes(page.zone)) fail(`wa-messages: ${path} does not prefill the zone ${page.zone}`);
}
if (!/\{depth\}/.test(CALCULATOR_TEMPLATE) || !CALCULATOR_TEMPLATE.includes('pozo.com.py')) fail('wa-messages: CALCULATOR_TEMPLATE is incomplete');
if (!Object.values(FORM_FALLBACK.intro).every((text) => text.includes('pozo.com.py'))) fail('wa-messages: FORM_FALLBACK intro must name the site');
// Messages live in one file: no hand-written wa.me texts anywhere else.
for (const source of ['build.mjs', 'assets/js/site.js', 'contacto.php', 'wa.php']) {
  const text = await readFile(join(root, source), 'utf8');
  if (/wa\.me\/\d/.test(text)) fail(`${source}: hard-coded wa.me number (use SITE.whatsapp)`);
  if (/(?:'|`)Hola, (?:quiero|necesito|tengo|mi pozo|les escribo|envié)/.test(text)) fail(`${source}: WhatsApp text written outside content/wa-messages.mjs`);
}

// Lead triage controls: one radio per FORM_FALLBACK.urgency key, and a zona
// select with every coverage city plus "Otra".
function triageOk(formHtml) {
  const radios = [...formHtml.matchAll(/<input[^>]*type="radio" name="urgencia" value="([^"]+)"/g)].map(([, value]) => value);
  const select = formHtml.match(/<select[^>]*name="zona"[\s\S]*?<\/select>/)?.[0] || '';
  const options = [...select.matchAll(/<option(?: value="([^"]*)")?>([^<]*)<\/option>/g)].map(([, value, label]) => value ?? label);
  const cities = COVERAGE_CITIES.map((city) => city.replace(/&/g, '&amp;'));
  return radios.join() === Object.keys(FORM_FALLBACK.urgency).join() && cities.every((city) => options.includes(city)) && options.includes('Otra');
}

// Structured data: required properties per @type, ids that resolve, and no
// ratings, reviews or prices (nothing of that is verified).
const SCHEMA_REQUIRED = {
  WebSite: ['@id', 'url', 'name', 'publisher'],
  Organization: ['@id', 'name', 'url', 'logo'],
  ProfessionalService: ['@id', 'name', 'url', 'telephone', 'address', 'areaServed', 'image', 'logo', 'openingHours', 'hasOfferCatalog', 'parentOrganization'],
  Service: ['@id', 'name', 'serviceType', 'provider', 'areaServed', 'url'],
  FAQPage: ['mainEntity'],
  BreadcrumbList: ['itemListElement'],
  CollectionPage: ['name', 'url', 'mainEntity'],
  Article: ['@id', 'headline', 'description', 'url', 'mainEntityOfPage', 'datePublished', 'author', 'publisher'],
};
const FORBIDDEN_SCHEMA = /"(?:aggregateRating|review|reviewRating|ratingValue|price|priceSpecification|lowPrice|highPrice|priceRange)"\s*:/;
function validateGraph(rel, path, data, html) {
  const graph = data['@graph'];
  if (data['@context'] !== 'https://schema.org' || !Array.isArray(graph)) { fail(`${rel}: JSON-LD must be one @graph with the schema.org context`); return; }
  if (FORBIDDEN_SCHEMA.test(JSON.stringify(data))) fail(`${rel}: JSON-LD contains ratings, reviews or prices`);
  const ids = new Set(graph.map((node) => node['@id']).filter(Boolean));
  for (const type of ['WebSite', 'Organization', 'ProfessionalService']) {
    if (!graph.some((node) => node['@type'] === type)) fail(`${rel}: JSON-LD missing ${type}`);
  }
  for (const node of graph) {
    const required = SCHEMA_REQUIRED[node['@type']];
    if (!required) { fail(`${rel}: JSON-LD type ${node['@type']} has no QA rule`); continue; }
    for (const key of required) {
      const value = node[key];
      if (value == null || value === '' || (Array.isArray(value) && !value.length)) fail(`${rel}: ${node['@type']} missing ${key}`);
    }
    // Every {"@id": …} reference inside a node points at a node on the page.
    for (const [, ref] of JSON.stringify(node).matchAll(/\{"@id":"([^"]+)"\}/g)) {
      if (!ids.has(ref)) fail(`${rel}: ${node['@type']} references ${ref}, which is not in the graph`);
    }
    if (node['@type'] === 'Organization' && node.logo?.url && !existsAsRoute(new URL(node.logo.url).pathname)) fail(`${rel}: Organization logo file is missing`);
    if (node['@type'] === 'Organization' && node.sameAs && !node.sameAs.every((url) => /^https:\/\//.test(url))) fail(`${rel}: sameAs entries must be https URLs`);
    if (node['@type'] === 'ProfessionalService') {
      const offers = node.hasOfferCatalog?.itemListElement || [];
      if (!offers.length || !offers.every((offer) => offer['@type'] === 'Offer' && offer.itemOffered?.name && offer.itemOffered?.serviceType && offer.itemOffered?.url)) fail(`${rel}: hasOfferCatalog offers need itemOffered name, serviceType and url`);
      for (const offer of offers) if (offer.itemOffered?.url && !existsAsRoute(new URL(offer.itemOffered.url).pathname)) fail(`${rel}: offer catalog links to a missing page ${offer.itemOffered.url}`);
      if (!node.address?.addressCountry) fail(`${rel}: ProfessionalService address needs addressCountry`);
    }
    if (node['@type'] === 'Service') {
      if (node.url !== `${SITE.url}${path}`) fail(`${rel}: Service url must be the page URL`);
      if (!node.areaServed.every((area) => area['@type'] === 'City' && area.name)) fail(`${rel}: Service areaServed must list City names`);
      const zone = ZONES.find((item) => item.path === path);
      if (zone && (node.areaServed.length !== 1 || node.areaServed[0].name !== zone.city)) fail(`${rel}: zone Service areaServed must be ${zone.city}`);
    }
    if (node['@type'] === 'FAQPage') {
      if (!node.mainEntity.every((q) => q['@type'] === 'Question' && q.name && q.acceptedAnswer?.text)) fail(`${rel}: FAQPage questions need name and acceptedAnswer.text`);
      const visibleQuestions = (html.match(/<div class="faq-list">[\s\S]*?<\/div>/g) || []).join('').match(/<summary>/g)?.length || 0;
      if (visibleQuestions !== node.mainEntity.length) fail(`${rel}: FAQPage has ${node.mainEntity.length} questions but the page shows ${visibleQuestions}`);
    }
    if (node['@type'] === 'BreadcrumbList') {
      const items = node.itemListElement;
      if (!items.every((item, index) => item.position === index + 1 && item.name && item.item?.startsWith(SITE.url))) fail(`${rel}: BreadcrumbList positions/items invalid`);
      if (items.at(-1)?.item !== `${SITE.url}${path}`) fail(`${rel}: BreadcrumbList must end at the page itself`);
    }
    if (node['@type'] === 'CollectionPage' && !(node.mainEntity?.itemListElement || []).length) fail(`${rel}: CollectionPage ItemList is empty`);
  }
  if (html.includes('class="faq-list"') && !graph.some((node) => node['@type'] === 'FAQPage')) fail(`${rel}: page shows FAQs without FAQPage JSON-LD`);
}

// --- 3. Every generated page -------------------------------------------------
const titles = new Set();
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const sitemapPaths = [...sitemap.matchAll(/<loc>https:\/\/pozo\.com\.py([^<]*)<\/loc>/g)].map(([, path]) => path);
const INTERNAL_NOTE = /Reemplazalas|antes de usarlas como prueba|lorem ipsum|a completar por|nota interna/i;
const DEV_MARKER = /\bTODO\b|\bFIXME\b|\bXXX\b/;
const SIBLINGS = /https:\/\/(?:obra|arq|carpinteria)\.com\.py/g;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const rel = posix(file);
  const path = pathOf(rel);
  const intentionallyNoindex = rel === '404.html' || rel === 'gracias/index.html';

  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) fail(`${rel}: expected one H1, found ${h1Count}`);
  if (!/<meta name="viewport"/.test(html)) fail(`${rel}: missing viewport`);
  if (intentionallyNoindex && !/<meta name="robots" content="noindex/.test(html)) fail(`${rel}: should remain noindex`);
  if (!intentionallyNoindex && !/<meta name="robots" content="index,follow">/.test(html)) fail(`${rel}: public page is not indexable`);
  if (!intentionallyNoindex && !sitemapPaths.includes(path)) fail(`${rel}: indexable page missing from sitemap.xml`);
  if (intentionallyNoindex && sitemapPaths.includes(path)) fail(`${rel}: noindex page listed in sitemap.xml`);
  if (/demo-banner|sitio en preparación|no publicar todavía/i.test(html)) fail(`${rel}: contains preparation UI`);
  if (/leads@pozo\.com\.py|correo por configurar|buzón pendiente|\[(?:RESPONSABLE|CORREO|DOMICILIO)/i.test(html)) fail(`${rel}: contains unverified placeholder content`);
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');
  if (INTERNAL_NOTE.test(visible) || DEV_MARKER.test(visible)) fail(`${rel}: internal/editorial note visible to visitors`);
  if ((html.match(SIBLINGS) || []).length > 1) fail(`${rel}: more than one sibling-site cross-link`);

  if (rel !== '404.html') {
    const title = html.match(/<title>(.*?)<\/title>/)?.[1] || '';
    const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1] || '';
    if (title.length > 60) fail(`${rel}: title exceeds 60 characters`);
    if (description.length > 155) fail(`${rel}: description exceeds 155 characters`);
    if (titles.has(title)) fail(`${rel}: duplicate title`);
    titles.add(title);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
    if (canonical !== `${SITE.url}${path}`) fail(`${rel}: canonical ${canonical} should be ${SITE.url}${path}`);
    if (!html.includes(NUMBER) || !html.includes(NUMBER_DISPLAY)) fail(`${rel}: configured contact number missing`);
    const jsonBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (!jsonBlocks.length) fail(`${rel}: missing JSON-LD`);
    for (const block of jsonBlocks) {
      try {
        const data = JSON.parse(block[1]);
        const business = (data['@graph'] || []).find((item) => item['@type'] === 'ProfessionalService');
        if (business && business.telephone !== NUMBER_DISPLAY) fail(`${rel}: JSON-LD telephone is not ${NUMBER_DISPLAY}`);
        validateGraph(rel, path, data, html);
      } catch (error) { fail(`${rel}: invalid JSON-LD (${error.message})`); }
    }
  }

  for (const [, target] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (!existsAsRoute(target)) fail(`${rel}: broken internal target ${target}`);
  }

  // Every wa.me link: configured number, non-empty text naming site and page.
  const label = PAGES[path]?.label;
  for (const [, rawHref] of html.matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)) {
    const href = rawHref.replace(/&amp;/g, '&');
    if (!href.startsWith(`https://wa.me/${NUMBER}?text=`)) { fail(`${rel}: wa.me link without the configured number and ?text=`); continue; }
    let text = '';
    try { text = decodeURIComponent(href.split('?text=')[1]); } catch { fail(`${rel}: wa.me text does not decode`); continue; }
    if (!text.trim()) fail(`${rel}: wa.me link with empty text`);
    else if (!text.includes('pozo.com.py') || (label && !text.includes(`(página: ${label})`))) fail(`${rel}: wa.me text does not name the site and page: ${text.split('\n')[0]}`);
  }
  // Click tracking: every wa.me link says which /wa.php?p=&t= gives the same text.
  for (const [tag] of html.matchAll(/<a\s[^>]*href="https:\/\/wa\.me\/[^"]*"[^>]*>/g)) {
    const track = tag.match(/data-wa-track="([^"]+)"/)?.[1];
    if (!track) { fail(`${rel}: wa.me link without data-wa-track: ${tag.slice(0, 90)}`); continue; }
    const params = new URLSearchParams(track.replace(/&amp;/g, '&'));
    const linkText = decodeURIComponent(tag.match(/\?text=([^"]*)"/)[1]);
    let expected = '';
    try { expected = waText(params.get('p'), params.get('t')); } catch { /* reported below */ }
    if (expected !== linkText) fail(`${rel}: data-wa-track ${params.get('p')} / ${params.get('t')} does not give the link's text`);
  }

  const waOptions = [...html.matchAll(/<a class="wa-option[^"]*" href="([^"]+)"/g)];
  if (waOptions.length !== 5) fail(`${rel}: expected 5 wa-option links, found ${waOptions.length}`);
  if (!/class="contact-toggle"/.test(html)) fail(`${rel}: missing header contact-toggle`);
  if (!/<details class="wa-launcher" id="wa-launcher">/.test(html)) fail(`${rel}: missing no-JS WhatsApp launcher`);
  if (!/class="wa-ficha__form" action="\/contacto\.php" method="POST"/.test(html)) fail(`${rel}: launcher ficha rápida form missing`);
  const ficha = html.match(/<form class="wa-ficha__form"[\s\S]*?<\/form>/)?.[0] || '';
  if (!triageOk(ficha)) fail(`${rel}: ficha rápida needs the urgencia radios (${Object.keys(FORM_FALLBACK.urgency).join('/')}) and the zona select (coverage cities + Otra)`);
  for (const [tag] of html.matchAll(/<a\s[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener/.test(tag)) fail(`${rel}: target="_blank" without rel="noopener": ${tag.slice(0, 90)}`);
  }
  for (const [, asset] of html.matchAll(/(?:href|src)="(\/assets\/[^"?]+)/g)) {
    if (!fileSet.has(asset.slice(1))) fail(`${rel}: references a missing asset ${asset}`);
  }
  for (const [, srcset] of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of srcset.split(',').map((item) => item.trim().split(/\s+/)[0])) {
      if (!fileSet.has(candidate.slice(1))) fail(`${rel}: srcset references a missing file ${candidate}`);
    }
  }
  for (const [tag] of html.matchAll(/<img\s[^>]*>/g)) {
    if (!/\salt="[^"]+"/.test(tag)) fail(`${rel}: <img> without alt`);
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) fail(`${rel}: <img> without width/height`);
  }
}

// Sitemap lists only real, indexable routes.
for (const path of sitemapPaths) {
  if (!existsAsRoute(path)) fail(`sitemap.xml: ${path} has no generated page`);
}
if (!sitemapPaths.includes('/zonas/')) fail('sitemap.xml: /zonas/ must be listed');
if (new Set(sitemapPaths).size !== sitemapPaths.length) fail('sitemap.xml: duplicate URL');

// A route folder without index.html answers 403 on Hostinger (the live /zonas/ bug).
for (const rel of fileSet) {
  if (!rel.endsWith('/index.html')) continue;
  const parts = rel.split('/').slice(0, -2);
  for (let i = 1; i <= parts.length; i += 1) {
    const folder = parts.slice(0, i).join('/');
    if (['docs', 'tools', 'config', 'assets', 'source-images', '.preview', 'qa-screens'].includes(parts[0])) break;
    if (!fileSet.has(`${folder}/index.html`)) fail(`${folder}/: route folder without index.html (would be 403)`);
  }
}

// --- 4. Zones: no thin city-name swaps ---------------------------------------
for (const zone of ZONES) {
  if (!GRANDFATHERED_ZONES.includes(zone.path) && (zone.local || []).length < 2) {
    fail(`content/zones.mjs: ${zone.path} needs at least 2 genuinely local sections`);
  }
  if (zone.title.length > 60) fail(`content/zones.mjs: ${zone.path} title exceeds 60 characters`);
}

// --- 4b. Guides: one meaning group each, long enough to be useful ----------------
const guideGroups = new Map();
const serviceGroups = new Set(Object.values(SERVICE_MEANING_GROUPS).map((group) => group.toLowerCase()));
for (const [path, group] of Object.entries(SERVICE_MEANING_GROUPS)) {
  if (!existsAsRoute(path)) fail(`content/guides.mjs: SERVICE_MEANING_GROUPS lists ${path}, which is not a page`);
  if (!group.trim()) fail(`content/guides.mjs: SERVICE_MEANING_GROUPS ${path} has an empty group`);
}
for (const guide of GUIDES) {
  const id = `content/guides.mjs: ${guide.slug || '(no slug)'}`;
  const path = guidePath(guide);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.slug || '')) fail(`${id}: slug must be lowercase words joined by hyphens`);
  for (const field of ['title', 'description', 'h1', 'meaningGroup', 'lead', 'intro', 'published']) {
    if (!String(guide[field] || '').trim()) fail(`${id}: missing ${field}`);
  }
  if ((guide.title || '').length > 60) fail(`${id}: title exceeds 60 characters`);
  if ((guide.description || '').length > 155) fail(`${id}: description exceeds 155 characters`);
  if (guide.published && !/^\d{4}-\d{2}-\d{2}$/.test(guide.published)) fail(`${id}: published must be YYYY-MM-DD`);
  if (guide.updated && !/^\d{4}-\d{2}-\d{2}$/.test(guide.updated)) fail(`${id}: updated must be YYYY-MM-DD`);
  if (!Array.isArray(guide.sections) || !guide.sections.length) fail(`${id}: needs sections`);
  const anchors = (guide.sections || []).map(([heading]) => anchorId(heading));
  if (new Set(anchors).size !== anchors.length || anchors.some((anchor) => !anchor)) fail(`${id}: section headings must give unique, non-empty anchors`);
  const group = String(guide.meaningGroup || '').toLowerCase();
  if (serviceGroups.has(group)) fail(`${id}: meaningGroup "${guide.meaningGroup}" is owned by a service page (one group = one page)`);
  if (group && guideGroups.has(group)) fail(`${id}: meaningGroup "${guide.meaningGroup}" is already used by ${guideGroups.get(group)}`);
  guideGroups.set(group, guide.slug);
  if (!Array.isArray(guide.relatedServices) || !guide.relatedServices.length) fail(`${id}: needs at least one relatedServices path`);
  for (const service of guide.relatedServices || []) {
    if (!/^\/servicios\//.test(service) || !existsAsRoute(service)) fail(`${id}: relatedServices ${service} is not a service page`);
  }
  if (guide.image && !fileSet.has(`assets/images/${guide.image}`)) fail(`${id}: image ${guide.image} is missing`);
  if (guide.image && !String(guide.alt || '').trim()) fail(`${id}: image without alt text`);
  if (guide.draft) {
    if (existsAsRoute(path)) fail(`${id}: draft guide was built to the site at ${path}`);
    if (sitemapPaths.includes(path)) fail(`${id}: draft guide listed in sitemap.xml`);
    continue;
  }
  const words = guideWordCount(guide);
  if (words < 700) fail(`${id}: published guide has ${words} words (minimum 700)`);
  const faqCount = (guide.faqs || []).length;
  if (faqCount < 4 || faqCount > 6) fail(`${id}: published guide needs 4-6 FAQs (has ${faqCount})`);
  if (!existsAsRoute(path)) fail(`${id}: published guide has no page at ${path}`);
}
if (HAS_GUIDE_HUB !== existsAsRoute(GUIDE_HUB)) fail(`${GUIDE_HUB}: hub must exist exactly when at least one guide is published`);
if (HAS_GUIDE_HUB !== sitemapPaths.includes(GUIDE_HUB)) fail(`sitemap.xml: ${GUIDE_HUB} must be listed exactly when the hub exists`);
for (const rel of fileSet) {
  const match = rel.match(/^guias\/([^/]+)\/index\.html$/);
  if (match && !PUBLISHED_GUIDES.some((guide) => guide.slug === match[1])) fail(`${rel}: guide page without a published entry in content/guides.mjs`);
}

// Rendered guide template: published pages and draft previews share it.
const guideRenders = [
  ...PUBLISHED_GUIDES.map((guide) => ({ guide, file: `${guidePath(guide).slice(1)}index.html` })),
  ...DRAFT_GUIDES.map((guide) => ({ guide, file: `.preview${guidePath(guide)}index.html` })),
];
for (const { guide, file } of guideRenders) {
  if (!fileSet.has(file)) { fail(`${file}: guide was not rendered (run node build.mjs)`); continue; }
  const html = await readFile(join(root, file), 'utf8');
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(`${file}: expected one H1`);
  if (!/<nav class="toc"/.test(html)) fail(`${file}: missing table of contents`);
  const tocHtml = html.match(/<nav class="toc"[\s\S]*?<\/nav>/)?.[0] || '';
  for (const [, anchor] of tocHtml.matchAll(/href="#([^"]+)"/g)) {
    if (!html.includes(`id="${anchor}"`)) fail(`${file}: table of contents links to missing #${anchor}`);
  }
  const graph = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(([, json]) => { try { return JSON.parse(json)['@graph'] || []; } catch { return []; } });
  const types = new Set(graph.map((item) => item['@type']));
  for (const type of ['Article', 'BreadcrumbList', ...(guide.faqs?.length ? ['FAQPage'] : [])]) {
    if (!types.has(type)) fail(`${file}: JSON-LD missing ${type}`);
  }
  const article = graph.find((item) => item['@type'] === 'Article');
  if (article && (!article.headline || !article.datePublished || !article.author || !article.mainEntityOfPage)) fail(`${file}: Article JSON-LD needs headline, datePublished, author and mainEntityOfPage`);
  if (!/<div class="related-services">/.test(html)) fail(`${file}: missing Servicios relacionados block`);
}
// Every published guide is linked from each related service page ("Guías relacionadas").
for (const guide of PUBLISHED_GUIDES) {
  for (const service of guide.relatedServices) {
    const file = `${service.slice(1)}index.html`;
    if (!fileSet.has(file)) continue;
    const html = await readFile(join(root, file), 'utf8');
    if (!html.includes(`class="related-guides"`) || !html.includes(`href="${guidePath(guide)}"`)) fail(`${file}: missing Guías relacionadas link to ${guidePath(guide)}`);
  }
}

// --- 5. Redirects: no published URL may disappear ------------------------------
const htaccess = await readFile(join(root, '.htaccess'), 'utf8');
const rules = [...htaccess.matchAll(/^RewriteRule\s+(\S+)\s+(\S+)\s+\[[^\]]*R=301[^\]]*\]/gm)]
  .filter(([, pattern]) => pattern !== '^')
  .map(([, pattern, target]) => ({ regex: new RegExp(pattern), target }));
for (const rule of rules) {
  if (rule.target.startsWith('/') && !rule.target.includes('$') && !existsAsRoute(rule.target)) fail(`.htaccess: redirect target ${rule.target} does not exist`);
}
const redirected = (path) => rules.some((rule) => rule.regex.test(path.replace(/^\//, '')));
const published = new Set();
try {
  const before = JSON.parse(await readFile(join(root, 'docs', 'seo', 'audit-before.json'), 'utf8'));
  for (const page of Object.values(before.pages)) if (page.status === 200 || page.status === 301) published.add(page.path);
  published.add('/pozos-artesianos/precio-metro'); published.add('/tratamiento-agua');
} catch { fail('docs/seo/audit-before.json: missing (run tools/crawl.mjs on the baseline)'); }
try {
  const v0 = await readFile(join(root, 'docs', 'archive', 'v0-php-2026-07', 'sitemap.xml'), 'utf8');
  for (const [, loc] of v0.matchAll(/<loc>([^<]+)<\/loc>/g)) published.add(new URL(loc).pathname);
} catch { /* archive optional */ }
for (const path of published) {
  if (!existsAsRoute(path) && !redirected(path)) fail(`URL ${path} was published before and now neither exists nor redirects (needs a 301)`);
}

// --- 6. Form handler and generated config --------------------------------------
const contactHtml = await readFile(join(root, 'contacto', 'index.html'), 'utf8');
if (!/<form[^>]+action="\/contacto\.php"[^>]+method="POST"/.test(contactHtml)) fail('contacto/index.html: server-side lead form is not configured');
if (!/name="phone"[^>]+required/.test(contactHtml) || !/name="website"/.test(contactHtml) || !/name="consent"/.test(contactHtml)) fail('contacto/index.html: phone, honeypot or consent control missing');
if (!triageOk(contactHtml.match(/<form class="lead-form"[\s\S]*?<\/form>/)?.[0] || '')) fail('contacto/index.html: lead form needs the urgencia radios and the zona select');
if (!contactHtml.includes('https://crm.clientes.com.py/vc-attribution.js') || !contactHtml.includes('Enviar y continuar en WhatsApp')) fail('contacto/index.html: CRM attribution or CRM-to-WhatsApp CTA missing');

const contactHandler = await readFile(join(root, 'contacto.php'), 'utf8');
for (const required of ["'urgencia' =>", "'[URGENTE] '", "'ask_when'", 'VENDERCRM_URL', 'VENDERCRM_API_KEY', '/api/v1/leads', 'idempotency_key', 'X-Api-Key', 'api.resend.com', 'Idempotency-Key', 'RESEND_API_KEY', 'https://crm.clientes.com.py', '/private/vendercrm.php', '/private/pozo.php', 'whatsappFallback($lead,', "'wa_form'"]) {
  if (!contactHandler.includes(required)) fail(`contacto.php: missing ${required}`);
}
// Secrets: nothing that looks like a real key anywhere in the repo.
for (const file of allFiles) {
  const rel = posix(file);
  if (!TEXT_EXT.test(rel) && !/\.env/.test(rel)) continue;
  if (/(^|\/)\.env(\.|$)/.test(rel) && !rel.endsWith('.example')) fail(`${rel}: env file must not be committed`);
  const text = await readFile(file, 'utf8');
  if (/vc_(?:live|test)_[A-Za-z0-9_-]{8,}/.test(text)) fail(`${rel}: VenderCRM key detected`);
  if (/\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}|\bre_[A-Za-z0-9]{24,}/.test(text)) fail(`${rel}: Resend key detected`);
}
if (fileSet.has('private/pozo.php') || fileSet.has('private/vendercrm.php')) fail('private/: real config must never be in the repo');

try {
  const generatedConfig = await readFile(join(root, 'config', 'site.generated.php'), 'utf8');
  if (!generatedConfig.includes(`'whatsapp' => '${NUMBER}'`)) fail('config/site.generated.php: configured number missing');
  if (!generatedConfig.includes("'wa_form'")) fail('config/site.generated.php: wa_form texts missing (run node build.mjs)');
} catch { fail('config/site.generated.php: missing (run node build.mjs)'); }

const siteJs = await readFile(join(root, 'assets', 'js', 'site.js'), 'utf8');
if (!/data-wa-track/.test(siteJs) || !/\/wa\.php\?/.test(siteJs)) fail('assets/js/site.js: WhatsApp click tracking (data-wa-track -> /wa.php) missing');
try {
  const generated = await readFile(join(root, 'config', 'site.generated.php'), 'utf8');
  for (const path of Object.keys(PAGES)) {
    if (!generated.includes(`'${path.replace(/'/g, "\\'")}' => ['topic' =>`)) fail(`config/site.generated.php: wa_pages misses ${path} (run node build.mjs)`);
  }
} catch { /* reported above */ }
if (!/Disallow: \/wa\.php/.test(await readFile(join(root, 'robots.txt'), 'utf8'))) fail('robots.txt: /wa.php must be disallowed');

// --- 7. Fonts, CSS invariants, images ------------------------------------------
const css = await readFile(join(root, 'assets', 'css', 'site.css'), 'utf8');
if (!/\.hero-media\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s.test(css)) fail('assets/css/site.css: service hero media must keep a 16:9 ratio');
for (const [, fontPath] of css.matchAll(/url\("(\/assets\/fonts\/[^"?]+)/g)) {
  if (!fileSet.has(fontPath.slice(1))) fail(`assets/css/site.css: references a missing font file ${fontPath}`);
}
const imageSizes = await Promise.all(allFiles.filter((file) => file.endsWith('.webp')).map(async (file) => ({ file, bytes: (await stat(file)).size })));
for (const image of imageSizes) {
  if (image.bytes > 450_000) fail(`${posix(image.file)}: image exceeds 450 KB`);
}

// --- 8. HTTP: every page, the 404, denied folders and legacy redirects ------------
const routes = [...sitemapPaths, '/gracias/'];
let httpChecked = 0;
try {
  for (const route of routes) {
    const response = await fetch(`${base}${route}`, { redirect: 'manual' });
    httpChecked += 1;
    if (response.status !== 200) fail(`${route}: HTTP ${response.status}`);
    const body = await response.text();
    if (!body.includes('<!doctype html>')) fail(`${route}: response is not HTML`);
  }
  const usesRouter = (await fetch(`${base}/esta-pagina-no-existe/`, { redirect: 'manual' })).status === 404;
  if (usesRouter) {
    for (const denied of ['/config/site.generated.php', '/docs/PLAN-V2.md', '/tools/qa.mjs', '/build.mjs', '/site.config.mjs', '/content/wa-messages.mjs']) {
      const status = (await fetch(`${base}${denied}`, { redirect: 'manual' })).status;
      if (status !== 404 && status !== 403) fail(`${denied}: must not be served (HTTP ${status})`);
    }
    for (const path of published) {
      if (existsAsRoute(path)) continue;
      const response = await fetch(`${base}${path}`, { redirect: 'manual' });
      if (response.status !== 301) fail(`${path}: expected 301, got ${response.status}`);
    }
  } else {
    console.warn('! Server is not tools/router.php: .htaccess redirects and denials were not tested over HTTP.');
  }

  // wa.php: known (page, topic) -> 302 to wa.me with exactly the map's text.
  const waTarget = async (query, init = {}) => {
    const response = await fetch(`${base}/wa.php?${query}`, { redirect: 'manual', ...init });
    const location = response.headers.get('location') || '';
    const text = location.startsWith(`https://wa.me/${NUMBER}?text=`) ? decodeURIComponent(location.split('?text=')[1]) : null;
    return { status: response.status, text };
  };
  for (const [path, page] of Object.entries(PAGES)) {
    for (const topicId of new Set([page.topic, 'urgente'])) {
      const { status, text } = await waTarget(`p=${encodeURIComponent(path)}&t=${encodeURIComponent(topicId)}`);
      if (status !== 302 || text !== waText(path, topicId)) fail(`/wa.php ${path} / ${topicId}: expected 302 to wa.me with the map text (HTTP ${status})`);
    }
  }
  const fallback = await waTarget('p=%2Fno-existe%2F&t=inventado');
  if (fallback.status !== 302 || fallback.text !== waText('/')) fail('/wa.php: unknown page/topic must fall back to the home text');
  const posted = await fetch(`${base}/wa.php?p=%2F`, { method: 'POST', redirect: 'manual' });
  if (posted.status !== 405) fail(`/wa.php: POST must answer 405 (HTTP ${posted.status})`);
  // Log line (only when the server was started with POZO_WA_LOG, as verify.mjs does).
  if (process.env.POZO_WA_LOG) {
    const campaign = `qa-${Date.now()}`;
    const cookie = `vc_attr=${encodeURIComponent(JSON.stringify({ referrer: 'https://www.google.com/search?q=x', landing_page: `${base}/`, utm_source: 'google', utm_campaign: campaign }))}`;
    await waTarget(`p=${encodeURIComponent('/servicios/desague/')}&t=urgente`, { headers: { Cookie: cookie, Referer: `${base}/servicios/desague/` } });
    let lines = [];
    try { lines = (await readFile(process.env.POZO_WA_LOG, 'utf8')).trim().split('\n').map((line) => JSON.parse(line)); } catch (error) { fail(`wa.php log ${process.env.POZO_WA_LOG}: unreadable (${error.message})`); }
    const entry = lines.find((line) => line.utm?.utm_campaign === campaign);
    if (!entry) fail('wa.php: click was not logged');
    else {
      const keys = Object.keys(entry).sort().join(',');
      if (keys !== 'page,ref,requested,topic,ts,utm') fail(`wa.php log: unexpected fields ${keys}`);
      if (entry.page !== '/servicios/desague/' || entry.topic !== 'urgente' || entry.requested !== true) fail('wa.php log: wrong page/topic');
      if (entry.ref !== 'www.google.com' || entry.utm.utm_source !== 'google') fail(`wa.php log: referrer host / first-touch utm not recorded (${entry.ref})`);
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(entry.ts)) fail('wa.php log: ts must be UTC ISO');
    }
    if (lines.some((line) => /\b\d{1,3}(?:\.\d{1,3}){3}\b|595\d{9}/.test(JSON.stringify(line)))) fail('wa.php log: contains an IP address or a phone number');
  }
} catch (error) {
  fail(`HTTP checks could not reach ${base} (${error.message}). Start: php -S 127.0.0.1:8765 tools/router.php`);
}

if (failures.length) {
  console.error(`QA failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`QA passed: ${htmlFiles.length} HTML files, ${httpChecked} HTTP routes, ${Object.keys(PAGES).length} pages in the WhatsApp map, ${published.size} previously published URLs covered, ${imageSizes.length} optimized images.`);
