# Refreshed existing-trim selling points: narrow proposal

## Result

Proposed, not applied. The actual shared reader accepts all 57 research-refresh actions. A memory-only merge of this proposal produces 13 visible audited records / 26 clauses, and 222 catalogue-wide summaries / 444 clauses. The three unsupported outgoing records remain suppressed. Black, all unrelated summaries and the Model Y work remain unchanged.

Files: `refreshed-trim-selling-points-proposal.json` contains all 16 audited records and all 80 complete executable dependencies. `refreshed-trim-selling-points-validation.json` contains the current reader hashes and all 667 passing checks.

## Apply boundary

- Merge only the 13 changed records by `variantId` and the single changed dependency by `id` into `data/buyer-selling-points-2026-10-10.json`
- Never replace the complete application collection with this 16-record subset
- Do not edit guard code, existing fact/source evidence, model-year/drive/battery identity, stock evidence, Model Y assets or the 182 excluded source-only refreshes
- Preserve the 79 other dependencies exactly, including their source IDs, dates, expected conditions, fact scopes, markets and arithmetic
- Preserve every record and dependency `checkedAt`; no broad freshness reset is proposed
- Rerun application tests/build after integration. The existing summary-count test needs 222, reflecting 11 restored records plus newly request-listed Essential

## Exact changes

### 13 availability revision bindings

Each token below is copied from the actual final `catalogue()` car after checking its complete availability evidence against the reviewed refresh action. This is not a stock-status upgrade.
- `byd_sealion_7__premium_rwd__1`: unset → `existing-refresh-129`; current_or_order_listed; stock `new_stock_listed`
- `byd_sealion_7__performance_awd__2`: unset → `existing-refresh-146`; current_or_order_listed; stock `new_stock_listed`
- `geely_ex5__complete_extended_range__1`: unset → `existing-refresh-152`; current_or_order_listed; stock `new_stock_listed`
- `geely_ex5__inspire_extended_range__2`: unset → `existing-refresh-170`; current_or_order_listed; stock `unverified`
- `zeekr_7x__rwd__1`: unset → `existing-refresh-189`; current_or_order_listed; stock `unverified`
- `zeekr_7x__long_range_rwd__2`: unset → `existing-refresh-202`; current_or_order_listed; stock `new_stock_listed`
- `zeekr_7x__performance_awd__3`: unset → `existing-refresh-216`; current_or_order_listed; stock `new_stock_listed`
- `byd_atto_2__dynamic__1`: unset → `existing-refresh-096`; current_or_order_listed; stock `new_stock_listed`
- `byd_atto_2__premium__2`: unset → `existing-refresh-113`; current_or_order_listed; stock `new_stock_listed`
- `byd_atto_3_evo__dynamic_fwd__1`: unset → `existing-refresh-019`; current_or_order_listed; stock `unverified`
- `byd_atto_3_evo__premium_rwd__2`: unset → `existing-refresh-043`; current_or_order_listed; stock `unverified`
- `byd_atto_3_legacy__essential_fwd__1`: unset → `existing-refresh-063`; current_or_order_listed; stock `unverified`
- `byd_atto_3_legacy__premium_fwd__2`: unset → `existing-refresh-079`; outgoing; stock `unverified`

### One factual dependency

`feature:geely_ex5__inspire_extended_range__2:screens_hud` is rebound to the actual effective row:
- Value: 15.4-inch screen; 10.2-inch driver display; head-up display
- Status remains `standard`
- Conditions: HUD is fitted. Its diagonal remains unresolved: page 29 says 13.8 inches, page 33 equipment matrix says 13.4 inches.
- Source membership changes from `r6_geely_spec` to `r10_gzx_geely_ex5_er_brochure`
- Only its own evidence metadata and its consuming strength’s source/evidence metadata follow that change
- The existing lead wording remains unchanged. The exact unresolved-diagonal qualification is also appended to the record’s visible conditions

