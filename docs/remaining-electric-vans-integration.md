# Remaining electric vans: integration memo

Research snapshot: 10 October 2026. Application/catalogue edits are outside this research deliverable; none were made.

## Deliverables

- `remaining-electric-vans-evidence.json`: complete six-record current/current-listed evidence, one separate pre-delivery record, eight added exact NEW ads, normalized stock index, sources, holds and prior-artifact hashes
- `remaining-electric-vans-evidence.md`: readable consolidated report
- `remaining-electric-vans-validation.json`: 58 sources, 574 source-reference occurrences, 147 checked snapshot/artifact hashes, 189 checked exact anchors; all pass
- Detailed workers: `renault-remaining-worker.json/.md`, `peugeot-remaining-worker.json/.md`, `ford-vans-epoch-followup.json/.md`
- Source folders: `renault-remaining-sources/`, `remaining-electric-vans-sources/`, `ford-vans-epoch-sources/`

The consolidated JSON preserves the worker record schemas and all field qualifiers. `normalized_stock_index` gives a uniform eight-row identity/price index; `dealer_stock` retains full per-field provenance. Do not strip wrapper qualifiers when converting to application facts.

## Record disposition

| Record ID | Publication status | Recommended integration |
|---|---|---|
| renault-kangoo-etech-swb-ev45-current-family | Current manufacturer family; exact MY held | Current published family detail with formal MY null; explicit April-2026 source scope |
| renault-kangoo-etech-lwb-ev45-current-family | Current manufacturer family; exact MY held | Same treatment; no accepted fresh NEW LWB ad |
| renault-master-etech-mwb-l2h2-ev87-my26 | Current listing; MY26 confirmed; arrival unverified | Announced/current-listed detail, no available-now or physical-stock claim |
| renault-master-etech-lwb-l3h2-ev87-my26 | Current listing; MY26 confirmed; arrival unverified | Same treatment; electric H2 only |
| peugeot-e-partner-current-pro-long | Current newer-page/configurator; exact MY/matrix incomplete | Partial current record or audit detail only; do not manufacture a complete MY26 row |
| peugeot-e-expert-my24-pro-long | Current linked MY24 sheet; material field conflicts | Useful partial technical/equipment record; range/cycle/AC-time/extended-cargo holds |
| ford-transit-city-my27-swb-fwd | MY27 confirmed; November-2026 expected first deliveries | Separate pre-delivery detail/market row; not currently deliverable NEW stock |

No record qualifies for a whole-vehicle or passenger winner ranking. This does not forbid comparing individual compatible published fields within a labelled commercial shortlist.

## Market-row updates

The JSON includes `market_record_update_recommendations` for existing IDs:

- `renault-kangoo-e-tech`: add two fresh exact older-MY SWB NEW ads; replace “no specific new stock verified” with body/MY-specific evidence. Keep current MY and catalogue-to-stock equivalence unverified
- `renault-master-van-e-tech`: replace unspecified model year with manufacturer MY26 for the two EV87 H2 bodies; retain current listing/arrival/order acceptance hold
- `peugeot-e-partner`: add the two MY24 two-seat NEW ads as older stock; current facelift MY remains null. The manufacturer page now explicitly says available to order only; distinguish that invitation from factory acceptance
- `peugeot-e-expert`: current linked sheet MY24; four exact NEW ads with formal stock MY null. Preserve the all-MY national driveaway campaign and clear technical holds
- `ford-transit-city`: replace secondary-only November wording with the dated 9 September Ford primary release. MY27 and expected November deliveries are primary-supported. Preserve pre-delivery order-listing state
- `ford-e-transit-custom`: preserve current epoch hold and all existing exact NEW stock identities
- `ford-e-transit`: preserve current exact-MY, GVM/payload and stock holds. Ford App’s MY2024.75–Current compatibility row is supporting nomenclature, not a technical MY specification

A manufacturer claim that a model can be ordered, a dealer invitation, and a generic marketplace order template never equal an accepted factory order. The research verified zero accepted orders and zero physical stock locations.

## Critical field gates

