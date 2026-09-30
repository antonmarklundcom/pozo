// Site-kit configuration for pozo.com.py: everything the generic tools in
// tools/kit/ need to know about this site. Copying the kit to another site =
// copy tools/kit/ and write this file for it (docs/SITE-KIT.md).
import { SITE } from './site.config.mjs';

export default {
  siteUrl: SITE.url,
  hostAliases: ['www.pozo.com.py'],
  port: 8765,
  phone: {
    whatsapp: SITE.whatsapp,
    tel: SITE.phoneHref.replace(/\D/g, ''),
    display: SITE.phoneDisplay,
    // Any Paraguayan mobile-looking number (595 + 9 digits) that is not ours fails QA…
    foreign: /(?<!\d)595[ .-]?9\d{2}[ .-]?\d{3}[ .-]?\d{3}(?!\d)/,
    // …except the demo placeholder kept in the archived July v0 config (never published).
    allow: [{ digits: ['595', '981', '234', '567'].join(''), under: 'docs/archive/' }],
  },
  // v0 sitemap: its URLs must keep answering (200 or 301).
  legacySitemaps: ['docs/archive/v0-php-2026-07/sitemap.xml'],
  published: {
    auditBefore: 'docs/seo/audit-before.json',
    // v0 spellings found live that the first .htaccess missed.
    extra: ['/pozos-artesianos/precio-metro', '/tratamiento-agua'],
  },
  // Third-party requests that may fail offline without failing the browser check.
  thirdParty: /crm\.clientes\.com\.py/,
  // Sibling sites: at most one cross-link per page.
  siblings: /https:\/\/(?:obra|arq|carpinteria)\.com\.py/,
  noindexFiles: ['404.html', 'gracias/index.html'],
  extraRoutes: ['/gracias/'],
  requiredInSitemap: ['/zonas/'],
  // Must answer 404 (or 403) through tools/router.php and on the live host.
  deniedPaths: ['/config/site.generated.php', '/content/wa-messages.mjs', '/docs/PLAN-V2.md', '/tools/qa.mjs', '/tools/kit/qa-core.mjs', '/build.mjs', '/site.config.mjs', '/kit.config.mjs', '/README.md', '/.git/HEAD', '/.gitignore', '/tools/prepare-images.py'],
  privateFiles: ['private/pozo.php', 'private/vendercrm.php'],
  text: {
    preparation: /demo-banner|sitio en preparación|no publicar todavía/i,
    placeholders: /leads@pozo\.com\.py|correo por configurar|buzón pendiente|\[(?:RESPONSABLE|CORREO|DOMICILIO)/i,
    internalNotes: /Reemplazalas|antes de usarlas como prueba|lorem ipsum|a completar por|nota interna/i,
  },
  // Performance contract (build.mjs): inline critical CSS + this file non-blocking.
  fullCss: '/assets/css/site.min.css',
  minJs: '/assets/js/site.min.js',
  minified: [['assets/css/site.css', 'assets/css/site.min.css', 'css'], ['assets/js/site.js', 'assets/js/site.min.js', 'js']],
  idleScripts: /vc-attribution/,
  perfPaths: ['/', '/servicios/desague/', '/servicios/precio-pozo/', '/contacto/'],
  linkGraph: {
    maxDepth: 3,
    // Service pages need contextual (in-<main>) links from >= 3 other pages.
    minContextualIn: [{ pattern: /^\/servicios\/[^/]+\/$/, min: 3, label: 'service page' }],
    // Zone pages: linked from their hub body and from >= 1 page of `from`.
    hubs: [{ pattern: /^\/zonas\/[^/]+\/$/, hub: '/zonas/', from: /^\/servicios\/[^/]+\/$/, label: 'zone page' }],
  },
  // tools/kit/form-test.mjs: the contact handler contract (VenderCRM + Resend + WhatsApp).
  formTest: {
    endpoint: '/contacto.php',
    logPrefix: '[pozo]',
    thanksPath: '/gracias/',
    errorPath: '/contacto/?error={code}#lead-form',
    // Env names the handler reads for its private config files (pointed at nothing in tests).
    privateConfigEnv: ['POZO_CONFIG', 'VENDERCRM_CONFIG'],
    valid: {
      form_id: 'contacto', page_url: 'https://pozo.com.py/contacto/', website: '', name: 'Prueba Automática',
      phone: '0981 000 000', email: 'visitante@example.invalid', zona: 'San Lorenzo', barrio: 'Barrio Centro', urgencia: 'hoy',
      service: 'Desagüe de pozo ciego', message: 'Prueba local con stubs. El pozo rebalsa.', consent: '1',
    },
    sources: { contacto: 'site:pozo.com.py:contacto', ficha: 'site:pozo.com.py:ficha-rapida' },
    ficha: { form_id: 'ficha', page_url: 'https://pozo.com.py/servicios/desague/', whatsappIncludes: 'ficha rápida (/servicios/desague/)' },
    whatsappIncludes: ['pozo.com.py', 'formulario de contacto', 'San Lorenzo, Barrio Centro', 'Desagüe de pozo ciego', '0981 000 000'],
    crmFields: { zona: 'San Lorenzo', pagina: 'https://pozo.com.py/contacto/', servicio: 'Desagüe de pozo ciego' },
  },
  hooks: {
    browserCheck: 'tools/site/browser-hooks.mjs',
    formTest: 'tools/site/form-hooks.mjs',
  },
  verify: {
    // wa.php logs clicks to a throwaway file during verify ({tmp} = OS temp dir).
    env: { POZO_WA_LOG: '{tmp}/pozo-wa-clicks-{pid}.log' },
  },
  gsc: { site: 'sc-domain:pozo.com.py' },
};
