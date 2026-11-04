# Static review: mobile measurement logger 96

Reviewed on 2026-10-12 UTC. This review is independent of the candidate author.

## Verdict

**Changes requested before the browser measurement.** The fixed-loopback proxy, privacy-minimized log, streaming byte contract, unchanged-baseline requirement, and manual observation plan are well scoped. Two issues should be resolved first: bounded teardown of rejected protocol sockets, and recognition of the installed Next version's additional finite prefetch markers.

This is a **source-only review**, not a runtime approval. I read and hashed source files, examined installed dependency source/type documentation, and wrote this separate report. I did not execute/import candidate or application code, syntax-check it, run fixtures/tests/builds, launch a server, use a browser, upload anything, use Git, or create a Codex task. Root must perform the acceptance tests and approve use.

## Frozen inputs

The author confirmed these as the frozen candidate pins. I independently obtained matching hashes after that confirmation:

| File | SHA-256 |
| --- | --- |
| `mobile-performance96-assessment/measurement-candidate/loopback-access-logger.mjs` | `1cc71ea356357ffe2907a4272cd247dbdac3055f746fdd94695270c0d38eba83` |
| `mobile-performance96-assessment/measurement-candidate/README.md` | `a09e807556831bf47b1de8c3fd9422ae167d210cc6e6ae4bffb876b899fca620` |
| `mobile-performance96-assessment/measurement-candidate/SHA256SUMS` | `235270ddfd19e93ca68ea07818a1c27223e7d9942f5040006599ffef56df47a3` |

The directory prefix for those files is `/workspace/scratch/586427eef9f2/roadmark-research/`.

Additional inspected evidence:

- `roadmark-restoration/browser92/native-preview-start.sh`: SHA-256 `1199ea8f01875ae9f5ad2d0b2ad306198eedb44f3a2591e2a84a38f9420f2669`
- `roadmark-work/roadmark/next.config.ts`: SHA-256 `7b0e056178429e9071cf71985fbc0b0cba7e32620075e213ed477b280d35f323`
- `roadmark-work/roadmark/src/components/discovery.tsx`: SHA-256 `c382047506d1881d4483e6478757dca41fc6d8011855e151027df027f689aa6f`
- `roadmark-work/roadmark/src/portable/link.tsx`: SHA-256 `0add93ac8b2209b4cba733f805d3bfb7f9252fd3d33bd0d9b3da65c95a8ecfe6`
- Installed Next `dist/client/components/segment-cache/cache.js`: SHA-256 `8f4226c929b6bd902f24c2b9eef25a6600efc50c37d2b19019d8c99d877c08dd`
- Installed Next `dist/client/components/router-reducer/fetch-server-response.js`: SHA-256 `24857f50a53fc1f8058a0af15b006b3586dc1c581c9feb04443f0f9d284621c5`

All application/runtime paths above are beneath `/workspace/scratch/586427eef9f2/`. No claim is made that the current source/build state is checkpoint 95; root must establish that baseline. The assessment explicitly distinguishes the inspected checkpoint 94 build from the unbuilt 95 data changes.

## Required changes

### R1. Bound and account for rejected CONNECT/Upgrade sockets

**Location:** logger lines 273–281 and 295–304.

The protocol handler writes its 405 response with `socket.end(...)`. That ends the local writable side; it does not guarantee destruction of a client socket that keeps its sending side open. These sockets are not added to the normal `active` set. After an HTTP upgrade/CONNECT event they also cannot safely be assumed to remain covered by HTTP `server.closeAllConnections()`.

Consequently the source does not establish its promised bounded shutdown for a synthetic or malformed protocol client that does not finish its side. The 20-minute timer initiates shutdown, but the same untracked socket can outlive it or keep `server.close(closeLog)` pending. This is a static lifecycle finding, not a reproduced hang.

**Requested fix:** track all accepted sockets and remove them on close; destroy every remaining tracked socket during shutdown. Also ensure each protocol rejection is destroyed after its tiny response is flushed, with a short destruction fallback if flush never completes. A protocol rejection must never become a tunnel. Root may choose an equivalent bounded implementation.

**Root verification:** use synthetic CONNECT and Upgrade clients that deliberately keep their writable side open after receiving the 405. Verify no fixture request arrives, rejection is logged once, socket closes, and a graceful signal exits and finalizes the log within a stated short bound. Include shutdown while a protocol rejection is still pending. Do not rely on an ordinary client that automatically closes to exercise this case.

### R2. Recognize additional known Next prefetch markers

**Location:** logger line 124; README classification guidance.

