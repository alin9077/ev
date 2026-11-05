# Existing-trim refresh plan

Checked 10 October 2026. Read-only audit of 16 existing IDs. No app, media, hero, guard or catalogue edits; no duplicate trims added.

## Main findings

- No changed numeric vehicle specification or new generation is established. Most supported values match the effective app. The EX5 mass issue is a tare/kerb field distinction.
- Legacy ATTO 3 Essential is still in the current order-request configurator. Its sunroof and wireless charger are explicitly unavailable, and the eight-speaker Dirac upgrade is unavailable; its basic FM/DAB audio still exists.
- EVO page 3 confirms tyre repair kits on both grades and restricts Atlantis Grey to Premium. EVO and EX5 ER explicit LFP rows resolve their held chemistry cells. Current 100 kWh 7X page supports NCM for the two core 100 kWh trims.
- BYD advertised amounts are unchanged base configurator selections, with on-road costs still dependent on location. Keep the qualified price basis.
- Legacy Premium NEW ads are only provisionally linked to old FWD/MY25 hardware by embedded dealer templates. Do not enable exact-legacy new-stock eligibility. Zeekr base RWD has a similar battery-match gap.
- Exact named-grade NEW ads support ATTO 2, SEALION 7, EX5 Complete ER and Zeekr Long Range/Performance. EX5 Inspire MY27 ad is SOLD. No fresh exact old-EX5 or Black stock.
- Keep MY labels, source dates and epochs separate. No new MY27 EX5 variant, China-market 900 V 7X, or Black wheel-specific WLTP inference.

## Files and validation

- Machine plan: `existing-trim-refresh-plan.json`; each action carries a full old state, proposed wrapper/status/basis/conditions, source URL, locator and SHA-256
- Before snapshot: `existing-trim-refresh-effective-before.json`; 16 effective cars, 1,104 equipment rows, original variants and old guards
- Guard audit: `existing-trim-refresh-guard-audit.json`; actual unchanged shared reader used on local clones
- Visual evidence: `existing-trim-refresh-qa/`; inspected saved PDF renders
- 55 priority actions, 182 optional source-only refreshes, 22 saved-source hashes verified, 237 isolated action simulations

## Integration order

1. Add/reuse the exact source registry entries. Treat saved dealer advertisements as observed snapshots; reconfirm live state before publishing a time-sensitive stock assertion.
2. Apply material equipment and basis fixes on the same IDs. Keep uncertainty and private-warranty conditions visible.
3. Apply narrowly justified availability corrections. Keep legacy Premium/base 7X stock unverified; keep old EX5 and Black unchanged without fresh availability dates.
4. Choose source-only refreshes deliberately. Do not bulk freshen unsupported fields, negative equipment or old epochs.
5. Re-read the effective catalogue, then rebind only supported strengths/trade-offs. Check both dependency guards and availability revisions. Run main integration tests after final data changes.

## Guard outcome

Baseline: 12 visible summaries / 24 clauses. Simulating all priority actions without rebinding leaves only Black’s existing summary visible. Availability revision changes suppress 11 previously visible records. Four outgoing records were already suppressed; Essential may become eligible only after a reviewed rebind and removal of outdated ‘Outgoing Essential’ wording.

Source/date refreshes can also break guards: changed source membership, basis, conditions and qualification arrays matter even when the number is identical. Source dates are freshness-checked, not exact-equality-checked. The detailed JSON lists every affected dependency and cross-trim consumer.

## Exact-ID actions

### BYD Sealion 7 Premium RWD

`byd_sealion_7__premium_rwd__1`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “2026 Australian specification”.

- existing-refresh-128: price_aud: 54990 (standard) → 54990 (conditional). Current source confirms amount/value. Price basis stays conditional; acceleration becomes a directly sourced manufacturer claim.
- existing-refresh-129: availability → `current_or_order_listed`, orders `accepting_order_requests_advertised`, stock `new_stock_listed`. Separate manufacturer request-taking, current listing and exact NEW-ad evidence; do not infer delivery or duplicate epochs.
- Optional source-only refresh keys: battery_kwh, range_km, zero_to_100_s, ac_kw, dc_peak_kw, kerb_weight_kg, boot_l, frunk_l, length_mm, width_mm, height_mm, wheelbase_mm, seats, rear_heated_seats, heated_steering_wheel
- Optional supplemental keys: power_kw, torque_nm, gvm_kg, wheel_diameter_in, front_suspension, rear_suspension, damper_system
- Holds: dc_charge_time_min / towing_braked_kg / towing_unbraked_kg / max_total_cargo_l: Current brochure confirms DC maximum and 500 L rear/58 L front storage, but not the existing 32-minute time, towing ratings or 1,789 L folded figure.; delivery_date: Saved configurator carries a stale estimated delivery banner: February/March 2025 for SEALION 7; May 2026 for ATTO 2. It is not a current October delivery estimate.

