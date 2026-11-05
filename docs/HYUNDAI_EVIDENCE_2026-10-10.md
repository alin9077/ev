# Hyundai Australia: IONIQ 5 and IONIQ 6 evidence

Research date: 10 October 2026. AUD throughout. Read-only research, no dealer contact or ordering.

## Integration result

The current regular IONIQ 5 range has three grades: 84kWh RWD, Elite 84kWh RWD, and Premium N Line 84kWh AWD. Include IONIQ 5 N separately. The current IONIQ 6 offering is the N performance grade, with roof and non-roof configurations. Regular IONIQ 6 grades should be quarantined as legacy/unverified new availability, rather than included as current new-orderable cars.

Evidence combines the [current Australian IONIQ 5 page](https://www.hyundai.com/au/en/cars/eco/ioniq5), its newly linked [MY27 Australian specification](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/docs/MY27_Specification_Sheet_IONIQ5_Electric.pdf), the [current IONIQ 6 N page](https://www.hyundai.com/au/en/cars/eco/ioniq6n), and the live public calculator responses. The JSON file maps each fact to sources and sections; raw public API/PDF snapshots are retained alongside it.

## Exact current regular IONIQ 5 grades and pricing

| Grade | Drivetrain / power | WLTP combined range | MLP | Current drive-away offer |
|---|---|---:|---:|---:|
| IONIQ 5 84kWh | RWD / 168kW / 350Nm | 570km | $68,200 | $70,990 |
| IONIQ 5 Elite 84kWh | RWD / 168kW / 350Nm | 530km | $73,200 | $75,990 |
| IONIQ 5 Premium N Line 84kWh | AWD / 239kW / 605Nm | 495km | $83,700 | $86,990 |

Technical source: [MY27 specification, pages 1–3](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/docs/MY27_Specification_Sheet_IONIQ5_Electric.pdf). Pricing source: [Hyundai calculator](https://www.hyundai.com/au/en/shop/calculator/ioniq-5), using its [read-only current configuration endpoint](https://www.hyundai.com/content/api/au/hyundai/v3/carpricecalculator?postcode=2000&displaypowertrain=true&modelname=ioniq-5) and exact per-variant price endpoints recorded in JSON.

The drive-away figures are promotional, not list prices. They were returned for postcode 2000 with zero added option cost and a 31 December 2026 expiry. They apply to eligible stock; manufacturer dealer fine print requires order and delivery in the October–December window and excludes fleet, government, rental buyers and combining other offers. The [Northside Hyundai offer](https://northsidehyundai.com.au/offers/) supports the base-car conditions. Do not assume the research postcode is the user's location.

Manufacturer-specific strengths, suitable for catalogue copy:

- Base: longest stated range in the regular range, on 19-inch wheels; heat pump and battery conditioning included
- Elite: head-up display, Bose eight-speaker sound, heated front seats and powered tailgate; 20-inch wheels
- Premium N Line: AWD and greater output, ventilated front seats, heated rear seats and fixed glass Vision Roof; this is a comfort/styling grade, distinct from the high-performance N

Equipment source: [current manufacturer configuration](https://www.hyundai.com/content/api/au/hyundai/v3/carpricecalculator?postcode=2000&displaypowertrain=true&modelname=ioniq-5), with the current PDF feature matrix used to resolve grade-specific fitment.

## Charging, battery, cargo and towing rules

For the three regular MY27 grades, Hyundai states 84kWh capacity without explicitly labelling gross versus usable. Preserve “manufacturer-stated capacity”; both gross and usable fields remain unknown. AC maximum is 10.5kW. The DC timing is approximately 18 minutes, 10–80%, using a 350kW/800V ultra-rapid charger under suitable conditions. A 350kW charger rating is not evidence that the car accepts 350kW. The 277kW battery output row is also not a charging maximum. [Current specification, page 1 and footnote 1](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/docs/MY27_Specification_Sheet_IONIQ5_Electric.pdf)

Regular IONIQ 5 rear cargo is 520/1,580L VDA minimum/maximum. Front VDA cargo is 57L for either RWD and 24L for AWD. Keep front and rear separate. All three list 1,600kg braked, 750kg unbraked and 100kg maximum towball load. Hyundai requires an extra-cost genuine towbar/towball fitted by an authorised dealer, subject to vehicle, towbar and equipment limits. [Current specification, pages 2–3 and footnote 3](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/docs/MY27_Specification_Sheet_IONIQ5_Electric.pdf)

Range is explicitly WLTP combined. The regular IONIQ 5 consumption figures (16.04/16.99/18.11kWh/100km) have an ADR81/02-specific footnote despite nearby general WLTP wording. They must not be represented unqualified as WLTP efficiency. The MY27 sheet also omits the old dedicated V2L rows; this establishes neither removal nor verified continuing MY27 output. Current V2L details remain unresolved.

## Performance derivatives and roof configurations

### IONIQ 5 N

The [current Australian N page](https://www.hyundai.com/au/en/cars/eco/ioniq5n) still links a [2024-named Australian specification](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5n/images/Hyundai_2024_IONIQ_5N_Specifications.pdf). It gives 448kW/740Nm ordinarily, 478kW/770Nm with N Grin Boost, 84kWh reported battery, 448km WLTP combined, 10.5kW AC and approximately 18-minute DC 10–80% charging using a 350kW station. Its 0–100km/h figures are 3.5 seconds ordinarily and 3.4 seconds with boost. Rear cargo is 480/1,540L VDA; front cargo and towing are N/A. Treat detailed MY27 equipment as carryover evidence requiring confirmation, not as a newly issued MY27 specification.

The [current detailed calculator response](https://www.hyundai.com/content/api/au/hyundai/v3/carpricecalculator?postcode=2000&displaypowertrain=true&modelname=ioniq-5-n) exposes only “N with Vision Roof”, with nine paint choices. The overall model list reports two options, so exact non-roof factory-orderability is unresolved. Do not create two confidently orderable variants merely from the old roof option.

Pricing is not clean enough for an exact normalised current MLP. The roof record returns raw mlp $109,076.23 and mlpFromPIM $114,383; its option-pack metadata separately says Vision Roof $4,000. The same zero-option query returns an illustrative $123,076.51 drive-away estimate. [RedBook MY27 N](https://www.redbook.com.au/cars/details/2026-hyundai-ioniq-5-n-auto-awd-my27/SPOT-ITM-694970?Cr=89) instead reports $114,918. Preserve the raw official fields and conflict; do not turn pre-LCT inputs or option metadata into a false confirmed consumer price.

### IONIQ 6 N

One grade, two current calculator configurations: “N” and “N with Sunroof”. Both have six paint choices and are not flagged sold out. [Official calculator response](https://www.hyundai.com/content/api/au/hyundai/v3/carpricecalculator?postcode=2000&displaypowertrain=true&modelname=ioniq-6-n)

The [Australian specification](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq-6-n/docs/IONIQ-6N-Specification-Sheet.pdf) gives 448kW/740Nm normally, 478kW/770Nm with 10-second N Grin Boost, 84kWh reported capacity and 487km WLTP combined. It gives 3.4 seconds to 100km/h or 3.2 seconds with N Launch Control, 10.5kW AC, and 18 minutes DC 10–80% on a 350kW charger. Rear cargo is 371L VDA. Towing is N/A. Front cargo is not stated. Its 18.7kWh/100km consumption footnote cites ADR81/02.

The [current model FAQ](https://www.hyundai.com/au/en/cars/eco/ioniq6n) separately confirms range, charge timing and launch-control acceleration. The specification footer is dated 26 November 2025 and contains some apparent copied equipment text, so avoid expanding unsupported minor features. Both N model hero tiles also mislabel normal output as boosted; use the detailed output tables instead.

Both roof configurations currently return the same mlpFromPIM $114,918 and illustrative postcode-2000 drive-away estimate $123,728.71. The raw calculation mlp is $109,551 before separately computed LCT. Equality of API prices is not proof of a free roof. The widely reported [May 2026 launch MLP was $115,000](https://www.carexpert.com.au/car-news/2026-hyundai-ioniq-6-n-price-and-specs); JSON retains this as historical secondary evidence and leaves normalised current MLP unresolved.

## Exact new dealer advertisements observed

These are advertisement checks, not physical inventory confirmation. No calls, enquiries, deposits or reservations were made.

| Exact variant | Dealer / stock | VIN | Odometer | Advertised drive-away |
|---|---|---|---:|---:|
| MY27 IONIQ 5 RWD | [Frankston Hyundai, 320476710](https://www.frankstonhyundai.com.au/cars/new-grey-2026-hyundai-ioniq-5-320476710) | KMHKR81AUVU417505 | 33km | $69,990 |
| MY27 Elite RWD | [Maughan Thiem, 520117360](https://www.maughanthiem.com.au/cars/new-gold-2026-hyundai-ioniq-5-520117360) | KMHKR81AUVU418985 | 0km | $75,990 |
| MY27 Premium N Line AWD | [Ryde Hyundai, 220626641](https://www.rydehyundai.com.au/new-cars/for-sale/hyundai/ioniq-5/2026/n-line-premium/ne.v7-my27-awd/4056040/) | KMHKR81CRVU421873 | 20km | $86,000 |
| MY26 IONIQ 6 N AWD | [Werribee Hyundai, N42285](https://www.werribeehyundai.com.au/cars/new-blue-2026-hyundai-ioniq-6-n42285) | KMHM541ERTA001408 | 15km | $123,990 |

All four detail pages identify new stock and none showed sold/reserved in the retrieved material. Ryde retains September sale wording, so its deal deserves a freshness warning. Dealer prices do not replace MLP or national offer prices.

A [specific carsales dealer advertisement](https://www.carsales.com.au/cars/details/2026-hyundai-ioniq-5-n-auto-awd-my27/OAG-AD-26312468/) identifies MY27 N AWD, stock 320478364, Abyss Black, 0km, August build and September compliance. Its retrieved VIN is blank. A [Melbourne City Hyundai index](https://www.melbournecityhyundai.com.au/all-stock/list/category/Hatchbacks) advertises a matching new black MY27 N at $122,990, but an exact stock-ID link was not verified. That price is deliberately not joined to the stock record. The grey N on the opened index is a demonstrator, despite older search material describing new stock.

## Regular IONIQ 6: quarantine legacy records

The [regular model URL](https://www.hyundai.com/au/en/cars/eco/ioniq6) redirects to the EV hub. The [public current model range](https://www.hyundai.com/au/en/cars) presents IONIQ 6 N. The [legacy detailed calculator response](https://www.hyundai.com/content/api/au/hyundai/v3/carpricecalculator?postcode=2000&displaypowertrain=true&modelname=ioniq-6) is disabled at model level, has no categories, and has no paint choices on any of its eight surviving records:

- IONIQ 6 RWD 53kWh and RWD 77.4kWh
- Dynamiq RWD and AWD 77.4kWh
- Epiq RWD and AWD 77.4kWh
- Epiq with Digital Side Mirrors RWD and AWD 77.4kWh

These names are historical manufacturer records, not new-orderability proof. Some records even have zero raw price. “soldOut: false” is insufficient when the model is disabled and configurations empty. The separate 2023 calculator has no variants. Historical 2023 Techniq/Dynamiq/Epiq launch copy must not override this.

No exact unsold new regular IONIQ 6 was verified in this pass. [Westside's Epiq](https://www.westsideauto.com.au/cars/2024-Hyundai-IONIQ-6-EPIQ-AWD-77-4kWh-224575) is used and sale-pending; [Xcite's Epiq](https://xcitedemo.com.au/cars/hyundai-ioniq-6-cev1-my23-B246743750) is used despite “new arrival” wording. Generic broker and marketplace model pages are not stock. This does not prove every unused old car has disappeared nationally.

## Remaining integration cautions

- Five current grades are established, with six exact configurations exposed by the retrieved detailed calculator. Keep roof options nested, not invented powertrains
- Do not merge MY25 Dynamiq/Epiq/63kWh specifications into MY27 Elite/Premium N Line records
- Vehicle warranty is five years/unlimited km, conditionally extended to seven with qualifying Hyundai servicing; drive battery is eight years/160,000km, whichever first. Commercial-use restrictions apply. [Official current warranty disclaimers](https://www.hyundai.com/au/en/cars/eco/ioniq5)
- Unknown values are intentionally null. Priority gaps are N roof/list-price reconciliation, explicit gross/usable battery split, true vehicle DC peak and MY27 IONIQ 5 V2L specification


## Addendum: regular MY27 IONIQ 5 seating, stock match and cargo basis

Rechecked 10 October 2026. This addendum concerns only the three regular grades; N research remains unchanged. Existing source IDs are retained.

- **Base RWD — `stock_i5`, stock 320476710, VIN KMHKR81AUVU417505:** [exact dealer ad](https://www.frankstonhyundai.com.au/cars/new-grey-2026-hyundai-ioniq-5-320476710). `Key information > Seats` explicitly gives **5** (retrieved text lines 93–94). The H1 explicitly identifies **Auto 2WD MY27** (line 42), Key information identifies **NE.V7** (line 76), and `Car Summary > Drive type` explicitly says **Rear Wheel Drive** (line 109). Thus it matches the current MY27 base RWD grade, rather than older MY stock. The separate 2026 build/compliance year is not its model-year designation. Battery/output are not independently printed in the retrieved ad: **84kWh/168kW** come from the matching current manufacturer grade (`i5_spec`, PDF p1; `ioniq-5_api`, variant 0). Its 19-inch wheels also agree with that grade.
- **Elite RWD — `stock_elite`, stock 520117360, VIN KMHKR81AUVU418985:** [exact dealer ad](https://www.maughanthiem.com.au/cars/new-gold-2026-hyundai-ioniq-5-520117360). `Key information > Seats` explicitly gives **5** (lines 111–112). H1 explicitly says **Elite Auto 2WD MY27** (line 57); Key information says **Elite NE.V7** (line 94), with **Rear Wheel Drive** (lines 126–127). Dealer Comments independently identify **MY27 Elite, 84kWh, RWD and 530km WLTP** (line 142). This is the correct current grade and powertrain. The **168kW** output is manufacturer-grade evidence (`i5_spec`, PDF p1; `ioniq-5_api`, variant 1), not separately printed in the ad.
- **Premium N Line AWD — `stock_premium`, stock 220626641, VIN KMHKR81CRVU421873:** [exact dealer ad](https://www.rydehyundai.com.au/new-cars/for-sale/hyundai/ioniq-5/2026/n-line-premium/ne.v7-my27-awd/4056040/). `Key Features > Seats` explicitly gives **5** (line 267), repeated under Car Details (lines 337–339). H1 explicitly identifies **N Line Premium NE.V7 MY27 AWD** (line 224); `Vehicle Description` repeats **NE.V7 MY27 AWD** (lines 321–323); `Drive Type` is **AWD** (line 287). The dealer name order corresponds to manufacturer **Premium N Line**. A generic field misleadingly says `Model Year: 2026` (lines 317–319); preserve that conflict, but the explicit MY27/NE.V7 designation matches the current grade. Actual build year is not independently established, so this addendum corrects the earlier evidence record’s build-year field to unknown. **84kWh/239kW** are from matching manufacturer-grade evidence (`i5_spec`, PDF p1; `ioniq-5_api`, variant 2), rather than a numeric battery/output field in this exact ad.

**Seating attribution:** Five seats is explicitly supported by each exact official-dealer listing. The current manufacturer PDF and model page checked here do not explicitly print a total seating count. Do not attribute the total to the PDF merely because it describes front/rear seats and three rear top-tether anchors.

**Cargo basis — `i5_spec`:** PDF **p3**, `Dimensions > Interior > Cargo area rear - VDA (minimum / maximum)`, gives **520L / 1580L** in all three columns. It does **not** explicitly define those volumes as seats-up/seats-folded. PDF **p9**, `Storage solutions > Rear seats`, separately lists a 60:40 split-folding backrest; it does not link that equipment row to the cargo measurements. `i5_page` provides no 520/1580L figures or explicit loading definition. Therefore retain **VDA minimum/maximum**, leave seats-up/folded mapping conditional/unknown, and do not silently relabel it. Seat slide position, parcel-shelf/roof loading height are also unspecified in the checked current sources.

All three stock matches are evidence of advertised new vehicles, not a physical stock inspection or manufacturer VIN decode. Dealer data may contain errors or become stale.
