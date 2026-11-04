# Exact-trim evidence reflow candidate 98

Status: static candidate only. No application mutation, project import, script, test, build, syntax check, browser session, screenshot, upload, Git operation or Codex task was performed by this worker. Root owns review, application, execution and acceptance.

## Finding

Root reported the same Kawasaki Ninja e-1 MY26 overflow on baseline96 portable and checkpoint97 production/portable: 333 CSS px viewport, 364 px document, evidence sections about 348.229 px wide beginning at x=16. The 500 CSS px view did not overflow. This is a pre-existing narrow exact-detail defect, not an observed checkpoint97 copy regression.

The source shows two cooperating causes:

1. `.detail-facts` uses zero-minimum `minmax(0, 1fr)` tracks at desktop and tablet widths, but the <=767px override changes it to plain `1fr`. This restores an automatic min-content floor for its single track.
2. The generated Kawasaki production HTML contains the unbroken source token `dealer_advertised_exact_MY26_page_not_manufacturer_verified` inside `.fact-basis`. `.fact-value strong` already permits emergency wrapping, but its sibling basis and qualification text do not inherit a wrapping rule from their fact section. A single long token can determine the shared grid track minimum. Changing only the grid track would not ensure that text itself wraps.

The reported geometry is consistent with this source-level diagnosis. Browser causality and the final corrected geometry remain root verification, not a worker finding.

## Minimal runtime delta

Only `src/app/globals.css` changes:

- Add `min-width: 0` and `overflow-wrap: anywhere` to the existing `.detail-facts section` rule
- Change the existing narrow `.detail-facts` track from `1fr` to `minmax(0, 1fr)`

This is three declaration additions/changes in two existing rules. No new breakpoint, global text rule, font change, clipping, horizontal scroll container, fixed dimension, hidden evidence, JavaScript or data change is introduced. Existing 3/2/1 column counts, gaps, borders, typography, spacing and native disclosures stay in place. Long evidence tokens can wrap at the point they would otherwise overflow. The section selector affects only exact-detail fact sections, including supplementary source/equipment/warranty grids; it does not match the Model Y homepage hero, nine selling points or fleet chapters.

The runtime source before this delta is 113,703 bytes, SHA256 `18bd4641d0b37f32dea2f54c9ed3d8a6169e6a7d4503cb62d37e1cb96343d74e`.

## Candidate contents and proposed regression checks

`after/` contains complete replacement/new application files. `candidate.patch` contains the same three-file delta. `MANIFEST.json` identifies exact before/after hashes and sizes. There are three new Node tests and six declared browser tests, one for each combination of production/portable and Kawasaki/Lexus/Model Y. The configured three browser projects would expand those six declarations to 18 runs; no run or pass count is claimed.

Node tests:

1. Assert all three existing `.detail-facts` column rules use zero-minimum tracks, including the actual narrow media rule
2. Assert the fact section permits shrinking and emergency text wrapping without hiding or truncating overflow
3. Reverse only the reviewed two source replacements and require the exact full checkpoint97 CSS hash and byte count. This proves every other stylesheet byte remains unchanged; it is not a rendered visual comparison

Browser tests:

- Load real production and served portable detail routes directly, avoiding a heavyweight full-home prerequisite
- Check Kawasaki's actual long source token remains visible as text
- Open all supplementary evidence disclosures when present (Lexus covers equipment and warranty subclauses)
- At 320, 333, 390, 500, 768, 1100 and 1440 CSS px, assert correct 1/2/3 column count, no document overflow and no visible evidence section overflow
- Open and close the first report disclosure with the keyboard at every width, type a long draft, ensure its textarea stays within the viewport, retain the draft through repeat toggles and retain native summary focus
- Never submit, save or export a report

These tests do not certify native 150% browser zoom, a physical phone, every catalogue record, accessibility generally, or visual quality. Root should reproduce the originally reported physical500/CSS333 at150% zoom in its own browser, inspect full text and interaction affordances at the repaired location, and compare unchanged desktop/narrow Model Y hero/nine reasons with its retained reference captures. The existing `tests/home-hero.test.ts` remains unchanged and should still run.

## Frozen inputs and history

The current checkpoint91 historical app-input pin map contains 34 paths and does not include `src/app/globals.css`; no current Node historical-reader test directly pins this CSS file. Therefore this candidate makes no history-adapter or old-fixture edits. The new exact inverse CSS test guards the reviewed scope independently. The root-owned complete checkpoint97 input map does include CSS and must be extended with exactly this reviewed three-file delta for checkpoint98. Do not alter an old baseline or promote a newly read mutated file to a historical baseline.

If a separate root emitted-artifact verifier freezes the CSS shell, it must explicitly account for this reviewed CSS delta; an unchanged-CSS assertion from the previous copy-only checkpoint cannot be reused as a passing check. An adapter for another verifier should remain whole-hash guarded and must reconstruct exact predecessor bytes. There is no reason to weaken pre-existing fixture checks.

## Root verification order

1. Independently review candidate files, patch and manifest. Confirm the current app CSS matches the manifest preimage. Inspect the 97 final-input map and account for exactly three candidate paths
2. Apply only the reviewed `after/` files. Leave all evidence, research, original assets, application markup, protected Model Y inputs, historical fixtures and checkpoint97 artifacts unchanged
3. Run the full supported serial Node tests, types, lint, validation, production build and portable build. A passing static guard is not layout verification; regenerate portable output through the supported builder instead of editing HTML
4. Run the new focused browser spec against the rebuilt server/portable output if the supported browser setup permits. Keep failures and logs intact. Distinguish never-run engines from passing engines
5. Reproduce root's own original 333 CSS px/native150% case, inspect Essentials and an opened report, then 500 CSS px and desktop. Check that all evidence text is readable without page-level horizontal scrolling and that no text is merely clipped
6. Recheck the original Model Y hero and nine selling points and appropriate existing regression/browser gates. Candidate completion does not close native error9, sustained performance, real-phone, full-market, publication or release gates

## Instructions and sources read

- Repository `AGENTS.md`, `START-HERE-DOT.txt`, `README.md`, `docs/ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, `docs/START_ROADMARK_CHECKPOINT.md`, `docs/ROADMARK_GOAL.md` and `docs/MOBILE_JOURNEY_2026-10-11_SOURCE70.md`
- Installed Next.js App Router CSS guide at `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- Shared CSS, `detail.tsx`, `ui.tsx`, `claim-report.tsx`, relevant route/portable source, existing detail/hero/browser tests and source-history guards
- Current generated Kawasaki detail HTML (read-only) to identify the actual unbroken source token

Static preparation read and wrote ordinary files only. Hash measurements and patch construction used standard-library file operations without importing or executing project code.