The saved [Australian EX5 ER brochure](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf), PDF page 29 (printed 28) and page 33 (printed 32), agrees on Inspire HUD fitment but conflicts on the diagonal. Page 33’s exact Extended Range trim table was visually checked. The selling point makes no diagonal claim. Existing front-ventilation and opening-panoramic-roof dependencies remain unchanged.

### Essential current-request-listing wording and scope

- Remove only Essential’s `availabilityScope: outgoing_new_stock`
- Keep its model-year guard and range, cargo and dashcam dependencies unchanged, including all source IDs/dates and the 75 km subtraction
- Remove outgoing framing from Essential’s descriptive record metadata, lead text and comparison label/text
- Replace its outdated outgoing availability condition with the order-request/allocation qualification; add the explicit legacy Premium comparison limitation
- Preserve exact-year confirmation, WLTP caution and existing cargo/dashcam operation qualification
- `recommendationEligible: true` reflects current-listing eligibility only; it adds no claim of physical stock, accepted factory order or delivery

The saved [BYD configurator](https://bydautomotive.com.au/configurator/byd-atto-3) explicitly lists Essential and states that submission is only an order request, with allocation subject to availability. The saved [legacy ATTO 3 brochure](https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf), page 2, was visually checked for built-in dash camera, 440 L minimum luggage capacity and 345/420 km WLTP. These corroborate the existing dependencies without refreshing their evidence dates.

## Proposed copy and visibility by record

### BYD Sealion 7 Premium RWD

ID: `byd_sealion_7__premium_rwd__1`
Disposition: visible with both clauses. Revision: `existing-refresh-129`.

Strength — Seat ventilation and head-up display: Premium includes ventilated front seats and a head-up display for buyers who want both without moving to AWD.

Trade-off — Lower towing limit: Braked towing is rated at 750kg, compared with 1,500kg for Performance AWD.

Required visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- Braked towing requires suitable approved towing equipment and compliance with vehicle, trailer, occupant/load and towball limits; the rating is not a loaded-trip guarantee.

### BYD Sealion 7 Performance AWD

ID: `byd_sealion_7__performance_awd__2`
Disposition: visible with both clauses. Revision: `existing-refresh-146`.

Strength — Acceleration and rear-seat heating: Performance combines AWD, a claimed 4.5-second 0–100km/h time and heated outer rear seats.

Trade-off — Range trade-off: Its 456km WLTP claim is 26km below Premium RWD’s 482km.

Required visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Acceleration is a manufacturer claim. Test protocols are not necessarily comparable across makes; actual results vary.

### Geely EX5 Complete Extended Range

ID: `geely_ex5__complete_extended_range__1`
Disposition: visible with both clauses. Revision: `existing-refresh-152`.

Strength — Range with heated front seats: Complete Extended Range pairs a 475km WLTP claim with heated front seats.

Trade-off — Fewer cabin conveniences: Front-seat ventilation and a powered tailgate are not fitted to Complete.

Required visible conditions:
- Exact Australian record: 2026 Extended Range; confirm MY/VIN. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- The Extended Range record is the 68.39kWh version; verify the VIN/build rather than relying on the EX5 badge alone.

### Geely EX5 Inspire Extended Range

ID: `geely_ex5__inspire_extended_range__2`
Disposition: visible with both clauses. Revision: `existing-refresh-170`.

Strength — Ventilation, display and sunroof: Inspire Extended Range includes ventilated front seats, a head-up display and an opening panoramic sunroof.

Trade-off — Range trade-off: Its 450km WLTP claim is 25km below Complete Extended Range’s 475km.

Required visible conditions:
- Exact Australian record: 2026 Extended Range; confirm MY/VIN. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- The Extended Range record is the 68.39kWh version; verify the VIN/build rather than relying on the EX5 badge alone.
- HUD is fitted. Its diagonal remains unresolved: page 29 says 13.8 inches, page 33 equipment matrix says 13.4 inches.

### Geely EX5 Complete

ID: `geely_ex5__complete__3`
Disposition: suppressed; no exact current NEW-stock proof. Revision: `unchanged / none`.

Strength — Earlier-pack daily use: The outgoing Complete combines heated front seats with a 430km WLTP claim.

Trade-off — Less range than the ER version: Its 430km WLTP claim is 45km below Complete Extended Range’s 475km.

Required visible conditions:
- Exact Australian record: MY2025 / early MY2026 60.22 kWh. Confirm the specification of the ordered or inspected vehicle.
- Outgoing specification. No fresh exact-car stock verification is provided here; confirm VIN, battery, build, condition and remaining warranty with the seller. This is not a current factory-order recommendation.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### Geely EX5 Inspire

ID: `geely_ex5__inspire__4`
Disposition: suppressed; no exact current NEW-stock proof. Revision: `unchanged / none`.

Strength — Earlier-pack seat equipment: The outgoing Inspire retains heated and ventilated front seats and a 410km WLTP claim.

Trade-off — Less range than the ER version: Its 410km WLTP claim is 40km below Inspire Extended Range’s 450km.

Required visible conditions:
- Exact Australian record: MY2025 / early MY2026 60.22 kWh. Confirm the specification of the ordered or inspected vehicle.
- Outgoing specification. No fresh exact-car stock verification is provided here; confirm VIN, battery, build, condition and remaining warranty with the seller. This is not a current factory-order recommendation.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### Zeekr 7X RWD

ID: `zeekr_7x__rwd__1`
Disposition: visible with both clauses. Revision: `existing-refresh-189`.

Strength — AC charging flexibility: RWD supports up to 22kW AC charging and carries a 480km WLTP range claim.

Trade-off — Front-seat and display omissions: Front-seat ventilation and the head-up display are not fitted to the base RWD.

Required visible conditions:
- Exact Australian record: MY26 Australian core range. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- AC input is the vehicle limit, not a guaranteed charging rate. The supply, charger and installation must support the power; more than 7.4 kW normally requires a suitable three-phase installation.
- The 22kW maximum needs a compatible three-phase 22kW supply and charging installation; ordinary home sockets cannot deliver it.

### Zeekr 7X Long Range RWD

ID: `zeekr_7x__long_range_rwd__2`
Disposition: visible with both clauses. Revision: `existing-refresh-202`.

Strength — Range and ventilated front seats: Long Range RWD combines a 615km WLTP claim with ventilated front seats.

Trade-off — Less acceleration than Performance: It is rear-wheel drive and claims 6.0 seconds to 100km/h, versus 3.8 seconds for Performance AWD.

Required visible conditions:
- Exact Australian record: MY26 Australian core range. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Acceleration is a manufacturer claim. Test protocols are not necessarily comparable across makes; actual results vary.

### Zeekr 7X Performance AWD

ID: `zeekr_7x__performance_awd__3`
Disposition: visible with both clauses. Revision: `existing-refresh-216`.

Strength — Acceleration and suspension hardware: Performance AWD pairs a claimed 3.8-second 0–100km/h time with air suspension and adaptive damping.

Trade-off — Range trade-off: Its 543km WLTP claim is 72km below Long Range RWD’s 615km.

Required visible conditions:
- Exact Australian record: MY26 Australian core range. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Acceleration is a manufacturer claim. Test protocols are not necessarily comparable across makes; actual results vary.

### Zeekr 7X Black Special Edition AWD

ID: `zeekr_7x__black_special_edition_awd__4`
Disposition: visible with both clauses. Revision: `unchanged / none`.

Strength — Acceleration-focused special edition: Black Special Edition combines AWD with a manufacturer-claimed 3.8-second 0–100km/h time.

Trade-off — Edition equipment needs checking: The core brochure does not itemise Black; confirm inherited head-up display and powered-tailgate equipment on the exact order.

Required visible conditions:
- Exact Australian record: 2026 Australian special edition. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- Acceleration is a manufacturer claim. Test protocols are not necessarily comparable across makes; actual results vary.
- Edition-specific wheel/range certification is not established. The shared range is inherited from Performance AWD and must not be promoted as a confirmed Black-edition range.
- No fresh Black-edition stock or current transaction price has been established here.

### BYD ATTO 2 Dynamic

ID: `byd_atto_2__dynamic__1`
Disposition: visible with both clauses. Revision: `existing-refresh-096`.

Strength — Five-seat daily use: Dynamic packages five seats and a 345km WLTP claim in a 4,310mm-long body.

Trade-off — Seat climate equipment omitted: Dynamic has neither heated nor ventilated front seats; both are Premium equipment.

Required visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### BYD ATTO 2 Premium

ID: `byd_atto_2__premium__2`
Disposition: visible with both clauses. Revision: `existing-refresh-113`.

Strength — Seat climate and roof equipment: Premium includes heated and ventilated front seats plus a panoramic glass roof with a blind.

Trade-off — Equipment upgrade, unchanged range: Its 345km WLTP claim is the same as Dynamic’s; the equipment upgrade does not add claimed range.

Required visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### BYD ATTO 3 EVO Dynamic FWD

ID: `byd_atto_3_evo__dynamic_fwd__1`
Disposition: visible with both clauses. Revision: `existing-refresh-019`.

Strength — Five-seat range and cargo: Dynamic offers five seats, a 420km WLTP claim and 434L of seats-up cargo by BYD’s measure.

Trade-off — AC and towing limits: AC input is limited to 7kW, and maximum braked towing is 750kg.

Required visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- AC input is the vehicle limit, not a guaranteed charging rate. The supply, charger and installation must support the power; more than 7.4 kW normally requires a suitable three-phase installation.
- Braked towing requires suitable approved towing equipment and compliance with vehicle, trailer, occupant/load and towball limits; the rating is not a loaded-trip guarantee.
- BYD does not state the cargo measuring protocol; do not rank this volume directly against VDA or Tesla figures.

### BYD ATTO 3 EVO Premium RWD

ID: `byd_atto_3_evo__premium_rwd__2`
Disposition: visible with both clauses. Revision: `existing-refresh-043`.

Strength — Range and towing capacity: Premium RWD pairs a 510km WLTP claim with a 1,500kg maximum braked-towing rating.

Trade-off — Cargo comparison needs care: BYD’s 490L seats-up cargo figure has no stated measuring protocol; check your luggage rather than compare directly with VDA figures.

Required visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Braked towing requires suitable approved towing equipment and compliance with vehicle, trailer, occupant/load and towball limits; the rating is not a loaded-trip guarantee.

### BYD ATTO 3 (legacy) Essential FWD

ID: `byd_atto_3_legacy__essential_fwd__1`
Disposition: visible with both clauses. Revision: `existing-refresh-063`.

Strength — Earlier-model storage and recording: Essential includes a built-in front dashcam and 440L of seats-up cargo by BYD’s measure.

Trade-off — Less range than legacy Premium: Its 345km WLTP claim is 75km below the legacy Premium’s 420km.

Required visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current configurator accepts order requests, subject to allocation. No exact Essential NEW unit or delivery date was verified.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Cargo method is not stated. Dashcam recording needs suitable memory storage; verify its inclusion and operation on the inspected car.
- The legacy Premium comparison is a specification comparison; its exact current NEW-stock epoch remains unverified.

### BYD ATTO 3 (outgoing MY25/MY26) Premium FWD

ID: `byd_atto_3_legacy__premium_fwd__2`
Disposition: suppressed; no exact current NEW-stock proof. Revision: `existing-refresh-079`.

Strength — Earlier-model range and seat heating: Outgoing Premium pairs a 420km WLTP claim with heated front seats.

Trade-off — AC limit and no seat ventilation: AC input is limited to 7kW; front-seat ventilation is not fitted.

Required visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Outgoing specification. No fresh exact-car stock verification is provided here; confirm VIN, battery, build, condition and remaining warranty with the seller. This is not a current factory-order recommendation.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- AC input is the vehicle limit, not a guaranteed charging rate. The supply, charger and installation must support the power; more than 7.4 kW normally requires a suitable three-phase installation.

## Mutation and preservation validation

- 667 checks passed against the actual `buildBuyerSummaries` reader
- All 16 shared effective-feature sets equal `pack()` output
- All 57 installed research actions exactly match effective values
- All 69 dependencies used by visible audited clauses were mutation-tested
- Fact mutations cover value, status, unit, basis, comparison basis, market, scope, qualifications, condition explanation, issues, source membership and freshness
- Feature mutations cover value, status, conditions, source membership and freshness
- Model-year/drive changes and stale dependency reviews still fail closed
- All 10 used source IDs were tested for missing sources, stale dates, unsafe URL schemes, holds, conflicts and access restrictions
- Availability token changes, provisional status, stale editorial records and altered arithmetic still suppress affected copy
- Three memory-only positive outgoing-stock controls show that explicit scope, fresh evidence and supporting sources remain mandatory; those fixtures do not claim or change real stock
- Black’s complete record is unchanged. Both old EX5 records are unchanged. Legacy Premium changes only its availability revision and retains its outgoing stock guard
- All unrelated full-catalogue summaries remain byte-equivalent after the proposed merge
- All application input hashes were stable during the final validation run. `data.ts` / `research-refresh.ts` had changed since initial capture due to main’s registry validation, canonicalization and formatting; final effective data still matched and current hashes are recorded

## Reviewable leaf-level diff

The JSON `changes` array records every before/after value. Changed fields are listed below; array values are replaced as complete reviewed arrays rather than partially patched.

### records: `byd_sealion_7__premium_rwd__1`

- `/availabilityRevision`

### records: `byd_sealion_7__performance_awd__2`

- `/availabilityRevision`

### records: `geely_ex5__complete_extended_range__1`

- `/availabilityRevision`

### records: `geely_ex5__inspire_extended_range__2`

- `/availabilityRevision`
- `/requiredVisibleConditions`
- `/sourceIds`
- `/strength/evidenceDates/feature:geely_ex5__inspire_extended_range__2:screens_hud`
- `/strength/sourceIds`

### records: `zeekr_7x__rwd__1`

- `/availabilityRevision`

### records: `zeekr_7x__long_range_rwd__2`

- `/availabilityRevision`

### records: `zeekr_7x__performance_awd__3`

- `/availabilityRevision`

### records: `byd_atto_2__dynamic__1`

- `/availabilityRevision`

### records: `byd_atto_2__premium__2`

- `/availabilityRevision`

### records: `byd_atto_3_evo__dynamic_fwd__1`

- `/availabilityRevision`

### records: `byd_atto_3_evo__premium_rwd__2`

- `/availabilityRevision`

### records: `byd_atto_3_legacy__essential_fwd__1`

- `/availabilityGuard/expectedRecordState`
- `/availabilityGuard/source`
- `/availabilityRevision`
- `/availabilityScope`
- `/classification`
- `/displayName`
- `/recommendationEligible`
- `/recordState`
- `/requiredVisibleConditions`
- `/strength/text`
- `/tradeoff/label`
- `/tradeoff/text`

### records: `byd_atto_3_legacy__premium_fwd__2`

- `/availabilityRevision`

### dependencies: `feature:geely_ex5__inspire_extended_range__2:screens_hud`

- `/effectivePipeline`
- `/evidenceDate`
- `/evidenceLocator`
- `/expectedConditions`
- `/expectedEvidenceScope`
- `/expectedValue`
- `/sourceEvidenceDates/r10_gzx_geely_ex5_er_brochure`
- `/sourceEvidenceDates/r6_geely_spec`
- `/sourceIds`
- `/sourceSelectionRationale`

## Evidence and limitations

- 25 action evidence references had hashes and application source resolution verified; one additional legacy brochure reference was hash-verified as corroboration
- All source bytes were existing saved evidence; this task makes no new network-freshness claim
- No application code, data, guard, source record, hero or asset was edited by this worker
- Current-record availability is guarded by the existing revision token; a future availability-evidence change must issue a new token. This proposal does not claim stricter behavior than the reader implements
- This is a read-only application audit and in-memory executable proposal test. It is not application integration, full-suite/build completion or browser QA

Validation command, run from the application root: `node --import tsx ../../roadmark-research/validate_refreshed_trim_selling_points_proposal.cjs`
