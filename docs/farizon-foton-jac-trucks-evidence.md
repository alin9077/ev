# Farizon, Foton and JAC truck evidence

Checked 2026-10-10. Research only; no application files changed.

## Result

9 current-linked exact specification records, 6 historical JAC configuration holds, and 3 Foton family holds. This is not a claim that all 18 are currently orderable. Three fresh named NEW seller listings were captured; none proves a complete current specification epoch at VIN level.

## Configuration matrix

| Record | GVM/GVW kg | Battery kWh | WB mm | Payload / body-and-load allowance | Range basis | Decision |
|---|---:|---:|---:|---|---|---|
| farizon-f3e-cab-chassis-72-8kwh | 3495 | 72.8 | 3700 | 1705 | unknown | exact_configuration_snapshot |
| farizon-f3e-tray-72-8kwh | 3495 | 72.8 | 3700 | 1440 | 314 km WLTP | exact_configuration_snapshot |
| farizon-f3e-cargo-box-72-8kwh | 3495 | 72.8 | 3700 | 1190 | 250 km WLTP | exact_configuration_snapshot |
| farizon-h9e-4-5t | 4495 | 100 | 3360 | 1997 | 360 km WLTP | exact_configuration_snapshot |
| farizon-h9e-4-5t-cargo | 4495 | 100 | 3360 | 1227 | unknown | exact_configuration_snapshot |
| farizon-h9e-8t-swb | 7995 | 107 | 3360 | 4615 | 232 km WLTP | exact_configuration_snapshot |
| farizon-h9e-8t-lwb | 7995 | 162 | 4500 | 4085 | 352 km WLTP | exact_configuration_snapshot |
| foton-t5-4495-81-14kwh | 4495 | 81.14 | 3360 | 2095 | 200 km cycle unspecified | exact_configuration_snapshot |
| foton-t5-6000-81-14kwh | 6000 | 81.14 | 3360 | 3600 | 200 km cycle unspecified | exact_configuration_snapshot |
| foton-eaumark-s-configuration-hold | 8500 | 100 | unknown | unknown | unknown | family_hold |
| foton-eauman-d-configuration-hold | 18000 | 281 | unknown | unknown | unknown | family_hold |
| foton-eauman-c-configuration-hold | 31000 | 282 | unknown | unknown | unknown | family_hold |
| jac-n55-ev-4500-3365 | 4500 | 96.77 | 3365 | 1350 | unknown | historical_exact_configuration_hold |
| jac-n55-ev-5500-3365 | 5500 | 96.77 | 3365 | 2350 | 200 km C-WTVC full load | historical_exact_configuration_hold |
| jac-n75-ev-7490-3365 | 7490 | 106.95 | 3365 | 4340 | 245 km C-WTVC full load | historical_exact_configuration_hold |
| jac-n75-ev-7490-3845 | 7490 | 106.95 | 3845 | 4290 | 245 km C-WTVC full load | historical_exact_configuration_hold |
| jac-n90-ev-9000-3845 | 9000 | 106.95 | 3845 | 5680 | 200 km C-WTVC full load | historical_exact_configuration_hold |
| jac-n90-ev-9000-4475 | 9000 | 106.95 | 4475 | 5630 | 200 km C-WTVC full load | historical_exact_configuration_hold |

## Important interpretation changes

