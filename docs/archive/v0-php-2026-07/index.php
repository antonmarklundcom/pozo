<?php
require_once __DIR__ . "/includes/config.php";
$page = 'home';
$FAQ = [
  ['q' => '¿Cuánto cuesta hacer un pozo artesiano en Paraguay?',
   'a' => 'Depende de tres cosas: la profundidad hasta la napa, el tipo de suelo que hay que atravesar y si el presupuesto incluye entubado, filtro y bomba. La perforación se cobra por metro lineal y sube bastante cuando aparece roca. Usá el cotizador de esta página para tener un rango de referencia y después pedí el presupuesto real: la napa exacta recién se confirma en el terreno.'],
  ['q' => '¿Cuánto sale el desagüe de un pozo ciego?',
   'a' => 'El desagüe se cobra por viaje de camión atmosférico. Un camión estándar levanta alrededor de ' . (int)$RATES['desague_m3'] . ' m³, así que un pozo domiciliario común suele resolverse en uno o dos viajes. La distancia hasta tu casa y la hora del pedido también influyen. Mandanos la ciudad y el barrio por WhatsApp y te pasamos el precio cerrado antes de salir.'],
  ['q' => '¿Cuál es la diferencia entre pozo ciego, pozo séptico y cámara séptica?',
   'a' => 'El pozo ciego (o pozo absorbente) es un pozo excavado sin fondo impermeable: el líquido se filtra en la tierra. La cámara séptica es un tanque cerrado donde el efluente decanta y se separa antes de pasar al pozo absorbente. Lo correcto para una vivienda es cámara séptica más pozo absorbente: el pozo ciego solo, sin cámara previa, se satura mucho más rápido y contamina la napa.'],
  ['q' => '¿Atienden urgencias y fines de semana?',
   'a' => 'Los pedidos de desagüe se coordinan también sábados y domingos, porque un pozo desbordado no espera al lunes. La perforación de pozos se agenda de lunes a sábado. Escribinos por WhatsApp con la dirección y te confirmamos en cuánto puede estar el camión.'],
  ['q' => '¿El presupuesto tiene costo?',
   'a' => 'No. Presupuestar y, cuando hace falta, ir a ver el terreno o el pozo, no se cobra ni te obliga a nada. Vas a saber el precio antes de que empiece cualquier trabajo.'],
  ['q' => '¿El agua de pozo artesiano es potable?',
   'a' => 'No se puede dar por hecho. El agua subterránea en Paraguay suele salir limpia pero con hierro, sarro o color amarillento, y en zonas con pozos ciegos cercanos puede tener carga bacteriológica. Lo correcto es hacer un análisis fisicoquímico y bacteriológico del agua del pozo y recién ahí definir qué filtro o qué cloración necesitás.'],
];
include __DIR__ . '/includes/header.php';
?>

<!-- ══ HERO — full-bleed con panel de suelo perforado ══ -->
<section class="hero">
  <div class="hero-media">
    <div class="motivo-suelo" aria-hidden="true"></div>
    <div class="wrap">
      <div class="hero-in">
        <span class="eyebrow" style="color:#E9855A">Asunción · Gran Asunción · Interior</span>
        <h1>Perforación de Pozos Artesianos y Desagüe de Pozos en Paraguay</h1>
        <p class="lead">
          Perforamos pozos de agua, desagotamos pozos ciegos con camión atmosférico,
          instalamos cámaras sépticas y filtramos agua de pozo. Un solo mensaje y
          te pasamos el presupuesto, sin costo y sin compromiso.
        </p>
        <div class="hero-acts">
          <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.92-4.45 9.92-9.91 0-2.65-1.04-5.14-2.91-7.01A9.82 9.82 0 0 0 12.04 2Z"/></svg>
            Pedí tu presupuesto
          </a>
          <a class="hero-tel" href="tel:<?= e(TEL_LINK) ?>">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>
            <span class="tnum"><?= e(TEL_TEXT) ?></span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="facts-sec">
  <div class="wrap">
    <div class="hero-facts">
      <div class="hero-fact"><b><span data-count="4">4</span></b><span>Rubros resueltos desde un mismo número: perforación, desagüe, sépticos y filtros</span></div>
      <div class="hero-fact"><b><span data-count="<?= count($ZONAS) ?>"><?= count($ZONAS) ?></span></b><span>Ciudades de Asunción y Central con cobertura habitual</span></div>
      <div class="hero-fact"><b>Gs. 0</b><span>Lo que cuesta el presupuesto y la visita para verlo</span></div>
    </div>
  </div>
