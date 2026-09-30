# Site audit report (focused run, 2026-09-29/30)

Read-only. Nothing was changed, committed, pushed, or deleted. I only downloaded live pages into a temp folder and started a local PHP server briefly for obra.
Scope: carpinteria.com.py, obra.com.py and arq.com.py in depth, plus the planning docs. The full every-domain sweep (materiales, desarrollo, dentista, ciberseguridad, estudio, electricidad, etc.) was NOT done in this pass.

## Table

| domain | local folder(s) | on GitHub? | local vs GitHub | uncommitted | matches live? | evidence | recommended source of truth |
|---|---|---|---|---|---|---|---|
| carpinteria.com.py | `Documents\Paraguay-Local-Site\carpinteria-com-py-v2` (2026-09-06); `...\carpinteria-com-py` (older v1, 09-03); `C:\Claude 1\carpinteria-com-py` (mirror of v2, 09-06); zips in `_zips\carpinteria-com-py\` and Downloads | NO. `Paraguay-Local-Site` is a git repo with NO remote, and these folders are not tracked in it | n/a (no remote) | 3 untracked entries for the 3 site folders | **exact for 19 of 22 pages; 3 pages 404 live** | v2 homepage, sitemap.xml, site.css and site.js are byte-identical to live. `/vanitorys/`, `/ventanas/` and `/trabajos/` are in the live sitemap but return HTTP 404. All three exist in v2 | `carpinteria-com-py-v2` |
| obra.com.py | `Documents\Paraguay-Local-Site\obra-com-py` (PHP, 2026-09-09); zip `obra-com-py-hostinger-ready-2026-09-09.zip`; old one-pager `C:\Claude 1\obra-com-py` (07-29, superseded); old zips | NO (same no-remote repo, folder untracked) | n/a | untracked | **exact (content); older CSS cache-bust only** | Local PHP output has the same title, description and H1. The sitemap has 56 URLs both locally and live with 0 differences. site.css is byte-identical. Titles match on 8 sampled pages. The only difference is `?v=` (local 1788974112 vs live 1788978479, about 1h more recent live), which is just a build timestamp | `Paraguay-Local-Site\obra-com-py` |
| arq.com.py | `Documents\Paraguay-Local-Site\arq-com-py` (git, branch main); zips in `_zips\arq-com-py\` and Downloads | NO remote | n/a (1 commit not in any upstream) | 0 | **older (live = pre-redesign)** | Live has 17 sitemap URLs and `css?v=20260901`. Your own git log says "producción = pre-rediseño, Fase S sin ejecutar" (2026-09-09). The local main is a later redesign plan and content, not deployed | `arq-com-py` (git), after Fase O2/S |

## Work that exists ONLY on this PC
- `Documents\Paraguay-Local-Site\` is one git repo with no remote (branch `codex/gruas`, 75 uncommitted files, last commit 2026-09-07). Every site in it (obra, carpinteria v1/v2, arq, pozo, ciberseguridad, dentista, desarrollo, estudio, ...) lives only on this PC and the hosting. Codex branches `codex/obra`, `codex/carpinteria` and `codex/arq` are all a single 2026-08-03 commit with 103 files, not the current builds.
- `arq-com-py` has its own .git, also no remote, with the redesign and PLAN.md (1 commit ahead of nothing).
- `C:\Claude 1\carpinteria-com-py` and `C:\Claude 1\obra-com-py` are not git repos (obra is the old 07-29 demo).
- Zips: ~6 obra, ~4 carpinteria, ~5 arq builds in `_zips` and Downloads. These are the only historical versions.

## Secrets and config to keep out of any commit (contents not read)
- `Paraguay-Local-Site\obra-com-py\.env.example` (an example, probably safe, but check it has no real values)
- `Paraguay-Local-Site\arq-com-py\includes\config.php` (real config, do not commit)
- No .env, .sql or credential files found in the carpinteria or obra folders. Other folders were not scanned.

## Planning docs found
- `Downloads\obra-com-py-site-structure.md` (also in `obra-com-py\docs\`): obra page architecture, priorities (/casas/ > /quintas/ > /piscinas/ > /quinchos/), lead routing, 70-term KWP list.
- `Downloads\carpinteria-com-py-site-structure.md`: carpinteria architecture (v2 short URLs, about 20 pages), 60 KWP terms, scope rule (wood and aluminium only, masonry goes to obra).
- **`Downloads\arq-com-py-site-structure.md`**: what arq should have: /planos/, /diseno/ as anchors, /carpeta/, /regularizacion/, /renders/, /interiores/, /estructural/, /comercial/, /estilos/ hub, /minimalista/, /moderna/, /proyectos/, /como-trabajamos/, /cotizar/, plus 60 KWP terms. Live already has all of these pages.
- `Downloads\ARQ-COM-PY-MASTER-BUSINESS-DESIGN-SEO-BRIEF.md` (35 KB, 2026-08-24, also in Codex outputs): the long business, design and SEO brief for arq.
- Also: `arq-image-production-plan.md`, `arq-claude-design-prompt.md`, `arq-visual-bible-v1.md` (Downloads); `Documents\Paraguay-Local-Site\arq-com-py\PLAN.md` (§11 Fases O2/S, current plan); `C:\Claude 1\carpinteria-com-py-audit-2026-09-01.md` (50 KB); `C:\Claude 1\build-locations-carpinteria-obra.md`; `C:\Claude 1\domain-portfolio-2026-09\` (portfolio verdicts).

## Notes
- The obra live site has /guias/ (7 guides), which the structure doc does not list, and no /obras/ portfolio. It matches the local build, so this is a decision in the doc versus the build, not a sync issue.
- Live 404s on 3 carpinteria pages look like an incomplete upload or a hosting rule. The 403/Cloudflare challenge noted earlier is a separate issue.

## Suggested next steps (not done)
1. Create a GitHub repo and push `Paraguay-Local-Site` (after a .gitignore for config.php and .env, and untangling the 75 uncommitted files).
2. Re-upload the 3 missing carpinteria pages.
3. Deploy the arq redesign, or decide arq's next phase.
4. Run the full sweep for the remaining domains.
