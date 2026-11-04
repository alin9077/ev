# Discovery exact-trim prefetch: static candidate 96

## Ready for independent review, not yet applied or validated

This candidate contains exactly two application-file edits and one added focused regression file. Only candidate copies under this directory were written. The live checkpoint 95 application was not changed, imported, executed, syntax-checked, tested, built, browsed, committed or uploaded by this worker. Test behavior below is an expectation for root to establish, not a passed result.

## Measured reason for the experiment

Root's unchanged checkpoint 95 production build is `GBi2ZoKnrPlQiT3VGNxcB`. The earlier assessment's checkpoint 94 build artifacts are not this baseline.

At 500 × 757 CSS pixels, 100% zoom, a fresh own-VM Chromium origin 18860 card sweep without detail activation produced 13 finished gzip detail requests for 12 unique exact-trim routes and 401,024 dechunked content-encoded response-body bytes. Fresh origin 18862's attribute/exclusion sequence produced 78 finished detail requests for 77 unique routes and 1,580,656 bytes. Its focus-triggered smooth scroll passed ranking rows before showing exclusions, so these are combined sequence totals, not exclusion-only totals. Both are local-proxy workload observations, not wire bytes or proof of bytes consumed by the browser.

Root's fresh-origin 18861 activation of `/cars/zeekr-7x/long-range-rwd-2` had no prior request to that destination. URL and heading were verified within a 152 ms observation bound; that includes observation/tool overhead and is neither precise click-to-paint nor phone latency. The preceding Base RWD route had prefetched. These are one-time baseline samples, with no paired after measurements yet. No savings or acceptable cold-navigation tradeoff has been established.

Baseline observation files and hashes are pinned in MANIFEST.json. The original assessment remains at `../mobile-performance96-assessment/ASSESSMENT.md` and root's detailed observations at `../mobile-performance96-assessment/root-runtime-observations/`.

## Exact application changes

1. `src/components/discovery.tsx`: add `prefetch={false}` to all four existing exact-trim `Link` render sites: vehicle-card heading, vehicle-card “Exact trim & evidence”, attribute-ranking row and excluded-record row. The two previously one-line links receive JSX line wrapping only. Hrefs and text remain the same; normal `next/link` stays in place. Comparison, original illustrated comparison, market audit and sources links retain their original policy.
2. `src/portable/link.tsx`: destructure `prefetch`, type it as optional `boolean | "auto" | null`, and consume it with `void prefetch` so it cannot leak through the spread onto `<a>`. This deliberately accepts the installed Next contract. The entire returned anchor and click-handler body is byte-identical to baseline. No new fetching, navigation, modifier, history, cancellation or hash behavior is introduced. `src/portable/navigation.ts` is unchanged.
3. `tests/discovery-prefetch.test.ts`: new file with six focused tests, using existing Node test discovery, the installed TypeScript parser and the repository's existing `compiledSource` helper. No dependency or package-script changes.

The Model Y hero, all nine reason targets, sources, evidence, eligibility, ranking, freshness policies, data, styles, art and loading copy are outside the edit. The baseline comparison confirms that removing only the four added prefetch props and restoring the two wrapped JSX lines reconstructs the original Discovery source exactly. The portable returned JSX and click logic are unchanged exactly.

## Installed Next contract checked

Read local Next 16.3.8 documentation and implementation, rather than relying on older Link behavior:

- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`: the App Router supports `boolean | "auto" | null`; false disables viewport and hover prefetch
- `node_modules/next/dist/docs/01-app/02-guides/prefetching.md`: production static routes normally prefetch fully; disabling defers fetching until activation
- `node_modules/next/dist/client/app-dir/link.js`: `prefetchEnabled = prefetchProp !== false`; viewport registration and hover/touch intent are gated
- `node_modules/next/dist/client/app-dir/link.d.ts` and the public `next/link` declaration agree on the optional prefetch union
- `scripts/build-portable.ts` aliases `next/link` to the portable adapter

The Pages Router documentation's hover-prefetch exception is not the contract used by this App Router application. There is no global prefetch change and no expectation of portable file-size/network savings.

## Focused test expectations

The added file declares six tests:

1. Parse actual Discovery source and assert the four exact-trim Link sites, canonical route helper, correct href expressions, explicit false values and no spread override
2. Assert the comparison and three supporting Link hrefs remain unchanged and do not get this prefetch policy
3. Compile the actual portable adapter through the existing helper, supply every installed Next prefetch value (undefined, null, false, true and "auto"), and verify no DOM prop leaks; href-resolution delegation, content and ordinary anchor attributes remain intact; static markup has no prefetch attribute
4. Invoke its real primary-click handler for every value and verify caller-before-navigation order, cancellation of the browser default and exact original href passed to navigation
5. Verify disabled-prefetch modifier, middle/right, external and same-document hash activation keep native handling while still calling the supplied callback
6. Verify both already-prevented and caller-prevented clicks remain cancelled without navigation

The portable tests intentionally stub only `localUrl` and `navigate` to observe the adapter boundary. They do not claim to simulate a real browser, test actual Next prefetch traffic, establish keyboard/new-tab/history behavior, or resolve the previously observed portable pointer anomaly. The optional public Next prefetch type is assigned into the actual portable props in test code, so root's typecheck also exercises compatibility.

Suggested root-only focused execution, from the application root after guarded installation:

`node --import tsx --test --test-concurrency=1 tests/discovery-prefetch.test.ts`

Root must include the new test in any explicit 96 test inventory; the package's generic `tests/*.test.ts` glob would find it, but the checkpoint 95 custom inventory does not implicitly expand. The focused tests supplement rather than replace all required tests, typecheck, lint, validation, production and portable builds, hero/evidence/ranking checks and browser coverage. Nothing has been run by this worker.

## Runtime acceptance and stopping condition

Root should first verify MANIFEST.json and each exact before/after hash, applying only the three listed files. Preserve the saved checkpoint 95 rollback point. After the full required checks and production/portable builds, repeat paired fresh-origin production browsing at the same viewport and sequence, including homepage-to-Discovery, all four detail-link surfaces, hover/touch where available and cold versus warm activation. No-click exact-detail prefetch from these four sites should be absent. Keep market/source traffic separate and count duplicate routes and aborted requests correctly.

Verify requested exact identity and evidence, search/show-more, comparison selection and return state, keyboard and modified/new-tab activation, Back/Forward, repeated activation, narrow layout, all nine original hero destinations and portable navigation. Keep native pointer coverage separate from keyboard results. Preserve pending-navigation behavior rather than adding unrelated loading copy.

Accept only if actual unclicked detail traffic is removed and observed cold navigation remains acceptable; otherwise revert this bounded candidate. A local VM observation cannot establish real iPhone/Safari or Android/Chrome performance. No real-phone claim is warranted, and WebGL2-unsupported behavior remains a separate release check.

## Files and application procedure

- `before/`: exact frozen originals of the two edited files
- `after/`: proposed application-relative files, including the added test
- `candidate.patch`: full unified diff for inspection only
- `MANIFEST.json`: baseline observations, before/after file hashes and unchanged critical-file pins

Root is the sole executor and installer. Independent static review is required before root applies the candidate. Do not copy this directory's report or metadata into the application unless separately requested.
