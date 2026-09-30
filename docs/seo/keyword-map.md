# pozo.com.py — keyword map

**Status (2026-09-30): NOT STARTED — no evidence yet.** The session that was meant to run S1 had no
keyword-library MCP connected (the connector registry offers Semrush, Ubersuggest, OpenRush and others,
none installed in that session) and outbound access to `pozo.com.py` was blocked by the environment's
network policy. The rule "change a title/H1/copy only with keyword-library MCP evidence" therefore holds:
**no title, meta description, H1 or body copy was changed**, and no volume below is a fact.

Fill this file from the MCP (project for pozo.com.py, meaning groups, one group = one page, no brand or
competitor phrases). Every title/H1 change gets one row in the "Change log" section.

## Current on-page state (audit-before.json, main @ 57bfa64)

| URL | `<title>` (before " \| Pozo.com.py") | H1 | Words |
|---|---|---|---|
| `/` | Pozos artesianos y desagüe en Paraguay | Pozos artesianos y desagüe de pozos ciegos en Gran Asunción | 898 |
| `/servicios/` | Servicios de pozos y desagüe | Servicios de pozos, desagüe y agua | 246 |
| `/servicios/artesiano/` | Pozos artesianos en Paraguay | Pozos artesianos en Paraguay | 559 |
| `/servicios/precio-pozo/` | Precio de pozo artesiano por metro | Precio de pozo artesiano por metro | 216 |
| `/servicios/desague/` | Desagüe de pozo ciego en Asunción | Desagüe de pozo ciego | 498 |
| `/servicios/pozo-ciego/` | Pozos ciegos en Asunción | Pozos ciegos: construcción y mantenimiento | 463 |
| `/servicios/pozo-lleno/` | Pozo ciego lleno: qué hacer | Pozo ciego lleno: señales y qué hacer | 448 |
| `/servicios/septico/` | Pozos sépticos y biodigestores | Pozos sépticos, cámaras y biodigestores | 448 |
| `/servicios/agua/` | Tratamiento de agua de pozo | Tratamiento de agua de pozo | 443 |
| `/zonas/` | Zonas de cobertura en Gran Asunción | Zonas de cobertura | 90 |
| `/zonas/san-lorenzo/` | Desagüe de pozo ciego en San Lorenzo | Desagüe de pozo ciego en San Lorenzo | 368 |
| `/zonas/mra/` | Desagüe en Mariano Roque Alonso | Desagüe de pozo ciego en Mariano Roque Alonso | 374 |

## Meaning groups — hypotheses, all UNVERIFIED

| Group | Seeds to query | Volume | Intent | Target URL if confirmed | Title/H1 decision |
|---|---|---|---|---|---|
| Pozo artesiano (servicio) | pozo artesiano, perforación de pozos, perforación de pozo artesiano | — | — | `/servicios/artesiano/` | keep until data |
| Precio pozo artesiano | precio pozo artesiano, cuánto cuesta un pozo artesiano, precio por metro | — | — | `/servicios/precio-pozo/` | keep until data |
| Desagote / desagüe de pozo ciego | desagote de pozo ciego, desagüe pozo ciego, desagotar pozo | — | — | `/servicios/desague/` | **decide desagote vs desagüe by volume** |
| Camión atmosférico | camión atmosférico, servicio atmosférico, atmosférico precio | — | — | same page, or new page if a separate group | open |
| Pozo ciego lleno | pozo ciego lleno, pozo ciego rebalsa, olor a pozo ciego | — | — | `/servicios/pozo-lleno/` | keep until data |
| Construcción de pozo ciego | cómo hacer un pozo ciego, medidas de pozo ciego | — | — | `/servicios/pozo-ciego/` | keep until data |
| Séptico / biodigestor | cámara séptica, pozo séptico, biodigestor, biodigestor precio | — | — | `/servicios/septico/`, or new `/servicios/biodigestor/` | open |
| Tratamiento / análisis de agua | tratamiento agua de pozo, filtro agua de pozo, análisis de agua | — | — | `/servicios/agua/` | keep until data |
| Limpieza de pozo artesiano | limpieza de pozo artesiano, pozo artesiano sin agua | — | — | **no page** until the owner confirms the service | blocked (owner) |
| Bomba para pozo | bomba para pozo artesiano, bomba sumergible | — | — | **no page** until the owner confirms | blocked (owner) |
| City × service | desagote pozo ciego + luque / capiatá / lambaré / fernando de la mora / ñemby / villa elisa / limpio / asunción; pozo artesiano + city | — | — | new entries in `content/zones.mjs` (≥ 2 real local sections each) | open |

## Change log (old → new title/H1, with the MCP figure that supports it)

_Empty. No change has been made._
