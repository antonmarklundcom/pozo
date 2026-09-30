<?php
require_once __DIR__ . "/includes/config.php";
$page = 'pozos-ciegos';
$SERVICE = 'Construcción, mantenimiento y desagüe de pozos ciegos';
$FAQ = [
  ['q' => '¿Cada cuánto hay que desagotar un pozo ciego?',
   'a' => 'No hay un número universal: depende de cuánta gente vive en la casa, del tamaño del pozo y, sobre todo, de si tenés cámara séptica antes del pozo absorbente. Una casa con cámara séptica bien dimensionada puede pasar años entre desagotes; un pozo ciego sin cámara, con lavarropas y cocina descargando directo, puede necesitarlo cada pocos meses.'],
  ['q' => '¿Sirve el pozo ciego de plástico o prefabricado?',
   'a' => 'Sí, y para muchas casas es la mejor opción. Los anillos de hormigón prefabricados y los tanques plásticos ahorran tiempo de obra, dan paredes parejas y evitan derrumbes durante la excavación. Lo que no cambia es la lógica: seguís necesitando dimensionarlo según la cantidad de habitantes y, si podés, ponerle una cámara séptica adelante.'],
  ['q' => '¿A qué distancia del pozo de agua tiene que estar el pozo ciego?',
   'a' => 'Lo más lejos posible y siempre pendiente abajo respecto del pozo de agua. Es el error más caro que se comete en un terreno: un pozo ciego cerca de un pozo somero termina contaminando el agua que tomás. Antes de excavar, definí la ubicación de los dos juntos y consultá el criterio vigente en tu municipalidad.'],
  ['q' => '¿Puedo hacer un pozo ciego solo para el baño?',
   'a' => 'Se hace, sobre todo en construcciones chicas o en un quincho. Pero separar las aguas negras del baño de las aguas grises de cocina y lavadero es justamente lo que alarga la vida del pozo: la grasa de la cocina es lo que primero impermeabiliza las paredes y mata la absorción.'],
];
include __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="hero-media" style="min-height:min(50vh,400px)">
    <div class="motivo-camion" aria-hidden="true" style="position:absolute;inset:0"></div>
    <div class="wrap">
      <div class="hero-in" style="padding-top:48px;padding-bottom:32px">
        <span class="eyebrow" style="color:#E9855A">Pozos ciegos y cloacales</span>
        <h1>Construcción, Mantenimiento y Desagüe de Pozos Ciegos</h1>
        <p class="lead">
          Lo hacemos, lo vaciamos y lo arreglamos cuando dejó de absorber.
          Camión atmosférico, excavación y cámara séptica en Asunción y Gran Asunción.
        </p>
        <div class="hero-acts">
          <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Pedí tu presupuesto</a>
          <a class="hero-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Soluciones integrales — bento -->
<section>
  <div class="wrap">
    <header class="sec-head rv">
      <span class="eyebrow">El servicio</span>
      <h2>Soluciones Integrales para Evacuación de Pozos Ciegos y Cloacales</h2>
      <p class="lead">
        Buena parte de Gran Asunción no tiene red cloacal, así que el pozo ciego
        no es un parche: es el sistema. Y como sistema, necesita estar bien construido
        y mantenido, no solo vaciado cuando desborda.
      </p>
    </header>

    <div class="bento">
      <div class="card cell-3 rv">
        <span class="card-ico" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 17h13a3 3 0 0 0 3-3V9H8a5 5 0 0 0-5 5Z"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>
        </span>
        <h3>Vaciado y Limpieza de Pozos Ciegos Saturados</h3>
        <p>
          Camión desagotador con manguera de succión al fondo del pozo, no solo al líquido
          de superficie. El lodo compactado del fondo es lo que le saca capacidad al pozo:
          si se deja, en pocas semanas volvés a estar igual.
        </p>
        <p style="margin-top:12px">
          Hacemos también el destape de la cañería de entrada cuando el problema no es
          el pozo sino el caño, y la limpieza de la cámara séptica en el mismo viaje.
        </p>
        <span class="card-price">Se cobra por viaje — camión habitual de <b><?= (int)$RATES['desague_m3'] ?> m³</b></span>
      </div>

      <div class="card cell-3 rv">
        <span class="card-ico" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20h16"/><path d="M7 20V9l5-5 5 5v11"/><path d="M10 20v-5h4v5"/></svg>
        </span>
        <h3>Excavación y Medidas Reglamentarias de Pozos Ciegos</h3>
        <p>
          El pozo se dimensiona por cantidad de personas y por cuánto absorbe el suelo,
          no «de ojo». Hacemos la excavación con anillos de hormigón prefabricados o con
          pozo ciego de plástico, según el terreno y el apuro de obra.
        </p>
        <p style="margin-top:12px">
          La ubicación es tan importante como la medida: lejos del pozo de agua,
          pendiente abajo, accesible para el camión y con tapa registrable.
          Las exigencias específicas las fija cada municipalidad — conviene consultarlas antes de excavar.
        </p>
        <span class="card-price">Anillos de hormigón, plástico o prefabricado: <b>lo definimos con el terreno</b></span>
      </div>
    </div>
  </div>
