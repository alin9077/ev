# Road scooter strengths and trade offs

Source-level proposal checked 10 October 2026 for five exact standard Australian configurations. Each has one concise buyer strength and one trade-off. E110S stays held and has no proposed buyer pair. Runtime application IDs and effective-snapshot binding remain pending. No application data was changed.

## Proposed buyer copy

### Segway E125S | Dual 48V 30Ah battery packs

**Strength — ABS and everyday storage:** Dual-channel ABS and 27 L of under-seat storage support everyday use, with two removable batteries supplied as standard.

**Trade-off — 45 km/h route limit:** Its published 45 km/h maximum limits route flexibility; the 108 km typical-range figure has no established full test conditions.

Source record: `segway-e125s-au`. Verified source snapshot date: 2026-10-10. Application variant ID: unbound.

**Required visible limitations**

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

**Clause evidence**

- Strength: `source_fact:segway-e125s-au:brakeSystem`, `source_fact:segway-e125s-au:abs`, `source_fact:segway-e125s-au:underSeatStorage`, `source_fact:segway-e125s-au:batteryPackCountIncluded`, `source_fact:segway-e125s-au:batteryRemovable`
  - [segway_e125s_au](https://au.segway.com/escooter/products/e110s-and-e125s.html): Specs / Brake; checked 2026-10-10; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
  - [segway_e125s_au](https://au.segway.com/escooter/products/e110s-and-e125s.html): Specs / Space under Seat; checked 2026-10-10; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
  - [segway_e125s_au](https://au.segway.com/escooter/products/e110s-and-e125s.html): Specs / Battery; checked 2026-10-10; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
  - [ace_e125s](https://acescooters.com.au/listings/segway-ninebot-e125s/): BATTERY / Number of batteries included; checked 2026-10-10; SHA-256 `3136e7dcbc5369c6bde09742f6cf3f2149b51e3d9b84821d5483cd09951e4cdc`
  - [segway_e125s_au](https://au.segway.com/escooter/products/e110s-and-e125s.html): Infinite Possibilities Start Here; checked 2026-10-10; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
- Tradeoff: `source_fact:segway-e125s-au:maxSpeedDeclared`, `source_fact:segway-e125s-au:rangeClaim`
  - Required context: `source_fact:segway-e125s-au:rangeTestMethod`, `source_fact:segway-e125s-au:rangeTestSpeed`, `source_fact:segway-e125s-au:rangeTestRiderMass`, `source_fact:segway-e125s-au:rangeTestAmbientTemperature`
  - [segway_e125s_au](https://au.segway.com/escooter/products/e110s-and-e125s.html): Specs / Max. Speed; checked 2026-10-10; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
  - [segway_e125s_au](https://au.segway.com/escooter/products/e110s-and-e125s.html): Specs / Typical range; checked 2026-10-10; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
  - [segway_e125s_au](https://au.segway.com/escooter/products/e110s-and-e125s.html): Specs / E125S Typical Range 108 km; no visible full test basis attached. Separate WMTC criteria occur only inside an HTML comment and are not attributed to this claim.; checked 2026-10-10; SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`

### Segway E300SE | Dual 74V 27Ah battery packs

**Strength — ABS, traction control and storage:** Dual-channel ABS, traction control and 34 L of under-seat storage equip the standard two-pack version for everyday riding.

**Trade-off — Extra battery uses luggage space:** The optional third pack reduces under-seat storage from 34 L to 17 L; the 130 km claim has unresolved battery-count attribution.

Source record: `segway-e300se-au`. Verified source snapshot date: 2026-10-10. Application variant ID: unbound.

**Required visible limitations**

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

**Clause evidence**

- Strength: `source_fact:segway-e300se-au:brakeSystem`, `source_fact:segway-e300se-au:abs`, `source_fact:segway-e300se-au:tractionControl`, `source_fact:segway-e300se-au:underSeatStorage`, `source_fact:segway-e300se-au:batteryPackCountIncluded`
  - [segway_e300se_au](https://au.segway.com/escooter/products/e300se.html): Specs / Brake; checked 2026-10-10; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
  - [segway_e300se_au](https://au.segway.com/escooter/products/e300se.html): Segway Smart TCS; checked 2026-10-10; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
  - [segway_e300se_au](https://au.segway.com/escooter/products/e300se.html): Specs / Space under Seat; checked 2026-10-10; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
  - [segway_e300se_au](https://au.segway.com/escooter/products/e300se.html): Specs / Battery capacity; checked 2026-10-10; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
  - [ace_e300se](https://acescooters.com.au/listings/segway-ninebot-e300se/): BATTERY / Number of batteries; checked 2026-10-10; SHA-256 `8ee80be441937c6582697b209f63dc376ef45d3ac34668d0195c4c6e1852dafe`
- Tradeoff: `source_fact:segway-e300se-au:batteryPackCountIncluded`, `source_fact:segway-e300se-au:batteryOptionalAdditionalPacks`, `source_fact:segway-e300se-au:underSeatStorage`, `source_fact:segway-e300se-au:underSeatStorageWithOptionalPack`, `source_fact:segway-e300se-au:rangeClaim`
  - Required context: `source_conflict:segway-e300se-au:e300se-range-pack-count`
  - [segway_e300se_au](https://au.segway.com/escooter/products/e300se.html): Specs / Battery capacity; checked 2026-10-10; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
  - [ace_e300se](https://acescooters.com.au/listings/segway-ninebot-e300se/): BATTERY / Number of batteries; checked 2026-10-10; SHA-256 `8ee80be441937c6582697b209f63dc376ef45d3ac34668d0195c4c6e1852dafe`
  - [segway_e300se_au](https://au.segway.com/escooter/products/e300se.html): Specs / Space under Seat; checked 2026-10-10; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
  - [segway_e300se_au](https://au.segway.com/escooter/products/e300se.html): Storage Space / Remaining after 3rd additional battery; checked 2026-10-10; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
  - [segway_e300se_au](https://au.segway.com/escooter/products/e300se.html): Specs / Typical range; checked 2026-10-10; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
  - [segway_e300se_au](https://au.segway.com/escooter/products/e300se.html): Specs / typical range footnote; checked 2026-10-10; SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
  - [ace_e300se](https://acescooters.com.au/listings/segway-ninebot-e300se/): MAX RANGE; checked 2026-10-10; SHA-256 `8ee80be441937c6582697b209f63dc376ef45d3ac34668d0195c4c6e1852dafe`

### ZEEHO AE4 | Single 74V 27Ah battery

**Strength — Removable battery and storage:** The single-pack AE4 pairs a removable battery with a published 31 L under-seat compartment for everyday luggage.

**Trade-off — 45 km/h and CBS braking:** The Australian model is capped at 45 km/h and uses CBS rather than ABS; check these specifications against your intended route.

Source record: `zeeho-ae4-au`. Verified source snapshot date: 2026-10-10. Application variant ID: unbound.

**Required visible limitations**

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

**Clause evidence**

- Strength: `source_fact:zeeho-ae4-au:batteryPackCountIncluded`, `source_fact:zeeho-ae4-au:batteryRemovable`, `source_fact:zeeho-ae4-au:underSeatStorage`
  - [zeeho_ae4_au](https://www.cfmoto.com.au/model/ae4): LONGER RANGE / Battery; checked 2026-10-10; SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
  - [zeeho_ae4_au](https://www.cfmoto.com.au/model/ae4): LONGER RANGE; checked 2026-10-10; SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
  - [zeeho_ae4_au](https://www.cfmoto.com.au/model/ae4): URBAN MOBILITY; checked 2026-10-10; SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
- Tradeoff: `source_fact:zeeho-ae4-au:maxSpeedDeclared`, `source_fact:zeeho-ae4-au:brakeSystem`, `source_fact:zeeho-ae4-au:abs`
  - [zeeho_ae4_au](https://www.cfmoto.com.au/model/ae4): SPECIFICATIONS / Motor & Performance / Max Speed; checked 2026-10-10; SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
  - [zeeho_ae4_au](https://www.cfmoto.com.au/model/ae4): DESIGN, SAFETY & COMFORT / Combined braking system; checked 2026-10-10; SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
  - [zeeho_ae4_pdf](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37742/8271cf9d-df4f-428d-bd01-19c61198793c.pdf): MOTOR & PERFORMANCE / ABS/CBS; PDF page 1; checked 2026-10-10; SHA-256 `276c3a4ab04cb8487e4170cf58b4b1b060ef79e5826a418bfbf6a6708498d6c1`

### ZEEHO AE6+ | Single 69V 27Ah battery

**Strength — Removable battery and timed recharge:** A removable battery is standard, and the published 20–80% recharge is two hours with a referenced 750 W charger.

**Trade-off — Range tested at 20 km/h:** Its 100 km maximum was measured at 20 km/h with a 75 kg rider at 25°C, so it is not a faster-road range prediction.

Source record: `zeeho-ae6-plus-au`. Verified source snapshot date: 2026-10-10. Application variant ID: unbound.

**Required visible limitations**

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

**Clause evidence**

- Strength: `source_fact:zeeho-ae6-plus-au:batteryPackCountIncluded`, `source_fact:zeeho-ae6-plus-au:batteryRemovable`, `source_fact:zeeho-ae6-plus-au:chargeTime20to80`, `source_fact:zeeho-ae6-plus-au:chargerPowerReferenced`
  - Required context: `source_fact:zeeho-ae6-plus-au:chargerIncludedCount`, `source_fact:zeeho-ae6-plus-au:chargerWallInputVoltage`, `source_fact:zeeho-ae6-plus-au:chargerWallInputPower`, `source_fact:zeeho-ae6-plus-au:chargerConnector`
  - [zeeho_ae6_au](https://www.cfmoto.com.au/model/ae6): LONGER RANGE / Battery; checked 2026-10-10; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
  - [zeeho_ae6_au](https://www.cfmoto.com.au/model/ae6): LONGER RANGE; checked 2026-10-10; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
  - [zeeho_ae6_au](https://www.cfmoto.com.au/model/ae6): SPECIFICATIONS / Motor & Performance / Charge Time (20–80%); checked 2026-10-10; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
  - [zeeho_ae6_au](https://www.cfmoto.com.au/model/ae6): SPECIFICATIONS / Motor & Performance / Charge Time; checked 2026-10-10; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
- Tradeoff: `source_fact:zeeho-ae6-plus-au:rangeClaim`, `source_fact:zeeho-ae6-plus-au:rangeTestMethod`, `source_fact:zeeho-ae6-plus-au:rangeTestSpeed`, `source_fact:zeeho-ae6-plus-au:rangeTestRiderMass`, `source_fact:zeeho-ae6-plus-au:rangeTestAmbientTemperature`
  - [zeeho_ae6_au](https://www.cfmoto.com.au/model/ae6): Price / performance footnotes / Max range; checked 2026-10-10; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
  - [zeeho_ae6_au](https://www.cfmoto.com.au/model/ae6): Price / performance footnotes / Range caveat; checked 2026-10-10; SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`

### ZEEHO AE8+ | Dual 69V 27Ah battery packs

**Strength — Dual removable batteries and ABS:** Two removable 69 V / 27 Ah batteries and Bosch dual-channel ABS are standard in the exact Australian AE8+ specification.

**Trade-off — Allow time for a full recharge:** The published 0–100% recharge is 4.5 hours with a referenced 750 W charger; confirm the supplied charger and two-pack charging arrangement.

Source record: `zeeho-ae8-plus-au`. Verified source snapshot date: 2026-10-10. Application variant ID: unbound.

**Required visible limitations**

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

**Clause evidence**

- Strength: `source_fact:zeeho-ae8-plus-au:batteryPackCountIncluded`, `source_fact:zeeho-ae8-plus-au:batteryRemovable`, `source_fact:zeeho-ae8-plus-au:batteryVoltageDeclared`, `source_fact:zeeho-ae8-plus-au:batteryAmpHoursPerPack`, `source_fact:zeeho-ae8-plus-au:brakeSystem`, `source_fact:zeeho-ae8-plus-au:abs`
  - Required context: `source_conflict:zeeho-ae8-plus-au:ae8-brakes`
  - [zeeho_ae8_au](https://www.cfmoto.com.au/model/ae8): DUAL BATTERY / Battery; checked 2026-10-10; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
  - [zeeho_ae8_au](https://www.cfmoto.com.au/model/ae8): DUAL BATTERY; checked 2026-10-10; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
  - [zeeho_ae8_au](https://www.cfmoto.com.au/model/ae8): SPECIFICATIONS / Motor & Performance / Capacity; checked 2026-10-10; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
  - [zeeho_ae8_au](https://www.cfmoto.com.au/model/ae8): SPECIFICATIONS / Chassis / ABS; checked 2026-10-10; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
  - [zeeho_ae8_pdf](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37740/db7d0f5d-3c43-40e6-99b9-03c738482f02.pdf): MOTOR & PERFORMANCE / ABS/CBS; PDF page 1; checked 2026-10-10; SHA-256 `031aeaae4cf5e4587957d958a8a167bd21ed49b0ab0f041bdf5cc2b5f53ef92b`
  - [zeeho_ae8_au](https://www.cfmoto.com.au/model/ae8): DESIGN & SAFETY / SPECIFICATIONS Chassis / ABS; checked 2026-10-10; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
- Tradeoff: `source_fact:zeeho-ae8-plus-au:chargeTime0to100`, `source_fact:zeeho-ae8-plus-au:chargerPowerReferenced`, `source_fact:zeeho-ae8-plus-au:batteryPackCountIncluded`
  - Required context: `source_fact:zeeho-ae8-plus-au:chargerIncludedCount`, `source_fact:zeeho-ae8-plus-au:chargerWallInputVoltage`, `source_fact:zeeho-ae8-plus-au:chargerWallInputPower`, `source_fact:zeeho-ae8-plus-au:chargerConnector`
  - [zeeho_ae8_au](https://www.cfmoto.com.au/model/ae8): SPECIFICATIONS / Motor & Performance / Charge Time (0–100%); checked 2026-10-10; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
  - [zeeho_ae8_au](https://www.cfmoto.com.au/model/ae8): SPECIFICATIONS / Motor & Performance / Charge Time; checked 2026-10-10; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
  - [zeeho_ae8_au](https://www.cfmoto.com.au/model/ae8): DUAL BATTERY / Battery; checked 2026-10-10; SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`

## Scope and binding gates

1. This is source-level data. Do not feed sourceRecordId/research trimId values into runtime summaries or assume they equal application IDs. Obtain actual final integrated IDs and the effective snapshot first.
2. Bind the final effective fact/feature objects, including value, unit, status, basis, conditions, source IDs/dates/conflicts, exact plus suffix, standard pack count, model-year unknown and technical epoch. Preserve original source hashes and locators.
3. Bind every proposition in each clause and every visibleConditionBindings dependency, including cross-model range-method context. Null unknowns and unresolved conflicts are required limitations, not absent features.
4. Keep source-claimed road offering separate from approval certificates/VIN registration, and preserve Queensland-only LAMS or QLD/WA/WA-dealer licence scope. No registration/licence ranking follows from source availability.
5. Keep advertised new offers separate from physically verified stock/VIN, stock-update time and model year. Do not alias colour strings or infer delivery availability.
6. Use separate motorcycle/moped comparison groups. Never rank these records with passenger cars, vans or trucks, or mix typical/constant-speed/WMTC range methods into a market-leading claim.
7. If a factual assertion or any required qualifier loses its exact identity/source support or changes, fail closed for that clause. Do not satisfy guards by relabelling unknown, conflicted or overseas values as verified.
8. After binding, mutation-test values, source ID/date/access/hash/conflict, battery count, model suffix/epoch, optional configuration, range method/conditions, licence jurisdiction, stock status and each context dependency. Verify exactly one supported strength and trade-off per record and no E110S runtime pair.

## Visual source checks

- [zeeho_ae4_pdf](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37742/8271cf9d-df4f-428d-bd01-19c61198793c.pdf), PDF page 1, checked 2026-10-10: Page 1 visibly specifies one 74 V / 27 Ah battery, second optional, 63 km WMTC and CBS. Speed/seat/clearance explicitly carry European-version labels; AU webpage supplies local speed. No Australian approval inferred.
  - Original SHA-256 `276c3a4ab04cb8487e4170cf58b4b1b060ef79e5826a418bfbf6a6708498d6c1`; render SHA-256 `8652c38189215e0fb9c5595eef64163990afa55b770c1f430f1190e68ac0c125`
- [zeeho_ae6_pdf](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37739/d3921f9e-1948-4c05-8834-9e8eae308381.pdf), PDF page 1, checked 2026-10-10: Page 1 visibly specifies 69 V / 27 Ah, second battery optional, 100 km at 20 km/h, 2.5/5.5 kW and CBS. Generic AE6 heading is tied only as corroboration to the exact Australian AE6+ page.
  - Original SHA-256 `d4fd89c6b94de54d0fc1903f65968a8216c7f4be1cf14a363c3bd80592660901`; render SHA-256 `b802c6f986f2da3027d38e5e8124cb6c3b0847007477d97fb860b1132adb1704`
- [zeeho_ae8_pdf](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37740/db7d0f5d-3c43-40e6-99b9-03c738482f02.pdf), PDF page 1, checked 2026-10-10: Page 1 visibly specifies 69 V / 27 Ah ×2 and 100 km WMTC. ABS/CBS row expressly says AE8 S+ and AE8+ equipped with ABS, AE8 without ABS. LCD/TFT variants are distinct; no extra AU offer inferred.
  - Original SHA-256 `031aeaae4cf5e4587957d958a8a167bd21ed49b0ab0f041bdf5cc2b5f53ef92b`; render SHA-256 `a80f994c376aab90cd4f21b66470cf62df5b684058c89776a19cdb9aec8a9bb3`

The E125S original HTML also contains a commented-out WMTC-criteria passage. It is not a visible or explicitly attributed test basis for the 108 km typical-range figure, and has not been used to fill that figure’s unknown conditions. Its source location and excerpt hash are preserved in the JSON.

## Audit manifest

- Evidence file SHA-256: `a5ffeac42bdda7b264963ba3047b39b66eb84d2dda9a7259f5304e560dc09f51`
- 258 exact source/context dependencies, 23 original sources and three re-inspected PDF pages
- 1386 checks passed: source pointers/object snapshots, original/text/derived/render hashes, exact record set, clause support and visible-condition binding
- Each visible condition has its own dependency list in the JSON. Unknowns remain null and retain their evidence limitations
- No independent editorial review or runtime mutation/render test is claimed; those follow actual-ID/effective-snapshot binding

## Source register

- [ace_ae4](https://acescooters.com.au/listings/zeeho-ae4/) — checked 2026-10-10; retrieved 2026-10-10T11:22:12.788045+00:00; original SHA-256 `d987d5ec051a3b5c53e16bb140f581acdc5e3d2f93cb9bc70e121e292b68d6a8`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [ace_ae6](https://acescooters.com.au/listings/zeeho-ae6/) — checked 2026-10-10; retrieved 2026-10-10T11:23:25.598045+00:00; original SHA-256 `89d78d55f3d210b03e563170335565da9b806a9957878fafe59b72e3aa64058e`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [ace_ae8](https://acescooters.com.au/listings/zeeho-ae8/) — checked 2026-10-10; retrieved 2026-10-10T11:23:24.096268+00:00; original SHA-256 `54d222cb402696199c7c8576ff18f04dfa91615fa133521dfd539aa373ea2522`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [ace_e125s](https://acescooters.com.au/listings/segway-ninebot-e125s/) — checked 2026-10-10; retrieved 2026-10-10T11:23:24.398591+00:00; original SHA-256 `3136e7dcbc5369c6bde09742f6cf3f2149b51e3d9b84821d5483cd09951e4cdc`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [ace_e300se](https://acescooters.com.au/listings/segway-ninebot-e300se/) — checked 2026-10-10; retrieved 2026-10-10T11:23:24.096313+00:00; original SHA-256 `8ee80be441937c6582697b209f63dc376ef45d3ac34668d0195c4c6e1852dafe`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [aemc_e300se](https://australianelectricmotorco.com/motorcycles/segway-e300se/) — checked 2026-10-10; retrieved 2026-10-10T11:22:16.006475+00:00; original SHA-256 `27ecd7c9b3d6e9105ff4d22b46858b157cf770f7bb4a1d436f5ec0e130ae21b3`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [central_e300se_review](https://www.scootercentral.com.au/news/is-this-the-answer-for-electric-vespa-buyers/) — checked 2026-10-10; retrieved 2026-10-10T11:22:17.608222+00:00; original SHA-256 `c36d1944da6bdf9b52065532ae1d35b68d5037af327afbdbe963c0b86280146a`
  - Publication/update date: 2024-07-08; Article published_time
- [everest_ae4](https://everestmotorcycles.com/products/zeeho-ae4-electric-scooter) — checked 2026-10-10; retrieved 2026-10-10T11:21:22.824688+00:00; original SHA-256 `20f35e7d25bee85a8a98047de283ff8e8ffa951caf9ac5772177d5860ab2957a`
  - Publication/update date: 2026-07-02T16:01:54+10:00; Embedded Shopify product published_at; not stock-update time
- [everest_ae6](https://everestmotorcycles.com/products/zeeho-ae6-electric-scooter) — checked 2026-10-10; retrieved 2026-10-10T11:21:18.337688+00:00; original SHA-256 `efd705dee5e7d7f70fb844400c4e058ce57a345243106b569525ce3a102e10c0`
  - Publication/update date: 2026-07-02T16:12:31+10:00; Embedded Shopify product published_at; not stock-update time
- [everest_ae8](https://everestmotorcycles.com/products/zeeho-ae8-electric-scooter) — checked 2026-10-10; retrieved 2026-10-10T11:21:23.254276+00:00; original SHA-256 `8b892fa98195ac1ae328c2e16b0dc06c9ad299f248cf5b31693b9a0969aac2f6`
  - Publication/update date: 2026-07-02T16:17:56+10:00; Embedded Shopify product published_at; not stock-update time
- [qld_lams](https://www.qld.gov.au/transport/licensing/motorcycles/learner-approved) — checked 2026-10-10; retrieved 2026-10-10T11:23:18.789110+00:00; original SHA-256 `aa48330238707e8624501c958287adf14bf6c9c0241785471e998fccefb12cd0`
  - Publication/update date: 2026-09-07; Page Last updated
- [segway_compare_au](https://au.segway.com/escooter/comparison.html) — checked 2026-10-10; retrieved 2026-10-10T11:22:17.253034+00:00; original SHA-256 `8df377b78d20420871f0e33a2050c939ff7df18fccd295534cb49aa899b0ed7b`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [segway_e125s_au](https://au.segway.com/escooter/products/e110s-and-e125s.html) — checked 2026-10-10; retrieved 2026-10-10T11:21:22.169485+00:00; original SHA-256 `6333590477943e83d65f98428adfae305a5f176c6e1b6adc3450671550859023`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [segway_e300se_au](https://au.segway.com/escooter/products/e300se.html) — checked 2026-10-10; retrieved 2026-10-10T11:21:21.906796+00:00; original SHA-256 `816bedd33bedd67cf90c5810f49d123b908ea15d132de65b7dd7161f75bc921b`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [shop_e125s](https://www.scootershop.com.au/inventory/scooters/bike-segway-e125s-4) — checked 2026-10-10; retrieved 2026-10-10T11:21:19.569203+00:00; original SHA-256 `e0f0584caf972209f970a960fe3f6ee3351790dc7393567df560053287e00083`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [shop_e300se](https://www.scootershop.com.au/inventory/scooters/bike-segway-e300se-5) — checked 2026-10-10; retrieved 2026-10-10T11:21:19.593552+00:00; original SHA-256 `fe8aca78a4a5bec6a7d82c4c1719dfd64a6a3a2ae8717d34e6d4a19e067ba820`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [shop_segway](https://www.scootershop.com.au/segway) — checked 2026-10-10; retrieved 2026-10-10T11:23:19.715320+00:00; original SHA-256 `a85237f10c95b8e9ba9717afa9225bf8bad899d1ee43439bd629b757546cb924`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [zeeho_ae4_au](https://www.cfmoto.com.au/model/ae4) — checked 2026-10-10; retrieved 2026-10-10T11:21:20.676390+00:00; original SHA-256 `e3c0f6f2c43b08d2a7eaacf0183c1f6edfba33173d061e9e94b843ad1a311b32`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [zeeho_ae4_pdf](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37742/8271cf9d-df4f-428d-bd01-19c61198793c.pdf) — checked 2026-10-10; retrieved 2026-10-10T11:21:49.231413+00:00; original SHA-256 `276c3a4ab04cb8487e4170cf58b4b1b060ef79e5826a418bfbf6a6708498d6c1`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [zeeho_ae6_au](https://www.cfmoto.com.au/model/ae6) — checked 2026-10-10; retrieved 2026-10-10T11:21:20.677423+00:00; original SHA-256 `fb6a02965e13ece19f5d09f97efb41c662d3a19ba900439443626648e9299665`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [zeeho_ae6_pdf](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37739/d3921f9e-1948-4c05-8834-9e8eae308381.pdf) — checked 2026-10-10; retrieved 2026-10-10T11:21:49.171278+00:00; original SHA-256 `d4fd89c6b94de54d0fc1903f65968a8216c7f4be1cf14a363c3bd80592660901`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [zeeho_ae8_au](https://www.cfmoto.com.au/model/ae8) — checked 2026-10-10; retrieved 2026-10-10T11:21:20.680557+00:00; original SHA-256 `1e7d872e3774064c99005ab80403b623d164da51cff55242b3141591d9bab403`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
- [zeeho_ae8_pdf](https://mojomotorcycles.s3.ap-southeast-2.amazonaws.com/articles/6/37740/db7d0f5d-3c43-40e6-99b9-03c738482f02.pdf) — checked 2026-10-10; retrieved 2026-10-10T11:21:48.797608+00:00; original SHA-256 `031aeaae4cf5e4587957d958a8a167bd21ed49b0ab0f041bdf5cc2b5f53ef92b`
  - Publication/update date: not shown; Not displayed; checkedAt is retrieval date, not stock freshness
