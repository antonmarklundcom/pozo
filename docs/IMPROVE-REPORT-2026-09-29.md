# pozo.com.py — improvement report

Branch `claude/awesome-franklin-otvfy7` → PR into `main` (not merged, not deployed).
**Hostinger deploys from `antonmarklundcom/pozo.com.py`: after merging, sync that repo (or point hPanel
Git at `antonmarklundcom/pozo`), otherwise nothing changes live.**

Status: **Phase 1 (Opus) complete.** Phase 2 (Sonnet: keyword research, copy, new pages, polish) pending —
see `docs/HANDOFF-SONNET.md`. Sonnet fills the sections marked *(Sonnet)*.

## 1. What changed (Phase 1)

| Area | Change |
|---|---|
| WhatsApp | All texts moved into one map, `content/wa-messages.mjs` (16 pages × 14 topics). Each text names pozo.com.py and the page, names the service and asks for zona, fotos o medidas and cuándo. The calculator (`site.js`) and the post-form redirect (`contacto.php`) read the same map through the build. The three desagüe chips ("Foto del acceso", "Foto de la tapa", "Distancia en pasos") now send three different texts. The form redirect now includes the zona. |
| Number | 595992279599 only, from `site.config.mjs`. Removed the hard-coded fallback in `contacto.php` (if the generated config were missing, the visitor goes to /gracias/ instead of a wa.me link without a number). `docs/PLAN-V2.md` corrected. The old number appears nowhere in the repo. |
| QA gate | `tools/qa.mjs` rewritten (Windows + Linux): fails on any other phone number in any file (pages, JS, PHP, JSON, docs, tests), on any wa.me link with empty text or without the site/page line, on sitemap ↔ page mismatch, on a route folder without `index.html` (the /zonas/ 403 class of bug), on any previously published URL without a 301, on visible internal notes, on committed keys, on missing srcset files. Negative-tested (injected foreign number + empty text → fails). |
| /zonas/ | Hub rebuilt from `content/zones.mjs`: zone cards, city → service links, 3-question FAQ (FAQPage JSON-LD), correct ItemList of zones (was listing services). Linked from every footer (0 → 14 inbound links). Still in the sitemap. |
| Redirects | 13 new 301s in `.htaccess`: v0 `/pozos-artesianos/precio-metro` and `/tratamiento-agua` (were 404 — the old rules had other spellings) and the 11 v0 `.php` URLs. `/content/` denied from the web. |
| Footer note | "Reemplazalas con fotos verificadas…" removed from the public page; public text is now "Las imágenes del sitio son ilustrativas: no muestran trabajos, equipos ni personal reales." The owner note lives in `docs/CONTENT-NOTES.md`. |
| Cross-links | `content/cross-links.mjs`: one contextual obra.com.py link on each service page (artesiano → /quintas/, precio → /presupuesto/, pozo ciego → /ampliaciones/, séptico → /casas/, pozo lleno → /reformas/, desagüe → /patios/, agua → /piscinas/). QA fails a page with more than one sibling link. |
| Speed | 480/800/1200 px WebP copies + `srcset`/`sizes` on every image; service hero gets `fetchpriority="high"`. Mobile (390 px, DPR 2): home 1727 KB → 1038 KB (images 1511 → 817 KB); /servicios/desague/ 457 → 364 KB. |
| Zones as data | `content/zones.mjs` drives zone pages, footer, hub and WhatsApp zone prefill. New zones need ≥ 2 local sections (QA). |
| Tooling | `tools/crawl.mjs`, `tools/router.php` (emulates .htaccess under `php -S`), `tools/seo-diff.mjs`, `tools/browser-check.mjs` (Playwright 1366 + 390), `tools/form-test.mjs` (CRM + Resend stubbed), `tools/verify.mjs` (all of it, one command). |

## 2. Verification (Phase 1, run 2026-09-30 in the cloud session)

`node tools/verify.mjs` → **all steps passed**:
- Build: 15 pages. QA: 16 HTML files, 15 HTTP routes, 16 map pages, 35 previously published URLs covered, 25 images.
- Crawl: 48 URLs; SEO diff: **0 lost or broken URLs**.
- Playwright, 16 URLs × 1366 and 390: status, 0 console errors, 0 failed first-party requests, 0 broken
  images, one title + one H1, no horizontal scroll, launcher opens with 5 options. (The CRM attribution
  script `crm.clientes.com.py/vc-attribution.js` could not load in the sandbox — egress blocked; reported,
  not counted as a failure.)
