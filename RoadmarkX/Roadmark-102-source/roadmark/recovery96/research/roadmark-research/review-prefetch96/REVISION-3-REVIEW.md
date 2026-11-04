# Discovery prefetch 96: revision-3 historical-source guard review

## Decision

**No static blocker found. Approved for root-controlled installation and actual validation of this exact revision only.** Manifest SHA-256: `5af3f4bf5da3f7a7d73481d5d225b8835101f1e1b9eaa8ee01335cab2d100b60` at `../discovery-prefetch96-candidate/revision-3/MANIFEST.json`.

This approval does not establish full test compatibility. Root must run the revised tests, affected historical modules and complete required QA. No application/candidate import, evaluation, program parsing, syntax check, test/build, browser activity or application edit was performed by this reviewer. Only static text/JSON reads, hashes, byte comparisons and review-file writes were used.

## Actual failure and correction to earlier review

The actual full96 attempt1 failed, with 751 reported results, 734 passes and 17 failed modules. Each failed module aborted at `checkpoint91-history.ts`'s original Discovery byte-hash assertion: expected `c382047506d1881d4483e6478757dca41fc6d8011855e151027df027f689aa6f`, actual approved96 `02be90e98919418e433a853ae6019adfdb833b1a0e86a7d9d2d3564da9afecb8`. The stage terminal records exit/return code 1, and run-result marks every later stage not started. Aborted modules did not run all their contained assertions; 734 passes are not a full-suite success.

My initial review did not trace this historical source-hash dependency through the complete test inventory. This review corrects that gap. The initial review, revision-2 review and both actual failures are preserved, not overwritten or relabeled successful.

Evidence read and verified:

- Full failure log: `../applied96/qa-attempt1/non_http_tests.stdout.log`, `2d6b35185edda5ed5b32df85ea1312390fa2955b34a1072a25eba0a8b7d4366b`
- Non-HTTP terminal receipt: `../applied96/qa-attempt1/non_http_tests-terminal.json`, `7e480732f98ffbc425af29dd93fe48b03027b584e89b5183432304470618b5d3`
- Prior test typing failure: `../applied96/typecheck-attempt1.log`, `4f9ed2cf54c03583e449e1ffc173be3ab0a1b728560a75955e589d1025db0400`

The 17 module names are recorded in `revision-3-verified-pins.json`.

## Pins and cumulative scope

All 81 reviewed candidate, source, baseline, historical-guard, failure and prior-review pins verify. All **1,660** inputs in the currently applied revision-2 map (`6a9c4f8301f98f4a3d481ca137768563d6274b2df0f6b3df63badb3ebf1815fa`) still match. The candidate after inventory is exactly six files.

The three incremental files approved for installation on revision2 are:

- `tests/helpers/checkpoint91-history.ts`: before `73e067acd13a45eeb61a4b88a802ebbc0c99f0046bff7e89494f6324a661bd23`, after `7c8f6c2760e30fc081cd4fd1d2e9a75f338dfb7d8a6a9fed489694de6247507d`, 2,506 bytes
- New `tests/helpers/checkpoint96-source-history.ts`: `fe9d9db20d712e71971c4a7458762cfd3653c6addc5cb019b42372be4b0c6d16`, 4,172 bytes
- New `tests/checkpoint96-source-history.test.ts`: `01a5874bac96346fa1fdd45ed9cc58bc419260e2d18d487266be40ff47370347`, 8,053 bytes

The two new paths are currently absent and the current checkpoint91 helper matches its required before pin.

These original three revision-2 files are byte-identical in revision3 and the live app:

- `src/components/discovery.tsx`: `02be90e98919418e433a853ae6019adfdb833b1a0e86a7d9d2d3564da9afecb8`
- `src/portable/link.tsx`: `31140de06908d3d089d6a0ae025e6cb37864334d4d2e642d7c39e029c506963b`
- `tests/discovery-prefetch.test.ts`: `c3dfe9d0d090eda866c63730991fa83e460309912a0f6a46136a4a5007c09b07`

No data, fixture, application runtime, package, build script, stylesheet, art or evidence/freshness change is introduced by revision3. All 49 listed existing historical fixture/core/harness/helper-chain pins remain unchanged. Removing only the new reader import, reader construction and read-call substitution reconstructs the entire original checkpoint91 helper exactly.

## Guard semantics

The new reader preserves a strict distinction between verified current source and historical predecessor bytes:

1. `createCheckpoint96SourceReader` reads and copies both complete runtime files by exact paths, verifying each whole-file SHA-256 against its fixed approved96 pin. Both checks finish before either reversal and before any reader is returned. Portable is explicitly checked here because the old91 fixture never pinned portable Link.
2. `sourceBeforeCheckpoint96` itself rejects unsupported paths and requires the complete approved hash before transforming a source. It reverses four explicitly recorded Discovery edits or the exact portable-prefix edit. Every recorded replacement must occur exactly once; it does not broadly remove arbitrary props or normalize unknown source.
3. Each resulting buffer must have its fixed predecessor length and SHA-256: Discovery 26,192 bytes at `c382...aa6f`; portable 647 bytes at `0add...cfe6`. These are the original95 bytes, and the Discovery predecessor is the unchanged91 fixture value. The full approved hashes and exact before/after copies make unrelated edits impossible to pass through this route without an assertion failure.
4. The factory stores private predecessor buffers and returns defensive copies. It copies input buffers before verification, avoiding reader-return aliases. Other paths retain the original raw reader; they are not reconstructed, normalized or substituted.
5. The original outer `H.sha(...) === pin.sha256` loop remains. All 32 non-proposal/ledger comparisons still occur: 31 unchanged raw inputs and the exactly reconstructed Discovery predecessor. No historical expected hash is updated, skipped or replaced with a reported digest. The two proposal/ledger exclusions retain their preexisting exact semantic reconstruction checks.

The direct single-file reconstruction function verifies its own file; the integrated factory is the boundary that insists on the complete approved two-file pair. Already-old, partly applied, mixed, swapped or unrelatedly edited runtime sources fail; there is no old/new fallback. This narrowly binds the history adapter to this exact96 change. A future source edit requires a separately reviewed delta. Rolling back to95 must also remove this test-support integration.

The adapter only produces bytes for hash comparison. It does not execute reconstructed historical UI code, monkey-patch filesystem reads, or replace live Discovery rendering in the real behavior tests.

## Historical chain and retained assertions

Static inspection confirmed the original91 harness still checks its fixed candidate seal, fixture hashes, identity, case inventory and frozen fixture data. The history core still checks exact post91 proposal/ledger values, reconstructs their exact predecessor, checks the full research/source graph, and validates whole car identities, order and buyer-summary counts.

Catalogue/summary consumers route through `checkpoint91-history` → `checkpoint84-runtime` → `checkpoint82-history`, then earlier data adapters such as73/71. The separate market adapters retain their95/93/91/89/88/86/84/83/81/80/77/73/71 predecessor checks. Imports through the combined earlier data helpers caused the same91 source guard to abort market-labelled modules too. No change to any historical data expectation or later chain is needed or included.

Independently comparing all 34 old91 input pins found only Discovery drift after excluding the two intentionally reconstructed storage inputs. Portable's absence from that old map was verified, so the new full-pair check is meaningful additional coverage rather than an assumed existing check.

## Mutation tests and remaining uncertainty

Ten new tests cover:

- Exact positive predecessor hash/length and immutable input bytes
- Rejection of original/before, swapped, truncated, appended, CRLF and unrelated-prefix mutations
- Removal/true substitution at each of four Discovery prefetch sites
- Discovery href, evidence-expiry copy and unrelated-link policy drift
- Portable consumption, href, destination, cancellation, button and all modifier guards
- Mixed current/predecessor pairs and all-before pairs
- Full-pair verification before serving a historical read, including independently mutated portable bytes
- Unrelated source pass-through plus original pin rejection, unsupported path aliases
- Defensive-copy resistance to poisoning cached predecessor results
- Preserved fixture hash, integrated original outer loop and semantic guard calls

The six existing focused tests are byte-identical. These tests were reviewed as source only; no new pass or TypeScript compatibility result is claimed. The complete source-hash gates make acceptance of unreviewed bytes fail closed; root's actual run must establish that the intended positive paths compile and execute successfully.

## Required root continuation

1. Reverify this frozen manifest and all installation preconditions. Apply only the three incremental support files on revision2. Preserve failed attempt1, initial application receipts and prior reviews. Update the cumulative expected-input map and validator's candidate-manifest pin to revision3.
2. Include `tests/checkpoint96-source-history.test.ts` in the explicit non-HTTP inventory. Top-level test files grow from **122 to 123**: 122 non-HTTP plus the existing one local-HTTP file. There are 16 new focused test declarations versus95 across the two new files; do not predict the recovered full result count from the aborted attempt.
3. Run the new ten tests, original six and affected historical modules, then the full required checks/builds in a fresh evidence directory. Read actual terminal states; no later-stage readiness follows from the failed run's partial progress.
4. All original production request, cold-navigation, native pointer/keyboard/modified-click/history, portable, hero/scene and narrow-layout acceptance gates remain. Runtime bytes did not change in this revision. No after-change traffic reduction, phone performance or shipping approval is established here.
