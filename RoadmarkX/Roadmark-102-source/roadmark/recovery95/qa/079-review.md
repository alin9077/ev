# Independent review: Mazda CX-6e lead95

## Decision

Approve only the narrowed, HTML-supported market candidate in `reviewed-minimal-market-proposal.json` for the root to consider after checkpoint94 is complete. It promotes the existing `mazda-cx-6e` lead to one non-ranking GT/Azami family audit. Nothing was applied to the app.

The original proposal's claim that both exact manufacturer E35 codes are bound to an August technical epoch remains subject to the outstanding PDF visual check. The separate technical candidate is not approved for import. The narrower candidate admits no technical epoch, detailed specification, accepted-order claim, physical-stock claim, model year or ranking eligibility.

## Findings

- [Current Mazda model HTML](https://www.mazda.com.au/cars/cx-6e/) independently names GT and Azami in its wheel paragraph. It still advertises preorder and describes the launch as pending. The [linked route](https://www.mazda.com.au/build/cx-6e/pre-order/?model=mazda-cx-6e) is dealer enquiry, not proof of an accepted order. The web tool marked that destination as crawled three weeks ago; observation on 12 October is not a same-day publisher refresh claim
- [Current official offer](https://www.mazda.com.au/offers/driveaway/electric/) separately names E35 GT at AUD 56,990 driveaway-from, subject to its paint, on-road-charge and personal-circumstance conditions. This is distinct from [8 April historical MLPs](https://www.mazda.com.au/mazda-news/mazda-cx-6e-australia-specs-pricing-electric-suv/) and does not prove delivery
- [Melville's exact New advertisement](https://www.melvillemazda.com.au/cars/new-aero-grey-2026-mazda-cx-6e-11397703) identifies E35 Azami GR, stock 11397703, VIN LVRHDCEK6TN551337. Independent direct HTML retrieval succeeded at 01:26:44 UTC on 12 October and reproduced the author's raw hash. Public carSSR fields are `new`, `in_stock`, `reserved=false`, `preorder=false`, and `sold_date=null`. These are seller assertions; the embedded record was last updated 6 October. No present unsold physical unit was independently verified
- Seller MY2026/build/compliance data remains seller-attributed. Manufacturer MY, brochure-to-VIN applicability, current GT stock and actual deliveries remain unresolved
- Preserve the cargo conflict: brochure extraction gives 363 L VDA seats-up to tray/seatback including underfloor; manufacturer HTML gives 468 L without protocol. No normalized comparison or inferred correction

## PDF blocker

The [current brochure index](https://www.mazda.com.au/brochures/) links the [official PDF](https://www.mazda.com.au/4a4bb0/globalassets/brochures/cx-6e-digital-brochure.pdf). Extraction supports its grade table and publication text, but screenshot calls returned no inspectable image payload, a content-type error, or Cache miss. Retries stopped. Required visual pages are printed p5 / zero-based4 (grade/table/footnotes), p7 /6 (cargo basis), and p14 /13 (publication code and availability disclaimer). No raw PDF byte hash or visual verification is claimed. Original manufacturer capture hashes identify extractor-result files only.

## Exact scope and integration constraints

The frozen market hash and original lead hash match the submitted proposal; there is exactly one lead at zero-based index40 and no audited CX-6e record. Preserve the original lead intact in history, preserve all other ordered rows and metadata, and append one evidence artifact.

Expected counts: audited records 241→242; active leads144→143; historical reconciled20→21; peripheral5 unchanged. Dependent counts: passenger113→114; preorder1→2; named configurations393→395; new-stock-advertised68→69; missing-trim54 unchanged; source artifacts18→19. These are audit collection counts, not buyable-vehicle counts. Detailed configurations343, families149, sources2196 and heroes9 stay unchanged. Global checkedAt stays 2026-10-10 and complete stays false.

Read-only contract review confirms `preorder`, `new_stock_listed` and `verified_named_configurations` are existing supported states. UI labels qualify advertised New stock. `research-schema.json` is the detailed research schema, not proof of market approval. The checkpoint93 helper hard-pins the complete live market value: a future checkpoint95 needs exact predecessor reconstruction before unchanged checkpoint93 checks, never weakened old hashes. Full pins and restoration requirements are in `review-pins.json`.

Only research outputs were written. No app edits/imports/tests/builds, Git operations, Codex task, browser takeover, uploads or supplier contacts occurred. Application validation remains the root's later responsibility.
