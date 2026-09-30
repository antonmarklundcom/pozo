<?php
require_once __DIR__ . "/includes/config.php";
$page = 'desague-pozo-ciego';
$SERVICE = 'Desagüe de pozo ciego con camión atmosférico';
$FAQ = [
  ['q' => '¿Cuánto sale el desagüe de un pozo ciego?',
   'a' => 'Se cobra por viaje de camión atmosférico. Un camión estándar levanta alrededor de ' . (int)$RATES['desague_m3'] . ' m³, que suele alcanzar para un pozo domiciliario común. Si el pozo es grande o hace años que no se limpia, pueden hacer falta dos viajes. La ciudad, la distancia y el horario del pedido también inciden. Mandanos la dirección por WhatsApp y te pasamos el precio cerrado antes de salir.'],
  ['q' => '¿En cuánto tiempo llega el camión?',
   'a' => 'Depende de la carga del día y de dónde estés. En Asunción y en el cinturón de Central los pedidos de la mañana se suelen coordinar para el mismo día. No te vamos a prometer un horario exacto por internet: escribinos con la dirección y te confirmamos una franja real.'],
  ['q' => '¿El camión entra a cualquier casa?',
   'a' => 'Necesita acceso vehicular y que la manguera llegue hasta la boca del pozo. Si tenés calle angosta, portón chico o el pozo está en el fondo del terreno, avisanos al pedir el servicio: se resuelve con manguera adicional, pero es mejor saberlo antes de que salga el camión.'],
  ['q' => '¿Qué tengo que dejar preparado?',
   'a' => 'Que la tapa del pozo esté ubicada y accesible, y despejado el camino desde la calle. Si no sabés dónde está la tapa, avisá: se puede localizar, pero suma tiempo al trabajo.'],
  ['q' => '¿Hacen factura legal?',
   'a' => 'Pedila al momento de solicitar el servicio y lo coordinamos con el prestador que va a tu domicilio. Es importante decirlo antes, no al terminar el trabajo.'],
];
include __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="hero-media" style="min-height:min(52vh,420px)">
    <div class="motivo-camion" aria-hidden="true" style="position:absolute;inset:0"></div>
    <div class="wrap">
      <div class="hero-in" style="padding-top:48px;padding-bottom:32px">
        <span class="eyebrow" style="color:#E9855A">Urgencias · Asunción y Central</span>
        <h1>Servicio de Desagüe de Pozo Ciego Urgente</h1>
        <p class="lead">
          Camión atmosférico para vaciar tu pozo ciego, pozo cloacal o cámara séptica.
          Mandanos ciudad, barrio y una foto: te confirmamos precio cerrado antes de salir.
        </p>
        <div class="hero-acts">
          <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Pedir el camión ahora</a>
          <a class="hero-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="facts-sec">
  <div class="wrap">
    <div class="hero-facts">
      <div class="hero-fact"><b><span data-count="<?= (int)$RATES['desague_m3'] ?>"><?= (int)$RATES['desague_m3'] ?></span> m³</b><span>Capacidad habitual del camión atmosférico por viaje</span></div>
      <div class="hero-fact"><b>Fondo</b><span>Succionamos el lodo del fondo, no solo el líquido de arriba</span></div>
      <div class="hero-fact"><b>Sáb y dom</b><span>Las urgencias de desagüe también se coordinan el fin de semana</span></div>
    </div>
  </div>
</section>

