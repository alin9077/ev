# Geely / Zeekr / XPENG buyer-copy proposal

Evidence checked 2026-10-10. Research-only: 12 current Australian-listed base configurations, 24 clauses, one separate factory package. Status: passed. No application files edited or publication claimed.

## Safe integration scope

EX2 Complete/Inspire; X MY26 RWD/AWD; 009 7-seat FWD/7-seat AWD/6-seat AWD; New G6 MY26 FFCP/FFAP/FFBP; X9 FWD Standard Range/AWD Performance.

EX5 and 7X remain existing refresh/override targets. Black Edition remains a factory package. SR 20-inch is an option configuration. Future/interest-only models remain excluded.

All 12 application identities are now bound and passed the actual effective-reader and shared-reader guard tests. Publication remains pending. Original research evidence and its validation remain preserved separately in the JSON.

## Buyer copy

### Geely EX2 Complete

Research identity: `geely_ex2_complete_au_launch_2026`  
Epoch: AU launch / July 2026 specification guide  
Formal MY: unconfirmed; retain null

**Strength — Small footprint, useful storage**
A 4,135 mm body and published 9.9 m turning circle suit tighter parking spaces, while Geely lists 375 L behind the upright second row and a separate 70 L frunk. Cargo measurement method is unspecified.

**Tradeoff — Less range than Inspire**
Complete has 252 km WLTP range versus Inspire’s 345 km, both on 16-inch wheels. It also omits Inspire’s heated front seats and surround-view camera, so the lower grade gives up both range and convenience.

Required qualifications:
- Use the Australian launch / July 2026 specification epoch. Formal MY remains unknown: the exact Complete stock ad says MY27 and Inspire says MY26; do not turn dealer labels into a family-wide MY or another trim.
- Battery capacities 35.35/47.14 kWh have no confirmed gross/usable basis. AC is 6.6 kW from the exact matrix; rounded 6 kW news copy does not override it.
- Complete and Inspire have 16-inch wheels. Published 252/345 km figures are WLTP; no verified charging SOC-duration pair is supplied.
- The guide gives 375 L with the second row up, 1,320 L folded and a separate 70 L frunk; measurement method is unspecified.
- Features marked unavailable are matrix-confirmed. Connected services remain activation/network/plan-dependent; no exact-unit activation is proven.

Availability: live_exact_NEW_advertisement. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [geely_ex2_brochure_1](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1784005758-geely-ex2-spec-sheet.pdf)

Dependency joins: `fact:geely_ex2_complete_au_launch_2026:facts.length_mm`, `fact:geely_ex2_complete_au_launch_2026:facts.turning_circle_m`, `fact:geely_ex2_complete_au_launch_2026:facts.rear_cargo_seats_up_l`, `fact:geely_ex2_complete_au_launch_2026:facts.frunk_l`, `fact:geely_ex2_complete_au_launch_2026:facts.range_km`, `fact:geely_ex2_complete_au_launch_2026:facts.range_cycle`, `fact:geely_ex2_complete_au_launch_2026:facts.wheel_diameter_in`, `fact:geely_ex2_inspire_au_launch_2026:facts.range_km`, `fact:geely_ex2_inspire_au_launch_2026:facts.range_cycle`, `fact:geely_ex2_inspire_au_launch_2026:facts.wheel_diameter_in`, `equipment:geely_ex2_complete_au_launch_2026:equipment.heated_front_seats`, `equipment:geely_ex2_complete_au_launch_2026:equipment.surround_camera`, `equipment:geely_ex2_inspire_au_launch_2026:equipment.heated_front_seats`, `equipment:geely_ex2_inspire_au_launch_2026:equipment.surround_camera`

### Geely EX2 Inspire

Research identity: `geely_ex2_inspire_au_launch_2026`  
Epoch: AU launch / July 2026 specification guide  
Formal MY: unconfirmed; retain null

**Strength — More range and everyday kit**
Inspire pairs 345 km WLTP range on 16-inch wheels with heated front seats, a surround-view camera and a powered tailgate, making it the better-equipped EX2 for daily errands.

**Tradeoff — AC charging still tops out at 6.6 kW**
The bigger battery does not bring a faster AC charger: Inspire has the same 6.6 kW AC maximum as Complete. Its DC maximum rises to 80 kW, but the supplied guide does not establish a 10–80% charging time.

Required qualifications:
- Use the Australian launch / July 2026 specification epoch. Formal MY remains unknown: the exact Complete stock ad says MY27 and Inspire says MY26; do not turn dealer labels into a family-wide MY or another trim.
- Battery capacities 35.35/47.14 kWh have no confirmed gross/usable basis. AC is 6.6 kW from the exact matrix; rounded 6 kW news copy does not override it.
- Complete and Inspire have 16-inch wheels. Published 252/345 km figures are WLTP; no verified charging SOC-duration pair is supplied.
- The guide gives 375 L with the second row up, 1,320 L folded and a separate 70 L frunk; measurement method is unspecified.
- Features marked unavailable are matrix-confirmed. Connected services remain activation/network/plan-dependent; no exact-unit activation is proven.

Availability: live_exact_NEW_advertisement. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [geely_ex2_brochure_1](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1784005758-geely-ex2-spec-sheet.pdf)