</section>

<!-- ══ FRANJA DE CONFIANZA — banda oscura a sangre ══ -->
<section class="confianza band-dark bleed">
  <div class="wrap">
    <div class="confianza-in">
      <div class="conf-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
        <div><b>Presupuesto sin costo</b><span>Y sin visita obligatoria para cotizar</span></div>
      </div>
      <div class="conf-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M9 15h6"/></svg>
        <div><b>Factura legal a pedido</b><span>Avisanos al cotizar y lo coordinamos</span></div>
      </div>
      <div class="conf-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4.5 8-10V5l-8-3-8 3v7c0 5.5 8 10 8 10Z"/></svg>
        <div><b>Precio cerrado antes de empezar</b><span>Nada de sorpresas cuando termina el trabajo</span></div>
      </div>
      <div class="conf-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <div><b>Respuesta el mismo día</b><span>Urgencias de desagüe también sábado y domingo</span></div>
      </div>
    </div>
  </div>
</section>

<!-- ══ SERVICIOS — bento ══ -->
<section>
  <div class="wrap">
    <header class="sec-head rv">
      <span class="eyebrow">Qué hacemos</span>
      <h2>Servicios Profesionales de Pozos de Agua y Evacuación de Efluentes</h2>
      <p class="lead">Dos problemas distintos que casi siempre aparecen en la misma casa:
        de dónde sacás el agua y a dónde va el efluente. Resolvemos los dos lados.</p>
    </header>

    <div class="bento">

      <a class="card cell-3 rv" href="/pozos-artesianos">
        <span class="card-ico" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v12"/><path d="M8 14h8l-1.5 6.4a1 1 0 0 1-1 .6h-3a1 1 0 0 1-1-.6Z"/><path d="M5 7h4"/><path d="M15 10h4"/></svg>
        </span>
        <h3>Perforación de Pozos Artesianos y Semisurgentes</h3>
        <p>Pozo de agua propio para casa, quinta, finca o industria. Perforación por metro,
          entubado con caño camisa, filtro con prefiltro de grava, bomba sumergible y tablero.
          Antes de perforar definimos la profundidad probable de la napa en tu zona.</p>
        <span class="card-price">Se cobra por metro perforado — el suelo rocoso cambia el precio: <b>ver el cotizador</b></span>
        <span class="card-link">Ver perforación de pozos
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>

      <a class="card cell-3 rv" href="/desague-pozo-ciego">
        <span class="card-ico" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 17h13a3 3 0 0 0 3-3V9H8a5 5 0 0 0-5 5Z"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/><path d="M19 12h2v5"/></svg>
        </span>
        <h3>Desagüe y Limpieza de Pozos Ciegos</h3>
        <p>Camión atmosférico para vaciado de pozo ciego, pozo cloacal y cámara séptica.
          Incluye succión del fondo, no solo del líquido de arriba: si queda el lodo,
          el pozo se te vuelve a llenar en semanas.</p>
        <span class="card-price">Se cobra por viaje de camión — capacidad habitual <b><?= (int)$RATES['desague_m3'] ?> m³</b></span>
        <span class="card-link">Ver servicio de desagüe
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>

      <a class="card cell-3 rv" href="/pozos-septicos">
        <span class="card-ico" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="7" width="18" height="11" rx="2"/><path d="M3 12h18"/><path d="M8 7V5h8v2"/></svg>
        </span>
        <h3>Instalación de Cámaras Sépticas y Biodigestores</h3>
        <p>Cámara séptica de hormigón, de plástico o biodigestor, con su pozo absorbente
          dimensionado según la cantidad de personas de la casa. Es la instalación que
          evita que termines llamando al desagotador cada dos meses.</p>
        <span class="card-price">Medidas y planos según cantidad de habitantes: <b>lo calculamos con vos</b></span>
        <span class="card-link">Ver pozos sépticos
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>

      <a class="card cell-3 rv" href="/tratamiento-agua">
        <span class="card-ico" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3Z"/><path d="M9 13.5h6"/></svg>
        </span>
        <h3>Filtros y Tratamiento de Agua para Consumo</h3>
        <p>Si el agua sale amarilla, mancha la ropa o deja sarro en la ducha, es hierro o dureza.
          Instalamos filtros de sedimentos, ablandadores, quita-hierro y sistemas de cloración,
          elegidos después del análisis del agua, no antes.</p>
        <span class="card-price">El filtro correcto sale del análisis: <b>primero medimos, después vendemos</b></span>
        <span class="card-link">Ver tratamiento de agua
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>

    </div>
  </div>
