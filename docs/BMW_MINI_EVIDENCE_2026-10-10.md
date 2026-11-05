# BMW and MINI Australian NEW BEV evidence

Checked 10 October 2026. Research only; no Roadmark app changes, orders, dealer contact or computer tasks. Full machine-readable evidence: `bmw-mini-evidence.json`.

## Result and scope

19 current named configurations are documented: eight BMW powertrain grades plus one promotional equipment package, and ten MINI grade/style/edition configurations. This is not a count of 19 independent battery/drivetrain grades and is not a whole-market completeness claim.

- BMW: iX1 xDrive30 M Sport; iX2 xDrive30 M Sport; iX1 xDrive30 Sport Collection offer; i4 eDrive35 M Sport; iX xDrive45 M Sport; new-generation iX3 40 and 50 xDrive; i5 Sedan eDrive40 and M60 xDrive
- MINI Cooper: SE Favoured, JCW Electric, SE Paul Smith Edition
- MINI Aceman: SE and JCW
- MINI Countryman: E Classic/Favoured; SE ALL4 Classic/Favoured/JCW Sport
- Retained official listings, current orderability unconfirmed: i5 M60 Touring and outgoing i7 M70
- Separate announced/future rows: new i7 60 xDrive, explicitly “Coming in Q4 2026”; iX3 M60 xDrive, explicitly orderable in 2027
- Separate older scopes: 12 BMW old-code/old-generation records, including outgoing iX3 G08. Old selector presence is not evidence of current factory availability
- Separate limited-edition candidate: MINI 1965 Victory Edition electric, ten allocated to Australia; remaining NEW stock unverified

All formal model-year fields remain null. Calendar “2026” in advertisements or JSON-LD, dated PDF filenames, production applicability and public API effect dates do not establish a formal MY26. Newer brochures do not establish the build revision of a dealer VIN.

## BMW current exact scopes

| Configuration | Current AU code | Drive / power | Capacity evidence | Charging evidence | Current-range evidence |
|---|---|---|---|---|---|
| iX1 xDrive30 M Sport | 22HM | AWD, 230 kW temporary boost; 225 kW nominal | PDF 67 kWh versus web 64.8, neither capacity type labelled; gross/net unresolved | 130 kW DC; exact AC detail in JSON | 410 km ADR81/02 PDF versus 400 km WLTP FAQ; not one interchangeable figure |
| iX2 xDrive30 M Sport | 82GN | AWD, 230 kW temporary boost; 225 kW nominal | PDF 67 versus web 64.8, capacity type unresolved | 130 kW DC; 22 kW three-phase AC standard; 29/30-minute 10–80% conflict retained | 410 km WLTP exact current-code selector |
| iX1 Sport Collection | Exact code unverified | AWD dual motor, 230 kW as advertised | Not inherited from M Sport | Not inherited | Not inherited |
| i4 eDrive35 M Sport | 52HD | RWD, 210 kW / 400 Nm | 66.4 kWh net | 180 kW DC; 11 kW AC | 448 km WLTP |
| iX xDrive45 M Sport | 42CF | AWD, 300 kW / 700 Nm | PDF 94.8 kWh net versus web 94.3 unlabelled; conflict retained | 175 kW DC | 522 km ADR PDF versus 616 km WLTP technical selector; normalized range withheld |
| iX3 40, new generation NA5 | 12HR | RWD, 235 kW / 500 Nm | 82.6 kWh net | 300 kW DC; 22 kW AC; 21 minutes 10–80% | PDF expected 635 km with ADR footnote; exact current technical WLTP figure unavailable |
| iX3 50 xDrive, NA5 | 32HR | AWD, 345 kW / 645 Nm | 108.7 kWh net | 400 kW DC; 22 kW AC; 21 minutes 10–80% | 678–805 km WLTP technical range; 805 is best case, not guaranteed on each wheel/VIN |
| i5 Sedan eDrive40, July production | 62HG | RWD, 250 kW / 430 Nm | Header 84 kWh; inner named-grade pages 84 gross / 81.2 net but stale code needs confirmation | 205 kW DC; named-grade equipment says 22 kW AC, same stale-code qualifier | 550 km ADR81/02, not labelled WLTP |
| i5 Sedan M60 xDrive, July production | 42HG | AWD, 442 kW / 820 Nm | Same explicit guide scope limitation as eDrive40 | 205 kW DC; 22 kW AC with scope qualifier | 506 km ADR81/02 |

