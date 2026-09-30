/* pozo.com.py — JS compartido. Vanilla, sin dependencias, ~1,5 KB. */
(function () {
  'use strict';

  /* Menú móvil */
  var burger = document.getElementById('burger'),
      menu   = document.getElementById('mobmenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
  }

  /* Fade-up al entrar en pantalla — una animación por sección */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        setTimeout(function () { en.target.classList.add('in'); }, i * 80);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* Conteo de números clave (hero-fact con data-count) */
  if (!reduce && 'IntersectionObserver' in window) {
    var nums = document.querySelectorAll('[data-count]');
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, to = parseFloat(el.dataset.count), suf = el.dataset.suffix || '', t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 900, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io2.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io2.observe(el); });
  }

  /* Consent — Ley 6534/2020. Nada preseleccionado, nada se carga antes del "Aceptar". */
  var box = document.getElementById('consent');
  if (box) {
    var KEY = 'pozo_consent';
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (!saved) { setTimeout(function () { box.classList.add('show'); }, 900); }
    box.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-consent]');
      if (!b) return;
      try { localStorage.setItem(KEY, b.dataset.consent); } catch (e) {}
      box.classList.remove('show');
      /* CONECTAR: si dataset.consent === 'si', inyectar acá el script de analítica. */
    });
  }
})();