`next_router_prefetch` permits only `0` and `1`, replacing every other value with `other`. The installed Next package is version 16.3.8. Its `segment-cache/cache.js` has explicit prefetch strategies that emit:

- `2` for `FetchStrategy.PPRRuntime`, lines 1959–1962
- `3` for `FetchStrategy.RuntimeShell`, lines 1964–1967
- `1` for loading-boundary prefetch, lines 1969–1972, and ordinary tree/segment requests elsewhere

The current app config has no explicit Cache Components opt-in, and the inspected build says `cacheComponents: false`. This review does **not** assert that the baseline actually emits `2` or `3`. The logger nevertheless already knows its target Next version, so collapsing its finite recognized marker values is unnecessary and can weaken request classification if those paths are exercised. The installed scheduler also describes fully static routes as participating in parts of the segment-prefetch flow.

**Requested fix:** preserve the finite set `0`, `1`, `2`, `3` rather than arbitrary header text. Document `1`/`2`/`3` as explicit framework prefetch markers, `0` as not itself evidence of prefetch, and `other` as unresolved. Synthetic parity/privacy tests should include all four values plus an unknown sentinel.

**Interpretation guard:** even this finite expansion is not a universal detector. Next's explicit Full prefetch strategy omits this header, and the inspected `createFetch` does not independently add Purpose. Keep the no-click browsing phase and timestamp correlation. A request without a marker is not automatically a user navigation; `_rsc` alone is not proof of speculation. Current Discovery uses default prefetch, not explicit `prefetch={true}`, but the report should preserve this distinction rather than overstate the detector.

## Passing static findings

### Destination and method restrictions

- The bind address and upstream host are literal `127.0.0.1`; upstream port is literal `8766` and cannot be selected from CLI, target, Host, or forwarding headers
- CLI accepts only a fresh explicit 18000–18999 port and a restricted log filename
- Absolute-form targets, `//` targets, backslashes, fragments, controls, and oversized targets are rejected before any upstream request
- Only GET/HEAD with the exact expected loopback Host and no body framing are admitted
- CONNECT and Upgrade never open an upstream tunnel; their teardown needs R1
- Forwarded/X-Forwarded identity is stripped, and the upstream Host is fixed
- The explicit >128-field rejection avoids silently omitting routing headers; total parsed header bytes remain capped at 32 KiB

### Minimal private log

- Query values are not recorded. Only query-present and `_rsc`-key-present booleans are stored
- Cookies, authorization, router state, arbitrary request/response headers, and bodies are not written to JSONL or normal diagnostics
- Purpose values use a bounded allowlist grammar, known header metadata uses finite enums, pathname uses a bounded character sanitizer, and parser errors are not printed raw
- Log creation is exclusive `wx` at mode 0600, with a safe local filename; the existing log is never overwritten or appended
- A symlink `logs` directory is rejected; a newly created directory uses private mode
- Write failure stops the run and reports it incomplete; partial writes are handled

The pathname sanitizer is a character/length restriction, not anonymization of meaningful path segments. Keep this helper on the named local report and synthetic fixtures, as instructed. Do not claim it can safely log arbitrary credential-bearing paths. If `logs/` already exists, root should inspect ownership/permissions rather than assume `mkdir` changed them.

### Forwarding and byte meaning

- Incoming URL/query and end-to-end Next headers are forwarded unchanged apart from the documented fixed Host and removed forwarding/hop-by-hop fields
- Hop-by-hop headers and Connection-nominated fields are stripped in both directions
- Accept-Encoding, Content-Encoding, Content-Length where applicable, Vary, cache validators, status, and ordinary end-to-end headers are preserved
- The helper does not decompress or rewrite application content, does not cache responses, and never buffers a complete page deliberately
- The transform participates in stream backpressure and counts the bytes it observes after HTTP transfer framing has been removed
- These are content-encoded when the upstream uses gzip/br/etc. They are neither wire bytes nor proof of browser consumption; the README states this clearly
- HEAD and 304 can correctly record zero body bytes; repeated route requests must be summed as requests while unique destinations are counted separately

The final response `finish` event establishes handing the response to the local transport, not browser rendering. The README already avoids that false interpretation.

### Normal timeout, abort, and error lifecycle

- Accepted requests have a 90-second deadline, upstream idle timeout, finite request/concurrency/connection bounds, and a 20-minute session limit
- Downstream close before writable completion, upstream abort/error, request error, deadlines, and shutdown have explicit classifications
- The `finished` guards prevent normal event races from producing duplicate terminal records
- Upstream request, upstream response, and metering streams are destroyed on the ordinary failure/interruption paths
- Failure after headers retains a partial byte count and destroys the response rather than fabricating a complete successful body
- Logging failure and abrupt-exit limitations are disclosed