- F3E cab chassis: 1,705 kg gross body/load allowance; range not published in its exact column. Tray: 1,440 kg and 314 km WLTP. Cargo Box: 1,190 kg and 250 km WLTP. Do not spread maxima across bodies.
- F3E brochure file includes 20260703 in its name, but printed footer says 03/03/2026. This is a source date, not a model year.
- H9E brochure/range have four named columns, including 4.5T without Cargo Box. Configurator has only three options. No arbitrary flatbed/box combinations added.
- H9E 4.5T AC power conflicts: 22 kW brochure versus current family page 11 kW. 8T brochure lists DC only. Exact AC power remains unknown. Cargo Box range is also held because its brochure cell is blank whereas range page says 360 km.
- Foton T5 current-linked brochure is labelled 2025 Production. The table is rasterised, so the saved rendered page is the authority. It states 81.14 kWh, 2400 kg cab-chassis kerb, 4495/6000 kg GVM, 11 kW AC and 85 kW DC. Its one-hour DC figure has no SoC window.
- Foton eAUMARK S dedicated page explicitly says Coming soon. eAUMAN D/C are listed at 18,000/31,000 kg and 281/282 kWh but cannot become full exact configurations.
- JAC November 2023 PDF contains hidden draft tables that disagree with rendered content. Use the rendered page only. Six GVM/WB combinations are retained as historical technical snapshots with current-order/stock holds.
- JAC ≥120 kW in the charge-time row is charger output, not vehicle acceptance. Full-load C-WTVC claims are not WLTP.
- JAC dealer cached warranty is 5yr/300,000 km plus 8yr/400,000 km battery; visible brochure says 5yr/200,000 km. Current terms unresolved.

## Named new-stock evidence

- East Coast Farizon / Bartons Commercials: New Car, stock 39452, fresh_named_dealer_new_listing. Cargo Box body and 2 seats match; battery/GVM not explicitly specified in this stock page
  Source: https://www.bartonscommercials.com.au/cars/new-silver-2026-farizon-f3e-39452
- Farizon Perth via Xcite Autos seller syndication: New | IN STOCK, stock 900117, fresh_named_dealer_new_listing_via_syndication. 72.8 kWh LFP, tray, 1440 kg payload, RWD, 110 kW/260 Nm stated
  Source: https://www.xciteautos.com.au/cars/farizon-f3e-sg2e-my26
- G & A Lombardi: New, stock 9113494, fresh_named_dealer_new_listing. 3360 mm WB but exact GVM/body and 2025 production epoch not matched
  Source: https://lombardi.com.au/trailer/foton-mobility-t5-electric/
- West End JAC: New (cached ad), stock 94166, stale_indexed_new_listing_current_status_unverified. Wheelbase/GVM/battery not stated; approximate 4200 kg dealer payload not imported
  Source: Saved web-tool search fallback; exact URL in evidence JSON

## Buyer considerations by configuration

