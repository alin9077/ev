# Kia EV6 / EV9 Australian exact-trim evidence

Observed 2026-10-10. Research-only; no dealer contact, physical inspection, reservation or order. The snapshot is complete within the limits and unresolved conflicts listed below.

## Catalogue decision

- Kia’s current EV6 product page and brochure say MY27: Air RWD, GT-Line RWD, GT-Line AWD and GT AWD. Three marketing grades produce four drivetrain configurations. All have the manufacturer’s 84kWh energy figure; gross versus usable is not specified.
- Kia’s current EV9 page and downloadable brochure say MY26: Air RWD, Earth AWD, GT-Line AWD and GT AWD. GT has six seats and second-row captain chairs; the others have seven seats.
- Secondary catalogues already list EV9 MY27 and higher MY27 prices. Current official pricing endpoints omit model year. These are unresolved version/price differences, not permission to silently promote MY26 specs or older prices to MY27.

## Critical provenance flags

1. EV9 brochure date conflict: its PDF metadata is created 15 May 2026, but its footer says “As of 12 February 2027”. The research date is earlier. Current official-page corroboration is retained; uncorroborated brochure-only facts are explicitly conditional and unranked in JSON.
2. EV6 MY27 brochure metadata is 22 September 2026. Its footer describes inspections pending availability, so manufacturer-published claims remain subject to Kia’s inspection/change disclaimer.
3. The EV9 GT cargo rows labelled seven seats up and five seats up cannot be relabelled for a six-seat car without evidence. Its separate two-seats-up maximum is published; all-seats-up and intermediate GT volumes remain null.
4. EV9 Earth’s current brochure prints kerb 2,552kg and tare 2,619kg; the older MY26 brochure prints tare 2,552kg. Current and older MY26 acceleration claims also conflict, 5.3s versus 6.0s. Normalized Earth acceleration, tare and kerb fields are null with both printed claims preserved. Other payloads are not calculated from tare.
5. Taree Kia hosts a byte-identical current brochure with HTTP last-modified 25 August 2026, establishing pre-research-date hosting but not independent authorship or a corrected footer. A distinct older MY26 manufacturer brochure corroborates most Air/Earth/GT-Line numbers. GT-specific uncorroborated figures retain conditional/unranked status.

## Published specifications

All figures below come from the Australian PDFs. EV9 otherwise-uncorroborated brochure-only fields are conditional under the date conflict; JSON identifies current official-page or separate older manufacturer-document corroboration field by field. Combined WLTP ranges are manufacturer laboratory figures, not real-world predictions.

| Family / published MY | Exact configuration | Published battery energy kWh | WLTP combined km | Published system kW / Nm | Seats | Wheels |
|---|---|---:|---:|---:|---:|---:|
| EV6 MY27 | Air RWD | 84 | 582 | 168 / 350 | 5 | 19 in |
| EV6 MY27 | GT-Line RWD | 84 | 560 | 168 / 350 | 5 | 20 in |
| EV6 MY27 | GT-Line AWD | 84 | 522 | 239 / 605 | 5 | 20 in |
| EV6 MY27 | GT AWD | 84 | 450 | 478 / 770 | 5 | 21 in |
| EV9 MY26 | Air RWD | 76.1 | 443 | 160 / 350 | 7 | 19 in |
| EV9 MY26 | Earth AWD | 99.8 | 512 | 282.6 / 700 | 7 | 19 in |
| EV9 MY26 | GT-Line AWD | 99.8 | 505 | 282.6 / 700 | 7 | 21 in |
| EV9 MY26 | GT AWD | 99.8 | 510 | 374 / 740 | 6 | 21 in |

