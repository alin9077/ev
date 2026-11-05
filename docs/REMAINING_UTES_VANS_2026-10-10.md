# Remaining Australian electric utes and vans

Checked 10 October 2026. Read-only research proposal; application unchanged.

## Recommended integration subset

Seven exact configurations across four existing inventory families:

- KGM Musso EV MY26 2WD and AWD
- Kia PV5 Cargo MY26 S 4DR Long Range FWD
- Farizon V7E Standard Range 50 kWh and Extended Range 66 kWh
- Hyundai STARIA Load Electric 84 kWh FWD: standard Liftback and optional Twin Swing rear doors

Musso Black Edge is a 2WD styling/equipment package, not a third powertrain. STARIA has one Electric grade with two body-door configurations. Expanded STARIA indexes repeat the base records and must not add vehicles to counts.

Six core configurations have fresh exact dealer-New advertisements. STARIA Liftback is a current official offering without an exact New-unit match. No physical presence, unsold status, completed order acceptance or future delivery date was verified. No contacts, enquiries, orders or reservations were made.

Validation passes: 817 core fact fields and 1,170 total fact/equipment/package wrappers; 49 sources; 201 retained source files with matching SHA256 hashes. All 21 distinct PDF pages referenced by core facts/equipment/package evidence have corresponding visual review. Additional brochure pages were reviewed where needed to establish context. All seven records are excluded from automatic ranking pending class/method-aware review.

## Material corrections and explicit holds

- **Musso safety:** six airbags are fitted. ANCAP's 20 August 2026 alert and corrected current PDF override old eight-airbag advertising and stale embedded knee-airbag content. Black Edge must not imply AWD availability. Sources: `ancap_musso_safety_alert`, `kgm_musso_ev_my26_specs`
- **Musso towing and charging:** AWD maximum towball is 230 kg in the PDF versus 180 kg in official embedded page data; its normalized value stays null. The 300/100 kW charging numbers are station ratings. Current PDF times are 36/46 minutes at 10–80% SOC; older 20–80% prose stays separate
- **PV5 mass and warranty:** printed tare 1,955 kg is above printed kerb 1,910 kg. Preserve source declarations but hold normalized masses. The 740 kg maximum payload is not accessory/occupant-specific net freight load. Current model-page 8-year/160,000 km battery wording conflicts with linked pre-MY27 7-year/150,000 km terms and Commercial Use restrictions; confirmed MY26 battery years/km remain null
- **PV5 safety:** ANCAP Platinum/91% is a commercial-van collision-avoidance assessment, not a crash-star rating. AEB Backover is explicitly unavailable; RCCA must not be treated as equivalent. Source: `pv5_ancap`
- **Farizon stock:** East Coast stock 39435/VIN LMPA1KMB1TA540815 is now Demo/56 km/registered on the seller's own site, despite an old New/0 km syndicated ad. Exclude it from clean-new evidence. Current Bartons New SR/ER ads replace it. The expired homepage promotion is not current price evidence; the separately captured September–October offer is current
- **Farizon remaining uncertainty:** usable/gross battery split, official seating-count declaration, GCM/towball/axle limits and complete battery retention terms remain held. Dealer two-seat claims retain dealer-supported status. Preserve the exact 20–80% charging window and cargo-volume method uncertainty
- **STARIA charging:** the sheet's raw 350 kW maximum declaration may conflate station capacity with vehicle acceptance. Preserve it as a scoped declaration and retain station-conditioned times; normalized vehicle DC maximum remains null
- **STARIA safety and warranty:** Electric is explicitly unrated in ANCAP applicability, so the mixed-powertrain page's five-star badge cannot transfer. Commercial-van vehicle warranty is 5 years/160,000 km regardless of use; battery is 8 years/160,000 km with below-70% SOH and maintenance conditions. Sources: `staria_ancap`, `staria_warranty_terms`
- **STARIA load measurements:** mass ranges are family-level, not exact door-specific values. Do not derive an optimistic 1,082 kg payload from the lightest kerb value. The 450 km range is WLTP; consumption has a separate source-footnote qualification

## Integration rules

Reuse family IDs `kgm-musso-ev`, `kia-pv5-cargo`, `farizon-v7e` and `hyundai-staria-load-electric`. All four remain audit-only in the inspected app inputs; no duplicate detailed rows were found.

Keep exact MY/technical epoch, gross/usable/declared battery distinctions, charge SOC windows, station versus vehicle limits, complete-body masses, cargo measurement methods, and payload/towing conditions. Dealer listings prove advertised New status only. Source conflicts and nulls must remain visible; never fill them with overseas, arithmetic or unrelated-grade defaults. Foreign/future PV5 bodies and unsupported Black Edge/drivetrain combinations are outside the recommended subset.

## Detailed family reports


# KGM Musso EV MY26: Australian evidence proposal

Checked 10 October 2026. Read-only research; no application changes, enquiries, reservations or orders. The parent identified `kgm-musso-ev` as an audit-only family.

## Configuration outcome

One family and two factory drivetrain records:

- `kgm-musso-ev-my26-2wd`: MY26 2WD, front-wheel drive, 80.6 kWh, dual-cab ute
- `kgm-musso-ev-my26-awd`: MY26 AWD, 80.6 kWh, dual-cab ute

Black Edge remains a 2WD styling/equipment package under `expandedConfigurations`, adding no powertrain count. Its explicit restriction to 2WD takes precedence over a raw CMS association appearing in both grade arrays. The model page calls it a styling pack; the PDF labels its equipment column “2WD Black Edge”.

