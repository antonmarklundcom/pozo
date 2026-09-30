# Pozo.com.py

HTML/PHP website prepared for Hostinger shared hosting.

## Current status

The public pages ship with `DEMO_MODE = false`, `index,follow`, the configured phone/WhatsApp number and no preparation banner. Prices that vary by scope are shown as “A cotizar”. The contact form works through WhatsApp even before VenderCRM credentials are added.

## Publishing checklist

Edit `site.config.mjs`:

1. WhatsApp is configured as `595992279599` and displayed as `+595 992 279 599`. Confirm it on a real phone before launch.
2. Keep `phoneHref`, `phoneDisplay` and `whatsapp` synchronized if the number changes.
3. Keep `leadEmail` empty until a real mailbox has been created and tested; the public site does not show a placeholder address.
4. Replace `null` values in `PRICES` only when verified guaraní prices are available. “A cotizar” is valid for variable work.
5. Upload and extract the ready ZIP directly inside the domain's `public_html/` folder.
6. Preserve any existing `.well-known` or domain-verification files.
7. After extraction, verify HTTPS, the homepage, `/contacto/`, one form submission, WhatsApp links, `robots.txt` and `sitemap.xml` on the public domain.

## Build

```powershell
node build.mjs
```

Node.js is only used locally to regenerate pages. Hostinger serves the generated HTML and executes `contacto.php`.

## VenderCRM

The form posts to the site's own `contacto.php`; the browser never receives a CRM key. The handler includes phone validation, consent, a honeypot, first-touch campaign attribution, a stable hourly idempotency key and failure logging. A successful form submission is stored in VenderCRM and then continues to WhatsApp with the enquiry prefilled.

The CRM base URL is configured as `https://crm.clientes.com.py`. To activate CRM delivery, store the site key server-side using either:

- Environment variable: `VENDERCRM_API_KEY=the-unique-key-created-for-pozo.com.py`
- Private file: copy `docs/vendercrm-private.example.php` to `domains/pozo.com.py/private/vendercrm.php`, outside `public_html`, and insert the key there.

Do not put the key in HTML, JavaScript, `.htaccess`, the public website ZIP or this repository. Until the key is present, the handler redirects the prepared enquiry to WhatsApp. After configuration, test a real submission in VenderCRM Contactos, Pipeline and Sitios, then submit it twice to confirm no duplicate deal is created.

Direct WhatsApp links do not create a VenderCRM contact because a click does not reveal the visitor's phone number. Use the contact form when both CRM capture and WhatsApp continuation are required. Direct WhatsApp clicks can be measured later as analytics events, but they are not complete CRM leads.

## Local preview

Use any local static server from this folder. Clean directory URLs are already represented by folders containing `index.html`.

## Images

The eight WebP files are optimized versions of the supplied Higgsfield images. Descriptive source copies are kept in `source-images/`, while only the compressed WebP files are deployed. They are explicitly labeled “Imagen ilustrativa”. Replace them with verified photos of the real operator, equipment and completed work before using imagery as evidence.

## Legal note

The privacy page describes the actual lead and attribution flow. It references Ley N.º 6534/2020 and the deferred entry into force stated in article 57 of Ley N.º 7593/2025. Obtain professional review when the operating legal entity or processing practices change.
