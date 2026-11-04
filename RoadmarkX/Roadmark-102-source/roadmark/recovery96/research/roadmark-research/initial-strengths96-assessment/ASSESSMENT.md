# Initial Discovery strengths: checkpoint 95 assessment

## Finding

**Expected pre-hydration freshness gating, not a demonstrated persistent initial-state bug.** The server-rendered first 12 cards deliberately withhold both editorial buyer summaries and numerical rankings until the browser obtains the current Australian evidence date. Unfortunately, the visible fallback calls that temporary state “Evidence first / Worth checking in detail” and says evidence is incomplete, making it look like a research gap rather than initialization.

Root subsequently observed an unchanged checkpoint 95 page update without search or any other UI interaction. No application logic fix is warranted by this discrepancy. An optional loading-copy improvement would make the initial state more honest without weakening evidence safeguards.

## Pinned scope and evidence

- Repository: `/workspace/scratch/586427eef9f2/roadmark-work/roadmark`
- Frozen saved checkpoint: 95; production `.next/BUILD_ID`: `GBi2ZoKnrPlQiT3VGNxcB`
- Worker scope: static source, test, JSON, built-artifact reading and SHA-256 hashes only. No application imports, application execution, syntax checks, tests, builds, browser, Git, Codex tasks, uploads, or application/candidate edits. Only this assessment and its hash inventory were written.
- Built `.next/server/app/discover.html` contains exactly 12 instances each of “Worth checking in detail” and “Comparable evidence is still incomplete”. Built `discover.rsc` already contains “RWD supports up to 22kW AC charging”; the editorial data is transported before it becomes visible.
- Root's initial report: fresh production `/discover` at approximately 02:36 UTC showed generic text on all initial 12 cards; a separate fresh-origin visit plus “Zeekr 7X” search showed four cards with differentiated strengths/tradeoffs.
- Root's follow-up observation, reported directly to this worker: unchanged checkpoint 95 on its own-VM origin 18862, first card read at **2026-10-12 02:39:36.844 UTC** showed “EVIDENCE FIRST / Worth checking”; next read at **02:39:46.344 UTC** showed “WHY CONSIDER IT / Range with all-wheel drive”, 600km WLTP and the five-seat tradeoff. **No UI interaction occurred between readings.** Root reported JS/resource logs finishing at 02:39:36.872 UTC.
- These two readings bound the observed change between snapshots. They do **not** establish a 9.5-second hydration or user-perceived latency, nor a precise relationship between resource completion and rendering. This worker did not perform or independently repeat the browser observation.

## Source trace

All line numbers below refer to the pinned files in `SHA256SUMS`.

1. `src/components/discovery.tsx:62–63` initializes `clockReady` to false and `asOf` to `2026-10-10`. `:95–101` runs URL restoration, obtains `australianEvidenceDate()`, sets `clockReady` true, and refreshes the date every 60 seconds. This mount effect does not wait for a query or user action.
2. `src/lib/buyer-summary-timing.ts:2–5` explicitly says cached static HTML must await the browser's current Australian evidence date. Every defined summary needs the clock, including summaries without an explicit offer expiry. Discovery `:329–334` consequently passes no summary until ready.
3. Discovery `:109–120` separately gives rankings an empty `asOf` while the clock is not ready. `src/lib/discovery.ts:125–135` rejects that date; freshness-dependent exclusions at `:149–153` / `:178–179` reject the affected facts. `buildStrengthsIndex` at `:278–280` begins with empty per-car lists and ranks against this policy. No fallback ranking can bypass the clock.
4. Discovery `:379–414` maps the absent buyer strength and absent numerical strength to the exact generic heading and incomplete-evidence text observed. `:429–452` supplies the generic availability/gaps tradeoff. Those are shared fallbacks, not distinct loading indicators.
5. Once ready, `src/lib/selling-points.ts:389–438` checks the summary's 30-day freshness policy, condition fidelity, supporting-source consistency/currentness, and independent clause deadlines. `src/lib/evidence-date.ts:4–14` uses `Australia/Sydney`, not the browser's local calendar or UTC date. The initial hardcoded date does not authorize rankings or buyer copy; removing the clock gate would defeat the explicit cached-content safeguard.
6. Search `src/components/discovery.tsx:273–276` only changes query, limit and URL. Filtering at `:123–129` / `src/lib/discovery.ts:346–361` chooses records; it does not load new summary data or set the clock. The strengths index's memo dependencies at `:118–120` contain no query. Searching after mount can expose ready content but is not required to unlock it.
7. `/discover` supplies projected catalogue data and scoped sources in `src/app/discover/page.tsx:10–15`. `src/lib/data.ts:530–542` builds buyer summaries against the Australian date before delivery, and `discoveryCars` (`src/lib/discovery.ts:64–89`) retains them while trimming unused facts. The second client check protects cached static output as time passes.

## Data and regression corroboration

- The catalogue's original first 12 records include Zeekr 7X RWD and Long Range RWD at positions 11–12. Thus the later search is not merely revealing a wholly different group that never appeared initially.
- `data/buyer-selling-points-2026-10-10.json:3978` has RWD's 22kW AC / 480km WLTP copy; `:4059` has Long Range RWD's 615km WLTP / ventilated-front-seat copy. All four Zeekr 7X summaries inspected have `checkedAt: 2026-10-10`. This matches the reported later text and supports a rendering-state explanation, not invented strengths or a search-specific data source. Stored proposal text alone does not prove all runtime guards pass; root's visible readings supply the runtime corroboration.
- `tests/buyer-summary-timing.test.ts:11–21` expressly expects all freshness-limited buyer copy to await the clock, including untimed claims.
- `tests/fixtures/cached-summary-ssr.mjs:199–239` expressly withholds timed and untimed buyer copy in static HTML and blocks timed ranking substitution.
- `tests/checkpoint82-strength.test.ts:430–517` exercises current/ready, not-ready, invalid-date and stale render states via mocked hooks. It is not a browser hydration-duration test.
- These tests were **read, not run** in this assessment. No fresh test-pass claim is made.

## Implication and smallest candidate

Keep all clock, freshness, source, expiry, availability and ranking guards unchanged. The observed transition is expected; the initial presentation is misleading because “still incomplete” can describe content that is merely awaiting the local clock. Slow or unsuccessful hydration, or disabled JavaScript, can leave this generic state visible longer or indefinitely. Root's two readings do not diagnose why any particular visit stayed there for its observed interval.

If a bounded UX adjustment is chosen, change only the card's **not-clock-ready** presentation to a neutral status such as “Checking evidence freshness…” and “Strengths and trade-offs will appear once the date check completes.” Reserve the existing incomplete-evidence fallback for the ready state where the guards actually produce no eligible summary/ranking. Keep exact-trim navigation available. Do not initialize `clockReady` true, substitute the hardcoded/build date as current, skip guards, or make typing a search the readiness trigger.

Root-owned verification for that optional candidate: pre-clock render exposes no dated claims/ranks; a passive fresh visit updates without input; genuinely missing/stale/expired data retains the established fallback after readiness; query clearing and restored URL state still render correct trims. Measure transition timing separately if it becomes a performance question. No candidate was implemented here.
