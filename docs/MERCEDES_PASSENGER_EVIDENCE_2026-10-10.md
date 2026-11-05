# Mercedes-Benz passenger BEV evidence audit

As of 2026-10-10; Australian market; research only. Vans excluded.

## Result

- Eight current manufacturer grade records across EQA, CLA electric, GLB electric, GLC electric, EQS and electric G-Class
- Three live manufacturer NEW-assortment configuration offers, each quarantined because NEW_CARS conflicts with CPO/DEMO stock categories
- No unambiguously NEW physical unit or explicit accepted factory-order evidence verified in this bounded pass. This is not proof of nationwide unavailability
- Four old EQE SUV specification rows retained as historical evidence only
- Twenty-two rejected dealer examples retain condition, freshness and exact identities where available
- No automatic new-catalogue or numeric comparison integration recommended while availability gates remain unresolved

## Current exact-grade coverage

Values below are source claims, not necessarily integration-ready. A hold means the conflicting witnesses remain in JSON and the canonical value is null. Model year remains unassigned unless an exact offer expressly displays it.

| Current AU model | Power | Usable battery | DC peak | AC max | DC 10–80% net | Availability evidence |
|---|---:|---:|---:|---:|---:|---|
| [EQA 250+](https://www.mercedes-benz.com.au/passengercars/models/suv/eqa/overview.html) | 140 kW | 70 kWh | 100 kW | 11 kW | 35 min | Current listing only |
| [CLA 200](https://www.mercedes-benz.com.au/passengercars/models/saloon/cla-electric/overview.html) | 165 kW | 58 kWh | HOLD / unverified | HOLD / unverified | 20 min | Retailer family “now available”; exact grade NEW/order unverified |
| [CLA 350 4MATIC](https://www.mercedes-benz.com.au/passengercars/models/saloon/cla-electric/overview.html) | 260 kW | 85 kWh | 320 kW | HOLD / unverified | 22 min | Retailer family “now available”; exact grade NEW/order unverified |
| [GLB 250+](https://www.mercedes-benz.com.au/passengercars/models/suv/glb-electric/overview.html) | 200 kW | 85 kWh | 320 kW | HOLD / unverified | 22 min | Retailer family “now available”; exact grade NEW/order unverified |
| [GLB 350 4MATIC](https://www.mercedes-benz.com.au/passengercars/models/suv/glb-electric/overview.html) | 260 kW | 85 kWh | 320 kW | HOLD / unverified | 22 min | Retailer family “now available”; exact grade NEW/order unverified |
| [GLC 400 4MATIC](https://www.mercedes-benz.com.au/passengercars/models/suv/glc-electric/overview.html) | 360 kW | 94 kWh | 330 kW | HOLD / unverified | 22 min | Current technical/config page; “Coming soon” conflict |
| [EQS 400](https://www.mercedes-benz.com.au/passengercars/models/saloon/eqs/overview.html) | 270 kW | 112 kWh | HOLD / unverified | HOLD / unverified | 25 min | Live MY27 offer; condition hold |
| [G 580 with EQ Technology](https://www.mercedes-benz.com.au/passengercars/models/suv/g-class-electric/overview.html) | 432 kW | 117 kWh | 210 kW | 11 kW | 29 min | Current listing only |

## Live advertised configurations, separate from verified NEW units

The manufacturer public storefront query AU-NEW_VEHICLES + ELECTRIC returned exactly these configuration offers at the captured time. The result is not every Australian retailer’s inventory. No VIN or registration history was provided.

| Offer | Explicit MY | Wheels | WLTP result | Evidence gate |
|---|---:|---:|---:|---|
| [EQB 250+ / MB2RJ6VMXC](https://www.mercedes-benz.com.au/passengercars/buy/new-car/product.html/MB2RJ6VMXC) | 2026 | 20 inch | 470 km | NEW_CARS vs CPO/DEMO conflict |
| [GLB 350 4MATIC / MBKJXOZ2W2](https://www.mercedes-benz.com.au/passengercars/buy/new-car/product.html/MBKJXOZ2W2) | 2027 | 20 inch | 554 km | NEW_CARS vs CPO/DEMO conflict |
| [EQS 400 / MBEEE19CTC](https://www.mercedes-benz.com.au/passengercars/buy/new-car/product.html/MBEEE19CTC) | 2027 | 21 inch | 710 km | NEW_CARS vs CPO/DEMO conflict |

- EQB250+ MY26 is a separate outgoing cohort: explicitly 70.5 kWh usable, not the current EQA table’s 70 kWh or GLB’s 85 kWh
- EQS400 offer says inStock but also estimated arrival 12 October 2026; physical arrival is not established on the audit date
- Offers have no verified national MLP or postcode-specific driveaway price. No finance, corporate, location-specific or LCT number has been substituted
- Exact offer cargo labels are unscoped: EQB 495/1710 L, GLB 540/1715 L, EQS 610/1690 L. These are retained as raw minimum/maximum labels; no all-seats-up cargo figure is promoted without row and method proof

## Material source conflicts and safeguards

1. AC charging: CLA, GLB, GLC and EQS tables state 11 kW; included default-configuration equipment SA-84B describes 22 kW on-board charging. Canonical AC maximum stays null. The same conflict occurs within the exact GLB350 and EQS400 offers
2. DC charging: CLA200 table states 200 kW while page-selected DC equipment describes 320 kW; EQS400 table/offer states 330 kW while included component descriptions state 350 kW. Canonical values stay null. These are vehicle-capability claims, not merely a station’s rating
3. EQS range: family copy says up to 810 km WLTP; the exact MY27 21-inch offered configuration says 710 km. These are different scopes and must not be merged
4. Current offer consumption fields use the same number with Wh/km and kWh/100km in different sections. Correctly labelled witnesses are preserved, but canonical normalized consumption is null rather than silently fixing a unit
5. Extended mirror widths duplicate body widths, and on GLB/EQS are narrower than the folded-mirror fields. Extended widths are null
6. Door counts differ between SUV/liftback overview and stock feeds. Stock canonical doors are null; the manufacturer’s differing conventions are retained
7. EQS component SA-693 has a wheel title but a DC-charging description. It is not evidence of an additional fitted wheel
8. CLA/GLB/GLC/EQS feature descriptions and default configurations do not establish every grade’s standard equipment. Included flags remain scoped to the exact selected page or offer
9. Refreshed G580 current table is 117 kWh usable / 210 kW DC / 29 minutes. Older 116/200/32 claims are not inherited

## Warranty

[Australian warranty statement, Version 2 / May 2026](https://www.mercedes-benz.com.au/content/dam/australia/passengercars/services/warranty/mercedes-benz-passenger-car-warranty-statement-2026-05.pdf), applicable to purchases from 1 May 2026:

- Vehicle: five years from first registration, unlimited private-use distance; commercial use five years/200,000 km, whichever first
- EQA, EQB, CLA electric, GLC electric and G580: private-use HV battery eight years/160,000 km; remedy threshold below 70% SoH, subject to full terms
- EQE, EQE SUV, EQS, EQS SUV and Maybach EQS: private-use HV battery ten years/250,000 km; below-70% SoH threshold, subject to full terms
- GLB electric is omitted from the current published battery warranty model lists. Its battery years, distance and SoH fields remain null pending an applicable certificate
- Commercial HV-battery coverage excludes EQE, EQE SUV, EQS SUV, Maybach EQS and G580. EQS retains the separately stated commercial battery coverage
- Demonstrator warranty normally starts dealer registration; Western Australia has a delivery-date exception. Do not reset a demo’s warranty to “new”
- Bidirectional charging throughput can add virtual kilometres to the battery-certificate mileage

## Outgoing and future exclusions

- EQA City Edition/Night Edition and old EQA250/350 need exact current unit/grade evidence. Primary LCT copy names City Edition but supplies no verified current price or unit
- EQB national overview redirects to generic SUVs; the live MY26 EQB250+ offer remains an outgoing condition-held cohort. Old EQB250/350 and editions are not silently removed or marked current
- EQE sedan’s named page redirects to generic sedans. EQE SUV still has a legacy page and an August 2023 technical PDF for 300, 350, 500 and AMG53. Historical battery capacity is unclassified gross/usable, and ADR81/02 range is not relabelled WLTP
- Outgoing EQS450/AMG53 sedan and EQS450 SUV have no independently verified fresh NEW unit in this pass; they remain distinct from refreshed EQS400
- Maybach brand copy still promotes EQS680/Night Series, while its model link redirects and the checked physical advert is pre-owned/executive-driven. Night Series is not automatically a separate mechanical trim
- GLC400 Limited Edition is a secondary trim lead only. The national default AU2’s included Superscreen must not be inherited into a reportedly different edition
- Electric CLA Shooting Brake explicitly lacks confirmed Australian availability; C-Class electric, GLA electric, AMG GT 4-Door electric and VLE carry future/Coming soon status

## Dealer condition checks

The companion outgoing-stock audit records exact rejected examples and hashed snapshots. Examples worth preserving:

- [EQA250+ (additional false-positive check)](https://showroom.mbberwick.com.au/listing/2026-mercedes-benz-eqa-eqa250-suv-w1n2437022j216186/): Demonstrator Vehicles; fresh_http_200; VIN W1N2437022J216186; stock 0690114682
- [EQA250+ (additional false-positive check)](https://showroom.mbberwick.com.au/listing/2026-mercedes-benz-eqa-eqa250-suv-w1n2437022j216481/): Demonstrator Vehicles; fresh_http_200; VIN W1N2437022J216481; stock 0690114134
- [Maybach EQS680 4MATIC](https://showroom.mbberwick.com.au/listing/2025-mercedes-benz-eqs-maybach-eqs680-suv-w1n2969552a037834/): Pre-Owned Vehicles / Executive Driven; fresh_http_200; VIN W1N2969552A037834; stock C89423
- [G580 with EQ Technology](https://autosportsgroup.com.au/0690118341-1871725-mercedesbenz-gclass-2026/): Indexed Demo; fresh SOLD; fresh_http_200_sold; VIN W1N4656002X091957; stock 0690118341
- [G580 with EQ Technology](https://showroom.mbberwick.com.au/listing/2026-mercedes-benz-g-class-g580-with-eq-technology-suv-w1n4656002x090411/): Demonstrator Vehicles; fresh_http_200; VIN W1N4656002X090411; stock 0690118332

## Evidence packaging and remaining work

- JSON is the field-level source of truth. Every normalized numerical specification keeps value, unit, basis, source URL, check date and locator; conflicting witnesses are separate
- Original HTML/PDF and parsed data snapshots live in mercedes-passenger-sources with SHA-256 manifest references. Exact dealer snapshots live in mercedes-outgoing-stock-raw
- Existing Roadmark market inventory and catalogue additions were inspected and their hashes recorded; no application code or catalogue integration files were changed
- Highest-value next evidence is a manufacturer clarification of stock condition metadata, exact order-acceptance/new-unit evidence, the GLB battery certificate, and current price/specification documents that resolve charging and cargo scope
- No dealer contact, order, payment, sign-in or form submission was performed
