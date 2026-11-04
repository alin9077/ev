# Acceptance harness revision 2: independent static re-review

Reviewed on 2026-10-12 UTC after the author froze the separate revision.

## Result

**Source-review gate cleared. H1 and H2 are resolved for the pinned revision; no additional static blocker was found.** This is permission to proceed to root-owned validation within the existing task, not a claim that any check has run or that the harness/logger has passed runtime testing.

The initial harness and its initial review remain intact. The logger remains the unchanged source-reviewed revision-2 logger. Root still owns syntax checks, actual fixture execution, harness lifecycle validation, real Next/server/browser work, and the prefetch decision.

## Verified pins

Directory: `/workspace/scratch/586427eef9f2/roadmark-research/mobile-performance96-assessment/measurement-candidate/acceptance-candidate/revision-2`

| File | SHA-256 |
| --- | --- |
| `run-acceptance.mjs` | `fa5e6a202ebfcc95a5f85289cc811fc0b6c9c823757d74b24859281c0480e51e` |
| `README.md` | `989d1a947f3f51b3828fbed354fe163da34d524bc1c3c4393cac2e5953ae6aeb` |
| `REVISION.json` | `f8fde4d6293b775841099ae1f12bb1a5ec9a679cce5afe5065e9ce5cee843340` |
| `SHA256SUMS` | `32f4197076c1266cb7a4b88dd06b2303e0f0907f35af3f6e88679410fa163ad2` |

The logger expected by this harness is still SHA-256 `5181ad081108ffc6c236eca5086de5b262ad0e24b7173fe3f17ac35c27f37512`. The revised relative path points to that logger directory, not to the initial logger or to application code.

I independently hashed the revision files and inspected the complete source/README diffs and revision record. The preimage/postimage record matches the reviewed files.

## H1 resolution: shutdown and resource ownership

- `finalize` sets `stopping = true` synchronously before taking any cleanup snapshot
- Test start/completion, polling, child launch, listener acquisition, HTTP request creation, fixture creation, and raw-client creation have stopping checks
- Cancellation escapes the ordinary test failure-and-continue path, so interrupted main work cannot proceed to later child launches
- All listening servers, pending acquisitions, accepted fixture/probe sockets, raw client sockets, and HTTP client requests are tracked
- Probe sockets are immediately destroyed and remain tracked until close; a probe's accepted client cannot silently hold its normal close wait indefinitely
- A listener that completes acquisition after stopping begins closes itself rather than becoming usable
- Cleanup tears down owned resources, waits for pending acquisitions, repeats teardown, and has an independent eight-second deadline after the main watchdog is cleared
- Deadline expiration forces remaining owned cleanup, records an incomplete result, and prevents the harness from lingering on its own remaining handles

These changes close the source-level post-snapshot child-launch race identified in the initial review. They do not touch unknown processes, unrelated listeners, application files, or other machines. Root should still exercise signal interruption during the idle case and around startup, as the README now explicitly requests.

## H2 resolution: exit and evidence audit

- Child state now records the `close` event separately from process `exit`, permitting bounded stdout/stderr drain before final evidence preservation
- `stopChild` waits for `close`; failure to establish it or a forced kill cannot yield success
- Normal logger children have an exact expected exit of 143 with no signal; the explicit negative cases have exact expected codes 1 or 70
- Final auditing rejects spawn errors, unknown/incorrect codes, unexpected signals, and undrained output. A logger fsync/finalization exit of 74 is therefore a failure, including for the main logger stopped only during final cleanup
- Drained output and logger files are preserved before the success decision
- Non-newline-terminated/malformed final JSONL, missing expected log files, leaked privacy sentinels, invalid completion/body-byte fields, and incorrect per-method/path record counts prevent success
- The expected-record ledger includes normal requests and ordinary rejections; the intentionally parser-rejected oversized-header request is explicitly excluded

The final status is still narrowly `passed_exercised_cases`; incomplete cleanup or interruption cannot be transformed into a pass.

## Remaining limitations and one nonblocking test-race note

The revised report explicitly retains slow-stream overlap/backpressure stress as unexercised, alongside the full 90-second deadline, 20-minute expiry, disk-failure injection, request/concurrency exhaustion, abrupt-loss durability, and real application/browser/mobile checks. The broad source review does not substitute for any of those checks.

There is a possible false-negative timing edge in the existing negative tests: duplicate-name and invalid-argument assertions inspect accumulated stderr after observing `child.exit`, before the final cleanup's `close`/stdio-drain audit. If a runtime case fails because an expected EEXIST/argument diagnostic appears missing, but the preserved drained stderr contains it, root should check that harness assertion timing rather than immediately attributing it to the logger. This cannot convert a failing logger into a pass, so it is not a blocker to root's controlled validation. Waiting for the child's `close` before those diagnostic assertions would remove the ambiguity in a future harness revision.

Harness lifecycle meta-tests and simulation of unexpected child exit codes are explicitly not claimed to be performed by the candidate itself. The README requires a separately reviewed root-owned exercise rather than weakening the logger pin.

## Verification boundary

Performed by reviewer: source reads, hashes, textual diffs, and this report only. Not performed: candidate/application execution or import, syntax checks, tests, fixture/server launch, browser work, uploads, Git, or Codex tasks.

No application code or assets are changed. The Model Y hero, all nine targets, visual design, Next baseline behavior, and portable navigation remain outside the harness's mutation scope. Actual speculative-traffic savings and acceptable cold navigation remain to be established by root before deciding whether to apply the Discovery change.
