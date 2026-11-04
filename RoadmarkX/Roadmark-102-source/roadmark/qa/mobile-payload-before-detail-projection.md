# Roadmark 325-record mobile-payload audit

10 October 2026. Read-only investigation of the source53 / preview4 generated checkpoint. The root is independently building a later checkpoint; all final results here use the frozen source53 files recorded in `frozen/manifest.json`, not a mixture of builds.

## Decision

The smallest useful next normal-route change is to narrow **both detail-page client boundaries together**, downstream of full pack/summary construction:

1. BuyerSummary receives `car: { buyerSummary: car.buyerSummary }`, plus its existing unchanged `sources` array. A `Pick<Car, "buyerSummary">` boundary is sufficient; alternatively accept the full summary directly if call sites are updated. Keep the summary object itself unchanged
2. SoftwareTimeline receives `pack: { car: { id, modelId, brand, model, trim }, eligibility, events, configuration }`. These five identity values and all three non-car objects/arrays are the exact compiled consumer input set. Preserve nested references and complete contents

Keep the component rendering/guard logic untouched. Existing full Pack callers remain structurally compatible with a narrowed type, so the homepage hero need not change. Only the detail page should construct the new transport objects initially. Keep full Car/Pack producers, portable hydration, comparison/export packs and full source registries intact.

This is a bounded improvement for configuration-heavy details, **not a solution for discovery payload or every detail page**. Do not budget the full Car and Pack JSON sizes as savings: their evidence is heavily shared with each other and with retained FactValue/ClaimReport props.

## Measured normal-route baseline

UTF-8 bytes from generated files; gzip is local level-9 compression, not an observed server response. Initial HTML already embeds its Flight payload: **do not add HTML and Flight together**. Separately listed JS/CSS are individually compressed and may be cached.

| Frozen route | HTML raw | HTML gzip-9 | Flight raw | Flight gzip-9 | Initial HTML-listed JS/CSS raw / gzip-9 |
|---|---:|---:|---:|---:|---:|
| Home | 7,444,288 | 761,862 | 6,220,843 | 681,489 | 803,205 / 244,023 |
| Discovery | 4,189,843 | 342,258 | 3,865,547 | 323,339 | 704,287 / 208,991 |
| Ford E-Transit Custom Trend LWB | 1,673,745 | 111,375 | 1,163,810 | 90,900 | 723,430 / 216,129 |
| Hyundai Kona MY27 Premium ER | 2,519,080 | 132,820 | 1,253,283 | 87,247 | 723,430 / 216,129 |
| Original Model Y Premium LR AWD | 448,589 | 59,195 | 267,322 | 40,932 | 723,430 / 216,129 |
| Geely EX5 Complete ER | 371,052 | 50,110 | 209,166 | 33,716 | 723,430 / 216,129 |
| Curated Model Y vs Sealion 7 | 221,195 | 22,648 | 116,130 | 13,548 | 672,811 / 198,220 |

The comparison row is the generated curated `/compare/model-y-vs-sealion-7` route. It is **not** a measurement of dynamic `/compare?cars=...`, which was not requested over HTTP and has no corresponding captured HTML here. No new current dynamic-comparison saving is claimed.

The 907,865-byte market JavaScript chunk exists on disk but is absent from these initial HTML resource lists. Counting all `.next/static/chunks` as discovery download would be misleading. This list is not a browser waterfall and does not prove the absence of later loads/prefetches.

## Reference-aware projection experiment

`audit_flight_projection.py` parses Flight text-length records correctly, narrows the two actual component boundaries, repairs references whose old inline location was removed, materializes still-needed referenced values, preserves shared-object identity, and removes only unreachable data records. It does not import the application or run a renderer.

The candidate is then serialized, reparsed, fully expanded and checked against the original expanded tree with only the intended projections. The source objects, expected-source snapshots and all unaffected component props remain complete. The test also checks the one-to-one object alias topology: independent actual/expected source snapshots are never merged simply because they have equal values.

| Detail route | Flight before → estimate after, raw | Flight gzip-9 before → after | Raw Flight removed | gzip-9 Flight removed |
|---|---:|---:|---:|---:|
| Ford Trend LWB | 1,163,810 → 787,978 | 90,900 → 57,911 | 375,832 | 32,989 |
| Kona Premium ER | 1,253,283 → 1,154,465 | 87,247 → 83,497 | 98,818 | 3,750 |
| Model Y Premium LR AWD | 267,322 → 261,833 | 40,932 → 41,153 | 5,489 | −221 |
| Geely EX5 Complete ER | 209,166 → 203,307 | 33,716 → 33,523 | 5,859 | 193 |

