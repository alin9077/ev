# Original catalogue: exact-version buyer copy

Editorial review: 2026-10-10 · Australia · 34 original records · 29 current, four outgoing, one provisional.

This proposal is for discovery cards and detail pages only. It does not replace or edit the Model Y hero or any of its nine selling points. Primary evidence retains its actual access date; this was a reconciliation of already checked evidence, not a new stock or market-wide verification.

## Integration findings

- 39 chosen feature dependencies differ from the old raw guard rows. Use the final pack() feature pipeline for guards.
- Two factual suspension subfields are proposed: Model Y Performance adaptive damping and 7X Performance air/adaptive suspension. Those two strengths remain conditional on accepting the factual patches.
- Price and DC headlines with unresolved publication issues are excluded. Black-edition range stays qualified and provisional EV3 AWD receives no buyer recommendation.
- The JSON carries full exact dependency snapshots, evidence dates, sources, guards and arithmetic.

## Current / order-listed catalogue records

### Tesla Model Y Premium Long Range AWD
Version: 2027 · ID: `tesla_model_y__premium_long_range_awd__1`

**Buyer reason — Range with all-wheel drive:** For longer trips, Premium Long Range pairs AWD with a 600km WLTP range claim.
- Dependency: `range_km` = 600; status standard; basis: WLTP. Evidence date 2026-10-05. [Design Model Y Australia](https://www.tesla.com/en_au/modely/design) (accessed 2026-10-05)
- Dependency: `drive` = "AWD". Evidence date 2026-10-06. [Design Model Y Australia](https://www.tesla.com/en_au/modely/design) (accessed 2026-10-05)

**Trade-off — Five-seat layout:** This version has five seats; choose a different seating layout if you need six.
- Dependency: `seats` = 5; status standard; basis: Seating positions. Evidence date 2026-10-05. [Design Model Y Australia](https://www.tesla.com/en_au/modely/design) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: 2027. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### Tesla Model Y Premium RWD
Version: 2027 · ID: `tesla_model_y__premium_rwd__2`

**Buyer reason — Cargo and front-seat equipment:** Premium RWD combines ventilated front seats with 822L behind the second row, measured by Tesla rather than VDA.
- Dependency: `front_ventilated_seats` = "Included"; status standard. Evidence date 2026-10-06. [Design Model Y Australia](https://www.tesla.com/en_au/modely/design) (accessed 2026-10-05)
- Dependency: `boot_l` = 822; status standard; basis: Tesla figure behind the second row; not VDA. Evidence date 2026-10-05. [Model Y Dimensions and Weights](https://www.tesla.com/ownersmanual/modely/en_au/GUID-1E76B638-7B12-4D9A-8767-94B7F1E92A0E.html) (accessed 2026-10-05)

**Trade-off — Less claimed range than Long Range:** Its 466km WLTP claim is 134km below Premium Long Range AWD’s 600km.
- Dependency: `range_km` = 600; status standard; basis: WLTP. Evidence date 2026-10-05. [Design Model Y Australia](https://www.tesla.com/en_au/modely/design) (accessed 2026-10-05)
- Dependency: `range_km` = 466; status standard; basis: WLTP. Evidence date 2026-10-05. [Design Model Y Australia](https://www.tesla.com/en_au/modely/design) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: 2027. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Tesla’s cargo method is not VDA; do not directly rank this volume against a different measuring method.

### Tesla Model Y L Premium AWD (six-seat)
Version: Current October 2026 order specification; verify build · ID: `tesla_model_y__l_premium_awd__4`

**Buyer reason — Six heated seats:** For six-person travel, Model Y L has a 2+2+2 layout with all six seats heated.
- Dependency: `seats` = 6; status standard; basis: Seating positions; qualifications: 2+2+2 layout.. Evidence date 2026-10-06. [AU Model Y six-seater seating manual](https://www.tesla.com/ownersmanual/modely/en_au/GUID-52117C21-F5C7-451C-A499-95D946B50A1B.html) (accessed 2026-10-06)
- Dependency: `rear_heated_seats` = "Included"; status standard; condition: All six seats are heated.. Evidence date 2026-10-06. [AU Model Y six-seater seating manual](https://www.tesla.com/ownersmanual/modely/en_au/GUID-52117C21-F5C7-451C-A499-95D946B50A1B.html) (accessed 2026-10-06)

**Trade-off — Towing depends on occupancy:** With six occupants, braked towing is limited to 1,043kg and requires the tow package.
- Dependency: `towing_braked_kg` = 1588; status conditional; basis: With four or fewer occupants and the tow package; falls to 1,043 kg with six occupants. Evidence date 2026-10-07. [Model Y Australian manual - towing and accessories](https://www.tesla.com/ownersmanual/modely/en_au/GUID-F5C80FF5-8DE3-4750-8BAF-0DCC0CFA0C5C.html) (accessed 2026-10-07)

Visible conditions:
- Exact Australian record: Current October 2026 order specification; verify build. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- Braked towing requires suitable approved towing equipment and compliance with vehicle, trailer, occupant/load and towball limits; the rating is not a loaded-trip guarantee.
- Check child-restraint compatibility for the exact seating position with the restraint manufacturer and a qualified fitter; six seats alone does not establish child-seat fit.

Review notes:
- No Model Y L FSD availability, battery chemistry, acceleration or generic Tesla OTA-history claim is introduced.

### Tesla Model Y Performance AWD
Version: 2027 · ID: `tesla_model_y__performance_awd__3`

**Buyer reason — Acceleration and adjustable damping:** Performance combines adaptive dampers with a claimed 3.5-second 0–100km/h time, with one-foot rollout subtracted.
- Dependency: `adaptive_damping_system` = "Adaptive damping with Standard and Sport modes"; status standard; basis: Australian Model Y manual; Performance-specific modes; qualifications: Objective hardware fitment only; no independent comfort or handling advantage established.; proposed shared factual patch required. Evidence date 2026-10-06. [AU Model Y manual: adaptive suspension](https://www.tesla.com/ownersmanual/modely/en_au/GUID-E41C80C9-3132-4F4C-B4ED-4A3136488334.html) (accessed 2026-10-06)
- Dependency: `zero_to_100_s` = 3.5; status standard; basis: Manufacturer claim, one-foot rollout subtracted. Evidence date 2026-10-05. [Design Model Y Australia](https://www.tesla.com/en_au/modely/design) (accessed 2026-10-05)

**Trade-off — Small range reduction:** Its 580km WLTP claim is 20km below Premium Long Range AWD’s 600km.
- Dependency: `range_km` = 600; status standard; basis: WLTP. Evidence date 2026-10-05. [Design Model Y Australia](https://www.tesla.com/en_au/modely/design) (accessed 2026-10-05)
- Dependency: `range_km` = 580; status standard; basis: WLTP. Evidence date 2026-10-05. [Design Model Y Australia](https://www.tesla.com/en_au/modely/design) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: 2027. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Acceleration is a manufacturer claim. Test protocols are not necessarily comparable across makes; actual results vary.

Review notes:
- The new factual suspension key must not be mapped to a subjective ride/handling score.

### BYD Sealion 7 Premium RWD
Version: 2026 Australian specification · ID: `byd_sealion_7__premium_rwd__1`

**Buyer reason — Seat ventilation and head-up display:** Premium includes ventilated front seats and a head-up display for buyers who want both without moving to AWD.
- Dependency: `front_ventilated_seats` = "Included"; status standard. Evidence date 2026-10-06. [BYD SEALION 7 Australian specifications, 2026](https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf) (accessed 2026-10-06)
- Dependency: `screens_hud` = "15.6-inch rotating screen · 10.25-inch driver display · head-up display"; status standard. Evidence date 2026-10-07. [BYD SEALION 7 Australian specifications, 2026](https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf) (accessed 2026-10-06)
- Dependency: `drive` = "RWD". Evidence date 2026-10-06. [BYD SEALION 7 Australian specifications, 2026](https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf) (accessed 2026-10-06)

**Trade-off — Lower towing limit:** Braked towing is rated at 750kg, compared with 1,500kg for Performance AWD.
- Dependency: `towing_braked_kg` = 750; status standard; basis: Manufacturer figure. Evidence date 2026-10-05. [BYD SEALION 7 Australian specifications, 2026](https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf) (accessed 2026-10-06)
- Dependency: `towing_braked_kg` = 1500; status standard; basis: Manufacturer figure. Evidence date 2026-10-05. [BYD SEALION 7 Australian specifications, 2026](https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- Braked towing requires suitable approved towing equipment and compliance with vehicle, trailer, occupant/load and towball limits; the rating is not a loaded-trip guarantee.

### BYD Sealion 7 Performance AWD
Version: 2026 Australian specification · ID: `byd_sealion_7__performance_awd__2`

**Buyer reason — Acceleration and rear-seat heating:** Performance combines AWD, a claimed 4.5-second 0–100km/h time and heated outer rear seats.
- Dependency: `drive` = "AWD". Evidence date 2026-10-06. [BYD SEALION 7 Australian specifications, 2026](https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf) (accessed 2026-10-06)
- Dependency: `zero_to_100_s` = 4.5; status standard; basis: Manufacturer claim. Evidence date 2026-10-05. [BYD SEALION 7 Australian specifications, 2026](https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf) (accessed 2026-10-06)
- Dependency: `rear_heated_seats` = "Included"; status standard; condition: Outer rear seats; Performance-only.. Evidence date 2026-10-06. [BYD SEALION 7 Australian specifications, 2026](https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf) (accessed 2026-10-06)

**Trade-off — Range trade-off:** Its 456km WLTP claim is 26km below Premium RWD’s 482km.
- Dependency: `range_km` = 482; status standard; basis: WLTP combined. Evidence date 2026-10-05. [BYD SEALION 7 Australian specifications, 2026](https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf) (accessed 2026-10-06)
- Dependency: `range_km` = 456; status standard; basis: WLTP combined. Evidence date 2026-10-05. [BYD SEALION 7 Australian specifications, 2026](https://bydautomotive.com.au/brochures/BYD-SEALION-7-2026.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Acceleration is a manufacturer claim. Test protocols are not necessarily comparable across makes; actual results vary.

### Geely EX5 Complete Extended Range
Version: 2026 Extended Range; confirm MY/VIN · ID: `geely_ex5__complete_extended_range__1`

**Buyer reason — Range with heated front seats:** Complete Extended Range pairs a 475km WLTP claim with heated front seats.
- Dependency: `range_km` = 475; status standard; basis: WLTP. Evidence date 2026-10-05. [Geely EX5 Brochure 2026 — Complete Extended Range / Inspire Extended Range](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `front_heated_seats` = "Included"; status standard. Evidence date 2026-10-06. [Geely EX5 Brochure 2026 — Complete Extended Range / Inspire Extended Range](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) (accessed 2026-10-06)

**Trade-off — Fewer cabin conveniences:** Front-seat ventilation and a powered tailgate are not fitted to Complete.
- Dependency: `front_ventilated_seats` = "Not fitted"; status unavailable; condition: Inspire-only.. Evidence date 2026-10-06. [Geely EX5 Brochure 2026 — Complete Extended Range / Inspire Extended Range](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `power_tailgate` = "Manual tailgate"; status unavailable; condition: Powered on Inspire.. Evidence date 2026-10-07. [Geely EX5 2026 Australian brochure and specification guide](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) (accessed 2026-10-07)

Visible conditions:
- Exact Australian record: 2026 Extended Range; confirm MY/VIN. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- The Extended Range record is the 68.39kWh version; verify the VIN/build rather than relying on the EX5 badge alone.

### Geely EX5 Inspire Extended Range
Version: 2026 Extended Range; confirm MY/VIN · ID: `geely_ex5__inspire_extended_range__2`

**Buyer reason — Ventilation, display and sunroof:** Inspire Extended Range includes ventilated front seats, a head-up display and an opening panoramic sunroof.
- Dependency: `front_ventilated_seats` = "Included"; status standard; condition: Inspire-only.. Evidence date 2026-10-06. [Geely EX5 Brochure 2026 — Complete Extended Range / Inspire Extended Range](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `screens_hud` = "15.4-inch screen · 10.2-inch driver display · head-up display"; status standard. Evidence date 2026-10-07. [Geely EX5 2026 Australian brochure and specification guide](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) (accessed 2026-10-07)
- Dependency: `glass_roof` = "Opening panoramic sunroof · powered blind"; status standard. Evidence date 2026-10-07. [Geely EX5 2026 Australian brochure and specification guide](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) (accessed 2026-10-07)

**Trade-off — Range trade-off:** Its 450km WLTP claim is 25km below Complete Extended Range’s 475km.
- Dependency: `range_km` = 475; status standard; basis: WLTP. Evidence date 2026-10-05. [Geely EX5 Brochure 2026 — Complete Extended Range / Inspire Extended Range](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `range_km` = 450; status standard; basis: WLTP. Evidence date 2026-10-05. [Geely EX5 Brochure 2026 — Complete Extended Range / Inspire Extended Range](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2026 Extended Range; confirm MY/VIN. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- The Extended Range record is the 68.39kWh version; verify the VIN/build rather than relying on the EX5 badge alone.

### Zeekr 7X RWD
Version: MY26 Australian core range · ID: `zeekr_7x__rwd__1`

**Buyer reason — AC charging flexibility:** RWD supports up to 22kW AC charging and carries a 480km WLTP range claim.
- Dependency: `ac_kw` = 22; status standard; basis: Manufacturer figure. Evidence date 2026-10-05. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)
- Dependency: `range_km` = 480; status standard; basis: WLTP. Evidence date 2026-10-05. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)

**Trade-off — Front-seat and display omissions:** Front-seat ventilation and the head-up display are not fitted to the base RWD.
- Dependency: `front_ventilated_seats` = "Not fitted"; status unavailable; condition: Long Range and Performance only.. Evidence date 2026-10-06. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)
- Dependency: `screens_hud` = "16-inch screen · 13-inch driver display · no head-up display"; status standard; condition: The head-up display comes with Long Range and Performance.. Evidence date 2026-10-07. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: MY26 Australian core range. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- AC input is the vehicle limit, not a guaranteed charging rate. The supply, charger and installation must support the power; more than 7.4 kW normally requires a suitable three-phase installation.
- The 22kW maximum needs a compatible three-phase 22kW supply and charging installation; ordinary home sockets cannot deliver it.

### Zeekr 7X Long Range RWD
Version: MY26 Australian core range · ID: `zeekr_7x__long_range_rwd__2`

**Buyer reason — Range and ventilated front seats:** Long Range RWD combines a 615km WLTP claim with ventilated front seats.
- Dependency: `range_km` = 615; status standard; basis: WLTP. Evidence date 2026-10-05. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)
- Dependency: `front_ventilated_seats` = "Included"; status standard; condition: Not on the base RWD.. Evidence date 2026-10-06. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)

**Trade-off — Less acceleration than Performance:** It is rear-wheel drive and claims 6.0 seconds to 100km/h, versus 3.8 seconds for Performance AWD.
- Dependency: `drive` = "RWD". Evidence date 2026-10-06. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)
- Dependency: `zero_to_100_s` = 6; status standard; basis: Manufacturer claim. Evidence date 2026-10-05. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)
- Dependency: `drive` = "AWD". Evidence date 2026-10-06. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)
- Dependency: `zero_to_100_s` = 3.8; status standard; basis: Manufacturer claim. Evidence date 2026-10-05. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: MY26 Australian core range. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Acceleration is a manufacturer claim. Test protocols are not necessarily comparable across makes; actual results vary.

### Zeekr 7X Performance AWD
Version: MY26 Australian core range · ID: `zeekr_7x__performance_awd__3`

**Buyer reason — Acceleration and suspension hardware:** Performance AWD pairs a claimed 3.8-second 0–100km/h time with air suspension and adaptive damping.
- Dependency: `drive` = "AWD". Evidence date 2026-10-06. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)
- Dependency: `zero_to_100_s` = 3.8; status standard; basis: Manufacturer claim. Evidence date 2026-10-05. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)
- Dependency: `suspension_hardware` = "Air suspension with continuous-control damping"; status standard; basis: Australian brochure; Performance AWD equipment column; qualifications: Objective equipment fitment only; not proof of better ride comfort or handling.; proposed shared factual patch required. Evidence date 2026-10-06. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)

**Trade-off — Range trade-off:** Its 543km WLTP claim is 72km below Long Range RWD’s 615km.
- Dependency: `range_km` = 615; status standard; basis: WLTP. Evidence date 2026-10-05. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)
- Dependency: `range_km` = 543; status standard; basis: WLTP. Evidence date 2026-10-05. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: MY26 Australian core range. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Acceleration is a manufacturer claim. Test protocols are not necessarily comparable across makes; actual results vary.

Review notes:
- Use the proposed factual suspension key; retain the subjective ride row separately.

### Zeekr 7X Black Special Edition AWD
Version: 2026 Australian special edition · ID: `zeekr_7x__black_special_edition_awd__4`

**Buyer reason — Acceleration-focused special edition:** Black Special Edition combines AWD with a manufacturer-claimed 3.8-second 0–100km/h time.
- Dependency: `drive` = "AWD". Evidence date 2026-10-06. [Zeekr Australia introduces Black Special Edition](https://www.linkedin.com/posts/zeekr-australia_makeastatement-today-we-are-introducing-activity-7437406990043140096-zY5f) (accessed 2026-10-06)
- Dependency: `zero_to_100_s` = 3.8; status standard; basis: Manufacturer claim. Evidence date 2026-10-05. [Zeekr Australia introduces Black Special Edition](https://www.linkedin.com/posts/zeekr-australia_makeastatement-today-we-are-introducing-activity-7437406990043140096-zY5f) (accessed 2026-10-06)

**Trade-off — Edition equipment needs checking:** The core brochure does not itemise Black; confirm inherited head-up display and powered-tailgate equipment on the exact order.
- Dependency: `screens_hud` = "16-inch screen · 13-inch driver display · 36-inch head-up display"; status conditional; condition: Zeekr's sheet does not itemise the Black Special Edition; shown as the Performance AWD it is built on.. Evidence date 2026-10-07. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)
- Dependency: `power_tailgate` = "Powered tailgate with height memory"; status conditional; condition: Zeekr's sheet does not itemise the Black Special Edition; shown as the Performance AWD it is built on.. Evidence date 2026-10-07. [ZEEKR 7X Australian brochure and specification matrix](https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2026 Australian special edition. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- Acceleration is a manufacturer claim. Test protocols are not necessarily comparable across makes; actual results vary.
- Edition-specific wheel/range certification is not established. The shared range is inherited from Performance AWD and must not be promoted as a confirmed Black-edition range.
- No fresh Black-edition stock or current transaction price has been established here.

Review notes:
- Do not reuse the conditional Black price/range as a headline, comparison winner or arithmetic input. The strength relies only on the official Australian edition announcement’s drivetrain and acceleration support.

### Jaecoo J5 EV Summit
Version: 2026 · ID: `jaecoo_j5_ev__ev_summit__1`

**Buyer reason — Compact body, useful cabin equipment:** At 4,380mm long, Summit includes heated and ventilated front seats plus a powered tailgate.
- Dependency: `length_mm` = 4380; status standard; basis: Manufacturer figure. Evidence date 2026-10-05. [JAECOO J5 EV MY2026 specification sheet, Edition 1.01 / April 2026](https://www.omodajaecoo.com.au/sites/default/files/2026-05/Spec25_Jaecoo_J5_Spec_Sheet_AU_BEV_v101_compressed_compressed.pdf) (accessed 2026-10-06)
- Dependency: `front_heated_seats` = "Included"; status standard. Evidence date 2026-10-06. [JAECOO J5 EV MY2026 specification sheet, Edition 1.01 / April 2026](https://www.omodajaecoo.com.au/sites/default/files/2026-05/Spec25_Jaecoo_J5_Spec_Sheet_AU_BEV_v101_compressed_compressed.pdf) (accessed 2026-10-06)
- Dependency: `front_ventilated_seats` = "Included"; status standard. Evidence date 2026-10-06. [JAECOO J5 EV MY2026 specification sheet, Edition 1.01 / April 2026](https://www.omodajaecoo.com.au/sites/default/files/2026-05/Spec25_Jaecoo_J5_Spec_Sheet_AU_BEV_v101_compressed_compressed.pdf) (accessed 2026-10-06)
- Dependency: `power_tailgate` = "Powered tailgate"; status standard. Evidence date 2026-10-07. [Jaecoo J5 EV Australian specification sheet, edition 1.01](https://www.omodajaecoo.com.au/sites/default/files/2026-05/Spec25_Jaecoo_J5_Spec_Sheet_AU_BEV_v101_compressed_compressed.pdf) (accessed 2026-10-07)

**Trade-off — Cold-weather equipment omissions:** A heat pump and heated steering wheel are not listed in the Australian specification.
- Dependency: `heat_pump` = "Not fitted"; status unavailable; condition: Not on the Australian equipment list.. Evidence date 2026-10-07. [Jaecoo J5 EV Australian specification sheet, edition 1.01](https://www.omodajaecoo.com.au/sites/default/files/2026-05/Spec25_Jaecoo_J5_Spec_Sheet_AU_BEV_v101_compressed_compressed.pdf) (accessed 2026-10-07)
- Dependency: `heated_steering_wheel` = "Not fitted"; status unavailable. Evidence date 2026-10-07. [Jaecoo J5 EV Australian specification sheet, edition 1.01](https://www.omodajaecoo.com.au/sites/default/files/2026-05/Spec25_Jaecoo_J5_Spec_Sheet_AU_BEV_v101_compressed_compressed.pdf) (accessed 2026-10-07)

Visible conditions:
- Exact Australian record: 2026. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- Equipment absence here means not listed on the checked Australian specification; no cold-weather efficiency test or comfort ranking is implied.

### BYD ATTO 2 Dynamic
Version: 2026 Australian specification · ID: `byd_atto_2__dynamic__1`

**Buyer reason — Five-seat daily use:** Dynamic packages five seats and a 345km WLTP claim in a 4,310mm-long body.
- Dependency: `seats` = 5; status standard; basis: Seating positions. Evidence date 2026-10-05. [BYD ATTO 2 Australian specifications, 2025](https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf) (accessed 2026-10-05)
- Dependency: `range_km` = 345; status standard; basis: WLTP combined. Evidence date 2026-10-05. [BYD ATTO 2 Australian specifications, 2025](https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf) (accessed 2026-10-05)
- Dependency: `length_mm` = 4310; status standard; basis: Manufacturer figure. Evidence date 2026-10-05. [BYD ATTO 2 Australian specifications, 2025](https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf) (accessed 2026-10-05)

**Trade-off — Seat climate equipment omitted:** Dynamic has neither heated nor ventilated front seats; both are Premium equipment.
- Dependency: `front_heated_seats` = "Not fitted"; status unavailable; condition: Premium-only.. Evidence date 2026-10-06. [BYD ATTO 2 Australian specifications, 2025](https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf) (accessed 2026-10-05)
- Dependency: `front_ventilated_seats` = "Not fitted"; status unavailable; condition: Premium-only.. Evidence date 2026-10-06. [BYD ATTO 2 Australian specifications, 2025](https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### BYD ATTO 2 Premium
Version: 2026 Australian specification · ID: `byd_atto_2__premium__2`

**Buyer reason — Seat climate and roof equipment:** Premium includes heated and ventilated front seats plus a panoramic glass roof with a blind.
- Dependency: `front_heated_seats` = "Included"; status standard; condition: Premium-only.. Evidence date 2026-10-06. [BYD ATTO 2 Australian specifications, 2025](https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf) (accessed 2026-10-05)
- Dependency: `front_ventilated_seats` = "Included"; status standard; condition: Premium-only.. Evidence date 2026-10-06. [BYD ATTO 2 Australian specifications, 2025](https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf) (accessed 2026-10-05)
- Dependency: `glass_roof` = "Fixed panoramic glass roof with blind"; status standard. Evidence date 2026-10-07. [BYD ATTO 2 Australian specification sheet (visually inspected)](https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf) (accessed 2026-10-07)

**Trade-off — Equipment upgrade, unchanged range:** Its 345km WLTP claim is the same as Dynamic’s; the equipment upgrade does not add claimed range.
- Dependency: `range_km` = 345; status standard; basis: WLTP combined. Evidence date 2026-10-05. [BYD ATTO 2 Australian specifications, 2025](https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf) (accessed 2026-10-05)
- Dependency: `range_km` = 345; status standard; basis: WLTP combined. Evidence date 2026-10-05. [BYD ATTO 2 Australian specifications, 2025](https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### Tesla Model 3 Premium Long Range RWD
Version: 2027 · ID: `tesla_model_3__premium_long_range_rwd__1`

**Buyer reason — Long-distance range focus:** Premium Long Range RWD offers a 750km WLTP range claim with rear-wheel drive.
- Dependency: `range_km` = 750; status standard; basis: WLTP. Evidence date 2026-10-05. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)
- Dependency: `drive` = "RWD". Evidence date 2026-10-06. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)

**Trade-off — Centre-screen instruments:** There is no separate driver display or head-up display; speed and warnings appear on the centre screen.
- Dependency: `screens_hud` = "16-inch centre screen · 8-inch rear screen · no driver display or head-up display"; status standard; condition: Speed and warnings appear on the centre screen.. Evidence date 2026-10-07. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: 2027. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### Tesla Model 3 Premium RWD
Version: 2027 · ID: `tesla_model_3__premium_rwd__2`

**Buyer reason — Seat equipment and rear screen:** Premium RWD includes ventilated front seats, heated rear seats and an 8-inch rear touchscreen.
- Dependency: `front_ventilated_seats` = "Included"; status standard; condition: Not on the entry Rear-Wheel Drive.. Evidence date 2026-10-06. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)
- Dependency: `rear_heated_seats` = "Included"; status standard; condition: Not on the entry Rear-Wheel Drive.. Evidence date 2026-10-06. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)
- Dependency: `screens_hud` = "16-inch centre screen · 8-inch rear screen · no driver display or head-up display"; status standard; condition: Speed and warnings appear on the centre screen.. Evidence date 2026-10-07. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)

**Trade-off — Equipment does not mean more range:** Its 520km WLTP claim is 52km below the entry Rear-Wheel Drive’s 572km.
- Dependency: `range_km` = 572; status standard; basis: WLTP. Evidence date 2026-10-05. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)
- Dependency: `range_km` = 520; status standard; basis: WLTP. Evidence date 2026-10-05. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: 2027. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

Review notes:
- Preserve this non-monotonic exact-MY27 range comparison; do not assume a Premium badge implies a higher range figure.

### Tesla Model 3 Rear-Wheel Drive
Version: 2027 · ID: `tesla_model_3__rear_wheel_drive__3`

**Buyer reason — Range with heated front seats:** The entry Rear-Wheel Drive pairs a 572km WLTP claim with heated front seats.
- Dependency: `range_km` = 572; status standard; basis: WLTP. Evidence date 2026-10-05. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)
- Dependency: `front_heated_seats` = "Included"; status standard. Evidence date 2026-10-06. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)

**Trade-off — Fewer passenger conveniences:** Front-seat ventilation and the rear touchscreen are omitted on this version.
- Dependency: `front_ventilated_seats` = "Not fitted"; status unavailable; condition: Premium and Performance only.. Evidence date 2026-10-06. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)
- Dependency: `screens_hud` = "16-inch centre screen · no rear screen, driver display or head-up display"; status standard; condition: The entry version drops the rear touchscreen.. Evidence date 2026-10-07. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: 2027. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### Tesla Model 3 Performance AWD
Version: 2027 · ID: `tesla_model_3__performance_awd__4`

**Buyer reason — Acceleration-focused Model 3:** Performance AWD claims 0–100km/h in 3.1 seconds, with one-foot rollout subtracted.
- Dependency: `drive` = "AWD". Evidence date 2026-10-06. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)
- Dependency: `zero_to_100_s` = 3.1; status standard; basis: Manufacturer claim, one-foot rollout subtracted. Evidence date 2026-10-05. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)

**Trade-off — Range trade-off:** Its 600km WLTP claim is 150km below Premium Long Range RWD’s 750km.
- Dependency: `range_km` = 750; status standard; basis: WLTP. Evidence date 2026-10-05. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)
- Dependency: `range_km` = 600; status standard; basis: WLTP. Evidence date 2026-10-05. [Design Model 3 Australia](https://www.tesla.com/en_au/model3/design) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: 2027. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Acceleration is a manufacturer claim. Test protocols are not necessarily comparable across makes; actual results vary.

### Kia EV5 Air 2WD Standard Range
Version: 2026 · ID: `kia_ev5__air_2wd_standard_range__1`

**Buyer reason — Seats-up cargo and heating:** Air Standard Range combines a 513L VDA seats-up boot with heated front seats.
- Dependency: `boot_l` = 513; status standard; basis: VDA, seats up. Evidence date 2026-10-05. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `front_heated_seats` = "Included"; status standard. Evidence date 2026-10-06. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)

**Trade-off — AC and towing limits:** AC input is capped at 6.6kW, and maximum braked towing is 300kg.
- Dependency: `ac_kw` = 6.6; status standard; basis: Manufacturer figure. Evidence date 2026-10-05. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `towing_braked_kg` = 300; status standard; basis: Manufacturer figure. Evidence date 2026-10-05. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2026. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- AC input is the vehicle limit, not a guaranteed charging rate. The supply, charger and installation must support the power; more than 7.4 kW normally requires a suitable three-phase installation.
- Braked towing requires suitable approved towing equipment and compliance with vehicle, trailer, occupant/load and towball limits; the rating is not a loaded-trip guarantee.

### Kia EV5 Air 2WD Long Range
Version: 2026 · ID: `kia_ev5__air_2wd_long_range__2`

**Buyer reason — Range and AC capacity:** Air Long Range offers a 555km WLTP claim and up to 11kW AC input.
- Dependency: `range_km` = 555; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `ac_kw` = 11; status standard; basis: Manufacturer figure. Evidence date 2026-10-05. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)

**Trade-off — Air equipment omissions:** Front-seat ventilation is not fitted, and the tailgate opens manually.
- Dependency: `front_ventilated_seats` = "Not fitted"; status unavailable; condition: GT-Line-only.. Evidence date 2026-10-06. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `power_tailgate` = "Manual tailgate"; status unavailable; condition: Powered from Earth up.. Evidence date 2026-10-07. [Kia EV5 Australian specification sheet](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-07)

Visible conditions:
- Exact Australian record: 2026. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- AC input is the vehicle limit, not a guaranteed charging rate. The supply, charger and installation must support the power; more than 7.4 kW normally requires a suitable three-phase installation.

### Kia EV5 Earth AWD Long Range
Version: 2026 · ID: `kia_ev5__earth_awd_long_range__3`

**Buyer reason — AWD with practical equipment:** Earth combines AWD, a powered tailgate and an included exterior V2L adapter for powering compatible appliances.
- Dependency: `drive` = "AWD". Evidence date 2026-10-06. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `power_tailgate` = "Powered tailgate, height adjustable"; status standard. Evidence date 2026-10-07. [Kia EV5 Australian specification sheet](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-07)
- Dependency: `v2l` = "Interior socket · exterior adapter included"; status standard; condition: Air has the interior socket only.. Evidence date 2026-10-06. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)

**Trade-off — Range trade-off:** Its 500km WLTP claim is 55km below Air Long Range’s 555km.
- Dependency: `range_km` = 555; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `range_km` = 500; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2026. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- V2L is appliance power within the manual’s limits; it does not establish home backup or vehicle-to-grid capability.

### Kia EV5 GT-Line AWD Long Range
Version: 2026 · ID: `kia_ev5__gt_line_awd_long_range__4`

**Buyer reason — Extra seat and display equipment:** GT-Line includes ventilated front seats, heated rear seats and a head-up display.
- Dependency: `front_ventilated_seats` = "Included"; status standard; condition: GT-Line-only.. Evidence date 2026-10-06. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `rear_heated_seats` = "Included"; status standard; condition: GT-Line-only.. Evidence date 2026-10-06. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `screens_hud` = "12.3-inch screen · 12.3-inch driver display · 5-inch climate panel · head-up display"; status standard. Evidence date 2026-10-07. [Kia EV5 Australian specification sheet](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-07)

**Trade-off — Range trade-off:** Its 470km WLTP claim is 30km below Earth AWD’s 500km.
- Dependency: `range_km` = 500; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `range_km` = 470; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV5 MY2026 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2026. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### Kia EV3 Air 2WD Standard Range
Version: 2027 · ID: `kia_ev3__air_2wd_standard_range__1`

**Buyer reason — Range and seats-up storage:** Air Standard Range pairs a 436km WLTP claim with a 460L VDA seats-up boot.
- Dependency: `range_km` = 436; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)
- Dependency: `boot_l` = 460; status standard; basis: VDA, seats up. Evidence date 2026-10-05. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)

**Trade-off — Seat climate equipment omitted:** Air has neither heated nor ventilated front seats.
- Dependency: `front_heated_seats` = "Not fitted"; status unavailable; condition: Earth and GT-Line only.. Evidence date 2026-10-06. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)
- Dependency: `front_ventilated_seats` = "Not fitted"; status unavailable; condition: Earth and GT-Line only.. Evidence date 2026-10-06. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2027. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### Kia EV3 Air 2WD Long Range
Version: 2027 · ID: `kia_ev3__air_2wd_long_range__2`

**Buyer reason — Longer range and towing capacity:** Air Long Range pairs a 604km WLTP claim with a 1,000kg maximum braked-towing rating.
- Dependency: `range_km` = 604; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)
- Dependency: `towing_braked_kg` = 1000; status standard; basis: Manufacturer figure. Evidence date 2026-10-05. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)

