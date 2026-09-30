// Real-browser check with Playwright at 1366 and 390 px wide.
//
//   php -S 127.0.0.1:<port> tools/router.php
//   node tools/browser-check.mjs [http://127.0.0.1:<port>] [out-dir]
//
// For every sitemap URL plus kit.extraRoutes and a missing URL (404): HTTP status,
// console errors, page errors, failed requests, broken images, <title> and
// one <h1>, horizontal scroll, and a full-page screenshot per width. Site
// specific checks come from the hook module in kit.config.mjs (hooks.browserCheck):
//   perPage({ page, path, viewport, axeFindings }) -> { issues: [], a11y: [] }
//   afterAll({ browser, base, problems })
// Critical CSS: the first screen must lay out the same without kit.fullCss.
// Accessibility: axe-core (WCAG 2.x A/AA rules) on every page and width, plus
// the open launcher with the ficha form; serious/critical findings fail.
// Playwright is not a project dependency: it is resolved from the project,
// then from the global npm root (npm i -g playwright).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { hook, kit, sitemapPaths } from './config.mjs';

const base = (process.argv[2] || kit.localBase).replace(/\/$/, '');
const outDir = process.argv[3] || 'qa-screens';
// Third-party hosts whose failure is reported but does not fail the check
// (the CRM attribution script is blocked in sandboxes without internet).
const THIRD_PARTY = kit.thirdParty || /$^/;
const siteHooks = await hook('browserCheck');

async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* not local */ }
  const globalRoot = execSync('npm root -g').toString().trim();
  return createRequire(join(globalRoot, 'noop.js'))('playwright');
}

const { chromium } = await loadPlaywright();

// axe-core, like Playwright, is a global tool (npm i -g axe-core), never a project dependency.
async function loadAxeSource() {
  const candidates = [];
  try { candidates.push(createRequire(import.meta.url).resolve('axe-core/axe.min.js')); } catch { /* not local */ }
  try { candidates.push(join(execSync('npm root -g').toString().trim(), 'axe-core', 'axe.min.js')); } catch { /* no npm */ }
  for (const file of candidates) {
    try { return await readFile(file, 'utf8'); } catch { /* try next */ }
  }
  console.error('axe-core not found. Install it once as a global tool: npm i -g axe-core');
  process.exit(1);
}
const axeSource = await loadAxeSource();
const AXE_TAGS = kit.axeTags;
async function axeFindings(page, context = 'document') {
  if (!(await page.evaluate(() => typeof window.axe !== 'undefined'))) await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async ({ tags, scope }) => {
    const run = await window.axe.run(scope === 'document' ? document : document.querySelector(scope), { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] });
    return run.violations.map((violation) => ({ id: violation.id, impact: violation.impact, help: violation.help, nodes: violation.nodes.map((node) => node.target.join(' ')).slice(0, 5) }));
  }, { tags: AXE_TAGS, scope: context });
  return result;
}
const launchOptions = process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {};
const browser = await chromium.launch(launchOptions);

