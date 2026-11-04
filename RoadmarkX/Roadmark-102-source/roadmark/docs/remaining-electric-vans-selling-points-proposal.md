# Remaining electric vans: buyer-copy proposal

Research snapshot: 2026-10-10. Six current/current-listed Renault/Peugeot configurations, 12 clauses. One Ford Transit City pre-delivery summary is separate.

**Status: six proposals are bound to the actual effective catalogue and passed the unchanged shared reader; publication pending.** No application files were edited by this worker. Transit City remains audit-only/pre-delivery.

The wording is a buyer-use interpretation of published manufacturer evidence. It makes no market-leading, road-tested or available-now claim. Whole-vehicle ranking remains ineligible.

## Renault Kangoo E-Tech SWB EV45 90 kW

Research ID: `renault-kangoo-etech-swb-ev45-current-family`. Formal MY: unknown. Epoch: AU April 2026 currently linked technical/brochure epoch; formal MY unconfirmed.

**Strength — Shorter footprint with 22 kW AC**
The SWB pairs a 4,488 mm body and 11.31 m kerb-to-kerb turning circle with standard 22 kW AC capability, useful if your work involves tight sites and compatible depot charging.

**Trade-off — Less cargo allowance than LWB**
Its published 3.3 m³ load volume and 523 kg maximum payload are below the LWB’s 4.2 m³ and 668 kg. Account for occupants and fit-out before choosing the shorter van.

Required accompanying conditions:
- Formal MY is unknown. Use the April 2026 Australian technical epoch; MY26 in the brochure filename alone is insufficient. The MY24/MY25 SWB NEW ads are separate older-MY records with unverified equivalence.
- Visible p8 exact E-Tech columns control: SWB 3.3 m³/523 kg and LWB 4.2 m³/668 kg; both 1,830 mm high and 1,859 mm body-wide. Ignore invisible obsolete PDF text, including 600/800 kg payload, and do not substitute generic drawing dimensions.
- Kangoo payload uses the published standard-vehicle maximum: SWB 2,230 kg GVM and 1,707 kg kerb; LWB 2,490 kg GVM and 1,822 kg kerb.
- The 45 kWh battery is explicitly usable. Standard 22 kW AC and 80 kW DC are vehicle maxima, not sustained rates; compatible charging equipment and supply are required.
- Kangoo charge times recover distance, not a stated SOC window. The 170 km/27 min versus 170 km/30 min conflict stays unresolved; no 10–80%/0–100% conversion or charging-speed winner.
- Comfort Pack assistance and Visibility Pack LEDs remain optional. The optional smart mirror is affected by build-related shortages; verify fitment. Never assume it is standard.
- Manufacturer evidence describes a published Australian configuration, not a road test, fully-laden range guarantee, physical inventory check or accepted factory order.
- Commercial cargo volumes remain in m³ with the source measurement method and arrangement; they are not passenger boot litres. Confirm critical cargo dimensions on the delivered van.
- Published payload includes the allowance consumed by occupants, accessories, fit-out and any towball load. Verify the individual vehicle and applicable axle/GVM/GCM limits; maximum cargo and towing are not promised simultaneously.

Claim dependencies:
- strength: `fact:renault-kangoo-etech-swb-ev45-current-family:specifications.length_mm`, `fact:renault-kangoo-etech-swb-ev45-current-family:specifications.turning_circle_m`, `fact:renault-kangoo-etech-swb-ev45-current-family:specifications.ac_max_kw`
- tradeoff: `fact:renault-kangoo-etech-swb-ev45-current-family:specifications.cargo_volume_m3`, `fact:renault-kangoo-etech-swb-ev45-current-family:specifications.payload_kg`, `fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.cargo_volume_m3`, `fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.payload_kg`

Identity dependency: `identity:renault-kangoo-etech-swb-ev45-current-family`. The JSON also binds all visible qualifications and conflict holds.

## Renault Kangoo E-Tech LWB EV45 90 kW

Research ID: `renault-kangoo-etech-lwb-ev45-current-family`. Formal MY: unknown. Epoch: AU April 2026 currently linked technical/brochure epoch; formal MY unconfirmed.

**Strength — More room for longer loads**
The LWB offers a published 4.2 m³ load volume, 2,230 mm cargo-bay length and 668 kg maximum payload, versus the SWB’s 3.3 m³, 1,806 mm and 523 kg. It is the stronger fit within this pair when load space matters more than footprint.

**Trade-off — More space needed to manoeuvre**
The LWB is 4,910 mm long with an 11.75 m kerb-to-kerb turning circle, versus 4,488 mm and 11.31 m for the SWB. Check parking bays and regular loading sites against the longer body.

Required accompanying conditions:
- Formal MY is unknown. Use the April 2026 Australian technical epoch; MY26 in the brochure filename alone is insufficient. The MY24/MY25 SWB NEW ads are separate older-MY records with unverified equivalence.
- Visible p8 exact E-Tech columns control: SWB 3.3 m³/523 kg and LWB 4.2 m³/668 kg; both 1,830 mm high and 1,859 mm body-wide. Ignore invisible obsolete PDF text, including 600/800 kg payload, and do not substitute generic drawing dimensions.
- Kangoo payload uses the published standard-vehicle maximum: SWB 2,230 kg GVM and 1,707 kg kerb; LWB 2,490 kg GVM and 1,822 kg kerb.
- The 45 kWh battery is explicitly usable. Standard 22 kW AC and 80 kW DC are vehicle maxima, not sustained rates; compatible charging equipment and supply are required.
- Kangoo charge times recover distance, not a stated SOC window. The 170 km/27 min versus 170 km/30 min conflict stays unresolved; no 10–80%/0–100% conversion or charging-speed winner.
- Comfort Pack assistance and Visibility Pack LEDs remain optional. The optional smart mirror is affected by build-related shortages; verify fitment. Never assume it is standard.
- Manufacturer evidence describes a published Australian configuration, not a road test, fully-laden range guarantee, physical inventory check or accepted factory order.
- Commercial cargo volumes remain in m³ with the source measurement method and arrangement; they are not passenger boot litres. Confirm critical cargo dimensions on the delivered van.
- Published payload includes the allowance consumed by occupants, accessories, fit-out and any towball load. Verify the individual vehicle and applicable axle/GVM/GCM limits; maximum cargo and towing are not promised simultaneously.

Claim dependencies:
- strength: `fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.cargo_volume_m3`, `fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.cargo_length_mm`, `fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.payload_kg`, `fact:renault-kangoo-etech-swb-ev45-current-family:specifications.cargo_volume_m3`, `fact:renault-kangoo-etech-swb-ev45-current-family:specifications.cargo_length_mm`, `fact:renault-kangoo-etech-swb-ev45-current-family:specifications.payload_kg`
- tradeoff: `fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.length_mm`, `fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.turning_circle_m`, `fact:renault-kangoo-etech-swb-ev45-current-family:specifications.length_mm`, `fact:renault-kangoo-etech-swb-ev45-current-family:specifications.turning_circle_m`

Identity dependency: `identity:renault-kangoo-etech-lwb-ev45-current-family`. The JSON also binds all visible qualifications and conflict holds.

## Renault Master E-Tech MY26 EV87 MWB L2H2

Research ID: `renault-master-etech-mwb-l2h2-ev87-my26`. Formal MY: MY26. Epoch: AU MY26; May 2026 technical sheet and 16 June 2026 launch; arrival unverified.

**Strength — Cargo capacity with standard V2L**
The MY26 L2H2 lists 10.8 m³ of cargo space and a 1,164 kg payload allowance, with V2L on its standard 11 kW AC configuration. That combination is worth checking for a load-carrying van that can also supply external electrical equipment, subject to its unverified V2L output and adapter requirements.

**Trade-off — 22 kW AC removes V2L**
Choosing the optional 22 kW AC charger removes V2L. Decide whether higher AC input capability or external power matters more, and confirm the exact build before ordering.

Required accompanying conditions:
- MY26 is confirmed for the Australian EV87 L2H2 and L3H2 bodies. H2 standard-roof and mid-roof are synonymous here: both are 2,498 mm high. No electric L3H3 or diesel 1,973 kg payload.
- Master remains announced/current-listed: H2-2026 arrival was forecast; actual arrival, physical stock and accepted orders are unverified.
- The standard 11 kW AC configuration has V2L; selecting optional 22 kW AC removes V2L. V2L output/adapter, option price and exact build eligibility remain unknown.
- Optional front/side parking sensors remove blind-spot warning. Do not combine these into one standard feature list.
- Master payload follows 3,500 kg GVM minus published unladen mass: MWB 2,336/1,164 kg, LWB 2,416/1,084 kg. Separately labelled tare is 2,344/2,424 kg; preserve these labels despite the anomaly.
- The 87 kWh battery basis is unspecified. The 409 km WLTP combined figure is a manufacturer laboratory claim with test load unknown.
- Master has 130 kW DC and a 38-minute 15–80% claim. AC claims are also 15–80%: 5h52 at 11 kW and 30h06 at 2.1 kW. No 10–80% or 0–100% substitution.
- Manufacturer evidence describes a published Australian configuration, not a road test, fully-laden range guarantee, physical inventory check or accepted factory order.
- Commercial cargo volumes remain in m³ with the source measurement method and arrangement; they are not passenger boot litres. Confirm critical cargo dimensions on the delivered van.
- Published payload includes the allowance consumed by occupants, accessories, fit-out and any towball load. Verify the individual vehicle and applicable axle/GVM/GCM limits; maximum cargo and towing are not promised simultaneously.

Claim dependencies:
- strength: `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.cargo_volume_m3`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.payload_kg`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.v2l_standard`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.ac_max_kw`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.v2l_power_kw`
- tradeoff: `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.optional_ac_max_kw`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.v2l_standard`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.ac_max_kw`

Identity dependency: `identity:renault-master-etech-mwb-l2h2-ev87-my26`. The JSON also binds all visible qualifications and conflict holds.

## Renault Master E-Tech MY26 EV87 LWB L3H2

Research ID: `renault-master-etech-lwb-l3h2-ev87-my26`. Formal MY: MY26. Epoch: AU MY26; May 2026 technical sheet and 16 June 2026 launch; arrival unverified.

**Strength — Longer cargo bay in the same H2 roof**
The MY26 L3H2 has a published 13 m³ cargo volume and 3,857 mm cargo-bay length, versus 10.8 m³ and 3,225 mm for L2H2. Both have the same 2,498 mm overall H2 height, making the LWB the space-led choice within this pair.

**Trade-off — Bigger footprint, lower payload**
The LWB is 6,315 mm long with a 14.9 m kerb-to-kerb turning circle, versus the MWB’s 5,685 mm and 12.8 m. Its published payload is also lower: 1,084 kg versus 1,164 kg, before occupants and fit-out use the allowance.

Required accompanying conditions:
- MY26 is confirmed for the Australian EV87 L2H2 and L3H2 bodies. H2 standard-roof and mid-roof are synonymous here: both are 2,498 mm high. No electric L3H3 or diesel 1,973 kg payload.
- Master remains announced/current-listed: H2-2026 arrival was forecast; actual arrival, physical stock and accepted orders are unverified.
- The standard 11 kW AC configuration has V2L; selecting optional 22 kW AC removes V2L. V2L output/adapter, option price and exact build eligibility remain unknown.
- Optional front/side parking sensors remove blind-spot warning. Do not combine these into one standard feature list.
- Master payload follows 3,500 kg GVM minus published unladen mass: MWB 2,336/1,164 kg, LWB 2,416/1,084 kg. Separately labelled tare is 2,344/2,424 kg; preserve these labels despite the anomaly.
- The 87 kWh battery basis is unspecified. The 409 km WLTP combined figure is a manufacturer laboratory claim with test load unknown.
- Master has 130 kW DC and a 38-minute 15–80% claim. AC claims are also 15–80%: 5h52 at 11 kW and 30h06 at 2.1 kW. No 10–80% or 0–100% substitution.
- Manufacturer evidence describes a published Australian configuration, not a road test, fully-laden range guarantee, physical inventory check or accepted factory order.
- Commercial cargo volumes remain in m³ with the source measurement method and arrangement; they are not passenger boot litres. Confirm critical cargo dimensions on the delivered van.
- Published payload includes the allowance consumed by occupants, accessories, fit-out and any towball load. Verify the individual vehicle and applicable axle/GVM/GCM limits; maximum cargo and towing are not promised simultaneously.

