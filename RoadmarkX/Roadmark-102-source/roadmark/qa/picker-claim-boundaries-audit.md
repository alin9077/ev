# Picker overflow and charging qualification boundary audit

Read-only app inspection on dot's VM, 10 October 2026. App: `roadmark-work/roadmark`. Only this research directory was written. No app files, environments, tasks, publication, or browser state were changed by this audit. Browser findings below were supplied by the parent, which owns browser testing.

## Findings and recommended correction

1. The picker overflow is a result-row intrinsic minimum-width problem. The parent isolated two Denza D9 rows; the filters fit. Give the descriptive first span a shrinkable width and allow exceptionally long tokens to wrap. Do not hide overflow or shrink text.
2. The Kia charging sentence is a globally attached legacy research qualification, not Volkswagen evidence. Render a narrowly matched generic explanation in reader-facing issue presentation, retaining the exact underlying issues, effective facts, and immutable expected identities. No data migration is needed for that presentation-only correction.

## 1. Picker

### Observed browser evidence (parent)

Desktop Chrome, 300% zoom, 388 CSS-pixel viewport:

- No document overflow
- Picker dialog clientWidth 362, scrollWidth 364
- Filter grid width/scrollWidth 322; columns approximately 154.167px / 154.167px
- Picker results and Denza section/button clientWidth 322, scrollWidth 344
- Price span width 94; right edge 374.27 compared with button right edge 352.83
- Two Denza D9 rows are the overflow source

### Exact code path

`src/components/picker.tsx:229–254` renders each result as a flex button with two spans: identity/trim/generation/availability first, price/conditions second.

`src/app/globals.css:1321–1344` sets `.picker-option` to a full-width flex row with a gap. Each child is itself a flex column. The price span has `flex-shrink: 0`. The first span has the flex-item default `min-width: auto`, allowing its longest unbreakable content to set its minimum width.

At the <=767px breakpoint (`globals.css:2017–2030`), the gap becomes 12px, the price is capped at 94px and still cannot shrink. A 322px row also has 12px horizontal padding, leaving about 204px for the first span when the price consumes its full cap. Long first-span content can therefore push the fixed price column past the right edge. At <=359px the row wraps; this does not help the reported 388px viewport.

The filter-grid `1fr 1fr` override was initially a plausible suspect, but measured grid widths rule it out for this reproduction. Do not add unrelated grid changes to this minimal fix.

### Minimal proposal

Add a scoped rule for `.picker-option > span:first-child`:

- `min-width: 0`
- `overflow-wrap: anywhere`

These two declarations allow the identity column to shrink into the remaining space and wrap an otherwise unbreakable model/configuration token. Keep the price column visible and the full row clickable. Do not use `overflow-x: hidden`, clipping, ellipsis, fixed row heights, or smaller fonts. No React/picker data changes are needed.

If a narrower future viewport still cannot fit two usable columns, an intentional narrow breakpoint that wraps/stacks the price is preferable to clipping. That is separate from the demonstrated Denza fix.

### Regression checks

- Open the picker at 388px and at actual desktop Chrome 300% zoom, search Denza/D9, and assert dialog, results, section and each option have no horizontal overflow
- Test 320, 359, 360, 375, 388, 390, 430 and normal desktop widths, including long generation names, price-null rows, zero results and all availability states
- Check visible full trim and price text, focus outlines, search/select/numeric controls, keyboard navigation, Escape, close-button focus restoration, selection, and repeat-open behavior
- Keep document-overflow assertions, but add dialog-local and option-local assertions; document-level measurements cannot detect this enclosed overflow
- Existing tests: `tests/comparison-picker.test.ts` covers projection/filter/value preservation, not browser layout; `tests/e2e/journeys.spec.ts:28` covers selection/Escape focus return; its viewport matrix at line 280 never opens the picker and checks only `document.documentElement.scrollWidth`
- A CSS viewport test is useful for reflow but is not proof of actual desktop zoom behavior; retain the parent's browser zoom verification

## 2. Why a Kia warning appears on VW

### Attachment chain

1. Original `data/au_ev_all_variants_2026-10-06.json:41818–41830` defines V2-13, titled “Charging windows and supply ratings differ”, with `model_ids: ["all"]` and sources `kia_ev3_spec`, `kia_ev5_spec`, `geely_brochure_er`
2. Its original action is: “Do not compare 30-80% time directly with 10-80%. A 350 kW supply used in a Kia test does not establish a 350 kW vehicle peak.”
3. `src/lib/data.ts:169–181` removes sentences beginning “Do not”, leaving only the Kia sentence
4. `data.ts:224` maps V2-13 to `dc_charge_time_min` and `dc_peak_kw`; catalogue issue filtering at lines 250–252 includes model scope `all`; the field issue is attached at lines 285 and 318
5. Added-record unknown handling at lines 406–413 preserves the inherited issue while making unknown fields explicitly pending and source-less
6. `src/lib/citable.ts:190–207` appends every `fact.issues[].publication_action` to qualifications. `finish()` at lines 179–188 includes those qualifications directly in the claim sentence
7. Evidence drawers also show raw actions through `src/components/ui.tsx:101–114, 215`

