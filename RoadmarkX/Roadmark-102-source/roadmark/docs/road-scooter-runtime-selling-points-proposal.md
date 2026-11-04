# Runtime-bound road-scooter buyer summaries

Five exact standard Australian configurations; checked 10 October 2026. All five source-level strength/trade-off pairs and every visible limitation are unchanged. Actual-runtime and fail-closed mutation validation passed. No application files or approval registers were written.

## Binding design

- 258 original research dependencies are mapped; 113 executable runtime dependencies; 23 exact source snapshots
- 83 source-less unknown facts and 9 optional-configuration unknowns remain explicit; none acquire an invented source or absence claim
- The runtime already compares exact own Car properties. expectedIdentity.facts deliberately uses that mechanism for a complete effective-fact-map guard. Any changed, removed or added fact invalidates the pair, including previously unknown capabilities
- Standard battery identity, plus suffixes, unknown formal model year, technical epoch, stock limitations and cross-model range-test context receive exact own/related record guards
- The source reader exposes source metadata, not fetched webpage content. Runtime guards all exposed metadata; original file, extracted-text, source-object and excerpt hashes are independently checked in the reproducible scripts
- E125S peak power and E300SE curb mass remain null. The original observations stay in qualifications and research provenance
- Optional-pack totals are checked as standard count plus optional count. Optional-pack price, tested range and charge timing are not substituted from standard-pack facts

## Proposed pairs

### 1. Segway E125S | Dual 48V 30Ah battery packs
Runtime ID: `segway_e125s_au__20261010`

Strength — ABS and everyday storage: Dual-channel ABS and 27 L of under-seat storage support everyday use, with two removable batteries supplied as standard.

Trade-off — 45 km/h route limit: Its published 45 km/h maximum limits route flexibility; the 108 km typical-range figure has no established full test conditions.

Required visible conditions:
- Exact Australian E125S standard configuration: 2 removable 48 V / 30 Ah packs. Model year and running-change cutoff are unverified; colours and optional batteries are not separate model families.
- A dealer advertised this named model as new and available/in stock when checked on 10 October 2026. Physical stock, an assigned VIN, model year, delivery timing and a fresh stock-update timestamp remain unverified.
- Australian dealer road/registration statements are source claims. Queensland's government LAM Scheme list names this model (page updated 7 September 2026); that is Queensland-only evidence, not nationwide licence permission, independent ADR/RVS approval, a VIN-level RAV check or approved pillion capacity.
- Removable packs do not establish an included charger, exact Australian wall input, plug or connector compatibility. Battery voltage, charger DC output and AC wall input are different quantities; confirm the actual supplied equipment.
- Declared battery energy is not labelled gross or usable. Do not infer either or turn it into route range.
- Battery-retention and cycle warranty guarantees, courier/hire/commercial-use limits and exact service intervals have not been established. No maintenance-free or battery-life warranty claim is made.
- The 108 km figure is a manufacturer typical-range claim with no established speed/load/temperature test basis. The separate 81 km “WMTC Stage 3” comparison claim comes from a mixed 25/45 km/h table and has its own cycle/pack-count caveat; do not equate the two.
- The exact E125S product page gives 3.5 kW maximum power; the official comparison gives 3.0 kW. Keep the discrepancy visible and do not invent a model-year split.
- The product page gives 90 kg net weight while the comparison gives 113 kg curb weight. A 280 kg figure is labelled both payload and maximum laden mass; a dealer also gives 255 kg payload. These are unresolved definitions, so payload stays unknown.
- The product page quotes about 4 hours to 100% and 2.4 hours to 80%, without stating starting SOC. The comparison's 54.2 V / 20 A is charger DC output. The dealer's Type F plug table does not verify Australian supplied equipment.
- The comparison's literal “800@80%SOC” notation is not an 800-cycle/80%-retained-capacity warranty; SOC is not labelled state of health.

Guarded related configurations: none

