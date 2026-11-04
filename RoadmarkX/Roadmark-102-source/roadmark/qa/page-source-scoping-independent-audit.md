# Independent page-source allowlist audit

Date: 10 October 2026. Verdict: no blocking regression found in the reviewed patch. This is a static review, independently checked against frozen JSON and checkpoint-v42 file bytes. It is not runtime, browser, mobile-performance, SSR-render, test or build assurance.

## Scope and method

Reviewed `src/lib/page-evidence.ts`, the three changed page routes, `tests/page-evidence.test.ts`, their transitive citation consumers, `qa/page-source-scope-measurement.json`, and `mobile-payload-static-audit.md`. Did not import application modules, execute app tests/builds, change application files/data, or start servers/browsers.

A standalone built-ins-only script reads the existing portable HTML's inert `ev-data` JSON. Its complete 311-car graph and 1,969 canonical source rows have exactly the catalogue and source hashes reported by the implementation's runtime measurement. It walks retained nested source references independently of the new helper. Portable HTML is byte-identical to the saved v42 archive. An independent archive comparison checks 312 existing files across source, data, tests, scripts and build configuration.

Artifacts:

- `audit_page_source_scoping_static.cjs`: reproducible JSON-only evidence-graph check
- `page-source-static-graph-audit.json`: full findings, ID lists, input/measurement hashes
- `page-source-static-hash-audit.json`: all 312 baseline/current file hashes and changes

These artifacts are research outputs outside the application. File times were not used as freshness evidence.

## Findings

### 1. Discovery reference closure is complete

`page-evidence.ts:15–26` collects availability source IDs, car issues, every retained fact's sources and issue sources, both cached editorial clauses, guard sources, and expected-source snapshot IDs. `discovery.ts:62–73` still transports all cars, retaining seven ranking facts plus height/wheelbase, the original other car properties, and cached buyer summaries.

The independent recursive frozen-graph walk finds exactly 754 discovery source IDs, all present in the canonical registry. This includes every record beyond the initial 12-card DOM limit, every attribute switch and vehicle class, and new-stock/outgoing search alternatives. No lazy-card or current-filter-only scope is introduced. The 2,799 retained facts still contain 849 null values, 333 source-less facts and 136 facts with issues. The helper neither invents sources nor changes unknown-value/status/qualification behavior.

### 2. All hero alternatives and transitive consumers remain covered

The page routes create all 34 curated packs before scoping; neither scope is based on initial selection, mobile focus, chapter priority or currently visible timeline filter. Sources referenced by every curated fact, feature, eligibility record, event and configuration record are in the /b scope. A broader recursive walk of all preserved curated pack fields, including issue and expected-snapshot refs, also finds no ID outside that pack union.

`fleet-experience.ts` has exactly two unique literal citation IDs: sales (`:195`, `:317`) and FSD (`:231`). Both are in `HERO_EVIDENCE_IDS`. `ModelYVerdict` uses direct external links. `ChapterArt`, scene loaders/readouts and avatars introduce no other footnote registry lookups. `FactValue`, `FeatureValue`, and every filtered/hidden `SoftwareTimeline` entry are covered by the complete pack union.

Home uses the discovery+hero union (1,038 records); /b uses 384. Every requested ID resolves. Canonical registry currently has no duplicate IDs.

### 3. Canonical identity, source drift and holds are preserved

`page-evidence.ts:49` filters the canonical array without projecting, copying, sanitizing or mutating Source objects. Order and each selected reference are preserved by construction. Existing WithEvidence behavior used those same canonical source values. Home and Discover pass one scoped array to both Discovery and the provider; the change does not create competing independently projected registries.

`currentBuyerSummary` still compares complete current source JSON against immutable expected snapshots (`selling-points.ts:320–359`). All guard/strength/tradeoff/snapshot IDs survive. Full-source metadata, URL, access dates, access limitations, conflicts and publication holds remain intact. The frozen data's flagged sources are retained where referenced: one in discovery and 18 in each hero-bearing scope. There is no blanket removal of held evidence that could erase its qualification display or weaken exclusion checks.

No source is silently omitted: missing requested IDs throw (`page-evidence.ts:50–55`). With valid current inputs this is lossless; future malformed inputs intentionally fail page construction rather than publish partial evidence.

### 4. Cached expiry and pre-hydration behavior are unchanged

All evaluator, timing, evidence-date, component and SSR-test files are byte-identical to checkpoint v42. The source-only change does not remove deadlines, conditions, expected identities, source snapshots or clause-specific sources.

