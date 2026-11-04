# Acceptance harness: independent static review

Reviewed on 2026-10-12 UTC. This report covers the initial frozen acceptance harness, not a runtime execution.

## Verdict

**Changes requested before execution.** The harness is appropriately restricted to synthetic loopback fixtures and the pinned logger, but its signal/watchdog cleanup can race with continued test execution, and its final success decision does not validate expected child exit codes. These can respectively leak owned child processes or report success after logger finalization failure.

No candidate or app code was executed, imported, syntax-checked, built, tested, launched, or uploaded by this reviewer. Only source reads, hashes, textual review, and this separate written report were performed. Root alone owns execution.

## Frozen reviewed inputs

Directory: `/workspace/scratch/586427eef9f2/roadmark-research/mobile-performance96-assessment/measurement-candidate/acceptance-candidate`

| File | SHA-256 |
| --- | --- |
| `run-acceptance.mjs` | `b7c8d3e2daeaa2932b3ab04e8be552dea6e789c6e39bce38c68a5d7f1e9a46ee` |
| `README.md` | `ab11599f897eda0b11d6fe5b83fec4a959860841daa29f13b1ca577a5dd5b459` |
| `MANIFEST.json` | `dd88e79138fbe102624416bf9031fd19ccf3872ba482b7f4fbd03469a4056a62` |
| `SHA256SUMS` | `af96bda348ca4778cacbafef56d7bc19ddbe03e337eac5880b07e422ee789892` |

The harness checks the revision-2 logger against `5181ad081108ffc6c236eca5086de5b262ad0e24b7173fe3f17ac35c27f37512` before every spawn. This correctly prevents accidentally executing changed logger content.

## H1. Stop test work before snapshotting cleanup; bound every owned resource

**Locations:** `test` lines 60–77, `listen`/probe handling lines 78–100, `launch` lines 176–200, `cleanup` lines 481–498, `finalize` and signal/watchdog handlers lines 500–544.

The signal and watchdog handlers invoke `finalize()` concurrently with `main()`. `cleanup()` snapshots the current child set, but there is no stopping latch or cancellation check in `main`, `test`, `launch`, or the network acquisition helpers.

A concrete static ordering is possible:

1. The harness is waiting on an ordinary request, such as the 30-second idle fixture
2. SIGTERM or the watchdog starts cleanup and snapshots the children
3. Cleanup terminates the main logger, causing that pending request to resolve/fail
4. `test()` catches the failure and returns, so `main()` advances and spawns the next protocol-test logger
5. That new child was not in the cleanup snapshot; the signal handler eventually calls `process.exit`, leaving it running until its own session limit

This is not a reproduced leak; it is an unguarded source-level lifecycle race. It violates the desired bounded, owned-process cleanup.

The temporary port probes introduce another cleanup gap: they are plain `net.createServer()` instances with no accepted-socket tracking. If a local client connects while a probe is open, `server.close()` may wait for that connection. The general watchdog cannot guarantee recovery, because `finalize()` clears it before awaiting cleanup, and the probes are not in the final cleanup registry.

**Requested fix:** synchronously latch stopping at the beginning of finalization; reject every future resource acquisition and test start; make cancellation escape the test catch-and-continue behavior; ensure in-flight main work cannot create resources after cleanup starts. Track all created servers/sockets/requests, including temporary probes. Destroy their owned sockets, stop listeners, and give cleanup its own independent finite bound. Do not solve this by signalling unrelated processes or probing a different machine.

Root should eventually test harness interruption during an ordinary request and near startup, verifying that no owned child/listener survives. The author must not execute those tests.

## H2. Audit expected child exits and complete evidence before declaring success

**Locations:** `handle.exited` lines 193–199, `stopChild` lines 209–217, cleanup/report status lines 481–532.

`stopChild` returns `bounded: true` for any already exited child. The final status only checks failed test cases and whether a forced kill was necessary; it does not reject unexpected exit codes or signals. The main logger is normally stopped only during final cleanup, after the last assertion.

