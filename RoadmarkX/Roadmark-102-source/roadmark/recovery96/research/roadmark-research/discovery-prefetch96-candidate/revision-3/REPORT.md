# Static revision 3: exact source predecessors for historical assertions

## Genuine failure retained

Root's full QA attempt 1 reported 751 test results: 734 passed and 17 failed. The 17 affected test modules aborted while importing `tests/helpers/checkpoint91-history.ts`: its original source guard expected Discovery SHA256 `c382047506d1881d4483e6478757dca41fc6d8011855e151027df027f689aa6f`, while the deliberately changed, approved checkpoint96 Discovery source has SHA256 `02be90e98919418e433a853ae6019adfdb833b1a0e86a7d9d2d3564da9afecb8`. Root reports the runner exited 1, no later QA stage ran, and no matching writer remained. The full failure log is retained at `../../applied96/qa-attempt1/non_http_tests.stdout.log` and pinned in this manifest. This is a failed run, not a partial full-suite pass.

This worker did not edit the application, import or execute any candidate/application source, syntax-check, run tests, build, browse, use Git or upload. This packet remains a static proposal. Earlier packets and reviews are preserved.

## Guard chain traced

`checkpoint91-history.ts` loads the existing runtime fixture through `checkpoint91-history-core.cjs`, and calls `checkpoint91-harness.cjs`'s `loadFixtures`. The latter checks the fixed candidate seal, fixture file hashes, identity and mutation-case invariants, and deep-freezes the original fixture. `before-app-input-hashes.json` has 34 entries. The outer loop compares every entry except the two deliberately reconstructed proposal/ledger inputs, so 32 original raw-input assertions remain.

The only non-proposal/ledger mismatch is Discovery. Portable Link is not an original91 input pin. Consequently, merely substituting Discovery's new hash, accepting either old/new source, or skipping the failing check would weaken the historical guard. The new reader instead checks the complete two-file approved96 source delta before supplying historical source bytes.

After that original input loop, the unchanged91 core checks the exact post91 proposal/ledger, removes precisely its reviewed single-record/three-dependency/one-identity append, verifies predecessor data hashes, verifies the unchanged research/source graph, and verifies exact historical cars and summary counts. `checkpoint84-runtime.ts` delegates through this91 layer before its own full Transit City reversal. `checkpoint82-history.ts` delegates through84 for the earlier summary reversal; checkpoint73 and checkpoint71 data history depend on82. The market history chain remains separate and unchanged:95 →93 →91 →89 →88 →86 →84 →83 →81 →80 →77 →73 →71. Later callers ultimately import the same91 source guard. No old data fixture, historical expected count or semantic assertion is changed.

## Exact new scope

The cumulative packet is six files versus checkpoint95:

Unchanged from approved revision2:
- `src/components/discovery.tsx`: the original four disabled-prefetch sites, SHA256 `02be90e98919418e433a853ae6019adfdb833b1a0e86a7d9d2d3564da9afecb8`
- `src/portable/link.tsx`: original prop consumption, SHA256 `31140de06908d3d089d6a0ae025e6cb37864334d4d2e642d7c39e029c506963b`
- `tests/discovery-prefetch.test.ts`: original six corrected tests, SHA256 `c3dfe9d0d090eda866c63730991fa83e460309912a0f6a46136a4a5007c09b07`

New test-support delta:
- `tests/helpers/checkpoint91-history.ts`: import the new reader, instantiate it against the existing filesystem location, and use it inside the original `H.sha(...) === pin.sha256` loop. All other statements remain exactly unchanged
- `tests/helpers/checkpoint96-source-history.ts`: test-only pure reconstruction/helper definitions; no application import, evaluation, monkey-patch or filesystem write. The reader accepts an injected raw-file reader
- `tests/checkpoint96-source-history.test.ts`: ten focused reconstruction/negative tests