### BYD Sealion 7 Performance AWD

`byd_sealion_7__performance_awd__2`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “2026 Australian specification”.

- existing-refresh-145: price_aud: 63990 (standard) → 63990 (conditional). Current source confirms amount/value. Price basis stays conditional; acceleration becomes a directly sourced manufacturer claim.
- existing-refresh-146: availability → `current_or_order_listed`, orders `accepting_order_requests_advertised`, stock `new_stock_listed`. Separate manufacturer request-taking, current listing and exact NEW-ad evidence; do not infer delivery or duplicate epochs.
- Optional source-only refresh keys: battery_kwh, range_km, zero_to_100_s, ac_kw, dc_peak_kw, kerb_weight_kg, boot_l, frunk_l, length_mm, width_mm, height_mm, wheelbase_mm, seats, rear_heated_seats, heated_steering_wheel
- Optional supplemental keys: power_kw, torque_nm, gvm_kg, wheel_diameter_in, front_suspension, rear_suspension, damper_system
- Holds: dc_charge_time_min / towing_braked_kg / towing_unbraked_kg / max_total_cargo_l: Current brochure confirms DC maximum and 500 L rear/58 L front storage, but not the existing 32-minute time, towing ratings or 1,789 L folded figure.; delivery_date: Saved configurator carries a stale estimated delivery banner: February/March 2025 for SEALION 7; May 2026 for ATTO 2. It is not a current October delivery estimate.

### Geely EX5 Complete Extended Range

`geely_ex5__complete_extended_range__1`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “2026 Extended Range; confirm MY/VIN”.

- existing-refresh-152: availability → `current_or_order_listed`, orders `listed_unconfirmed`, stock `new_stock_listed`. Refresh listing and exact-unit evidence without creating a duplicate MY27 trim.
- existing-refresh-167: kerb_weight_kg: 1766 (standard) → null (not_verified). Existing 1,766/1,815 kg values are explicitly tare, despite effective Kerb weight label. Safe field correction is a null kerb value plus exact tare supplemental fact.
- existing-refresh-168: battery_chemistry: "Not confirmed from an opened source" (not_verified) → "Lithium iron phosphate (LFP)" (standard). Replace prior source-audit hold with explicit primary table evidence.
- existing-refresh-169: roadside_assistance: "Not confirmed from an opened source" (not_verified) → "Up to 7 years roadside assistance" (conditional). Newly opened primary brochure supports a qualified program statement; detailed renewal eligibility remains unverified.
- Optional source-only refresh keys: range_km, battery_kwh, ac_kw, dc_peak_kw, zero_to_100_s, length_mm, width_mm, height_mm, wheelbase_mm, ground_clearance_mm, turning_circle_m, boot_l, max_total_cargo_l, dc_charge_time_min
- Optional supplemental keys: tare_mass_kg, gvm_kg, power_kw, torque_nm, equipment_towing_preparation, boot_expanded_l
- Holds: price_aud: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.; towing_braked_kg: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.; towing_unbraked_kg: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.; frunk_l: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.; warranty: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.; battery_warranty: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.

### Geely EX5 Inspire Extended Range

`geely_ex5__inspire_extended_range__2`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “2026 Extended Range; confirm MY/VIN”.

- existing-refresh-170: availability → `current_or_order_listed`, orders `listed_unconfirmed`, stock `unverified`. Refresh listing and exact-unit evidence without creating a duplicate MY27 trim.
- existing-refresh-185: kerb_weight_kg: 1815 (standard) → null (not_verified). Existing 1,766/1,815 kg values are explicitly tare, despite effective Kerb weight label. Safe field correction is a null kerb value plus exact tare supplemental fact.
- existing-refresh-186: battery_chemistry: "Not confirmed from an opened source" (not_verified) → "Lithium iron phosphate (LFP)" (standard). Replace prior source-audit hold with explicit primary table evidence.
- existing-refresh-187: roadside_assistance: "Not confirmed from an opened source" (not_verified) → "Up to 7 years roadside assistance" (conditional). Newly opened primary brochure supports a qualified program statement; detailed renewal eligibility remains unverified.
- existing-refresh-188: screens_hud: "15.4-inch screen · 10.2-inch driver display · head-up display" (standard) → "15.4-inch screen; 10.2-inch driver display; head-up display" (standard). Keep confirmed HUD fitment while surfacing source-internal dimension conflict; do not choose a diagonal.
- Optional source-only refresh keys: range_km, battery_kwh, ac_kw, dc_peak_kw, zero_to_100_s, length_mm, width_mm, height_mm, wheelbase_mm, ground_clearance_mm, turning_circle_m, boot_l, max_total_cargo_l, dc_charge_time_min
- Optional supplemental keys: tare_mass_kg, gvm_kg, power_kw, torque_nm, equipment_towing_preparation, boot_expanded_l
- Holds: price_aud: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.; towing_braked_kg: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.; towing_unbraked_kg: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.; frunk_l: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.; warranty: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.; battery_warranty: Current ER brochure does not freshly establish every condition behind this existing field. Towing preparation is not an approved tow rating; full warranty terms and national current RRP were not revalidated.

