// Guides (/guias/<slug>/): informational pages that answer one question-type
// search, each in its own meaning group. build.mjs renders every non-draft
// guide with a table of contents and Article + FAQPage + BreadcrumbList
// JSON-LD, builds the /guias/ hub once at least one guide is published, adds a
// "Guías relacionadas" block to the service pages listed in relatedServices,
// and wa-messages.mjs gives each guide its own PAGES entry.
//
// Adding a guide (Sonnet run, task N9):
//   - Only for a question group that exists in the keyword-library MCP data
//     (docs/seo/keyword-map.md). One meaning group = one page: a guide may not
//     reuse a group owned by a service page (SERVICE_MEANING_GROUPS) or by
//     another guide. Never brand or competitor phrases.
//   - Same writing rules as the rest of the site: voseo, no invented prices,
//     response times, guarantees or potability claims (docs/CONTENT-NOTES.md).
//   - tools/qa.mjs fails a published guide under 700 words (intro + sections +
//     FAQs), a title over 60 or a description over 155 characters, a duplicate
//     or service-owned meaningGroup, or a relatedServices path that is not a page.
//   - `draft: true` keeps a guide off the site (no page, no sitemap, no links).
//     build.mjs still renders drafts to .preview/guias/<slug>/ (git-ignored) so
//     the template is checked by qa.mjs and can be opened locally.
//   - A published slug never changes. A renamed guide keeps its old path as a 301.
//
// Fields: slug, title (<= 60, include " | Pozo.com.py"), description (<= 155),
// h1, short (breadcrumb/WhatsApp label, optional, defaults to h1), meaningGroup,
// lead, intro, sections: [[heading, html], ...], faqs: [[q, a], ...] (4-6),
// relatedServices: ['/servicios/...'], topic (main WhatsApp topic, optional,
// defaults to the first related service's topic), image + alt (optional,
// an assets/images/*.webp that keeps the "Imagen ilustrativa" caption),
// published / updated (YYYY-MM-DD), draft.

// Meaning groups already owned by a service page (see docs/seo/keyword-map.md).
// A guide must pick a different group. Update this map when the keyword map
// moves a group to another page.
export const SERVICE_MEANING_GROUPS = {
  '/servicios/artesiano/': 'Pozo artesiano (servicio)',
  '/servicios/precio-pozo/': 'Precio pozo artesiano',
  '/servicios/desague/': 'Desagote / desagüe de pozo ciego',
  '/servicios/pozo-lleno/': 'Pozo ciego lleno',
  '/servicios/pozo-ciego/': 'Construcción de pozo ciego',
  '/servicios/septico/': 'Séptico / biodigestor',
  '/servicios/agua/': 'Tratamiento / análisis de agua',
};

export const GUIDES = [
  {
    // Template example only: stays a draft until the keyword map confirms the
    // group and the text reaches 700 words. Replace or delete it in task N9.
    slug: 'preparar-acceso-camion-atmosferico',
    title: 'Cómo preparar el acceso para el camión | Pozo.com.py',
    description: 'Qué revisar antes de que llegue el camión atmosférico: acceso, distancia a la tapa, fotos útiles y seguridad durante el desagüe.',
    h1: 'Cómo preparar el acceso para el camión atmosférico',
    short: 'Preparar el acceso para el camión',
    meaningGroup: 'Acceso del camión atmosférico (hipótesis, sin datos)',
    lead: 'Una lista corta para que el día del desagüe no haya sorpresas en el portón, el pasillo o la tapa.',
    intro: 'El camión atmosférico necesita llegar lo más cerca posible de la tapa del pozo. Antes de coordinar conviene revisar el acceso, medir la distancia aproximada y sacar dos fotos desde un lugar seguro.',
    sections: [
      ['Revisá el portón y el paso', '<p>Medí el ancho del portón o del pasillo y fijate si hay cables bajos, aleros o ramas en la entrada. Si el camión debe quedar en la calle, indicá dónde puede estacionar.</p>'],
      ['Ubicá la tapa sin abrirla', '<p>La tapa debe poder encontrarse sin ingresar a zonas inseguras. No la abras ni manipules efluentes: puede haber gases peligrosos.</p>'],
      ['Contá la distancia en pasos', '<p>Si no tenés una cinta métrica, contá los pasos desde el portón hasta la tapa. Es un dato aproximado, pero ayuda a preparar la manguera.</p>'],
    ],
    faqs: [
      ['¿Qué fotos conviene mandar?', 'Una del acceso desde la calle y otra de la tapa, tomadas sin abrir el pozo y desde una distancia segura.'],
    ],
    relatedServices: ['/servicios/desague/', '/servicios/pozo-lleno/'],
    published: '2026-09-30',
    updated: '2026-09-30',
    draft: true,
  },
];

export const guidePath = (guide) => `/guias/${guide.slug}/`;
export const PUBLISHED_GUIDES = GUIDES.filter((guide) => !guide.draft);
export const DRAFT_GUIDES = GUIDES.filter((guide) => guide.draft);
export const GUIDE_HUB = '/guias/';
export const HAS_GUIDE_HUB = PUBLISHED_GUIDES.length > 0;

// Words a visitor reads in the guide body (intro + sections + FAQs), tags removed.
export function guideWordCount(guide) {
  const text = [guide.intro, ...guide.sections.flat(), ...(guide.faqs || []).flat()].join(' ').replace(/<[^>]+>/g, ' ');
  return (text.match(/[\p{L}\p{N}]+/gu) || []).length;
}

// Stable anchor id for a section heading ("¿Qué fotos?" -> "que-fotos").
export function anchorId(heading) {
  return heading.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
