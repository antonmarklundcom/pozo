# Pozo.com.py

HTML/PHP website prepared for Hostinger shared hosting. Requires PHP 8.1+ (uses `declare(strict_types=1)`, `never` return types and `str_starts_with`).

## Current status

The public pages ship with `DEMO_MODE = false`, `index,follow`, the configured phone/WhatsApp number and no preparation banner. Prices that vary by scope are shown as "A cotizar". The contact form works through WhatsApp even before VenderCRM or Resend credentials are added.

## Publishing checklist

Edit `site.config.mjs`:

1. WhatsApp is configured as `595992279599` and displayed as `+595 992 279 599`. Confirm it on a real phone before launch.
2. Keep `phoneHref`, `phoneDisplay` and `whatsapp` synchronized if the number changes.
3. Keep `leadEmail` empty until a real mailbox has been created and tested; the public site does not show a placeholder address.
4. Replace `null` values in `PRICES` only when verified guaraní prices are available. "A cotizar" is valid for variable work.
5. Run `node build.mjs` so `config/site.generated.php` (the number and CRM URL, read by `contacto.php`) is up to date.
6. Upload and extract the ready ZIP directly inside the domain's `public_html/` folder.
7. Preserve any existing `.well-known` or domain-verification files.
8. After extraction, verify HTTPS, the homepage, `/contacto/`, one form submission, WhatsApp links, `robots.txt` and `sitemap.xml` on the public domain.

## Build and verify

```powershell
node build.mjs            # regenerate pages, sitemap, robots, 404, config/site.generated.php
node tools/verify.mjs     # build + QA + crawl + SEO diff + browser check + stubbed form test
# Windows without php on PATH:  $env:PHP_BIN="C:\php\php.exe"; node tools/verify.mjs
```

The browser check needs two global tools (never project dependencies): `npm i -g playwright axe-core` (Playwright uses its own Chromium; `PW_CHROMIUM_PATH` can point at another one).

Node.js is only used locally to regenerate pages and `config/site.generated.php`. Hostinger serves the generated HTML and executes `contacto.php`.

Where things live:

| What | File |
|---|---|
| Number, hours, prices, asset version | `site.config.mjs` |
| **Every WhatsApp text** (page/service → message, calculator, form redirect) | `content/wa-messages.mjs` |
| Zone pages | `content/zones.mjs` |
| Guides (`/guias/`, drafts preview in `.preview/`) | `content/guides.mjs` |
| One sibling-site cross-link per page | `content/cross-links.mjs` |
| Page templates and copy | `build.mjs` |
| Styles / scripts (edit these; `site.min.*` and the inline critical CSS are generated) | `assets/css/site.css`, `assets/js/site.js` |
| Performance check (LCP, bytes at 390/1366) | `node tools/perf.mjs` → `docs/perf/` |
| Internal editorial notes (never published) | `docs/CONTENT-NOTES.md` |
| SEO baseline, crawl, before/after diff | `docs/seo/` |

`tools/qa.mjs` fails on any phone number other than 595992279599 in any file, on a wa.me link with empty text or without the site/page line, on a previously published URL without a 301, on a route folder without `index.html`, and on internal notes visible to visitors.

## VenderCRM

The form posts to the site's own `contacto.php`; the browser never receives a CRM key. The handler includes phone validation, consent, a honeypot, first-touch campaign attribution, a stable hourly idempotency key and failure logging. A successful form submission is stored in VenderCRM, a notification email is sent through Resend, and the visitor always continues to WhatsApp with the enquiry prefilled.

The CRM base URL defaults to `https://crm.clientes.com.py` (via the generated `config/site.generated.php`). To activate CRM delivery, store the site key server-side using either:

- Environment variable: `VENDERCRM_API_KEY=the-unique-key-created-for-pozo.com.py`
- Private file: copy `docs/pozo-private.example.php` to `domains/pozo.com.py/private/pozo.php`, outside `public_html`, and fill in `vendercrm_key` (and the Resend fields below). The legacy `domains/pozo.com.py/private/vendercrm.php` from v1 is still honoured if present.

Do not put any key in HTML, JavaScript, `.htaccess`, the public website ZIP or this repository. `.htaccess` also denies direct web access to `/config/`, `/docs/`, `/tools/` and `/source-images/`. Until the key is present, the handler redirects the prepared enquiry to WhatsApp. After configuration, test a real submission in VenderCRM Contactos, Pipeline and Sitios, then submit it twice to confirm no duplicate deal is created.

