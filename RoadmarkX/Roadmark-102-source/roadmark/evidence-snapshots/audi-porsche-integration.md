# Audi/Porsche read-only integration memo

Checked 10 October 2026 against `audi-porsche-evidence.json`, the current market inventory and the app’s `Variant`/`Fact` formats. Recommendations only. No app or data edits performed.

## Recommended import boundary

Import the 32 current manufacturer-listed configuration rows into eight existing family IDs below. Do not duplicate the census family placeholders. Keep the eight Audi future configurations, seven older exact Audi specification rows, and all held/residual scopes outside this current cohort. Existing MY27 Q4 census entries remain orderable-future records, rather than becoming current-delivery stock.

Every current row: `orderStatus = listed_unconfirmed`, `stockStatus = unverified`, factory order acceptance false, physical stock false, manufacturer-to-VIN equivalence false. `rankingEligible = false` remains appropriate at whole-record level; individual compatible, supported facts may be compared. Use the existing `partial_exact_trim_facts_integrated` coverage label when detail is imported and leave `completeVehicleCountEligible = null`. No complete Audi/Porsche or national universe claim follows.

Current snapshot family indices are only navigation aids; IDs are authoritative. The inventory read for this memo had SHA-256 `f1062c70124b8f9eaf64b0fece4c9b58b02e39a5c0577fff659ee43dd065190f`. The main task may subsequently update it.

## Exact family mapping

| Existing family ID / observed index | Suggested detailed model ID | Current row count |
|---|---|---:|
| `audi-e-tron-gt`, records[28] | `audi_etron_gt_my26` | 3 |
| `audi-q6-e-tron`, records[31] | `audi_q6_suv_my26` | 2 |
| `audi-q6-sportback-e-tron`, records[32] | `audi_q6_sportback_my26` | 2 |
| `porsche-macan-electric`, records[102] | `porsche_macan_electric_current` | 5 |
| `porsche-taycan`, records[103] | `porsche_taycan_sedan_current` | 11 |
| `porsche-taycan-cross-turismo`, records[104] | `porsche_taycan_cross_turismo_current` | 3 |
| `porsche-cayenne-electric`, records[101] | `porsche_cayenne_electric_current` | 3 |
| `porsche-cayenne-coup-electric`, records[100] | `porsche_cayenne_coupe_electric_current` | 3 |

The exact existing Coupé family ID is `porsche-cayenne-coup-electric`, with `coup`, not `coupe`. Preserve this ID even if the readable model and detailed model ID use Coupé/coupe. Group SQ6 with the existing Q6 body family; do not invent extra SQ6 census families. Keep Cayenne SUV/Coupé and Taycan sedan/Cross Turismo separate.

### All 32 source rows

The evidence record ID may be reused as a stable variant ID if the importer permits hyphens. If following the current double-underscore convention, derive `{detailed_model_id}__{model_code_or_grade_slug}__my{year}`. Retain the exact evidence ID separately. For Audi Q6 append `__prod_20260226` when production revision is part of the key; GT may use `__prod_20250616`. Do not invent a missing GT model code.