</section>

<!-- Se llena rápido — split -->
<section class="band-dark bleed">
  <div class="wrap split">
    <div class="split-media rv">
      <div class="panel" style="aspect-ratio:1/1;border-color:var(--border-dark)">
        <div class="motivo-camion" aria-hidden="true"></div>
        <span class="panel-tag">Panel ilustrativo · camión atmosférico</span>
      </div>
    </div>
    <div class="rv prose">
      <span class="eyebrow">El problema más común</span>
      <h2>¿Qué Hacer cuando el Pozo Ciego se Llena Muy Rápido?</h2>
      <p class="lead" style="margin-top:18px;color:#BDB7AE">
        Si desagotaste hace poco y el pozo ya está lleno otra vez, el problema
        no es la capacidad: es que dejó de absorber.
      </p>
      <ul class="checks">
        <li><b>Paredes impermeabilizadas.</b> Grasa de cocina y lodo forman una película que sella el pozo por dentro. Es la causa número uno.</li>
        <li><b>Napa alta o lluvias.</b> Si el nivel freático sube, el pozo no tiene a dónde infiltrar. Muy típico en época de lluvias en zonas bajas.</li>
        <li><b>Fondo colmatado.</b> Años de sedimento compactado en el fondo, que ningún vaciado superficial saca.</li>
        <li><b>Falta de cámara séptica.</b> Sin decantación previa, todos los sólidos entran directo al pozo absorbente y lo tapan.</li>
        <li><b>Cañería obstruida.</b> A veces el pozo está bien y lo que está tapado es el caño de entrada. Se resuelve en una visita.</li>
      </ul>
      <p style="margin-top:24px">
        <a class="btn btn-accent" href="/pozo-ciego-lleno">Ver causas y soluciones en detalle</a>
      </p>
    </div>
  </div>
</section>

