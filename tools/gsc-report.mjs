// Google Search Console report: page x query performance as CSV, plus a short
// summary of pages with many impressions and a low click-through rate.
//
//   GSC_KEY_FILE=/path/outside/the/repo/key.json node tools/gsc-report.mjs [--days 28] [--site sc-domain:pozo.com.py]
//
// Auth: a Google Cloud service account (JSON key) that was added as a user of
// the Search Console property. The key never goes into git (docs/gsc.example.json
// shows the fields). The JWT is signed with node:crypto: no dependencies.
// Writes docs/seo/gsc-<end date>.csv and docs/seo/gsc-<end date>.md.
// Exit 2 when there is no key (see docs/OWNER-TODO.md); 1 on an API error.
// GSC_API_BASE overrides the API host (local stub tests only).
import { createSign } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i === -1 ? fallback : args[i + 1]; };
const days = Number(option('--days', 28));
const site = option('--site', process.env.GSC_SITE || 'sc-domain:pozo.com.py');
const outDir = option('--out-dir', join(root, 'docs', 'seo'));
const minImpressions = Number(option('--min-impressions', 100));
const apiBase = (process.env.GSC_API_BASE || 'https://searchconsole.googleapis.com').replace(/\/$/, '');

const keyFile = process.env.GSC_KEY_FILE;
if (!keyFile) {
  console.error('gsc-report: no key. Set GSC_KEY_FILE to a service-account JSON key (outside the repo). How to get one: docs/OWNER-TODO.md; fields: docs/gsc.example.json.');
  process.exit(2);
}
let key;
try { key = JSON.parse(await readFile(keyFile, 'utf8')); } catch (error) {
  console.error(`gsc-report: cannot read the key ${keyFile} (${error.code || error.message}).`);
  process.exit(2);
}
if (!key.client_email || !key.private_key || /DUMMY/.test(key.private_key)) {
  console.error('gsc-report: the key file has no client_email/private_key (or is the example file).');
  process.exit(2);
}

const b64url = (value) => Buffer.from(value).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
async function accessToken() {
  const tokenUri = key.token_uri || 'https://oauth2.googleapis.com/token';
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(JSON.stringify({ iss: key.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: tokenUri, iat: now, exp: now + 3600 }))}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) throw new Error(`token request failed (HTTP ${response.status}: ${body.error_description || body.error || 'no token'})`);
  return body.access_token;
}

// Search Console data lags ~2-3 days: the window ends 3 days ago.
const iso = (date) => date.toISOString().slice(0, 10);
const end = new Date(Date.now() - 3 * 86_400_000);
const start = new Date(end.getTime() - (days - 1) * 86_400_000);

let rows = [];
try {
  const token = await accessToken();
  for (let startRow = 0; ; startRow += 25_000) {
    const response = await fetch(`${apiBase}/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: iso(start), endDate: iso(end), dimensions: ['page', 'query'], rowLimit: 25_000, startRow, dataState: 'final' }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Search Analytics query failed (HTTP ${response.status}: ${body.error?.message || 'no details'})`);
    const batch = body.rows || [];
    rows = rows.concat(batch.map((row) => ({ page: row.keys[0], query: row.keys[1], clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position })));
    if (batch.length < 25_000) break;
  }
} catch (error) {
  console.error(`gsc-report: ${error.message}`);
  process.exit(1);
}

// --- CSV --------------------------------------------------------------------------
const csvCell = (value) => (/[",\n]/.test(String(value)) ? `"${String(value).replace(/"/g, '""')}"` : String(value));
const csv = ['page,query,clicks,impressions,ctr,position', ...rows.map((row) => [row.page, row.query, row.clicks, row.impressions, row.ctr.toFixed(4), row.position.toFixed(1)].map(csvCell).join(','))].join('\n');
const csvPath = join(outDir, `gsc-${iso(end)}.csv`);
await writeFile(csvPath, `${csv}\n`, 'utf8');

// --- Summary: many impressions, CTR well under what the position usually gets ------
// Rough organic CTR by position; only used to rank pages, never published.
const expectedCtr = (position) => (position < 1.5 ? 0.28 : position < 2.5 ? 0.15 : position < 3.5 ? 0.1 : position < 5.5 ? 0.07 : position < 10.5 ? 0.03 : 0.01);
const pages = new Map();
for (const row of rows) {
  const page = pages.get(row.page) || { page: row.page, clicks: 0, impressions: 0, weighted: 0, queries: [] };
  page.clicks += row.clicks; page.impressions += row.impressions; page.weighted += row.position * row.impressions;
  page.queries.push(row);
  pages.set(row.page, page);
}
const summaryRows = [...pages.values()].map((page) => ({ ...page, ctr: page.impressions ? page.clicks / page.impressions : 0, position: page.impressions ? page.weighted / page.impressions : 0 }))
  .sort((a, b) => b.impressions - a.impressions);
const flagged = summaryRows.filter((page) => page.impressions >= minImpressions && page.ctr < expectedCtr(page.position) / 2);
const pct = (value) => `${(value * 100).toFixed(1)} %`;
const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0);
const md = [
  `# Search Console — ${site}, ${iso(start)} → ${iso(end)}`,
  '',
  `${rows.length} page × query rows · ${totalClicks} clicks · ${totalImpressions} impressions · CTR ${pct(totalImpressions ? totalClicks / totalImpressions : 0)}. Raw data: \`${csvPath.replace(`${root}/`, '')}\`.`,
  '',
  `## High impressions, low CTR (≥ ${minImpressions} impressions, CTR under half of what the position usually gets)`,
  '',
  flagged.length ? '| Page | Impressions | Clicks | CTR | Avg. position | Top queries |\n|---|---:|---:|---:|---:|---|' : '_None in this window._',
  ...flagged.map((page) => `| ${page.page} | ${page.impressions} | ${page.clicks} | ${pct(page.ctr)} | ${page.position.toFixed(1)} | ${page.queries.sort((a, b) => b.impressions - a.impressions).slice(0, 3).map((q) => `${q.query} (${q.impressions})`).join('; ')} |`),
  '',
  'Title and description changes for these pages still need keyword-library evidence (docs/RUNBOOK-OPUS-THEN-SONNET.md §1).',
  '',
  '## All pages',
  '',
  '| Page | Impressions | Clicks | CTR | Avg. position |',
  '|---|---:|---:|---:|---:|',
  ...summaryRows.map((page) => `| ${page.page} | ${page.impressions} | ${page.clicks} | ${pct(page.ctr)} | ${page.position.toFixed(1)} |`),
  '',
].join('\n');
const mdPath = join(outDir, `gsc-${iso(end)}.md`);
await writeFile(mdPath, md, 'utf8');
console.log(`gsc-report: ${rows.length} rows -> ${csvPath.replace(`${root}/`, '')}, summary -> ${mdPath.replace(`${root}/`, '')} (${flagged.length} high-impression/low-CTR pages).`);