| Evidence row ID | Exact grade | Existing family ID | Manufacturer code | Formal MY |
|---|---|---|---|---|
| `audi-q6-suv-my26` | Q6 e-tron | `audi-q6-e-tron` | `GFBA1A` | MY26 |
| `audi-sq6-suv-my26` | SQ6 e-tron | `audi-q6-e-tron` | `GFBS58` | MY26 |
| `audi-q6-sportback-my26` | Q6 Sportback e-tron | `audi-q6-sportback-e-tron` | `GFNA1A` | MY26 |
| `audi-sq6-sportback-my26` | SQ6 Sportback e-tron | `audi-q6-sportback-e-tron` | `GFNS58` | MY26 |
| `audi-s-etron-gt-my26` | S e-tron GT | `audi-e-tron-gt` | Unverified; use grade slug | MY26 |
| `audi-rs-etron-gt-my26` | RS e-tron GT | `audi-e-tron-gt` | Unverified; use grade slug | MY26 |
| `audi-rs-etron-gt-performance-my26` | RS e-tron GT performance | `audi-e-tron-gt` | Unverified; use grade slug | MY26 |
| `porsche-taycan-my2027` | Taycan | `porsche-taycan` | `Y1AAI1` | MY2027 |
| `porsche-taycan-black-edition-my2027` | Taycan Black Edition | `porsche-taycan` | `Y1AGI1` | MY2027 |
| `porsche-taycan-4-my2027` | Taycan 4 | `porsche-taycan` | `Y1ABN1` | MY2027 |
| `porsche-taycan-4-black-edition-my2027` | Taycan 4 Black Edition | `porsche-taycan` | `Y1AHN1` | MY2027 |
| `porsche-taycan-4s-my2027` | Taycan 4S | `porsche-taycan` | `Y1ADJ1` | MY2027 |
| `porsche-taycan-4s-black-edition-my2027` | Taycan 4S Black Edition | `porsche-taycan` | `Y1AJJ1` | MY2027 |
| `porsche-taycan-gts-my2027` | Taycan GTS | `porsche-taycan` | `Y1ADK1` | MY2027 |
| `porsche-taycan-turbo-my2027` | Taycan Turbo | `porsche-taycan` | `Y1AFL1` | MY2027 |
| `porsche-taycan-turbo-s-my2027` | Taycan Turbo S | `porsche-taycan` | `Y1AFM1` | MY2027 |
| `porsche-taycan-turbo-gt-my2027` | Taycan Turbo GT | `porsche-taycan` | `Y1AFT1` | MY2027 |
| `porsche-taycan-turbo-gt-with-weissach-package-my2027` | Taycan Turbo GT with Weissach Package | `porsche-taycan` | `Y1AFP1` | MY2027 |
| `porsche-taycan-4-cross-turismo-my2027` | Taycan 4 Cross Turismo | `porsche-taycan-cross-turismo` | `Y1BBN1` | MY2027 |
| `porsche-taycan-4s-cross-turismo-my2027` | Taycan 4S Cross Turismo | `porsche-taycan-cross-turismo` | `Y1BDJ1` | MY2027 |
| `porsche-taycan-turbo-cross-turismo-my2027` | Taycan Turbo Cross Turismo | `porsche-taycan-cross-turismo` | `Y1BFL1` | MY2027 |
| `porsche-macan-electric-my2027` | Macan Electric | `porsche-macan-electric` | `XABAA1` | MY2027 |
| `porsche-macan-4-electric-my2027` | Macan 4 Electric | `porsche-macan-electric` | `XABBB1` | MY2027 |
| `porsche-macan-4s-electric-my2027` | Macan 4S Electric | `porsche-macan-electric` | `XABDC1` | MY2027 |
| `porsche-macan-gts-my2027` | Macan GTS | `porsche-macan-electric` | `XABDE1` | MY2027 |
| `porsche-macan-turbo-electric-my2027` | Macan Turbo Electric | `porsche-macan-electric` | `XABFD1` | MY2027 |
| `porsche-cayenne-electric-my2027` | Cayenne Electric | `porsche-cayenne-electric` | `X1AAA1` | MY2027 |
| `porsche-cayenne-s-electric-my2027` | Cayenne S Electric | `porsche-cayenne-electric` | `X1ABB1` | MY2027 |
| `porsche-cayenne-turbo-electric-my2027` | Cayenne Turbo Electric | `porsche-cayenne-electric` | `X1ACD1` | MY2027 |
| `porsche-cayenne-coup-electric-my2027` | Cayenne Coupé Electric | `porsche-cayenne-coup-electric` | `X1BAA1` | MY2027 |
| `porsche-cayenne-s-coup-electric-my2027` | Cayenne S Coupé Electric | `porsche-cayenne-coup-electric` | `X1BBB1` | MY2027 |
| `porsche-cayenne-turbo-coup-electric-my2027` | Cayenne Turbo Coupé Electric | `porsche-cayenne-coup-electric` | `X1BCD1` | MY2027 |

## Formal model year versus production and publication

