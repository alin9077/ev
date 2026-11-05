# Roadmark performance payload audit

Date: 10 October 2026. Read-only audit; no application edits by this worker. Main owns implementation, production rebuild, browser QA and user delivery.

## Result

The largest removable costs were redundant serialized data and repeat catalogue computation. They are not the original Model Y nine-reason hero or discovery's visible cards. Main implemented the four high-priority changes during this audit. Full research, every catalogue record, all 226 exact-trim packs and all 222 buyer summaries remain JSON-deep-equal to the frozen pre-index baseline.

### Measured minimum changes

| Change | Measured reduction | Scope / evidence |
|---|---:|---|
| Preserve canonical source objects in packs | 1,048,598 raw Flight bytes; 217,865 estimated gzip bytes | Equivalent home prop graph, 34 curated packs with 1,970 source references to 383 distinct IDs |
| Omit unused buyer summaries from picker projection | 408,284 raw Flight bytes; 56,529 estimated gzip bytes | Isolated picker prop graph for all 226 versions |
| Scope dynamic comparison sources to selected packs | 795,726 raw Flight bytes; 84,561 estimated gzip bytes | ATTO 3 Essential + Geely EX5 Inspire Extended Range pair, 68 rather than 1,573 source records; measured after the first two optimizations |
| Index repeated data lookups, preserving first-match semantics | Paired uncached catalogue runs: 603–720 ms before, 239–299 ms current | Entire research/catalogue and all 226 packs verified equal; synthetic RSC also verifies the cache lifetime |

These are byte measurements and local CPU diagnostics, not phone metrics. Gzip is locally estimated. Individual compressed reductions are not additive: final HTML escaping, component references, compression order and shared references affect the combined response. Main must measure the rebuilt production response.

## Baseline response composition

Original artifacts from .next/server/app matched the supplied production response check exactly.

| Route | HTML bytes | Flight inline script bytes | HTML excluding scripts | RSC payload bytes | Elements excluding scripts |
|---|---:|---:|---:|---:|---:|
| Home | 7,179,754 | 6,408,649 | 770,183 | 5,928,294 | 13,267 |
| Discover | 3,028,057 | 2,953,480 | 73,865 | 2,743,943 | 1,069 |
| Model Y | 979,642 | 968,198 | 10,662 | 897,921 | 170 |
| Geely exact trim | 370,720 | 228,815 | 132,980 | 208,743 | 1,945 |

About 89% of home and 98% of discover HTML bytes are Flight inline scripts. Home has substantial real comparison markup, but trimming that markup first would touch far more visible/accessible behavior for much less transfer benefit. Discovery already renders only the first 12 cards. Its large response is predominantly data for the whole filter/ranking catalogue, not 226 fully rendered cards.

The full source registry is not rendered on home or discovery: SourceRegistry is a separate client component used by /sources and the portable source screen. FootnoteProvider starts with an empty group map and adds source rows after mount, through FootnoteRefs effects. Initial server HTML therefore has a small empty footnote section; serializing all sources is the initial-load cost, and rendering registered sources is a later hydration/interaction cost.

## Source identity: safest large payload improvement

Original data.ts pack() ended with .map(s => ({ ...s, url: safeUrl(s.url) || "" })). This cloned source objects even when all values were unchanged. WithEvidence already supplied the canonical research().sources objects. Flight deduplicates object references, not merely identical-looking JSON objects. The copies prevented the source definitions from being shared.

Current code: src/lib/data.ts:690–696 preserves the source object when the sanitized URL is identical and clones only when sanitization changes it. All 1,573 current registry URLs already equal their sanitized canonical URL. Every resulting pack source value is equal to baseline and every pack source now points at its registry object. Continue testing unsafe schemes, credentials, whitespace/normalization and malformed URLs: returning a canonical object unconditionally would be unsafe.

Home's equivalent prop graph was 5,898,286 bytes / 770,404 estimated gzip with reconstructed old clones, versus 4,849,688 / 552,539 with canonical identity. Removing pack.sources altogether after identity reuse only saves another 34,368 raw / 7,740 gzip in this graph; keep them because other pack consumers and exports require them.

