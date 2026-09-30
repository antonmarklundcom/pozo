// Zone (city) landing pages. build.mjs renders one page per entry with
// locationPage(); wa-messages.mjs prefills the city in every WhatsApp text.
//
// Adding a zone (see docs/HANDOFF-SONNET.md):
//   - Only for a city that has its own search demand in the keyword-library
//     MCP (one meaning group = one page). Never for brand or competitor terms.
//   - `local` must hold genuinely local content (access corridors, typical lot
//     and street situations, drainage or water-table notes, nearby references).
//     tools/qa.mjs fails a zone page without at least 2 local sections, so no
//     thin city-name swaps get published.
//   - Existing paths never change. A renamed zone keeps its old path as a 301.
//
// Fields: path, city, short (breadcrumb/label), nearby (text), title (<= 60
// chars), description (optional, <= 155), h1 (optional), topic (main CTA
// topic in wa-messages.mjs, default 'desague'), local: [[heading, html], ...],
// faqs: [[q, a], ...] (optional, appended to the shared FAQ).
export const ZONES = [
  {
    path: '/zonas/san-lorenzo/',
    city: 'San Lorenzo',
    short: 'Desagüe en San Lorenzo',
    nearby: 'Fernando de la Mora, Capiatá y Ñemby',
    title: 'Desagüe de pozo ciego en San Lorenzo | Pozo.com.py',
    local: [],
  },
  {
    path: '/zonas/mra/',
    city: 'Mariano Roque Alonso',
    short: 'Desagüe en Mariano Roque Alonso',
    nearby: 'Limpio, Luque y Asunción',
    title: 'Desagüe en Mariano Roque Alonso | Pozo.com.py',
    local: [],
  },
];

// The two launch zones predate the local-content rule; they are grandfathered
// in qa.mjs until Sonnet adds their `local` sections (docs/HANDOFF-SONNET.md).
export const GRANDFATHERED_ZONES = ['/zonas/san-lorenzo/', '/zonas/mra/'];