- Form (stubs, fake keys): GET 405; honeypot → /gracias/ with no calls; missing consent / bad phone / bad
  email → error redirects; no keys → wa.me/595992279599 with name, phone, service, zona; stubbed keys → CRM
  (X-Api-Key, source, fields zona/pagina/servicio) then Resend (same Idempotency-Key, reply_to, no newline
  in subject), then WhatsApp; repeat submit reuses the idempotency key; ficha → `ficha-rapida` source.

## 3. SEO before / after (Phase 1)

Baseline `docs/seo/audit-before.json` = main @ 57bfa64 through the .htaccess-emulating router (the live
host was unreachable from the cloud; Sonnet S0 re-crawls live). Full diff: `docs/seo/seo-diff.md`.

- Titles, meta descriptions, H1s and canonicals: **unchanged on every page** (no keyword data yet).
- Lost URLs: none. Fixed: 4 URLs 404 → 301; 11 v0 `.php` URLs now 301.
- `/zonas/`: 90 → 327 words, 0 → 14 inbound links, FAQ + correct ItemList.
- Service pages: +17 to +25 words each (the cross-link paragraph).
- Sitemap, robots.txt, canonicals and JSON-LD valid (QA).

*(Sonnet: add the live-crawl comparison and the final before/after after S1–S4.)*

## 4. Known live issues

| Issue | State |
|---|---|
| `/zonas/` 403 and missing from the live sitemap | Fixed in the build (index.html + sitemap + inbound links + QA gate). Most likely the deploy is older than the repo. Needs the deploy sync, then a check that it answers 200. |
| Internal note in the live footer | Fixed in the build; needs deploy. |
| v0 URLs 404 (`/pozos-artesianos/precio-metro`, `/tratamiento-agua`) | Fixed (301); needs deploy. |
| PLAN-V2 number | Fixed. |

## 5. Phase 2 — Sonnet *(to fill in)*

Status 2026-09-30: **S0–S3 blocked in the cloud session; S4 done earlier; no page content changed.**