Sources: [Current Australian model page and public embedded configurator](https://kgm.com.au/models/musso-ev), [currently linked MY26 specification](https://kgm-rebuild-nextjs-postgres-assets-s3.s3.ap-southeast-2.amazonaws.com/KGM_Musso-EV-MY26_Specs%20and%20Features.pdf)

## Technical comparison

The JSON contains 233 source-guarded fact wrappers plus 123 individually sourced equipment fitment rows per drivetrain. Each positive fact links to a source, exact section/row, and PDF page where applicable. All three PDF pages were rendered and visually inspected, including merged cells and grade/pack columns.

| Metric | 2WD | AWD | Evidence/qualification |
|---|---:|---:|---|
| Motor layout | Front | Front and rear | PDF p1, Drivetrain |
| Combined output | 152 kW / 339 Nm | 266 kW / 630 Nm | Combined system output; do not sum motor peaks |
| Individual motors | Front 152 kW / 339 Nm | Front and rear each 152 kW / 339 Nm | PDF p1 |
| Battery | 80.6 kWh LFP | 80.6 kWh LFP | Declared capacity; gross/usable split unknown |
| Battery voltage | 371.2 V | 371.2 V | PDF p1 |
| WLTP combined range | 419 km | 379 km | PDF p1 and p3 footnote 2 |
| Combined consumption | 230 Wh/km | 260 Wh/km | WLTP; not towing/loaded-work-cycle results |
| Onboard AC charger | 10.5 kW | 10.5 kW | Vehicle rating |
| AC 0–100% | Approx. 10 h 20 min | Approx. 10 h 20 min | With 11 kW charger; PDF p1 |
| DC 10–80%, 300 kW station | Approx. 36 min | Approx. 36 min | Station rating, not vehicle DC maximum |
| DC 10–80%, 100 kW station | Approx. 46 min | Approx. 46 min | Same qualification |
| Kerb weight | 2,165 kg | 2,285 kg | PDF p1 |
| GVM / GCM | 3,070 / 4,870 kg | 3,090 / 5,390 kg | PDF p1 |
| Maximum payload | 905 kg | 805 kg | GVM minus kerb mass; people/accessories/towball loading matter |
| Braked towing | 1,800 kg | 2,300 kg | Subject to State regulations and towbar design |
| Unbraked towing | 750 kg | 750 kg | Same qualification |
| Towball download | 180 kg | Held: PDF 230 kg, embedded data 180 kg | Unqualified AWD value remains null |
| Seats | 5 | 5 | Explicit official configurator field, corroborated by exact dealer listings |
| Dimensions L/W/H | 5,160 / 1,920 / 1,750 mm | Same | Height includes roof rails in configurator; width mirror basis unstated |
| Wheelbase / clearance | 3,150 / 181 mm | Same | PDF p1 |
| Tub L/W/depth | 1,345 / 1,515 / 510 mm | Same | PDF p1 |
| Tub between arches / volume | 1,100 mm / 1,011 L | Same | Explicit current configurator fields |
| Wheels / tyres | 17-inch / 245/60 R17 | Same | Inflator kit, no claimed spare wheel |

Manufacturer charging times are approximate KGM test results affected by charger and battery conditions. Range is a laboratory combined-cycle result affected by use, weather, battery condition and configuration. No supported AU DC peak acceptance, acceleration, top speed, connector standard, gross/usable battery split or V2L output rating is filled from overseas specifications.

## Safety and equipment

Use six airbags. ANCAP’s [20 August 2026 consumer alert](https://www.ancap.com.au/media-and-gallery/media-releases/4f34de) confirms that Australian-supplied Musso EVs lack both centre and driver-knee airbags, despite earlier eight-airbag advertising. The current PDF and headline model data reflect six, but a stale driver-knee-airbag row remains in embedded model data. That row must not become a fitted-equipment claim. ANCAP described Musso EV as unrated; no applicable star score is supplied.

PDF pp1–3 support standard self-levelling rear suspension, adaptive cruise, lane centring, pedestrian AEB, blind-spot brake intervention, front cross-traffic brake/steering intervention, rear cross-traffic brake intervention, 3D 360-degree camera, front/rear parking sensors, and trailer sway control.

Comfort/equipment evidence includes 8-way powered front seats with 2-way lumbar, front heating/ventilation, heated outer rear seats and steering wheel, reclining/sliding split rear seats, dual 12.3-inch screens, CarPlay/Android Auto, wireless phone charging, six speakers, dual-zone climate, rear vents, LED lighting and acoustic windscreen. Wireless phone charging does not imply wireless CarPlay/Android Auto. V2L capability is advertised; power rating and adapter inclusion remain unknown.

Black Edge adds leather/suede seating and suede door inserts, a black steering-wheel bezel, stainless scuff plates, different front head restraints and black exterior details. It is explicitly restricted to Grand White or Space Black and to 2WD. No Black Edge AWD record is proposed.

## Price, offer and warranty

Current public configurator base prices and the [manufacturer launch/pricing page](https://kgm.com.au/news/kgm-presents-its-first-electric-ute-the-musso-ev) support private-buyer recommended drive-away pricing of AUD 60,000 for 2WD and AUD 64,000 for AWD. Black Edge adds AUD 2,000; metallic paint adds AUD 700. Buyer-specific dealer offers are stored separately.

The current [Musso EV servicing offer](https://kgm.com.au/offers) covers three years/60,000 km, whichever occurs first, for new vehicles both ordered and delivered 1 September–31 December 2026. It is limited to standard scheduled servicing, requires authorised KGM EV-accredited dealers and excludes specified wear/consumable/extra work. It runs from original registration, has combination restrictions and may change. The AUD 5,010 diesel Musso bonus explicitly excludes EV.

[Current Australian warranty terms](https://kgm.com.au/owners-and-service/warranty/warranty-terms) support seven-year/unlimited-kilometre vehicle cover and ten-year/unlimited-kilometre original high-voltage battery cover, subject to terms and exclusions. The battery SOH floor is 70%, measured with KGM diagnostics; range/charge-time changes are not the SOH test. Conventional 12 V battery cover is two years/30,000 km. The dealer’s older one-million-kilometre battery limit does not override current manufacturer terms.

## Exact advertised New stock

Physical presence, unsold allocation and VIN equipment were not independently verified. These are live page advertisements downloaded on the check date, with advertised MY26/drivetrain identity, not guaranteed availability. No stock-update timestamp was provided.

| Dealer and listing | Advertised identity | Advertised price | Conditions |
|---|---|---:|---|
| [Geelong 2WD](https://www.geelongkgm.com.au/new-cars/for-sale/kgm/musso/2026/ev-2wd/o100-my26/3877576/) | New MY26 2WD, Grand White, S65919, VIN KPA1A1E2STP011525, 9 km | AUD 54,990 drive away | Displayed price requires Collingwood membership |
| [Geelong AWD](https://www.geelongkgm.com.au/new-cars/for-sale/kgm/musso/2026/ev-awd/o100-my26-awd/4035651/) | New MY26 AWD, Grand White, S66593, VIN KPA1A1E3STP016457, 26 km | AUD 58,990 drive away | Displayed price requires Collingwood membership |
| [Village Black Edge](https://www.villagekgm.com.au/new-cars/for-sale/kgm/musso/2026/ev-2wd-black-edge/o100-my26/3947630/) | New MY26 2WD Black Edge, Grand White, S65885, VIN KPA1A1E2STP013881, 9 km | AUD 60,500 drive away | Full buyer/location eligibility not independently confirmed |

The Geelong AWD search cache showed a different stock/VIN/price on the same URL. Only the current downloaded page identifiers above are used. This illustrates why search snippets cannot establish exact current stock. Dealer range/charging/warranty descriptions also differ from primary specifications and are not used to replace them.

## Holds and integration safeguards

1. AWD towball: 230 kg in current PDF versus 180 kg in official embedded data; main value remains null pending resolution
2. Vehicle DC acceptance: unknown; never substitute the 300/100 kW charger ratings
3. No eight-airbag, centre-airbag or knee-airbag claim; preserve ANCAP correction
4. Battery gross/usable split, acceleration, top speed, connector, V2L output/inclusion, mirror-inclusive width and towing cargo remainder remain unknown
5. Blazing Gold appears in live configurator/launch data but is absent from the current linked PDF; do not promise current orderability
6. No separate AWD Black Edge powertrain; no trim duplication for colour, dealer units or offers
7. No claim of physical stock verification, inspected VIN equipment or guaranteed transaction price

## Snapshot and validation

`musso.json` contains ten successful source snapshots, three exact dealer advertisements, two base records and one equipment-package expansion. Original responses, text, SHA-256 hashes and PDF page images are in `remaining-utes-vans-sources/musso/`. One blocked Autotrader fetch is logged but unused. Public model Flight data and parsed modelData are retained as derived snapshots.

Validation passed: all positive facts have evidence; source URLs/IDs and source hashes resolve; all used PDF pages were visually reviewed; published payload arithmetic matches; vehicle DC maximum and conflicted AWD towball remain null; no application mutations occurred.


# Kia PV5 Cargo: Australian evidence, 10 October 2026

Recommended subset: one MY26 Cargo S 4DR Long Range FWD, two-seat van, 71.2 kWh declared battery, dual manual sliding doors and twin-swing rear doors. Reuse family `kia-pv5-cargo`. Physical stock is unverified.

Fresh Macarthur Kia original advert identifies NEW stock A060441, VIN KNCWBX71UT5060441, build year 2026, 7 km, $60,773 driveaway. Other checked City/Midland/Toowong exact-ad URLs redirect to generic indexes and cannot establish their original units remain available.

Mechanical sheet: 120 kW / 250 Nm front PMSM, 416 km WLTP combined, 191 Wh/km, 10.5 kW OBC, 128 kW vehicle DC maximum. The 30-minute 10–80% time uses a 350 kW station; 350 kW is not the van's acceptance limit. AC is approximately 390 minutes, 10–100%, with 11 kW supply. Battery usable/gross split and V2L output remain unknown.

Cargo capacity is 4,420 L VDA. Maximum internal cargo dimensions are 2,255 × 1,565 × 1,520 mm, not door openings or minimum wheel-arch width. The sheet claims GVM 2,650 kg and maximum payload 740 kg, but tare 1,955 kg versus kerb 1,910 kg is an unresolved labelling inconsistency. Preserve the declared values and warning; normalized mass fields are held. No accessory/occupant-specific net freight payload or GCM inferred.

Warranty conflict: current PV5 page advertises 8 years / 160,000 km battery coverage, while linked terms updated 20 August 2026 state pre-MY27 7 years / 150,000 km (only EV4 explicitly excepted), and cap Commercial Use components at 7 years / 150,000 km. Hold a confirmed MY26 battery scalar. Retain base private 7-year unlimited and Commercial Use 7-year / 150,000 km with exclusions.

All used brochure pages 2–4 and warranty pages 1–4 were rendered and visually inspected. Originals, extracted text and rendered images have SHA256 provenance in the source registry. Source-linked wrappers include the full standard-equipment row inventory. No app edits, enquiries, contacts, orders or reservations.

ANCAP confirms Platinum / 91% in its 2025 Commercial Van Safety Comparison for vehicles built March 2026 onward/on sale June 2026 onward. This active-safety assessment is separate from crash-star ratings; AEB Backover is explicitly unavailable. Do not turn it into a five-star ANCAP rating or confuse RCCA with backover AEB.


# Farizon V7E, Australia

Checked 10 October 2026. Read-only evidence; no app changes, orders or dealer contact. Detailed source-guarded facts, equipment, conflicts and hashes are in `farizon.json`.

## Decision

Two current Australian factory configurations are supported: Standard Range 50 kWh and Extended Range 66 kWh. Both appear in the official configurator, the current linked Australian brochure, the active September–October offer and exact dealer advertisements explicitly classified New. Retain one family and two battery configurations. Do not add colours or stock units as trims.

The manufacturer does not assign an explicit model year in reviewed material. Dealer title/build/compliance year 2026 must remain separate from formal MY. The brochure footer says current as at 3 March 2026; PDF metadata shows the currently linked official version was generated 22 June 2026. The dealer-hosted earlier version was generated 9 April 2026.

Sources: [official V7E page](https://farizonauto.au/farizon-v7e/) (`farizon_v7e`), [official configurator](https://shop.farizonauto.au/configurator/v7e) (`farizon_configurator`, Version), [official linked brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_V7_E_Broc_Spreads_Digital_9c624503df.pdf) (`farizon_v7e_pdf`, PDF page 12, printed pages 22–23, configuration matrix; page 13, publication caveat).

## Configuration facts

| Fact | Standard Range | Extended Range | Basis |
|---|---:|---:|---|
| Declared battery | 50 kWh | 66 kWh | Neither gross nor usable specified |
| Chemistry / supplier | CATL LFP | CATL LFP | Liquid cooled, published 400 V |
| WLTP range | 240 km | 329 km | Combined laboratory claim |
| Drive / motor | FWD / permanent-magnet synchronous | Same | Motor count not explicitly stated |
| Rated / maximum power | 55 / 110 kW | Same | Rated duration/standard unspecified |
| Rated / maximum torque | 100 / 230 Nm | Same | Manufacturer matrix |
| Maximum speed | 120 km/h | Same | Manufacturer matrix |
| Vehicle maximum AC | 11 kW | 11 kW | Not a household-socket claim |
| Vehicle maximum DC | 100 kW | 97 kW | Distinct from reference station rating |
| DC charging | 26 minutes, 20–80% | 33 minutes, 20–80% | 100 kW station, ideal conditions |
| AC charging | 4 hours, 15–100% | 5 hours, 15–100% | 11 kW charger, ideal conditions |
| GVW as labelled | 3,150 kg | 3,150 kg | Not a VIN compliance-plate inspection |
| Published kerb weight | 1,812 kg | 1,942 kg | Occupant/accessory/fluid basis not explained |
| Published payload | 1,338 kg | 1,208 kg | Equals GVW minus published kerb weight |
| Braked / unbraked tow | 1,000 / 750 kg | Same | GCM, towball and axle limits absent |
| Cargo volume | 6.95 m³ | Same | Measurement standard not identified |
| Cargo L × W × H | 2,865 × 1,690 × 1,435 mm | Same | Width is not stated between wheelarches |
| Vehicle L × W × H | 4,995 × 1,820 × 1,985 mm | Same | Mirror-inclusive/exclusive width not explicitly labelled |
| Wheelbase | 3,200 mm | Same | Manufacturer matrix |
| Ground clearance / platform | 135 / 510 mm | Same | Manufacturer matrix |
| Turning diameter | 12 m | Same | Kerb to kerb |
| Seats | Dealer advertises 3 | Dealer advertises 3 | Official matrix does not state a count |

Source for all manufacturer rows: `farizon_v7e_pdf`, PDF page 12, the named row in Dimensions & Capacity, Body & Chassis, Motor, Battery & Charging or Wheels & Steering. Charging station ratings and conditions: page 13, footnote 3. Seating: exact dealer Key information > Seats, linked below. The full JSON gives a source URL and row for every populated fact.

Range conditions: current official offers describe combined WLTP testing at 23°C without climate control or auxiliary loads. Actual range varies with payload, driving, route, weather, battery condition and vehicle specification. Do not substitute dealer estimates of practical range for a measured result.

Charging conditions: 100 kW is the station used for both DC time claims; Extended Range vehicle intake is separately capped at 97 kW. Preserve 20–80% DC and 15–100% AC windows. Actual times vary with battery condition, temperature and infrastructure. CCS2 is listed as charging type; the source does not separately name an AC connector or supply phase count.

Cargo and towing: no VDA/SAE/block method is supplied for 6.95 m³. General cargo width is not wheelarch clearance. Do not claim maximum payload and maximum trailer weight can be carried simultaneously. GCM must not be synthesized by adding GVW and tow capacity. Occupants, options, accessories and towball load affect usable load allowance.

## Equipment and useful differences

The two configurations share the reviewed equipment matrix: 16-inch Black Aero wheels with 195/65 R16C tyres and full-size spare, dual manual sliding doors, rear doors opening 270°, cargo partition, air conditioning, 12.3-inch screen, 7-inch instrument display, Apple CarPlay, Android Auto, USB-A/USB-C, keyless start and a heated multifunction steering wheel. The brochure's loading spread specifies a 1,100 mm sliding-door opening (PDF page 6, printed 10–11).

The current official matrix specifically lists a heated and ventilated driver seat. An older dealer-hosted matrix and some marketing prose say “seats” generally. Passenger heating or ventilation remains unverified; do not expand the explicit current driver-seat claim.

The matrix also lists 2 airbags, 2 front and 4 rear parking sensors, 360° view, adaptive cruise, AEB, forward/rear collision warnings, lane departure/keeping/change functions, blind-spot detection, rear cross-traffic alert, intelligent speed assist, ABS, traction control, TPMS and hill hold. Operating envelopes and crash-test ratings were not established. A 240 V onboard V2L socket is documented, but output kW/amperage remains unknown.

Source: `farizon_v7e_pdf`, page 12 equipment matrix, page 11 V2L spread. Older wording: [dealer-hosted brochure](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1780856257-farizon-v7e-brochure.pdf) (`farizon_v7e_bartons_pdf`, page 12, Interior).

Standard Range favours the published payload and lower price; Extended Range adds 89 km of claimed WLTP range and 16 kWh declared capacity while reducing published payload by 130 kg. These differences are arithmetic between official figures, not real-world route-test findings.

## Pricing that is current

The [official offers page](https://farizonauto.au/offers/) (`farizon_offers`, V7E cards and disclaimer 1) currently advertises:

- Standard Range: from A$49,990 driveaway plus A$2,000 factory bonus
- Extended Range: from A$53,990 driveaway plus A$2,000 factory bonus

The bonus is deducted at purchase. Simple net arithmetic is A$47,990 / A$51,990, but retain it as calculated, subject to a dealer quote. It is not MRLP. The official configurator still displays the headline total and separately states the bonus.

Offer conditions: participating authorised dealers; new stock without extras/accessories; purchased and delivered 1 September–31 October 2026; includes GST and taxes, duties, fees and charges; while stock lasts; excludes fleet, government and rental buyers and other offers. The bonus cannot be used for accessories or services.

The homepage and V7E model page still carry expired July–August price footnotes. They were preserved for the discrepancy but were not used to establish current price eligibility. The June Bartons blog is historical background, not current price authority.

## Current exact New advertisements

These are direct dealer advertisements downloaded on 10 October, not proof of on-site possession or availability when an order is placed. Full equipment applicability to the VIN was not independently checked.

| Dealer / exact unit | Advertised condition | Odometer | Price | VIN |
|---|---|---:|---:|---|
| [Bartons SR #540814](https://www.bartons.net.au/cars/new-jade-white-2026-farizon-v7e-540814) | New, Standard Range Low Roof | 49 km | A$47,490 driveaway | LMPA1KMBXTA540814 |
| [Bartons ER #541534](https://www.bartons.net.au/cars/new-bamboo-green-2026-farizon-v7e-541534) | New, Extended Range Low Roof | 0 km | A$51,490 driveaway | LMPA1KMB9TA541534 |
| [Bartons ER #541533](https://www.bartons.net.au/cars/new-bamboo-green-2026-farizon-v7e-541533) | New, Extended Range Low Roof | 12 km | A$51,490 driveaway | LMPA1KMB7TA541533 |

Sources: `farizon_bartons_sr_540814`, `farizon_bartons_er_541534`, `farizon_bartons_er_541533`; Title, New Cars breadcrumb, Key information, price and Car Summary. Do not subtract the factory bonus again from dealer-advertised prices.

### Excluded prior New evidence: East Coast #39435

The old [CountryCars ad](https://www.countrycars.com.au/cars/new-white-2026-farizon-v7e-39435) still says New, 0 km and A$45,990 excluding government charges. Direct HTML retrieval returned 403; a web-tool cached extraction was preserved with that limitation.

The [selling dealer's current exact ad](https://www.eastcoastcommercials.com.au/cars/demo-white-2026-farizon-v7e-39435) identifies the same stock number and VIN LMPA1KMB1TA540815 as Demo, 56 km, registration 599RD3, A$49,990 driveaway. The registration expiry shown is 20 August 2027. Its current Demo classification overrides the stale syndicated New claim. It is excluded from clean-new evidence and preserved as a source conflict, not counted as another configuration.

Sources: `farizon_stock_39435_web`, Car Details; `farizon_eastcoast_demo_39435`, title, Demo Cars breadcrumb and Key information.

## Warranty and remaining holds

The [official servicing page](https://farizonauto.au/servicing/) (`farizon_servicing`, coverage and footnote 3) and brochure page 13 state 5 years/200,000 km vehicle warranty and 8 years/200,000 km high-voltage battery warranty, each whichever occurs first. Complimentary roadside assistance lasts 5 years from first registration.

The complete Warranty and Service Information Booklet was not obtained. Battery-capacity retention threshold, detailed exclusions and model-specific service intervals remain unknown. Other held values include gross/usable battery energy, formal MY, manufacturer code, official seat count, GCM/axle/towball limits, simultaneous towing payload, cargo measurement method, V2L output power, consumption and acceleration. No gaps were filled with overseas specifications.

## Evidence validation

The JSON contains 2 records, 266 source-guarded fact/equipment wrappers and 18 source entries. Every non-null fact has evidence and every source ID resolves. Downloaded originals and text snapshots have verified SHA-256 hashes. All 13 pages of the current official PDF were visually inspected; both used pages of the earlier dealer PDF were rendered and inspected. The current table and footnote pages also have higher-resolution renders. No physical-stock verification or app mutation is claimed.


# Hyundai STARIA Load Electric: Australian evidence

Checked 10 October 2026. Research only.

## Admission and counting

Two exact rear-door configuration records share one Electric grade: standard Liftback and optional Twin Swing. Both have the same published 84 kWh, 160 kW/350 Nm front-drive powertrain. The expanded-configuration list indexes these same two records and adds no vehicles. Diesel, hybrid, Hybrid Premium and overseas passenger STARIA Electric are excluded.

The [official Australian model page](https://www.hyundai.com/au/en/cars/people-movers-and-commercial/staria-load) now says Electric is available. Its [current offer page](https://www.hyundai.com/au/en/offers/staria-load) embeds both BEV door variants and a $2,000 including-GST ABN deduction from drive-away price for eligible purchases and deliveries from 1 October to 31 December 2026. Conditions include participating dealers, eligible registered ABN holders, stock availability and exclusions. The embedded base-price field is AUD 70,989.99; it is not a drive-away quote.

## Exact advertised new stock

[Col Crawford stock 432486](https://colcrawford.com.au/stock/details/47035-432486/2026-hyundai-staria-new): MY27 Electric Twin Swing, two seats, 15 km, VIN KMFYFX7EUVU003638, advertised New at $76,972 drive-away. The exact body configuration is established; physical presence is unverified.

[Suttons stock AVE6593](https://www.autotrader.com.au/car/15342908/hyundai/staria-load/nsw/arncliffe/van) is a separate advertised-new BEV VIN, but rear-door choice remains unresolved. No dealers were contacted.

## Core specification and source guards

The [September 2026 Australian specification](https://www.hyundai.com/content/dam/hyundai/au/en/models/staria-load/2027/docs/Specification_Sheet_STARIA_Load_September2026.pdf), pages 7–13, gives:

- 84 kWh declared energy, lithium-ion, 697 V pack; gross/usable split unknown
- 450 km WLTP; 207 Wh/km combined consumption, with an inconsistent shared ADR 81/02 footnote retained separately
- 10.5 kW AC, approximately 7 h 35 min from 10–100%; portable 230 V/10 A cable approximately 33 hours over the same window
- DC 10–80%: approximately 81/41/20 minutes at 50/100/350 kW stations. The PDF also calls 350 kW maximum charging capacity. That raw declaration is preserved, but normalized vehicle maximum remains null/held until vehicle acceptance is distinguished from station rating
- GVM 3,350 kg, kerb 2,268–2,345 kg, declared tare 2,345 kg and payload 1,005 kg; no per-door weight assignment
- Towing 2,000 kg braked/750 kg unbraked, maximum ball load 100 kg; genuine extra-cost towbar/ball and equipment limits apply. GCM and simultaneous full-payload/full-tow capability are unknown
- Main cargo 4,935 L VDA, separately 23.9 L front compartment with unspecified method; cargo 2,607 × 1,640 × 1,436 mm, width between wheel houses 1,254 mm
- Two manual sliding side doors, 17-inch steel wheels/full-size spare, seven airbags, 12.3-inch digital instruments and touchscreen, navigation, wired/wireless smartphone integration, battery conditioning/heating, interior V2L socket, halogen headlights and multi-link rear suspension

## Warranty and safety corrections

[Current Hyundai policy](https://www.hyundai.com/content/dam/hyundai/au/en/documents/2025/2025-Warranty-Terms-and-Conditions.pdf) page 1 establishes 5 years/160,000 km for commercial vans regardless of use. Page 5 gives 8 years/160,000 km for the HV battery and a below-70% SOH repair/replacement threshold, subject to checks, maintenance and operating requirements. Replacement need not restore as-new capacity. The generic seven-year passenger-car headline does not apply.

[ANCAP applicability](https://s3.amazonaws.com/cdn.ancap.com.au/app/public/assets/4376530b9e30839742a6ad9d4571439b27efd3de/original.pdf) page 1 explicitly leaves Electric unrated. Do not transfer the mixed model page’s five-star diesel-family logo.

## Evidence and validation

The JSON contains source-guarded fact wrappers, two body records, source originals/text/SHA256, exact stock evidence, conflicts and holds. Every used specification page 7–13, warranty page 1/5 and ANCAP page 1 was rendered and visually checked. Gross/usable battery, exact service schedule, heat pump, GCM, vehicle-specific DC peak and door-specific masses remain held or unknown.

An optional Parramatta model-page read was cancelled at network-approval stage. It was not retried and is explicitly unused. No application records were edited.


## Source registry

- `kgm_musso_ev`: https://kgm.com.au/models/musso-ev — checked 2026-10-10; original SHA256 `8e43d636677a0a1b5a105342e863bada8e634cbf05c53cfb0c41664ad81f5360`
- `kgm_musso_ev_my26_specs`: https://kgm-rebuild-nextjs-postgres-assets-s3.s3.ap-southeast-2.amazonaws.com/KGM_Musso-EV-MY26_Specs%20and%20Features.pdf — checked 2026-10-10; original SHA256 `99d486996d66eaddeb1d7b6b2d073116d09f7e67843e62ae6882d653c2b7d097`
- `kgm_warranty`: https://kgm.com.au/owners-and-service/warranty — checked 2026-10-10; original SHA256 `18db9e6e2950cfae254c6778ef17ed068a85914b999b6a8834301002e6635709`
- `kgm_musso_ev_launch`: https://kgm.com.au/news/kgm-presents-its-first-electric-ute-the-musso-ev — checked 2026-10-10; original SHA256 `ad5a78d97a08bec7ab957f5ac79069493cfe6ddceefb85b385238c1e53d846e7`
- `kgm_offers`: https://kgm.com.au/offers — checked 2026-10-10; original SHA256 `01697022afc00760a72b70900401c0ab77282831c2d5952343314bc8a2d54d47`
- `ancap_musso_safety_alert`: https://www.ancap.com.au/media-and-gallery/media-releases/4f34de — checked 2026-10-10; original SHA256 `16d28b5b9d35652e9f00f21209d39ad91b2a9b12d5ff1b28f205e1153f77b4ff`
- `geelong_new_2wd_3877576`: https://www.geelongkgm.com.au/new-cars/for-sale/kgm/musso/2026/ev-2wd/o100-my26/3877576/ — checked 2026-10-10; original SHA256 `f57478a720b10eccd32d22a19ca829c5df676149118713d76354ff64d8ee1aa7`
- `village_new_blackedge_3947630`: https://www.villagekgm.com.au/new-cars/for-sale/kgm/musso/2026/ev-2wd-black-edge/o100-my26/3947630/ — checked 2026-10-10; original SHA256 `af007c528dc2a92ce26c5cc50b0e78d4a5052f7a5af188ccbc9ae7f394cea797`
- `kgm_warranty_terms`: https://kgm.com.au/owners-and-service/warranty/warranty-terms — checked 2026-10-10; original SHA256 `a8bfe190afd8faea60afe8ce79fb1a8427731140185102e8a8ea6eb95c9c83c7`
- `geelong_new_awd_4035651`: https://www.geelongkgm.com.au/new-cars/for-sale/kgm/musso/2026/ev-awd/o100-my26-awd/4035651/ — checked 2026-10-10; original SHA256 `cbbd6a2e07c119c21bbca04f0c9bff9b8c4c6a85fda1d960a6d4aa119153cd95`
- `pv5_brochure`: https://www.kia.com/content/dam/kwcms/au/en/images/pdf/pv5/kia-pv5-brochure.pdf — checked 2026-10-10; original SHA256 `4f5327e1c468be05d20bbe3fcd39a1d1d95ed8c34aab8e5cde930c3d92b0e286`
- `pv5_au`: https://www.kia.com/au/en/pbv/pv5-cargo — checked 2026-10-10; original SHA256 `c135890adb642712eb5c974934059df48c8d313bee9da9fec586efbecf336764`
- `pv5_warranty`: https://www.kia.com/au/owners/warranty.html — checked 2026-10-10; original SHA256 `5456c48dad77664a64aceb0fd577b714578cad2cf25d2dbda0064f567c6e19ea`
- `pv5_configurator`: https://www.kia.com/au/shopping-tools/build-and-price.trim.pv5-cargo.html — checked 2026-10-10; original SHA256 `4edfb1d709ff2b686f6beb2c8d851da3b6b81265d2a5e47dd3dd4b5a6fec02d4`
- `pv5_macarthur_new`: https://www.macarthurautomotive.com.au/cars/new-clear-white-2026-kia-pv5-a060441 — checked 2026-10-10; original SHA256 `b8cce40342b123f6d5fe3fe12556f2002425c38e27b02798ad9184e485f287d0`
- `pv5_toowong_new`: https://stock.toowongkia.com.au/new-cars/for-sale/kia/pv5/2026/cargo-s-long-range/sw-my26/4086745/ — checked 2026-10-10; original SHA256 `006636cdac92d31d99ad6f6d2bd45d0a5da87058220ef52930db7fd83d30fba0`
- `pv5_city_redirect`: https://www.citykia.com.au/new-cars/for-sale/kia/pv5/2026/cargo-s-long-range/sw-my26/4017453/ — checked 2026-10-10; original SHA256 `fe1e1681214196488dc29bcfd85a006797e5b532d564c78aae334a6141fee4dc`
- `pv5_midland_redirect`: https://www.midlandkia.com.au/stock/details/65194-31046552/2026-kia-pv5-new — checked 2026-10-10; original SHA256 `acf920123638ec17fb351bcb9f167040b36478e9b70c096fcd24a99631770c9a`
- `pv5_warranty_terms`: https://www.kia.com/content/dam/kwcms/au/en/files/service/Kia-Warranty-terms-and-conditions.pdf — checked 2026-10-10; original SHA256 `027b4ad80883f078e60ae4a2238cb52c5af9ed58f9ab18c251ba6fddcb2c1722`
- `pv5_ancap`: https://www.ancap.com.au/safety-ratings/kia/pv5-cargo/e8dc8a — checked 2026-10-10; original SHA256 `fabf7a1a41503f2947c324aec2a249145033e5622dea0055562f60365c21f187`
- `farizon_v7e`: https://farizonauto.au/farizon-v7e/ — checked 2026-10-10; original SHA256 `a56636b038651434fe8fd555e5a7aaa879dc17f6e2dcdc2e44035458bde70ee4`
- `farizon_home`: https://farizonauto.au/ — checked 2026-10-10; original SHA256 `5d596124d3cbf88fa1d05997a199a0454b03513b9c39fea1ecb605269f1a9679`
- `farizon_stock_39435`: https://www.countrycars.com.au/cars/new-white-2026-farizon-v7e-39435 — checked 2026-10-10; original SHA256 `retrieval unsuccessful`
- `farizon_bartons`: https://www.bartonswynnumfarizon.com.au/blog/farizon-v7e-electric-van-brisbane-price-specs-and-where-to-buy — checked 2026-10-10; original SHA256 `3ab5c78fdeb809e416619d2cd93aa59b637d5f98ae022892d12d199e1ffd9503`
- `farizon_servicing`: https://farizonauto.au/servicing/ — checked 2026-10-10; original SHA256 `c02f76a9e21b1d7efa6a52fa081e4a1e42bab859302221f1f47048d3c7bf2f2d`
- `farizon_ownership`: https://farizonauto.au/ownership/ — checked 2026-10-10; original SHA256 `514cc5a742d1ebc10ae7e3d406a0f538fe4eede0f6cc782abdc6deb4f3a5542a`
- `farizon_offers`: https://farizonauto.au/offers/ — checked 2026-10-10; original SHA256 `b50bfd35fa05942cfdc5018e577dcc893b04035609146e8b50dfd5ec623208d7`
- `farizon_bartons_range`: https://www.bartons.net.au/models/v7e — checked 2026-10-10; original SHA256 `0fe28d787b5d5f0a28ef84bbf850c550b3c1d18b06451640cd21c7e1214a86d7`
- `farizon_bartons_stock`: https://www.bartons.net.au/search/farizon — checked 2026-10-10; original SHA256 `13c60f3ce32617a993e65d19d9dd301c6e56601ffa23b243576b541ceb554644`
- `farizon_v7e_pdf`: https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_V7_E_Broc_Spreads_Digital_9c624503df.pdf — checked 2026-10-10; original SHA256 `2dce1bdd0edf6214569fb896487abd7797a1bbec17e401d5a396dc084ec40caa`
- `farizon_v7e_bartons_pdf`: https://tddashboard.s3.ap-southeast-2.amazonaws.com/1780856257-farizon-v7e-brochure.pdf — checked 2026-10-10; original SHA256 `528727a7c429499ad8931fa5ed48ba7d846863745840e355074c53905c41a774`
- `farizon_bartons_er_541534`: https://www.bartons.net.au/cars/new-bamboo-green-2026-farizon-v7e-541534 — checked 2026-10-10; original SHA256 `2844ef97499b3ecb108e9d69abd3f3c53e0186f98c51f78aec4f1dc69c72b0c2`
- `farizon_bartons_sr_540814`: https://www.bartons.net.au/cars/new-jade-white-2026-farizon-v7e-540814 — checked 2026-10-10; original SHA256 `ec11c13717de7d7930d10614a16dffc5b5bf7503652747fc70862511bcc27a06`
- `farizon_bartons_er_541533`: https://www.bartons.net.au/cars/new-bamboo-green-2026-farizon-v7e-541533 — checked 2026-10-10; original SHA256 `5f318e41ce69b55cad59ffd9eadf2edea3ef22feb11a65608f8d8cba687ea980`
- `farizon_eastcoast_demo_39435`: https://www.eastcoastcommercials.com.au/cars/demo-white-2026-farizon-v7e-39435 — checked 2026-10-10; original SHA256 `e5735fa825d0484de5f21c37105fd75d32a27ede942ecfff136e64769838bafd`
- `farizon_configurator`: https://shop.farizonauto.au/configurator/v7e — checked 2026-10-10; original SHA256 `960143ac69ae0dc0de8738f7fb8cadee642d74933c5f95651192250ee5b26c49`
- `farizon_eastcoast_range`: https://www.eastcoastfarizon.com.au/models/v7e — checked 2026-10-10; original SHA256 `5d754cbcd267925d52f03fa17623a09576d9363dd068e6c18fc55a29d907097c`
- `farizon_stock_39435_web`: https://www.countrycars.com.au/cars/new-white-2026-farizon-v7e-39435 — checked 2026-10-10; original SHA256 `cd01c71fbfe1fa4161475ebf8c4988b5e788cc4497d4e262a186e4e99ada6081`
- `staria_product`: https://www.hyundai.com/au/en/cars/people-movers-and-commercial/staria-load — checked 2026-10-10; original SHA256 `4b5e9032f1ccc5246a8c3c9bf533a18568ffd80d8bd0e37ed55d22b2da5f7a95`
- `staria_specs`: https://www.hyundai.com/content/dam/hyundai/au/en/models/staria-load/2027/docs/Specification_Sheet_STARIA_Load_September2026.pdf — checked 2026-10-10; original SHA256 `5e15139b2962c4f3af4c9eed902f06966b5a89a52e8f1d18bf60008beb3caedb`
- `staria_offers`: https://www.hyundai.com/au/en/offers/staria-load — checked 2026-10-10; original SHA256 `727013ee1cc4107c352be74075c4cdd28bdbd678f009a1026843dbc86001f8bc`
- `staria_suttons_autotrader`: https://www.autotrader.com.au/car/15342908/hyundai/staria-load/nsw/arncliffe/van — checked 2026-10-10; original SHA256 `ef96478223eabe83d18a08116f08ecdc3cc15a612bc1840d59ae4af4a4f80848`
- `staria_col_432486`: https://colcrawford.com.au/stock/details/47035-432486/2026-hyundai-staria-new — checked 2026-10-10; original SHA256 `165e6cab61b829c37a754fbdf32742b2fbba9e58f7599a26a7fdccc5af6dc685`
- `staria_col_autotrader`: https://www.autotrader.com.au/car/15339739/hyundai/staria/nsw/brookvale/van — checked 2026-10-10; original SHA256 `fbb82202cfff1cb7138e16f8c012aafe390b73b8c5df2dca84ccd51ca0659ba1`
- `staria_parramatta_model`: https://www.parramattahyundai.com.au/models/staria-load-electric — checked 2026-10-10; original SHA256 `retrieval unsuccessful`
- `staria_warranty_current`: https://www.hyundai.com/au/en/owning/myhyundaicare/warranty — checked 2026-10-10; original SHA256 `4352e2f9dee42b1de0d26769cde665bd9c32c89f6f2469fd869713dbbf694f37`
- `staria_warranty_terms`: https://www.hyundai.com/content/dam/hyundai/au/en/documents/2025/2025-Warranty-Terms-and-Conditions.pdf — checked 2026-10-10; original SHA256 `d4e944c48fdc959641827c1ddcfd12705c91fced5eee0b2dcaac1a56dac5f40c`
- `staria_battery_terms`: https://www.hyundai.com/content/dam/hyundai/au/en/owning/icare/Blue-Drive-Warranty-Terms-and-Conditions.pdf — checked 2026-10-10; original SHA256 `0b57fa908e9b5e04eae3c9b25227c2c66341f7e092fdb727a4d10574e0253d50`
- `staria_ancap`: https://s3.amazonaws.com/cdn.ancap.com.au/app/public/assets/4376530b9e30839742a6ad9d4571439b27efd3de/original.pdf — checked 2026-10-10; original SHA256 `166546624684f550639d59224b157d76317b024322b5fd206310bec9d31f1447`

## Provenance and validation

The JSON contains field-level value/unit/status/basis/conditions/evidence wrappers and page/row locators. Used PDF tables were rendered and visually reviewed. See `remaining-utes-vans-validation.json` (also `remaining-utes-vans/validation.json`) and `remaining-utes-vans-manifest.json`. Full source originals and extracted text are retained under `remaining-utes-vans-sources/`.
