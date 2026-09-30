<?php
require_once __DIR__ . "/includes/config.php";
$page = 'pozos-artesianos';
$SERVICE = 'Perforación de pozos artesianos';
$FAQ = [
  ['q' => '¿Cuánto demora perforar un pozo artesiano?',
   'a' => 'Un pozo domiciliario común en suelo de tierra o arena se perfora en uno a tres días de trabajo. Si aparece roca, el mismo pozo puede llevar el doble. A eso hay que sumarle el entubado, el desarrollo del pozo y la instalación de la bomba, que suelen ser una jornada más.'],
  ['q' => '¿Necesito permiso para hacer un pozo artesiano en Paraguay?',
   'a' => 'Los pozos para uso doméstico suelen tratarse distinto que los pozos para uso industrial o comercial, que sí requieren registro del aprovechamiento del recurso hídrico ante la autoridad ambiental. Si el pozo es para una industria, un loteo o una explotación agropecuaria, avisanos al cotizar para prever la gestión.'],
  ['q' => '¿Qué pasa si perforan y no encuentran agua?',
   'a' => 'Es una pregunta justa y hay que hablarla antes, no después. Definí con el perforador por escrito qué pasa si el pozo no da caudal útil: hasta qué profundidad se sigue, si se cobra el metro perforado igual y si hay reintento en otro punto del terreno. Pedilo siempre por escrito en el presupuesto.'],
  ['q' => '¿A qué profundidad está el agua en Gran Asunción?',
   'a' => 'Varía mucho de una zona a otra. La mayoría de los pozos domiciliarios de Asunción y Central queda entre ' . (int)$RATES['prof_min'] . ' y ' . (int)$RATES['prof_max'] . ' metros, pero la napa aprovechable puede estar bastante más arriba o más abajo según el barrio. La referencia real la dan los pozos vecinos y el ensayo en el propio terreno.'],
];
include __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="hero-media" style="min-height:min(52vh,420px)">
    <div class="motivo-suelo" aria-hidden="true"></div>
    <div class="wrap">
      <div class="hero-in" style="padding-top:48px;padding-bottom:32px">
        <span class="eyebrow" style="color:#E9855A">Pozos de agua</span>
        <h1>Perforación de Pozos Artesianos en Paraguay</h1>
        <p class="lead">
          Pozo de agua propio para tu casa, tu quinta o tu industria: perforación por metro,
          entubado, filtro, bomba sumergible y tablero. Te decimos el rango de precio hoy mismo.
        </p>
        <div class="hero-acts">
          <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Pedí tu presupuesto</a>
          <a class="hero-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Construcción de pozos profundos — split -->
