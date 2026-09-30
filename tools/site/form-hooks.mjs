// pozo.com.py scenarios for tools/kit/form-test.mjs (kit.config.mjs hooks.formTest):
// the "¿Para cuándo?" triage (hoy -> [URGENTE] subject, semana, unknown value).
export const label = 'urgency/zona triage';

export async function extra({ post, calls, check, waText, valid, withKeysPort, noKeysPort }) {
  // No keys: the WhatsApp text carries the chosen urgency instead of asking for it.
  let r = await post(noKeysPort, valid);
  const text = waText(r.location);
  check(text.includes('Para cuándo: hoy') && !text.includes('Para cuándo lo necesito'), 'WhatsApp text must carry the chosen urgency instead of asking for it');

  // hoy: CRM fields, [URGENTE] subject, urgency and zona in the email.
  let mark = calls.length;
  await post(withKeysPort, { ...valid, phone: '0981 000 003' });
  const crm = calls.slice(mark).find((call) => call.url === '/api/v1/leads');
  const mail = calls.slice(mark).find((call) => call.url === '/emails');
  check(crm?.body.fields?.urgencia === 'hoy' && crm?.body.fields?.barrio === 'Barrio Centro', `CRM fields urgencia/barrio wrong (${crm?.body.fields?.urgencia}, ${crm?.body.fields?.barrio})`);
  check(mail && String(mail.body.subject).startsWith('[URGENTE] '), `urgencia=hoy must prefix the subject with [URGENTE] (got ${mail?.body.subject})`);
  check(mail && String(mail.body.text).includes('Para cuándo: hoy') && String(mail.body.text).includes('Ciudad y barrio: San Lorenzo, Barrio Centro'), 'Resend text must carry urgency and zona');

  // Not urgent: no [URGENTE], label "esta semana". Unknown value: ignored, the text asks instead.
  mark = calls.length;
  await post(withKeysPort, { ...valid, urgencia: 'semana', phone: '0981 000 001' });
  const weekMail = calls.slice(mark).find((call) => call.url === '/emails');
  const weekCrm = calls.slice(mark).find((call) => call.url === '/api/v1/leads');
  check(weekMail && !String(weekMail.body.subject).includes('[URGENTE]'), 'urgencia=semana must not mark the subject as urgent');
  check(weekCrm?.body.fields?.urgencia === 'esta semana', `urgencia=semana -> CRM field ${weekCrm?.body.fields?.urgencia}`);
  mark = calls.length;
  r = await post(withKeysPort, { ...valid, urgencia: '<script>', phone: '0981 000 002' });
  const badCrm = calls.slice(mark).find((call) => call.url === '/api/v1/leads');
  check(badCrm && !('urgencia' in (badCrm.body.fields || {})), 'an unknown urgencia value must be dropped');
  check(waText(r.location).includes('Para cuándo lo necesito'), 'without a valid urgency the WhatsApp text must ask for it');
}