Thus a main logger that exits `74` during its fsync/close finalization can be recorded in `ownedChildExits` while the overall harness still reports `passed_exercised_cases`. It can also miss a late failure diagnostic because `handle.exited` resolves on the child `exit` event, which need not mean the stdout/stderr pipes are closed and drained before evidence is copied.

**Requested fix:** assign expected exit code/signal behavior to each spawned child and audit it during finalization. Intentional invalid-argument/duplicate-log children may expect `1`, the owned occupied-port case may expect `70`, and successfully signalled ordinary logger children should expect the logger's deliberate `143` with no unexpected signal. Any unhandled, spawn, log/finalization, forced-kill, or other unexpected exit must prevent success. Await bounded child stdio closure before final evidence preservation/status calculation, while keeping the hard cleanup bound from H1.

A deliberately unexercised disk-failure injection does not excuse ignoring a disk/finalization failure that actually occurs during this run.

## Positive static findings

- Built-in-only imports; no application import or modification; no shell invocation, package install, browser action, debugger, or external destination
- Child execution is restricted to the SHA-256-pinned revision-2 logger using the current runtime's executable path
- Fixture binds `127.0.0.1:8766`; proxy ports are explicit and restricted to the allowed range
- Preflight probes refuse occupied proxy ports; fixture bind refuses an occupied 8766 without trying to identify or kill its owner
- Synthetic inputs are used for bodies, cookie/authorization/query/router-state and unexpected marker values
- Each child must emit its own readiness message before dependent requests begin, reducing risk from a port-bind race
- Cleanup uses child-process objects it created, not PID searches or broad process killing
- Unique run/log filenames and exclusive creation/copy preserve prior evidence; the pinned logger is never rewritten
- Plain/HEAD/chunked/gzip/304 byte tests compare actual synthetic buffers and logger body counts, rather than inferring transfer size from artifact lengths
- Privacy sentinels are checked in logger output; known Next marker values and unknown-value sanitization are covered
- Method/body/target/Host/header rejection cases assert that the fixture request count is unchanged
- Abort cases require non-success classifications and partial observed bytes, while the idle case really waits for the unchanged 30-second logger timeout
- Protocol clients deliberately keep their own write side open; the suite checks remote EOF and bounded owned-process exit rather than claiming a client-side half-open state proves server-handle state
- The final intended success label is narrowly `passed_exercised_cases`, and the README candidly retains 90-second deadline, 20-minute session, disk failure, limit-exhaustion, and real application/browser/mobile work as unexercised

## Coverage clarifications, not additional blockers

The initial suite does not fully discharge every item in the logger acceptance checklist:

- Two Promise.all GETs with immediate fixture responses test concurrent requests, but do not establish overlapping slow-stream behavior or meaningful downstream backpressure
- `recordFor(...).find(...)` establishes that a matching terminal record exists, not exactly one record per request
- `records()` silently removes a trailing non-newline fragment. This is useful for live reads, but final evidence validation should flag an incomplete final JSONL record instead of ignoring it
- The privacy check is a synthetic sentinel check, not a proof of arbitrary future sensitive-path anonymization
- CONNECT/Upgrade EOF plus graceful child shutdown exercises the motivating leak, but does not prove a 250 ms exact timer guarantee
- No test here substitutes for a real production Next smoke, baseline route-cache isolation, logger-port retention, actual prefetch traffic, or cold-navigation UI assessment

These can be added as assertions or explicitly retained for root's further checks. A corrected harness must not inflate its success label into full certification.

## Next gate

Preserve this initial harness and review. Have its author make a separate frozen revision for H1/H2, then re-review the diff. Root should syntax-check and execute only the reviewed bytes after the checkpoint baseline is durably saved and the required fixture port is free or occupied solely by a known root-owned process that root chooses to stop.

The revision-2 logger's source approval is unchanged. No change to the Model Y hero, design, application source, or prefetch behavior is authorized or implied by this harness review.