Claim dependencies:
- strength: `fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.cargo_volume_m3`, `fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.cargo_length_mm`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.cargo_volume_m3`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.cargo_length_mm`, `fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.height_mm`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.height_mm`
- tradeoff: `fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.length_mm`, `fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.turning_circle_m`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.length_mm`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.turning_circle_m`, `fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.payload_kg`, `fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.payload_kg`

Identity dependency: `identity:renault-master-etech-lwb-l3h2-ev87-my26`. The JSON also binds all visible qualifications and conflict holds.

## Peugeot E-Partner Pro Long Auto, current page configuration

Research ID: `peugeot-e-partner-current-pro-long`. Formal MY: unknown. Epoch: AU current new/facelift page and sole configurator configuration; formal MY unconfirmed.

**Strength — Cameras and access for delivery work**
The current E-Partner page/configurator lists a digital rear-view mirror, lateral side view and dual sliding doors. Those are useful features to check for visibility around the van and access to loads from either side.

**Trade-off — Payload needs confirmation before fit-out**
The current published payload claims conflict, so there is no verified current payload figure to plan a fit-out around. Confirm the exact vehicle’s model year, seating and weight limits before committing to a load-carrying setup.

Required accompanying conditions:
- This is the current new/facelift page/configurator configuration with formal MY unresolved. The indexed MY23 technical sheet and two-seat MY24 NEW ads are different epochs; the MY26 Partner PDF is petrol-only.
- The manufacturer says available to order only; that invitation does not verify acceptance, allocation or physical stock.
- Current payload stays unknown because 717 and 780 kg conflict. Do not substitute dated MY23 753 kg; current seats, driven axle, wheelbase, AC capability/time and mass remain unverified.
- The specifically listed 3.9 m³ is nominal load volume with method/arrangement unknown. Unmapped 4.4/4.3 m³ claims do not establish an extended/max volume or load-through arrangement.
- The 50 kWh capacity has no established usable/gross split. The current 258 km WLTP combined claim is laboratory-based, with test payload unknown.
- The 30-minute claim is 0–80% at a 100 kW test charger. Vehicle DC peak and 10–80% time remain unknown; do not convert windows or equate charger rating with vehicle maximum.
- Current body width excluding mirrors is unknown; the old 1,921 mm mirrors-folded figure does not fill it. Current-facelift battery-warranty applicability and an AU van retention threshold are unverified.
- Manufacturer evidence describes a published Australian configuration, not a road test, fully-laden range guarantee, physical inventory check or accepted factory order.
- Commercial cargo volumes remain in m³ with the source measurement method and arrangement; they are not passenger boot litres. Confirm critical cargo dimensions on the delivered van.
- Published payload includes the allowance consumed by occupants, accessories, fit-out and any towball load. Verify the individual vehicle and applicable axle/GVM/GCM limits; maximum cargo and towing are not promised simultaneously.

Claim dependencies:
- strength: `equipment:peugeot-e-partner-current-pro-long:equipment.digital_rear_view_mirror`, `equipment:peugeot-e-partner-current-pro-long:equipment.lateral_side_camera`, `equipment:peugeot-e-partner-current-pro-long:equipment.dual_sliding_doors`
- tradeoff: `fact:peugeot-e-partner-current-pro-long:specifications.payload_kg`, `fact:peugeot-e-partner-current-pro-long:specifications.formal_model_year`

Identity dependency: `identity:peugeot-e-partner-current-pro-long`. The JSON also binds all visible qualifications and conflict holds.

## Peugeot E-Expert MY24 Pro Long Auto

Research ID: `peugeot-e-expert-my24-pro-long`. Formal MY: MY24. Epoch: AU MY24-labelled sheet issued November 2025, currently linked; unresolved live-page conflicts.

**Strength — Load-through length for awkward items**
The MY24 sheet lists a 2,780 mm load length behind the bulkhead, extending to 4,024 mm through its open flap, plus a 1,001 kg published payload. That makes it worth considering for long, narrow items, after checking their shape and the remaining load allowance.

**Trade-off — Route and depot timing need verification**
Conflicting manufacturer range-cycle and AC-time claims make range and overnight-charge planning uncertain. Get figures matched to the exact vehicle and charger before deciding whether it covers your daily route.

Required accompanying conditions:
- The linked sheet is MY24, issued November 2025. Formal MY for each of the four exact NEW ads remains unstated; body/battery matching alone does not prove current technical/equipment equivalence.
- E-Expert normalized range and cycle stay unknown: the current sheet/configurator use NEDC while the live page uses WLTP. Keep the raw claims separate and exclude this record from WLTP range comparisons.
- Normalized AC charging time remains unknown: 7h30 0–100% at 11 kW on the sheet/page conflicts with 11h9 in the configurator, which omits its SOC window. The visible 7.4 kW/23-hour claim remains raw and excluded from charging comparisons.
- The nominal load volume is 6.1 m³ with method/arrangement unspecified. The sheet literally labels 6.6 m³ excluding load through bulkhead; do not relabel it including, or normalize an extended/max volume.
- Published payload is 1,001 kg, the difference between 3,053 kg GVM and 2,052 kg tare. Tare follows the sheet’s generic definition; individual vehicle weighing is required.
- The 75 kWh battery has no established usable/gross split. The 45-minute DC claim is 0–80% at a 100 kW test charger; vehicle peak and 10–80% time are unknown.
- The 1,920 mm width is mirrors folded, not body-only. Van battery cover is 8 years/160,000 km; no AU van retention threshold is verified. PHEV-only and foreign 70% clauses do not apply.
- Manufacturer evidence describes a published Australian configuration, not a road test, fully-laden range guarantee, physical inventory check or accepted factory order.
- Commercial cargo volumes remain in m³ with the source measurement method and arrangement; they are not passenger boot litres. Confirm critical cargo dimensions on the delivered van.
- Published payload includes the allowance consumed by occupants, accessories, fit-out and any towball load. Verify the individual vehicle and applicable axle/GVM/GCM limits; maximum cargo and towing are not promised simultaneously.

Claim dependencies:
- strength: `fact:peugeot-e-expert-my24-pro-long:specifications.cargo_length_bulkhead_mm`, `fact:peugeot-e-expert-my24-pro-long:specifications.cargo_length_through_flap_mm`, `fact:peugeot-e-expert-my24-pro-long:specifications.payload_kg`, `equipment:peugeot-e-expert-my24-pro-long:equipment.bulkhead`
- tradeoff: `fact:peugeot-e-expert-my24-pro-long:specifications.range_km`, `fact:peugeot-e-expert-my24-pro-long:specifications.range_cycle`, `fact:peugeot-e-expert-my24-pro-long:specifications.ac_charge_minutes`, `fact:peugeot-e-expert-my24-pro-long:specifications.ac_charge_window`

Identity dependency: `identity:peugeot-e-expert-my24-pro-long`. The JSON also binds all visible qualifications and conflict holds.

## Separate pre-delivery detail: Ford Transit City MY27 SWB FWD

Pre-delivery: the Australian MY27 Transit City SWB FWD lists 5.75 m³ VDA cargo volume with the bulkhead and a 1,085 kg published payload allowance. Ford expected first customer deliveries in November 2026; this is an announced configuration to consider for a later purchase, with no verified physical NEW stock or accepted allocation.

- Keep this record outside the six current/current-listed Renault/Peugeot details and outside available-now recommendations. November 2026 is an expected start, not observed delivery.
- AU identity is one SWB/FWD/three-seat panel van; no European L2H2 or chassis-cab import.
- 6.4 m³ maximum loose-material volume and 5.75 m³ VDA are different measurement methods, both with bulkhead; never interchange them.
- 1,085 kg payload is GVM minus standard kerb, and includes occupants, cargo, accessories and structures; actual allowance and axle/GVM/GCM limits require checking.
- 56 kWh is usable LFP. The 87 kW DC rating and approximate 33-minute 10–80% claim are distinct from AC 10–100% times at 7.4/11 kW stations; explicit onboard AC maximum remains unknown.
- Phone connection mode stays unknown because the brochure/release say wireless and the live page says USB.
- The $50,000 figure is recommended driveaway, not MLP. The Evie voucher end date does not establish the base-price expiry.

## Integration and preservation rules

- All six current/current-listed proposals passed effective-catalogue and actual shared-reader checks; publication remains pending.
- The six exact research IDs are now bound to verified application variant IDs and canonical fields; older/unstated stock MY remains separate.
- The JSON includes the verified effective-reader guards, exact fact/source snapshots, audit-only holds and original research dependencies.
- Fail closed on missing/mismatched values, source IDs, body/epoch/model year, optional status, null hold or lost mandatory qualification.
- Retain dated source metadata. Packaging or rebuilding does not advance verification dates.
- Do not make data edits solely to make a narrative guard pass.
- Only source-compatible individual commercial fields may be compared; whole-record eligibility remains false.
- Source-less nulls live in auditOnlyDependencies and explicitNullFields; they are not executable sourced claims. Preserve the unknown state and review it after import.

### Exact NEW advertisements stay separate

All eight are exact NEW advertisements, not verified physical stock, accepted factory orders or current technical-epoch equivalents. Older MY and unstated MY remain as published.

- Kangoo E-Tech T34068A: formal MY MY25; AUD 62,990 dealer_advertised_driveaway. Source `renault_peter_swb_34068`. Current-epoch equivalence unverified.
- Kangoo E-Tech T22763: formal MY MY24; AUD 45,990 dealer_advertised_driveaway. Source `renault_adrian_swb_22763`. Current-epoch equivalence unverified.
- e-Partner PE905999F: formal MY MY24; AUD 66,686 dealer_advertised_driveaway. Source `stock_0`. Current-epoch equivalence unverified.
- e-Partner PE907870F: formal MY MY24; AUD 66,686 dealer_advertised_driveaway. Source `stock_1`. Current-epoch equivalence unverified.
- E-Expert PE018750F: formal MY unstated; AUD 56,990 dealer_advertised_driveaway. Source `stock_4`. Current-epoch equivalence unverified.
- E-Expert PE054918F: formal MY unstated; AUD 56,990 dealer_advertised_driveaway. Source `stock_5`. Current-epoch equivalence unverified.
- E-Expert PE042213F: formal MY unstated; AUD 57,490 dealer_advertised_driveaway. Source `peugeot_eexpert_3934809`. Current-epoch equivalence unverified.
- E-Expert PE042606F: formal MY unstated; AUD 56,990 dealer_advertised_driveaway. Source `peugeot_eexpert_3934811`. Current-epoch equivalence unverified.

PE042606F shares the stale East Coast 39047 VIN and is counted once. Previously researched Ford Custom ads are not new additions. No accepted factory orders or physical stock were verified.

### Inherited conflicts and outcomes

- `kangoo_hidden_pdf_text`: PDF extraction from dimensions pages contains invisible obsolete underlying tables: 600/800 kg payload and old GVW/kerb/load volumes. Rendered current visible electric tables and p8 exact electric matrix establish 523/668 kg, 2230/2490 kg GVW, 1707/1822 kg kerb and 3.3/4.2 m³. Invisible leftovers are not competing live visual claims. Resolution: Visual rendering controls; exact p8 column anchors used. Sources: `renault_kangoo_spec`, `renault_kangoo_brochure_latest`
- `kangoo_generic_drawing_vs_electric_matrix`: Generic p6/p7 drawings show heights 1864/1854 mm, body width 1860 mm and clearance 160/182 mm. Exact electric matrix p8 gives 1830 mm both, 1859 mm and 162 mm both. Resolution: Retain exact named electric-column 1830/1859/162; preserve drawings as generic illustrative alternatives. Do not silently replace exact electric values. Sources: `renault_kangoo_spec`
- `kangoo_charge_27_vs_30`: Current brochure pp6–8 claims 170 km recovered in 27 min, while file p13 (printed16) says 30 min. Both use station at least 80 kW; no SOC interval. Resolution: Keep both indicative distance-recovery claims; no harmonised time/ranking or inferred 10–80%. Sources: `renault_kangoo_brochure_latest`
- `kangoo_mirror_shortage_year`: Model page shortage footnote names 2025-built vehicles; April 2026 spec names 2026-built. Matrix shows smart digital mirror optional. Resolution: Optional/vehicle-specific availability, not guaranteed standard equipment. Sources: `renault_kangoo_page`, `renault_kangoo_spec`
- `kangoo_price_basis`: Public OEM data has price 61990/63990 with generic driveaway disclaimer, while visible header says POA. Secondary MY26 RedBook calls these excluding-government-charges price-when-new. Resolution: Keep raw OEM prices and secondary basis separately; fresh canonical manufacturer MLP/driveaway null. Sources: `renault_kangoo_data`, `renault_kangoo_page`, `web_final_search`
- `kangoo_MY_asset_only`: MY26 appears in official linked asset name; PDF footer says April 2026 without explicit model-year declaration. Dealer exact NEW ads are MY24/MY25. Resolution: Current family rows with MY hold; named MY26 brochure reference preserved, no VIN equivalence. Sources: `renault_kangoo_data`, `renault_kangoo_brochure_latest`
- `master_arrival_unverified`: June 16 announcement forecasts H2-2026 arrival; current manufacturer page markets both EV bodies. No later explicit arrival, exact NEW dealer ad, or accepted order confirmation found. Resolution: Announced/current-listed specifications, delivery and order acceptance unverified. Do not label future solely from June story or available-now solely from calendar. Sources: `renault_master_launch`, `renault_master_shared`, `web_master_orders`
- `master_tare_unladen_labels`: MY26 technical matrix labels electric tare 2344/2424 kg and unladen 2336/2416 kg. Tare is 8 kg greater than unladen; payload matches GVM minus unladen. Resolution: Preserve source labels literally; do not swap, invent kerb or silently correct. Sources: `renault_master_spec`
- `master_optional_22kw_deletes_v2l`: Standard 11 kW vehicle has V2L ticks. Factory 22 kW AC option explicitly says No V2L function. Resolution: Option conditional; no combined 22 kW+V2L selling claim. Sources: `renault_master_spec`, `renault_master_brochure`
- `master_equipment_launch_vs_matrix`: Launch generic equipment list names analogue 3.5-inch instrument cluster and underseat storage for all models. Exact electric matrix lists 7-inch digital cluster; underseat/mobile-office bench is option. Launch restricts bulkhead deletion to two-seat diesel, whereas matrix has broader generic option ticks. Resolution: Use exact electric 7-inch matrix; do not promise underseat storage/bulkhead deletion for exact BEV without verification. Sources: `renault_master_launch`, `renault_master_spec`
- `master_lwb_template_height`: Generic LWB Carsales order template calls vehicle L3H2 Mid Roof and 13 m³ but gives 2778 mm height. Manufacturer exact E-Tech L3H2 is 2498 mm; 2778 applies diesel high roof L3H3. Resolution: Reject template dimension. No electric L3H3 configuration established. Sources: `web_master_orders`, `renault_master_spec`
- `peugeot_epartner_current_epoch`: Current new/facelift page and configurator show 10-inch display, wireless phone connectivity, blind-spot detection and digital rear-view mirror, while current brochure index links a MY23 document with the older two-seat/8-inch equipment. The current MY26 Partner PDF was inspected too and contains petrol Pro/Premium columns only, no electric motor/battery column. No current electric manufacturer model-year or matching current technical PDF was established. Resolution: Keep current published-page record with formal MY unknown, and MY23 dated reference separately. Do not transfer old specifications or the two MY24 NEW ads into the facelift record. Sources: `peugeot_epartner_page`, `peugeot_epartner_config`, `peugeot_brochures`, `peugeot_epartner_my23_spec`, `peugeot_partner_my26_spec`
- `peugeot_epartner_payload`: Current page headline/dimensions quote 717 kg payload but its repeated high-modularity text says 780 kg. Dated MY23 technical table gives 753 kg. Resolution: Normalized current payload is null; retain 717/780 current claims and 753 kg historical claim with their scopes. Sources: `peugeot_epartner_page`, `peugeot_partner_combined_page`, `peugeot_epartner_my23_spec`
- `peugeot_epartner_cargo`: Current page dimensions quote 3.9 m3 load volume, headline/modularity quote up to 4.4 m3, and combined Partner page electric subsection says up to 4.3 m3. Current sources do not explain the different arrangements. MY23 had 3.9 m3 and no bulkhead-flap capacity for e-Partner. Resolution: Preserve 3.9 m3 as the specifically listed current load volume with arrangement/method unknown; normalize neither a maximum nor an extended-load volume. Do not infer current load-through from petrol table. Sources: `peugeot_epartner_page`, `peugeot_partner_combined_page`, `peugeot_epartner_my23_spec`
- `peugeot_eexpert_range_cycle`: Current November 2025 MY24 sheet and current configurator explicitly label 330 km NEDC; live product page and older August 2024 MY23 sheet label 330 km WLTP. This is a test-cycle conflict, not a numerical equivalence. Resolution: Normalized range and cycle are null. Published 330 km NEDC and 330 km WLTP claims remain distinct, unranked. Never give E-Expert a WLTP comparison badge or let dealer WLTP prose resolve it. Sources: `peugeot_eexpert_my24_spec`, `peugeot_eexpert_page`, `peugeot_eexpert_config`, `peugeot_eexpert_spec`
- `peugeot_eexpert_ac_time`: Current MY24 sheet and product page publish 7h30 0–100% using 11 kW three-phase; configurator says 11h9 using 11 kW without a visible SOC window in that feature line. Resolution: Hold normalized AC charging time. Preserve each source claim. Current onboard AC capacity of 11 kW is separately supported. Sources: `peugeot_eexpert_my24_spec`, `peugeot_eexpert_page`, `peugeot_eexpert_config`
- `peugeot_eexpert_7_4kw_time`: Both current sheet and page publish about 23 hours 0–100% on 7.4 kW single-phase. The value is surprising relative to 75 kWh/11 kW figures but is visible in the PDF; it is not an extraction error. Resolution: Retain exactly as published with a plausibility caution and no inferred replacement. Exclude from timed-charge comparison. Sources: `peugeot_eexpert_my24_spec`, `peugeot_eexpert_page`
- `peugeot_eexpert_cargo_labels`: PDF p6 has Load volume 6.1 m3 followed by Load volume excluding load through bulkhead 6.6 m3. Product page confirms 6.1 m3. The second label appears inconsistent with an increased volume. Visual PDF review confirms the wording. Resolution: Keep nominal published 6.1 m3, method/arrangement unspecified. Normalized extended/bulkhead-flap volume is null; preserve raw 6.6 value and exact label without silently changing excluding to including. Sources: `peugeot_eexpert_my24_spec`, `peugeot_eexpert_page`
- `peugeot_warranty_corrosion`: Model pages/general warranty introduction mention 12-year corrosion, whereas warranty detail section distinguishes 5 years for commercial vehicles. Resolution: No normalized corrosion duration for these vans. Do not confuse generic passenger and LCV coverage. Vehicle manufacturing-defect coverage is independently 5 years/200,000 km. Sources: `peugeot_warranty`, `peugeot_warranty_terms`, `peugeot_epartner_page`, `peugeot_eexpert_page`
- `peugeot_epartner_hidden_prelaunch`: Raw extracted text includes Coming Soon, but its parent is class="offerBoxspTagWrapper spTagWrapper hidden" id="js-offerbox-prelaunch" in both configurations. Resolution: Hidden template text is not prelaunch evidence. Use visible page order/listing evidence only. Sources: `peugeot_epartner_config_price`, `peugeot_eexpert_config`
- `peugeot_zero_config_price`: dp=null page displays $0, but official model-page link selects dp=2765 and returns RRP $60,990 / indicative $66,467 driveaway. Resolution: Treat zero as missing-price placeholder; not a free vehicle. Price has no verified formal current MY; do not promote secondary MY26 $61,990 into primary evidence. Sources: `peugeot_epartner_config`, `peugeot_epartner_config_price`
- ford_custom_epoch: No AU primary production-release mapping found that reconciles current MY26.50 brochure 71.45 kWh/340-346 km/29 min with the existing 22 September MY27.25/March 2027 report.
- ford_etransit_epoch: Ford AU app compatibility table labels E-Transit 2024.75-Current with 4G/5G, showing later-MY nomenclature in an official support context. It does not identify a current exact MY, roof/mass/specification matrix or battery epoch.
- ford_city_delivery: Ford release dated 9 September 2026 expects Australian first customer deliveries from November 2026. Footnote15 identifies MY27. Linked AU brochure is 2027MY, issued 8 September 2026.

### Price and warranty boundaries

Kangoo raw 61,990/63,990 basis unclear; E-Partner dp=2765 66,467 is indicative private-buyer driveaway versus 60,990 RRP, dp=null zero is placeholder; E-Expert from-56,990 national driveaway is all-MY, participating-dealer, stock-limited and separate from 79,990 RRP. No invented expiry.

70% advertised retention is Kangoo-specific, not Master. Full warranty terms/remedies and commencement remain separate.

No AU van retained-capacity threshold verified; current E-Expert 8yr/160,000km supported, current-facelift E-Partner applicability unknown.


## Exact dependency register

These 150 executable guards are bound to actual application identities and full effective facts. Full source wrappers, worker pointers, dates and hashes remain in the JSON. Source-only conflict/availability objects, source-less unknowns and pre-delivery Ford evidence remain in its 56 audit-only dependencies.

### identity_fact:renault-kangoo-etech-swb-ev45-current-family:specifications.wheelbase_configuration

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `wheelbase_configuration`
- Research pointer: `/records/0/specifications/wheelbase_configuration`
- Expected effective value: "SWB"
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: p8 exact SWB E-Tech column
- Validation: passed actual shared reader

### identity_fact:renault-kangoo-etech-swb-ev45-current-family:specifications.body_style

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `body_style`
- Research pointer: `/records/0/specifications/body_style`
- Expected effective value: "panel van"
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: p4 E-Tech body/cargo equipment
- Validation: passed actual shared reader

### identity_fact:renault-kangoo-etech-swb-ev45-current-family:specifications.battery_usable_kwh

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `battery_usable_kwh`
- Research pointer: `/records/0/specifications/battery_usable_kwh`
- Expected effective value: 45
- Source IDs: `r10_remainingvans_renault_kangoo_page`
- Locator: 100% electric / usable battery statement
- Validation: passed actual shared reader

### identity:renault-kangoo-etech-swb-ev45-current-family

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `variant_property` / `model_year`
- Research pointer: `/records/0`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_kangoo_spec`, `r10_remainingvans_renault_kangoo_page`, `r10_remainingvans_renault_kangoo_brochure_latest`, `r10_remainingvans_renault_kangoo_data`
- Locator: p8 exact SWB E-Tech column; p4 E-Tech body/cargo equipment; 100% electric / usable battery statement; April 2026 PDF footer; MY26 appears in linked brochure asset filename only
- Validation: passed actual shared reader