### Geely EX5 Complete

`geely_ex5__complete__3`

Before: outgoing; orders `outgoing`; stock `unverified`; year label “MY2025 / early MY2026 60.22 kWh”.

- Retain without a fresh date. Current ER evidence does not establish the outgoing 60.22 kWh configuration.
- Holds: entire_technical_and_equipment_record: Only current 68.39 kWh ER brochure was checked in this pass. No new 60.22 kWh technical, factory-order or exact NEW stock evidence.

### Geely EX5 Inspire

`geely_ex5__inspire__4`

Before: outgoing; orders `outgoing`; stock `unverified`; year label “MY2025 / early MY2026 60.22 kWh”.

- Retain without a fresh date. Current ER evidence does not establish the outgoing 60.22 kWh configuration.
- Holds: entire_technical_and_equipment_record: Only current 68.39 kWh ER brochure was checked in this pass. No new 60.22 kWh technical, factory-order or exact NEW stock evidence.

### Zeekr 7X RWD

`zeekr_7x__rwd__1`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “MY26 Australian core range”.

- existing-refresh-189: availability → `current_or_order_listed`, orders `listed_unconfirmed`, stock `unverified`. Refresh current AU listing and stock evidence conservatively.
- existing-refresh-230: warranty: "5 years / unlimited km" (standard) → "5 years / unlimited km" (conditional). Same numeric private cover, newly evidenced policy eligibility and unresolved effective-date/commercial conditions.
- existing-refresh-231: battery_warranty: "8 years / 160,000 km" (standard) → "8 years / 160,000 km; minimum 70% battery retention" (conditional). Newly evidenced 70% threshold; preserve private-use, first-registration and remedy conditions.
- Optional source-only refresh keys: range_km, zero_to_100_s, dc_charge_time_min, battery_kwh, ac_kw, dc_peak_kw, boot_l, max_total_cargo_l, length_mm, width_mm, height_mm, wheelbase_mm
- Optional supplemental keys: architecture_v, battery_warranty_minimum_retention_percent
- Holds: battery_chemistry: Current page names 75 kWh Golden Brick but does not explicitly spell out LFP chemistry in the saved text.; rich equipment feature grid: Current page marketing explicitly warns equipment is not standard across all variants. Preserve exact original brochure matrix and its qualifications; do not fan out global feature copy.; price_aud / towing / frunk / kerb mass / ground clearance: Current source subset does not independently revalidate these exact fields. Dealer driveaway price is unit-specific, not national RRP.

### Zeekr 7X Long Range RWD

`zeekr_7x__long_range_rwd__2`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “MY26 Australian core range”.

- existing-refresh-202: availability → `current_or_order_listed`, orders `listed_unconfirmed`, stock `new_stock_listed`. Refresh current AU listing and stock evidence conservatively.
- existing-refresh-215: battery_chemistry: "Not confirmed from an opened source" (not_verified) → "100 kWh Qilin ternary lithium (NCM)" (standard). Replace source-audit hold using current official page, scoped to the 100 kWh core trims only.
- existing-refresh-232: warranty: "5 years / unlimited km" (standard) → "5 years / unlimited km" (conditional). Same numeric private cover, newly evidenced policy eligibility and unresolved effective-date/commercial conditions.
- existing-refresh-233: battery_warranty: "8 years / 160,000 km" (standard) → "8 years / 160,000 km; minimum 70% battery retention" (conditional). Newly evidenced 70% threshold; preserve private-use, first-registration and remedy conditions.
- Optional source-only refresh keys: range_km, zero_to_100_s, dc_charge_time_min, battery_kwh, ac_kw, dc_peak_kw, boot_l, max_total_cargo_l, length_mm, width_mm, height_mm, wheelbase_mm
- Optional supplemental keys: architecture_v, battery_warranty_minimum_retention_percent
- Holds: rich equipment feature grid: Current page marketing explicitly warns equipment is not standard across all variants. Preserve exact original brochure matrix and its qualifications; do not fan out global feature copy.; price_aud / towing / frunk / kerb mass / ground clearance: Current source subset does not independently revalidate these exact fields. Dealer driveaway price is unit-specific, not national RRP.

