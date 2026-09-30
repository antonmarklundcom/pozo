<?php
/**
 * includes/lead-form.php
 * Formulario de 3 campos: Nombre · Ciudad o barrio · Teléfono/WhatsApp.
 * Se autoprocesa (POST a la misma URL). Guarda en leads.log y envía por mail().
 *
 * Variables opcionales antes del include:
 *   $FORM_TITLE, $FORM_TEXT, $FORM_SERVICIO (etiqueta que viaja en el lead)
 */
require_once __DIR__ . '/config.php';

$_fs = '';   // estado: '', 'ok', 'err'
$_fmsg = '';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['lead_form'])) {

    $nombre  = trim($_POST['nombre']   ?? '');
    $ciudad  = trim($_POST['ciudad']   ?? '');
    $tel     = trim($_POST['telefono'] ?? '');
    $detalle = trim($_POST['detalle']  ?? '');
    $trampa  = trim($_POST['website']  ?? '');   // honeypot: los bots lo llenan
    $servicio= trim($_POST['servicio'] ?? 'Consulta general');

    $telDigits = preg_replace('/\D+/', '', $tel);

    if ($trampa !== '') {
        $_fs = 'ok';                                  // bot: respuesta neutra, nada se envía
        $_fmsg = 'Gracias, recibimos tu consulta.';
    } elseif ($nombre === '' || $ciudad === '' || $telDigits === '') {
        $_fs = 'err';
        $_fmsg = 'Completá tu nombre, tu ciudad o barrio y un número de contacto.';
    } elseif (strlen($telDigits) < 8 || strlen($telDigits) > 15) {
        $_fs = 'err';
        $_fmsg = 'Revisá el número de teléfono: tiene que tener entre 8 y 15 dígitos.';
    } else {
        $linea = sprintf(
            "[%s] %s | %s | %s | %s | %s | %s",
            date('Y-m-d H:i:s'),
            $servicio,
            str_replace('|', '/', $nombre),
            str_replace('|', '/', $ciudad),
            $tel,
            str_replace(["\r","\n","|"], ' ', $detalle),
            $_SERVER['HTTP_REFERER'] ?? '-'
        );
        @file_put_contents(LEAD_LOG, $linea . PHP_EOL, FILE_APPEND | LOCK_EX);

        $cuerpo = "Nuevo pedido de presupuesto — " . SITE_NAME . "\n\n"
                . "Servicio:  $servicio\n"
                . "Nombre:    $nombre\n"
                . "Ciudad:    $ciudad\n"
                . "Contacto:  $tel\n"
                . "Detalle:   " . ($detalle !== '' ? $detalle : '(sin detalle)') . "\n\n"
                . "Página:    " . ($_SERVER['HTTP_REFERER'] ?? '-') . "\n"
                . "Fecha:     " . date('d/m/Y H:i') . "\n";

        @mail(
            LEAD_EMAIL,
            'Lead ' . SITE_NAME . ' — ' . $servicio . ' — ' . $ciudad,
            $cuerpo,
            "From: " . SITE_NAME . " <" . LEAD_FROM . ">\r\n"
            . "Reply-To: " . LEAD_FROM . "\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\n"
        );

        $_fs = 'ok';
        $_fmsg = 'Listo, ' . htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8')
               . '. Te contactamos al ' . htmlspecialchars($tel, ENT_QUOTES, 'UTF-8')
               . '. Si es urgente, escribinos directo por WhatsApp.';
    }
}
?>
<div class="form-box" id="presupuesto">
  <h3><?= e($FORM_TITLE ?? 'Pedí tu presupuesto sin costo') ?></h3>
  <p class="small muted" style="margin-top:8px"><?= e($FORM_TEXT ?? 'Tres datos y te llamamos. No cobramos por presupuestar ni por visitar la obra.') ?></p>

  <?php if ($_fs !== ''): ?>
    <p class="form-msg <?= $_fs ?>" role="status"><?= $_fmsg ?></p>
  <?php endif; ?>

  <form method="post" action="#presupuesto" novalidate>
    <input type="hidden" name="lead_form" value="1">
    <input type="hidden" name="servicio" value="<?= e($FORM_SERVICIO ?? pg('crumb') ?: 'Inicio') ?>">

    <div class="field">
      <label for="f-nombre">Nombre</label>
      <input type="text" id="f-nombre" name="nombre" autocomplete="name" required
             value="<?= e($_fs === 'err' ? ($_POST['nombre'] ?? '') : '') ?>">
    </div>

    <div class="field">
      <label for="f-ciudad">Ciudad o barrio <span class="hint">— dónde queda el trabajo</span></label>
      <input type="text" id="f-ciudad" name="ciudad" autocomplete="address-level2" required
             placeholder="Ej.: Luque, barrio Laurelty"
             value="<?= e($_fs === 'err' ? ($_POST['ciudad'] ?? '') : '') ?>">
    </div>

    <div class="field">
      <label for="f-tel">Teléfono o WhatsApp</label>
      <input type="tel" id="f-tel" name="telefono" inputmode="tel" autocomplete="tel" required
             placeholder="09XX XXX XXX"
             value="<?= e($_fs === 'err' ? ($_POST['telefono'] ?? '') : '') ?>">
    </div>

    <div class="field">
      <label for="f-det">Contanos qué necesitás <span class="hint">— opcional</span></label>
      <textarea id="f-det" name="detalle" rows="3" placeholder="Ej.: pozo ciego lleno hace dos días, casa de familia."><?= e($_fs === 'err' ? ($_POST['detalle'] ?? '') : '') ?></textarea>
    </div>

    <p style="position:absolute;left:-9999px" aria-hidden="true">
      <label for="f-web">No completar</label>
      <input type="text" id="f-web" name="website" tabindex="-1" autocomplete="off">
    </p>

    <button type="submit" class="btn btn-accent btn-lg">Pedí tu presupuesto</button>
    <p class="form-note">Tus datos se usan solo para contactarte por este pedido (Ley 6534/2020). No los compartimos con terceros ajenos al servicio.</p>
  </form>
</div>
