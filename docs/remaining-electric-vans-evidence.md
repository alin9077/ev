# Remaining Australian electric vans: consolidated evidence

As of 10 October 2026. Research only; no dealer contact, orders or application edits.

## Result

- Six current/current-listed manufacturer configuration records: two Kangoo E-Tech, two Master E-Tech, one E-Partner, one E-Expert
- One separately stored pre-delivery configuration: Ford Transit City MY27, manufacturer expected customer deliveries November 2026
- Eight fresh exact NEW advertisements added: two older-MY Kangoo SWB, two older MY24 E-Partners and four E-Experts. No physical stock or accepted factory order verified
- Existing four NEW Ford Custom ads and completed LDV/Farizon/Mercedes research are referenced, not duplicated
- Custom upgraded-spec epoch and full-size E-Transit exact-current-MY holds remain unresolved

The number of records is not a count of fully verified, currently deliverable configurations. Exact-stock technical equivalence has not been established. Each field retains its source, date, measurement basis and hold.

## Integration essentials

1. Renault Kangoo: use visible exact electric-column values; hidden obsolete PDF text is rejected. Current MY remains held despite a MY26 asset filename. Do not use older MY24/MY25 stock as current brochure equivalence
2. Renault Master: MY26 L2H2/L3H2 EV87 are current listed configurations, with actual arrival/order acceptance unverified. H2-2026 forecast is not arrival proof. Optional 22 kW AC deletes V2L; no electric high-roof copy from diesel
3. Peugeot E-Partner: current newer equipment/page has no matching exact-MY technical matrix. MY23 reference and MY24 NEW two-seat stock are separate. Payload and extended-cargo values remain held
4. Peugeot E-Expert: normalize range/cycle to null because current primary sources disagree NEDC/WLTP. Keep AC-time and extended-cargo label holds; useful dimensions/mass/equipment remain available
5. Transit City: primary expected delivery date now verified; keep as pre-delivery and outside current-NEW availability claims. Preserve cargo methods and 10–100% AC versus 10–80% DC

See remaining-electric-vans-integration.md for the implementation handoff. Full field-level data and raw/text/visual snapshot hashes are in the JSON and worker artifacts.

# Renault Australian electric vans: evidence review

As of 10 October 2026. Read-only research in the assistant's own environment. No dealer contact, enquiries, reservations, orders, user-computer access, cloud tasks or app edits.

## Result and integration decision

Four configuration evidence records:

1. Kangoo E-Tech SWB EV45 90kW, 45 kWh usable
2. Kangoo E-Tech LWB EV45 90kW, 45 kWh usable
3. Master E-Tech MY26 MWB standard roof / mid-roof L2H2 EV87
4. Master E-Tech MY26 LWB standard roof / mid-roof L3H2 EV87

The first two are current Australian manufacturer-family listings. The last two are currently listed and were announced for second-half-2026 arrival, but actual Australian arrival and accepted factory orders remain unverified. Current listing, anticipated launch, order template and exact NEW stock are distinct statuses.

Two fresh exact NEW dealer advertisements passed: both Kangoo SWB, one MY24 and one dealer-labelled MY25. Neither establishes equivalence to the current brochure's equipment. No fresh current-MY26 NEW advertisement passed; no accepted LWB or Master stock advertisement passed. This is a bounded research finding, not national proof of absence.

Keep commercial vans outside passenger and whole-market winner rankings. Compatible published manufacturer fields may be compared with their qualifications; charge times here do not form a common 10–80% cohort.

## Kangoo E-Tech

### Current primary sources and model year

