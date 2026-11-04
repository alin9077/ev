# Static acceptance harness candidate, revision 2

**Unexecuted and not syntax-checked. No test has passed or failed yet.** Root must obtain independent source review, inspect the files, then run all actual checks after checkpoint 95 is durably saved. This harness does not change the logger or application.

This separate revision preserves the initially reviewed harness unchanged. It fixes the review's lifecycle and false-success blockers: finalization first closes a synchronous stopping gate used by tests and every resource-acquisition path; pending listener acquisitions and all accepted sockets are tracked; cleanup has an independent eight-second bound; children are awaited through `close` so stdio is drained; expected exit codes and strict final evidence are audited before success. See `REVISION.json` for initial/revised pins. Independent re-review is required.

## Inputs and boundaries

- Only Node built-ins are imported
- The only executable child is the exact revision-2 logger, launched with the same trusted Node runtime running this harness
- The logger SHA256 must equal `5181ad081108ffc6c236eca5086de5b262ad0e24b7173fe3f17ac35c27f37512` before every child launch; changed content is refused
- The fixture binds only `127.0.0.1:8766`; proxy children use six specified ports in 18000–18999
- All fixture text, cookies, authorization headers, router state and query values are synthetic. No app import, browser access, external request, package installation or system configuration change occurs
- Only child process objects, servers and sockets created by this harness are cleaned up. It never looks up, kills or displaces an unknown process

The harness first probes and releases its six selected proxy ports, then attempts its own fixture bind on 8766. Probe servers immediately destroy any accepted socket and retain it in the owned-socket set until close, so an unrelated half-open client cannot silently hold probe cleanup. An occupied/unavailable port is an incomplete blocked run, not permission to stop its owner. It does not inspect who owns the port. A bind race is possible after probes are released; a child must emit its own expected ready message before requests begin. Failure to become ready stops the dependent run. Root must stop its own known Next process separately before executing this fixture suite; do not point the fixture tests at a real application server.

## Root execution, only after review and checkpoint save

Use the existing trusted runtime from the own-VM native terminal or root's approved execution path. No desktop browser, DevTools or debugger is involved in this harness. A suggested root-run command is:

    /workspace/scratch/586427eef9f2/roadmark-restoration/browser92/node-runtime /workspace/scratch/586427eef9f2/roadmark-research/mobile-performance96-assessment/measurement-candidate/acceptance-candidate/revision-2/run-acceptance.mjs --port-base 18840

This uses 8766 and proxy ports 18840–18845. A different explicit base in 18000–18995 is supported. Root should independently syntax-check the harness and pinned logger before execution. The author has done neither.

Expected normal duration is about 35–60 seconds because one real 30-second upstream idle timeout is included. There is a three-minute harness watchdog. Broad scheduling bounds are used for the timeout and subprocess teardown. Unexpected platform scheduling can produce a genuine failed case; inspect the evidence instead of changing a failure to a pass.

## Cases actually asserted when root runs it

1. GET exact bytes and logged body count; HEAD zero body with representation Content-Length
2. Chunked response arrives before fixture completion and preserves the full body; gzip remains compressed and its encoded body count, encoding and known Next cache status agree; 304 remains bodyless
3. Concurrent independent GET responses remain correct
4. Next-Router-Prefetch absent/0/1/2/3 and an unexpected synthetic value are forwarded correctly and logged as their finite values/null/other; private synthetic query/cookie/authorization/router-state values reach the fixture without appearing in logger JSONL/stdout/stderr
5. Connection-nominated hop headers are stripped in both directions while an end-to-end response header remains
6. POST, GET-with-body, absolute/protocol-relative target, wrong Host, oversized target and excess field count are refused without fixture requests; a header beyond the byte limit is refused with only the fixed parser diagnostic
7. Upstream partial-body abort and downstream intentional abort are separately classified and not treated as successful full transfers
8. One real upstream idle timeout produces the logger's classified 504 after roughly 30 seconds
9. CONNECT and Upgrade clients deliberately leave their own write side open after rejection; remote EOF and bounded proxy shutdown are checked without requiring client TCP close as proof of server handle closure
10. Separate CONNECT/Upgrade cases signal the proxy promptly after receiving rejection, without waiting for remote EOF or ending the client's write side; the owned process must exit without SIGKILL
11. A signal during an ordinary active request must produce `interrupted` and a bounded owned-process exit
12. Duplicate log name preserves the original bytes; invalid arguments refuse before listening; an intentionally occupied **owned** listener remains intact; unavailable fixed upstream yields a classified 502
13. Logger pin and sentinel non-disclosure are checked again at the end. After shutdown and drained child output, the harness audits exact expected exit codes/signals, complete newline-terminated parseable JSONL and one log record per expected request by method/path/count. The intentionally parser-rejected oversized-header case is the sole request with no expected structured record