### Zeekr 7X Performance AWD

`zeekr_7x__performance_awd__3`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “MY26 Australian core range”.

- existing-refresh-216: availability → `current_or_order_listed`, orders `listed_unconfirmed`, stock `new_stock_listed`. Refresh current AU listing and stock evidence conservatively.
- existing-refresh-229: battery_chemistry: "Not confirmed from an opened source" (not_verified) → "100 kWh Qilin ternary lithium (NCM)" (standard). Replace source-audit hold using current official page, scoped to the 100 kWh core trims only.
- existing-refresh-234: warranty: "5 years / unlimited km" (standard) → "5 years / unlimited km" (conditional). Same numeric private cover, newly evidenced policy eligibility and unresolved effective-date/commercial conditions.
- existing-refresh-235: battery_warranty: "8 years / 160,000 km" (standard) → "8 years / 160,000 km; minimum 70% battery retention" (conditional). Newly evidenced 70% threshold; preserve private-use, first-registration and remedy conditions.
- Optional source-only refresh keys: range_km, zero_to_100_s, dc_charge_time_min, battery_kwh, ac_kw, dc_peak_kw, boot_l, max_total_cargo_l, length_mm, width_mm, height_mm, wheelbase_mm
- Optional supplemental keys: architecture_v, battery_warranty_minimum_retention_percent
- Holds: rich equipment feature grid: Current page marketing explicitly warns equipment is not standard across all variants. Preserve exact original brochure matrix and its qualifications; do not fan out global feature copy.; price_aud / towing / frunk / kerb mass / ground clearance: Current source subset does not independently revalidate these exact fields. Dealer driveaway price is unit-specific, not national RRP.

### Zeekr 7X Black Special Edition AWD

`zeekr_7x__black_special_edition_awd__4`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “2026 Australian special edition”.

- existing-refresh-236: warranty: "5 years / unlimited km" (standard) → "5 years / unlimited km" (conditional). Same numeric private cover, newly evidenced policy eligibility and unresolved effective-date/commercial conditions.
- existing-refresh-237: battery_warranty: "8 years / 160,000 km" (standard) → "8 years / 160,000 km; minimum 70% battery retention" (conditional). Newly evidenced 70% threshold; preserve private-use, first-registration and remedy conditions.
- Optional supplemental keys: battery_warranty_minimum_retention_percent
- Holds: price_aud / range_km / wheel-specific range / exact NEW stock: No independently verified current Black-specific price, NEW unit or 20-inch package WLTP. Existing 543 km is conditional inheritance from Performance 21-inch result.; core equipment and battery chemistry: No new Black-specific matrix inspected. Do not extend current Performance fitment/NCM claims to the package as an unconditional fresh revalidation.

### BYD ATTO 2 Dynamic

`byd_atto_2__dynamic__1`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “2026 Australian specification”.

- existing-refresh-095: price_aud: 31990 (standard) → 31990 (conditional). Current source confirms amount/value. Price basis stays conditional; acceleration becomes a directly sourced manufacturer claim.
- existing-refresh-096: availability → `current_or_order_listed`, orders `accepting_order_requests_advertised`, stock `new_stock_listed`. Separate manufacturer request-taking, current listing and exact NEW-ad evidence; do not infer delivery or duplicate epochs.
- existing-refresh-097: phone_key: "NFC phone key — tap to unlock" (standard) → "BYD Digital Key and Bluetooth key compatibility" (standard). Current table explicitly supports Bluetooth key compatibility beyond the old NFC-only summary.
- Optional source-only refresh keys: battery_kwh, range_km, zero_to_100_s, ac_kw, dc_peak_kw, dc_charge_time_min, kerb_weight_kg, boot_l, max_total_cargo_l, length_mm, width_mm, height_mm, wheelbase_mm, seats
- Optional supplemental keys: power_kw, torque_nm, gvm_kg, wheel_diameter_in, tyre_size
- Holds: towing_braked_kg / towing_unbraked_kg: Current pages 2–3 omit towing ratings. Existing 750 kg conditional values remain tied to older sources.; delivery_date: Saved configurator carries a stale estimated delivery banner: February/March 2025 for SEALION 7; May 2026 for ATTO 2. It is not a current October delivery estimate.

### BYD ATTO 2 Premium

`byd_atto_2__premium__2`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “2026 Australian specification”.

