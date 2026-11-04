# Avatar dimension boundary: independent implementation review

Reviewed 10 October 2026, 19:27:44 UTC. **No blocking finding.** Read-only ZIP/source/hash inspection; no application imports, tests, builds, browser activity, application edits or network requests.

## Baseline and scope

Baseline is confirmed source version 50:

`/workspace/scratch/586427eef9f2/roadmark-recovery/roadmark-checkpoint-2026-10-10(1).zip`

ZIP SHA-256: `de3edf04680795a169b5ba0dec26eea730f5e9ccc65193d8f26093a680ef1687`

Its embedded `qa/STARK_CHECKPOINT_50_VERIFICATION.json` records 355 tests, zero failures, successful type/lint/validation checks and 367 production pages. That is the saved baseline's evidence, not a claim this reviewer reran it or that the optimization has passed the final aggregate. Final Stark browser review is explicitly pending origin-access permission; no browser route was attempted. Source 49 remains the earlier browser-checked reference.

## Exact comparisons

- All **105 data files** present in source50 are byte-identical to the working tree, with no additional data files
- Of **130 existing src files**, only `src/components/car-avatar.tsx` and `src/lib/discovery.ts` differ. The only added source file is `src/lib/car-avatar-shapes.ts`
- All **18 scripts** and **70 existing test files** are byte-identical. The only added test is `tests/avatar-dimension-projection.test.ts`
- The extracted shape table, `Pt`/`Shape` declarations, comments and `byd_atto_3_legacy` alias are exact text matches, ignoring only separator whitespace at the extraction boundary
- The remainder of the complete renderer is an exact text match after substituting the intended shared lookup: obtain `s` once, use `if (!s)` for the existing fallback, and remove the old later `const s` lookup. Constants, dimension fallbacks, numeric rounding, every geometry expression, SVG path, class, label and accessibility attribute are unchanged
- Across all 774 ZIP entries, 770 are identical; the two changed source files are accounted for above. The two ZIP-only files are packaging wrappers `OPEN-THIS-CHECKPOINT.txt` and `CHECKPOINT-SOURCE-MANIFEST.json`, not missing application modules
- Working-tree-only generated portable HTML, type build info, captured evidence files and QA artifacts are not evidence of new application changes. The source ZIP intentionally contains a subset of those local materials; the JSON manifest distinguishes them

The companion JSON pins every baseline/working file hash plus the new source/test hashes. No unrelated application-source, config, package, script, existing-test or data differences were found.

## Behavior and evidence safety

`car-avatar-shapes.ts` owns the single existing shape table. `carAvatarShape` reads that table; `hasCarAvatarShape` calls that lookup. The renderer and discovery therefore share one source of truth with no duplicated supported-model list.

`discoveryCars` retains the seven attribute keys unconditionally and retains full height/wheelbase Facts only when the shared lookup has a drawing. It still constructs a fresh facts map from the original entries, preserving retained Fact references/order. It does not create partial Fact objects, alter values, or infer a replacement dimension.

For generic-avatar records, the unchanged renderer returns its static EV SVG before reading any of those dimensions. Bespoke avatars continue to receive both full Facts. The original Model Y hero builds its full curated packs separately and is not projected through this boundary.

All other Car properties, full buyer summaries and the existing three-field configuration projection are unchanged. `data.ts`, the full-pack producer, summary evaluators, immutable expected-source/identity handling, deadline/clock guards, source allowlisting, detail/comparison/export paths, portable pack storage and all hero/interaction modules are hash-identical to source50. Removing unused discovery fields occurs only after the full server-side validations.

No direct or indirect weakening of ranking gates, evidence holds, exact source identity, expiry behavior or full detail/export provenance was found in this diff.

## Test coverage inspected, not executed

The new test checks every current car's SVG markup before/after projection, all seven ranking Fact references, both bespoke dimensions, absence of both generic dimensions, summary identity, the legacy shape alias and an unknown model. It explicitly covers the current 34 bespoke / 287 generic records.

The second test reconstructs the preceding nine-fact boundary and compares its complete citation-ID closure against the new boundary, then compares scoped sources by value, order and object identity. Its size assertion requires more than 350 KB of logical JSON reduction. This is not a production or phone measurement.

Existing unchanged tests cover ranking/filter parity, full summary/source guards, expiry and clock-gated SSR, full configuration transport, hero composition and selection. Root owns their serial focused/aggregate execution on the final implementation.

Two optional, non-blocking test refinements:

1. The 34/287 count assertions are checkpoint-specific. A later catalogue addition will need an intentional update; deriving the generic total from `all.length - bespoke` would reduce unrelated maintenance while a separate checkpoint test verifies the catalogue count
2. Explicit synthetic null/missing dimensions and rendering an arbitrary unmapped model would localize fallback coverage further. Exact unchanged renderer source plus all-current-record render equality already protect this patch

## Completion limits

This static review is suitable to accompany the final serial checks; it is not a substitute for them. Re-measure actual 321-record production responses after the build. The prior approximately 355 KB raw Flight / 14 KB gzip estimate was measured against frozen 317-record artifacts and has not been promoted to a current runtime result.

Final mobile rendering/interactions remain unverified while browser origin access is awaiting permission. Do not label this review as browser approval or release approval.