Dependency joins: `fact:geely_ex2_inspire_au_launch_2026:facts.range_km`, `fact:geely_ex2_inspire_au_launch_2026:facts.range_cycle`, `fact:geely_ex2_inspire_au_launch_2026:facts.wheel_diameter_in`, `equipment:geely_ex2_inspire_au_launch_2026:equipment.heated_front_seats`, `equipment:geely_ex2_inspire_au_launch_2026:equipment.surround_camera`, `equipment:geely_ex2_inspire_au_launch_2026:equipment.power_tailgate`, `equipment:geely_ex2_complete_au_launch_2026:equipment.heated_front_seats`, `equipment:geely_ex2_complete_au_launch_2026:equipment.surround_camera`, `equipment:geely_ex2_complete_au_launch_2026:equipment.power_tailgate`, `fact:geely_ex2_inspire_au_launch_2026:facts.battery_declared_kwh`, `fact:geely_ex2_inspire_au_launch_2026:facts.battery_capacity_basis`, `fact:geely_ex2_inspire_au_launch_2026:facts.ac_max_kw`, `fact:geely_ex2_complete_au_launch_2026:facts.battery_declared_kwh`, `fact:geely_ex2_complete_au_launch_2026:facts.battery_capacity_basis`, `fact:geely_ex2_complete_au_launch_2026:facts.ac_max_kw`, `fact:geely_ex2_inspire_au_launch_2026:facts.dc_max_kw`, `fact:geely_ex2_inspire_au_launch_2026:facts.dc_10_80_minutes`, `fact:geely_ex2_inspire_au_launch_2026:facts.dc_window`

### Zeekr X RWD

Research identity: `zeekr_x_rwd_my26`  
Epoch: MY26 Australian refresh  
Formal MY: 2026

**Strength — Comfort kit in the entry grade**
The MY26 RWD includes heated and ventilated power front seats, 13-speaker Yamaha audio and a powered tailgate. Those everyday comfort features do not require the AWD upgrade.

**Tradeoff — AWD keeps the extra cabin features**
The RWD omits the AWD’s head-up display, front-seat massage and factory fridge. Its AC maximum is also 11 kW, versus the AWD’s 22 kW when a compatible AC supply is available.

Required qualifications:
- This is the MY26 Australian X: RWD 61 kWh LFP / 250 kW / 19-inch; AWD 66 kWh NMC / 365 kW / 20-inch. Do not inherit older RWD or foreign specifications.
- Battery capacity is declared without gross/usable basis. RWD 405 km and AWD 415 km remain WLTP values on their exact wheel configurations.
- RWD 230 kW and AWD 150 kW are manufacturer vehicle DC maxima. Exact primary 10–80% durations remain unknown; a higher peak does not establish a shorter charging stop.
- Automatic front doors are optional on AWD, not standard. Black forged 20-inch wheels are tied to the Black & Red interior option. The brochure’s V2L unit is 3.3 kW; do not copy the webpage kWh typo.
- RWD exact NEW stock is unverified in this evidence; AWD has a dated live exact NEW ad. Neither is a present delivery promise.

