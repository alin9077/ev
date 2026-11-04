# Checkpoint97 revision3: cumulative manifest contract repair

## Authoritative manifest

Use this directory's `MANIFEST.json` for the next QA invocation. Its primary `files[]` contains the complete 12-file checkpoint96→97 delta. Every preimage is against the exact saved96 input map. All six additions, including the render test, have `beforeSHA256`, `beforeBytes` and `beforePath` set to null.

The separate `incrementalFiles[]` preserves the applied97-before-revision2→revision2 test correction. Its non-null old97 test hash is correct only in that incremental history. It must not be used as the cumulative QA baseline.

Every row's `beforePath` and `candidatePath` resolves relative to this manifest's `candidateRoot`. The directory is self-contained: it carries all 12 final `after/` files, six baseline96 `before/` files and one `incremental-before/` copy. Their contents are copied exactly; no runtime or test bytes changed from applied revision2.

## Cause of attempt2 failure

Revision2's primary manifest described the one-file incremental correction in `files[]`, even though the separate `CUMULATIVE-MANIFEST.json` contained the full 96-based delta. The QA runner consumes only its nominated manifest's primary `files[]`. It correctly rejected the incremental render-test preimage because that file does not exist in the96 baseline map.

Revision3 corrects the primary manifest contract rather than modifying the runner, accepting an incorrect preimage or weakening a check.

## Explicit whole-map validation

Inputs read:

- baseline96: `roadmark-research/applied96/expected-inputs-revision3.json`,1662 entries, SHA256 `3dbb0442fcd4ac25c29ee489fa721b4bd8aa138601b0618c4256af6f37880c80`
- final revision2: `roadmark-research/applied97/expected-inputs-revision2.json`,1668 entries, SHA256 `cc6d49660a61a4f658194c87b64330c5149f435ebc2273f9e9fe19a20f00013e`

Static JSON-only derivation confirms:

- 12 distinct rows: six modifications and six additions
- Every cumulative preimage equals the96 baseline lookup
- All added-file preimage fields are null
- Every postimage equals the final map entry
- Applying exactly those 12 rows to baseline96 yields the entire final 1668-entry map, with no deletion or unlisted change
- Every final candidate file hash/length matches both its manifest and the current application; each stored96 preimage hash/length matches its manifest

Evidence: `STATIC-CONTRACT-CHECK.json` and `STATIC-FILE-CHECKS.json`. The reviewer was explicitly asked to repeat the complete baseline-plus-rows derivation and inspect the runner's actual manifest-consumption contract.

## Preserved failures and check status

Attempt1 and attempt2 directories/results are retained untouched. Attempt2 `run-result.json` still records the preimage mismatch and all seven stages as `not_started`; its SHA256 is `a7f960091b20b37373afd34c2274ab177fc077ec84c00a8cf4fb08b436def755`.

Root reported the revision2 render tests (7), typecheck and lint passed before attempt2. Those separate checks are not a full QA pass. Revision3 has not run any QA stage, validation or build.

This worker made no code changes, imports/execution, application writes, syntax checks, tests, lint, typecheck, builds, browser actions or network mutations. It copied unchanged artifacts and repaired manifests/reports only. The next run must use a fresh attempt directory and this exact primary manifest, retaining both failed attempts.

## Other contracts remain exact

- Original hero and all nine selling points remain unchanged
- All 117 data files, identities, provenance, source dates and guards remain unchanged
- All four runtime files and 97→96→95 reconstruction pins remain unchanged
- All test declarations and assertions remain exactly revision2
- Seven wording replacements/ten occurrences remain unchanged
- Initial freshness placeholder remains outside scope

`cumulative.patch` is byte-identical to revision2's full 96-based patch. `incremental.patch` preserves the one-file test correction separately. Neither requires application now: the current application already matches the final postimages.
