// Before/after SEO diff of two crawl files written by tools/crawl.mjs.
//
//   node tools/seo-diff.mjs docs/seo/audit-before.json docs/seo/audit-after.json [docs/seo/seo-diff.md]
//
// Reports per URL: status, title, meta description, H1, canonical, robots,
// word count, internal links in/out, and flags any URL that was 200/301 before
// and is now missing, 4xx/5xx, or no longer in the sitemap. Exit code 1 when a
// previously published URL disappeared.
import { readFile, writeFile } from 'node:fs/promises';

const [beforePath, afterPath, outPath] = process.argv.slice(2);
if (!beforePath || !afterPath) {
  console.error('usage: node tools/seo-diff.mjs before.json after.json [out.md]');
  process.exit(2);
}
const before = JSON.parse(await readFile(beforePath, 'utf8'));
const after = JSON.parse(await readFile(afterPath, 'utf8'));
const cell = (value) => String(value ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const inbound = (crawl) => {
  const counts = {};
  for (const page of Object.values(crawl.pages)) if (page.status === 200) for (const link of page.internal || []) counts[link] = (counts[link] || 0) + 1;
  return counts;
};
const inBefore = inbound(before);
const inAfter = inbound(after);

const lost = [];
const changed = [];
const added = [];
const fields = ['status', 'location', 'title', 'description', 'h1', 'canonical', 'robots'];

for (const [path, old] of Object.entries(before.pages)) {
  const now = after.pages[path];
  const wasLive = old.status === 200 || old.status === 301;
  if (!now) { if (wasLive) lost.push(`${path}: not reached in the after-crawl`); continue; }
  if (wasLive && (now.status >= 400 || now.status === 0)) lost.push(`${path}: ${old.status} -> ${now.status}`);
  if (old.inSitemap && !now.inSitemap && now.status === 200) lost.push(`${path}: dropped from sitemap.xml`);
  const diffs = [];
  for (const field of fields) {
    const a = Array.isArray(old[field]) ? old[field].join(' / ') : old[field];
    const b = Array.isArray(now[field]) ? now[field].join(' / ') : now[field];
    if ((a || '') !== (b || '')) diffs.push([field, a, b]);
  }
  if (old.words !== undefined && now.words !== undefined && old.words !== now.words) diffs.push(['words', old.words, now.words]);
  if ((inBefore[path] || 0) !== (inAfter[path] || 0)) diffs.push(['inbound links', inBefore[path] || 0, inAfter[path] || 0]);
  if (diffs.length) changed.push([path, diffs]);
}
for (const [path, page] of Object.entries(after.pages)) {
  if (!before.pages[path]) added.push([path, page]);
}

const lines = [
  '# SEO before/after diff',
  '',
  `Before: ${before.base} (${before.crawledAt}, ${before.pageCount} URLs)  `,
  `After: ${after.base} (${after.crawledAt}, ${after.pageCount} URLs)`,
  '',
  `## Lost or broken URLs (${lost.length})`,
  '',
  ...(lost.length ? lost.map((item) => `- ${item}`) : ['None. Every URL that answered 200 or 301 before still does.']),
  '',
  `## New URLs (${added.length})`,
  '',
  ...(added.length ? ['| URL | Status | Title | H1 | In sitemap |', '|---|---|---|---|---|', ...added.map(([path, page]) => `| ${cell(path)} | ${cell(page.status)} | ${cell(page.title)} | ${cell((page.h1 || []).join(' / '))} | ${page.inSitemap ? 'yes' : 'no'} |`)] : ['None.']),
  '',
  `## Changed URLs (${changed.length})`,
  '',
  ...changed.flatMap(([path, diffs]) => [`### ${path}`, '', '| Field | Before | After |', '|---|---|---|', ...diffs.map(([field, a, b]) => `| ${field} | ${cell(a)} | ${cell(b)} |`), '']),
];
const report = `${lines.join('\n')}\n`;
if (outPath) await writeFile(outPath, report, 'utf8');
console.log(report);
process.exit(lost.length ? 1 : 0);
