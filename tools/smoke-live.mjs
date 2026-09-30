// Smoke test of a deployed site against this build.
//
//   node tools/smoke-live.mjs [https://pozo.com.py] [--out docs/seo/smoke-live.md]
//
// Checks, for the given base URL:
//   - every URL in the build's sitemap.xml answers 200 there
//   - every legacy URL (literal RewriteRules in .htaccess) answers 301 to its target
//   - denied paths (config, docs, tools, sources, .git) are not served (404, or 403)
//   - every wa.me link uses 595992279599 and the page carries exactly the build's texts
//   - JSON-LD parses, and <title> / <h1> equal the generated HTML in this repo
// Exit 0 = all good, 1 = differences (listed), 2 = host unreachable from here
// (network error, or a proxy/egress denial). A deploy that lags behind main
// shows up as exit 1: the list says what is still old.
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../site.config.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const out = outIndex === -1 ? '' : args.splice(outIndex, 2)[1];
const base = (args[0] || SITE.url).replace(/\/$/, '');
const TIMEOUT = 15_000;
const problems = [];
const fail = (message) => problems.push(message);

async function get(path, redirect = 'manual') {
  return fetch(`${base}${path}`, { redirect, signal: AbortSignal.timeout(TIMEOUT), headers: { 'User-Agent': 'pozo-smoke-live/1 (+tools/smoke-live.mjs)' } });
}

// --- 0. Reachability ------------------------------------------------------------------
try {
  const probe = await get('/');
  const type = probe.headers.get('content-type') || '';
  if (probe.headers.get('x-deny-reason') || ([403, 407, 502, 503].includes(probe.status) && !type.includes('text/html'))) {
    const reason = probe.headers.get('x-deny-reason') || `HTTP ${probe.status}`;
    console.error(`smoke-live: ${base} is not reachable from this machine (${reason}: ${(await probe.text()).slice(0, 160).trim()}).`);
    console.error('Run it where the site is reachable, or allow the host in the environment\'s network settings.');
    process.exit(2);
  }
} catch (error) {
  console.error(`smoke-live: ${base} is not reachable from this machine (${error.cause?.code || error.name}: ${error.message}).`);
  process.exit(2);
}

const text = (html, pattern) => (html.match(pattern)?.[1] || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const decode = (value) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const localFile = (path) => join(root, path === '/' ? 'index.html' : `${path.slice(1)}index.html`);
const waTexts = (html) => new Set([...html.matchAll(/href="https:\/\/wa\.me\/(\d+)\?text=([^"]*)"/g)].map(([, number, encoded]) => {
  if (number !== SITE.whatsapp) fail(`wa.me link with number ${number}`);
  try { return decodeURIComponent(decode(encoded)); } catch { return '(undecodable)'; }
}));

// --- 1. Sitemap URLs: 200, same title/H1, same WhatsApp texts, JSON-LD parses ---------
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map(([, path]) => path || '/');
let pagesOk = 0;
for (const path of paths) {
  let response;
  try { response = await get(path); } catch (error) { fail(`${path}: request failed (${error.message})`); continue; }
  if (response.status !== 200) { fail(`${path}: HTTP ${response.status}${response.headers.get('location') ? ` -> ${response.headers.get('location')}` : ''} (expected 200)`); continue; }
  const live = await response.text();
  const build = await readFile(localFile(path), 'utf8');
  const before = problems.length;
  for (const [label, pattern] of [['title', /<title>([\s\S]*?)<\/title>/], ['h1', /<h1[^>]*>([\s\S]*?)<\/h1>/]]) {
    const [a, b] = [decode(text(live, pattern)), decode(text(build, pattern))];
    if (a !== b) fail(`${path}: ${label} differs — live "${a}" vs build "${b}"`);
  }
  const [liveWa, buildWa] = [waTexts(live), waTexts(build)];
  const missing = [...buildWa].filter((item) => !liveWa.has(item));
  const extra = [...liveWa].filter((item) => !buildWa.has(item));
  if (missing.length || extra.length) fail(`${path}: WhatsApp texts differ (${missing.length} missing, ${extra.length} not in the build${missing[0] ? `; e.g. missing "${missing[0].split('\n')[0]}"` : ''})`);
  if (!liveWa.size) fail(`${path}: no wa.me link`);
  const blocks = [...live.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) fail(`${path}: no JSON-LD`);
  for (const [, json] of blocks) { try { JSON.parse(json); } catch (error) { fail(`${path}: JSON-LD does not parse (${error.message})`); } }
  if (problems.length === before) pagesOk += 1;
}

// --- 2. Legacy URLs: 301 to the right target ------------------------------------------
const htaccess = await readFile(join(root, '.htaccess'), 'utf8');
const legacy = [];
for (const [, pattern, target] of htaccess.matchAll(/^RewriteRule\s+\^(\S+?)\$\s+(\/\S*)\s+\[[^\]]*R=301[^\]]*\]/gm)) {
  if (/[()[\]*+|]/.test(pattern.replace(/\/\?$/, '').replace(/\\\./g, ''))) continue; // not a literal path
  const literal = `/${pattern.replace(/\/\?$/, '').replace(/\\\./g, '.')}`;
  legacy.push([literal, target]);
  if (pattern.endsWith('/?')) legacy.push([`${literal}/`, target]);
}
let legacyOk = 0;
for (const [from, target] of legacy) {
  try {
    const response = await get(from);
    const location = response.headers.get('location');
    const landed = location ? new URL(location, `${base}/`).pathname : '';
    if (response.status !== 301 || landed !== target) fail(`${from}: expected 301 -> ${target}, got ${response.status}${location ? ` -> ${location}` : ''}`);
    else legacyOk += 1;
  } catch (error) { fail(`${from}: request failed (${error.message})`); }
}

// --- 3. Denied paths ---------------------------------------------------------------------
const denied = ['/config/site.generated.php', '/content/wa-messages.mjs', '/docs/PLAN-V2.md', '/tools/qa.mjs', '/build.mjs', '/site.config.mjs', '/README.md', '/.git/HEAD', '/.gitignore', '/tools/prepare-images.py'];
let deniedOk = 0;
for (const path of denied) {
  try {
    const status = (await get(path)).status;
    if (status !== 404 && status !== 403) fail(`${path}: must not be served (HTTP ${status})`);
    else deniedOk += 1;
  } catch (error) { fail(`${path}: request failed (${error.message})`); }
}

const summary = `smoke-live ${base}: ${pagesOk}/${paths.length} pages match the build, ${legacyOk}/${legacy.length} legacy 301s, ${deniedOk}/${denied.length} denied paths hidden.`;
const report = [`# Live smoke test`, '', `${new Date().toISOString()} · ${summary}`, '', problems.length ? problems.map((problem) => `- ${problem}`).join('\n') : 'No differences.', ''].join('\n');
if (out) await writeFile(out, report, 'utf8');
console.log(summary);
if (problems.length) {
  console.error(`${problems.length} difference(s):`);
  problems.forEach((problem) => console.error(`- ${problem}`));
  process.exit(1);
}
console.log('smoke-live: all checks passed.');
