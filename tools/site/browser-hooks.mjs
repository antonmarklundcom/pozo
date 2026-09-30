// pozo.com.py checks for tools/kit/browser-check.mjs (kit.config.mjs hooks.browserCheck).

// Every page: the WhatsApp launcher opens and shows five options; on / and
// /contacto/ the open launcher and the ficha form also go through axe.
export async function perPage({ page, path, axeFindings }) {
  const issues = [];
  const a11y = [];
  let launcherOk = true;
  try {
    await page.locator('.wa-launcher__fab').click();
    await page.waitForTimeout(250);
    launcherOk = (await page.locator('.wa-launcher__panel a.wa-option:visible').count()) === 5;
    if (path === '/' || path === '/contacto/') {
      await page.locator('.wa-ficha__toggle').click();
      await page.waitForTimeout(200);
      a11y.push(...(await axeFindings(page, '#wa-launcher')).map((item) => ({ ...item, id: `${item.id} (launcher open)` })));
    }
    await page.keyboard.press('Escape');
  } catch { launcherOk = false; }
  if (!launcherOk) issues.push('WhatsApp launcher did not show 5 options');
  return { issues, a11y };
}

// WhatsApp click tracking: the HTML link is wa.me; a click opens /wa.php?p=&t=.
export async function afterAll({ browser, base, problems }) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: 'es-PY' });
  let tracked = '';
  await context.route('**/wa.php?*', (route) => { tracked = route.request().url(); return route.fulfill({ status: 204, body: '' }); });
  await context.route('https://wa.me/**', (route) => route.fulfill({ status: 204, body: '' }));
  const page = await context.newPage();
  await page.goto(`${base}/servicios/desague/`, { waitUntil: 'load' });
  const link = page.locator('.side-panel a[data-wa-track]').first();
  const before = await link.getAttribute('href');
  const popup = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);
  await link.click();
  await popup;
  await page.waitForTimeout(300);
  const after = await link.getAttribute('href');
  if (!/^https:\/\/wa\.me\//.test(before || '')) problems.push(`wa tracking: link should start as wa.me (got ${before})`);
  if (!/^\/wa\.php\?p=%2Fservicios%2Fdesague%2F&t=desague$/.test(after || '')) problems.push(`wa tracking: clicked link should become /wa.php?p=…&t=… (got ${after})`);
  if (!tracked.includes('/wa.php?p=%2Fservicios%2Fdesague%2F&t=desague')) problems.push(`wa tracking: the click did not request /wa.php (got "${tracked}")`);
  await context.close();
}
