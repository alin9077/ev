# BMW/MINI read-only integration map

Checked 10 October 2026 against `bmw-mini-evidence.json` and `roadmark-work/roadmark/data/market-inventory-2026-10-10.json`. Recommendations only; no app/data edits performed.

## Recommended safe import

Import **18 current manufacturer configuration rows across nine existing families**, with field-level holds below. Attach the nineteenth item, **iX1 Sport Collection**, as a dated promotional package/offer under iX1, not another model family or independent powertrain grade. If the UI deliberately supports package configuration rows, it may show all 19, provided the package is labelled and excluded from independent-grade counts.

- Six BMW non-i5 rows: import independently verified fields with each field's qualifiers
- Two BMW i5 Sedan rows: import current summary-table identity and headline figures; hold stale-inner-code technical/equipment claims as attributed/conditional facts
- Ten MINI rows: import as current production-revision specifications, with battery/DC holds and qualified price treatment below
- Every row: `model_year = null`; `orderStatus = listed_unconfirmed`; factory order acceptance, physical stock and manufacturer-to-VIN equivalence remain unverified
- No complete-record ranking eligibility. Individually compatible fields can be compared; a conflicting battery figure should not suppress sound dimensions

Do not import the 12 older BMW scopes, two retained/unconfirmed rows, two future rows or Victory Edition candidate into this current cohort. New i7 72HY remains “Coming in Q4 2026”; iX3 M60 is orderable in 2027. Retained i5 M60 Touring and i7 M70 are not established current-order rows.

## Exact existing family mapping

IDs are authoritative; array positions are only the observed snapshot locations. Reuse these families, mark their detailed-catalogue coverage and avoid rendering both a placeholder and a new duplicate family.

| Existing inventory ID / observed location | Proposed detailed model ID | Evidence records to attach |
|---|---|---|
| `bmw-ix1`, records[37] | `bmw_ix1_current` | `bmw-ix1-xdrive30-msport-current`; Sport Collection as offer/package only |
| `bmw-ix2`, records[38] | `bmw_ix2_current` | `bmw-ix2-xdrive30-msport-current` |
| `bmw-i4`, records[34] | `bmw_i4_current` | `bmw-i4-edrive35-msport-52hd-current`; “Gran Coupé” is body/name context, not another family |
| `bmw-ix`, records[36] | `bmw_ix_current` | `bmw-ix-xdrive45-msport-42cf-current` |
| `bmw-ix3`, records[39] | `bmw_ix3_na5` | `bmw-ix3-40-na5-current`, `bmw-ix3-50-xdrive-na5-current` |
| `bmw-i5`, records[35] | `bmw_i5_sedan_current` | `bmw-i5-edrive40-july2026`, `bmw-i5-m60-xdrive-july2026`; body = Sedan |
| `mini-cooper`, records[92] | `mini_cooper_j01` | `mini-cooper-se-favoured`, `mini-cooper-jcw-electric`, `mini-cooper-se-paul-smith-edition` |
| `mini-aceman`, records[91] | `mini_aceman_j05` | `mini-aceman-se`, `mini-aceman-jcw`; “JCW Aceman” is the existing alias |
| `mini-countryman`, records[93] | `mini_countryman_u25_bev` | all five `mini-countryman-*` current records |

Keep `family_id` equal to the exact existing hyphenated ID. Use one detailed model per row above. Preserve model code and production revision at variant level; do not put an invented MY in a model ID.

Recommended variant ID pattern: `{detailed_model_id}__{model_code}_{grade_or_style_slug}__prod_{YYYYMM}` where an explicit production revision exists; otherwise replace the final part with `__20261010`. Examples:
- `bmw_i5_sedan_current__62hg_edrive40__prod_202607`
- `bmw_ix3_na5__32hr_50_xdrive_msport__20261010`
- `mini_cooper_j01__22gc_se_favoured__prod_202609`
- `mini_cooper_j01__22gc_se_paul_smith__prod_202607`
- `mini_countryman_u25_bev__12hp_se_all4_jcw_sport__prod_202607`

