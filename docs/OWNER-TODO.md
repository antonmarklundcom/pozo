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

## Business answers (reply in chat whenever)

- Does the operator offer: limpieza de pozo artesiano, bombas (venta/cambio), destape de cañerías?
- Coverage: exactly the 10 cities listed on /zonas/, or more?
- Later: real photos, verified prices (PYG), VenderCRM site key, Resend domain + notify mailbox.

## Search Console key (for `node tools/gsc-report.mjs`)

1. Google Cloud console → a project → enable "Google Search Console API" → IAM → Service accounts →
   create one (no roles needed) → Keys → Add key → JSON. Keep the file **outside** the repo.
2. Search Console → pozo.com.py property → Settings → Users and permissions → add the service account's
   email (`…@….iam.gserviceaccount.com`) with "Restricted" access.
3. Run `GSC_KEY_FILE=/path/key.json node tools/gsc-report.mjs` on the PC (or give a session the key as a
   secret file, never in git). Output: `docs/seo/gsc-<date>.csv` + a high-impression / low-CTR summary.
