# Remaining Chinese passenger BEV evidence index
Checked 10 October 2026. Research-only handoff. No app files edited.

## Artifacts
- byd-remaining-evidence.json: 8 records, 201 technical/price rows, 167 equipment rows, 6 NEW ads; 31 raw and 31 text snapshot hashes checked; validation True
- mg-remaining-evidence.json: 12 records, 300 technical/price rows, 204 equipment rows, 10 NEW ads; 35 raw and 25 text snapshot hashes checked; validation True
- mg-remaining-residual-evidence.json: 10 records, 245 technical/price rows, 0 equipment rows, 0 NEW ads; 20 raw and 0 text snapshot hashes checked; validation True
- leapmotor-evidence.json: 10 records, 239 technical/price rows, 199 equipment rows, 10 NEW ads; 46 raw and 46 text snapshot hashes checked; validation True
- deepal-evidence.json: 3 records, 114 technical/price rows, 140 equipment rows, 3 NEW ads; 16 raw and 15 text snapshot hashes checked; validation True
- omoda-jaecoo-evidence.json: 4 records, 171 technical/price rows, 199 equipment rows, 8 NEW ads; 29 raw and 6 text snapshot hashes checked; validation True

## Recommended add versus refresh scope
- byd-remaining-evidence.json: refresh_existing_only. 8 existing rows: ATTO 3 EVO Dynamic/Premium, legacy ATTO 3 Essential/Premium, ATTO 2 Dynamic/Premium, SEALION 7 Premium/Performance
- mg-remaining-evidence.json: add_current_configurations_with_field_holds. 12 current MG/IM configurations: MGS5, MGS6, Cyberster, IM5, IM6
- mg-remaining-residual-evidence.json: preserve_residual_candidates_hold_technical_epoch_joins. Historical manufacturer epochs are reference-only until exact-unit technical epoch is established; Portside MY25 Essence62 is NEW but not proven125kW
  - Residual bundle contains historical reference epochs, not ten eligible additions; 0 accepted exact-epoch residual NEW ads plus 6 conditional or epoch-unresolved NEW ads
- leapmotor-evidence.json: add_six_current_and_one_residual_with_separate_holds. Current B05 MY26 Style/Design LR, B10 MY26 Style/Design LR, C10 Style69.9/Design LR81.9; residual C10 MY25 Design69.9
- deepal-evidence.json: add_three_current_configurations. S07 RWD, E07 RWD, E07 AWD Performance
- omoda-jaecoo-evidence.json: refresh_J5_add_E5_MY26_and_qualify_residuals. Refresh existing J5 EV Summit; add Chery E5 Ultimate MY26; qualified stock-only MY25.5 Urban and Ultimate

## Highest-priority safeguards
- BYD ATTO 3 EVO, ATTO 2 and SEALION 7 already exist in raw data: enrich existing identities. Legacy ATTO 3 Premium ads do not safely establish an EVO generation. SEALION 7 rear-seat and steering-wheel heating is Performance-only. ATTO 2 tailgate is manual.
- Leapmotor B03X has AU Style/Design LR pricing and specifications from 6 October, with November arrival: retain future-delivery hold. C10 MY25 Design 69.9 kWh is separately advertised NEW. Current Style/Design LR brochure has no printed MY; C10 AWD Sports+ torque conflict stays null.
- Residual MG: Portside MY25 MGS5 Essence62 is NEW but its125kW/150kW epoch is unresolved; no normalized residual technical addition on MY/trim alone. Excite49/62 ads have registration flags. Cyberster AWD same VIN is MY24.5 versus MY25; preserve conflict. ZS and unresolved MY26 joins remain held.
- MG current MGS5/Cyberster website MY and linked-brochure MY differ; hold epoch joins. IM5/IM6 formal brochure MY25 is distinct from 2026 build stock. MGS6 RWD acceleration/frunk conflicts must not be silently resolved.
- Deepal S07 current manufacturer sheet is explicitly MY24; E07 sheet is MY25. E07 child-anchor recall eligibility and delivered-build compliance remain unchecked. E07 RWD/AWD technical brochure both mark air suspension standard.
- J5 Summit already exists; enrich it. Chery E5 Ultimate MY26 is a current exact new addition. MY25.5 E5 residual stock is qualified by dealer/model-year ambiguity. MY26 portable charging-cable statements conflict. MY27 remains coming soon.

## Boundaries
- Current exact manufacturer configuration != factory order acceptance != specific NEW dealer advertisement != physically available stock
- Formal manufacturer model year, brochure date, production/build year and dealer stock model-year labels are preserved separately
- No generic dealer specifications imported into exact-trim technical or equipment facts
- Geely/Zeekr/XPENG separate audit is owned by parent and excluded from these totals