### Kangoo

- Formal `model_year` stays null. MY26 exists in the official asset filename only; current PDF footer is April 2026. Preserve `published_manufacturer_model_year` and its qualifier separately
- Use visible p8 exact electric columns: 1,830 mm height, 1,859 mm body width, 523/668 kg payload, 2,230/2,490 kg GVM, 3,730/3,990 kg GCM
- Ignore invisible obsolete text exposed by extraction (600/800 kg payload etc). Generic drawing dimensions remain secondary to exact electric table, with the conflict documented
- Battery 45 kWh is explicitly usable; gross and cathode subtype unknown
- AC 22 kW and DC 80 kW are vehicle maxima. Published times recover distance, not SOC. No 10–80% or 0–100% conversion. 170 km in 27 versus 30 minutes is unresolved; do not choose a charging winner
- Comfort Pack assistance and Visibility Pack LEDs remain optional. The smart rear-view mirror is optional and subject to build shortages, not guaranteed standard
- Current manufacturer advertised 70% battery retention applies to Kangoo only. Do not copy to Master
- Price 61,990/63,990 is raw public configurator payload with unclear basis. Do not present as verified current national MLP or driveaway

### Master

- Exactly two Australian EV87 bodies, L2H2 and L3H2, both 2,498 mm high. Standard-roof/mid-roof refer to the same H2 bodies. L3H3 high roof and 1,973 kg payload are diesel, not EV additions
- MY26 is explicitly printed and confirmed in the June manufacturer release
- 87 kWh capacity basis is unspecified. Do not mark usable/gross
- 409 km WLTP combined laboratory claim; test payload unknown. Actual arrival remains unverified even though the H2-2026 forecast period has begun
- Standard 11 kW AC / 130 kW DC; 15–80% only: DC 38 min, AC 5h52 at 11 kW or 30h06 at 2.1 kW. Do not rewrite to 10–80%
- Standard 11 kW configuration has V2L. Optional 22 kW AC explicitly removes V2L. Output/adapter/price unknown
- Optional front/side sensors remove blind-spot warning. Do not combine all option features into one default vehicle
- Payload matches GVM minus unladen, not the oddly larger published tare. Keep 2,336/2,416 kg unladen and 2,344/2,424 kg tare as labelled. Do not silently correct the manufacturer

### Peugeot

- E-Partner current 10-inch/digital-mirror page does not map to the indexed MY23 technical sheet. The separate MY26 Partner sheet was inspected and is petrol-only. Do not use it to fill BEV gaps
- E-Partner current payload null: 717 versus 780 kg. Do not replace with old MY23 753 kg. Current seats, axle, wheelbase, AC capacity/time and mass remain unverified
- E-Partner nominal load claim 3.9 m³ can be labelled as such, method/arrangement unknown; extended/max null because 4.4 and 4.3 m³ claims lack mapping
- E-Partner RRP 60,990 is current configurator publication, current MY unknown; 66,467 is the official link’s dp=2765 indicative private-buyer driveaway. dp=null $0 is placeholder. Hidden Coming Soon template is not availability evidence
- E-Expert normalized range and cycle must be null. Current MY24 sheet and configurator NEDC cannot be merged with live-page WLTP. Dealer prose cannot resolve a manufacturer conflict
- E-Expert AC time null: sheet/page 7h30 at 11 kW versus configurator 11h9. Preserve raw claims. The 7.4 kW/23-hour value is visibly published, but unsuitable for charging comparisons
- E-Expert 6.6 m³ row literally says “excluding load through bulkhead”. Do not silently turn it into an including/load-through maximum. Normalized extended volume null
- 100 kW timed charging is station/test-current evidence; vehicle peak separately unknown. 50/75 kWh usable/gross split unknown
- 1,920 mm E-Expert width is mirrors folded, not body-only; E-Partner 1,921 mm is a dated mirrors-folded reference, not current body width
- E-Expert national from-$56,990 driveaway applies any model year at participating dealers while stock lasts; restrictions remain attached. Do not invent an expiry or mix it with $79,990 RRP
- No Peugeot AU van battery-retention threshold verified. Current E-Expert 8yr/160k cover is supported; current-facelift E-Partner applicability remains unknown. PHEV-only and foreign 70% clauses excluded

