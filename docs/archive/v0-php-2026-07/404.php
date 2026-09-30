<?php
require_once __DIR__ . "/includes/config.php";
$page = '404';
http_response_code(404);
include __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="hero-media" style="min-height:min(46vh,380px)">
    <div class="motivo-suelo" aria-hidden="true"></div>
    <div class="wrap">
      <div class="hero-in" style="padding-top:48px;padding-bottom:32px">
        <span class="eyebrow" style="color:#E9855A">Error 404</span>
        <h1>Esta página no está donde buscabas</h1>
        <p class="lead">
          Puede que haya cambiado de dirección o que el enlace esté mal escrito.
          Abajo están todos los servicios, y si preferís no buscar, escribinos directo.
        </p>
        <div class="hero-acts">
          <a class="btn btn-wa btn-lg" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Escribinos por WhatsApp</a>
          <a class="hero-tel tnum" href="tel:<?= e(TEL_LINK) ?>"><?= e(TEL_TEXT) ?></a>
        </div>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <header class="sec-head rv">
      <span class="eyebrow">Todo el sitio</span>
      <h2>Lo que sí vas a encontrar</h2>
    </header>
    <div class="bento">
      <a class="card cell-3 rv" href="/pozos-artesianos"><h3>Perforación de pozos artesianos</h3><p>Pozo de agua propio: perforación, entubado, filtro y bomba.</p><span class="card-link">Ver</span></a>
      <a class="card cell-3 rv" href="/pozos-artesianos/precio-metro"><h3>Precio por metro</h3><p>Cuánto sale perforar, con cotizador en línea.</p><span class="card-link">Ver</span></a>
      <a class="card cell-2 rv" href="/pozos-ciegos"><h3>Pozos ciegos</h3><p>Construcción, medidas y mantenimiento.</p><span class="card-link">Ver</span></a>
      <a class="card cell-2 rv" href="/desague-pozo-ciego"><h3>Desagüe urgente</h3><p>Camión atmosférico en Asunción y Central.</p><span class="card-link">Ver</span></a>
      <a class="card cell-2 rv" href="/pozo-ciego-lleno"><h3>Pozo que no absorbe</h3><p>Por qué se llena rápido y cómo se soluciona.</p><span class="card-link">Ver</span></a>
      <a class="card cell-3 rv" href="/pozos-septicos"><h3>Pozos y cámaras sépticas</h3><p>Instalación, medidas y mantenimiento preventivo.</p><span class="card-link">Ver</span></a>
      <a class="card cell-3 rv" href="/tratamiento-agua"><h3>Tratamiento de agua</h3><p>Filtros para hierro, sarro y desinfección.</p><span class="card-link">Ver</span></a>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
