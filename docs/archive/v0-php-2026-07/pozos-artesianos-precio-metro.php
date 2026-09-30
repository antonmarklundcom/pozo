<?php
require_once __DIR__ . "/includes/config.php";
$page = 'pozos-artesianos-precio-metro';
$SERVICE = 'Perforación de pozo artesiano por metro';
$FAQ = [
  ['q' => '¿El precio por metro incluye el entubado?',
   'a' => 'Casi nunca. En Paraguay lo habitual es que el precio por metro sea solo la perforación, y que el caño camisa, el filtro, la grava y la bomba se coticen aparte. Por eso dos presupuestos con el mismo «precio por metro» pueden terminar en totales muy distintos. Preguntá siempre qué incluye el metro.'],
  ['q' => '¿Cuánto sube el precio si aparece roca?',
   'a' => 'Bastante. La roca obliga a cambiar de método de perforación y el avance por hora cae fuerte, así que el costo del metro sube de forma marcada. Lo importante es que el presupuesto diga de antemano cuál es el precio del metro en roca, no que se defina cuando el equipo ya está en tu terreno.'],
  ['q' => '¿Se puede pagar en cuotas?',
   'a' => 'Depende del prestador. Lo más común es un anticipo al iniciar y el saldo contra entrega del pozo terminado y ensayado. Se maneja efectivo, transferencia, tarjeta y billeteras (Tigo Money, Billetera Personal, Zimple). Consultá al pedir el presupuesto y quede por escrito.'],
  ['q' => '¿Los precios incluyen IVA?',
   'a' => 'Confirmalo siempre antes de cerrar, porque cambia el total. Si necesitás factura legal, decilo desde el primer mensaje: el precio con factura y sin factura no siempre se cotiza igual y es mejor saberlo al principio.'],
];
include __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="hero-media" style="min-height:min(50vh,400px)">
    <div class="motivo-suelo" aria-hidden="true"></div>
    <div class="wrap">
      <div class="hero-in" style="padding-top:48px;padding-bottom:32px">
        <span class="eyebrow" style="color:#E9855A">Precios</span>
        <h1>Precio por Metro de Perforación de Pozo Artesiano en Paraguay</h1>
        <p class="lead">
          Qué se cobra por metro, qué se cobra aparte y cuánto cambia el total
          según el suelo. Con cotizador en línea para que llegues al presupuesto sabiendo.
        </p>
        <div class="hero-acts">
          <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Pedí tu presupuesto</a>
          <a class="hero-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Cuánto cuesta — 2/3 + 1/3 con tabla -->
<section>
  <div class="wrap two-thirds">
    <div class="rv prose">
      <span class="eyebrow">Valores de referencia</span>
      <h2>¿Cuánto Cuesta la Perforación de un Pozo de Agua?</h2>
      <p class="lead" style="margin-top:18px">
        La perforación se cobra por metro lineal y todo lo demás va como ítem aparte.
        Los valores de abajo son rangos de referencia del mercado de Gran Asunción,
        revisados el <?= e(date('d/m/Y', strtotime(RATES_UPDATED))) ?>, para que puedas
        leer un presupuesto y darte cuenta si algo está muy fuera de lugar.
      </p>

      <h3>Costo por Metro según el Tipo de Suelo (Roca vs. Tierra)</h3>
      <dl class="ptabla" style="margin:20px 0 0">
        <div class="prow">
          <dt>Suelo de tierra o arena</dt>
          <dd class="tnum"><?= e(gs_rango($RATES['perf_tierra_min'], $RATES['perf_tierra_max'])) ?> / m</dd>
          <span class="prow-note">Lo más frecuente en pozos domiciliarios de Central. El equipo avanza rápido.</span>
        </div>
        <div class="prow">
          <dt>Suelo mixto</dt>
          <dd class="tnum"><?= e(gs_rango($RATES['perf_mixto_min'], $RATES['perf_mixto_max'])) ?> / m</dd>
          <span class="prow-note">Capas alternadas de tierra, arena y roca suelta. Es el escenario más común cuando no se sabe de antemano.</span>
        </div>
        <div class="prow">
          <dt>Roca</dt>
          <dd class="tnum"><?= e(gs_rango($RATES['perf_roca_min'], $RATES['perf_roca_max'])) ?> / m</dd>
          <span class="prow-note">Cambia el método de perforación y cae el avance por hora. Es la variable que más presupuestos rompe.</span>
        </div>
      </dl>

      <h3>Precios de Filtros, Bombas Sumergibles y Entubado</h3>
      <dl class="ptabla" style="margin:20px 0 0">
        <div class="prow">
          <dt>Entubado con caño camisa</dt>
          <dd class="tnum"><?= e(gs_rango($RATES['entubado_ml_min'], $RATES['entubado_ml_max'])) ?> / m</dd>
          <span class="prow-note">Va por metro, igual que la perforación: acompaña toda la columna del pozo.</span>
        </div>
        <div class="prow">
          <dt>Filtro y prefiltro de grava</dt>
          <dd class="tnum"><?= e(gs_rango($RATES['filtro_min'], $RATES['filtro_max'])) ?></dd>
          <span class="prow-note">Tramo ranurado a la altura de la napa productiva más la grava seleccionada. Sin esto te entra arena a la bomba.</span>
        </div>
        <div class="prow">
          <dt>Bomba sumergible</dt>
          <dd class="tnum"><?= e(gs_rango($RATES['bomba_min'], $RATES['bomba_max'])) ?></dd>
          <span class="prow-note">El rango es amplio porque la potencia se define con el ensayo de caudal y la altura de elevación, no antes.</span>
        </div>
        <div class="prow">
          <dt>Tablero eléctrico y protecciones</dt>
          <dd class="tnum"><?= e(gs_rango($RATES['tablero_min'], $RATES['tablero_max'])) ?></dd>
          <span class="prow-note">Protección contra marcha en seco incluida. Es lo primero que se recorta y lo que después quema la bomba.</span>
        </div>
      </dl>

      <p class="small muted" style="margin-top:22px">
        Precios en guaraníes, referenciales, no constituyen una oferta.
        Consultá si el presupuesto incluye IVA y pedí factura legal desde el primer mensaje si la necesitás.
        Formas de pago habituales: efectivo, transferencia, tarjeta, Tigo Money, Billetera Personal y Zimple.
      </p>
    </div>

    <div class="rv">
      <div class="card">
        <h3>Cómo comparar dos presupuestos</h3>
        <ul class="checks" style="margin-top:14px">
          <li>¿El metro incluye entubado o no?</li>
          <li>¿Cuál es el precio del metro en roca?</li>
          <li>¿Hasta qué profundidad está cotizado?</li>
          <li>¿El ensayo de caudal está incluido?</li>
          <li>¿La bomba está dimensionada o es «una bomba»?</li>
          <li>¿Qué pasa si el pozo no da agua útil?</li>
        </ul>
        <p class="small muted" style="margin-top:16px">
          El presupuesto más barato por metro suele ser el que menos incluye.
        </p>
      </div>
      <div class="wa-block" style="margin-top:20px">
        <h3>¿Te pasaron un precio y querés una segunda opinión?</h3>
        <p>Mandanos el presupuesto por WhatsApp y te decimos qué le falta.</p>
        <a class="btn btn-wa" href="<?= e(wa('Hola, tengo un presupuesto de perforación y quiero una segunda opinión.')) ?>" target="_blank" rel="noopener">Mandar el presupuesto</a>
      </div>
    </div>
  </div>
