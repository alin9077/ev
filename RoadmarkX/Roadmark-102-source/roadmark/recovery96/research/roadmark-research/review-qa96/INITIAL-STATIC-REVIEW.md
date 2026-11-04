# QA96 static runner review: original candidate

Decision: HOLD for one runner cleanup defect and pending corrected application candidate pins. This is a static review only, not a runtime or syntax-check result.

## Reviewed identities

- Runner: `roadmark-research/qa96-candidate/run_qa96.py`
- Runner SHA256: `b4e77d050038485c294f88bafd84eb924f93b02f85fbaa9dd5423368833d8933`
- Runner manifest SHA256: `ca8b8b02c75385c2947c092a91ecfb6060e1d10bc11b8fd9e6a09c7077aaf456`
- Baseline input map SHA256: `42e12fc28be57b321a7b05ce553f59cd19faed85161ee74dc0fb8122bc3b1c57`
- Initial, supersedable app candidate manifest SHA256: `da83cad37b6b727cd00ea9ebceab5404e7c8a8f8e999f4134dc15c31970856e6`
- Initial, supersedable expected-input map SHA256: `1be83d06dd23a85423a69181a1a90b9814c54827f826efb844483b84197ead75`

## Blocking finding

`execute`, lines 181–192: after a caught interruption/error, SIGTERM is sent to the owned child process group, but the loop exits as soon as `process.wait()` observes the direct child terminate. This does not establish that descendants in that process group terminated. A descendant ignoring SIGTERM can survive without the promised SIGKILL escalation and continue holding output descriptors or writing app outputs during a later attempt. The interrupted stage remains failed, so this is a cleanup/exclusivity defect, not a direct false-PASS branch. A separately preserved revision should independently observe process-group liveness with bounded cleanup, preserve direct-child terminal information, and treat unresolved cleanup as failure. Root must not start a retry with a live writer from a failed attempt.

## Positive static findings

1. Seven insertion-ordered serial stages: all frozen non-HTTP Node tests, isolated local HTTP test, TypeScript no-emit, ESLint, validation, normal Next production build, portable build. `process.wait()` is synchronous; the loop stops at the first unestablished stage. Browser/Playwright suites are outside this runner and not represented as passing.
2. All child commands are argv lists without shell expansion. Existing local Node packages are invoked directly. Child environment removes `SITE_STATIC_EXPORT`, `NEXT_PUBLIC_SITE_URL`, and `NODE_ENV`, and sets `NODE_OPTIONS=--max-old-space-size=1280 --max-semi-space-size=8` plus `NEXT_TELEMETRY_DISABLED=1`. Other inherited settings/dependencies are explicitly outside attestation. The installed Next CLI supplies production NODE_ENV for build; the portable builder explicitly defines production browser code and an empty site URL.
3. Supplied configuration pins baseline, final input map, and candidate manifest independently. No initial candidate hash or test count is hardcoded in the runner. A corrected three-file candidate manifest and final map can be supplied under new exact hashes without changing the runner.
4. JSON duplicate keys/nonfinite values and unsafe relative names fail closed. Candidate rows must be unique admitted inputs, have the exact baseline preimage (null for an addition), a distinct valid postimage, and matching positive byte length. The derived baseline-plus-candidate map must exactly equal the supplied final map. Full traversal then verifies actual source membership and bytes; deletions, unmanifested additions, or unrelated changes fail. Observed-scope symlinks fail. Dependencies/VCS, generated output, incremental TypeScript metadata, and separately guarded checkpoint metadata have explicit exclusions.
5. Initial map arithmetic is internally consistent: 1,659 baseline inputs become 1,660 inputs through precisely `src/components/discovery.tsx`, `src/portable/link.tsx`, and added `tests/discovery-prefetch.test.ts`. This is not approval of the initial app candidate, which has a known typecheck failure and must be superseded.
6. Initial frozen inventory has 122 Node `.test.ts` files: 121 non-HTTP plus isolated `tests/local-review.test.ts`. The new prefetch file contains six test declarations and is automatically included. Five Playwright `.spec.ts` files are deliberately outside this Node runner. A final unchanged-membership test revision will preserve this inventory, but final pins still require review.
7. Every stage has a new start record, separate raw stdout/stderr capture, and terminal record with actual Popen PID/argv/cwd, timestamps, monotonic duration, direct-child return code or signal, and errors. Stage success requires an actual zero return, no execution error, identical source digests before/after, and successful applicable artifact/TAP checks. TAP requires one terminal summary per counter, positive tests, passes equal tests, and zero failed/cancelled/skipped/todo tests.
8. Production observations cover four explicitly named build/routing identity files, require a nonempty fresh BUILD_ID and producer-window mtimes. Portable observations cover all four aliases, require byte identity and producer-window mtimes. Final snapshots guard the eight recorded artifacts. These are scoped producer observations, not whole emitted graph or browser proof.
9. New exclusive attempt directories and create-only evidence writes preserve prior attempts. Caught errors report failure; completed stage receipts remain, incomplete/never-started stages are not represented as passed. Missing final evidence and absent independently observed zero runner exit are not success. The root must retain the runner's actual external terminal/exit separately.

## Pending gates

- Independently review the separately preserved cleanup revision and exact new runner identity.
- Obtain the corrected application candidate manifest/input-map paths and SHA256s. Do not use the initial app pins above for the final run.
- Root must ensure no other writers, tests, builds, or servers and observe the outer runner's actual exit. The advisory directory flock does not enforce cooperation from unrelated processes.
- Runtime stages and later browser/performance checks remain unrun by this reviewer. Complete95 remains the stated fallback; this review does not alter or validate it.

## Work performed

Read source, instructions, manifests, app scripts/configuration, test inventory and the existing typecheck error log; used filesystem listing, SHA256 hashing, text search and JSON comparison. No runner/candidate/app import, execution, syntax check, tests, builds, browser, Git, Codex, uploads, package installs or app changes. Wrote only this review directory.