Discovery's initial `clockReady=false` keeps `rankingPolicy.asOf` empty (`discovery.tsx:43–96`) and withholds clock-dependent cached summaries (`:287–293`). The existing 60-second Sydney-date refresh and independently expiring strength/tradeoff clauses remain. Actual SSR fixture coverage already exists for inclusive deadlines, independently surviving clauses, malformed deadlines, source holds/drift, date rollover and withholding timed fallback rankings. Those fixtures were read, not executed in this audit.

Footnote registration is still effect-driven (`footnotes.tsx:133–142`); initial SSR references/registered notes are absent under the same pre-existing behavior. No new no-JavaScript footnote guarantee is claimed. Hydrated footnote focus return, filter cleanup and mobile interactions still require runtime checks by the implementing agent.

### 5. Patch scope is narrow and verified against the archive

The archive comparison covers 126 existing source files, 105 data files, 60 tests/fixtures, 18 scripts, and three dependency/build configuration files. Only three existing files differ: `src/app/page.tsx`, `src/app/discover/page.tsx`, `src/app/b/page.tsx`. The only newly added files in those directories are the helper and its test.

Catalogue/pack producers, proposal storage, immutable ledgers, source input data, discovery projection, evaluators, dynamic comparison, exports, static comparison and portable entry/build code are unchanged. The frozen portable catalogue hash also independently matches the runtime measurement, including all 304 paired summaries. The separately reported runtime full-pack JSON hash was not independently recomputed here; portable storage transforms feature object layout, so this audit does not falsely equate its serialized pack bytes with runtime pack bytes.

### 6. Reported byte savings are accurately labeled

Independent JSON-only reconstruction reproduces every count and byte total in `qa/page-source-scope-measurement.json`:

| Scope | Sources | Raw minified source-array bytes | Saved raw JSON bytes |
|---|---:|---:|---:|
| Full | 1,969 | 1,031,776 | — |
| Discovery | 754 | 387,687 | 644,089 |
| Home | 1,038 | 546,872 | 484,904 |
| Original /b | 384 | 214,305 | 817,471 |

These are source-array JSON sizes, not Flight, compressed response, mobile load time, paint, LCP or INP. Canonical objects can be shared across serialized graphs. Do not double-count the home provider/Discovery registry. The portable HTML is deliberately unaffected by this web-page optimization; it still needs all sources for offline navigation. The earlier static audit properly labeled its historical 296-car estimates, and the new measurement supersedes those estimates for current source-array sizing.

## Test review and remaining verification

The added tests cover canonical reference identity/order, complete retained closure, no car mutation, missing-ID failure, all seven ranking attributes/strength groups across date states, every cached summary across date boundaries, source-field mutation/removal parity, and all 34 hero alternatives plus explicit citations. Existing expiry/SSR/unknown-value tests complement them. No static reason to require another application change was found.

Two coverage qualifications prevent overstating the tests:

- The source-mutation parity loop tests the first affected summary for each scoped source, not every affected summary-source pair. Closure plus unmodified source objects supports the stronger claim statically, but the test name alone does not mean exhaustive pair testing.
- Equality against the full registry establishes losslessness, not evaluator correctness independently. Existing evaluator-specific assertions remain necessary.

The implementing agent should finish its aggregate checks and final production-loopback measurements, and label browser/device flows separately if they were not exercised. No such execution was performed by this reviewer.

## Key SHA-256 checks

- Saved checkpoint-v42 zip: `59554f8dc9020c6e8f88e27bc212f0897a07fccf43e87731269b8f0439b25fba`
- Frozen `index.html`, identical to v42: `b6156fed9cea9cc0a1f39d8797513fbfb2e0750bbfe580f6ff6405ebb423aced`
- Complete catalogue JSON, equals runtime measurement: `0ac777dfef11678e2d2761d2d9c03c1c32ebd168550363d08b1066e1bcfb30a1`
- Complete source JSON, equals runtime measurement: `d2a540bf8d5d2c873061da36a8cc24894d9790803887aabf76d37170e7e3ee59`
- Reviewed helper: `aa527b202333fb3064bf08658d58f7916b622df9a34515d312a25f3271614ec0`
- Reviewed new test: `d9465a3062d72fc20188799efbc5b329d31df66792f612ca6493caa22666f67a`
- `selling-points.ts`, unchanged: `6bc95a324b3f0490950ac58a745d7f299554ad0a9fe98d203ff9e9ee7ff9dcb2`
- `buyer-proposal-storage.ts`, unchanged: `2febace11633321f2c103a0b3db4c4632df8e3601195922c4b83fce6354f7f7c`
- `src/lib/data.ts`, unchanged: `c00670a9d2c398f6031fc5d788c52c65a74202fd606bb25612b736bb3d28aa7f`
