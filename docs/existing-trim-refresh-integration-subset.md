# Minimal existing-trim integration subset

Use `existing-trim-refresh-integration-subset.json`. This is the recommended material subset. The full plan’s 182 `sourceOnlyRefreshes` are optional and excluded.

## Apply on existing IDs only

- 55 exact-before-state guarded patches: 19 fact, 23 feature, 13 availability
- Two companion tare-mass facts are required alongside the two EX5 ER kerb-null corrections
- No change to ID, epoch, drive, battery identity, generation, or displayed year strings
- Every patch includes the current effective before state, desired after state, original source bytes/hash/locator and its individual guard impact

## Buyer copy handling

- `byd_sealion_7__premium_rwd__1`: retain_wording_rebind_final_effective_guards. Reviewed technical/equipment statements remain valid; change the availability revision guard after shared-reader inspection. Do not copy old expected arrays blindly.
- `byd_sealion_7__performance_awd__2`: retain_wording_rebind_final_effective_guards. Reviewed technical/equipment statements remain valid; change the availability revision guard after shared-reader inspection. Do not copy old expected arrays blindly.
- `geely_ex5__complete_extended_range__1`: retain_wording_rebind_final_effective_guards. Reviewed technical/equipment statements remain valid; change the availability revision guard after shared-reader inspection. Do not copy old expected arrays blindly.
- `geely_ex5__inspire_extended_range__2`: retain_wording_rebind_final_effective_guards. Reviewed technical/equipment statements remain valid; change the availability revision guard after shared-reader inspection. Do not copy old expected arrays blindly.
- `geely_ex5__complete__3`: keep_suppressed. Outgoing 60.22 kWh exact NEW stock not freshly established. Do not freshen record/source dates from ER.
- `geely_ex5__inspire__4`: keep_suppressed. Outgoing 60.22 kWh exact NEW stock not freshly established. Do not freshen record/source dates from ER.
- `zeekr_7x__rwd__1`: retain_wording_rebind_final_effective_guards. Reviewed technical/equipment statements remain valid; change the availability revision guard after shared-reader inspection. Do not copy old expected arrays blindly.
- `zeekr_7x__long_range_rwd__2`: retain_wording_rebind_final_effective_guards. Reviewed technical/equipment statements remain valid; change the availability revision guard after shared-reader inspection. Do not copy old expected arrays blindly.
- `zeekr_7x__performance_awd__3`: retain_wording_rebind_final_effective_guards. Reviewed technical/equipment statements remain valid; change the availability revision guard after shared-reader inspection. Do not copy old expected arrays blindly.
- `zeekr_7x__black_special_edition_awd__4`: retain_existing_copy_and_guards. Warranty changes are not dependencies of existing copy. Do not freshen Black availability/price/range or inherit current-core fitment unconditionally.
- `byd_atto_2__dynamic__1`: retain_wording_rebind_final_effective_guards. Reviewed technical/equipment statements remain valid; change the availability revision guard after shared-reader inspection. Do not copy old expected arrays blindly.
- `byd_atto_2__premium__2`: retain_wording_rebind_final_effective_guards. Reviewed technical/equipment statements remain valid; change the availability revision guard after shared-reader inspection. Do not copy old expected arrays blindly.
- `byd_atto_3_evo__dynamic_fwd__1`: retain_wording_rebind_final_effective_guards. Reviewed technical/equipment statements remain valid; change the availability revision guard after shared-reader inspection. Do not copy old expected arrays blindly.
- `byd_atto_3_evo__premium_rwd__2`: retain_wording_rebind_final_effective_guards. Reviewed technical/equipment statements remain valid; change the availability revision guard after shared-reader inspection. Do not copy old expected arrays blindly.
- `byd_atto_3_legacy__essential_fwd__1`: rebind_to_current_order_request_listing_after_review. Essential is currently request-listed despite old outgoing label. Keep factual range/dashcam dependencies, refresh exact availability revision, and remove outdated outgoing wording. No new trim or MY.
- `byd_atto_3_legacy__premium_fwd__2`: keep_suppressed. Keep outgoing_new_stock scope; current advertisements are provisional legacy-epoch matches. stockStatus stays unverified. Do not force pass by dropping the stock guard.

## Boundary

This is a research-refresh overlay proposal, not an instruction to insert machine research into approved human-correction records. Conditional prices/warranties must remain conditional. Re-read actual effective fields before rebinding guards. No app edits have been made.


## Minimal guard changes

Only one factual dependency changes in the 55-patch set: `feature:geely_ex5__inspire_extended_range__2:screens_hud`. Rebind it from the final effective feature. The other required rebinds are the 13 availability revision guards. Preserve all other dependency values, source memberships and checked dates; no bulk date refresh is justified. Essential also needs its reviewed current-listing wording/scope change.