These are executable assertions in an unexecuted candidate, **not verified coverage**. Assertions are grouped into named cases, so reported case counts do not pretend to count each individual assert call.

## Explicitly not exercised

The final report lists these under `notExercised` even if all executed cases pass:

- The 90-second total deadline and 20-minute session expiry
- Log write, fsync, disk-full and abrupt SIGKILL/power-loss durability failures
- Exhaustion of concurrency and 5,000-admitted-request limits
- Overlapping slow-stream/backpressure stress; two concurrent fast GETs do not establish that behavior
- Exact rejection-timer scheduling under a stalled event loop; the protocol checks establish bounded observed teardown with generous deadlines
- Real Next behavior, browser request volume, cold-click experience, phone performance and WebGL2 behavior

An overall success is labelled `passed_exercised_cases`, never complete certification. A failed assertion or final evidence/exit audit remains a failure; blocked startup, interruption, watchdog expiry or unestablished cleanup is incomplete. Normal success exits 0; failed/incomplete runs exit nonzero. Unexpected fixture/logger failures are not silently skipped. In particular, logger exit 74 from log finalization cannot pass merely because the process already exited: normal children must exit 143 after the harness's SIGTERM, while explicit negative cases have their own exact expected codes (1 or 70). Their stdout/stderr must be drained before the final audit.

## Evidence and cleanup

Every run creates a fresh private `acceptance-candidate/revision-2/runs/<timestamp-random>/` directory containing:

- `run.json`, written before network work, identifying the intended run and pinned logger
- `assertions.jsonl`, append-only executed case outcomes
- Each owned child's captured stdout/stderr and a copied logger JSONL when one was created
- `report.json` with actual executed cases, failures, incomplete status, child exits, cleanup/evidence audit issues and unexercised cases

The logger's original fresh files remain in `revision-2/logs/`; copying them into the run directory does not remove or overwrite them. Duplicate-name and invalid-argument tests intentionally create no new logger file. Their child diagnostics are still retained. Occupied-port refusal can leave an empty fresh logger file; an empty file is not a zero-traffic success claim.

Cleanup signals only this harness's spawned children, destroys only its own HTTP/raw-client/fixture/probe sockets, and closes only its own fixture/probe servers. The stopping gate is set before resource snapshots, so an interrupted test cannot resume and launch later children. Pending listener acquisitions are checked again on completion and closed if shutdown has begun. Cleanup has its own eight-second deadline after the main watchdog is cleared; expiration forces closure of the remaining owned resources and produces an incomplete report. An owned child that misses the graceful deadline may be SIGKILLed to avoid a leaked fixture; the relevant case or exit audit must then record failure. No unknown process is ever signalled. A catastrophic kill of the harness can still prevent final output/cleanup; `run.json` without a final report must be treated as incomplete.

Before accepting this harness revision for fixture use, root should additionally exercise its own lifecycle using synthetic conditions: signal it during its idle-timeout case and listener acquisition, keep a connection open to an owned probe, and verify there are no later child launches or held owned ports. Simulate an unexpected owned-child exit (including code 74) using a separately reviewed root-owned stub only in a separate harness validation exercise, never by weakening the production logger pin in this candidate. These meta-tests are not performed by the candidate itself and are not claimed passed.

Body counts are dechunked HTTP response-body bytes, possibly still gzip-encoded. They are not TCP/TLS wire bytes or browser-consumption evidence. Timing here is only acceptance timeout/teardown observation on the own VM. Passing this fixture suite does not demonstrate that suppressing Discovery prefetch is beneficial or acceptable; root still needs the production baseline and cold-tap comparison described in the main assessment.
