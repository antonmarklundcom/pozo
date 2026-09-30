<?php
require_once __DIR__ . "/includes/config.php";
$page = 'desague-mariano-roque-alonso';
$SERVICE = 'Desagüe de pozo ciego en Mariano Roque Alonso';
$FAQ = [
  ['q' => '¿Cuánto cuesta el desagüe de pozo ciego en Mariano Roque Alonso?',
   'a' => 'Se cobra por viaje de camión atmosférico, con un valor de referencia de ' . gs_rango($RATES['desague_viaje_min'], $RATES['desague_viaje_max']) . ' en Asunción y Gran Asunción. Mariano Roque Alonso entra en esa franja: está sobre el eje de la Transchaco y no paga recargo por distancia. Mandanos el barrio y te confirmamos el precio cerrado antes de salir.'],
  ['q' => '¿Atienden depósitos, industrias y locales, no solo casas?',
   'a' => 'Sí. Mariano Roque Alonso tiene mucho depósito, taller y local sobre la Transchaco, y ahí los pozos y las cámaras trabajan con más carga que en una vivienda. Se coordina de la misma forma: nos pasás el tipo de local y la frecuencia de uso, y se cotiza el viaje o un mantenimiento programado.'],
  ['q' => '¿Por qué mi pozo aguanta menos que el de un conocido en otra ciudad?',
   'a' => 'Muy probablemente por la napa. Los sectores bajos de Mariano Roque Alonso, cerca del río y de los bañados, tienen el nivel freático alto y sube todavía más después de varios días de lluvia. Con el suelo saturado el pozo no tiene a dónde infiltrar, por más grande que sea. Si el tuyo colapsa solo en época de lluvias, el problema es ese y no se arregla vaciando más seguido.'],
  ['q' => '¿Se puede coordinar para el fin de semana o fuera de horario?',
   'a' => 'Las urgencias de desagüe se coordinan también sábado y domingo. Escribinos por WhatsApp con la dirección: el pedido queda registrado con hora y te confirmamos la franja según la disponibilidad real del día.'],
];
include __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="hero-media" style="min-height:min(52vh,420px)">
    <div class="motivo-camion" aria-hidden="true" style="position:absolute;inset:0"></div>
    <div class="wrap">
      <div class="hero-in" style="padding-top:48px;padding-bottom:32px">
        <span class="eyebrow" style="color:#E9855A">Mariano Roque Alonso · Departamento Central</span>
        <h1>Desagüe de Pozo Ciego en Mariano Roque Alonso</h1>
        <p class="lead">
          Camión desagotador para pozos ciegos, pozos cloacales y cámaras sépticas
          en toda la ciudad: zona Expo, Transchaco, Surubi'i y los barrios bajos
          cerca del río. Precio cerrado por WhatsApp antes de salir.
        </p>
        <div class="hero-acts">
          <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Pedir el camión</a>
          <a class="hero-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="facts-sec">
  <div class="wrap">
    <div class="hero-facts">
      <div class="hero-fact"><b><?= e(gs($RATES['desague_viaje_min'])) ?></b><span>Desde, por viaje — misma franja que Asunción, sin recargo por distancia</span></div>
      <div class="hero-fact"><b>Napa alta</b><span>Los sectores bajos cerca del río saturan primero: acá el diagnóstico importa</span></div>
      <div class="hero-fact"><b>Transchaco</b><span>Cobertura sobre la ruta y en los barrios hacia Limpio y Luque</span></div>
    </div>
  </div>
</section>

<!-- Condiciones locales — 2/3 + 1/3 -->
<section>
  <div class="wrap two-thirds">
    <div class="rv prose">
      <span class="eyebrow">Por qué acá es distinto</span>
      <h2>Vaciado y Limpieza de Pozos Ciegos en Mariano Roque Alonso</h2>
      <p class="lead" style="margin-top:18px">
        Mariano Roque Alonso tiene dos realidades que conviven, y cada una rompe
        los pozos de una manera distinta. Vale la pena saber en cuál estás antes
        de pedir el camión.
      </p>

      <h3>La napa alta de los sectores bajos</h3>
      <p>
        Buena parte de la ciudad está en terreno bajo, cerca del río y de los bañados,
        con el nivel freático alto durante gran parte del año. Cuando llueve varios días
        seguidos, el suelo alrededor del pozo queda saturado y la absorción se detiene:
        el pozo se llena aunque lo hayas vaciado hace poco, y no por falta de capacidad.
      </p>
      <p>
        El patrón se reconoce fácil. Si tu pozo funciona bien en época seca y colapsa
        cada vez que llueve, el problema es la napa. Ahí la salida pasa por ampliar la
        superficie de infiltración, sumar cámara séptica para bajarle carga al pozo o
        separar las aguas grises — no por pagar un viaje de camión atrás de otro.
        <a href="/pozo-ciego-lleno">Mirá las causas y las soluciones en detalle</a>.
      </p>

      <h3>Locales, depósitos y talleres sobre la Transchaco</h3>
      <p>
        El corredor de la Ruta Transchaco y la zona de la Expo concentran depósitos,
        talleres, comercios y locales de eventos. Ahí los pozos y las cámaras trabajan
        con caudales y con grasas que una vivienda no genera, y se saturan mucho más
        rápido. Para estos casos conviene un mantenimiento programado en vez de esperar
        el desborde: sale lo mismo por viaje y no te frena la actividad un día laboral.
      </p>
      <p>
        Un detalle logístico que sí incide: sobre la Transchaco el tránsito pesado
        marca los horarios. Los pedidos de media mañana se coordinan mejor que los de
        hora pico, y en los días de Expo conviene avisar con anticipación.
      </p>
    </div>

    <div class="rv">
      <div class="panel" style="aspect-ratio:3/4">
        <div class="motivo-napas" aria-hidden="true"></div>
        <span class="panel-tag">Panel ilustrativo · napa alta</span>
      </div>
      <div class="card" style="margin-top:-40px;margin-right:18px;position:relative;z-index:3">
        <h3 style="font-size:19px">Contanos esto y cotizamos sin ir</h3>
        <ul class="checks" style="margin-top:12px">
          <li>Barrio y calle en Mariano Roque Alonso</li>
          <li>Si es vivienda, local o depósito</li>
          <li>Si falla solo cuando llueve</li>
          <li>Cuándo fue el último desagüe</li>
          <li>Si el camión llega hasta la boca del pozo</li>
        </ul>
        <a class="btn btn-wa" style="width:100%;margin-top:16px" href="<?= e(wa('Hola, necesito desagüe de pozo ciego en Mariano Roque Alonso. Mi barrio es:')) ?>" target="_blank" rel="noopener">Escribinos ahora</a>
      </div>
    </div>
  </div>
