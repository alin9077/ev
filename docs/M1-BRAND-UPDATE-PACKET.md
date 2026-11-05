# Dated M1 brand update packets

The original research JSON, source records, initial price admissions and initial M1 grade ledger remain immutable. New research is an explicitly registered, dated packet. No importer changes an older observation date or regenerates its approval hash.

## Files and importer

- Save each packet as `data/m1-brand-updates/<brand>-<YYYY-MM-DD>.json`
- Add that basename once to `data/m1-brand-updates/registry.json` in oldest-to-newest review order
- `BrandUpdatePacket` in `src/lib/brand-updates.ts` is the TypeScript schema
- `prepareBrandResearch(originalResearch, packets)` exposes new sources, versions, unknown equipment rows and unknown update history before routes and packs enumerate them
- `applyBrandUpdates(initialM1Catalogue, researchWithPackets, packets)` applies the dated facts after retained fills, the price ladder and the initial grade ledger
- `applyBrandFeatureUpdates(car, regradedFeatures, researchWithPackets, packets)` replays optional reviewed equipment rows before canonical driveaway and roadside projections
- `brandVersionSnapshot(car)` captures the exact identity guard for an existing version

The frozen `sourceCatalogue()` is not a packet's input catalogue. Capture fact and version guards from the current `catalogue()` before registering the new packet. Subsequent packets review the preceding effective view. Existing source records must match their full snapshots. A new observation gets a new source ID, even if its URL is unchanged.

## Packet skeleton

```json
{
  "schemaVersion": 1,
  "id": "m1-example-2026-10-14",
  "brand": "EXAMPLE",
  "reviewedAt": "2026-10-14",
  "reviewedBy": "Named research review",
  "sources": [],
  "models": [],
  "variants": [],
  "versionGuards": [],
  "versionUpdates": [],
  "facts": [],
  "features": [],
  "brandTerms": [],
  "availability": [],
  "summaries": []
}
```

This empty skeleton is a format example, not evidence or a completion claim. Do not register it.

## Sources

`sources` contains full `Source` records for every citation used by this packet, including sources retained from earlier research. Include `id`, `url`, `title`, `publisher`, `source_type`, `published_date`, `accessed_date`, `market`, `supports`, plus any original metadata. An existing ID with any changed field is rejected. Sources newly introduced by the packet appear exactly once in `research().sources`.

Use the date the source was actually checked. Maker evidence must identify its Australian authority and exact-version, explicit-range, or brand-terms scope. Reported evidence must identify the secondary source or sibling. Never relabel a dealer advertisement as a maker publication.

## Version identity and additions

Every existing version touched by facts, features, availability, metadata or summaries needs:

```ts
{ variantId: car.id, before: brandVersionSnapshot(car) }
```

in `versionGuards`. The snapshot contains `id`, `modelId`, `brand`, `model`, `trim`, `year`, `generation`, `vehicleClass`, and `drive`. Only passenger and ute versions are admitted.

New models use the existing `Research.models` shape. New versions use `Variant`: exact ID/model ID/brand/model/trim, `model_year` (null is allowed), `record_state`, `variant_review_date`, `source_ids`, `notes`, `price_basis`, `range_cycle`, and `price_aud: null`, `range_km: null`, `seats: null`. Supply researched values in `facts`, not twice in the raw identity record. Supply `vehicle_class` as `passenger` or `ute`. New versions do not need `versionGuards`.

New versions initially have no known facts. Their fact changes use `before: null`. Missing shared buyer fields become explicit unverified unknowns; unrelated equipment keys from other vehicles are never copied into the new version. Every explicitly reviewed packet field is retained. Equipment answers and update counts remain unknown unless reviewed. This is not the same as a completed two-source search.

Current version metadata can change through:

```ts
{ variantId, before: brandVersionSnapshot(car), after: updatedSnapshot, reason }
```

in `versionUpdates`. An ID, brand or model-ID change requires a distinct new version instead. Availability has its own guarded change below.