**Trade-off — Seat climate equipment omitted:** Air still has neither heated nor ventilated front seats.
- Dependency: `front_heated_seats` = "Not fitted"; status unavailable; condition: Earth and GT-Line only.. Evidence date 2026-10-06. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)
- Dependency: `front_ventilated_seats` = "Not fitted"; status unavailable; condition: Earth and GT-Line only.. Evidence date 2026-10-06. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2027. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Braked towing requires suitable approved towing equipment and compliance with vehicle, trailer, occupant/load and towball limits; the rating is not a loaded-trip guarantee.

### Kia EV3 Earth 2WD Long Range
Version: 2027 · ID: `kia_ev3__earth_2wd_long_range__3`

**Buyer reason — Range plus seat climate equipment:** Earth combines a 563km WLTP claim with heated and ventilated front seats.
- Dependency: `range_km` = 563; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)
- Dependency: `front_heated_seats` = "Included"; status standard; condition: Earth and GT-Line only.. Evidence date 2026-10-06. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)
- Dependency: `front_ventilated_seats` = "Included"; status standard; condition: Earth and GT-Line only.. Evidence date 2026-10-06. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)

**Trade-off — Range trade-off:** Its WLTP claim is 41km below Air Long Range’s 604km.
- Dependency: `range_km` = 604; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)
- Dependency: `range_km` = 563; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2027. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### Kia EV3 GT-Line 2WD Long Range
Version: 2027 · ID: `kia_ev3__gt_line_2wd_long_range__4`

