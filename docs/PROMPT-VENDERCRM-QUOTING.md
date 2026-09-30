# Prompt for a new VenderCRM session (Opus 5.5, medium effort)

Open a new session on `antonmarklundcom/vendercrm` (attach it with push access) and paste everything below the line.
This session PLANS ONLY. It ends with a plan the owner approves; no feature code until then.

---

You are the planner for a new VenderCRM capability: **quote-to-cash for service businesses, starting with pozo.com.py**, designed so every new niche and website is easy to set up.

## Mode
**Plan first. Do not write feature code in this session.** Read, investigate, render samples if needed, write the plan documents, then stop and summarise for the owner's approval. Separate what you VERIFIED in the code from what you ASSUME. Do not trust this prompt's description of VenderCRM: check the code.

Start by reading `PLAN.md`, `AGENTS.md`, `PLAN-SIFEN.md`, `docs/HANDOFF.md`, `skills/vendercrm-lead-capture/` and `skills/vendercrm-ops/`. Then the code: `src/modules/quotes`, `contracts`, `documents`, `renderable-document`, `whatsapp`, `leads`, `forms`, `sites`, `tenancy/verticals.ts`, `automations`, `ai`, `crm`.

## The business problem
Pozo.com.py sells water-well drilling (and blind-well pumping, septic, water treatment) in Gran Asunción through a website + WhatsApp. Quotes, prices and follow-ups currently live in loose WhatsApp chats and get messy. The person who handles clients is not a developer. Target flow:

1. Visitor uses the price calculator on the site, sees a reference price and everything that is included, and leaves name + phone.
2. The site's own server posts the lead to `POST /api/v1/leads` (browser never calls the CRM; the API key stays server-side).
3. The client handler opens the lead, creates a **quote** in one click from a niche template, and sends it as a **PDF**, a **public link `/q/[token]`**, and a **ready-to-copy WhatsApp text**.
4. The client accepts; a **contract** is generated from the same data; payment is recorded; a **receipt** is issued. Fiscal e-invoicing (SIFEN) stays a later phase: say exactly what blocks it.

## What already exists on the pozo.com.py side (live, merged)
- Calculator at `/servicios/precio-pozo/`: depth (m) x rate + installation kit. Rates are in `site.config.mjs` `PRICES`: 84.000 Gs/m (soil "tierra" and "mixto", includes casing and gravel pack), kit 6.800.000 Gs, rock "a cotizar". The price updates live as the visitor types. 100 m = 15.200.000 Gs, 180 m = 21.920.000 Gs.
- Lead form under the estimate posts to `contacto.php` with `form_id=calculadora`. The handler sends to the CRM: `source: "site:pozo.com.py:calculadora"`, `phone`, `name`, `message`, UTM/attribution, and `fields`: `servicio`, `pagina`, `profundidad_m`, `suelo` (tierra|mixto|roca|desconocido), `instalacion_completa` ("sí"|"no"), `estimacion_gs` (integer, the estimate shown to the client). Idempotency key = hash(phone + current hour).
- After submit the visitor lands on `/gracias/?d=<m>&s=<suelo>&i=<0|1>`, which recomputes the estimate client-side from the published rates and shows what is included plus a WhatsApp button. The URL carries no price.
- Other forms: `contacto` and `ficha` (`site:pozo.com.py:contacto`, `site:pozo.com.py:ficha-rapida`). The site also has 10 zone pages and 6 guides.
- Sites are static HTML/PHP on Hostinger shared hosting, no database; the CRM is Node.js on Hostinger.

## Commercial model (owner decisions, encode them)
- For artesian wells the business RESELLS: it buys from a drilling operator and sells to the client at a marked-up price (target margin 5-6% of the sale price, floor 4%, with a minimum fee so small jobs are still worth it). The client deals only with the business.
- Cash flow and risk: take a deposit from the client (about 50%) before the operator starts; pay the operator on completion or by milestones. Warranty and payment terms belong in the contract.
- Small urgent jobs (truck pumping, "desagüe") use a flat fee per job or per contact instead of a percentage.
- A monthly retainer for zone exclusivity is a LATER option, once there is volume.
- So each quote line needs an internal cost (never shown to the client) and a sale price, with margin reporting per quote and per operator. Design how a quote links to an operator/supplier and their price list.

Reference numbers (test data): operator cost 80.000 Gs/m drilling + 6.500.000 Gs installation; a 180 m job costs the business 20.900.000 Gs and sells at 21.920.000 Gs. The kit includes a 1 hp pump + panel, hydropneumatic tank, pressure switch, gauge, 70 m cable 3x2, 70 m rope, pipes, unions, valve, elbows, flexible hose, 5-way manifold, well cover, tapes, bushing. Whether casing and gravel pack sit in the per-metre price or the kit is still to be confirmed with the operator: make the templates editable.

