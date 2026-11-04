# Volvo / Polestar integration recommendation

Read-only inspection, 10 October 2026. No application files changed. Evidence: `volvo-polestar-evidence.json`; inspected app inputs: `data/au_ev_all_variants_2026-10-06.json`, `data/catalogue-additions-2026-10-10.json`, `data/market-inventory-2026-10-10.json`, and the shared `Fact` adapter/comparison types.

## 1. Exact overlap and replacement decisions

**Zero original-catalogue overlap.** None of the immutable original's 11 generation records / 34 variants are Volvo or Polestar. Current additions also contain no Volvo/Polestar models or variants at inspection (21 models / 49 variants overall). All 21 current bundle configurations would be new detailed records, not replacement original variants. Their existing overlap is with market-audit family placeholders:

| Existing market ID | Reconcile in place; do not create a duplicate current family |
|---|---|
| `polestar-2` | Replace stale “model-year naming conflict” with explicit MY27 FE/FD/FF: Long range Single motor, Long range Dual motor, and Long range Dual motor with Performance pack. “Rear motor” in the campaign is an alias, not a fourth variant |
| `polestar-3` | Retain three MY27 grades: Rear motor, Dual motor, Performance. These are the 800 V / 92 or 106 kWh cohort. Never blend older Long range / Performance-pack 400 V / 111 kWh figures into it |
| `polestar-4-coup` | Canonicalise the truncated slug to `polestar-4-coupe`, retaining the old ID as an alias/source-record reference. MY27 two engines plus a Dual motor Performance-pack option configuration |
| `polestar-4-suv` | Set explicit MY27 and retain as a separate body family. Add the documented Dual motor Performance-pack option configuration, not a third engine |
| `volvo-ex30` | Retain exactly three MY27 rows: Plus P5, Ultra P5, Cross Country P8. Attach exact NEW-unit advertisements. Separate the dealer-explicit MY26 Plus Single Motor Extended Range stock cohort |
| `volvo-ex40` | Retain MY27 Ultra Single Motor Extended Range and Ultra Twin Motor. Dealer “Twin Motor Performance” aliases the same 300 kW / 670 Nm row; do not duplicate it |
| `volvo-es90` | Replace the single incomplete Plus placeholder with MY27 Plus and Ultra Single Motor Extended Range. Dealer “Plus Single Motor RWD” is the short name for Plus, not another engine |
| `volvo-ex90` in `unverifiedLeads` | Reconcile into MY27 Plus Single Motor and Ultra Twin Motor Performance only. Do not generate the Cartesian product of two grades and two powertrains. Move the unresolved placeholder into reconciled history |
| `volvo-ex60` | Keep audit-only: MY27 Ultra P6 / P10 configuration exists, but AU test-drive FAQ says coming soon and sale/order acceptance remains unresolved |
| `polestar-5` | Keep audit-only: explicit MY26 Dual motor / Performance Launch editions, build-to-order disabled. Do not promote the generic sales-start FAQ into verified current stock/order acceptance |
| `volvo-ec40-c40` | Retain unresolved/non-current lead; product/spec routes return 404, fresh exact NEW stock not verified. Used/demo ads do not qualify |

EX40 Black Edition and older EX90 Plus Twin Motor remain audit-only, not new current variants. Volvo Trucks/Buses records are a different brand/class scope and must not be reconciled with Volvo passenger cars.

## 2. Family and generation identities

Recommended identities, consistent with existing app conventions:

- Model ID `polestar_4_coupe_my27`, display `4 coupé`, family ID `polestar-4-coupe`, generation `MY27 coupé, 400 V, no conventional rear window`
- Model ID `polestar_4_suv_my27`, display `4 SUV`, family ID `polestar-4-suv`, generation `MY27 SUV body, 400 V, rear window/wiper and roof rails`
- Use explicit grade IDs under each model for `rear_motor`, `dual_motor`, and `dual_motor_performance_pack`; mark the last as an option configuration and link it to the parent Dual motor engine
- Do not use common family ID `polestar-4` for these two bodies. The app counts `modelFamily || family`; collapsing them would hide distinct body families. A separate brand-level grouping may link them without sharing facts
- `polestar_3_my27_800v` and `volvo_ex90_my27_800v` should remain generation-distinct from any later-imported older 400 V stock
- The older MY26 EX30 stock can use a separate generation/model ID with family ID `volvo-ex30`; never replace or duplicate the current MY27 grade with it

The adapter derives `Car.family` from `model_id`, while `model.family_id` becomes `Car.modelFamily`. Populate both intended identities consistently. Family grouping must not be a mechanism for inheriting specification values.

## 3. Minimal safe shared-Fact mapping

Use explicit `additions.facts` overlays rather than relying on variant-level defaults: the adapter otherwise marks most non-null numbers `standard`, uses generic sources, and cannot express these field-level qualifications. Carry `sourceIds`, date `2026-10-10`, AU/exact-MY scope, meaningful `basis`, `comparisonBasis`, `qualifications`, and `conditionExplanation`. `conditional` prevents an automatic numeric delta in `compareFacts`; unknown stays null / `not_verified`.

### Range

Map `specifications.range_wltp_km.value` → `range_km`, preserving target/preliminary status and unverified test-wheel configuration. Use `conditional`, not an unqualified certified-WLTP basis.