Negative savings mean a small estimated gzip increase, not a regression finding from an actual build. Raw byte savings are not synonymous with network savings.

For HTML, the script consolidates Flight replay into the same one-script wrapper in both baseline and candidate, so wrapper/batching differences do not masquerade as projection savings. It keeps every non-Flight SSR byte identical. These normalized HTML values are estimates, not fabricated output from a Next build:

| Detail route | Normalized HTML raw before → after | Normalized gzip-9 before → after | Raw / gzip bytes removed |
|---|---:|---:|---:|
| Ford Trend LWB | 1,673,193 → 1,280,069 | 111,189 → 78,649 | 393,124 / 32,540 |
| Kona Premium ER | 2,517,324 → 2,417,776 | 132,483 → 128,641 | 99,548 / 3,842 |
| Model Y Premium LR AWD | 448,435 → 442,921 | 59,087 → 59,409 | 5,514 / −322 |
| Geely EX5 Complete ER | 370,901 → 364,995 | 50,020 → 50,147 | 5,906 / −127 |

Home, discovery and the sampled curated comparison are **byte-unchanged by this experiment**. Both projections are needed: changing only BuyerSummary leaves the full Car reachable through SoftwareTimeline, and changing only SoftwareTimeline leaves it reachable through BuyerSummary. On Ford, summary-only removes only 11,138 raw Flight bytes and slightly increases local gzip; timeline-only removes 2,716 raw / 463 gzip bytes. The combined boundary releases 375,832 raw bytes. On conventional detail pages most fact objects remain legitimately reachable through rendered FactValue and ClaimReport clients, so the combined win is much smaller.

The experiment models a valid reference graph, not Next's future exact record IDs/order/chunking. A real rebuild may yield different compression. The report does not promise the precise estimated savings after implementation.

## Exact consumer and guard proof

Frozen `2yghxm67bs5ut.js` shows BuyerSummary reads only `car.buyerSummary`:

- Initial evidence-date state comes from the same summary `checkedAt` value
- The same `currentBuyerSummary(summary, sources, {asOf, maxAgeDays: 30})` receives the complete source registry
- The same `buyerSummaryNeedsClock(summary)` suppresses timed clauses until the clock check
- The initial Australian-date effect, 60-second interval and cleanup remain unchanged
- Strength, tradeoff, every source ID, conditions, expectedVisibleConditions, expectedSourceSnapshots and per-clause deadlines remain in the exact original summary object

Frozen `1mzb5fdhcwhg_.js` shows SoftwareTimeline uses:

- car.id for Model Y L eligibility caution; car.brand for Kia terminology; car.modelId for the EV3 notice; brand/model/trim in its heading
- Complete eligibility fields, including scope, observation window, counts, source IDs and unknown-count state
- Complete events for every repeated filter selection, pending/reverified status, delivery method, categories, notes, changes and footnotes
- Complete configuration changes and their citations

It never reads car.facts, car.configurationEvidence, car.buyerSummary, pack.features or pack.sources. Do not trim any event or eligibility fields based only on the initial selected filter.

The full server pack still renders every qualified claim and reporting control outside these two narrow boundaries. No original Model Y hero, nine points, 34 original selectable trims, avatar SVG, ranking policy, issue content, print/export evidence or source metadata needs to change.

## Discovery assessment

The old source-scoping and avatar work is already present. Frozen discovery has 325 cars and 809 complete sources. The catalogue's retained qualifiers, availability evidence, summaries and exact guard snapshots account for most of the data. A narrow detail DTO does not reduce this route.

Do not strip qualifications, source headers/provenance, immutable expected snapshots or hidden/late-expiring clauses. Do not treat first-12-card rendering as pagination of data. A later discovery architecture would need a version-matched lazy catalogue/evidence boundary or server-driven filtering, complete search/ranking parity, stale-response cancellation, no-JS/loading behavior and a separate full-data offline path. That is a broader behavioral change and is not the next minimal patch.

## Portable all-in-one composition and later research

The portable is a different delivery mode: it intentionally retains every configuration and full pack for offline discovery, detail, switching and comparison.

