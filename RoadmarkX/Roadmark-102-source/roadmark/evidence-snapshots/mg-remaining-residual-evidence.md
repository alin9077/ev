# MG residual-new-stock evidence

Audit date: 10 October 2026. Original current-range evidence is unchanged.

## Result

- Portside G10095 is exact NEW Essence62 MY25 stock, but its 125/150 kW technical epoch is unresolved. No clean epoch-proven residual NEW unit is established by this sample.
- Two additional outgoing Excite units are explicitly New/InStock but registered; eligibility is conditional.
- Cyberster AWD MG079184 is directly New/In stock, with a same-VIN MY24.5 versus MY25 conflict.
- Hobart has a direct MY26 Excite49 NEW listing; manufacturer epoch link remains unresolved.
- No accepted ZS EV NEW unit in this bounded sample. This does not establish nationwide absence.

## Exact stock decisions

| Unit | Model / trim | Decision | Source |
|---|---|---|---|
| G10095 / LSJWS4090SZ707607 | MGS5 EV Essence 62 | confirmed_new_stock_epoch_unresolved | [Unit page](https://www.portsidemotors.com.au/new-cars/for-sale/mg/mgs5-ev/2025/essence-62/zs3em-my25/3752489) |
| 4106082 / LSJWS4093SZ671864 | MGS5 EV Excite 49 | conditional_advertised_new_registered | [Unit page](https://www.westpointautos.com.au/cars/new-silver-2025-mg-mgs5-ev-4106082) |
| 4106079 / LSJWS4093SZ699566 | MGS5 EV Excite 62 | conditional_advertised_new_registered | [Unit page](https://www.westpointautos.com.au/cars/new-black-2025-mg-mgs5-ev-4106079) |
| MG079184 / LSJWN5069SN079184 | Cyberster AWD | confirmed_new_stock_MY_conflict | [Unit page](https://adelaidecitymg.com.au/mg079184-1703290-mg-cyberster-2025/) |
| 2604150358 / LSJWS4092TZ586614 | MGS5 EV Excite 49 | confirmed_new_stock_epoch_unresolved | [Unit page](https://hobartmg.com.au/2604150358-1874460-mg-mgs5ev-2026/) |
| MG698624 / LSJWS4098SZ698624 | MGS5 EV Essence 49 | confirmed_new_stock_residual_epoch_unresolved | [Unit page](https://www.macarthurautomotive.com.au/cars/new-dover-white-2026-mg-mgs5-ev-mg698624) |
| 19883 / LSJWS409XSZ699872 | MGS5 EV Excite 49 | rejected_not_new | [Unit page](https://www.kenmuston.com.au/new-cars/for-sale/mg/mgs5-ev/2025/excite-49/zs3em-my25/3825822/) |
| 1300155 / LSJWS4099SZ652087 | MGS5 EV Excite 62 | rejected_conflicting_new_demo | [Unit page](https://www.xciteautos.com.au/cars/2025-mg-mgs5-ev-excite-62-auto-my25) |
| 6482 / LSJW74090PZ174005 | ZS EV Long Range | rejected_no_new_condition_proof | [Unit page](https://www.mawmotorgroup.com.au/stock/2023-mg-zsev-wagon-longrange-azs1my23-562309) |
| B4505 / LSJW74091PZ211773 | ZS EV Long Range | rejected_used_registered | [Unit page](https://www.northernkia.com.au/vehicle-for-sale/B4505/2023-mg-zs-ev-long-range-auto-my23) |
| 540820 / LSJW74098PZ171594 | ZS EV Long Range | rejected_demo | [Unit page](https://pickeringsmg.com.au/540820-1616805-mg-zsev-2023/) |

### Decision details

- **portside-g10095**: Direct live page proves NEW Essence62 MY25 stock identity, but has no build/compliance date or vehicle power/torque field. Historical February2025 and current June2026 manufacturer documents both say MY25 while listing different power. MY/trim alone cannot distinguish 125 kW from 150 kW; normalized technical epoch is unproven.
- **westpoint-4106082**: Live unit header and schema say New/InStock, but a registration plate and August 2027 expiry are present. Accept only as advertised-new evidence; unregistered-new eligibility is not established. Do not silently classify as demo either.
- **westpoint-4106079**: Live unit header and schema say New/InStock, but a registration plate and August 2027 expiry are present. Accept only as advertised-new evidence; unregistered-new eligibility is not established. Do not silently classify as demo either.
- **adelaide-mg079184**: Direct dealer page says New/In stock. Same VIN/stock is MY24.5 on Adelaide City MG and MY25 in Newspot search snapshot. Formal MY normalized to null pending reconciliation.
- **hobart-2604150358**: Direct New/In stock unit explicitly MY26. Available MY25 four-trim brochure cannot prove MY26 Excite technical epoch; current official brochure lists only Essence. Manufacturer technical join withheld.
- **macarthur-mg698624**: Direct unit NewCondition/InStock with 2025 build/compliance but advertised 2026. Technical-description MY26 is from generic variant metadata, not accepted as formal exact MY. Build year alone cannot join MY25 residual epoch.
- **kenmuston-19883**: Live page explicitly Demo / EX-DEMO and registered, despite /new-cars URL and stale New search snippet.
- **xcite-1300155**: Headline says New | IN STOCK but exact Condition field and repeated unit details say Demo. Non-unit-stable URL previously indexed another VIN; live VIN retained.
- **maw-6482**: Used-car dealer/page positioning and comments call it essentially brand new; low kilometres and promotional brand-new wording do not establish NEW condition.
- **northern-b4505**: Search snapshot of dealer page says Condition Used and Registered, despite never-registered/brand-new prose. Direct retrieval failed, so current availability remains unknown. Technical prose wrongly claims 130 kW; excluded.
- **pickerings-540820**: Dealer search snapshot explicitly Demo. Direct page retrieval returned 403. MY23 and Feb 2023 build versus Jan 2025 compliance remain distinct.

## Manufacturer epochs

| Model / trim | Formal MY / document date | Battery / motor | WLTP | Source locator |
|---|---|---|---|---|
| MGS5 EV Excite 49 | MY25 / February 2025 | 49 kWh / 125 kW | 340 km | [Manufacturer document](https://resource.digitaldealer.com.au/pdf/203412621682d706636225150406480.pdf), PDF p14; exact rows/columns in JSON |
| MGS5 EV Excite 62 | MY25 / February 2025 | 62 kWh / 125 kW | 430 km | [Manufacturer document](https://resource.digitaldealer.com.au/pdf/203412621682d706636225150406480.pdf), PDF p14; exact rows/columns in JSON |
| MGS5 EV Essence 49 | MY25 / February 2025 | 49 kWh / 125 kW | 335 km | [Manufacturer document](https://resource.digitaldealer.com.au/pdf/203412621682d706636225150406480.pdf), PDF p14; exact rows/columns in JSON |
| MGS5 EV Essence 62 | MY25 / February 2025 | 62 kWh / 125 kW | 425 km | [Manufacturer document](https://resource.digitaldealer.com.au/pdf/203412621682d706636225150406480.pdf), PDF p14; exact rows/columns in JSON |
| ZS EV Excite | MY23 / March 2023 | 51.1 kWh / 130 kW | 320 km | [Manufacturer document](https://gaycarboys.com/wp-content/uploads/2023/06/2023-MG-ZS-EV-Range-Specifications.pdf), PDF p13; exact rows/columns in JSON |
| ZS EV Essence | MY23 / March 2023 | 51.1 kWh / 130 kW | 320 km | [Manufacturer document](https://gaycarboys.com/wp-content/uploads/2023/06/2023-MG-ZS-EV-Range-Specifications.pdf), PDF p13; exact rows/columns in JSON |
| ZS EV Long Range | MY23 / March 2023 | 72.6 kWh / 115 kW | 440 km | [Manufacturer document](https://gaycarboys.com/wp-content/uploads/2023/06/2023-MG-ZS-EV-Range-Specifications.pdf), PDF p13; exact rows/columns in JSON |
| ZS EV Excite | MY22 / September 2022 | 50.3 kWh / 130 kW | 320 km | [Manufacturer document](https://media.adtorqueedge.com/new-cars/mg-aus/zs-ev/mg-zs-ev-specs.pdf), PDF p13; exact rows/columns in JSON |
| ZS EV Essence | MY22 / September 2022 | 50.3 kWh / 130 kW | 320 km | [Manufacturer document](https://media.adtorqueedge.com/new-cars/mg-aus/zs-ev/mg-zs-ev-specs.pdf), PDF p13; exact rows/columns in JSON |
| Cyberster AWD | MY24.5 / October 2024 | 77 kWh / 375 kW | 443 km | [Manufacturer document](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1739326916-mg-cyberster-spec-sheet.pdf), PDF p10; exact rows/columns in JSON |

## Important boundaries

- MGS5 MY25 Essence62 is 125 kW / 250 Nm / 425 km WLTP. Current Essence62 is a distinct 150 kW / 350 Nm / 450 km document epoch. Do not overwrite residual units with current specifications.
- Manufacturer MGS5 MY25 brochure explicitly covers four trim columns and is dated February2025, p17. Production cutoff is not published.
- ZS MY22 document prints 50.3 kWh; MY23 prints 51.1 kWh nominal for Excite/Essence and 72.6 kWh for Long Range. This does not independently prove a physical battery change.
- ZS MY23 brochure explicitly states 11 kW three-phase onboard charging. Its 50 kW public-charge test does not establish vehicle DC peak or starting SOC.
- MY24.5 Cyberster brochure gives 40 minutes 10–80% on a 150 kW charger. Current brochure’s 34 minutes is for 30–80%; the intervals cannot be interchanged.
- MG-authored documents on dealer/press hosts were checked for Australian footer and exact MY/date. A New Zealand brochure on an Australian dealer CDN was excluded.
- Dealer generic specification/equipment sections were never used to populate technical fields.

## Unresolved leads

- [albany-rwd-015953](https://www.carsguide.com.au/car/15122555/mg/cyberster/wa/orana/convertible): Refreshed third-party page still says Dealer New In Stock but now has 50 km, registration A929K/expiry 26 Feb 2027, and no displayed VIN/stock ID. Previously indexed 015953/LSJWN5065TN015953 cannot safely be attached to the refreshed page without direct unit confirmation. Dealer model page no longer supplies exact unit. MY25/MY26 indexed conflict remains.
- [motorama-cyberster-a2507140023](https://www.motorama.com.au/cars/new-diamond-red-2025-mg-cyberster-a2507140023): Search lead says New but live fetch HTTP 404. Cannot accept current stock; 404 alone does not establish sale or nationwide absence.
- [bartons-cyberster-m022087](https://www.bartonsmg.com.au/cars/new-diamond-red-2025-mg-cyberster-m022087): Search lead says New but live fetch HTTP 404; current exact stock unverified.
- [penfold-essence49-597586](https://www.penfold.com.au/cars/new-camden-grey-2025-mg-mgs5-ev-597586): Indexed MY25 Essence49 New unit, live HTTP500; do not use old snippet as current residual-new proof.
- [newspot-excite62-33917922](https://www.newspot.com.au/all-stock/view/2025-MG-MGS5-EV/33917922): Indexed MY25 Excite62 New unit; live HTTP403 and web cache miss. Current stock unverified.

## Add versus refresh recommendation

- Priority 1: Refresh Portside G10095 NEW-stock evidence only. Hold normalized technical epoch/power as null; do not add it as proven 125 kW. Retain the February2025 125 kW manufacturer record as historical reference. Both brochures say MY25, with no unit build date/power or manufacturer breakpoint establishing the join.
- Priority 2: Add Excite49/62 residual named configurations and refresh advertised-new evidence with Hillcrest registration flags. Hold clean-unregistered eligibility.
- Priority 2: Refresh Cyberster AWD specific-NEW evidence only; retain normalized MY null for same-VIN MY24.5/MY25 conflict.
- Priority 3: Hold MY26 Excite49 technical join, MY25 Essence49 residual join, Cyberster RWD and ZS NEW eligibility. No nationwide absence claims.


## Preservation and validation

- Each technical/equipment fact in JSON carries manufacturer source, PDF page, exact row and trim column.
- Unit status and identity facts carry exact dealer locator; failed retrievals remain in the attempt log.
- Snapshots, PDF text extracts, rendered technical pages and SHA-256 manifest are in `mg-remaining-residual-sources`.
- Original evidence JSON/MD hashes are checked against the pre-audit baseline.