- Polestar 4 coupé Rear / Dual / Performance pack: **620 / 590 / 500 km**
- Polestar 4 SUV Rear / Dual / Performance pack: **630 / 600 / 520 km**
- The two Performance values are explicit MY27 AU configurator keys `range-performance-wltp-min-in-kilometer`, corroborated by the `XPFWHE:options` range map; do not inherit the base Dual value
- Do not promote EX60 audit-only estimates into ranked WLTP facts: its normalized WLTP field remains null pending explicit protocol corroboration

### Cargo

Map `boot_l` to cargo behind **all advertised occupied seating positions**, with exact measurement basis. Map `max_total_cargo_l` to the explicitly published folded **rear** volume, never rear + front or rear + underfloor. If the UI label implies total vehicle storage, qualify it or leave it null until wording is safe.

| Model | `boot_l` | `max_total_cargo_l` | `frunk_l` | Required basis |
|---|---:|---:|---:|---|
| EX30 Plus / Ultra | 318 | 1000 | 7 | Rear “open”, second row up; folded “max” is a different boundary |
| EX30 Cross Country | null | null | null | General EX30 cargo table was not explicitly assigned to Cross Country |
| EX40 | 410 | 1400 | 31 | Rear “open”, second row up; folded “max” |
| EX90 | 324 | 2135 | 46 | Third row up for seven occupants; **697 L is with third row folded and must not be the seven-seat boot headline** |
| ES90 | 442 | 1445 | 27 | Rear “open”, second row up; folded “max” |
| Polestar 2 | 407 | 1097 | 41 | Rear totals include 43 L underfloor; do not add it again |
| Polestar 3 | 484 | 1411 | 23.8 | Seats-up measured to rear seatbacks and includes 90 L underfloor; 597 L to roof is separate; front measured with cover |
| Polestar 4 coupé | 526 | 1536 | 15 | Includes underfloor; upper boundary for seats-up not explicitly named |
| Polestar 4 SUV | 530 | 1665 | 15 | Seats-up to seatbacks, includes underfloor; 655 L to roof is separate |

Prefer conditional cargo facts until exact wheel/grade applicability and measurement protocol are adequately scoped. Store Volvo “open folded” volumes and roof-height alternatives as supplementary facts, not substitutes for the headline measures above. The app's default single `boot_basis` cannot describe both boot and folded capacity adequately; provide separate Fact overlays.

### Charging and battery

- Map time minutes → `dc_charge_time_min`; put SOC **10–80%**, charger condition and preliminary/temperature limitations in the basis. A faster time measured under different supply conditions is not a directly comparable delta
- Volvo: leave `dc_peak_kw` null. Published 150 / 200 / 300 kW figures label the timed **station**, not verified vehicle acceptance peaks
- Polestar 2: peak 205 kW; 28 minutes. Polestar 4: peak 200 kW; 30 minutes. Timed station ratings are unspecified and must not be inferred from those peaks
- Polestar 3 MY27: Rear peak 310 kW / 22 minutes at stated 310 kW; Dual/Performance 350 kW / 22 minutes at stated 350 kW. Preserve separate 400 V observations: 120 kW, 30 / 32 minutes respectively
- `ac_kw` is standard fitted capacity, not wallbox supply. Polestar 4 standard is 11 kW; 22 kW is a separate option, with 5.5-hour 0–100% claim. Do not assign 22 kW to all Plus-pack cars
- Map `battery_kwh` only with **manufacturer nominal, gross/usable unconfirmed** for Volvo and **manufacturer capacity, gross/usable unconfirmed** for Polestar. Gross and usable fields remain null; do not reinterpret these values

### Warranty, price and other safeguards

- `warranty`: Volvo “5 years / unlimited km; from first registration”. Polestar “5 years; distance limit unconfirmed”, not invented unlimited mileage
- `battery_warranty`: 8 years / 160,000 km, whichever first, 70% minimum retained capacity, with terms. Current Polestar 2 product page corroborates this for every Polestar 2 despite a stale MY25/MY26 heading on the spec page
- Polestar roadside duration remains null: current spec/heading says five years, current product-page body says three. Do not turn it into a confident selling point
- Current national all-tax `price_aud` remains null. Keep exact dealer driveaway observations and campaign prices in separate fields with location, options, expiry and exclusions; the $73,900 Polestar 2 WA campaign is not bare MLP
- Braked towing stays null where source only says “trailer max weight” or “towing power”; map to `towing_unclassified_kg`. Do not convert running-order mass into kerb/tare or calculate payload
- MY27 Polestar 3/4 `seats` remains null in this bundle pending an explicit current AU capacity statement. Polestar 2 has a current MY27 manual confirming five; Volvo tables explicitly confirm five/seven
- Polestar 3 consumption and Polestar 5 height have unresolved source conflicts. Retain null normalized values with observed claims

## 4. Availability and counts

Recommended import: **21 current detailed configurations**, comprising **19 engine/grade configurations plus two Polestar 4 factory-option rows**. The older MY26 EX30 ad is a separate stock-only cohort, not a 22nd current grade. Keep audit-only records out of current-availability counts.

Seven of the eight exact NEW advertisements attach to current records; the eighth is the MY26 EX30. These establish advertised units, not physical inspection. Berwick has direct raw HTML; South Yarra/Sutherland evidence uses exact dealer-page web cache reported last week after direct HTTP 403. Keep that distinction in stock qualifications. No exact Polestar VIN stock is verified.

Existing explicit dated order offers may support the existing Polestar 3/coupé order categories, but an enabled configurator route alone must not be relabeled completed order acceptance. Never upgrade the entire Volvo family to “in stock” just because one grade has an ad. Reconcile corresponding market placeholders/source history when detailed records are imported, so the market and detailed catalogues do not double-count the same family.
