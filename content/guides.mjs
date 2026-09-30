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
    slug: 'cada-cuanto-desagotar-pozo-ciego',
    title: 'Cada cuánto desagotar un pozo ciego | Pozo.com.py',
    description: 'De qué depende cada cuánto hay que desagotar un pozo ciego: personas, tamaño, suelo y uso. Señales para no esperar a que se llene.',
    h1: 'Cada cuánto hay que desagotar un pozo ciego',
    short: 'Cada cuánto desagotar el pozo ciego',
    meaningGroup: 'Frecuencia de desagote del pozo ciego',
    lead: 'No existe una fecha igual para todas las casas: la frecuencia depende de cuántos lo usan, de cómo es el pozo y de cómo responde el suelo.',
    intro: 'Mucha gente pregunta cada cuánto tiene que llamar al camión atmosférico. La respuesta honesta es que depende de tu caso. Dos casas en la misma calle pueden necesitar desagotes en épocas muy distintas. Acá te explicamos qué factores cambian el ritmo, qué señales avisan que ya toca y cómo llevar un registro simple para dejar de adivinar.',
    sections: [
      ['Por qué no hay una fecha fija', '<p>Un pozo ciego recibe el agua de baños, cocina y lavadero, y el suelo que lo rodea absorbe parte del líquido. Lo que queda, los sólidos, se va acumulando. Cuánto tarda en llenarse depende de varias cosas a la vez, por eso cualquier número "para todos" es solo una suposición.</p><p>Por eso no te prometemos un plazo. Lo que sí podemos hacer es ayudarte a leer tu situación y, si hace falta, el operador evalúa el pozo cuando va a trabajar.</p>'],
      ['Los factores que más pesan', '<p>Estos son los que más cambian la frecuencia:</p><ul><li><strong>Cantidad de personas:</strong> más gente en la casa significa más uso de baños, duchas y lavarropas.</li><li><strong>Tamaño y profundidad del pozo:</strong> un pozo más grande tiene más espacio para acumular antes de llenarse.</li><li><strong>Capacidad de absorción del suelo:</strong> un suelo que absorbe bien libera el líquido más rápido; uno arcilloso o saturado lo hace lento y el nivel sube antes.</li><li><strong>Tipo de uso:</strong> una casa ocupada todo el año no es igual que una quinta de fin de semana o un local comercial con mucho movimiento.</li><li><strong>Lluvias y nivel del terreno:</strong> con el suelo empapado, el pozo absorbe menos.</li><li><strong>Qué se tira por los desagües:</strong> grasas, toallitas, restos de comida y productos muy agresivos complican el funcionamiento.</li></ul>'],
      ['Señales de que ya toca mirar el pozo', '<p>En lugar de esperar una fecha, prestá atención a lo que te muestra la casa:</p><ul><li>Los desagües del baño o de la cocina tardan en vaciar.</li><li>Sale mal olor cerca de la tapa, de las rejillas o del patio.</li><li>Aparece humedad o agua estancada sobre el lugar donde está el pozo.</li><li>El inodoro "gorgotea" o se sube el agua en la ducha cuando usás otra canilla.</li></ul><p>Si ves una o varias de estas señales, leé nuestra página de <a href="/servicios/pozo-lleno/">pozo ciego lleno</a> y pedí la coordinación del desagote. No abras ni te asomes al pozo: los gases pueden ser peligrosos.</p>'],
      ['Cómo llevar un registro propio', '<p>La forma más práctica de saber tu ritmo es anotarlo. Guardá la fecha de cada desagote y qué pasó después:</p><ol><li>Anotá el día del desagote en el celular o en un cuaderno.</li><li>Anotá cuántas personas vivían en la casa en ese período.</li><li>Cuando vuelvan las señales, anotá la fecha y calculá cuánto pasó.</li><li>Con dos o tres registros vas a ver un patrón propio, mucho más útil que cualquier promedio.</li></ol><p>Si cambia algo grande, como una ampliación, más inquilinos o un lavarropas nuevo, el patrón puede moverse. Volvé a anotar.</p>'],
      ['Qué hacer para alargar el tiempo entre desagotes', '<p>No hay trucos milagrosos, pero algunos hábitos ayudan:</p><ul><li>No tires grasas, aceites, toallitas ni pañales por el inodoro o la pileta.</li><li>Usá productos de limpieza con moderación.</li><li>Reparí las pérdidas: una canilla o un tanque que gotea suma agua al pozo todo el día.</li><li>Mantené la tapa en buen estado y accesible, sin autos ni construcciones encima.</li></ul><p>Si el pozo se llena demasiado rápido, puede que sea chico para el uso actual o que el suelo absorba poco. En ese caso conviene evaluar con el operador si sirve una mejora, por ejemplo una cámara séptica o un biodigestor. Podés leer más en <a href="/guias/pozo-ciego-o-camara-septica/">pozo ciego o cámara séptica</a>.</p>'],
      ['Qué pasa si esperás demasiado', '<p>Dejar pasar las señales tiene costos que se pueden evitar. Con el pozo al límite, los desagües pueden devolver agua hacia el baño, el olor se vuelve molesto en toda la casa y el líquido puede salir a la superficie del patio. Además, un pozo muy cargado es más difícil de tratar y puede complicar el trabajo del día del desagote.</p><p>Por eso conviene moverse cuando aparecen las primeras señales, sin esperar al rebalse. Si ya llegaste a ese punto, no te preocupes: escribinos y contá qué está pasando, así el operador puede orientarte sobre cómo seguir.</p>'],
      ['Cómo pedir el desagote con los datos correctos', '<p>Cuando escribas por WhatsApp desde la página de <a href="/servicios/desague/">desagüe de pozo ciego</a>, te ayuda mucho contar: ciudad y barrio, cuántas personas viven, hace cuánto fue el último desagote (si lo sabés) y qué síntomas notás. Sumá fotos del acceso; en la guía de <a href="/guias/preparar-acceso-camion-atmosferico/">acceso para el camión</a> te contamos cuáles sirven.</p><p>Con esa información, el operador confirma la coordinación. Precio, plazo y disponibilidad se confirman por WhatsApp, no los damos por anticipado.</p>'],
    ],
    faqs: [
      ['¿Cada cuántos años se desagota un pozo ciego?', 'No hay un número válido para todos. Depende de cuántas personas lo usan, del tamaño del pozo, de cómo absorbe el suelo y del tipo de uso. Lo más confiable es anotar tus propios desagotes y observar las señales de tu casa.'],
      ['¿Es mejor desagotar antes de que se llene del todo?', 'Sí, conviene actuar cuando aparecen las primeras señales, como desagües lentos o mal olor, y no esperar a que haya rebalse. Un pozo que desborda puede ensuciar el patio y generar un problema sanitario.'],
      ['¿Puedo abrir la tapa para ver cuánto le falta?', 'No. Los gases de un pozo ciego pueden ser peligrosos y nunca hay que abrirlo, asomarse ni entrar. Guiate por las señales de la casa o pedí que lo evalúe el operador.'],
      ['¿Una casa con más gente necesita desagotar más seguido?', 'En general sí, porque entra más agua y más sólidos al pozo. Pero el tamaño del pozo y la absorción del suelo también pesan, así que no es una regla exacta.'],
      ['¿Después de lluvias fuertes el pozo se llena más rápido?', 'Puede pasar. Con el suelo saturado de agua, el pozo absorbe menos y el nivel sube antes. Si notás señales después de una temporada de lluvias, anotalo en tu registro.'],
    ],
    relatedServices: ['/servicios/desague/', '/servicios/pozo-lleno/'],
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'pozo-ciego-o-camara-septica',
    title: 'Pozo ciego o cámara séptica: diferencias | Pozo.com.py',
    description: 'Diferencias entre pozo ciego y cámara séptica, ventajas y límites de cada uno, cuándo conviene cada opción y qué suma un biodigestor.',
    h1: 'Pozo ciego o cámara séptica: cuál conviene',
    short: 'Pozo ciego o cámara séptica',
    meaningGroup: 'Comparación pozo ciego vs cámara séptica',
    lead: 'Dos sistemas que se confunden seguido: qué hace cada uno, qué ventajas y límites tiene, y qué agrega un biodigestor.',
    intro: 'Cuando se construye o se mejora el saneamiento de una casa aparece siempre la duda: ¿pozo ciego o cámara séptica? No son lo mismo y no siempre son excluyentes. Esta guía explica la diferencia en palabras simples para que llegues a la consulta con las preguntas claras. La decisión final depende del terreno y de lo que confirme el operador.',
    sections: [
      ['Qué es un pozo ciego', '<p>Es una excavación revestida, con paredes que dejan pasar el líquido, donde llegan las aguas del baño y a veces de la cocina. Los sólidos se quedan adentro y el líquido se filtra al suelo. Es una solución muy difundida por ser sencilla y de construcción relativamente directa.</p><p>Su límite principal es que depende del suelo: si absorbe poco, el pozo se llena antes y requiere desagotes más seguidos. Podés ver cómo lo trabajamos en <a href="/servicios/pozo-ciego/">construcción de pozo ciego</a>.</p>'],
      ['Qué es una cámara séptica', '<p>Es un tanque cerrado, separado en compartimentos, donde las aguas residuales permanecen un tiempo. Ahí los sólidos se asientan y empiezan a descomponerse, y el líquido más clarificado sale hacia un sistema de infiltración, como un pozo de absorción o un campo de drenaje.</p><p>Es decir: la cámara séptica trata parcialmente, y después hace falta un destino para el líquido que sale. No reemplaza por sí sola la infiltración al suelo.</p>'],
      ['Comparación rápida', '<ul><li><strong>Pozo ciego:</strong> más simple y directo; depende mucho de la absorción del suelo; el desagote es la tarea de mantenimiento habitual.</li><li><strong>Cámara séptica:</strong> separa sólidos antes de infiltrar; requiere diseño y una salida para el líquido; también necesita mantenimiento periódico.</li><li><strong>Ambos:</strong> necesitan una tapa accesible, una ubicación pensada y nunca deben abrirse para mirar adentro por los gases.</li></ul><p>Ninguno es una solución "sin mantenimiento". La diferencia está en cómo se reparte el trabajo entre el tanque y el suelo.</p>'],
      ['Ventajas y límites de cada uno', '<p><strong>Pozo ciego.</strong> Ventajas: es una obra conocida, de diseño simple y con pocas piezas. Límites: si el suelo absorbe poco, se llena antes; y al infiltrar directamente lo que llega, el suelo recibe más carga.</p><p><strong>Cámara séptica.</strong> Ventajas: los sólidos quedan retenidos en el tanque y al suelo llega un líquido más tratado. Límites: es una obra con más componentes, exige un buen diseño y sigue necesitando un lugar donde infiltrar el líquido.</p><p>Ninguna de las dos opciones es perfecta. Por eso la elección se hace mirando el terreno, no copiando lo que hizo un vecino.</p>'],
      ['Cuándo suele convenir un pozo ciego', '<p>Suele ser una opción razonable cuando el terreno absorbe bien, el uso es moderado y se busca una obra sencilla. También aparece en viviendas chicas o en casas de fin de semana. Siempre se evalúa el lugar concreto: nivel del terreno, cercanía a otras instalaciones y acceso para el camión.</p>'],
      ['Cuándo conviene pensar en cámara séptica', '<p>Puede ser mejor alternativa cuando el terreno es chico, el suelo absorbe poco, hay más personas usando el sistema o se quiere cuidar más lo que llega al suelo. Es habitual que un pozo ciego existente se complemente con una cámara antes de la infiltración. Lo define el operador viendo el terreno, no una regla general.</p>'],
      ['Qué agrega un biodigestor', '<p>Un biodigestor es un sistema cerrado pensado para tratar aguas residuales de la vivienda con un proceso biológico interno, y suele ser prefabricado. Comparado con una cámara séptica tradicional, busca un tratamiento más completo antes de que el agua vaya al suelo. Sigue necesitando instalación correcta, una salida para el efluente y cuidados básicos de uso.</p><p>Si querés profundizar, mirá la página de <a href="/servicios/septico/">séptico y biodigestor</a>. No prometemos resultados concretos: lo que corresponde para tu casa se confirma con el operador.</p>'],
      ['Preguntas para llevar a la consulta', '<ol><li>¿Cómo es el suelo de mi terreno y cuánto absorbe?</li><li>¿Cuántas personas van a usar el sistema?</li><li>¿Hay lugar para el camión y para trabajar?</li><li>¿Ya existe un pozo que se pueda aprovechar?</li><li>¿Qué mantenimiento voy a tener que hacer después?</li></ol><p>Con fotos del terreno y del acceso, la consulta por WhatsApp es mucho más precisa. Los precios y los plazos se confirman por ese medio; no figuran en esta guía. Si ya tenés un pozo y te preguntás cada cuánto mantenerlo, leé <a href="/guias/cada-cuanto-desagotar-pozo-ciego/">cada cuánto desagotar un pozo ciego</a>.</p>'],
    ],
    faqs: [
      ['¿La cámara séptica reemplaza al pozo ciego?', 'No del todo. La cámara séptica trata parcialmente las aguas y después el líquido necesita un destino, que muchas veces es un pozo de absorción. Por eso se suelen usar en conjunto.'],
      ['¿Una cámara séptica necesita desagote?', 'Sí. Los sólidos que se acumulan hay que retirarlos periódicamente, igual que en un pozo ciego. La frecuencia depende del uso y del diseño.'],
      ['¿Un biodigestor es lo mismo que una cámara séptica?', 'No es lo mismo. Ambos son tanques cerrados, pero el biodigestor está pensado para un tratamiento biológico más completo. Igual requiere instalación correcta y cuidado en el uso.'],
      ['¿Puedo mejorar mi pozo ciego agregando una cámara?', 'A veces se mejora un sistema existente agregando una cámara o un biodigestor antes del pozo. Depende del estado y de la ubicación del pozo, y lo confirma el operador.'],
      ['¿Cuál es más económico?', 'No damos precios en esta guía. Las dos opciones se cotizan según el terreno y el trabajo; pedí el presupuesto por WhatsApp para comparar con datos reales.'],
    ],
    relatedServices: ['/servicios/pozo-ciego/', '/servicios/septico/'],
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'pozo-artesiano-o-pozo-excavado',
    title: 'Pozo artesiano o pozo excavado | Pozo.com.py',
    description: 'Diferencias entre pozo perforado (artesiano) y pozo excavado: profundidad, protección contra contaminación, bomba y mantenimiento.',
    h1: 'Pozo artesiano o pozo excavado: diferencias',
    short: 'Pozo artesiano o excavado',
    meaningGroup: 'Comparación pozo artesiano vs pozo excavado',
    lead: 'Un pozo perforado y uno excavado a mano no son lo mismo. Acá van las diferencias que más importan al elegir.',
    intro: 'En Paraguay se habla de "pozo" para cosas muy distintas. Por un lado está el pozo excavado, el clásico cavado a mano o con maquinaria y revestido con ladrillo o anillos. Por otro, el pozo perforado, al que muchos llaman artesiano, que se hace con una máquina perforadora y se entuba. Esta guía compara ambos con criterios simples, sin prometer resultados: lo que corresponde a tu terreno lo confirma el operador.',
    sections: [
      ['Cómo se construye cada uno', '<p>El <strong>pozo excavado</strong> es una excavación ancha, de diámetro grande, que se revestía tradicionalmente con ladrillo, piedra o anillos. Llega hasta donde se encuentra agua cercana a la superficie.</p><p>El <strong>pozo perforado</strong> es un agujero angosto hecho con una máquina perforadora, que se entuba y se engrava para sostener las paredes y filtrar la grava. Puede llegar mucho más profundo. Mirá los detalles en nuestra página de <a href="/servicios/artesiano/">pozos artesianos</a>.</p>'],
      ['Profundidad', '<p>El pozo excavado suele quedarse en las capas más superficiales. El perforado puede alcanzar capas de agua más profundas. En la zona de Gran Asunción se informan profundidades típicas de "30 a 120 m", pero es un dato informado y no una garantía: la profundidad real de tu terreno se confirma al perforar y depende del suelo y del agua que se encuentre.</p>'],
      ['Protección contra la contaminación', '<p>Un pozo abierto y ancho queda más expuesto a que entren agua de lluvia, hojas, insectos o filtraciones cercanas. Uno perforado y entubado, con tapa y sello bien hechos, reduce esas vías de ingreso. Aun así, que esté mejor protegido no significa que el agua sea apta para tomar.</p><p>Solo un análisis de laboratorio puede decir si el agua es potable. Si la vas a tomar, hacé el análisis y leé sobre el <a href="/servicios/agua/">tratamiento y análisis de agua</a>.</p>'],
      ['Bomba y extracción', '<ul><li><strong>Excavado:</strong> al ser poco profundo, muchas veces se usa una bomba de superficie o un balde en instalaciones antiguas.</li><li><strong>Perforado:</strong> lleva una bomba sumergible dimensionada para la profundidad y el caudal, con tablero y tanque. Podés ver cómo se combinan en <a href="/guias/bomba-y-tanque-hidroneumatico/">bomba y tanque hidroneumático</a>.</li></ul><p>La bomba elegida depende de la profundidad, del caudal que necesitás y del uso de la casa.</p>'],
      ['Mantenimiento', '<p>El pozo excavado necesita mantener tapa, brocal y entorno limpios, y revisar el agua si cambia de aspecto o de olor. El perforado requiere revisar bomba, tablero, presostato y tanque, y mirar si baja el caudal o la presión. En ambos casos, cualquier cambio raro en el agua es motivo para analizarla.</p><p>Mantené siempre la tapa cerrada y evitá que se acumule agua estancada alrededor. Y no tires residuos ni productos químicos cerca del pozo.</p>'],
      ['Cuidado con el entorno', '<p>Sea excavado o perforado, el pozo de agua no debería quedar cerca de fuentes de contaminación. Eso incluye el pozo ciego, corrales, depósitos de químicos o basura. No damos distancias en esta guía: la ubicación se planifica y se confirma con el operador según el terreno. Si querés preparar el lugar, leé <a href="/guias/preparar-terreno-para-perforar-pozo/">cómo preparar el terreno para perforar un pozo</a>.</p>'],
      ['Cómo decidir', '<ol><li>Definí para qué querés el agua: casa, riego, quinta, negocio.</li><li>Averiguá cómo se comporta el agua en tu zona consultando al operador.</li><li>Pensá en el caudal y la continuidad que necesitás.</li><li>Considerá la ubicación respecto de pozos ciegos y otras fuentes de contaminación.</li><li>Usá la <a href="/servicios/precio-pozo/">calculadora de precio del pozo</a> como referencia inicial y confirmá con el operador.</li></ol>'],
    ],
    faqs: [
      ['¿Un pozo artesiano es lo mismo que uno perforado?', 'En el uso cotidiano, en Paraguay se llama artesiano al pozo perforado con máquina y entubado. Técnicamente "artesiano" tiene otra definición, pero acá nos referimos al pozo perforado.'],
      ['¿El agua del pozo perforado es potable?', 'No se puede afirmar sin análisis. Solo un laboratorio puede decir si el agua es potable, sea de pozo perforado o excavado.'],
      ['¿Qué profundidad tiene un pozo en Gran Asunción?', 'Se informa que las profundidades típicas van de 30 a 120 m, pero es un dato informado y no una garantía. La profundidad real se confirma al perforar.'],
      ['¿Se puede convertir un pozo excavado en uno perforado?', 'Son obras distintas. Generalmente se hace una perforación nueva en un lugar adecuado, y el operador evalúa qué hacer con el pozo antiguo.'],
      ['¿Cuál dura más?', 'No se puede asegurar. Depende de la calidad de la obra, del agua disponible y del mantenimiento que reciba.'],
    ],
    relatedServices: ['/servicios/artesiano/', '/servicios/precio-pozo/'],
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'bomba-y-tanque-hidroneumatico',
    title: 'Bomba y tanque hidroneumático: cómo funcionan | Pozo.com.py',
    description: 'Cómo trabajan juntos bomba, presostato, tanque hidroneumático y tablero en un pozo, y de qué depende elegir cada componente.',
    h1: 'Bomba y tanque hidroneumático: cómo trabajan juntos',
    short: 'Bomba y tanque hidroneumático',
    meaningGroup: 'Funcionamiento bomba y tanque hidroneumático',
    lead: 'Un pozo terminado no es solo el agujero: la bomba, el presostato, el tanque y el tablero forman un sistema.',
    intro: 'Después de perforar un pozo, el agua tiene que llegar a tus canillas con presión. De eso se encarga un conjunto de piezas que trabajan coordinadas. Entenderlas te ayuda a comparar presupuestos, a notar cuando algo falla y a explicar mejor tu caso al operador.',
    sections: [
      ['Las piezas del sistema', '<ul><li><strong>Bomba:</strong> sube el agua desde el fondo del pozo.</li><li><strong>Tanque hidroneumático:</strong> guarda agua a presión, con una cámara de aire que funciona como colchón.</li><li><strong>Presostato:</strong> detecta la presión y le ordena a la bomba prender o apagarse.</li><li><strong>Manómetro:</strong> muestra la presión para que puedas verla.</li><li><strong>Tablero de comando:</strong> protege y maniobra la parte eléctrica.</li><li><strong>Cañerías y válvulas:</strong> llevan el agua hasta la casa.</li></ul>'],
      ['Cómo trabajan en conjunto', '<p>Cuando abrís una canilla, el agua sale del tanque y la presión baja. Al llegar al límite inferior que tiene configurado, el presostato arranca la bomba. La bomba sube agua, llena de nuevo el tanque y la presión sube. Cuando alcanza el límite superior, el presostato corta la bomba.</p><p>Gracias al tanque, la bomba no tiene que prender cada vez que usás un poco de agua. Eso reduce arranques y cuida el equipo.</p>'],
      ['De qué depende el tamaño de la bomba', '<p>No hay una bomba "correcta" para todos. La elección se basa en:</p><ul><li><strong>Profundidad del pozo y nivel del agua:</strong> mientras más profundo, más esfuerzo hace la bomba.</li><li><strong>Caudal que necesitás:</strong> cuántas canillas, duchas o riego se usan al mismo tiempo.</li><li><strong>Uso:</strong> casa familiar, quinta, local o riego.</li><li><strong>Lo que rinde el pozo:</strong> una bomba demasiado grande para el pozo puede vaciarlo más rápido de lo que se recupera.</li><li><strong>Instalación eléctrica:</strong> tensión disponible y estado del cableado.</li></ul>'],
      ['Y el tanque hidroneumático', '<p>La capacidad del tanque depende del caudal, de cuántos arranques por hora querés permitir y de la presión de trabajo. Uno chico hace arrancar más seguido a la bomba; uno mayor reparte mejor el trabajo. El operador te recomienda según el uso de tu casa.</p><p>También importa dónde se instala: un lugar firme, nivelado y protegido de la lluvia y del sol directo ayuda a que el conjunto dure más.</p>'],
      ['El equipo estándar de la calculadora', '<p>Como referencia, en la <a href="/servicios/precio-pozo/">calculadora de precio del pozo</a> la instalación completa se plantea con bomba de 1 hp, tablero, tanque hidroneumático, cañerías y accesorios. Es un punto de partida: si tu pozo es muy profundo o tu consumo es alto, el operador puede recomendar otra configuración. En esta guía no se informan otros precios.</p>'],
      ['Señales de que algo no anda bien', '<ul><li>La bomba prende y apaga muy seguido.</li><li>La presión baja o sube de manera irregular.</li><li>Sale aire por las canillas o el agua llega a golpes.</li><li>El manómetro marca valores que se mueven sin razón clara.</li><li>El tablero se desconecta con frecuencia.</li></ul><p>No manipules el tablero si no sos idóneo: hay riesgo eléctrico. Pedí una revisión. Más sobre la obra completa en <a href="/servicios/artesiano/">pozos artesianos</a>.</p>'],
      ['Cuidados básicos', '<p>Un sistema de bombeo rinde mejor si lo mirás de vez en cuando. Fijate en el manómetro, escuchá si la bomba arranca con normalidad, revisá que no haya pérdidas en las uniones y mantené el tablero seco y cerrado. Cualquier cambio en el caudal del pozo merece una consulta al operador antes de que el equipo se dañe.</p>'],
      ['Antes de contratar', '<p>Preguntá qué marca y potencia incluye cada presupuesto, qué tanque, qué cableado y qué accesorios. Comparar solo el precio final sin ver los componentes puede llevar a conclusiones equivocadas. Si aún no tenés el pozo, leé también <a href="/guias/pozo-artesiano-o-pozo-excavado/">pozo artesiano o pozo excavado</a>.</p>'],
    ],
    faqs: [
      ['¿Para qué sirve el tanque hidroneumático?', 'Mantiene agua a presión y evita que la bomba arranque cada vez que abrís una canilla. Así hay presión más estable y menos desgaste.'],
      ['¿Qué hace el presostato?', 'Mide la presión del sistema y enciende o apaga la bomba cuando llega a los límites configurados.'],
      ['¿Una bomba de 1 hp alcanza para mi casa?', 'Depende de la profundidad del pozo, del caudal que necesitás y del uso. Es el equipo estándar que se plantea como referencia, pero el operador confirma qué corresponde.'],
      ['¿Puedo usar una bomba más potente para tener más presión?', 'No siempre. Una bomba demasiado grande para lo que rinde el pozo puede dejarlo sin agua o dañarse. Conviene dimensionar con el operador.'],
      ['¿Por qué la bomba prende y apaga todo el tiempo?', 'Puede ser un tanque con poco aire, un presostato mal calibrado o una pérdida en la cañería. Pedí una revisión en lugar de intentar arreglarlo solo.'],
    ],
    relatedServices: ['/servicios/artesiano/', '/servicios/precio-pozo/'],
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'preparar-terreno-para-perforar-pozo',
    title: 'Preparar el terreno para perforar un pozo | Pozo.com.py',
    description: 'Qué preparar antes de perforar un pozo: acceso para la máquina, ubicación, servicios enterrados, tanque, energía y fotos para enviar.',
    h1: 'Cómo preparar el terreno para perforar un pozo',
    short: 'Preparar el terreno para perforar',
    meaningGroup: 'Preparación del terreno para perforación de pozo',
    lead: 'Una checklist para que la máquina llegue, trabaje sin riesgos y el pozo quede bien ubicado.',
    intro: 'La perforación de un pozo usa equipos grandes y necesita espacio para trabajar. Un terreno bien preparado evita demoras, sorpresas y daños. Esta guía reúne lo que conviene revisar antes de coordinar, y qué fotos mandar por WhatsApp para que el operador pueda evaluar sin ir a ciegas.',
    sections: [
      ['Acceso para la máquina', '<p>El equipo de perforación es pesado y voluminoso. Revisá por dónde entraría:</p><ul><li>Ancho y altura del portón y de los pasos.</li><li>Cables aéreos, ramas, aleros o techos bajos.</li><li>Calle o camino: si es de tierra, cómo queda con lluvia.</li><li>Pendientes, zanjas, desniveles o suelo blando.</li><li>Lugar para estacionar y maniobrar.</li></ul><p>Si el acceso es difícil, avisalo desde el comienzo. El operador confirma si el equipo puede entrar y cómo.</p>'],
      ['Dónde ubicar el pozo', '<p>La ubicación conviene pensarla antes de perforar, porque después no se puede mover. Tené en cuenta:</p><ul><li>Que la máquina pueda llegar y trabajar alrededor.</li><li>Que quede cerca de donde irán el tanque y la electricidad, para acortar cañerías.</li><li>Que el lugar no quede bajo construcciones futuras, como una ampliación o una cochera.</li><li>Que sea un sitio de fácil acceso para el mantenimiento de la bomba.</li></ul><p>La ubicación final se define junto al operador. Podés ver cómo es la obra en <a href="/servicios/artesiano/">pozos artesianos</a>.</p>'],
      ['Servicios enterrados', '<p>Antes de perforar hay que saber qué pasa bajo el suelo. Revisá planos de la casa y preguntá a quien construyó:</p><ul><li>Cañerías de agua y cloacas.</li><li>Cables eléctricos subterráneos.</li><li>Tanques, cisternas y cámaras.</li><li>Pozos ciegos o sépticos existentes.</li></ul><p>Si no sabés dónde están, decilo. Marcar el trazado aproximado con estacas o cintas ayuda. Nunca se debe cavar ni perforar sin saber qué hay abajo.</p>'],
      ['Relación con el pozo ciego', '<p>El pozo de agua y el pozo ciego tienen que planificarse en conjunto, porque el sistema sanitario puede afectar la calidad del agua. No damos una distancia en esta guía: debe planificarse y confirmarse con el operador según el terreno, el suelo y lo que ya exista.</p><p>Indicá dónde está tu pozo ciego o séptico, sin abrirlo, y el operador lo tendrá en cuenta. Si querés construir uno nuevo, mirá <a href="/servicios/pozo-ciego/">construcción de pozo ciego</a>.</p>'],
      ['Dónde van el tanque y la electricidad', '<p>Pensá en dos cosas antes de la obra: dónde quedará el tanque hidroneumático y de dónde vendrá la energía para la bomba y el tablero. Conviene un lugar protegido de la lluvia y del sol directo, con acceso cómodo. Más detalles en <a href="/guias/bomba-y-tanque-hidroneumatico/">bomba y tanque hidroneumático</a>.</p><p>Si tu conexión eléctrica es precaria o tenés dudas sobre el tablero general, mencionalo al coordinar. Es mejor saberlo antes del día de la obra.</p>'],
      ['Qué despejar el día de la obra', '<ul><li>Sacá autos, motos, materiales y muebles del camino de la máquina.</li><li>Cortá ramas bajas y despejá el área de trabajo.</li><li>Dejá un lugar para el barro y el agua que salen de la perforación, lejos de la casa y de los vecinos.</li><li>Mantené a niños y mascotas lejos de la zona.</li><li>Dejá alguien que pueda abrir el portón y tomar decisiones.</li></ul>'],
      ['Fotos y datos para enviar', '<ol><li>Foto del frente y del portón desde la calle.</li><li>Foto del camino de entrada hasta el lugar elegido.</li><li>Foto del lugar donde imaginás el pozo.</li><li>Foto de donde irían el tanque y el tablero.</li><li>Foto de postes, cables o árboles cercanos.</li><li>Ciudad, barrio y ubicación en el mapa.</li></ol><p>Tomalas desde un lugar seguro. Para estimar costos usá la <a href="/servicios/precio-pozo/">calculadora de precio del pozo</a> como referencia inicial; el operador confirma el valor final.</p>'],
    ],
    faqs: [
      ['¿Tengo que estar presente el día de la perforación?', 'Conviene que haya alguien que conozca el terreno y pueda decidir. Coordinalo con el operador por WhatsApp.'],
      ['¿Qué pasa si la máquina no puede entrar?', 'Avisá antes con fotos del acceso. El operador evalúa si hay otra forma de ingresar o si hay que ajustar el plan.'],
      ['¿Puedo elegir cualquier lugar del terreno?', 'Casi siempre hay margen, pero la ubicación debe permitir que la máquina trabaje y que el pozo quede bien resuelto. Se define junto al operador.'],
      ['¿Hace falta limpiar el terreno antes?', 'Sí, conviene despejar el camino y el área de trabajo de objetos, escombros, ramas y vehículos.'],
      ['¿Qué fotos son las más útiles?', 'El acceso desde la calle, el camino interno, el lugar elegido para el pozo y la zona del tanque y la electricidad.'],
    ],
    relatedServices: ['/servicios/artesiano/', '/servicios/pozo-ciego/'],
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'preparar-acceso-camion-atmosferico',
    title: 'Cómo preparar el acceso para el camión | Pozo.com.py',
    description: 'Qué revisar antes de que llegue el camión atmosférico: acceso, distancia a la tapa, fotos útiles y seguridad durante el desagüe.',
    h1: 'Cómo preparar el acceso para el camión atmosférico',
    short: 'Preparar el acceso para el camión',
    meaningGroup: 'Acceso del camión atmosférico al pozo',
    lead: 'Una lista corta para que el día del desagüe no haya sorpresas en el portón, el pasillo o la tapa.',
    intro: 'El camión atmosférico necesita llegar lo más cerca posible de la tapa del pozo. Antes de coordinar conviene revisar el acceso, medir la distancia aproximada y sacar dos fotos desde un lugar seguro. Con esos datos, el operador puede confirmar si el trabajo es posible y cómo organizarlo.',
    sections: [
      ['Revisá el portón y el paso', '<p>Medí el ancho del portón o del pasillo y fijate si hay cables bajos, aleros o ramas en la entrada. Si el camión debe quedar en la calle, indicá dónde puede estacionar.</p><p>Si hay autos, macetas, motos o materiales en la entrada, retiralos antes. Un pasillo despejado ahorra tiempo de maniobra.</p>'],
      ['Ubicá la tapa sin abrirla', '<p>La tapa debe poder encontrarse sin ingresar a zonas inseguras. No la abras ni manipules efluentes: puede haber gases peligrosos. Nunca te asomes ni entres a un pozo ciego.</p><p>Si no sabés dónde está, revisá los planos de la casa o preguntá a quien la construyó. Si está tapada por pasto, tierra o baldosas, avisalo al coordinar: el operador verá cómo proceder.</p>'],
      ['Contá la distancia en pasos', '<p>Si no tenés una cinta métrica, contá los pasos desde el portón o desde donde estacionaría el camión hasta la tapa. Es un dato aproximado, pero ayuda a preparar la manguera y a saber si alcanza.</p><p>Anotá también si hay escalones, rampas, jardines o pisos delicados en el recorrido. Son detalles chicos que cambian cómo se arma el trabajo.</p>'],
      ['Despejá el camino de la manguera', '<p>La manguera va desde el camión hasta la tapa. Revisá que en ese recorrido no haya:</p><ul><li>Plantas o macetas delicadas.</li><li>Muebles de jardín, juguetes o herramientas.</li><li>Animales sueltos, en especial perros.</li><li>Escalones o desniveles donde pueda trabarse.</li></ul><p>Mantené a niños y mascotas lejos del recorrido mientras dure el trabajo.</p>'],
      ['Qué hacer si el camión no llega', '<p>Hay casas con pasillo angosto, portón bajo o calle de tierra que se complica con lluvia. No significa que no se pueda: avisalo antes. Según el caso, el operador evaluará si alcanza con más manguera, si hay otro punto de estacionamiento o si hace falta otra solución. No podemos prometerlo sin ver fotos y datos.</p>'],
      ['Fotos y datos para mandar por WhatsApp', '<ol><li>Una foto del acceso desde la calle, con el portón.</li><li>Una foto del recorrido hasta la tapa.</li><li>Una foto de la tapa, sin abrirla y desde una distancia segura.</li><li>Ciudad y barrio, y si hay algún obstáculo en la calle.</li><li>Distancia aproximada en pasos.</li></ol><p>Con eso podés escribir desde la página de <a href="/servicios/desague/">desagüe de pozo ciego</a>. Si ya hay señales de que está lleno, mirá <a href="/servicios/pozo-lleno/">pozo ciego lleno</a>.</p>'],
      ['Cuándo coordinar y qué tener a mano', '<p>Lo ideal es revisar el acceso antes de escribir, no el mismo día. Así podés contar con calma lo que hay y evitar idas y vueltas. Tené a mano la dirección exacta, una referencia para llegar (esquina, comercio o portón de color) y un teléfono de contacto de quien va a recibir.</p><p>Si la calle tiene restricciones de estacionamiento, obras o un portón que se traba, mencionalo. Precio, horario y disponibilidad se confirman por WhatsApp con el operador; en esta guía no se adelantan.</p>'],
      ['Durante el trabajo', '<p>Mantenete a distancia de la tapa mientras el operador trabaja. No fumes ni uses llamas cerca del pozo. Dejá las ventanas cerradas si el olor es fuerte. Cuando termine, pedí que la tapa quede bien cerrada y asegurada. Si querés saber cuándo repetir el servicio, leé <a href="/guias/cada-cuanto-desagotar-pozo-ciego/">cada cuánto desagotar un pozo ciego</a>.</p>'],
    ],
    faqs: [
      ['¿Qué fotos conviene mandar?', 'Una del acceso desde la calle, otra del recorrido y otra de la tapa, tomadas sin abrir el pozo y desde una distancia segura.'],
      ['¿Tengo que abrir la tapa antes de que llegue el camión?', 'No. Nunca abras ni te asomes al pozo: los gases pueden ser peligrosos. El operador se ocupa de ese paso.'],
      ['¿Qué pasa si hay un auto estacionado en el acceso?', 'Conviene liberar la entrada antes. Un acceso despejado facilita que el camión se acerque a la tapa.'],
      ['¿Y si la tapa está cubierta por tierra o baldosas?', 'Avisalo al coordinar. No la descubras ingresando a zonas inseguras; el operador indicará cómo proceder.'],
      ['¿Tengo que estar en casa?', 'Conviene que haya alguien que pueda abrir el portón y mostrar dónde está la tapa. Coordinalo por WhatsApp.'],
    ],
    relatedServices: ['/servicios/desague/', '/servicios/pozo-lleno/'],
    published: '2026-10-01',
    updated: '2026-10-01',
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