Important distinction: src/app/page.tsx and src/app/discover/page.tsx pass d.sources to Discovery as well as through WithEvidence. Those references already share identity in the same RSC request. Do not count them as two full copies or replace them with independently created projections, which could lose the current deduplication.

## Picker projection

Original src/lib/data.ts pickerCatalogue spread the full car, replaced facts with price/range/seats and cleared issues. That accidentally retained the complete buyerSummary, roughly 405 KB as a standalone field array. Current lines 718–729 destructure only buyerSummary out.

Audited transitive consumers:
- src/components/picker.tsx: identity, generation, availability, drive, and price/range/seats filter/display facts
- src/components/experience.tsx and src/components/static-comparison.tsx: picker cars and selection IDs; detailed claims come from packs
- src/components/explorer.tsx and ui.tsx VehicleCard/MediaRenderer: identity, availability, price/range/seats
- src/components/software.tsx: VariantPicker; actual eligibility, evidence and timeline come from the selected pack
- src/lib/compare.ts parseSelection: IDs and query validation
- src/portable/data.ts and entry.tsx: picker projection is separate from catalogue(), which reads complete pack.car objects

No audited consumer reads buyerSummary from picker cars. Do not remove it from catalogue(), pack.car, discoveryCars(), or buyer summary displays. Retain the full three picker Fact objects to preserve displayed status, basis, conditions, expiration handling and future evidence routing.

## Scope dynamic comparison evidence

Current src/app/compare/page.tsx:30–35 derives dynamic Experience props once and passes selectedPackSources(props.packs, research().sources) to WithEvidence. The static export branch at lines 19–28 intentionally retains the full registry, because the user can switch among all packs without a server round trip.

For the benchmark pair, only 68 of 1,573 sources are referenced by selected packs. The equivalent graph shrinks from 1,636,315 raw / 159,319 gzip to 840,589 / 74,758 after source scoping. The union must include all Pack.sources, not only currently visible facts: it covers features, software events, eligibility, configuration, availability, buyer-summary guard sources and issue references. Keep canonical registry order and object identities. Switching between comparisons must replace the provider's source universe, and copy/export results must still resolve all citations.

Do not scope discovery to only its first 12 cards or the current ranking attribute: search, show-more, attribute switches, selected versions and date-expiry guards operate on the full projected catalogue.

## Repeated server computation

Installed Next documentation confirms React cache deduplicates within a render pass; it is not a perpetual cross-request data cache. Synthetic production RSC renders confirmed this directly:
- Before: research 90–123 ms, catalogue 588–776 ms, a second catalogue call 0.010–0.015 ms with identical object identity, experienceProps after catalogue another 6–13 ms
- Current: research 15–32 ms, catalogue 201–334 ms, a second catalogue call 0.014 ms, experienceProps after catalogue another 4–7 ms

Every new comparison request previously rebuilt 226 cars and processed 15,594 equipment rows. Original data.ts:538–552 searched the complete feature array and completion/usability/refinement overlays for each feature; :589–592 repeatedly searched editorial rows. Original research():106–114 repeatedly findIndex'ed all equipment rows for each additions patch. catalogue() ran effectiveFeatures for every car to enforce buyer-summary dependency guards.

Current minimal implementation is appropriate:
- data.ts:39–58 builds first-match maps over imported immutable feature overlays
- :126–134 builds a first-match additions position map after research rows exist
- :475–486 builds a local featureRows map for this catalogue evaluation only
- :563–580 leaves public effectiveFeatures(car, suppliedResearch) selecting fresh rows each invocation; the private helper accepts the local grouped rows
- :583–587 preserves completion > usability > refinement precedence
- :620–635 keeps editorial, audit, refresh and approved correction ordering

Mutation-safe recommendation: do not cache indexes in a WeakMap keyed solely by a mutable Research object or array. Row replacement, push/splice, ID changes and source changes can happen without a new outer object. The catalogue-local map does not survive the synchronous evaluation. Public callers continue to see supplied mutations. No freshness guard, conflict check or source validation needs to be skipped.

Do not cache full catalogue forever: its buyer-summary guard policy uses the current UTC day (current :490), and comparisons/offer deadlines also depend on time. Any cross-request cache would need explicit data-version and day invalidation, plus mutation contracts. The current indexing improvement avoids that complexity.