Direct WhatsApp links do not create a VenderCRM contact because a click does not reveal the visitor's phone number. Use the contact form when both CRM capture and WhatsApp continuation are required. Direct WhatsApp clicks can be measured later as analytics events, but they are not complete CRM leads.

## WhatsApp click counter (`wa.php`)

Every wa.me link stays direct in the HTML, so it works without JavaScript. `assets/js/site.js` swaps a link to `/wa.php?p=<page>&t=<topic>` at the moment of the click (from its `data-wa-track` attribute, written by `build.mjs`). `wa.php` looks the text up in `config/site.generated.php` (the full page × topic table from `content/wa-messages.mjs`), appends one JSON line and answers 302 to `https://wa.me/595992279599?text=…`.

- Logged per click: UTC time, page, topic, referrer host, first-touch `utm_*` from the `vc_attr` cookie. Never the IP, user agent or a phone number. The privacy page says so.
- Log file: env `POZO_WA_LOG`, else `wa_log` in `private/pozo.php`, else `domains/pozo.com.py/private/wa-clicks.log`. The handler refuses a path inside `public_html`. The `private/` folder must exist (it already does if `pozo.php` is there).
- Report: download the log, then `node tools/wa-report.mjs wa-clicks.log [--days 30] [--out report.md]` (by page, topic, page × topic, referrer, campaign, day).

## Resend (email notification)

`contacto.php` posts a plain-text and HTML email to `https://api.resend.com/emails` after the VenderCRM step, using the same idempotency key so a double submit cannot send a double email. It is skipped silently (one `error_log` line) if `resend_key` or `notify_to` is empty — the site keeps working with only the WhatsApp fallback, exactly like v1.

Setup:

1. In Resend, add and verify the domain `pozo.com.py` (Domains → Add Domain).
2. Copy the DKIM, SPF and any MX records Resend shows into Hostinger hPanel → Domains → DNS / Nameservers for `pozo.com.py`, and wait for the domain to show "Verified" in Resend. Until then, only `onboarding@resend.dev` sending to the Resend account owner's own mailbox will deliver — fine for a first local test, not for production.
3. Create a Resend API key scoped to **sending access only** (not full access), restricted to the `pozo.com.py` domain if that option is available.
4. Fill in `resend_key`, `resend_from` (must be `@pozo.com.py` once verified) and `notify_to` (the operator's real mailbox, or several separated in the array) in `private/pozo.php`, or set the environment variables `RESEND_API_KEY`, `RESEND_FROM`, `LEAD_NOTIFY_TO` (comma-separated for multiple recipients).
5. `RESEND_API_BASE` can override the API host for local testing against a stub server; it defaults to `https://api.resend.com` and should never be set on Hostinger.

## Local preview

Run `php -S 127.0.0.1:8765 tools/router.php` from this folder. The router emulates the production `.htaccess` (301s, denied folders, `404.html`, 403 for a folder without `index.html`), which plain `php -S` does not. `contacto.php` works through it; test it only with `node tools/form-test.mjs` (CRM and Resend stubbed, fake keys).

## Images

The eight WebP files are optimized versions of the supplied Higgsfield images. Descriptive source copies are kept in `source-images/`, while only the compressed WebP files are deployed. They are explicitly labeled "Imagen ilustrativa". Replace them with verified photos of the real operator, equipment and completed work before using imagery as evidence.

## Legal note

The privacy page describes the actual lead and attribution flow, including the Resend email notification. It references Ley N.º 6534/2020 and the deferred entry into force stated in article 57 of Ley N.º 7593/2025. Obtain professional review when the operating legal entity or processing practices change.

## Hostinger Git deployment

**Deploy source:** Hostinger currently deploys from `antonmarklundcom/pozo.com.py`. Work happens in `antonmarklundcom/pozo`; after a PR here is merged, sync the deploy repo (or point hPanel Git at this repo) — otherwise the live site does not change.

In hPanel → Websites → Git, add repository `https://github.com/antonmarklundcom/pozo.com.py`, branch `main`, install path empty (= `public_html`). Use Auto-deployment via the webhook shown in hPanel, added under GitHub → Settings → Webhooks. Generated HTML is committed, so no build step is needed on the server; run `node build.mjs` locally, commit, push.

- `.htaccess` blocks web access to `.git`, `config/`, `content/`, `docs/`, `tools/`, `build.mjs`, `site.config.mjs` and the README.
- Secrets never live in the repo: put `domains/pozo.com.py/private/pozo.php` on the server (template in `docs/pozo-private.example.php`).
- Backup: `python tools/package-hostinger.py` builds a deploy-only ZIP one folder above the project.
