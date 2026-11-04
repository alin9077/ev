# Actual app55 generated-output verification

10 October 2026. **Passed; no audit blocker to saving source55.** This report replaces the earlier hypothetical size estimates with measurements of the completed generated files. No app import, application tests/builds, HTTP, browser, phone, or app/generated-file edits were performed by this worker.

## Actual detail-route savings

Raw bytes are actual generated-file sizes. Gzip-9 is locally calculated and remains a compression estimate, not observed deployed transfer size.

| Detail | HTML raw before → after | HTML raw removed | HTML gzip-9 before → after | gzip removed |
|---|---:|---:|---:|---:|
| Ford E-Transit Custom Trend LWB | 1,673,745 → 1,285,813 | 387,932 | 111,375 → 73,901 | 37,474 |
| Hyundai Kona MY27 Premium ER | 2,519,080 → 2,431,101 | 87,979 | 132,820 → 112,140 | 20,680 |
| Original Model Y Premium LR AWD | 448,589 → 445,712 | 2,877 | 59,195 → 55,751 | 3,444 |
| Geely EX5 Complete ER | 371,052 → 367,795 | 3,257 | 50,110 → 46,599 | 3,511 |

| Detail | Flight raw before → after | Flight raw removed | Flight gzip-9 before → after | gzip removed |
|---|---:|---:|---:|---:|
| Ford Trend LWB | 1,163,810 → 793,450 | 370,360 | 90,900 → 53,430 | 37,470 |
| Kona Premium ER | 1,253,283 → 1,167,806 | 85,477 | 87,247 → 66,582 | 20,665 |
| Model Y Premium LR AWD | 267,322 → 264,686 | 2,636 | 40,932 → 37,350 | 3,582 |
| Geely EX5 Complete ER | 209,166 → 206,129 | 3,037 | 33,716 → 30,064 | 3,652 |

HTML already contains its Flight replay; do not add both sizes as an initial download. Actual serializer ordering/reference decisions produced better compression than the offline rewrite predicted, especially on Kona and the conventional passenger samples. The table measures four sampled details and does not claim an aggregate saving for all 325.

## Unchanged routes and original hero

- Home HTML remains **7,444,288 bytes**, Flight **6,220,843 bytes**
- Discovery HTML remains **4,189,843 bytes**, Flight **3,865,547 bytes**
- Curated Model Y vs Sealion 7 HTML remains **221,195 bytes**, Flight **116,130 bytes**
- Their local gzip sizes differ by only 0–2 bytes with the changed build ID, which is not a meaningful optimization

All seven captured routes have **raw-byte-identical non-Flight SSR**, without any normalization. The initial script first permitted normalization only of generated JS/CSS filenames inside src/href attributes; a stricter follow-on check proved no normalization was needed. No visible text, qualifier, markup, SVG, citation UI or source content was removed to achieve equality.

The home retains one main, one h1, the original “Tesla Model Y is the EV car of the year. Here’s why.” headline, and all nine verdict links with existing destinations:

1. `#detail-adas_optional`
2. `#chapter-07`
3. `#detail-safety_ancap`
4. `#detail-supercharger_access`
5. `#detail-boot_l`
6. `#detail-bidirectional_v2g`
7. `#detail-sentry_parked_recording`
8. `#chapter-05`
9. `#detail-pet_mode`

The complete existing hero and its position are covered by raw SSR equality, not only an anchor-count check.

The comparison sample is the generated curated `/compare/model-y-vs-sealion-7`, not a newly fetched dynamic query-string comparison. No HTTP was used.

## Actual Flight and source proof

For all **325 generated detail routes**, independent read-only checks found exactly one BuyerSummary, one SoftwareTimeline and one FootnoteProvider, then verified:

- BuyerSummary car keys are exactly `buyerSummary`
- SoftwareTimeline pack keys are exactly `car`, `eligibility`, `events`, `configuration`
- Its car identity keys are exactly `id`, `modelId`, `brand`, `model`, `trim`
- Every retained summary, identity, eligibility, event and configuration value equals the corresponding complete portable full-pack value
- BuyerSummary sources resolve to the same array as the FootnoteProvider
- That complete source array equals the canonical full pack's source IDs resolved against the unchanged full portable registry, in order; no field or provenance record was stripped

For all seven frozen route pairs, the entire expanded generated Flight graph equals the prior graph with only the intended detail projections. The only normalization was root build ID, Flight import-record addresses mapped to their unchanged module ID/export, and exact generated chunk URL filenames. Source strings and evidence were not normalized. Every unaffected component input remains equal.

The old and new client chunk filename sets both contain the same **43 files**, and all 43 are byte-identical. In particular, the generated BuyerSummary and SoftwareTimeline bodies, summary guard/clock behavior, conditions and filter predicates are unchanged. The initially referenced script/CSS lists on all seven routes are also unchanged.

The root's separately recorded `qa/detail-client-ssr-parity.json` reports **650 byte-identical component renders across 325 records** against the source54 pre-edit baseline. This worker verified its baseline SHA-256 matches the saved baseline and its pass/count fields. The root reports all 379 tests, typecheck/lint/validation, 371-page build and portable generation passed; those commands were deliberately not rerun here.

## Portable remains complete

- Prior HTML: **50,055,785 bytes**
- Actual app55 HTML: **50,056,036 bytes**, a **251-byte code-only increase**
- All **48,488,108 embedded data bytes are identical**
- Embedded-data SHA-256: `8ed8c2da128b3a558597d86ff7735c24e24bdd2d35264efd472ae49c73e16fbf`
- Non-script HTML/CSS shell is byte-identical
- The standalone JavaScript bundle grew from 1,454,204 to 1,454,455 bytes and includes the two small projection helpers and projected detail call sites

The independently reviewed source54→app55 diff contains only those transport changes and their type/test additions. No portable codec was added. All 325 full packs, 318 summaries, 2,072 sources, qualifiers, guarded expected snapshots and offline data remain present. This is a static data/completeness check; it is not a newly performed offline browser interaction test.

## Artifacts and reproducibility

- `actual-app55-generated-proof.json`: final primary proof, SHA-256 **5617e65d890a4de05a7cb1a6ff4449084da796dc562662a614f4d4fb792c9bb6**
- `actual-app55-additional-markup-proof.json`: stricter raw non-Flight SSR equality and explicit nine-anchor checks
- `verify_generated_app55.py`: reads the current generated files and frozen baseline; only writes the audit proof JSON
- `frozen/manifest.json`: frozen source53 input hashes; source54's portable/data matched this baseline, and the source54→app55 source review is recorded separately

Primary proof hashes were rechecked against current route, portable and client files before confirming readiness. This report does not claim a real handset speedup, mobile paint time, LCP/INP, browser memory use, network waterfall or deployed compression setting. Browser/phone work remains permission-dependent and unperformed.
