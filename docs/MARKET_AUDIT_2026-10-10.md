# Australian new-BEV market audit for Roadmark

Research observed 10 October 2026 (UTC). This is a source-led expansion inventory and completeness audit, **not a certification that every Australian new-car trim or every dealer-stock unit has been captured**. Manufacturer retail pages, Australian specification documents and dealer listings are primary evidence. Current page observation is distinguished below from its document/model year and announcement date. No enquiries, orders or other external changes were made.

## Immediate findings

- The supplied catalogue contains 34 trim records, 11 model-generation records and 10 navigation families. It is a comparison shortlist, not an all-market catalogue. Brands present are Tesla, BYD, Geely, Zeekr, Jaecoo and Kia.
- The Electric Vehicle Council's [2026 vehicle factsheet](https://electricvehiclecouncil.com.au/wp-content/uploads/2026/09/2-Vehicles_FINAL.pdf) reports 125 BEV models, alongside 71 PHEVs. Its default cutoff is 30 June 2026, with some explicitly later facts. Its counting scope must be reconciled before using 125 as a denominator for October Roadmark coverage. It is not proof of today's sale or stock status.
- Australian manufacturer lineups have changed materially: older trim names and model years cannot safely be copied from 2025 lists. Current-versus-outgoing separation is essential.
- “Configure”, “Build & Price”, a test-drive link, an owner's manual, ADR approval and a future launch announcement are different evidence. None alone proves an unregistered vehicle is physically in stock.
- Scope needs an explicit publication boundary: passenger cars/SUVs/people movers versus all light-commercial vans/utes, heavy trucks/buses and specialist imports. The literal request for all new EVs includes substantial commercial coverage that the present passenger-comparison schema does not yet describe well.

## Baseline inspected

`data/au_ev_all_variants_2026-10-06.json`, `data/RESEARCH_DATA_DICTIONARY.md`, and project research metadata were read. The root and data copies retain a dated 6 October snapshot. Existing families: Model Y, Model 3, Sealion 7, EX5, 7X, J5 EV, ATTO 2, EV5, EV3, ATTO 3 (EVO plus outgoing generation). Record states already allow outgoing/provisional records; preserve that distinction. Unknown metrics must remain null. Existing metadata explicitly says not every cell was independently reverified and that order listing does not guarantee stock/delivery.

## Evidence/status contract

Use independent fields, not a single ambiguous “available” boolean:

1. `manufacturer_current_listing`: an Australian retail product page identifies the exact trim and a purchasing/configuring route. This supports inclusion as a currently marketed trim, **stock unknown**. If order acceptance itself was not inspected, do not claim a completed order-flow verification.
2. `orderable`: an Australian current order/configuration or dated official statement explicitly opens orders for the exact trim. Delivery may be future; attach a separate delivery qualifier.
3. `preorder`: clearly labelled pre-order/reservation before confirmed local sale/delivery. Keep outside “available now” unless the chosen definition expressly includes preorders.
4. `dealer_new_stock_listed`: a specific Australian dealer's live listing identifies new condition, exact trim/model year and stock number/VIN. Record retrieval time and listing URL. A listing can be stale or subject to sale; phrase as “new stock listed”, not guaranteed immediate delivery.
5. `outgoing_stock_unverified`: an older AU model/trim is plausible but no current new-stock listing was verified. Exclude from current confirmed set.
6. `announced_or_interest_only`: coming soon, register-interest, overseas news or certification only. Exclude from current confirmed set.

Also keep `model_year`, `generation`, `body_style`, `wheel_configuration`, `battery_variant`, `source_effective_date`, `observed_at`, `source_url`, `scope_AU`, `stock_location`, `evidence_excerpt_summary`, and `verification_limits`. An exact trim identity includes drivetrain/battery/body/seating distinctions; cosmetic paint choices and optional packs normally belong in configuration metadata.

## Priority 1: exact missing trim sets directly supported by Australian pages

All pages below were observed 10 October 2026. “Listing” means current Australian manufacturer retail listing with buying/test-drive/build route, not verified stock or delivery. Prices are intentionally omitted unless needed to explain a conflict; a fresh postcode-specific quote is a different task.

