<?php
require_once __DIR__ . "/includes/config.php";
$page = 'pozo-ciego-lleno';
$SERVICE = 'Recuperación de absorción de pozo ciego';
$FAQ = [
  ['q' => 'Desagoté hace un mes y ya está lleno otra vez. ¿Por qué?',
   'a' => 'Porque el pozo perdió capacidad de absorción, no de volumen. Un vaciado que se lleva solo el líquido de superficie deja intacto el lodo del fondo y la película de grasa de las paredes, que son las dos cosas que impiden que el efluente se infiltre. Se vuelve a llenar en semanas porque, en la práctica, nunca se vació de verdad.'],
  ['q' => '¿Sirven los productos que venden para destapar pozos?',
   'a' => 'Las bioenzimas ayudan a degradar grasa y materia orgánica, y como mantenimiento periódico son útiles. Lo que no hacen es sacar el lodo compactado del fondo ni romper una costra ya formada. Usarlos en un pozo colapsado es plata perdida: primero la limpieza mecánica, después las enzimas para que dure.'],
  ['q' => '¿Puede ser que el problema sea la lluvia?',
   'a' => 'Sí, y es muy común en zonas bajas de Central. Cuando el nivel freático sube después de varios días de lluvia, el suelo alrededor del pozo ya está saturado y no tiene a dónde recibir más agua. Si tu pozo funciona bien en seca y colapsa en época de lluvias, el problema es la napa, no el pozo.'],
  ['q' => '¿Cuándo ya no vale la pena arreglarlo y conviene hacer uno nuevo?',
   'a' => 'Cuando el pozo se recupera cada vez por menos tiempo después de cada limpieza, cuando las paredes están derrumbadas o cuando está mal ubicado, por ejemplo demasiado cerca del pozo de agua. En esos casos lo sensato es una cámara séptica con pozo absorbente nuevo y bien dimensionado.'],
];
include __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="hero-media" style="min-height:min(50vh,400px)">
    <div class="motivo-suelo" aria-hidden="true"></div>
    <div class="wrap">
      <div class="hero-in" style="padding-top:48px;padding-bottom:32px">
        <span class="eyebrow" style="color:#E9855A">Diagnóstico</span>
        <h1>Pozo Ciego Lleno o No Absorbe: Causas y Soluciones Rápidas</h1>
        <p class="lead">
          Si se te llena a las pocas semanas de cada desagote, no es un problema de tamaño.
          Es que el pozo dejó de absorber — y eso tiene arreglo.
        </p>
        <div class="hero-acts">
          <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Contanos tu caso</a>
          <a class="hero-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Causas — 2/3 + 1/3 -->
<section>
  <div class="wrap two-thirds">
    <div class="rv prose">
      <span class="eyebrow">Causas</span>
      <h2>¿Por Qué se Llena Rápido el Pozo Ciego?</h2>
      <p class="lead" style="margin-top:18px">
        Un pozo ciego no es un tanque: es un filtro. Funciona mientras el líquido pueda
        infiltrarse en el suelo que lo rodea. Cuando eso deja de pasar, el pozo se llena
        aunque tenga el mismo tamaño de siempre.
      </p>

      <h3>Impermeabilización de las paredes por grasa y lodo</h3>
      <p>
        Es la causa número uno y casi siempre empieza en la cocina. La grasa que baja por
        la pileta se enfría, se solidifica y se pega a las paredes del pozo junto con los
        sólidos finos del efluente. Con el tiempo forma una costra continua que sella la
        superficie de absorción por dentro, como si le hubieras dado una mano de impermeabilizante.
      </p>
      <p>
        El síntoma es inconfundible: el pozo se vacía bien con el camión y vuelve a estar
        lleno en semanas. Y empeora solo, porque cada ciclo agrega una capa más.
      </p>

      <h3>Problemas de Napas Altas y Lluvias</h3>
      <p>
        En buena parte de Central la napa está alta y sube todavía más en época de lluvias.
        Si el suelo alrededor del pozo ya está saturado de agua, no importa cuánto espacio
        tenga el pozo: no hay a dónde infiltrar.
      </p>
      <p>
        Se reconoce por el patrón estacional. Si tu pozo aguanta perfecto en seca y colapsa
        cada vez que llueve varios días seguidos, el problema no es la grasa. En estos casos
        la solución pasa por ampliar la superficie de infiltración, sumar cámara séptica para
        aliviar la carga o separar las aguas grises, no por seguir vaciando.
      </p>
      <p>
        Otras dos causas que aparecen seguido: el pozo <b>colmatado en el fondo</b> por años
        de sedimento, y la <b>ausencia de cámara séptica</b>, que hace que todos los sólidos
        entren directo al pozo absorbente en vez de decantar antes.
      </p>
    </div>

    <div class="rv">
      <div class="panel" style="aspect-ratio:3/4">
        <div class="motivo-napas" aria-hidden="true"></div>
        <span class="panel-tag">Panel ilustrativo · napa saturada</span>
      </div>
      <div class="card" style="margin-top:-40px;margin-right:18px;position:relative;z-index:3">
        <h3 style="font-size:19px">Autodiagnóstico rápido</h3>
        <ul class="checks" style="margin-top:12px">
          <li>Se llena en semanas → paredes selladas o fondo colmatado</li>
          <li>Solo falla cuando llueve → napa alta</li>
          <li>Huele fuerte y no baja → cañería obstruida</li>
          <li>Nunca tuvo cámara séptica → sólidos directos al pozo</li>
        </ul>
        <a class="btn btn-wa" style="width:100%;margin-top:16px" href="<?= e(wa('Hola, mi pozo ciego no absorbe. Mi caso es:')) ?>" target="_blank" rel="noopener">Contanos cuál es el tuyo</a>
      </div>
    </div>
  </div>
