# Loopback measurement candidate: root review required

Status: **STATIC, UNEXECUTED CANDIDATE**. The author has not imported, executed, syntax-checked, tested or launched this file. No app source was changed. Root must independently inspect, validate and approve this helper before running it, after checkpoint 95 QA and durable save.

## What it does

`loopback-access-logger.mjs` uses only Node built-ins. It binds `127.0.0.1` on an explicit port in 18000–18999 and forwards admitted GET/HEAD requests to the fixed `127.0.0.1:8766` production server. Neither upstream host nor port is configurable. Non-origin-form, protocol-relative, backslash, fragment, control-character and oversized targets are rejected. CONNECT, Upgrade, non-GET/HEAD methods, request bodies and unexpected Host values are rejected. No tunnel or external destination is supported.

There is no application import, build, data write, install, browser instrumentation, proxy-system setting, security setting, header-cache workaround or app-code edit. Request query values and Next routing/prefetch headers are forwarded as required for correct routing, without logging their contents except the bounded prefetch-purpose fields below. Incoming forwarding-identity headers are stripped. The upstream Host is fixed to `127.0.0.1:8766`.

Hop-by-hop headers, including names listed in Connection, are stripped in both directions. Content bodies and content encoding are not changed. A backpressured stream counts body chunks with a 64 KiB transform high-water mark; no full response is buffered. Finite header, target, concurrency, connection, request-count and time bounds are enforced. A maximum 20-minute session stays inside the existing native preview's 30-minute lifetime. An upstream connection is created for each request, so this helper adds local overhead and is unsuitable for precise latency benchmarking.

## Log contract and limitations

The `--log-name` argument must be a safe unique filename ending `.jsonl`. Output stays in this candidate's `logs/` directory. Directory creation is private-mode and log creation is exclusive (`wx`, mode 0600); an existing name is never overwritten or appended. A symlink `logs/` directory is rejected. Use a fresh filename for every run.

Each admitted or normally rejected request produces one JSON line with only:

- Method and bounded sanitized pathname, with no query string or full URL
- Query-presence and `_rsc`-key-presence booleans, never query values
- Start/end ISO timestamps, monotonic elapsed milliseconds, HTTP response status when available
- Response-body byte count, completion/failure/interruption classification
- Bounded purpose, sec-purpose and Next-Router-Prefetch values; unexpected values become `other`
- Enumerated content-encoding and Next cache-status metadata, never arbitrary header values

Never log cookies, authorization, raw URL/query tokens, router-state headers, request/response bodies or raw parser errors. Diagnostic stderr contains only fixed notices and known local run metadata. The logger must not be used with real credentials or third-party browsing.

`response_body_bytes` counts bytes observed in the upstream HTTP response stream while forwarding: transfer framing is already removed, but gzip/br/etc. content encoding is retained. These are **dechunked response-body bytes**, not header, TCP or TLS wire bytes, uncompressed resource sizes, or proof that the browser consumed every byte. Backpressure can leave bounded bytes buffered when a request is aborted. Preserve `content_encoding` when comparing totals. A `304` or `HEAD` body can legitimately be zero.

Only `completion: finished` is an ordinary completed response. Other classes must be reported separately rather than silently discarded or counted as successful full downloads. Status 200 alone is insufficient. Graceful interruption marks active requests `interrupted`; a crash, SIGKILL, abrupt native-executor loss or power loss can prevent final records. Parser-level malformed requests are rejected before normal logging and produce a fixed stderr warning. Log write/finalization failure makes the run incomplete. Empty or unexpectedly short logs never prove zero network activity. This is application-layer observation of a controlled own-VM run, not phone or public-deployment performance.

## Root acceptance checklist before use

1. Read the complete source. Confirm that the upstream is fixed, the bind is loopback-only, no application modules are imported, and logs cannot expose raw target/header contents. Independently run the installed trusted Node runtime's syntax check against this helper. Do not treat this README as evidence of a pass.
2. Use a root-owned synthetic local fixture on `127.0.0.1:8766` only while that port is free. Never displace or kill an unidentified process. Test the helper before pairing it with Next. Stop fixtures afterward.
3. Check valid GET and HEAD; plain, chunked and compressed responses; a 304; two concurrent streams; and byte/header/body parity. Confirm that the logged body count equals the synthetic compressed/dechunked bytes in the relevant cases, not raw HTTP framing bytes. Observe streaming before the fixture response completes rather than only testing short responses.
4. Send synthetic sentinel query, cookie, authorization and Next router-state values. Confirm that the fixture receives the required unmodified routing data, and that **none** of those sentinels occur in JSONL or captured stderr. Check bounded known purpose metadata, `_rsc` presence and cache/encoding metadata separately.
5. Test POST/body rejection, absolute-form and protocol-relative targets, CONNECT, Upgrade, wrong Host, long request target, excess headers and hop-by-hop-header stripping. Assert that rejected requests do not reach the fixture. Use synthetic values, never credentials.
6. Test unavailable upstream, upstream mid-body abort, downstream abort, idle/deadline timeout and a graceful signal. Check one correctly classified record per observed normal request and no unhandled stream errors or hanging process. Count incomplete streams separately.
7. Verify duplicate log filename refusal, invalid port/name refusal and occupied-listener behavior. Do not overwrite previous evidence. Test the logger's failure paths using an isolated root-owned fixture setup; never change system permissions or security settings.
8. Review results and fix any failures before a browser run. The code is intentionally not certified by its static author.

## Native own-VM launch constraints

