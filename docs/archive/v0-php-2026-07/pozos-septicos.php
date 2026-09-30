<?php
require_once __DIR__ . "/includes/config.php";
$page = 'pozos-septicos';
$SERVICE = 'Instalación de pozos sépticos y cámaras sépticas';
$FAQ = [
  ['q' => '¿Cuál es la diferencia entre cámara séptica y pozo ciego?',
   'a' => 'La cámara séptica es un tanque cerrado y estanco donde el efluente queda retenido: los sólidos decantan al fondo, las grasas flotan arriba y sale por el medio un líquido ya clarificado. El pozo ciego, o pozo absorbente, es el que recibe ese líquido y lo infiltra en el suelo. Van uno detrás del otro: cámara primero, pozo después. Cuando falta la cámara, todos los sólidos entran directo al pozo y lo tapan.'],
  ['q' => '¿Qué tamaño de cámara séptica necesito?',
   'a' => 'Se dimensiona por cantidad de personas que viven en la casa y por el tiempo que el efluente tiene que quedar retenido para decantar. El criterio habitual toma alrededor de 150 a 200 litros por persona por día y una retención de aproximadamente un día, con un volumen mínimo que no baja de unos 1.000 litros aunque la casa sea chica. Pasanos cuántos viven en la casa y te decimos qué corresponde.'],
  ['q' => '¿Cada cuánto se limpia una cámara séptica?',
   'a' => 'Bastante menos seguido que un pozo ciego sin cámara: la referencia habitual es revisarla cada uno o dos años y desagotarla cuando la capa de lodo del fondo ocupa una parte importante del volumen útil. Lo que no conviene es esperar a que el efluente empiece a arrastrar sólidos al pozo absorbente, porque ahí el daño ya lo estás pagando en el pozo.'],
  ['q' => '¿El biodigestor reemplaza al pozo absorbente?',
   'a' => 'No del todo. El biodigestor mejora mucho la calidad del efluente y facilita la extracción del lodo, pero el líquido tratado igual necesita un destino: un pozo absorbente o un campo de infiltración. Lo que sí hace es alargar bastante la vida de ese pozo, porque le llega mucha menos carga.'],
];
include __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="hero-media" style="min-height:min(50vh,400px)">
    <div class="motivo-suelo" aria-hidden="true"></div>
    <div class="wrap">
      <div class="hero-in" style="padding-top:48px;padding-bottom:32px">
        <span class="eyebrow" style="color:#E9855A">Sistemas sépticos</span>
        <h1>Instalación de Pozos Sépticos y Cámaras en Paraguay</h1>
        <p class="lead">
          Cámara séptica, biodigestor y pozo absorbente dimensionados para tu casa.
          Es la instalación que hace que dejes de llamar al camión cada dos meses.
        </p>
        <div class="hero-acts">
          <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Pedí tu presupuesto</a>
          <a class="hero-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Sistemas integrales — bento -->
