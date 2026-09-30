<?php
require_once __DIR__ . "/includes/config.php";
$page = 'desague-san-lorenzo';
$SERVICE = 'Desagüe de pozo ciego en San Lorenzo';
$FAQ = [
  ['q' => '¿Cuánto cuesta el desagüe de un pozo ciego en San Lorenzo?',
   'a' => 'Se cobra por viaje de camión atmosférico, con un valor de referencia de ' . gs_rango($RATES['desague_viaje_min'], $RATES['desague_viaje_max']) . ' para Asunción y Gran Asunción. San Lorenzo entra en esa franja porque está dentro del radio habitual. Lo que puede moverlo es el tamaño del pozo, cuántos años lleva sin limpieza y el acceso del camión. Mandanos el barrio por WhatsApp y te confirmamos el precio cerrado antes de salir.'],
  ['q' => '¿Vienen el mismo día a San Lorenzo?',
   'a' => 'Los pedidos que entran a la mañana se suelen coordinar para el mismo día, porque San Lorenzo está sobre el eje de la Ruta Mcal. Estigarribia y es de las zonas más rápidas de cubrir desde Asunción. No te vamos a prometer una hora exacta por internet: escribinos con la dirección y te damos una franja real.'],
  ['q' => '¿Entra el camión en calles de tierra?',
   'a' => 'En general sí, pero después de varios días de lluvia algunas calles de tierra de los barrios más nuevos se ponen difíciles para un camión cargado. Si estás en una de esas, avisanos: se resuelve coordinando el día o sumando manguera para no meter el camión hasta la puerta.'],
  ['q' => '¿Atienden también cámaras sépticas y destapes?',
   'a' => 'Sí. En el mismo viaje se puede limpiar la cámara séptica, y si el problema resulta ser la cañería de entrada y no el pozo, se hace el destape. Contanos el síntoma y vemos qué necesitás realmente antes de mandar el camión.'],
];
include __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="hero-media" style="min-height:min(52vh,420px)">
    <div class="motivo-camion" aria-hidden="true" style="position:absolute;inset:0"></div>
    <div class="wrap">
      <div class="hero-in" style="padding-top:48px;padding-bottom:32px">
        <span class="eyebrow" style="color:#E9855A">San Lorenzo · Departamento Central</span>
        <h1>Desagüe de Pozo Ciego en San Lorenzo</h1>
        <p class="lead">
          Camión atmosférico para vaciar tu pozo ciego o tu cámara séptica en cualquier
          barrio de San Lorenzo. Precio cerrado por WhatsApp antes de que salga el camión.
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
      <div class="hero-fact"><b><?= e(gs($RATES['desague_viaje_min'])) ?></b><span>Desde, por viaje de camión — valor de referencia para Gran Asunción</span></div>
      <div class="hero-fact"><b><span data-count="<?= (int)$RATES['desague_m3'] ?>"><?= (int)$RATES['desague_m3'] ?></span> m³</b><span>Capacidad del camión: un pozo domiciliario común entra en un viaje</span></div>
      <div class="hero-fact"><b>Ruta 2</b><span>San Lorenzo está sobre el eje Estigarribia: es de lo más rápido de cubrir</span></div>
    </div>
  </div>
</section>

<!-- Servicio local — split -->
<section>
  <div class="wrap split">
    <div class="rv prose">
      <span class="eyebrow">El servicio en San Lorenzo</span>
      <h2>Limpieza y Vaciado de Pozos Ciegos en San Lorenzo</h2>
      <p class="lead" style="margin-top:18px">
        San Lorenzo creció mucho más rápido que su red cloacal. Fuera del casco céntrico,
        la enorme mayoría de las casas resuelve el efluente con pozo ciego, y muchas de
        ellas sin cámara séptica adelante. Eso explica por qué acá los pozos se saturan
        antes que en otras zonas.
      </p>

      <h3>Atención urgente en barrios de San Lorenzo</h3>
      <p>
        Cubrimos el centro y los barrios de todo el municipio: Barcequillo, Reducto,
        Villa Universitaria, San Miguel, Santa Lucía, la zona del Mercado de Abasto
        y los loteos nuevos hacia el este, camino a Capiatá.
      </p>
      <p>
        Dos condiciones locales que conviene tener en cuenta antes de pedir el camión.
        La primera es el tránsito: sobre la Ruta Mcal. Estigarribia y en los accesos al
        Abasto, la hora pico se siente, así que los pedidos de media mañana se coordinan
        mejor que los del mediodía. La segunda es el suelo: en los sectores más bajos del
        municipio la napa sube bastante después de varios días de lluvia, y ahí muchos
        pozos dejan de absorber aunque estén recién vaciados. Si el tuyo colapsa solo
        cuando llueve, el problema no se arregla con otro viaje de camión —
        <a href="/pozo-ciego-lleno">leé por qué se llena rápido un pozo ciego</a>.
      </p>

      <h3>Precios accesibles para desagüe de pozos y cámaras</h3>
      <p>
        San Lorenzo está dentro del radio habitual de cobertura, así que no paga recargo
        por distancia: se cotiza en la misma franja que Asunción. El viaje de camión
        atmosférico ronda los <?= e(gs_rango($RATES['desague_viaje_min'], $RATES['desague_viaje_max'])) ?>,
        valor referencial revisado el <?= e(date('d/m/Y', strtotime(RATES_UPDATED))) ?>.
      </p>
      <ul class="checks">
        <li><b>Vaciado con succión de fondo</b>, no solo del líquido de superficie.</li>
        <li><b>Limpieza de cámara séptica</b> en el mismo viaje, sin cobrar dos salidas.</li>
        <li><b>Destape de cañería</b> cuando el pozo está bien y lo que está tapado es el caño.</li>
        <li><b>Precio cerrado por WhatsApp</b> antes de que el camión salga, no al terminar.</li>
      </ul>
      <p class="small muted">
        Pago en efectivo, transferencia, tarjeta, Tigo Money, Billetera Personal o Zimple.
        Consultá si el precio incluye IVA y pedí factura legal al momento de solicitar el servicio.
      </p>
    </div>

    <div class="split-media rv">
      <div class="panel" style="aspect-ratio:3/4">
        <div class="motivo-camion" aria-hidden="true"></div>
        <span class="panel-tag">Panel ilustrativo · camión atmosférico</span>
      </div>
      <div class="card" style="margin-top:-38px;margin-right:20px;position:relative;z-index:3">
        <h3 style="font-size:19px">Mandanos esto y cotizamos sin ir</h3>
        <ul class="checks" style="margin-top:12px">
          <li>Barrio de San Lorenzo y calle</li>
          <li>Si el camión llega hasta la boca del pozo</li>
          <li>Cuándo fue el último desagüe</li>
          <li>Si tenés cámara séptica o no</li>
        </ul>
        <a class="btn btn-wa" style="width:100%;margin-top:16px" href="<?= e(wa('Hola, necesito desagüe de pozo ciego en San Lorenzo. Mi barrio es:')) ?>" target="_blank" rel="noopener">Escribinos ahora</a>
      </div>
    </div>
  </div>