### farizon-f3e-cab-chassis-72-8kwh
- Strength: 1,705 kg published body-and-load allowance gives flexibility for a chosen body (Final fit-out and occupants can change available payload)
- Strength: 3.3 kW, 240 V vehicle-to-load supply can support compatible tools or equipment (Check adapter supply and equipment start-up demand)
- Strength: 11 kW AC and 100 kW maximum DC provide depot and on-route charging options (Site supply and charging curve determine actual time)
- Tradeoff: Two seats and a 90 km/h published maximum constrain crew size and faster-road operations
### farizon-f3e-tray-72-8kwh
- Strength: 1,440 kg published tray payload provides a concrete load-planning starting point (Final fit-out and occupants can change available payload)
- Strength: 3.3 kW, 240 V vehicle-to-load supply can support compatible tools or equipment (Check adapter supply and equipment start-up demand)
- Strength: 11 kW AC and 100 kW maximum DC provide depot and on-route charging options (Site supply and charging curve determine actual time)
- Tradeoff: Two seats and a 90 km/h published maximum constrain crew size and faster-road operations
### farizon-f3e-cargo-box-72-8kwh
- Strength: 1,190 kg published cargo box payload provides a concrete load-planning starting point (Final fit-out and occupants can change available payload)
- Strength: 3.3 kW, 240 V vehicle-to-load supply can support compatible tools or equipment (Check adapter supply and equipment start-up demand)
- Strength: 11 kW AC and 100 kW maximum DC provide depot and on-route charging options (Site supply and charging curve determine actual time)
- Tradeoff: Two seats and a 90 km/h published maximum constrain crew size and faster-road operations
### farizon-h9e-4-5t
- Strength: 3,360 mm wheelbase keeps the wheelbase shorter than the H9E LWB option (Final body and swept-path assessment required)
- Strength: 1,997 kg published payload offers a starting point for body and load planning (Body inclusion is insufficiently explained; verify final weighbridge mass)
- Strength: Three seats, 360-degree camera and AEB are listed in the Australian brochure (Confirm actual supplied equipment)
- Tradeoff: AC charging specification is unresolved, so depot infrastructure should be specified only after confirmation
### farizon-h9e-4-5t-cargo
- Strength: 3,360 mm wheelbase keeps the wheelbase shorter than the H9E LWB option (Final body and swept-path assessment required)
- Strength: 1,227 kg published payload offers a starting point for body and load planning (Body inclusion is insufficiently explained; verify final weighbridge mass)
- Strength: Three seats, 360-degree camera and AEB are listed in the Australian brochure (Confirm actual supplied equipment)
- Tradeoff: AC charging specification is unresolved, so depot infrastructure should be specified only after confirmation
### farizon-h9e-8t-swb
- Strength: 3,360 mm wheelbase keeps the wheelbase shorter than the H9E LWB option (Final body and swept-path assessment required)
- Strength: 4,615 kg published payload offers a starting point for body and load planning (Body inclusion is insufficiently explained; verify final weighbridge mass)
- Strength: Three seats, 360-degree camera and AEB are listed in the Australian brochure (Confirm actual supplied equipment)
- Tradeoff: AC charging specification is unresolved, so depot infrastructure should be specified only after confirmation
### farizon-h9e-8t-lwb
- Strength: 4,500 mm wheelbase provides the long-wheelbase H9E base for a larger body (Final body and swept-path assessment required)
- Strength: 4,085 kg published payload offers a starting point for body and load planning (Body inclusion is insufficiently explained; verify final weighbridge mass)
- Strength: Three seats, 360-degree camera and AEB are listed in the Australian brochure (Confirm actual supplied equipment)
- Tradeoff: AC charging specification is unresolved, so depot infrastructure should be specified only after confirmation
### foton-t5-4495-81-14kwh
- Strength: 2,095 kg calculated allowance remains for body and load before fit-out (Not finished-vehicle cargo payload)
- Strength: 11 kW AC and 85 kW maximum DC support both depot and DC charging
- Strength: Current production brochure lists AEB, lane-departure warning and reverse camera (Older dealer stock may differ)
- Tradeoff: 200 km is an unspecified-cycle comparison claim; a loaded route trial is needed
### foton-t5-6000-81-14kwh
- Strength: 3,600 kg calculated allowance remains for body and load before fit-out (Not finished-vehicle cargo payload)
- Strength: 11 kW AC and 85 kW maximum DC support both depot and DC charging
- Strength: Current production brochure lists AEB, lane-departure warning and reverse camera (Older dealer stock may differ)
- Tradeoff: 200 km is an unspecified-cycle comparison claim; a loaded route trial is needed
### foton-eaumark-s-configuration-hold
- Potential strength: 8,500 kg advertised mass class may suit a higher-capacity fleet shortlist (Final body payload and local approved configuration unknown)
- Potential strength: 100 kWh declared battery identifies a fleet-electric candidate (Cannot infer usable energy or range)
- Tradeoff: Published information is insufficient to select body, charging infrastructure or a delivery date
### foton-eauman-d-configuration-hold
- Potential strength: 18,000 kg advertised mass class may suit a higher-capacity fleet shortlist (Final body payload and local approved configuration unknown)
- Potential strength: 281 kWh declared battery identifies a fleet-electric candidate (Cannot infer usable energy or range)
- Tradeoff: Published information is insufficient to select body, charging infrastructure or a delivery date
### foton-eauman-c-configuration-hold
- Potential strength: 31,000 kg advertised mass class may suit a higher-capacity fleet shortlist (Final body payload and local approved configuration unknown)
- Potential strength: 282 kWh declared battery identifies a fleet-electric candidate (Cannot infer usable energy or range)
- Tradeoff: Published information is insufficient to select body, charging infrastructure or a delivery date
### jac-n55-ev-4500-3365
- Potential strength: 1,350 kg calculated body-and-load allowance in the historical specification (Current supplied configuration and completed-body weights need verification)
- Potential strength: 3,365 mm wheelbase offers a defined base for a body feasibility check (Historical specification only)
- Tradeoff: No distinct 4,500 kg range result is published; the 200 km claim belongs to the 5,500 kg test
- Tradeoff: Current supply and warranty terms are unresolved, so this configuration stays on hold
### jac-n55-ev-5500-3365
- Potential strength: 2,350 kg calculated body-and-load allowance in the historical specification (Current supplied configuration and completed-body weights need verification)
- Potential strength: 3,365 mm wheelbase offers a defined base for a body feasibility check (Historical specification only)
- Potential strength: Published full-load C-WTVC range gives a more clearly stated test-load basis than an unqualified range claim (Only for the recorded tested GVM; still not a route guarantee)
- Tradeoff: Current supply and warranty terms are unresolved, so this configuration stays on hold
### jac-n75-ev-7490-3365
- Potential strength: 4,340 kg calculated body-and-load allowance in the historical specification (Current supplied configuration and completed-body weights need verification)
- Potential strength: 3,365 mm wheelbase offers a defined base for a body feasibility check (Historical specification only)
- Potential strength: Published full-load C-WTVC range gives a more clearly stated test-load basis than an unqualified range claim (Only for the recorded tested GVM; still not a route guarantee)
- Tradeoff: Current supply and warranty terms are unresolved, so this configuration stays on hold
### jac-n75-ev-7490-3845
- Potential strength: 4,290 kg calculated body-and-load allowance in the historical specification (Current supplied configuration and completed-body weights need verification)
- Potential strength: 3,845 mm wheelbase offers a defined base for a body feasibility check (Historical specification only)
- Potential strength: Published full-load C-WTVC range gives a more clearly stated test-load basis than an unqualified range claim (Only for the recorded tested GVM; still not a route guarantee)
- Tradeoff: Current supply and warranty terms are unresolved, so this configuration stays on hold
### jac-n90-ev-9000-3845
- Potential strength: 5,680 kg calculated body-and-load allowance in the historical specification (Current supplied configuration and completed-body weights need verification)
- Potential strength: 3,845 mm wheelbase offers a defined base for a body feasibility check (Historical specification only)
- Potential strength: Published full-load C-WTVC range gives a more clearly stated test-load basis than an unqualified range claim (Only for the recorded tested GVM; still not a route guarantee)
- Tradeoff: Current supply and warranty terms are unresolved, so this configuration stays on hold
### jac-n90-ev-9000-4475
- Potential strength: 5,630 kg calculated body-and-load allowance in the historical specification (Current supplied configuration and completed-body weights need verification)
- Potential strength: 4,475 mm wheelbase offers a defined base for a body feasibility check (Historical specification only)
- Potential strength: Published full-load C-WTVC range gives a more clearly stated test-load basis than an unqualified range claim (Only for the recorded tested GVM; still not a route guarantee)
- Tradeoff: Current supply and warranty terms are unresolved, so this configuration stays on hold