- S0 live crawl: **not run.** `pozo.com.py` is denied by the cloud environment's network policy (proxy answers
  403 to CONNECT). Run `node tools/crawl.mjs https://pozo.com.py docs/seo/audit-live-before.json` and
  `node tools/seo-diff.mjs docs/seo/audit-before.json docs/seo/audit-live-before.json` from a machine that
  can reach the site (or allow the host in the environment's Network access).
- S1 keyword map: **not done, no evidence.** No keyword-library MCP was connected in the session (none of
  the available connectors is installed). `docs/seo/keyword-map.md` holds the current titles/H1s and the
  hypotheses table with every volume empty. Nothing was invented.
- S2 copy / FAQs / internal links: **not done.** The rule ties copy, title, H1 and question-based FAQs to
  MCP evidence, so rewriting without it would break the brief.
- S3 new pages: **not done.** New zone pages need per-city search demand from the MCP; new service pages
  (biodigestor, camión atmosférico) need the same, and limpieza / bombas / destape need owner confirmation.
- S4 polish: done in the earlier Sonnet session (sticky mobile contact bar, table cards).
- S5 final verify: `node tools/verify.mjs` → **all steps passed** on the branch head before this docs-only
  change (0 lost URLs, Playwright 1366/390 clean, stubbed form test passed). SEO before/after is unchanged
  from section 3.

## 6. Needs a human

1. Merge the PR and sync the deploy repo `antonmarklundcom/pozo.com.py` (or repoint Hostinger Git).
2. After deploy: confirm `/zonas/` = 200 (else check `public_html/zonas/index.html` in File Manager, purge
   cache), resubmit the sitemap in Search Console, request indexing of `/zonas/`.
3. Confirm which extra services are real (limpieza de pozo artesiano, bombas, destape) and the city coverage.
4. Real photos, verified PYG prices, VenderCRM site key, Resend domain verification and `notify_to`.
5. **Unblock S0–S3:** run the session where the keyword-library MCP is connected and `pozo.com.py` is
   reachable (local PC as the plan intended, or add the host to the cloud environment's Network access and
   connect the MCP). Nothing else in the plan depends on a decision.
6. Services still needing the owner's confirmation, so no page exists: limpieza de pozo artesiano, bombas
   para pozo, destape de cañerías.
7. Confirm the obra.com.py target pages are live (they exist in the obra repo: /quintas/, /presupuesto/,
   /ampliaciones/, /casas/, /reformas/, /patios/, /piscinas/).

## Runbook log

Runs of `docs/RUNBOOK-OPUS-THEN-SONNET.md`. One PR per task, merged when green (section 0). All task PRs
come from the session branch `claude/sweet-ptolemy-18qytq` (the cloud session may push only there), reset
to the latest `main` after each merge — this replaces the runbook's `<run>/<task>` branch names.

- **O0 — Land PR #1** (2026-09-30): branch already contained `main`; `node tools/verify.mjs` all green
  (0 lost URLs, Playwright 1366/390, stubbed form test); no checks configured on GitHub; PR mergeable.
  Marked ready and merged with a merge commit (d7d4c3b). Deploy repo `pozo.com.py` untouched.
- **O1 — Guide system**: `content/guides.mjs` (fields, `SERVICE_MEANING_GROUPS`, word counter), guide
  template (TOC, Article + FAQPage + BreadcrumbList JSON-LD, Servicios relacionados), `/guias/` hub built
  only with ≥ 1 published guide (footer link + sitemap follow), "Guías relacionadas" on service pages,
  guide PAGES entries generated in `wa-messages.mjs`. Drafts render to git-ignored `.preview/`.
  qa.mjs: ≥ 700 words, 4–6 FAQs, unique meaningGroup not owned by a service page, template/JSON-LD/TOC
  checks. One draft example shipped. Tested end to end with a temporary published fixture (verify green).

- **O2 — WhatsApp click tracking**: `wa.php?p=&t=` looks the text up in `config/site.generated.php`
  (build now writes the full PAGES × TOPICS table), logs one JSON line (UTC ts, page, topic, referrer host,
  first-touch utm from `vc_attr`; no IP/phone) to `POZO_WA_LOG` / `wa_log` / `private/wa-clicks.log`
  (refuses a path inside the docroot), then 302s to wa.me. Links stay wa.me in HTML; site.js swaps to
  `/wa.php` on click via `data-wa-track`. qa.mjs checks every link's track pair, the 302 text per page, the
  log line format; browser-check clicks a real link. `tools/wa-report.mjs`, privacy page updated.
- **O3 — Lead triage**: contact form and ficha get a "¿Para cuándo?" radio (hoy / esta semana / sin apuro)
  and a Ciudad select (`COVERAGE_CITIES`, moved into `content/zones.mjs`, + "Otra") with an optional
  barrio field. `contacto.php` whitelists the urgency (labels from `FORM_FALLBACK.urgency` via the generated
  config), sends `fields.urgencia`, `fields.zona` (city), `fields.barrio`; Resend subject gets `[URGENTE] `
  for "hoy"; email and WhatsApp text carry urgency and zona (the "¿para cuándo?" ask line only when none
  was chosen). form-test covers hoy / semana / invalid; qa checks both forms. Asset version bumped (also
  covers the O2 site.js change, which had shipped without a bump).
- **O4 — Structured data**: every page's graph now has WebSite (`/#website`), Organization
  (`/#organization`, 512 px PNG logo rendered from the favicon mark, `SITE.sameAs` — empty until the owner
  confirms profiles) and the ProfessionalService (`/#business`, `parentOrganization`, `hasOfferCatalog` of
  the 6 services with serviceType, **no prices**). Service nodes get `@id`, `serviceType` and `areaServed`
  (zone pages: their own city). qa.mjs checks required properties per type, `@id` references, visible FAQ
  count = FAQPage count, breadcrumb ends at the page, and forbids ratings/reviews/prices.
- **O5 — Performance**: critical CSS inlined (build-time extraction by component prefix, `tools/minify.mjs`),
  full `site.min.css` non-blocking, LCP image preload with `imagesrcset`, `vc-attribution.js` at idle,
  minified CSS/JS/HTML; browser-check now fails if the first screen moves > 2 px without the full CSS.
  Slow 4G: FCP ≈ −60 % everywhere, render-blocking 1 → 0, text-LCP pages −55–65 %, hero-image pages +100–310 ms
  (bandwidth contention); regular 4G: every tested page faster. Font subsetting skipped (no tool without
  deps). Details: `docs/perf/PERF-2026-09-30.md`.
- **O6 — Accessibility**: `tools/browser-check.mjs` loads axe-core from the global npm root (like Playwright;
  `npm i -g axe-core`, exits with that hint if missing) and runs WCAG 2.0/2.1/2.2 A+AA rules on every page at
  390 and 1366, plus the open launcher/ficha on `/` and `/contacto/`; serious/critical fail. Findings were
  all colour contrast, fixed: primary button on `--clay-dark` (3.9 → 5.6:1), white eyebrow on the teal closing
  band (3.5 → 5.7:1), light-teal footer ".COM.PY" and estimate eyebrow. Also fixed the consent label layout
  (text and link were separate grid items). Now 0 findings of any impact.
