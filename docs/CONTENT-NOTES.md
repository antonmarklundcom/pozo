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

## Zone pages: facts to verify with a local

Concrete local claims in `content/zones.mjs` that the owner's Paraguayan partner should check.
Everything else on those pages is generic access/drainage advice. Remove or fix any claim that is wrong.

- San Lorenzo: neighbors Fernando de la Mora, Capiatá, Ñemby; dense centre with small lots and narrow gates; newer outer
  barrios with unpaved/cobbled streets; UNA campus is in San Lorenzo; many rentals/pensions and shops.
- Mariano Roque Alonso: many quintas/chacras with long internal dirt paths; on the Río Paraguay bank; lower areas can
  flood or waterlog in heavy rain/crecidas; neighbors Limpio, Luque, Asunción.
- Luque: large city with dense urban core and outer quintas/dirt roads; Aeropuerto Silvio Pettirossi is in Luque;
  heavy traffic toward Asunción; neighbors San Lorenzo, Limpio, Mariano Roque Alonso.
- Capiatá: newer barrios with dirt/cobbled streets and no sewer network; neighbors San Lorenzo, Luque, Itauguá;
  many new plots being built on.
- Lambaré: Cerro Lambaré exists and several streets slope; borders Asunción; dense barrios with pasillos/shared
  entrances; neighbors Villa Elisa, Ñemby.
- Fernando de la Mora: small, very dense city next to Asunción; locals say "Zona Norte" / "Zona Sur"; old houses with
  old pozos; neighbors Asunción, San Lorenzo, Lambaré.
- Ñemby: growing sectors with new houses, unpaved streets, no sewer; neighbors Villa Elisa, Lambaré, San Lorenzo.
- Villa Elisa: mostly residential, houses with gardens and finished floors; neighbors Ñemby, Lambaré, San Antonio.
- Limpio: mix of shops/workshops/depots, barrios, quintas and new subdivisions; neighbors Mariano Roque Alonso, Luque,
  Capiatá.
- Asunción: not every home is connected to a sewer network, some still use pozo ciego; old houses with narrow garages
  and street trees; neighbors Lambaré, Fernando de la Mora, Mariano Roque Alonso.
- Check also: the "nearby" lists above and the suggestion that a pozo artesiano is asked about mostly on large outer lots.