### identity_fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.wheelbase_configuration

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `wheelbase_configuration`
- Research pointer: `/records/1/specifications/wheelbase_configuration`
- Expected effective value: "LWB"
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: p8 exact LWB E-Tech column
- Validation: passed actual shared reader

### identity_fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.body_style

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `body_style`
- Research pointer: `/records/1/specifications/body_style`
- Expected effective value: "panel van"
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: p4 E-Tech body/cargo equipment
- Validation: passed actual shared reader

### identity_fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.battery_usable_kwh

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `battery_usable_kwh`
- Research pointer: `/records/1/specifications/battery_usable_kwh`
- Expected effective value: 45
- Source IDs: `r10_remainingvans_renault_kangoo_page`
- Locator: 100% electric / usable battery statement
- Validation: passed actual shared reader

### identity:renault-kangoo-etech-lwb-ev45-current-family

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `variant_property` / `model_year`
- Research pointer: `/records/1`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_kangoo_spec`, `r10_remainingvans_renault_kangoo_page`, `r10_remainingvans_renault_kangoo_brochure_latest`, `r10_remainingvans_renault_kangoo_data`
- Locator: p8 exact LWB E-Tech column; p4 E-Tech body/cargo equipment; 100% electric / usable battery statement; April 2026 PDF footer; MY26 appears in linked brochure asset filename only
- Validation: passed actual shared reader

### identity_fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.body_code

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `body_code`
- Research pointer: `/records/2/specifications/body_code`
- Expected effective value: "L2H2"
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Body Type
- Validation: passed actual shared reader

### identity_fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.roof

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `roof`
- Research pointer: `/records/2/specifications/roof`
- Expected effective value: "standard roof (manufacturer launch); mid-roof H2 (technical sheet)"
- Source IDs: `r10_remainingvans_renault_master_launch`, `r10_remainingvans_renault_master_spec`
- Locator: Launch price list / PDF p3 column headings
- Validation: passed actual shared reader

### identity_fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.seats

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `seats`
- Research pointer: `/records/2/specifications/seats`
- Expected effective value: 3
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Seating capacity
- Validation: passed actual shared reader

### identity_fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.battery_capacity_kwh

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `battery_kwh`
- Research pointer: `/records/2/specifications/battery_capacity_kwh`
- Expected effective value: 87
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row battery type (kWh)
- Validation: passed actual shared reader

### identity:renault-master-etech-mwb-l2h2-ev87-my26

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `variant_property` / `model_year`
- Research pointer: `/records/2`
- Expected effective value: 2026
- Source IDs: `r10_remainingvans_renault_master_spec`, `r10_remainingvans_renault_master_launch`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Body Type; Launch price list / PDF p3 column headings; PDF file p3, exact MWB L2H2 E-Tech column, row Seating capacity; PDF file p3, exact MWB L2H2 E-Tech column, row battery type (kWh); 16 June 2026 release explicit MY26 and price/body list
- Validation: passed actual shared reader

### identity_fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.body_code

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `body_code`
- Research pointer: `/records/3/specifications/body_code`
- Expected effective value: "L3H2"
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Body Type
- Validation: passed actual shared reader

### identity_fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.roof

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `roof`
- Research pointer: `/records/3/specifications/roof`
- Expected effective value: "standard roof (manufacturer launch); mid-roof H2 (technical sheet)"
- Source IDs: `r10_remainingvans_renault_master_launch`, `r10_remainingvans_renault_master_spec`
- Locator: Launch price list / PDF p3 column headings
- Validation: passed actual shared reader

### identity_fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.seats

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `seats`
- Research pointer: `/records/3/specifications/seats`
- Expected effective value: 3
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Seating capacity
- Validation: passed actual shared reader

### identity_fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.battery_capacity_kwh

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `battery_kwh`
- Research pointer: `/records/3/specifications/battery_capacity_kwh`
- Expected effective value: 87
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row battery type (kWh)
- Validation: passed actual shared reader

### identity:renault-master-etech-lwb-l3h2-ev87-my26

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `variant_property` / `model_year`
- Research pointer: `/records/3`
- Expected effective value: 2026
- Source IDs: `r10_remainingvans_renault_master_spec`, `r10_remainingvans_renault_master_launch`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Body Type; Launch price list / PDF p3 column headings; PDF file p3, exact LWB L3H2 E-Tech column, row Seating capacity; PDF file p3, exact LWB L3H2 E-Tech column, row battery type (kWh); 16 June 2026 release explicit MY26 and price/body list
- Validation: passed actual shared reader

### identity_fact:peugeot-e-partner-current-pro-long:specifications.formal_model_year

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `formal_model_year`
- Research pointer: `/records/4/specifications/formal_model_year`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_epartner_page`, `r10_remainingvans_peugeot_epartner_config`, `r10_remainingvans_peugeot_epartner_my23_spec`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### identity_fact:peugeot-e-partner-current-pro-long:specifications.body

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `body`
- Research pointer: `/records/4/specifications/body`
- Expected effective value: "Long-wheelbase panel van"
- Source IDs: `r10_remainingvans_peugeot_epartner_page`, `r10_remainingvans_peugeot_epartner_config`
- Locator: Current page long-wheelbase variant; configurator E-Partner Pro Long Auto
- Validation: passed actual shared reader