| Maker / model | Exact trim or configuration set established | Availability evidence / source |
|---|---|---|
| Kia EV4 sedan | Air Standard Range; Earth Long Range; GT-Line Long Range | [AU product trim table](https://www.kia.com/au/cars/ev4/features.html), current MY27 page, three grades, Build & Price links. Listing; footnote says MY27 inspection information remains subject to change |
| Kia EV6 | Air RWD; GT-Line RWD; GT-Line AWD; GT AWD | [AU product page](https://www.kia.com/au/cars/ev6/features.html), MY27. Three named grades but four drivetrains/configurations; do not count GT-Line as one trim |
| Kia EV9 | Air RWD 7-seat; Earth AWD; GT-Line AWD; GT AWD 6-seat | [AU product page](https://www.kia.com/au/cars/ev9/features.html), MY26, four grades. GT has captain's chairs and six seats; verify Earth/GT-Line seating against brochure when importing full facts |
| Kia PV5 Cargo | Cargo S 4DR Long Range FWD | [AU PV5 Cargo page](https://www.kia.com/au/en/pbv/pv5-cargo) and [MY26 brochure](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/pv5/kia-pv5-brochure.pdf). Light commercial, 2 seats; 71.2kWh and 416km WLTP listed. Do not import overseas Essential/Plus/Passenger trims |
| Chery E5 | MY26 Ultimate FWD | [Current page](https://cherymotor.com.au/models/chery-e5-electric-suv); [8 Apr 2026 official announcement](https://cherymotor.com.au/news/chery-strengthens-ev-value-my26-e5-ultimate-now-priced-37990-driveaway) explicitly says orderable and sole MY26 variant. Older Omoda E5 BX/EX are separate outgoing leads |
| Nissan Ariya | Engage 2WD 63kWh; Advance 2WD 63kWh; Advance+ 2WD 87kWh; Evolve e-4ORCE 87kWh | [Current product page](https://www.nissan.com.au/vehicles/browse-range/ariya.html), [AU specification PDF](https://www.nissan.com.au/content/dam/Nissan/AU/Files/Brochures/Models/Specsheet/ARIYA%20Spec%20Sheet_r2.pdf). Order/listing; dealer-stock search exists but individual stock not inspected. Rendered $1 prices are placeholders, not usable facts |
| Subaru Trailseeker | Trailseeker AWD | [MY26 product page](https://www.subaru.com.au/trailseeker/2026) and [AU brochure](https://docs.subaru.com.au/Subaru-Trailseeker-brochure.pdf). Listing. Accessories/paint packs are not extra powertrain trims |
| Subaru Uncharted | Uncharted AWD | [Official arrival/on-sale announcement](https://www.subaru.com.au/news/the-all-new-all-electric-subaru-uncharted-sev-lands-on-australian-roads), explicitly one variant. Optional roof/paint packs separate |
| Suzuki e VITARA | Motion FWD 49kWh; Ultra ALLGRIP-e 4WD 61kWh | [Product](https://www.suzuki.com.au/vehicles/electric/e-vitara/), [specifications](https://www.suzuki.com.au/vehicles/electric/e-vitara/specifications/). Listing. Suzuki Australia page excludes Queensland/northern NSW distribution territory, requiring separate territorial source if national pricing is claimed |
| Renault Megane E-Tech | techno | [AU product page](https://www.renault.com.au/vehicles/megane-e-tech/). Listing; one current selector trim |
| Renault Scenic E-Tech | techno; techno Long Range; esprit Alpine | [AU product page](https://www.renault.com.au/vehicles/scenic-e-tech/). Listing; separate 60kWh and long-range configurations |
| Renault Kangoo E-Tech | Short Wheelbase; Long Wheelbase | [AU product page](https://www.renault.com.au/vehicles/kangoo-e-tech/). Listing, commercial van; preserve payload/body-length distinctions |
| Volkswagen ID.4 | Pro; GTX | [AU EV range](https://www.volkswagen.com.au/en/range/ev.html), [ID.4](https://www.volkswagen.com.au/en/models/id4.html). Listing; use current MY26 brochure rather than MY25 PDF for full metrics |
| Volkswagen ID.5 | Pro; GTX | [AU EV range](https://www.volkswagen.com.au/en/range/ev.html). Listing |
| Volkswagen ID. Buzz | Pro SWB; Pro LWB; GTX (complete GTX body configuration still to verify) | [AU product](https://www.volkswagen.com.au/en/models/id-buzz.html) lists MY25 and MY26 Pro offers separately. Do not collapse model years or assume all GTX wheelbase options |
| Skoda Elroq | Select 60; Select 85; Sportline 85 | [AU model range](https://www.skoda.com.au/models/range). Listing. A prior 130 Years edition is not established current by this page |
| Skoda Enyaq SUV | Select 60; Sportline 85; RS | [AU model range](https://www.skoda.com.au/models/range). Listing |
| Skoda Enyaq Coupe | Sportline 85; RS | [AU model range](https://www.skoda.com.au/models/range). Listing, distinct body from SUV |
| Deepal S07 | S07 (19-inch standard; 20-inch optional wheels) | [AU product](https://www.deepal.com.au/vehicles/deepal/s07/). Listing; do not automatically make optional wheels a separate marketing trim |
| Deepal E07 | RWD; AWD Performance | [AU product](https://www.deepal.com.au/vehicles/deepal/e07/) and [range brochure](https://www.deepal.com.au/media/a4tls0fd/deepal_e07_range_highlights_brochure_web.pdf). Listing/test drives current. Charging claim is 30–80%, not 10–80% |
| GAC AION UT | Premium; Luxury | [AU spec table](https://www.gacgroup.com/en-au/configuration/AION%20UT/2025), [current Australian homepage](https://www.gacgroup.com/en-au). Order evidence strengthened by offer period 1 Oct–31 Dec 2026; older model page still has Q3 wording |
| Leapmotor B10 BEV | Style 56.2kWh; Design LR 67.1kWh | [AU model page](https://www.leapmotor.net/en-au/models/b10). Listing. Hybrid EV versions must be excluded from BEV set; page combines powertrains and contains hybrid headline range |
| Leapmotor B05 | Style 56.2kWh; Design LR 67.1kWh | [AU model page](https://www.leapmotor.net/en-au/models/b05). Listing; [authorised dealer current offers](https://www.llewellynleapmotor.com.au/) include new B05 with a 2026 delivery window, but individual stock not verified |
| Leapmotor C10 BEV | Style 69.9kWh; Design LR 81.9kWh | [AU model page](https://www.leapmotor.net/en-au/models/c10). Listing. Page conflicts: trim table says WLTP 510km for Design LR while FAQ says 510km NEDC and calls trim Design; quarantine range until matched current brochure settles it. AWD Sports+ needs its own source |
| XPENG X9 | FWD Standard Range; AWD Performance | [21 Jul 2026 official AU launch/order opening](https://www.xpeng.com/au/news/019fa2860f529f8481378a02820600b3). Orders explicit; delivery commencement not independently verified |
| Ford Mustang Mach-E | Select RWD; Premium Extended Range RWD; GT AWD | [MY26 AU price/configuration page](https://www.ford.com.au/price/MustangMach-E). Listing; product marketing page foregrounds Premium/GT but pricing page retains Select. No current numeric price extracted |
| smart #1 | Pro+; Premium; BRABUS | [AU configurator](https://au.smart.com/en/configurator/), exact three choices and pricing bases. Configuration/listing; inventory not inspected |
| MINI electric Aceman | SE; JCW Aceman | [AU electric family](https://www.mini.com.au/en_AU/home/mini-electromobility/the-electric-mini-family.html), [AU model range](https://www.mini.com.au/en_AU/home/range.html). Listing; style packs separate; global FAQ mentioning E is insufficient for an AU E row |
| MINI electric Cooper | SE; JCW Electric | Same [AU electric family](https://www.mini.com.au/en_AU/home/mini-electromobility/the-electric-mini-family.html). Listing; outgoing E needs separate stock verification |
| MINI electric Countryman | E; SE ALL4 | Same [AU electric family](https://www.mini.com.au/en_AU/home/mini-electromobility/the-electric-mini-family.html). Listing; battery/range values differ versus MY25 brochure, so match model year |

## Broad missing-model inventory and follow-up sources

This initial screening table identifies maker/model gaps. The supplementary exact-trim audits below close portions of this backlog and supersede the corresponding tentative status statements; remaining gaps are explicit. All are absent from supplied Roadmark except specifically noted. A current AU listing is stronger than a lead but weaker than stock proof.

| Maker | Current AU primary-source evidence / scope | Remaining verification |
|---|---|---|
| BYD | [AU range](https://bydautomotive.com.au/?gclsrc=aw.ds): ATTO 1, DOLPHIN, SEAL are missing; ATTO 2, ATTO 3 EVO, SEALION 7 already represented | Exact current trim audit follows below; exclude DM-i, SHARK, SEAL 6/6 Touring, SEALION 5/6/8 and M9 because current AU site labels them PHEV |
| MG / IM | [AU range](https://mgmotor.com.au/): MG4 EV Urban, MG4 EV, MGS5 EV, MGS6 EV, Cyberster, IM5, IM6 | Current trim audit follows below. MGU9 EV explicitly coming soon, excluded. MG ZS EV older stock requires unit listing |
| Hyundai | [AU model range](https://www.hyundai.com/au/en/cars): INSTER, KONA Electric, ELEXIO, IONIQ 5, IONIQ 5 N, IONIQ 6 N, IONIQ 9, STARIA Load Electric; MIGHTY Electric is a truck | Current trim audit follows below. Ordinary IONIQ 6 status requires checking; do not infer from generic older electric-page mentions |
| BMW | [AU electric range](https://www.bmw.com.au/en/electric-cars.html): iX, iX1, iX2, iX3, iX4, i4, i5, i7, i3 have model cards; several offer configure links | Exact current AU trims, Touring body and new-generation deliveries require model-specific verification. iX5 and several M versions are interest/coming-soon and excluded pending stronger evidence |
| Audi | [AU models](https://www.audi.com.au/en/models/): Q4 e-tron, Q6 e-tron, e-tron GT listed | Distinguish SUV/Sportback/SQ6 and GT powertrains; A6 e-tron requires exact AU availability; Q8 e-tron old stock cannot be inferred from generic Q8 listing |
| Mercedes-Benz / Maybach / AMG | [AU electric guide](https://www.mercedes-benz.com.au/passengercars/brand/mercedes-me-magazine/performance/articles/mercedes-benz-electric-cars-guide.html) navigation includes EQA, CLA Electric, C-Class Electric, GLA Electric, GLB Electric, GLC Electric, EQS Electric, G-Class Electric, AMG GT 4-door Electric, VLE | Navigation is not order proof. EQB, EQE sedan/SUV, EQS SUV/Maybach, EQV and eVito/eSprinter require stock/order-specific investigation. Full trim audit remains open |
| Volvo | [AU lineup](https://www.volvocars.com/au/l/model-lineup/): EX30, EX40, EX60, EX90, ES90 | EX60 register-interest state must be distinguished. EC40/C40/XC40 Recharge outgoing stock; current exact variants and Cross Country separate |
| Polestar | [AU homepage](https://www.polestar.com/au/): 2, 3, 4 coupe, 4 SUV, 5 | Current configuration names/model years differ from older list; exact audit follows below |
| Porsche | [AU electric range](https://www.porsche.com/australia/aboutporsche/e-performance/explore-ev-models/) and [AU models](https://www.porsche.com/australia/models/) list Taycan, Taycan Cross Turismo, Macan Electric, Cayenne Electric and Cayenne Coupe Electric | MY27 order entries vs deliveries; full trims include multiple Turbo/GT/Black Edition distinctions. Body styles separate |
| Genesis | [AU site](https://www.genesis.com/au/en.html?msockid=3017871be8de6279382891bce9ad637a), [Electrified G80 brochure](https://www.genesis.com/content/dam/genesis/au/en/documents/g80ev/GENESIS_Digital_Brochure_MY2025_G80_Electrified_FINAL.pdf), [Electrified GV70 brochure](https://www.genesis.com/content/dam/genesis/au/en/documents/gv70ev/GENESIS_Digital_Brochure_MY2025_GV70_Electrified_Facelift_FINAL.pdf): GV60, Electrified G80, Electrified GV70 | Current trim/generation and GV60 Magma status; PDFs alone are not sale proof |
| Lexus | [RZ AU product](https://www.lexus.com.au/models/rz/overview), [May 2026 announcement](https://www.lexus.com.au/news/2026/05/lexus-expands-rz-line-up-with-new-performance-model): RZ 500e/550e, current product also mentions 600e F Sport Performance | Resolve 500e Luxury/Sports Luxury, 550e F Sport, 600e availability. UX 300e and RZ450e old stock; ES BEV not inferred from ES model family |
| Mazda | [BEV range](https://www.mazda.com.au/electric/battery-electric/): 6e available/test drives, CX-6e preorder | CX-6e GT/Azami explicitly preorder in current [product page](https://www.mazda.com.au/cars/cx-6e/), despite April release expecting September deliveries. MX-30 remaining new stock unverified |
| Toyota | [bZ4X December 2025 AU update](https://www.toyota.com.au/discover/news/upgraded-toyota-bz4x-battery-electric-range-arrives-in-australian-showrooms) establishes FWD/AWD; [bZ4X Touring](https://www.toyota.com.au/bz4x-touring) lists AWD Touring | Verify current model-year identities and trim spec table; do not conflate FWD/AWD/Touring. C-HR+ / Urban Cruiser Australian launch status unverified |
| Subaru | [AU brochures](https://www.subaru.com.au/brochure-download?from=subaru-dna) lists Solterra, Trailseeker, Uncharted | Trailseeker/Uncharted exact rows above; Solterra MY26 AWD/Touring table needs confirmation |
| GWM | [ORA hatch](https://www.gwmanz.com/au/models/hatchback/ora/) and [ORA range](https://www.gwmanz.com/au/ora/) | Old hatch vs new ORA 5 SUV generation/trim/order status. Global linked models are expressly not local launch promises |
| XPENG | [AU July strategy](https://www.xpeng.com/au/news/019fa21eb07f9f8481378a02820600a9) and [AU New G6 article](https://www.xpeng.com/au/insight/xpeng_new_g6_worth_considering): New G6 and X9 | G6 exact 4-row/wheel variant set needs current configurator. L03 Q4 announcement alone not sale proof; older TrueEV/distributor pages should not override factory-backed MY26 data |
| Zeekr | [AU lineup](https://www.zeekrlife.com/en-au/): X, 7X, 009 with Build & Price; 7GT navigation | X and 009 missing; exact trims/seating, 7GT sale status. 7X already present but Black Edition etc need ongoing evidence |
| Geely | EX5 already present. [AU official launch](https://www.geely.com.au/news/geely-auto-officially-debuts-in-australia-and-new-zealand-strategically-expanding-its-presence-in-five-continents) | EX2/other 2026 entries need dedicated AU range check; do not assume global names |
| GAC | AION UT exact rows above; [AU site](https://www.gacgroup.com/en-au) and [user manuals](https://www.gacgroup.com/en-au/user-manual) also identify AION V | AION V Premium/Luxury trim identity and current offer; M8 PHEV and EMZOOM excluded |
| KGM | [AU site](https://kgm.com.au/): Torres EVX; Musso EV, with new-vehicle Sept–Dec 2026 offer | Exact FWD/AWD ute trims, EV-accredited dealers, warranty/model-year facts. Diesel Musso excluded |
| Denza | [AU range](https://www.denza.com/au): D9 all-electric with Build & Order; Z9GT navigation | D9 FWD/AWD from [AU MY26 specification PDF](https://www.denza.com/material/denza-site/au/spec-sheet/MY26_DENZA_D9_Spec_Sheet_AU_260306.pdf); verify full names/order. Z9GT current local delivery/trim status open. B5/B8 are PHEV |
| Cadillac | [AU FAQ](https://www.cadillacanz.com/au-en/frequently-asked-questions) and [March 2026 AU launch](https://news.cadillacanz.com/newsroom.detail.html/Pages/news/anz/en/2026/mar/Cadillac-expands-all-electric-luxury-SUV-line-up.html): OPTIQ, LYRIQ, VISTIQ | Luxury/Sport/Lyriq-V exact local trim set, MY25/MY26 differences |
| CUPRA | [AU model interest page](https://www.cupraofficial.com.au/cars/ryi) identifies Born and Tavascan | Current trim/configuration pages needed; Born VZ and Tavascan Endurance/VZ are leads until matched primary evidence |
| smart | [AU configurator](https://au.smart.com/en/configurator/) lists #1 and #3; #5 product link | #3 exact set, #5 availability. #1 exact set above |
| Fiat / Abarth | [AU Fiat 500e](https://www.fiat.com.au/fiat/500e-electric) has offers and stock locator; [AU Abarth buyers guide](https://www.fiat.com.au/content/dam/fiat2023/au/pdf/abarth/500e/buyersguide/abarth-500e-buyersguide-may-2024.pdf) | Imported-new stock versus ongoing orders requires proof; old brochure not enough. Abarth 600e overseas launch not AU proof |
| Alfa Romeo | [AU Junior](https://www.alfaromeo.com.au/models/junior) has Elettrica configure/buy; specific new dealer stock below | Separate Ibrida hybrid. Product heading appears inconsistent, so use brochure/dealer Elettrica exact identity |
| Jeep | [AU homepage](https://www.jeep.com.au/) current Avenger offer; [AU buyers guide](https://www.jeep.com.au/content/dam/cross-regional/apac/jeep/en_au/pdfs/bg/avenger/jeep-avenger-my24-buyers-guide-oct2024.pdf) covers Longitude/Limited/Summit | Current trim retention versus stock; Recon/Wagoneer S not established AU orderable |
| Lotus | [AU Eletre model page](https://www.lotuscars.com/en-AU/eletre/models), Emeya family | Local current 600/900 and S/R naming, delivery and stock require dealer/order source |
| Maserati | [AU Folgore range](https://www.maserati.com/au/en/models/folgore) includes Grecale, GranTurismo, GranCabrio | AU current orderability and exact versions; global MY27 announcements insufficient |
| Rolls-Royce | Spectre / Black Badge Spectre leads | Dealer AU order/stock evidence needed; global Series II pages do not prove AU status |
| Jaguar | [AU I-PACE model page](https://www.jaguar.com/en-au/jdx/jaguar-range/i-pace/models/index.html) remains accessible | No new AU stock verified; retain as outgoing lead, not default current orderable |
| Peugeot | [Current AU range](https://www.peugeot.com.au/) lists E-Partner and E-Expert vans; [E-Partner configurator](https://configurator.peugeot.com.au/build-and-buy/build/vehicle/?dp=2765&model_id=1588) shows Pro Long Auto | e-2008/e-308 may be stock/preview only; E-3008/E-5008 overseas existence not local sale proof |
| Ford commercial | [Official AU current range](https://www.ford.com.au/support/how-tos/support-search-only/vehicle-index/what-is-fords-current-vehicle-range) lists E-Transit, E-Transit Custom and Transit City | Exact body/roof/GVM/battery configurations and Transit City availability; Ranger PHEV excluded |
| LDV | [Current AU range](https://www.ldvautomotive.com.au/vehicles/) lists eDeliver 5, eDeliver 7, eDeliver 9 | Exact configurations. eT60/MIFA 9/eTerron 9 require current new-stock/order verification; absence from current range is not proof no new stock exists |
| Farizon | [Official AU site](https://farizonauto.au/) V7E available; SV SuperVan; H9E light truck leads | Exact V7E and SV configs; SV dealer specific stock below. Trucks require explicit scope handling |
| Renault commercial | [AU range](https://www.renault.com.au/vehicles/) additionally lists New Master Van E-Tech | Exact current AU battery/roof/wheelbase/GVM versions and availability |
| Mercedes vans | eVito, eVito Tourer, EQV, eSprinter leads | Current official Australian van catalogue and stock audit still required |

## Announced / interest-only / unresolved exclusions

- [Deepal S05](https://www.deepal.com.au/vehicles/deepal/s05/) is a register-interest page, with an interest-in-preorder field, not a verified open-order/stock page.
- [Leapmotor B03X](https://www.leapmotor.net/en-au/models/b03x) says register interest for future order opening/dealership arrival. Exclude from available-now set.
- MG MGU9 EV is explicitly coming soon on [MG Australia](https://mgmotor.com.au/).
- Mazda CX-6e GT/Azami remain preorder on [current page](https://www.mazda.com.au/cars/cx-6e/). Earlier expected delivery date is not proof deliveries happened.
- BMW coming-soon cards for iX3 M60, iX4 M60, i3 M60 and interest-only iX5 are not current stock proof.
- Honda [Super-ONE EOI](https://www.honda.com.au/cars/honda-super-one-eoi.html) is an expression-of-interest lead; e:Ny1 is not established current Australian new-sale stock.
- Tesla S/X/Roadster/Cybertruck, historical Nissan LEAF, BMW i3 hatch, Hyundai original IONIQ Electric, Mazda MX-30 BEV, MG ZS EV, Lexus UX300e, Jaguar I-PACE, Mercedes EQC, outgoing Audi Q8 e-tron, Citroen EVs, Renault Zoe, LDV eT60/MIFA 9 require specific new Australian stock evidence before inclusion. Do not confuse used/private imports with manufacturer-supported new retail.
- Dongfeng/Nammi, JAC E30X, Skywell, Seres, NIO, VinFast, Changan-branded models, Foton light vans, JMEV/Joylong/ACE EV and conversion/import specialists remain market-universe leads, not verified entries. Failed searches do not establish absence. Separate grey-import and conversion scope if desired.

## Specific new-stock evidence collected (not national stock guarantees)

1. [Zagame Alfa Romeo Junior Elettrica stock N58772](https://www.zagamealfaromeo.com.au/new-car/alfa-romeo/junior/elettrica/n58772/): 2026 Junior Elettrica Auto FWD Series 1, explicitly New Car, 20km, stock N58772, Richmond VIC 3121. Dealer advertises immediate delivery. Observed 10 Oct 2026; a live listing is not a guarantee the unit remains unsold.
2. [Farizon Perth SuperVan stock 900006](https://farizonperth.com.au/stock/details/47398-900006/2025-farizon-supervan-new): 2025 MY25 SV LWB Low Roof FWD, explicitly New, 1km, stock 900006, Canning Vale WA 6155. Observed 10 Oct 2026. This proves an advertised specific new unit, not factory-order availability for every variant.

## Ranked-comparison integrity gates

These are proposed data rules based on inspected source conflicts, not rankings fabricated from missing cells:

- Rank within one explicit cohort (current order-listed or verified new-stock, AU, matching model year/configuration and measurement basis). Show dataset count/date/coverage, never imply a sampled cohort is the entire market.
- Price: separate MLP/base before ORC, national driveaway offers and postcode-specific driveaway quotes; include mandatory order/delivery charges consistently. Exclude expired offers and placeholder prices. Do not compare finance repayments or novated-lease savings to purchase prices.
- Range: WLTP combined only against WLTP combined, not NEDC/CLTC/EPA/ADR-derived figures without confirmed procedure. Preserve wheel/trim and certified-versus-target labels. Subaru Trailseeker headline 533km ADR-basis and Toyota Touring WLTP 488km illustrate why shared architecture does not imply equal range basis.
- Charging: 10–80%, 20–80% and 30–80% times are different metrics. Peak DC kW is not charging speed over an interval; km added per 15 minutes is another metric. Charger capability and vehicle acceptance limits must not be confused.
- Cargo: VDA below parcel shelf versus to roof, manufacturer unspecified versus measured, seats up versus folded and inclusion of underfloor/frunk differ. Ranking a Tesla seats-up number against a VDA competitor number is misleading.
- Acceleration: keep 0–100 km/h distinct from 0–60 mph and rollout-excluded/launch/boost claims. Peak power with launch boost differs from continuous power.
- Battery: usable/net and gross capacities are not interchangeable. Chemistry, pack energy density and cell energy density are separate. Do not infer battery density from vehicle kerb weight.
- Towing/payload: braked/unbraked, tow package/controller, GVM/GCM and payload at maximum tow are conditional. Passenger-car rank should not silently mix with commercial body variants.
- Features: standard/option/subscription/future promised/region-dependent/unknown are separate states. Unknown is not absent or zero.
- Tie policy: equal comparable numeric values at source precision receive equal rank. Use a clearly chosen competition rank (1,1,3) or dense rank (1,1,2), not row order as tie breaker; alphabetical ordering may stabilize display without implying a performance difference. Do not break ties with secondary criteria unless explicitly named.
- Missing, preliminary and incompatible values receive no rank and no zero. Show exclusion reason and eligible sample size for each metric. One valid value is not evidence of an all-market “best”.

## Completion criteria before claiming full Australian coverage

1. Enumerate the agreed vehicle classes, distribution channels and geographic scope.
2. Maintain every maker/importer screened, its official range URL, observed date and outcome, including no-eligible-model outcomes and unresolved leads.
3. For every model, enumerate the exact selectable AU trim/battery/drivetrain/body/seat combination and model year; reconcile to dealer stock for discontinued trims.
4. Audit the discrepancy to the EVC 125-model baseline, explain additions/removals and body-versus-family counting. Reconcile against the [complete EVC 2026 report](https://electricvehiclecouncil.com.au/wp-content/uploads/2026/09/State-of-EVs_2026_FINAL.pdf) appendix rather than treating the factsheet count as a list. Its 33.26MB PDF exceeded this research browser extraction limit; the report appendix was not reviewed.
5. Validate each metric and feature against trim-specific dated primary sources. Structural validation alone cannot establish automotive factual correctness.
6. Publish separate counts for verified current trims, verified new-stock-only trims, preorders, announced models and unresolved records. Expose last checked date and source link per record.
7. Only then use all-market completeness language. Until then use “Australian EV catalogue, verified subset; coverage audit in progress”.

## Supplementary exact-trim audits

The following exact-trim checks supplement the inventory above. The unresolved broad maker rows remain a research backlog, not a fully specified catalogue.

### BYD additions: current exact AU trims

Checked 10 Oct 2026; all six below have trim-specific Order Now links, but no unit stock verified.

- [ATTO 1](https://bydautomotive.com.au/atto-1): Essential FWD; Premium FWD. WLTP 220/310km.
- [DOLPHIN](https://bydautomotive.com.au/dolphin): Essential FWD; Premium FWD. Dynamic is absent from current trim table. Its cards show NEDC 410/490km, while WLTP from the [linked AU brochure](https://bydautomotive.com.au/brochures/BYD-DOLPHIN-2025.pdf) is 340/427km. Do not combine those cycles.
- [SEAL](https://bydautomotive.com.au/seal): Premium RWD; Performance AWD. Dynamic is absent from current trim table. WLTP 570/520km. [Linked brochure](https://bydautomotive.com.au/brochures/BYD-SEAL-2026.pdf) filename says 2026 but internal title says MY25, requiring explicit document-year handling.

Removed trim names may still have new dealer stock; this audit did not prove such stock or its absence.

### MG / IM: current exact AU trims

All have variant-specific Build & Price links. No guarantee of each variant's immediate stock follows.

| Model | Current exact AU variants | Primary sources and caveat |
|---|---|---|
| MG4 EV Urban | Essence 43 FWD; Essence 54 FWD | [Product](https://mgmotor.com.au/vehicles/mg4-ev-urban), [2026 brochure](https://mgmotor.com.au/brochures/MG4_EV_URBAN_2026.pdf). Separate model from MG4 RWD. DC acceptance 82/87kW; 150kW mentioned in test is charger capability |
| MG4 EV | Essence 64 RWD; XPOWER AWD | [Product](https://mgmotor.com.au/vehicles/mg4-ev). Current Essence 64 LFP differs from old trims/batteries; XPOWER NCM. Old Excite and Long Range 77 require stock proof |
| MGS5 EV | Essence 49kWh RWD; Essence 62kWh RWD | [Product](https://mgmotor.com.au/vehicles/mgs5-ev), [2026 brochure](https://mgmotor.com.au/brochures/MGS5_EV_2026.pdf). No Excite in current table; charging 19/19.3 minutes is 30–80%, not 10–80%. Footer refers to MY25/June 2026 despite filename |
| MGS6 EV | Essence RWD; Essence AWD | [Product](https://mgmotor.com.au/vehicles/mgs6-ev). 77kWh both; current WLTP 530/485km |
| Cyberster | 77kWh RWD; 77kWh AWD | [Product](https://mgmotor.com.au/vehicles/cyberster). AU names, not overseas Trophy/GT; roof colour treated separately |
| IM5 | Premium RWD; Platinum RWD; Performance AWD | [Product](https://mgmotor.com.au/vehicles/im5). Model-level stock-available statement; not trim/VIN-level verification |
| IM6 | Premium RWD; Platinum RWD; Performance AWD | [Product](https://mgmotor.com.au/vehicles/im6). Same stock-evidence limitation |

MG's current homepage still contains expired August/September campaign terms. Do not label those prices current on 10 October. [MGU9 EV](https://mgmotor.com.au/vehicles/mgu9-ev) explicitly remains coming soon despite a generic Build & Price link; this is a concrete example of why a global navigation button does not establish orderability.

### Hyundai: current exact AU trims and conflicts

| Model | Current exact AU configuration set | Primary source / availability limit |
|---|---|---|
| INSTER | Standard Range FWD 42kWh; Cross FWD 49kWh with sunroof | [Current page](https://www.hyundai.com/au/en/cars/eco/inster), [August 2026 brochure](https://www.hyundai.com/content/dam/hyundai/au/en/models/inster/MY26-INSTER-Brochure-Aug-2026.pdf). The [August specification sheet](https://www.hyundai.com/content/dam/hyundai/au/en/models/inster/MY26-INSTER-Specification-Sheet-Aug-2026.pdf) retains a contradictory 49kWh non-Cross tick. Non-Cross Extended Range/roof-basket Cross remain uncertain, not confirmed current |
| KONA Electric | Standard Range FWD; Extended Range FWD; Elite Extended Range FWD; Premium Extended Range FWD; Premium Extended Range FWD + N Line option pack | [MY27 AU specification sheet](https://www.hyundai.com/content/dam/hyundai/au/en/models/kona-ev/key-features/MY27_Specification_Sheet_KONA_Electric.pdf), [current offers](https://www.hyundai.com/au/en/offers/kona.html/offer-detail?variantId=1571). Fifth is expressly a pack, so may be configuration child rather than separate trim. October–December campaign supports current marketing, not individual stock |
| ELEXIO | ELEXIO base FWD; Elite FWD | [Current page](https://www.hyundai.com/au/en/cars/eco/elexio), [spec table](https://www.hyundai.com/content/dam/hyundai/au/en/models/elexio/docs/Hyundai_ELEXIO_Specification_Sheet.pdf). Both single-front-motor 88.1kWh; marketing brochure dual-motor wording conflicts with technical table |
| IONIQ 5 | IONIQ 5 RWD; Elite RWD; Premium N Line AWD | [Current page](https://www.hyundai.com/au/en/cars/eco/ioniq5), [MY27 spec](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/docs/MY27_Specification_Sheet_IONIQ5_Electric.pdf). All 84kWh. Do not recycle older Dynamiq/Epiq trim matrix |
| IONIQ 5 N | IONIQ 5 N AWD | [Current AU page](https://www.hyundai.com/au/en/cars/eco/ioniq5n), Build & Price. Separate performance model, not IONIQ 5 N Line |
| IONIQ 6 N | IONIQ 6 N AWD | [Current page](https://www.hyundai.com/au/en/cars/eco/ioniq6n), [AU spec](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq-6-n/docs/IONIQ-6N-Specification-Sheet.pdf). Single variant; 84kWh. Normal 448kW/740Nm versus N Grin Boost 478kW/770Nm; 3.4s normal vs 3.2s launch. Headline marketing label conflicts, so use spec table with condition |
| IONIQ 9 | Calligraphy AWD 7-seat; Calligraphy AWD 6-seat | [Current page](https://www.hyundai.com/au/en/cars/eco/ioniq9), [MY27 spec](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq-9-2025/docs/Hyundai-IONIQ-9-Specification-sheet-my27.pdf). 110.3kWh/314kW/600km WLTP shared; seat layout is an explicit configuration distinction |

Standard (non-N) IONIQ 6: [former product URL](https://www.hyundai.com/au/en/cars/eco/ioniq6) redirects to the general EV page; [current AU cars listing](https://www.hyundai.com/au/en/cars) lists IONIQ 6 N instead. Keep non-N IONIQ 6 as remaining-stock-unverified; generic EV-page copy is insufficient current-order evidence.

KONA range depends on wheels: standard 370km; extended up to 505km on 17-inch, 444km on 19-inch. Full ranking rows must map actual configuration to its range rather than copying family maximum. MY27 files are current in October 2026, so do not infer launch date solely from model-year label. No specific Hyundai dealer unit or delivery time was checked.

### Premium-brand exact configurations and availability

Checked 10 October 2026. These are catalogue/configuration facts unless stronger evidence is stated. Demonstrators are explicitly excluded from new-stock proof.

**BMW:** current AU catalogue names iX1 xDrive30, iX2 xDrive30, i5 eDrive40, i3 50 xDrive and iX4 50 xDrive ([AU electric catalogue](https://www.bmw.com.au/en/electric-cars.html)). Specific official new-stock listings establish [i4 eDrive35 Gran Coupé, 2026, 0km](https://virtual.bmw.com.au/details/OAG-AD-WBY52HD040FX23838/2026-bmw-i4-edrive35-gran-coup-new), [iX xDrive45, 2026, M Sport fitted](https://virtual.bmw.com.au/details/OAG-AD-WBY42CF090CY37329/2026-bmw-ix-xdrive45-new) and [iX3 50 xDrive, 2026, 0km, Brighton BMW](https://virtual.bmw.com.au/details/OAG-AD-WBA32HR050DA37319/2026-bmw-ix3-50-xdrive-new). These verify named units only, not every possible BMW trim. Do not import global iX60/M70 or old i4 eDrive40/M50/M60 as current AU trims. iX1 xDrive30 Sport Collection is AU-specific, but its [published offer](https://www.bmw.com.au/en/offers-and-services/promotions/sport-collection.html) expired 30 September. i5 M60 Touring, i7 M70 and iX3 40 technical pages alone leave availability unresolved. New i7 60 xDrive is presented as Q4 2026 upcoming and must be kept apart from outgoing xDrive60. Coming-soon iX3/iX4/i3 M60 and iX5 remain excluded.

**Audi:** [September official article](https://magazine.audi.com.au/article/refined-electric-offering) explicitly offers Q6 e-tron sport edition and Q6 Sportback e-tron sport edition for immediate delivery. This is manufacturer model-level stock evidence, not an inspected dealer unit. Its Q6/SQ6 MY27 SUV and Sportback replacements are H1 2027 announcements. Current [e-tron GT configurator](https://www.audi.com.au/en/models/e-tron-gt/e-tron-gt-range/) lists S e-tron GT, RS e-tron GT, RS e-tron GT performance. [MY27 Q4 announcement](https://magazine.audi.com.au/article/new-horizons) expressly opens orders for Q4 e-tron quattro performance and Q4 Sportback e-tron quattro performance, with H1 2027 arrival. RWD entries are announced/priced but the same explicit order statement does not cover them. Legacy Q4 45/55 and earlier Q6 performance/quattro require new-stock evidence. [Q8 e-tron](https://www.audi.com.au/en/models/q8-e-tron/q8-e-tron/) expressly cannot be ordered anymore; A6/S6 AU sales remain unverified.

**Volvo:** MY27 [EX30](https://www.volvocars.com/au/cars/ex30-electric/) lists Plus P5 Long Range Electric, Ultra P5 Long Range Electric and Cross Country P8 AWD Electric. [EX40 configurator](https://www.volvocars.com/au/build/ex40-electric/) lists Ultra Single Motor Extended Range and Ultra Twin Motor. [ES90](https://www.volvocars.com/au/cars/es90-electric/) presents Plus/Ultra and Single Motor, but all grade-powertrain mapping was not inspected. A [Castle Hill ES90 Plus Single Motor RWD, 2026](https://volvocarscastlehill.com.au/vb003360-1838809-volvo-es90-2026/) is explicitly in stock. [EX90](https://www.volvocars.com/au/cars/ex90-electric/) has Plus/Ultra and Single Motor/Twin Motor Performance; do not assume the full cross-product of four combinations. [EX60 configurator](https://www.volvocars.com/au/build/ex60-electric/) exposes Ultra P6 Electric and Ultra P10 AWD Electric, but [FAQ](https://www.volvocars.com/au/cars/ex60-electric/) says test drives coming soon: prelaunch/configuration listing with delivery unresolved. Old EX30 “Single Extended” campaign names and MY27 P5 naming must not be silently merged. EC40/C40 current orders unverified.

**Polestar:** current AU specifications establish the following:
- [2](https://www.polestar.com/au/polestar-2/specifications/): Long range Single motor; Long range Dual motor; Long range Dual motor with Performance pack. MY27 homepage instead uses Rear motor naming, an unresolved generation/naming conflict
- [3 MY27](https://www.polestar.com/au/polestar-3/specifications/): Rear motor; Dual motor; Performance, distinct from older Long range and Performance-pack versions
- [4 coupé](https://www.polestar.com/au/polestar-4-models/polestar-4-coupe/specifications/): Rear motor; Dual motor; Dual motor with Performance pack option
- [4 SUV](https://www.polestar.com/au/polestar-4-models/polestar-4-suv/specifications/): Rear motor; Dual motor; Performance pack equipment option rather than independent powertrain
- [5](https://www.polestar.com/au/polestar-5/specifications/): Dual motor; Performance; Launch edition is equipment

[October offers](https://www.polestar.com/au/) substantiate 2/3/4 coupé orders. [Stock funnel](https://www.polestar.com/au/stock-cars/) includes 2/3/4 coupé/4 SUV but combines built Australian and in-transit vehicles; no specific trim's physical stock was verified. Polestar 5 has configuration/order listing but local actual delivery remains unresolved.

**Porsche:** current AU configuration selection contains 25 configurations, with packages retained explicitly:
- [Taycan sedan MY27](https://www.porsche.com/australia/models/taycan/taycan-models/taycan/): Taycan; 4; Black Edition; 4 Black Edition; 4S; 4S Black Edition; GTS; Turbo; Turbo S; Turbo GT; Turbo GT with Weissach Package
- [Taycan Cross Turismo MY27](https://www.porsche.com/australia/models/taycan/taycan-cross-turismo-models/taycan-4-cross-turismo/): 4; 4S; Turbo
- [Macan electric MY27](https://www.porsche.com/australia/models/): Electric; 4 Electric; 4S Electric; GTS; Turbo Electric. [GTS official AU order announcement](https://newsroom.porsche.com/en_AU/2025/products/porsche-macan-gts-electric-40889.html)
- [Cayenne electric](https://www.porsche.com/australia/models/cayenne/cayenne-electric-models/cayenne-s-electric/): Electric; S Electric; Turbo Electric; Coupé Electric; S Coupé Electric; Turbo Coupé Electric. [S AU order announcement](https://newsroom.porsche.com/en_AU/2026/products/porsche-the-new-cayenne-s-electric-41872.html) expected Q3 2026 arrival; elapsed forecast is not actual delivery proof

No individual Porsche new unit was checked. No AU current Sport Turismo or Turbo S Cross Turismo was established.

**Mercedes-Benz:** exact current AU technical listings include [EQA 250+](https://www.mercedes-benz.com.au/passengercars/models/suv/eqa/overview.html); [CLA 200 electric and CLA 350 4MATIC electric](https://www.mercedes-benz.com.au/passengercars/models/saloon/cla-electric/overview.html); [EQS 400](https://www.mercedes-benz.com.au/passengercars/models/saloon/eqs/overview.html); [G 580 with EQ Technology](https://www.mercedes-benz.com.au/passengercars/models/suv/g-class-electric/overview.html); [GLB 250+ and GLB 350 4MATIC electric](https://www.mercedes-benz.com.au/passengercars/models/suv/glb-electric/overview.html). Delivery/new stock remains unverified. Specific CLA200/EQA250+/EQB250+ dealer examples found were demonstrators, not qualifying new-stock evidence. [GLC 400 4MATIC electric](https://www.mercedes-benz.com.au/passengercars/models/suv/glc-electric/overview.html) has AU specifications but [official feature](https://www.mercedes-benz.com.au/passengercars/brand/mercedes-me-magazine/design-style/articles/the-all-new-electric-glc.html) explicitly says not yet available in Australia. C-Class Electric, GLA Electric, AMG GT 4-Door Electric and VLE remain upcoming. Old EQE sedan, EQS SUV URLs redirect; EQE SUV is enquiry-only. Old EQE/EQS/Maybach AMG versions must not be promoted to current orders from historical articles.

### Additional brands: exact missing trims and status corrections

These checks close portions of the earlier broad-maker backlog. Checked 10 October 2026; “current” means advertised AU range, with stock unverified unless separately stated.

| Maker / model | Exact verified AU configurations | Evidence and status |
|---|---|---|
| Zeekr X | MY26 RWD; AWD | [Current model](https://www.zeekrlife.com/en-au/models/new-zeekr-x/), Build & Price plus both [test-drive choices](https://www.zeekrlife.com/en-au/test-drive/) |
| Zeekr 009 | 7-Seat FWD; 7-Seat AWD; 6-Seat AWD | [Current selector](https://www.zeekrlife.com/en-au/models/009/), buying link and all three test-drive choices |
| Geely EX2 | Complete; Inspire | [Geely Geelong authorised dealer](https://www.geelygeelong.com.au/models/ex2), [Geely Orange](https://www.geelyorange.com.au/models/ex2) establish exact trims/current sales. Manufacturer-hosted site not fetched successfully; no specific unit was captured for stock certification |
| GAC AION V | Premium FWD; Luxury FWD | [AU spec columns](https://www.gacgroup.com/en-au/configuration/aion-v/2025), [current offer](https://www.gacgroup.com/en-au/suv/aion-v) requires orders by 31 Oct and delivery by 15 Nov. An obsolete configurator removal message does not override the current active model offer |
| KGM Torres EVX | EVX FWD | [Combined Torres model page](https://kgm.com.au/models/torres), [current offers](https://kgm.com.au/offers). Single AU electric grade; UK K30/K40 names excluded. AU K40 on page is hybrid |
| KGM Musso EV | 2WD; AWD; optional 2WD Black Edge edition/pack | [Model](https://kgm.com.au/models/musso-ev), [MY26 spec PDF](https://kgm-rebuild-nextjs-postgres-assets-s3.s3.ap-southeast-2.amazonaws.com/KGM_Musso-EV-MY26_Specs%20and%20Features.pdf), [Sept–Dec offer](https://kgm.com.au/offers). Two core powertrain trims; third only as named configuration/pack |
| Denza D9 | FWD; AWD | [AU MY26 spec](https://www.denza.com/material/denza-site/au/spec-sheet/MY26_DENZA_D9_Spec_Sheet_AU_260306.pdf), [model Build & Order](https://www.denza.com/au/car/d9). No live stock checked |
| Cadillac OPTIQ | Sport AWD | [March AU launch](https://news.cadillacanz.com/newsroom.detail.html/Pages/news/anz/en/2026/mar/Cadillac-expands-all-electric-luxury-SUV-line-up.html), [current model/October purchase offer](https://www.cadillacanz.com/au-en/optiq-electric-suv), [2026 spec](https://shop.cadillacanz.com/cms/models/Cadillac%20OPTIQ%20Specifications-2026.pdf) |
| Cadillac VISTIQ | Platinum AWD, 6 seats | Same [March launch](https://news.cadillacanz.com/newsroom.detail.html/Pages/news/anz/en/2026/mar/Cadillac-expands-all-electric-luxury-SUV-line-up.html), [current product](https://www.cadillacanz.com/au-en/vistiq-electric-suv), [FAQ explicitly currently offered](https://www.cadillacanz.com/au-en/frequently-asked-questions) |
| Cadillac LYRIQ | MY27 Sport AWD; LYRIQ-V AWD | [MY27 September specification announcement](https://news.cadillacanz.com/newsroom.detail.html/Pages/news/anz/en/2026/sep/2027-Cadillac-LYRIQ-Pricing-and-Specification.html), [V AU launch 18 Sep](https://news.gmanz.com/newsroom.detail.html/Pages/news/anz/en/2026/sep/Cadillacs-quickest-car-ever-arrives-down-under.html), [V model](https://www.cadillacanz.com/au-en/lyriq-electric-suv/lyriq-v). MY25 Luxury belongs to residual-stock audit, not MY27 grade list |
| CUPRA Tavascan | Endurance RWD; VZ AWD | [AU exact two-grade range](https://www.cupraofficial.com.au/cars/tavascan/versions-and-equipment), [Sept–Oct 2026 offer](https://www.cupraofficial.com.au/shopping/offers/chargefox-tcs). Interior/Extreme are option packs; older page metrics need model-year reconciliation |
| smart #3 | Pro+; Premium; BRABUS | [AU homepage](https://au.smart.com/en/) individually lists all three with configurator links |
| smart #5 | Pro+; Premium; BRABUS | [AU model lines](https://au.smart.com/en/hashtag-five/), [official offer](https://au.smart.com/en/special-offers/smart5-introductory-offer/) explicitly accepts orders from 18 Sep 2026, delivery by 31 Dec required. Homepage “coming” wording is weaker than explicit current-order terms; actual delivery commencement unverified |
| Lexus RZ | RZ 500e Luxury AWD; RZ 500e Sports Luxury AWD; RZ 550e F Sport AWD | [May AU launch/pricing](https://www.lexus.com.au/news/2026/05/lexus-expands-rz-line-up-with-new-performance-model), [current product](https://www.lexus.com.au/models/rz/overview). RZ600e mention needs separate trim/order check; US350e/450e grades excluded |
| Genesis GV60 | Advanced RWD | [Current AU spec selector](https://www.genesis.com/au/en/models/luxury-suv-genesis/gv60/specs.html). Earlier [new-stock finance campaign](https://www.genesis.com/au/en/shopping/offers.html) expired 30 Sep, so not current stock proof. Older AWD/Performance AWD brochures are not evidence of current facelift trims |
| Genesis GV60 Magma | Magma AWD | [Current Build and Order model](https://www.genesis.com/au/en/models/luxury-suv-genesis/gv60-magma/highlights.html), [test-drive selection](https://www.genesis.com/au/en/shopping/book-a-test-drive.html). MY27 brochure listed; physical stock and explicit deliveries unverified |
| Genesis Electrified GV70 | Signature Performance AWD | [Current sole spec selector](https://www.genesis.com/au/en/models/luxury-suv-genesis/gv70-ev/specs.html), [current 84kWh AU spec](https://www.genesis.com/content/dam/genesis/au/en/documents/gv70ev/GENESIS_Specification_Sheet_Eletrified_GV70.pdf). Current model/test-drive availability; no unit stock |
| Genesis Electrified G80 | Signature AWD | [94.5kWh AU spec](https://www.genesis.com/content/dam/genesis/au/en/documents/g80ev/GENESIS_Specification_Sheet_Electrified_G80.pdf), [current model](https://www.genesis.com/au/en/models/luxury-sedan-genesis/g80-ev/highlights.html). Current model/test-drive availability; no unit stock |

Additional explicit exclusions: [CUPRA Born](https://www.cupraofficial.com.au/cars/born) now says unavailable to order in Australia and sold out; Born VZ is not a verified current AU model. [Zeekr 7GT](https://www.zeekrlife.com/en-au/models/zeekr-7gt/) is interest-only and expressly says registration is not an order or availability guarantee. [Denza Z9GT](https://www.denza.com/au/car/z9gt) says arriving soon/register interest.

## Machine-readable companion

`market-inventory.json` accompanies this report: 99 source-backed model records across 35 brands, 209 named trim/configuration entries, 38 unresolved lead groups, and six model records with specific new-stock evidence. These are research-record counts, not a claim of 99 currently available models or 209 complete Australian marketing trims. It separates source-backed additions from unresolved leads, excludes the ten existing catalogue families, and carries exact trim names, source URLs, check date, order/stock status and limitations. It is an evidence inventory, not a full numeric-spec import: every record is **ineligible for ranking by default** until its metrics meet the comparison gates above. Some records describe future delivery orders or prelaunch configuration listings; consumers must filter status and delivery qualifiers, not treat all rows as available-now vehicles. The inventory remains explicitly incomplete.