### Ford

- Transit City follows the local single SWB/FWD/three-seat MY27 sheet. Do not add European L2H2 or chassis cab
- 56 kWh usable LFP, 87 kW DC rating and 33 min 10–80% are supported. AC is 10–100% at 7.4/11 kW stations; explicit onboard maximum is unknown
- 6.4 m³ loose-material maximum and 5.75 m³ VDA with bulkhead are separate. Test load and cargo methods remain labelled
- Transit City has a substantive equipment matrix: 64 standard fields, 3 paint options and 16 unknown/conflicting fields. Phone connection mode remains null (wireless in brochure/release, USB in live page). No unsupported unavailable features inferred
- $50,000 is recommended driveaway, not MLP. Evie voucher expiry 31 December does not establish base-price expiry
- Keep current Custom MY26.50 brochure’s upgraded 71.45 kWh claims separate from real MY26.50/MY26.00/MY25.75 stock. No local release/production mapping resolved the MY27.25/March2027 conflict
- Full-size E-Transit prior MY23.50 technical sheet remains dated reference. The new Ford App MY2024.75 support band does not authorize a new technical row

## Exact NEW stock joins

Eight unique new VINs added; all prices AUD advertised driveaway, not dealer quotes. See the normalized stock index for URLs and full dealer identities.

| Family | Stock | Formal ad MY | Price | Current technical equivalence |
|---|---|---|---:|---|
| Kangoo SWB | T34068A | MY25 | $62,990 | Unverified; build April2026 is separate |
| Kangoo SWB | T22763 | MY24 | $45,990 | Unverified; current direct odometer unknown |
| E-Partner LWB, 2 seats | PE905999F | MY24 | $66,686 | Not current facelift proof |
| E-Partner LWB, 2 seats | PE907870F | MY24 | $66,686 | Not current facelift proof |
| E-Expert LWB, 3 seats | PE018750F | Unstated | $56,990 | Body/battery ad claims only |
| E-Expert LWB, 3 seats | PE054918F | Unstated | $56,990 | Body/battery ad claims only |
| E-Expert LWB, 3 seats | PE042213F | Unstated | $57,490 | Body/battery ad claims only |
| E-Expert LWB, 3 seats | PE042606F | Unstated | $56,990 | Body/battery ad claims only |

PE042606F shares a VIN with stale East Coast 39047, whose old detail is 404: count once. NEW tags attached to related cards, New Arrival marketing, near-zero kilometres and generic order templates do not override exact Demo/Used/missing states. Dealer registered=false remains an unverified dealer assertion.

The previous four Ford Custom NEW advertisements are not new research additions. Reuse their exact source hashes/identity and existing holds rather than creating duplicate stock rows.

## Reuse completed van research

`prior_completed_artifacts` links and hashes the existing Ford evidence, LDV eDeliver 5/7/9, Farizon SV/SuperVAN and Mercedes eVito/eSprinter artifacts. They are deliberately not reproduced here. This task does not reverify or alter their prior outcomes, fields or holds.

## Suggested implementation checks

1. Null/unknown never becomes false, zero, standard or unavailable
2. Changing/removing a cited source must invalidate the dependent summary or comparison claim
3. Preserve field-specific unit/basis/cycle/window/method and qualifiers in page, copy text, search and exports
4. Current listings and pre-delivery City remain separate from exact NEW ads and physical inventory
5. Calendar/build/compliance years never replace formal MY
6. No importer inherits petrol high-roof/seats/ADAS or older-MY facelift equipment
7. Test E-Expert range null under both NEDC/WLTP filters; test charging-window gates
8. Test Kangoo hidden-PDF values rejected and Master 22 kW/V2L mutually exclusive
9. Keep commercial cargo and passenger boot comparisons separate, and source-based field-level comparisons available where genuinely compatible
10. Rebuild does not advance source verification dates