- Current HTML: **50,055,785 raw / 4,264,268 local gzip-9 bytes**
- Embedded data: **48,488,108 raw / 3,921,633 gzip-9 bytes**, 96.9% of the file
- Minified data values: packs 43,867,396 bytes; picker cars 2,949,949; research 1,402,340; art 265,477; counts 124
- Packs contain 35,043,789 bytes of Car values, including 31,421,643 bytes of full facts; features contribute another 8,185,336 bytes
- 325 packs, 318 buyer summaries, 2,072 sources, 27,680 facts are present
- Qualifier strings alone occupy 8,604,373 bytes within full facts; their size is **not permission to discard them**

Historical source51 verification records a 45,920,841-byte portable and exact SVG parity for all 321 cars. Current size is 4,134,944 bytes larger. These are different checkpoints; this audit does not attribute all growth to the four new configurations or assert an avatar regression.

`audit_portable.py` preserves a separate lossless experiment:

1. A repeated-string-value dictionary for strings at least 64 UTF-8 bytes, reconstructed into independent original objects, gives **30,933,391 simulated HTML bytes / 3,311,047 gzip-9**, including correct `<` escaping. It removes 19,122,394 raw / 953,221 gzip bytes before decoder cost. 10,002 strings are interned. These final numbers supersede the interim calculation that had not restored HTML-safe escaping
2. Reconstructing the existing picker shape from complete packs using per-car keys/fact keys, while deep-cloning values so no new object aliases are introduced, gives **47,203,425 simulated HTML bytes / 3,967,961 gzip-9**. That is 2,852,360 raw / 296,307 gzip bytes removed before decoder cost

Both decode to exactly the same normalized JSON hash, `95ada219a9e762ed7d30ee3f4fd73fbccac5a6b289cc440e08c6f1097651f622`. All original provenance, hero material, guards and offline records survive. **Neither simulated HTML is a runnable deliverable**: adding a codec/decoder, validating schema/markers, safely handling malformed payloads and verifying offline loading are separate implementation work. File-size reduction alone does not prove faster parsing or lower peak memory; decoding adds work. No browser APIs, decompression support or extra network fetch should be assumed.

Keep this separate from the next normal-route change. A single-document compressed archive or delayed data decode can be researched later, but full offline availability and compatibility must remain explicit requirements.

## Verification required for the next patch

1. Pure projection tests: exact field sets; identity equality for summary, sources, eligibility, events and configuration; unchanged full Pack/Car input; missing summaries remain absent/undefined
2. Deep before/after catalogue/full-pack/source/proposal/identity equality. No mutation of evidence producers or canonical registries
3. Render old/full vs projected BuyerSummary to identical markup for normal, stale, inclusive expiry, next-day, invalid-date and pre-hydration states; test complete-source drift and independent strength/tradeoff expiry. Keep the existing summary timing/clock tests
4. Render old/full vs projected SoftwareTimeline identically for ordinary Tesla, Model Y L, Kia EV3, no events and pending evidence. Verify every filter and repeated filter changes retain all events and citations; retain configuration-change rendering
5. Actual rebuilt detail HTML: compare non-Flight SSR markup using a stable build normalization if necessary; verify all footnotes, source counts, qualifications and report controls. Re-measure actual HTML, `.rsc` and referenced assets, rather than substituting this estimate
6. Full test/typecheck/lint/validation/build according to the existing root workflow. Preserve the original homepage and nine anchors, existing avatar exact-SVG parity, dynamic comparison, CopyForAI and portable round-trip/offline coverage
7. Browser and actual-phone checks remain **not run** and require the user's explicit browser permission. No HTTP, localhost, external network, Mac/desktop, browser workaround, heavy build, test execution or app edit was performed by this audit

## Reproduce

Run these scripts from any directory with Python 3; only the audit directory is written:

    python /workspace/scratch/586427eef9f2/roadmark-research/audits/mobile-payload-after325/audit_flight_projection.py
    python /workspace/scratch/586427eef9f2/roadmark-research/audits/mobile-payload-after325/audit_portable.py

Inputs: frozen source53 portable HTML, seven generated route HTML/Flight pairs, and generated client chunks. `frozen/manifest.json` records exact input bytes and SHA-256 hashes. Results: `flight-projection-results.json` and `portable-results.json`. `inspect-flight.py` is the reference-aware read helper.

All compression estimates assume gzip is actually negotiated by deployment, at a comparable level. Hosting might use another gzip level, Brotli, no compression or caching; none was observed. No LCP, INP, DOM/render time, CPU, parse time, device memory or mobile-network measurements are claimed.
