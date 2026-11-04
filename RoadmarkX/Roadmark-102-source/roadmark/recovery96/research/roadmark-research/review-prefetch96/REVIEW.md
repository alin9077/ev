# Discovery prefetch 96: independent static review

## Decision

**Approved for root-controlled application and runtime validation, with no static blocker found.** This approval applies only to frozen candidate `MANIFEST.json` SHA-256 `da83cad37b6b727cd00ea9ebceab5404e7c8a8f8e999f4134dc15c31970856e6`. It is not a test/build pass, shipping approval, or a claim of performance improvement. Any changed candidate bytes require a new freeze and review.

Only static source/document/JSON reads, byte comparison, hashes, and files in this review directory were used. No application or candidate import, parsing as program code, syntax check, test/build, server/browser action, Git/Codex action, upload, or application edit was performed.

## Verified pins and scope

Candidate directory: `../discovery-prefetch96-candidate/`. All 22 file/observation pins listed by its manifest verify. The two live application originals match their before copies, and the new test remains absent from the application. Independently checked 443 saved95 source/data/test/script/config input pins against `../applied95/qa-attempt1/frozen-inputs.json`; none drifted.

Approved after files:

- `src/components/discovery.tsx`: `02be90e98919418e433a853ae6019adfdb833b1a0e86a7d9d2d3564da9afecb8`, 26,356 bytes
- `src/portable/link.tsx`: `31140de06908d3d089d6a0ae025e6cb37864334d4d2e642d7c39e029c506963b`, 780 bytes
- `tests/discovery-prefetch.test.ts`: `c69a17a954b2c9d1372c3047abf46e89a7b0ab1a9dea68665cf34811cb3bb12c`, 7,459 bytes

Required before pins:

- Discovery: `c382047506d1881d4483e6478757dca41fc6d8011855e151027df027f689aa6f`
- Portable Link: `0add93ac8b2209b4cba733f805d3bfb7f9252fd3d33bd0d9b3da65c95a8ecfe6`
- Added regression test: must not exist before application

The after-tree inventory contains exactly these three files. Detailed evidence is in `verified-pins.json`.

## Implementation findings

1. Candidate Discovery lines 353, 461, 563 and 617 set `prefetch={false}` on respectively the vehicle heading, exact-trim/evidence action, attribute ranking entry and excluded-record entry. They retain the same Next Link, route helper and href expressions. Removing just these four props and reversing two JSX line wraps reconstructs the complete original file byte for byte. No source data, ranking/eligibility/freshness calculation, state effect, callback, label, class/style, art or hero logic is changed. The JSX wraps add no intended visible whitespace.
2. Comparison, illustrated-comparison, market and source Link sites retain their original policy. There is no global prefetch switch, new breakpoint or hover-only policy.
3. The portable adapter consumes the new prop by destructuring and `void prefetch`. Consequently it cannot enter the existing anchor spread for any accepted value. Its entire returned anchor and click-handler block remains byte-identical, including href resolution, caller-first ordering, cancellation, modifier/non-primary/external checks and `navigate(href)` delegation. Navigation/history implementation and its build alias are unchanged.
4. Compatibility was checked against installed Next 16.3.8 App Router Link docs, implementation and declaration, the public `next/link` declaration, installed React types, TypeScript declarations, `tsconfig.json`, and the existing compiled-source helper. Both public and App Router Link types support `boolean | "auto" | null`; the portable optional prop matches. App Link consumes prefetch before anchor `restProps`, sets `prefetchEnabled` false, gates visibility/hover/touch prefetch, and retains actual activation handling. Its navigation `prefetchIntent` changes to `none` as intended. Ordinary and modified navigation code is not replaced.
5. This is bounded prefetch compatibility, not proof that the portable shim implements the complete Next Link API. Existing portable handling does not explicitly guard a plain primary click by `target` or `download`; that behavior is inherited and none of these four Discovery sites sets those props. The added target assertion establishes attribute pass-through only. Browser-native modified/new-tab behavior still needs root coverage.

## Regression tests and inventory

The added source declares six tests. Manual review found no expected TypeScript/API or assertion defect: supported compiler predicates exist; assertion narrowing is valid; automatic JSX and the compiled-source helper are consistent with this repository; imported portable types do not themselves execute the app. Tests use the real adapter handler with only `localUrl`/`navigate` boundary spies.

