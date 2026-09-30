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
import { ZONES, GRANDFATHERED_ZONES } from '../content/zones.mjs';

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
const htmlFiles = allFiles.filter((file) => file.endsWith('.html') && !posix(file).startsWith('docs/'));
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
for (const source of ['build.mjs', 'assets/js/site.js', 'contacto.php']) {
  const text = await readFile(join(root, source), 'utf8');
  if (/wa\.me\/\d/.test(text)) fail(`${source}: hard-coded wa.me number (use SITE.whatsapp)`);
  if (/(?:'|`)Hola, (?:quiero|necesito|tengo|mi pozo|les escribo|envié)/.test(text)) fail(`${source}: WhatsApp text written outside content/wa-messages.mjs`);
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

  const waOptions = [...html.matchAll(/<a class="wa-option[^"]*" href="([^"]+)"/g)];
  if (waOptions.length !== 5) fail(`${rel}: expected 5 wa-option links, found ${waOptions.length}`);
  if (!/class="contact-toggle"/.test(html)) fail(`${rel}: missing header contact-toggle`);
  if (!/<details class="wa-launcher" id="wa-launcher">/.test(html)) fail(`${rel}: missing no-JS WhatsApp launcher`);
  if (!/class="wa-ficha__form" action="\/contacto\.php" method="POST"/.test(html)) fail(`${rel}: launcher ficha rápida form missing`);
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
    if (['docs', 'tools', 'config', 'assets', 'source-images'].includes(parts[0])) break;
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
if (!contactHtml.includes('https://crm.clientes.com.py/vc-attribution.js') || !contactHtml.includes('Enviar y continuar en WhatsApp')) fail('contacto/index.html: CRM attribution or CRM-to-WhatsApp CTA missing');

const contactHandler = await readFile(join(root, 'contacto.php'), 'utf8');
for (const required of ['VENDERCRM_URL', 'VENDERCRM_API_KEY', '/api/v1/leads', 'idempotency_key', 'X-Api-Key', 'api.resend.com', 'Idempotency-Key', 'RESEND_API_KEY', 'https://crm.clientes.com.py', '/private/vendercrm.php', '/private/pozo.php', 'whatsappFallback($lead,', "'wa_form'"]) {
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
} catch (error) {
  fail(`HTTP checks could not reach ${base} (${error.message}). Start: php -S 127.0.0.1:8765 tools/router.php`);
}

if (failures.length) {
  console.error(`QA failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`QA passed: ${htmlFiles.length} HTML files, ${httpChecked} HTTP routes, ${Object.keys(PAGES).length} pages in the WhatsApp map, ${published.size} previously published URLs covered, ${imageSizes.length} optimized images.`);
