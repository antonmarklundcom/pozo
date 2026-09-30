// Generic static + HTTP QA for a static HTML/PHP site (site kit). The site's
// tools/qa.mjs calls runQa() with hooks for its own checks. Fails (exit 1) on
// any issue. Runs on Windows and Linux: every path is compared in POSIX form.
//
//   php -S 127.0.0.1:<port> tools/router.php
//   node tools/qa.mjs [http://127.0.0.1:<port>]
//
// Hooks (all optional, all receive ctx = { root, base, kit, fail, allFiles,
// fileSet, htmlFiles, sitemapPaths, existsAsRoute, posix, published }):
//   init(ctx)                                 before any check
//   perPage({ rel, path, html, ctx })         after the generic per-page checks
//   jsonLd({ rel, path, data, html, ctx })    for every parsed JSON-LD block
//   afterPages(ctx)                           site files, data, generated config
//   http(ctx)                                 extra HTTP checks against ctx.base
//   summary(ctx) -> string                    appended to the pass line
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { kit, root, sitemapPaths as readSitemapPaths } from './config.mjs';
import { minifyCss, minifyJs } from './minify.mjs';

export async function runQa(hooks = {}) {
  const base = (process.argv[2] || kit.localBase).replace(/\/$/, '');
  const failures = [];
  const fail = (message) => failures.push(message);
  const posix = (file) => relative(root, file).split(sep).join('/');
  const { whatsapp: NUMBER, tel: TEL, display: NUMBER_DISPLAY } = kit.phone;

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
  // Folders that are never pages (docs, tools, previews, screenshots…).
  const notSite = new RegExp(`^(?:${kit.notSite.map((folder) => folder.replace(/\./g, '\\.')).join('|')})/`);
  const htmlFiles = allFiles.filter((file) => file.endsWith('.html') && !notSite.test(posix(file)));
  const TEXT_EXT = /\.(html|php|mjs|js|json|md|txt|xml|css|py|ps1|example)$|(^|\/)\.htaccess$/;
  const existsAsRoute = (urlPath) => {
    const clean = urlPath.split(/[?#]/)[0].replace(/^\//, '');
    if (!clean) return fileSet.has('index.html');
    return fileSet.has(clean) || fileSet.has(`${clean.replace(/\/$/, '')}/index.html`);
  };
  const pathOf = (rel) => (rel === 'index.html' ? '/' : rel === '404.html' ? '/404' : `/${rel.replace(/index\.html$/, '')}`);
  const sitemapPaths = readSitemapPaths(await readFile(join(root, 'sitemap.xml'), 'utf8'));
  const ctx = { root, base, kit, fail, allFiles, fileSet, htmlFiles, sitemapPaths, existsAsRoute, posix, published: new Set() };
  await hooks.init?.(ctx);

  // --- 1. Contact number: one number, everywhere, in every file ---------------
  for (const file of allFiles) {
    const rel = posix(file);
    if (!TEXT_EXT.test(rel)) continue;
    const text = await readFile(file, 'utf8');
    for (const [link, digits] of text.matchAll(/wa\.me\/(\d+)/g)) {
      if (digits !== NUMBER) fail(`${rel}: wa.me link with a number other than ${NUMBER}: ${link}`);
    }
    for (const [, digits] of text.matchAll(/tel:\+?(\d[\d ]*)/g)) {
      if (digits.replace(/\D/g, '') !== TEL) fail(`${rel}: tel: link with a number other than +${TEL}`);
    }
    if (kit.phone.foreign) {
      for (const [match] of text.matchAll(new RegExp(kit.phone.foreign.source, 'g'))) {
        const digits = match.replace(/\D/g, '');
        const allowed = (kit.phone.allow || []).some((item) => item.digits === digits && rel.startsWith(item.under));
        if (digits !== NUMBER && !allowed) fail(`${rel}: foreign phone number ${match}`);
      }
    }
  }

  // --- 2. Every generated page -------------------------------------------------
  const titles = new Set();
  const text = kit.text || {};
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const rel = posix(file);
    const path = pathOf(rel);
    const intentionallyNoindex = kit.noindexFiles.includes(rel);

    const h1Count = (html.match(/<h1[\s>]/g) || []).length;
    if (h1Count !== 1) fail(`${rel}: expected one H1, found ${h1Count}`);
    if (!/<meta name="viewport"/.test(html)) fail(`${rel}: missing viewport`);
    if (intentionallyNoindex && !/<meta name="robots" content="noindex/.test(html)) fail(`${rel}: should remain noindex`);
    if (!intentionallyNoindex && !/<meta name="robots" content="index,follow">/.test(html)) fail(`${rel}: public page is not indexable`);
    if (!intentionallyNoindex && !sitemapPaths.includes(path)) fail(`${rel}: indexable page missing from sitemap.xml`);
    if (intentionallyNoindex && sitemapPaths.includes(path)) fail(`${rel}: noindex page listed in sitemap.xml`);
    if (text.preparation?.test(html)) fail(`${rel}: contains preparation UI`);
    if (text.placeholders?.test(html)) fail(`${rel}: contains unverified placeholder content`);
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');
    if (text.internalNotes?.test(visible) || /\bTODO\b|\bFIXME\b|\bXXX\b/.test(visible)) fail(`${rel}: internal/editorial note visible to visitors`);
    if (kit.siblings && (html.match(new RegExp(kit.siblings.source, 'g')) || []).length > 1) fail(`${rel}: more than one sibling-site cross-link`);

    if (rel !== '404.html') {
      const title = html.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1] || '';
      if (title.length > 60) fail(`${rel}: title exceeds 60 characters`);
      if (description.length > 155) fail(`${rel}: description exceeds 155 characters`);
      if (titles.has(title)) fail(`${rel}: duplicate title`);
      titles.add(title);
      const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
      if (canonical !== `${kit.siteUrl}${path}`) fail(`${rel}: canonical ${canonical} should be ${kit.siteUrl}${path}`);
      if (!html.includes(NUMBER) || !html.includes(NUMBER_DISPLAY)) fail(`${rel}: configured contact number missing`);
      const jsonBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      if (!jsonBlocks.length) fail(`${rel}: missing JSON-LD`);
      for (const block of jsonBlocks) {
        let data;
        try { data = JSON.parse(block[1]); } catch (error) { fail(`${rel}: invalid JSON-LD (${error.message})`); continue; }
        try { await hooks.jsonLd?.({ rel, path, data, html, ctx }); } catch (error) { fail(`${rel}: JSON-LD check crashed (${error.message})`); }
      }
    }

    for (const [, target] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      if (!existsAsRoute(target)) fail(`${rel}: broken internal target ${target}`);
    }
    // Every wa.me link: configured number and a non-empty text.
    for (const [, rawHref] of html.matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)) {
      const href = rawHref.replace(/&amp;/g, '&');
      if (!href.startsWith(`https://wa.me/${NUMBER}?text=`)) { fail(`${rel}: wa.me link without the configured number and ?text=`); continue; }
      let waText = '';
      try { waText = decodeURIComponent(href.split('?text=')[1]); } catch { fail(`${rel}: wa.me text does not decode`); continue; }
      if (!waText.trim()) fail(`${rel}: wa.me link with empty text`);
    }
    // Performance: inline critical CSS, full CSS non-blocking, deferred JS, LCP preload.
    if (kit.fullCss) {
      const css = kit.fullCss.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!/<style>[^<]{1000,}<\/style>/.test(html)) fail(`${rel}: inline critical CSS missing`);
      if (!new RegExp(`<link rel="stylesheet" href="${css}\\?v=[^"]+" media="print" onload="this\\.media='all'">`).test(html) || !new RegExp(`<noscript><link rel="stylesheet" href="${css}`).test(html)) fail(`${rel}: full stylesheet must load non-blocking (media=print + onload, noscript fallback)`);
    }
    for (const [tag] of html.matchAll(/<link rel="stylesheet"[^>]*>/g)) {
      if (!/media="print"/.test(tag) && !html.includes(`<noscript>${tag}</noscript>`)) fail(`${rel}: render-blocking stylesheet ${tag}`);
    }
    for (const [tag] of html.matchAll(/<script\s[^>]*src=[^>]*>/g)) {
      if (!/\s(?:defer|async)\b/.test(tag)) fail(`${rel}: blocking script ${tag}`);
      if (kit.idleScripts?.test(tag)) fail(`${rel}: ${tag} must load at idle from the site script, not as a script tag`);
    }
    if (kit.minJs && !html.includes(`src="${kit.minJs}?v=`)) fail(`${rel}: ${kit.minJs} missing`);
    const lcpImage = html.match(/<img\s[^>]*fetchpriority="high"[^>]*>/)?.[0];
    if (lcpImage) {
      const srcset = lcpImage.match(/\ssrcset="([^"]+)"/)?.[1];
      const preload = html.match(/<link rel="preload" as="image"[^>]*>/)?.[0] || '';
      if (!preload.includes(`href="${lcpImage.match(/\ssrc="([^"]+)"/)[1]}"`) || (srcset && !preload.includes(`imagesrcset="${srcset}"`))) fail(`${rel}: LCP image needs a matching <link rel="preload" as="image" imagesrcset>`);
    }
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
    await hooks.perPage?.({ rel, path, html, ctx });
  }

  // Sitemap lists only real, indexable routes, once.
  for (const path of sitemapPaths) {
    if (!existsAsRoute(path)) fail(`sitemap.xml: ${path} has no generated page`);
  }
  for (const path of kit.requiredInSitemap || []) {
    if (!sitemapPaths.includes(path)) fail(`sitemap.xml: ${path} must be listed`);
  }
  if (new Set(sitemapPaths).size !== sitemapPaths.length) fail('sitemap.xml: duplicate URL');

  // A route folder without index.html answers 403 on Apache/LiteSpeed (Options -Indexes).
  for (const rel of fileSet) {
    if (!rel.endsWith('/index.html')) continue;
    const parts = rel.split('/').slice(0, -2);
    for (let i = 1; i <= parts.length; i += 1) {
      if (kit.notSite.includes(parts[0])) break;
      const folder = parts.slice(0, i).join('/');
      if (!fileSet.has(`${folder}/index.html`)) fail(`${folder}/: route folder without index.html (would be 403)`);
    }
  }

  // --- 3. Redirects: no published URL may disappear ------------------------------
  const htaccess = await readFile(join(root, '.htaccess'), 'utf8');
  const rules = [...htaccess.matchAll(/^RewriteRule\s+(\S+)\s+(\S+)\s+\[[^\]]*R=301[^\]]*\]/gm)]
    .filter(([, pattern]) => pattern !== '^')
    .map(([, pattern, target]) => ({ regex: new RegExp(pattern), target }));
  for (const rule of rules) {
    if (rule.target.startsWith('/') && !rule.target.includes('$') && !existsAsRoute(rule.target)) fail(`.htaccess: redirect target ${rule.target} does not exist`);
  }
  const redirected = (path) => rules.some((rule) => rule.regex.test(path.replace(/^\//, '')));
  const published = ctx.published;
  if (kit.published?.auditBefore) {
    try {
      const before = JSON.parse(await readFile(join(root, kit.published.auditBefore), 'utf8'));
      for (const page of Object.values(before.pages)) if (page.status === 200 || page.status === 301) published.add(page.path);
    } catch { fail(`${kit.published.auditBefore}: missing (run tools/crawl.mjs on the baseline)`); }
  }
  for (const path of kit.published?.extra || []) published.add(path);
  for (const file of kit.legacySitemaps) {
    try {
      const xml = await readFile(join(root, file), 'utf8');
      for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) published.add(new URL(loc).pathname);
    } catch { /* archive optional */ }
  }
  for (const path of published) {
    if (!existsAsRoute(path) && !redirected(path)) fail(`URL ${path} was published before and now neither exists nor redirects (needs a 301)`);
  }

  // --- 4. Secrets: nothing that looks like a real key anywhere in the repo ----------
  for (const file of allFiles) {
    const rel = posix(file);
    if (!TEXT_EXT.test(rel) && !/\.env/.test(rel)) continue;
    if (/(^|\/)\.env(\.|$)/.test(rel) && !rel.endsWith('.example')) fail(`${rel}: env file must not be committed`);
    const content = await readFile(file, 'utf8');
    if (/vc_(?:live|test)_[A-Za-z0-9_-]{8,}/.test(content)) fail(`${rel}: VenderCRM key detected`);
    if (/\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}|\bre_[A-Za-z0-9]{24,}/.test(content)) fail(`${rel}: Resend key detected`);
    if (/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----(?:\\n|\s)*[A-Za-z0-9+/=]{64,}/.test(content)) fail(`${rel}: private key detected (service-account keys stay outside the repo, GSC_KEY_FILE)`);
  }
  for (const file of kit.privateFiles || []) {
    if (fileSet.has(file)) fail(`${file}: real private config must never be in the repo`);
  }

  // --- 5. Minified assets match their sources; fonts exist; image weight -------------
  for (const [source, minified, type] of kit.minified) {
    try {
      const expected = (type === 'css' ? minifyCss : minifyJs)(await readFile(join(root, source), 'utf8'));
      if ((await readFile(join(root, minified), 'utf8')).trim() !== expected) fail(`${minified} is stale (run the build)`);
    } catch { fail(`${minified}: missing (run the build)`); }
  }
  for (const [source] of kit.minified.filter(([, , type]) => type === 'css')) {
    const css = await readFile(join(root, source), 'utf8');
    for (const [, fontPath] of css.matchAll(/url\("(\/assets\/fonts\/[^"?]+)/g)) {
      if (!fileSet.has(fontPath.slice(1))) fail(`${source}: references a missing font file ${fontPath}`);
    }
  }
  const imageSizes = await Promise.all(allFiles.filter((file) => file.endsWith('.webp')).map(async (file) => ({ file, bytes: (await stat(file)).size })));
  for (const image of imageSizes) {
    if (image.bytes > kit.maxImageBytes) fail(`${posix(image.file)}: image exceeds ${Math.round(kit.maxImageBytes / 1000)} KB`);
  }

  await hooks.afterPages?.(ctx);

  // --- 6. HTTP: every page, denied folders and legacy redirects -----------------------
  const routes = [...sitemapPaths, ...(kit.extraRoutes || [])];
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
      for (const denied of kit.deniedPaths) {
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
    await hooks.http?.(ctx);
  } catch (error) {
    fail(`HTTP checks could not reach ${base} (${error.message}). Start: php -S 127.0.0.1:${kit.port} tools/router.php`);
  }

  if (failures.length) {
    console.error(`QA failed with ${failures.length} issue(s):`);
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }
  const extra = hooks.summary ? `, ${hooks.summary(ctx)}` : '';
  console.log(`QA passed: ${htmlFiles.length} HTML files, ${httpChecked} HTTP routes${extra}, ${published.size} previously published URLs covered, ${imageSizes.length} optimized images.`);
}