- existing-refresh-112: price_aud: 35990 (standard) → 35990 (conditional). Current source confirms amount/value. Price basis stays conditional; acceleration becomes a directly sourced manufacturer claim.
- existing-refresh-113: availability → `current_or_order_listed`, orders `accepting_order_requests_advertised`, stock `new_stock_listed`. Separate manufacturer request-taking, current listing and exact NEW-ad evidence; do not infer delivery or duplicate epochs.
- existing-refresh-114: phone_key: "NFC phone key — tap to unlock" (standard) → "BYD Digital Key and Bluetooth key compatibility" (standard). Current table explicitly supports Bluetooth key compatibility beyond the old NFC-only summary.
- Optional source-only refresh keys: battery_kwh, range_km, zero_to_100_s, ac_kw, dc_peak_kw, dc_charge_time_min, kerb_weight_kg, boot_l, max_total_cargo_l, length_mm, width_mm, height_mm, wheelbase_mm, seats
- Optional supplemental keys: power_kw, torque_nm, gvm_kg, wheel_diameter_in, tyre_size
- Holds: towing_braked_kg / towing_unbraked_kg: Current pages 2–3 omit towing ratings. Existing 750 kg conditional values remain tied to older sources.; delivery_date: Saved configurator carries a stale estimated delivery banner: February/March 2025 for SEALION 7; May 2026 for ATTO 2. It is not a current October delivery estimate.

### BYD ATTO 3 EVO Dynamic FWD

`byd_atto_3_evo__dynamic_fwd__1`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “2026 Australian specification”.

- existing-refresh-003: zero_to_100_s: 7.3 (conditional) → 7.3 (standard). Current source confirms amount/value. Price basis stays conditional; acceleration becomes a directly sourced manufacturer claim.
- existing-refresh-018: price_aud: 41990 (conditional) → 41990 (conditional). Current source confirms amount/value. Price basis stays conditional; acceleration becomes a directly sourced manufacturer claim.
- existing-refresh-019: availability → `current_or_order_listed`, orders `accepting_order_requests_advertised`, stock `unverified`. Separate manufacturer request-taking, current listing and exact NEW-ad evidence; do not infer delivery or duplicate epochs.
- existing-refresh-020: phone_key: "NFC phone key — tap to unlock" (standard) → "BYD Digital Key and Bluetooth key compatibility" (standard). Current table explicitly supports Bluetooth key compatibility beyond the old NFC-only summary.
- existing-refresh-021: battery_chemistry: "Not confirmed from an opened source" (not_verified) → "BYD Blade lithium iron phosphate (LFP)" (standard). Replace a source-audit hold with directly visible current primary evidence.
- existing-refresh-022: spare_tyre: "Tyre repair kit expected, no spare wheel" (conditional) → "Tyre repair kit included" (standard). Remove the inherited “expected” equipment assumption; actual table confirms the kit.
- existing-refresh-023: carplay_android_auto: "Wireless Apple CarPlay and Android Auto" (standard) → "Wired and wireless Apple CarPlay and Android Auto" (standard). Current table explicitly covers both wired and wireless connectivity.
- existing-refresh-024: paint_options_quality: "Ski White standard · 2 optional colours" (standard) → "Ski White standard; Harbour Grey and Cosmos Black optional" (standard). Remove a Premium-only colour incorrectly offered in Dynamic copy.
- Optional source-only refresh keys: battery_kwh, range_km, ac_kw, dc_peak_kw, dc_charge_time_min, kerb_weight_kg, boot_l, max_total_cargo_l, frunk_l, towing_braked_kg, towing_unbraked_kg, length_mm, width_mm, height_mm, wheelbase_mm, seats
- Optional supplemental keys: battery_chemistry, power_kw, torque_nm, gvm_kg, payload_kg, architecture_v, wheel_diameter_in, tyre_size, wltp_energy_kwh_100km
- Holds: heat_pump / rear_heated_seats / heated_steering_wheel: Current pages 2–3 do not expressly list these features as unavailable. Existing negative cells must not gain a fresh date from omission.; safety_ancap: Current brochure is not evidence that the legacy crash rating covers EVO.

### BYD ATTO 3 EVO Premium RWD

`byd_atto_3_evo__premium_rwd__2`

Before: current_or_order_listed; orders `current_or_order_listed`; stock `unverified`; year label “2026 Australian specification”.