const sitemapXml = await (await fetch(`${base}/sitemap.xml`)).text();
const paths = sitemapPaths(sitemapXml);
paths.push(...(kit.extraRoutes || []), '/esta-url-no-existe/');

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
    const a11y = await axeFindings(page);
    const info = await page.evaluate(() => ({
      title: document.title,
      h1: [...document.querySelectorAll('h1')].map((node) => node.textContent.trim()),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      brokenImages: [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute('src')),
      lazyImages: document.images.length,
    }));
    // Site checks (e.g. a contact launcher) from the hook module.
    const extra = siteHooks.perPage ? await siteHooks.perPage({ page, path, viewport, axeFindings }) : {};
    a11y.push(...(extra.a11y || []));
    const expectedStatus = path === '/esta-url-no-existe/' ? 404 : 200;
    const status = response ? response.status() : 0;
    const file = `${viewport.name}${path.replace(/\/$/, '').replace(/\//g, '_') || '_home'}.png`;
    await page.screenshot({ path: join(outDir, file), fullPage: true });
    const record = { viewport: viewport.name, path, status, ...info, consoleErrors, failedRequests, thirdParty, siteIssues: extra.issues || [], a11y, screenshot: join(outDir, file) };
    results.push(record);
    const issues = [];
    if (status !== expectedStatus) issues.push(`HTTP ${status}`);
    if (consoleErrors.length) issues.push(`console: ${consoleErrors.join(' | ')}`);
    if (failedRequests.length) issues.push(`failed requests: ${failedRequests.join(' | ')}`);
    if (info.brokenImages.length) issues.push(`broken images: ${info.brokenImages.join(', ')}`);
    if (!info.title) issues.push('empty <title>');
    if (info.h1.length !== 1) issues.push(`${info.h1.length} <h1>`);
    if (info.scrollWidth > info.innerWidth) issues.push(`horizontal scroll (${info.scrollWidth} > ${info.innerWidth})`);
    issues.push(...(extra.issues || []));
    const blocking = a11y.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    if (blocking.length) issues.push(`accessibility (axe): ${blocking.map((item) => `${item.impact} ${item.id}: ${item.help} [${item.nodes.join(', ')}]`).join(' | ')}`);
    if (issues.length) problems.push(`${viewport.name} ${path}: ${issues.join('; ')}`);
    await page.close();
  }
  await context.close();
}
// Critical CSS: the first screen must lay out the same with only the inlined
// <style> as with the full stylesheet (build.mjs CRITICAL_COMPONENTS).
async function firstScreen(context, path, blockFullCss) {
  const page = await context.newPage();
  if (blockFullCss) await page.route((url) => kit.fullCss && url.pathname === kit.fullCss, (route) => route.abort());
  await page.goto(`${base}${path}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
  await page.evaluate(() => { document.querySelectorAll('.reveal').forEach((node) => node.classList.add('is-in')); window.scrollTo(0, 0); });
  await page.waitForTimeout(200);
  const boxes = await page.evaluate(() => [...document.body.querySelectorAll('*')].map((node) => {
    const rect = node.getBoundingClientRect();
    const name = `${node.tagName.toLowerCase()}${node.className && typeof node.className === 'string' ? `.${node.className.trim().split(/\s+/).join('.')}` : ''}`;
    const shown = rect.width > 0 && rect.height > 0 && node.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true });
    return { name, x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height), visible: shown && rect.top < window.innerHeight && rect.bottom > 0, inside: rect.bottom <= window.innerHeight };
  }));
  await page.close();
  return boxes;
}
for (const viewport of widths) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: !!viewport.isMobile, hasTouch: !!viewport.hasTouch, locale: 'es-PY' });
  await context.route(THIRD_PARTY, (route) => route.abort());
  for (const path of paths) {
    const full = await firstScreen(context, path, false);
    const critical = await firstScreen(context, path, true);
    // Position and width of everything in the first screen must match; height
    // only for elements that end inside it (content below may differ).
    const diffs = full.map((box, index) => [box, critical[index]]).filter(([a, b]) => b && (a.visible || b.visible) && (a.visible !== b.visible || Math.abs(a.x - b.x) > 2 || Math.abs(a.y - b.y) > 2 || Math.abs(a.w - b.w) > 2 || (a.inside && Math.abs(a.h - b.h) > 2)));
    if (full.length !== critical.length) problems.push(`${viewport.name} ${path}: critical CSS check saw a different DOM`);
    else if (diffs.length) problems.push(`${viewport.name} ${path}: first screen differs without the full stylesheet (add the component to the critical CSS list in the build): ${diffs.length} elements, e.g. ${diffs.slice(0, 6).map(([a, b]) => `${a.name} ${a.x},${a.y} ${a.w}x${a.h} vs ${b.x},${b.y} ${b.w}x${b.h}${a.visible !== b.visible ? ' (visibility)' : ''}`).join(' | ')}`);
  }
  await context.close();
}

// Site checks that need their own browser context.
if (siteHooks.afterAll) await siteHooks.afterAll({ browser, base, problems });
await browser.close();

await writeFile(join(outDir, 'browser-check.json'), `${JSON.stringify(results, null, 2)}\n`, 'utf8');
const thirdPartyCount = results.filter((result) => result.thirdParty.length).length;
console.log(`Checked ${paths.length} URLs x ${widths.length} widths. Screenshots and JSON in ${outDir}/.`);
const minor = results.flatMap((result) => result.a11y.filter((item) => item.impact !== 'serious' && item.impact !== 'critical').map((item) => `${result.viewport} ${result.path} ${item.impact} ${item.id}`));
console.log(`Accessibility (axe-core, ${AXE_TAGS.join('/')}): ${results.reduce((sum, result) => sum + result.a11y.filter((item) => item.impact === 'serious' || item.impact === 'critical').length, 0)} serious/critical, ${minor.length} moderate/minor${minor.length ? ` (${[...new Set(minor.map((line) => line.split(' ').slice(2).join(' ')))].join(', ')})` : ''}.`);
if (thirdPartyCount) console.log(`Note: third-party requests failed on ${thirdPartyCount} page loads (CRM attribution script; expected without internet).`);
if (problems.length) {
  console.error(`Browser check failed with ${problems.length} issue(s):`);
  problems.forEach((problem) => console.error(`- ${problem}`));
  process.exit(1);
}
console.log('Browser check passed.');
