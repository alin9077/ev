# Kia/Cadillac actual integration display audit

Result: PASS after the parent’s presentation-only fixes. No remaining must-fix issue found. Checked actual catalogue()/pack(), comparison label and value formatters, citable report projections, and detail component selection. No browser or visual-layout claim.

## Verified

- 291 total configurations, 10 new configurations; all 2,983 staged facts retain value, status, unit, scope, comparison basis, source IDs and date
- All 224 required normalized nulls survive; 690 generic feature rows remain not_verified; ten extra runtime kerb_weight_kg fields remain null/not_verified
- Every conditional fact carries its own condition explanation, avoiding the generic carried-over fallback
- 922 source declarations now live in a separate closed source-history disclosure, outside Essentials; citable key facts do not duplicate raw source_* rows
- Mixed-source comparison headings preserve different cargo methods/seat counts, model years, DC charge windows, and acceleration mode protocols
- Normalized model_year and source_model_year format as 2027 without grouping or a duration unit
- Sport V-Mode stays false/unavailable; LYRIQ-V default-mode acceleration/output stay unknown while Velocity Max measurements keep their own labels and conditions
- Kia charging retains SOC and station-versus-vehicle qualifications. Cadillac AC scenarios do not become onboard limits; range-recovery claims do not become 10–80% durations
- OPTIQ’s A$80,000 historical launch price remains source history, current exact-MY price stays unknown, and the separate A$85,000 campaign expires after 30 October. VISTIQ’s A$116,000 history is unchanged
- Six Kia source_current_grade_offer_declared expiry additions are the parent-confirmed documented amendment: validUntil 2026-10-31. Exact MY26/MY27 applicability remains expressly unestablished

## Resolved during audit

1. EV4 + VISTIQ boot_l: the first-car heading “Cargo behind five occupied seats (VDA)” was applied to VISTIQ’s 430 L / six seats / unstated method. Now “Cargo behind occupied seats”; individual conditions remain
2. LYRIQ MY27 + OPTIQ MY25 price_aud: the MY27 heading could be applied to MY25. Now “Current exact-model-year price” on mixed bases
3. LYRIQ-V + LYRIQ Sport zero_to_100_s: “Default-mode 0–100 km/h” described Sport’s 4.9 s although its drive-mode protocol is unestablished. Now “Published 0–100 km/h claim” on mixed bases
4. Raw source_* declarations previously repeated in Essentials; now separately disclosed. Model-year formatting fixed

## Nonblocking prose concern

Buyer-facing factual and citable text is still verbose. Citable key-fact sentences reach 2,569 characters because they retain source-locator JSON and vehicle-wide qualifications. LYRIQ Sport dc_peak_kw still says “Preserve capability wording; do not claim measured charge curve or derive a 10–80% duration.” A later presentation-only rewrite could say “The manufacturer’s capability is not a measured charge curve or a verified 10–80% time.” OPTIQ price_aud still contains “normalized” in its label. These are clarity improvements, not reasons to change values or weaken scope, SOC, mode, source, expiry or technical caveats. Do not edit frozen evidence or guarded snapshots for these changes.

## Provenance

Checked 2026-10-10T15:02:59.809Z. Actual file hashes, exact comparison probes and machine-readable counts are recorded in kia-cadillac-live-display-audit.json. Reproducible read-only probe: audit_kia_cadillac_live_display.cjs, run with the application’s tsx loader. Application files were not written by this auditor.
