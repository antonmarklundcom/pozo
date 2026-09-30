// End-to-end test of contacto.php with VenderCRM and Resend STUBBED locally.
// Never uses real keys: the handler gets fake keys and points at a stub
// server on 127.0.0.1, and POZO_CONFIG points at a file that does not exist,
// so no private config is read.
//
//   node tools/form-test.mjs            (needs php on PATH, or PHP_BIN=C:\php\php.exe)
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../site.config.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const PHP = process.env.PHP_BIN || 'php';
const STUB_PORT = 9911;
const WITH_KEYS_PORT = 8791;
const NO_KEYS_PORT = 8792;
const calls = [];
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const stub = createServer((req, res) => {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    calls.push({ url: req.url, headers: req.headers, body: body ? JSON.parse(body) : null });
    if (req.url === '/api/v1/leads') { res.writeHead(201, { 'Content-Type': 'application/json' }); res.end('{"contactId":"c_stub","dealId":"d_stub"}'); return; }
    if (req.url === '/emails') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"id":"email_stub"}'); return; }
    res.writeHead(404); res.end();
  });
});
await new Promise((resolve) => stub.listen(STUB_PORT, '127.0.0.1', resolve));

function startPhp(port, env) {
  const child = spawn(PHP, ['-S', `127.0.0.1:${port}`, join('tools', 'router.php')], {
    cwd: root,
    env: { ...process.env, POZO_CONFIG: join(root, 'tools', 'no-such-private-config.php'), VENDERCRM_CONFIG: join(root, 'tools', 'no-such-legacy-config.php'), ...env },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let log = '';
  child.stderr.on('data', (chunk) => { log += chunk; });
  return { child, log: () => log };
}
const withKeys = startPhp(WITH_KEYS_PORT, {
  VENDERCRM_URL: `http://127.0.0.1:${STUB_PORT}`, VENDERCRM_API_KEY: 'stub-not-a-real-key',
  RESEND_API_BASE: `http://127.0.0.1:${STUB_PORT}`, RESEND_API_KEY: 'stub-not-a-real-key',
  RESEND_FROM: 'Pozo.com.py <test@example.invalid>', LEAD_NOTIFY_TO: 'operator@example.invalid',
});
const noKeys = startPhp(NO_KEYS_PORT, { VENDERCRM_API_KEY: '', RESEND_API_KEY: '' });
await new Promise((resolve) => setTimeout(resolve, 800));

const valid = {
  form_id: 'contacto', page_url: 'https://pozo.com.py/contacto/', website: '', name: 'Prueba Automática',
  phone: '0981 000 000', email: 'visitante@example.invalid', zona: 'San Lorenzo, Barrio Centro',
  service: 'Desagüe de pozo ciego', message: 'Prueba local con stubs. El pozo rebalsa.', consent: '1',
};
async function post(port, fields) {
  const response = await fetch(`http://127.0.0.1:${port}/contacto.php`, {
    method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });
  return { status: response.status, location: response.headers.get('location') || '' };
}
const waText = (location) => decodeURIComponent(location.split('?text=')[1] || '');

try {
  const get = await fetch(`http://127.0.0.1:${WITH_KEYS_PORT}/contacto.php`, { redirect: 'manual' });
  check(get.status === 405, `GET /contacto.php should be 405, got ${get.status}`);

  let r = await post(WITH_KEYS_PORT, { ...valid, website: 'spam' });
  check(r.status === 303 && r.location === '/gracias/', `honeypot should 303 to /gracias/, got ${r.status} ${r.location}`);
  check(calls.length === 0, 'honeypot must not reach CRM or Resend');

  r = await post(WITH_KEYS_PORT, { ...valid, consent: '' });
  check(r.location === '/contacto/?error=campos#lead-form', `missing consent -> ${r.location}`);
  r = await post(WITH_KEYS_PORT, { ...valid, phone: 'abc' });
  check(r.location === '/contacto/?error=telefono#lead-form', `bad phone -> ${r.location}`);
  r = await post(WITH_KEYS_PORT, { ...valid, email: 'no-es-correo' });
  check(r.location === '/contacto/?error=campos#lead-form', `bad email -> ${r.location}`);
  check(calls.length === 0, 'invalid submissions must not reach CRM or Resend');

  // Valid, no keys: straight to WhatsApp with the enquiry.
  r = await post(NO_KEYS_PORT, valid);
  check(r.status === 303 && r.location.startsWith(`https://wa.me/${SITE.whatsapp}?text=`), `no-keys submit should 303 to wa.me/${SITE.whatsapp}, got ${r.location.slice(0, 60)}`);
  const text = waText(r.location);
  check(text.includes('pozo.com.py') && text.includes('formulario de contacto'), 'WhatsApp text must name the site and the form');
  check(text.includes('San Lorenzo, Barrio Centro') && text.includes('Desagüe de pozo ciego') && text.includes('0981 000 000'), 'WhatsApp text must carry zona, service and phone');
  check(calls.length === 0, 'no-keys submit must not call any service');

  // Valid, stubbed keys: CRM then Resend, then WhatsApp.
  r = await post(WITH_KEYS_PORT, valid);
  check(r.location.startsWith(`https://wa.me/${SITE.whatsapp}?text=`), 'stubbed submit must end in WhatsApp');
  const crm = calls.find((call) => call.url === '/api/v1/leads');
  const mail = calls.find((call) => call.url === '/emails');
  check(crm, 'VenderCRM stub was not called');
  check(mail, 'Resend stub was not called');
  if (crm) {
    check(crm.headers['x-api-key'] === 'stub-not-a-real-key', 'CRM call without X-Api-Key');
    check(crm.body.source === 'site:pozo.com.py:contacto', `CRM source ${crm.body.source}`);
    check(crm.body.fields?.zona === valid.zona && crm.body.fields?.pagina === valid.page_url && crm.body.fields?.servicio === valid.service, 'CRM fields zona/pagina/servicio missing');
    check(/^[a-f0-9]{64}$/.test(crm.body.idempotency_key || ''), 'CRM idempotency_key missing');
  }
  if (mail && crm) {
    check(mail.headers['idempotency-key'] === crm.body.idempotency_key, 'Resend Idempotency-Key must equal the CRM key');
    check(mail.body.reply_to === valid.email && mail.body.to?.[0] === 'operator@example.invalid', 'Resend reply_to/to wrong');
    check(!/[\r\n]/.test(mail.body.subject || ''), 'Resend subject contains a newline');
    check(String(mail.body.text).includes('contactId=c_stub'), 'Resend text must carry the CRM result');
  }

  // Same visitor again within the hour: same idempotency key (no duplicate deal/email).
  const before = calls.length;
  await post(WITH_KEYS_PORT, valid);
  const repeat = calls.slice(before).find((call) => call.url === '/api/v1/leads');
  check(repeat && crm && repeat.body.idempotency_key === crm.body.idempotency_key, 'repeat submit must reuse the idempotency key');

  // Ficha rápida from the launcher: own source and intro.
  const beforeFicha = calls.length;
  r = await post(WITH_KEYS_PORT, { ...valid, form_id: 'ficha', page_url: 'https://pozo.com.py/servicios/desague/' });
  const ficha = calls.slice(beforeFicha).find((call) => call.url === '/api/v1/leads');
  check(ficha?.body.source === 'site:pozo.com.py:ficha-rapida', `ficha source ${ficha?.body.source}`);
  check(waText(r.location).includes('ficha rápida (/servicios/desague/)'), 'ficha WhatsApp text must name the ficha and page');

  // Unknown form_id falls back to contacto.
  const beforeUnknown = calls.length;
  await post(WITH_KEYS_PORT, { ...valid, form_id: 'hack' });
  check(calls.slice(beforeUnknown).find((call) => call.url === '/api/v1/leads')?.body.source === 'site:pozo.com.py:contacto', 'unknown form_id must fall back to contacto');
} finally {
  withKeys.child.kill();
  noKeys.child.kill();
  stub.close();
}

const log = withKeys.log() + noKeys.log();
check(/\[pozo\] crm=201 resend=200/.test(log), 'PHP log should show crm=201 resend=200');
check(/\[pozo\] crm=skipped resend=skipped/.test(log), 'PHP log should show crm=skipped resend=skipped for the no-keys server');

if (failures.length) {
  console.error(`Form test failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Form test passed: ${calls.length} stubbed CRM/Resend calls, honeypot, validation, idempotency, ficha and WhatsApp redirect verified.`);
