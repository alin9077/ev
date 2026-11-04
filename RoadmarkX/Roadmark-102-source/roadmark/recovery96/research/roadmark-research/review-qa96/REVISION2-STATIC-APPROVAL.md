# QA96 revision-2 static approval

Decision: APPROVED for the root-owned, scoped seven-stage QA run with the exact identities below and the stated execution conditions. This is approval of the runner's source and configuration contract, not a claim that any QA stage passed.

## Exact approved identity

- Runner: `roadmark-research/qa96-candidate/revision-2/run_qa96.py`
- Runner SHA256: `927d4bdf6318b300c4f8581fb074eb929555b902e5dd355381fcafadc4d50ff3`
- Runner size: 22,175 bytes
- Runner MANIFEST SHA256: `7999ee55d7679b6199bf334d2ad7997796c8c1e65b1ef0225a1b8267fb93a1e1`
- Runner README SHA256: `dd72df1ef314dc48816fc69486f6e4498e0cc7ca9cd99b5c2e4306023af561a2`

The original runner is preserved and remains unapproved for use; its initial review is retained in `INITIAL-STATIC-REVIEW.md`.

## Exact reviewed run inputs

- Baseline: `roadmark-research/applied95/expected-inputs.json`, SHA256 `42e12fc28be57b321a7b05ce553f59cd19faed85161ee74dc0fb8122bc3b1c57`
- Corrected app candidate: `roadmark-research/discovery-prefetch96-candidate/revision-2/MANIFEST.json`, SHA256 `9421e8f6421df52c6aa9ede71a0b9e3d976cfb010f33f5de229f31097e91aa44`
- Corrected expected map: `roadmark-research/applied96/expected-inputs-revision2.json`, SHA256 `6a9c4f8301f98f4a3d481ca137768563d6274b2df0f6b3df63badb3ebf1815fa`

Independent static JSON comparison establishes 1,659 baseline inputs plus exactly the three candidate additions/replacements equals the full 1,660-entry expected map. Candidate preimages match baseline. The three currently applied candidate files match their manifest sizes and hashes:

- `src/components/discovery.tsx`: 26,356 bytes, `02be90e98919418e433a853ae6019adfdb833b1a0e86a7d9d2d3564da9afecb8`
- `src/portable/link.tsx`: 780 bytes, `31140de06908d3d089d6a0ae025e6cb37864334d4d2e642d7c39e029c506963b`
- `tests/discovery-prefetch.test.ts`: 7,494 bytes, `c3dfe9d0d090eda866c63730991fa83e460309912a0f6a46136a4a5007c09b07`

The corrected test source includes the explicit `this: { defaultPrevented: boolean }` annotation and still has six test declarations. The final map selects 122 Node test files: 121 non-HTTP and one isolated HTTP file. The runner reads actual TAP totals; it does not enforce or fabricate an expected case tally. Root's expected 856 + 1 cases is an expectation to reconcile with emitted TAP, not an execution result from this review.

This reviewer checked candidate rows and map arithmetic, not every final app input hash independently; the runner's full traversal guards must succeed before and after execution stages. Independent app-candidate approval remains a separate prerequisite owned by root.

## Cleanup defect disposition

The complete source diff from the original runner is limited to interruption/error cleanup and its receipt fields. Revision 2:

1. Captures Linux process leader PID, process group, session, and start ticks before wait
2. Verifies the exact original, unreaped leader identity before each group signal
3. Does not use direct-child termination as a substitute for group disappearance
4. Probes group existence under a monotonic ten-second TERM window, then sends SIGKILL to a still-owned group if needed
5. Bounds direct-child reaping to ten seconds and post-reap read-only group probing to five seconds
6. Makes no further group signals after reaping, avoiding an unverified reused process-group ID
7. Records ownership/probe/child-wait errors, observed group presence, cleanup establishment and manual-cleanup possibility separately
8. Keeps every interrupted/exceptional stage failed even if cleanup later succeeds

Only ProcessLookupError is treated as absence. Other probe errors remain inconclusive. Zombie retention can conservatively consume the full TERM interval; persistent zombies or a reused group ID can conservatively make cleanup unestablished. These are fail-closed outcomes and clearly documented.

## Remaining static conclusions

The initial review's positive findings still apply: exact seven-stage serial order, actual direct-child terminals and raw output capture, strict TAP terminal requirements, complete source-membership/hash guards, explicit output exclusions, externally pinned revised map/manifest support, exact baseline-derived candidate delta, historical metadata protection, fresh BUILD_ID and producer-window artifact observations, equal portable aliases, final output comparison, preserved failed attempt evidence, and no false promotion of incomplete or never-started stages.

## Required operational conditions and boundaries

- Root must keep other app writers, tests, builds and servers stopped; advisory locking only coordinates cooperating runners
- Use a new output directory and the exact reviewed runner/configuration pins
- Preserve the external execution tool's actual runner exit, in addition to internal run-result evidence
- After every failure, independently confirm that no surviving writers remain before retry, including ordinary nonzero/signalled direct-child returns; those returns already reap the leader and do not invoke exception cleanup
- Descendants that deliberately escape into another group/session are outside the cleanup claim
- Source observations occur at guard points, not continuously; dependencies, VCS, interpreter and inherited environment are outside attestation
- Output observation covers the four production identity/routing files and four portable aliases, not the entire emitted graph, hydrated behavior, route equivalence, phone/browser behavior, publication or release readiness
- Do not overwrite or relabel previous failures; missing receipts/outer-zero-exit evidence do not establish success

## Review scope

Read source and documentation, inspected the exact original/revision diff, measured file hashes/sizes, inspected corrected candidate source and compared JSON data. No candidate, runner or app imports/execution/syntax checks; no tests, typecheck, lint, validation, builds, browser, Git, Codex, uploads, installs or app mutations. Wrote only `roadmark-research/review-qa96`.