<section>
  <div class="wrap split">
    <div class="rv prose">
      <span class="eyebrow">El servicio</span>
      <h2>Construcción de Pozos Profundos para Casas, Fincas e Industrias</h2>
      <p class="lead" style="margin-top:18px">
        Un pozo artesiano bien hecho es infraestructura: te saca de la dependencia de la red,
        te asegura presión propia y, en el interior, muchas veces es la única fuente de agua real.
        Mal hecho, es un caño enterrado que se arena en dos veranos.
      </p>
      <p>
        Trabajamos los tres tamaños de obra que tienen lógicas distintas. El pozo domiciliario,
        que busca caudal para una familia y un tanque elevado. El pozo de quinta o finca, que además
        tiene que sostener riego y animales. Y el pozo industrial o de loteo, que necesita caudal
        sostenido durante horas, entubado de mayor diámetro y bomba dimensionada en serio.
      </p>

      <h3>Pozos Artesianos vs. Pozos Semisurgentes</h3>
      <p>
        En Paraguay «pozo artesiano» se usa como sinónimo de pozo perforado profundo, pero
        técnicamente hay una diferencia que conviene entender antes de firmar un presupuesto.
      </p>
      <ul class="checks">
        <li><b>Pozo artesiano (surgente):</b> la napa está confinada y bajo presión, así que el agua sube sola por el caño sin necesidad de bomba. Es la excepción, no la regla.</li>
        <li><b>Pozo semisurgente:</b> el agua sube por presión hasta cierto nivel pero no llega a la superficie. Necesita bomba sumergible. Es lo que se perfora en la enorme mayoría de los casos en Gran Asunción.</li>
        <li><b>Pozo somero o «pozo artesanal»:</b> excavado a mano, pocos metros, sobre la primera napa. Barato y rápido, pero es el más expuesto a contaminarse con pozos ciegos cercanos. Para agua de consumo no lo recomendamos.</li>
      </ul>
      <p>
        Cuando alguien te ofrece «pozo artesiano» por un precio muy bajo, casi siempre está
        cotizando un pozo somero. Preguntá siempre la profundidad y el diámetro del entubado:
        ahí se ve la diferencia.
      </p>

      <h3>Proceso de Perforación y Entubado de Calidad</h3>
      <p>
        El entubado es lo que separa un pozo que dura décadas de uno que se te derrumba.
        El caño camisa sostiene la perforación, el tramo filtrante deja entrar el agua de la napa
        elegida y el prefiltro de grava frena la arena antes de que llegue a la bomba.
      </p>
      <ul class="checks">
        <li><b>Reconocimiento previo:</b> qué profundidad dieron los pozos vecinos y qué tipo de suelo se espera.</li>
        <li><b>Perforación:</b> por metro lineal, con el equipo acorde al suelo — rotación para tierra y arena, percusión o roto-percusión cuando aparece roca.</li>
        <li><b>Entubado y filtro:</b> caño camisa en toda la columna, tramo ranurado a la altura de la napa productiva y prefiltro de grava seleccionada.</li>
        <li><b>Desarrollo y limpieza:</b> se bombea hasta que el agua sale limpia y estabiliza. Un pozo sin desarrollar te arruina la bomba.</li>
        <li><b>Ensayo de caudal:</b> cuántos litros por hora sostiene de verdad. Es el dato que define qué bomba comprás.</li>
        <li><b>Sellado sanitario:</b> la boca del pozo cerrada y elevada, para que no le entre agua de lluvia ni efluente de superficie.</li>
      </ul>
    </div>

    <div class="split-media rv">
      <div class="panel" style="aspect-ratio:3/4">
        <div class="motivo-napas" aria-hidden="true"></div>
        <span class="panel-tag">Panel ilustrativo · perfil de perforación</span>
      </div>
      <div class="card" style="margin-top:-38px;margin-left:20px;position:relative;z-index:3">
        <h3 style="font-size:19px">Pedí que el presupuesto diga esto</h3>
        <p style="margin-top:10px">
          Profundidad prevista, precio por metro, diámetro y material del entubado,
          qué pasa si aparece roca, si el ensayo de caudal está incluido y qué se hace
          si el pozo no da agua útil. Si falta alguno de esos seis puntos, todavía no es un presupuesto.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Factores de precio — bento sobre banda oscura -->
<section class="band-dark bleed">
  <div class="wrap">
    <header class="sec-head rv">
      <span class="eyebrow">Precio</span>
      <h2>Factores que Determinan el Precio de Perforación</h2>
      <p class="lead">Cinco variables explican casi toda la diferencia entre dos presupuestos
        de pozo artesiano que parecen iguales.</p>
    </header>
    <div class="bento">
      <div class="card cell-2 rv"><h3>Profundidad</h3><p>Se cobra por metro lineal. Es la variable dominante y la que menos se puede saber de antemano: la confirma la napa real de tu terreno.</p></div>
      <div class="card cell-2 rv"><h3>Tipo de suelo</h3><p>Tierra y arena avanzan rápido. La roca obliga a cambiar de método y puede más que duplicar el costo del metro perforado.</p></div>
      <div class="card cell-2 rv"><h3>Diámetro y entubado</h3><p>Más diámetro es más caudal posible, más caño y más grava. Un pozo industrial no se entuba como uno domiciliario.</p></div>
      <div class="card cell-3 rv"><h3>Equipamiento</h3><p>Bomba sumergible, tablero con protecciones, caño de impulsión y cable. Se pueden dejar para una segunda etapa, pero conviene dimensionarlos con el ensayo de caudal en la mano, no antes.</p></div>
      <div class="card cell-3 rv"><h3>Acceso y traslado</h3><p>El equipo de perforación necesita entrar y trabajar. Terrenos angostos, con desnivel o sin acceso para camión encarecen la obra. Fuera de Gran Asunción se cotiza el traslado aparte.</p></div>
    </div>
    <p style="margin-top:34px">
      <a class="btn btn-accent btn-lg" href="/pozos-artesianos/precio-metro">Ver precio por metro y cotizador</a>
    </p>
  </div>