These numbers retain source-specific qualifications. Charging maximum is vehicle capability; a charging-station rating is not inferred from it. Charging times are not comparable without window, conditions and station capability.

### BMW changes and conflicts that matter

- The fresh i4 Australian guide lists only eDrive35 code 52HD. Old eDrive35 42AW, eDrive40 72AW and M50 32AW selector rows remain separate older scope, not additional verified current grades
- i5 current brochure summary codes are 62HG/42HG and explicitly July 2026 production. Inner equipment pages still show 32FK/42FK. Current headline fields and named-grade fields are preserved separately; old-code web dimensions/range are not copied into new-code records
- New i7 brochure headline code 72HY differs from stale inner code 52EJ. The guide's 235 kW DC conflicts with 250 kW on the current technical page. Capacity claims include 111.5 kWh net on exact FAQ, 118 gross/112 net inside the guide, and 112.5 in a broad FAQ. New i7 remains announced because “Coming in Q4” does not itself prove deliveries on 10 October
- i7 theatre screen is shown as standard in the guide but called optional elsewhere; retained as a source conflict. A paint availability note beginning November 2026 is not treated as currently available
- i5 Touring's official M60 technical page remains, but the current brochure module comments out the Touring tile and its PDF returns 404. No fresh exact NEW VIN was recovered. This is unresolved, not a claim of discontinuation
- i4 seating is inconsistent: current schema says four, while a same-code dealer template says five. The normalized seat count is null. Its AC 0–100% table also prints an implausible “30” under hours; not silently corrected
- iX technical consumption prints 200 kWh/100 km, while the guide says 200 Wh/km. Raw claims remain; no implausible value is promoted
- iX3 50 technical AC duration is inconsistent with its stated 22 kW maximum. Duration remains unresolved. V2L is not asserted as a current Australian VIN feature without exact local activation/accessory scope
- EC unladen masses include a 75 kg driver. They are retained under `unladen_ec_weight_kg`; Australian kerb/tare stays null. Cargo state/method and width with/without mirrors remain explicit

### Useful exact BMW equipment

- iX1/iX2 named M Sport scope: 19-inch wheels, heated electric front seats, Driving Assistant Professional, Parking Assistant Plus, adaptive M suspension; iX2 has explicit 22 kW AC equipment
- i4 52HD: 18-inch wheels and standard glass sunroof are in the current guide
- iX 42CF: 21-inch wheels, electrochromatic panoramic roof, four-zone climate, front massage, heated steering wheel, Driving Assistant Professional, Parking Assistant Professional and Harman Kardon 18-speaker/655 W audio
- iX3 40/50 current guide: 20-inch wheels, panoramic roof, heated front seats/steering wheel, 17.9-inch display, Panoramic Vision, 3D head-up display, Driving Assistant Plus, Parking Assistant Plus and Harman Kardon 13-speaker/365 W. The guide's explicit “additional to 40” relationship is used only within that exact Australian document
- i5 July guide: Bowers & Wilkins 17-speaker/655 W. M60 adds ventilated front seats, four-zone climate and active chassis equipment in its named-grade scope, with the stale inner-code warning retained

### BMW pricing and verified NEW advertisements

Current numerical primary BMW MRLP was not recoverable from the audited brochures/client-rendered configurators; it remains null. The following are exact advertised drive-away prices with zero km and condition New, not base list prices or a guarantee of physical availability.