## Remaining cost and later options

1. Footnote lookup: src/components/footnotes.tsx:80–81 currently calls sources.find for every source in every active group on each provider render. A memoized ID index derived from the immutable sources prop would preserve output while replacing repeated linear scans. Registration at :32–46 also copies the group map per reference; context consumers rerender after group updates. Changes to registration batching, numbering or mounting are higher risk and need browser tests for repeated navigation, StrictMode cleanup, source-group order, source return-focus and chapter jumps. No browser gain was measured here.

2. Discovery data: current projection in src/lib/discovery.ts:59–73 keeps seven ranking facts plus height/wheelbase for CarAvatar. Raw projected cars were 1,922,380 bytes: facts about 1,240,480; summaries 404,863; availability evidence 153,967. Facts' statuses, dates, market, bases, issue state, supporting IDs and offer deadlines protect ranking correctness. Summary conditions and guard IDs are intentional. Avoid blanket stripping of these fields. More aggressive DTOs need a property-by-property consumer audit and new types.

3. Source-field projection: the full registry was 836,265 raw / 94,762 gzip. An exploratory display/guard projection saved only about 132 KB raw / 10 KB gzip, much less than source scoping or identity preservation. It is not ready to ship: citable.ts:67–84 reads full_text_checked_date, consumers use dynamic source keys, and core guard logic depends on access_limitation, conflict and publication_hold. Keep full canonical sources for core calculations and exports; only consider a specifically typed display DTO later.

4. Portable bundle: original index.html was 17,516,949 bytes / 2,027,078 estimated gzip. Its embedded JSON was 16,117,832 bytes: packs 13,868,012; picker cars 1,075,670; research 907,490; embedded artwork 265,477. src/lib/portable-packs.ts already stores one registry and exact per-pack source IDs, and removes redundant feature variant/model IDs. Canonical identity alone cannot reduce JSON's repeated object contents, but omitting picker summaries does. A later optional schema change could derive picker cars once from hydrated pack.car instead of storing a second projection. Keep portable round-trip tests, offline source resolution, all variants, artwork, navigation, exact comparison selection, copy fallback and exports intact. Do not remove or lazily fetch source/evidence data from a self-contained file.

5. Markup: home legitimately renders a baseline plus nine alternatives throughout all chapters. Deleting offscreen alternatives, collapsed qualifications or hidden export text would affect desktop, phone swiping, accessibility, print, native find, jump anchors or copy fallback. Prefer the data fixes above. The nine-reason Model Y hero is out of scope for redesign.

## Verification completed and required

Completed by this audit:
- Read repository AGENTS.md and installed Next 16.3.8 boundary/client-component/cache guidance
- Measured original .next HTML/RSC and portable artifacts; parsed raw/gzip sizes without running a new server or browser
- Used the installed production Flight serializer over equivalent object graphs
- Audited picker consumers and source/claim guard dependencies
- Compared current complete research/catalogue and all 226 packs with a frozen pre-index reader: no differences, 222 summaries retained
- Verified canonical source identity and exact source values
- Measured synthetic RSC request caching and local CPU before/after

Main still owns full test/build checks and production browser verification. Prioritize unsafe source URL normalization, immutable-overlay first-match behavior, mutable supplied Research changes, expired/future evidence and offers, ranking holds, picker variants/filters, comparison switches and back/forward, source clicks/return focus, hero/chapter jumps and nine alternatives, portable offline load, round-trip serialization, copy fallback, Markdown/JSON exports and exact visible UI.

## Artifacts

- performance-payload-audit.json: combined measurements and findings
- performance-current-reader-parity.json: exact full data parity and paired CPU runs
- performance-rsc-cpu-audit.json / performance-rsc-cpu-current.json: synthetic RSC cache/cost samples
- performance-compare-sources-audit.json: selected-source savings
- performance-index-prototype.json: exploratory outside-app index experiment; its WeakMap is explicitly not a production recommendation

Line references for original hotspots refer to the pre-index source viewed early in the audit; current references were refreshed around 10:57 UTC. Main edited concurrently, so line numbers may shift again. Measurements intentionally distinguish old build artifacts, reconstructed baseline prop graphs and current reader source.
