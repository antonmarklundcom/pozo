// Summary of the WhatsApp click log written by wa.php.
//
//   node tools/wa-report.mjs [log-file] [--days 30] [--out docs/seo/wa-report.md]
//
// The log lives outside public_html (default on Hostinger:
// domains/pozo.com.py/private/wa-clicks.log). Download it first, or pass the
// path with POZO_WA_LOG. Exit 2 when there is no log to read.
// Each line: {"ts","page","topic","requested","ref","utm":{utm_source,...}}.
import { readFile, writeFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(name); return i === -1 ? null : args.splice(i, 2)[1]; };
const days = Number(option('--days')) || 0;
const out = option('--out');
const logPath = args[0] || process.env.POZO_WA_LOG;

if (!logPath) {
  console.error('wa-report: no log file. Pass the path (or set POZO_WA_LOG). On Hostinger it is domains/pozo.com.py/private/wa-clicks.log.');
  process.exit(2);
}
let raw = '';
try { raw = await readFile(logPath, 'utf8'); } catch (error) {
  console.error(`wa-report: cannot read ${logPath} (${error.code || error.message}).`);
  process.exit(2);
}

const since = days ? Date.now() - days * 86_400_000 : 0;
let skipped = 0;
const clicks = raw.split('\n').filter(Boolean).flatMap((line) => {
  try {
    const entry = JSON.parse(line);
    return Date.parse(entry.ts) >= since ? [entry] : [];
  } catch { skipped += 1; return []; }
});

function count(key) {
  const map = new Map();
  for (const click of clicks) {
    const value = key(click) || '(ninguno)';
    map.set(value, (map.get(value) || 0) + 1);
  }
  return [...map].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}
const pct = (n) => (clicks.length ? `${Math.round((n / clicks.length) * 100)}%` : '—');
const table = (title, rows, head, limit = 20) => [`## ${title}`, '', `| ${head} | Clicks | Share |`, '|---|---:|---:|', ...rows.slice(0, limit).map(([name, n]) => `| ${String(name).replace(/\|/g, '\\|')} | ${n} | ${pct(n)} |`), ''].join('\n');

const first = clicks[0]?.ts || '—';
const last = clicks.at(-1)?.ts || '—';
const report = [
  '# WhatsApp clicks (wa.php)',
  '',
  `Log: \`${logPath}\` · ${days ? `last ${days} days` : 'all lines'} · ${clicks.length} clicks · ${first} → ${last}${skipped ? ` · ${skipped} unreadable lines skipped` : ''}`,
  '',
  table('By page', count((c) => c.page), 'Page'),
  table('By topic', count((c) => c.topic), 'Topic'),
  table('By page × topic', count((c) => `${c.page} · ${c.topic}`), 'Page · topic', 30),
  table('By referrer host', count((c) => c.ref), 'Referrer'),
  table('By first-touch utm_source / utm_campaign', count((c) => (c.utm?.utm_source ? `${c.utm.utm_source} / ${c.utm.utm_campaign || '—'}` : '')), 'Source / campaign'),
  table('By day (UTC)', count((c) => String(c.ts).slice(0, 10)).sort((a, b) => String(b[0]).localeCompare(String(a[0]))), 'Day', 31),
  `Fallbacks (unknown page or topic in the URL): ${clicks.filter((c) => c.requested === false).length}`,
  '',
].join('\n');

if (out) {
  await writeFile(out, report, 'utf8');
  console.log(`wa-report: ${clicks.length} clicks -> ${out}`);
} else {
  console.log(report);
}
