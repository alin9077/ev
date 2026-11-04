# Electric vans evidence: Ford and LDV Australia

As of 10 October 2026. Commercial vehicles are kept separate from passenger rankings.

## Result and release gates

- Ten configuration records: two E-Transit Custom grades, two full-size E-Transit roof choices, four eDeliver 7 MY25 variants and two eDeliver 9 vans. Two MY23 eDeliver 7 limited-stock offer rows are separate
- Seven fresh exact NEW dealer ads: six have firm advertised body/MY identity, one Cumberland eDeliver 7 has provisional 77 kWh identity. Four ads are Ford Custom; three are LDV 7. None is physical-stock or factory-order confirmation
- Ford Custom's official MY26.50 label conflicts with a future MY27.25 upgrade report. Current-stock battery/range/charge-time fields are held; the exact official published values are retained separately
- Full-size E-Transit has current marketing but only a product-linked MY23.50 specification sheet. Current model year and conflicting mass figures remain unresolved
- eDeliver 7's current PDF omits LWB Low Roof 88 kWh and disagrees with its webpage on torque. Missing/contradictory fields remain null
- eDeliver 9 Mid Roof remains brochure-listed but is absent from the current price table. No verified fresh NEW eDeliver 9 or full-size E-Transit ad was found in this pass
- Formal MLP is unverified. LDV has distinct current retail/ABN driveaway FROM prices, valid through 31 October. Exact dealer offers and older-stock offers stay separate

The JSON sibling contains field-level source IDs/locators, exact advertisement identities, source conflicts, unknowns and integration guards. Validation: 55 source IDs, 47 snapshot/excerpt hashes and 70 exact-text anchors passed. Ford source downloads were available through web rendering only; those saved excerpts are explicitly labelled rather than represented as raw PDFs/HTML.

## Ford electric vans: manufacturer evidence

As of 10 October 2026. Australian-market, commercial-vans catalogue only. Research did not contact dealers, place orders or inspect physical vehicles.

### Catalogue decision

- E-Transit Custom has two official body/grade configurations: Trend LWB and Sport SWB, both low-roof, three-seat, single-motor RWD panel vans. Ford's current brochure/configurator label is MY26.50
- Important release conflict: that brochure and both live model pages publish 71.45 kWh usable, 340 km Trend / 346 km Sport and 29-minute 10–80% DC charging. A 22 September CarExpert report attributes these upgrades to MY27.25 BEVs arriving March 2027. Keep the published primary claims, but hold their mapping to current physical MY26.50 stock. Do not merge older 64 kWh stock into the new specifications
- Full-size E-Transit remains on Ford's live Australian site. Its model-page download is still a MY23.50 sheet issued January 2025. Treat its 420L Mid Roof / optional High Roof as two roof configurations, with current exact model year unresolved
- The general brochure index's E-Transit link incorrectly opens the Custom brochure; the MY26.50 Transit Van brochure contains diesel variants. These facts establish neither discontinuation nor a newer BEV model year