**Buyer reason — Head-up display and sunroof:** GT-Line combines a head-up display, sunroof and ventilated front seats.
- Dependency: `screens_hud` = "12.3-inch screen · 12.3-inch driver display · 5-inch climate panel · head-up display"; status standard. Evidence date 2026-10-07. [Kia EV3 MY27 Australian specification sheet](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-07)
- Dependency: `glass_roof` = "Wide sunroof"; status standard. Evidence date 2026-10-07. [Kia EV3 MY27 Australian specification sheet](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-07)
- Dependency: `front_ventilated_seats` = "Included"; status standard; condition: Earth and GT-Line only.. Evidence date 2026-10-06. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)

**Trade-off — Range trade-off:** Its 563km WLTP claim is 41km below Air Long Range’s 604km.
- Dependency: `range_km` = 604; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)
- Dependency: `range_km` = 563; status standard; basis: WLTP combined. Evidence date 2026-10-05. [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2027. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

### BYD ATTO 3 EVO Dynamic FWD
Version: 2026 Australian specification · ID: `byd_atto_3_evo__dynamic_fwd__1`

**Buyer reason — Five-seat range and cargo:** Dynamic offers five seats, a 420km WLTP claim and 434L of seats-up cargo by BYD’s measure.
- Dependency: `seats` = 5; status standard; basis: Seating positions. Evidence date 2026-10-06. [ATTO 3 EVO AU — specification, pp. 2–3](https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3) (accessed 2026-10-06)
- Dependency: `range_km` = 420; status standard; basis: WLTP combined. Evidence date 2026-10-06. [ATTO 3 EVO AU — specification, pp. 2–3](https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3) (accessed 2026-10-06)
- Dependency: `boot_l` = 434; status standard; basis: Manufacturer figure, seats up; method not stated. Evidence date 2026-10-06. [ATTO 3 EVO AU — specification, pp. 2–3](https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3) (accessed 2026-10-06)

**Trade-off — AC and towing limits:** AC input is limited to 7kW, and maximum braked towing is 750kg.
- Dependency: `ac_kw` = 7; status standard; basis: Manufacturer figure. Evidence date 2026-10-06. [ATTO 3 EVO AU — specification, pp. 2–3](https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3) (accessed 2026-10-06)
- Dependency: `towing_braked_kg` = 750; status standard; basis: Manufacturer figure. Evidence date 2026-10-06. [ATTO 3 EVO AU — specification, pp. 2–3](https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- AC input is the vehicle limit, not a guaranteed charging rate. The supply, charger and installation must support the power; more than 7.4 kW normally requires a suitable three-phase installation.
- Braked towing requires suitable approved towing equipment and compliance with vehicle, trailer, occupant/load and towball limits; the rating is not a loaded-trip guarantee.
- BYD does not state the cargo measuring protocol; do not rank this volume directly against VDA or Tesla figures.

Review notes:
- No held EVO price, unverified crash-rating inheritance or older-brochure equipment claim is promoted.

### BYD ATTO 3 EVO Premium RWD
Version: 2026 Australian specification · ID: `byd_atto_3_evo__premium_rwd__2`

**Buyer reason — Range and towing capacity:** Premium RWD pairs a 510km WLTP claim with a 1,500kg maximum braked-towing rating.
- Dependency: `drive` = "RWD". Evidence date 2026-10-06. [ATTO 3 EVO AU — specification, pp. 2–3](https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3) (accessed 2026-10-06)
- Dependency: `range_km` = 510; status standard; basis: WLTP combined. Evidence date 2026-10-06. [ATTO 3 EVO AU — specification, pp. 2–3](https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3) (accessed 2026-10-06)
- Dependency: `towing_braked_kg` = 1500; status standard; basis: Manufacturer figure. Evidence date 2026-10-06. [ATTO 3 EVO AU — specification, pp. 2–3](https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3) (accessed 2026-10-06)

**Trade-off — Cargo comparison needs care:** BYD’s 490L seats-up cargo figure has no stated measuring protocol; check your luggage rather than compare directly with VDA figures.
- Dependency: `boot_l` = 490; status standard; basis: Manufacturer figure, seats up; method not stated. Evidence date 2026-10-06. [ATTO 3 EVO AU — specification, pp. 2–3](https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO.pdf?v=3) (accessed 2026-10-06)

Visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Current/order-listed is a catalogue classification, not confirmation of physical stock, delivery timing or acceptance of a new factory order.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Braked towing requires suitable approved towing equipment and compliance with vehicle, trailer, occupant/load and towball limits; the rating is not a loaded-trip guarantee.

Review notes:
- This trade-off is a measurement/fit caution, not a claim that the boot is smaller or less usable. No held EVO price or older-brochure equipment is promoted.

## Outgoing specifications: separate section

### Geely EX5 Complete
Version: MY2025 / early MY2026 60.22 kWh · ID: `geely_ex5__complete__3`

**Buyer reason — Earlier-pack daily use:** The outgoing Complete combines heated front seats with a 430km WLTP claim.
- Dependency: `front_heated_seats` = "Included"; status standard. Evidence date 2026-10-06. [Geely EX5 Specification Guide, February 2025](https://resource.digitaldealer.com.au/pdf/170215834367b2cde233d6d543706180.pdf) (accessed 2026-10-05)
- Dependency: `range_km` = 430; status standard; basis: WLTP. Evidence date 2026-10-05. [Geely EX5 Specification Guide, February 2025](https://resource.digitaldealer.com.au/pdf/170215834367b2cde233d6d543706180.pdf) (accessed 2026-10-05)

**Trade-off — Less range than the ER version:** Its 430km WLTP claim is 45km below Complete Extended Range’s 475km.
- Dependency: `range_km` = 475; status standard; basis: WLTP. Evidence date 2026-10-05. [Geely EX5 Brochure 2026 — Complete Extended Range / Inspire Extended Range](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `range_km` = 430; status standard; basis: WLTP. Evidence date 2026-10-05. [Geely EX5 Specification Guide, February 2025](https://resource.digitaldealer.com.au/pdf/170215834367b2cde233d6d543706180.pdf) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: MY2025 / early MY2026 60.22 kWh. Confirm the specification of the ordered or inspected vehicle.
- Outgoing specification. No fresh exact-car stock verification is provided here; confirm VIN, battery, build, condition and remaining warranty with the seller. This is not a current factory-order recommendation.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

Review notes:
- Do not inherit current-ER V2V power, heated-steering-wheel availability or updated hardware into this earlier-pack record.

### Geely EX5 Inspire
Version: MY2025 / early MY2026 60.22 kWh · ID: `geely_ex5__inspire__4`

**Buyer reason — Earlier-pack seat equipment:** The outgoing Inspire retains heated and ventilated front seats and a 410km WLTP claim.
- Dependency: `front_heated_seats` = "Included"; status standard. Evidence date 2026-10-06. [Geely EX5 Specification Guide, February 2025](https://resource.digitaldealer.com.au/pdf/170215834367b2cde233d6d543706180.pdf) (accessed 2026-10-05)
- Dependency: `front_ventilated_seats` = "Included"; status standard; condition: Inspire-only.. Evidence date 2026-10-06. [Geely EX5 Specification Guide, February 2025](https://resource.digitaldealer.com.au/pdf/170215834367b2cde233d6d543706180.pdf) (accessed 2026-10-05)
- Dependency: `range_km` = 410; status standard; basis: WLTP. Evidence date 2026-10-05. [Geely EX5 Specification Guide, February 2025](https://resource.digitaldealer.com.au/pdf/170215834367b2cde233d6d543706180.pdf) (accessed 2026-10-05)

**Trade-off — Less range than the ER version:** Its 410km WLTP claim is 40km below Inspire Extended Range’s 450km.
- Dependency: `range_km` = 450; status standard; basis: WLTP. Evidence date 2026-10-05. [Geely EX5 Brochure 2026 — Complete Extended Range / Inspire Extended Range](https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf) (accessed 2026-10-06)
- Dependency: `range_km` = 410; status standard; basis: WLTP. Evidence date 2026-10-05. [Geely EX5 Specification Guide, February 2025](https://resource.digitaldealer.com.au/pdf/170215834367b2cde233d6d543706180.pdf) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: MY2025 / early MY2026 60.22 kWh. Confirm the specification of the ordered or inspected vehicle.
- Outgoing specification. No fresh exact-car stock verification is provided here; confirm VIN, battery, build, condition and remaining warranty with the seller. This is not a current factory-order recommendation.
- WLTP is a laboratory range claim; actual range varies with conditions and use.

Review notes:
- Only the earlier Australian brochure supports the seat-equipment claims here. No current-ER hardware is inherited.

### BYD ATTO 3 (outgoing MY25/MY26) Essential FWD
Version: 2026 Australian specification · ID: `byd_atto_3_legacy__essential_fwd__1`

**Buyer reason — Earlier-model storage and recording:** Outgoing Essential offers a built-in front dashcam and 440L of seats-up cargo by BYD’s measure.
- Dependency: `dashcam` = "Built-in · records to a memory card"; status standard; condition: Front-facing recorder on both grades.. Evidence date 2026-10-06. [BYD ATTO 3 MY25/MY26 Australian specifications](https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf) (accessed 2026-10-05)
- Dependency: `boot_l` = 440; status standard; basis: Manufacturer figure, seats up; method not stated. Evidence date 2026-10-05. [BYD ATTO 3 MY25/MY26 Australian specifications](https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf) (accessed 2026-10-05)

**Trade-off — Less range than outgoing Premium:** Its 345km WLTP claim is 75km below the outgoing Premium’s 420km.
- Dependency: `range_km` = 420; status standard; basis: WLTP combined. Evidence date 2026-10-05. [BYD ATTO 3 MY25/MY26 Australian specifications](https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf) (accessed 2026-10-05)
- Dependency: `range_km` = 345; status standard; basis: WLTP combined. Evidence date 2026-10-05. [BYD ATTO 3 MY25/MY26 Australian specifications](https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf) (accessed 2026-10-05)

Visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Outgoing specification. No fresh exact-car stock verification is provided here; confirm VIN, battery, build, condition and remaining warranty with the seller. This is not a current factory-order recommendation.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- Cargo method is not stated. Dashcam recording needs suitable memory storage; verify its inclusion and operation on the inspected car.

### BYD ATTO 3 (outgoing MY25/MY26) Premium FWD
Version: 2026 Australian specification · ID: `byd_atto_3_legacy__premium_fwd__2`

**Buyer reason — Earlier-model range and seat heating:** Outgoing Premium pairs a 420km WLTP claim with heated front seats.
- Dependency: `range_km` = 420; status standard; basis: WLTP combined. Evidence date 2026-10-05. [BYD ATTO 3 MY25/MY26 Australian specifications](https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf) (accessed 2026-10-05)
- Dependency: `front_heated_seats` = "Included"; status standard; condition: Premium-only.. Evidence date 2026-10-06. [BYD ATTO 3 MY25/MY26 Australian specifications](https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf) (accessed 2026-10-05)

**Trade-off — AC limit and no seat ventilation:** AC input is limited to 7kW; front-seat ventilation is not fitted.
- Dependency: `ac_kw` = 7; status standard; basis: Manufacturer figure. Evidence date 2026-10-05. [BYD ATTO 3 MY25/MY26 Australian specifications](https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf) (accessed 2026-10-05)
- Dependency: `front_ventilated_seats` = "Not fitted"; status unavailable. Evidence date 2026-10-07. [BYD ATTO 3 Australian specification sheet](https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf) (accessed 2026-10-07)

Visible conditions:
- Exact Australian record: 2026 Australian specification. Confirm the specification of the ordered or inspected vehicle.
- Outgoing specification. No fresh exact-car stock verification is provided here; confirm VIN, battery, build, condition and remaining warranty with the seller. This is not a current factory-order recommendation.
- WLTP is a laboratory range claim; actual range varies with conditions and use.
- AC input is the vehicle limit, not a guaranteed charging rate. The supply, charger and installation must support the power; more than 7.4 kW normally requires a suitable three-phase installation.

## Provisional: status notice only

### Kia EV3 GT-Line AWD Long Range
Provisional Australian AWD record. The checked Kia Australia brochure covers four FWD grades; exact AWD specification and order availability remain unconfirmed.

No available-car recommendation, strength or trade-off is supplied. Keep the record outside current-car recommendations. Release only after primary Australian AWD specification and exact availability evidence are checked.

- [EV3 MY2027 Australian mechanical and feature list](https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf) · accessed 2026-10-06 · manufacturer
- [Reported Australian EV3 GT-Line AWD addition](https://www.whichcar.com.au/news/kia-adds-top-spec-model-ev3-small-electric-suv-lineup) · accessed 2026-10-06 · secondary_reporting

## Proposed objective shared facts

- `tesla_model_y__performance_awd__3 / adaptive_damping_system`: Adaptive damping with Standard and Sport modes. Australian Model Y manual; Performance-specific modes. Evidence date 2026-10-06. Objective hardware fitment only; no independent comfort or handling advantage established.
- `zeekr_7x__performance_awd__3 / suspension_hardware`: Air suspension with continuous-control damping. Australian brochure; Performance AWD equipment column. Evidence date 2026-10-06. Objective equipment fitment only; not proof of better ride comfort or handling.