</section>

<!-- Banda de acento -->
<section class="banda-cta bleed">
  <div class="wrap banda-in">
    <div>
      <h2>El rango sirve. El presupuesto real vale más.</h2>
      <p>La napa de tu terreno no la sabe ninguna tabla. Pasanos la ciudad y el uso
        y te damos un número con nombre y apellido.</p>
    </div>
    <div class="banda-acts">
      <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Pedí el precio de tu pozo</a>
      <a class="btn btn-ghost btn-lg" href="tel:<?= e(TEL_LINK) ?>">Llamanos</a>
    </div>
  </div>
</section>

<!-- Cotizador -->
<section>
  <div class="wrap split">
    <div class="rv">
      <span class="eyebrow">Cotizador en línea</span>
      <h2>Cotizador en Línea para Perforación de Pozos</h2>
      <p class="lead" style="margin-top:18px">
        Armá tu escenario y llevate el rango. Lo que sale de acá no es una oferta,
        pero es exactamente la cuenta que hace un perforador cuando le contás tu caso por teléfono.
      </p>
      <ul class="checks" style="margin-top:24px">
        <li>Elegí la profundidad que estimás, o dejá el valor medio si no tenés idea.</li>
        <li>Si no sabés el suelo, marcá «No sé»: calculamos con mixto, que es lo más probable en Central.</li>
        <li>Destildá bomba y tablero si vas a hacerlos en una segunda etapa.</li>
        <li>Mandá el resultado por WhatsApp: llega con todos los datos ya cargados.</li>
      </ul>
      <p class="small muted" style="margin-top:24px">
        ¿Todavía no leíste cómo se construye el pozo?
        <a href="/pozos-artesianos">Ver el proceso de perforación y entubado</a>.
      </p>
    </div>
    <div class="rv">
      <?php include __DIR__ . '/includes/calculator.php'; ?>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="band-dark bleed">
  <div class="wrap-narrow">
    <header class="sec-head rv">
      <span class="eyebrow">Dudas frecuentes</span>
      <h2>Preguntas sobre el precio de un pozo</h2>
    </header>
    <div class="faq" style="border-color:var(--border-dark)">
      <?php foreach ($FAQ as $f): ?>
        <details style="border-color:var(--border-dark)"><summary><?= e($f['q']) ?></summary><div class="faq-a" style="color:#A8A29A"><p><?= e($f['a']) ?></p></div></details>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Contacto -->
<section id="contacto">
  <div class="wrap split split-rev">
    <div class="split-media rv">
      <div class="panel">
        <div class="motivo-napas" aria-hidden="true"></div>
        <span class="panel-tag">Panel ilustrativo · columna de pozo</span>
      </div>
    </div>
    <div class="rv">
      <span class="eyebrow">Contacto</span>
      <h2 style="margin-bottom:26px">Pedí el precio real de tu pozo</h2>
      <?php
      $FORM_SERVICIO = 'Precio por metro — perforación';
      $FORM_TITLE = 'Presupuesto de perforación';
      $FORM_TEXT  = 'Te pasamos el rango cerrado para tu ciudad y tu uso. No cuesta nada.';
      include __DIR__ . '/includes/lead-form.php';
      ?>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