<section>
  <div class="wrap">
    <header class="sec-head rv">
      <span class="eyebrow">El sistema</span>
      <h2>Sistemas Sépticos Integrales y Ecológicos para Viviendas</h2>
      <p class="lead">
        Un sistema séptico son dos piezas trabajando juntas: algo que retiene y separa,
        y algo que infiltra. Casi todos los pozos que colapsan en Gran Asunción son pozos
        a los que les falta la primera pieza.
      </p>
    </header>

    <div class="bento">
      <div class="card cell-3 rv">
        <span class="card-ico" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="6" width="16" height="13" rx="3"/><path d="M4 12h16"/><path d="M9 6V4h6v2"/></svg>
        </span>
        <h3>Pozos Sépticos de Plástico y Fibras de Vidrio</h3>
        <p>
          Tanques prefabricados de polietileno o fibra de vidrio, con la cámara ya
          compartimentada de fábrica. Se instalan en una jornada, no tienen juntas por
          donde filtrar y no se corroen como el hormigón cuando el efluente es agresivo.
        </p>
        <p style="margin-top:12px">
          Son la opción lógica cuando el terreno no da para obra húmeda, cuando hay apuro
          de entrega o cuando la napa está alta y una excavación grande se complica.
          Requieren base bien nivelada y, en suelo con napa alta, anclaje para que no floten.
        </p>
      </div>

      <div class="card cell-3 rv">
        <span class="card-ico" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 4v16"/><path d="M4 12h16"/></svg>
        </span>
        <h3>Cámaras Sépticas con Pozo Absorbente</h3>
        <p>
          La configuración clásica y la que mejor relación costo-durabilidad tiene:
          cámara séptica de hormigón o prefabricada, seguida de pozo absorbente con
          anillos, dimensionado según cuánto infiltra realmente tu suelo.
        </p>
        <p style="margin-top:12px">
          Acá lo que define la vida útil no es el material, es el dimensionamiento y la
          ubicación: suficientemente lejos del pozo de agua, pendiente abajo, con tapa
          registrable y accesible para el camión el día que haya que mantenerlo.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Medidas — split -->
<section class="band-dark bleed">
  <div class="wrap split">
    <div class="rv prose">
      <span class="eyebrow">Dimensionamiento</span>
      <h2>Medidas y Planos para la Construcción de un Pozo Séptico</h2>
      <p class="lead" style="margin-top:18px;color:#BDB7AE">
        No hay una medida única: la cámara se calcula por cuánta gente vive en la casa
        y por cuánto tiempo el efluente tiene que quedar adentro para que decante.
      </p>
      <ul class="checks">
        <li><b>Caudal por persona.</b> El criterio habitual toma del orden de 150 a 200 litros por persona por día.</li>
        <li><b>Tiempo de retención.</b> Aproximadamente un día: es lo que necesitan los sólidos para separarse del líquido.</li>
        <li><b>Volumen mínimo.</b> Aunque la casa sea chica, se trabaja con un piso del orden de 1.000 litros útiles.</li>
        <li><b>Compartimentos.</b> Dos cámaras en serie decantan mucho mejor que una sola del mismo volumen.</li>
        <li><b>Entrada y salida.</b> Con codos o pantallas que obliguen al líquido a pasar por el medio, no por arriba ni por el fondo.</li>
        <li><b>Tapa registrable.</b> Si para limpiarla hay que romper el piso, en cinco años nadie la limpia.</li>
        <li><b>Pozo absorbente.</b> Se dimensiona por la capacidad de infiltración del suelo, que no es la misma en Sajonia que en Capiatá.</li>
      </ul>
      <p style="color:#A8A29A">
        Las exigencias específicas de medidas, distancias y aprobación las fija cada
        municipalidad y, según el caso, la autoridad sanitaria. Consultalas antes de excavar:
        rehacer un sistema mal ubicado cuesta mucho más que consultarlo a tiempo.
      </p>
    </div>
    <div class="split-media rv">
      <div class="panel" style="aspect-ratio:1/1;border-color:var(--border-dark)">
        <div class="motivo-napas" aria-hidden="true"></div>
        <span class="panel-tag">Panel ilustrativo · cámara y pozo absorbente</span>
      </div>
      <div class="card" style="margin-top:-40px;margin-left:20px;position:relative;z-index:3">
        <h3 style="font-size:19px">Contanos esto y te damos la medida</h3>
        <ul class="checks" style="margin-top:12px">
          <li>Cuántas personas viven en la casa</li>
          <li>Cuántos baños tiene</li>
          <li>Si la cocina y el lavadero van al mismo sistema</li>
          <li>Si hay red cloacal en la calle o no</li>
        </ul>
        <a class="btn btn-wa" style="width:100%;margin-top:16px" href="<?= e(wa('Hola, quiero saber qué medida de cámara séptica necesito.')) ?>" target="_blank" rel="noopener">Mandanos los datos</a>
      </div>
    </div>
  </div>