## Questions to answer with evidence
1. **Documents.** Does the current quote/contract/receipt PDF (`@react-pdf/renderer`) produce a professional, branded, correct Spanish document with Gs formatting? Render real samples and look at them. What is missing (logo, terms, payment details, signature block, validity, per-line notes, "what is included" list)?
2. **Copy-paste text.** Design a "Copiar para WhatsApp" action on a quote: short message, line breaks, emojis, built from the quote (client name, scope, total, what is included, validity, link). Per-niche wording, editable by the tenant, Spanish with voseo.
3. **WhatsApp in the CRM.** Confirm how sending works (Meta Cloud API). The 24-hour window: free-form only within 24h of the customer's last inbound message, otherwise only Meta-approved templates. A website form submission does NOT open a window, so the first outbound message to a new lead needs an approved template. Propose the minimum template set (lead received, quote ready with link, follow-up, visit confirmation, payment received), Meta category (utility vs marketing) and variables, and how templates ship and sync per tenant and language.
4. **Data flow.** Map calculator `fields` -> contact -> deal -> quote lines. What happens if prices change between estimate and quote? Where is the price list the source of truth (CRM products vs site)? Propose one source of truth and how the site reads it without a database.
5. **Client-facing pages.** Improve the post-submit experience and design how the public quote page `/q/[token]` continues it. Add accept/decline on the public quote (Phase 1 has none) and say what that needs (audit trail, status, notification).
6. **Conversion.** Recommend site form/calculator changes that raise lead volume and close rate (fewer fields, trust elements, inclusions list, urgency wording, automated follow-up at 1 and 3 days). Rank by impact and effort; flag anything that needs A/B testing, not assumption.
7. **Contracts and invoices.** What a Paraguayan service contract needs (parties, scope, price, deposit and payment schedule, warranty, termination, jurisdiction). State that it needs legal review; do not present a template as legal advice. Map quote -> contract -> receipt -> later SIFEN invoice and list the owner-side prerequisites (RUC, certificate, timbrado). Ask the owner how resale is taxed before designing invoices.

## Multi-niche design (the important part)
Many businesses will run on this: pozo, dentist, tow truck (grua), and others. Every new client and website must be easy to set up. Investigate `verticals` and propose the best approach, comparing at least:
- **Vertical packs** (pipeline stages, products/price list, quote and contract templates, WhatsApp templates, form fields, automations, intake/calculator schema), chosen at tenant creation;
- **AI-assisted onboarding** (Claude reads the client's website/description and drafts the pack, a human approves);
- **A generic engine + declarative intake schema**, so each niche's calculator/form is data, not code;
- Hybrids, and anything better you find.
For each: setup time per new client, cost per setup, failure modes, handling of a niche nobody foresaw, maintenance burden. Recommend one and show it applied to **pozo** (calculator by depth), **dentist** (appointment + treatment budget, booking module) and **grua** (urgent, price by km/vehicle, ETA). Define the minimal **site kit contract** so a new HTML/PHP or Node site plugs in: config file, API key, form -> lead mapping, calculator schema, thank-you page, source naming.

## Constraints
- Hostinger managed Node.js for the CRM, HTML/PHP shared hosting for sites. No headless Chrome; PDFs stay pure JS.
- Keep multi-tenant isolation, per-tenant numbering, the 24h-window enforcement and opt-out rules intact.
- Spanish (es-PY) first. Guaraní amounts with dot thousands (21.920.000 Gs).
- Model policy: plan with Opus 5.5. Do not use Fable. Build phases are Sonnet unless a phase is marked hard (say which and why).
- Do not generate images.

## Deliverables (write to the repo; then STOP for approval)
1. `PLAN-QUOTING.md`: verified findings vs assumptions, architecture, data-model and API deltas, the vertical-pack decision with the three niche examples, WhatsApp template set, margin/cost model, conversion recommendations, risks, open questions.
2. Phased build prompts in `prompts/` in the same style as the existing ones: each phase small, with the files it owns, tests, exit criteria, model (Sonnet or Opus) and order. Include a "pozo first" vertical slice that can ship alone.
3. A one-page **owner checklist**: what Anton must provide or decide (final rates, operator confirmations, Meta templates to submit, tax answer for resale, legal review of the contract).
End with a short summary and a list of what you could not verify.