Coverage is useful and appropriately bounded:

- Four exact-trim href expressions, literal false props, canonical route helper, ordinary Next Link import, and no spread override at those sites
- Exact unchanged supporting/comparison href inventory and their absent prefetch prop
- Every supported prefetch value omitted from actual returned anchor props and rendered markup; preserved href delegation/content/common attributes and no navigation on render
- Primary handler ordering and exact destination; prior/caller cancellation; modifier/middle/right/external/hash native-handling branches

These tests do not establish actual production Next requests, hydration behavior, browser event delivery, target/new-tab semantics, keyboard events, history, first-click readiness, or acceptable latency. The source-AST assertions intentionally protect current structure; root's typecheck/build remain necessary for program validity.

The application currently has **121** top-level `*.test.ts` files. Applying this candidate makes **122**. Add `tests/discovery-prefetch.test.ts` to the explicit 96 non-HTTP inventory: reusing the 95 explicit list would silently omit it. The generic package test glob already finds it. The 95 split of 120 non-HTTP files plus `tests/local-review.test.ts` becomes 121 plus that one HTTP file. Preserve all prior coverage; six focused tests do not replace aggregate checks.

## Baseline and claims discipline

The baseline is root's unchanged95 production Build ID `GBi2ZoKnrPlQiT3VGNxcB`, not the older94 artifacts in the initial assessment. Observation hashes and payloads were read and checked:

- At 500 × 757 and 100% zoom, one no-click first-card sweep: 13 finished gzip detail responses, 12 unique paths, **401,024** dechunked content-encoded response-body bytes
- One combined attribute/exclusion sequence: 78 finished detail responses, 77 unique paths, **1,580,656** bytes; focus-induced scroll traversed ranking rows, so this is not an exclusion-only total
- Selected Zeekr 7X Long Range RWD destination had no prior request in its fresh-origin trace; verified URL/heading within a **152 ms observation bound**, including tool/polling overhead. Another base trim had prefetched

These are single own-VM observations, not wire or browser-consumed bytes, precise click-to-paint, LCP/INP, phone results, or paired after measurements. The candidate appropriately makes no after-change benefit claim. It does not reduce initial homepage HTML, promise faster cold navigation, or save portable-network traffic.

## Required root acceptance before retaining the change

1. Reverify exact manifest/before/after pins immediately before application. Apply only the three listed files and preserve saved95 rollback. Run the six focused tests, typecheck, lint, validation, the complete updated test inventory, production build and portable build against the resulting frozen inputs. Keep stage exits and artifact identities distinct from static approval.
2. On fresh own-VM production origins, repeat the same 500 × 757, 100%-zoom card sweep and attribute/exclusion sequence, with no detail activation. Include all four sites, hover/touch where supported and homepage-to-Discovery. Establish absence of speculative exact-detail traffic attributable to these sites using actual request logs; separate other links' traffic, duplicate paths, aborted responses and encoding. Do not substitute development/portable behavior or a raw-artifact sum.
3. Perform repeated comparable cold and warm activations with exact destination URL, trim identity, heading and evidence verified. Classify each destination's prior requests honestly. Record bounded ready-state observation intervals and obvious pending/repeated-click problems; do not call a local server response duration tap latency. Existing baseline has only one cold sample, so avoid implying a robust paired phone comparison.
4. Test native settled pointer and keyboard activation separately, including heading/evidence links, ranking and exclusion links; rapid/repeated activation and newer navigation; Back/Forward with search/filter/selection state; modified/new-tab activation; show-more/search and comparison return; narrow no-overflow. Recheck portable URL/trim/navigation and the previously observed footnote-return/pointer sequence; keyboard success alone does not clear that unresolved pointer observation.
5. Confirm the Model Y hero, nine reason destinations and scene behavior remain intact and visually unchanged in scope. An unchanged-source comparison supports preservation but is not a browser result. Do not claim real iPhone/Safari or Android/Chrome validation; WebGL2-unsupported behavior remains separate.

Retain only after root observes the intended speculative-request reduction and accepts the cold-navigation experience. Otherwise revert the bounded candidate. No after-change observation was made in this review.
