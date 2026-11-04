# Australia BEV exact-trim evidence: Geely, Zeekr and XPENG

Checked 10 October 2026. Research only; no application or catalogue changes.

## Result

12 new base-grade configurations are ready for evidence-led integration, plus one separately represented factory package. Eight existing EX5/7X configurations were reviewed to avoid duplicates. The JSON contains field-level evidence, exact-unit observations, unresolved issues and a source register with local snapshots and SHA-256 hashes.

| Family | Current AU grades | Integration | Fresh NEW stock evidence |
|---|---|---|---|
| Geely EX2 | Complete; Inspire | Add two launch-epoch grades | Both grades, exact VIN/stock ads |
| Geely EX5 | Complete Extended Range; Inspire Extended Range | Refresh existing records | Complete ER live; Inspire ad sold |
| Zeekr X MY26 | RWD; AWD | Add two MY26 grades | AWD live; RWD not independently revalidated |
| Zeekr 009 | 7-seat FWD; 7-seat AWD; 6-seat AWD | Add three current 116 kWh/400 V grades | 7 FWD and 6 AWD live; 7 AWD unverified |
| Zeekr 7X | RWD; Long Range RWD; Performance AWD | Refresh existing records | LR and Performance exact MY26; base live but pack not shown |
| XPENG New G6 MY26 | RWD Standard Range; RWD Long Range; AWD Performance | Add three Gen2 grades | Performance explicitly Gen2; SR/LR exact NEW grade ads omit pack/epoch identifiers |
| XPENG X9 | FWD Standard Range; AWD Performance | Add two launch-epoch grades | Both live; explicit official orders open 21 July |

There are 14 live exact NEW dealer advertisements in the packet. That is a count of advertisements, not a count of independently inspected cars. In particular, G6 SR/LR and 7X base advertisements have a stated configuration-match caveat.

## Material findings

### Geely

The [July 2026 AU EX2 specification guide](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1784005758-geely-ex2-spec-sheet.pdf), linked from an authorised dealer, establishes:

- Complete: 35.35 kWh LFP, 60 kW/150 Nm, 252 km WLTP, 60 kW DC, 16-inch steel wheels
- Inspire: 47.14 kWh LFP, 85 kW/150 Nm, 345 km WLTP, 80 kW DC, 16-inch alloys
- Both: 6.6 kW AC, 3.3 kW V2L, rear-wheel drive, 375 L rear cargo with second row up, 70 L frunk
- Battery gross/net basis and charging time/SOC window remain unknown
- Inspire adds surround camera, power tailgate, heated front seats and steering wheel, wireless charging, rain-sensing wipers and six-speaker audio