</section>

<!-- Banda -->
<section class="banda-cta bleed">
  <div class="wrap banda-in">
    <div>
      <h2>Instalarla una vez cuesta menos que desagotar todo el año</h2>
      <p>Si venís llamando al camión seguido, hacé la cuenta de lo que gastaste
        en los últimos doce meses. Casi siempre da a favor de poner la cámara.</p>
    </div>
    <div class="banda-acts">
      <a class="btn btn-wa btn-lg" href="<?= e(wa('Hola, quiero presupuesto para instalar una cámara séptica.')) ?>" target="_blank" rel="noopener">Pedí tu presupuesto</a>
    </div>
  </div>
</section>

<!-- Mantenimiento — stepper -->
<section>
  <div class="wrap">
    <header class="sec-head rv">
      <span class="eyebrow">Mantenimiento</span>
      <h2>Mantenimiento Preventivo y Tratamiento para Tanques Sépticos</h2>
      <p class="lead">Una cámara séptica mantenida trabaja décadas. Una abandonada arruina el pozo absorbente que tiene atrás.</p>
    </header>
    <div class="stepper">
      <div class="step rv">
        <h3>Revisión cada uno o dos años</h3>
        <p>Se abre la tapa y se mide el espesor del lodo del fondo y de la costra de grasa de arriba. Cinco minutos.</p>
      </div>
      <div class="step rv">
        <h3>Desagote cuando corresponde</h3>
        <p>Cuando el lodo ocupa buena parte del volumen útil. Antes es tirar plata; después ya le estás mandando sólidos al pozo absorbente.</p>
      </div>
      <div class="step rv">
        <h3>Bioactivadores como rutina</h3>
        <p>Bacterias y enzimas que degradan grasa y materia orgánica. Espacian mucho los desagotes, pero no reemplazan la limpieza.</p>
      </div>
      <div class="step rv">
        <h3>Cuidá qué entra</h3>
        <p>Nada de aceite de cocina, toallitas, pañales ni cloro en exceso: el cloro fuerte mata las bacterias que hacen el trabajo.</p>
      </div>
    </div>
    <p style="margin-top:34px;display:flex;flex-wrap:wrap;gap:12px">
      <a class="btn btn-ghost" href="/desague-pozo-ciego">Ver servicio de desagüe</a>
      <a class="btn btn-ghost" href="/pozo-ciego-lleno">Mi pozo no absorbe</a>
      <a class="btn btn-ghost" href="/tratamiento-agua">Tratamiento de agua de pozo</a>
    </p>
  </div>
</section>

<!-- FAQ -->
<section class="band-surface bleed">
  <div class="wrap-narrow">
    <header class="sec-head rv">
      <span class="eyebrow">Dudas frecuentes</span>
      <h2>Preguntas sobre pozos y cámaras sépticas</h2>
    </header>
    <div class="faq">
      <?php foreach ($FAQ as $f): ?>
        <details><summary><?= e($f['q']) ?></summary><div class="faq-a"><p><?= e($f['a']) ?></p></div></details>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section id="contacto">
  <div class="wrap split split-rev">
    <div class="split-media rv">
      <div class="wa-block">
        <h3>Presupuesto de sistema séptico</h3>
        <p>Decinos cuántas personas viven en la casa y si ya tenés pozo. Con eso dimensionamos.</p>
        <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Escribinos por WhatsApp</a>
        <a class="wa-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
      </div>
    </div>
    <div class="rv">
      <span class="eyebrow">Contacto</span>
      <h2 style="margin-bottom:26px">Pedí tu presupuesto de cámara séptica</h2>
      <?php
      $FORM_SERVICIO = 'Pozo / cámara séptica';
      $FORM_TITLE = 'Presupuesto de sistema séptico';
      $FORM_TEXT  = 'Tres datos y te pasamos la medida que corresponde y el rango de precio.';
      include __DIR__ . '/includes/lead-form.php';
      ?>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