- Audi Q6 current four: formal MY26 is independently present in the AU page hydration, exact model identifier and linked specification filename. Codes: GFBA1A version 1 (Q6 SUV), GFNA1A version 1 (Q6 Sportback), GFBS58 version 0 (SQ6 SUV), GFNS58 version 0 (SQ6 Sportback). The PDFs apply from **26 February 2026 production**, published June 2026. Preserve all three dates/scopes; none is the vehicle’s build date
- Audi GT current three: linked AU specification explicitly named MY26, with **16 June 2025 production** applicability and October 2025 publication. MY26 does not mean manufactured in 2026. Exact GT model codes were not recovered
- Porsche current 25: **MY2027 explicitly stated** on exact AU comparison model cards/configurator references. It is not inferred from the October 2026 access date. No exact production changeover date was established; `production_revision = null`
- Never copy these specifications onto an older MY25/MY26 dealer ad by grade name. The strongest unresolved Audi ad, Adelaide Q6 Sportback stock 54874, is January 2026 build and therefore predates the current Q6 technical revision
- Current catalogue model year is not delivery timing. Porsche’s old Q3 2026 arrival expectation does not prove an arrival occurred. Audi MY27 Q4/Q6 expected first-half 2027 arrivals remain future scoped

## Body, battery, grade and factory package identity

### Audi

Current Q6 SUV and Sportback each have only base Q6 and SQ6 in the latest two-column AU PDFs. Original Performance/quattro SUV and quattro Sportback belong to older/held scopes, not implicit extra MY26 grades. Base is 83/75.8 kWh gross/net; SQ6 is 100/94.9. An “S line”, Style/Premium/Winter option or sport edition campaign is not a new powertrain grade.

Current GT is the 105/97 kWh updated generation. Keep S, RS and RS performance separate. The earlier e-tron GT quattro / RS generation cannot inherit those facts. Active suspension is standard on RS performance, optional on RS and absent from S; do not flatten all three to the same suspension configuration.

### Porsche Macan

Five exact electric codes distinguish base/4/4S/GTS/Turbo. Do not match a petrol Macan GTS using name alone. Current EV pages all say 100 kWh gross; exact MY2027 net remains unresolved despite an AU family article saying 96 kWh. Base braked towing is 2,000 kg, the four AWD grades 2,500 kg, using each exact technical source. Wheel choices remain equipment/options rather than multiplied SKUs.

### Porsche Taycan

Fourteen currently listed model identities: eleven sedan, three Cross Turismo. The sedan list includes three separate manufacturer-coded Black Editions and the **Turbo GT with Weissach Package** factory configuration. These are valid named manufacturer configurations, but the Weissach version is not a fourth body style or an extra pure powertrain grade. Its two-seat layout matters. Turbo GT without Weissach has four seats. Do not create a current AU Sport Turismo or Turbo S Cross Turismo from overseas availability.

- Base Taycan Y1AAI1 and Taycan 4 Y1ABN1: default Performance Battery **G1X**, 89 kWh gross/82.3 net, 270 kW vehicle DC peak; optional **J9Q** Performance Battery Plus, 105/97 kWh, 320 kW peak. Each optional branch has its own explicitly recorded power/range/charging attributes. Do not mix a 105 kWh hero range with the default 89 kWh record
- All other twelve current Taycan models: exact AU evidence supports 105/97 kWh standard, including **Taycan 4S**. Do not import an overseas 89 kWh 4S
- Count 14 Taycan models or 16 explicitly battery-defined configurations, never both at once. Recommended initial import is the 14 model rows, retaining the two optional battery branches as scoped options. If the comparison UI deliberately expands branches, add exactly those two J9Q rows with explicit battery identifiers, and disclose the resulting count
- The total Porsche evidence has 25 model rows / 27 battery branches, not 27 separate model grades
- Normal Taycan four-seat default and optional 4+1 five-seat layout are different. The evidence records exact option availability/price where found; do not make all Taycans five-seat or assume every trim offers it
- Turbo GT Weissach **QY6** option-coded extra performance remains an option-conditioned technical claim. It must not overwrite default acceleration/power or become a fabricated extra grade

### Porsche Cayenne

Six BEVs, three SUV and three Coupé, with separate exact codes. Do not mix with combustion or E-Hybrid Cayenne. All have 113 kWh gross in the current exact tables; net capacity is held.