<!-- Precios camión -->
<section>
  <div class="wrap two-thirds">
    <div class="rv">
      <span class="eyebrow">Precios</span>
      <h2>Precios y Servicios de Camión Desagotador</h2>
      <p class="lead" style="margin-top:18px">
        El desagüe se cobra por viaje de camión, no por hora. Un camión estándar
        levanta alrededor de <?= (int)$RATES['desague_m3'] ?> m³, así que un pozo domiciliario
        común se resuelve en uno o dos viajes.
      </p>
      <dl class="ptabla" style="margin-top:26px">
        <div class="prow">
          <dt>Desagüe de pozo ciego — por viaje</dt>
          <dd class="tnum"><?= e(gs_rango($RATES['desague_viaje_min'], $RATES['desague_viaje_max'])) ?></dd>
          <span class="prow-note">Valor de referencia en Asunción y Gran Asunción. La distancia y el horario del pedido lo mueven.</span>
        </div>
        <div class="prow">
          <dt>Limpieza de cámara séptica</dt>
          <dd class="tnum">Se cotiza junto al desagüe</dd>
          <span class="prow-note">Conviene hacerla en el mismo viaje: el camión ya está en tu casa.</span>
        </div>
        <div class="prow">
          <dt>Destape de cañería de entrada</dt>
          <dd class="tnum">Según el caso</dd>
          <span class="prow-note">Cuando el pozo está bien y lo que está tapado es el caño.</span>
        </div>
        <div class="prow">
          <dt>Excavación de pozo nuevo</dt>
          <dd class="tnum">Con visita al terreno</dd>
          <span class="prow-note">Depende de la profundidad, del tipo de suelo y de si es con anillos o prefabricado.</span>
        </div>
      </dl>
      <p class="small muted" style="margin-top:20px">
        Valores referenciales en guaraníes, revisados el <?= e(date('d/m/Y', strtotime(RATES_UPDATED))) ?>.
        Consultá si incluyen IVA. Pago en efectivo, transferencia, tarjeta, Tigo Money, Billetera Personal o Zimple.
      </p>
    </div>
    <div class="rv">
      <div class="wa-block">
        <h3>Pedí el camión ahora</h3>
        <p>Mandanos ciudad, barrio y, si podés, una foto del pozo abierto.
          Te confirmamos precio cerrado antes de salir.</p>
        <a class="btn btn-wa btn-lg" href="<?= e(wa('Hola, necesito el camión para desagotar el pozo ciego.')) ?>" target="_blank" rel="noopener">Pedir el camión</a>
        <a class="wa-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
      </div>
      <div class="card" style="margin-top:20px">
        <h3 style="font-size:19px">Seguí leyendo</h3>
        <ul class="checks" style="margin-top:12px">
          <li><a href="/desague-pozo-ciego">Servicio de desagüe urgente</a></li>
          <li><a href="/pozo-ciego-lleno">Pozo ciego que no absorbe</a></li>
          <li><a href="/pozos-septicos">Cámara séptica y pozo absorbente</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Banda -->
<section class="banda-cta bleed">
  <div class="wrap banda-in">
    <div>
      <h2>Un pozo bien hecho se desagota cada años, no cada meses</h2>
      <p>Si venís llamando al camión seguido, hablemos de la cámara séptica.
        Sale una vez y te ahorra la cuenta que estás pagando todo el tiempo.</p>
    </div>
    <div class="banda-acts">
      <a class="btn btn-wa btn-lg" href="<?= e(wa('Hola, mi pozo ciego se llena seguido y quiero ver la opción de cámara séptica.')) ?>" target="_blank" rel="noopener">Consultá sin compromiso</a>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="band-surface bleed">
  <div class="wrap-narrow">
    <header class="sec-head rv">
      <span class="eyebrow">Dudas frecuentes</span>
      <h2>Preguntas sobre pozos ciegos</h2>
    </header>
    <div class="faq">
      <?php foreach ($FAQ as $f): ?>
        <details><summary><?= e($f['q']) ?></summary><div class="faq-a"><p><?= e($f['a']) ?></p></div></details>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section id="contacto">
  <div class="wrap split">
    <div class="rv">
      <span class="eyebrow">Contacto</span>
      <h2 style="margin-bottom:26px">Contanos qué pasa con tu pozo</h2>
      <?php
      $FORM_SERVICIO = 'Pozo ciego';
      $FORM_TITLE = 'Presupuesto de pozo ciego';
      $FORM_TEXT  = 'Desagüe, excavación o cámara séptica. Presupuestar no cuesta nada.';
      include __DIR__ . '/includes/lead-form.php';
      ?>
    </div>
    <div class="split-media rv">
      <div class="panel">
        <div class="motivo-camion" aria-hidden="true"></div>
        <span class="panel-tag">Panel ilustrativo · servicio de desagote</span>
      </div>
      <p class="small muted" style="margin-top:16px">
        Atendemos <?= e(implode(', ', array_slice($ZONAS, 0, 6))) ?> y el resto de Gran Asunción.
        Ver también <a href="/desague-san-lorenzo">desagüe en San Lorenzo</a> y
        <a href="/desague-mariano-roque-alonso">en Mariano Roque Alonso</a>.
      </p>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