## Source registry

Original HTML/PDF bytes are saved with SHA-256 in the JSON. Rendering/OCR artifacts are derivatives and explicitly labelled. JAC dealer fallback is only the web-tool indexed extract; it is not a fresh original capture.

- farizon-f3e: https://farizonauto.au/farizon-f3e/
  SHA-256: 0e744c4488177355a0906b1f6a9ecec6ebc769679cf1c53813aadb2fe0e9adbe
- farizon-h9e: https://farizonauto.au/h9e-light-truck/
  SHA-256: 774ea91695e2a8f3b011c2e9b044b19dc69818bb8ebfbf4e2e1cd0f45798c469
- farizon-range: https://farizonauto.au/range/
  SHA-256: 9038490f5b49523d55565f1270bacec0cbff7f91249cbf50d7b3a0f2655f5163
- farizon-h9e-config: https://shop.farizonauto.au/configurator/h9e
  SHA-256: a91f49aed379a7e88ccc81a50bab5e2f0f5b65dee054e172163c210c22dc64b0
- farizon-f3e-config: https://shop.farizonauto.au/configurator/f3e
  Retrieval failed: HTTP Error 404: Not Found
- foton-range: https://www.fotonmobility.com.au/trucks
  SHA-256: cd551dc3ebcfc7e9bf9629689238240755211f016b72fffd7c476bf1d0236b57
