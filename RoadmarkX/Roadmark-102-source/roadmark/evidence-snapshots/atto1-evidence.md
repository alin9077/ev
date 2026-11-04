# BYD ATTO 1: Australian current-trim evidence

Checked 10 October 2026. Two current order trims are verified: **Essential** and **Premium**. Neither is assigned an exact current model year without a scoped match. Research only; no enquiry, order or purchase was sent.

## Integration decisions

- Publish two current Australian BEV trim records, with exact modelYear null
- Retain the explicit brochure Title metadata **MY25 BYD ATTO 1_Spec Sheet_122506** as document-scope evidence, not proof that every live order or 2026-advertised unit is MY25
- Separate A$23,990 Essential / A$27,990 Premium configurator base prices from the Essential A$19,990 promotional driveaway price. Formal MLP remains null because the verified primary pages did not explicitly label the numeric base values as MLP/MSRP
- Essential is advertised for order requests. A current exact new-stock unit was not verified. Premium has exact new-stock advertisements with stock numbers and live configuration links
- Keep unknown towing kg, usable/gross battery split and standardized cargo method null

## Exact trims and common specifications

| Field | Essential | Premium | Evidence |
|---|---:|---:|---|
| Manufacturer variant ID | 2826 | 2827 | Current manufacturer-linked configurator |
| Driven wheels | FWD | FWD | Product comparison and brochure p2 |
| Peak motor output | 65 kW / 175 Nm | 115 kW / 220 Nm | Brochure p2 |
| Advertised battery capacity | 30 kWh | 43.2 kWh | Brochure p2 and configurator |
| Chemistry | LFP | LFP | Handbook p172 |
| Range | 220 km combined WLTP | 310 km combined WLTP | Current product technical-specification modal |
| Seats | 4 | 4 | Brochure p2; handbook p171 |
| Maximum AC acceptance | 11 kW, Type 2 | 11 kW, Type 2 | Brochure p2; AU showcase |
| Maximum DC acceptance | 65 kW, CCS2 | 85 kW, CCS2 | Brochure p2; AU showcase |
| AC 0–100% claim | 3.5 hours | 5 hours | Brochure p2 |
| DC 10–80% claim | 30 minutes | 30 minutes | Brochure p2 |
| Boot, rear seats up | 308 L | 308 L | Product storage section; brochure p2 |
| Boot, rear seats folded | 1,037 L | 1,037 L | Product storage section; brochure p2 |
| 0–100 km/h claim | 11.1 seconds | 9.1 seconds | Product and brochure p2 |
| Kerb weight | 1,294 kg | 1,390 kg | Brochure p2 |

Both are 3,990 mm long, 1,720 mm wide (handbook says excluding mirrors) and 1,590 mm high, with a 2,500 mm wheelbase and a 4.95 m minimum turning radius. V2L capability is standard; output limit was not verified. These are manufacturer claims, not an independent road test.

## Material caveats

**Charging.** The 11/65/85 kW numbers describe the vehicle’s published charging capability. The configurator’s optional 7 kW home charger is separate hardware and must not replace the vehicle AC field. Charging-time rows do not disclose charger output, temperature or other test conditions; do not promise these times on a household socket. The live brochure also prints a second DC time row explicitly labelled 30–100%: 25 minutes Essential / 22 minutes Premium. It is preserved in JSON as an unexplained published claim and excluded from comparison; it has not been silently changed to 30–80%.

**Battery.** 30/43.2 kWh are published capacity figures. The sources do not establish whether they are gross or usable. Do not import different Seagull/ATTO 1 specifications from another market. Handbook product codes EQEAX/EQEBX share LFP chemistry, with powers matching the two Australian trims.

**Range.** The current product modal explicitly calls the values combined WLTP. The brochure table says WLTP, while a generic notice refers to ADR 81/02. The record uses the explicit product-cycle label and retains the discrepancy rather than inventing a conversion. Real driving range will vary.

**Cargo.** The official product text maps 308 L to the normal boot and 1,037 L to folded rear seats. VDA/SAE method, underfloor inclusion and parcel-shelf/roof loading height are not established. These are not automatically comparable with another brand’s cargo figures.

**Towing.** Handbook p88 instructs against towing other vehicles and excludes trailer-towing damage/malfunction from warranty. No numeric braked/unbraked limit was verified. Display the restriction with kg fields null, rather than creating a 0 kg rating.

**Model year.** The brochure Title explicitly says MY25, independently of its filename and December 2025 creation date. Live inventory labels include “2025 Model” and “2026 Model”; their MY/build/compliance meaning is not explicit. The discontinued/sold Booran unit’s stored description says EQE MY25, but that cannot establish the MY of another unit. Current record IDs therefore use “current”, not a presumed MY26.

## Prices and offer dates

The manufacturer-linked retailer configuration presents A$23,990 Essential and A$27,990 Premium as variant base values, with GST components. Options and on-road amounts are separate. Both values are preserved as configuratorBaseVehiclePriceAUD; formalListPriceExOnRoads remains null pending an explicitly labelled manufacturer list price.

The official **Essential A$19,990 promotional driveaway** campaign applies to retail orders from 15 September through 15 December 2026, delivered by 31 December 2026. Optional/metallic paint costs extra. Demonstrators and transactions with additional discounts are excluded. Allocation is subject to availability, eligibility is not guaranteed until delivery, and BYD does not guarantee delivery before the cutoff. Any extension is discretionary.

