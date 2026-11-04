# Static review: Issue citation and projected-dimension transport

**PASS_STATIC_CODE_REVIEW. No semantic, import-cycle or obvious algorithmic-performance blocker found.** Reviewed `data.ts`, `discovery.ts`, `page-evidence.ts` and `types.ts` against verified checkpoint v57. The JSON companion pins each before/after file; the `.diff` contains every changed line.

## Full packs

`pack()` now selects each attached Fact Issue's complete `source_ids`, in addition to the previous direct Fact/configuration/availability/summary/feature/event/car-Issue sources. Every selected ID must exist in the registry before filtering. This resolves the four-source citation-selection gap reported for Jeep H05/H07 and ORA price/battery/WLTP/stock/order Issues. Canonical source records and existing hold flags are not rewritten. Navigation-only sources with no selected claim/context reference need not appear in every pack.

## Discovery projection

The existing seven attribute Facts and bespoke-avatar height/wheelbase behavior remain intact. Generic-avatar dimension Facts remain omitted. Their unique direct and Issue citation IDs are retained through the optional `projectedEvidenceSourceIds` field only when another retained claim/guard does not already carry them.

The source-ID list supplies citation context, not a synthetic Fact, positive claim or ranking approval. The same three configuration fields are projected; original cars, Facts, sources and buyer summaries are not mutated. Existing carried IDs are honored; a repeated projection is stable. Page evidence consumes the IDs and its existing missing-source guard remains fail-closed.

## Dependencies and cost

The new runtime import chain is `discovery → page-evidence → configuration-evidence`. The final module's Car import and page-evidence's Car/Pack/Source imports are type-only. There is no runtime back-edge into discovery, data or selling-points.

The change adds linear scans over attached Issue citations, retained citations and two omitted dimension Facts, using Sets for lookup/deduplication. It adds no network work, catalogue reconstruction, deep clone, recursive walk or quadratic registry scan. This is a static complexity review, not a timing measurement.

Inspected current application and portable call sites pass full catalogue cars to `pack()`; projections are used for discovery/page-evidence transport. A hypothetical caller passing projected cars directly to `pack()` is outside this reviewed path.

## Verification boundary

Read the new focused tests for Issue-only pack citations/missing sources, dimension-only direct and Issue citations, source identity, non-mutation and repeat projection. No test or application module was executed by this auditor. The parent owns focused/full tests, builds, actual runtime snapshots and measured performance checks.