</section>

<!-- Banda -->
<section class="banda-cta bleed">
  <div class="wrap banda-in">
    <div>
      <h2>Presupuesto por WhatsApp para Mariano Roque Alonso</h2>
      <p>
        Mandanos el barrio y, si podés, una foto del pozo abierto. Te pasamos el precio
        cerrado y la franja horaria del camión. Cotizar no cuesta nada y no te compromete a contratar.
      </p>
    </div>
    <div class="banda-acts">
      <a class="btn btn-wa btn-lg" href="<?= e(wa('Hola, necesito desagüe de pozo ciego en Mariano Roque Alonso. Mi barrio es:')) ?>" target="_blank" rel="noopener">Pedir presupuesto</a>
      <a class="btn btn-ghost btn-lg" href="tel:<?= e(TEL_LINK) ?>">Llamanos</a>
    </div>
  </div>
</section>

<!-- Qué incluye — split oscuro -->
<section class="band-dark bleed">
  <div class="wrap split">
    <div class="split-media rv">
      <div class="panel" style="aspect-ratio:1/1;border-color:var(--border-dark)">
        <div class="motivo-camion" aria-hidden="true"></div>
        <span class="panel-tag">Panel ilustrativo · succión de fondo</span>
      </div>
    </div>
    <div class="rv">
      <span class="eyebrow">Qué incluye el servicio</span>
      <h2>Lo que hace el camión cuando llega</h2>
      <ul class="checks" style="margin-top:24px">
        <li><b>Succión de fondo</b>, no solo del líquido de superficie: el lodo compactado es lo que le roba capacidad al pozo.</li>
        <li><b>Limpieza de cámara séptica</b> en el mismo viaje, sin cobrar dos salidas.</li>
        <li><b>Destape de cañería de entrada</b> si el problema resulta ser el caño y no el pozo.</li>
        <li><b>Manguera adicional</b> cuando el camión no puede acercarse a la boca del pozo.</li>
        <li><b>Precio cerrado por WhatsApp</b> antes de salir, no al terminar el trabajo.</li>
      </ul>
      <p class="small" style="color:#A8A29A;margin-top:22px">
        Valores referenciales revisados el <?= e(date('d/m/Y', strtotime(RATES_UPDATED))) ?>.
        Consultá si incluyen IVA y pedí factura legal al solicitar el servicio.
        Efectivo, transferencia, tarjeta, Tigo Money, Billetera Personal y Zimple.
      </p>
      <p style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px">
        <a class="btn btn-ghost" href="/desague-pozo-ciego">Ver el servicio completo</a>
        <a class="btn btn-ghost" href="/desague-san-lorenzo">Desagüe en San Lorenzo</a>
      </p>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="band-surface bleed">
  <div class="wrap-narrow">
    <header class="sec-head rv">
      <span class="eyebrow">Dudas frecuentes</span>
      <h2>Preguntas sobre el desagüe en Mariano Roque Alonso</h2>
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
      <h2 style="margin-bottom:26px">Pedí el camión en Mariano Roque Alonso</h2>
      <?php
      $FORM_SERVICIO = 'Desagüe — Mariano Roque Alonso';
      $FORM_TITLE = 'Pedido de desagüe en M. R. Alonso';
      $FORM_TEXT  = 'Poné tu barrio en el campo de ciudad y te llamamos con el precio cerrado.';
      include __DIR__ . '/includes/lead-form.php';
      ?>
    </div>
    <div class="split-media rv">
      <div class="wa-block">
        <h3>Qué más hacemos acá</h3>
        <ul class="checks" style="margin-top:10px">
          <li><a href="/pozos-artesianos" style="color:#fff">Perforación de pozos artesianos</a></li>
          <li><a href="/pozos-septicos" style="color:#fff">Cámara séptica y pozo absorbente</a></li>
          <li><a href="/pozos-ciegos" style="color:#fff">Construcción de pozo ciego</a></li>
          <li><a href="/tratamiento-agua" style="color:#fff">Filtros para agua de pozo</a></li>
        </ul>
        <a class="btn btn-wa btn-lg" style="margin-top:20px" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Escribinos por WhatsApp</a>
        <a class="wa-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        <p class="small" style="margin:18px 0 0"><?= e(HOURS_TEXT) ?></p>
      </div>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