- existing-refresh-027: zero_to_100_s: 5.5 (conditional) → 5.5 (standard). Current source confirms amount/value. Price basis stays conditional; acceleration becomes a directly sourced manufacturer claim.
- existing-refresh-042: price_aud: 46990 (conditional) → 46990 (conditional). Current source confirms amount/value. Price basis stays conditional; acceleration becomes a directly sourced manufacturer claim.
- existing-refresh-043: availability → `current_or_order_listed`, orders `accepting_order_requests_advertised`, stock `unverified`. Separate manufacturer request-taking, current listing and exact NEW-ad evidence; do not infer delivery or duplicate epochs.
- existing-refresh-044: phone_key: "NFC phone key — tap to unlock" (standard) → "BYD Digital Key and Bluetooth key compatibility" (standard). Current table explicitly supports Bluetooth key compatibility beyond the old NFC-only summary.
- existing-refresh-045: battery_chemistry: "Not confirmed from an opened source" (not_verified) → "BYD Blade lithium iron phosphate (LFP)" (standard). Replace a source-audit hold with directly visible current primary evidence.
- existing-refresh-046: spare_tyre: "Tyre repair kit expected, no spare wheel" (conditional) → "Tyre repair kit included" (standard). Remove the inherited “expected” equipment assumption; actual table confirms the kit.
- existing-refresh-047: carplay_android_auto: "Wireless Apple CarPlay and Android Auto" (standard) → "Wired and wireless Apple CarPlay and Android Auto" (standard). Current table explicitly covers both wired and wireless connectivity.
- Optional source-only refresh keys: battery_kwh, range_km, ac_kw, dc_peak_kw, dc_charge_time_min, kerb_weight_kg, boot_l, max_total_cargo_l, frunk_l, towing_braked_kg, towing_unbraked_kg, length_mm, width_mm, height_mm, wheelbase_mm, seats
- Optional supplemental keys: battery_chemistry, power_kw, torque_nm, gvm_kg, payload_kg, architecture_v, wheel_diameter_in, tyre_size, wltp_energy_kwh_100km
- Holds: heat_pump / rear_heated_seats / heated_steering_wheel: Current pages 2–3 do not expressly list these features as unavailable. Existing negative cells must not gain a fresh date from omission.; safety_ancap: Current brochure is not evidence that the legacy crash rating covers EVO.

### BYD ATTO 3 (outgoing MY25/MY26) Essential FWD

`byd_atto_3_legacy__essential_fwd__1`

Before: outgoing; orders `outgoing`; stock `unverified`; year label “2026 Australian specification”.

- existing-refresh-062: price_aud: 39990 (standard) → 39990 (conditional). Current source confirms amount/value. Price basis stays conditional; acceleration becomes a directly sourced manufacturer claim.
- existing-refresh-063: availability → `current_or_order_listed`, orders `accepting_order_requests_advertised`, stock `unverified`. Separate manufacturer request-taking, current listing and exact NEW-ad evidence; do not infer delivery or duplicate epochs.
- existing-refresh-064: phone_key: "NFC phone key — tap to unlock" (standard) → "BYD Digital Key and Bluetooth key compatibility" (standard). Current table explicitly supports Bluetooth key compatibility beyond the old NFC-only summary.
- existing-refresh-149: glass_roof: "Panoramic sunroof listed for the range" (conditional) → "Opening panoramic sunroof not fitted" (unavailable). Resolve prior unreadable trim marks; do not retain range-wide inheritance.
- existing-refresh-150: wireless_charging: "Wireless pad listed for the range" (conditional) → "Not fitted" (unavailable). Resolve prior unreadable trim marks.
- existing-refresh-151: audio_system: "8 speakers listed for the range" (conditional) → "FM/DAB audio; speaker count unverified" (conditional). The dash disproves the eight-speaker upgrade inheritance, not all audio equipment.
- Optional source-only refresh keys: battery_kwh, range_km, zero_to_100_s, dc_peak_kw, kerb_weight_kg, boot_l, max_total_cargo_l, towing_braked_kg, towing_unbraked_kg, length_mm, width_mm, height_mm, wheelbase_mm, seats
- Optional supplemental keys: power_kw, torque_nm, gvm_kg, wheel_diameter_in, tyre_size, equipment_dirac_hd_eight_speaker_system
- Holds: ac_kw: Current PDF says AC Type 2 with no numeric kW. Existing 7 kW is historical, not revalidated here.; dc_charge_time_min: Current PDF has DC maxima but no charge time/window. Preserve historical provenance/conditional status; no Oct 10 refresh.; heat_pump: The current sheet has no heat-pump row; original evidence remains conditional. Omission is not explicit unavailability.

### BYD ATTO 3 (outgoing MY25/MY26) Premium FWD

`byd_atto_3_legacy__premium_fwd__2`

Before: outgoing; orders `outgoing`; stock `unverified`; year label “2026 Australian specification”.