| Configuration | Dealer / VIN suffix | Advertised AUD drive-away |
|---|---|---:|
| iX1 22HM | North Shore / 5779888 | 90,814 |
| iX2 82GN | North Shore / 5781119 | 92,668 |
| i4 52HD | Canberra / FX08944 | 104,034 |
| i4 52HD | Hornsby / FX26044 | 103,990 |
| iX 42CF | Parramatta / CY37329 | 160,344 |
| i5 eDrive40 62HG | Melbourne / CY87239 | 179,900 |
| iX3 50 32HR | Geelong / DA28380 | 136,900 |

The separate iX1 Sport Collection manufacturer offer is from AUD 79,900 recommended drive-away in Alpine White without enhancement pack/extras, for delivery by 31 March 2027, participating dealers and available stock/production slots. Fleet, government and rental buyers are excluded, and other offers cannot be combined. The live terms supersede older cached 30 September dates. Do not substitute this promotional package price for regular M Sport MRLP.

Fresh exact NEW units for iX3 40, current i5 M60, Touring and i7 were not verified. Redirect loops and search-only candidates are retained as insufficient evidence. Absence of a verified ad does not establish unavailability.

### BMW warranty

The current Australian service portal links supplementary terms stating five years/unlimited km for private vehicle use; hire/reward, self-drive hire and driving instruction have a 200,000 km limit. BEV high-voltage battery warranty is eight years/160,000 km. Those captured BMW terms address excessive capacity loss without a numerical capacity threshold, so no percentage is invented. Warranty begins at first delivery or registration, whichever occurs earlier. Eight-year roadside coverage is distinct. No advertised unit's warranty commencement was confirmed.

## MINI evidence

### Catalogue: 10 current configurations
Cooper: SE Favoured, JCW Electric, SE Paul Smith Edition. Aceman: SE, JCW. Countryman: E Classic/Favoured and SE ALL4 Classic/Favoured/JCW Sport.
Formal MY remains unknown. Cooper and Aceman PDFs cover September 2026 production; Countryman and Paul Smith PDFs cover July 2026 production. The public range/pricing data have 8 October 2026 effect/order dates. These are not formal model years.

### Pricing and fresh NEW advertisements
- Cooper SE Favoured: manufacturer-derived list AUD 58990; fresh NEW ad AUD 67,990 drive-away
- Cooper JCW Electric: manufacturer-derived list AUD 63990; fresh NEW ad not verified
- Cooper SE Paul Smith Edition: manufacturer-derived list AUD unresolved; fresh NEW ad not verified
- Aceman SE: manufacturer-derived list AUD 60990; fresh NEW ad AUD 66,967 drive-away
- Aceman JCW: manufacturer-derived list AUD 65990; fresh NEW ad AUD 74,990 drive-away
- Countryman E Classic: manufacturer-derived list AUD 68990; fresh NEW ad not verified
- Countryman E Favoured: manufacturer-derived list AUD 71990; fresh NEW ad AUD 81,990 drive-away
- Countryman SE ALL4 Classic: manufacturer-derived list AUD 73990; fresh NEW ad not verified
- Countryman SE ALL4 Favoured: manufacturer-derived list AUD 76990; fresh NEW ad AUD 83,287 drive-away
- Countryman SE ALL4 JCW Sport: manufacturer-derived list AUD 79990; fresh NEW ad AUD 89,990 drive-away

Manufacturer price is grossPrice less the separately itemised AUD 2,500 dealer delivery, rounded to dollars. It excludes unprovided state/on-road charges. Exact displayed grossPrice and arithmetic are retained. Advertisements are VIN-specific and label New; physical availability and current-brochure build match remain unverified.

