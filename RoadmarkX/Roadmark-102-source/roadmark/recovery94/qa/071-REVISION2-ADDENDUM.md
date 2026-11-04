# Checkpoint94 revision 2: independent static approval

Decision: **APPROVED FOR ROOT'S EXACT TWO-FILE REPLACEMENT AND ACCEPTANCE RERUN**.

This addendum supplements the retained original `REVIEW.md`. It reviews a test-only overlay on the original six-file candidate, not a new production implementation. It does not claim the revised tests or typecheck pass.

## Exact reviewed revision

- Revision directory: `roadmark-research/report-preview94-candidate/revision2/`
- Manifest SHA-256: `7baf0f650bfc0b957c51555617aa3e80898815874672f02c28d2fae2bdf362cd`
- Revision pin-file SHA-256: `817832be3d6e0b132334cdd36ec29d018e23a832c91a0d1ca671dbc4062bcfa0`
- CLI test postimage: `56c3eaf80e449288d5b621fac01303e885bfa4953e42d4be8e47c58f8ee60526`
- Synthetic helper postimage: `1aeff036b6797db940ce28e1fafc27c962f17878708e3904f9645425d7256a98`

I verified both digest anchors, all revision pins and all revision source pins. Both test-file preimages matched the currently applied app bytes and the original candidate. All original candidate pins still verified. The pure adapter, CLI runtime, workflow document and pure test remained byte-identical to their original applied postimages at this review check.

## Actual root evidence considered

I read, but did not generate or execute, root's two first-attempt logs:

- `roadmark-research/applied94/focused-tests-attempt1.log`: 36 tests, 35 passed, 1 failed, 0 skipped. The failed import-boundary subprocess's retained `fs.writeFile` tripwire was called from tsx's `Er.set → transformSync` disk-cache path. The production CLI success/error, broken stdout and FIFO subprocess tests passed in that recorded run.
- `roadmark-research/applied94/typecheck-attempt1.log`: TS2322 for `conditionExplanation: null` in the typed `Fact` fixture initializer. `types.ts:154` declares that optional field as string, while persisted raw report validation explicitly accepts null.

These were real acceptance failures that require correction and fresh evidence. The original static approval did not establish that runtime tests or typecheck would pass. This reviewer has not executed any candidate/application module, test, typecheck, build or server, and has not edited any application file.

## Exact change review

### 1. Import-test child loader cache

The only CLI-test change adds `TSX_DISABLE_CACHE: "1"` to that one subprocess's explicit environment. It is present before `--import` initializes tsx and is local to the child process. All seven filesystem tripwires, both HTTP server tripwires, the before/after fixture-tree comparison, exit status and stdout/stderr assertions are retained byte-for-byte.

Installed tsx 4.23.15 source independently confirms the setting: its CLI no-cache option assigns this environment variable, and both ESM and CommonJS transformer cache selections use an in-memory `Map` when the variable is truthy. `LOADER-EVIDENCE.json` and revision source pins capture the installed files. This avoids treating loader-managed transform-disk caching as candidate application-data IO while leaving the application boundary fully guarded. It does not weaken production behavior, remove a tripwire, ignore the failing assertion or claim all loader activity is absent.

### 2. Persisted null fixture construction

The helper moves `conditionExplanation: null` from the typed `Fact` literal into the existing `Object.assign` JSON-extension step, before any draft construction or binding hash. The runtime field remains present with the same null value and property order, followed by the existing synthetic metadata field. The completed synthetic claim therefore retains its original runtime shape.

This matches `report-claim-shape.ts:53–56`, which explicitly permits a persisted null explanation, without modifying the production `Fact` type or validator. The null-to-string binding rejection test and `fixtureMetadata.a: null` deletion test remain intact. It is a synthetic persisted-JSON boundary fixture, not an assertion that all application `Fact` values should be nullable.

## Remaining root obligations

1. Recheck exact revision preimages immediately before replacing only the two manifest-listed test files.
2. Retain first-attempt logs and original candidate pins. Record the applied composite as original six-file candidate plus this two-test-file overlay; do not rewrite the original manifest to conceal the first attempt.
3. Rerun both focused suites and typecheck on the revised source. Inspect the actual import-process output and all final test totals.
4. Continue all previously required regression, lint, validation, aggregate, normal/portable build, unchanged-register and no-wiring/private-artifact gates. Any further edit requires a new pinned revision and final-source reruns.
5. Honor the separately clarified public-export origin requirement: do not invent an approved HTTPS origin, change public-export wiring or claim that release gate passed without its actual authorized configuration and evidence.

No further static revision is requested. All original authority, partial-history, filesystem-race, stdin/deadline, privacy and publication limitations remain in force.