Read the existing `roadmark-restoration/browser92/native-preview-start.sh` before launching. It established that the browser-visible server must run in the **own VM's native terminal**, not merely the default execution-server namespace. The trusted copied Node runtime is:

`/workspace/scratch/586427eef9f2/roadmark-restoration/browser92/node-runtime`

The existing script launches Next on 8766 from the application directory, plus an unrelated static preview on 8765, both with a 30-minute timeout. Do not launch it blindly: its static page is an old checkpoint. Reuse an already verified current production server, or have root launch only its newly built checkpoint 95 Next server using the existing native-terminal route. Do not start a second server on an occupied port. The minimal production command, after root validation/save and ownership checks, is:

    cd /workspace/scratch/586427eef9f2/roadmark-work/roadmark
    timeout 1800 /workspace/scratch/586427eef9f2/roadmark-restoration/browser92/node-runtime node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 8766

Keep that terminal alive, or use root's already established owned-process lifecycle. A future successful start must be verified; these static instructions do not establish that any server is running.

After acceptance checks, a separate own-VM native terminal can launch the baseline logger:

    /workspace/scratch/586427eef9f2/roadmark-restoration/browser92/node-runtime /workspace/scratch/586427eef9f2/roadmark-research/mobile-performance96-assessment/measurement-candidate/loopback-access-logger.mjs --port 18795 --log-name baseline95-18795.jsonl

For later paired repetitions use new, unused ports in the allowed range and new log names. A future candidate could use port 18796 with `candidate96-18796.jsonl`, after root has separately decided to implement it and rebuilt/verified Next. Fresh origins avoid clearing browser data and separate client route caches. Do not reuse an origin and call it a cold run without evidence.

## Baseline browser journey, before any prefetch change

Use only the existing own-VM browser native UI, supported DOM-read-only inspection and development-error logs. **No DevTools, debugger connection, unsupported browser network API or organization-policy workaround.** Keep the same ordinary browser window/zoom and record the actual viewport. These are narrow desktop checks, not phone emulation.

The existing built artifact verifies these route paths. At run time inspect the actual displayed anchor before activation rather than inventing a selector or destination:

- Baseline discovery: `http://127.0.0.1:18795/discover`
- Baseline homepage: `http://127.0.0.1:18795/`
- First card detail path: `/cars/tesla-model-y/premium-long-range-awd-1`
- Another verified detail path: `/cars/geely-ex5/inspire-extended-range-2`

For each run, use a fresh unused origin/port and a new tab. Confirm the production server and logger are reachable, the correct checkpoint is served, and startup/log errors are absent. `next dev`, a portable file, and `preview:review` do not exercise this Next prefetch behavior.

1. Open `/discover`. Wait for cards to be usable and server request activity to settle. Record current heading, first visible card and viewport; do not click detail links yet.
2. Scroll a repeatable sequence of all first 12 cards, pausing on the same card positions. Record which card heading/evidence links are visible. Do not assume 24 duplicate anchors mean 24 unique routes.
3. Search `Geely EX5`, inspect the exact displayed trims, use Show 12 more after clearing if available, then switch to attribute mode and expand exclusions. Log each phase's wall-clock bounds without injecting code into the page. No source website or external link needs opening.
4. Repeat the relevant homepage-to-discovery scroll on its own fresh origin if first-load isolation is needed. Verify the original Model Y hero and nine links before scrolling. Group market/source/footer prefetch separately from exact-detail requests.
5. Parse the local access log as data. Group by sanitized pathname and completion state; identify prefetch using the bounded purpose/Next-Router-Prefetch fields, with `_rsc` presence as supporting context only. A `_rsc` query alone does not prove prefetch. Count actual requested detail routes and completed/aborted body bytes, plus separately reported shared JS. Do not replace these observations with the 2.74 MB build-artifact sum. Empty results without working logger/server evidence are inconclusive.

## Cold-tap tradeoff and future paired comparison

On fresh origins, record a card's exact heading/evidence link, activate it promptly when usable, and inspect the exact detail heading and usable evidence controls. Correlate root's native action/observation timestamps with request-log intervals. Verify in the log whether a detail prefetch had already started or completed before activation. Classify partially warmed/warm attempts honestly; do not call them cold or suppress baseline prefetch to manufacture a result. Repeat after intentionally allowing the same card to warm.

With only native UI and read-only DOM observations, the time from activation to the first verified ready state is an **observation bound** containing tool/polling overhead. Server elapsed time measures request handling/streaming, not click-to-paint or readiness. Record visible waiting and repeated-click risk rather than claiming precise LCP/INP or phone latency. If the tools cannot establish acceptable cold-click behavior, keep the tradeoff unresolved and do not ship solely because speculative bytes fall.

Only after actual baseline prefetch evidence justifies the experiment may root apply the two-file change in the main assessment. After root's tests/build/save checks, repeat the same journeys using another fresh port/origin and log. Expected result: those four Discovery link sites produce no unclicked exact-detail prefetch; deliberate activation still fetches and renders the selected exact trim. Confirm the first cold click remains acceptable, including repeated activation, keyboard/modified activation, Back/Forward and comparison-return state. Preserve every hero jump and art behavior. The portable adapter also needs its own navigation regression because portable uses no Next prefetch.

Retain both logs and their run conditions, and report completed/partial/error classes separately. Stop the bounded logger/server processes that root owns after measurement. Revert or defer the candidate if savings are not observed, the logger is unreliable, or cold navigation becomes confusing. Real iPhone/Safari, Android/Chrome and WebGL2-unsupported checks remain open.
