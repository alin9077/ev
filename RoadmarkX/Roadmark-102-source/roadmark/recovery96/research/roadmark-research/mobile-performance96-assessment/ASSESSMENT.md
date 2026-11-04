# Mobile performance 96: static assessment

## Decision

The best bounded, design-preserving **next experiment** supported by this inspection is to disable speculative exact-trim prefetch only for Discovery's catalogue links. **Do not apply it before root measures the existing production behavior and cold-click tradeoff.** This worker changed no application files and ran no application imports, builds, tests, benchmarks, servers or browser work.

This targets mobile catalogue browsing's potentially unused requests and client route-cache work. It does **not** reduce the homepage's own initial HTML, guarantee a better LCP/INP, or make the standalone portable file smaller. It is a low-risk experiment, not an established performance win or an absolute ranking of unmeasured bottlenecks.

## Baseline and existing work

The inspected `.next` and portable files are verified checkpoint 94 artifacts, Build ID `bRi5VFzp553AQovWPUkLQ`. Source includes checkpoint 95's unbuilt data patch. Do not attribute these artifact bytes to a checkpoint 95 build or compare a future 96 build only with 94: first capture a clean 95 baseline to avoid attributing the data change to the performance change.

Read `AGENTS.md`, the installed Next 16.3.8 Link/prefetch guides, `docs/HOMEPAGE_PAYLOAD_REFINEMENT_2026-10-10.md`, `docs/performance-payload-audit.md`, `docs/PERFORMANCE_REFINEMENT_2026-10-10.md`, and relevant source/tests. Already implemented, so not new recommendations:

- Homepage only transports 34 curated illustrated-fleet packs; Discovery retains the complete projected catalogue and ranking evidence
- Canonical source-object identity, page-scoped source registries and reduced picker/detail client props
- Indexed data lookups and footnote source lookup
- Discovery first 12 card rendering; all-catalogue search/ranking remains available
- Explicit per-chapter dynamic scene imports, bounded approach loading, offscreen/hidden-tab suspension, reduced-motion control, DPR cap and adaptive drawing
- Portable source-ID storage and lossless string-table encoding

Keep the Model Y headline, all nine reason targets, original art and full evidence/availability/ranking guards intact.

## Actual production artifacts

All sizes below are **uncompressed local file bytes**, not observed HTTP transfer sizes. The initial HTML already embeds Flight/RSC scripts: **do not add its separate `.rsc` file again as an initial download**. `compress: true` is present in the built Next configuration, but actual negotiated encoding and transfer require observation.

| Route | HTML | Separate RSC artifact | First-load modern JS from build manifest |
|---|---:|---:|---:|
| `/` | 8,851,660 | 7,568,168 | 612,964 |
| `/discover` | 5,590,018 | 5,206,003 | 513,933 |
| `/model-y` | 1,870,381 | 1,738,380 | 518,517 |
| `/market` | 100,985 | 5,988 | 1,790,985 |
| `/cars/[family]/[variant]` | Varies | Varies | 538,474 |

Homepage script markup occupies 8,089,057 bytes of HTML, so data/Flight remains dominant. Both homepage and discovery HTML have zero `img`/`source` elements; their illustrations are inline SVG/canvas. The production CSS is `/_next/static/chunks/2-881m2ilv-f8.css`, 87,968 bytes. No external font is configured; CSS uses system font fallbacks. Compressing/removing illustration files is not supported as the next initial-route improvement.

Homepage's actual initial modern JS files are recorded in `static-evidence.json`. They total 612,964 bytes:

- Shared runtime/framework/shell: `450hzk4n7oh8k.js`, `19ti1d4u-es00.js`, `06_p4bgmxhtl-.js`, `turbopack-0s154bl-omkva.js`, `1h83g7b399ef3.js`, `2r6bdqfsppjan.js`, `0iner2fvyfs3r.js`
- Home/client component chunks: `28orzf1nxfy18.js` 16,876; `16iq1n5p86yqm.js` 33,721; `3__2lcf0_3oke.js` 37,505; `38wy0khj_5fd-.js` 44,650 bytes
- The HTML also references `0cz1d0mv5g_q7.js`112,594 bytes with `nomodule`; do not count it as normal modern-browser JS
- Exact-detail adds the 20,757-byte `29w96jknr_qc9.js` chunk to assets already shared with home; one must not multiply all 538,474 route JS bytes by the number of prefetched detail routes
- `/market` separately includes 1,305,931-byte `1yd_4rr99pb87.js`; source statically imports its inventory into the client. It is not in homepage's initial JS list. Discovery/footer links can make later market prefetch relevant, but it is outside this narrowly selected experiment

The standalone `index.html` is 36,889,206 bytes: 36,170,243 encoded JSON bytes and 604,828 executable-JS bytes, plus CSS/markup. This is a self-contained offline application containing all packs, evidence, routes and art. Opening `/` on Next does not load this file. A portable-only server also does not demonstrate Next's speculative route fetching. The selected change gives the portable build no network-saving benefit.

## Evidence for the single candidate

`src/components/discovery.tsx` has four exact-trim Link render sites, all with default prefetch:

1. Vehicle-card model heading, current line 353
2. Vehicle-card “Exact trim & evidence” link, line 459
3. Attribute-ranking vehicle link, line 559
4. Expanded exclusion-list vehicle link, line 613

Both `/` and `/discover` use this component. The static detail route uses `generateStaticParams()` and `dynamicParams = false`; no partial-prefetch option or loading boundary changes the default. Installed Next docs say production auto-prefetch fetches full static routes; the installed Link observer uses a 200 px root margin. `prefetch={false}` suppresses viewport, hover and touch-triggered prefetch while retaining client navigation on actual activation.

Built initial Discovery cards contain 24 anchors to 12 distinct exact-trim destinations. The destinations total 2,740,388 bytes of raw `.rsc` artifacts, from 192,222 to 276,950 bytes each; their detail HTML totals 4,751,983 bytes. Duplicate links to one route must not be counted twice. The largest exact-detail RSC anywhere in the 343-route built catalogue is 1,985,884 bytes; corresponding HTML can exceed 2 MB. All first 12 routes and byte counts are in `static-evidence.json`.

**Inference, not an observed request trace:** as a reader scrolls the cards, ranking rows or expanded exclusions near the viewport, Next can fetch these detail payloads before any detail click. It schedules and caches work; not all cards are initially visible, duplicate destinations share cache and scrolled-off work may be discarded. Do not call 2.74 MB a measured initial burst or guaranteed saving. On the homepage the original hero comes before Discovery, so this chiefly targets scrolling/catalogue exploration rather than top-of-page LCP.

## Exact proposed scope and risks

Only after baseline measurement justifies it:

- `src/components/discovery.tsx`: add `prefetch={false}` to the four exact-trim Link sites above. Retain normal Next Link, href, DOM text, click behavior and every other link
- `src/portable/link.tsx`: accept and consume the optional Next `prefetch` prop instead of spreading it onto native `<a>`. The portable build aliases `next/link` to this component; otherwise a Next-only prop can cause DOM warnings. Do not alter its modifier-click, hash/page or history behavior
- Add focused regression coverage and production-browser request checks; update the assessment with actual results. No data/schema/style/art edits are needed

Reversible by removing four props and the adapter compatibility support. Main tradeoff: the first actual exact-trim click may wait for a network response and component loading previously warmed during browsing. That can matter on slow mobile connections; no artificial mobile breakpoint or hover-only strategy should be introduced in this experiment. Preserve navigation pending behavior and check rapid/repeated actions, Back/Forward and exact-trim identity. A build/markup pass alone cannot validate this tradeoff.

## Root measurement plan with supported tools

DevTools was previously blocked by the organization. Do not open it again, bypass it, use a debug-protocol route, or invent a browser network API. Root can use its existing own-VM browser native UI, DOM-read-only inspection and server logs.