No data, old QA fixture, harness, history core, runtime component, corrected original test, package or script changes are added by revision3. The original hero, nine points, sources, evidence/ranking/freshness guards, styles, text, routes and portable navigation remain untouched by this revision.

## Why the source guard retains its meaning

The two source files are selected by exact repository-relative path. The new reader first copies and verifies both complete current file hashes against the approved96 pins before reversing either file. It then reverses only four explicitly recorded Discovery JSX edits and the exact portable prop-consumption prefix edit. Every replacement must appear exactly once. Each reconstructed buffer must have the original byte length and the original95 SHA256.

The original95 Discovery hash equals the original91 fixture pin; it is not rewritten. The original95 portable hash is `0add93ac8b2209b4cba733f805d3bfb7f9252fd3d33bd0d9b3da65c95a8ecfe6` (647 bytes). The explicit reverse deltas are embedded in the new test helper, and exact95 before copies are included in this packet for independent inspection. No static historical file is blindly returned in place of unchecked live code.

Already-old, partially applied, mixed old/new, swapped, malformed, truncated, appended or otherwise altered runtime bytes fail before they can stand in for current96 source. Both full predecessor hashes are checked after reversal. The original checkpoint91 outer `H.sha(readSourceBefore96(file)) === pin.sha256` is still applied. Non-target files go through the raw reader unchanged, preserving every other original pin. Returned reconstructed buffers are fresh copies so a caller cannot modify the cached historical bytes.

The only route to a historical digest is therefore a verified full approved current source followed by a verified exact byte reconstruction. This is not a hash whitelist, digest substitution, permissive normalization, dual-version fallback or fixture update. A future unrelated change, even a comment, must fail this narrow96 guard until a separately reviewed historical delta is introduced. Reverting the96 experiment requires reverting its test-support delta too.

## Ten new test expectations

1. Both current sources reconstruct the exact original95 hash/length without mutating inputs; Discovery agrees with the unchanged91 fixture pin, and portable is explicitly recognized as outside that old pin list
2. Reject original95, swapped, truncated, appended-newline, CRLF-converted and unrelated-prefix mutations for both files
3. Reject removal or `true` replacement of each of the four disabled-prefetch props
4. Reject Discovery canonical href, evidence-expiry copy and unrelated market-link prefetch mutations
5. Reject portable missing consumption, altered href/navigation, changed cancellation and primary/modifier guard mutations
6. Reject all mixed approved/predecessor pairs and the entirely old pair
7. Check both runtime files before serving any historical input, including failure on portable drift even when the caller only needs Discovery
8. Pass an unrelated pinned source through raw and demonstrate that its original outer pin still rejects drift; reject aliases and unsupported paths from direct reconstruction
9. Confirm returned buffers cannot poison cached predecessors
10. Keep the sealed91 input fixture hash and reader-wrapped original pin loop, fixture loading, proposal/ledger reconstruction and research assertions

These tests are static proposals, not executed results. The existing six Discovery/portable tests remain byte-identical. Root must include the new `tests/checkpoint96-source-history.test.ts` in its explicit inventory and run it plus the existing six tests and the formerly failing modules before or alongside the complete unchanged validation procedure. Do not infer later-stage readiness from the earlier 734 passes.

## Frozen packet and root-only application

MANIFEST.json remains cumulative versus95, with six exact `files` entries. `incrementalFiles` identifies the three support files to apply on the already-installed revision2, including the original checkpoint91-helper precondition hash. `before/` contains the original changed files; `after/` contains all six proposed files. `support.patch` contains only revision3's three-file support delta. Original fixture/core/harness/helper-chain hashes and the entire failure log are pinned separately for preservation checks.

Root must obtain independent review, verify manifest/candidate hashes and the current revision2 pins, then apply only the three incremental support files. Rerun relevant checks and the full runner with a new output location, retaining attempt1. No candidate has been installed or run by this worker. Runtime acceptance, paired production request measurements, cold navigation, all original invariants and real-device limitations from the initial report still apply; this historical-test correction establishes no performance benefit.