For `volkswagen_idbuzz_my26_pro_swb__20261010`, both generic DC time and peak fields have:

- `value: null`, `status: not_verified`, no source IDs
- Basis “Exact-trim research pending”; empty comparison basis
- Qualification “No exact-trim measurement verified yet.”
- V2-13 with the legacy Kia wording

The passenger key-measurements array includes generic `dc_charge_time_min` (`citable.ts:8–15`), so the null field is included in the citable detail paragraph. It must remain unknown. This is not a reason to infer charging time/peak from another MY, named technical declaration, different source configuration, or charger supply rating.

### Measured runtime scope

The audit evaluated the current catalogue with policy date 2026-10-10:

- 315 configurations, 308 buyer summaries
- V2-13 survives on 109 effective facts across 67 configurations
- Brands: Tesla 8, BYD 12, Geely 4, Zeekr 4, Jaecoo 1, Kia 9, MG 4, Fuso 14, Foton 2, ZEEHO 3, Segway 2, Volkswagen 4
- Nine immutable identity snapshots include it
- Zero of 21,735 effective feature rows contain the Kia sentence; no feature criterion uses either mapped DC fact key

`effectiveFeatures()` must remain untouched. Its warning-concatenation path (`data.ts:628–656`) uses the same issue mapping, but no current criterion matches V2-13. A presentation helper used by `factClaim` and `Issues` does not change feature conditions or their guards.

## 3. Safe presentation design

Use a pure helper taking the issue and returning display text. Rewrite only when both:

- `issue_id === "V2-13"`
- `publication_action` exactly equals the known legacy sentence

Suggested display wording, also proposed by the parent:

> A charging station’s rated output does not establish this vehicle’s peak charging acceptance. Compare charging times only when charge windows and test conditions match.

This retains the supply/vehicle distinction and restores the charging-window protection stripped during legacy editorial processing. It does not attribute Kia data to VW, promote an unknown value, or declare comparable charging performance.

All other issue IDs and any changed/new V2-13 action string must pass through unchanged. Avoid broad regex filtering, dropping every mention of Kia, or rewriting solely by ID, which could hide a future warning. Do not mutate the input object, issue list, effective facts, or sources.

Use the helper at:

- `citable.ts` qualification projection, covering displayed/copy/downloaded claim sentences
- `ui.tsx` `Issues` rendering, covering fact evidence drawers
- Optionally the print-note action rendering at `experience.tsx:653` for consistency. V2-13 is currently excluded from `car.issues` (`data.ts:498–505`), so that site is not an active V2-13 occurrence today

Keep the methodology registry's original audit narrative (`src/app/methodology/page.tsx:159`) unless its separate editorial wording is intentionally reviewed. Do not run the helper inside `research()`, `catalogue()`, `effectiveFeatures()`, correction overlays, source snapshots, or the proposal resolver.

### Required new regression tests

1. Known exact V2-13 legacy string yields generic text containing both protections
2. Another issue with the same action is unchanged; V2-13 with changed/new action text is unchanged; all unrelated warnings survive
3. Frozen helper input remains byte-identical
4. VW null/not_verified DC time and peak claims still have no invented sources/numbers, retain “No exact-trim measurement verified yet”, and have no “Kia test” or “350 kW” attribution
5. Kia charging claims retain their exact source basis/time and the charger-supply caveat; Geely 30–80 versus other 10–80 comparisons remain different-basis
6. Claim rendering/claimText/reportMarkdown and `Issues` SSR all display the generic text. Retain existing factConditions, source-date, explicit-explanation and unrelated hold tests
7. The complete runtime facts, source objects, full identity ledger and proposal bytes remain unchanged; all four VW fact/configuration fixture hashes and 308 summaries remain valid
8. Mutating a real effective fact, source hold, availability, or selected configuration still suppresses affected buyer copy

## 4. Frozen-identity and migration consequences

This is not just cosmetic data. `src/lib/selling-points.ts:71–84, 211–220` compares every field contained in expected identity snapshots against actual cars, including nested facts/issues. Fact dependencies independently require zero issues (`selling-points.ts:141–166`). Ranking excludes unresolved issues (`discovery.ts:139–140`) and bounded configurations independently remain ineligible.