Cooper SE and Paul Smith share code 22GC, and Countryman styles share a motor-model code: **model code alone is not a unique variant key**. BMW M Sport labels in these guides are the named Australian equipment scope; do not create an unverified non-M-Sport sibling. Countryman JCW Sport is an SE ALL4 equipment style, not a separate JCW electric powertrain and not the petrol John Cooper Works Countryman.

Offer ID suggestion: `bmw_ix1__xdrive30_sport_collection_offer__20261010`, linked to family `bmw-ix1`, with exact model-code relationship unverified. Preserve AUD 79,900 recommended drive-away, Alpine White/no enhancement pack, delivery by 31 March 2027 and exclusions. Do not copy the regular 22HM battery/equipment into that offer by name similarity.

Leave `bmw-i3` and `bmw-ix4` untouched; they were outside this research. Keep `unverifiedLeads[31]` ID `bmw-i7` unresolved, supplemented with announced/outgoing scope rather than promoted. Partially reconcile `bmw-additional-performance-and-body-variants`: iX3 40 is now current-catalogue verified, but Touring/i7 M70 and future iX3/iX4/i3 M60/iX5 are not thereby resolved. Do not delete that lead wholesale. A later verified Touring import would be a distinct body family linked to i5; do not merge its dimensions/cargo with the sedan.

## Production revision and unresolved model year

- Cooper SE Favoured/JCW and Aceman SE/JCW: brochure applicability from **September 2026 production**
- Countryman all five styles and Cooper Paul Smith: applicability from **July 2026 production**
- MINI API effect/order date **8 October 2026** is price/configuration metadata, not production date or MY
- BMW i5 summary applies from **July 2026 production**. June 2026 publication on other BMW guides is a publication date, not automatically a production revision
- Keep older April MINI brochures as prior-source history. No exact month-level changeover day is inferred. No current stock VIN was verified as matching the new July/September revision
- Existing BMW i4/iX/iX3 placeholder `stockEvidence[].modelYear = "2026"` is only the advertisement's headline year. Normalize to `advertisedYear = 2026`, `modelYear = null`; retain the raw original as history

## Price treatment: override the misleading research key

**Normal comparison `price_aud` / MLP should remain null for all 19.** BMW has no recovered current numerical primary MRLP. The nine populated MINI `pricing.mlp_aud` values in the research bundle are derived candidates, not sufficiently verified unconditional MRLP. Do not blindly map that historical key into normal MLP.

Store a separate `manufacturer_from_price_less_delivery_aud` or `qualified_derived_price_aud`, with raw gross, delivery, unrounded result, API model/trim code, effect date and qualification. Keep it outside ordinary base-price rankings unless the UI explicitly supports this distinct price basis. The API says `fromPrice` for `cheapestVehicle`, not MRLP. Gross includes GST, itemises AUD 2,500 dealer delivery, shows zero LCT and no discount versus gross; registration/stamp-duty figures are not supplied and current-brochure option/production equivalence is not independently established. Do not remove GST again or recalculate delivery taxation.

| MINI scope | API model / returned trim scope | Gross AUD less delivery | Rounded candidate AUD | Safe display scope |
|---|---|---:|---:|---|
| Cooper SE | 22GC / BASIC_LINE | 61,489.70 − 2,500 | 58,990 | Model-level qualified from-price; not verified literal SE Favoured match |
| Cooper JCW Electric | 12HF / BASIC_LINE | 66,490.30 − 2,500 | 63,990 | Powertrain-model qualified candidate; equipment revision unverified |
| Aceman SE | 82GC / BASIC_LINE | 63,489.50 − 2,500 | 60,990 | Model-level qualified candidate; exact current equipment match unverified |
| Aceman JCW | 22HF / BASIC_LINE | 68,490.10 − 2,500 | 65,990 | Powertrain-model qualified candidate; equipment revision unverified |
| Countryman E Classic | 82GA / S0ZM2 | 71,490.00 − 2,500 | 68,990 | Exact style-coded candidate; no unconditional MRLP assertion |
| Countryman E Favoured | 82GA / S0ZM3 | 74,490.00 − 2,500 | 71,990 | Exact style-coded candidate |
| Countryman SE ALL4 Classic | 12HP / S0ZM2 | 76,490.00 − 2,500 | 73,990 | Exact style-coded candidate |
| Countryman SE ALL4 Favoured | 12HP / S0ZM3 | 79,490.00 − 2,500 | 76,990 | Exact style-coded candidate |
| Countryman SE ALL4 JCW Sport | 12HP / S0ZM4 | 82,490.01 − 2,500 | 79,990 | Exact style-coded candidate |

