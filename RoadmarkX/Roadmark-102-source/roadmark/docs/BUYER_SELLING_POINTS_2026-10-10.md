# Exact-trim buyer strengths: 21 added Australian configurations

Checked 2026-10-10. Editorial proposals only; no app edits. Each reason is a buyer-use interpretation of verified specification, not a market winner or road-test verdict.

## Integration essentials

- This file is a suggestion, not an instruction to mutate app data.
- Treat strength and tradeoff as independent guarded clauses. Render a clause only when every dependency matches the effective post-correction shared dataset. Compare value, unit, status, basis and qualifications/conditions, not value alone.
- All proposed fact and feature changes must be reviewed/applied to the shared manifest before dependent copy is enabled. Existing unknown equipment rows must not contradict displayed copy.
- If an approved correction alters any dependency, suppress that clause until recomputed/reviewed. Arithmetic comparisons depend on both exact variants.
- Model-year dependencies and requiredVisibleConditions also form display guards. Display requiredVisibleConditions next to the card or in clearly associated visible detail. Conditions essential to a headline are already in that headline.
- Never map hardware evidence to subjective ride_control_subjective or comfort/handling rankings. A new factual key such as second_row_layout is an objective subfact.
- Price contexts are retained for review and not used in lead copy unless explicitly stated. MG offers are driveaway promotions, BYD base amounts are not verified formal MLP, and Kia exact-MY MLP is unresolved.
- Feature criterion screens_hud: only HUD fitment is resolved here. Do not hide or overwrite unrelated established screen facts. For multi-part criteria merge the verified subfact without broadening it.
- For EV9, future-footer-only brochure claims remain quarantined. The copy uses product-page or distinct older Kia-authored MY26 corroboration.

The JSON contains 141 guarded dependencies, 16 suggested factual patches, and 37 exact-criterion feature updates. Every strength and trade-off references exact expected values and dates. Comparisons depend on both variants.

## BYD SEAL Premium RWD
`byd_seal__premium_rwd__20261010`

**Reason: Range and front-seat equipment.** For longer trips, Premium combines 570km claimed WLTP range with heated and ventilated front seats.

**Trade-off: Less acceleration than Performance.** It is RWD and claims 5.9 seconds to 100km/h, versus 3.8 seconds for Performance AWD.