- existing-refresh-079: availability → `outgoing`, orders `unverified`, stock `unverified`. Separate manufacturer request-taking, current listing and exact NEW-ad evidence; do not infer delivery or duplicate epochs.
- existing-refresh-080: phone_key: "NFC phone key — tap to unlock" (standard) → "BYD Digital Key and Bluetooth key compatibility" (standard). Current table explicitly supports Bluetooth key compatibility beyond the old NFC-only summary.
- Optional source-only refresh keys: battery_kwh, range_km, zero_to_100_s, dc_peak_kw, kerb_weight_kg, boot_l, max_total_cargo_l, towing_braked_kg, towing_unbraked_kg, length_mm, width_mm, height_mm, wheelbase_mm, seats
- Optional supplemental keys: power_kw, torque_nm, gvm_kg, wheel_diameter_in, tyre_size
- Holds: ac_kw: Current PDF says AC Type 2 with no numeric kW. Existing 7 kW is historical, not revalidated here.; dc_charge_time_min: Current PDF has DC maxima but no charge time/window. Preserve historical provenance/conditional status; no Oct 10 refresh.; heat_pump: The current sheet has no heat-pump row; original evidence remains conditional. Omission is not explicit unavailability.

## Implementation risks

- Fact corrections are not verbatim Fact overlays: applyCorrections forces every non-null after value to status standard and appends a correction note. Proposed conditional configurator-price and warranty facts require a qualified wrapper path or explicit schema support; do not lose conditional status.
- Build and re-read effective catalogue after edits. Existing field overlays can override raw variant changes; feature corrections compare full before value/status/conditions/source_ids.
- Availability corrections compare the old snapshot and set availabilityRevision. Rebind seller-copy record revision after the exact scope is verified; a new availability date alone does not mean new stock.
- New proposal sources named r10_refresh_* do not yet exist in the app. The relevant r10_gzx_* sources already exist; retain their current registration and do not duplicate IDs.
- Full source/date refreshes are optional. Prioritize material corrections and new evidence; applying all 182 source-only rows changes guard source membership/bases even with identical numeric values.
- Formal model-year normalization is a separate data-model choice. Do not equate descriptive Car.year strings, PDF metadata, sale year and exact dealer MY. Any normalization invalidates a model-year guard and may require neutral copy.
- The retained old 60.22 kWh EX5 and Black availability snapshots are not newly verified here. Do not renew their dates from a current ER or core-only page.
- Source locators use physical PDF page numbers, with printed numbers supplied for Geely. BYD EVO/ATTO2 text extraction is corrupted; rendered pages were the authority.
- No application test, build, publication or original Model Y hero/media change is claimed by this research-only task.

## Verified source registry

- `byd_atto2_brochure` → `r10_refresh_byd_atto2_brochure`: https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf
  - SHA-256: `1d0fb1603b170cfbee6314ea15de0d02c081a1b24f3f7aadc6202e33865e2734`; saved byte hash verified
- `byd_atto2_config` → `r10_refresh_byd_atto2_config`: https://bydautomotive.com.au/configurator/byd-atto-2
  - SHA-256: `1fbc40aedc9a8253a1ccd602255e9d51e5bcbfeaf557f575aa9d1746f1fb029a`; saved byte hash verified
- `byd_atto3_brochure` → `r10_refresh_byd_atto3_brochure`: https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3
  - SHA-256: `213ae3c28895a088414354c46448f9959ef9e751363ca6451cd7e391c9b416ab`; saved byte hash verified
- `byd_atto3_config` → `r10_refresh_byd_atto3_config`: https://bydautomotive.com.au/configurator/byd-atto-3
  - SHA-256: `acbbaf1afc5a04279b1738a4f415c3ea47580bd6e576becbe216e7f6f84e4d72`; saved byte hash verified
- `byd_evo_config` → `r10_refresh_byd_evo_config`: https://evdealergroup-byd.com.au/configurator/byd-atto-3-evo
  - SHA-256: `eb34379a64a97a97f93a1db7713b49b754700b5f1bd27a43b06513c90d3c0a38`; saved byte hash verified
- `byd_legacy_brochure` → `r10_refresh_byd_legacy_brochure`: https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf
  - SHA-256: `877815f810511cc5faa412a41c22480190231e51da9b137ac7a9a5a293285968`; saved byte hash verified
- `byd_sealion7_brochure` → `r10_refresh_byd_sealion7_brochure`: https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf
  - SHA-256: `a4f5c7cdfd3491a3d14a3a8c62a96fc0a44c5c577eb4bc62a0c024dd7dbd03c0`; saved byte hash verified
- `byd_sealion7_config` → `r10_refresh_byd_sealion7_config`: https://bydautomotive.com.au/configurator/byd-sealion-7
  - SHA-256: `cae4767bd722f6170db282b79a809f514f75a3eaebd71904d2734c0e32858bba`; saved byte hash verified
