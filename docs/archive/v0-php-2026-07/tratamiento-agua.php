<?php
require_once __DIR__ . "/includes/config.php";
$page = 'tratamiento-agua';
$SERVICE = 'Filtros y tratamiento de agua de pozo';
$FAQ = [
  ['q' => '¿El agua de pozo artesiano es potable sin tratar?',
   'a' => 'No se puede dar por hecho. El agua subterránea profunda suele llegar limpia de bacterias, pero es muy común que traiga hierro, dureza o color amarillento, y en terrenos con pozos ciegos cercanos o pozos someros mal sellados puede tener carga bacteriológica. La única forma de saberlo es un análisis fisicoquímico y bacteriológico en laboratorio.'],
  ['q' => '¿Por qué el agua de mi pozo sale amarilla o mancha la ropa?',
   'a' => 'Casi siempre es hierro disuelto. Sale transparente de la canilla y se pone amarilla o rojiza al contacto con el aire, deja manchas anaranjadas en los sanitarios y arruina la ropa blanca en el lavarropas. Se corrige con un filtro específico para hierro, normalmente con oxidación previa, no con un filtro de sedimentos común.'],
  ['q' => '¿Y si el problema es el sarro?',
   'a' => 'El sarro es dureza: calcio y magnesio. Se nota en la resistencia de la ducha eléctrica, en la pava, en las canillas y en el jabón que no hace espuma. Para eso va un ablandador con resina de intercambio iónico. Un filtro de sedimentos no saca dureza, por más que lo vendan como si sí.'],
  ['q' => '¿Cada cuánto hay que analizar el agua del pozo?',
   'a' => 'Conviene una vez al año, y sí o sí en tres momentos: cuando el pozo es nuevo, cuando cambia el sabor, el olor o el color, y después de una inundación o de un desborde de pozo ciego cerca. Es un gasto chico comparado con instalar el filtro equivocado durante años.'],
];
include __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="hero-media" style="min-height:min(50vh,400px)">
    <div class="motivo-suelo" aria-hidden="true"></div>
    <div class="wrap">
      <div class="hero-in" style="padding-top:48px;padding-bottom:32px">
        <span class="eyebrow" style="color:#E9855A">Calidad del agua</span>
        <h1>Filtros y Tratamiento de Agua de Pozo para Consumo Humano</h1>
        <p class="lead">
          Si el agua sale amarilla, mancha la ropa o te deja sarro en todos lados,
          hay solución. Pero primero se mide y después se compra el filtro, nunca al revés.
        </p>
        <div class="hero-acts">
          <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Consultá por tu agua</a>
          <a class="hero-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Sistemas — split -->