### Important corrections / conflicts
- Cooper p4: 54.2 kWh gross / 49.8 net; equipment page rounds net to 50. Live technical data says 49.2. Normalized usable battery withheld
- Cooper SE Favoured currently prints Harman/Kardon 12 speakers / 365 W; electric JCW and Paul Smith print 10 speakers / 315 W. Kept grade-specific rather than assumed identical
- Paul Smith dedicated brochure p4 prints 54.2 gross / 48.2 net. This is retained as printed, not silently changed to standard SE values
- Aceman: 54.2 gross / 49.2 net; SE 406 km WLTP maximum, JCW 355 km; 95 kW DC; 31 minutes 10–80%; 11 kW AC
- Countryman current brochure: 66 kWh net on every grade page, but current web technical data retains 64.8. Gross capacity not separately established
- Countryman E brochure says 95 kW maximum DC, while live technical data and charging page say 130. Normalized maximum withheld. SE ALL4 is consistently 130
- Countryman E maximum WLTP is 501 km; SE ALL4 467 km. Do not carry older 462/432 km or NEDC 422/396 values into current rows
- All current Countryman grades have 22 kW three-phase AC in Australian equipment pages; web standard/optional and brochure one/three-phase wording conflicts, so single-phase intake is unresolved
- Manufacturer technical masses are EC unladen including 75 kg driver: Cooper SE 1680, JCW 1725; Aceman SE 1785, JCW 1820; Countryman E 1940, SE 2075 kg. They are not directly Australian kerb/tare
- Battery warranty J01/J05/U25 is 8 years / 160,000 km. Explicit 70% capacity floor applies to vehicles first registered from 1 April 2026. Vehicle warranty is 5 years unlimited km privately; hire/reward/rental/instruction limited to 200,000 km
- Roadside booklet gives BEV 8 years unlimited km, while model brochures say 5 years; conflict retained
- 1965 Victory Edition electric allocation of 10 Australia identified from authorised dealer. Remaining NEW stock/orderability unverified and kept out of normal catalogue count

### Evidence and audit
Raw Australian PDFs, live HTML, public model/pricing JSON, extracted text and hashes are in mini-electric-sources and indexed in the JSON. Current Countryman specification and battery-warranty table were rendered and visually checked. Every populated comparison field carries source IDs, URL, date and locator.

### Source links
- cooper_current_pdf: https://www.mini.com.au/content/dam/MINI/marketAU/mini_com_au/en_AU/home/range/J01/2026_eBrochure_MINI_Next_Gen-MINI-Cooper-Electric_AU.pdf.asset.1786437981867.pdf
- aceman_current_pdf: https://www.mini.com.au/content/dam/MINI/marketAU/mini_com_au/en_AU/home/range/J05/2026_eBrochure_MINI_Aceman-AU.pdf.asset.1786438717032.pdf
- countryman_current_pdf: https://www.mini.com.au/content/dam/MINI/marketAU/mini_com_au/en_AU/home/range/U25BEV/2026_eBrochure_MINI_Next_Gen-Countryman_BEV-AU.pdf.asset.1786439843339.pdf
- paulsmith_pdf: https://www.mini.com.au/content/dam/MINI/marketAU/mini_com_au/en_AU/home/PDF/2026_eBrochure_MINIxPaulSmith_AU.pdf.asset.1787287779022.pdf
- warranty_pdf: https://www.mini.com.au/content/dam/MINI/marketAU/mini_com_au/en_AU/home/PDF/new/MINI_Warranty_and_Roadside_Brochure_2026.pdf.asset.1782200813638.pdf
- countryman_models: https://www.mini.com.au/content/MINI/marketAU/mini_com_au/en_AU/home/range/all-electric-mini-countryman/jcr:content/root/container/fsm_mix_and_match_co.fsmmodel.json
- victory_dealer_page: https://essendonmini.com.au/victory-edition
- Countryman SE ALL4 Favoured 83287: https://coastlineminigarage.com.au/stock/details/OAG-AD-WMW12HP0207W65408/2026-mini-countryman-se-all4-new
- Countryman SE ALL4 JCW Sport 89990: https://brightonminigarage.com.au/stock/details/OAG-AD-WMW12HP0207W66445/2026-mini-countryman-se-all4-new
- Cooper SE Favoured 67990: https://brightonminigarage.com.au/stock/details/OAG-AD-WMW22GC070TB81488/2026-mini-cooper-se-3dr-new
- Aceman JCW 74990: https://brightonminigarage.com.au/stock/details/OAG-AD-WMW22HF030TB93509/2026-mini-jcw-aceman-new
- Countryman E Favoured 81990: https://brightonminigarage.com.au/stock/details/OAG-AD-WMW82GA0107W54773/2026-mini-countryman-e-new
- Aceman SE 66967: https://coastlineminigarage.com.au/stock/details/OAG-AD-WMW82GC000TB75560/2026-mini-aceman-se-new