## Facts and grades

Each fact update is:

```ts
{ variantId, before: structuredClone(car.facts[key] ?? null), after: completeNewFact }
```

`after` is a complete existing `Fact`, including key/label/value/unit/basis/comparisonBasis/status/sourceIds/date/market/scope/qualifications/issues, plus `buyerGrade` and `gradeReview`. The old full fact must match exactly; changed value, source, basis, qualification or grade invalidates the review.

`gradeReview` contains:

```ts
{
  reviewedAt: packet.reviewedAt,
  overlayId: packet.id,
  reason: "What the cited source establishes for this fact and version",
  evidenceScope: "exact_au_version", // or explicit_au_range, brand_au_terms,
                                    // secondary_or_sibling, searched_not_found
  sourceIds: after.sourceIds,
  sourceLabel: "Optional short source label"
}
```

- `confirmed`: maker AU evidence; status `standard`
- `check`: maker AU evidence plus a real, specific `conditionExplanation`; status `conditional`
- `reported`: secondary/sibling evidence; status `conditional`, `resolvedElsewhere: true`
- `not_published`: null value, status `not_verified`, reason explaining the gap, and at least two distinct searched source URLs

A non-null `price_aud` also needs `priceEvidence` with rung/basisTag/sourceKey/sourcePointer/originalBasis/rankingEligible, plus state for rung 4 and publisher for a reported price. Use `Before on-road costs`, `Driveaway`, or an empty unranked comparison basis. Never convert between them. Rungs 5–6 are Reported.

If a higher-rung before-on-road-costs price is selected, a separately published current driveaway offer can be stored as `promotional_driveaway_aud`. It requires the same full price provenance and an explicit `Driveaway` comparison basis, with its eligibility and deadline preserved. The driveaway equipment answer projects this reviewed offer without replacing the main ladder price. Missing, withdrawn or incomplete supplemental reviews cannot replace an existing answer.

## Optional reviewed equipment rows

Use optional `features` for dated corrections to a full buyer-facing equipment row. Omitting it leaves existing packets and their hashes unchanged:

```ts
{
  variantId,
  criterion: "storage",
  before: completeEffectiveFeature,
  after: completeReviewedFeature,
  dependencies: [{ key: "boot_l", expected: completePostPacketFact }]
}
```

Capture `before` from the current effective equipment view, after initial M1 feature regrading and all preceding brand packets. Every field is guarded, including provenance, qualifications, fitment, and additional recorded metadata. The row must already exist once for the exact version and criterion. Existing versions require the usual identity guard. Sources must have exact snapshots in the packet, and `after.source_ids` must exactly match `after.gradeReview.sourceIds` and include each dependency's citations.

The replacement carries its own earned `buyerGrade`, review reason/scope, packet ID and review date; `reviewed_date` equals the packet date and `last_evidence_date` cannot be later. Confirmed normally uses `standard`, while Check and Reported use `conditional`. Explicit `optional`, `unavailable` and `not_applicable` fitment is retained independently of those grades. Check and optional rows need specific conditions. A stale review marker is cleared only after the replacement passes fresh review validation.

A wholly missing equipment answer can earn `not_published` only with the exact string `value: "Not published"`, `status: "not_verified"`, `searched_not_found` review scope, a reason describing the unsuccessful search and at least two distinct usable cited URLs (URL fragments do not count as separate sources). It must depend on a complete post-packet Fact keyed `feature_<criterion>`: for example, `feature_phone_key` for the `phone_key` row. That Fact must itself earn Not published with actual `value: null` and `status: "not_verified"`. Include all of its citations in the feature. A brochure-existence fact, unrelated null measurement or known numeric proxy cannot substitute for this exact criterion search result. The same full identity, before-state, source-snapshot and dependency checks still apply. Features remain string-valued; Facts never accept the string `"Not published"` as a null substitute, including malformed objects carrying both citation field shapes.