</section>

<!-- ══ BANDA DE ACENTO A SANGRE ══ -->
<section class="banda-cta bleed">
  <div class="wrap banda-in">
    <div>
      <h2>¿El pozo ciego rebalsa hoy? Eso no espera al lunes.</h2>
      <p>Mandanos la ciudad, el barrio y una foto del pozo. Con eso te decimos
        precio y en cuánto puede estar el camión, sin que tengas que llamar a cinco números.</p>
    </div>
    <div class="banda-acts">
      <a class="btn btn-wa btn-lg" href="<?= e(wa('Hola, tengo el pozo ciego rebalsando y necesito el camión hoy.')) ?>" target="_blank" rel="noopener">Escribinos ahora</a>
      <a class="btn btn-ghost btn-lg" href="tel:<?= e(TEL_LINK) ?>">Llamanos</a>
    </div>
  </div>
</section>

<!-- ══ CALCULADORA — split 55/45 ══ -->
<section id="precio">
  <div class="wrap split">
    <div class="rv">
      <span class="eyebrow">Cotizador</span>
      <h2>¿Cuánto Cuesta Hacer un Pozo Artesiano en Paraguay?</h2>
      <p class="lead" style="margin-top:18px">
        La respuesta honesta es «depende», pero depende de cosas concretas y calculables.
        Movés la profundidad, elegís el suelo y marcás qué querés incluir: el cotizador
        te arma el rango en guaraníes y te lo manda por WhatsApp para que lo tengamos los dos.
      </p>
      <ul class="checks" style="margin-top:26px">
        <li><b>La profundidad</b> manda sobre todo lo demás: se cobra por metro lineal perforado.</li>
        <li><b>El suelo</b> cambia el ritmo del equipo. La roca puede más que duplicar el costo por metro.</li>
        <li><b>El entubado</b> también va por metro: el caño camisa acompaña toda la perforación.</li>
        <li><b>Bomba, filtro y tablero</b> son ítems aparte y se pueden dejar para una segunda etapa.</li>
      </ul>
      <p style="margin-top:26px">
        <a class="btn btn-ghost" href="/pozos-artesianos/precio-metro">Ver el desglose del precio por metro</a>
      </p>
    </div>
    <div class="rv">
      <?php include __DIR__ . '/includes/calculator.php'; ?>
    </div>
  </div>
</section>