## Comparison and integration guardrails

Safe use is field-by-field: independently sourced dimensions, power, compatible acceleration figures or clearly matched charging capability can support a shortlist even when another field conflicts. Do not let an unresolved capacity erase sound dimensions. Conversely, do not rank whole records or claim market leadership.

- Compare range only within a compatible test cycle and wheel scope. Best-case model maximum is not an exact-stock range
- Compare battery net with net and gross with gross. Do not convert unlabelled capacity or resolve manufacturer conflicts by plausibility
- Compare charge windows/conditions, not peak kW alone. Vehicle intake and test-station output are different fields
- Compare EC mass with EC mass; keep Australian kerb/tare null unless directly supported
- Preserve rear-seat position and cargo measurement method. An unlabelled litre figure cannot settle a like-for-like cargo ranking
- Keep official base/list derivations, promotional drive-away and particular dealer optioned drive-away advertisements separate
- Factory order acceptance, physical unsold stock, manufacturer-to-VIN equivalence and exact warranty commencement remain unverified

## Audit and source access

The JSON has 134 source entries, including 12 explicit failed retrievals. All 122 available raw snapshot SHA-256 hashes and 45 supplied text-snapshot hashes were recomputed successfully. All referenced source IDs resolve, all record IDs are unique, and every formal model-year field is null. The combined bundle contains 27 live, exact, zero-km NEW advertisements: seven BMW and twenty MINI, covering six current BMW powertrain grades and six MINI configurations. One additional MINI New-labelled advertisement with 1,556 km remains separately flagged.

Canonical observation date is 10 October 2026. Exact UTC retrieval instants are not certified because the execution-host and session clocks disagreed; raw clock metadata is labelled unverified. This does not affect the checked date or captured-content hashes.

BMW primary source entry points:
- [Official current brochure module](https://modules.bmw.com.au/download-brochure)
- [iX1 guide](https://media.adtorqueedge.com/new-cars/bmw-aus/brochures/BMW%20iX1.pdf)
- [iX2 guide](https://media.adtorqueedge.com/new-cars/bmw-aus/brochures/BMW%20iX2.pdf)
- [i4 guide](https://media.adtorqueedge.com/new-cars/bmw-aus/brochures/BMW%20i4.pdf)
- [iX guide](https://media.adtorqueedge.com/new-cars/bmw-aus/brochures/BMW%20iX.pdf)
- [iX3 guide](https://media.adtorqueedge.com/new-cars/bmw-aus/brochures/BMW%20iX3.pdf)
- [5 Series Sedan guide](https://media.adtorqueedge.com/new-cars/bmw-aus/brochures/BMW%205%20Series%20Sedan.pdf)
- [i7 guide](https://media.adtorqueedge.com/new-cars/bmw-aus/brochures/BMW%20i7.pdf)
- [iX1 Sport Collection current offer terms](https://www.bmw.com.au/en/offers-and-services/promotions/sport-collection.html)

Every source's checked date, URL, locator, raw excerpt or observed-claim set and available snapshot hash are retained in the JSON. Exact dealer URLs are in its dealer-evidence section. This report should be read with the field-level qualifiers, not as a clean specification sheet that resolves the underlying manufacturer conflicts.