- `byd_stock_8096070` → `r10_refresh_byd_stock_8096070`: https://www.booran.com.au/cars/new-2026-byd-atto-2-8096070
  - SHA-256: `5c0f6d95de78197131547d63269ac8f06ef3cab1e60e6ddbe0da593ff362659d`; saved byte hash verified
- `byd_stock_8096139` → `r10_refresh_byd_stock_8096139`: https://www.booran.com.au/cars/new-2026-byd-sealion-7-8096139
  - SHA-256: `d4875f491676105a93a16a28157798d0f2646251fcdaa9ac42f2c4d9eee67f66`; saved byte hash verified
- `byd_stock_8106818` → `r10_refresh_byd_stock_8106818`: https://www.booran.com.au/cars/new-2026-byd-atto-3-8106818
  - SHA-256: `4e9c242217743a6d78bbc3532b673ba44e9f03d61ab8bd7166e71ee6bff8c708`; saved byte hash verified
- `byd_stock_8113029` → `r10_refresh_byd_stock_8113029`: https://www.booran.com.au/cars/new-2026-byd-atto-3-8113029
  - SHA-256: `23b560114c21f0b31b26942b8fb0cd643e8b34303f7ed6827ec08478afe3a970`; saved byte hash verified
- `byd_stock_8114784` → `r10_refresh_byd_stock_8114784`: https://www.booran.com.au/cars/new-2026-byd-atto-2-8114784
  - SHA-256: `1cf4aaaef6d7d99322a8aaac09ed7b5598c2f41dc3997416a9a78adff1aba265`; saved byte hash verified
- `byd_stock_8121102` → `r10_refresh_byd_stock_8121102`: https://www.booran.com.au/cars/new-2026-byd-sealion-7-8121102
  - SHA-256: `1283c1470936138b44de0087e920b628a4af32f7a122a24e401efd39425f0c17`; saved byte hash verified
- `geely_ex5_complete_er_stock2` → `r10_gzx_geely_ex5_complete_er_stock2`: https://www.alto.com.au/stock/details/OAG-AD-26071952/2026-geely-ex5-new
  - SHA-256: `5db9dd4e42a995a49dcc0fa41142bcb274c027781f8c0f130f3c1b6472926a59`; saved byte hash verified
- `geely_ex5_er_brochure` → `r10_gzx_geely_ex5_er_brochure`: https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf
  - SHA-256: `ee52161fca234609a708f1b524410b961c6239664156cd6482b8306c5b67e033`; saved byte hash verified
- `geely_ex5_inspire_er_stock` → `r10_gzx_geely_ex5_inspire_er_stock`: https://www.geelyreynella.com.au/cars/new-silver-2026-geely-ex5-c24702
  - SHA-256: `55bd6d8aca0dc7e473d9459f48f4fe9894ed11f7eaa713c880004c152fc8f1d0`; saved byte hash verified
- `zeekr_7x` → `r10_gzx_zeekr_7x`: https://www.zeekrlife.com/en-au/models/zeekr-7x/
  - SHA-256: `971d6ea4b25a98c09a533c9d1d0facea92d12517efab1732a5f13b9d26ad9db6`; saved byte hash verified
- `zeekr_7x_lr_stock2` → `r10_gzx_zeekr_7x_lr_stock2`: https://www.zeekrcarsspringwood.com.au/cars/new-grey-2026-zeekr-7x-hz2033
  - SHA-256: `aa63bbdeea6a954c0cd6de469ba289abd5d0cc6841ccaa2c2dcad92c90386e02`; saved byte hash verified
- `zeekr_7x_perf_stock2` → `r10_gzx_zeekr_7x_perf_stock2`: https://www.zeekrcarsspringwood.com.au/cars/new-grey-2026-zeekr-7x-hz2097
  - SHA-256: `89d1f5000c8c994386dc3fc640cd7c03f5677b89e89e6e0d11d89e467d0f606b`; saved byte hash verified
- `zeekr_7x_rwd_stock3` → `r10_gzx_zeekr_7x_rwd_stock3`: https://www.zeekrnewcastle.com.au/cars/new-crystal-white-2026-zeekr-7x-n036495
  - SHA-256: `64df2a929403efbe0daddd1e73eddfadd8c2b41aab682492de725f04ba9b0b22`; saved byte hash verified
- `zeekr_warranty_current` → `r10_gzx_zeekr_warranty_current`: https://zcms.zeekrlife.com/published/assets/69db768999ef6f7067b88de5729fc40de340be85193f2813f0cc4d4dcce3eac4/Australian-Warranty-Policy.pdf
  - SHA-256: `69db768999ef6f7067b88de5729fc40de340be85193f2813f0cc4d4dcce3eac4`; saved byte hash verified
