# Catalogue scope-label audit

Checked: 2026-10-10T10:13:22Z · Read-only application audit

## Result

No open finding remains within the three requested error classes. One adjacent compound-unit omission was found, reported and corrected by the parent during this audit; its effective value is now verified.

Coverage: 95 shared models (74 multi-trim), 226 variants, 10,370 effective fact cells (7,601 populated), and all 226 effective `parking_cameras` rows.

## Resolved finding: UNIT-01

- Model: `chery_e5_my26`
- Variant: `chery_e5_my26__ultimate_fwd_my26__20261010`
- Fact: `energy_consumption_nedc_whkm`
- Before: value `132`, unit empty, label “Energy consumption nedc whkm”
- Source: `data/omoda-jaecoo-evidence.json`, record `chery_e5__ultimate_fwd_my26__1`, same fact field and value
- Evidence: [Chery MY26 specification PDF, p.3](https://cherymotor.com.au/sites/default/files/2026-04/233_25_Chery_E5_Spec_Sheet_2025_Rebrand_v115%20%282%29%20%281%29.pdf); the row explicitly states “Energy Consumption – NEDC (Wh/km)” and `132`. Retained text line 75 and page image were checked; PDF SHA-256 matches the packet
- Conservative correction: retain `132` and NEDC, set unit `Wh/km`; no WLTP or range conversion
- Resolution verified: unit `Wh/km`, label “NEDC energy consumption”, basis and comparison basis “NEDC laboratory energy consumption”

This was unit omission, rather than the exact S07 error of overwriting a compound unit with `km`. It is resolved; no further application edit is proposed.

## Prior fixes verified

1. `leapmotor_c10_current` generation now reads “June 2026 current Australian C10 guide; formal MY unprinted” for both Style 69.9kWh and Design LR 81.9kWh. `data/leapmotor-evidence.json` links both current records to `leap_c10_regular_brochure_new`; their different historical/stock model-year notes are no longer used as a shared generation label
2. `nissan_ariya_my25__engage_2wd_63kwh__20261010` / `parking_cameras` is `standard`. The Lexus/Nissan/Genesis packet, research ID `nissan_ariya_engage_63_my25`, explicitly has rear camera and front/rear sensors true, surround camera false
3. `geely_ex2_launch__complete__20261010` / `parking_cameras` is `standard`. The Geely/Zeekr/XPENG packet, research ID `geely_ex2_complete_au_launch_2026`, explicitly has rear-view camera and rear sensors true, surround camera false
4. `deepal_s07_current__s07_rwd__20261010` / `wltp_energy_consumption_kwh_per100_km` remains `18.6 kWh/100km`, matching `data/deepal-evidence.json` → `technicalFacts.wltpEnergyConsumptionKWhPer100Km`

## Final screens

- Shared labels: no additional unambiguous first-trim-only generation/epoch leak found in the model/member-trim review
- Parking: 67 standard, 19 conditional, 140 not verified; zero unavailable or not applicable. Unknowns were not promoted
- Units: all 38 populated energy-consumption facts now carry compound units. No other populated fact matching the targeted scalar-suffix overwrite signature was found

## Boundary

The audit used current `research()`, `catalogue()` and `effectiveFeatures()` plus the existing linked source packets. It did not redo market research, validate every specification, change app/data/copy, or touch active worker artifacts. Source/page details, final input hashes and the complete energy-unit screen are in `catalogue-scope-label-audit.json`.
