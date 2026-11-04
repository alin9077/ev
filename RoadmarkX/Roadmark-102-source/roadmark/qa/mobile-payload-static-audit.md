# Roadmark mobile payload cost: read-only audit

Audit date: 10 October 2026. Application source inspected at the 311-record/304-summary checkpoint. No application imports, builds, tests, benchmarks, application edits or data changes were performed. The only new files are this report and a JSON-only measurement script/output in the research directory.

## Recommendation

Ship page-specific source allowlisting first. Keep complete canonical Source objects, every fact/summary/guard and the original hero unchanged. This is the clearest lossless payload reduction and does not alter evaluator semantics. Measure the final production response after the root agent's implementation; these static measurements do not establish mobile performance.

1. Scope /discover to every source referenced by the complete projected discovery catalogue
2. Scope / to that union plus all curated packs and the two explicit hero citations
3. Scope /b to all curated packs and those two explicit citations
4. Consider /cars source scoping as a separate small, well-bounded extension
5. Leave source-field stripping, buyer-snapshot restructuring and lazy catalogue loading for later

## Current boundaries

- src/app/page.tsx:11–27 constructs the full catalogue, 34 curated full packs and the nine-fact discovery projection. WithEvidence gets its default complete source registry; Discovery receives that identical source-array object
- src/app/discover/page.tsx:9–17 has the same complete registry both in WithEvidence and Discovery
- src/app/b/page.tsx:24–36 sends only original curated packs, but WithEvidence still sends the complete market-wide registry
- src/components/with-evidence.tsx:4–14 puts the chosen registry into the client FootnoteProvider
- src/lib/discovery.ts:58–74 retains seven ranking facts plus height/wheelbase. It keeps the full other Car properties, including buyerSummary
- src/components/discovery.tsx:90–96 computes all rankings and strengths locally. Only the first 12 matching cards render at :284–285, but the entire projected catalogue is already serialized
- src/lib/data.ts:714–734 already collects full Pack citation unions and preserves canonical Source identities when URL sanitization does not change the URL
- src/app/compare/page.tsx and src/lib/page-props.ts:5–11 already scope dynamic comparison sources to selected packs. Static/offline comparison intentionally retains all packs/sources

Important: the registry passed to Discovery and WithEvidence is already the same object. Do not count it twice or recreate two independent per-source projections. Preserve canonical object identities and registry order.

## Safe source scope

For every car in discoveryCars(catalogue()), collect:

- All retained facts' sourceIds, not just the current attribute or currently ranked facts
- availabilityEvidence.sourceIds, including inactive/outgoing/nonranked records
- buyerSummary.guardSourceIds
- Both buyerSummary.strength.sourceIds and buyerSummary.tradeoff.sourceIds, including clauses not currently shown
- All buyerSummary.expectedSourceSnapshots IDs
- Conservatively, car.issues[].source_ids and retained fact.issues[].source_ids; current Discovery only checks whether issues exist, but this keeps the whole retained evidence graph resolvable

Filter the canonical full registry using the ID set. Preserve each selected object exactly; detect missing requested IDs rather than silently producing a partial scope. Avoid date/status filtering: status can change and client expiry guards intentionally decide what is currently eligible.

For the homepage, add all full curated Pack.sources IDs and the explicit fleet citations:

- r5_au_ev_sales_sep2026, used at fleet-experience.tsx:195 and :317
- r3_tesla_fsd, used at :231

ModelYVerdict uses direct external links rather than additional FootnoteRefs. The curated Pack union already includes all its selectable trims, including currently hidden alternatives; never scope only to initial selection or active mobile rival. Compute the pack union before any hero-specific pruning.

Use the scoped array for both Discovery and WithEvidence on /discover. On /, using the combined home array for both is simplest and preserves shared-array identity. Distinct subset arrays can still share source objects, but are unnecessary complexity for this first change.

For /cars, Explorer and VehicleCard display price/range FactValue citations. A conservative union of all pickerCatalogue retained fact source IDs plus issues/availability references preserves its complete projection. Do not substitute ComparisonPickerCar: its range/seats facts intentionally omit evidence and it is only suitable for selection controls.