[Geely's September release mirrored by Geely Essendon](https://www.geelyessendon.com.au/news/geely-ex2-adds-five-star-ancap-safety-rating-to-its-credentials/) gives $26,490/$30,990 RRP plus on-road costs. Its rounded 6 kW AC summary should not replace the 6.6 kW specification matrix.

The exact NEW Complete ad says MY27; the exact NEW Inspire dealer comments say MY26. Keep the July 2026 launch/specification epoch separate from those conflicting dealer model-year labels.

The [current EX5 Extended Range brochure](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) retains the existing 68.39 kWh pair. Complete ER live stock carries MY27. This is an existing-record refresh, not another configuration. Original 60.22 kWh EX5 variants must remain distinct outgoing epochs. The current brochure itself conflicts on Inspire HUD size: 13.8 inches in the marketing list, 13.4 in the equipment matrix. Complete has no HUD in that matrix.

### Zeekr

[Current MY26 X manufacturer page](https://www.zeekrlife.com/en-au/models/new-zeekr-x/) and the exact [MY26 AU brochure](https://resource.digitaldealer.com.au/pdf/149970842769e5759ccb67f704111430.pdf) support:

- RWD: 61 kWh LFP, 250 kW/373 Nm, 405 km WLTP, 11 kW AC, 230 kW DC, 19-inch wheels
- AWD: 66 kWh NMC, 365 kW/573 Nm, 415 km WLTP, 22 kW AC, 150 kW DC, 20-inch wheels
- AWD has HUD, B-pillar screen, front massage and factory fridge; automatic front doors remain optional
- Both have 404 L rear cargo and a 12 L frunk, without a verified measurement standard
- The website contains a V2L unit typo (kWh); the visually verified brochure states 3.3 kW

The [current 009 AU brochure](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1788760937-zeekr-009-brochure.pdf), linked by Zeekr Newcastle, was generated in July 2026. Visual inspection confirms all three grades still have 116 kWh batteries and 400 V architecture. FWD is 250 kW/373 Nm and 604 km WLTP; both AWD seating configurations are 450 kW/693 Nm and 582 km WLTP.

The updated brochure and [manufacturer page](https://www.zeekrlife.com/en-au/models/009/) specify 30 minutes from 10–80% using 150 kW DC. An older AU PDF used 205 kW in that row. Neither phrase establishes a standalone vehicle peak, so the JSON leaves peak charging null and records the current charger condition. The stated 574–2979 L cargo interval lacks sufficient seating/test detail to relabel as a clean standard boot-capacity pair.

The current 009 matrix also matters for equipment: FWD lacks the listed heated front/second-row seats, heated steering wheel and powered steering-column adjustment that AWD receives. Six-seat AWD adds Sofaro second-row seats, seat tables and heated leg rests.

[Current AU 7X](https://www.zeekrlife.com/en-au/models/zeekr-7x/) remains the existing 75/100 kWh, 800 V range. Do not create an Australian 900 V refresh from overseas announcements. Existing Black Special Edition already exists in the catalogue; its 20-inch package range and fresh stock were not independently established here.

The newly hosted [official warranty policy](https://zcms.zeekrlife.com/published/assets/69db768999ef6f7067b88de5729fc40de340be85193f2813f0cc4d4dcce3eac4/Australian-Warranty-Policy.pdf) confirms private-use 5 years/unlimited km, battery 8 years/160,000 km and a 70% SoH threshold. Commercial table entries are 5 years/200,000 km for the vehicle and 8 years/150,000 km for the battery, but the introductory application clause excludes commercial use. Preserve this conflict and terms rather than make an unconditional commercial-warranty promise.

### XPENG

The [official Australian New G6 configurator](https://store.xpeng.com/au/configurator/New_G6R) identifies car series 1761/F30bR and three powertrains:

| Exact grade | Code | Battery, explicitly gross | Output | WLTP and wheels | DC maximum / 10–80% |
|---|---|---|---|---|---|
| RWD Standard Range | FFCP | 68.5 kWh LFP | 185 kW/440 Nm | 480 km on 18-inch; 470 km on optional 20-inch | 382 kW / 12 min |
| RWD Long Range | FFAP | 80.8 kWh LFP | 218 kW/440 Nm | 525 km on 20-inch | 451 kW / 12 min |
| AWD Performance | FFBP | 80.8 kWh LFP | 358 kW/660 Nm | 510 km on 20-inch | 451 kW / 12 min |

Do not copy an official editorial page's reversed LR/AWD or SR-wheel ranges. The exact configurator is stronger evidence. Its $51,800/$56,800/$63,800 displayed amounts are retained as displayed MSRP fields; captured on-road treatment is unresolved, so they are not silently labelled drive-away or ex-ORC.

Black Edition is a $3,000 factory option shown with AWD Performance. Represent it as a package; the configurator does not prove a fourth powertrain. The cached exact NEW Black Edition ad could not be live-revalidated at its dealer and should not become confirmed fresh stock. The SR 20-inch option must retain its 470 km range, not inherit 480 km.

[Official X9 launch, 21 July 2026](https://www.xpeng.com/au/news/019fa2860f529f8481378a02820600b3), explicitly opens Australian orders:

- FWD Standard Range: 94.8 kWh LFP, 535 km WLTP, $89,900 excluding on-road costs
- AWD Performance: 110 kWh NCM, 580 km WLTP, 370 kW/640 Nm, $109,900 excluding on-road costs
- AWD charging: up to 542 kW, 10–80% in 12 minutes; do not transfer that peak/time to FWD
- Both: 800 V, 11 kW AC, 6 kW V2L, active rear steering, dual-chamber air suspension, seven seats
- Cargo: 721 L with all seven seats in use, maximum 2554 L; method unspecified
- Dimensions, exact wheels, towing, usable/gross battery basis and FWD acceleration/DC peak remain null

The launch's family equipment claims have final-Australian-specification caveats and are marked conditional. Two fresh exact NEW dealer ads support stock, without proving a fulfilled retail-delivery date.

[XPENG's Australian warranty manual](https://s-cdn.xpeng.com/commoncms/prod/2026-08-26/93f6d934f5694de2a438fe10b1ff747a.pdf?name=XPENG-ANZ-Warranty-and-Maintenance-Manual-Australia) supplies 7 years/unlimited km private vehicle cover, 7 years/160,000 km commercial vehicle cover, key EV components 8 years/160,000 km and 70% battery capacity. Scope is vehicles imported by XPENG Australia and registered in Australia. Do not automatically apply the new importer program to earlier cars.

## Not ready for promotion

- Zeekr 7GT: [AU page](https://www.zeekrlife.com/en-au/models/zeekr-7gt/) is interest-only and explicitly not an order
- XPENG L03: [July strategy](https://www.xpeng.com/au/news/019fa21eb07f9f8481378a02820600a9) says Q4 Australian sale; current page remains registration of interest without a verified AU grade/price/order set
- XPENG G9/P7/P7+: global navigation and generic dealer text do not establish current Australian retail grades
- Dealer ads that are sold, demo, redirected to generic stock or accessible only as cached search content are not promoted to confirmed NEW stock

## Files and provenance

`geely-zeekr-xpeng-evidence.json` is the machine-readable packet. Each fact includes source IDs and a locator; the source registry holds exact URL, observation date, original snapshot hash and text-snapshot hash where available. Raster-heavy X/009 matrices were visually checked; rendered pages are retained beside the original PDFs. Failed requests are preserved as failures, never source confirmations.
