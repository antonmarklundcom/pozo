// Page weight and LCP at 390 and 1366 px, with a throttled network so the
// numbers mean something on a local server.
//
//   php -S 127.0.0.1:<port> tools/router.php
//   node tools/perf.mjs [http://127.0.0.1:<port>] [out.json] [path ...]   (default paths: kit.perfPaths)
//
// Network: 1.6 Mbps down, 750 kbps up, 150 ms RTT (a slow 4G phone); CPU 4x
// slower on mobile. Bytes are what the local server sent (uncompressed, like a
// host without gzip); "gzip" estimates the compressed size of text responses.
// Third-party requests (the CRM attribution script) are blocked so runs are
// comparable. Playwright comes from the global npm root, like browser-check.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { kit } from './config.mjs';

const args = process.argv.slice(2);
const base = (args[0] || kit.localBase).replace(/\/$/, '');
const out = args[1] || '';
const paths = args.length > 2 ? args.slice(2) : kit.perfPaths;

async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* not local */ }
  const globalRoot = execSync('npm root -g').toString().trim();
  return createRequire(join(globalRoot, 'noop.js'))('playwright');
}
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});

const viewports = [
  { name: '390', width: 390, height: 844, isMobile: true, hasTouch: true, cpu: 4 },
  { name: '1366', width: 1366, height: 900, cpu: 1 },
];
const results = [];
for (const viewport of viewports) {
  for (const path of paths) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: !!viewport.isMobile, hasTouch: !!viewport.hasTouch, deviceScaleFactor: viewport.isMobile ? 2 : 1 });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) => route.abort());
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: viewport.cpu });
    let bytes = 0; let gzip = 0; let requests = 0; let renderBlocking = 0;
    const byType = {};
    page.on('response', async (response) => {
      if (!response.url().startsWith(base)) return;
      try {
        const body = await response.body();
        const type = response.request().resourceType();
        requests += 1; bytes += body.length;
        byType[type] = (byType[type] || 0) + body.length;
        gzip += /document|stylesheet|script|fetch|xhr/.test(type) || /svg|json|xml/.test(response.headers()['content-type'] || '') ? gzipSync(body).length : body.length;
      } catch { /* redirects have no body */ }
    });
    await page.addInitScript(() => {
      window.__lcp = 0;
      new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.__lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await page.goto(`${base}${path}`, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      const blocking = performance.getEntriesByType('resource').filter((entry) => entry.renderBlockingStatus === 'blocking').map((entry) => entry.name);
      return { lcp: Math.round(window.__lcp), fcp: Math.round(fcp ? fcp.startTime : 0), load: Math.round(nav.loadEventEnd), blocking };
    });
    renderBlocking = metrics.blocking.length;
    results.push({ viewport: viewport.name, path, lcpMs: metrics.lcp, fcpMs: metrics.fcp, loadMs: metrics.load, kb: Math.round(bytes / 1024), gzipKb: Math.round(gzip / 1024), requests, renderBlocking, blocking: metrics.blocking, byTypeKb: Object.fromEntries(Object.entries(byType).map(([type, size]) => [type, Math.round(size / 1024)])) });
    await context.close();
  }
}
await browser.close();

console.log('| Width | Page | LCP ms | FCP ms | KB | KB (gzip est.) | Requests | Render-blocking |');
console.log('|---|---|---:|---:|---:|---:|---:|---:|');
for (const r of results) console.log(`| ${r.viewport} | ${r.path} | ${r.lcpMs} | ${r.fcpMs} | ${r.kb} | ${r.gzipKb} | ${r.requests} | ${r.renderBlocking} |`);
if (out) await writeFile(out, `${JSON.stringify({ measuredAt: new Date().toISOString(), base, results }, null, 2)}\n`, 'utf8');