## Measured byte evidence

The JSON-only script is audit_mobile_payload_cost.mjs; results are mobile-payload-static-audit.json. It reads existing files, never imports the app, and uses Buffer.byteLength(JSON.stringify(value)). All figures below are raw minified JSON, not wire/Flight bytes or gzip savings.

Frozen effective input: denza-gac-smart-preflight-baseline-catalogue.json, SHA-256 3179d59228db3a75b7dfd34d5439283eef357986595afbfe9ef0d59e311cca9c, contains 296 cars and 289 summaries.

- Complete 296-car JSON: 22,517,629 bytes
- Existing nine-fact discovery projection: 3,178,994 bytes
- Dropping top-level generation, drive, researchStage, availabilityRevision and issues: 3,126,378 bytes, a 52,616-byte raw JSON delta
- Further changing the avatar-only height/wheelbase facts to value-only: 2,798,630 bytes, another 327,748-byte raw JSON delta

The last two are exploratory, not the recommended first patch. Top-level fields are unused by current Discovery, but the existing home-payload test deliberately promises identical retained identity. A value-only avatar DTO would require a new type/boundary and corresponding test contract rather than weakening the shared Fact/Car models.

The current source-input JSON files concatenate to 1,969 unique records and 1,027,818 bytes before auditedSource transforms. Applying the complete 296-car discovery live-consumer citation union finds 722 records, 368,736 bytes, with no missing IDs. The difference is 659,082 raw bytes. Including preserved-but-not-rendered issue references adds six more source IDs. This is not a claimed current 311-car saving: the comparison registry contains the newer DGS input sources, the historical cars lack those 15 records, and auditedSource was deliberately not simulated.

Historical original-hero JSON plus the two explicit refs uses 363 of those current stored source rows, 201,163 bytes. Combining it with the 296-car discovery scope uses 1,008 records, 525,928 bytes. These numbers establish direction and scale only; old hero inputs are not claimed to match current packs.

The earlier qa/performance-payload-audit.json independently measured an equivalent 226-car prop graph. Once canonical source identities were reused, removing pack.sources arrays saved only 34,368 raw Flight bytes / 7,740 locally estimated gzip bytes. That historical result should prevent misreading repeated JSON Pack.sources contents as a megabyte-scale current transfer opportunity.

Existing production checkpoint qa/production-response-check-296-final.json reports home 7,451,705 raw bytes / 740,610 estimated gzip bytes, discovery 4,370,833 / 348,369, exact Geely trim 370,810 / 50,693 and comparison pair 508,157 / 66,691. It explicitly covers VM loopback responses, not a phone, browser paint, LCP, INP or a mobile network.

## Unused hero payload

Static transitive inspection of FleetExperience, ChapterArt, scene-readout, FactValue, FeatureValue, SoftwareTimeline and CarAvatar finds:

- pack.sources is unused by the hero's client component graph; footnotes resolve through the separate provider
- pack.car.buyerSummary is unused by the hero graph
- pack.eligibility, events and configuration are used by SoftwareTimeline and scene readouts; do not remove them
- Full fact conditions/qualifications/status/sourceIds/date are used by FactValue and factCondition; do not prune them indiscriminately
- researchStage is used by fleetSelection/curatedFleetCars, so a hero identity projection must retain it

A page-only hero transport projection can omit sources and buyerSummary after calculating provider sources. Keep canonical nested objects and never modify catalogue(), pack(), expected snapshots or shared comparison/export packs. A narrow FleetPack type should communicate omitted fields rather than supplying fake empty evidence arrays. The needed shared component type changes make this less attractive than source scoping. On /, summaries may already be shared with Discovery by object identity, so repeated JSON byte totals overstate the marginal saving.

## Guard invariants

Do not alter src/lib/selling-points.ts or buyer-proposal-storage.ts for this optimization.

