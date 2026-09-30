<?php
/**
 * includes/cta-whatsapp.php
 * FAB flotante + barra fija móvil. El texto prellenado sale de $PAGES[$page]['wa'],
 * así que cada página manda un mensaje distinto — es la única atribución que
 * tenemos de qué página convirtió.
 */
require_once __DIR__ . '/config.php';
$_wa = wa();
?>
<a class="fab" href="<?= e($_wa) ?>" target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp">
  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm4.52 12.14c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.73 2.64 4.19 3.7.58.26 1.04.41 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z"/></svg>
</a>

<div class="mobbar" role="group" aria-label="Contacto rápido">
  <a class="btn btn-wa" href="<?= e($_wa) ?>" target="_blank" rel="noopener">
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.92-4.45 9.92-9.91 0-2.65-1.04-5.14-2.91-7.01A9.82 9.82 0 0 0 12.04 2Z"/></svg>
    WhatsApp
  </a>
  <a class="btn btn-ghost" href="tel:<?= e(TEL_LINK) ?>">Llamar</a>
</div>