- foton-t5-tipper: https://www.fotonmobility.com.au/t5-tipper
  SHA-256: 49cac5d62dccda3ee69bbf7cf8278db9e3f3280e4cbf56b714ca5b7ad3128ffc
- foton-quick-start: https://www.fotonmobility.com.au/quick-start
  SHA-256: 250466565d2d819366e6f9007ceec8f11849a3b78a2fa21fb77456443a9af790
- foton-sydney-t5: https://fotonevsydney.com.au/t5-electric-truck/
  SHA-256: f786c35ce0a4c881c2a5dc4ab2ac1f16cd824a522282ae3579c9e70a4d91a621
- jac-melbourne-n55: https://www.jacmotorsmelbourne.com.au/models/jac-n55ev
  Retrieval failed: HTTP Error 502: Bad Gateway
- jac-westend-n75: https://westendjac.com.au/models/jac-n75ev/
  Retrieval failed: HTTP Error 502: Bad Gateway
- jac-brochure: https://resource.digitaldealer.com.au/pdf/12444666316540ac201a224269687791.pdf
  SHA-256: bd80870f9d8987d09c20762acafb035901e376479985bf63820ac1b9a849a7e4
  Document date: 2023-11; Cover and disclaimer both November 2023; current technical applicability unverified.
- farizon-f3e-brochure: https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf
  SHA-256: c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97
  Document date: 2026-03-03; Printed footer says current as at 03/03/2026; filename includes 20260703. Neither establishes a model year.
- farizon-h9e-brochure: https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf
  SHA-256: d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd
  Document date: 2025-04-03; Printed final-page date 03/04/2025; currently linked by official model page.
- farizon-f3e-launch: https://jameelmotors.com/en/quick-reads/farizon-auto-australia-expands-commercial-ev-lineup-with-all-new-f3e/
  SHA-256: 707cac42c3ba9930b12cb0fe1ca16d2ca61bfc4562c5b72a480670e629642a44
  Document date: 2026-07-13; Date printed on article.
- foton-t5-brochure-official: https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf
  SHA-256: 8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34
  Document date: 2025; Printed specification footer says 2025 Production; model year not stated.
- foton-t5-booklet-1: https://www.fotonmobility.com.au/_files/ugd/1a32d3_1927c020a85f4530b457605572a51e40.pdf
  SHA-256: 62e2c021e61bbd8cdc09783d8fa437faddd055102a9c6e283f317e357804faaa
  Document date: 2024-10; Cover says Revised October 2024; currently linked from official quick-start page.
- foton-t5-booklet-2: https://www.fotonmobility.com.au/_files/ugd/1a32d3_270e88a1b6db4609b58cade5d4f1e037.pdf
  SHA-256: e2db3d9d42b1172ecc8bc42bfbe4c917f901ce518c08a8dd7c5b210454175242
- foton-t5-brochure-dealer: https://sustainablevehicles.com.au/wp-content/uploads/FOTON-T5-Brochure-September-24-1.pdf
  Retrieval failed: HTTP Error 502: Bad Gateway
- foton-eauman-d: https://www.fotonmobility.com.au/eaumand
  SHA-256: c00ee0df7c18285bf09f9a544f61258200663f9a20d175a5b420736534361e24
- foton-eauman-c: https://www.fotonmobility.com.au/eaumanc
  SHA-256: e5be3392efdf3eab818311d0f745337d59b3abf027d19c0dbd74c1d268dc82db
- jac-westend-n75-stock: https://westendjac.com.au/94166-1338150-jac-n75-2023/
  Retrieval failed: HTTP Error 502: Bad Gateway