Availability: unverified. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [zeekr_x_my26_pdf](https://resource.digitaldealer.com.au/pdf/149970842769e5759ccb67f704111430.pdf)
- [zeekr_x](https://www.zeekrlife.com/en-au/models/new-zeekr-x/)

Dependency joins: `equipment:zeekr_x_rwd_my26:equipment.heated_front_seats`, `equipment:zeekr_x_rwd_my26:equipment.power_front_seats_6way_memory_lumbar_ventilated`, `equipment:zeekr_x_rwd_my26:equipment.speaker_count`, `equipment:zeekr_x_rwd_my26:equipment.audio_brand`, `equipment:zeekr_x_rwd_my26:equipment.power_tailgate`, `equipment:zeekr_x_awd_my26:equipment.heated_front_seats`, `equipment:zeekr_x_awd_my26:equipment.power_front_seats_6way_memory_lumbar_ventilated`, `equipment:zeekr_x_awd_my26:equipment.speaker_count`, `equipment:zeekr_x_awd_my26:equipment.audio_brand`, `equipment:zeekr_x_awd_my26:equipment.power_tailgate`, `equipment:zeekr_x_rwd_my26:equipment.head_up_display_standard`, `equipment:zeekr_x_rwd_my26:equipment.front_seat_massage`, `equipment:zeekr_x_rwd_my26:equipment.fridge`, `equipment:zeekr_x_awd_my26:equipment.head_up_display_standard`, `equipment:zeekr_x_awd_my26:equipment.front_seat_massage`, `equipment:zeekr_x_awd_my26:equipment.fridge`, `fact:zeekr_x_rwd_my26:facts.ac_max_kw`, `fact:zeekr_x_awd_my26:facts.ac_max_kw`

### Zeekr X AWD

Research identity: `zeekr_x_awd_my26`  
Epoch: MY26 Australian refresh  
Formal MY: 2026

**Strength — Acceleration with 22 kW AC**
The MY26 AWD combines a manufacturer-claimed 3.7-second 0–100 km/h time with 22 kW AC capability and standard front-seat massage, useful if you want performance plus comfort and have suitable AC charging.

**Tradeoff — Lower DC peak than the RWD**
Its published DC maximum is 150 kW, below the MY26 RWD’s 230 kW. That is a peak-power comparison only: no exact primary 10–80% charging time was verified for either grade.

Required qualifications:
- This is the MY26 Australian X: RWD 61 kWh LFP / 250 kW / 19-inch; AWD 66 kWh NMC / 365 kW / 20-inch. Do not inherit older RWD or foreign specifications.
- Battery capacity is declared without gross/usable basis. RWD 405 km and AWD 415 km remain WLTP values on their exact wheel configurations.
- RWD 230 kW and AWD 150 kW are manufacturer vehicle DC maxima. Exact primary 10–80% durations remain unknown; a higher peak does not establish a shorter charging stop.
- Automatic front doors are optional on AWD, not standard. Black forged 20-inch wheels are tied to the Black & Red interior option. The brochure’s V2L unit is 3.3 kW; do not copy the webpage kWh typo.
- RWD exact NEW stock is unverified in this evidence; AWD has a dated live exact NEW ad. Neither is a present delivery promise.

Availability: live_exact_NEW_advertisement. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [zeekr_x_my26_pdf](https://resource.digitaldealer.com.au/pdf/149970842769e5759ccb67f704111430.pdf)
- [zeekr_x](https://www.zeekrlife.com/en-au/models/new-zeekr-x/)

Dependency joins: `fact:zeekr_x_awd_my26:facts.drive`, `fact:zeekr_x_awd_my26:facts.zero_to_100_s`, `fact:zeekr_x_awd_my26:facts.ac_max_kw`, `equipment:zeekr_x_awd_my26:equipment.front_seat_massage`, `fact:zeekr_x_awd_my26:facts.dc_max_kw`, `fact:zeekr_x_awd_my26:facts.dc_10_80_minutes`, `fact:zeekr_x_rwd_my26:facts.dc_max_kw`, `fact:zeekr_x_rwd_my26:facts.dc_10_80_minutes`

### Zeekr 009 7-seat FWD

Research identity: `zeekr_009_7seat_fwd_au_116kwh`  
Epoch: Current AU 116kWh / 400V specification; July 2026 brochure update  
Formal MY: unconfirmed; retain null

**Strength — Seven seats with 604 km WLTP**
The 7-seat FWD combines a published 604 km WLTP range on 19-inch wheels with standard dual-chamber air suspension and second-row ventilation and massage, a useful family-travel specification.

**Tradeoff — Seat heating requires AWD**
Despite its ventilation and massage equipment, the FWD omits heated front seats, second-row seat heating and a heated steering wheel. The current Australian matrix lists those features on the AWD grades.

Required qualifications:
- Use the current Australian 116 kWh / 400 V July 2026 brochure epoch and exact 7-seat FWD, 7-seat AWD or 6-seat AWD identity. Formal family MY remains unknown.
- The current brochure specifies 30 minutes from 10–80% using a 150 kW DC charger. The 150 kW value is a station/test condition, not verified vehicle peak; peak must remain null. Older 205 kW charger-condition copy is retained as superseded source conflict, not a new vehicle epoch.
- FWD 604 km WLTP uses 19-inch wheels; AWD 582 km uses 20-inch wheels. Declared 116 kWh capacity is not explicitly gross or usable.
- The 574–2,979 L interval lacks verified seating and measurement conditions. Do not flatten it into a standard seats-up/folded cargo pair.
- 7-seat AWD has current official listing but no freshly verified exact NEW ad; FWD 7-seat and AWD 6-seat have dated live NEW advertisements.

Availability: live_exact_NEW_advertisement. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [zeekr_009_current_pdf](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1788760937-zeekr-009-brochure.pdf)

Dependency joins: `fact:zeekr_009_7seat_fwd_au_116kwh:facts.seats`, `fact:zeekr_009_7seat_fwd_au_116kwh:facts.range_km`, `fact:zeekr_009_7seat_fwd_au_116kwh:facts.range_cycle`, `fact:zeekr_009_7seat_fwd_au_116kwh:facts.wheel_diameter_in`, `equipment:zeekr_009_7seat_fwd_au_116kwh:equipment.air_suspension_dual_chamber_ccd`, `equipment:zeekr_009_7seat_fwd_au_116kwh:equipment.second_row_ventilation_massage_memory`, `equipment:zeekr_009_7seat_fwd_au_116kwh:equipment.heated_front_seats`, `equipment:zeekr_009_7seat_fwd_au_116kwh:equipment.second_row_heating`, `equipment:zeekr_009_7seat_fwd_au_116kwh:equipment.heated_steering_wheel`, `equipment:zeekr_009_7seat_awd_au_116kwh:equipment.heated_front_seats`, `equipment:zeekr_009_7seat_awd_au_116kwh:equipment.second_row_heating`, `equipment:zeekr_009_7seat_awd_au_116kwh:equipment.heated_steering_wheel`, `equipment:zeekr_009_6seat_awd_au_116kwh:equipment.heated_front_seats`, `equipment:zeekr_009_6seat_awd_au_116kwh:equipment.second_row_heating`, `equipment:zeekr_009_6seat_awd_au_116kwh:equipment.heated_steering_wheel`

### Zeekr 009 7-seat AWD

Research identity: `zeekr_009_7seat_awd_au_116kwh`  
Epoch: Current AU 116kWh / 400V specification; July 2026 brochure update  
Formal MY: unconfirmed; retain null

**Strength — Seven seats without losing AWD pace**
The 7-seat AWD retains a seven-person layout while adding 450 kW and a manufacturer-claimed 4.5-second 0–100 km/h time. Heated front and second-row seats add equipment the FWD lacks.

**Tradeoff — Less rated range than the FWD**
The 7-seat AWD is rated at 582 km WLTP on its 20-inch wheels, versus 604 km for the 7-seat FWD on 19-inch wheels. The extra performance comes with lower published range; these are standard-configuration test figures.

Required qualifications:
- Use the current Australian 116 kWh / 400 V July 2026 brochure epoch and exact 7-seat FWD, 7-seat AWD or 6-seat AWD identity. Formal family MY remains unknown.
- The current brochure specifies 30 minutes from 10–80% using a 150 kW DC charger. The 150 kW value is a station/test condition, not verified vehicle peak; peak must remain null. Older 205 kW charger-condition copy is retained as superseded source conflict, not a new vehicle epoch.
- FWD 604 km WLTP uses 19-inch wheels; AWD 582 km uses 20-inch wheels. Declared 116 kWh capacity is not explicitly gross or usable.
- The 574–2,979 L interval lacks verified seating and measurement conditions. Do not flatten it into a standard seats-up/folded cargo pair.
- 7-seat AWD has current official listing but no freshly verified exact NEW ad; FWD 7-seat and AWD 6-seat have dated live NEW advertisements.

Availability: unverified. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [zeekr_009_current_pdf](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1788760937-zeekr-009-brochure.pdf)

Dependency joins: `fact:zeekr_009_7seat_awd_au_116kwh:facts.seats`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.drive`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.power_kw`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.zero_to_100_s`, `equipment:zeekr_009_7seat_awd_au_116kwh:equipment.heated_front_seats`, `equipment:zeekr_009_7seat_awd_au_116kwh:equipment.second_row_heating`, `equipment:zeekr_009_7seat_fwd_au_116kwh:equipment.heated_front_seats`, `equipment:zeekr_009_7seat_fwd_au_116kwh:equipment.second_row_heating`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.range_km`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.range_cycle`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.wheel_diameter_in`, `fact:zeekr_009_7seat_fwd_au_116kwh:facts.range_km`, `fact:zeekr_009_7seat_fwd_au_116kwh:facts.range_cycle`, `fact:zeekr_009_7seat_fwd_au_116kwh:facts.wheel_diameter_in`, `fact:zeekr_009_7seat_fwd_au_116kwh:facts.seats`

### Zeekr 009 6-seat AWD

Research identity: `zeekr_009_6seat_awd_au_116kwh`  
Epoch: Current AU 116kWh / 400V specification; July 2026 brochure update  
Formal MY: unconfirmed; retain null

**Strength — Second-row seat upgrades**
The 6-seat AWD adds Sofaro second-row seats, seat tables and heated leg rests. Those passenger-comfort upgrades come with the same declared 116 kWh battery capacity and 450 kW output as the 7-seat AWD.

**Tradeoff — One fewer passenger place**
Choosing the 2+2+2 layout reduces capacity to six people rather than the 7-seat AWD’s 2+2+3 layout. Both publish the same 582 km WLTP range on 20-inch wheels, so the seating upgrade does not bring a stated range gain.

Required qualifications:
- Use the current Australian 116 kWh / 400 V July 2026 brochure epoch and exact 7-seat FWD, 7-seat AWD or 6-seat AWD identity. Formal family MY remains unknown.
- The current brochure specifies 30 minutes from 10–80% using a 150 kW DC charger. The 150 kW value is a station/test condition, not verified vehicle peak; peak must remain null. Older 205 kW charger-condition copy is retained as superseded source conflict, not a new vehicle epoch.
- FWD 604 km WLTP uses 19-inch wheels; AWD 582 km uses 20-inch wheels. Declared 116 kWh capacity is not explicitly gross or usable.
- The 574–2,979 L interval lacks verified seating and measurement conditions. Do not flatten it into a standard seats-up/folded cargo pair.
- 7-seat AWD has current official listing but no freshly verified exact NEW ad; FWD 7-seat and AWD 6-seat have dated live NEW advertisements.

Availability: live_exact_NEW_advertisement. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [zeekr_009_current_pdf](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1788760937-zeekr-009-brochure.pdf)

Dependency joins: `equipment:zeekr_009_6seat_awd_au_116kwh:equipment.second_row_sofaro_captain_seats`, `equipment:zeekr_009_6seat_awd_au_116kwh:equipment.second_row_tables`, `equipment:zeekr_009_6seat_awd_au_116kwh:equipment.second_row_legrest_heating`, `equipment:zeekr_009_7seat_awd_au_116kwh:equipment.second_row_sofaro_captain_seats`, `equipment:zeekr_009_7seat_awd_au_116kwh:equipment.second_row_tables`, `equipment:zeekr_009_7seat_awd_au_116kwh:equipment.second_row_legrest_heating`, `fact:zeekr_009_6seat_awd_au_116kwh:facts.battery_declared_kwh`, `fact:zeekr_009_6seat_awd_au_116kwh:facts.battery_capacity_basis`, `fact:zeekr_009_6seat_awd_au_116kwh:facts.drive`, `fact:zeekr_009_6seat_awd_au_116kwh:facts.power_kw`, `fact:zeekr_009_6seat_awd_au_116kwh:facts.torque_nm`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.battery_declared_kwh`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.battery_capacity_basis`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.drive`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.power_kw`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.torque_nm`, `fact:zeekr_009_6seat_awd_au_116kwh:facts.seats`, `fact:zeekr_009_6seat_awd_au_116kwh:facts.range_km`, `fact:zeekr_009_6seat_awd_au_116kwh:facts.range_cycle`, `fact:zeekr_009_6seat_awd_au_116kwh:facts.wheel_diameter_in`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.seats`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.range_km`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.range_cycle`, `fact:zeekr_009_7seat_awd_au_116kwh:facts.wheel_diameter_in`, `equipment:zeekr_009_6seat_awd_au_116kwh:equipment.seating_layout`, `equipment:zeekr_009_7seat_awd_au_116kwh:equipment.seating_layout`

### XPENG New G6 RWD Standard Range

Research identity: `xpeng_new_g6_ffcp_my26`  
Epoch: MY26 / Gen2; configurator carSeriesId 1761, F30bR  
Formal MY: 2026

**Strength — Fast-charge specification in the base grade**
The MY26 Standard Range publishes 480 km WLTP on standard 18-inch wheels and a 12-minute 10–80% DC charge, with a 382 kW peak. Those charging figures require suitable conditions and compatible high-power equipment.

**Tradeoff — The 20-inch option reduces rated range**
Optional 20-inch wheels change Standard Range’s WLTP figure to 470 km from 480 km on standard 18-inch wheels, and published consumption to 16.9 from 16.6 kWh/100 km. Keep the chosen wheel package attached to the range claim.

Required qualifications:
- Use MY26 / Gen2, configurator carSeriesId 1761, F30bR and the exact FFCP/FFAP/FFBP powertrain. No original 66 kWh/210 kW Standard Range or NCM Long Range inheritance.
- Exact configurator wheel figures control: SR 18-inch 480 km/16.6 kWh per 100 km; optional 20-inch 470 km/16.9; LR 20-inch 525 km/17.9; AWD 20-inch 510 km/18.4. Official editorial page reversals remain a source conflict.
- 68.5/80.8 kWh are explicitly gross LFP values; usable capacity remains unknown. All published DC durations refer to 10–80%; AC durations refer to 5–100%, not 0–100%.
- The 12-minute DC figure and acceleration figures are manufacturer test claims. Actual charging varies with initial SOC, battery/ambient temperature, battery condition, charger and vehicle condition; production-month specification caveat remains attached.
- SR/LR NEW ads verify grade and VIN, but do not independently resolve Gen2 pack/output/wheel. Performance’s ad explicitly identifies Gen2. No unqualified exact-epoch in-stock label for SR/LR.
- Displayed prices retain unresolved on-road treatment. Black Edition is an optional AWD factory package, not a fourth base powertrain; detailed package equipment and fresh live NEW stock remain unverified.
- Unresolved equipment footnotes, especially auto lane change and remote parking, stay conditional. Remote parking must comply with Australian road rules; absence from the captured table is not proof a feature is missing.

Availability: live_NEW_exact_grade_ad_epoch_not_exactly_resolved. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [xpeng_g6_config](https://store.xpeng.com/au/configurator/New_G6R)

Dependency joins: `fact:xpeng_new_g6_ffcp_my26:facts.range_km`, `fact:xpeng_new_g6_ffcp_my26:facts.range_cycle`, `fact:xpeng_new_g6_ffcp_my26:facts.range_wheel_in`, `fact:xpeng_new_g6_ffcp_my26:facts.wheel_diameter_in`, `fact:xpeng_new_g6_ffcp_my26:facts.dc_10_80_minutes`, `fact:xpeng_new_g6_ffcp_my26:facts.dc_max_kw`, `option_configuration:xpeng_new_g6_ffcp_my26:wheel_configurations`

### XPENG New G6 RWD Long Range

Research identity: `xpeng_new_g6_ffap_my26`  
Epoch: MY26 / Gen2; configurator carSeriesId 1761, F30bR  
Formal MY: 2026

**Strength — 525 km with 451 kW DC**
The MY26 Long Range combines 525 km WLTP on standard 20-inch wheels with a published 451 kW DC peak and 12-minute 10–80% charge. It is the range-focused G6 choice, subject to the manufacturer’s charging-test conditions.

**Tradeoff — Performance is the quicker G6**
Long Range’s published 0–100 km/h time is 6.7 seconds, compared with 4.13 seconds for AWD Performance. Its 218 kW rear-drive setup prioritises the longer rated range over the AWD’s 358 kW acceleration specification.

Required qualifications:
- Use MY26 / Gen2, configurator carSeriesId 1761, F30bR and the exact FFCP/FFAP/FFBP powertrain. No original 66 kWh/210 kW Standard Range or NCM Long Range inheritance.
- Exact configurator wheel figures control: SR 18-inch 480 km/16.6 kWh per 100 km; optional 20-inch 470 km/16.9; LR 20-inch 525 km/17.9; AWD 20-inch 510 km/18.4. Official editorial page reversals remain a source conflict.
- 68.5/80.8 kWh are explicitly gross LFP values; usable capacity remains unknown. All published DC durations refer to 10–80%; AC durations refer to 5–100%, not 0–100%.
- The 12-minute DC figure and acceleration figures are manufacturer test claims. Actual charging varies with initial SOC, battery/ambient temperature, battery condition, charger and vehicle condition; production-month specification caveat remains attached.
- SR/LR NEW ads verify grade and VIN, but do not independently resolve Gen2 pack/output/wheel. Performance’s ad explicitly identifies Gen2. No unqualified exact-epoch in-stock label for SR/LR.
- Displayed prices retain unresolved on-road treatment. Black Edition is an optional AWD factory package, not a fourth base powertrain; detailed package equipment and fresh live NEW stock remain unverified.
- Unresolved equipment footnotes, especially auto lane change and remote parking, stay conditional. Remote parking must comply with Australian road rules; absence from the captured table is not proof a feature is missing.

Availability: live_NEW_exact_grade_ad_epoch_not_exactly_resolved. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [xpeng_g6_config](https://store.xpeng.com/au/configurator/New_G6R)

Dependency joins: `fact:xpeng_new_g6_ffap_my26:facts.range_km`, `fact:xpeng_new_g6_ffap_my26:facts.range_cycle`, `fact:xpeng_new_g6_ffap_my26:facts.range_wheel_in`, `fact:xpeng_new_g6_ffap_my26:facts.wheel_diameter_in`, `fact:xpeng_new_g6_ffap_my26:facts.dc_max_kw`, `fact:xpeng_new_g6_ffap_my26:facts.dc_10_80_minutes`, `fact:xpeng_new_g6_ffcp_my26:facts.range_km`, `fact:xpeng_new_g6_ffcp_my26:facts.range_cycle`, `fact:xpeng_new_g6_ffcp_my26:facts.range_wheel_in`, `fact:xpeng_new_g6_ffbp_my26:facts.range_km`, `fact:xpeng_new_g6_ffbp_my26:facts.range_cycle`, `fact:xpeng_new_g6_ffbp_my26:facts.range_wheel_in`, `fact:xpeng_new_g6_ffap_my26:facts.zero_to_100_s`, `fact:xpeng_new_g6_ffap_my26:facts.power_kw`, `fact:xpeng_new_g6_ffap_my26:facts.drive`, `fact:xpeng_new_g6_ffbp_my26:facts.zero_to_100_s`, `fact:xpeng_new_g6_ffbp_my26:facts.power_kw`, `fact:xpeng_new_g6_ffbp_my26:facts.drive`

### XPENG New G6 AWD Performance

Research identity: `xpeng_new_g6_ffbp_my26`  
Epoch: MY26 / Gen2; configurator carSeriesId 1761, F30bR  
Formal MY: 2026

**Strength — The acceleration-focused G6**
The MY26 AWD Performance delivers a published 358 kW and a manufacturer-claimed 4.13-second 0–100 km/h time, while retaining the Long Range’s 80.8 kWh gross LFP battery and 451 kW DC maximum.

**Tradeoff — Some range goes to performance**
AWD Performance’s 510 km WLTP figure is below Long Range’s 525 km, both on standard 20-inch wheels. Published consumption is also higher at 18.4 versus 17.9 kWh/100 km; actual results vary.

Required qualifications:
- Use MY26 / Gen2, configurator carSeriesId 1761, F30bR and the exact FFCP/FFAP/FFBP powertrain. No original 66 kWh/210 kW Standard Range or NCM Long Range inheritance.
- Exact configurator wheel figures control: SR 18-inch 480 km/16.6 kWh per 100 km; optional 20-inch 470 km/16.9; LR 20-inch 525 km/17.9; AWD 20-inch 510 km/18.4. Official editorial page reversals remain a source conflict.
- 68.5/80.8 kWh are explicitly gross LFP values; usable capacity remains unknown. All published DC durations refer to 10–80%; AC durations refer to 5–100%, not 0–100%.
- The 12-minute DC figure and acceleration figures are manufacturer test claims. Actual charging varies with initial SOC, battery/ambient temperature, battery condition, charger and vehicle condition; production-month specification caveat remains attached.
- SR/LR NEW ads verify grade and VIN, but do not independently resolve Gen2 pack/output/wheel. Performance’s ad explicitly identifies Gen2. No unqualified exact-epoch in-stock label for SR/LR.
- Displayed prices retain unresolved on-road treatment. Black Edition is an optional AWD factory package, not a fourth base powertrain; detailed package equipment and fresh live NEW stock remain unverified.
- Unresolved equipment footnotes, especially auto lane change and remote parking, stay conditional. Remote parking must comply with Australian road rules; absence from the captured table is not proof a feature is missing.

Availability: live_exact_NEW_advertisement. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [xpeng_g6_config](https://store.xpeng.com/au/configurator/New_G6R)

Dependency joins: `fact:xpeng_new_g6_ffbp_my26:facts.power_kw`, `fact:xpeng_new_g6_ffbp_my26:facts.zero_to_100_s`, `fact:xpeng_new_g6_ffbp_my26:facts.drive`, `fact:xpeng_new_g6_ffbp_my26:facts.battery_gross_kwh`, `fact:xpeng_new_g6_ffbp_my26:facts.battery_chemistry`, `fact:xpeng_new_g6_ffbp_my26:facts.dc_max_kw`, `fact:xpeng_new_g6_ffap_my26:facts.battery_gross_kwh`, `fact:xpeng_new_g6_ffap_my26:facts.battery_chemistry`, `fact:xpeng_new_g6_ffap_my26:facts.dc_max_kw`, `fact:xpeng_new_g6_ffbp_my26:facts.range_km`, `fact:xpeng_new_g6_ffbp_my26:facts.range_cycle`, `fact:xpeng_new_g6_ffbp_my26:facts.range_wheel_in`, `fact:xpeng_new_g6_ffbp_my26:facts.wheel_diameter_in`, `fact:xpeng_new_g6_ffbp_my26:facts.consumption_kwh_100km`, `fact:xpeng_new_g6_ffap_my26:facts.range_km`, `fact:xpeng_new_g6_ffap_my26:facts.range_cycle`, `fact:xpeng_new_g6_ffap_my26:facts.range_wheel_in`, `fact:xpeng_new_g6_ffap_my26:facts.wheel_diameter_in`, `fact:xpeng_new_g6_ffap_my26:facts.consumption_kwh_100km`

### XPENG X9 FWD Standard Range

Research identity: `xpeng_x9_fwd_au_launch_2026`  
Epoch: Australian launch 21 July 2026  
Formal MY: unconfirmed; retain null

**Strength — Luggage room with all seven seats up**
The Australian launch specification lists 721 L of luggage space with all seven seats in use, plus 6 kW V2L capability for compatible external equipment. The cargo measurement method is unspecified, so check critical luggage fit.

**Tradeoff — Less rated range; DC time unconfirmed**
The FWD is rated at 535 km WLTP versus the AWD’s 580 km. Its exact DC peak and 10–80% time remain unverified in the supplied Australian evidence, so the AWD’s 542 kW and 12-minute claims must not be used for this grade.

Required qualifications:
- Use the Australian launch of 21 July 2026. Orders were explicitly open, but “deliveries commencing shortly” is not a fulfilled delivery date. Formal family MY remains null; dealer MY26 wording is not enough.
- FWD has declared 94.8 kWh LFP and 535 km WLTP; AWD has 110 kWh NCM and 580 km WLTP. Gross/usable battery basis and exact wheels remain unknown.
- 542 kW peak and 12-minute 10–80% charging apply to AWD only. FWD DC peak/time remain null. Both list 11 kW AC; do not derive a full-charge AC time from declared capacity.
- The 721 L claim explicitly uses all seven seats; 2,554 L is maximum cargo. Measurement method remains unspecified.
- Active rear steering, dual-chamber air suspension and other launch-family equipment remain conditional on final Australian specification/availability, not confirmed VIN-level fitment. Do not relabel them unconditional standard equipment.
- Exact dimensions, towing and FWD acceleration remain unknown. Do not substitute overseas X9 specifications.

Availability: live_exact_NEW_advertisement. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [xpeng_x9_launch](https://www.xpeng.com/au/news/019fa2860f529f8481378a02820600b3)

Dependency joins: `fact:xpeng_x9_fwd_au_launch_2026:facts.seats`, `fact:xpeng_x9_fwd_au_launch_2026:facts.rear_cargo_seven_seats_up_l`, `fact:xpeng_x9_fwd_au_launch_2026:facts.v2l_max_kw`, `fact:xpeng_x9_fwd_au_launch_2026:facts.range_km`, `fact:xpeng_x9_fwd_au_launch_2026:facts.range_cycle`, `fact:xpeng_x9_fwd_au_launch_2026:facts.dc_max_kw`, `fact:xpeng_x9_fwd_au_launch_2026:facts.dc_10_80_minutes`, `fact:xpeng_x9_awd_au_launch_2026:facts.range_km`, `fact:xpeng_x9_awd_au_launch_2026:facts.range_cycle`, `fact:xpeng_x9_awd_au_launch_2026:facts.dc_max_kw`, `fact:xpeng_x9_awd_au_launch_2026:facts.dc_10_80_minutes`

### XPENG X9 AWD Performance

Research identity: `xpeng_x9_awd_au_launch_2026`  
Epoch: Australian launch 21 July 2026  
Formal MY: unconfirmed; retain null

**Strength — Long-range seven-seat charging figures**
The AWD combines seven seats and 580 km WLTP range with a claimed DC peak of up to 542 kW and a 10–80% recharge in as little as 12 minutes under test conditions. Compatible high-power charging and suitable battery conditions are essential.

**Tradeoff — Large battery, unchanged AC limit**
The AWD’s declared 110 kWh battery still has an 11 kW AC charging maximum, the same AC limit as the 94.8 kWh FWD. Its very high DC peak does not increase home AC charging power; no full-charge AC duration is established here.

Required qualifications:
- Use the Australian launch of 21 July 2026. Orders were explicitly open, but “deliveries commencing shortly” is not a fulfilled delivery date. Formal family MY remains null; dealer MY26 wording is not enough.
- FWD has declared 94.8 kWh LFP and 535 km WLTP; AWD has 110 kWh NCM and 580 km WLTP. Gross/usable battery basis and exact wheels remain unknown.
- 542 kW peak and 12-minute 10–80% charging apply to AWD only. FWD DC peak/time remain null. Both list 11 kW AC; do not derive a full-charge AC time from declared capacity.
- The 721 L claim explicitly uses all seven seats; 2,554 L is maximum cargo. Measurement method remains unspecified.
- Active rear steering, dual-chamber air suspension and other launch-family equipment remain conditional on final Australian specification/availability, not confirmed VIN-level fitment. Do not relabel them unconditional standard equipment.
- Exact dimensions, towing and FWD acceleration remain unknown. Do not substitute overseas X9 specifications.

Availability: live_exact_NEW_advertisement. A live NEW advertisement supports advertised stock at the check time, not a guarantee the vehicle remains unsold or a dealer allocation/delivery promise.

Evidence:
- [xpeng_x9_launch](https://www.xpeng.com/au/news/019fa2860f529f8481378a02820600b3)

Dependency joins: `fact:xpeng_x9_awd_au_launch_2026:facts.seats`, `fact:xpeng_x9_awd_au_launch_2026:facts.range_km`, `fact:xpeng_x9_awd_au_launch_2026:facts.range_cycle`, `fact:xpeng_x9_awd_au_launch_2026:facts.dc_max_kw`, `fact:xpeng_x9_awd_au_launch_2026:facts.dc_10_80_minutes`, `fact:xpeng_x9_awd_au_launch_2026:facts.battery_declared_kwh`, `fact:xpeng_x9_awd_au_launch_2026:facts.battery_capacity_basis`, `fact:xpeng_x9_awd_au_launch_2026:facts.ac_max_kw`, `fact:xpeng_x9_fwd_au_launch_2026:facts.battery_declared_kwh`, `fact:xpeng_x9_fwd_au_launch_2026:facts.battery_capacity_basis`, `fact:xpeng_x9_fwd_au_launch_2026:facts.ac_max_kw`

## Shared boundaries

- Copy is a buyer-use interpretation of published Australian specifications, not a road test, handling verdict, safety outcome, market-leading assertion or whole-vehicle recommendation.
- WLTP is a laboratory comparison cycle, not a real-world, fully laden or motorway-range guarantee. Retain the exact grade, specification epoch and wheel-dependent range.
- Charging maxima are vehicle acceptance limits only where explicitly established. They are not sustained rates, charge durations or charger-network promises. Exact charge windows and manufacturer conditions remain mandatory.
- A saved live NEW advertisement is a dated advertisement, not physical inspection, proof of an unsold unit, stock allocation, accepted factory order or guaranteed delivery.
- Unknown is not zero, false or absent. Do not fill gaps from siblings, earlier epochs, overseas models or generic dealer templates.
- Published cargo capacity must keep its seating context and unknown measurement method. Do not rank unlike cargo measurements.
- Prices, warranty and availability remain separately qualified context and are absent from the strength/tradeoff lead copy.
- Zeekr private-use warranty figures are supported by the current policy, but commercial table entries conflict with the introductory application exclusion. No unconditional commercial-warranty claim.
- XPENG warranty is importer/registration/eligibility-specific. Do not apply the newer XPENG Australia program retrospectively to old-importer cars.
- Geely warranty headlines are private-use claims; complete conditions and battery threshold are not independently reverified in this packet.

## Factory options and held models

- g6_sr_wheel_dependent_range: SR20 is an optional configuration; retain 470 km/16.9 and do not inherit standard SR18 480 km/16.6.
- g6_black_factory_package: Factory option only; no standalone strength until package contents, exact fitment and any range consequences are verified. Base-plus-package arithmetic does not resolve price basis.
- zeekr_x_awd_automatic_doors: Optional AWD-only fitment, never standard by inheritance.
- zeekr_x_black_wheels_interior: Preserve Black & Red interior constraint; do not infer separately measured optional-wheel range.
- Zeekr 7GT: AU page explicitly says registration of interest is not an order; overseas imagery/final Australian specifications conditional. Do not promote overseas Core/Privilege trims.
- XPENG L03: Official July strategy confirms Q4 Australian sale, current AU L03 page invites registration of interest; no exact AU retail grade/price/order acceptance or fresh NEW stock confirmed in this pass.
- XPENG G9 / P7 / P7+: Global site navigation and generic dealer boilerplate are not exact AU offer evidence.
- Geely Starray EM-i: Plug-in hybrid, outside BEV scope.

## Existing-record refreshes, not new trims

- `geely_ex5__complete_extended_range__1`, `geely_ex5__inspire_extended_range__2`: Current AU ER guide still 68.39kWh, 475/450km WLTP, 160kW/320Nm, 100kW DC, 11kW AC; exact Complete NEW stock and sold Inspire ad title call MY27. Preserve original configuration identity unless an actual specification change is proved. Calendar-year/MY stock metadata is not a new powertrain.
  - Conflict: Brochure cover/title says 2026 but stale footer March 2025; PDF created March 2026.
  - Conflict: Inspire marketing list says 13.8-inch HUD, equipment matrix says 13.4; do not resolve diagonal without further evidence. Complete matrix HUD unavailable.
- `geely_ex5__complete__3`, `geely_ex5__inspire__4`: Original 60.22kWh EX5 is a separate outgoing configuration. Current ER brochure cannot validate its present factory orderability. No fresh exact NEW old-battery stock verified in this pass.
- `zeekr_7x__rwd__1`, `zeekr_7x__long_range_rwd__2`, `zeekr_7x__performance_awd__3`: Current AU page still original 75/100kWh, 800V RWD / Long Range RWD / Performance AWD. MY26 exact NEW LR and Performance ads verified; original base grade current and live new base ad provisional pack match. No evidence for importing the Chinese-market 900V revision into AU. Preserve existing rich trim equipment; refresh stock/warranty only.
- `zeekr_7x__black_special_edition_awd__4`: Existing Black Special Edition record already present. This pass did not independently establish fresh exact NEW Black stock, current price basis or distinct WLTP result on its 20-inch package. Do not copy Performance 21-inch range as proved package range.

## Actual shared-reader validation

- Actual catalogue(), effectiveFeatures() and research().sources produce 12 summaries and all 24 clauses through the unchanged shared reader
- All 245 executable guards exactly match current effective facts or formal MY, full identity snapshots and source metadata
- Every guarded fact value, status, unit, basis, comparisonBasis, market, scope, qualification, explanation, stale date, issue and source-membership mutation suppresses precisely dependent clauses; all formal-MY mutations suppress dependent records/clauses
- Both reader stages fail closed on every missing, stale, held, conflicted, access-limited or non-HTTP source
- Loss of current/order-listed record state or changed availability revision suppresses the exact record
- Changed/expired prices leave all technical clauses eligible within their independent freshness window
- All copy fails closed after the 30-day evidence window
- Seven formal-MY nulls, four unverified stock states, X9-only explicit order acceptance and universal unverified delivery dates remain intact
- Exact EX2 camera/power-seat distinctions, MY26 X maxima/optional doors, 009 station-vs-vehicle charging, G6 gross capacity/price/wheel packages and X9 AWD-only charging/conditional equipment all pass
- Targeted regressions reject EX2 camera/AC confusion, X DC swaps and optional doors, overseas 009 architecture and 150/205 kW peak invention, G6 wheel/epoch/range swaps, and X9 AWD charging copied to FWD
- Main-agent correction verified: EX2 Complete parking_cameras now standard with rear-view camera/rear sensors and explicit no-surround qualification

3380 mutation cases passed; 245 executable guards; 95 audit-only dependencies; 867 mapped fields with zero mismatches.

Feature-grid coverage: {"not_verified":789,"unavailable":5,"standard":30,"conditional":4}. Supplemental equipment facts remain the copy binding. EX2 Complete parking-camera alias is corrected.

Limitations:
- Runtime enforces freshness and source eligibility, not exact equality of all source URLs, publication/access dates or metadata; full source snapshots were separately audited.
- Runtime directly guards formal MY, exact variant ID, referenced fact scope/drive/battery/wheel and current listing/revision. Arbitrary car labels/generation and nested stock/order fields are audited snapshots, not independently checked by the current shared reader. Copy contains no stock or delivery promise.
- Source-less nulls remain audit-only as required. Exact sourced-null facts guard relevant unknowns. Future models, EX5/7X refreshes and the Black Edition package remain outside the 12 executable base summaries.
- Equipment copy binds to source-backed supplemental facts. A narrow feature-grid alias set is populated; remaining feature criteria stay unverified.
- No application files edited, no publication performed, and no full build/UI/browser tests claimed.

### Bound identities

- `geely_ex2_complete_au_launch_2026` → `geely_ex2_launch__complete__20261010`
- `geely_ex2_inspire_au_launch_2026` → `geely_ex2_launch__inspire__20261010`
- `zeekr_x_rwd_my26` → `zeekr_x_my26__rwd__20261010`
- `zeekr_x_awd_my26` → `zeekr_x_my26__awd__20261010`
- `zeekr_009_7seat_fwd_au_116kwh` → `zeekr_009_116__7_seat_fwd__20261010`
- `zeekr_009_7seat_awd_au_116kwh` → `zeekr_009_116__7_seat_awd__20261010`
- `zeekr_009_6seat_awd_au_116kwh` → `zeekr_009_116__6_seat_awd__20261010`
- `xpeng_new_g6_ffcp_my26` → `xpeng_g6_my26__rwd_standard_range__20261010`
- `xpeng_new_g6_ffap_my26` → `xpeng_g6_my26__rwd_long_range__20261010`
- `xpeng_new_g6_ffbp_my26` → `xpeng_g6_my26__awd_performance__20261010`
- `xpeng_x9_fwd_au_launch_2026` → `xpeng_x9_launch__fwd_standard_range__20261010`
- `xpeng_x9_awd_au_launch_2026` → `xpeng_x9_launch__awd_performance__20261010`
