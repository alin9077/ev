# Mazda CX-6e: one existing Australian passenger lead materially resolved

Observation date: 12 October 2026. Proposal only; no Roadmark application files changed.

## Result and recommended disposition

Promote only the existing `mazda-cx-6e` lead into one audited, source-bound model-family record. Its two Australian manufacturer grades are E35 GT and E35 Azami. Retain `orderStatus: preorder`, with an explicit advertised-only qualification, and `stockStatus: new_stock_listed`, qualified to one exact Azami seller advertisement. Keep ranking and complete-current-vehicle eligibility false.

This resolves the empty grade identity and establishes a bounded New advertisement. It does not resolve accepted orders, factory production, delivery, unsold physical stock or exact brochure applicability to a delivered VIN. Detailed catalogue additions are a separate, larger proposal.

Collection-only counts under the frozen input: records 241 → 242; unverified leads 144 → 143; historical reconciled leads 20 → 21; peripheral records 5 → 5. No new canonical family is discovered: this is a disposition change for one existing lead. Detailed variants, nine hero variants and complete-market status do not change.

## Why this lead

The preferred Deepal S05 was rechecked at its [Australian manufacturer page](https://www.deepal.com.au/vehicles/deepal/s05/). The inspected page still exposes interest registration and a question about interest in preorder, without exact local grades. Current dealer snippets preserve elapsed arrival forecasts. That was unproductive for exact-trim resolution, so the work switched to the already-listed CX-6e. No S05 mutation or new vague leads are proposed.

Exact CX-6e identity was absent from both current detailed catalogue files. Incidental CX-6e mentions in Mazda 6e exclusion notes are not CX-6e variants. Mazda 6e data was not inherited. The original evidence-index 78/full 135 packs were not restored or reviewed.

## Manufacturer and seller availability are different observations

The [Mazda model page](https://www.mazda.com.au/cars/cx-6e/) still describes the vehicle as nearly arriving and advertises preorder. The [actual linked destination](https://www.mazda.com.au/build/cx-6e/pre-order/?model=mazda-cx-6e) is a dealer enquiry form. Nothing was submitted. This supports advertising, not an accepted order.

The [current electric offer](https://www.mazda.com.au/offers/driveaway/electric/) advertises E35 GT from AUD 56,990 driveaway. Premium paint is excluded; listed registration, insurance, statutory and dealer charges are included. Personal circumstances may alter the quote, offers cannot be combined, and Mazda may amend it. The April announcement's AUD 53,990 GT / 56,990 Azami MLPs are historical, differently based observations. No current Azami final price is established.

[Melville Mazda stock 11397703](https://www.melvillemazda.com.au/cars/new-aero-grey-2026-mazda-cx-6e-11397703) is a precise E35 Azami GR advertisement, VIN LVRHDCEK6TN551337, 4 km, Aero Grey with Warm Beige Maztex. Direct public HTML returned HTTP 200 at 01:19:03 UTC. Visible condition is New; the embedded vehicle record states `car_type=new`, `status=in_stock`, `reserved=false`, `preorder=false`, `sold_date=null`. No coming-soon, due or allocated wording appeared in the inspected advertisement. The vehicle record's own update timestamp is 6 October, so the 12 October retrieval is not a guarantee that inventory was refreshed that day.

The seller advertises build 24 August 2026, compliance 1 September 2026, and model-year 2026 metadata. These are seller assertions, not manufacturer MY confirmation. The visible page requests a price enquiry; a zero placeholder in public data is not a price. Generic dealer dimension/weight/equipment fields were not imported. GT stock found in search extracts was excluded from the primary accepted packet because fresh direct page retrieval did not succeed.

## Exact-grade technical candidate, separate from market promotion

The [current Mazda brochure index](https://www.mazda.com.au/brochures/) links the [August 2026 Australian brochure](https://www.mazda.com.au/4a4bb0/globalassets/brochures/cx-6e-digital-brochure.pdf), code AU41-P00008813. E35 GT and E35 Azami have separate columns. Publication date is the technical epoch; formal manufacturer model year remains null.

The small candidate retains source-scoped facts: GT 484 km / 18.9 kWh per 100 km versus Azami 468 km / 19.4, all WLTP combined; both are 190 kW, 290 Nm rear-drive with advertised 78 kWh LFP batteries. Gross/usable basis is not defined. AC maximum is 11 kW and DC maximum 194 kW. Approximate charging claims are 24 minutes for 10–80% and 15 minutes for 30–80%; these are distinct intervals and not real-world guarantees. GT uses 19-inch wheels; Azami 21-inch wheels and digital mirrors. The brochure supports V2L via an adaptor and shared front-seat heating/ventilation, an electric roof shade and wireless phone integration.

Buyer tradeoff: GT has the longer claimed range and conventional mirrors; Azami adds the digital-mirror arrangement and larger wheels with a lower laboratory range. Wheel size alone is not asserted to cause the entire difference. There is no road-test claim about comfort or mirror usability.

## Holds and source conflicts

- Seats-up cargo: brochure page 7 gives 363 L VDA to the parcel tray/seatback including underfloor space. The model page says 468 L without protocol. Preserve both and hold normalized seats-up comparison. Seats-folded ceiling volume must retain its separate basis
- Climate: August brochure says dual-zone; the [8 April announcement](https://www.mazda.com.au/mazda-news/mazda-cx-6e-australia-specs-pricing-electric-suv/) says tri-zone. Hold the normalized count and retain the later attributed brochure wording
- Central screen: current brochure/model marketing says 26.45 inches; the older announcement says 45. Do not silently repair the announcement; normalized ranking field remains held
- Model year, accepted orders, actual deliveries, usable battery capacity and brochure-to-stock-VIN applicability remain unverified
- Towing observations require the Mazda Genuine kit and retain the manufacturer's State/Territory qualification; no towability or licensing advice is implied

## Provenance and limitations

`source-provenance.json` records exact URLs, publisher/date/observation distinctions, semantic locators and capture hashes. The Azami raw response SHA-256 is a2a53b60677c5623fee0d409d0b8673fa839f1459b78e2511ce95f8ff5ed363f. Manufacturer capture hashes identify saved web-extractor results, not original PDF/HTML bytes. Direct manufacturer HTML/PDF retrieval returned HTTP 403, so no raw PDF hash is claimed. PDF screenshot requests yielded no inspectable image payload; table facts are text-extraction verified only, with visual review explicitly outstanding.

Full source responses are retained only in `analysis-only-source-captures` for inspection. Do not import or upload them. The proposed app evidence file contains concise facts and provenance, not full publisher text.

## Deliverables and stopping condition

- `minimal-market-proposal.json`: exact original lead, hash, proposed one-record promotion, historical reconciliation and counts
- `market-mazda-cx6e-lead-evidence-2026-10-12.json`: bounded evidence packet suitable for independent review
- `technical-candidate.json`: separate non-import two-grade facts/strengths/tradeoffs proposal
- `source-provenance.json`, `azami-selected-source-fields.json`, response metadata and `input-manifest.json`

The useful research outcome is established. Further resolution requires dealer confirmation of present unsold/physical status and exact build specification, or stronger manufacturer order/delivery evidence; no supplier was contacted. Root should apply only after independent review and completion of the current checkpoint-94 save.