Lead evidence:
- `segway_e125s_au__20261010.brake_system`: "dual-channel ABS + EABS, front/rear hydraulic discs"; Exact model column; shared hero ABS statement does not apply automatically to E110S
  - [Segway E110S / E125S Australian product specifications](https://au.segway.com/escooter/products/e110s-and-e125s.html) — Specs / Brake; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
- `segway_e125s_au__20261010.abs`: true; Dual-channel ABS
  - [Segway E110S / E125S Australian product specifications](https://au.segway.com/escooter/products/e110s-and-e125s.html) — Specs / Brake; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
- `segway_e125s_au__20261010.under_seat_storage_l`: 27; Compartment litres, not top-box capacity
  - [Segway E110S / E125S Australian product specifications](https://au.segway.com/escooter/products/e110s-and-e125s.html) — Specs / Space under Seat; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
- `segway_e125s_au__20261010.battery_pack_count_included`: 2; Standard manufacturer listed pack count
  - [Segway E110S / E125S Australian product specifications](https://au.segway.com/escooter/products/e110s-and-e125s.html) — Specs / Battery; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
  - [Ace Scooters Segway E125S NEW listing](https://acescooters.com.au/listings/segway-ninebot-e125s/) — BATTERY / Number of batteries included; SHA-256 `3136e7dcbc5369c6bde09742f6cf3f2149b51e3d9b84821d5483cd09951e4cdc`
- `segway_e125s_au__20261010.battery_removable`: true; Dual removable battery statement
  - [Segway E110S / E125S Australian product specifications](https://au.segway.com/escooter/products/e110s-and-e125s.html) — Infinite Possibilities Start Here; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
- `segway_e125s_au__20261010.maximum_speed_kmh`: 45; Australian product-page specification
  - [Segway E110S / E125S Australian product specifications](https://au.segway.com/escooter/products/e110s-and-e125s.html) — Specs / Max. Speed; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
- `segway_e125s_au__20261010.range_km`: 108; Manufacturer typical range; not a guaranteed journey range
  - [Segway E110S / E125S Australian product specifications](https://au.segway.com/escooter/products/e110s-and-e125s.html) — Specs / Typical range; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`

### 2. Segway E300SE | Dual 74V 27Ah battery packs
Runtime ID: `segway_e300se_au__20261010`

Strength — ABS, traction control and storage: Dual-channel ABS, traction control and 34 L of under-seat storage equip the standard two-pack version for everyday riding.

Trade-off — Extra battery uses luggage space: The optional third pack reduces under-seat storage from 34 L to 17 L; the 130 km claim has unresolved battery-count attribution.

Required visible conditions:
- Exact Australian E300SE standard configuration: 2 removable 74 V / 27 Ah packs. Model year and running-change cutoff are unverified; colours and optional batteries are not separate model families.
- A dealer advertised this named model as new and available/in stock when checked on 10 October 2026. Physical stock, an assigned VIN, model year, delivery timing and a fresh stock-update timestamp remain unverified.
- Australian dealer road/registration statements are source claims. Queensland's government LAM Scheme list names this model (page updated 7 September 2026); that is Queensland-only evidence, not nationwide licence permission, independent ADR/RVS approval, a VIN-level RAV check or approved pillion capacity.
- Removable packs do not establish an included charger, exact Australian wall input, plug or connector compatibility. Battery voltage, charger DC output and AC wall input are different quantities; confirm the actual supplied equipment.
- Declared battery energy is not labelled gross or usable. Do not infer either or turn it into route range.
- Battery-retention and cycle warranty guarantees, courier/hire/commercial-use limits and exact service intervals have not been established. No maintenance-free or battery-life warranty claim is made.
- Two packs are standard and a third is optional. The optional pack reduces the stated 34 L compartment to 17 L; extra-pack price, exact tested range and charging arrangement/time remain unverified.
- The 130 km typical test uses 45 km/h, 75 kg, 25°C, wind ≤3 m/s and a paved road until depletion. The manufacturer lists two packs as standard but does not repeat test pack count; Ace attributes 130 km to three packs. The separate 85 km WMTC Stage 3 claim is not equivalent.
- The model page lists 127 kg curb weight and the comparison lists 101 kg curb weight; neither is silently relabelled battery-excluded. The conflicting payload/laden-mass labels leave payload unknown.
- The model page quotes about 5.5 hours to 100% and 4.5 hours to 80%, without starting SOC. The comparison says about 5 hours for two packs. Its 84 V / 12 A is DC output; the dealer's Type F/AC-input table does not establish the Australian supplied charger.
- Dealer warranty headlines conflict: Ace says two years; AEMC says five-year unlimited-mileage battery coverage beside overseas-style road-tax wording; a 2024 Scooter Central article says two years/10,000 km. Current complete Australian manufacturer terms remain unresolved.
- The comparison's literal “800@80%SOC” notation is not an 800-cycle/80%-retained-capacity warranty; SOC is not labelled state of health.

Guarded related configurations: none

Lead evidence:
- `segway_e300se_au__20261010.brake_system`: "dual-channel ABS, front/rear hydraulic discs"; Exact model column; shared hero ABS statement does not apply automatically to E110S
  - [Segway E300SE Australian product specifications](https://au.segway.com/escooter/products/e300se.html) — Specs / Brake; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
- `segway_e300se_au__20261010.abs`: true; Dual-channel ABS
  - [Segway E300SE Australian product specifications](https://au.segway.com/escooter/products/e300se.html) — Specs / Brake; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
- `segway_e300se_au__20261010.traction_control`: true; Traction Control System
  - [Segway E300SE Australian product specifications](https://au.segway.com/escooter/products/e300se.html) — Segway Smart TCS; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
- `segway_e300se_au__20261010.under_seat_storage_l`: 34; Compartment litres, not top-box capacity
  - [Segway E300SE Australian product specifications](https://au.segway.com/escooter/products/e300se.html) — Specs / Space under Seat; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
- `segway_e300se_au__20261010.battery_pack_count_included`: 2; Standard manufacturer listed pack count
  - [Segway E300SE Australian product specifications](https://au.segway.com/escooter/products/e300se.html) — Specs / Battery capacity; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
  - [Ace Scooters Segway E300SE NEW listing](https://acescooters.com.au/listings/segway-ninebot-e300se/) — BATTERY / Number of batteries; SHA-256 `8ee80be441937c6582697b209f63dc376ef45d3ac34668d0195c4c6e1852dafe`
- `segway_e300se_au__20261010.battery_optional_additional_packs`: 1; Optional extra; not part of standard vehicle
  - [Segway E300SE Australian product specifications](https://au.segway.com/escooter/products/e300se.html) — Specs / Battery capacity; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
- `segway_e300se_au__20261010.under_seat_storage_optional_pack_l`: 17; None
  - [Segway E300SE Australian product specifications](https://au.segway.com/escooter/products/e300se.html) — Storage Space / Remaining after 3rd additional battery; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
- `segway_e300se_au__20261010.range_km`: 130; Manufacturer typical range; not a guaranteed journey range
  - [Segway E300SE Australian product specifications](https://au.segway.com/escooter/products/e300se.html) — Specs / Typical range; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`

### 3. ZEEHO AE4 | Single 74V 27Ah battery
Runtime ID: `zeeho_ae4_au__20261010`

Strength — Removable battery and storage: The single-pack AE4 pairs a removable battery with a published 31 L under-seat compartment for everyday luggage.

Trade-off — 45 km/h and CBS braking: The Australian model is capped at 45 km/h and uses CBS rather than ABS; check these specifications against your intended route.

Required visible conditions:
- Exact Australian AE4 standard configuration: 1 removable 74 V / 27 Ah pack. Model year and running-change cutoff are unverified; colours and optional batteries are not separate model families.
- A dealer advertised this named model as new and available/in stock when checked on 10 October 2026. Physical stock, an assigned VIN, model year, delivery timing and a fresh stock-update timestamp remain unverified.
- The Australian distributor's ride-away offer includes registration and describes the 45 km/h restriction for moped-approved QLD/WA states. These are scoped source claims, not nationwide rider-licence permission, independent ADR/RVS approval, a VIN-level RAV check or approved pillion capacity.
- Removable packs do not establish an included charger, exact Australian wall input, plug or connector compatibility. Battery voltage, charger DC output and AC wall input are different quantities; confirm the actual supplied equipment.
- Australian sources publish pack V/Ah without a declared total kWh. V × Ah arithmetic is not manufacturer-declared, gross or usable energy, and does not establish route range.
- Battery-retention and cycle warranty guarantees, courier/hire/commercial-use limits and exact service intervals have not been established. No maintenance-free or battery-life warranty claim is made.
- One 74 V / 27 Ah pack is standard; a second is optional. Exact optional-pack range, charging arrangement/time and price are unverified, and the effect on the published 31 L compartment is not stated.
- The 63 km range is a manufacturer WMTC claim at 75 kg rider mass and 25°C; the WMTC version/subcycle is unspecified. It is not equivalent to the AE6+ constant-20-km/h result or a guaranteed trip distance.
- The quoted 4-hour 20–80% and 7.5-hour 0–100% times reference a 350 W charger. AC input versus DC output and pack charging arrangement are unspecified; no timing is carried across to the optional second pack.
- The linked PDF labels seat height, clearance and speed as European-version data. The Australian webpage independently states the 45 km/h restriction; use the PDF's explicit CBS row as corroboration, not as Australian approval.
- Everest's appended petrol KYMCO specifications, three-year warranty and pillion text are excluded. Ace's conflicting sidebar dimensions/voltage are excluded. Dealer evidence here establishes only the scoped advertised offer or clearly identified dealer claim.
- Everest calls its grey colour Matt Silver Crystal while the distributor calls it Velocity Grey; keep those seller and manufacturer strings separate.

Guarded related configurations: zeeho_ae6_plus_au__20261010

Lead evidence:
- `zeeho_ae4_au__20261010.battery_pack_count_included`: 1; Standard Australian configuration
  - [ZEEHO AE4 Australian distributor product page](https://www.cfmoto.com.au/model/ae4) — LONGER RANGE / Battery; SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
- `zeeho_ae4_au__20261010.battery_removable`: true; Both packs removable where two supplied
  - [ZEEHO AE4 Australian distributor product page](https://www.cfmoto.com.au/model/ae4) — LONGER RANGE; SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
- `zeeho_ae4_au__20261010.under_seat_storage_l`: 31; Under-seat compartment; optional-battery effect not stated
  - [ZEEHO AE4 Australian distributor product page](https://www.cfmoto.com.au/model/ae4) — URBAN MOBILITY; SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
- `zeeho_ae4_au__20261010.maximum_speed_kmh`: 45; Restricted 45 km/h Australian offering
  - [ZEEHO AE4 Australian distributor product page](https://www.cfmoto.com.au/model/ae4) — SPECIFICATIONS / Motor & Performance / Max Speed; SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
- `zeeho_ae4_au__20261010.brake_system`: "CBS with front/rear hydraulic disc brakes"; CBS is not ABS
  - [ZEEHO AE4 Australian distributor product page](https://www.cfmoto.com.au/model/ae4) — DESIGN, SAFETY & COMFORT / Combined braking system; SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
  - [ZEEHO AE4 Australian-linked specification PDF — exact version and footnotes apply](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37742/8271cf9d-df4f-428d-bd01-19c61198793c.pdf) — PDF p1; MOTOR & PERFORMANCE / ABS/CBS; SHA-256 `276c3a4ab04cb8487e4170cf58b4b1b060ef79e5826a418bfbf6a6708498d6c1`
- `zeeho_ae4_au__20261010.abs`: false; Linked PDF explicitly selects ABS/CBS: CBS
  - [ZEEHO AE4 Australian distributor product page](https://www.cfmoto.com.au/model/ae4) — DESIGN, SAFETY & COMFORT / Combined braking system; SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
  - [ZEEHO AE4 Australian-linked specification PDF — exact version and footnotes apply](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37742/8271cf9d-df4f-428d-bd01-19c61198793c.pdf) — PDF p1; MOTOR & PERFORMANCE / ABS/CBS; SHA-256 `276c3a4ab04cb8487e4170cf58b4b1b060ef79e5826a418bfbf6a6708498d6c1`

### 4. ZEEHO AE6+ | Single 69V 27Ah battery
Runtime ID: `zeeho_ae6_plus_au__20261010`

Strength — Removable battery and timed recharge: A removable battery is standard, and the published 20–80% recharge is two hours with a referenced 750 W charger.

Trade-off — Range tested at 20 km/h: Its 100 km maximum was measured at 20 km/h with a 75 kg rider at 25°C, so it is not a faster-road range prediction.

Required visible conditions:
- Exact Australian AE6+ standard configuration: 1 removable 69 V / 27 Ah pack. Model year and running-change cutoff are unverified; colours and optional batteries are not separate model families.
- A dealer advertised this named model as new and available/in stock when checked on 10 October 2026. Physical stock, an assigned VIN, model year, delivery timing and a fresh stock-update timestamp remain unverified.
- The Australian distributor's ride-away offer includes registration. Ace's R-E licence statement is a WA dealer claim only. Neither establishes nationwide rider-licence permission, independent ADR/RVS approval, a VIN-level RAV check or approved pillion capacity.
- Removable packs do not establish an included charger, exact Australian wall input, plug or connector compatibility. Battery voltage, charger DC output and AC wall input are different quantities; confirm the actual supplied equipment.
- Australian sources publish pack V/Ah without a declared total kWh. V × Ah arithmetic is not manufacturer-declared, gross or usable energy, and does not establish route range.
- Battery-retention and cycle warranty guarantees, courier/hire/commercial-use limits and exact service intervals have not been established. No maintenance-free or battery-life warranty claim is made.
- One 69 V / 27 Ah pack is standard and a second is optional. The range-test footnote does not repeat battery count; no doubling of range or carry-over of charge time is justified. Extra-pack tested range, charging arrangement/time and price are unverified.
- The 100 km maximum is a constant-20-km/h claim, with a 75 kg rider at 25°C. It is not WMTC/WLTP or evidence of road range at the advertised 80 km/h maximum; the speed-plus footnote has separate temperature and SOC conditions.
- The quoted 2-hour 20–80% and 3.5-hour 0–100% times use a referenced 750 W charger. Included charger count, AC input/DC output meaning, exact Australian plug/connector and pack charging arrangement are not established; optional-pack timings remain unknown.
- The exact Australian source and linked PDF specify CBS, not ABS. An Australian under-seat storage litre figure has not been established.
- Everest's appended petrol KYMCO specifications, three-year warranty and pillion text are excluded. The linked generic-title AE6 PDF is corroboration for the exact Australian AE6+ webpage, not authority to create extra AU variants.

Guarded related configurations: none

Lead evidence:
- `zeeho_ae6_plus_au__20261010.battery_pack_count_included`: 1; Standard Australian configuration
  - [ZEEHO AE6+ Australian distributor product page](https://www.cfmoto.com.au/model/ae6) — LONGER RANGE / Battery; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
- `zeeho_ae6_plus_au__20261010.battery_removable`: true; Both packs removable where two supplied
  - [ZEEHO AE6+ Australian distributor product page](https://www.cfmoto.com.au/model/ae6) — LONGER RANGE; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
- `zeeho_ae6_plus_au__20261010.charge_time_20_80_hours`: 2; With 750 W charger
  - [ZEEHO AE6+ Australian distributor product page](https://www.cfmoto.com.au/model/ae6) — SPECIFICATIONS / Motor & Performance / Charge Time (20–80%); SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
- `zeeho_ae6_plus_au__20261010.charger_power_referenced`: 750; Charger wattage associated with published charge times; AC input versus DC output not defined
  - [ZEEHO AE6+ Australian distributor product page](https://www.cfmoto.com.au/model/ae6) — SPECIFICATIONS / Motor & Performance / Charge Time; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
- `zeeho_ae6_plus_au__20261010.range_km`: 100; Constant-speed manufacturer maximum
  - [ZEEHO AE6+ Australian distributor product page](https://www.cfmoto.com.au/model/ae6) — Price / performance footnotes / Max range; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
- `zeeho_ae6_plus_au__20261010.range_test_method`: "constant speed 20 km/h"; None
  - [ZEEHO AE6+ Australian distributor product page](https://www.cfmoto.com.au/model/ae6) — Price / performance footnotes / Range caveat; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
- `zeeho_ae6_plus_au__20261010.range_test_speed`: 20; None
  - [ZEEHO AE6+ Australian distributor product page](https://www.cfmoto.com.au/model/ae6) — Price / performance footnotes / Range caveat; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
- `zeeho_ae6_plus_au__20261010.range_test_rider_mass`: 75; None
  - [ZEEHO AE6+ Australian distributor product page](https://www.cfmoto.com.au/model/ae6) — Price / performance footnotes / Range caveat; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
- `zeeho_ae6_plus_au__20261010.range_test_ambient_temperature`: 25; None
  - [ZEEHO AE6+ Australian distributor product page](https://www.cfmoto.com.au/model/ae6) — Price / performance footnotes / Range caveat; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`

### 5. ZEEHO AE8+ | Dual 69V 27Ah battery packs
Runtime ID: `zeeho_ae8_plus_au__20261010`

Strength — Dual removable batteries and ABS: Two removable 69 V / 27 Ah batteries and Bosch dual-channel ABS are standard in the exact Australian AE8+ specification.

Trade-off — Allow time for a full recharge: The published 0–100% recharge is 4.5 hours with a referenced 750 W charger; confirm the supplied charger and two-pack charging arrangement.

Required visible conditions:
- Exact Australian AE8+ standard configuration: 2 removable 69 V / 27 Ah packs. Model year and running-change cutoff are unverified; colours and optional batteries are not separate model families.
- A dealer advertised this named model as new and available/in stock when checked on 10 October 2026. Physical stock, an assigned VIN, model year, delivery timing and a fresh stock-update timestamp remain unverified.
- The Australian distributor's ride-away offer includes registration. Ace's R-E licence statement is a WA dealer claim only. Neither establishes nationwide rider-licence permission, independent ADR/RVS approval, a VIN-level RAV check or approved pillion capacity.
- Removable packs do not establish an included charger, exact Australian wall input, plug or connector compatibility. Battery voltage, charger DC output and AC wall input are different quantities; confirm the actual supplied equipment.
- Australian sources publish pack V/Ah without a declared total kWh. V × Ah arithmetic is not manufacturer-declared, gross or usable energy, and does not establish route range.
- Battery-retention and cycle warranty guarantees, courier/hire/commercial-use limits and exact service intervals have not been established. No maintenance-free or battery-life warranty claim is made.
- The exact Australian chassis table specifies Bosch dual-channel ABS. The visually checked PDF explicitly gives ABS to AE8+ and AE8 S+, while plain AE8 has no ABS. A generic CBS paragraph on the webpage conflicts and is not applied to AE8+; other variants are not promoted as current AU offerings.
- Two removable packs are standard. The 100 km range is a manufacturer WMTC claim at 75 kg rider mass and 25°C; version/subcycle is unspecified. It is not equivalent to AE6+'s 20-km/h result or a guaranteed trip distance.
- The published 3-hour 20–80% and 4.5-hour 0–100% times reference a 750 W charger. Charger count/inclusion, AC input/DC output meaning, exact Australian plug/connector and whether both packs charge together are not established.
- A reliable Australian under-seat storage litre value has not been established; no luggage-volume claim is inferred from photographs or a separate top box.
- Everest's petrol KYMCO specifications, three-year warranty and pillion text are excluded. Ace's copied AE6 table is not used as AE8+ specification evidence.

Guarded related configurations: zeeho_ae6_plus_au__20261010

Lead evidence:
- `zeeho_ae8_plus_au__20261010.battery_pack_count_included`: 2; Standard Australian configuration
  - [ZEEHO AE8+ Australian distributor product page](https://www.cfmoto.com.au/model/ae8) — DUAL BATTERY / Battery; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
- `zeeho_ae8_plus_au__20261010.battery_removable`: true; Both packs removable where two supplied
  - [ZEEHO AE8+ Australian distributor product page](https://www.cfmoto.com.au/model/ae8) — DUAL BATTERY; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
- `zeeho_ae8_plus_au__20261010.battery_voltage_declared`: 69; Pack voltage as published; not wall supply voltage
  - [ZEEHO AE8+ Australian distributor product page](https://www.cfmoto.com.au/model/ae8) — SPECIFICATIONS / Motor & Performance / Capacity; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
- `zeeho_ae8_plus_au__20261010.battery_amp_hours_per_pack`: 27; None
  - [ZEEHO AE8+ Australian distributor product page](https://www.cfmoto.com.au/model/ae8) — SPECIFICATIONS / Motor & Performance / Capacity; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
- `zeeho_ae8_plus_au__20261010.brake_system`: "Bosch dual-channel ABS"; Exact AE8+ row preferred over conflicting generic CBS paragraph
  - [ZEEHO AE8+ Australian distributor product page](https://www.cfmoto.com.au/model/ae8) — SPECIFICATIONS / Chassis / ABS; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
  - [ZEEHO AE8+ Australian-linked specification PDF — exact version and footnotes apply](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37740/db7d0f5d-3c43-40e6-99b9-03c738482f02.pdf) — PDF p1; MOTOR & PERFORMANCE / ABS/CBS; SHA-256 `031aeaae4cf5e4587957d958a8a167bd21ed49b0ab0f041bdf5cc2b5f53ef92b`
- `zeeho_ae8_plus_au__20261010.abs`: true; Linked PDF explicitly selects ABS/CBS: AE8+ equipped with ABS
  - [ZEEHO AE8+ Australian distributor product page](https://www.cfmoto.com.au/model/ae8) — SPECIFICATIONS / Chassis / ABS; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
  - [ZEEHO AE8+ Australian-linked specification PDF — exact version and footnotes apply](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37740/db7d0f5d-3c43-40e6-99b9-03c738482f02.pdf) — PDF p1; MOTOR & PERFORMANCE / ABS/CBS; SHA-256 `031aeaae4cf5e4587957d958a8a167bd21ed49b0ab0f041bdf5cc2b5f53ef92b`
- `zeeho_ae8_plus_au__20261010.charge_time_0_100_hours`: 4.5; With 750 W charger
  - [ZEEHO AE8+ Australian distributor product page](https://www.cfmoto.com.au/model/ae8) — SPECIFICATIONS / Motor & Performance / Charge Time (0–100%); SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
- `zeeho_ae8_plus_au__20261010.charger_power_referenced`: 750; Charger wattage associated with published charge times; AC input versus DC output not defined
  - [ZEEHO AE8+ Australian distributor product page](https://www.cfmoto.com.au/model/ae8) — SPECIFICATIONS / Motor & Performance / Charge Time; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`

## Reproduce

1. From `roadmark-work/roadmark`, run `node --import tsx ../../roadmark-research/capture_road_scooter_runtime_snapshot.cjs`
2. Run `python roadmark-research/bind_road_scooter_selling_points.py` from the workspace
3. From `roadmark-work/roadmark`, run `node --import tsx ../../roadmark-research/validate_road_scooter_selling_points.cjs`
4. Inspect `road-scooter-runtime-selling-points-validation.json` and its per-mutation evidence

The original source proposal and evidence files remain unchanged. The JSON retains all source-level dependencies, conflicts, visual-review records, locators and hashes. No E110S buyer pair, new colour family or extra optional-battery runtime record is proposed.

## Validation status

Passed: 6090 checks, including 5778 mutation checks. All five complete pairs render through the actual summary builders. In-memory merge adds five summaries (246 → 251) without changing any unrelated summary, dependency or source snapshot. The unused E110S 404 and TeamMoto conflict source cannot support or suppress these pairs. No application files were written.