### identity_fact:peugeot-e-partner-current-pro-long:specifications.battery_capacity_kwh

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `battery_kwh`
- Research pointer: `/records/4/specifications/battery_capacity_kwh`
- Expected effective value: 50
- Source IDs: `r10_remainingvans_peugeot_epartner_config`
- Locator: Key Features, 50kWh Li-ion battery
- Validation: passed actual shared reader

### identity:peugeot-e-partner-current-pro-long

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `variant_property` / `model_year`
- Research pointer: `/records/4`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_epartner_page`, `r10_remainingvans_peugeot_epartner_config`, `r10_remainingvans_peugeot_epartner_my23_spec`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping; Current page long-wheelbase variant; configurator E-Partner Pro Long Auto; Key Features, 50kWh Li-ion battery
- Validation: passed actual shared reader

### identity_fact:peugeot-e-expert-my24-pro-long:specifications.formal_model_year

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `formal_model_year`
- Research pointer: `/records/5/specifications/formal_model_year`
- Expected effective value: "MY24"
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p7 imprint PCA7777 / MY24 / 11.25
- Validation: passed actual shared reader

### identity_fact:peugeot-e-expert-my24-pro-long:specifications.body

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `body`
- Research pointer: `/records/5/specifications/body`
- Expected effective value: "Long-wheelbase panel van"
- Source IDs: `r10_remainingvans_peugeot_eexpert_page`
- Locator: Single long-wheelbase variant Pro Long Auto
- Validation: passed actual shared reader

### identity_fact:peugeot-e-expert-my24-pro-long:specifications.battery_capacity_kwh

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `battery_kwh`
- Research pointer: `/records/5/specifications/battery_capacity_kwh`
- Expected effective value: 75
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p5 Battery Capacity (kWh)/Battery Power (kW) 75/100
- Validation: passed actual shared reader

### identity:peugeot-e-expert-my24-pro-long

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `variant_property` / `model_year`
- Research pointer: `/records/5`
- Expected effective value: 2024
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`, `r10_remainingvans_peugeot_eexpert_page`
- Locator: PDF p7 imprint PCA7777 / MY24 / 11.25; Single long-wheelbase variant Pro Long Auto; PDF p5 Battery Capacity (kWh)/Battery Power (kW) 75/100
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.payload_kg

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `payload_kg`
- Research pointer: `/records/0/specifications/payload_kg`
- Expected effective value: 523
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact SWB E-TECH 100% ELECTRIC column, row Payload (kg)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.gvm_kg

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `gvm_kg`
- Research pointer: `/records/0/specifications/gvm_kg`
- Expected effective value: 2230
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact SWB E-TECH 100% ELECTRIC column, row Gross vehicle mass (kg)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.kerb_mass_kg

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `kerb_mass_kg`
- Research pointer: `/records/0/specifications/kerb_mass_kg`
- Expected effective value: 1707
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact SWB E-TECH 100% ELECTRIC column, row Kerb weight (kg)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.height_mm

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `height_mm`
- Research pointer: `/records/0/specifications/height_mm`
- Expected effective value: 1830
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact SWB E-TECH 100% ELECTRIC column, row Overall height (unladen - mm)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.width_excluding_mirrors_mm

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `width_mm`
- Research pointer: `/records/0/specifications/width_excluding_mirrors_mm`
- Expected effective value: 1859
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact SWB E-TECH 100% ELECTRIC column, row Overall width (excl standard door mirrors - mm)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.battery_gross_kwh

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `battery_gross_kwh`
- Research pointer: `/records/0/specifications/battery_gross_kwh`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: p5 battery row
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.ac_max_kw

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `ac_kw`
- Research pointer: `/records/0/specifications/ac_max_kw`
- Expected effective value: 22
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: p5 recharging capability
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.dc_max_kw

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `dc_peak_kw`
- Research pointer: `/records/0/specifications/dc_max_kw`
- Expected effective value: 80
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: p5 recharging capability
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.dc_10_80_minutes

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `dc_charge_time_min`
- Research pointer: `/records/0/specifications/dc_10_80_minutes`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p8 charging table
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.ac_0_100_hours

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `ac_0_100_hours`
- Research pointer: `/records/0/specifications/ac_0_100_hours`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p8 charging table
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:charging_claims:0

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `charging_distance_observation_1`
- Research pointer: `/records/0/charging_claims/0`
- Expected effective value: {"minutes": 145, "charger_kw": 22, "charger_type": "AC", "distance_recovered_km": 286, "soc_start": null, "soc_end": null}
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p8 public charging column
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:charging_claims:1

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `charging_distance_observation_2`
- Research pointer: `/records/0/charging_claims/1`
- Expected effective value: {"minutes": 85, "charger_kw": 80, "charger_type": "DC", "distance_recovered_km": 286, "soc_start": null, "soc_end": null}
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p8 fast public column
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:charging_claims:2

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `charging_distance_observation_3`
- Research pointer: `/records/0/charging_claims/2`
- Expected effective value: {"minutes": 27, "charger_kw_at_least": 80, "distance_recovered_km": 170, "soc_start": null, "soc_end": null}
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p8 fast public charging
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:charging_claims:3

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `charging_distance_observation_4`
- Research pointer: `/records/0/charging_claims/3`
- Expected effective value: {"minutes": 30, "charger_kw_at_least": 80, "distance_recovered_km": 170, "soc_start": null, "soc_end": null}
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p13 (printed 16) electric motor table
- Validation: passed actual shared reader