`src/lib/buyer-proposal-storage.ts` hashes `JSON.stringify(snapshot)` including field order and exact wording, validates the hash/target, and deeply freezes snapshots. It explicitly does not derive expectations from actual runtime cars. `scripts/normalize-buyer-identities.ts` is a storage conversion of already checked expected snapshots, not an authorization to accept current actual state.

The current storage holds 311 proposal records and 96 distinct snapshots; 86 records have own identity refs and 81 have related identity refs. Nine snapshots include the legacy issue:

- segway_e125s_au__20261010
- segway_e300se_au__20261010
- zeeho_ae4_au__20261010
- zeeho_ae6_plus_au__20261010
- zeeho_ae8_plus_au__20261010
- volkswagen_idbuzz_my26_pro_swb__20261010
- volkswagen_idbuzz_my26_pro_lwb__20261010
- volkswagen_idbuzz_my26_gtx_lwb__20261010
- volkswagen_idbuzzcargo_my26_swb__20261010

Three proposal records also refer to impacted related identities: AE4 and AE8 refer to AE6; VW Pro SWB refers to Pro LWB.

Two read-only in-memory experiments were performed:

- Remove V2-13 from all non-Kia effective facts: 308 summaries → 299
- Reword V2-13 actions on effective facts globally: 308 summaries → 299

Both lose exactly the nine summaries listed above, with no new summaries. These simulations were not saved into the app.

Therefore the recommended pure display projection needs **no snapshot migration**. Do not regenerate expected identities, delete issue holds, loosen equality, or modify the four VW fixture hashes to make a cosmetic change pass.

If an independently authorized data-scope correction is later wanted, it requires an explicit checked delta applied to approved expected inputs, preserving the original ledger and adding new content-addressed snapshots. Update every affected own/related reference, examine whole-fact dependencies, revalidate corresponding fixture hashes, and prove source/availability/unknown/configuration guards remain closed. Do not recapture unrestricted runtime cars as expectations. That is deliberately broader than this fix.

### Baseline immutable hashes

- Original data: `010ded194b4d61cd7be606ce0cc332fa7e32906bba70abff2b5c38541e634657`
- Buyer proposal: `ba7224c691c8ba8a214d36042a6882b49a81ffb26e46bf0ae6fabfb8a5479c50`
- Identity ledger: `d99fb214c6b8e5e47a7844931fd14fb8800af9076b8d0326a519ed78bbbef0d6`
- VW Pro SWB facts JSON: `c0cc5084611b302ab8d3deb32885c9b5f671009669eeea186b1e4ac1cc2fc3a2`
- VW Pro SWB configuration JSON: `f1e67a406d691de322802347a76b85b0cb4b14419ab165f1a4cf44c128bbedeb`

## 5. Existing test boundaries

- `tests/buyer-proposal-storage.test.ts`: exact distinct own/related refs, order-sensitive hashes, deep immutability, wrong/missing references, corrupted/mixed storage fail closed
- `tests/selling-points.test.ts:26`: all 308 eligible buyer reasons/tradeoffs; lines 135, 144, 190, 213: field scope, own/related identity and whole-fact changes; lines 239, 268: scooter unknown/optional-pack/source/availability guards
- `tests/remaining-volkswagen-integration.test.ts`: four exact MY26 fact/configuration hashes and 160 unknown fields, option dependencies, ranking exclusion, MY25 stock separation and changed-option/scoped-amendment suppression
- `tests/road-scooters-catalogue.test.ts`: five exact configurations, held seat/DC fields, distinct charge windows, range ranking excluded, 331 mapped fields and source lineage
- `tests/citable.test.ts`: exact-trim naming, qualifications/source dates in exports, explanation-only limits, scooter-specific charging fields and mixed-type scope. It currently has no general V2-13 brand-boundary test
- `tests/domain.test.ts:106`: charging windows, battery/cargo bases remain distinct
- `tests/discovery.test.ts:233`: bounded configurations cannot acquire rankings through promoted scalar values

## Validation status

The read-only audit script completed and is saved as `audit.ts`; its exact detailed runtime findings, simulations and hashes are in `audit.json`.

Baseline batch: 61 checks passed; two test-file processes (`citable.test.ts`, `selling-points.test.ts`) failed without assertion detail. The successful files were comparison-picker, buyer-proposal-storage, remaining-volkswagen-integration, road-scooters-catalogue, domain and discovery. Serial retry with TAP diagnostics completed: citable.test.ts and selling-points.test.ts passed all 28 tests, zero failures, in 77.7 seconds (`retry-tests.tap`). The first batch records process-level failures without assertion detail; resource contention is a plausible explanation, not a diagnosed application failure. At the parent’s request all further runtime testing is stopped; no audit test process remained running when checked at 17:54 UTC. This is not a full validation or a controlled post-fix result. Browser and final-code revalidation belong to the parent.
