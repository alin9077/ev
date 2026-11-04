# BYD remaining passenger BEV revalidation
Checked 10 October 2026. Research only; no application edits.

## Results
- Eight existing exact trim records, 201 sourced technical/price facts and 167 equipment rows
- ATTO 3 EVO Dynamic FWD/Premium RWD and legacy Essential remain in current online configuration
- Legacy Premium FWD does not remain in current configuration, but specific NEW dealer units are advertised
- SEALION 7 rear-seat heating and heated steering wheel are Performance-only
- Current-order formal MY remains unverified. Legacy ATTO 3 / ATTO 2 PDF metadata says MY25 despite current 2026 listing/filename context

## Exact trim status
- ATTO 3 EVO Dynamic FWD: accepting_order_requests; unverified; source https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3
- ATTO 3 EVO Premium RWD: accepting_order_requests; unverified; source https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3
- ATTO 3 (pre-EVO) Essential FWD: accepting_order_requests; unverified; source https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf
- ATTO 3 (pre-EVO) Premium FWD: not_in_current_configurator; new_stock_advertisement_verified; source https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf
- ATTO 2 Dynamic: accepting_order_requests; new_stock_advertisement_verified; source https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf
- ATTO 2 Premium: accepting_order_requests; new_stock_advertisement_verified; source https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf
- SEALION 7 Premium RWD: accepting_order_requests; new_stock_advertisement_verified; source https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf
- SEALION 7 Performance AWD: accepting_order_requests; new_stock_advertisement_verified; source https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf

## Stock evidence
- new_stock_advertisement_verified: 2026 BYD ATTO 3 Premium; stock 8106818; VIN LGXCH4CD3T2228789; https://www.booran.com.au/cars/new-2026-byd-atto-3-8106818
- new_stock_advertisement_verified: 2026 BYD ATTO 3 Premium; stock 8113029; VIN LGXCE4CB5T2257265; https://www.booran.com.au/cars/new-2026-byd-atto-3-8113029
- new_stock_advertisement_verified: 2026 BYD ATTO 2 Dynamic; stock 8096070; VIN LC0CE4CB4T4237967; https://www.booran.com.au/cars/new-2026-byd-atto-2-8096070
- new_stock_advertisement_verified: 2026 BYD ATTO 2 Premium; stock 8114784; VIN LC0C74C45T4420385; https://www.booran.com.au/cars/new-2026-byd-atto-2-8114784
- new_stock_advertisement_verified: 2026 BYD SEALION 7 Premium; stock 8121102; VIN LGXCH4CDXT2261966; https://www.booran.com.au/cars/new-2026-byd-sealion-7-8121102
- new_stock_advertisement_verified: 2026 BYD SEALION 7 Performance; stock 8096139; VIN LGXCF4CD9T2192712; https://www.booran.com.au/cars/new-2026-byd-sealion-7-8096139
- excluded_sold: 2026 BYD SEALION 7 Premium; stock 8118039; VIN LGXCH4CD9T2246620; https://www.booran.com.au/cars/new-2026-byd-sealion-7-8118039
- excluded_sold: 2026 BYD SEALION 7 Premium; stock 8117036; VIN LGXCH4CD3T2244264; https://www.booran.com.au/cars/new-2026-byd-sealion-7-8117036
- excluded_sold: 2026 BYD ATTO 2 Premium; stock 8085113; VIN LC0CE4CB3T4211313; https://www.booran.com.au/cars/new-2026-byd-atto-2-8085113
- excluded_used: 2026 BYD ATTO 3 EVO Premium MY26 for sale in Orange, NSW (Cosmos Black)  | Orange RAM; stock None; VIN None; https://www.orangeram.com.au/used-cars/for-sale/byd/atto-3-evo/2026/premium/my26/4096314/

## Qualifications
- Existing records label 2026 Australian specification but no audited formal current-order MY can be inferred from those labels. Metadata for legacy ATTO 3 and ATTO 2 explicitly says MY25. Preserve formal MY null for current order until matched source.
- Legacy ATTO 3 Premium FWD is missing from current official configuration but has directly captured specific NEW stock. Classify residual new-stock advertisement, not current factory order trim.
- Current EVO Dynamic/Premium order requests established. No exact NEW EVO unit verified in this pass; Orange Premium MY26 B239683 is Used/test-drive and excluded.
- SEALION 7 brochure explicitly restricts heated steering wheel and heated rear seats to Performance. Generic product copy must not override exact trim table.
- Legacy current PDF states Type 2 but no numeric AC rating. Do not lift an old 7kW value as newly verified.
- Do not promote calendar year, brochure filename or generic dealer specification into formal model year or exact delivered equipment
- Technical claim locators and SHA256-verified local source snapshots are included in JSON
- No exact NEW Essential or EVO stock unit was verified; this is an evidence gap, not proof of absence
