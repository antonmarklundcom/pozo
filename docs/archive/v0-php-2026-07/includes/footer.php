<?php
/** includes/footer.php — cierra <main>, NAP idéntico en todas las páginas. */
require_once __DIR__ . '/config.php';
?>
</main>

<footer class="ftr">
  <div class="wrap">
    <div class="ftr-grid">

      <div>
        <a class="brand" href="/" style="margin-bottom:16px">
          <span class="brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M12 2v13"/><path d="M8 15h8l-1.4 6.2a1 1 0 0 1-1 .8h-3.2a1 1 0 0 1-1-.8Z"/><path d="M6 6h4"/><path d="M14 10h4"/>
            </svg>
          </span>
          <span class="brand-txt" style="color:#fff">pozo<span>.com.py</span></span>
        </a>
        <p class="small" style="max-width:38ch">
          Conectamos a quien necesita un pozo, un desagüe o un filtro de agua con
          perforadores y desagotadores que trabajan en Asunción y Gran Asunción.
          Presupuesto sin costo y sin compromiso.
        </p>
      </div>

      <div>
        <h4>Servicios</h4>
        <ul>
          <li><a href="/pozos-artesianos">Pozos artesianos</a></li>
          <li><a href="/pozos-artesianos/precio-metro">Precio por metro</a></li>
          <li><a href="/pozos-ciegos">Pozos ciegos</a></li>
          <li><a href="/desague-pozo-ciego">Desagüe de pozo ciego</a></li>
          <li><a href="/pozo-ciego-lleno">Pozo ciego lleno</a></li>
          <li><a href="/pozos-septicos">Pozos sépticos</a></li>
          <li><a href="/tratamiento-agua">Tratamiento de agua</a></li>
        </ul>
      </div>

      <div>
        <h4>Zonas</h4>
        <ul>
          <li><a href="/desague-san-lorenzo">Desagüe en San Lorenzo</a></li>
          <li><a href="/desague-mariano-roque-alonso">Desagüe en M. R. Alonso</a></li>
          <?php foreach (array_slice($ZONAS, 0, 6) as $z): ?>
            <li><?= e($z) ?></li>
          <?php endforeach; ?>
        </ul>
      </div>

      <div>
        <h4>Contacto</h4>
        <ul>
          <li><a href="tel:<?= e(TEL_LINK) ?>" style="color:#fff;font-weight:600;font-size:18px" class="tnum"><?= e(TEL_TEXT) ?></a></li>
          <li><a href="<?= e(wa('Hola, vi pozo.com.py y quiero consultar por un presupuesto.')) ?>" target="_blank" rel="noopener">Escribinos por WhatsApp</a></li>
          <li><?= e(CITY) ?>, <?= e(REGION) ?> — Paraguay</li>
          <li><?= e(HOURS_TEXT) ?></li>
        </ul>
        <p class="small" style="margin-top:16px">
          Formas de pago del servicio: efectivo, transferencia, tarjeta,
          Tigo Money, Billetera Personal y Zimple.
        </p>
      </div>

    </div>

    <div class="ftr-bottom">
      <span>© <?= date('Y') ?> <?= e(SITE_NAME) ?>. Todos los derechos reservados.</span>
      <span><a href="/privacidad">Política de privacidad</a> · Ley 6534/2020 de protección de datos</span>
    </div>
  </div>
</footer>

<?php include __DIR__ . '/cta-whatsapp.php'; ?>

<div class="consent" id="consent" role="dialog" aria-label="Aviso de cookies" aria-live="polite">
  <p>Usamos cookies propias para que el sitio funcione y para medir cuántas visitas recibimos. Podés rechazarlas sin perder ninguna función.</p>
  <div class="consent-acts">
    <button class="btn btn-accent" data-consent="si">Aceptar</button>
    <button class="btn btn-ghost" data-consent="no">Rechazar</button>
  </div>
</div>

<script src="/assets/js/site.js" defer></script>
</body>
</html>