Paul Smith requested trim S07L3 returned no price. Keep its normal and derived figures null; do not reuse 22GC BASIC_LINE. All nine arithmetic results are rounded to whole AUD for display; preserve original cents. Sources are the exact `mini_price_*` entries in the evidence JSON. Countryman style-coded figures are better scoped than the BASIC_LINE figures, but still belong in the qualified field. Dealer drive-away advertisements and the BMW promotional drive-away offer are separate again.

## Minimum technical holds

Preserve every null already in the JSON; the following are especially important. An attributed claim may remain visible in detail without becoming a normalized ranking field.

| Scope | Must stay null/qualified | Independently usable examples |
|---|---|---|
| iX1 22HM | Gross/net battery: unlabelled 67 vs 64.8; normalized range: 410 ADR vs 400 WLTP; AC max unresolved | Exact-code dimensions, 230 kW temporary/225 nominal, 130 kW DC, named equipment |
| iX2 82GN | Gross/net battery; DC 10–80 time 29 vs 30 minutes | 410 km WLTP current-code claim with wheel caveat; 22 kW three-phase AC, 130 kW DC, dimensions |
| iX1 Sport Collection | All unproven battery/range/charge/dimension/seat fields; exact model code | Only offer's own dual motor, 230 kW, wheels, upholstery and heated-seat claims |
| i4 52HD | Seats: 4 vs 5; AC full-charge time erroneous; gross battery unknown | 66.4 net, 448 WLTP, 180 DC/11 AC, dimensions, sunroof |
| iX 42CF | Normalize battery and range as unresolved: 94.8 net vs 94.3 unlabelled; 522 ADR vs 616 WLTP; malformed consumption | Power/acceleration, 175 DC, exact dimensions and equipment. Keep brochure 94.8 net as attributed claim only |
| iX3 40/50 NA5 | Gross battery, AC duration; 40 exact WLTP unknown; V2L activation/accessory scope unverified | Net 82.6/108.7; DC 300/400; 22 AC; 21-minute 10–80 claims; exact dimensions. 50’s 805 WLTP is best-case model maximum |
| i5 July 62HG/42HG | 84 gross/81.2 net, 22 AC and inner-page equipment only qualified: those pages still print 32FK/42FK. Hold old-code dimensions/seats/cargo/tow; normalized WLTP null | Current summary codes, 250/442 kW,430/820 Nm,6.0/3.8 s,205 DC; 550/506 ADR with explicit cycle |
| All three Cooper configs | Normalized net capacity; standard 49.8/50 vs web 49.2, Paul Smith 48.2 printed separately; don't repair by sibling inference | Exact current-brochure gross 54.2, 95 DC, 11 AC, dimensions/seat and equipment scopes |
| Aceman SE/JCW | Unknown ports/voltage/tow and consumption remain unknown | 54.2 gross/49.2 net, 95 DC, 11 AC,406/355 WLTP exact model maximum |
| All Countryman styles | Gross/net capacity normalizations:66 net brochure vs 64.8web; single-phase AC intake unresolved | 22 kW three-phase standard in current AU grade pages, dimensions, style equipment |
| Countryman E only | Normalized DC peak:95 brochure vs130 web | Current brochure range 501 WLTP, with configuration/wheel caveat |
| Countryman SE ALL4 | Battery hold still applies | 130 DC consistently; 467 WLTP model maximum |

Universal: EC unladen mass includes 75 kg driver and must not become Australian kerb/tare. Cargo method remains unspecified where the source does not give one. Do not compare ADR/NEDC to WLTP, station output to vehicle peak, or mixed charge windows. BMW numeric battery-retention threshold is unknown; MINI’s 70% term is restricted to first registrations from 1 April 2026, not proven for a specific ad. MINI roadside duration conflict remains unresolved.

