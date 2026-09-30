# pozo.com.py — improvement plan (2026-09-30)

Branch `claude/awesome-franklin-otvfy7`, one PR into `main`. Never merge, deploy or push to `main`.
Split: **Opus** built the foundation (done, section 3). **Sonnet 5.5** does keyword research, copy, new
pages and polish in a second window (section 4, prompt in `docs/HANDOFF-SONNET.md`).

## 1. Hard rules (apply to every change)

1. Number **595992279599** only. Links `https://wa.me/595992279599?text=…` and `tel:+595992279599`,
   display `+595 992 279 599`. `node tools/qa.mjs` fails on any other number in any file.
2. Every WhatsApp CTA text comes from **`content/wa-messages.mjs`** (page/service → message). Texts name
   the site and page, name the service, ask for zona / fotos o medidas / cuándo. Spanish, voseo, no prices.
3. SEO: no published URL disappears (QA checks every URL in `docs/seo/audit-before.json` and the v0
   sitemap); moved URLs get a 301 in `.htaccess`. Titles/H1s change **only** with keyword-library MCP
   evidence (meaning groups, one group = one page, no brand/competitor pages).
4. Edit sources (`build.mjs`, `site.config.mjs`, `content/*.mjs`, `assets/`), never generated HTML.
5. Illustrations stay labelled "Imagen ilustrativa". Internal notes go to `docs/CONTENT-NOTES.md`, never on pages.
6. Secrets: only `*.example*` files in git. Form tests use `tools/form-test.mjs` (stubs, fake keys).
7. Every push: `node tools/verify.mjs` green (build, QA, crawl, SEO diff, Playwright 1366/390, form test).

## 2. Audit (before)

Baseline: `docs/seo/audit-before.json` (main @ 57bfa64 served through `tools/router.php`, which emulates
`.htaccess`; the cloud session could not reach the live host). 15 pages, 20 legacy URLs.

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | `/zonas/` 403 on live, missing from live sitemap; **no page linked to it** (0 inbound links) | High | Fixed in repo (hub rebuilt, 14 inbound links, QA gate on route folders); live needs deploy sync |
| 2 | v0 URLs `/pozos-artesianos/precio-metro` and `/tratamiento-agua` return **404** (the .htaccess redirected different spellings); v0 `.php` files unredirected | High | Fixed: 13 new 301s |
| 3 | Footer shows internal note "Reemplazalas con fotos verificadas…" to visitors | Medium | Fixed; note kept in `docs/CONTENT-NOTES.md` |
| 4 | PLAN-V2.md said the number must be a different (wrong) number | Medium | Fixed |
| 5 | WhatsApp texts in 4 places (config, build EXTRA_MESSAGES, site.js, contacto.php); texts didn't ask for timing; desagüe chips all sent the same text | Medium | Fixed: one map, per page × topic |
| 6 | `qa.mjs` only worked on Windows (backslash paths); did not check wa.me text, sitemap parity, redirects | Medium | Rewritten |
| 7 | 2000 px / 1024 px images sent to phones (home 1.7 MB at DPR 2) | Medium | Fixed: srcset, home 1.04 MB |
| 8 | `/zonas/` CollectionPage schema listed the services, not the zones | Low | Fixed |
| 9 | Thin pages: `/zonas/` 90 words, `/servicios/` 246, `/servicios/precio-pozo/` 216; FAQs 1–3 per page | Medium | Zonas done; rest → Sonnet S2 |
| 10 | Zone pages are city-name swaps of one template (thin-content risk) | Medium | Data model + QA gate done; local copy → Sonnet S3 |
| 11 | No keyword research exists for pozo (HANDOVER gate 5) | High | → Sonnet S1 (needs keyword-library MCP, local PC) |

## 3. Opus phase — done

