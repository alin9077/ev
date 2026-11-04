# Bus buyer strengths and trade-offs

Checked 2026-10-10. Source-bound editorial proposal; runtime binding and application review remain pending.

Seven bounded current-listed base configurations receive one strength and one trade-off each. Fleetmaster has one separate optional pair under Classmaster. None is a confirmed open-order exact build or verified unique NEW unit. Citirider BRS8, U18, 14.5E and D E stay audit-only.

## Buyer copy

### Yutong D7E · 28 fixed passenger seats + driver · July 2026 AU sheet

**Strength — 28-seat group layout**  
The listed 28 fixed passenger seats, separate driver seat and rear luggage compartment give the D7E a seated-group layout, with passenger USB and individual air-conditioning vents.

**Trade-off — Duty cycle needs confirmation**  
Exact route range, vehicle charging power and a defined charging-time window remain unverified; the supplier’s generic stock claim does not confirm a July-2026 build ready for delivery.

Availability: current listing only; orders, exact NEW stock and delivery unverified.

Required visible context:
- Yutong D7E · 28 fixed passenger seats + driver · July 2026 AU sheet. This is one bounded current-listed body/layout or sales-sheet scope. The document date is not a manufacturer model year, and options must not be multiplied into new trims.
- Current Australian listing only. Open orders, an exact unsold NEW unit, physical stock, delivery commitment and exact public transaction price are unverified. Trial or enquiry routes do not establish order acceptance.
- Generic seats stays null. Seated passengers, standing passengers, driver seats and wheelchair positions are separate, layout-scoped fields; wheelchair places are never additive. Do not calculate passenger totals or import child/flex capacities.
- Gross and usable battery energy, vehicle AC/DC power and a defined SOC-to-SOC charging time are unverified. Declared capacity, voltage, station power and vehicle acceptance are different quantities; no voltage-times-current, energy/power or energy/consumption inference is allowed.
- Route range and finished payload are not established for this supplied build and operating duty. Published range claims lack comparable conditions; GVM minus kerb mass is not a verified payload. All bus comparison facts stay conditional or not_verified.
- Road offering, ADR seating labels, DDA claims and procurement-category marketing do not establish individual national/state approval, permitted operating mass or contract acceptance. Warranty summaries are scope-limited; no battery-retention promise or panel-wide retail warranty is inferred.
- Do not call this a confirmed open-order or in-stock exact build. VDI stock wording is generic and does not bind the July-2026 sheet to an identifiable NEW unit.
- Do not treat the alternative 23-seat layout as both fixed and reclining without disclosing the page conflict. Leave 23/24-seat layouts as explicit options, not extra base records.
- The 40-child school promotion is neither 40 adult passenger seats nor a normal trim.
- Keep 120/240 kW and 1200/2400 Nm as printed pairs; no unprinted continuous/peak labels.
- The printed 1800 kg towing figure is not established as braked towing or a guaranteed rating at the stated GVM.
- Source field holds: 23-seat page-1 fixed versus page-2 reclining wording conflict; use page-2 option with conflict note; School 40-child promotional capacity is not an adult-seat or standard configuration count.

Required normalized nulls: ac_kw, battery_gross_kwh, battery_usable_kwh, boot_l, cancellation_refund_terms, charge_soc_end, charge_soc_start, charging_station_kw, chassis_mass_kg, completed_vehicle_payload_kg, continuous_power_kw, continuous_torque_nm, dc_charge_time_min, dc_peak_kw, lead_time_days, model_year, peak_torque_nm, power_kw, price_aud, range_cycle, range_km, seats, towing_braked_kg, towing_unbraked_kg, warranty_battery_retention_percent, wheelchair_positions.

Evidence identity: `/workspace/scratch/586427eef9f2/roadmark-research/yutong-bci-electric-buses-evidence.json#/records/0`; record SHA-256 `9760948e8e561d1e6990a849bc11f09653ac79d7b65c4746e3e2562592546946`.
Boundary identity: `/workspace/scratch/586427eef9f2/roadmark-research/bus-integration-boundaries.json#/records/0`; boundary SHA-256 `d2f90390674918a9f028e55c5aeea81571cc7499c10cb65f6780a137067843c7`.

