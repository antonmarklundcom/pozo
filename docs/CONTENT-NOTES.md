# Content notes (internal, never published)

Editorial notes that used to be visible on the public site live here instead.
`tools/qa.mjs` fails the build if one of them shows up in a generated page.

## Images

- All eight WebP images in `assets/images/` are AI illustrations (Higgsfield). Each keeps the visible
  label "Imagen ilustrativa" and the public footer says: "Las imágenes del sitio son ilustrativas: no
  muestran trabajos, equipos ni personal reales."
- **Removed from the public footer on 2026-09-30:** "Reemplazalas con fotos verificadas de trabajos
  reales antes de usarlas como prueba comercial." This was an instruction to the owner, not to
  visitors. It still applies: replace the illustrations with verified photos of the real operator,
  truck, equipment and finished jobs before using any image as evidence. When a real photo replaces
  an illustration, remove its "Imagen ilustrativa" label and describe it truthfully in the `alt`.
- Prompts used for the illustrations: `docs/HIGGSFIELD-IMAGE-PROMPTS.md`.

## Facts that stay unconfirmed until the operator confirms them

- Prices: every value in `PRICES` (`site.config.mjs`) is `null`, shown as "A cotizar". Only verified
  guaraní (PYG) prices may ever replace them. WhatsApp texts never mention prices.
- Visit / diagnosis cost, response times, guarantees, "24/7", "gratis", potability: not claimed.
- Truck capacity 8 m³ and depth band 30–120 m are "informado/a", as the operator stated them.