<section>
  <div class="wrap split">
    <div class="rv prose">
      <span class="eyebrow">Los sistemas</span>
      <h2>Sistemas de Purificación para Agua Subterránea</h2>
      <p class="lead" style="margin-top:18px">
        No existe «el filtro» que resuelve todo. Cada problema del agua de pozo
        tiene su tecnología, y poner la equivocada es la forma más rápida de gastar
        plata sin que el agua mejore.
      </p>

      <h3>Filtros para Eliminar Sarro, Hierro y Color Amarillo</h3>
      <ul class="checks">
        <li><b>Filtro de sedimentos.</b> Retiene arena y partículas. Es el primero de la línea y protege a todo lo que viene después, incluida la bomba. No saca hierro ni dureza.</li>
        <li><b>Filtro de hierro (quita-hierro).</b> Para el agua que sale transparente y se pone amarilla o rojiza en contacto con el aire. Trabaja oxidando el hierro disuelto para poder retenerlo. Es el que resuelve las manchas naranjas en los sanitarios y en la ropa.</li>
        <li><b>Ablandador de resina.</b> Intercambio iónico para calcio y magnesio, o sea el sarro. Es lo que salva la resistencia de la ducha, la pava y las canillas, y hace que el jabón vuelva a rendir.</li>
        <li><b>Carbón activado.</b> Para olor, sabor y cloro residual. Mejora el agua para tomar, pero no reemplaza a los anteriores.</li>
      </ul>

      <h3>Purificadores y Cloración para Agua Potable</h3>
      <ul class="checks">
        <li><b>Cloración por dosificador.</b> El método clásico para desinfección continua de todo el domicilio, con dosificación proporcional al caudal. Requiere control periódico del cloro residual.</li>
        <li><b>Luz ultravioleta.</b> Desinfecta sin agregar químicos ni cambiar el sabor. Exige agua ya clarificada: si le llega turbia o con hierro, la UV no llega a hacer efecto.</li>
        <li><b>Ósmosis inversa de punto de uso.</b> Bajo la mesada, para el agua de tomar y cocinar. Es lo que se pone cuando el análisis muestra sales o parámetros que un filtro común no baja.</li>
      </ul>
      <p>
        El orden importa tanto como el equipo: sedimentos primero, después hierro,
        después ablandador, y la desinfección al final. Invertir el orden hace que
        el equipo caro trabaje sucio y dure la mitad.
      </p>
    </div>

    <div class="split-media rv">
      <div class="panel" style="aspect-ratio:3/4">
        <div class="motivo-agua" aria-hidden="true"></div>
        <span class="panel-tag" style="background:rgba(34,32,28,.72)">Panel ilustrativo · columna de tratamiento</span>
      </div>
      <div class="card" style="margin-top:-40px;margin-right:18px;position:relative;z-index:3">
        <h3 style="font-size:19px">Síntoma → causa probable</h3>
        <ul class="checks" style="margin-top:12px">
          <li>Mancha naranja en el inodoro → hierro</li>
          <li>Sarro en la ducha y la pava → dureza</li>
          <li>Sale turbia después de lluvia → sedimentos o pozo mal sellado</li>
          <li>Olor a huevo podrido → sulfuros</li>
          <li>Sabor raro sin causa visible → hacer análisis, no adivinar</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Banda -->
<section class="banda-cta bleed">
  <div class="wrap banda-in">
    <div>
      <h2>Contanos qué le pasa a tu agua antes de comprar cualquier filtro</h2>
      <p>Con el síntoma y, mejor todavía, con el análisis de laboratorio, te decimos
        qué equipo corresponde y qué no vale la pena.</p>
    </div>
    <div class="banda-acts">
      <a class="btn btn-wa btn-lg" href="<?= e(wa('Hola, el agua de mi pozo tiene este problema:')) ?>" target="_blank" rel="noopener">Consultá sin compromiso</a>
    </div>
  </div>
</section>

