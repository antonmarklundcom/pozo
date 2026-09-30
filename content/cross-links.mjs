// One contextual cross-link per page to the right sibling site (SEO division):
//   obra.com.py   = build/execution: casas, quintas, piscinas, quinchos,
//                   reformas, ampliaciones, patios, supervisión, crédito.
//   arq.com.py    = design: planos, diseño, renders, carpeta municipal,
//                   regularización, interiores, estilos.
//   carpinteria.com.py = wood + aluminium only (not relevant to pozo).
// obra's own brief pairs obra /quintas/ with pozo.com.py, so most links go
// there. Pages not listed get no cross-link (utility pages, urgent flows
// where a link away would hurt conversion). Rendered as the last paragraph
// of the article by build.mjs; plain same-tab link, no nofollow (own network).
export const CROSS_LINKS = {
  '/servicios/artesiano/': {
    href: 'https://obra.com.py/quintas/',
    lead: '¿El pozo es parte de una quinta o casa de campo?',
    text: 'La construcción de la casa, la piscina y el quincho la coordina obra.com.py',
  },
  '/servicios/precio-pozo/': {
    href: 'https://obra.com.py/presupuesto/',
    lead: '¿El pozo es solo una parte de una obra más grande?',
    text: 'Pedí el presupuesto de la obra completa en obra.com.py',
  },
  '/servicios/pozo-ciego/': {
    href: 'https://obra.com.py/ampliaciones/',
    lead: '¿Vas a sumar baños o ampliar la casa?',
    text: 'Más usuarios cambian el tamaño del pozo: la ampliación la ejecuta obra.com.py',
  },
  '/servicios/septico/': {
    href: 'https://obra.com.py/casas/',
    lead: '¿Estás construyendo una casa nueva?',
    text: 'El sistema séptico se planifica junto con la obra en obra.com.py',
  },
  '/servicios/pozo-lleno/': {
    href: 'https://obra.com.py/reformas/',
    lead: '¿Hay que reubicar el pozo o rehacer las cañerías del baño?',
    text: 'Esa reforma la ejecuta obra.com.py',
  },
  '/servicios/desague/': {
    href: 'https://obra.com.py/patios/',
    lead: '¿La tapa quedó debajo de un contrapiso o hay que rehacer el patio?',
    text: 'Patios, veredas y contrapisos los hace obra.com.py',
  },
  '/servicios/agua/': {
    href: 'https://obra.com.py/piscinas/',
    lead: '¿Vas a usar el agua del pozo para una piscina?',
    text: 'La construcción de la piscina la coordina obra.com.py',
  },
};