- The current AU Coupé configurator Summary identifies **5KA** electric rear 2+1 seats as $0 Basic equipment. Five seats is valid for that default Australian configuration; the generic equipment feed still describes two rear seats. Preserve that conflict and avoid a universal claim across all factory/lightweight packages
- Braked towing is explicitly hitch-specific: **1M3 extending towbar = 3,000 kg**; **1M0 trailer hitch without tow ball = 3,500 kg**. The general `towing_braked_kg` stays null without a selected hitch. Keep each attribute’s AUS/NZL label, option code and separate nose load; never mistake a nose load for towing mass
- Coupé/Lightweight Sport packages remain optional equipment. Body, rear seat configuration, wheel, roof and hitch are not a free Cartesian product

## Porsche configurator metadata correction

Integration QA identified that `default_configuration_option_codes` originally collected all HTML inputs named `options` without respecting checked/selected state. It included mutually exclusive batteries, wheels, chargers and towbar choices. **Do not import this list as selected/default/fitted equipment or compatibility evidence.** All 25 broad lists have now been withdrawn and replaced by null holds in the research; selected-state QA passed. Use only exact Summary / Basic equipment / selected-state or explicit standard-equipment evidence for any particular claim. Exact model identities, technical rows and named battery branches are independent of that broad code list. Macan AC is independently re-proven: base/4/4S Summary > Standard Equipment > KB4 specifies 22 kW; GTS/Turbo exact-model Standard Equipment contains the 22 kW charger. Canonical AC remains 22 kW for all five current MY2027 grades. No normalized technical values changed.

## Conservative canonical fields

The app `Fact` contract carries `value`, `unit`, `basis`, `comparisonBasis`, `status`, `sourceIds`, `date`, `market`, `scope`, `qualifications`, `issues`, optional `conditionExplanation`, and offer `validUntil`. Preserve those, rather than importing naked numbers. The existing `compareFacts` deliberately suppresses deltas for conditional/optional facts or differing bases.

| App field / topic | Canonical recommendation | Attributed or held treatment |
|---|---|---|
| `model_year` | Audi current = MY26; Porsche = MY2027 | No year inference from build/compliance/publication |
| `price_aud` | Null for all 32 current rows | Dated launch MLP/RRP history, future announced prices and campaigns get separate qualified facts |
| `range_km` | Audi Q6 null; current GT may retain 558/522/528 only with `range_cycle = ADR 81/02` and conditional comparison | Porsche single canonical WLTP remains null; Vehicle High claims are separate conditional facts, not certified wheel-specific numbers |
| `battery_kwh` | Prefer exact net: Audi base Q6 75.8, SQ6 94.9, GT 97; Taycan selected battery 82.3 or 97 | Macan/Cayenne net null. Gross may be a separately labelled fact, never silently substituted as usable |
| `dc_peak_kw` | Audi base Q6 225, SQ6 270, GT 320; Taycan default 270 or 320 by battery; Macan 270; Cayenne base/Turbo SUV 390 | Cayenne S SUV and all Coupés ordinary peak null; conditional 400 kW is separate |
| `ac_kw` | S e-tron GT 11 explicitly sourced; Taycan 11, Cayenne 11, Macan MY2027 22 with exact equipment scope | Audi Q6/SQ6/RS GT/RS performance remain held in this audit; do not infer 11 from sibling or 7.2 kW portable cable |
| `dc_charge_time_min` | Use only exact 10–80% claim with test conditions attached, status conditional | Audi Q6 current 21; GT 18 with stale-footer issue. Taycan 18, Macan 21, Cayenne 16 are manufacturer test claims, not universal travel times |
| `zero_to_100_s` | Keep normal acceleration separate from launch-control-qualified value | If main headline uses launch control, say so in basis and condition; do not compare it as unqualified normal acceleration |
| `seats` | Porsche exact standard/default count with selected-layout scope | Audi current counts unresolved; do not infer five from segment. Cayenne Coupé five depends on AU 5KA default; Taycan optional 4+1 separate |
| `length_mm`, `width_mm`, `height_mm`, `wheelbase_mm` | Exact Porsche default-branch dimensions can be used with no-mirrors/air-suspension-position basis retained | Do not average folded/extended mirror widths or ride heights. Audi dimensions not recovered here |
| `boot_l`, `frunk_l`, `max_total_cargo_l` | Use only exact per-model cargo observations, seat state, loading limit and method | Cross Turismo rear cargo remains null; Audi current cargo remains null. Porsche rear-seat-top versus behind-front-seats-to-roof are different bases |
| `towing_braked_kg` | Audi Q6 2,000 / SQ6 2,400 with genuine towbar qualification; Macan base 2,000 / AWD 2,500 | Cayenne universal scalar null; hitch-specific options conditional. Taycan towing unknown, not zero |
| Mass/payload | Preserve DIN and EU unladen labels in separate facts | Do not turn EU unladen into AU tare/kerb, or compute payload across mismatched bases |

