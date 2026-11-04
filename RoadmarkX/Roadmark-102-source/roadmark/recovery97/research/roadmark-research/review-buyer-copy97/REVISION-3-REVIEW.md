# Buyer-copy97 revision3: primary manifest contract review

## Verdict

**No static contract blocker. Use the exact revision3 primary manifest for root-owned QA. No application update is needed.** All final application and test bytes are identical to reviewed revision2.

Authoritative manifest:
`roadmark-research/buyer-copy97-candidate/revision-3/MANIFEST.json`

SHA-256: `b81abc7d68882213eb911d039a8c7fecaece87009e1e68ea1d18c1b4248e2cad`

The review imported/executed neither application code nor the QA runner. It performed independent JSON/text/filesystem comparisons, ordinary hashes, and patch reconstruction only. It wrote only review artifacts outside the app.

## Actual runner interface

The unchanged `qa97-candidate/run_qa97.py` SHA-256 is `8987a86aa9ae380211e3e6ca0765d73a2146558bd1bc754a2756d69c53ba860d`.

Its preflight consumes only the nominated manifest's primary `files[]`. Each row's preimage must equal the supplied baseline map lookup, and baseline plus those postimage rows must equal the complete expected map. `incrementalFiles[]` is not its source-delta contract.

Revision2 had a valid separate cumulative manifest, but the nominated primary manifest described only the incremental test correction. The previous review verified the separate cumulative data without validating that nominated-primary/runner interface. Attempt2 correctly rejected it. This review explicitly covers that missing interface.

Revision3 fixes the nominated primary manifest, without weakening or altering the runner. Both `appRoot` and `applicationRoot` match the actual app. Primary paths are distinct, permitted source-input paths, without absolute-path, traversal or symlink indirection.

## Independent whole-map proof

Baseline:
- `applied96/expected-inputs-revision3.json`
- 1,662 entries
- SHA-256 `3dbb0442fcd4ac25c29ee489fa721b4bd8aa138601b0618c4256af6f37880c80`

Final:
- `applied97/expected-inputs-revision2.json`
- 1,668 entries
- SHA-256 `cc6d49660a61a4f658194c87b64330c5149f435ebc2273f9e9fe19a20f00013e`

Verified from the primary manifest, independently of its embedded claims:

1. All12 distinct `files[]` rows have checkpoint96 preimages
2. Exactly six modifications and six additions
3. Every addition has null `beforeSHA256`, `beforeBytes` and `beforePath`, including the render test
4. Every postimage matches the final expected map and current application file's hash and length
5. Baseline plus exactly those12 rows equals the entire final1668 map, with no missing, deleted, unexpected or unlisted changed input
6. Serializing the independently derived map using the expected map's sorted, indented format produces identical bytes
7. An independent complete current application input walk, using the runner's reviewed exclusions and symlink constraints, also equals that final map

## File and provenance coherence

All12 self-contained final candidate files have coherent paths, hashes and lengths and are byte-identical to the reviewed revision2 cumulative set. The six baseline96 copies match both manifest lengths/hashes and the original reviewed preimages. Runtime mapping, fixtures, assertions, historical97→96→95 adapters and all test bytes are unchanged.

The separate one-row `incrementalFiles[]` correctly preserves the old97 render-test preimage and revised test postimage. Its preimage lives only under `incremental-before/`; it is not used as a96 preimage. `revision3ApplicationDelta` is empty.

Independent diff reconstruction matches:
- Cumulative patch: `41ffb19cbd27943daf9413eb5af7fda8e8b558009ec34ebe16dedcd65b536d61`
- Incremental patch: `c1f6ad3a6a1cb9d85e96a4eae84b055ce9155e49ac967bfd4952fda759bdf448`

The copy manifest, source-delta manifest, all-data hash list and protected-file list remain exact copies of the previously reviewed originals. The24 protected current files still match. The full current input-map proof also covers all117 unchanged data files.

## Failure retention and next gate

Both failed run-result files retain their recorded hashes. Attempt2 remains:
- `passed: false`
- Exact preimage-mismatch error for `tests/buyer-display-copy-render.test.ts`
- All seven stage statuses `not_started`
- Result SHA-256 `a7f960091b20b37373afd34c2274ab177fc077ec84c00a8cf4fb08b436def755`

The revision3 manifest and report do not turn that attempt into a pass. Root-reported revision2 focused tests/typecheck/lint are separate from full QA. A fresh runner invocation must nominate this revision3 primary manifest and exact pin, retain the same baseline/final-map pins, use a new attempt directory, and preserve both failed attempts. Root must still establish actual QA/build exits and browser results.

Independent machine-readable evidence: `revision-3-static-contract.json`.
Read-only comparison utility: `review_revision3_contract.py`.
