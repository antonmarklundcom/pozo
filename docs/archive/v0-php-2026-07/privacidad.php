<?php
require_once __DIR__ . "/includes/config.php";
$page = 'privacidad';
include __DIR__ . '/includes/header.php';
?>

<section>
  <div class="wrap-narrow prose">
    <span class="eyebrow">Legal</span>
    <h1 style="font-size:clamp(32px,4.4vw,52px)">Política de Privacidad</h1>
    <p class="lead" style="margin-top:18px">
      Qué datos tuyos recibimos, para qué los usamos y cómo pedir que los borremos.
      Última actualización: <?= e(date('d/m/Y', strtotime(RATES_UPDATED))) ?>.
    </p>

    <h3>Qué datos recogemos</h3>
    <p>
      Solo lo que vos escribís en el formulario de presupuesto: nombre, ciudad o barrio,
      teléfono o WhatsApp y, si lo completás, el detalle de lo que necesitás. Si nos
      escribís por WhatsApp, además queda tu número y el contenido del chat, dentro de
      la propia aplicación.
    </p>
    <p>
      No pedimos ni guardamos cédula, datos bancarios ni de tarjeta. Si alguien te los
      pide en nombre de este sitio, no se los des.
    </p>

    <h3>Para qué los usamos</h3>
    <ul class="checks">
      <li>Para contactarte y pasarte el presupuesto que pediste.</li>
      <li>Para derivar tu pedido al prestador que va a hacer el trabajo (perforador, desagotador o instalador).</li>
      <li>Para hacer seguimiento del pedido hasta que quede resuelto.</li>
    </ul>
    <p>
      <b>Somos una plataforma de contacto:</b> no ejecutamos los trabajos nosotros mismos,
      los coordinamos con prestadores. Por eso, para poder atenderte, tus datos de contacto
      se comparten con el prestador asignado a tu pedido. Fuera de eso, no vendemos ni
      cedemos tus datos a terceros ni los usamos para publicidad de otras empresas.
    </p>

    <h3>Cuánto tiempo los guardamos</h3>
    <p>
      Mientras el pedido esté abierto y por un período razonable después, para poder
      responder si nos volvés a escribir por el mismo trabajo. Podés pedir que los
      borremos antes.
    </p>

    <h3>Tus derechos</h3>
    <p>
      De acuerdo con la Ley N° 6534/2020 de protección de datos personales de Paraguay,
      podés pedir acceder a los datos que tenemos tuyos, corregirlos o eliminarlos.
      Escribinos por WhatsApp al <a href="tel:<?= e(TEL_LINK) ?>" class="tnum"><?= e(TEL_TEXT) ?></a>
      y lo resolvemos.
    </p>

    <h3>Cookies</h3>
    <p>
      Usamos cookies propias necesarias para que el sitio funcione y, si aceptás el
      aviso, cookies de medición para saber cuántas visitas recibimos. Podés rechazarlas
      desde el aviso que aparece al entrar, sin perder ninguna función del sitio.
      Ninguna casilla viene marcada de antemano.
    </p>

    <h3>Enlaces a terceros</h3>
    <p>
      Los botones de WhatsApp te llevan a la aplicación de WhatsApp, que tiene sus
      propias condiciones y política de privacidad. Nosotros no controlamos ese servicio.
    </p>

    <p style="margin-top:34px">
      <a class="btn btn-ghost" href="/">Volver al inicio</a>
    </p>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