1. **Freeze the right baseline.** Complete root's 95 validation/build and preserve its route manifest/HTML sizes. Start ordinary Next production on the own VM; do not use `next dev` or the portable report-preview server. Keep application behavior unchanged.
2. **Observe actual requests outside the browser.** Root may configure a temporary access-logging proxy using the already installed trusted Node runtime. Bind only to `127.0.0.1`; accept GET/HEAD only and reject other methods; forward only to one fixed own-VM Next server at `127.0.0.1:<verified-port>`. Never select an upstream from a client URL or header. Stream request/response forwarding without response caching, whole-body buffering, content rewriting, disabling compression or app-code changes. Preserve required routing and encoding behavior and clean up upstream/downstream streams on abort. Logs must contain only method, pathname without query, status, monotonic start/finish timing, response-body byte count, and `purpose`, `sec-purpose`, `next-router-prefetch` values. Never log cookies, authorization, full router-state headers, query tokens or request bodies. Count completed and aborted responses separately. The byte count is the dechunked response-body bytes passing through the proxy (possibly still content-encoded), **not TLS/wire bytes or proof of bytes consumed by the browser**. It is useful for actual requested workload, not a synthetic sum of build assets. Ignore the logger's overhead in timing claims; preserve a short lifetime and stop both proxy/server after the bounded run.
3. **Controlled browse, existing behavior.** Use a fresh browser context if the current supported UI provides it; otherwise a fresh loopback origin/port and new tab avoids previous route caches without clearing user data. Record actual viewport and zoom. Load `/discover`, pause until hydration and request activity settle, then scroll a repeatable set of the first 12 cards without opening details. Do the same for homepage-to-discovery, attribute rows, and expanded exclusions. Server logs establish whether exact-detail prefetch occurs, which unique routes are fetched and what actual response bytes were sent. Check for background market/source requests but keep them separate. Stop/revise the experiment if the proposed route traffic does not occur.
4. **Baseline cold and warm clicks.** On a fresh origin/tab, search one observed trim, activate its exact-detail link immediately after the card is usable, and verify the exact heading and evidence links through DOM/UI. Use request logs to verify whether any exact-detail prefetch began or completed before activation; if it did, classify that attempt as partially warmed/warm, not cold. Do not create a fake cold baseline by suppressing prefetch or altering server responses. Repeat after allowing the same link to prefetch fully, and record unavailable genuinely cold baseline samples honestly. Correlate native action/screenshot timestamps with access-log request and completion times. With only screenshot/DOM observation, report the bounded interval from click to first verified ready state and its polling/tool overhead; do not present it as precise click-to-paint, LCP or INP. In particular, server response time alone is not tap latency. Record obvious unresponsive-looking waits or repeated-click risk.
5. **Only then implement the two-file candidate.** Root runs focused tests, typecheck, lint, full required tests/builds and portable generation. Repeat steps 2–4 against a fresh origin with the same viewport, navigation sequence and server conditions. Use multiple paired repetitions. Expected invariant: no unclicked exact-detail prefetch for those four sites, while one requested trim still loads correctly; transfer savings and cold-click delay are measured rather than inferred. Keep rendering/hero comparisons and pending navigation review alongside byte counts.
6. **Regression and stopping condition.** Verify card heading and evidence link, rankings, exclusions, show-more/search, comparison selection and return state, keyboard activation, modified/new-tab activation, Back/Forward, repeated clicks, mobile-width no-overflow and portable navigation. All nine hero jumps and canvas scenes remain unchanged. Ship only if actual speculative traffic is removed and the cold navigation experience is acceptable; otherwise revert the small candidate. No measurements from this worker replace real iPhone/Safari or Android/Chrome journeys. WebGL2-unsupported behavior remains an open, separate release check.

The proxy/access-log observation proves request volume only for the controlled own-VM run. It is not phone lab performance, a deployment trace, or proof that real devices have sufficient memory/frame rate.