| Area | Files |
|---|---|
| Crawler (any base URL; seeds sitemap, internal links, .htaccess and v0 URLs) | `tools/crawl.mjs` |
| Local router emulating `.htaccess` (301, RedirectMatch 404, 404.html, 403 for index-less folders) | `tools/router.php` |
| Single WhatsApp map + `waText(path, topic)`; calculator and PHP redirect fed from it | `content/wa-messages.mjs`, `build.mjs`, `assets/js/site.js`, `contacto.php`, `config/site.generated.php` |
| Zone pages as data, with a thin-content gate | `content/zones.mjs` |
| One sibling cross-link per service page (obra.com.py, per obra's brief: /quintas/ ↔ pozo) | `content/cross-links.mjs` |
| /zonas/ hub (cards, city → service links, FAQ, correct ItemList); footer links all zones | `build.mjs` |
| QA gates (numbers, wa text, sitemap parity, redirects, route folders, notes, keys, srcset) | `tools/qa.mjs` |
| Playwright 1366/390 check, stubbed form test, SEO diff, one-command verify | `tools/browser-check.mjs`, `tools/form-test.mjs`, `tools/seo-diff.mjs`, `tools/verify.mjs` |
| Responsive images | `tools/prepare-images.py`, `assets/images/*-{480,800,1200}.webp`, `manifest.json` |

## 4. Sonnet phases (in order, same branch, same PR)

### S0 — Live crawl (local PC, where pozo.com.py is reachable)
`node tools/crawl.mjs https://pozo.com.py docs/seo/audit-live-before.json`, then
`node tools/seo-diff.mjs docs/seo/audit-before.json docs/seo/audit-live-before.json`. Expected differences
only: `/zonas/` (403 live). Anything else live-only (extra URL, different title) → add it to the plan and
make sure it keeps a 200 or gets a 301. Commit the live file.

### S1 — Keyword research (keyword-library MCP, project for pozo.com.py)
Produce `docs/seo/keyword-map.md`: meaning group → volume → intent → target URL → title/H1 decision.
One meaning group = one page. Skip brand and competitor phrases. Hypotheses to test (not facts):

| Meaning group (hypothesis) | Seeds | Target if confirmed |
|---|---|---|
| Pozo artesiano (servicio) | pozo artesiano, perforación de pozos, perforación de pozo artesiano | `/servicios/artesiano/` |
| Precio pozo artesiano | precio pozo artesiano, cuánto cuesta un pozo artesiano, precio por metro | `/servicios/precio-pozo/` |
| Desagote / desagüe de pozo ciego | desagote de pozo ciego, desagüe pozo ciego, desagotar pozo | `/servicios/desague/` — **check "desagote" vs "desagüe" volume; the title/H1 may need the higher one** |
| Camión atmosférico | camión atmosférico, servicio atmosférico, atmosférico precio | same page, or new `/servicios/camion-atmosferico/` if it is a separate group |
| Pozo ciego lleno | pozo ciego lleno, pozo ciego rebalsa, olor a pozo ciego | `/servicios/pozo-lleno/` |
| Construcción de pozo ciego | cómo hacer un pozo ciego, medidas de pozo ciego, construcción | `/servicios/pozo-ciego/` |
| Séptico / biodigestor | cámara séptica, pozo séptico, biodigestor, biodigestor precio | `/servicios/septico/`, or new `/servicios/biodigestor/` if separate |
| Tratamiento / análisis de agua | tratamiento agua de pozo, filtro agua de pozo, análisis de agua | `/servicios/agua/` (análisis may split) |
| Limpieza / mantenimiento de pozo artesiano | limpieza de pozo artesiano, pozo artesiano sin agua | NEW page **only if the owner confirms the service** |
| Bomba para pozo | bomba para pozo artesiano, bomba sumergible, cambio de bomba | NEW page **only if the owner confirms** |
| City × service | desagote pozo ciego luque / capiatá / lambaré / fernando de la mora / ñemby / villa elisa / limpio / asunción; pozo artesiano + city | new zone pages via `content/zones.mjs` |

### S2 — Copy, FAQs, internal links on existing pages
- Rewrite for usefulness (what happens, what to send, what changes the budget, safety), voseo, no invented
  facts (see `docs/CONTENT-NOTES.md`). Target ≥ 600 words on service pages, ≥ 450 on `/servicios/`.
- Real FAQs (4–6 per service page) from question-type queries in the MCP data; FAQPage JSON-LD is automatic.
- Contextual internal links in body copy (service ↔ service, service ↔ zone), plus a "Servicios
  relacionados" block. Keep the one sibling cross-link per page from `content/cross-links.mjs`.
- Title/H1 changes only where S1 data supports them; record each old → new in the keyword map.

### S3 — New pages
- Zones: add entries to `content/zones.mjs` with ≥ 2 genuinely local `local` sections each (QA enforces).
  Add `local` sections to San Lorenzo and MRA too, then empty `GRANDFATHERED_ZONES`.
- New service pages: `genericServicePage({...})` in `build.mjs`; add the path to `PAGES` (and a topic in
  `TOPICS` if the service is new) in `content/wa-messages.mjs`; add to `services`, the header menu and the
  footer; add a cross-link entry if one sibling page fits.
- Every new URL lands in the sitemap automatically; QA checks canonical, title ≤ 60, description ≤ 155.

### S4 — Conversion, mobile, design polish
- WhatsApp-first: keep the launcher; consider a slim sticky bottom bar on mobile service pages
  (WhatsApp + Llamar) if it does not cover the launcher — measure with `tools/browser-check.mjs`.
- Price concept table as cards on ≤ 700 px (no horizontal scroll); tap targets ≥ 48 px; contrast ≥ 4.5:1.
- Bump `assetVersion` in `site.config.mjs` whenever CSS/JS changes.

### S5 — Verify and report
`node tools/verify.mjs` green; review `qa-screens/` (1366 + 390); update `docs/seo/seo-diff.md` and
`docs/IMPROVE-REPORT-2026-09-29.md`; push to the same branch (the PR updates itself).

## 5. Owner decisions (not for the agents)

1. Merge the PR, then sync the deploy repo `antonmarklundcom/pozo.com.py` (or point hPanel Git at `pozo`).
2. After deploy: `/zonas/` must answer 200. If it still gives 403, check in Hostinger File Manager that
   `public_html/zonas/index.html` exists (644) and purge the Hostinger/CDN cache. Resubmit `sitemap.xml` in
   Search Console and request indexing of `/zonas/`.
3. Which adjacent services the operator really offers (limpieza de pozo artesiano, bombas, destape de
   cañerías) — decides whether S3 builds those pages.
4. Real photos, verified prices (PYG), VenderCRM key, Resend domain + `notify_to` (README gates).
5. Confirm the 10-city coverage and any extra cities before zone pages are published.