Clause source locations:
- [yutong_d7e_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0009_C%20D7E%20Spec%20Sheet.pdf) — Standard seating / 2; original SHA-256 `6313472fde170c8e68a552ecffc8fc3369501748a2308f6cc33169ff7ff8bfb6`
- [yutong_d7e_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0009_C%20D7E%20Spec%20Sheet.pdf) — Seating options / 2; original SHA-256 `6313472fde170c8e68a552ecffc8fc3369501748a2308f6cc33169ff7ff8bfb6`
- [yutong_d7e_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0009_C%20D7E%20Spec%20Sheet.pdf) — Vehicle configuration - standard equipment / 2; original SHA-256 `6313472fde170c8e68a552ecffc8fc3369501748a2308f6cc33169ff7ff8bfb6`
- [vdi_d7e](https://www.vdiaustralia.com.au/bus/d7e/) — In stock / immediate availability; original SHA-256 `0fd2c73d1f6dc5f426c7651c09bad2bbe10f3ce02050a7889e916791a96ca0d6`
- [vdi_d7e](https://www.vdiaustralia.com.au/bus/d7e/) — In stock and ready to roll; original SHA-256 `0fd2c73d1f6dc5f426c7651c09bad2bbe10f3ce02050a7889e916791a96ca0d6`
The JSON binds each text span, label, visible condition, source fact and field hold to exact source objects. No source-level identity is an application ID.

### Yutong E7S · 16 seated / 8 standing passengers · July 2026 AU sheet

**Strength — Low-floor boarding in 7 metres**  
The 7,000 mm body combines an ultra-low floor, flip-out ramp and kneeling suspension with 16 seated and 8 standing passengers; the driver is separate.

**Trade-off — Standing places and charger fit**  
This layout has 16 passenger seats; its remaining eight passenger places are standing. The right-side DC port is listed, but connector type and vehicle charging power remain unverified.

Availability: current listing only; orders, exact NEW stock and delivery unverified.

Required visible context:
- Yutong E7S · 16 seated / 8 standing passengers · July 2026 AU sheet. This is one bounded current-listed body/layout or sales-sheet scope. The document date is not a manufacturer model year, and options must not be multiplied into new trims.
- Current Australian listing only. Open orders, an exact unsold NEW unit, physical stock, delivery commitment and exact public transaction price are unverified. Trial or enquiry routes do not establish order acceptance.
- Generic seats stays null. Seated passengers, standing passengers, driver seats and wheelchair positions are separate, layout-scoped fields; wheelchair places are never additive. Do not calculate passenger totals or import child/flex capacities.
- Gross and usable battery energy, vehicle AC/DC power and a defined SOC-to-SOC charging time are unverified. Declared capacity, voltage, station power and vehicle acceptance are different quantities; no voltage-times-current, energy/power or energy/consumption inference is allowed.
- Route range and finished payload are not established for this supplied build and operating duty. Published range claims lack comparable conditions; GVM minus kerb mass is not a verified payload. All bus comparison facts stay conditional or not_verified.
- Road offering, ADR seating labels, DDA claims and procurement-category marketing do not establish individual national/state approval, permitted operating mass or contract acceptance. Warranty summaries are scope-limited; no battery-retention promise or panel-wide retail warranty is inferred.
- One wheelchair position is a layout accommodation, not a 25th passenger added to the published 24. Driver is separate.
- The sheet establishes a right-side DC port, not CCS2 connector type, AC support or a vehicle kW maximum.
- Keep 100/200 kW and 230/470 Nm as printed pairs.
- Visible safety labels include BSIS/ISA/DDAW/MOIS. Do not import AEBS from hidden superseded PDF text.

Required normalized nulls: ac_kw, battery_gross_kwh, battery_usable_kwh, boot_l, cancellation_refund_terms, charge_soc_end, charge_soc_start, charging_station_kw, chassis_mass_kg, completed_vehicle_payload_kg, continuous_power_kw, continuous_torque_nm, dc_charge_time_min, dc_peak_kw, lead_time_days, model_year, peak_torque_nm, power_kw, price_aud, range_cycle, range_km, seats, towing_braked_kg, towing_unbraked_kg, warranty_battery_retention_percent.

Evidence identity: `/workspace/scratch/586427eef9f2/roadmark-research/yutong-bci-electric-buses-evidence.json#/records/1`; record SHA-256 `3a765f19eff6fd59a6cb864fba8090f95e68a59c9e6ca5411238fedd4042984f`.
Boundary identity: `/workspace/scratch/586427eef9f2/roadmark-research/bus-integration-boundaries.json#/records/1`; boundary SHA-256 `101518410eb670f4f4745158d583e72a58ccc6731e77426915f17653c0d2d977`.

Clause source locations:
- [yutong_e7s_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-00012_E%20E7S%20Spec%20Sheet.pdf) — Dimensions / 2; original SHA-256 `a9e8be7ec4593ecd6d4b6fa66117a6f5569c765de7c287935a4b3060c833a332`
- [yutong_e7s_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-00012_E%20E7S%20Spec%20Sheet.pdf) — Vehicle configuration - standard equipment / 2; original SHA-256 `a9e8be7ec4593ecd6d4b6fa66117a6f5569c765de7c287935a4b3060c833a332`
- [yutong_e7s_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-00012_E%20E7S%20Spec%20Sheet.pdf) — Suspension and braking / 2; original SHA-256 `a9e8be7ec4593ecd6d4b6fa66117a6f5569c765de7c287935a4b3060c833a332`
- [yutong_e7s_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-00012_E%20E7S%20Spec%20Sheet.pdf) — Standard seating / 2; original SHA-256 `a9e8be7ec4593ecd6d4b6fa66117a6f5569c765de7c287935a4b3060c833a332`
- [yutong_e7s_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-00012_E%20E7S%20Spec%20Sheet.pdf) — Drive system / 2; original SHA-256 `a9e8be7ec4593ecd6d4b6fa66117a6f5569c765de7c287935a4b3060c833a332`
The JSON binds each text span, label, visible condition, source fact and field hold to exact source objects. No source-level identity is an application ID.

### Yutong C12E · 57 fixed passenger seats + driver · July 2026 AU sheet

**Strength — Seated coach with luggage bins**  
The 57-fixed-passenger-seat layout, separate driver seat, overhead racks and full-through luggage bins support seated-group travel; the sheet declares 5,670 L of bus luggage storage.

**Trade-off — Fixed seats and unverified duty cycle**  
The listed layout uses fixed seats; the 53-reclining-seat alternative is separate. Exact route range and vehicle charging power remain unverified, so published battery capacity alone cannot establish trip suitability.

Availability: current listing only; orders, exact NEW stock and delivery unverified.

Required visible context:
- Yutong C12E · 57 fixed passenger seats + driver · July 2026 AU sheet. This is one bounded current-listed body/layout or sales-sheet scope. The document date is not a manufacturer model year, and options must not be multiplied into new trims.
- Current Australian listing only. Open orders, an exact unsold NEW unit, physical stock, delivery commitment and exact public transaction price are unverified. Trial or enquiry routes do not establish order acceptance.
- Generic seats stays null. Seated passengers, standing passengers, driver seats and wheelchair positions are separate, layout-scoped fields; wheelchair places are never additive. Do not calculate passenger totals or import child/flex capacities.
- Gross and usable battery energy, vehicle AC/DC power and a defined SOC-to-SOC charging time are unverified. Declared capacity, voltage, station power and vehicle acceptance are different quantities; no voltage-times-current, energy/power or energy/consumption inference is allowed.
- Route range and finished payload are not established for this supplied build and operating duty. Published range claims lack comparable conditions; GVM minus kerb mass is not a verified payload. All bus comparison facts stay conditional or not_verified.
- Road offering, ADR seating labels, DDA claims and procurement-category marketing do not establish individual national/state approval, permitted operating mass or contract acceptance. Warranty summaries are scope-limited; no battery-retention promise or panel-wide retail warranty is inferred.
- The VDI stock/immediate-delivery assertion is generic; the WA NEW advertisement is placeholder-quality and describes 2025, not a proven July-2026 exact specification.
- The 53-reclining and 83-child 2-for-3 flex school layouts remain options; the latter is explicitly state-dependent and is not 83 adult seats.
- Current page FAQ contains misplaced diesel-D7 answers: no C12E range or charging inference is allowed.
- Keep 215/350 kW and 1260/3100 Nm as printed pairs.
- The printed 1800 kg towing declaration cannot fill towing_braked_kg. Storage 5670 L must be labelled bus luggage-storage declaration, not a comparable passenger-car boot measurement.
- Bus luggage storage is a manufacturer declaration with no established passenger-car boot protocol or luggage load rating; keep generic boot_l null.

Required normalized nulls: ac_kw, battery_gross_kwh, battery_usable_kwh, boot_l, cancellation_refund_terms, charge_soc_end, charge_soc_start, charging_station_kw, chassis_mass_kg, completed_vehicle_payload_kg, continuous_power_kw, continuous_torque_nm, dc_charge_time_min, dc_peak_kw, lead_time_days, model_year, peak_torque_nm, power_kw, price_aud, range_cycle, range_km, seats, towing_braked_kg, towing_unbraked_kg, warranty_battery_retention_percent, wheelchair_positions.

Evidence identity: `/workspace/scratch/586427eef9f2/roadmark-research/yutong-bci-electric-buses-evidence.json#/records/2`; record SHA-256 `f9fa5c0e3adefff82e54113085fd72ca300c63fac8c4a68abed5711eac6a4583`.
Boundary identity: `/workspace/scratch/586427eef9f2/roadmark-research/bus-integration-boundaries.json#/records/2`; boundary SHA-256 `796e75476e789e08c40dd7008618b7cba4b2f05c0b8ebc29d16adf676d5e6050`.

Clause source locations:
- [yutong_c12e_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0001_G%20C12E%20specsheet.pdf) — Standard seating / 2; original SHA-256 `f8a8fc981760b56538d1aee6e51fea208bad6807be2c982237add972d12f70f4`
- [yutong_c12e_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0001_G%20C12E%20specsheet.pdf) — Seating options / 2; original SHA-256 `f8a8fc981760b56538d1aee6e51fea208bad6807be2c982237add972d12f70f4`
- [yutong_c12e_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0001_G%20C12E%20specsheet.pdf) — Vehicle configuration - standard equipment / 2; original SHA-256 `f8a8fc981760b56538d1aee6e51fea208bad6807be2c982237add972d12f70f4`
- [yutong_c12e_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0001_G%20C12E%20specsheet.pdf) — Key specifications / 1; original SHA-256 `f8a8fc981760b56538d1aee6e51fea208bad6807be2c982237add972d12f70f4`
The JSON binds each text span, label, visible condition, source fact and field hold to exact source objects. No source-level identity is an application ID.

### Yutong E12 · Yutong-bodied two-door bus · July 2026 AU sheet

**Strength — Two-door low-floor boarding**  
The Yutong-bodied two-door layout includes a low floor, flip-out ramp and kneeling suspension, with 44 seated passengers and 20 standees listed separately.

**Trade-off — Capacity and battery figures conflict**  
The sheet prints “65 total pax” alongside 44 seated and 20 standing passengers; battery figures also remain ambiguous. Confirm the supplied layout and battery before planning capacity or charging.

Availability: current listing only; orders, exact NEW stock and delivery unverified.

Required visible context:
- Yutong E12 · Yutong-bodied two-door bus · July 2026 AU sheet. This is one bounded current-listed body/layout or sales-sheet scope. The document date is not a manufacturer model year, and options must not be multiplied into new trims.
- Current Australian listing only. Open orders, an exact unsold NEW unit, physical stock, delivery commitment and exact public transaction price are unverified. Trial or enquiry routes do not establish order acceptance.
- Generic seats stays null. Seated passengers, standing passengers, driver seats and wheelchair positions are separate, layout-scoped fields; wheelchair places are never additive. Do not calculate passenger totals or import child/flex capacities.
- Gross and usable battery energy, vehicle AC/DC power and a defined SOC-to-SOC charging time are unverified. Declared capacity, voltage, station power and vehicle acceptance are different quantities; no voltage-times-current, energy/power or energy/consumption inference is allowed.
- Route range and finished payload are not established for this supplied build and operating duty. Published range claims lack comparable conditions; GVM minus kerb mass is not a verified payload. All bus comparison facts stay conditional or not_verified.
- Road offering, ADR seating labels, DDA claims and procurement-category marketing do not establish individual national/state approval, permitted operating mass or contract acceptance. Warranty summaries are scope-limited; no battery-retention promise or panel-wide retail warranty is inferred.
- Do not name this 434-kWh or 399-kWh trim. Cover 434 kWh and full-table 434 / 399 kWh are separate source declarations; no gross/usable meaning or orderable battery split is established.
- 44 seated passengers and 20 standees can be shown separately; keep normalized total passenger capacity null because printed total pax is 65. Never repair it to 64 or add wheelchair positions.
- Do not combine the current Yutong body with the 2024 Volgren Optimus body/chassis pairing, 350 kWh, 81-passenger or 360-km claims.
- No AEBS label is visible in the current sheet; hidden extraction text cannot establish the feature.
- The old 120w and nonspecific three-hour wording cannot become current charging power or a 0–100% duration.
- Source field holds: Normalized total passenger capacity; 399 kWh variant and gross/usable interpretation; Exact configuration link to old 40-seat/44-seat pages; Any Volgren body specifications.

Required normalized nulls: ac_kw, battery_gross_kwh, battery_kwh, battery_usable_kwh, boot_l, cancellation_refund_terms, charge_soc_end, charge_soc_start, charging_station_kw, chassis_mass_kg, completed_vehicle_payload_kg, dc_charge_time_min, dc_peak_kw, lead_time_days, model_year, passenger_capacity, price_aud, range_cycle, range_km, seats, towing_braked_kg, towing_unbraked_kg, warranty_battery_retention_percent.

Evidence identity: `/workspace/scratch/586427eef9f2/roadmark-research/yutong-bci-electric-buses-evidence.json#/records/3`; record SHA-256 `407986b508bd0d01c8d4e979e57113a0bd1103bbed5cff14eec27b79cd1aad22`.
Boundary identity: `/workspace/scratch/586427eef9f2/roadmark-research/bus-integration-boundaries.json#/records/3`; boundary SHA-256 `7ea9c01681a3a523a9f8eae6854294fb379e238eac6bcf256b9c6d36ca15c83c`.

Clause source locations:
- [yutong_e12_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0003_G%20E12%20Spec%20Sheet.pdf) — Vehicle configuration - standard equipment / 2; original SHA-256 `4d484a7fa5ed4385a759643f70564b37fd8aa302f373baa8f649c61c39741d33`
- [yutong_e12_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0003_G%20E12%20Spec%20Sheet.pdf) — Suspension and braking / 2; original SHA-256 `4d484a7fa5ed4385a759643f70564b37fd8aa302f373baa8f649c61c39741d33`
- [yutong_e12_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0003_G%20E12%20Spec%20Sheet.pdf) — Standard seating / 2; original SHA-256 `4d484a7fa5ed4385a759643f70564b37fd8aa302f373baa8f649c61c39741d33`
- [yutong_e12_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0003_G%20E12%20Spec%20Sheet.pdf) — Key specifications / 1; original SHA-256 `4d484a7fa5ed4385a759643f70564b37fd8aa302f373baa8f649c61c39741d33`
- [yutong_e12_spec](https://links.vdiaustralia.com.au/hubfs/Vehicle%20Brochures/D60-0003_G%20E12%20Spec%20Sheet.pdf) — Drive system / Battery / 2; original SHA-256 `4d484a7fa5ed4385a759643f70564b37fd8aa302f373baa8f649c61c39741d33`
The JSON binds each text span, label, visible condition, source fact and field hold to exact source objects. No source-level identity is an application ID.

### BCI Classmaster EV · listed 57-fixed-seat layout · February 2025 sheet

**Strength — Belted seats and underfloor storage**  
The listed 57 fixed passenger seats have three-point belts, alongside about 7.5 m³ of underfloor bus luggage storage, giving seated-group operators a defined layout to assess.

**Trade-off — High floor and unresolved battery**  
Its 1,200 mm floor and optional wheelchair loader need accessibility planning. Battery energy is unverified because the sheet prints “422 kW”; the 420 km and over-450 km range claims also conflict.

Availability: current listing only; orders, exact NEW stock and delivery unverified.

Required visible context:
- BCI Classmaster EV · listed 57-fixed-seat layout · February 2025 sheet. This is one bounded current-listed body/layout or sales-sheet scope. The document date is not a manufacturer model year, and options must not be multiplied into new trims.
- Current Australian listing only. Open orders, an exact unsold NEW unit, physical stock, delivery commitment and exact public transaction price are unverified. Trial or enquiry routes do not establish order acceptance.
- Generic seats stays null. Seated passengers, standing passengers, driver seats and wheelchair positions are separate, layout-scoped fields; wheelchair places are never additive. Do not calculate passenger totals or import child/flex capacities.
- Gross and usable battery energy, vehicle AC/DC power and a defined SOC-to-SOC charging time are unverified. Declared capacity, voltage, station power and vehicle acceptance are different quantities; no voltage-times-current, energy/power or energy/consumption inference is allowed.
- Route range and finished payload are not established for this supplied build and operating duty. Published range claims lack comparable conditions; GVM minus kerb mass is not a verified payload. All bus comparison facts stay conditional or not_verified.
- Road offering, ADR seating labels, DDA claims and procurement-category marketing do not establish individual national/state approval, permitted operating mass or contract acceptance. Warranty summaries are scope-limited; no battery-retention promise or panel-wide retail warranty is inferred.
- The base research configurationName is family-like; it must be narrowed to the 57-fixed-seat listed layout before a detail row is counted. Do not call it a manufacturer-named trim or assume it is the only/default layout.
- CATL 422 kW LFP is a malformed battery-energy row: all normalized battery kWh values stay null; chemistry may remain conditional.
- 420-km and exceeding-450-km claims conflict and lack common operating conditions. Generic range_km stays null.
- The 53-reclining layout is a separate explicitly listed alternative, not automatically another base row.
- Panel 1J FBC6127BRS4 drawing and procurement warranty must not overwrite this sales-sheet epoch. Wheelchair loader is optional, not standard low-floor boarding.
- Source field holds: 422 kW battery unit; Conflicting 420 / exceeding 450 km range wording; Panel 1J drawing identity and dimensions must not overwrite current sales sheet.
- Bus luggage storage is a manufacturer declaration with no established passenger-car boot protocol or luggage load rating; keep generic boot_l null.

Required normalized nulls: ac_kw, battery_gross_kwh, battery_kwh, battery_usable_kwh, battery_warranty, boot_l, cancellation_refund_terms, charge_soc_end, charge_soc_start, charging_station_kw, chassis_mass_kg, complete_bus_kerb_mass_kg, completed_vehicle_payload_kg, dc_charge_time_min, dc_peak_kw, driver_seats, lead_time_days, model_year, price_aud, range_cycle, range_km, seats, standing_passengers, towing_braked_kg, towing_unbraked_kg, warranty, warranty_battery_retention_percent, warranty_corrosion.

Evidence identity: `/workspace/scratch/586427eef9f2/roadmark-research/yutong-bci-electric-buses-evidence.json#/records/4`; record SHA-256 `008d5b5880507b309c761ef3a9530531246e1064094bad9d594b01d4a8921bba`.
Boundary identity: `/workspace/scratch/586427eef9f2/roadmark-research/bus-integration-boundaries.json#/records/4`; boundary SHA-256 `9a3b406af8e88a8767265778687d1f208c35acd6bfed8a79690e9d291f83147a`.

Clause source locations:
- [bci_classmaster_pdf](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-classmaster-EV-v3.pdf) — Seating / 57 fixed or 53 reclining / 2; original SHA-256 `914adcc2f890bfcbadcac70621362ad94f4c5861b2765234fcc5e36482dc36b8`
- [bci_classmaster_pdf](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-classmaster-EV-v3.pdf) — Layout options / 2; original SHA-256 `914adcc2f890bfcbadcac70621362ad94f4c5861b2765234fcc5e36482dc36b8`
- [bci_classmaster_pdf](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-classmaster-EV-v3.pdf) — Seating / 2; original SHA-256 `914adcc2f890bfcbadcac70621362ad94f4c5861b2765234fcc5e36482dc36b8`
- [bci_classmaster_pdf](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-classmaster-EV-v3.pdf) — Storage / 2; original SHA-256 `914adcc2f890bfcbadcac70621362ad94f4c5861b2765234fcc5e36482dc36b8`
- [bci_classmaster_pdf](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-classmaster-EV-v3.pdf) — Body and equipment / 2; original SHA-256 `914adcc2f890bfcbadcac70621362ad94f4c5861b2765234fcc5e36482dc36b8`
- [bci_classmaster_pdf](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-classmaster-EV-v3.pdf) — Optional features / 2; original SHA-256 `914adcc2f890bfcbadcac70621362ad94f4c5861b2765234fcc5e36482dc36b8`
- [bci_classmaster_pdf](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-classmaster-EV-v3.pdf) — Chassis / Batteries / 1; original SHA-256 `914adcc2f890bfcbadcac70621362ad94f4c5861b2765234fcc5e36482dc36b8`
- [bci_classmaster_pdf](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-classmaster-EV-v3.pdf) — Autonomy range / 1; original SHA-256 `914adcc2f890bfcbadcac70621362ad94f4c5861b2765234fcc5e36482dc36b8`
The JSON binds each text span, label, visible condition, source fact and field hold to exact source objects. No source-level identity is an application ID.

### BCI Mini Bus 5.9m EV · advertised standard 12-seat layout · February 2025 sheet

**Strength — Short-body sales-sheet layout**  
The February-2025 sales sheet advertises a standard 12-seat layout in a 5,915 mm body, with ABS, stability control and a driver airbag listed.

**Trade-off — Powertrain and capacity unresolved**  
The sales sheet and linked guide disagree on motor output, motor location and width. The 12-seat label has unresolved driver inclusion, so this is not a verified 12-passenger or fully specified build.

Availability: current listing only; orders, exact NEW stock and delivery unverified.

Required visible context:
- BCI Mini Bus 5.9m EV · advertised standard 12-seat layout · February 2025 sheet. This is one bounded current-listed body/layout or sales-sheet scope. The document date is not a manufacturer model year, and options must not be multiplied into new trims.
- Current Australian listing only. Open orders, an exact unsold NEW unit, physical stock, delivery commitment and exact public transaction price are unverified. Trial or enquiry routes do not establish order acceptance.
- Generic seats stays null. Seated passengers, standing passengers, driver seats and wheelchair positions are separate, layout-scoped fields; wheelchair places are never additive. Do not calculate passenger totals or import child/flex capacities.
- Gross and usable battery energy, vehicle AC/DC power and a defined SOC-to-SOC charging time are unverified. Declared capacity, voltage, station power and vehicle acceptance are different quantities; no voltage-times-current, energy/power or energy/consumption inference is allowed.
- Route range and finished payload are not established for this supplied build and operating duty. Published range claims lack comparable conditions; GVM minus kerb mass is not a verified payload. All bus comparison facts stay conditional or not_verified.
- Road offering, ADR seating labels, DDA claims and procurement-category marketing do not establish individual national/state approval, permitted operating mass or contract acceptance. Warranty summaries are scope-limited; no battery-retention promise or panel-wide retail warranty is inferred.
- Admission is sales-sheet-scoped only. If the UI cannot keep this scope and the technical conflicts visible, retain the family in audit/search instead of publishing a falsely exact build.
- Normalized motor output, motor location/drive, and width stay null. Sales sheet says 140 kW/front/2000 mm; linked September-2024 guide says 120 kW/rear and elsewhere 150 kW/centred, with 2040 mm width.
- Generic seats and normalized driver-exclusive passenger capacity stay null. The standard 12-seat and optional 14-seat claims can be quoted as layout labels; drawings include cab seats and driver inclusion is unresolved.
- 105 kW/hr and manual 105 kW are not verified battery kWh. The two-hour fast-charge claim lacks SOC endpoints and station rating.
- Manual CCS2 and DC 650 V/100 A or AC 220 V/30 A applicability is unresolved; do not calculate 65/6.6 kW vehicle charging capability.
- The filename 5.6 m, cover 5.9 m, and separately linked 7.5/7.6 m guide are not new trim identities. No 7.5m vehicle row is justified.
- Source field holds: Battery energy unit; Motor output/location; Width; Manual charging-limit applicability; Driver inclusion in 12/14 seats.

Required normalized nulls: ac_kw, battery_gross_kwh, battery_kwh, battery_usable_kwh, boot_l, cancellation_refund_terms, charge_soc_end, charge_soc_start, charging_station_kw, chassis_mass_kg, complete_bus_kerb_mass_kg, completed_vehicle_payload_kg, continuous_power_kw, continuous_torque_nm, dc_charge_time_min, dc_peak_kw, drive, driver_seats, equipment_accessibility, lead_time_days, manual_charging_limits_unresolved, model_year, motor_layout, motor_layout_unresolved, motor_output_unresolved_kw, passenger_capacity, peak_torque_nm, power_kw, price_aud, range_cycle, range_km, seated_passengers, seats, standing_passengers, towing_braked_kg, towing_unbraked_kg, warranty_battery_retention_percent, warranty_corrosion, width_mm.

Evidence identity: `/workspace/scratch/586427eef9f2/roadmark-research/yutong-bci-electric-buses-evidence.json#/records/5`; record SHA-256 `f6d1ec1e38a133af5f076c26cbc9a6c9eeb01357c10fdf5ffdbb75a09c1333ed`.
Boundary identity: `/workspace/scratch/586427eef9f2/roadmark-research/bus-integration-boundaries.json#/records/5`; boundary SHA-256 `f9556df2bfd441091c1a93d7e69fd3b9eebaa102080e11dedd1dbe2e480d325c`.

Clause source locations:
- [bci_mini](https://bcibus.com.au/ev-ranged-buses/mini-bus-ev/6m-seats-ev/) — Model page / Enquire Now; original SHA-256 `50ac987619492df896a42199f6486bbef113dbf0551bfad8797eb900e9e40f63`
- [bci_mini_pdf1](https://bcibus.com.au/wp-content/uploads/2024/08/bci-specification-sheet-mini-bus-EV-v3.pdf) — Layout options / 2; original SHA-256 `a7719f1148b7b1a9c073659b455831aabdfc83d1f732d3950dcb97925d8c15f2`
- [bci_mini_pdf1](https://bcibus.com.au/wp-content/uploads/2024/08/bci-specification-sheet-mini-bus-EV-v3.pdf) — Body and equipment / Dimensions / 2; original SHA-256 `a7719f1148b7b1a9c073659b455831aabdfc83d1f732d3950dcb97925d8c15f2`
- [bci_mini_pdf1](https://bcibus.com.au/wp-content/uploads/2024/08/bci-specification-sheet-mini-bus-EV-v3.pdf) — Chassis and page 2 equipment / 1; original SHA-256 `a7719f1148b7b1a9c073659b455831aabdfc83d1f732d3950dcb97925d8c15f2`
- [bci_mini_pdf1](https://bcibus.com.au/wp-content/uploads/2024/08/bci-specification-sheet-mini-bus-EV-v3.pdf) — Max output / 1; original SHA-256 `a7719f1148b7b1a9c073659b455831aabdfc83d1f732d3950dcb97925d8c15f2`
- [bci_mini_pdf1](https://bcibus.com.au/wp-content/uploads/2024/08/bci-specification-sheet-mini-bus-EV-v3.pdf) — Chassis / Layout / 1; original SHA-256 `a7719f1148b7b1a9c073659b455831aabdfc83d1f732d3950dcb97925d8c15f2`
- [bci_mini_pdf5](https://bcibus.com.au/wp-content/uploads/2024/08/EV-Cargo-Van-Bus-handbook-A4-5.6-mtr-version-1.0.pdf) — 10.0/10.1 Charging / 20; original SHA-256 `de1b0eb89e9cff0a7241c424e581affb190f34949733780f2511c9407c8045b9`
The JSON binds each text span, label, visible condition, source fact and field hold to exact source objects. No source-level identity is an application ID.

### BCI Proma Low Floor EV · listed 28-seat metro layout · February 2025 sheet

**Strength — Metro layout with boarding ramp**  
The listed 28-seat metro layout pairs a 9,160 mm low-floor body with a manual fold-out wheelchair ramp and electronically controlled air suspension.

**Trade-off — Wheelchair layout needs clarification**  
The separate 17-seat accessible option conflicts on two versus up to four wheelchair positions; neither count belongs to this 28-seat layout. Battery energy and vehicle charging power remain unverified.

Availability: current listing only; orders, exact NEW stock and delivery unverified.

Required visible context:
- BCI Proma Low Floor EV · listed 28-seat metro layout · February 2025 sheet. This is one bounded current-listed body/layout or sales-sheet scope. The document date is not a manufacturer model year, and options must not be multiplied into new trims.
- Current Australian listing only. Open orders, an exact unsold NEW unit, physical stock, delivery commitment and exact public transaction price are unverified. Trial or enquiry routes do not establish order acceptance.
- Generic seats stays null. Seated passengers, standing passengers, driver seats and wheelchair positions are separate, layout-scoped fields; wheelchair places are never additive. Do not calculate passenger totals or import child/flex capacities.
- Gross and usable battery energy, vehicle AC/DC power and a defined SOC-to-SOC charging time are unverified. Declared capacity, voltage, station power and vehicle acceptance are different quantities; no voltage-times-current, energy/power or energy/consumption inference is allowed.
- Route range and finished payload are not established for this supplied build and operating duty. Published range claims lack comparable conditions; GVM minus kerb mass is not a verified payload. All bus comparison facts stay conditional or not_verified.
- Road offering, ADR seating labels, DDA claims and procurement-category marketing do not establish individual national/state approval, permitted operating mass or contract acceptance. Warranty summaries are scope-limited; no battery-retention promise or panel-wide retail warranty is inferred.
- Narrow the family-like base configurationName to the 28-seat metro layout; do not silently combine it with the 29-belted or 17-seat accessible layouts.
- CATL x8 is a pack count, not battery energy; kWh values stay null.
- The 17-seat accessible alternative has two versus up-to-four wheelchair positions in the same source. Keep that variant conflict separate and do not attach those spaces to the 28-seat layout.
- Up to 300 km versus exceeds 300 km are unstandardized/conflicting claims; no ranked range value.
- EBS and cruise control occur in both standard and optional wording. Contract-specific inclusion must remain held even though a source fact has status verified.
- Source field holds: Total battery energy; 2 versus up-to-4 accessible wheelchair positions; Unstandardized range.

Required normalized nulls: ac_kw, battery_gross_kwh, battery_kwh, battery_usable_kwh, battery_warranty, boot_l, cancellation_refund_terms, charge_soc_end, charge_soc_start, charging_station_kw, chassis_mass_kg, complete_bus_kerb_mass_kg, completed_vehicle_payload_kg, dc_charge_time_min, dc_peak_kw, driver_seats, lead_time_days, model_year, price_aud, range_cycle, range_km, seats, standing_passengers, towing_braked_kg, towing_unbraked_kg, warranty, warranty_battery_retention_percent, warranty_corrosion, wheelchair_positions.

Evidence identity: `/workspace/scratch/586427eef9f2/roadmark-research/yutong-bci-electric-buses-evidence.json#/records/6`; record SHA-256 `3b470b7a27fba1076cedb478a48b48b63b4ede40c4dc908dc6b8fd79578e8aaa`.
Boundary identity: `/workspace/scratch/586427eef9f2/roadmark-research/bus-integration-boundaries.json#/records/6`; boundary SHA-256 `853a2705b28b70f704a7015a2bdac132051c939a7fa99bbb6b53190ec2dd9fc9`.

Clause source locations:
- [bci_proma_extra2](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-proma-low-floor-EV-v3.pdf) — Seating / 2; original SHA-256 `381757e580315aa8246285903197a3fa4f0a45482f479f54ba55665238455e1a`
- [bci_proma_extra2](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-proma-low-floor-EV-v3.pdf) — Seating / Layout options / 2; original SHA-256 `381757e580315aa8246285903197a3fa4f0a45482f479f54ba55665238455e1a`
- [bci_proma_extra2](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-proma-low-floor-EV-v3.pdf) — Body and equipment / Dimensions / 2; original SHA-256 `381757e580315aa8246285903197a3fa4f0a45482f479f54ba55665238455e1a`
- [bci_proma](https://bcibus.com.au/ev-ranged-buses/citirider-ev/proma-low-floor-ev/) — Body and equipment / Standard features; original SHA-256 `7acbc8a7ac702642958920f9e00d7dffb42b3155078a4139802d61c316f5119c`
- [bci_proma_extra2](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-proma-low-floor-EV-v3.pdf) — Equipment / Layout options / 2; original SHA-256 `381757e580315aa8246285903197a3fa4f0a45482f479f54ba55665238455e1a`
- [bci_proma_extra2](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-proma-low-floor-EV-v3.pdf) — Alternative configurations / Layout options / 2; original SHA-256 `381757e580315aa8246285903197a3fa4f0a45482f479f54ba55665238455e1a`
- [bci_proma_extra2](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-proma-low-floor-EV-v3.pdf) — Chassis / Batteries / 1; original SHA-256 `381757e580315aa8246285903197a3fa4f0a45482f479f54ba55665238455e1a`
The JSON binds each text span, label, visible condition, source fact and field hold to exact source objects. No source-level identity is an application ID.

### BCI Fleetmaster EV Mining Coach · 53 reclining passenger seats · February 2025 sheet (optional named derivative)

**Strength — Mining-focused reclining layout**  
This named Classmaster derivative lists 53 reclining, three-point-belted passenger seats, plus wheel-lock indicators, a lockable battery isolator and dual roof beacons for mining-fleet assessment.

**Trade-off — Contract specification still matters**  
Battery energy is unverified and the 420 km range lacks common test conditions. EBS/ESC are listed as options despite ESC appearing in the brake row; confirm the supplied equipment, charging and road-registration scope.

Availability: current listing only; orders, exact NEW stock and delivery unverified.

Required visible context:
- BCI Fleetmaster EV Mining Coach · 53 reclining passenger seats · February 2025 sheet. This is one bounded current-listed body/layout or sales-sheet scope. The document date is not a manufacturer model year, and options must not be multiplied into new trims.
- Current Australian listing only. Open orders, an exact unsold NEW unit, physical stock, delivery commitment and exact public transaction price are unverified. Trial or enquiry routes do not establish order acceptance.
- Generic seats stays null. Seated passengers, standing passengers, driver seats and wheelchair positions are separate, layout-scoped fields; wheelchair places are never additive. Do not calculate passenger totals or import child/flex capacities.
- Gross and usable battery energy, vehicle AC/DC power and a defined SOC-to-SOC charging time are unverified. Declared capacity, voltage, station power and vehicle acceptance are different quantities; no voltage-times-current, energy/power or energy/consumption inference is allowed.
- Route range and finished payload are not established for this supplied build and operating duty. Published range claims lack comparable conditions; GVM minus kerb mass is not a verified payload. All bus comparison facts stay conditional or not_verified.
- Road offering, ADR seating labels, DDA claims and procurement-category marketing do not establish individual national/state approval, permitted operating mass or contract acceptance. Warranty summaries are scope-limited; no battery-retention promise or panel-wide retail warranty is inferred.
- Mining equipment does not prove off-road-only status or unrestricted public-road approval. Do not infer either; retain road-registration scope unverified.
- CATL 422 kW LFP remains a unit error; battery kWh null.
- 420 km is unstandardized. Range comparison remains null; retain only a qualified raw claim.
- EBS/ESC optional wording overlaps ESC in the brake row. Resolve contract inclusion before claiming standard.
- No Fleetmaster-specific NEW stock, orders-open statement, delivered payload or full sale-contract warranty established.
- Reconcile the old Fleetmaster lead as a named derivative under Classmaster; do not leave an unresolved older-brochure-only warning alongside a promoted duplicate family.

Required normalized nulls: ac_kw, battery_gross_kwh, battery_kwh, battery_usable_kwh, battery_warranty, boot_l, cancellation_refund_terms, charge_soc_end, charge_soc_start, charging_station_kw, chassis_mass_kg, completed_vehicle_payload_kg, dc_charge_time_min, dc_peak_kw, driver_seats, lead_time_days, model_year, passenger_capacity, price_aud, range_cycle, range_km, seats, standing_passengers, towing_braked_kg, towing_unbraked_kg, warranty, warranty_battery_retention_percent, warranty_corrosion.

Evidence identity: `/workspace/scratch/586427eef9f2/roadmark-research/yutong-bci-electric-buses-evidence.json#/bodyOptions/13`; record SHA-256 `fdb8e423d38887c8fc863b6a44bb6e0073861564502c2fe6954d1767c43df98e`.
Boundary identity: `/workspace/scratch/586427eef9f2/roadmark-research/bus-integration-boundaries.json#/namedDerivative`; boundary SHA-256 `879ee413182d3abfd6cfd268cd1521a59f7e278af7622da79e8eb38c41433e23`.

Clause source locations:
- [bci_classmaster](https://bcibus.com.au/ev-ranged-buses/classmaster-ev/classmaster-ev/) — Introduction; original SHA-256 `7ec1de71afd77c8796e7d81d8e33c4adba224af329bf2bf3dd8f1f9e26fab4e0`
- [bci_fleetmaster_extra2](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-fleetmaster-EV-mining-coach-v3.pdf) — Seating / 2; original SHA-256 `934896318510e382fd0fbf7696d4fe76c21270d687c51ff3139668ad7a82578b`
- [bci_fleetmaster_extra2](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-fleetmaster-EV-mining-coach-v3.pdf) — Standard features / 2; original SHA-256 `934896318510e382fd0fbf7696d4fe76c21270d687c51ff3139668ad7a82578b`
- [bci_fleetmaster_extra2](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-fleetmaster-EV-mining-coach-v3.pdf) — Batteries / 1; original SHA-256 `934896318510e382fd0fbf7696d4fe76c21270d687c51ff3139668ad7a82578b`
- [bci_fleetmaster_extra2](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-fleetmaster-EV-mining-coach-v3.pdf) — Autonomy range / 1; original SHA-256 `934896318510e382fd0fbf7696d4fe76c21270d687c51ff3139668ad7a82578b`
- [bci_fleetmaster_extra2](https://bcibus.com.au/wp-content/uploads/2023/08/bci-specification-sheet-fleetmaster-EV-mining-coach-v3.pdf) — Optional features / 2; original SHA-256 `934896318510e382fd0fbf7696d4fe76c21270d687c51ff3139668ad7a82578b`
The JSON binds each text span, label, visible condition, source fact and field hold to exact source objects. No source-level identity is an application ID.

## Shared non-negotiable holds

- No inferred manufacturer model year from July 2026/February 2025 document dates, retrieval date, URL folder or revision suffix.
- Yutong visible rendered pages govern. Hidden superseded layers and filename revision letters do not establish current safety/layout equipment. D7E URL C/footer D; C12E and E12 URL G/footer D remain recorded conflicts.
- Do not rename 750 V as 750 kW, infer charge power from volts times amps, infer charge time from battery divided by power, infer range from energy divided by consumption, or infer finished payload from GVM minus kerb.
- Do not reinterpret 434 / 399 kWh as gross/usable or two trims, CATL 422 kW as kWh, or 105 kW/hr as verified kWh.
- Seat layouts, child/flex school capacity, wheelchair occupancy, doors, battery choices, body suppliers and upholstery must never generate a Cartesian-product trim set.
- Only a complete bus counts as a road vehicle. Chassis plus body is one relationship, and a body-platform entry is not a second vehicle.
- GVM declarations, ADR 68 seating, DDA claims and TfNSW panel/category marketing are not independent national or state-permitted operating-mass/registration verification.
- Panel battery warranty says 85 months, 7.5 years and seven years/five months alongside 800000 km. Preserve the contradiction and procurement scope; do not create a clean retail warranty promise.
- No disclosed source validation result establishes supplier truth, real-world range, physical stock, legal approval, current order acceptance or exhaustive market coverage.
- Before any later integration, reconcile existing family records instead of adding duplicate family counts, and separately count listed configurations, named derivatives, audit-only technical references and verified stock units.

## Audit-only exclusions

### BCI Citirider EV · FBC6120BRS8 technical reference · January 2026 guide

The current Citirider family page links a BRS8 operator guide, but its live commercial sheet describes materially different dimensions, battery text and power and does not bind the sold seating/build to BRS8. A current aftersales link establishes technical-document availability, not a current exact NEW sales configuration.

- Do not add a BRS8 current_or_order_listed Variant from this package. Retain the family as listed_unconfirmed and attach BRS8 as a named technical-epoch reference.
- Do not borrow 45 seats / 20 standees, 350 kW, 350 km, 422 kW LFP battery text or February-2025 dimensions from the sales sheet.
- Do not borrow FBC6120BRS5 November-2022 DRAFT data, 410-kW peak or 310-kW 30-minute data from Panel 1G/1H. BRS8 and BRS5 are different technical identities.
- The BRS8 guide title/filename says March 2026; internal issue table says January 2026. Neither date establishes model year or a new-order cutoff.
- Preserve the sketch total-length label 1243 as a source error. The 12436 mm specification is the table value, not a silently repaired diagram.
- Two CCS2 ports permit one port at a time, not simultaneous dual-gun charging.

Release evidence: A current Australian commercial/order specification explicitly binding FBC6120BRS8 to the offered complete body, seat/door layout and technical epoch, with conflicts to the current sales sheet resolved. An aftersales-manual hyperlink alone is insufficient.
### BCI Citirider 14.5E · specification/procurement lead; exact current sales build unconfirmed

Audit/search only; exact sales build not established.

- Keep Panel 4 category as procurement-scope evidence, not a new exact sales trim or independent chassis plus body count.
- The 1K 14.5m link reuses a 12m BRS5 manual; it cannot supply 14.5m battery, motor or mass. The 1L double-deck entry lacks a matched operator guide.
- Named BRS2 drawing identities do not authorize importing specifications from another Citirider.

Release evidence: Model-matched current Australian complete-bus commercial specification and applicable body/seating/road procurement configuration.
### BCI Citirider D E · specification/procurement lead; exact current sales build unconfirmed

Audit/search only; exact sales build not established.

- Keep Panel 4 category as procurement-scope evidence, not a new exact sales trim or independent chassis plus body count.
- The 1K 14.5m link reuses a 12m BRS5 manual; it cannot supply 14.5m battery, motor or mass. The 1L double-deck entry lacks a matched operator guide.
- Named BRS2 drawing identities do not authorize importing specifications from another Citirider.

Release evidence: Model-matched current Australian complete-bus commercial specification and applicable body/seating/road procurement configuration.
### Yutong U18 · July 2026 Australian specification lead; state exemptions unresolved

Audit/search only; exact sales build not established.

- Two-door 54 seated + 37 standing and three-door 50 + 41 are explicit alternative 91-passenger layouts, not freely combinable dimensions. State-specific door/capacity exemptions remain mandatory qualifications.
- The cover photograph is explicitly European; it is not proof of the supplied AU body/equipment.
- Three-door kerb mass prints 2350 kg; two-door mass is 19950 kg. Never repair 2350 to a guessed five-digit value or calculate payload.
- Torque prints 1350kW*2 / 2600Nm*2. Keep raw units; normalized torque null.
- Motor figures are two motors each 150-kW continuous/260-kW peak. Preserve per-motor scope rather than an unqualified total-output claim.
- 528 kWh divided by the as-low-as 0.9 kWh/km SORT2 claim must not become a range. Load, HVAC and other operating conditions are absent.
- No generally open order book, confirmed local state exemption, contract delivery commitment or specific NEW unit is established.

Release evidence: Exact Australian supplied layout and applicable state exemption/approval, matched supply/order evidence, and corrected mass/torque specification for that technical epoch.

## Binding and release checks

- Research sourceRecordId and suggested mapping IDs are not runtime identities. All integratedVariantId and effectiveSnapshotSha256 fields remain null until the final integration is verified.
- Bind exact family, complete body, listed layout, technical epoch and source-date meaning. Classmaster is the 57-fixed-seat layout; Proma is 28 metro seats; Mini is the February-2025 advertised standard-layout identity only.
- Every clause, label, assertion and required visible condition must retain value/unit/status/basis/conditions/source IDs/URLs/hashes/dates/locators and conflict scope. Nulls are evidence holds, not absent capability. Omitted evidence must suppress affected copy.
- Preserve every fieldGuardBinding and normalizedFieldHold in the effective catalogue. Generic seats stays null; use bus-specific seated/standing/driver/wheelchair fields and suppress the generic seating visualization. Never calculate passenger totals or add wheelchair positions.
- Use only Current manufacturer listing semantics: orderStatus=listed_unconfirmed and stockStatus=unverified. D7E/C12E supplier stock claims and the placeholder WA C12E advert cannot establish exact units, model-year alignment or delivery.
- Keep malformed battery units, unlabelled motor pairs, towing classification and bus luggage protocols distinct. Never normalize 422 kW or 105 kW/hr to kWh, 750 V to charge power, or luggage volume to a passenger-car boot comparison.
- No cross-body/epoch grafting: Yutong-bodied E12 versus Volgren; current BRS8 manual versus BRS5 draft or commercial sheet; Mini sales sheet versus disputed manuals; Classmaster sales sheet versus panel drawings.
- Do not make a factory combination or multiply option rows. Fleetmaster is optional, keeps its own name and remains a Classmaster derivative; Citirider BRS8, U18, 14.5E and D E have no buyer-summary pair or exact detail admission here.
- Every bus comparison fact remains conditional or not_verified. vehicle_class=bus separates comparison buckets but does not itself prevent ranking; rankingEligible=false here is metadata, not a runtime guard.
- If Mini scope, nulls and unresolved powertrain/capacity warning cannot remain visible, retain it in family audit/search. Do not publish the short strength without its trade-off and required context.
- Before release, mutation-test fact value/unit/status/basis/conditions/source ID/URL/hash/check date/locator; identity/body/layout/epoch; availability; optionality; null holds; conflicts; and visible-condition text/dependencies. Any changed or deleted dependency must fail closed.
- Recheck final rendered copy and effective nulls after binding. This deliverable performs source validation only; no application build, runtime guard test, browser QA or deployment was performed.

## Validation

Passed: 2748 source checks; 943 dependency snapshots; 35 referenced original source identities; 70 original/text file hashes; 12 pages visually reinspected.

No application files were edited. No runtime snapshot, build, UI test or deployment was performed. This pass validates provenance and faithful bounded copy, not supplier truth, real-world performance, legal approval, physical stock or order acceptance.

Primary input hashes:
- `/workspace/scratch/586427eef9f2/roadmark-research/bus-integration-boundaries.json` — `d56f13d3af71897e5d1696b6e6d9bb2da472ab41a9a0d9b81670cb186feba6e0`
- `/workspace/scratch/586427eef9f2/roadmark-research/bus-integration-boundaries.md` — `027dfc72d1ac7a1c7d913e47db1c38f2248e0e126c3c3d346649a69d7f170279`
- `/workspace/scratch/586427eef9f2/roadmark-research/yutong-bci-electric-buses-evidence.json` — `e843b9941b25b9384245b8403c3e0fe8925f1384d731df1886bed34494650874`
- `/workspace/scratch/586427eef9f2/roadmark-research/yutong-bci-electric-buses-evidence.md` — `8be42fcb10027c12fd1b05ccc906eb7a8689bdb03d076aa215fb630c126fbf7e`

Source/editorial fingerprint probes: 104 passed, covering changed facts, evidence, document identities and each record’s copy/availability/conditions/null-hold objects. These are source-artifact checks, not runtime mutation tests.