<!-- Evacuación y limpieza — split -->
<section>
  <div class="wrap split">
    <div class="rv prose">
      <span class="eyebrow">El servicio</span>
      <h2>Evacuación y Limpieza de Pozos Ciegos y Sanitarios</h2>
      <p class="lead" style="margin-top:18px">
        Un desagüe hecho a medias es tirar la plata: el camión se lleva el líquido,
        vos ves el pozo vacío, y en tres semanas estás llamando de nuevo.
        La diferencia está en el fondo.
      </p>

      <h3>Camiones atmosféricos equipados para pozos profundos</h3>
      <p>
        No todos los pozos se resuelven igual. Un pozo domiciliario de pocos metros
        se vacía con manguera estándar; un pozo profundo, o uno con la tapa en el fondo
        del terreno, necesita más manguera y más potencia de succión para llegar al lodo.
      </p>
      <ul class="checks">
        <li><b>Succión hasta el fondo</b>, para sacar el sedimento compactado que es el que le roba capacidad al pozo.</li>
        <li><b>Manguera adicional</b> cuando el camión no puede acercarse a la boca del pozo.</li>
        <li><b>Vaciado de cámara séptica</b> en el mismo viaje, que es donde están los sólidos decantados.</li>
        <li><b>Disposición del efluente</b> en el punto habilitado. Preguntá siempre a dónde se lleva: no es un detalle menor.</li>
      </ul>

      <h3>Desobstrucción y reactivación de absorción del pozo</h3>
      <p>
        A veces el pozo no está lleno: está tapado. Y a veces está vacío pero ya no infiltra,
        porque las paredes se sellaron con grasa y lodo. Son dos problemas distintos con
        soluciones distintas, y conviene identificar cuál tenés antes de pagar un viaje de camión.
      </p>
      <ul class="checks">
        <li><b>Destape de la cañería de entrada</b> cuando el efluente ni siquiera está llegando al pozo.</li>
        <li><b>Limpieza de las paredes</b> para romper la película de grasa que impermeabilizó la superficie de absorción.</li>
        <li><b>Retiro del fondo colmatado</b>, que es lo único que devuelve capacidad real de infiltración.</li>
        <li><b>Bioenzimas y reactivadores</b> como mantenimiento posterior, nunca como reemplazo de la limpieza mecánica.</li>
      </ul>
      <p>
        Si el tuyo se llena a las pocas semanas de cada desagote,
        <a href="/pozo-ciego-lleno">leé primero por qué se llena rápido un pozo ciego</a>:
        puede que necesites una solución y no otro viaje de camión.
      </p>
    </div>

    <div class="split-media rv">
      <div class="panel" style="aspect-ratio:3/4">
        <div class="motivo-camion" aria-hidden="true"></div>
        <span class="panel-tag">Panel ilustrativo · succión de fondo</span>
      </div>
      <div class="card" style="margin-top:-38px;margin-right:20px;position:relative;z-index:3">
        <h3 style="font-size:19px">Antes de llamar, tené a mano</h3>
        <ul class="checks" style="margin-top:12px">
          <li>Ciudad y barrio exactos</li>
          <li>Si sabés dónde está la tapa del pozo</li>
          <li>Cuándo fue el último desagüe</li>
          <li>Si tenés cámara séptica o no</li>
          <li>Si el camión puede llegar hasta la boca</li>
        </ul>
        <p class="small muted" style="margin-top:14px">Con estos cinco datos te cotizamos sin ir a mirar.</p>
      </div>
    </div>
  </div>
</section>

