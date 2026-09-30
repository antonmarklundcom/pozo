# Handoff to Sonnet 5.5 (second window)

Paste the block below into a new Claude Code session **on the PC** (it needs the keyword-library MCP,
`C:\php\php.exe` and network access to pozo.com.py, which the cloud session did not have).

```
You continue the pozo.com.py improvement. Opus already built the foundation on branch
claude/awesome-franklin-otvfy7 of https://github.com/antonmarklundcom/pozo and opened a PR into main.
Your job: phases S0–S5 in docs/IMPROVE-PLAN-2026-09-30.md. Do NOT merge, deploy or push to main.

SETUP
1. Clone fresh into an EMPTY folder:
     git clone https://github.com/antonmarklundcom/pozo pozo-s && cd pozo-s
     git checkout claude/awesome-franklin-otvfy7
2. Read, in this order: docs/IMPROVE-PLAN-2026-09-30.md, docs/IMPROVE-REPORT-2026-09-29.md,
   README.md, content/wa-messages.mjs, content/zones.mjs, content/cross-links.mjs, docs/CONTENT-NOTES.md.
3. $env:PHP_BIN="C:\php\php.exe"; node tools/verify.mjs   -> must end "verify: all steps passed".
   (Playwright: if it is not installed, npm i -g playwright once. No project dependencies.)

HARD RULES (tools/qa.mjs enforces most of them)
- Only number 595992279599 (wa.me/595992279599, tel:+595992279599, display "+595 992 279 599").
- Every WhatsApp text lives in content/wa-messages.mjs. New page -> add its path to PAGES; new service ->
  add a TOPIC. Texts: Spanish, Paraguay voseo, name the site + page + service, ask for zona, fotos o
  medidas and cuándo. No prices (PYG only, and no price is verified today).
- Edit build.mjs / site.config.mjs / content/*.mjs / assets, never the generated HTML. Run node build.mjs.
- No published URL may disappear; moved URL = 301 in .htaccess.
- Change a title/H1 ONLY with keyword-library MCP evidence (project for pozo.com.py, meaning groups,
  one group = one page, no brand or competitor phrases). Log every change in docs/seo/keyword-map.md.
- SEO division: pozo = pozos artesianos, pozos ciegos, desagüe/camión atmosférico, pozo lleno, séptico,
  tratamiento de agua + zones. Construction work (casas, quintas, piscinas, reformas...) belongs to
  obra.com.py; design/planos to arq.com.py. At most ONE sibling cross-link per page (content/cross-links.mjs).
- Do not invent facts (prices, response times, guarantees, "24/7", "gratis", potabilidad, team, reviews).
  AI images stay labelled "Imagen ilustrativa". Internal notes go in docs/CONTENT-NOTES.md, never on a page.
- Secrets: never print, commit or invent keys. Form tests only via node tools/form-test.mjs (stubs).
- Services the owner has not confirmed (limpieza de pozo artesiano, bombas, destape) get NO page:
  list them under "needs a human" in the report instead.

WORK (details in the plan)
S0 node tools/crawl.mjs https://pozo.com.py docs/seo/audit-live-before.json ; diff it against
   docs/seo/audit-before.json with tools/seo-diff.mjs. Only /zonas/ should differ. Commit.
S1 Keyword map with the MCP -> docs/seo/keyword-map.md (hypotheses table in the plan). Commit.
S2 Stronger copy, 4–6 real FAQs per service page, contextual internal links, "Servicios relacionados".
S3 New zone pages (content/zones.mjs, >= 2 genuinely local sections each; add local sections to San
   Lorenzo and MRA and empty GRANDFATHERED_ZONES) and new service pages the data justifies.
S4 Mobile/conversion polish (price table as cards <= 700px, tap targets, optional sticky WhatsApp bar
   on mobile service pages). Bump assetVersion when CSS/JS changes.
S5 node tools/verify.mjs green. Look at qa-screens/*.png (1366 and 390). Update docs/seo/seo-diff.md
   (before = docs/seo/audit-before.json) and fill the Sonnet sections of docs/IMPROVE-REPORT-2026-09-29.md.

Commit small, push to the same branch (git push -u origin claude/awesome-franklin-otvfy7); the PR
updates itself. Final message: what changed, SEO before/after summary, what still needs a human.
```

## Where the Opus phase stopped (why these are Sonnet's)

- Keyword research needs the keyword-library MCP, which is only configured on the PC.
- The live crawl needs network access to pozo.com.py (blocked by the cloud egress policy).
- Copy, FAQs and new pages depend on the keyword map, so they come after S1.
