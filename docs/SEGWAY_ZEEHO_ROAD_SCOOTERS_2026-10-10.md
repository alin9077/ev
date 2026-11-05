# Australian Segway and ZEEHO road scooters

Checked 10 October 2026. Research only: no app changes, contacts, reservations or purchases.

## Recommended bounded integration

Integrate five standard Australian named-model configurations: **Segway E125S, Segway E300SE, ZEEHO AE4, ZEEHO AE6+, ZEEHO AE8+**. Preserve the existing market-inventory family IDs. Treat the E110S as a sixth researched record with current-new-supply **held**. Colour choices and optional batteries do not add model families.

The AE4 is the new closure relative to the supplied motorcycle priorities audit. A fresh direct capture of Everest's AE4 page now succeeds. Both colour variants have `available=true`; its offers explicitly identify `NewCondition` and `InStock`. Ace independently labels the AE4 **Brand New**. This closes the advertised-new-offer gap, not physical stock, an assigned VIN, a delivery promise or a verified model year.

No record should enter a passenger-car/truck ranking. Moped and seated-motor-scooter groups need their own comparison scope. Range figures below use different test regimes.

## Standard configurations

| Australian model | Standard batteries | Declared energy | Rated / peak motor power | Published range and basis | Braking |
|---|---|---|---|---|---|
| Segway E125S | 2 removable 48 V / 30 Ah packs | 2.88 kWh, published as 2880 Wh; gross/usable unspecified | 1 kW comparison/dealer claim / 3.5 kW model-page maximum; comparison says 3 kW | 108 km typical; product page omits test conditions. Mixed comparison matrix separately lists 81 km “WMTC Stage 3” for 45 km/h version | Dual-channel ABS + EABS; front/rear hydraulic discs |
| Segway E300SE | 2 removable 74 V / 27 Ah packs; optional third | 4 kWh standard; 6 kWh with optional third, both explicitly declared; gross/usable unspecified | 7.8 / 10 kW | 130 km typical at 45 km/h, 75 kg, 25°C, wind ≤3 m/s, paved road until depleted; pack-count caveat below. Separate 85 km WMTC Stage 3 claim | Dual-channel ABS; TCS |
| ZEEHO AE4 | 1 removable 74 V / 27 Ah pack; optional second | No AU kWh declaration; 1.998 kWh is arithmetic only | 1.6 / 3 kW | 63 km WMTC, 75 kg rider, 25°C; cycle version unspecified | CBS, front/rear discs |
| ZEEHO AE6+ | 1 removable 69 V / 27 Ah pack; optional second | No AU kWh declaration; 1.863 kWh is arithmetic only | 2.5 / 5.5 kW | 100 km maximum at **20 km/h**, 75 kg rider, 25°C; battery count not repeated in test footnote | CBS, front/rear discs |
| ZEEHO AE8+ | 2 removable 69 V / 27 Ah packs | No AU kWh declaration; 3.726 kWh is arithmetic only | 5 / 12.5 kW | 100 km WMTC, 75 kg rider, 25°C; cycle version unspecified | Bosch dual-channel ABS; Brembo front caliper |
| Segway E110S, supply held | 1 48 V / 30 Ah pack; optional second | 1.44 kWh comparison declaration, gross/usable unspecified | 1 kW comparison claim / 1.8 kW product-page maximum; comparison says 1.5 kW | 57 km typical without complete conditions; mixed matrix separately lists 40 km for 45 km/h version | Exact AU page column says front/rear hydraulic discs; do not inherit E125S ABS |