<!-- Potabilidad — 2/3 + 1/3 dark -->
<section class="band-dark bleed">
  <div class="wrap two-thirds">
    <div class="rv prose">
      <span class="eyebrow">Lo importante</span>
      <h2>¿El Agua de Pozo es Potable? Análisis de Agua en Paraguay</h2>
      <p class="lead" style="margin-top:18px;color:#BDB7AE">
        La respuesta honesta: no se sabe hasta que se analiza. Y a ojo no se puede,
        porque las dos cosas más peligrosas del agua de pozo son invisibles e insípidas.
      </p>
      <p style="color:#A8A29A">
        Un pozo profundo bien entubado y con sellado sanitario suele dar agua
        bacteriológicamente buena. Un pozo somero, o uno con la boca mal sellada,
        o uno que quedó cerca de un pozo ciego, puede estar recibiendo contaminación
        de superficie sin que se note ni en el color ni en el sabor. Por eso la ubicación
        relativa entre el pozo de agua y el pozo ciego es la decisión más importante de todo el terreno.
      </p>
      <p style="color:#A8A29A">Un análisis completo cubre dos frentes:</p>
      <ul class="checks">
        <li><b>Fisicoquímico:</b> hierro, dureza, pH, turbidez, conductividad, nitratos, cloruros. Es lo que define qué filtro necesitás.</li>
        <li><b>Bacteriológico:</b> coliformes totales y fecales. Es lo que define si el agua se puede tomar y si hay que desinfectar.</li>
      </ul>
      <p style="color:#A8A29A">
        Las muestras se toman en frasco estéril entregado por el laboratorio y se llevan
        el mismo día. Hacelo una vez al año, cuando el pozo es nuevo, cuando cambia el
        sabor o el color, y después de cualquier inundación o desborde cercano.
      </p>
      <p class="small" style="color:#8C857B">
        Esta página es informativa. No reemplaza el resultado de un laboratorio habilitado
        ni la indicación de un profesional sanitario sobre si el agua es apta para consumo.
      </p>
    </div>
    <div class="rv">
      <div class="card">
        <h3 style="font-size:19px">Antes de instalar cualquier equipo</h3>
        <ul class="checks" style="margin-top:12px">
          <li>Análisis fisicoquímico y bacteriológico</li>
          <li>Caudal real del pozo</li>
          <li>Presión disponible en la casa</li>
          <li>Cuántas personas consumen</li>
          <li>Si vas a tratar toda la casa o solo el punto de consumo</li>
        </ul>
        <a class="btn btn-wa" style="width:100%;margin-top:16px" href="<?= e(wa('Hola, tengo el análisis del agua de mi pozo y quiero saber qué filtro necesito.')) ?>" target="_blank" rel="noopener">Mandanos tu análisis</a>
      </div>
      <div class="card" style="margin-top:20px">
        <h3 style="font-size:19px">Seguí leyendo</h3>
        <ul class="checks" style="margin-top:12px">
          <li><a href="/pozos-artesianos">Perforación y sellado sanitario del pozo</a></li>
          <li><a href="/pozos-septicos">Cámara séptica: distancia al pozo de agua</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Guía — stepper -->
<section>
  <div class="wrap">
    <header class="sec-head rv">
      <span class="eyebrow">Guía</span>
      <h2>Guía de Selección del Filtro Adecuado para tu Pozo</h2>
      <p class="lead">Cuatro pasos, en este orden. Saltarse el primero es el error que se paga después.</p>
    </header>
    <div class="stepper">
      <div class="step rv">
        <h3>Analizá primero</h3>
        <p>Fisicoquímico y bacteriológico. Sin ese papel, cualquier recomendación de filtro es una adivinanza cara.</p>
      </div>
      <div class="step rv">
        <h3>Definí el alcance</h3>
        <p>¿Toda la casa o solo la canilla de tomar? Tratar todo el domicilio cuesta más pero también protege instalaciones y electrodomésticos.</p>
      </div>
      <div class="step rv">
        <h3>Armá la línea en orden</h3>
        <p>Sedimentos, hierro, ablandador y desinfección al final. Cada etapa protege a la siguiente.</p>
      </div>
      <div class="step rv">
        <h3>Presupuestá el mantenimiento</h3>
        <p>Cartuchos, sal del ablandador, lámpara UV, retrolavados. Un filtro sin mantenimiento deja de filtrar y no te avisa.</p>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="band-surface bleed">
  <div class="wrap-narrow">
    <header class="sec-head rv">
      <span class="eyebrow">Dudas frecuentes</span>
      <h2>Preguntas sobre el agua de pozo</h2>
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
      <h2 style="margin-bottom:26px">Contanos qué le pasa a tu agua</h2>
      <?php
      $FORM_SERVICIO = 'Tratamiento de agua';
      $FORM_TITLE = 'Consulta por filtros';
      $FORM_TEXT  = 'Si ya tenés el análisis, mejor todavía: mandalo por WhatsApp después de dejar tus datos.';
      include __DIR__ . '/includes/lead-form.php';
      ?>
    </div>
    <div class="split-media rv">
      <div class="panel">
        <div class="motivo-agua" aria-hidden="true"></div>
        <span class="panel-tag" style="background:rgba(34,32,28,.72)">Panel ilustrativo · agua tratada</span>
      </div>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
