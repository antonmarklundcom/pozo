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
//   - Every concrete local claim is listed in docs/CONTENT-NOTES.md under
//     "Zone pages: facts to verify with a local".
//
// Fields: path, city, short (breadcrumb/label), nearby (text), title (<= 60
// chars), description (optional, <= 155), h1 (optional), topic (main CTA
// topic in wa-messages.mjs, default 'desague'), local: [[heading, html], ...],
// faqs: [[q, a], ...] (optional, appended to the shared FAQ).
// The declared coverage (Asunción and Gran Asunción). Shown on /, /zonas/ and
// /contacto/, and offered in the "Ciudad" select of both forms (plus "Otra").
// Add a city here only when the operator confirms it (docs/OWNER-TODO.md).
export const COVERAGE_CITIES = ['Asunción', 'San Lorenzo', 'Luque', 'Lambaré', 'Fernando de la Mora', 'Mariano Roque Alonso', 'Capiatá', 'Ñemby', 'Villa Elisa', 'Limpio'];

export const ZONES = [
  {
    path: '/zonas/san-lorenzo/',
    city: 'San Lorenzo',
    short: 'Desagüe en San Lorenzo',
    nearby: 'Fernando de la Mora, Capiatá y Ñemby',
    title: 'Desagüe de pozo ciego en San Lorenzo | Pozo.com.py',
    description: 'Desagüe de pozo ciego en San Lorenzo: barrios céntricos y zonas de quintas, acceso del camión atmosférico y cómo pedir el servicio por WhatsApp.',
    local: [
      ['Barrios del centro y barrios más nuevos', '<p>San Lorenzo es una ciudad grande y muy poblada, y eso se nota en el tipo de terreno: cerca del centro y de los barrios más antiguos es común encontrar lotes chicos, casas pegadas y portones angostos. Ahí el problema casi nunca es el pozo en sí, sino llegar con el camión: una calle estrecha, autos estacionados o un pasillo largo hasta el fondo del patio cambian mucho la maniobra.</p><p>En los barrios más nuevos y hacia las afueras hay lotes más amplios, pero no siempre con calle asfaltada. Por eso conviene avisar si la calle es de tierra o empedrada y si hay un tramo complicado antes de llegar a tu casa.</p><p>Cuando escribas, mandá el nombre del barrio, una referencia conocida y una foto del portón desde la calle. Con eso se puede evaluar el acceso antes de coordinar.</p>'],
      ['Viviendas de alquiler y comercios: el pozo se llena más rápido', '<p>San Lorenzo tiene mucho movimiento de gente, entre otras cosas por el campus de la Universidad Nacional de Asunción. Una vivienda con varios inquilinos o un comercio usa el baño mucho más que una casa familiar, y el pozo se llena antes de lo que el dueño espera.</p><ul><li>Si administrás una propiedad de alquiler, anotá la fecha de cada desagüe: el intervalo entre uno y otro te dice si el pozo quedó chico para el uso real.</li><li>Si el pozo se llena seguido después de lluvias fuertes, revisá si el agua de los techos o del patio entra al pozo.</li><li>Si el baño o la pileta tardan en desagotar, avisalo al escribir.</li></ul>'],
      ['Pozo ciego y pozo artesiano en la misma propiedad', '<p>En las casas de las afueras es común que convivan el pozo ciego y una perforación propia para agua. Si tenés las dos cosas en el terreno, mencioná a qué distancia están una de la otra: no es un detalle menor para el cuidado del agua. Si estás pensando en un <a href="/servicios/artesiano/">pozo artesiano</a>, contanos también dónde está tu pozo ciego actual.</p>'],
    ],
    faqs: [
      ['¿Atienden en barrios de San Lorenzo con calles angostas o de tierra?', 'Se consulta caso por caso. Mandá el barrio, una referencia y una foto del acceso desde la calle para ver si el camión puede llegar o si hace falta una distancia de manguera mayor.'],
      ['¿Puedo consultar por un pozo artesiano en San Lorenzo?', 'Sí. Escribinos con la ubicación y el uso del agua; el equipo confirma viabilidad, alcance y presupuesto después de conocer el terreno.'],
    ],
  },
  {
    path: '/zonas/mra/',
    city: 'Mariano Roque Alonso',
    short: 'Desagüe en Mariano Roque Alonso',
    nearby: 'Limpio, Luque y Asunción',
    title: 'Desagüe en Mariano Roque Alonso | Pozo.com.py',
    description: 'Desagüe de pozo ciego en Mariano Roque Alonso: quintas, zonas bajas cerca del río y acceso del camión atmosférico. Consultá por WhatsApp.',
    local: [
      ['Quintas y chacras: largos caminos internos', '<p>Mariano Roque Alonso combina barrios urbanos con muchas quintas, chacras y propiedades amplias. En esas propiedades el pozo suele estar lejos del portón, detrás de la casa o cerca de un quincho, y el camino interno puede ser de tierra. Antes de pedir el servicio, medí (o contá en pasos) la distancia desde el portón hasta la tapa y fijate si hay árboles, cables bajos, tranqueras o un portón angosto.</p><p>Si la entrada es de tierra, avisá si se embarra con la lluvia: el mismo camino que sirve en seco puede no servir en un día de lluvia.</p>'],
      ['Cerca del río: zonas bajas y lluvias fuertes', '<p>El municipio está sobre la margen del río Paraguay, y las partes más bajas pueden acumular agua en épocas de muchas lluvias o de crecida. Un pozo ciego rodeado de suelo empapado se llena y rebalsa más fácil, y además el acceso del camión se complica.</p><ul><li>Si tu terreno se inunda o se anega, decilo al escribir.</li><li>Sacá una foto del patio con el agua estancada, si la hay.</li><li>No abras el pozo para "ayudar" a que baje: dejalo a quien va a hacer el servicio.</li></ul><p>Si tenés agua de pozo propia o pensás hacer un <a href="/servicios/artesiano/">pozo artesiano</a>, conviene tener presente la cercanía entre el pozo ciego y la perforación.</p>'],
    ],
    faqs: [
      ['¿Atienden quintas y chacras en Mariano Roque Alonso?', 'Sí se consultan. Lo importante es el camino interno y la distancia del portón al pozo; mandá fotos y un mapa para confirmar el acceso.'],
    ],
  },
  {
    path: '/zonas/luque/',
    city: 'Luque',
    short: 'Desagüe en Luque',
    nearby: 'San Lorenzo, Limpio y Mariano Roque Alonso',
    title: 'Desagüe de pozo ciego en Luque | Pozo.com.py',
    description: 'Desagüe de pozo ciego en Luque: barrios urbanos, zonas de quintas, acceso del camión y consulta por pozo artesiano. Escribinos por WhatsApp.',
    local: [
      ['Dos situaciones en una misma ciudad: casco urbano y quintas', '<p>Luque es una ciudad extensa, y la misma ciudad tiene situaciones muy distintas. En el casco urbano y los barrios más densos la dificultad suele ser el espacio: calles angostas, autos en la vereda y pozos dentro de patios estrechos. En las zonas más alejadas del centro aparecen lotes grandes, quintas y caminos de tierra, donde lo que cambia es el largo del recorrido desde la calle hasta el pozo.</p><p>Por eso, al consultar, es útil decir a cuál de los dos casos se parece tu propiedad: "casa con patio chico en barrio" o "terreno grande con camino interno".</p>'],
      ['Avenidas con tránsito y locales abiertos al público', '<p>Luque tiene mucho tránsito hacia Asunción y hacia las ciudades vecinas, y en su territorio está el aeropuerto internacional Silvio Pettirossi. Si tu casa o local queda sobre una avenida con tráfico, pensá en el horario: detener un camión grande frente a un comercio no es lo mismo a primera hora que a media tarde.</p><ul><li>Si tenés un comercio, indicá el horario en que podés recibir el servicio.</li><li>Si el pozo está al fondo de un local, avisá por dónde se accede.</li></ul>'],
      ['Pozo artesiano en terrenos grandes', '<p>Los terrenos amplios de las afueras son los que más suelen consultar por un pozo artesiano propio, para casa, quinta o riego. Para orientar la consulta conviene llevar el uso del agua, el tamaño del terreno y si ya hay pozos de vecinos. Mirá la página del <a href="/servicios/artesiano/">pozo artesiano</a> para ver qué datos pedimos.</p>'],
    ],
    faqs: [
      ['¿Atienden en todo Luque o solo en algunos barrios?', 'Se consulta por ubicación. Mandá el barrio y un mapa y se confirma si se puede coordinar el servicio.'],
    ],
  },
  {
    path: '/zonas/capiata/',
    city: 'Capiatá',
    short: 'Desagüe en Capiatá',
    nearby: 'San Lorenzo, Luque e Itauguá',
    title: 'Desagüe de pozo ciego en Capiatá | Pozo.com.py',
    description: 'Desagüe de pozo ciego en Capiatá: barrios en crecimiento, calles de tierra en época de lluvias y acceso del camión. Consultá por WhatsApp.',
    local: [
      ['Barrios nuevos y calles sin asfaltar', '<p>Capiatá tiene barrios nuevos junto a zonas más tradicionales. En los sectores más recientes es habitual encontrar calles todavía de tierra o empedrado, y cada casa depende de su propio pozo ciego. Con muchas casas en la misma situación, el desagüe periódico es una necesidad corriente.</p><p>En temporada de lluvias, una calle de tierra puede dejar de ser transitable para un camión pesado. Si tu calle se pone difícil cuando llueve, avisalo y, si podés, coordiná el servicio para un día seco.</p>'],
      ['Cómo describir tu ubicación en Capiatá', '<p>Muchas calles de barrios nuevos no figuran con claridad en los mapas o tienen nombres que la gente no usa. Conviene mandar la ubicación por WhatsApp (el pin del mapa), el nombre del barrio y una referencia visible como una escuela, un comercio conocido o un cruce.</p><ol><li>Pin de ubicación desde tu teléfono, estando en el portón.</li><li>Una foto del frente de la casa.</li><li>Una foto de dónde está la tapa del pozo.</li></ol><p>Con esas tres cosas se evitan la mayoría de las idas y vueltas.</p>'],
      ['Terreno para construir: pensá el agua y el pozo desde el inicio', '<p>Si compraste un terreno y estás armando la casa, definir el pozo ciego y, si hace falta, una perforación propia desde el comienzo evita rehacer cosas después. Podés consultar por un <a href="/servicios/artesiano/">pozo artesiano</a> antes de empezar la obra.</p>'],
    ],
    faqs: [
      ['¿Qué hago si mi calle en Capiatá es de tierra y llueve?', 'Avisalo al consultar. Se puede coordinar para un día más seco o evaluar la distancia desde la parte transitable hasta el pozo.'],
    ],
  },
  {
    path: '/zonas/lambare/',
    city: 'Lambaré',
    short: 'Desagüe en Lambaré',
    nearby: 'Asunción, Villa Elisa y Ñemby',
    title: 'Desagüe de pozo ciego en Lambaré | Pozo.com.py',
    description: 'Desagüe de pozo ciego en Lambaré: calles en pendiente, barrios densos cerca de Asunción y acceso del camión. Escribinos por WhatsApp.',
    local: [
      ['Calles en pendiente y el cerro', '<p>Lambaré tiene un relieve más marcado que otras ciudades vecinas: el Cerro Lambaré es conocido y varias calles suben o bajan. Para un camión cargado, una pendiente pronunciada o una curva cerrada pueden ser un problema, sobre todo con el piso mojado.</p><p>Si tu casa está en una calle inclinada, decilo al escribir y mandá una foto de la calle desde el portón. Si el pozo queda más abajo o más arriba que la calle, también sirve saberlo porque cambia cómo se tiende la manguera.</p>'],
      ['Barrios densos pegados a Asunción', '<p>Lambaré limita con Asunción y tiene barrios muy poblados con casas pegadas, pasillos y patios chicos. En esos barrios es frecuente que varias viviendas compartan entrada o que el pozo esté dentro de un pasillo angosto, lejos de la calle donde se detiene el camión.</p><ul><li>Medí el ancho del pasillo en el punto más angosto.</li><li>Fijate si hay cables, techos o ramas bajas en el recorrido.</li><li>Si compartís pozo con un vecino, avisalo: se coordina con ambos.</li></ul>'],
    ],
    faqs: [
      ['¿Pueden atender si mi casa en Lambaré está en una calle con pendiente?', 'Se evalúa con una foto de la calle y el acceso. La decisión final depende de si el camión puede llegar y maniobrar con seguridad.'],
    ],
  },
  {
    path: '/zonas/fernando-de-la-mora/',
    city: 'Fernando de la Mora',
    short: 'Desagüe en Fernando de la Mora',
    nearby: 'Asunción, San Lorenzo y Lambaré',
    title: 'Desagüe en Fernando de la Mora | Pozo.com.py',
    description: 'Desagüe de pozo ciego en Fernando de la Mora: lotes chicos, portones angostos y coordinación del camión en barrios muy poblados. Escribinos.',
    local: [
      ['Lotes chicos y mucha densidad', '<p>Fernando de la Mora es una ciudad pequeña en superficie pero muy poblada, pegada a Asunción. Predominan los lotes ajustados, las casas construidas casi hasta el límite del terreno y los pozos metidos en el patio trasero o en un costado. Acá la pregunta clave no es solo si el pozo está lleno, sino si el camión puede acercarse y la manguera llegar.</p><p>Cuando escribas, mandá la distancia del portón a la tapa, el ancho del portón, y si la vereda tiene árboles o postes que limiten el paso.</p>'],
      ['Cómo ubicarte: zona y referencia', '<p>La ciudad se suele nombrar por zonas (Zona Norte, Zona Sur) y por barrios conocidos localmente. Decir "Zona Sur, cerca de tal comercio" ayuda más que solo el nombre de la calle. Si no conocés la zona por ese nombre, el pin del mapa del teléfono resuelve la ubicación.</p>'],
      ['Casas viejas con pozo antiguo', '<p>En los barrios consolidados hay casas de muchos años, con pozos ciegos antiguos que a veces se cubrieron con cemento o quedaron debajo de una ampliación. Si no sabés dónde está la tapa, preguntale a quien vivió antes en la casa o a un vecino, y no rompas el piso por tu cuenta. Mandá una foto del patio y se ve cómo encararlo.</p>'],
    ],
    faqs: [
      ['No sé dónde está la tapa de mi pozo en Fernando de la Mora. ¿Qué hago?', 'Mandá fotos del patio y del baño, y contanos por dónde sale la cañería. No rompas el piso por tu cuenta: se revisa primero con ayuda de las fotos.'],
    ],
  },
  {
    path: '/zonas/nemby/',
    city: 'Ñemby',
    short: 'Desagüe en Ñemby',
    nearby: 'Villa Elisa, Lambaré y San Lorenzo',
    title: 'Desagüe de pozo ciego en Ñemby | Pozo.com.py',
    description: 'Desagüe de pozo ciego en Ñemby: barrios en expansión, calles de tierra y terrenos amplios. Coordiná el camión atmosférico por WhatsApp.',
    local: [
      ['Sectores que siguen creciendo', '<p>Ñemby reúne barrios ya consolidados con sectores donde se siguen levantando casas nuevas. En los sectores más nuevos es habitual que cada vivienda use su propio pozo ciego y que el acceso sea por calles aún sin asfaltar.</p><p>Si tu casa es reciente, anotá la fecha en que se hizo el pozo y si tiene una o dos cámaras: es un dato útil para estimar cada cuánto toca vaciarlo.</p>'],
      ['Época de lluvias y acceso del camión', '<p>En las calles de tierra, la lluvia sostenida puede dejar el camino en mal estado durante un par de días. Conviene coordinar el desagüe en un momento de tiempo seco, salvo que el pozo esté rebalsando.</p><p>Si hay rebalse con lluvia, no esperes a que pase: escribí, contá qué está pasando y mandá una foto del acceso para que se evalúe cómo llegar.</p>'],
    ],
    faqs: [
      ['¿Cada cuánto conviene desagotar en una casa nueva de Ñemby?', 'Depende del uso y del tamaño del pozo. Conviene anotar la fecha de cada desagüe y observar cuánto tarda en volver a llenarse; eso da una idea real para tu casa.'],
    ],
  },
  {
    path: '/zonas/villa-elisa/',
    city: 'Villa Elisa',
    short: 'Desagüe en Villa Elisa',
    nearby: 'Ñemby, Lambaré y San Antonio',
    title: 'Desagüe de pozo ciego en Villa Elisa | Pozo.com.py',
    description: 'Desagüe de pozo ciego en Villa Elisa: zona residencial con casas de jardín, acceso del camión y pozo artesiano. Consultá por WhatsApp.',
    local: [
      ['Zona residencial: jardines, pisos terminados y portones', '<p>Villa Elisa es una ciudad mayormente residencial, con muchas casas de familia, jardines y portones. Eso suele ayudar al acceso, pero trae otros detalles: césped cuidado, pisos de cerámica o adoquín, y pozos que quedan bajo una parte del patio pensada como lugar de estar.</p><p>Antes de la visita, despejá la zona de la tapa (macetas, sillas, autos) y avisá si hay que pasar la manguera por dentro de la casa o por un costado del terreno.</p>'],
      ['Casa con pozo ciego y agua propia', '<p>En zonas residenciales como esta es habitual que algunas casas tengan agua de pozo propio además del pozo ciego. Si ese es tu caso, conviene que sepas qué tan lejos están uno del otro, y no dejes que un rebalse llegue a la zona de la perforación. Si querés hacer una perforación nueva, mirá el <a href="/servicios/artesiano/">pozo artesiano</a>; si tenés dudas sobre el agua, consultá por <a href="/servicios/agua/">tratamiento de agua</a>.</p>'],
    ],
    faqs: [
      ['Tengo jardín y pisos terminados sobre el pozo en Villa Elisa. ¿Pueden hacer el desagüe?', 'Depende de si la tapa es accesible. Mandá una foto del patio y se ve si hay que mover algo o cómo pasar la manguera sin dañar el jardín.'],
    ],
  },
  {
    path: '/zonas/limpio/',
    city: 'Limpio',
    short: 'Desagüe en Limpio',
    nearby: 'Mariano Roque Alonso, Luque y Capiatá',
    title: 'Desagüe de pozo ciego en Limpio | Pozo.com.py',
    description: 'Desagüe de pozo ciego en Limpio: barrios urbanos, quintas y acceso del camión atmosférico en época de lluvias. Consultá por WhatsApp.',
    local: [
      ['Comercios, talleres y depósitos: coordiná el horario', '<p>Limpio combina vivienda con comercios y locales de trabajo. Si tu propiedad es un comercio, taller o depósito, indicá los horarios en que podés recibir el servicio y si hay un lugar para que el camión se detenga sin trabar la calle o la entrada de otros.</p><p>Un local con mucho uso del baño o con cocina llena el pozo más rápido que una casa: si notás olor o desagües lentos en horario de atención, avisá para coordinar una hora que no interrumpa la actividad.</p>'],
      ['Barrios, quintas y construcciones nuevas', '<p>Alrededor del centro hay barrios con casas chicas y, más lejos, quintas y terrenos amplios. Entre medio se arman loteos nuevos. Para unas y otras, el dato que más importa es el mismo: cuán lejos está el pozo de donde puede llegar el camión.</p><ul><li>Casa de barrio: medí el pasillo y el portón.</li><li>Quinta: contá los pasos desde la entrada hasta el pozo y avisá si el camino es de tierra.</li><li>Obra nueva: decí si ya hay pozo ciego hecho o solo una excavación.</li></ul>'],
    ],
    faqs: [
      ['¿Atienden comercios y talleres en Limpio?', 'Sí se consultan. Indicá el horario posible, el tipo de local y dónde podría detenerse el camión para evaluar el servicio.'],
    ],
  },
  {
    path: '/zonas/asuncion/',
    city: 'Asunción',
    short: 'Desagüe en Asunción',
    nearby: 'Lambaré, Fernando de la Mora y Mariano Roque Alonso',
    title: 'Pozo ciego en Asunción: desagüe por barrio | Pozo.com.py',
    description: 'Desagüe de pozo ciego en Asunción: casas con y sin red cloacal, casas antiguas, locales y acceso del camión. Consultá por WhatsApp.',
    local: [
      ['Casas con red cloacal y casas con pozo', '<p>Asunción es la ciudad más urbanizada del país, pero no toda vivienda está conectada a una red cloacal. Hay casas y locales que siguen usando pozo ciego, sobre todo en construcciones antiguas o en sectores sin conexión. Si no estás seguro de si tu casa está conectada o tiene pozo, preguntale al propietario o revisá los planos antes de pedir un servicio.</p><p>Si tu baño rebalsa y sabés que tenés pozo, escribí con el barrio y una foto del acceso.</p>'],
      ['Casas antiguas, patios chicos y estacionamiento', '<p>En barrios tradicionales hay casas de décadas, con patios interiores, cocheras angostas y veredas con árboles grandes. El pozo puede estar en el fondo de la propiedad o debajo de una ampliación. Además, en zonas de mucho tránsito, detener un camión frente a la casa puede requerir un horario tranquilo.</p><ul><li>Indicá si el portón de la cochera es alto y ancho o solo peatonal.</li><li>Avisá si hay que pasar la manguera por adentro de la casa.</li><li>Decí si la calle tiene restricciones de estacionamiento.</li></ul>'],
      ['Restaurantes, locales y edificios bajos', '<p>En Asunción también se consultan restaurantes, locales y edificios bajos con pozo. Un comercio con cocina genera más carga que una casa; conviene coordinar un horario que no interrumpa la atención. Si además necesitás agua propia, mirá el servicio de <a href="/servicios/artesiano/">pozo artesiano</a>.</p>'],
    ],
    faqs: [
      ['¿Cómo sé si mi casa en Asunción tiene pozo ciego o está conectada a la red?', 'Preguntá al propietario, revisá planos o facturas del servicio sanitario, y fijate si hay una tapa en el patio. Si seguís sin saber, mandá fotos del baño y del patio y se orienta la consulta.'],
    ],
  },
];

// Both launch zones now carry their own `local` sections, so nothing is
// grandfathered. Keep the export: qa.mjs imports it.
export const GRANDFATHERED_ZONES = [];
