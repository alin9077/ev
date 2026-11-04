# Checkpoint102 portable preservation verifier candidate

Prepared only. This packet contains source and an input contract for later independent review and root execution. The verifier has not been imported, executed, syntax-checked, tested, or run against either checkpoint. No application, source candidate, QA output, historical verifier, build, browser, Git, or Codex task was changed or run during preparation. No future canonical, artifact, QA, or passing result is fabricated here.

## Intended result and exact boundaries

After independent approval and actual completed checkpoint102 QA, this root-only standard-library checker can establish:

- Four current portable aliases have the exact externally supplied hashes, sizes, and mtimes, match the portable producer's sealed observations and final QA rows, and are byte-identical to each other
- The complete string-table payload decodes with the reviewed101 strict decoder; its full market object equals the separately pinned final canonical102 file with all values and object/array order retained. The complete audit is required, not the client projection
- The canonical/decoded audit has 243 records, 148 unresolved entries, 6 peripheral entries, 21 unchanged reconciled leads, the seven exact appended IDs in planned order, unchanged complete old array prefixes, and declared counters matching the pinned integration plan
- Every other decoded payload member, including every art value, retains all values and object/array order from verified101. No exclusions within these members or numeric tolerances are added
- The entire static HTML prefix, including title, head, inline CSS, empty root element, noscript text, and ev-data opening tag, is byte-identical. Inline CSS also equals the current unchanged source CSS. The two exact suffix wrappers and original window.__EV_B=true; selector flag are preserved
- Every enumerated final source file matches the explicit final input map. Its only changes from the pinned expanded101 map are exactly the integration plan's eleven modified and seven introduced paths. Original hero, detailed catalogue, ranking, CSS, art, and other source files in that map retain their101 hashes
- The pinned serial runner's actual portable receipt has the expected command, clean process exit, frozen-source digest, environment, sealed logs, output observation, artifact timestamps, and current bytes. Final QA/request/frozen-map/source/portable-output references join. The root must additionally supply the genuine completed outer tool result for this same actual QA run

This is deliberately not a claim of whole HTML or whole runtime equality. Both must change for102. The entire runtime receives an explicit externally supplied SHA; its byte sizes/hashes are reported, and the checker states that runtime semantics and unrelated emitted runtime preservation are unproved. The changed runtime is not automatically deemed equivalent because the source delta is narrow. A preserved hero selector is not evidence of visible hero rendering. Separate emitted-runtime/source review and browser QA remain required.

This is not full seven-stage QA acceptance. All evidence file bytes are sealed and all seven summary statuses must say passed, but only the portable stage's process/command/log/output semantics are independently joined here. Complete test selection, TAP totals, other six stage receipts, production freshness, environment integrity, and all remaining QA obligations require separate root acceptance. No 101 QA pass is reused as102 QA.

## Baseline and reviewed reuse

`INPUT-PINS.json` freezes the reviewed101 verifier/review, actual101 preservation output and its actual zero-exit terminal, saved100 portable HTML, final expanded101 input map, integration plan/change map/counts, and unchanged serial runner.

The saved100 HTML is deliberately the materialized baseline: its exact SHA `cb4fe95ff34b375fe139b7ef81e959c7ae000a1cb4b44ed74ad340a662f4e39b` is also the actual verified101 SHA. The pinned actual101 proof establishes this equality and the full101 canonical identity; the checker validates that provenance rather than treating old QA as a new pass. No current app output is used as an assumed immutable baseline.

The copied helpers are literal byte slices from reviewed101 revision1, SHA `cafe3df97dee699e2928c19c285834f3783e4d2d2a2f8a9be561cf046d978187`:

- `class VerificationFailure` through just before `def local`: strict parsing, dictionary decoding, exhaustive ordered comparison, diagnostics
- `def local` through just before `def member`: safe regular-file reads, path/symlink protections, hashing/pinning

Their exact block hashes and lengths appear in the baseline pins; `COPIED-HELPERS.txt` concatenates these exact slices for review. Future execution rereads the pinned reviewed source and requires each exact block to occur once in this candidate. The new source does not import or execute the historical verifier. The new wrapper additionally rejects query, fragment, and NUL path characters at input-map/reference entry points.

The unchanged serial runner is `roadmark-rebuild101/run_qa99.py`, SHA `a043d6ac749a39d025bf452eddb55440d2ac81ba3b73be9f4d894a5055a2e10f`. `roadmark99.serial-qa.v1` is its mechanics schema, not the source checkpoint label. The external final input contract must declare checkpoint102. If the runner/schema, source allowlist, or receipt shape changes, stop for a reviewed candidate amendment; do not add permissive fallback logic.