Main configuration sources: [Segway E125S/E110S](https://au.segway.com/escooter/products/e110s-and-e125s.html), [Segway E300SE](https://au.segway.com/escooter/products/e300se.html), [Segway comparison](https://au.segway.com/escooter/comparison.html), [ZEEHO AE4](https://www.cfmoto.com.au/model/ae4), [AE6+](https://www.cfmoto.com.au/model/ae6), [AE8+](https://www.cfmoto.com.au/model/ae8)

The JSON contains 332 fact wrappers across six records. Every wrapper keeps value, unit, status, basis, conditions and evidence. Unknowns stay null; computed energy has `derived_not_declared` status and is separate from manufacturer-declared, gross and usable capacity.

## Current offers versus stock

- **E125S:** ScooterShop's directly retrieved page says New and Available now, AUD6,140 including three months registration. The page includes a refundable-reservation route. No model year or VIN established. [Exact offer](https://www.scootershop.com.au/inventory/scooters/bike-segway-e125s-4)
- **E300SE:** ScooterShop's directly retrieved page says New and Available now, AUD8,140 including three months registration. No model year or VIN established. [Exact offer](https://www.scootershop.com.au/inventory/scooters/bike-segway-e300se-5)
- **AE4:** Everest says In stock at AUD3,990; embedded NewCondition/InStock offers and both variant availability flags were captured. Retailer colour strings are “Matt Silver Crystal” and “Helios Orange”; the official AU page says “Velocity Grey” and “Helios Orange”. Keep those strings separate rather than silently aliasing the greys. [Exact offer](https://everestmotorcycles.com/products/zeeho-ae4-electric-scooter)
- **AE6+:** Everest says In stock at AUD5,890; both Vibrant White/Neon and Slate Grey/Neon variants have NewCondition/InStock and available flags. [Exact offer](https://everestmotorcycles.com/products/zeeho-ae6-electric-scooter)
- **AE8+:** Everest says In stock at AUD7,890; Pearl White/Blue has NewCondition/InStock and an available flag. [Exact offer](https://everestmotorcycles.com/products/zeeho-ae8-electric-scooter)
- **E110S:** current official AU model page and local range explanation remain, but the former official store link returns HTTP 404 on fresh direct retrieval. An older indexed sold-out extract is not current stock proof. Leave listed_unconfirmed/unverified.

Everest's embedded product publication timestamps are 2 July 2026. Those are publication dates, not last stock-update dates. No physical stock was inspected and no cart/checkout flow was used. The Segway lower prices in cached search extracts differ from fresh originals; the fresh original snapshot wins for this capture. ZEEHO manufacturer recommended ride-away amounts include 12 months registration and may vary by dealer/location; they are distinct from a binding seller quote.

## Eligibility and licence scope

The five recommended models have named Australian road-offering evidence: Segway dealer offers include registration; CFMOTO Australia's ZEEHO pages explicitly include 12 months registration in recommended ride-away pricing. This is **source-claimed road eligibility**, not an independently inspected Australian ADR/RVS type-approval certificate or VIN-level RAV entry.

Queensland's government [LAM Scheme page](https://www.qld.gov.au/transport/licensing/motorcycles/learner-approved), last updated 7 September 2026, explicitly names **Segway E125S and E300SE**. Preserve that exact Queensland scope; do not make a nationwide “learner approved” claim from it. The Segway 2024 manufacturer launch also names all three models as learner/provisional approved, but is historical evidence.

CFMOTO describes AE4 as restricted to 45 km/h for moped-approved QLD/WA states. Ace's local WA statements say R-E for AE6+/AE8+ and R-N/C for AE4. These are not all-state licence permissions. No foreign L1e/L3e-A1 label or overseas top speed is converted into Australian registration approval. An exact approved seat count and pillion entitlement remain unknown for every record.

## Charging, storage and equipment scope

- **E125S:** AU page quotes four hours to 100% and 2.4 hours to 80%; starting SOC is unstated. Ace separately says four hours 0–100%. AU comparison lists charger **DC output** 54.2 V / 20 A. The dealer's 200–240 V AC / 6.5 A / 1120 W table also specifies **Type F** plug, so exact Australian supplied charger input/plug/box contents remain held
- **E300SE:** AU page quotes approximately 5.5 hours to 100% and 4.5 hours to 80%; starting SOC is unstated. Comparison says about five hours for two batteries, a retained conflict. Its listed 84 V / 12 A is charger DC output. Dealer AC-input/Type F table is held for localisation
- **AE4:** four hours 20–80% and 7.5 hours 0–100%, each with a referenced 350 W charger
- **AE6+:** two hours 20–80% and 3.5 hours 0–100%, each with a referenced 750 W charger
- **AE8+:** three hours 20–80% and 4.5 hours 0–100%, each with a referenced 750 W charger

ZEEHO charger wattages are not labelled AC wall input or DC output. Included charger count, exact wall input and local plug are not expressly established. Pack voltage is not charger wall voltage. Extra-pack charging arrangement/timing is unknown; never double batteries and silently copy a charge time.

E125S/E110S list **27 L under-seat storage**. E300SE lists **34 L**, falling to **17 L after installing the optional third battery**. AE4 lists **31 L under-seat storage**, without an explicit optional-battery effect. Reliable Australian litre values for AE6+/AE8+ were not established. A top box is separate luggage, not included under-seat volume.

Segway pages and dealers market seating for two. That is captured as marketed seating, separate from unknown approved seats/pillion registration. Do not adopt the Everest KYMCO template's passenger paragraph for ZEEHO.

## Warranty and servicing

ZEEHO AU pages advertise **two years, unlimited kilometres**. Ace lists a separate **two-year battery warranty** for each ZEEHO model. No AU battery-retention guarantee, cycle ceiling, courier/hire/commercial-use exclusion schedule or exact service interval was established.

Ace lists two-year vehicle and battery warranty headlines for E125S/E300SE. Current manufacturer detailed terms and kilometre limits remain unresolved. AEMC's E300SE page claims five-year unlimited-mileage battery coverage beside “zero-rated annual road tax” wording; a 2024 Scooter Central review says two years/10,000 km. These are retained conflicts, not combined into a stronger warranty.

Segway's AU embedded comparison publishes the literal cycle-life notation **800@80%SOC**. It does not label that 80% as retained state of health and does not define warranty coverage. Do not turn it into an 800-cycle/80%-capacity warranty.

ScooterShop advertises local Segway workshop servicing and diagnosis. No reliable exact Australian kilometre/month service schedule was obtained; use null rather than claims of “maintenance-free”.

## Important conflicts and rejected mappings

1. **AE8+ braking:** official generic copy says CBS, but the exact AU chassis table says Bosch dual-channel ABS. Visually checked linked PDF explicitly says AE8+ and AE8 S+ have ABS, while plain AE8 does not. Use AE8+ ABS, flag the conflicting copy, and do not add plain AE8/AE8 S+ as current AU offerings
2. **Segway power:** product-page E125S 3.5 kW and E110S 1.8 kW conflict with comparison 3.0/1.5 kW. Prefer exact product-page maxima with conflict markers; no invented running-change model year
3. **Segway mass/payload:** E300SE has 127 kg curb on model page versus 101 kg “curb” in comparison. E125S has 90 kg “net” versus 113 kg “curb”. A 280 kg figure is called both payload and maximum laden mass; dealer additionally gives 255 kg for E125S. Payload remains unknown; no arithmetic load rating
4. **E300SE range pack count:** manufacturer quotes 130 km typical and lists two packs as standard; its test footnote does not restate pack count. Ace explicitly attributes 130 km to three batteries. Preserve the conflict and do not rank it as assured base-pack road range
5. **AE4 linked PDF:** labels some dimensions/speed “European version”. Australian page independently supplies 770 mm seat, 140 mm clearance and the local 45 km/h restriction. PDF is corroboration, not AU approval
6. **Dealer templates:** all three Everest pages append unrelated petrol KYMCO specifications, three-year warranty and pillion text. Ace AE8 has a copied AE6 table; Ace AE4 sidebar voltage/seat-height differ from its detailed AU table. Use exact manufacturer/distributor specs and confine these dealers to offer or expressly marked dealer claims
7. **TeamMoto AF00041:** fresh URL redirects to a 2026 AE8 title; body says New with VIN LCETHFD11R6000272, both 2024/2026 years and a petrol engine template, but description names AE6+ at AUD5,890. Excluded as an exact-unit model/year mapping
8. **Other names:** E150S/E250S/E200P/E125/E110SE/C80 and ZEEHO AE6 L1te/SE, AE8/S+/SE/MAX, AE7 and Magnet were not established as current exact Australian new road offerings. Australian parts-fiche AE9/ZH5000DT is a lead, not a complete-vehicle offer. Kick scooters, bicycles, off-road-only and used/demo-only products remain excluded

## Evidence package and validation

- `segway-zeeho-road-scooters-evidence.json`: six identity records, 332 fact wrappers, four optional extra-battery configurations, source registry, current-offer evidence, conflict ledger and exclusions
- `segway-zeeho-road-scooters-validation.json`: 1,045 integrity/guardrail checks passed; 227 fact-level evidence references; no errors
- `segway-zeeho-sources/manifest.json`: 27 successful original captures plus one disclosed 404; every successful source has original path and SHA-256 plus extracted-text SHA-256
- Three original ZEEHO PDFs were rendered and their page-one technical tables visually inspected. Render PNGs and hashes are in each source registry entry
- Public embedded Segway comparison data and Everest product/variant JSON are saved as derived snapshots with separate hashes
- Read-only input provenance records the supplied priority JSON/MD, app market inventory and Fuso/Hyundai wrapper reference

Validation proves provenance integrity and conservative schema/selection rules. It does not assert independent homologation, battery testing, physical availability, legal advice or completed app integration.