The [current Australian model page](https://www.renault.com.au/vehicles/kangoo-e-tech/) lists SWB and LWB. Its [public page-data](https://www.renault.com.au/page-data/vehicles/kangoo-e-tech/page-data.json) links an asset formally named Kangoo_MY26_Brochure.pdf. The [brochure](https://cdn.cms-uploads.i-motor.me/v6fbkwq8gztbplivhmua7vviu593) and [specification sheet](https://cdn.cms-uploads.i-motor.me/3ehi49lwrqk0up6mfmtifnd194rb) are dated April 2026. The brochure PDF itself does not print MY26; the filename is the available manufacturer MY indication. Exact current order/build MY is held rather than inferred from the date.

The brochure download landing page's initial HTML omits its href, but its public Gatsby page-data contains the actual CDN link. That route downloads an identical brochure hash to the model-page asset. No lead form was submitted.

### Exact electric specification matrix

Values below are from PDF file page 8, exact SWB/LWB E-Tech columns, visually checked.

| Field | SWB | LWB |
|---|---:|---:|
| Overall length | 4,488 mm | 4,910 mm |
| Width excluding / including mirrors | 1,859 / 2,159 mm | 1,859 / 2,159 mm |
| Unladen height | 1,830 mm | 1,830 mm |
| Wheelbase | 2,716 mm | 3,100 mm |
| Minimum clearance | 162 mm | 162 mm |
| Kerb / tare as published | 1,707 / 1,707 kg | 1,822 / 1,822 kg |
| GVM | 2,230 kg | 2,490 kg |
| GCM | 3,730 kg | 3,990 kg |
| Payload | 523 kg | 668 kg |
| Cargo volume | 3.3 m³ | 4.2 m³ |
| Cargo length | 1,806 mm | 2,230 mm |
| Maximum cargo height | 1,215 mm | 1,248 mm |
| Wheelarch width | 1,248 mm | 1,248 mm |
| Kerb-to-kerb turning circle | 11.31 m | 11.75 m |
| Braked / unbraked towing | 1,500 / 750 kg | 1,500 / 750 kg |

Both: front-wheel drive, 90 kW / 245 Nm, single-speed automatic, synchronous coiled-rotor motor, lithium-ion battery with cooling system, 45 kWh explicitly usable. Gross capacity and chemistry subtype remain unknown. Manufacturer claims 286 km WLTP combined and 175 Wh/km; test payload is not disclosed. Cargo-volume measurement method is unstated. Payload is a standard-vehicle mass allowance, not cargo remaining after occupants or fit-out. Towball and axle limits are unverified.

The generic illustrations on pages 6–7 show different heights, widths and clearance. The exact electric matrix controls these records, and the differences remain recorded. PDF extraction also exposes obsolete invisible tables beneath those drawings, including 600/800 kg payloads. Those are absent from the rendered page and must not be imported.

### Charging

Manufacturer vehicle maxima are 22 kW AC and 80 kW DC, both standard. The charging table on brochure file page 8 is expressed as driving distance recovered, not state-of-charge windows:

- 22 kW public AC: 286 km recovered in 2h25
- 80 kW fast public DC: 286 km recovered in 1h25
- DC: 170 km recovered in 27 minutes on pages 6–8, but 30 minutes on file page 13 / printed page 16
- Fast-station footnote requires at least 80 kW; this is distinct from the separately stated vehicle maximum

No 10–80%, 0–100% or phase-specific time is inferred. Mode 3 cable is included; domestic Mode 2 cable is an accessory. A model-specific Type 2-to-Type 2 accessory corroborates AC connection type; DC connector and V2L output remain unverified in current primary material.

### Equipment and ownership

Current electric-column standard equipment includes 7-inch driver display, 8-inch Easy Link screen with compatible wireless phone mirroring, AEB, lane keeping, driver attention warning, traffic-sign recognition, rear sensors/camera, cruise/speed limiter, climate control, dual unglazed sliders, 180-degree unglazed barn doors, glazed solid bulkhead and 16-inch steel wheels. Electric versions have a tyre inflation kit, not a full-size spare.

Adaptive cruise, blind-spot intervention, front/side sensors, navigation, wireless phone charging and heated leather wheel are Comfort Pack items. LED headlights are in the Visibility Pack. Digital rear-view mirror is optional; the current PDF warns some 2026-built vans lack it, while the webpage still names 2025-built vans. Verify the exact vehicle.

Current manufacturer cover: five years/100,000 km vehicle; eight years/160,000 km traction battery with an explicit advertised 70% capacity threshold; five years roadside assistance. Full capacity-measurement procedure, remedy and exclusions were not located. Do not promise automatic new-battery replacement. Service interval is 12 months/30,000 km.

### Price basis

OEM public model data contains $61,990 SWB and $63,990 LWB in a price field, but the visible page says POA and the surrounding disclaimer describes postcode-dependent driveaway estimates. The evidence retains these as raw configurator prices with unverified basis. Secondary MY26 RedBook data labels the same figures excluding government charges; it remains secondary price-when-new evidence. A fresh exact national MLP or manufacturer driveaway offer is not asserted. No October national Kangoo E-Tech offer, expiry or ABN-only condition was established.

## Master E-Tech

### Listing and launch hold

The [E-Tech route](https://www.renault.com.au/vehicles/new-master-van-e-tech/) currently redirects to the [combined Master page](https://www.renault.com.au/vehicles/new-master-van/). Both EV87 body variants are in its live public data. The [16 June manufacturer announcement](https://www.renault.com.au/news/new-generation-renault-master-van-price-and-specs-confirmed-for-australia/4064/) explicitly names MY26 and announces electric arrivals in the second half of 2026. That forecast does not prove arrival on 10 October.

The [MY26 technical sheet](https://cdn.cms-uploads.i-motor.me/0v18qkpsdeh5cmtoj06x40g9nwis) and [brochure](https://cdn.cms-uploads.i-motor.me/dolxhoxnbnp8ipzara5pmtms1pqo) have explicit MY26 footers and May 2026 publication dates. Current page-data corroborates the announced $77,990 MWB and $79,990 LWB RRP, excluding on-road costs. Exact driveaway prices and order acceptance are unknown.

### Body and technical configuration

| Field | MWB L2H2 | LWB L3H2 |
|---|---:|---:|
| Length / wheelbase | 5,685 / 3,585 mm | 6,315 / 4,215 mm |
| Width excluding / including mirrors | 2,080 / 2,466 mm | 2,080 / 2,466 mm |
| Height | 2,498 mm | 2,498 mm |
| Cargo volume | 10.8 m³ | 13 m³ |
| Cargo length / height | 3,225 / 1,885 mm | 3,857 / 1,885 mm |
| Payload | 1,164 kg | 1,084 kg |
| Unladen mass | 2,336 kg | 2,416 kg |
| Tare mass, literal source label | 2,344 kg | 2,424 kg |

Both: 3 seats, front-wheel drive, 105 kW / 300 Nm, 87 kWh storage capacity, 409 km WLTP combined, 3,500 kg GVM, 5,500 kg GCM, 2,000/750 kg braked/unbraked towing. Battery usable/gross split, chemistry, voltage and rated consumption remain unknown.

The manufacturer calls the H2 roof standard in the launch and mid-roof in the technical matrix. These are synonyms for the same body, not extra trims. No current Australian electric high-roof L3H3, two-seat or 40/52 kWh variant was established. Generic 1,973 kg payload and 14.8 m³ claims belong to diesel versions.

Cargo width is 1,537 mm measured 169 mm above the floor; wheelarch width 1,380 mm. Side opening is 1,312 × 1,753 mm, rear entry maximum height 1,755 mm. Method for cargo volume is unspecified. The source's tare values are 8 kg greater than its unladen values; both labels are retained without correction. Payload matches GVM minus unladen. Actual mass, occupants, options, towball and axle limits still constrain operation.

### Charging and equipment

Standard: 11 kW AC, 130 kW DC. Manufacturer explicitly specifies 15–80% in about 38 minutes at a 130 kW DC station, 5h52 at 11 kW AC, or 30h06 at 2.1 kW AC. These are conditional indicative times. No 10–80% conversion is made.

Standard 11 kW variants have V2L. The optional 22 kW AC configuration explicitly deletes V2L. Output power, adapter inclusion and option price remain unknown.

Exact electric equipment columns show a 7-inch digital driver cluster, 10-inch openR Link with Google built-in, phone mirroring, rear camera/sensors, AEB, lane keeping, attention warning and blind-spot warning. Optional front/side parking sensors delete blind-spot warning. Standard loading equipment includes a left unglazed slider, glazed 270-degree barn doors, glazed steel bulkhead, floor/wall anchors and full-size underbody spare. Climate control, mobile office and other packs remain optional. Google/My Renault connected services are complimentary for five years from delivery, subject to compatibility/connectivity terms.

Vehicle warranty is five years/unlimited km for eligible new commercial vans; conversions excluded. Battery cover is eight years/160,000 km, whichever first. No Master-specific numeric retained-capacity threshold was found. The Kangoo's 70% must not be transferred. Roadside assistance is five years; service interval 12 months/30,000 km.

## Fresh exact NEW advertisements

### Peter Warren Renault SWB T34068A

[Exact NEW ad](https://www.peterwarrenrenault.com.au/cars/new-mineral-white-solid-2025-renault-kangoo-e-tech-t34068a)

- VIN VF1RFK009T0877199; $62,990 driveaway; 8 km
- Advertised 2025; raw vehicle description says XFK MY25 L1 EV45 SWB
- Build April 2026; compliance June 2026, each separate from MY25
- Fresh direct HTML has NewCondition and the same VIN/stock; no physical stock, unregistered status or warranty start independently verified
- EV45 badge only; explicit numeric battery capacity/basis not located in the direct exact ad

### Adrian Brien Renault SWB T22763

[Exact NEW MY24 ad](https://www.adrianbrienrenault.com.au/new-cars/for-sale/renault/kangoo-e-tech/2024/l1-ev45/xfk-my24/3805255/)

- VIN VF1RFK001P0862685; $45,990 driveaway; explicit MY24
- Fresh direct odometer and registration fields show dashes
- Earlier same-VIN Carsales data says 45 kWh, March 2024 build and zero km; retained only as cached secondary corroboration
- Exact MY24 vehicle, not proof the April-2026/MY26-named brochure applies to it

### Exclusions

- Peter Warren LWB T33606A / VF1RFK005S0876050: fresh exact dealer page is DEMO at $65,990, registration GCJ81Z. Historical NEW cache and New Arrival label do not override this
- Adrian Brien LWB T22684 / VF1RFK002P0862601: fresh exact URL redirects to general stock and current new inventory no longer lists the LWB
- Adrian Brien T22765/T32019: insufficient fresh exact dealer recheck; not counted
- Carsales Master SHRM-AD-6541518 and SHRM-AD-6541519: explicitly Carsales-created generic order templates with no exact stock/VIN. Do not establish orders accepted or Australian arrival
- Master LWB template gives 2,778 mm height despite L3H2/mid-roof identification; manufacturer's exact electric table is 2,498 mm. The template height is rejected

## Audit

The JSON includes field-level source IDs and locators, 197 exact source anchors, 23 source snapshots, 20 text hashes, retrieval timestamps, failed fetches, explicit nulls, conflicts and six visually checked PDF renders. Validation passed for 289 value claims, including 74 null claims, and two unique NEW VINs. Research artifacts only; no catalogue/app changes.


# Peugeot Australian electric vans: remaining evidence

As of 10 October 2026. Read-only research; no enquiries, order/reservation submission, physical inspection or application edits.

## Result

Two current named Australian configurations, with explicit unresolved fields. Six fresh identifiable NEW advertisements: two older MY24 E-Partners and four E-Experts. None is proof of physical stock or accepted factory allocation. No current-facelift E-Partner NEW unit was established.

- E-Partner: current page and configurator identify Pro Long Auto, 50 kWh, 100 kW, 258 km WLTP combined and newer 10-inch/digital-mirror equipment. Formal current MY is not stated. The electric brochure index still points to MY23, which cannot supply missing facelift specifications. The separate current MY26 Partner PDF was also inspected: it contains petrol Pro/Premium columns only, no BEV column. Keep the exact-current technical-matrix hold
- E-Expert: current linked brochure is explicitly MY24, issued November 2025. Dimensions, mass and equipment are available. Its 330 km range is NEDC in both brochure and configurator but WLTP on the live model page. Hold normalized range/cycle rather than silently selecting one
- Peugeot 50/75 kWh figures have no verified gross/usable basis. The 100 kW DC charging figure is a test-charger/current label, not separately verified vehicle peak acceptance
- Commercial cargo measures remain separate from passenger boot litres, and all whole-record/passenger ranking flags remain false

Sources: [E-Partner page](https://www.peugeot.com.au/models/new-e-partner-van.html), [E-Partner configurator](https://configurator.peugeot.com.au/build-and-buy/build/vehicle/?model_id=1588&dp=2765), [E-Expert page](https://www.peugeot.com.au/models/expert-van/e-expert.html), [E-Expert MY24 sheet](https://www.peugeot.com.au/content/dam/peugeot/australia/models/brochures/Peugeot_E-Expert_MY24_Spec_Sheet_1125.pdf), [brochure index](https://www.peugeot.com.au/tools/download-brochure.html)

## Current E-Partner: known fields and holds

| Field | Current manufacturer publication |
|---|---|
| Grade/body | Pro Long Auto; long-wheelbase panel van |
| Formal MY / named roof / seat count | Not established |
| Motor | 100 kW, 260 Nm; exact current primary axle/motor-count not established |
| Battery | 50 kWh lithium-ion; usable/gross/cathode unknown |
| Range | Up to 258 km WLTP combined; test payload unstated |
| DC time | 30 min 0–80% using 100 kW DC charger |
| AC capability/time | Current epoch unknown; do not copy MY23 7.4 kW |
| Exterior | 4,753 mm long × 2,107 mm with mirrors × 1,880 mm high |
| Load dimensions | 2,167 mm to bulkhead × 1,527 mm maximum width × 1,243 mm high |
| Nominal load volume | Detailed dimensions block says 3.9 m³; arrangement/method unspecified |
| Maximum/extended volume | Held: 4.4 m³ on new E-Partner page and 4.3 m³ on combined Partner page lack arrangement mapping |
| Payload | Held: 717 kg in headline/dimensions, 780 kg in modularity copy; historical MY23 is 753 kg |
| Towing | Current page says 750 kg towing weight; braked/unbraked basis unstated |
| Current mass/wheelbase | Not established from matching current technical sheet |

Current equipment supported by the exact electric page/configurator: 10-inch central screen, 10-inch digital cluster, digital rear-view mirror and lateral side view, wireless CarPlay/Android Auto, AEB, blind-spot detection, lane-departure warning, 180-degree reversing camera with top-down view, front/rear sensors, glazed ISO27956 bulkhead, dual side sliders, 180-degree rear doors, 16-inch steel wheels and Mode 3 Type 2 cable. These do not transfer onto older MY24 stock.

The manufacturer currently says “available to order only”. That is advertised ordering evidence, not accepted factory-order/allocation proof. The raw configurator has a hidden Coming Soon template; it is not an availability claim. Its dp=null $0 is also a placeholder. The official model-page link's postcode 2765 configuration returns $60,990 RRP and $66,467 indicative private-buyer driveaway (registration $1,237.21, dealer delivery $1,990, stamp duty $2,250; final total displayed rounded). This is not the user's postcode or a national fixed offer. No MY26 is silently attached to the price.

## E-Expert MY24: useful technical subset

| Field | MY24-linked manufacturer sheet |
|---|---|
| Grade/body | Pro Long Auto, long-wheelbase panel van |
| Seats / motor | 3; one motor, 100 kW / 260 Nm |
| Battery | 75 kWh lithium-ion; usable/gross unspecified |
| Range | Normalized null; published 330 km NEDC conflicts with live page's WLTP |
| AC onboard rating | 11 kW |
| DC time | Approximately 45 min, 0–80% using 100 kW DC |
| Exterior L × W folded × H | 5,333 × 1,920 × 1,948 mm |
| Width mirrors extended / wheelbase | 2,204 / 3,275 mm |
| Tare / GVM / payload | 2,052 / 3,053 / 1,001 kg |
| Braked / unbraked tow | 1,000 / 750 kg; GCM and towball maximum not established |
| Load length | 2,780 mm to bulkhead; 4,024 mm through flap; 2,862 mm with bulkhead removed |
| Load width / between arches / height | 1,628 / 1,258 / 1,397 mm |
| Load volume | 6.1 m³ nominal; method unstated |
| Side opening W × H | 935 × 1,241 mm |
| Rear opening W × H | 1,282 × 1,220 mm |
| Tyres / spare | 215/65 R16 steel wheels / full size |

Mirrors-folded width is not body-only width. Tare carries a generic unoccupied/unladen full-fluids/10-litres-fuel footnote, not an independently measured electric kerb definition. The individual van must be weighed; maximum payload is not promised simultaneously with maximum trailer load. Do not infer no towing from unknown GCM.

Current MY24 equipment includes heated driver's seat and steering wheel, dual-zone climate, keyless entry/start, 10-inch central display and digital cluster, wireless CarPlay/Android Auto, AEB, BSD, active lane keeping, programmable cruise (adaptive not established), 180-degree reversing camera/top-down view, front/rear sensors, glazed load-through bulkhead, ModuWork worktable and underseat storage, six tie-down rings, dual sliders, glazed 180-degree rear doors, halogen automatic/high-beam headlights, heated/folding mirrors and Mode 3 Type 2 cable.

The current configurator lists $79,990 RRP. The [national offer](https://www.peugeot.com.au/buy/new-car-offers/vans.html) is from $56,990 driveaway on any MY E-Expert Pro Long Auto, at participating dealers while limited stock lasts. Fleet/government/rental excluded; premium/metallic paint extra; final dealer/on-road costs can vary; no combination with other concessions. Vehicle, 12 months registration, stamp duty, applicable LCT, estimated CTP and recommended dealer delivery are included. No fixed expiry is published.

### Preserve these contradictions

1. Range: current MY24 PDF and configurator say NEDC; live page and old August 2024 MY23 sheet say WLTP. The number 330 does not resolve the cycle
2. AC time: sheet/page say 7h30 0–100% on 11 kW; configurator says 11h9 on 11 kW with no visible SOC window. Normalized time remains null
3. The surprising 23-hour 0–100% claim at 7.4 kW is genuinely visible in both current PDF and page. Retain as published with a caution, no arithmetic replacement
4. PDF p6 says 6.1 m³ load volume, then 6.6 m³ “excluding load through bulkhead”. Visual review confirms this apparent label error; do not silently relabel the latter as including. Extended volume remains null

## Exact NEW advertisements

All six are fresh direct HTTP 200 NEW pages, active/unarchived embedded records and InStock Product metadata. Their embedded registered=false is a dealer assertion, not independently verified registration or warranty commencement.

| Stock | VIN | Advertised year / formal MY | Build / compliance raw dates | Odometer | Dealer driveaway |
|---|---|---|---|---:|---:|
| [PE905999F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-partner/2023/pro/k9-my24/3621599/) E-Partner | VR3EAZKXZPJ905999 | 2023 / MY24 | 2023-10-01 / 2024-03-01 | 3 km | $66,686 |
| [PE907870F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-partner/2023/pro/k9-my24/3621609/) E-Partner | VR3EAZKXZPJ907870 | 2023 / MY24 | 2023-11-01 / 2024-03-01 | 3 km | $66,686 |
| [PE018750F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-expert/2024/pro/ek0/4038571/) E-Expert | VF3VTZKUXRZ018750 | 2024 / unknown | 2024-04-01 / unknown | 3 km | $56,990 |
| [PE054918F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-expert/2024/pro/ek0/3934721/) E-Expert | VF3VTZKU4RZ054918 | 2024 / unknown | 2024-04-01 / unknown | 3 km | $56,990 |
| [PE042213F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-expert/2024/pro/ek0/3934809/) E-Expert | VF3VTZKU5RZ042213 | 2024 / unknown | 2024-07-01 / unknown | 3 km | $57,490 |
| [PE042606F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-expert/2024/pro/ek0/3934811/) E-Expert | VF3VTZKU2RZ042606 | 2024 / unknown | 2024-07-01 / unknown | 15 km | $56,990 |

Dealer display: Inchcape PEUGEOT Melbourne City; embedded seller: Trivett City Peugeot, Melbourne VIC. Day 01 may represent month-only dates. Each E-Partner directly claims 50 kWh and two seats; each E-Expert directly claims 75 kWh and three seats. Both groups identify LWB in the structured dealer record. No roof designation is given. E-Expert 2024 heading and generic Model Year field are not an explicit MY suffix; formal ad MY stays null. Manufacturer current-sheet MY24 and unit build dates remain distinct.

The E-Partner heading/generic Model Year field now says 2023 while series explicitly says K9 MY24. Old incoming URL/search cache said 2024 and POA; fresh raw record wins for observed advertisement values. Neither two-seat MY24 ad validates facelift equipment.

PE042606F is the same VIN as cached East Coast 39047. The old East Coast URL now returns 404; its fresh Inchcape ad is counted once. Stale East Coast $79,990/8 km/2026 compliance-year presentation is not retained as current data.

Excluded: PE501253 MY25 is Demo with 2,120 km and registration; U155477 MY23 is Used; Bayside S3004007 is Used despite 13 km and a “New Arrival” badge. A short odometer or no previous private owner does not establish NEW.

## Warranty and legacy

Current AU commercial manufacturing-defect cover is 5 years/200,000 km, whichever first. E-Expert's current model page states battery 8 years/160,000 km from warranty start. E-Partner's March 2023 release states the same battery duration, but current exact facelift conditions were not recovered; preserve as historical scope. No AU van capacity-retention threshold is verified. Do not import PHEV-only or overseas 70% language. General page/model intro and LCV corrosion detail conflict (12 versus 5 years); do not publish a normalized van corrosion term without resolving it.

[Warranty overview](https://www.peugeot.com.au/owners/warranty.html), [linked terms](https://www.peugeot.com.au/content/dam/peugeot/australia/owners/documents/Peugeot-Warranty-terms-conditions_REV.pdf), [E-Partner historical announcement](https://www.peugeot.com.au/brand/news/peugeot-s-electrification-journey-continues-with-e-partner.html)

MY23 Partner/e-Partner reference remains in JSON: two seats, 50 kWh unspecified basis, 7.4 kW OBC, 258 km WLTP, 30 min 0–80% DC, 7h26 0–100% at 7.4 kW, 2,385 kg GVM/1,632 kg tare/753 kg payload, 750/750 kg tow and 74 kg towball. Those facts are not current facelift facts or automatic MY24 stock equivalence. The brochure column was visually verified separately from petrol variants.

## Audit

227 field source references and 56 source raw/text hashes checked; all pass. Six unique stock VINs; all accepted pages are freshly NEW. PDF pages were visually checked for seat columns, charging/range labels, weights and the cargo label anomaly. Full provenance and explicit nulls are in `peugeot-remaining-worker.json`; raw sources and extracted stock objects are under `remaining-electric-vans-sources/`. No app edits.


# Ford van release-epoch follow-up

As of 10 October 2026. Read-only Australian-market audit; no dealer contact, orders, stock re-audit or app edits.

## Outcome

Transit City's primary delivery-date and model-year gaps are resolved. The Custom technical-epoch and full-size E-Transit current-MY holds remain.

### Transit City: MY27, pre-delivery

Ford's release dated **9 September 2026** says first Australian customer deliveries are expected **from November 2026**, from **AUD 50,000 recommended driveaway**. Its price footnote explicitly identifies **Transit City BEV MY27**. This is an expected start date, not evidence that delivery or physical dealer stock exists on 10 October. [Dated Ford AU/NZ release, lines 12, 75 and 101](https://www.fromtheroad.ford.com/img/en/articles/2026/electrified-ford-transit-city-revealed-australia-new-zealand)

The current product page links a **2027MY** specification brochure issued **8 September 2026**. It describes one SWB/FWD configuration with three seats. The field-level JSON contains 40 specification fields, including explicit unknowns and source locators. Selected verified figures:

| Field | Australian MY27 specification |
|---|---|
| Motor | Single front motor; 110 kW, 260 Nm |
| Battery | 56 kWh usable, LFP; gross unknown |
| Range | 254 km WLTP combined; 380 km WLTP city |
| Consumption | 23.8 / 15.9 kWh per 100 km combined / city |
| DC charging | 87 kW stated vehicle rating; about 33 minutes, 10–80% |
| AC charging | 10–100%: 8 hours on 7.4 kW; 5.5 hours on 11 kW |
| Dimensions | 4,985 × 1,885 × 1,991 mm; width excludes mirrors, height at kerb |
| Wheelbase | 3,060 mm |
| Kerb / GVM / GCM | 1,915 / 3,000 / 3,000 kg |
| Payload | 1,085 kg including occupants, cargo and additions |
| Cargo volume | 6.4 m³ loose-material maximum; 5.75 m³ VDA, with bulkhead |
| Load length | 2,620 mm to bulkhead; 2,770 mm including hatch |

[Australian brochure, page 4; date on page 6](https://www.ford.com.au/content/dam/na/ford/en_au/nameplate/transit-city/2026/overview/2027-my-transit-city-specs-08-sep.pdf)

Service is **12 months / 30,000 km, whichever first**, from the local release. Do not import the European service interval or its extra body configurations. The local release calls range targeted; the sheet uses estimated WLTP. Cargo load during testing is unstated. Keep these qualifications. [Ford AU/NZ release, lines 22–30, 53 and 76–90](https://www.fromtheroad.ford.com/img/en/articles/2026/electrified-ford-transit-city-revealed-australia-new-zealand)

Important holds:
- Towing and AC onboard-charger maximum are not explicitly established; do not infer them from GCM or charger test power
- The brochure/release say wireless phone integration while the live product page says USB; connection mode is held
- Brochure maximum cargo and VDA are different measures
- The AUD 50,000 offer is recommended driveaway at participating dealers, with customer eligibility and availability conditions; it is not MLP or a VIN-specific quote
- The Evie voucher campaign ends 31 December 2026; do not transfer its end date to the base driveaway price

[Current product page](https://www.ford.com.au/trucks-and-vans/transit-city/), [official offers and footnote 16](https://www.ford.com.au/latest-offers/)

Recommended market change: MY27; one named SWB FWD configuration; `manufacturer_expected_first_deliveries_2026_11`; `pre_delivery_orders_open`; preserve advertised order status and unverified stock. Remove the obsolete statement that November is supported only by secondary reporting. Keep City separate from currently deliverable NEW stock and passenger rankings.

### E-Transit Custom: release mapping still unresolved

No Australian primary production change-point was found to reconcile the current MY26.50-labelled 71.45 kWh brochure with the existing MY27.25/March 2027 report. European Ford upgrade material cannot establish Australian stock applicability. Preserve the existing battery/range/charging mapping holds, and keep all four accepted NEW advertisements attached to their exact MY/VIN identities.

The complete prior matrix and stock evidence remain in `ford-electric-vans-manufacturer.json/.md` and `ford-electric-vans-stock-worker.json/.md`; the follow-up JSON references their hashes rather than copying that broad audit. [Current AU specification brochure](https://www.ford.com.au/content/dam/Ford/au/nameplate/transit-custom/brochure/specs-brochure/2026my-transit-custom-specs-6aug.pdf), [existing dated MY27.25 report](https://origin.carexpert.com.au/car-news/2027-ford-transit-custom-phev-e-transit-custom-prices-cut)

### Full-size E-Transit: useful later-MY context, not a technical resolution

Ford Australia's app-compatibility table identifies **2024.75–Current** E-Transit modem compatibility alongside an earlier 2023.00–2024.50 band. This is official later-MY nomenclature, but it supplies neither the precise current MY nor roof-specific technical specifications. Keep current exact MY and mass/payload conflicts held; retain MY23.50 specifications as dated reference. [Ford App page, lines 163–170](https://www.ford.com.au/fordpass/)

## MY27 equipment matrix supplement

The JSON now separates 64 standard-equipment fields, three factory paint options, and 16 unknown/conflicting fields. There are no inferred unavailable items.

Standard equipment includes a 12.3-inch centre touchscreen and 7-inch configurable instrument cluster; two speakers, DAB+/FM and Bluetooth; three cloth seats, a six-way manually adjusted heated driver seat, fixed dual passenger seat, and keyless start. Parking equipment is a rear camera with guidelines plus front/rear sensors. Driver assistance includes adaptive cruise with Stop & Go, AEB, forward-collision warning, lane keeping/departure warning, intelligent speed assistance, driver-impairment monitoring, TPMS, stability/traction control and Auto Hold.

The matrix also records halogen headlights/tail-lights with LED DRLs, 16-inch steel wheels and covers, left sliding door, rear barn doors, windowless metal bulkhead, eight tie-down loops, floor liner and half-height cargo trim. Frozen White is standard; Ingot Silver, Blue Panther and Panther Black are extra-cost factory paint options. Equipment markers and field-level locators are retained. [Brochure, page 4](https://www.ford.com.au/content/dam/na/ford/en_au/nameplate/transit-city/2026/overview/2027-my-transit-city-specs-08-sep.pdf), [local launch equipment, lines 37 and 54–65](https://www.fromtheroad.ford.com/img/en/articles/2026/electrified-ford-transit-city-revealed-australia-new-zealand)

Phone compatibility is standard, but its wired/wireless connection mode remains null because primary sources conflict. Included charging cables/EVSE, keyless entry, heat pump, 360-degree camera and other unlisted equipment remain unknown rather than unavailable. All prior warranty and pre-delivery qualifications are unchanged.

## Audit trail

`ford-vans-epoch-followup.json` contains outcomes, proposed market-row changes, one City exact-configuration record, six primary source entries, and a 17-file snapshot manifest. Source references and SHA-256 hashes pass validation. City payload arithmetic checks: 3,000 − 1,915 = 1,085 kg.

Snapshot folder: `ford-vans-epoch-sources/`. Ford's direct City PDF request returned HTTP 403. Saved sources are clearly labelled web-tool renderings, with source URLs and page/line locators, not raw HTML/PDF or a claimed visual PDF verification. No market data or app files were changed.