## Mandatory future input contract

Root prepares one real JSON file after the final accepted source and successful QA exist. No such final-input file is included in this prepared packet.

It must contain exactly these keys:

- `schema`: `roadmark102.portable-proof.final-inputs.v1`
- `checkpoint`: integer102
- `canonical`: object with exactly `path`, `sha256`, and integer `bytes`; path must be `roadmark-work/roadmark/data/market-inventory-2026-10-10.json`
- `inputMap`: object with exactly `path`, `sha256`, and integer `bytes`; the referenced file is the full final expanded QA input map, a JSON object mapping safe app-relative paths to lowercase SHA-256 strings
- `qaResult`: object with exactly `path`, `sha256`, and integer `bytes`; the actual completed102 run-result.json from the unchanged pinned serial runner, not an authored success summary
- `outerTerminal`: object with exactly `path`, `sha256`, and integer `bytes`; the preserved genuine final tool result from that same QA execution, with integer exit_code0, no active session_id, nonempty chunk_id, and actual output text
- `aliases`: object with exactly `index.html`, `index-b.html`, `public/index.html`, and `public/index-b.html`; each value has exactly `sha256`, integer `bytes`, and integer `mtimeNs` matching actual current bytes and the final QA producer observations
- `expectedRuntimeSHA256`: actual lowercase SHA-256 of the final runtime script body, beginning at `window.__EV_B=true;` and ending immediately before its final `</script></body></html>` wrapper. This includes any emitted trailing newline. It is a hash acceptance pin, not a semantic-runtime approval

All paths are workspace-relative and all future identities must be independently observed and reviewed. Final canonical SHA must also match the final source-map row. Final map paths must exactly match the pinned101 inventory plus the seven new planned paths; exactly eleven existing hashes must differ. The full map is read and each enumerated file hashed. This is not an independent inventory scan: map completeness remains the reviewed runner/source review's responsibility. Current file mtimes for QA evidence and artifacts must still match the sealed originals; copying/restoring them with different mtimes requires preserving/reviewing fresh genuine evidence, not silently relaxing freshness.

The final QA directory must contain exactly its sealed evidence plus run-result.json. Place checker stdout/stderr, its own terminal, and the final-input contract outside that QA evidence directory.

## Later root invocation, after review only

The following is a non-executed invocation template. Replace every `ACTUAL_...` value with a real independently recorded identity; none is a default or claimed result.

```sh
PYTHONDONTWRITEBYTECODE=1 python3 roadmark-research/trike-checkpoint102-proof-candidate/verify_checkpoint102_portable.py \
  --workspace-root /workspace/scratch/586427eef9f2 \
  --final-inputs ACTUAL_FINAL_INPUT_CONTRACT_PATH \
  --final-inputs-sha256 ACTUAL_FINAL_INPUT_CONTRACT_SHA256 \
  --approved-verifier-sha256 ACTUAL_REVIEWED_VERIFIER_SHA256 \
  > ACTUAL_NEW_PROOF_STDOUT_PATH \
  2> ACTUAL_NEW_PROOF_STDERR_PATH
```

Retain the checker's own actual outer exit, every failure, and all exact input identities. `status: passed` has only the scope explicitly described in `statusScope` and `notVerified`; it is not independent source authorization, full QA acceptance, source-to-build attestation, evidence truth approval, release readiness, or durable save.

## Static review targets and remaining limits

Review every new function after the copied helper boundaries. In particular inspect exact source-delta lists, all required future refs, QA execution argv and environment joins, artifact producer/time joins, canonical equality and new collection IDs, static prefix/suffix extraction, and the intentionally unproved runtime boundary. The decoder's dictionary handling, nonrecursive literal behavior, duplicate-key rejection, boolean/number distinction, and exhaustive order comparison remain literal reviewed code.

Unknown source paths, stale101 canonical/artifacts, malformed/missing hashes, mismatched alias bytes, incomplete audits, changed old rows, any unrelated decoded payload/art drift, CSS/static-shell drift, unchanged or wrongly pinned runtime, stale artifact mtimes, and malformed/mixed QA joins fail closed. File reads reject symlink components and nonregular/oversized files, and compare pre/post stat identity. Trusted quiescent workspace use is required; this does not claim race-proof adversarial filesystem isolation, a global memory cap, or cryptographic process attestation.

No Next emitted-client projection check, browser use, visual QA, real-phone measurement, current external evidence retrieval, publication, upload, or durable checkpoint save occurs here.