### equipment:renault-kangoo-etech-swb-ev45-current-family:equipment.optional

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `equipment_optional`
- Research pointer: `/records/0/equipment/optional`
- Expected effective value: ["Visibility Pack: LED lamps, fog lamps and automatic high/low beam", "Comfort Pack: adaptive cruise, key card, navigation, blind-spot intervention, front/side sensors, wireless phone charging, centre console/armrest, heated leather wheel", "Trade… (full value in JSON)
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF pp4,8–10 exact electric columns
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.payload_kg

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `payload_kg`
- Research pointer: `/records/1/specifications/payload_kg`
- Expected effective value: 668
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact LWB E-TECH 100% ELECTRIC column, row Payload (kg)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.gvm_kg

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `gvm_kg`
- Research pointer: `/records/1/specifications/gvm_kg`
- Expected effective value: 2490
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact LWB E-TECH 100% ELECTRIC column, row Gross vehicle mass (kg)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.kerb_mass_kg

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `kerb_mass_kg`
- Research pointer: `/records/1/specifications/kerb_mass_kg`
- Expected effective value: 1822
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact LWB E-TECH 100% ELECTRIC column, row Kerb weight (kg)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.height_mm

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `height_mm`
- Research pointer: `/records/1/specifications/height_mm`
- Expected effective value: 1830
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact LWB E-TECH 100% ELECTRIC column, row Overall height (unladen - mm)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.width_excluding_mirrors_mm

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `width_mm`
- Research pointer: `/records/1/specifications/width_excluding_mirrors_mm`
- Expected effective value: 1859
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact LWB E-TECH 100% ELECTRIC column, row Overall width (excl standard door mirrors - mm)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.battery_gross_kwh

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `battery_gross_kwh`
- Research pointer: `/records/1/specifications/battery_gross_kwh`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: p5 battery row
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.ac_max_kw

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `ac_kw`
- Research pointer: `/records/1/specifications/ac_max_kw`
- Expected effective value: 22
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: p5 recharging capability
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.dc_max_kw

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `dc_peak_kw`
- Research pointer: `/records/1/specifications/dc_max_kw`
- Expected effective value: 80
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: p5 recharging capability
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.dc_10_80_minutes

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `dc_charge_time_min`
- Research pointer: `/records/1/specifications/dc_10_80_minutes`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p8 charging table
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.ac_0_100_hours

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `ac_0_100_hours`
- Research pointer: `/records/1/specifications/ac_0_100_hours`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p8 charging table
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:charging_claims:0

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `charging_distance_observation_1`
- Research pointer: `/records/1/charging_claims/0`
- Expected effective value: {"minutes": 145, "charger_kw": 22, "charger_type": "AC", "distance_recovered_km": 286, "soc_start": null, "soc_end": null}
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p8 public charging column
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:charging_claims:1

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `charging_distance_observation_2`
- Research pointer: `/records/1/charging_claims/1`
- Expected effective value: {"minutes": 85, "charger_kw": 80, "charger_type": "DC", "distance_recovered_km": 286, "soc_start": null, "soc_end": null}
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p8 fast public column
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:charging_claims:2

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `charging_distance_observation_3`
- Research pointer: `/records/1/charging_claims/2`
- Expected effective value: {"minutes": 27, "charger_kw_at_least": 80, "distance_recovered_km": 170, "soc_start": null, "soc_end": null}
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p8 fast public charging
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:charging_claims:3

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `charging_distance_observation_4`
- Research pointer: `/records/1/charging_claims/3`
- Expected effective value: {"minutes": 30, "charger_kw_at_least": 80, "distance_recovered_km": 170, "soc_start": null, "soc_end": null}
- Source IDs: `r10_remainingvans_renault_kangoo_brochure_latest`
- Locator: PDF file p13 (printed 16) electric motor table
- Validation: passed actual shared reader

### equipment:renault-kangoo-etech-lwb-ev45-current-family:equipment.optional

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `equipment_optional`
- Research pointer: `/records/1/equipment/optional`
- Expected effective value: ["Visibility Pack: LED lamps, fog lamps and automatic high/low beam", "Comfort Pack: adaptive cruise, key card, navigation, blind-spot intervention, front/side sensors, wireless phone charging, centre console/armrest, heated leather wheel", "Trade… (full value in JSON)
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF pp4,8–10 exact electric columns
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.height_mm

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `height_mm`
- Research pointer: `/records/2/specifications/height_mm`
- Expected effective value: 2498
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Overall height (mm)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.gvm_kg

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `gvm_kg`
- Research pointer: `/records/2/specifications/gvm_kg`
- Expected effective value: 3500
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Gross Vehicle Mass - GVM - (kg)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.unladen_mass_kg

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `unladen_mass_kg`
- Research pointer: `/records/2/specifications/unladen_mass_kg`
- Expected effective value: 2336
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Unladen Mass (3 seat / 2 seat kg)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.tare_mass_kg

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `tare_mass_kg`
- Research pointer: `/records/2/specifications/tare_mass_kg`
- Expected effective value: 2344
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Tare Mass (3 seat / 2 seat kg)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.payload_kg

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `payload_kg`
- Research pointer: `/records/2/specifications/payload_kg`
- Expected effective value: 1164
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Payload (3 seat / 2 seat kg)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.ac_max_kw

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `ac_kw`
- Research pointer: `/records/2/specifications/ac_max_kw`
- Expected effective value: 11
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row on board charger AC / DC (kW)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.optional_ac_max_kw

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `ac_optional_kw`
- Research pointer: `/records/2/specifications/optional_ac_max_kw`
- Expected effective value: 22
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: p5 single option exact E-Tech columns
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.v2l_standard

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `v2l_standard`
- Research pointer: `/records/2/specifications/v2l_standard`
- Expected effective value: true
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row V2L capabilities
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.v2l_power_kw

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `v2l_power_kw`
- Research pointer: `/records/2/specifications/v2l_power_kw`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_master_brochure`
- Locator: p6 V2L
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.battery_usable_kwh

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `battery_usable_kwh`
- Research pointer: `/records/2/specifications/battery_usable_kwh`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_master_brochure`
- Locator: p17 storage capacity
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.battery_gross_kwh

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `battery_gross_kwh`
- Research pointer: `/records/2/specifications/battery_gross_kwh`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_master_brochure`
- Locator: p17 storage capacity
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.range_km

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `range_km`
- Research pointer: `/records/2/specifications/range_km`
- Expected effective value: 409
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row WLTP driving range (km)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.dc_max_kw

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `dc_peak_kw`
- Research pointer: `/records/2/specifications/dc_max_kw`
- Expected effective value: 130
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row on board charger AC / DC (kW)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.dc_15_80_minutes

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `dc_charge_time_min`
- Research pointer: `/records/2/specifications/dc_15_80_minutes`
- Expected effective value: 38
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Charging time - 130kW DC charger (15-80%)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.dc_10_80_minutes

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `dc_10_80_min`
- Research pointer: `/records/2/specifications/dc_10_80_minutes`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: p3 15–80% time
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.ac_15_80_minutes_at_11kw

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `ac_15_80_minutes_at_11kw`
- Research pointer: `/records/2/specifications/ac_15_80_minutes_at_11kw`
- Expected effective value: 352
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Charging time - 11kW AC charger (15-80%)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.ac_15_80_minutes_at_2_1kw

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `ac_15_80_minutes_at_2_1kw`
- Research pointer: `/records/2/specifications/ac_15_80_minutes_at_2_1kw`
- Expected effective value: 1806
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Charging time - 2.1k W AC charger (15-80%)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.ac_0_100_hours

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `ac_0_100_hours`
- Research pointer: `/records/2/specifications/ac_0_100_hours`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: p3 charging times
- Validation: passed actual shared reader

### equipment:renault-master-etech-mwb-l2h2-ev87-my26:equipment.standard

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `equipment_standard`
- Research pointer: `/records/2/equipment/standard`
- Expected effective value: ["3 seats; glazed steel bulkhead", "10-inch openR Link with Google built-in; 7-inch digital driver cluster", "Apple CarPlay/Android Auto; 2 USB ports; 12V cabin/cargo outlets", "AEB with pedestrian/cyclist detection; lane-keep/LDW; driver attentio… (full value in JSON)
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF pp4–5 exact electric columns
- Validation: passed actual shared reader

### equipment:renault-master-etech-mwb-l2h2-ev87-my26:equipment.optional

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `equipment_optional`
- Research pointer: `/records/2/equipment/optional`
- Expected effective value: ["22 kW AC with 130 kW DC deletes V2L", "front/side parking sensors delete blind-spot warning", "Trade, Business and combined packs", "right slider, alternative glazing, floor/wall lining, digital rear-view mirror", "two-seat layout restricted to … (full value in JSON)
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF p5 exact electric columns, qualified by launch restrictions
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.height_mm

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `height_mm`
- Research pointer: `/records/3/specifications/height_mm`
- Expected effective value: 2498
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Overall height (mm)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.gvm_kg

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `gvm_kg`
- Research pointer: `/records/3/specifications/gvm_kg`
- Expected effective value: 3500
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Gross Vehicle Mass - GVM - (kg)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.unladen_mass_kg

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `unladen_mass_kg`
- Research pointer: `/records/3/specifications/unladen_mass_kg`
- Expected effective value: 2416
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Unladen Mass (3 seat / 2 seat kg)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.tare_mass_kg

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `tare_mass_kg`
- Research pointer: `/records/3/specifications/tare_mass_kg`
- Expected effective value: 2424
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Tare Mass (3 seat / 2 seat kg)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.payload_kg

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `payload_kg`
- Research pointer: `/records/3/specifications/payload_kg`
- Expected effective value: 1084
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Payload (3 seat / 2 seat kg)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.ac_max_kw

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `ac_kw`
- Research pointer: `/records/3/specifications/ac_max_kw`
- Expected effective value: 11
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row on board charger AC / DC (kW)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.optional_ac_max_kw

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `ac_optional_kw`
- Research pointer: `/records/3/specifications/optional_ac_max_kw`
- Expected effective value: 22
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: p5 single option exact E-Tech columns
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.v2l_standard

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `v2l_standard`
- Research pointer: `/records/3/specifications/v2l_standard`
- Expected effective value: true
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row V2L capabilities
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.v2l_power_kw

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `v2l_power_kw`
- Research pointer: `/records/3/specifications/v2l_power_kw`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_master_brochure`
- Locator: p6 V2L
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.battery_usable_kwh

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `battery_usable_kwh`
- Research pointer: `/records/3/specifications/battery_usable_kwh`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_master_brochure`
- Locator: p17 storage capacity
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.battery_gross_kwh

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `battery_gross_kwh`
- Research pointer: `/records/3/specifications/battery_gross_kwh`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_master_brochure`
- Locator: p17 storage capacity
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.range_km

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `range_km`
- Research pointer: `/records/3/specifications/range_km`
- Expected effective value: 409
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row WLTP driving range (km)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.dc_max_kw

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `dc_peak_kw`
- Research pointer: `/records/3/specifications/dc_max_kw`
- Expected effective value: 130
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row on board charger AC / DC (kW)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.dc_15_80_minutes

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `dc_charge_time_min`
- Research pointer: `/records/3/specifications/dc_15_80_minutes`
- Expected effective value: 38
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Charging time - 130kW DC charger (15-80%)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.dc_10_80_minutes

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `dc_10_80_min`
- Research pointer: `/records/3/specifications/dc_10_80_minutes`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: p3 15–80% time
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.ac_15_80_minutes_at_11kw

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `ac_15_80_minutes_at_11kw`
- Research pointer: `/records/3/specifications/ac_15_80_minutes_at_11kw`
- Expected effective value: 352
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Charging time - 11kW AC charger (15-80%)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.ac_15_80_minutes_at_2_1kw

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `ac_15_80_minutes_at_2_1kw`
- Research pointer: `/records/3/specifications/ac_15_80_minutes_at_2_1kw`
- Expected effective value: 1806
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Charging time - 2.1k W AC charger (15-80%)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.ac_0_100_hours

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `ac_0_100_hours`
- Research pointer: `/records/3/specifications/ac_0_100_hours`
- Expected effective value: null
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: p3 charging times
- Validation: passed actual shared reader

### equipment:renault-master-etech-lwb-l3h2-ev87-my26:equipment.standard

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `equipment_standard`
- Research pointer: `/records/3/equipment/standard`
- Expected effective value: ["3 seats; glazed steel bulkhead", "10-inch openR Link with Google built-in; 7-inch digital driver cluster", "Apple CarPlay/Android Auto; 2 USB ports; 12V cabin/cargo outlets", "AEB with pedestrian/cyclist detection; lane-keep/LDW; driver attentio… (full value in JSON)
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF pp4–5 exact electric columns
- Validation: passed actual shared reader

### equipment:renault-master-etech-lwb-l3h2-ev87-my26:equipment.optional

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `equipment_optional`
- Research pointer: `/records/3/equipment/optional`
- Expected effective value: ["22 kW AC with 130 kW DC deletes V2L", "front/side parking sensors delete blind-spot warning", "Trade, Business and combined packs", "right slider, alternative glazing, floor/wall lining, digital rear-view mirror", "two-seat layout restricted to … (full value in JSON)
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF p5 exact electric columns, qualified by launch restrictions
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.payload_kg

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `payload_kg`
- Research pointer: `/records/4/specifications/payload_kg`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_epartner_page`, `r10_remainingvans_peugeot_partner_combined_page`, `r10_remainingvans_peugeot_epartner_my23_spec`
- Locator: Current E-Partner page headline/dimensions 717 kg and high-modularity text 780 kg; MY23 technical table is dated, excluded
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.cargo_load_volume_m3

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `cargo_volume_m3`
- Research pointer: `/records/4/specifications/cargo_load_volume_m3`
- Expected effective value: 3.9
- Source IDs: `r10_remainingvans_peugeot_epartner_page`
- Locator: Detailed interior payload/load block
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.cargo_extended_volume_m3

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `cargo_extended_volume_m3`
- Research pointer: `/records/4/specifications/cargo_extended_volume_m3`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_epartner_page`, `r10_remainingvans_peugeot_partner_combined_page`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.cargo_measurement_method

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `cargo_measurement_method`
- Research pointer: `/records/4/specifications/cargo_measurement_method`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_epartner_page`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.battery_usable_kwh

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `battery_usable_kwh`
- Research pointer: `/records/4/specifications/battery_usable_kwh`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_epartner_config`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.battery_gross_kwh

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `battery_gross_kwh`
- Research pointer: `/records/4/specifications/battery_gross_kwh`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_epartner_config`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.range_km

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `range_km`
- Research pointer: `/records/4/specifications/range_km`
- Expected effective value: 258
- Source IDs: `r10_remainingvans_peugeot_epartner_page`
- Locator: Up to 258 km all-electric WLTP range and footnote
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.range_cycle

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `range_cycle`
- Research pointer: `/records/4/specifications/range_cycle`
- Expected effective value: "WLTP combined"
- Source IDs: `r10_remainingvans_peugeot_epartner_page`
- Locator: Range footnote
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.range_test_load

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `range_test_load`
- Research pointer: `/records/4/specifications/range_test_load`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_epartner_page`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.dc_peak_kw

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `dc_peak_kw`
- Research pointer: `/records/4/specifications/dc_peak_kw`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_epartner_config`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.dc_charger_test_kw

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `dc_charger_test_kw`
- Research pointer: `/records/4/specifications/dc_charger_test_kw`
- Expected effective value: 100
- Source IDs: `r10_remainingvans_peugeot_epartner_config`
- Locator: Key Features, Quick Charge - DC Current (100kW) 0-80%
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.dc_charge_minutes

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `dc_charge_time_min`
- Research pointer: `/records/4/specifications/dc_charge_minutes`
- Expected effective value: 30
- Source IDs: `r10_remainingvans_peugeot_epartner_config`
- Locator: Key Features
- Validation: passed actual shared reader

### fact:peugeot-e-partner-current-pro-long:specifications.dc_charge_window

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `dc_charge_window`
- Research pointer: `/records/4/specifications/dc_charge_window`
- Expected effective value: "0–80%"
- Source IDs: `r10_remainingvans_peugeot_epartner_config`
- Locator: Key Features
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.range_km

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `range_km`
- Research pointer: `/records/5/specifications/range_km`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`, `r10_remainingvans_peugeot_eexpert_page`, `r10_remainingvans_peugeot_eexpert_config`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.range_cycle

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `range_cycle`
- Research pointer: `/records/5/specifications/range_cycle`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`, `r10_remainingvans_peugeot_eexpert_page`, `r10_remainingvans_peugeot_eexpert_config`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.ac_max_kw

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `ac_kw`
- Research pointer: `/records/5/specifications/ac_max_kw`
- Expected effective value: 11
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p5 On Board Charger (kW)
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.ac_charge_minutes

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `ac_charge_minutes`
- Research pointer: `/records/5/specifications/ac_charge_minutes`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`, `r10_remainingvans_peugeot_eexpert_page`, `r10_remainingvans_peugeot_eexpert_config`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.ac_charge_window

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `ac_charge_window`
- Research pointer: `/records/5/specifications/ac_charge_window`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`, `r10_remainingvans_peugeot_eexpert_config`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.cargo_load_volume_m3

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `cargo_volume_m3`
- Research pointer: `/records/5/specifications/cargo_load_volume_m3`
- Expected effective value: 6.1
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p6 Load volume (m3)
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.cargo_extended_volume_m3

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `cargo_extended_volume_m3`
- Research pointer: `/records/5/specifications/cargo_extended_volume_m3`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.cargo_measurement_method

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `cargo_measurement_method`
- Research pointer: `/records/5/specifications/cargo_measurement_method`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.payload_kg

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `payload_kg`
- Research pointer: `/records/5/specifications/payload_kg`
- Expected effective value: 1001
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p6 Payload
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.gvm_kg

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `gvm_kg`
- Research pointer: `/records/5/specifications/gvm_kg`
- Expected effective value: 3053
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p6 gross vehicle mass
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.tare_kg

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `tare_mass_kg`
- Research pointer: `/records/5/specifications/tare_kg`
- Expected effective value: 2052
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p6 Tare weight
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.battery_usable_kwh

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `battery_usable_kwh`
- Research pointer: `/records/5/specifications/battery_usable_kwh`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.battery_gross_kwh

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `battery_gross_kwh`
- Research pointer: `/records/5/specifications/battery_gross_kwh`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.dc_peak_kw

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `dc_peak_kw`
- Research pointer: `/records/5/specifications/dc_peak_kw`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.dc_charger_test_kw

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `dc_charger_test_kw`
- Research pointer: `/records/5/specifications/dc_charger_test_kw`
- Expected effective value: 100
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p5 Quick Charge - DC Current (100kW)
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.dc_charge_minutes

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `dc_charge_time_min`
- Research pointer: `/records/5/specifications/dc_charge_minutes`
- Expected effective value: 45
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p5 Quick Charge
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.dc_charge_window

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `dc_charge_window`
- Research pointer: `/records/5/specifications/dc_charge_window`
- Expected effective value: "0–80%"
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p5 Quick Charge
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.width_mirrors_folded_mm

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `width_mirrors_folded_mm`
- Research pointer: `/records/5/specifications/width_mirrors_folded_mm`
- Expected effective value: 1920
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p6 Width with mirrors folded
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.width_excluding_mirrors_mm

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `width_mm`
- Research pointer: `/records/5/specifications/width_excluding_mirrors_mm`
- Expected effective value: null
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: Exact research pointer; see additionalLocators and linked conflict evidence before application mapping
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.length_mm

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `length_mm`
- Research pointer: `/records/0/specifications/length_mm`
- Expected effective value: 4488
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact SWB E-TECH 100% ELECTRIC column, row Overall length (mm)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.turning_circle_m

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `turning_circle_m`
- Research pointer: `/records/0/specifications/turning_circle_m`
- Expected effective value: 11.31
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact SWB E-TECH 100% ELECTRIC column, row Turning circle - kerb to kerb (M)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.cargo_volume_m3

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `cargo_volume_m3`
- Research pointer: `/records/0/specifications/cargo_volume_m3`
- Expected effective value: 3.3
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact SWB E-TECH 100% ELECTRIC column, row Load volume (m³)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.cargo_volume_m3

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `cargo_volume_m3`
- Research pointer: `/records/1/specifications/cargo_volume_m3`
- Expected effective value: 4.2
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact LWB E-TECH 100% ELECTRIC column, row Load volume (m³)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.cargo_length_mm

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `cargo_length_mm`
- Research pointer: `/records/1/specifications/cargo_length_mm`
- Expected effective value: 2230
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact LWB E-TECH 100% ELECTRIC column, row Cargo bay length (mm)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-swb-ev45-current-family:specifications.cargo_length_mm

- App variant: `renault_kangoo_current__swb_ev45_90kw__20261010`
- Kind / field: `fact` / `cargo_length_mm`
- Research pointer: `/records/0/specifications/cargo_length_mm`
- Expected effective value: 1806
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact SWB E-TECH 100% ELECTRIC column, row Cargo bay length (mm)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.length_mm

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `length_mm`
- Research pointer: `/records/1/specifications/length_mm`
- Expected effective value: 4910
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact LWB E-TECH 100% ELECTRIC column, row Overall length (mm)
- Validation: passed actual shared reader

### fact:renault-kangoo-etech-lwb-ev45-current-family:specifications.turning_circle_m

- App variant: `renault_kangoo_current__lwb_ev45_90kw__20261010`
- Kind / field: `fact` / `turning_circle_m`
- Research pointer: `/records/1/specifications/turning_circle_m`
- Expected effective value: 11.75
- Source IDs: `r10_remainingvans_renault_kangoo_spec`
- Locator: PDF file p8, exact LWB E-TECH 100% ELECTRIC column, row Turning circle - kerb to kerb (M)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.cargo_volume_m3

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `cargo_volume_m3`
- Research pointer: `/records/2/specifications/cargo_volume_m3`
- Expected effective value: 10.8
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Cargo bay load volume (m³)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.cargo_volume_m3

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `cargo_volume_m3`
- Research pointer: `/records/3/specifications/cargo_volume_m3`
- Expected effective value: 13
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Cargo bay load volume (m³)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.cargo_length_mm

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `cargo_length_mm`
- Research pointer: `/records/3/specifications/cargo_length_mm`
- Expected effective value: 3857
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Cargo bay length (mm)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.cargo_length_mm

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `cargo_length_mm`
- Research pointer: `/records/2/specifications/cargo_length_mm`
- Expected effective value: 3225
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Cargo bay length (mm)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.length_mm

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `length_mm`
- Research pointer: `/records/3/specifications/length_mm`
- Expected effective value: 6315
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Overall length (mm)
- Validation: passed actual shared reader

### fact:renault-master-etech-lwb-l3h2-ev87-my26:specifications.turning_circle_m

- App variant: `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- Kind / field: `fact` / `turning_circle_m`
- Research pointer: `/records/3/specifications/turning_circle_m`
- Expected effective value: 14.9
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact LWB L3H2 E-Tech column, row Turning circle - kerb to kerb (M)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.length_mm

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `length_mm`
- Research pointer: `/records/2/specifications/length_mm`
- Expected effective value: 5685
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Overall length (mm)
- Validation: passed actual shared reader

### fact:renault-master-etech-mwb-l2h2-ev87-my26:specifications.turning_circle_m

- App variant: `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- Kind / field: `fact` / `turning_circle_m`
- Research pointer: `/records/2/specifications/turning_circle_m`
- Expected effective value: 12.8
- Source IDs: `r10_remainingvans_renault_master_spec`
- Locator: PDF file p3, exact MWB L2H2 E-Tech column, row Turning circle - kerb to kerb (M)
- Validation: passed actual shared reader

### equipment:peugeot-e-partner-current-pro-long:equipment.digital_rear_view_mirror

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `equipment_digital_rear_view_mirror`
- Research pointer: `/records/4/equipment/digital_rear_view_mirror`
- Expected effective value: true
- Source IDs: `r10_remainingvans_peugeot_epartner_config`
- Locator: Technology
- Validation: passed actual shared reader

### equipment:peugeot-e-partner-current-pro-long:equipment.lateral_side_camera

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `equipment_lateral_side_camera`
- Research pointer: `/records/4/equipment/lateral_side_camera`
- Expected effective value: true
- Source IDs: `r10_remainingvans_peugeot_epartner_page`
- Locator: Digital rear view mirror and lateral side view
- Validation: passed actual shared reader

### equipment:peugeot-e-partner-current-pro-long:equipment.dual_sliding_doors

- App variant: `peugeot_epartner_current__pro_long_auto__20261010`
- Kind / field: `fact` / `equipment_dual_sliding_doors`
- Research pointer: `/records/4/equipment/dual_sliding_doors`
- Expected effective value: true
- Source IDs: `r10_remainingvans_peugeot_epartner_config`
- Locator: Exterior
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.cargo_length_bulkhead_mm

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `cargo_length_bulkhead_mm`
- Research pointer: `/records/5/specifications/cargo_length_bulkhead_mm`
- Expected effective value: 2780
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p6 Maximum load length with bulkhead
- Validation: passed actual shared reader

### fact:peugeot-e-expert-my24-pro-long:specifications.cargo_length_through_flap_mm

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `cargo_length_through_flap_mm`
- Research pointer: `/records/5/specifications/cargo_length_through_flap_mm`
- Expected effective value: 4024
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p6 Maximum load length through open bulkhead flap
- Validation: passed actual shared reader

### equipment:peugeot-e-expert-my24-pro-long:equipment.bulkhead

- App variant: `peugeot_eexpert_my24__pro_long_auto__20261010`
- Kind / field: `fact` / `equipment_bulkhead`
- Research pointer: `/records/5/equipment/bulkhead`
- Expected effective value: "Glazed with load-through flap, ISO27956 compliant"
- Source IDs: `r10_remainingvans_peugeot_eexpert_my24_spec`
- Locator: PDF p3 Comfort & Convenience
- Validation: passed actual shared reader

### Audit-only dependencies

- `identity_fact:ford-transit-city-my27-swb-fwd:specifications.seats`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `identity_fact:ford-transit-city-my27-swb-fwd:specifications.drive`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `identity_fact:ford-transit-city-my27-swb-fwd:specifications.battery_usable_kwh`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `identity_fact:ford-transit-city-my27-swb-fwd:identity`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `identity:ford-transit-city-my27-swb-fwd`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `availability:renault-kangoo-etech-swb-ev45-current-family:availability`: No standalone effective fact for this source-only availability/conflict/raw-claim object. Related supported fact/null guards retain the field hold; record availability snapshot is separately audited.
- `conflict:kangoo_hidden_pdf_text`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:kangoo_generic_drawing_vs_electric_matrix`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:kangoo_charge_27_vs_30`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:kangoo_mirror_shortage_year`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:kangoo_price_basis`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:kangoo_MY_asset_only`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `availability:renault-kangoo-etech-lwb-ev45-current-family:availability`: No standalone effective fact for this source-only availability/conflict/raw-claim object. Related supported fact/null guards retain the field hold; record availability snapshot is separately audited.
- `availability:renault-master-etech-mwb-l2h2-ev87-my26:availability`: No standalone effective fact for this source-only availability/conflict/raw-claim object. Related supported fact/null guards retain the field hold; record availability snapshot is separately audited.
- `conflict:master_arrival_unverified`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:master_tare_unladen_labels`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:master_optional_22kw_deletes_v2l`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:master_equipment_launch_vs_matrix`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:master_lwb_template_height`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `availability:renault-master-etech-lwb-l3h2-ev87-my26:availability`: No standalone effective fact for this source-only availability/conflict/raw-claim object. Related supported fact/null guards retain the field hold; record availability snapshot is separately audited.
- `availability:peugeot-e-partner-current-pro-long:availability`: No standalone effective fact for this source-only availability/conflict/raw-claim object. Related supported fact/null guards retain the field hold; record availability snapshot is separately audited.
- `fact:peugeot-e-partner-current-pro-long:published_conflicting_claims`: No standalone effective fact for this source-only availability/conflict/raw-claim object. Related supported fact/null guards retain the field hold; record availability snapshot is separately audited.
- `conflict:peugeot_epartner_current_epoch`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:peugeot_epartner_payload`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:peugeot_epartner_cargo`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:peugeot_epartner_hidden_prelaunch`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:peugeot_zero_config_price`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:peugeot_warranty_corrosion`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `availability:peugeot-e-expert-my24-pro-long:availability`: No standalone effective fact for this source-only availability/conflict/raw-claim object. Related supported fact/null guards retain the field hold; record availability snapshot is separately audited.
- `fact:peugeot-e-expert-my24-pro-long:published_manufacturer_claims`: No standalone effective fact for this source-only availability/conflict/raw-claim object. Related supported fact/null guards retain the field hold; record availability snapshot is separately audited.
- `conflict:peugeot_eexpert_range_cycle`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:peugeot_eexpert_ac_time`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:peugeot_eexpert_7_4kw_time`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `conflict:peugeot_eexpert_cargo_labels`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `availability:ford-transit-city-my27-swb-fwd:availability.first_customer_delivery`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `availability:ford-transit-city-my27-swb-fwd:availability`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `fact:ford-transit-city-my27-swb-fwd:specifications.cargo_volume_m3`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `fact:ford-transit-city-my27-swb-fwd:specifications.payload_kg`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `fact:ford-transit-city-my27-swb-fwd:specifications.battery_usable_kwh`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `fact:ford-transit-city-my27-swb-fwd:specifications.battery_chemistry`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `fact:ford-transit-city-my27-swb-fwd:specifications.dc_charge_rating_kw`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `fact:ford-transit-city-my27-swb-fwd:specifications.dc_10_80_min`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `fact:ford-transit-city-my27-swb-fwd:specifications.ac_charge_max_kw`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `fact:ford-transit-city-my27-swb-fwd:specifications.ac_10_100_min_7_4kw`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `fact:ford-transit-city-my27-swb-fwd:specifications.ac_10_100_min_11kw`: Pre-delivery Ford or source conflict audit context; no current executable application record/field.
- `fact:peugeot-e-partner-current-pro-long:specifications.seats`: Source-less effective unknown remains audit-only; cannot form executable sourced fact guard.
- `fact:peugeot-e-partner-current-pro-long:specifications.drive`: Source-less effective unknown remains audit-only; cannot form executable sourced fact guard.
- `fact:peugeot-e-partner-current-pro-long:specifications.wheelbase_mm`: Source-less effective unknown remains audit-only; cannot form executable sourced fact guard.
- `fact:peugeot-e-partner-current-pro-long:specifications.ac_max_kw`: Source-less effective unknown remains audit-only; cannot form executable sourced fact guard.
- `fact:peugeot-e-partner-current-pro-long:specifications.ac_charge_time`: Source-less effective unknown remains audit-only; cannot form executable sourced fact guard.
- `fact:peugeot-e-partner-current-pro-long:specifications.tare_kg`: Source-less effective unknown remains audit-only; cannot form executable sourced fact guard.
- `fact:peugeot-e-partner-current-pro-long:specifications.gvm_kg`: Source-less effective unknown remains audit-only; cannot form executable sourced fact guard.
- `fact:peugeot-e-partner-current-pro-long:specifications.dc_10_80_minutes`: Source-less effective unknown remains audit-only; cannot form executable sourced fact guard.
- `fact:peugeot-e-partner-current-pro-long:specifications.width_excluding_mirrors_mm`: Source-less effective unknown remains audit-only; cannot form executable sourced fact guard.
- `fact:peugeot-e-partner-current-pro-long:specifications.width_mirrors_folded_mm`: Source-less effective unknown remains audit-only; cannot form executable sourced fact guard.
- `fact:peugeot-e-expert-my24-pro-long:specifications.dc_10_80_minutes`: Source-less effective unknown remains audit-only; cannot form executable sourced fact guard.

### Runtime source-ID mapping

- `r10_remainingvans_renault_kangoo_page`: [Renault Australia current Kangoo E-Tech page](https://www.renault.com.au/vehicles/kangoo-e-tech/). Observed 2026-10-10.
- `r10_remainingvans_renault_kangoo_data`: [Public page-data for current Kangoo E-Tech model/configurator](https://www.renault.com.au/page-data/vehicles/kangoo-e-tech/page-data.json). Observed 2026-10-10.
- `r10_remainingvans_renault_master_launch`: [Renault Australia MY26 Master price/specification announcement (16 June 2026)](https://www.renault.com.au/news/new-generation-renault-master-van-price-and-specs-confirmed-for-australia/4064/). Observed 2026-10-10.
- `r10_remainingvans_renault_kangoo_spec`: [Renault Australia Kangoo specification sheet, April 2026, REN1571](https://cdn.cms-uploads.i-motor.me/3ehi49lwrqk0up6mfmtifnd194rb). Observed 2026-10-10.
- `r10_remainingvans_renault_kangoo_brochure_latest`: [Renault Australia Kangoo brochure, official asset name Kangoo_MY26_Brochure.pdf, April 2026, REN1572](https://cdn.cms-uploads.i-motor.me/v6fbkwq8gztbplivhmua7vviu593). Observed 2026-10-10.
- `r10_remainingvans_renault_master_spec`: [Renault Australia Master MY26 specification sheet, May 2026, REN1576](https://cdn.cms-uploads.i-motor.me/0v18qkpsdeh5cmtoj06x40g9nwis). Observed 2026-10-10.
- `r10_remainingvans_renault_master_brochure`: [Renault Australia Master MY26 brochure, May 2026, REN1575](https://cdn.cms-uploads.i-motor.me/dolxhoxnbnp8ipzara5pmtms1pqo). Observed 2026-10-10.
- `r10_remainingvans_peugeot_epartner_page`: [Peugeot Australia current new E-Partner model page](https://www.peugeot.com.au/models/new-e-partner-van.html). Observed 2026-10-10.
- `r10_remainingvans_peugeot_eexpert_page`: [Peugeot Australia current E-Expert model page](https://www.peugeot.com.au/models/expert-van/e-expert.html). Observed 2026-10-10.
- `r10_remainingvans_peugeot_epartner_my23_spec`: [Peugeot Australia combined Partner/e-Partner MY23 specification sheet, December 2023](https://www.peugeot.com.au/content/dam/peugeot/australia/models/partner/e-partner/MY23_Partner_Spec_Sheet.pdf). Observed 2026-10-10.
- `r10_remainingvans_peugeot_eexpert_my24_spec`: [Peugeot Australia E-Expert MY24 specification sheet, November 2025](https://www.peugeot.com.au/content/dam/peugeot/australia/models/brochures/Peugeot_E-Expert_MY24_Spec_Sheet_1125.pdf). Observed 2026-10-10.
- `r10_remainingvans_peugeot_epartner_config`: [Peugeot Australia E-Partner configurator, unselected postcode](https://configurator.peugeot.com.au/build-and-buy/build/vehicle/?dp=null&model_id=1588&trim_id=3283&variant_id=2400). Observed 2026-10-10.
- `r10_remainingvans_peugeot_eexpert_config`: [Peugeot Australia E-Expert configurator, official linked postcode 3000](https://configurator.peugeot.com.au/build-and-buy/build/vehicle/?model_id=889&dp=3000). Observed 2026-10-10.
- `r10_remainingvans_peugeot_partner_combined_page`: [Peugeot Australia combined petrol/electric Partner model page](https://www.peugeot.com.au/models/partner-van.html). Observed 2026-10-10.
## Source register

- `renault_kangoo_page`: [Renault Australia current Kangoo E-Tech page](https://www.renault.com.au/vehicles/kangoo-e-tech/). Published date unverified; observed 2026-10-10.
- `renault_kangoo_data`: [Public page-data for current Kangoo E-Tech model/configurator](https://www.renault.com.au/page-data/vehicles/kangoo-e-tech/page-data.json). Published date unverified; observed 2026-10-10.
- `renault_kangoo_brochure_data`: [Public brochure landing page-data with actual PDF link](https://www.renault.com.au/page-data/kangoo-e-tech-brochure/page-data.json). Published date unverified; observed 2026-10-10.
- `renault_master_page`: [Renault Australia Master E-Tech route (redirects to combined model page)](https://www.renault.com.au/vehicles/new-master-van-e-tech/). Published date unverified; observed 2026-10-10.
- `renault_master_shared`: [Renault Australia current combined Master model page](https://www.renault.com.au/vehicles/new-master-van/). Published date unverified; observed 2026-10-10.
- `renault_master_launch`: [Renault Australia MY26 Master price/specification announcement (16 June 2026)](https://www.renault.com.au/news/new-generation-renault-master-van-price-and-specs-confirmed-for-australia/4064/). Published 2026-06-16; observed 2026-10-10.
- `renault_kangoo_spec`: [Renault Australia Kangoo specification sheet, April 2026, REN1571](https://cdn.cms-uploads.i-motor.me/3ehi49lwrqk0up6mfmtifnd194rb). Published 2026-04; observed 2026-10-10.
- `renault_master_data`: [Public page-data for current Master model/configurator](https://www.renault.com.au/page-data/vehicles/new-master-van/page-data.json). Published date unverified; observed 2026-10-10.
- `renault_kangoo_brochure_latest`: [Renault Australia Kangoo brochure, official asset name Kangoo_MY26_Brochure.pdf, April 2026, REN1572](https://cdn.cms-uploads.i-motor.me/v6fbkwq8gztbplivhmua7vviu593). Published 2026-04; observed 2026-10-10.
- `renault_kangoo_brochure_landing`: [Identical Kangoo brochure linked from download landing](https://cdn.cms-uploads.i-motor.me/xsol8a3dq8wpow3yrw5uewhuu4h9). Published 2026-04; observed 2026-10-10.
- `renault_master_spec`: [Renault Australia Master MY26 specification sheet, May 2026, REN1576](https://cdn.cms-uploads.i-motor.me/0v18qkpsdeh5cmtoj06x40g9nwis). Published 2026-05; observed 2026-10-10.
- `renault_master_brochure`: [Renault Australia Master MY26 brochure, May 2026, REN1575](https://cdn.cms-uploads.i-motor.me/dolxhoxnbnp8ipzara5pmtms1pqo). Published 2026-05; observed 2026-10-10.
- `renault_warranty_current`: [Renault Australia current warranty policy](https://www.renault.com.au/warranty/). Published date unverified; observed 2026-10-10.
- `renault_offers_current`: [Renault Australia current special offers](https://www.renault.com.au/special-offers/). Published date unverified; observed 2026-10-10.
- `renault_peter_stock`: [Peter Warren Renault Kangoo model inventory](https://www.peterwarrenrenault.com.au/models/kangoo-e-tech). Published date unverified; observed 2026-10-10.
- `renault_peter_swb_34068`: [Peter Warren Renault NEW SWB stock T34068A](https://www.peterwarrenrenault.com.au/cars/new-mineral-white-solid-2025-renault-kangoo-e-tech-t34068a). Published date unverified; observed 2026-10-10.
- `renault_peter_lwb_demo`: [Peter Warren Renault DEMO LWB stock T33606A](https://www.peterwarrenrenault.com.au/cars/demo-mineral-white-solid-2025-renault-kangoo-e-tech-t33606a). Published date unverified; observed 2026-10-10.
- `renault_adrian_stock`: [Adrian Brien Renault current NEW inventory](https://www.adrianbrienrenault.com.au/stock/new-renault-for-sale-st-marys/). Published date unverified; observed 2026-10-10.
- `renault_adrian_lwb_22684`: [Adrian Brien historical LWB stock URL (redirects to inventory)](https://www.adrianbrienrenault.com.au/new-cars/for-sale/renault/kangoo-e-tech/2024/l2-ev45/xfk-my24/3805254/). Published date unverified; observed 2026-10-10.
- `renault_adrian_swb_22763`: [Adrian Brien Renault NEW SWB MY24 stock T22763](https://www.adrianbrienrenault.com.au/new-cars/for-sale/renault/kangoo-e-tech/2024/l1-ev45/xfk-my24/3805255/). Published date unverified; observed 2026-10-10.
- `web_stock_snapshot`: [Web-rendered Master order-only catalogue](https://www.carsales.com.au/cars/2026/renault/master-e-tech/4-doors/). Published date unverified; observed 2026-10-10.
- `web_master_orders`: [Web-rendered Master generic order templates](https://www.carsales.com.au/cars/details/2026-renault-master-e-tech-lwb-auto-my26/SHRM-AD-6541519/). Published date unverified; observed 2026-10-10.
- `web_final_search`: [Web search snapshots: same-VIN MY24 Kangoo and secondary MY26 catalogue](https://www.carsales.com.au/cars/details/2024-renault-kangoo-e-tech-l1-ev45-swb-auto-my24/OAG-AD-25545782/). Published date unverified; observed 2026-10-10.
- `peugeot_brochures`: [Peugeot Australia current brochure index](https://www.peugeot.com.au/tools/download-brochure.html). Published date unverified; observed 2026-10-10.
- `peugeot_epartner_page`: [Peugeot Australia current new E-Partner model page](https://www.peugeot.com.au/models/new-e-partner-van.html). Published date unverified; observed 2026-10-10.
- `peugeot_eexpert_page`: [Peugeot Australia current E-Expert model page](https://www.peugeot.com.au/models/expert-van/e-expert.html). Published date unverified; observed 2026-10-10.
- `peugeot_eexpert_spec`: [Peugeot Australia older E-Expert MY23 specification sheet, August 2024](https://www.peugeot.com.au/content/dam/peugeot/australia/models/expert/e-expert/Peugeot_E-Expert_MY23_Spec_Sheet_web.pdf). Published 2024-08; observed 2026-10-10.
- `peugeot_epartner_my23_spec`: [Peugeot Australia combined Partner/e-Partner MY23 specification sheet, December 2023](https://www.peugeot.com.au/content/dam/peugeot/australia/models/partner/e-partner/MY23_Partner_Spec_Sheet.pdf). Published 2023-12; observed 2026-10-10.
- `peugeot_eexpert_my24_spec`: [Peugeot Australia E-Expert MY24 specification sheet, November 2025](https://www.peugeot.com.au/content/dam/peugeot/australia/models/brochures/Peugeot_E-Expert_MY24_Spec_Sheet_1125.pdf). Published 2025-11; observed 2026-10-10.
- `peugeot_epartner_config`: [Peugeot Australia E-Partner configurator, unselected postcode](https://configurator.peugeot.com.au/build-and-buy/build/vehicle/?dp=null&model_id=1588&trim_id=3283&variant_id=2400). Published date unverified; observed 2026-10-10.
- `peugeot_eexpert_config`: [Peugeot Australia E-Expert configurator, official linked postcode 3000](https://configurator.peugeot.com.au/build-and-buy/build/vehicle/?model_id=889&dp=3000). Published date unverified; observed 2026-10-10.
- `peugeot_warranty`: [Peugeot Australia current warranty overview](https://www.peugeot.com.au/owners/warranty.html). Published date unverified; observed 2026-10-10.
- `peugeot_vans_offer`: [Peugeot Australia national commercial van driveaway offers](https://www.peugeot.com.au/buy/new-car-offers/vans.html). Published date unverified; observed 2026-10-10.
- `peugeot_partner_combined_page`: [Peugeot Australia combined petrol/electric Partner model page](https://www.peugeot.com.au/models/partner-van.html). Published date unverified; observed 2026-10-10.
- `peugeot_epartner_inchcape`: [Inchcape Peugeot Melbourne City E-Partner stock PE905999F original URL redirect](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-partner/2024/pro/k9-my24/3621599/). Published date unverified; observed 2026-10-10.
- `peugeot_eexpert_eastcoast`: [East Coast Peugeot old E-Expert stock 39047 detail URL, now 404](https://www.eastcoastpeugeot.com.au/cars/new-white-2024-peugeot-e-expert-39047). Published date unverified; observed 2026-10-10.
- `peugeot_bayside_stock`: [Bayside European current van inventory](https://www.baysideeuropean.com.au/search/van). Published date unverified; observed 2026-10-10.
- `stock_0`: [Inchcape Peugeot Melbourne City E-Partner NEW stock PE905999F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-partner/2023/pro/k9-my24/3621599/). Published date unverified; observed 2026-10-10.
- `stock_1`: [Inchcape Peugeot Melbourne City E-Partner NEW stock PE907870F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-partner/2023/pro/k9-my24/3621609/). Published date unverified; observed 2026-10-10.
- `stock_2`: [Inchcape Peugeot Melbourne City E-Partner DEMO stock PE501253](https://www.inchcapeautomotive.com.au/demo-cars/for-sale/peugeot/e-partner/2025/pro/k9-my25/3670057/). Published date unverified; observed 2026-10-10.
- `stock_3`: [Inchcape Peugeot Penrith E-Partner USED stock U155477](https://www.inchcapeautomotive.com.au/used-cars/for-sale/peugeot/e-partner/2023/pro/k9-my23/4076192/). Published date unverified; observed 2026-10-10.
- `stock_4`: [Inchcape Peugeot Melbourne City E-Expert NEW stock PE018750F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-expert/2024/pro/ek0/4038571/). Published date unverified; observed 2026-10-10.
- `stock_5`: [Inchcape Peugeot Melbourne City E-Expert NEW stock PE054918F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-expert/2024/pro/ek0/3934721/). Published date unverified; observed 2026-10-10.
- `peugeot_warranty_terms`: [Peugeot Australia linked general warranty terms](https://www.peugeot.com.au/content/dam/peugeot/australia/owners/documents/Peugeot-Warranty-terms-conditions_REV.pdf). Published date unverified; observed 2026-10-10.
- `peugeot_eastcoast_current_index`: [East Coast Peugeot current electric inventory query](https://www.eastcoastpeugeot.com.au/search/electric). Published date unverified; observed 2026-10-10.
- `peugeot_epartner_launch_2023`: [Peugeot Australia March 2023 E-Partner launch announcement](https://www.peugeot.com.au/brand/news/peugeot-s-electrification-journey-continues-with-e-partner.html). Published 2023-03; observed 2026-10-10.
- `peugeot_eexpert_4038571`: [Inchcape Peugeot Melbourne City E-Expert stock PE018750F second snapshot](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-expert/2024/pro/ek0/4038571/). Published date unverified; observed 2026-10-10.
- `peugeot_eexpert_3934721`: [Inchcape Peugeot Melbourne City E-Expert stock PE054918F second snapshot](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-expert/2024/pro/ek0/3934721/). Published date unverified; observed 2026-10-10.
- `peugeot_eexpert_3934809`: [Inchcape Peugeot Melbourne City E-Expert NEW stock PE042213F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-expert/2024/pro/ek0/3934809/). Published date unverified; observed 2026-10-10.
- `peugeot_eexpert_3934811`: [Inchcape Peugeot Melbourne City E-Expert NEW stock PE042606F](https://www.inchcapeautomotive.com.au/new-cars/for-sale/peugeot/e-expert/2024/pro/ek0/3934811/). Published date unverified; observed 2026-10-10.
- `peugeot_epartner_config_price`: [Peugeot Australia E-Partner configurator, official linked postcode 2765](https://configurator.peugeot.com.au/build-and-buy/build/vehicle/?model_id=1588&dp=2765). Published date unverified; observed 2026-10-10.
- `peugeot_partner_my26_spec`: [Peugeot Australia current MY26 petrol Partner specification sheet, excluded from BEV inheritance](https://www.peugeot.com.au/content/dam/peugeot/australia/models/partner/my26-partner/Peugeot_MY26_Partner_Spec_Sheet_HR-R.pdf). Published 2026-02; observed 2026-10-10.
- `ford_city_release`: [Electrified Ford Transit City Launched in Australia and New Zealand](https://www.fromtheroad.ford.com/img/en/articles/2026/electrified-ford-transit-city-revealed-australia-new-zealand). Published 2026-09-09; observed 2026-10-10.
- `ford_city_spec_my27`: [Ford Australia 2027MY Transit City specification brochure](https://www.ford.com.au/content/dam/na/ford/en_au/nameplate/transit-city/2026/overview/2027-my-transit-city-specs-08-sep.pdf). Published 2026-09-08; observed 2026-10-10.
- `ford_city_product`: [Ford Australia Transit City product page](https://www.ford.com.au/trucks-and-vans/transit-city/). Published date unverified; observed 2026-10-10.
- `ford_city_offers`: [Ford Australia latest offers](https://www.ford.com.au/latest-offers/). Published date unverified; observed 2026-10-10.
- `ford_city_linkedin`: [Ford Australia official launch post](https://www.linkedin.com/posts/ford-australia_forduncovered-broncobasecamp-transitcity-activity-7503180405055942656-x2F6). Published date unverified; observed 2026-10-10.
- `ford_app_compatibility`: [Ford Australia Ford App network compatibility](https://www.ford.com.au/fordpass/). Published date unverified; observed 2026-10-10.

## Actual shared-reader validation

- Actual catalogue(), effectiveFeatures() and research().sources produce six summaries and all 12 clauses through the unchanged shared reader
- All 150 executable guards exactly match current effective facts or formal MY, full identity snapshots and source metadata
- Every guarded fact value, status, unit, basis, comparisonBasis, market, scope, qualification, explanation, stale date, issue and source-membership mutation suppresses precisely dependent clauses; all formal-MY mutations suppress dependent records/clauses
- Both reader stages fail closed on every missing, stale, held, conflicted, access-limited or non-HTTP source
- Loss of current/order-listed record state or changed availability revision suppresses the exact record
- Changed/expired prices leave all technical clauses eligible within their independent freshness window
- All copy fails closed after the 30-day evidence window
- All six current-listed availability snapshots retain listed_unconfirmed orders and unverified exact stock; no older/unstated MY ad resolves technical equivalence
- Kangoo visible exact-electric table values win over hidden obsolete text; structured distance-recovery observations preserve unknown SOC endpoints
- Master H2-only bodies, unladen/tare/payload labels, 15–80% charging, unlimited warranty normalization and both mutually exclusive option conditions are intact
- E-Partner current-MY, seats, payload and extended-cargo holds; E-Expert range/cycle/AC-time/cargo/width holds; and both Peugeot 0–80% windows and station/vehicle distinctions are intact
- Targeted regressions reject hidden Kangoo payload, invented SOC endpoints, Master diesel height/option combinations and Peugeot conflict-filling
- Transit City remains audit-only/pre-delivery, outside all six executable summaries and dependencies

1852 mutation cases passed. 150 executable guards; 56 audit-only dependencies. All 455 mapped field values match, with two explicit Master unlimited-warranty normalizations.

Limitations:
- Source exact URL/publication/access dates and full identity/availability snapshots were audited against the effective catalogue; runtime guards enforce freshness and source eligibility, not exact equality of all source metadata.
- Runtime directly guards model year, exact variant ID, referenced fact scope/body/battery and current listing/revision. It does not directly guard arbitrary car labels or the nested stock/order status; all six such statuses are audited unverified/listed_unconfirmed and copy makes no stock or acceptance promise.
- Source-only conflict/raw-claim objects and source-less nulls remain audit-only. Executable sourced normalized-null facts and mandatory text preserve applicable holds.
- Pre-delivery Transit City has no bound current app record and is never passed to the eligible-summary builder.
- No application files edited, no publication performed, and no full application build/UI/browser tests claimed.

### Bound application identities

- `renault-kangoo-etech-swb-ev45-current-family` → `renault_kangoo_current__swb_ev45_90kw__20261010`
- `renault-kangoo-etech-lwb-ev45-current-family` → `renault_kangoo_current__lwb_ev45_90kw__20261010`
- `renault-master-etech-mwb-l2h2-ev87-my26` → `renault_master_my26__mwb_standard_roof_mid_roof_l2h2_ev87__20261010`
- `renault-master-etech-lwb-l3h2-ev87-my26` → `renault_master_my26__lwb_standard_roof_mid_roof_l3h2_ev87__20261010`
- `peugeot-e-partner-current-pro-long` → `peugeot_epartner_current__pro_long_auto__20261010`
- `peugeot-e-expert-my24-pro-long` → `peugeot_eexpert_my24__pro_long_auto__20261010`

### Final turning-circle import correction

All five sourced turning-circle facts now use metres. The four Renault guards bind the exact kerb-to-kerb basis; Peugeot’s unknown/unspecified measurement definitions remain unchanged. All 455 mapped values and the 1,852 mutation cases were rechecked after this correction.

Effective snapshot SHA-256: `cb6971807d20c99b4529f0aafcea84aed3e3284984e38baa2ed0ac0cd7a4fdbe`.