</section>

<!-- Banda -->
<section class="banda-cta bleed">
  <div class="wrap banda-in">
    <div>
      <h2>Antes de pagar otro viaje de camión, averiguá qué tiene tu pozo</h2>
      <p>Vaciar un pozo que no absorbe es comprar tres semanas. Contanos el síntoma
        y te decimos si necesitás limpieza de fondo, destape o una solución de fondo.</p>
    </div>
    <div class="banda-acts">
      <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Consultá sin compromiso</a>
    </div>
  </div>
</section>

<!-- Soluciones — bento -->
<section class="band-dark bleed">
  <div class="wrap">
    <header class="sec-head rv">
      <span class="eyebrow">Soluciones</span>
      <h2>Soluciones Efectivas para Recuperar la Absorción</h2>
      <p class="lead">En orden. La mecánica primero, la química después: al revés no funciona.</p>
    </header>
    <div class="bento">
      <div class="card cell-4 rv">
        <span class="card-ico" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 17h13a3 3 0 0 0 3-3V9H8a5 5 0 0 0-5 5Z"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>
        </span>
        <h3>Limpieza de fondo con camión desagotador</h3>
        <p>
          La única intervención que devuelve capacidad real. La manguera baja hasta el fondo
          y saca el lodo compactado, no solo el líquido de superficie. En el mismo viaje se
          limpian las paredes para romper la costra de grasa y se vacía la cámara séptica si existe.
        </p>
        <p style="margin-top:12px">
          Si el efluente ni siquiera está llegando al pozo, primero va el destape de la cañería
          de entrada: es un problema distinto y se resuelve más barato.
        </p>
        <span class="card-price">Por viaje de camión: <b><?= e(gs_rango($RATES['desague_viaje_min'], $RATES['desague_viaje_max'])) ?></b></span>
      </div>

      <div class="card cell-2 rv">
        <span class="card-ico" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 3h6v4l3.5 9.5A3 3 0 0 1 15.7 21H8.3a3 3 0 0 1-2.8-4.5L9 7Z"/><path d="M7 15h10"/></svg>
        </span>
        <h3>Uso de bioenzimas y reactivadores de suelo</h3>
        <p>
          Bacterias y enzimas que degradan grasa y materia orgánica. Son excelentes como
          <b>mantenimiento</b> después de una limpieza mecánica, y sirven para espaciar
          mucho los desagotes siguientes.
        </p>
        <p style="margin-top:12px">
          Lo que no hacen: destapar un pozo colapsado ni sacar el fondo. Si te los venden
          como solución a un pozo que ya no absorbe, te están vendiendo tiempo, no una reparación.
        </p>
      </div>
    </div>
    <p style="margin-top:32px">
      <a class="btn btn-accent btn-lg" href="/desague-pozo-ciego">Ver el servicio de desagüe y sus precios</a>
    </p>
  </div>
</section>

<!-- Prevención — stepper -->
<section>
  <div class="wrap">
    <header class="sec-head rv">
      <span class="eyebrow">Prevención</span>
      <h2>Cómo Prevenir el Colapso de tu Pozo Ciego</h2>
      <p class="lead">Cuatro costumbres que deciden si tu pozo se desagota cada años o cada meses.</p>
    </header>
    <div class="stepper">
      <div class="step rv">
        <h3>Frená la grasa en la cocina</h3>
        <p>Aceite usado al tacho, nunca a la pileta. Una trampa de grasa antes del pozo hace más por la vida útil que cualquier producto.</p>
      </div>
      <div class="step rv">
        <h3>Poné cámara séptica adelante</h3>
        <p>Que los sólidos decanten antes de llegar al pozo absorbente. Es la diferencia estructural entre un pozo que dura y uno que se tapa.</p>
      </div>
      <div class="step rv">
        <h3>Separá las aguas grises</h3>
        <p>Lavarropas y ducha no tienen por qué ir al mismo pozo que el baño. Menos caudal es más años de absorción.</p>
      </div>
      <div class="step rv">
        <h3>Mantenimiento antes del desborde</h3>
        <p>Un desagote programado cuesta lo mismo que uno de urgencia y no te arruina el fin de semana. Anotá la fecha del último.</p>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="band-surface bleed">
  <div class="wrap-narrow">
    <header class="sec-head rv">
      <span class="eyebrow">Dudas frecuentes</span>
      <h2>Preguntas sobre pozos que no absorben</h2>
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
      <h2 style="margin-bottom:26px">Contanos qué hace tu pozo</h2>
      <?php
      $FORM_SERVICIO = 'Pozo ciego que no absorbe';
      $FORM_TITLE = 'Diagnóstico y presupuesto';
      $FORM_TEXT  = 'Contanos el síntoma y te decimos qué necesitás. Presupuestar no cuesta nada.';
      include __DIR__ . '/includes/lead-form.php';
      ?>
    </div>
    <div class="split-media rv">
      <div class="wa-block">
        <h3>Seguí leyendo</h3>
        <p>Tres páginas que te van a servir según lo que tengas:</p>
        <ul class="checks" style="margin-top:8px">
          <li><a href="/desague-pozo-ciego" style="color:#fff">Desagüe urgente con camión</a></li>
          <li><a href="/pozos-septicos" style="color:#fff">Cámara séptica y pozo absorbente</a></li>
          <li><a href="/pozos-ciegos" style="color:#fff">Construcción y medidas de pozo ciego</a></li>
        </ul>
        <a class="btn btn-wa btn-lg" style="margin-top:20px" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Escribinos por WhatsApp</a>
        <a class="wa-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
      </div>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
