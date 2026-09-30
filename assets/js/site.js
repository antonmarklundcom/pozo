(() => {
  'use strict';

  document.documentElement.classList.add('js');

  // --- First-touch attribution for the server-side lead handler ------------
  if (!document.cookie.split('; ').some((item) => item.startsWith('vc_attr='))) {
    const params = new URLSearchParams(window.location.search);
    const attribution = {
      landing_page: window.location.href.slice(0, 2000),
      referrer: document.referrer.slice(0, 2000),
    };
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach((key) => {
      const value = params.get(key);
      if (value) attribution[key] = value.slice(0, 200);
    });
    document.cookie = `vc_attr=${encodeURIComponent(JSON.stringify(attribution))}; Max-Age=7776000; Path=/; SameSite=Lax; Secure`;
  }

  // --- WhatsApp click counter ------------------------------------------------
  // Links stay direct wa.me in the HTML (no-JS visitors go straight there).
  // At the moment of the click the href becomes /wa.php?p=<page>&t=<topic>,
  // which logs the click without IP or phone and redirects to the same text.
  const trackWhatsApp = (event) => {
    const link = event.target.closest && event.target.closest('a[data-wa-track]');
    if (!link || !/^https:\/\/wa\.me\//.test(link.getAttribute('href') || '')) return;
    link.setAttribute('href', `/wa.php?${link.dataset.waTrack}`);
  };
  document.addEventListener('click', trackWhatsApp, true);
  document.addEventListener('auxclick', trackWhatsApp, true);

  // --- Header navigation ---------------------------------------------------
  const menuButton = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      mainNav.classList.toggle('is-open', open);
    });

    mainNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        menuButton.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('is-open');
      }
    });
  }

  const submenuButton = document.querySelector('.submenu-toggle');
  const navServices = document.querySelector('.nav-services');
  if (submenuButton && navServices) {
    submenuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = submenuButton.getAttribute('aria-expanded') !== 'true';
      submenuButton.setAttribute('aria-expanded', String(open));
      navServices.classList.toggle('is-open', open);
    });

    document.addEventListener('click', (event) => {
      if (!navServices.contains(event.target)) {
        submenuButton.setAttribute('aria-expanded', 'false');
        navServices.classList.remove('is-open');
      }
    });
  }

  // --- Compact header after 24px of scroll ---------------------------------
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    let ticking = false;
    const sync = () => {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    };
    sync();
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    }, { passive: true });
  }

  // --- WhatsApp launcher ---------------------------------------------------
  // The panel is a <details>, so it already works without JavaScript. JS adds
  // Escape, click-outside, focus handling and the header trigger.
  const launcher = document.querySelector('#wa-launcher');
  if (launcher) {
    const fab = launcher.querySelector('.wa-launcher__fab');
    const panel = launcher.querySelector('.wa-launcher__panel');
    const closeButton = launcher.querySelector('.wa-launcher__close');
    const mobileSheet = () => window.matchMedia('(max-width: 700px)').matches;
    let lastTrigger = null;

    if (closeButton) closeButton.hidden = false;

    // Upgrade the header link into a real button that toggles the same panel.
    const triggers = [];
    document.querySelectorAll('[data-launcher-trigger]').forEach((node) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = node.className;
      button.innerHTML = node.innerHTML;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', 'wa-launcher');
      node.replaceWith(button);
      triggers.push(button);
      button.addEventListener('click', () => {
        lastTrigger = button;
        launcher.open = !launcher.open;
      });
    });

    const syncState = () => {
      const open = launcher.open;
      triggers.forEach((button) => button.setAttribute('aria-expanded', String(open)));
      if (fab) fab.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('launcher-open', open && mobileSheet());
    };

    launcher.addEventListener('toggle', () => {
      syncState();
      if (launcher.open) {
        const first = panel && panel.querySelector('.wa-option');
        if (first) first.focus({ preventScroll: true });
      } else if (lastTrigger && document.contains(lastTrigger)) {
        lastTrigger.focus({ preventScroll: true });
        lastTrigger = null;
      }
    });

    if (fab) {
      fab.addEventListener('click', () => { lastTrigger = fab; });
    }

    if (closeButton) {
      closeButton.addEventListener('click', () => { launcher.open = false; });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && launcher.open) {
        launcher.open = false;
        if (fab) fab.focus({ preventScroll: true });
      }
    });

    document.addEventListener('click', (event) => {
      if (!launcher.open) return;
      if (launcher.contains(event.target)) return;
      if (event.target.closest('[data-launcher-trigger], .contact-toggle')) return;
      launcher.open = false;
    });

    syncState();
  }

  // --- Reveal on scroll ----------------------------------------------------
  const revealables = document.querySelectorAll('.reveal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (revealables.length && 'IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach((node) => observer.observe(node));
  } else {
    revealables.forEach((node) => node.classList.add('is-in'));
  }

  // --- Calculator ----------------------------------------------------------
  // Also runs on /gracias/, which re-renders the estimate from the query string
  // (d = metres, s = soil, i = 1 with installation). The price is always
  // recomputed from the published rates, never read from the URL.
  const calculator = document.querySelector('#well-calculator');
  const estimate = document.querySelector('#estimate');
  const estimateResult = document.querySelector('#estimate-result');
  const thanks = document.querySelector('#gracias-estimate');
  const calcRoot = estimate || thanks;
  // Base URL (number) and text template come from the build, which takes them
  // from site.config.mjs and content/wa-messages.mjs. Nothing is hard-coded here.
  const WA_BASE = calcRoot ? calcRoot.dataset.waBase || '' : '';
  const WA_TEMPLATE = calcRoot ? calcRoot.dataset.waTemplate || '' : '';

  const RATES = (() => { if (!calcRoot) return {}; try { return JSON.parse(calcRoot.dataset.rates || '{}'); } catch { return {}; } })();
  const formatGs = (value) => `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Gs`;
  const soilLabels = { tierra: 'tierra', mixto: 'mixto', roca: 'roca', desconocido: 'no sé' };
  const SOILS = Object.keys(soilLabels);

  function estimateFor(depthValue, soilValue, install) {
    const depth = Math.max(10, Math.min(300, Math.round(Number(depthValue)) || 100));
    const soil = SOILS.includes(soilValue) ? soilValue : 'desconocido';
    const rate = soil === 'mixto' ? RATES.mixed : soil === 'roca' ? RATES.rock : RATES.soil;
    const drilling = rate ? depth * rate : null;
    const kit = install ? RATES.kit || null : 0;
    const total = drilling != null && kit != null ? drilling + kit : null;
    return { depth, soil, install, rate, drilling, kit, total };
  }

  function calculatorSummary(data) {
    return estimateFor(data.get('depth'), data.get('soil'), data.has('install'));
  }

  function requestTextFor(s) {
    return WA_TEMPLATE
      .replace('{depth}', String(s.depth))
      .replace('{soil}', soilLabels[s.soil] || s.soil)
      .replace('{components}', s.install ? 'perforación con entubado + instalación completa (bomba, tablero, tanque)' : 'solo perforación con entubado')
      .replace('{estimate}', s.total != null ? `Estimación del sitio: ${formatGs(s.total)}` : 'Estimación: a cotizar');
  }

  function requestText() {
    return requestTextFor(calculatorSummary(new FormData(calculator)));
  }

  function renderEstimate(s, target, options) {
    const withCopy = !options || options.copy !== false;
    const eyebrow = options && options.eyebrow ? options.eyebrow : 'Estimación inicial';
    const labels = {
      tierra: 'suelo de tierra',
      mixto: 'suelo mixto',
      roca: 'suelo de roca',
      desconocido: 'suelo por confirmar',
    };
    const rows = [
      `<li><span>Perforación con entubado y engravado</span><strong>${s.drilling != null ? formatGs(s.drilling) : 'A cotizar'}</strong></li>`,
      s.install ? `<li><span>Instalación completa</span><strong>${s.kit ? formatGs(s.kit) : 'A cotizar'}</strong></li>` : '',
    ].join('');
    const note = s.total != null
      ? `Precio de referencia. Si hace falta perforar 20 m más, suma ${formatGs(20 * s.rate)}. El operador confirma el valor final al revisar suelo, profundidad y acceso.`
      : 'Para este tipo de suelo el operador prepara la cotización según los datos del terreno.';
    const waHref = WA_BASE && WA_TEMPLATE ? `${WA_BASE}${encodeURIComponent(requestTextFor(s))}` : '';
    const waButton = waHref
      ? `<a class="button button--wa" id="send-estimate" href="${waHref}" target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>`
      : '';
    const copyButton = withCopy ? '<button class="button button--outline" id="copy-estimate" type="button">Copiar solicitud</button>' : '';

    target.innerHTML = `<p class="eyebrow">${eyebrow}</p><h2>${s.depth} metros · ${labels[s.soil]}</h2><ul>${rows}</ul><div class="estimate-total"><span>Estimado</span><strong>${s.total != null ? formatGs(s.total) : 'A cotizar'}</strong></div><p>${note}</p><div class="estimate-actions">${copyButton}${waButton}</div>`;
  }

  async function copySummary() {
    const message = requestText();
    try {
      await navigator.clipboard.writeText(message);
      const activeButton = document.querySelector('#copy-estimate');
      if (activeButton) {
        activeButton.textContent = 'Solicitud copiada';
        setTimeout(() => { activeButton.textContent = 'Copiar solicitud'; }, 1800);
      }
    } catch {
      window.prompt('Copiá esta solicitud:', message);
    }
  }

  // The lead form under the estimate posts the scope with the contact details.
  const leadForm = document.querySelector('#calc-lead');
  function syncLeadFields(s) {
    if (!leadForm) return;
    const set = (name, value) => { if (leadForm.elements[name]) leadForm.elements[name].value = value; };
    set('depth', s.depth);
    set('soil', s.soil);
    set('install', s.install ? '1' : '0');
    set('estimate', s.total != null ? Math.round(s.total) : '');
    set('message', `Presupuesto desde la calculadora: pozo artesiano de ${s.depth} m, suelo ${soilLabels[s.soil]}, ${s.install ? 'con instalación completa' : 'solo perforación'}. ${s.total != null ? `Estimación del sitio: ${formatGs(s.total)}.` : 'Estimación: a cotizar.'}`);
  }

  function refreshEstimate() {
    // Skip half-typed input (empty or out of range) so the price never jumps to a default.
    if (!calculator.checkValidity()) return;
    const summary = calculatorSummary(new FormData(calculator));
    renderEstimate(summary, estimateResult);
    syncLeadFields(summary);
    document.querySelectorAll('#included-toggle [data-needs-install]').forEach((col) => { col.hidden = !summary.install; });
    const total = estimateResult.querySelector('.estimate-total strong');
    if (total && !reducedMotion) {
      total.classList.remove('is-updated');
      void total.offsetWidth;
      total.classList.add('is-updated');
    }
  }

  if (calculator && estimate && estimateResult) {
    syncLeadFields(calculatorSummary(new FormData(calculator)));
    calculator.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!calculator.reportValidity()) return;
      refreshEstimate();
      estimate.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    });
    calculator.addEventListener('input', refreshEstimate);
    calculator.addEventListener('change', refreshEstimate);
    document.addEventListener('click', (event) => {
      if (event.target.closest('#copy-estimate')) copySummary();
    });
  }

  // /gracias/ after the calculator lead form: show the estimate and what is included.
  if (thanks) {
    const params = new URLSearchParams(window.location.search);
    const depthParam = Number(params.get('d'));
    if (Number.isInteger(depthParam) && depthParam >= 10 && depthParam <= 300 && SOILS.includes(params.get('s'))) {
      const result = thanks.querySelector('#gracias-estimate-result');
      const summary = estimateFor(depthParam, params.get('s'), params.get('i') === '1');
      if (result) {
        renderEstimate(summary, result, { copy: false, eyebrow: 'Tu presupuesto de referencia' });
        thanks.querySelectorAll('[data-needs-install]').forEach((col) => { col.hidden = !summary.install; });
        thanks.hidden = false;
      }
    }
  }

  // --- CRM attribution script, loaded when the browser is idle ---------------
  // It is not needed for the first paint; site.js already stores vc_attr.
  const vcSrc = document.body.dataset.vcSrc;
  if (vcSrc) {
    const loadVc = () => {
      const script = document.createElement('script');
      script.src = vcSrc;
      script.async = true;
      document.body.appendChild(script);
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(loadVc, { timeout: 3000 });
    else window.setTimeout(loadVc, 1500);
  }

  // --- Forms ---------------------------------------------------------------
  document.querySelectorAll('input[name="page_url"]').forEach((field) => {
    field.value = window.location.href;
  });

  const status = document.querySelector('#form-status');
  const error = new URLSearchParams(window.location.search).get('error');
  if (error && status) {
    status.textContent = error === 'telefono'
      ? 'Revisá el número de teléfono e intentá nuevamente.'
      : 'Revisá los campos obligatorios e intentá nuevamente.';
  }

  // Keep the ficha message useful for the operator: name the chosen case.
  const fichaForm = document.querySelector('.wa-ficha__form');
  if (fichaForm) {
    const service = fichaForm.querySelector('select[name="service"]');
    const message = fichaForm.querySelector('input[name="message"]');
    const zona = fichaForm.querySelector('select[name="zona"]');
    fichaForm.addEventListener('submit', () => {
      if (!message) return;
      const parts = ['Ficha rápida enviada desde el sitio.'];
      if (service && service.value) parts.push(`Caso: ${service.value}.`);
      if (zona && zona.value) parts.push(`Ciudad: ${zona.value}.`);
      const when = fichaForm.querySelector('input[name="urgencia"]:checked');
      if (when) parts.push(`Para cuándo: ${when.nextElementSibling ? when.nextElementSibling.textContent : when.value}.`);
      parts.push('Pido que me escriban por WhatsApp.');
      message.value = parts.join(' ');
    });
  }
})();