Sources: [Custom brochure](https://www.ford.com.au/content/dam/Ford/au/nameplate/transit-custom/brochure/specs-brochure/2026my-transit-custom-specs-6aug.pdf), [Custom configurator](https://www.ford.com.au/price/TransitCustom), [Trend](https://www.ford.com.au/showroom/trucks-and-vans/transit/custom/electric/), [Sport](https://www.ford.com.au/showroom/trucks-and-vans/transit/custom/electric-sport/), [dated update report](https://origin.carexpert.com.au/car-news/2027-ford-transit-custom-phev-e-transit-custom-prices-cut), [E-Transit](https://www.ford.com.au/showroom/trucks-and-vans/transit/electric/), [MY23.50 brochure](https://www.ford.com.au/content/dam/Ford/au/nameplate/e-transit/brochure/specs-brochure/fordvf0333-e-transit-saver-brochure-16jan.pdf)

### Ford's currently published Custom specifications

These are published catalogue claims, not a guarantee of the equipment or battery in a particular stock vehicle.

| Field | Trend LWB | Sport SWB |
|---|---:|---:|
| Seats / drive | 3 / RWD | 3 / RWD |
| Power / torque | 160 kW / 415 Nm | 160 kW / 415 Nm |
| Length / wheelbase | 5,450 / 3,500 mm | 5,050 / 3,100 mm |
| Standard kerb / GVM / payload | 2,237 / 3,350 / 1,113 kg | 2,198 / 3,225 / 1,027 kg |
| GCM / maximum braked tow | 5,350 / 2,300 kg | 5,350 / 2,300 kg |
| Cargo: maximum / VDA / SAE | 6.8 / 6.0 / 6.5 m³ | 5.8 / 5.2 / 5.7 m³ |
| Load length to bulkhead / hatch | 3,002 / 3,450 mm | 2,602 / 3,050 mm |
| Wheels | 16-inch steel | 17-inch alloy |

Body width is 1,999 mm excluding mirrors and handles, 2,275 mm with mirrors extended. Standard arrangement is a single left sliding door, rear barn doors and windowless metal bulkhead with load-through hatch. Dual sliding doors and rear liftgate are factory options. BEV double-cab and single-passenger-seat configurations are not listed.

- Battery/range/charging claims affected by release conflict: 71.45 kWh usable; 340/346 km WLTP combined; 125 kW maximum DC; 29 minutes 10–80%; 11 kW maximum AC; 4.7 hours 10–80% at 11 kW
- Ford explicitly states maximum DC rate in the sheet, so 125 kW is vehicle capacity as well as the timed test's station rating
- WLTP testing is described at 23°C without climate/electrical load. Cargo test load is not stated; do not call it full-load or unloaded range
- Payload includes people, accessories, structures, cargo and towball download. Respect GVM, GCM and axle limits; maximum payload and maximum trailer mass are not promised simultaneously
- Cargo methods must stay separate: loose-material maximum, VDA blocks and SAE. Neither equals a passenger-car boot measurement

Exact field locators and unknowns are in the JSON. Source: [MY26.50-labelled official sheet, pages 4–7](https://www.ford.com.au/content/dam/Ford/au/nameplate/transit-custom/brochure/specs-brochure/2026my-transit-custom-specs-6aug.pdf)

### Full-size E-Transit: dated MY23.50 reference

| Field | 420L Mid Roof | 420L High Roof |
|---|---:|---:|
| Seats / drive | 3 / RWD | 3 / RWD |
| Usable battery / power / torque | 68 kWh / 198 kW / 430 Nm | Same |
| Published WLTP span | 230–307 km | 222–295 km |
| Length / wheelbase | 5,981 / 3,750 mm | Same |
| Height range | 2,481–2,552 mm | 2,719–2,790 mm |
| Cargo maximum / VDA / SAE | 11.0 / 10.2 / 9.9 m³ | 12.4 / 11.5 / 11.2 m³ |
| Dated GVM / kerb / payload | 4,250 / 2,639 / 1,611 kg | 4,250 / 2,684 / 1,566 kg |

The live page instead says 4.2 tonnes and up to 1,616 kg. Current exact GVM/payload fields are therefore null; the dated values remain conditional reference. Its 11.5 m³ headline aligns with high-roof VDA, while the footnote mentions diesel 430E volume. Do not combine them.

115 kW is explicitly listed as DC capacity. The 34-minute test is 15–80%, not 10–80%. AC charger capacity is 11.3 kW, with about eight hours 0–100% tested on 11 kW three-phase supply. Range payload is not specified. The upper-range claim is mid roof; do not infer what load produced each lower endpoint.

Ford explicitly says E-Transit cannot tow. Ignore the misleading 3,500 kg product-page SEO title/general Transit towing text. Sources: [dated E-Transit sheet, pages 9–10](https://www.ford.com.au/content/dam/Ford/au/nameplate/e-transit/brochure/specs-brochure/fordvf0333-e-transit-saver-brochure-16jan.pdf), [official towing exclusion, footnote 6](https://www.ford.com.au/trucks-and-vans/towing/)

### Pricing and warranty

No current primary-source formal MLP or national fixed driveaway price was recovered. Ford's configurator renders grade/MY/powertrain but no numeric price in accessible text. Keep secondary MY26.50 price-when-new figures ($77,890 / $80,290) as unranked reference only, and future MY27.25 reductions separate. Dealer prices belong to exact ads and do not establish MLP.

For warranty commencement on/after 1 September 2026, the base vehicle warranty is five years/unlimited kilometres, extending to seven years/unlimited kilometres only with all services, including the first five years, completed on time at an authorised Ford dealer. Electric drivetrain/battery defects cover is eight years/160,000 km, whichever first. Gradual battery capacity degradation is explicitly excluded; there is no verified 70% retention guarantee. [Ford warranty, pages 2 and 10–11](https://www.ford.com.au/content/dam/na/ford/en_au/owners/warranties/ford-new-vehicle-7-year-warranty-sept-2026.pdf)

### Evidence limits

Ford direct HTTP downloads returned 403. Saved Ford source files are web-tool rendered excerpts, with hashes, rather than complete raw HTML/PDF. Exact new dealer stock is a separate audit. All vans remain excluded from passenger rankings.

## Ford electric vans: exact new-stock advertisements
Checked 10 October 2026. Read-only dealer-ad audit; no dealer contact or physical stock verification.

### Accepted advertisements

#### E-Transit Custom Trend LWB Low Roof — TFJN
- Dealer: Moreton Bay Ford / Q Automotive, Capalaba, QLD
- Exact MY: MY26.50; advertised calendar year 2026
- VIN: WF0RXXTA4BTY24422
- Price: Not published AUD; price_on_enquiry
- Odometer: 10 km; seats 3; low roof
- Build raw date: 2026-03-01; compliance raw date: 2026-07-01
- Source: https://www.qautomotive.com.au/cars/new-white-2026-ford-e-transit-custom-tfjn
- A dealer ad and machine-readable in_stock state are not verification of physical presence, delivery timing or accepted factory order.
- Use exact MY identity; do not overwrite dealer stock battery/range from current product page.
- Dates in embedded object preserved separately from UI year; a day of 01 can be a placeholder.
- Embedded price/dapprice zero is a missing-price sentinel; normalized price is null, never AUD 0.

#### E-Transit Custom Trend LWB Low Roof — F502115
- Dealer: Reef City Ford, Gladstone, QLD
- Exact MY: MY25.75; advertised calendar year 2025
- VIN: WF0RXXTA9HSR05236
- Price: 69990 AUD; dealer_advertised_driveaway
- Odometer: 8 km; seats 3; low roof
- Build raw date: 2025-06-26; compliance raw date: 2025-09-01
- Source: https://www.reefcityford.com.au/cars/new-frozen-white-2025-ford-e-transit-custom-f502115
- A dealer ad and machine-readable in_stock state are not verification of physical presence, delivery timing or accepted factory order.
- Use exact MY identity; do not overwrite dealer stock battery/range from current product page.
- Dates in embedded object preserved separately from UI year; a day of 01 can be a placeholder.

#### E-Transit Custom Trend LWB Low Roof — R6K5
- Dealer: City Ford Alexandria / Australian Automotive Group, Alexandria, NSW
- Exact MY: MY26.00; advertised calendar year 2025
- VIN: WF0RXXTA5BSC58098
- Price: Not published AUD; price_on_application
- Odometer: 35 km; seats 3; low roof
- Build raw date: 2025-09-01; compliance raw date: 2025-12-01
- Source: https://www.aag.com.au/new-cars/for-sale/ford/e-transit-custom/2025/trend-lwb/av-26.00my/3969319/
- Older MY26.00 stock; calendar advertisement year 2025 is not model year.
- Dealer says in stock and immediate delivery, but these statements are not independently verified.
- P.O.A. / Price on Application; embedded driveawayPrice zero is a missing-price sentinel.

#### E-Transit Custom Sport SWB Low Roof — S6B7
- Dealer: Titan Ford Melville, Melville, WA
- Exact MY: MY26.00; advertised calendar year 2025
- VIN: WF0RXXTA2BSK84039
- Price: 87990 AUD; dealer_advertised_driveaway
- Odometer: Unknown km; seats 3; low roof
- Build raw date: None; compliance raw date: None
- Source: https://www.titanford.com.au/new-car/ford/e-transit-custom/sport-low-roof-swb/s6b7/
- Old URL 404s; exact VIN/stock recovered through current dealer stock index and its new permalink.
- No visible odometer or build/compliance date. Embedded Mattaki.Vehicle.Odometer=0 may be a missing-value default; normalized odometer remains null.
- Vehicle JSON-LD productionDate is 2025, matching title year but not evidence of a precise build date.
- Stock-specific page has VIN and stock number but placeholder photo; NEW advertisement verified, physical stock not verified.
- Generic dealer comments discuss both immediate-delivery and order vehicles without specifying which applies to this stock.

### E-Transit 420L result
No fresh exact NEW mid-roof or high-roof ad verified. This is a bounded negative finding, not proof of national unavailability.

### Rejected or stale evidence
- R58F: Old NEW URL redirects to DEMO; fresh content labels Demo. Excluded from new inventory. (https://www.titan.com.au/new-cars/for-sale/ford/e-transit-custom/2026/trend-lwb/av-26.00my/3962777/)
- 433289: Fresh exact detail says SOLD; stale search inventory cached as New is rejected. (https://www.westpointford.com.au/cars/new-frozen-white-2023-ford-e-transit-433289)
- CNZK: Stock CNZK exists only in stale cached search result; absent from fresh search snapshot. Candidate detail returns Not Found (HTTP 500). Do not infer sold. (https://www.qford.com.au/search/rear-wheel-drive/)
- D8YQ: Cached PDF advertises NEW but fresh PDF endpoint HTTP 404. No current exact HTML stock page established. Do not infer sold. (https://inventory.jarvisford.com.au/download/vehicle-pdf-download.php?vID=38980)
- 432585: Exact fresh page classifies Demo, not New. (https://www.westernford.com.au/cars/demo-frozen-white-2022-ford-e-transit-432585)
- CNZP: Exact fresh page says SOLD. (https://www.maughanthiemford.com.au/cars/new-white-2023-ford-e-transit-cnzp)
- F501703: Dealer inventory lists Demo, not New. (https://www.reefcityford.com.au/search/electric)

### Audit
Four accepted exact NEW Custom ads, with 52 field-level snapshot anchors and raw HTML SHA-256 manifest. Search-cache mileage/price values rejected where fresh HTML differed. Titan old Sport URL failure resolved via current dealer stock index. Complete evidence and validation are in the JSON sibling.

## Australian LDV electric vans: current catalogue and exact advertised stock

As of 10 October 2026. Read-only research, no dealer contact, quote request, reservation or physical-stock check. The adjacent JSON supplies field-level sources, locators, nulls and conflicts.

### Findings that change catalogue handling

- eDeliver 7 has four MY25 configurations in the current manufacturer price guide. Two additional MY23 77kWh configurations are explicitly limited-stock new vehicles. Keep older MY rows separate
- The current April 2026 specification PDF contains three configuration columns and omits the LWB low-roof 88kWh. That configuration remains in the price guide and manufacturer range text, and has an exact live dealer advertisement. Retain the configuration but do not copy every sibling specification into it
- eDeliver 9's model page and current October 2025 specification sheet describe two vans. The fresh October price guide shows only LWB High Roof, with “Get a Quote”. Mid Roof is current brochure-listed, but its current new-sale status needs confirmation
- No exact NEW eDeliver 9 in-stock advertisement was verified. Generic “new to order” listings with no VIN/stock number are excluded. This does not prove that no stock exists nationally
- The older 65kWh eDeliver 9 XLWB cab chassis is absent from the current official catalogue/specification columns. Exclude it from current catalogue rather than promoting generic marketplace order templates

Sources: [LDV price guide](https://www.ldvautomotive.com.au/price/), [eDeliver 7](https://www.ldvautomotive.com.au/vehicles/ldv-edeliver-7/), [eDeliver 9](https://www.ldvautomotive.com.au/vehicles/ldv-edeliver-9/), [current manufacturer downloads](https://www.ldvautomotive.com.au/download-brochure/)

### Manufacturer configurations and core numbers

| Configuration | Official MY | Installed/capacity kWh | WLTP combined km | Cargo m³ | Payload kg | GVM/GVW kg |
|---|---|---:|---:|---:|---:|---:|
| eDeliver 7 SWB Low Roof | MY25 | 77 | 318 | 5.9 | 1,350 | 3,650 |
| eDeliver 7 LWB Low Roof | MY25 | 77 | 310 | 6.7 | 1,285 | 3,650 |
| eDeliver 7 LWB Low Roof | MY25 | 88 | 362 | 6.7 | Unknown, disputed | Unknown in current exact-variant primary sheet |
| eDeliver 7 LWB High Roof | MY25, limited stock | 88 | 328 | 8.7 | 1,175 | 3,650 |
| eDeliver 9 LWB Mid Roof | Not stated | 88.55 | 280 | 10.97 | 1,410 | 4,050 |
| eDeliver 9 LWB High Roof | Not stated | 88.55 | 275 | 12.33 | 1,350 | 4,050 |

All are FWD three-seat panel vans with 150kW. eDeliver 9 specifies 310Nm. eDeliver 7 torque is unresolved: current model page says 310Nm; current PDF row says 330. JSON canonical torque is null.

The range tests' actual loading is not stated. None is a verified fully laden range. Cargo measurement standard is not stated; do not treat these as VDA passenger-boot measurements. Gross and usable battery values are not separately identified. eDeliver 9 identifies LFP chemistry; the current eDeliver 7 sheet does not name chemistry.

[eDeliver 7 April 2026 v3 specification sheet](https://cdn.cms-uploads.i-motor.me/tclce1xvp86q6bvkbhydncm8bsti), [eDeliver 9 October 2025 v1 specification sheet](https://cdn.cms-uploads.i-motor.me/global__d1kuD6Z91MCNDEPNGELsms5S), [eDeliver 7 model page](https://www.ldvautomotive.com.au/vehicles/ldv-edeliver-7/)

### Charging: preserve the exact window and field label

| Configuration covered by PDF | AC maximum | AC 5–100%, single-phase | AC 5–100%, three-phase | DC “Charging Capacity” | DC 20–80% |
|---|---:|---|---|---:|---:|
| eDeliver 7 SWB/LWB Low Roof 77 | 11kW | ~12.2h at 6.6kW | ~8h at 11kW | 78kW | ~43min |
| eDeliver 7 LWB High Roof 88 | 11kW | ~15h at 6.6kW | ~9.3h at 11kW | 90kW | ~43min |
| eDeliver 7 LWB Low Roof 88 | Unverified exact variant | Unverified | Unverified | Unverified | Model page family claim ~43min |
| eDeliver 9 both vans | 11kW | ~12h, rate unstated | ~8h, rate not repeated in timed row | 80kW | ~45min |

DC values are manufacturer charging-capacity ratings, not the average power across the window or a station's nameplate output. The PDFs do not separately label a peak acceptance value, so JSON keeps dc_vehicle_peak_kw null and the published capacity in another field. No 10–80% time is inferred. Type 2 is explicit for AC; DC connector standard is not explicitly named in these sheets.

Times vary with conditions and repeated fast charges. The eDeliver 7 PDF specifically warns that a portable Mode 2 household-socket charger will not charge below approximately 8°C or above approximately 30°C. eDeliver 9 lists a 10A/2kW household charger.

[7 charging table p2](https://cdn.cms-uploads.i-motor.me/tclce1xvp86q6bvkbhydncm8bsti), [9 charging table p2](https://cdn.cms-uploads.i-motor.me/global__d1kuD6Z91MCNDEPNGELsms5S)

### Dimensions and carrying qualifications

| Configuration | L × W × H mm | Wheelbase mm | Cargo L × W × H mm | Unoccupied mass source label |
|---|---|---:|---|---|
| eDeliver 7 SWB LR77 | 4,998 × 2,118 × 1,990 | 3,000 | 2,547 × 1,800 × 1,328 | Kerb 2,300kg |
| eDeliver 7 LWB LR77 | 5,364 × 2,118 × 1,990 | 3,366 | 2,913 × 1,800 × 1,328 | Kerb 2,365kg |
| eDeliver 7 LWB LR88 | Exact current primary column missing | Unknown canonical | Unknown canonical | Secondary candidate 2,445kg only |
| eDeliver 7 LWB HR88 | 5,364 × 2,118 × 2,390 | 3,366 | 2,913 × 1,800 × 1,693 | Kerb 2,475kg |
| eDeliver 9 LWB Mid Roof | 5,940 × 2,062 × 2,545 | 3,760 | 3,413 × 1,800 × 1,802 | Tare 2,640kg |
| eDeliver 9 LWB High Roof | 5,940 × 2,062 × 2,765 | 3,760 | 3,413 × 1,800 × 2,019 | Tare 2,700kg |

eDeliver 7 width above excludes mirrors; including mirrors is 2,323mm. eDeliver 9's 2,062mm width has no mirror qualifier, and its length/height explicitly exclude the rear camera. Do not relabel its tare as kerb weight.

Both sheets state 1,500kg braked/750kg unbraked towing for their covered van columns. eDeliver 7 GCW is 4,250kg, so 3,650kg fully laden plus a 1,500kg trailer is not simultaneously allowed. eDeliver 9's numerical GCM is not stated; do not manufacture it by adding GVM and towing capacity.

Payload includes people, cargo, accessories/options and towball load. Axle limits and GCM also apply. Both sheets warn that genuine towbar/wiring disables blind-spot monitoring. Door openings, wheelarch width, axle limits, ground clearance and turning-circle fields are included in JSON where supported.

[7 dimensions p3 and mass footnote p5](https://cdn.cms-uploads.i-motor.me/tclce1xvp86q6bvkbhydncm8bsti), [9 dimensions p2 and mass footnote p3](https://cdn.cms-uploads.i-motor.me/global__d1kuD6Z91MCNDEPNGELsms5S)

### Warranty

- eDeliver 7: vehicle 5 years/160,000km; battery 8 years/250,000km
- eDeliver 9: vehicle 5 years/160,000km; battery 8 years/160,000km
- Whichever comes first; terms and exclusions apply. Both sheets list five years of unlimited-kilometre roadside assistance
- No retained-capacity percentage was established; battery warranty is not represented as an unconditional degradation guarantee

[7 warranty](https://www.ldvautomotive.com.au/vehicles/ldv-edeliver-7/), [9 warranty](https://www.ldvautomotive.com.au/vehicles/ldv-edeliver-9/), [LDV warranty terms overview](https://www.ldvautomotive.com.au/warranty/)

### Current manufacturer driveaway pricing, not MLP

| eDeliver 7 row | Retail FROM | Eligible ABN FROM | Status |
|---|---:|---:|---|
| MY25 SWB LR77 | $61,042 | $57,990 | Current |
| MY25 LWB LR77 | $63,147 | $59,990 | Current |
| MY25 LWB LR88 | $65,779 | $62,490 | Current |
| MY25 LWB HR88 | $67,358 | $63,990 | Limited stock |
| MY23 SWB LR77 | $58,358 | $54,990 | Limited-stock offer, $9,000 off reference driveaway |
| MY23 LWB LR77 | $60,463 | $56,990 | Limited-stock offer, $9,000 off reference driveaway |

AUD. Live price-guide terms run to 31 October 2026. The eDeliver 7 product banner still says 30 September, so the current October guide is the pricing source. Driveaway includes dealer delivery, 12-month registration, CTP and stamp duty. Eligible ABN entity, participating-dealer, new-stock/no-option and buyer-category exclusions apply; state/dealer differences are possible. Manufacturer list price before on-roads remains null for every record. eDeliver 9 currently has no numeric manufacturer price.

[Current LDV price guide and conditions](https://www.ldvautomotive.com.au/price/)

### Exact live NEW advertisements

These pages were fetched directly and retained the exact URL and identifiers. Advertising is not physical inventory confirmation.

| Seller and exact ad | Advertised configuration | Stock/VIN | Price |
|---|---|---|---:|
| [Motorcorp, Kenwick](https://www.motorcorpldv.com.au/new-cars/for-sale/ldv/edeliver-7/2026/my25/4034204/) | 2026 advertised year, MY25 SWB LR77, 21km | E24646 / LSH14J4C8TV126049 | $57,990 driveaway |
| [Motorcorp, Kenwick](https://www.motorcorpldv.com.au/new-cars/for-sale/ldv/edeliver-7/2026/my25/4026494/) | 2026 advertised year, MY25 LWB LR88, 21km | E24687 / LSH14J4C7TV126110 | $62,490 driveaway |
| [Cumberland, Blacktown](https://www.cumberlandldv.com.au/new-cars/for-sale/ldv/edeliver-7/2026/my25/4003704/) | 2026 advertised year, MY25 LWB LR, 19km; 77kWh from matching stock-ID ad | E23456 / LSFA431J0SA134126 as printed | $59,990 driveaway for ABN |

Motorcorp's SWB prose incorrectly claims 362km; use the manufacturer 318km. Its LWB88 prose claims 328km/1,285kg, while the matching identified marketplace ad says 362km/1,205kg. Manufacturer public selector data has a “1205g” payload typo and the current PDF omits this exact column; canonical payload stays null. Cumberland's exact body/battery identity is provisional because the dealer omits battery capacity and its VIN is only accepted as printed, not decoded or verified. Matching marketplace build dates are July 2026 for E24687 and January 2026 for E23456.

[Matching E24687 ad](https://www.trucksales.com.au/items/details/2026-ldv-edeliver-7-lwb-auto-my25/OAG-AD-26085128/), [matching E23456 ad](https://www.carsales.com.au/cars/details/2026-ldv-edeliver-7-lwb-auto-my25/OAG-AD-26034181/)

### Excluded evidence and unresolved availability

- Five Dock NF5543 MY23 ad and Cumberland E24619 MY25 SWB ad still appear in search caches, but direct URLs redirect to general stock. They do not count as live vehicles
- Five Dock high-roof NF5617 remains an indexed candidate; canonical marketplace page could not be opened and the direct dealer eDeliver 7 stock filter currently returns zero. Not counted as verified live high-roof stock
- John Hughes high-roof example is explicitly SOLD
- Geelong's generic EDEL7SWB “ORDER TODAY” example is template-like and excluded
- DD94812 older-build SWB example has MY25 versus MY23 contradictions and no direct live dealer corroboration. No inferred MY assignment
- Carsales eDeliver 9 van search showed a private used vehicle and two generic new-to-order entries, without exact NEW dealer-stock proof. CarsGuide cab-chassis/van templates have no VIN or stock number

[Five Dock current stock](https://www.ldvfivedock.com.au/our-stock/new-ldv-for-sale-in-five-dock/LDV/eDeliver%207/), [sold John Hughes example](https://www.johnhughes.com.au/cars/new-white-2024-ldv-edeliver-7-x1cp6ydlk7930010), [eDeliver 9 marketplace search](https://www.carsales.com.au/cars/ldv/edeliver-9/van-bodystyle/)
