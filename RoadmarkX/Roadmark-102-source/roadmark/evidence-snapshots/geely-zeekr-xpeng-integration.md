# Integration memo: Geely / Zeekr / XPENG

10 October 2026. Apply through the main integration process only; this research made no application/catalogue edits.

## Add, without duplicating existing records

The machine-readable packet has 12 base configurations, using these stable research IDs:

- `geely_ex2_complete_au_launch_2026`
- `geely_ex2_inspire_au_launch_2026`
- `zeekr_x_rwd_my26`
- `zeekr_x_awd_my26`
- `zeekr_009_7seat_fwd_au_116kwh`
- `zeekr_009_7seat_awd_au_116kwh`
- `zeekr_009_6seat_awd_au_116kwh`
- `xpeng_new_g6_ffcp_my26`
- `xpeng_new_g6_ffap_my26`
- `xpeng_new_g6_ffbp_my26`
- `xpeng_x9_fwd_au_launch_2026`
- `xpeng_x9_awd_au_launch_2026`

An extra record, `xpeng_new_g6_black_edition_factory_package`, is an optional package of AWD Performance, not a distinct drivetrain. Standard Range's optional 20-inch configuration is nested and has its own 470 km WLTP/16.9 kWh per 100 km figures. Do not collapse it onto the 18-inch 480 km/16.6 values.

## Update these existing records

- `geely_ex5__complete_extended_range__1`, `geely_ex5__inspire_extended_range__2`: attach current brochure and dealer MY27 evidence. Complete is live NEW; Inspire source is SOLD. Do not add duplicate ER variants from calendar-year/MY labels. Brochure HUD diagonal conflict stays unresolved
- `geely_ex5__complete__3`, `geely_ex5__inspire__4`: retain the distinct outgoing 60.22 kWh epoch; no fresh factory-order or exact NEW stock confirmation here
- `zeekr_7x__rwd__1`, `zeekr_7x__long_range_rwd__2`, `zeekr_7x__performance_awd__3`: retain current AU original 75/100 kWh, 800 V specs. Refresh current source/NEW stock and warranty provenance. Do not import China-market 900 V hardware
- `zeekr_7x__black_special_edition_awd__4`: already present. Current exact NEW Black stock, updated price and package-specific WLTP remain unverified

No `raw-*` files were present in the specified data directory at the final check. Base catalogue, additions and market inventory were inspected. The additions file contained no target-brand duplicates at that check.

## Market-status handling

- EX2: both grades have live NEW exact-unit evidence, but Complete MY27 and Inspire MY26 dealer labels conflict. Keep family formal MY null
- X MY26: both officially current; AWD has live exact NEW stock. RWD fresh exact NEW in-stock remains unverified
- 009: all three officially current; FWD 7-seat and AWD 6-seat live NEW. AWD 7-seat remains official-listed, fresh NEW stock unverified
- New G6: three manufacturer-configured current MY26 grades. Performance dealer explicitly says Gen2. SR/LR exact ads are NEW, but omit battery/power/Gen2 identifiers: record grade-level stock, with exact epoch match unresolved
- X9: explicit orders open 21 July 2026 and live NEW ads for both. Do not convert “deliveries commencing shortly” into an actual delivery date
- Zeekr 7GT and XPENG L03 stay pending/interest-only. Do not turn a family name, future quarter, global menu or an overseas trim into current AU orderability

## Non-negotiable field qualifications

1. Battery: only New G6 gross capacity is explicitly established here. EX2/X/009/X9 stated capacity must not be relabelled usable or gross
2. 009 charging: 30 minutes, 10–80%, on 150 kW DC is a test condition. Peak remains null. The older 205 kW charger-condition PDF is superseded as evidence, not proof of a new vehicle epoch
3. X charging: 230 kW RWD and 150 kW AWD are supported maxima; exact primary charge-duration window remains null
4. G6 price: retain displayed MSRP with unresolved on-road treatment. X9 and EX2 have dated explicit ex-ORC prices. Dealer drive-away figures belong to the exact VIN/stock and must not overwrite national RRP
5. Warranty: Zeekr private cover/70% threshold now has a current official PDF. Preserve commercial-use clause conflict. XPENG new program is importer/eligibility-specific; do not automatically rewrite old-importer warranties
6. Features: false only where the exact matrix says unavailable. Omission stays null. X automatic front doors are optional AWD; X9 launch-family equipment remains conditional. G6 unresolved footnotes and remote-parking legal conditions stay attached
7. Cargo/towing: retain known seating context and unknown measurement standards; 009 574–2979 interval lacks confirmed seating conditions. Do not populate missing towing from foreign or generic dealer catalogues
8. Evidence: every populated research field points to source IDs/locators. Resolve source ID through the registry for URL, date, original snapshot and SHA-256. Do not strip basis/conflict notes during flattening

## Priority rechecks if a stronger stock badge is desired

- Obtain a public exact NEW X RWD MY26 and 009 7-seat AWD dealer detail that remains live
- Find a New G6 SR/LR ad identifying Gen2 battery/output or an exact build sheet; the present NEW grade ads alone are insufficient for unqualified epoch-specific in-stock status
- Resolve G6 national price basis and EX5 Inspire HUD diagonal from an exact official price/spec document
- Reconfirm availability immediately before publishing any time-sensitive dealer-price/stock claim