Some research keys use aliases: Porsche `power_launch_control_kw` aliases `overboost_launch_control_kw`; `zero_to_100_launch_control_s` aliases `acceleration_0_100_launch_control_s`; `ac_charge_max_kw` aliases `ac_onboard_peak_kw`; `drive` aliases `drivetrain`. Do not import both aliases as duplicate facts. Normal Porsche `power_kw` is “Power up to”; it is not homologated continuous/rated power.

A sound technical value can be imported even though the complete row is ranking-incomplete. Conversely, a real current model does not make every field valid. Use `status = conditional` when a claim is useful but battery/wheel/hitch/test-mode/source-conflict scope still matters; `not_verified` and `value = null` for unknown facts. Leave `comparisonBasis` distinct when cycles, cargo definitions or power modes differ.

## Range and charging release gates

1. **Audi Q4 MY27**, outside these 32: source magazine calls 494/509 km WLTP; current page footnotes say ADR81/02. Canonical WLTP remains null. Preserve both labelled claims and issue. Current GT is ADR81/02; never relabel it WLTP
2. Porsche **Vehicle High** is a particular WLTP configuration boundary. Do not rename it WLTP maximum/range ceiling, combine with a different optional battery, or claim it is the chosen wheel’s homologated result. Exact wheel-specific certified range remains unknown
3. GT RS hero says 650 kW, while exact MY26 PDF and specs table say 630. Use 630 for launch power and retain conflict. S GT current page says 558 km versus launch prose 559; use current ADR 558 if displayed
4. GT charging body and current-generation release say 320 kW/10–80%/18min; stale footer says 270 kW/5–80%. Keep the 320 peak from exact PDF and 18-minute release claim conditional with issue, rather than converting the old window
5. Audi Q6 current page 21 minutes and sport/MY27 article 20 minutes are different source claims. Do not overwrite current exact body pages with the announcement
6. Porsche charger-test output is not vehicle peak: Taycan disclaimers cite station >320 kW, >850 V; Cayenne cite >390 kW, >850 V, >520 A. These belong to test conditions, not `dc_peak_kw`. Base 89 kWh Taycan remains 270 kW even with a shared >320 kW test-station disclaimer
7. Porsche Cayenne S/Coupé exact ordinary peak is TBA/null. “Up to 400 kW under specific conditions” can be shown only in a distinct conditional field, with full conditions; it cannot fill the ordinary 390 kW sibling field or become a generic 400 kW peak
8. Keep 400 V charging times and 11/22 kW AC supply-duration observations separate from maximum fast-charge time and fitted AC hardware

## Price and offer treatment

All 32 current `price_aud`/ordinary MLP values should remain null. Audi’s old launch MLPs and Porsche’s dated announced RRPs are legitimate historical facts, not current October 2026 verified prices. Porsche’s live configurator shows equipment subtotals until dealer/vehicle quote selection: **$0 or $440 is not the car’s price**. Equipment option uplifts are likewise not standalone vehicle prices.

Audi MY27 Q4 announced MLPs ($71,650 base both bodies; $81,650/$83,250 quattro performance) and Q6 ($89,900 both bodies; SQ6 $129,900/$134,900) are future-scoped and exclude dealer delivery/statutory charges. Do not use them as MY26 price updates.

