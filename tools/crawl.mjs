// SEO crawler: records every reachable URL with status, title, meta
// description, robots, H1, canonical, internal links, WhatsApp/tel links and
// JSON-LD types. No dependencies (Node 18+ fetch).
//
//   node tools/crawl.mjs https://pozo.com.py            docs/seo/audit-live.json
//   node tools/crawl.mjs http://127.0.0.1:8765          docs/seo/audit-after.json
//
// Seeds: "/", every <loc> in /sitemap.xml, the legacy URLs redirected in
// .htaccess, and every internal link found while crawling. Absolute links to
// https://pozo.com.py are treated as internal and mapped onto the crawled base,
// so a local server can be audited with the live canonical URLs.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const base = (process.argv[2] || 'http://127.0.0.1:8765').replace(/\/$/, '');
const out = process.argv[3] || join(root, 'docs', 'seo', 'audit-crawl.json');
const SITE_ORIGIN = 'https://pozo.com.py';
const MAX_PAGES = 400;

const decode = (text = '') => text
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ');
const strip = (html = '') => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function toPath(href, fromPath = '/') {
  if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) return null;
  let url;
  try { url = new URL(href, `${SITE_ORIGIN}${fromPath}`); } catch { return null; }
  const baseHost = new URL(base).host;
  if (url.origin !== SITE_ORIGIN && url.host !== baseHost && url.host !== 'www.pozo.com.py') return null;
  return url.pathname;
}

// Every URL an older version published: the .htaccess redirect sources and the
// v0 (July 2026, PHP) sitemap, whose URLs had no trailing slash.
async function legacySeeds() {
  const seeds = [];
  try {
    const htaccess = await readFile(join(root, '.htaccess'), 'utf8');
    for (const [, from] of htaccess.matchAll(/^RewriteRule \^([a-z0-9/.-]+?)(?:\/\?)?\$\s+(\S+)\s+\[R=301/gim)) {
      seeds.push(`/${from.replace(/\\\./g, '.')}${from.includes('.') ? '' : '/'}`);
    }
  } catch { /* no .htaccess */ }
  try {
    const v0 = await readFile(join(root, 'docs', 'archive', 'v0-php-2026-07', 'sitemap.xml'), 'utf8');
    for (const [, loc] of v0.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const path = new URL(loc).pathname;
      if (path !== '/') seeds.push(path, `${path}/`);
    }
  } catch { /* archive missing */ }
  return [...new Set(seeds)];
}

async function sitemapSeeds() {
  try {
    const res = await fetch(`${base}/sitemap.xml`);
    if (!res.ok) return { status: res.status, urls: [] };
    const xml = await res.text();
    return { status: res.status, urls: [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname) };
  } catch (error) { return { status: 0, error: error.message, urls: [] }; }
}

function parsePage(html, path) {
  const title = strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const description = decode(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] || '');
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i)?.[1] || '';
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] || '';
  const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(([, inner]) => strip(inner));
  const hrefs = [...html.matchAll(/<a\s[^>]*href="([^"]+)"/gi)].map(([, href]) => decode(href));
  const internal = [...new Set(hrefs.map((href) => toPath(href, path)).filter(Boolean))].sort();
  const external = [...new Set(hrefs.filter((href) => /^https?:/i.test(href) && !toPath(href, path) && !/wa\.me/.test(href)))].sort();
  const whatsapp = hrefs.filter((href) => /wa\.me\//.test(href)).map((href) => {
    const number = href.match(/wa\.me\/(\d+)/)?.[1] || '';
    let text = '';
    try { text = decodeURIComponent(new URL(href).searchParams.get('text') || ''); } catch { text = '!!undecodable'; }
    return { number, text };
  });
  const tel = [...new Set(hrefs.filter((href) => href.startsWith('tel:')))];
  const jsonld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, block]) => {
    try {
      const data = JSON.parse(block);
      const items = data['@graph'] || [data];
      return { valid: true, types: items.map((item) => item['@type']) };
    } catch (error) { return { valid: false, error: error.message }; }
  });
  const words = strip(html.match(/<main[\s\S]*?<\/main>/i)?.[0] || '').split(' ').filter(Boolean).length;
  const images = [...html.matchAll(/<img\s[^>]*src="([^"]+)"/gi)].map(([, src]) => src);
  return { title, description, robots, canonical, h1, internal, external, whatsapp, tel, jsonld, words, images };
}

const sitemap = await sitemapSeeds();
const legacy = await legacySeeds();
const queue = ['/', ...sitemap.urls, ...legacy];
const seen = new Set();
const pages = {};

while (queue.length && seen.size < MAX_PAGES) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const record = { path, inSitemap: sitemap.urls.includes(path), legacy: legacy.includes(path) };
  try {
    const res = await fetch(`${base}${path}`, { redirect: 'manual', headers: { 'User-Agent': 'pozo-seo-audit/1.0' } });
    record.status = res.status;
    if (res.status >= 300 && res.status < 400) {
      record.location = res.headers.get('location') || '';
      const next = toPath(record.location, path);
      if (next) queue.push(next);
    } else if ((res.headers.get('content-type') || '').includes('text/html')) {
      Object.assign(record, parsePage(await res.text(), path));
      for (const link of record.internal) {
        if (!seen.has(link) && !/\.(webp|png|jpe?g|svg|css|js|xml|txt|php|woff2)$/i.test(link)) queue.push(link);
      }
    }
  } catch (error) {
    record.status = 0;
    record.error = error.message;
  }
  pages[path] = record;
}

const result = {
  crawledAt: new Date().toISOString(),
  base,
  sitemap: { status: sitemap.status, urls: sitemap.urls },
  pageCount: Object.keys(pages).length,
  pages: Object.fromEntries(Object.entries(pages).sort(([a], [b]) => a.localeCompare(b))),
};
await mkdir(dirname(out), { recursive: true });
await writeFile(out, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
const bad = Object.values(pages).filter((page) => page.status >= 400 || page.status === 0);
console.log(`Crawled ${result.pageCount} URLs from ${base} -> ${out}`);
bad.forEach((page) => console.log(`  ${page.status} ${page.path}${page.error ? ` (${page.error})` : ''}`));