A separate 6% novated-lease offer covers both trims: order 1 October–21 December 2026 and deliver by 31 January 2027, through an approved FMO. It applies to the base list price rather than on-road costs, has customer exclusions and cannot be assumed stackable with the Essential campaign. It is not a universal cash price.

The current configuration HTML has an uninitialized A$0 driveaway placeholder and a stale “Est. Delivery Feb. / Mar. 2025” template. Neither is treated as usable data. The form takes order requests subject to allocation and advertises a fully refundable A$1,000 order fee. No order was attempted.

## Live new-stock evidence

A fresh EVDealer Group new-inventory download at 05:29 UTC contained 99 distinct ATTO 1 Premium stock cards marked Available Now and zero Essential cards. This is a retailer-network snapshot, not proof of nationwide Essential stockout. Three exact Premium configuration links were fetched successfully at 05:30 UTC; they display In-Stock and New:

- [BYD Alexandria stock 8047108](https://evdealergroup-byd.com.au/configurator/yumq_IJ_NC20jiX_Dh6dE9JxPZalUyvl5f9kcHfZLlp1BqgJsOeodXPa3Id_zQqVD10JqJjmTtxWo6y5zRhlEQ): 2025 Model, Apricity White, A$31,114 driveaway; Pickup from BYD Alexandria with NSW registration. Formal MY, VIN, build/compliance dates and odometer remain unverified
- [BYD Darwin stock 8060393](https://evdealergroup-byd.com.au/configurator/yumq_IJ_NC20jiX_Dh6dE9JxPZalUyvl5f9kcHfZLlp1BqgJsOeodXPa3Id_zQqVtdmYFCdruAaSi2KsZ6MyaA): 2026 Model, Arctic Blue, A$30,263 driveaway; Pickup from BYD Darwin with NT registration. Formal MY, VIN, build/compliance dates and odometer remain unverified
- [BYD Devonport stock 8076412](https://evdealergroup-byd.com.au/configurator/yumq_IJ_NC20jiX_Dh6dE9JxPZalUyvl5f9kcHfZLlp1BqgJsOeodXPa3Id_zQqV3nrzj_uWBz9j1zpmIWnhXA): 2026 Model, Cosmos Black, A$31,148 driveaway; Pickup from BYD Devonport with TAS registration. Formal MY, VIN, build/compliance dates and odometer remain unverified

Prices belong to the named stock card and state of registration. Actual possession, allocation and immediate handover were not independently confirmed. Full 99-card extraction, retrieval timestamps and exact HTML locators are retained beside the JSON.

### Rejected leads

- Booran Premium #8078406: fresh HTML title says SOLD, despite cached web extraction that looked active. Its 10 km, 2026 build/compliance and MY25 description remain historical only
- CarsGuide Essential #B8073917: live link redirects to removed=true, despite cached New In Stock text
- Parramatta Essential #10492: explicit Demo Car and UsedCondition schema, registered GEB91H. Its 1 km does not make it new stock
- Booran Essential #8059745: search result says SOLD; direct live read returned 404
- Carsales Essential OAG-AD-26091993: indexed listing explicitly On hold; not used as currently purchasable stock

## Sourced advantages and trade-offs

Essential has the lower configurator base price and the current A$19,990 retail driveaway campaign. Its compact dimensions and stated turning radius support an urban-use inference. Premium adds 90 km claimed WLTP range, 50 kW motor output, a 360-degree camera, LED headlights, heated/power-adjustable front seats and wireless phone charging. Both have 11 kW AC capability and V2L. These are within-range comparisons, not global “best” claims.

Essential has 220 km WLTP, 65 kW, halogen headlights, steel wheels and a rear-view camera, with the Premium comfort features absent. Premium costs A$4,000 more at the verified base-price level and does not gain seats or quoted cargo volume. Both seat four, have unresolved standardized cargo measurement and lack a verified numeric towing rating. All feature claims are sourced to brochure pp2–3 in the JSON.

## Primary sources

- [BYD Australia ATTO 1 product](https://bydautomotive.com.au/atto-1): exact current trims, technical modal and storage section
- [Current AU brochure](https://bydautomotive.com.au/brochures/BYD-ATTO-1-2025.pdf): live Version 122506, metadata and visually checked pp2–3
- [Australian owner handbook](https://bydautomotive.com.au/brochures/BYD-ATTO-1-Owners-Handbook-2025.pdf): pp88, 171–172
- [Official offers](https://bydautomotive.com.au/offers): Essential campaign and separate lease terms
- [Essential manufacturer order link](https://bydautomotive.com.au/configurator/byd-atto-1?ref=website&spec=2826) and [Premium order link](https://bydautomotive.com.au/configurator/byd-atto-1?ref=website&spec=2827): redirect to official retailer configuration
- [Manufacturer-linked new inventory](https://evdealergroup-byd.com.au/inventory?model=atto-1&type=n): exact stock cards and state-specific driveaway prices
- [BYD AU showcase](https://bydautomotive.com.au/byd-showcase): corroborates exact AC/DC ratings; its April event promotions are not used as current offers

The JSON includes source IDs, direct URLs, timestamps, hashes, local snapshots and field-level locators. Direct live downloads take precedence over cached snippets. Source documents were retained only as research evidence, not edited or republished.
