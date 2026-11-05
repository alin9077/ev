# Expanded Australian battery-electric road-vehicle inventory

Checked 10 October 2026 UTC. The companion `market-inventory-expanded.json` consolidates the passenger-market inventory and three bounded commercial/heavy/import censuses. **The market universe remains open.** These are research records, not a claim that every vehicle or exact configuration is currently available to buy.

## Counts and interpretation

| Vehicle class | Deduplicated model-audit records |
|---|---:|
| Passenger cars, SUVs and people movers | 99 |
| Vans | 19 |
| Utes/pickups | 13 |
| Trucks | 27 |
| Buses and bus chassis | 27 |
| Total | 185 |

The 185 records include 33 with explicit current order/sales evidence, 148 with listing-only or unresolved order evidence, and four retained as not current. Future-delivery orders, residual-stock candidates, new imported/remanufactured supply offers and bus chassis are qualified separately. Do not display 185 as an available-new-vehicle total.

There are 285 named trim/configuration entries, including packages, wheelbases, bodies and incomplete matrices. Forty-seven model records have no exact trim set established. Eight model records have evidence of particular advertised new-stock units; this does not mean every trim is stocked. Eighty-eight unresolved lead groups remain, while eight previous lead groups are cross-referenced to the consolidated records. Five peripheral entries are kept separate: three terminal tractors, one bus-body platform and one truck-conversion system.

Road-registered motorcycles/scooters and specialist low-volume imports remain open categories. E-bikes/personal mobility and unrestricted industrial/off-road equipment were not audited under the original new-road-vehicle catalogue context.

## Reconciliation and provenance

Six duplicate model observations were merged:

- Renault Kangoo E-Tech
- Kia PV5 Cargo
- Farizon SV / SuperVan
- Farizon H9E
- Foton T5
- JAC N55 EV

Every merge retains source URLs, source-artifact identity, original status/trim observations and limitations. Farizon SV now has four current listed configurations; its earlier specific MY25 LWB Low Roof stock evidence remains confined to that unit. No all-trim stock inference follows.

BYD SEAL and DOLPHIN remain in the audit as evidence, flagged `detailed_catalogue_integrated`. The parent confirmed they are already in the local detailed catalogue, which has 38 trims across 12 families. Do not add duplicate model cards for them. The original ten detailed families remain excluded from this additions inventory.

Input artifacts, with SHA-256 snapshots in the JSON:
- `market-inventory.json` and `market-audit.md`: original passenger-led market audit
- `commercial-ev-census.json` and `.md`: vans, people movers, light trucks
- `heavy-ev-census.json` and `.md`: truck/bus families and chassis
- `ute-import-ev-census.json` and `.md`: OEM electric utes, new import offers, conversions and exclusions
- `byd-seal-dolphin-evidence.json` and `.md`: separate field-level evidence for the four newly integrated BYD trims

## Material findings

- [Toyota HiLux BEV](https://www.toyota.com.au/hilux-ev) is a current Australian offering: SR double-cab cab-chassis, SR double-cab pickup and SR5 double-cab pickup, all AWD. The [official July 2026 launch material](https://pressroom.toyota.com.au/PressKit?pk-code=18d15948-2ca0-49fb-9369-61c5ce492cd9) is stronger than the stale expected-delivery disclaimer on the product page
- [Volvo's next-generation FH/FM/FMX Electric announcement](https://www.volvotrucks.com.au/en-au/news/press-releases/2026/apr/new-generation-electric-trucks.html) explicitly opened orders on 15 June 2026; build slots and body configurations remain unverified
- Mercedes-Benz eActros 400/600 are excluded from current AU availability on manufacturer evidence. An eActros 300 dealer listing and delivered fleet examples do not establish the order status of the unavailable variants
- [Hyundai STARIA Load Electric](https://www.hyundai.com/au/en/cars/people-movers-and-commercial/staria-load), [Renault Master E-Tech](https://www.renault.com.au/vehicles/new-master-van-e-tech/), [Kia PV5 Cargo](https://www.kia.com/au/en/pbv/pv5-cargo) and [Farizon SV](https://farizonauto.au/farizon-sv/) are important additions; doors/body length/battery options need configuration-level handling
- [Ford Transit City](https://www.ford.com.au/trucks-and-vans/transit-city/) has an explicit [current dealer order invitation](https://www.lithgowford.com.au/new-vehicles/transit-city/). Its November arrival appeared in secondary reporting, so the consolidated record verifies orders but leaves first-delivery timing unresolved from primary sources
- Autogroup explicitly advertises [Silverado EV order books open](https://american.com.au/now-available-vehicles-portfolio/right-hand-drive-2026-chevrolet-silverado-ev-pickup-truck-for-australia-wt-lt-and-trail-boss-explained/). It is specialist RHD new-import/remanufacture supply, not a GM Australia factory-distribution launch. Donor status, allocation, compliance and delivery need vehicle-specific verification
- F-150 Lightning remains unresolved: suspended AUSEV operations, conflicting/expired residual campaigns and vanished inventory links cannot establish a current new-stock unit. Low kilometres alone do not make an advertised used/demo vehicle new
- [MGU9 EV](https://mgmotor.com.au/vehicles/mgu9-ev) remains Coming Soon/interest-only. Generic configurator content did not establish tested preorder acceptance. The consolidated status conservatively remains not current
- [Roev](https://www.roev.com/founder-message) discontinued vehicle conversion/manufacturing efforts; historical reservations are not present vehicle availability

## Safe use in Roadmark

All audit records remain ranking-ineligible by default. Use the explicit `vehicleClass` field and field-level compatible metrics before enabling comparisons.

- Separate passenger seats from bus total capacity including standing passengers
- Keep chassis-only, completed body, independent new import/remanufacture and used-donor retrofit services distinct
- Do not count a bus chassis supplier and its body-builder body as two complete vehicles
- Keep body, battery, wheelbase, GVM/GCM and payload conditions attached; do not invent every Cartesian combination from headline options
- Compare WLTP combined with WLTP combined. Commercial maximum-duty-cycle or simulation range does not belong in that cohort
- Quote-only/fleet-contract prices and unavailable metrics remain null, never zero
- Source-backed completed fleet deployments prove vehicles existed; they do not prove an open order book or unsold stock now
- Preserve equal ranks for equal compatible source values. Missing or incompatible data receive no rank

## Still open

No comprehensive dealer-stock crawl or manufacturer-by-manufacturer closed-universe reconciliation has occurred. Truck battery/axle/body matrices, bus chassis/body relationships, legacy supplier continuity, uncertain imports/conversions, road-registered two-wheelers and original passenger trim/stock gaps remain unresolved. EVC's June-dated BEV count is not a reconciled October denominator, especially after broadening the scope to heavy and specialist vehicles.

The JSON retains excluded and not-current evidence, unresolved leads, per-record limitations, source history and peripheral categories so later verification can improve coverage without rewriting uncertainty as fact.