</section>

<!-- Banda + presupuesto -->
<section class="banda-cta bleed">
  <div class="wrap banda-in">
    <div>
      <h2>Presupuesto Inmediato por WhatsApp para San Lorenzo</h2>
      <p>
        Mandanos el barrio y, si podés, una foto del pozo abierto. Con eso te pasamos
        el precio cerrado y la franja horaria en la que puede estar el camión. Sin visita
        previa, sin cargo por cotizar y sin compromiso de contratar.
      </p>
    </div>
    <div class="banda-acts">
      <a class="btn btn-wa btn-lg" href="<?= e(wa('Hola, necesito desagüe de pozo ciego en San Lorenzo. Mi barrio es:')) ?>" target="_blank" rel="noopener">Pedir presupuesto</a>
      <a class="btn btn-ghost btn-lg" href="tel:<?= e(TEL_LINK) ?>">Llamanos</a>
    </div>
  </div>
</section>

<!-- Otros servicios + FAQ -->
<section class="band-dark bleed">
  <div class="wrap two-thirds">
    <div class="rv">
      <span class="eyebrow">Dudas frecuentes</span>
      <h2>Preguntas sobre el desagüe en San Lorenzo</h2>
      <div class="faq" style="border-color:var(--border-dark);margin-top:32px">
        <?php foreach ($FAQ as $f): ?>
          <details style="border-color:var(--border-dark)"><summary><?= e($f['q']) ?></summary><div class="faq-a" style="color:#A8A29A"><p><?= e($f['a']) ?></p></div></details>
        <?php endforeach; ?>
      </div>
    </div>
    <div class="rv">
      <div class="card">
        <h3 style="font-size:19px">Qué más hacemos en San Lorenzo</h3>
        <ul class="checks" style="margin-top:12px">
          <li><a href="/pozos-artesianos">Perforación de pozos artesianos</a></li>
          <li><a href="/pozos-septicos">Instalación de cámara séptica</a></li>
          <li><a href="/pozo-ciego-lleno">Pozo que no absorbe</a></li>
          <li><a href="/tratamiento-agua">Filtros para agua de pozo</a></li>
        </ul>
      </div>
      <div class="card" style="margin-top:20px">
        <h3 style="font-size:19px">Otras zonas</h3>
        <ul class="checks" style="margin-top:12px">
          <li><a href="/desague-mariano-roque-alonso">Desagüe en Mariano Roque Alonso</a></li>
          <li><a href="/desague-pozo-ciego">Desagüe en Asunción y Central</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section id="contacto">
  <div class="wrap split split-rev">
    <div class="split-media rv">
      <div class="wa-block">
        <h3>Desagüe en San Lorenzo</h3>
        <p>Lo más rápido es WhatsApp. Si preferís, dejanos tus datos y te llamamos nosotros.</p>
        <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Escribinos por WhatsApp</a>
        <a class="wa-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        <p class="small" style="margin:18px 0 0"><?= e(HOURS_TEXT) ?></p>
      </div>
    </div>
    <div class="rv">
      <span class="eyebrow">Contacto</span>
      <h2 style="margin-bottom:26px">Pedí el camión en San Lorenzo</h2>
      <?php
      $FORM_SERVICIO = 'Desagüe — San Lorenzo';
      $FORM_TITLE = 'Pedido de desagüe en San Lorenzo';
      $FORM_TEXT  = 'Poné tu barrio en el campo de ciudad y te llamamos con el precio cerrado.';
      include __DIR__ . '/includes/lead-form.php';
      ?>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
