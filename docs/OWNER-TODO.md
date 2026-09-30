# Owner to-do (kept short; agents update this)

Only things an agent cannot do. Everything else is handled by the runbook runs
(`docs/RUNBOOK-OPUS-THEN-SONNET.md`).

## One-time setup (makes everything else automatic)

1. **Deploy from this repo:** hPanel → Websites → pozo.com.py → Git → repository
   `https://github.com/antonmarklundcom/pozo`, branch `main`, install path empty, auto-deploy webhook on.
   After that, every merged PR goes live by itself. (Until then, live keeps serving the old
   `antonmarklundcom/pozo.com.py` repo and none of the fixes, including `/zonas/`, are live.)
2. **Let cloud sessions reach the live site:** Claude Code environment settings → Network access →
   add `pozo.com.py` (needed for the live crawl and smoke test).
3. **Keyword data:** connect the keyword-library MCP to the cloud environment, or run the Sonnet run on
   the PC where it is connected. Without it, keyword-dependent tasks (copy rewrites, new pages, guides)
   are skipped — never guessed.
4. **axe-core for cloud sessions:** the browser check (part of `node tools/verify.mjs`) now runs axe-core
   as a global tool. Cloud containers start without it, so add `npm i -g axe-core` to the environment's
   setup script (Claude Code environment settings → Setup script). Otherwise each session installs it
   first. On the PC, run `npm i -g playwright axe-core` once.
5. **After the first deploy from this repo:** check that `domains/pozo.com.py/private/` exists on
   Hostinger (next to `public_html`). `wa.php` writes the WhatsApp click log `wa-clicks.log` there. The
   folder already exists if `private/pozo.php` is there. Then run
   `node tools/smoke-live.mjs https://pozo.com.py` from the PC; it lists anything the live site still
   serves differently from `main`.

## Business answers (reply in chat whenever)

- Does the operator offer: limpieza de pozo artesiano, bombas (venta/cambio), destape de cañerías?
- Coverage: exactly the 10 cities listed on /zonas/, or more?
- Later: real photos, verified prices (PYG), VenderCRM site key, Resend domain + notify mailbox.
- Official profile URLs of the business (Google Business Profile, Facebook, Instagram), if they exist.
  They go into `SITE.sameAs` in `site.config.mjs` (structured data). It stays empty until you confirm them.

## Search Console key (for `node tools/gsc-report.mjs`)

1. Google Cloud console → a project → enable "Google Search Console API" → IAM → Service accounts →
   create one (no roles needed) → Keys → Add key → JSON. Keep the file **outside** the repo.
2. Search Console → pozo.com.py property → Settings → Users and permissions → add the service account's
   email (`…@….iam.gserviceaccount.com`) with "Restricted" access.
3. Run `GSC_KEY_FILE=/path/key.json node tools/gsc-report.mjs` on the PC (or give a session the key as a
   secret file, never in git). Output: `docs/seo/gsc-<date>.csv` + a high-impression / low-CTR summary.

## Google Business Profile (`docs/GBP-POZO.md`)

Confirmar: nombre comercial real, dirección (o negocio sin local, área de servicio), categoría principal,
horario del domingo, y crear/verificar el perfil. El paquete está listo para copiar y pegar.
