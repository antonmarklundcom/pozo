# Runbook: Opus run, then Sonnet run (pozo.com.py)

Two sessions, one after the other. **Opus first** (engineering, one PR per task, merged when green),
**then Sonnet** (content and docs, one PR per task, merged when green). The owner only pastes the two
prompts (see the end of this file). Both runs work in Claude Code cloud sessions or on the PC.

## 0. Owner authorisation (read by both runs)

The owner, Anton, **authorises the agent to merge its own PRs into `main` of `antonmarklundcom/pozo`
when they are green**, without waiting for a human review. "Green" means all of:

1. The branch contains the latest `main` (merge `main` in, resolve conflicts, never force-push).
2. `node tools/verify.mjs` passes on the branch head (set `PHP_BIN` if php is not on PATH).
3. GitHub shows the PR as mergeable and every check on it (if any exist) has passed.

Merge with a merge commit (GitHub MCP `merge_pull_request`, or `gh pr merge <n> --merge`). Never
force-push `main`, never rewrite history, never skip or weaken a QA check to get green. If a task cannot
reach green in 3 attempts, close its PR unmerged, write why in the report, and move to the next task.

**Deploy:** Hostinger deploys from `antonmarklundcom/pozo.com.py`. The runs **do not** touch that repo.
If the owner points hPanel Git at `antonmarklundcom/pozo` (branch `main`), every merge deploys by itself.

## 1. Rules for every task

- Number 595992279599 only. Every WhatsApp text lives in `content/wa-messages.mjs`.
- Edit sources (`build.mjs`, `site.config.mjs`, `content/*.mjs`, `assets/`, `tools/`, `contacto.php`,
  `.htaccess`), never generated HTML. Run `node build.mjs`.
- No published URL disappears (301 in `.htaccess`). Titles, H1s and existing copy change **only** with
  keyword-library MCP evidence (meaning groups, one group = one page, no brand or competitor terms).
- No invented facts, prices, reviews, response times or guarantees. AI images keep "Imagen ilustrativa".
- No secrets in git: only `*.example*`. Form tests only with `tools/form-test.mjs` (stubs).
- No GitHub Actions (Actions-minutes budget). No new npm dependencies in the project.
- Each task: branch `<run>/<task>` from the latest `main` → implement → verify → PR → merge when green →
  append 3–6 lines to `docs/IMPROVE-REPORT-2026-09-29.md` section "Runbook log" → next task.
- If something needs the owner, add it to `docs/OWNER-TODO.md` (create it; keep it short) and continue.

## 2. Opus run (order matters; one task at a time)

**O0 — Land PR #1.** Merge `main` into `claude/awesome-franklin-otvfy7`, run verify, merge PR #1 when green.

**O1 — Guide system (`/guias/`).** `content/guides.mjs` (slug, title ≤ 60, description ≤ 155, h1,
meaningGroup, sections, faqs, relatedServices, `draft`), guide template with TOC, Article + FAQPage +
BreadcrumbList JSON-LD, `/guias/` hub (built only when ≥ 1 non-draft guide), "Guías relacionadas" block on
service pages, sitemap, PAGES entries in `wa-messages.mjs` generated from the guides file. qa.mjs: non-draft
guide ≥ 700 words, unique meaningGroup that no service page owns. Ship one `draft: true` example.

**O2 — WhatsApp click tracking.** `/wa.php?p=<path>&t=<topic>`: looks the text up in
`config/site.generated.php` (build writes the full PAGES × TOPICS table), appends one JSON line (UTC time,
page, topic, referrer host, first-touch utm from `vc_attr`; no IP, no phone) to a log outside public_html
(path from env `POZO_WA_LOG` or private config; example in docs), then 302 to
`https://wa.me/595992279599?text=…`. On the site, JS rewrites wa.me hrefs to /wa.php on click only (no-JS
keeps direct wa.me). qa.mjs validates both. `tools/wa-report.mjs` summarises the log. Update privacy page.

**O3 — Lead triage.** Contact form + ficha: "¿Para cuándo?" radio (hoy / esta semana / sin apuro) and a
zona select (zones from `content/zones.mjs` + "Otra"). `contacto.php` sends `fields.urgencia` and
`fields.zona`; Resend subject gets `[URGENTE] ` for "hoy"; WhatsApp redirect text includes urgency (labels
from `FORM_FALLBACK`). Extend `tools/form-test.mjs`.

**O4 — Structured data.** Service with `serviceType` and `areaServed` (zones), `hasOfferCatalog` on the
business (no prices), WebSite + Organization `@id`s, logo, `SITE.sameAs` (empty until the owner fills it).
qa.mjs checks required properties per type. No ratings or reviews.

**O5 — Performance.** Critical CSS inline + rest non-blocking, preload LCP image with `imagesrcset`,
defer `vc-attribution.js` to idle, build-time minification (own small code, no deps), font subsetting only
if a tool is available without project deps. Measure LCP and bytes at 390/1366 before/after in the PR.