Mixed text may still state known measurements and an explicitly missing measurement, with that missing claim depending on its separately graded null fact and two-source search. The `feature_<criterion>` requirement is only for wholly Not published equipment rows; it does not alter existing known or mixed rows or explicit optional/unavailable fitment. Not published conveys a reviewed gap, never a ranked measurement.

Dependencies are full exact facts after that packet's facts and brand terms. They can include earned null Not published facts. Each must have usable cited evidence and no unresolved issue. The catalogue validates each new row's dependencies at its packet's stage. Features then replay full before/after states in registry order, and the latest active row's dependencies are checked again against final facts. A later canonical change needs an explicit reviewed replacement; disagreement fails closed rather than leaving stale prose or inventing fallback copy. Later identity changes must also follow the guarded version chain.

`driveaway_price` and `roadside_assistance` cannot be supplied manually here: their equipment rows remain projections of canonical facts. Feature overlays run after initial regrading and before those projections. Original research rows are never rewritten. Explicit immutable source-snapshot packs remain outside packet replay; current Tier 1 cars are marked by the effective catalogue and must pass all packet guards. Detail packs, citable claims and portable packs all receive the same effective feature.

## Shared Australian brand terms

Store vehicle warranty, battery warranty and roadside terms once per brand using optional `brandTerms`, rather than duplicating the same new fact across versions:

```ts
{
  key: "warranty", // battery_warranty or roadside_assistance also supported
  fact: completeBrandTermsFact,
  applicableVariantIds: ["exact_version_1", "exact_version_2"],
  before: { exact_version_1: completeOldFact, exact_version_2: null },
  exceptions: [{ variantId: "older_version", reason: "A different dated policy applies" }]
}
```

The fact's grade scope is `brand_au_terms`; normally Confirmed, or Check for a real policy condition. Applicable IDs and explained exceptions must account for every known Tier 1 version of the brand at that point in the registry. Existing applicable IDs also require `versionGuards`. New versions added later require their own explicit applicability review; the importer never assumes their policy. Every before snapshot is checked, and duplicate shared/specific writes to a cell are rejected. Use an explicit exception plus a version-specific fact for a different policy. Roadside terms are projected into the matching equipment row so detail packs and fact consumers agree.

## Availability

Reuse `AvailabilityCorrection` from `src/lib/availability-corrections.ts`. Capture `before` with `availabilitySnapshot(car)`, set `status: "approved"`, `reviewedAt` and `reviewedBy` equal to the packet, and retain exact evidence date, source IDs, order/stock states and specific qualifications. `after.evidence.checkedAt` equals `evidenceDate`.

One availability change per version per packet. A packet is its own correction sequence, so omit `supersedes`. An order listing never verifies physical stock. New versions start with their listed record state but unverified order acceptance and stock; an evidence-backed change can replace that initial state.

## Strength and trade-off

Each summary supplies both clauses:

```ts
{
  variantId,
  conditions: [],
  strength: {
    label: "Short buyer label",
    text: "Factual buyer-use interpretation in original words",
    dependencies: [{ key: "range_km", expected: completeEffectiveRangeFact }]
  },
  tradeoff: {
    label: "Short trade-off label",
    text: "What the buyer gives up",
    dependencies: [{ key: "boot_l", expected: completeEffectiveBootFact }]
  }
}
```

Dependencies are the actual post-packet facts used in each sentence, with exact full snapshots and their sources. Do not use a price, model year, or source timestamp as an unrelated freshness proxy. Every substantive numeric/supporting claim must appear in the dependency list. Any later change to a depended-on fact invalidates that clause; unrelated changes do not. Existing freshness rules expire each clause using only its own facts. Copy must retain any required configuration-specific buyer conditions. No market-wide superlatives before C1 closes.

## Checks

Run the focused `tests/brand-updates.test.ts` and `tests/brand-feature-updates.test.ts`, `pnpm typecheck`, and the integrated catalogue/report checks after registering real research. Synthetic test amounts are isolated fixtures and are never loaded into the live catalogue. Full suite/build runs are coordinated separately.