<!-- Precio — banda oscura con tabla -->
<section class="band-dark bleed">
  <div class="wrap two-thirds">
    <div class="rv">
      <span class="eyebrow">Precio</span>
      <h2>Precio de Desagüe de Pozo Ciego en Asunción y Central</h2>
      <p class="lead" style="margin-top:18px;color:#BDB7AE">
        Se cobra por viaje. El precio cerrado te lo confirmamos por WhatsApp
        antes de que salga el camión, nunca al terminar el trabajo.
      </p>
      <dl class="ptabla" style="margin-top:26px">
        <div class="prow" style="background:var(--dark-soft);border-color:var(--border-dark)">
          <dt style="color:#fff">Viaje de camión atmosférico</dt>
          <dd class="tnum" style="color:#E9855A"><?= e(gs_rango($RATES['desague_viaje_min'], $RATES['desague_viaje_max'])) ?></dd>
          <span class="prow-note" style="color:#A8A29A">Referencia en Asunción y Gran Asunción, camión de <?= (int)$RATES['desague_m3'] ?> m³.</span>
        </div>
        <div class="prow" style="background:var(--dark-soft);border-color:var(--border-dark)">
          <dt style="color:#fff">Segundo viaje en el mismo servicio</dt>
          <dd class="tnum" style="color:#E9855A">Se cotiza al confirmar</dd>
          <span class="prow-note" style="color:#A8A29A">Pozos grandes o con muchos años sin limpieza suelen necesitarlo.</span>
        </div>
        <div class="prow" style="background:var(--dark-soft);border-color:var(--border-dark)">
          <dt style="color:#fff">Fuera de Gran Asunción</dt>
          <dd class="tnum" style="color:#E9855A">+ traslado</dd>
          <span class="prow-note" style="color:#A8A29A">Se suma según la distancia. Decinos la localidad y te pasamos el total.</span>
        </div>
      </dl>
      <p class="small" style="color:#A8A29A;margin-top:20px">
        Valores referenciales en guaraníes, revisados el <?= e(date('d/m/Y', strtotime(RATES_UPDATED))) ?>.
        Consultá si incluyen IVA. Efectivo, transferencia, tarjeta, Tigo Money, Billetera Personal y Zimple.
      </p>
    </div>
    <div class="rv">
      <div class="card">
        <h3 style="font-size:19px">Dónde vamos</h3>
        <ul class="zonas-list" style="margin-top:14px">
          <?php foreach ($ZONAS as $z): ?><li><?= e($z) ?></li><?php endforeach; ?>
        </ul>
        <ul class="checks" style="margin-top:18px">
          <li><a href="/desague-san-lorenzo">Desagüe en San Lorenzo</a></li>
          <li><a href="/desague-mariano-roque-alonso">Desagüe en Mariano Roque Alonso</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- WhatsApp 24/7 — banda + form -->
<section class="banda-cta bleed">
  <div class="wrap banda-in">
    <div>
      <h2>Solicitud de Servicio por WhatsApp 24/7</h2>
      <p>
        El WhatsApp está abierto a cualquier hora: escribí cuando el problema aparece,
        aunque sea de madrugada, y el pedido queda registrado con hora. La confirmación
        del camión y el horario de llegada te los damos según la disponibilidad real del día —
        no te vamos a prometer un horario que después no se cumple.
      </p>
    </div>
    <div class="banda-acts">
      <a class="btn btn-wa btn-lg" href="<?= e(wa('Hola, necesito desagüe de pozo ciego urgente. Mi dirección es:')) ?>" target="_blank" rel="noopener">Pedir el camión por WhatsApp</a>
      <a class="btn btn-ghost btn-lg" href="tel:<?= e(TEL_LINK) ?>">Llamanos al <?= e(TEL_TEXT) ?></a>
    </div>
  </div>
</section>

<!-- FAQ -->
<section>
  <div class="wrap-narrow">
    <header class="sec-head rv">
      <span class="eyebrow">Dudas frecuentes</span>
      <h2>Preguntas sobre el servicio de desagüe</h2>
    </header>
    <div class="faq">
      <?php foreach ($FAQ as $f): ?>
        <details><summary><?= e($f['q']) ?></summary><div class="faq-a"><p><?= e($f['a']) ?></p></div></details>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section id="contacto" class="band-surface bleed">
  <div class="wrap split split-rev">
    <div class="split-media rv">
      <div class="wa-block">
        <h3>Pedí el camión</h3>
        <p>Ciudad, barrio y una foto del pozo. Con eso te confirmamos precio y franja horaria.</p>
        <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Escribinos por WhatsApp</a>
        <a class="wa-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        <p class="small" style="margin:18px 0 0"><?= e(HOURS_TEXT) ?></p>
      </div>
    </div>
    <div class="rv">
      <span class="eyebrow">Contacto</span>
      <h2 style="margin-bottom:26px">Dejanos tus datos y te llamamos</h2>
      <?php
      $FORM_SERVICIO = 'Desagüe de pozo ciego';
      $FORM_TITLE = 'Pedido de desagüe';
      $FORM_TEXT  = 'Si no querés escribir por WhatsApp, dejanos tres datos y te llamamos.';
      include __DIR__ . '/includes/lead-form.php';
      ?>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