**Required visible context:** Current Australian trim; exact model year is unverified. Confirm the specification of the delivered vehicle. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_byd_seal_brochure](https://bydautomotive.com.au/brochures/BYD-SEAL-2026.pdf), [r10_byd_seal_product](https://bydautomotive.com.au/seal) (checked 10 October 2026)

**Dependency keys:** drive, front_heated_seats, front_ventilated_seats, range_km, zero_to_100_s

## BYD SEAL Performance AWD
`byd_seal__performance_awd__20261010`

**Reason: Acceleration and adjustable damping.** AWD, DiSus-C adaptive damping and a claimed 3.8-second 0–100km/h sprint make this the acceleration-focused SEAL.

**Trade-off: Range trade-off.** Its 520km WLTP claim is 50km below Premium’s 570km.

**Required visible context:** Current Australian trim; exact model year is unverified. Confirm the specification of the delivered vehicle. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_byd_seal_brochure](https://bydautomotive.com.au/brochures/BYD-SEAL-2026.pdf), [r10_byd_seal_product](https://bydautomotive.com.au/seal) (checked 10 October 2026)

**Dependency keys:** adaptive_damping_system, drive, range_km, zero_to_100_s

## BYD DOLPHIN Essential FWD
`byd_dolphin__essential_fwd__20261010`

**Reason: Five-seat daily utility.** For buyers who need five seats, Essential provides a daily-use EV with 340km claimed WLTP range.

**Trade-off: Modest acceleration.** Its manufacturer-claimed 0–100km/h time is 12.3 seconds.

**Required visible context:** Current Australian trim; exact model year is unverified. Confirm the specification of the delivered vehicle. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_byd_dolphin_brochure](https://bydautomotive.com.au/brochures/BYD-DOLPHIN-2025.pdf), [r10_byd_dolphin_product](https://bydautomotive.com.au/dolphin) (checked 10 October 2026)

**Dependency keys:** range_km, seats, zero_to_100_s

**Scope cautions:** Do not substitute product-card NEDC 410km for the brochure WLTP 340km. No independent acceleration or motorway-overtaking assessment is implied.

## BYD DOLPHIN Premium FWD
`byd_dolphin__premium_fwd__20261010`

**Reason: More range and cabin equipment.** Premium pairs 427km claimed WLTP range with heated front seats and a panoramic glass roof.

**Trade-off: Higher configured base amount.** Its configurator base amount is A$7,000 above Essential, before on-road costs; these are not verified formal list prices.

**Required visible context:** Current Australian trim; exact model year is unverified. Confirm the specification of the delivered vehicle. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_byd_dolphin_brochure](https://bydautomotive.com.au/brochures/BYD-DOLPHIN-2025.pdf), [r10_byd_dolphin_configurator](https://bydautomotive.com.au/configurator/byd-dolphin), [r10_byd_dolphin_product](https://bydautomotive.com.au/dolphin) (checked 10 October 2026)

**Dependency keys:** front_heated_seats, glass_roof, price_aud, range_km

**Scope cautions:** Do not substitute product-card NEDC 490km for WLTP 427km. The A$7,000 difference compares the same verified configurator-base basis (A$36,990 minus A$29,990); it is not a final driveaway-price difference or verified formal MLP difference.

## MG4 EV Essence 64 RWD
`mg4_ev_my26__essence_64_rwd__20261010`

**Reason: Range and DC capability.** For longer drives, Essence 64 pairs 452km claimed WLTP range with a published 154kW peak DC input.

**Trade-off: AC charging limit.** AC charging is limited to 6.6kW, even on a higher-powered AC post.

**Required visible context:** Australian MY26 specification. Published peak DC input is not sustained charging speed; actual charging depends on the car, charger and conditions. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_mg_mg4_brochure](https://mgmotor.com.au/brochures/MG4_EV_2026_V2.pdf) (checked 10 October 2026)

**Dependency keys:** ac_kw, dc_peak_kw, range_km

**Scope cautions:** Exact updated MY26 140kW/LFP Essence 64; do not import outgoing 150kW Essence specifications.

## MG4 EV XPOWER AWD
`mg4_ev_my26__xpower_awd__20261010`

**Reason: AWD acceleration.** For acceleration-focused buyers, XPOWER combines AWD and 320kW with a claimed 3.8-second 0–100km/h time.

**Trade-off: Less range than Essence 64.** Its 405km WLTP claim is 47km below Essence 64’s 452km.

**Required visible context:** Australian MY26 specification. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_mg_mg4_brochure](https://mgmotor.com.au/brochures/MG4_EV_2026_V2.pdf), [r10_mg_mg4_product](https://mgmotor.com.au/vehicles/mg4-ev) (checked 10 October 2026)

**Dependency keys:** drive, power_kw, range_km, zero_to_100_s

## MG4 EV Urban Essence 43 FWD
`mg4_ev_urban_my26__essence_43_fwd__20261010`

**Reason: Everyday luggage storage.** Five seats with a quoted 382L main boot plus 98L underfloor give everyday loads separate spaces; the cargo measurement standard is unverified.

**Trade-off: Shorter range than Urban 54.** Its 316km WLTP claim is 89km below Urban Essence 54’s 405km.

**Required visible context:** Australian MY26 specification. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_mg_urban_brochure](https://mgmotor.com.au/brochures/MG4_EV_URBAN_2026.pdf), [r10_mg_urban_product](https://mgmotor.com.au/vehicles/mg4-ev-urban), [r10_mg_westpoint_urban43](https://www.westpointautos.com.au/cars/new-green-2026-mg-mg4-ev-urban-b213515) (checked 10 October 2026)

**Dependency keys:** boot_l, boot_underfloor_l, range_km, seats

**Scope cautions:** FWD Urban is a separate model/platform from the updated RWD/AWD MG4. Never present 480L as main boot alone.

## MG4 EV Urban Essence 54 FWD
`mg4_ev_urban_my26__essence_54_fwd__20261010`

**Reason: Extra range for the Urban.** Essence 54 extends the Urban’s claimed WLTP range to 405km, 89km beyond Essence 43, while retaining five seats.

**Trade-off: Charging-power limits.** Charging input is capped at 87kW DC and 6.6kW AC.

**Required visible context:** Australian MY26 specification. Peak charging ratings are not sustained rates; actual speed depends on charger, temperature and battery state. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_mg_urban_brochure](https://mgmotor.com.au/brochures/MG4_EV_URBAN_2026.pdf), [r10_mg_westpoint_urban43](https://www.westpointautos.com.au/cars/new-green-2026-mg-mg4-ev-urban-b213515), [r10_mg_westpoint_urban54](https://www.westpointautos.com.au/cars/new-white-2026-mg-mg4-ev-urban-b199549) (checked 10 October 2026)

**Dependency keys:** ac_kw, dc_peak_kw, range_km, seats

**Scope cautions:** The 150kW station used in an Urban charging test is not the car’s DC acceptance.

## Hyundai IONIQ 5 84kWh RWD
`hyundai_ioniq_5_my27__84kwh_rwd__20261010`

**Reason: Road-trip range and charging.** For road trips, base RWD combines 570km claimed WLTP range with an approximately 18-minute 10–80% charge on a suitable 350kW charger.

**Trade-off: Fewer everyday comforts.** Front-seat heating, a head-up display and a powered tailgate are not fitted.

**Required visible context:** Australian MY27 specification. The charging claim requires suitable battery and ambient conditions; 350kW is the test charger’s rating, not the vehicle’s verified peak input. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_hyundai_i5_spec](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/docs/MY27_Specification_Sheet_IONIQ5_Electric.pdf) (checked 10 October 2026)

