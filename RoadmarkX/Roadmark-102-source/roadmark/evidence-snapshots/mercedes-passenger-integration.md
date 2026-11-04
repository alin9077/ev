# Mercedes-Benz passenger BEVs: read-only integration recommendation

Checked 10 October 2026. No application changes. This refines publication scope; it does not change the conservative holds in mercedes-passenger-evidence.json.

## Recommendation

Seven records can enter a clearly labelled **manufacturer-listed catalogue** now: EQA250+, CLA200 electric, CLA3504MATIC electric, GLB250+ electric, GLB3504MATIC electric, EQS400 and G580 with EQ Technology. Their current Australian grade-specific technical tables support identity and selected facts independently of physical stock. Keep orderStatus `listed_unconfirmed`, stockStatus `unverified`, and do not describe any as accepting factory orders, in stock, or a verified NEW unit. A catalogue listing is not an availability certification.

GLC4004MATIC electric also has a current Australian exact-grade table and can be displayed in a **listed / launch-status-unresolved** section. Do not silently promote it to a currently purchasable new-car entry: the [current technical page](https://www.mercedes-benz.com.au/passengercars/models/suv/glc-electric/overview.html), [April 2026 overseas-preview article](https://www.mercedes-benz.com.au/passengercars/brand/mercedes-me-magazine/design-style/articles/the-all-new-electric-glc.html) and [140-years campaign](https://www.mercedes-benz.com.au/passengercars/campaigns/140-years.html) have unresolved availability scopes. The preview remains online and the campaign says Coming soon. If the UI cannot show this distinction prominently, retain GLC in market-audit-only.

All eight may therefore be discovered as manufacturer-listed technical records, but only seven fit the ordinary listed-unconfirmed presentation without the additional launch hold. None should count as a confirmed-new-stock vehicle or a complete market-universe entry. Keep overall rankingEligible false until the app can gate each metric, availability and data completeness separately. Individual uncontested facts can still be shown.

The evidence JSON's blanket `current_catalogue:false` meant “not cleared for a verified-new/availability-qualified comparison set”; it should not be read as absence from the manufacturer's live catalogue.

## Identity, model year and duplicate prevention

| Existing market family ID | Exact grade IDs in research | Live AU table identity | Default-build metadata, not a proved MY |
|---|---|---|---|
| mercedes-benz-eqa | mercedes-benz-eqa-250-plus | 2437022_AU6 | MP807; 2437022_AU6-807 |
| mercedes-benz-cla-electric | mercedes-benz-cla-200-electric; mercedes-benz-cla-350-4matic-electric | 1743112_AU1; 1743442_AU1 | Default is CLA200: MP807-057; 1743112_AU1-807_057 |
| mercedes-benz-glb-electric | mercedes-benz-glb-250-plus-electric; mercedes-benz-glb-350-4matic-electric | 2446132_AU1; 2446442_AU1 | Default is GLB250+: MP807-057; 2446132_AU1-807_057 |
| mercedes-benz-glc-electric | mercedes-benz-glc-400-4matic-electric | 5406322_AU2 | MP807; 5406322_AU2-807 |
| mercedes-benz-eqs | mercedes-benz-eqs-400 | 2971132_AU1 | MP807-057; 2971132_AU1-807_057 |
| mercedes-benz-g-class-electric | mercedes-benz-g-580-with-eq-technology | 4656012_AU1 | MPX26; 4656012_AU1-X26 |

Locators: each source's parsed SSR `technicalDataSheet.models` and `vehicle.mpCode / fcisVehicleId`. The models in a multi-grade table do not all inherit the page-default configuration's equipment or identifier. In particular, the CLA200 default is not a selected CLA350 build, and GLB250+ is not a selected GLB350 build.

Keep `model_year` “Model year unverified” for all eight live-table rows. Do not decode MP807/MJ-807 or MPX26. The separate offers explicitly establish only:

- [MB2RJ6VMXC](https://www.mercedes-benz.com.au/passengercars/buy/new-car/product.html/MB2RJ6VMXC): EQB250+, modelYear 2026, code806, 20-inch wheels
- [MBKJXOZ2W2](https://www.mercedes-benz.com.au/passengercars/buy/new-car/product.html/MBKJXOZ2W2): GLB3504MATIC electric, modelYear 2027, code807, 20-inch wheels
- [MBEEE19CTC](https://www.mercedes-benz.com.au/passengercars/buy/new-car/product.html/MBEEE19CTC): EQS400 Sedan, modelYear 2027, code807, 21-inch wheels

Locators: `preloadedData.productDetail.vehicleModel.modelYear`, `.modelYearCode`, `.wheels`. These are offer-scoped MY facts, not proof that every current same-named grade is MY27. Link them to the family as held offer configurations; do not count them as additional mechanical grades.

Reconcile the existing GLC unverified lead into a named-grade technical record while preserving its launch ambiguity. Split the combined EQB/EQE sedan/EQE SUV/EQS SUV/Maybach lead into separate unresolved families, rather than marking the whole lead resolved. EQB's MY26 offered configuration remains an outgoing cohort. Keep EQS400 separate from outgoing EQS450/AMG53 sedan, EQS SUV and Maybach EQS680. GLB electric is not an alias of EQB; GLC electric is not an alias of EQE SUV. Do not create Limited Edition, City Edition, Night Edition or Night Series as distinct mechanical trims without exact supporting scope. Vans remain untouched.

## Charging: when is a null strictly necessary?

The source hierarchy matters. A grade-specific technical table can support “manufacturer table states X” even when a generic equipment description differs. It does not automatically establish the reconciled physical capability. Preserve both witnesses; never combine generic maxima with exact-grade values.

| Case | Witness A | Witness B and scope | Safe publication decision |
|---|---|---|---|
| CLA200 DC | [CLA technical table](https://www.mercedes-benz.com.au/passengercars/models/saloon/cla-electric/overview.html), model1743112_AU1: maximum DC200kW | Same page `_qc` SA-693: generic DC-system copy says320kW, included on the CLA200 default; identical copy also serves the larger-battery family | A conditional, explicitly labelled **exact-grade table claim of200kW** is defensible; a null is not required just to report that source. Do not publish320kW for CLA200. Keep a single reconciled/rankable actual peak null until clarified |
| CLA350 DC | Same table, model1743442_AU1:320kW | SA-693 also says320kW but is not an independently selected CLA350 build | No numerical conflict.320kW is supported directly by the exact-grade table; do not borrow other default equipment |
| CLA AC | Each exact-grade table says11kW | `_qc` SA-84B describes a22kW on-board charger and is included for the **CLA200 page default** | CLA200 selected-default capability is unresolved. CLA350 has a verified11kW table claim but no separately captured CLA35022kW fitment witness; do not call this a proven same-trim conflict. Conservative canonical hold is reasonable, but11kW may be retained as a conditional table-only claim |
| GLB250+ AC | [GLB table](https://www.mercedes-benz.com.au/passengercars/models/suv/glb-electric/overview.html), model2446132_AU1:11kW | Same default250+ `_qc` SA-84B says22kW, included | Same selected-default conflict: resolved capability null; conditional technical-table11kW may be displayed |
| GLB350 AC | Same table, model2446442_AU1:11kW; exact [MY27 offer](https://www.mercedes-benz.com.au/passengercars/buy/new-car/product.html/MBKJXOZ2W2) `technicalInformation.engine.chargingCapacityAC`:11kW | That **same exact offer** `components.SA-84B`, standard=true:22kW on-board AC | Strong same-offer conflict. Canonical maximum null is required under the requested unresolved-conflict policy; retain both witnesses |
| GLC400 AC | [GLC table](https://www.mercedes-benz.com.au/passengercars/models/suv/glc-electric/overview.html), model5406322_AU2:11kW | Same AU2 default `_qc` SA-84B:22kW, included | Selected-default conflict; canonical capability null. Does not prove equipment for a different reported Limited Edition |
| EQS400 AC/DC | [EQS table](https://www.mercedes-benz.com.au/passengercars/models/saloon/eqs/overview.html), model2971132_AU1, and [MY27 offer](https://www.mercedes-benz.com.au/passengercars/buy/new-car/product.html/MBEEE19CTC) technical fields: AC11kW / DC330kW | Same offer `components.SA-84B`:AC22kW; `SA-83B` and `SA-693` descriptions:DC350kW. These describe vehicle capability, not merely station rating. SA-693 also has a mismatched wheel title | Canonical actual AC/DC maxima null. Conditional table11/330 claims can remain visible but not resolved or rankable; never silently choose22/350 |
| EQA / G580 | [EQA table](https://www.mercedes-benz.com.au/passengercars/models/suv/eqa/overview.html):AC11/DC100; [G580 table](https://www.mercedes-benz.com.au/passengercars/models/suv/g-class-electric/overview.html):AC11/DC210 | G580 SA-84B22kW is explicitly **not included** in the page default | No conflict with base11kW. Optional22kW equipment is a separate conditional claim, not a replacement of base charging |

The conservative evidence JSON keeps wider holds, including CLA350 AC; this memo narrows the reasoning without pretending to settle actual hardware. An integrator may retain exact-table claims with `status: conditional`, explicit scope and conflict notes while keeping the variant's resolved comparable field null. If the UI has only one unlabeled scalar, preserve null.

## Minimal safe normalized mapping

Use current table facts directly for the eight named grades, with source/date/locator and a generation string such as “Current Australian manufacturer-listed specification checked 10 October 2026; formal model year unverified”. Existing `current_or_order_listed` is acceptable only if the UI explicitly says **listed; orders and stock unverified** and does not imply order acceptance.

| Target field | Safe source mapping | Restriction |
|---|---|---|
| power_kw | specifications.power_kw |140/165/260/200/260/360/270/432kW in EQA/CLA200/CLA350/GLB250/GLB350/GLC/EQS/G order; exact table, not feature copy |
| battery_usable_kwh | specifications.battery_usable_kwh |70/58/85/85/85/94/112/117kWh, same order; never map to gross or unqualified battery_kwh |
| seats | specifications.seats |5/5/5/7/7/5/5/5; seating count does not establish occupied-row cargo |
| dc_charge_time_min | specifications.dc_10_80_min |35/20/22/22/22/22/25/29min; basis must remain10–80% SOC (net), conditions/equipment dependent; not a universal charging-curve result |
| dc_peak_kw | uncontested exact-table values |EQA100, CLA350320, GLB250/350320, GLC330, G580210kW. CLA200 and EQS rules above; station-rating field stays null |
| ac_kw | EQA11 and G58011 |Other records follow scoped conflict handling above; do not map a cable's rating to vehicle charger capacity |
| warranty_years | warranty.vehicle_years |5 years private use, unlimited distance; publish full applicability and commercial exceptions separately |
| battery_warranty_years / km / retention | scoped warranty fields |GLB remains null. EQA/CLA/GLC/G5808 years / 160,000 km; EQS10 years / 250,000 km;70% SoH remedy threshold and full terms. Commercial exceptions remain visible |
| price_aud, range_km, drive, cargo, dimensions, torque, acceleration, tow | null in the minimal live-table variant |Do not import offer-only/historical values across unspecified MY, wheel, grade or measurement scope. A4MATIC trim label can remain literal without inventing a normalized drive proof |

For each fact, use the existing fact envelope: variantId, key, value, unit, basis, comparisonBasis, status, sourceIds, date, market AU, exact-grade scope, qualifications and issues. Source URLs, locators and hashes already exist in the evidence JSON. Do not use `status: standard` to mean that an unresolved charging fact is resolved, or that a current listing is confirmed stock.

Exact offer WLTP470/554/710km, wheels, dimensions, acceleration and braked/unbraked towing may be displayed **only inside the corresponding held offer evidence**. They should not populate generic live-table variants. All three offers have NEW_CARS versus CPO/DEMO metadata; no VIN/registration proof. EQS also has an arrival date after the audit date. The offer's explicit MY and other source claims can be true while its NEW status remains unresolved.

Do not discard useful named-grade technical records just because stock remains uncertain; equally, do not let a technical record resolve the stock gate. No application or catalogue data files were changed by this recommendation.

Additional source recheck: GLC preview article was freshly retrieved on 2026-10-10; snapshot `mercedes-passenger-sources/mb_glc_article.html`, SHA-256 `c7f8ec6ae7e3f083ac6e8b96544d7bf8a2b5b8e4afd2635a1ba9a35f16e81fe2`. Existing primary source snapshots and exact JSON locators remain in the evidence bundle.