Sources: [EV6 MY27 brochure](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev6/kia-ev6-brochure.pdf), [EV6 current product page](https://www.kia.com/au/cars/ev6/features.html), [EV9 MY26 brochure](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev9/kia-ev9-brochure.pdf), [EV9 current product page](https://www.kia.com/au/cars/ev9/features.html). PDF page two covers drivetrain, battery, charging, range, cargo and towing; page three wheels; page four seats.

## Charging, cargo and towing

- EV6: published 10–80% DC time is approximately 18 minutes on a 350kW charger, or 81 minutes on a 50kW charger. OBC is 10.5kW; 10–100% AC is approximately 7h35 on an 11kW three-phase/16A station. Vehicle peak DC acceptance is not stated and remains null.
- EV9: Air’s 10–80% is approximately 20 minutes on a 350kW charger or 63 minutes on a 50kW station; other grades are 24/83 minutes respectively. OBC is 7kW single-phase or 10.5kW three-phase. The AC timing row names an 11kW station but also prints 230V/48A; do not interpret this annotation as an 11kW single-phase vehicle limit. The separate older MY26 brochure corroborates the non-GT times. GT still has only the current GT-era document and remains conditional under the date anomaly.
- All charging times have explicit windows and station ratings in JSON. Kia says battery/ambient temperature and charging conditions affect results. Supported 400V/800V infrastructure is distinct from the battery voltage. Battery usable capacity and vehicle peak DC charging remain unknown.
- EV6 rear cargo is 490L Air or 480L other grades, explicitly VDA minimum only. The current sheet does not identify a seats-up loading method or maximum folded volume. Frunk is 52L RWD / 20L AWD; frunk measurement standard and weight limit are not supplied.
- EV9 seven-seat configurations publish 333L with seven seats up, 828L with five up, 2,318L with two up, VDA. GT publishes 2,393L with two seats up; its other cargo figures remain unresolved. Frunk is 90L/40kg Air, 52L/20kg AWD. The front compartment is not explicitly labelled VDA.
- EV6 published tow limits are 1,800kg braked, 750kg unbraked, 100kg ball. EV9 Air is 900/450/45kg; AWD variants 2,500/750/125kg. Kia qualifies towing by state regulations and towbar design. Gross combination mass and payload at maximum towing remain unknown. The separate older MY26 brochure corroborates braked/unbraked limits for non-GT grades; towball limits and GT-specific applicability remain conditional where only the conflicted brochure supplies them.

## Price evidence: do not merge categories

Exact-MY formal MLP is null until reconciled. The official configurator’s observed RRP component and NSW 2000 drive-away estimate are retained separately. There is no separately verified current national EV6/EV9 promotion; the API’s offerPrice equals its ordinary price and does not prove a discount.

| Configuration | Official unlabelled-MY RRP AUD | Official NSW estimate AUD | Secondary MY27 guide AUD |
|---|---:|---:|---:|
| EV6 Air RWD | 72,660.00 | 78,203.25 | 72,865.00 |
| EV6 GT-Line RWD | 79,660.00 | 85,553.25 | 79,865.00 |
| EV6 GT-Line AWD | 87,660.00 | 93,953.25 | 87,865.00 |
| EV6 GT AWD | 99,660.00 | 109,765.62 | 99,865.00 |
| EV9 Air RWD | 97,000.00 | 106,230.27 | 97,155.00 |
| EV9 Earth AWD | 106,500.00 | 119,197.77 | 106,655.00 |
| EV9 GT-Line AWD | 121,000.00 | 138,990.27 | 121,410.00 |
| EV9 GT AWD | 129,250.00 | 150,251.52 | 129,600.00 |

[EV6 Build & Price](https://www.kia.com/au/shopping-tools/build-and-price.trim.ev6.html) and [EV9 Build & Price](https://www.kia.com/au/shopping-tools/build-and-price.trim.ev9.html) were retrieved with NSW / 2000 context. Each exact trim has a saved official JSON response and locator in the evidence file. The estimate includes RRP, LCT, registration, CTP estimate, stamp duty and estimated delivery; actual dealer prices vary and options are excluded. This is not a dealer quotation.

Conflicting secondary guides: [EV6 MY27 range](https://www.redbook.com.au/cars/results/?q=%28C.Make.Kia._.Model.EV6.%29), [EV9 MY27 range](https://www.driveawaydeals.com.au/findacar/VehicleSearch.aspx?lstVehicles=1&sFamilyCode=%27EV9%27&sFuelTypeDesc=%27Electric%27&sMakeCode=%27KIA%27). Secondary order-template listings do not prove stock or factory-order acceptance.

## Grade and option handling

- EV6 Air’s configurator code AIR-SR and internal name Air SR are retained as identifiers only. They do not prove an additional short-range Australian model; the official current Air specification is 84kWh.
- GT and GT-Line remain separate. GT-Line RWD and AWD are separate EV6 configurations. EV9 GT’s six-seat captain-chair layout is grade equipment, not a six-seat GT-Line option.
- Colour selectors were checked for all configurations. EV6 Runway Red is shown at no addition, other offered paints at $750. EV9 Flare Red is shown at no addition, other offered paints at $1,040. These are displayed colour additions, not all-in on-road price increases, and pages have no MY label.
- EV6 Air has no standard sunroof; other EV6 grades have it standard. EV9 GT-Line and GT have dual sunroofs standard. Do not create extra roof-option trims.
- EV9 GT colour page says Ocean Blue with a legacy-looking internal code; the current PDF calls it Ocean Blue Gloss. No separate matte-paint grade is created from that mismatch.

## Warranty depends on model year

The [official warranty terms, updated 20 August 2026](https://www.kia.com/content/dam/kwcms/au/en/files/service/Kia-Warranty-terms-and-conditions.pdf) provide base vehicle coverage of seven years/unlimited kilometres for eligible non-commercial use; commercial-use and high-voltage-system limits differ. HV components including the motor and OBC are seven years/150,000km. Battery-capacity cover at a 70% threshold is seven years/150,000km before MY27, and eight years/160,000km for MY27 and later. Old unsold MY26 stock does not gain MY27 battery coverage merely through a later sale date. See terms for commencement, exclusions and commercial-use limits.

## Exact dealer advertisements

Seven current exact dealer NEW advertisements cover six configurations. These are verified advertisements, not physically confirmed inventory. Prices are dealer-specific drive-away advertisements and are not MLP. Listing publication dates are absent; the observation date is 10 October 2026.

| Exact advertised trim | Dealer / stock | Advertised DA AUD | Odometer | Important qualification |
|---|---|---:|---:|---|
| EV6 Air RWD MY27 | [Gibbons Automotive / Gibbons Kia / K260257](https://www.gibbonsautos.com.au/cars/new-2026-kia-ev6-k260257) | 80,999 | 0 km | New ad; availability unconfirmed |
| EV6 GT-Line RWD MY27 | [Melville Kia / K260287](https://www.melvillekia.com.au/new-cars/for-sale/kia/ev6/2026/gt-line/cv-pe-my27/4108502/) | 88,462 | Not stated | New ad; availability unconfirmed |
| EV9 Air RWD MY26 | [Mornington Kia / K084845](https://www.morningtonkia.com.au/cars/new-snow-white-pearl-2026-kia-ev9-k084845) | 95,990 | 8 km | Novated-lease customers only according to dealer comments |
| EV9 Earth AWD MY26 | [Keystar Kia Rothwell / KI6084887](https://www.kia.keystar.com.au/cars/new-black-2026-kia-ev9-ki6084887) | 120,191 | 13 km | New ad; availability unconfirmed |
| EV9 Earth AWD MY26 | [Melville Kia / K084885](https://www.melvillekia.com.au/new-cars/for-sale/kia/ev9/2026/earth/mv-my26-awd/4040159/) | 123,829 | Not stated | New ad; availability unconfirmed |
| EV9 GT-Line AWD MY26 | [Melville Kia / K084800](https://www.melvillekia.com.au/new-cars/for-sale/kia/ev9/2026/gt-line/mv-my26-awd/4047041/) | 143,904 | Not stated | New ad; availability unconfirmed |
| EV9 GT AWD MY26 | [Melville Kia / K084796](https://www.melvillekia.com.au/new-cars/for-sale/kia/ev9/2026/gt/mv-my26-awd/4062094/) | 154,656 | Not stated | New ad; availability unconfirmed |

- EV6 GT-Line AWD MY27 and GT AWD MY27: no qualifying exact new-stock advertisement was found in the bounded check. They remain current official catalogue configurations, without stock confirmation. Apparent dealer candidates were demos, sold or generic order templates.
- Mornington EV9 Air: $95,990 is expressly for novated-lease customers. The dealer additionally advertises $2,000 cashback; it is not subtracted, and eligibility/stacking/finance terms were not established.
- Current EV6 Air MY27 uses stock K260257 / VIN KNAC381AUT5260257. Current GT-Line RWD MY27 uses K260287 / KNAC481AUT5260287. The MY designation is explicit; calendar/build year is separate.
- All VINs, build/compliance fields, condition and price qualifications are preserved in JSON. Structured first-of-month dates may represent month data; internal record-created/updated timestamps are not asserted to be first publication.

Older-model-year NEW ads retained separately:

- [Valley Kia: EV6 Air RWD MY26](https://www.valleykia.com.au/cars/new-interstellar-grey-2026-kia-ev6-ki4375), stock KI4375, $79,393 DA, 0 km. No MY27 spec or battery-warranty carryover
- [von Bibra Kia: EV6 GT-Line RWD MY26](https://www.vonbibrakia.com.au/stock/details/OAG-AD-25978719/2026-kia-ev6-new), stock KN259182, $82,600 DA, 9 km. No MY27 spec or battery-warranty carryover

The Valley Air advertisement has conflicting aggregator titles calling the same VIN GT-Line; its direct dealer title/description identify Air, so it is not GT-Line evidence. The von Bibra MY26 RWD GT-Line ad is separate from the current MY27 RWD grade. Fourteen demo/sold/redirected/order-template candidates are retained in the rejection appendix.

Additional primary-source corroboration: [older Kia-authored MY26 brochure hosted by Brian Hilton Kia](https://resource.digitaldealer.com.au/pdf/8188801186877485f5628f775645458.pdf), [same current GT-era brochure hosted by Taree Kia](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1787674910-kia-ev9-brochure.pdf). The latter does not resolve the future footer or create a second independently authored spec.

## Deliverable and verification

- Machine-readable evidence: kia-ev6-ev9-evidence.json
- Source snapshots: kia-ev6-ev9-sources; original PDFs, layout-preserving extracted text, rendered key specification pages, exact pricing responses and colour pages
- Every stored numeric specification has source IDs and section/page locators. Nulls mean unproven, not zero or unavailable
- Exact-ad and corroboration appendices merged; numerical claims and source references validated. Unresolved facts remain null or explicitly conditional/unranked

Final provenance audit: all nine raw dealer HTML snapshots returned HTTP 200 at the exact advertised URL; hashes and 109 field entries were checked, including 101 exact-text offset anchors. Full field locators and structured JSON pointers are embedded in the main JSON. Stock status remains advertisement-level only.