The MY26 Q6 SUV sport campaign formal footnote is $95,900 driveaway with metallic, eligible private buyers, participating dealers, purchase/delivery 1 Sep–31 Dec 2026, excludes WA and other offers, while stocks last. Article prose also says $95,500 and broadens body/dates, while October embedded campaign terms differ. Keep it an offer with `validUntil`, exact eligibility and conflict; do not attach it as an unconditional national price or verified Sportback offer. Sport edition remains a package/campaign under Q6, not a separate motor grade. No specific NEW unit was proved by the offer.

Do not subtract GST, remove LCT, add hypothetical delivery or use geographic tax assumptions to manufacture a comparable vehicle price. PDF option MRLP includes GST and conditional LCT; historical launch MLP excludes on-roads.

## Warranty and ownership facts

Audi current linked terms: five years/unlimited km, new-car commencement first retail delivery; demonstrator commencement first dealer registration. BEV battery eight years/160,000 km, whichever first, below 70% net-energy trigger. The July 2024 staged restoration table has named earlier models but omits newer Q6/SQ6/S GT/RS performance. Do not invent the later models’ staged remedy. An Audi 70% trigger and an 80% early restoration target are not interchangeable warranty thresholds.

Porsche exact current AU terms: three years/unlimited km for ordinary new-BEV defects, eight years/160,000 km HV battery; retention terms 80% through 3 years/60,000 km, then 70% through 8 years/160,000 km with terms/whichever-first preserved. No per-VIN warranty commencement verified. Exclude servicing, roadside subscriptions and promotions from vehicle-warranty duration.

## Stock and census reconciliation

- `dealer_evidence` in the combined bundle is deliberately empty. The33 exact rejected/unverified candidates are not stock evidence to promote
- Audi audited 41 grade/body/year scopes and 21 candidates. The Adelaide lead has an indexed New classification but direct Carsales 403 and primary Solitaire 502, plus 993 km and an older production date. It remains a lead, not `new_stock_listed`
- Porsche Finder `condition=new` query URLs can display Pre-Owned detail records. A URL filter is not the car’s condition. Twelve exact BEV listings were rejected; remaining search leads do not establish fresh specific NEW units
- Keep inventory family `stockStatus = unverified`; no family gains `new_stock_listed` from this audit. Record manufacturer listing in the independent order/listing field
- Existing `audi-q4-e-tron` and `audi-q4-sportback-e-tron` (records 29/30 when read) remain MY27 quattro-performance orderable-future families. The base RWD versions are announced, exact base orderability unverified
- Keep `unverifiedLeads[28]` ID `audi-my27-q6-sq6-suv-and-sportback` future scoped. Do not replace MY26 sport/current families with announced 2027 price/equipment
- `unverifiedLeads[27]` ID `audi-a6-s6-e-tron` stays unresolved: no current exact AU listing/specification. Historical planned introduction is not current availability
- `unverifiedLeads[29]` ID `audi-q8-e-tron` stays discontinued-order/residual-stock-unverified. No verified fresh NEW ad means no promotion; it does not prove nationwide absence
- Reuse and enrich the eight exact family IDs, preserve prior `evidenceHistory`, append new source artifact references, and replace outdated limited trim summaries thoughtfully. Q6 current coverage becomes base/SQ6; keep sport edition as a separate qualified offer history

## Source preservation and verification checklist

Use source IDs from `audi-porsche-evidence.json`, or a collision-safe prefix such as `r10_audiporsche_` with an explicit remapping table. Preserve exact technical attribute IDs, battery option suffixes and source dates in `qualifications`/`scope`; they are what tie a number to a configuration. Snapshot hashes verify captured bytes, not the truth of every source assertion.

Before claiming integration complete, verify: 32 current rows across 8 reused families; Audi 8 future/7 historic not silently current; no duplicate 32-vs-27-battery counting; missing remains null; no `$0` vehicle prices; no NEW promotion; no use of the erroneous broad default-options list; all source references resolve; and no raw default-field mapping overwrites the held range/price/DC/cargo/tow facts. This memo is research guidance, not confirmation that code/data have been changed or tests run.