- farizon-f3e-cargo-stock: https://www.bartonscommercials.com.au/cars/new-silver-2026-farizon-f3e-39452
  SHA-256: 0c1f8ce8988f76ea98e16db03bf4a3ecce4f58bfe6ee84abfd31ca95da3767ee
- farizon-f3e-tray-stock: https://www.xciteautos.com.au/cars/farizon-f3e-sg2e-my26
  SHA-256: f4519db6edca4a3369b934e7ce30466ce0a2083389743f629581854c7e688cdd
- foton-t5-lombardi-stock: https://lombardi.com.au/trailer/foton-mobility-t5-electric/
  SHA-256: da022b85aadb01d666edd3625555fa8685d09385c76b9be8b92d89ae42515280
- foton-t5-sydney-stock: https://fotonevsydney.com.au/stock/new-trucks-for-sale-smeaton-grange/
  SHA-256: a778ba8ad82b0d9134e33d80b6fedbd8e365c7fb6c45edc7648c1fc445995f71
- foton-t5-brochure-hubspot: https://43078166.fs1.hubspotusercontent-ap1.net/hubfs/43078166/FOTON-T5-Brochure%20-%20September%202024.pdf
  Retrieval failed: HTTP Error 404: Not Found
- farizon-servicing-warranty: https://farizonauto.au/servicing-warranty/
  Retrieval failed: HTTP Error 403: Forbidden
- jac-brisbane: https://www.jacbrisbane.com.au/
  Retrieval failed: HTTP Error 502: Bad Gateway
- foton-eaumark-s: https://www.fotonmobility.com.au/eaumans
  SHA-256: fffbcb47ef466f4f849cb6b8a0effaf4c51d533e530507a15bb0d6b14615c4d4
- jac-n90-sheet: https://resource.digitaldealer.com.au/pdf/1845456159650bd8d643e64920295210.pdf
  SHA-256: 5141b115eee789122468ab8f8255db18c812ddfdbecdf2167a8c31ae44b9357e
  Document date: 2023-07; Cover July 2023; PDF metadata September 2023. N90 available-now wording is historical.
- jac-brochure-files: https://files.digitaldealer.com.au/jac-motor/brochure/JAC_A4_Power_in_Silence.pdf
  SHA-256: bd80870f9d8987d09c20762acafb035901e376479985bf63820ac1b9a849a7e4
  Document date: 2023-11; Byte-identical to jac-brochure.
- jac-importer: https://jacmotor.com.au/
  Retrieval failed: HTTP Error 502: Bad Gateway
- foton-t5-old-promo: https://www.fotonmobility.com.au/deliver-with-foton
  SHA-256: 2ce9b3463d2e2b7ad1c884efbf29365fa7d186614e44d2dcccdfa7e1b5ab853b
- foton-tsx-2026: https://truckshowx.com.au/tsx26-drive-day-bookings-now-open/
  SHA-256: 509824aef782eeb258833c6bd583734763a9efa32de79b1e39b89ef86eca9c56
- farizon-h9e-stock-generic: https://www.onlyearthmoving.com.au/farizon/truck/2025-farizon-h9e-na_34bce455-5dab-4ea4-9bca-db1879819e94
  SHA-256: 9d30f4079d8ea0bc539ccf380223d3c68890aa41f019dee98634edb68291083b
- farizon-servicing-reused: https://farizonauto.au/servicing/
  SHA-256: c02f76a9e21b1d7efa6a52fa081e4a1e42bab859302221f1f47048d3c7bf2f2d
- jac-web-search-fallback: multiple dealer URLs in indexed fallback
  SHA-256: 3353ff47f690d335d6fa9ce3f8295a246b6391576493ed736637fcc88a45bab0

## Files

- Structured evidence: farizon-foton-jac-trucks-evidence.json
- Original source directory: farizon-foton-jac-trucks-sources/
- Reused same-day Farizon servicing source remains in farizon-next-sources/
- No application source code, catalogue data or buyer-guard bindings were changed.