<!-- ══ CÓMO TRABAJAMOS — stepper sobre banda oscura ══ -->
<section class="band-dark bleed">
  <div class="wrap">
    <header class="sec-head rv">
      <span class="eyebrow">Cómo trabajamos</span>
      <h2>De tu mensaje al trabajo hecho, en cuatro pasos</h2>
    </header>
    <div class="stepper">
      <div class="step rv">
        <h3>Nos escribís</h3>
        <p>Por WhatsApp o por el formulario. Con la ciudad, el barrio y qué necesitás alcanza para arrancar.</p>
      </div>
      <div class="step rv">
        <h3>Te cotizamos</h3>
        <p>Rango de precio el mismo día. Si el trabajo lo necesita, vamos a ver el terreno o el pozo sin cargo.</p>
      </div>
      <div class="step rv">
        <h3>Coordinamos la fecha</h3>
        <p>Te confirmamos día, horario y precio cerrado antes de mover un equipo. Los desagües de urgencia se coordinan en el día.</p>
      </div>
      <div class="step rv">
        <h3>Hacemos el trabajo</h3>
        <p>Perforación, desagüe o instalación, con el sitio limpio al terminar y factura legal si la pediste al cotizar.</p>
      </div>
    </div>
  </div>
</section>

<!-- ══ COBERTURA — 2/3 + 1/3 ══ -->
<section>
  <div class="wrap two-thirds">
    <div class="rv">
      <span class="eyebrow">Dónde llegamos</span>
      <h2>Cobertura de Servicios en Asunción y Gran Asunción</h2>
      <p class="lead" style="margin-top:18px">
        Trabajamos todos los días en Asunción y en el cinturón de Central, que es donde
        se concentra la demanda de pozos: barrios sin red cloacal, loteos nuevos sin agua
        corriente y casas viejas con pozos ciegos que ya no absorben.
      </p>
      <ul class="zonas-list" style="margin-top:26px">
        <?php foreach ($ZONAS as $z): ?><li><?= e($z) ?></li><?php endforeach; ?>
      </ul>
      <p class="small muted" style="margin-top:22px">
        En Asunción atendemos también <?= e(implode(', ', array_slice($BARRIOS_ASU, 0, 5))) ?> y el resto de los barrios.
        Fuera de Gran Asunción cotizamos el traslado del equipo aparte — escribinos con la localidad y te decimos.
      </p>
      <p style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px">
        <a class="btn btn-ghost" href="/desague-san-lorenzo">Desagüe en San Lorenzo</a>
        <a class="btn btn-ghost" href="/desague-mariano-roque-alonso">Desagüe en M. R. Alonso</a>
      </p>
    </div>
    <div class="rv">
      <div class="panel" style="aspect-ratio:3/4">
        <div class="motivo-napas" aria-hidden="true"></div>
        <span class="panel-tag">Panel ilustrativo · capas de napa</span>
      </div>
      <p class="small muted" style="margin-top:16px">
        La profundidad de la napa cambia bastante entre Asunción y el este de Central.
        Por eso el precio de un pozo en Capiatá no es el mismo que en Sajonia.
      </p>
    </div>
  </div>
</section>

<!-- ══ FAQ ══ -->
<section class="band-surface bleed">
  <div class="wrap-narrow">
    <header class="sec-head rv">
      <span class="eyebrow">Dudas frecuentes</span>
      <h2>Preguntas Frecuentes sobre Pozos y Sistemas Sépticos</h2>
    </header>
    <div class="faq">
      <?php foreach ($FAQ as $f): ?>
        <details>
          <summary><?= e($f['q']) ?></summary>
          <div class="faq-a"><p><?= e($f['a']) ?></p></div>
        </details>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ══ CONTACTO — split ══ -->
<section id="contacto">
  <div class="wrap split split-rev">
    <div class="split-media rv">
      <div class="wa-block">
        <h3>Lo más rápido es WhatsApp</h3>
        <p>Mandanos la ciudad, el barrio y qué necesitás. Si podés, sumá una foto:
          con eso cotizamos mucho más fino y evitamos una visita.</p>
        <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Escribinos por WhatsApp</a>
        <a class="wa-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        <p class="small" style="margin:18px 0 0"><?= e(HOURS_TEXT) ?></p>
      </div>
    </div>
    <div class="rv">
      <span class="eyebrow">Contacto</span>
      <h2 style="margin-bottom:26px">Pedí tu presupuesto</h2>
      <?php
      $FORM_SERVICIO = 'Inicio';
      include __DIR__ . '/includes/lead-form.php';
      ?>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
