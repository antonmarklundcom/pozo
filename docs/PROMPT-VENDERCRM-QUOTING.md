# Prompt for a new VenderCRM session (Opus 5.5, medium effort)

Paste everything below the line into a new session opened on `antonmarklundcom/vendercrm` (attach it with push access).
Goal of that session: **plan only, no feature code.** Output is a plan that Opus (hard parts) and Sonnet (bulk) can build from later.

---

You are the planner for a new VenderCRM capability: **quote-to-cash for service businesses, starting with pozo.com.py**, designed so every new niche and website is easy to set up. Read `PLAN.md`, `AGENTS.md`, `PLAN-SIFEN.md`, `docs/HANDOFF.md` and the skills in `skills/` first. Then investigate the code, not just the plans: `src/modules/quotes`, `contracts`, `documents`, `renderable-document`, `whatsapp`, `leads`, `forms`, `sites`, `tenancy/verticals.ts`, `automations`, `ai`. Say what exists and works, what is only planned, and what you could not verify. Do not assume.

## The business problem
Pozo.com.py sells water-well drilling in Gran Asunción through a website + WhatsApp. Today quotes, prices and follow-ups live in loose WhatsApp chats and get messy. We want one flow:

1. Visitor uses a price calculator on the site (depth, soil, options), sees a reference price and everything that is included, leaves name + phone.
2. Site server posts the lead to `POST /api/v1/leads` with the calculator inputs and estimate in `fields` (browser never calls the CRM directly; API key stays server-side).
3. The person who handles clients (not a developer) opens the lead in the CRM, creates a **quote** in one click from a niche template, and sends it: **PDF**, **public link `/q/[token]`**, and a **ready-to-copy WhatsApp text**.
4. Client accepts, a **contract** is generated from the same data, payment is recorded and a **receipt** issued. Fiscal e-invoice (SIFEN) stays a later phase; state honestly what blocks it.

## Real numbers (for test data and templates)
- Operator cost: drilling 80.000 Gs/m, installation kit 6.500.000 Gs. Example job 180 m = 20.900.000 Gs. Operator said water is at ~80-90 m in that zone but offered 180 m.
- Public site rates (operator + ~5%): 84.000 Gs/m, kit 6.800.000 Gs. 180 m = 21.920.000 Gs. Rock soil: "a cotizar" (no operator quote).
- Kit includes: 1 hp pump + panel, hydropneumatic tank, pressure switch, gauge, 70 m cable 3x2, 70 m rope, pipes, unions, valve, elbows, flexible hose, 5-way manifold, well cover, tapes, bushing. Drilling includes casing (entubado) and gravel pack (engravado). Verify the last point with the operator before printing it in contracts.
- The site calculator already exists in the `pozo` repo (`/servicios/precio-pozo/`, `PRICES` in `site.config.mjs`). Never expose the operator's own cost.

## Questions to answer with evidence
1. **Documents.** Does the current quote/contract/receipt PDF (`@react-pdf/renderer`) produce a professional, branded, correct document in Spanish with Gs formatting? Render real samples and look at them. What is missing (logo, terms, payment details, signature block, validity, per-line notes)?
2. **Copy-paste text.** Design a "Copiar para WhatsApp" action: short text with emojis and line breaks, generated from the quote (client name, scope, total, what is included, validity, link). Per-niche wording. Where does it live (template per vertical, editable by the tenant)?
3. **WhatsApp inside the CRM.** Confirm how sending works today (Meta Cloud API). Explain the 24-hour customer-service window: free-form messages are allowed only within 24h of the customer's last inbound message; outside it only Meta-approved templates. A website form submission does NOT open a window, so the first outbound message needs an approved template. Propose the minimum template set (e.g. lead received, quote ready with link, follow-up, appointment/visit confirmation, payment received), their Meta category (utility vs marketing) and variables, and how the CRM ships/syncs them per tenant and per language.
4. **Data flow.** How do calculator inputs travel: `fields` on the lead -> deal -> quote lines? Propose the mapping, idempotency, and what happens if the price changed between estimate and quote. Where is the price list the source of truth: the CRM products, the site, or both? Propose one source of truth and how the site reads it.
5. **Client-facing page.** Design the post-submit "thank you" experience on the site (HTML/PHP, Hostinger) that shows the estimate, the full list of what is included, next steps, and a WhatsApp button, and how the public quote page `/q/[token]` continues it. Add an **accept/decline** button (Phase 1 has none) and say what that needs.
6. **Conversion.** Recommend changes to the site form and calculator that raise lead volume and close rate (fewer fields, when to ask for the phone, trust elements, inclusions list, urgency wording, follow-up automation). Rank by expected impact and effort. Flag anything that must be A/B tested rather than assumed.
7. **Contracts and invoices.** What a per-business contract needs (parties, scope, price, payment schedule, warranty, termination, jurisdiction) as a Paraguayan service contract; note this needs legal review, do not present a template as legal advice. Map quote -> contract -> receipt -> later SIFEN invoice, and list the owner-side prerequisites (RUC, certificate, timbrado).

## Multi-niche design (the important part)
We will run many businesses on this: pozo, dentist, tow truck (grua), and others. Every new client and website must be easy to set up. Investigate the existing `verticals` code and propose the best approach, comparing at least:
- **Vertical packs** (config bundle: pipeline stages, products/price list, quote and contract templates, WhatsApp templates, form fields, automations, calculator/intake schema) selectable at tenant creation;
- **AI-assisted onboarding** (Claude reads the client's website/description and drafts the pack, human approves);
- **A generic engine + declarative "intake schema"** so the calculator/form for each niche is data, not code;
- Hybrid options, and anything better you find.
For each: setup time for a new client, cost per setup, failure modes, how it copes with a niche we did not foresee, maintenance burden. Recommend one, and show it applied to three niches: **pozo** (calculator by depth), **dentist** (appointment + treatment budget, booking module), **grua** (urgent, price by km/vehicle, ETA). Define the minimal "site kit" contract so a new HTML/PHP or Node site plugs in: config file, API key, form -> lead mapping, calculator schema, thank-you page.

## Constraints
- Hostinger managed Node.js for the CRM, HTML/PHP shared hosting for sites. No headless Chrome; PDFs stay pure JS.
- Multi-tenant isolation, per-tenant numbering, the 24h-window enforcement and opt-out rules already in the code must not be weakened.
- Spanish (es-PY) first. Guaraní amounts with dot thousands.
- Model policy: plan with Opus 5.5. Do not use Fable. Build phases are Sonnet unless a phase is marked hard (state which and why).

## Deliverables (write to the repo, do not build features)
1. `PLAN-QUOTING.md`: findings (verified vs assumed), architecture, data model deltas, API deltas, the vertical-pack decision with the three niche examples, WhatsApp template set, conversion recommendations, risks, open questions for the owner.
2. Phased build prompts in `prompts/` (same style as existing ones): each phase small, with files it owns, tests, exit criteria, model (Sonnet or Opus), and order. Include a "pozo first" vertical slice that can ship alone.
3. A one-page **owner checklist**: what Anton must provide or decide (final rates, Meta templates to submit, operator confirmations, legal review of the contract).
End with a short summary and the list of things you could not verify.
