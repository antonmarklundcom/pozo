# Site kit (`tools/kit/`)

The generic QA and SEO tools of pozo.com.py, packaged so they can be copied into the sibling sites
(obra.com.py, carpinteria.com.py, arq.com.py) or any static HTML + PHP site on Hostinger. Nothing in
`tools/kit/` names a site: every site-specific value lives in **`kit.config.mjs`** at the repo root.
There are no npm dependencies. Node 18+ and PHP 8.1+ are needed, plus two global tools for the
browser check: `npm i -g playwright axe-core`.

## What is in the kit

| File | What it does |
|---|---|
| `config.mjs` | Loads `kit.config.mjs`, fills in defaults, loads hook modules |
| `router.php` | Router for `php -S` that emulates `.htaccess` (301 RewriteRules, RedirectMatch 404, 404.html, 403 for a folder without index.html) |
| `qa-core.mjs` | Generic QA, run by the site's `tools/qa.mjs`. Covers: one H1, robots/sitemap parity, title ≤ 60, description ≤ 155, canonical, JSON-LD parses, broken internal targets, contact number in every file, wa.me number/text, `target=_blank` rel, assets/srcset/img alt+size, route folders, published URLs still 200/301, secrets, fresh `.min` files, image weight, non-blocking CSS/JS, LCP preload, HTTP 200s, denied paths, legacy 301s |
| `crawl.mjs` | SEO crawl of any base URL: sitemap, internal links, `.htaccess` and legacy-sitemap URLs → JSON |
| `seo-diff.mjs` | Before/after diff of two crawls → Markdown (lost URLs, changed titles/H1s/words) |
| `link-graph.mjs` | Orphans, click depth, contextual (`<main>`) inbound links per rule, sibling links → Markdown |
| `browser-check.mjs` | Playwright at 1366/390: status, console errors, broken images, H1, horizontal scroll, screenshots; axe-core WCAG 2.x A/AA (serious/critical fail); first screen identical without the full CSS |
| `form-test.mjs` | Contact handler end to end with VenderCRM and Resend **stubbed**: 405, honeypot, validation, WhatsApp redirect, CRM fields and source, Resend idempotency, ficha, unknown form id |
| `smoke-live.mjs` | Deployed site against the build: sitemap 200s, title/H1/WhatsApp texts equal, JSON-LD, legacy 301s, denied paths; exit 2 if unreachable |
| `perf.mjs` | LCP/FCP/bytes at 390/1366 on a throttled network |
| `gsc-report.mjs` | Search Console page × query CSV + high-impression/low-CTR summary (service-account JWT via `node:crypto`, key from `GSC_KEY_FILE`) |
| `minify.mjs` | CSS/JS/HTML minifiers and critical-CSS extraction by component prefix (used by the build) |
| `verify.mjs` | The chain: build → router → site QA → crawl → link graph → SEO diff → browser check → form test |

`tools/<name>.mjs` and `tools/router.php` in pozo are one-line wrappers, so the documented commands
(`node tools/verify.mjs`, `php -S 127.0.0.1:8765 tools/router.php`, …) keep working.

## Copying it into another site

1. Copy `tools/kit/` and, if you want the same commands, the wrappers `tools/*.mjs` + `tools/router.php`.
2. Write `kit.config.mjs` at the repo root (pozo's file is the worked example; fields below).
3. Write `tools/qa.mjs`, the smallest version being:
   ```js
   import { runQa } from './kit/qa-core.mjs';
   await runQa({});   // add hooks for the site's own rules (see pozo's tools/qa.mjs)
   ```
4. Add hook modules if needed (`tools/site/browser-hooks.mjs`, `tools/site/form-hooks.mjs`).
5. Deny the tooling in `.htaccess`: `RedirectMatch 404 ^/tools/`, and add `kit\.config\.mjs` to the
   list of denied root files.
6. Baseline: `php -S 127.0.0.1:<port> tools/router.php`, then
   `node tools/crawl.mjs http://127.0.0.1:<port> docs/seo/audit-before.json`. After that,
   `node tools/verify.mjs` is the one command.

## `kit.config.mjs` fields

| Field | Used by | Meaning |
|---|---|---|
| `siteUrl` | all | Canonical origin, e.g. `https://pozo.com.py` |
| `hostAliases` | crawl | Other hosts that count as internal (`www.`) |
| `port` | all local tools | Local server port (default 8765) |
| `phone` | qa, smoke | `{ whatsapp, tel, display, foreign: RegExp, allow: [{ digits, under }] }`: the one number, and which other numbers are tolerated where |
| `legacySitemaps` | crawl, qa | Old sitemaps whose URLs must keep answering 200/301 |
| `published` | qa | `{ auditBefore, extra }`: baseline crawl + extra published URLs that need a page or a 301 |
| `thirdParty` | browser-check | RegExp of third-party hosts allowed to fail offline |
| `siblings` | qa, link-graph | RegExp of sibling-site links (max one per page) |
| `noindexFiles`, `extraRoutes`, `requiredInSitemap` | qa, browser-check | Pages that stay noindex, extra routes to test, URLs the sitemap must list |
| `deniedPaths` | qa, smoke | Paths that must answer 404/403 |
| `privateFiles` | qa | Real private config files that must never be committed |
| `text` | qa | `{ preparation, placeholders, internalNotes }` RegExps that must not appear on pages |
| `fullCss`, `minJs`, `minified`, `idleScripts` | qa, browser-check | Performance contract: full stylesheet path (non-blocking), minified JS path, `[source, min, 'css'/'js']` pairs, scripts that must load at idle |
| `perfPaths`, `axeTags`, `maxImageBytes` | perf, browser-check, qa | Defaults for those tools |
| `linkGraph` | link-graph | `{ maxDepth, minContextualIn: [{ pattern, min, label }], hubs: [{ pattern, hub, from, label }] }` |
| `formTest` | form-test | Handler contract: `endpoint`, `thanksPath`, `errorPath` (`{code}`), `logPrefix`, `privateConfigEnv`, `valid` fields, `sources`, `ficha`, `whatsappIncludes`, `crmFields` |
| `hooks` | browser-check, form-test | Module paths: `browserCheck` exports `perPage()` / `afterAll()`; `formTest` exports `extra()` and `label` |
| `verify` | verify | `{ env, build, qa }`: extra env vars (`{tmp}`, `{pid}` placeholders; `{tmp}` files are removed), build command, QA entry |
| `gsc` | gsc-report | `{ site }`: Search Console property, e.g. `sc-domain:pozo.com.py` |

## What stays site-specific in pozo

- `tools/qa.mjs`:
  - the WhatsApp message map (`content/wa-messages.mjs`) and the `data-wa-track` pairs
  - the launcher and triage controls
  - the schema.org rules
  - zones and guides
  - the contact handler strings
  - `/wa.php` over HTTP
- `tools/site/browser-hooks.mjs`: the launcher and the WhatsApp click-tracking test.
- `tools/site/form-hooks.mjs`: the urgency triage scenarios.
- `tools/wa-report.mjs`, `tools/prepare-images.py` and `tools/package-hostinger.py`.