**O6 — Accessibility.** Load axe-core from the global npm root (like Playwright) inside
`tools/browser-check.mjs`; fail on serious/critical. Fix all findings.

**O7 — Internal link graph.** From the crawl: orphans, pages > 3 clicks deep, every service page linked
from ≥ 3 pages, every zone from hub + ≥ 1 service page, max one sibling cross-link. Write
`docs/seo/link-graph.md`; fix gaps via build.mjs link blocks (no copy rewrites).

**O8 — Live smoke test.** `tools/smoke-live.mjs https://pozo.com.py`: sitemap URLs 200, legacy URLs 301 to
the right target, denied paths 404, wa.me number + text per page, JSON-LD parses, titles/H1 equal the
build. If the host is unreachable from the session, the tool must say so and exit 2 (not fail the PR).

**O9 — Search Console report tool.** `tools/gsc-report.mjs`, service-account JWT with `node:crypto`,
key path from env `GSC_KEY_FILE` (never committed; `docs/gsc.example.json` with dummy fields). Writes
`docs/seo/gsc-<date>.csv` + a summary of high-impression / low-CTR pages. Without the key: exit 2 with a
clear message; add the key request to `docs/OWNER-TODO.md`.

**O10 — Site kit.** Move the generic tools (crawl, router, seo-diff, browser-check, form-test, generic
qa checks) into `tools/kit/` with a config file so they can be copied into obra/carpinteria/arq.
`docs/SITE-KIT.md`. pozo must stay green. Do not touch other repos.

**O-end.** Update `docs/OWNER-TODO.md` and the report; the Opus run is done.

## 3. Sonnet run (after the Opus run is finished)

Check `docs/IMPROVE-REPORT-2026-09-29.md` "Runbook log": if the Opus run is not finished, stop and say so.

**Keyword gate.** Tasks marked 🔑 need the keyword-library MCP. If it is not connected in the session,
skip every 🔑 task, list them in `docs/OWNER-TODO.md` ("connect the keyword-library MCP or run on the PC"),
and do the rest. Never substitute guesses for keyword data.

**Image gate.** Images only if the owner's launch message contains the words `Generate image`.
Then: load the `anthropic-skills:higgsfield-image-pipeline` skill first; model **GPT Image 2.5, variant
`sunburst`, quality `medium`**, 1k, 16:9 for heroes / 1:1 for cards; generate ONE image, read the credit
cost from the balance before/after, and **stop before the total would exceed 50 credits** (write the
remaining shot list to `docs/HIGGSFIELD-IMAGE-PROMPTS.md` and `docs/OWNER-TODO.md`). Images only for pages
that have none yet; convert with `tools/prepare-images.py`, alt text truthful, label "Imagen ilustrativa".

| # | Task | Gate |
|---|---|---|
| N1 | WhatsApp reply templates for the operator: `docs/WHATSAPP-RESPUESTAS.md`, one per topic in `wa-messages.mjs` + quick-reply shortcuts and labels | none |
| N2 | Google Business Profile pack: `docs/GBP-POZO.md` (categories, services, 750-char description, 12 weekly posts, 10 Q&A from site FAQs, real-photo shot list, review-request text). Use the `anthropic-skills:gbp-optimizer` skill | none |
| N3 | Alt text and captions: accurate, keep "Imagen ilustrativa"; no wording changes elsewhere | none |
| N4 | Copy QA sweep: accents, spelling, voseo consistency, broken sentences, forbidden claims (`docs/CONTENT-NOTES.md`). Fix errors only — no SEO rewording | none |
| N5 | Owner-facing summary refresh: README "where things live", `docs/OWNER-TODO.md` | none |
| N6 | Live crawl S0: `node tools/crawl.mjs https://pozo.com.py docs/seo/audit-live-before.json` + diff vs `audit-before.json`; also `node tools/smoke-live.mjs` | host reachable, else skip + TODO |
| N7 | Keyword map `docs/seo/keyword-map.md` (hypotheses table in `docs/IMPROVE-PLAN-2026-09-30.md` §4 S1) | 🔑 |
| N8 | Stronger copy, 4–6 real FAQs per service page, contextual links, "Servicios relacionados"; title/H1 only where N7 supports it | 🔑 |
| N9 | Guides: 6–8 in `content/guides.mjs` from question queries (≥ 700 words, 4–6 FAQs each) + images if the image gate is open | 🔑 |
| N10 | Zone batch 2 in `content/zones.mjs` (only cities with demand and truthful local content; ≥ 2 local sections; add local sections to San Lorenzo and MRA, empty `GRANDFATHERED_ZONES`) + images if the gate is open | 🔑 |

**N-end.** Final `node tools/verify.mjs`, `node tools/seo-diff.mjs docs/seo/audit-before.json
docs/seo/audit-after.json docs/seo/seo-diff.md`, update the report (what changed, SEO before/after) and
`docs/OWNER-TODO.md` (only what truly needs the owner).