**Dependency keys:** dc_charge_time_min, front_heated_seats, power_tailgate, range_km, screens_hud

## Hyundai IONIQ 5 Elite 84kWh RWD
`hyundai_ioniq_5_my27__elite_84kwh_rwd__20261010`

**Reason: Useful daily equipment.** Elite adds heated front seats, a head-up display and a powered tailgate for day-to-day convenience.

**Trade-off: Price and range trade-off.** It costs A$5,000 more than base RWD before on-road costs, while its WLTP range falls 40km to 530km.

**Required visible context:** Australian MY27 specification. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_hyundai_i5_spec](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/docs/MY27_Specification_Sheet_IONIQ5_Electric.pdf), [r10_hyundai_price_1e3cb636_286a_4e71_876e_d1ae9ac0c536](https://www.hyundai.com/content/api/au/hyundai/v3/variantpricecalculator?variantId=1E3CB636-286A-4E71-876E-D1AE9AC0C536&optionCost=0&postcode=2000), [r10_hyundai_price_ffb98d6f_65f1_44a2_ace7_f33005a9de92](https://www.hyundai.com/content/api/au/hyundai/v3/variantpricecalculator?variantId=FFB98D6F-65F1-44A2-ACE7-F33005A9DE92&optionCost=0&postcode=2000) (checked 10 October 2026)

**Dependency keys:** front_heated_seats, power_tailgate, price_aud, range_km, screens_hud

## Hyundai IONIQ 5 Premium N Line 84kWh AWD
`hyundai_ioniq_5_my27__premium_n_line_84kwh_awd__20261010`

**Reason: AWD with seat-climate equipment.** Premium N Line combines AWD with ventilated front seats and heated outer rear seats for buyers prioritising that equipment.

**Trade-off: Range trade-off.** Its 495km WLTP claim is 35km below Elite RWD’s 530km.

**Required visible context:** Australian MY27 specification. Premium N Line is the regular-range AWD grade, distinct from the IONIQ 5 N performance model. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_hyundai_i5_spec](https://www.hyundai.com/content/dam/hyundai/au/en/models/ioniq5/docs/MY27_Specification_Sheet_IONIQ5_Electric.pdf) (checked 10 October 2026)

**Dependency keys:** drive, front_ventilated_seats, range_km, rear_heated_seats

## BYD ATTO 1 Essential FWD
`byd_atto_1__essential_fwd__20261010`

**Reason: Compact daily runabout.** A compact four-seat runabout: 3,990mm long, with 11kW AC capability for a compatible home or workplace supply.

**Trade-off: Range and rapid-charging limits.** It claims 220km WLTP range and accepts up to 65kW DC.

**Required visible context:** Current Australian trim; exact model year is unverified. Confirm the specification of the delivered vehicle. Dimensions and charging equipment follow the currently linked AU brochure, whose metadata says MY25; confirm the delivered build. AC supply and charger must support the vehicle’s rating. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_atto1_atto1_brochure](https://bydautomotive.com.au/brochures/BYD-ATTO-1-2025.pdf), [r10_atto1_atto1_handbook](https://bydautomotive.com.au/brochures/BYD-ATTO-1-Owners-Handbook-2025.pdf), [r10_atto1_atto1_product](https://bydautomotive.com.au/atto-1), [r10_atto1_atto1_showcase](https://bydautomotive.com.au/byd-showcase) (checked 10 October 2026)

**Dependency keys:** ac_kw, dc_peak_kw, length_mm, range_km, seats

**Optional, time-limited offer text:** A$19,990 promotional driveaway for eligible ATTO 1 Essential retail orders placed 15 September–15 December 2026 and delivered by 31 December. Optional/metallic paint costs extra; demonstrators and additional-discount transactions are excluded. Allocation and delivery by the deadline are not guaranteed.

## BYD ATTO 1 Premium FWD
`byd_atto_1__premium_fwd__20261010`

**Reason: Extra range and parking equipment.** Premium adds 90km claimed WLTP range; its current AU brochure also lists a 360-degree camera and heated front seats. Confirm build equipment.

**Trade-off: Still four seats.** It still seats four, the same as Essential.

**Required visible context:** Current Australian trim; exact model year is unverified. Confirm the specification of the delivered vehicle. The linked equipment brochure has MY25 metadata; current order-trim model year is unverified. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_atto1_atto1_brochure](https://bydautomotive.com.au/brochures/BYD-ATTO-1-2025.pdf), [r10_atto1_atto1_handbook](https://bydautomotive.com.au/brochures/BYD-ATTO-1-Owners-Handbook-2025.pdf), [r10_atto1_atto1_product](https://bydautomotive.com.au/atto-1) (checked 10 October 2026)

**Dependency keys:** front_heated_seats, parking_cameras, range_km, seats

## Kia EV6 Air RWD
`kia_ev6_my27__air_rwd__20261010`

**Reason: Range-led EV6.** For longer journeys, Air combines 582km claimed WLTP range with an approximately 18-minute 10–80% charge in Kia’s 350kW-charger test.

**Trade-off: Fewer convenience features.** Front-seat heating and a powered tailgate are not fitted.

**Required visible context:** Australian MY27 specification. Charging time is an approximate Kia HQ test; battery, temperature and charger conditions matter. The 350kW station rating is not vehicle peak acceptance. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_kia_ev6_page](https://www.kia.com/au/cars/ev6/features.html), [r10_kia_ev6_spec](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev6/kia-ev6-brochure.pdf) (checked 10 October 2026)

**Dependency keys:** dc_charge_time_min, front_heated_seats, power_tailgate, range_km

## Kia EV6 GT-Line RWD
`kia_ev6_my27__gt_line_rwd__20261010`

**Reason: Seat comfort and range.** GT-Line RWD provides ventilated front seats and a tilt-and-slide sunroof alongside 560km claimed WLTP range.

**Trade-off: Range trade-off versus Air.** Its WLTP range is 22km below Air’s 582km.

**Required visible context:** Australian MY27 specification. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_kia_ev6_page](https://www.kia.com/au/cars/ev6/features.html), [r10_kia_ev6_spec](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev6/kia-ev6-brochure.pdf) (checked 10 October 2026)

**Dependency keys:** front_ventilated_seats, glass_roof, range_km

## Kia EV6 GT-Line AWD
`kia_ev6_my27__gt_line_awd__20261010`

**Reason: AWD with GT-Line equipment.** The AWD GT-Line combines 239kW dual-motor power with ventilated front seats.

**Trade-off: Less range than GT-Line RWD.** Its 522km WLTP claim is 38km below the RWD GT-Line’s 560km.

**Required visible context:** Australian MY27 specification. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_kia_ev6_page](https://www.kia.com/au/cars/ev6/features.html), [r10_kia_ev6_spec](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev6/kia-ev6-brochure.pdf) (checked 10 October 2026)

**Dependency keys:** drive, front_ventilated_seats, motor_count, power_kw, range_km

**Scope cautions:** No exact MY27 new-stock advertisement was verified in the supplied bounded check. Do not infer immediate availability or absence of all stock.

## Kia EV6 GT AWD
`kia_ev6_my27__gt_awd__20261010`

**Reason: Dedicated performance hardware.** GT combines an electronic limited-slip differential and electronically controlled suspension, with a claimed 3.5-second 0–100km/h time using Launch Control.

**Trade-off: Range cost of the GT choice.** Its 450km WLTP claim is 72km below GT-Line AWD’s 522km.

**Required visible context:** Australian MY27 specification. WLTP combined is a laboratory claim; real-world range varies.

**Sources:** [r10_kia_ev6_page](https://www.kia.com/au/cars/ev6/features.html), [r10_kia_ev6_spec](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev6/kia-ev6-brochure.pdf) (checked 10 October 2026)

**Dependency keys:** e_lsd, electronic_controlled_suspension, range_km, zero_to_100_s

**Scope cautions:** GT and GT-Line are distinct grades. Do not turn the 478kW brochure value into a continuous-power claim. No exact MY27 GT new-stock advert was verified.

## Kia EV9 Air RWD
`kia_ev9_my26__air_rwd__20261010`

**Reason: Seven-seat practicality.** For seven-person trips, Air provides seven seats and a separately quoted 90L front storage compartment.

**Trade-off: Towing limit.** Its braked towing limit is 900kg, subject to towbar, vehicle-loading and applicable legal limits.

**Required visible context:** Australian MY26 specification. Front storage is a manufacturer-quoted volume; its measurement standard is not stated. Towing ratings do not establish payload available at maximum tow.

**Sources:** [r10_kia_ev9_page](https://www.kia.com/au/cars/ev9/features.html), [r10_kia_ev9_spec_older_my26](https://resource.digitaldealer.com.au/pdf/8188801186877485f5628f775645458.pdf), [r10_kia_stock_ev9_air_my26_mornington](https://www.morningtonkia.com.au/cars/new-snow-white-pearl-2026-kia-ev9-k084845) (checked 10 October 2026)

**Dependency keys:** frunk_l, seats, towing_braked_kg

**Scope cautions:** Rear cargo VDA method must not be applied to front storage. Air towing is corroborated in the separate older Kia-authored MY26 brochure.

## Kia EV9 Earth AWD
`kia_ev9_my26__earth_awd__20261010`

**Reason: Seven seats and towing.** Earth pairs seven seats and AWD with a 2,500kg braked towing rating, subject to towbar, vehicle-loading and applicable legal limits.

**Trade-off: Second-row equipment gap.** Second-row seat heating and ventilation are not fitted.

**Required visible context:** Australian MY26 specification. Towing capacity does not establish available payload or passenger/luggage allowance at maximum tow; check the loaded combination.

**Sources:** [r10_kia_ev9_page](https://www.kia.com/au/cars/ev9/features.html), [r10_kia_ev9_spec_older_my26](https://resource.digitaldealer.com.au/pdf/8188801186877485f5628f775645458.pdf), [r10_kia_stock_ev9_earth_my26_keystar](https://www.kia.keystar.com.au/cars/new-black-2026-kia-ev9-ki6084887), [r10_kia_stock_ev9_earth_my26_melville](https://www.melvillekia.com.au/new-cars/for-sale/kia/ev9/2026/earth/mv-my26-awd/4040159/) (checked 10 October 2026)

**Dependency keys:** drive, rear_heated_seats, rear_ventilated_seats, seats, towing_braked_kg

**Scope cautions:** Earth acceleration and mass are conflicted in the supplied evidence and are not used. Braked towing is independently corroborated; towball value is not included.

## Kia EV9 GT-Line AWD
`kia_ev9_my26__gt_line_awd__20261010`

**Reason: Second-row climate comfort.** GT-Line keeps seven seats while adding heating and ventilation for the outer second-row passengers.

**Trade-off: Bench rather than captain chairs.** Its second row is a three-seat bench; the separate captain-chair layout belongs to the six-seat GT.

**Required visible context:** Australian MY26 specification.

**Sources:** [r10_kia_ev9_page](https://www.kia.com/au/cars/ev9/features.html), [r10_kia_ev9_spec](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev9/kia-ev9-brochure.pdf), [r10_kia_ev9_spec_older_my26](https://resource.digitaldealer.com.au/pdf/8188801186877485f5628f775645458.pdf), [r10_kia_stock_ev9_gt_my26_melville](https://www.melvillekia.com.au/new-cars/for-sale/kia/ev9/2026/gt/mv-my26-awd/4062094/), [r10_kia_stock_ev9_gtline_my26_melville](https://www.melvillekia.com.au/new-cars/for-sale/kia/ev9/2026/gt-line/mv-my26-awd/4047041/) (checked 10 October 2026)

**Dependency keys:** rear_heated_seats, rear_ventilated_seats, seats, second_row_layout

**Scope cautions:** Live manufacturer page independently verifies outer second-row heating/ventilation. No claim that these features make it the most comfortable EV.

## Kia EV9 GT AWD
`kia_ev9_my26__gt_awd__20261010`

**Reason: Captain-chair layout.** For buyers prioritising the second row, GT provides two captain chairs with relaxation and massage in a six-seat layout.

**Trade-off: One fewer passenger place.** It cannot carry seven people; GT-Line has seven seats.

**Required visible context:** Australian MY26 specification.

**Sources:** [r10_kia_ev9_page](https://www.kia.com/au/cars/ev9/features.html), [r10_kia_ev9_spec_older_my26](https://resource.digitaldealer.com.au/pdf/8188801186877485f5628f775645458.pdf), [r10_kia_stock_ev9_gt_my26_melville](https://www.melvillekia.com.au/new-cars/for-sale/kia/ev9/2026/gt/mv-my26-awd/4062094/), [r10_kia_stock_ev9_gtline_my26_melville](https://www.melvillekia.com.au/new-cars/for-sale/kia/ev9/2026/gt-line/mv-my26-awd/4047041/) (checked 10 October 2026)

**Dependency keys:** seats, second_row_layout

**Scope cautions:** Use the live product-page corroboration. Do not use uncorroborated GT towing, acceleration, power or cargo figures from the future-dated brochure.

## Price and measurement handling

- BYD SEAL/DOLPHIN/ATTO 1 configurator base amounts are not treated as verified formal manufacturer list prices. On-road costs are separate; model year remains unverified.
- MG October driveaway offers require eligible sale and delivery 1–31 October 2026, participating dealer and stock availability. Urban amounts already include A$2,000 cashback. Options and buyer exclusions apply. The optional A$500 MG4 benefit has not been subtracted. Full supplied terms remain in each JSON price context.
- IONIQ 5 MLP is before on-road costs; postcode-2000 promotional driveaway amounts are distinct and not universal quotes.
- Kia official grade-specific RRP/NSW driveaway estimates have unverified model-year applicability; no exact-MY MLP or national promotion is claimed.
- WLTP claims remain laboratory combined-cycle figures. Peak charging power is distinct from average charging speed. A 350kW test station does not establish 350kW vehicle acceptance.
- Cargo measurements retain their source basis. Urban 98L underfloor is separate from its 382L main boot; the combined 480L figure is not a main-boot comparison. EV9 front storage is not labelled VDA.
- Towing limits require a compliant loaded combination and suitable equipment; maximum towing does not prove payload available for all seats or luggage.

## Suggested patches and verification

The JSON suggestedFactPatches and suggestedFeatureUpdates provide full exact-trim scopes, source IDs, dates, locators, status and qualifications. They are proposals for main-manifest review. Null or absent equipment must stay unknown until the relevant proposal is adopted.

Feature evidence resolves only the hardware named. It does not establish automatic seat-climate logic, subjective comfort, safer handling, screen completeness, factory order acceptance, or stock in physical possession.

Validated: 21/21 exact IDs; 141 dependencies; all source IDs in the supplied registry; arithmetic differences checked; no existing factual key overwritten; no app edits.