If the frontend cannot preserve the i5 stale-code conditions, leave net/gross/AC/equipment comparison fields null and show the named-guide claims as explanatory evidence. Do not label those rows `exact_trim_primary_verified` without the qualification.

## Minimal equipment rows

Use factual present/standard rows with exact source locator and production scope. Do not infer that a sibling lacks an unmentioned feature. Package and wheel choices are not extra powertrain grades.

- iX1/iX2 M Sport: heated electric front seats; Driving Assistant Professional; Parking Assistant Plus. iX2 separately has explicit 22 kW AC. Sport Collection uses only its own 19-inch/M Sport/black Veganza/heated-seat offer items
- i4: glass sunroof; three-zone climate; head-up display/parking cameras. iX: electrochromatic panoramic roof; four-zone climate/front massage; Harman Kardon audio
- iX3 40/50: same verified panoramic roof, 3D HUD/Panoramic Vision, heated seats/steering wheel. Distinguish 40/50 through battery/drive/power, not invented equipment omissions
- i5 eDrive40/M60: Bowers & Wilkins common claim; M60 ventilated front seats, four-zone climate and active anti-roll claims. Keep stale-code qualification on every imported feature
- Cooper SE Favoured: power front seats/driver memory-massage, Harman Kardon, 18-inch Night Flash wheels. JCW Electric: 18-inch Mastery Spoke wheels with sport tyres, JCW steering wheel and black/red styling
- Cooper Paul Smith: Nottingham Green accents, Nightshade Blue upholstery, 18-inch Night Flash wheels. It is an edition of SE, not another motor grade
- Aceman SE/JCW:SE: 19-inch Hexagram wheels, power front seats/memory/massage and Harman Kardon. JCW: 19-inch Strive Spoke wheels with sport tyres, JCW steering wheel and black/red detailing
- Countryman E/SE Classic: 6-speaker 100 W audio and sport seats. Favoured: power front seats/driver memory-massage, Harman Kardon 12-speaker 365 W. SE ALL4 JCW Sport: JCW steering/exterior, black/red JCW seats, 19/20-inch wheel choices. 20-inch is an option where specified, not universally standard

Conservative equipment display: Cooper SE's guide unusually prints 12 speakers/365W versus JCW/Paul Smith 10/315; show “Harman Kardon” and keep exact counts as attributed claims. Countryman electric JCW Sport p11 anomalously prints “DCT Shift Paddles”; **do not import that as BEV equipment**. Retain only as a source anomaly, not a corrected/assumed feature.

## Stock identity scope and source handling

- BMW seven fresh exact zero-km NEW ads cover six model-code grades: 22HM, 82GN, 52HD (two ads), 42CF, 62HG, 32HR. iX3 40 and i5 M60 lack verified exact NEW ads; Sport Collection is offer-only
- MINI twenty fresh zero-km NEW ads cover SE Favoured Cooper, Aceman SE/JCW, Countryman E Favoured, SE ALL4 Favoured/JCW Sport. Cooper JCW, Paul Smith and both Countryman Classic styles have no verified exact NEW ad
- Treat stock links as evidence of an advertisement with VIN, condition, odometer and price. Keep `stockStatus = new_stock_listed` only for these exact covered scopes; all physical-arrival/unsold/build-revision/warranty-start checks remain false or null
- Current brochure technical facts belong to the catalogue record, not automatically to the linked VIN. No MINI ad was verified against July/September production. A separate New-labelled 1,556 km MINI ad is flagged and excluded from zero-km NEW evidence
- Replace the old i4/iX3 placeholder search-only stock assertions with fresh evidence where available; preserve old URLs/history as prior evidence, not simultaneously verified stock. Failed URLs stay in rejected/cached evidence
- Preserve exact source IDs and locators from `bmw-mini-evidence.json`, or use a collision-safe prefix such as `r10_bmwmini_` with an explicit mapping. Source hashes prove captured bytes, not correctness
- Nine existing family placeholders gain detailed coverage. Do not add nine duplicate family census rows or claim the BMW/MINI/whole-market universe is closed
