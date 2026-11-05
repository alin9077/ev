# Homepage payload refinement — 10 October 2026

The growing catalogue was being rebuilt repeatedly when producing homepage packs outside a React Server Component cache scope. The original illustrated fleet can select only established records, but the page sent all 185 detailed packs to that client component.

## Changes

- Reuse one catalogue/research snapshot while assembling the homepage and alternate-homepage packs.
- Send the 34 existing selectable illustrated-fleet records to that component. Pass the complete catalogue count separately; the footer still offers all 185 versions.
- Discovery retains all 185 identities, availability evidence and guarded buyer summaries. Its client-bound fact projection retains the seven ranking attributes plus height and wheelbase used by the original drawings. Every retained fact keeps its full evidence, conditions, dates and status.
- Exact-trim detail, comparison and exports continue to use full shared records. No source facts or catalogue records were deleted.

## Measurements and regression checks

- Serialized fleet-pack JSON: 12,416,536 → 3,343,928 bytes (73% smaller).
- Serialized discovery-car JSON: 4,449,259 → 1,474,491 bytes (67% smaller).
- These two prop payloads combined: 16,865,795 → 4,818,419 bytes (71% smaller).
- These are JSON serialization measurements, not measured HTTP transfer sizes or phone loading times. Source registries and framework payloads remain additional.
- Generic server rendering of the final homepage observed at 1,133 ms in one local run. An earlier pre-change test took 63,791 ms, but the runs were not a controlled performance benchmark.
- Before/after homepage static markup is byte-identical: 728,331 bytes. Original Model Y hero and all nine reason targets remain above discovery.
- An intermediate projection omitted illustration height/wheelbase. The markup comparison caught this before saving; both dimensions were restored and every catalogue illustration now has an equality regression test.
- All seven rankings, their exclusion reasons, and search/class/stock filters are checked against full records. Curated fleet selections are checked for every catalogue ID.
- Portable preview still contains the full catalogue for offline detail and comparison. Its archive is not claimed to shrink by these prop percentages.

Real iPhone/Safari and Android/Chrome performance and journey verification remain open release requirements.

## Browser check

Own Chrome portable preview: original hero and nine reasons visible at 1180 CSS pixels, all-185 footer intact. Searched IM5 Premium and IM6 Premium, selected both, opened exact comparison without an inserted Tesla, and returned with both selections and search restored. Attribute view showed like-for-like range and seating groups. Desktop zoom at 393 CSS pixels produced a 388-pixel document without horizontal overflow. These are desktop checks, not phone emulation or actual-device acceptance.

Final homepage-refinement checks: 151/151 tests passed in 130.710 seconds; TypeScript, ESLint, structural validation, 231-page production build and 13.00 MB portable generation passed. Catalogue remains 185 exact versions / 70 families / 180 eligible summaries. No public deployment.