</section>

<!-- Banda CTA -->
<section class="banda-cta bleed">
  <div class="wrap banda-in">
    <div>
      <h2>Contanos dónde queda el terreno y para qué necesitás el agua</h2>
      <p>Con la ciudad, el uso previsto y el tamaño del terreno ya te podemos dar
        un rango serio de profundidad y de precio.</p>
    </div>
    <div class="banda-acts">
      <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Consultá sin compromiso</a>
    </div>
  </div>
</section>

<!-- Zonas — 2/3 + 1/3 -->
<section>
  <div class="wrap two-thirds">
    <div class="rv">
      <span class="eyebrow">Cobertura</span>
      <h2>Zonas de Cobertura para Perforación de Pozos de Agua</h2>
      <p class="lead" style="margin-top:18px">
        Perforamos en Asunción y en todo el cinturón de Central. En el interior también,
        con el traslado del equipo cotizado aparte según la distancia.
      </p>
      <ul class="zonas-list" style="margin-top:24px">
        <?php foreach ($ZONAS as $z): ?><li><?= e($z) ?></li><?php endforeach; ?>
      </ul>
      <p style="margin-top:26px">
        Los loteos nuevos de Luque, Capiatá y Limpio son los que más pozos piden:
        se vende el terreno antes de que llegue la red de agua, y el pozo propio
        termina siendo la solución definitiva más que la provisoria.
      </p>
    </div>
    <div class="rv">
      <div class="card">
        <h3>Seguí leyendo</h3>
        <ul class="checks" style="margin-top:14px">
          <li><a href="/pozos-artesianos/precio-metro">Precio por metro de perforación</a></li>
          <li><a href="/tratamiento-agua">Filtros para el agua del pozo</a></li>
          <li><a href="/pozos-septicos">Cámaras sépticas y pozo absorbente</a></li>
          <li><a href="/">Todos los servicios</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="band-surface bleed">
  <div class="wrap-narrow">
    <header class="sec-head rv">
      <span class="eyebrow">Dudas frecuentes</span>
      <h2>Preguntas sobre perforación de pozos</h2>
    </header>
    <div class="faq">
      <?php foreach ($FAQ as $f): ?>
        <details><summary><?= e($f['q']) ?></summary><div class="faq-a"><p><?= e($f['a']) ?></p></div></details>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Contacto -->
<section id="contacto">
  <div class="wrap split split-rev">
    <div class="split-media rv">
      <div class="wa-block">
        <h3>Presupuesto de perforación</h3>
        <p>Mandanos la ciudad, para qué vas a usar el agua y si sabés a qué profundidad
          están los pozos de tus vecinos. Con eso arrancamos.</p>
        <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Escribinos por WhatsApp</a>
        <a class="wa-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
      </div>
    </div>
    <div class="rv">
      <span class="eyebrow">Contacto</span>
      <h2 style="margin-bottom:26px">Pedí tu presupuesto de pozo artesiano</h2>
      <?php
      $FORM_SERVICIO = 'Perforación de pozo artesiano';
      $FORM_TITLE = 'Presupuesto de perforación';
      $FORM_TEXT  = 'Tres datos y te pasamos el rango. Presupuestar no cuesta nada.';
      include __DIR__ . '/includes/lead-form.php';
      ?>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
