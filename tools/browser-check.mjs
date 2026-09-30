// Real-browser check with Playwright at 1366 and 390 px wide.
//
//   php -S 127.0.0.1:8765 tools/router.php
//   node tools/browser-check.mjs [http://127.0.0.1:8765] [out-dir]
//
// For every sitemap URL plus /gracias/ and a missing URL (404): HTTP status,
// console errors, page errors, failed requests, broken images, <title> and
// one <h1>, horizontal scroll, and a full-page screenshot per width. Also
// opens the WhatsApp launcher and checks its five options are visible.
// Playwright is not a project dependency: it is resolved from the project,
// then from the global npm root (npm i -g playwright).
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const base = (process.argv[2] || 'http://127.0.0.1:8765').replace(/\/$/, '');
const outDir = process.argv[3] || 'qa-screens';
// Third-party hosts whose failure is reported but does not fail the check
// (the CRM attribution script is blocked in sandboxes without internet).
const THIRD_PARTY = /crm\.clientes\.com\.py/;

async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* not local */ }
  const globalRoot = execSync('npm root -g').toString().trim();
  return createRequire(join(globalRoot, 'noop.js'))('playwright');
}

const { chromium } = await loadPlaywright();
const launchOptions = process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {};
const browser = await chromium.launch(launchOptions);

const sitemapXml = await (await fetch(`${base}/sitemap.xml`)).text();
const paths = [...sitemapXml.matchAll(/<loc>https:\/\/pozo\.com\.py([^<]*)<\/loc>/g)].map(([, path]) => path);
paths.push('/gracias/', '/esta-url-no-existe/');

const widths = [{ name: 'desktop', width: 1366, height: 900 }, { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true }];
const results = [];
const problems = [];
await mkdir(outDir, { recursive: true });

for (const viewport of widths) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: !!viewport.isMobile, hasTouch: !!viewport.hasTouch, locale: 'es-PY' });
  for (const path of paths) {
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    const thirdParty = [];
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      const source = message.location()?.url || '';
      // Resource-load errors are covered by the request listeners below; keep
      // them out of consoleErrors so a blocked third-party host or the
      // intentional 404 document does not count twice.
      if (/^Failed to load resource/.test(message.text()) && (THIRD_PARTY.test(source) || source === `${base}${path}`)) return;
      consoleErrors.push(`${message.text()}${source ? ` (${source})` : ''}`);
    });
    page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) => (THIRD_PARTY.test(request.url()) ? thirdParty : failedRequests).push(`${request.url()} (${request.failure()?.errorText})`));
    page.on('response', (response) => {
      if (response.status() >= 400 && response.url() !== `${base}${path}`) (THIRD_PARTY.test(response.url()) ? thirdParty : failedRequests).push(`${response.url()} (HTTP ${response.status()})`);
    });
    const response = await page.goto(`${base}${path}`, { waitUntil: 'load' });
    // Scroll through the page so scroll-reveal content is in its final state.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += Math.round(window.innerHeight * 0.7)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      window.scrollTo(0, 0);
      // Full-page captures can miss the last reveal transitions: settle them.
      document.querySelectorAll('.reveal').forEach((node) => node.classList.add('is-in'));
    });
    await page.waitForTimeout(500);
    const info = await page.evaluate(() => ({
      title: document.title,
      h1: [...document.querySelectorAll('h1')].map((node) => node.textContent.trim()),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      brokenImages: [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute('src')),
      lazyImages: document.images.length,
    }));
    // The launcher must open and show five WhatsApp options.
    let launcherOk = true;
    try {
      await page.locator('.wa-launcher__fab').click();
      await page.waitForTimeout(250);
      launcherOk = (await page.locator('.wa-launcher__panel a.wa-option:visible').count()) === 5;
      await page.keyboard.press('Escape');
    } catch { launcherOk = false; }
    const expectedStatus = path === '/esta-url-no-existe/' ? 404 : 200;
    const status = response ? response.status() : 0;
    const file = `${viewport.name}${path.replace(/\/$/, '').replace(/\//g, '_') || '_home'}.png`;
    await page.screenshot({ path: join(outDir, file), fullPage: true });
    const record = { viewport: viewport.name, path, status, ...info, consoleErrors, failedRequests, thirdParty, launcherOk, screenshot: join(outDir, file) };
    results.push(record);
    const issues = [];
    if (status !== expectedStatus) issues.push(`HTTP ${status}`);
    if (consoleErrors.length) issues.push(`console: ${consoleErrors.join(' | ')}`);
    if (failedRequests.length) issues.push(`failed requests: ${failedRequests.join(' | ')}`);
    if (info.brokenImages.length) issues.push(`broken images: ${info.brokenImages.join(', ')}`);
    if (!info.title) issues.push('empty <title>');
    if (info.h1.length !== 1) issues.push(`${info.h1.length} <h1>`);
    if (info.scrollWidth > info.innerWidth) issues.push(`horizontal scroll (${info.scrollWidth} > ${info.innerWidth})`);
    if (!launcherOk) issues.push('WhatsApp launcher did not show 5 options');
    if (issues.length) problems.push(`${viewport.name} ${path}: ${issues.join('; ')}`);
    await page.close();
  }
  await context.close();
}
await browser.close();

await writeFile(join(outDir, 'browser-check.json'), `${JSON.stringify(results, null, 2)}\n`, 'utf8');
const thirdPartyCount = results.filter((result) => result.thirdParty.length).length;
console.log(`Checked ${paths.length} URLs x ${widths.length} widths. Screenshots and JSON in ${outDir}/.`);
if (thirdPartyCount) console.log(`Note: third-party requests failed on ${thirdPartyCount} page loads (CRM attribution script; expected without internet).`);
if (problems.length) {
  console.error(`Browser check failed with ${problems.length} issue(s):`);
  problems.forEach((problem) => console.error(`- ${problem}`));
  process.exit(1);
}
console.log('Browser check passed.');