- buildBuyerSummaries validates immutable expected identities, full effective facts, exact source snapshots, availability and related-trim dependencies before constructing the summary
- currentBuyerSummary at selling-points.ts:320–359 compares complete current Source JSON with expectedSourceSnapshots, checks summary/source freshness, rejects missing/inaccessible/held/conflicting sources and checks strength/tradeoff validUntil independently
- buyerSummaryNeedsClock checks the presence of validUntil, including invalid values. Discovery and BuyerSummary suppress timed clauses before the browser has checked the current Australian date
- australianEvidenceDate uses Australia/Sydney; keep the existing 60-second refresh and invalid-date fail-closed behavior
- Discovery ranks only finite standard AU claims with compatible basis, recent fact/availability evidence, no issues, source support and unexpired offers

Dropping source_type, notes, hashes or other apparently unused source fields can silently disable the full-source drift guard if both expected/actual snapshots are reduced. Sharing mutable actual source objects with immutable expected snapshots can also make a changed actual source appear to match itself. Neither is needed for source allowlisting.

Keep summary.conditions: the frozen 289 summaries carry 393,768 bytes of condition string values and they are reader-facing EvidenceConditions. Their length is not evidence of redundancy. Frozen expected-source arrays total 287,939 bytes across 67 summaries, but actual transport can share expected source object identities; do not equate that sum with wire cost.

## Required regressions for source-only patch

1. Deep equality of full catalogue, all 304 summaries, full packs and immutable proposal/identity ledger before/after. The patch should not touch these producers
2. Scoped sources equal the canonical registry filtered by the union, retain reference identity/order, include every retained reference, and reject missing requested IDs
3. All seven rankAttribute results and buildStrengthsIndex results match full-registry output for every car. Include ties, single-item groups, separate vehicle classes/cycles/cargo methods and excluded reasons
4. currentBuyerSummary matches full-registry output for every summary at ordinary, stale, future and boundary dates; include source date, URL, access_limitation, conflict, publication_hold and complete-source metadata drift
5. Per-clause expiry tests: valid/inclusive deadline, next day, empty/invalid/non-string validUntil, one expired clause with independent surviving clause, and pre-hydration static HTML. Keep tests/buyer-summary-timing.test.ts and tests/cached-summary-ssr.test.ts
6. Hidden/live states: show more beyond 12; search a late-added DGS trim; all attribute switches; non-passenger classes; outgoing-new-stock filter; selecting/removing up to three; direct URL restore and Back/Forward
7. Original homepage hero remains above discovery with one main, one h1, nine reason links and all destination anchors. All 34 original trim choices, nine alternatives, mobile swiping and priority ordering remain intact
8. Footnote open, title/supports/qualification/access limitation/conflict display, return-to-reference focus and cleanup after filters/attribute changes; explicit hero sales/FSD refs must resolve on / and /b
9. Dynamic comparison must still rescope on selection navigation and CopyForAI must retain complete citations. Keep static-export/portable sources and offline switching unchanged
10. Final production build and loopback measurement for actual 311-record revision, clearly labeled. Actual mobile loading/rendering requires separate throttled browser or device verification

Existing relevant tests: home-payload.test.ts, home-hero.test.ts, discovery.test.ts, detail-discovery.test.ts, selling-points.test.ts, buyer-summary-timing.test.ts, cached-summary-ssr.test.ts, comparison-picker.test.ts and buyer-proposal-storage.test.ts. None were executed by this audit.

## Later lazy/server boundaries

The current first-12 limit is a DOM limit, not a data limit. A dynamic import alone does not remove the large serialized props already passed across the server/client boundary. Installed Next docs explicitly distinguish client code lazy loading from serialized RSC props.

A later architecture could preserve the original hero and first discovery cards, then fetch additional card summaries/evidence when needed or move discovery filtering/ranking to server navigations. That would need version-matched source/summary bundles, fail-closed loading states, stale-response cancellation, URL/back-forward parity, full catalogue search/ranking, SSR/no-JS treatment, copy/export support and a separate full-data offline path. It changes behavior and is not a safe small patch for this checkpoint. No saving is claimed.

Detail pages have narrower potential DTO boundaries at BuyerSummary (only summary + sources used) and SoftwareTimeline (only car identity + eligibility/events/configuration used). Their current full Car/Pack props should be audited together because other client children already reference many of the same objects; changing one does not guarantee a meaningful wire saving.