These are source-level findings only. All race/error paths still require root's synthetic checks.

## Recipe and design review

The recipe is appropriate for this restricted environment, subject to the acceptance gates and additions below:

1. It explicitly requires the unchanged production 95 baseline before applying a prefetch change. It does not confuse the existing raw checkpoint 94 artifact sums with actual response transfers
2. It correctly reads the original native startup route. That script starts two owned loopback servers under a 30-minute timeout, including an unrelated older static page. The recipe avoids blindly launching the old static preview and tells root to verify ownership/port availability
3. It launches the helper in the own-VM native terminal, because merely running a server in a different execution namespace does not establish browser reachability
4. It uses a fresh origin/port and tab for a route-cache-isolated attempt, while keeping ordinary browser UI and actual viewport/zoom recorded
5. It prohibits DevTools, debugger connections, unsupported network APIs, and policy workarounds. None are necessary for the proposed proxy logs plus supported DOM/UI inspection
6. The manual browse covers first-12 cards, search, Show 12 more, ranking, and exclusions without opening evidence/source sites. It treats duplicate anchors as distinct interaction sites, not duplicate unique routes
7. It distinguishes prefetch-only browse from actual navigation, cold/partly warmed/warm attempts, and completed/partial/error records. It explicitly allows a genuinely cold baseline attempt to remain unavailable
8. It calls UI readiness timing an observation bound that includes tool/polling overhead. Server durations are not described as click-to-paint, LCP, INP, or mobile-device performance
9. It requires preserved Model Y hero, all nine reason targets, art, exact-trim identity, navigation controls, history behavior, and portable navigation regression. The helper itself edits no application code or content
10. It defers shipping if the traffic reduction is absent, the measurement is unreliable, or the cold navigation tradeoff cannot be shown acceptable. Real phone and unsupported-WebGL checks remain open

### Small clarifications for root's run sheet

- Record the frozen app source/build ID, helper hash, runtime version, server start and remaining lifetime, port, viewport, zoom, phase start/end times, and exact repeated journey. After changing the helper, re-pin it and rerun affected acceptance tests
- A fresh port isolates an origin's route/HTTP cache; it does not reset the upstream Next process/cache or the operating system. Use comparable upstream warm-up and paired run conditions. Do not claim an absolute cold-server benchmark
- Keep the browser's address and navigated anchor origins on the logger port. The proxy correctly does not rewrite Location or content. If the app unexpectedly emits an absolute upstream-port/external redirect or asset URL, stop that run and treat capture as incomplete rather than silently counting the partial trace
- Prefer a supported clean browser session when available. A new port does not isolate host-scoped cookies; do not use authenticated browsing or real credentials for this measurement
- Phase analysis should assign requests by their start timestamps and include requests finishing after the phase boundary. A temporarily quiet terminal log is not proof of zero active requests, because records are written only on completion
- An unknown prefetch marker and an otherwise unclassified no-click detail request should remain visible in the totals/report, not be discarded from the evidence
- The 5,000 request counter bounds admitted upstream requests, not the number of rejected/protocol log lines. In this controlled short run that is not a blocker, but do not describe it as a hard bound on all logging. Any limit rejection invalidates the affected phase as an ordinary baseline

## Required root acceptance evidence

Keep the README's full checklist. In particular, record actual results for:

- Syntax check using the installed trusted runtime; valid GET/HEAD; plain, streaming chunked, compressed, 304, and concurrent response/header/body parity
- A sufficiently slow stream whose initial body is observable before completion, plus downstream backpressure
- Sentinel query/cookie/authorization/router-state forwarding to a synthetic fixture, with no sentinel in JSONL or stderr; all supported prefetch enums and an unknown sentinel
- Rejected methods, body framing, absolute/protocol-relative targets, wrong Host, header/target limits, Connection-nominated fields, CONNECT, and Upgrade; rejected requests must never reach the fixture
- Unavailable upstream, upstream truncation, downstream abort, idle/deadline timeout, logging failure, occupied port, duplicate filename, and graceful shutdown; terminal records classified correctly with no process hang or unhandled stream error
- R1's non-closing protocol clients during normal rejection and shutdown
- A real Next production smoke on the frozen baseline showing correct page content, required routing headers/encoding behavior, logger-port retention, and working log evidence before the manual measurement is accepted

Until root supplies those results, the status remains **static review only / not runtime validated**. This review does not authorize applying the prefetch candidate or claim any measured savings.
