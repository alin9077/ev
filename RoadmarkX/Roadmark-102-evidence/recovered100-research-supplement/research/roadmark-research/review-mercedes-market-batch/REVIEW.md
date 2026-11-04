# Independent Mercedes market-batch review

## Decision

APPROVED for exact evidence-only held-lead storage: batch `mercedes-five-market-leads-2026-10-12`, candidate SHA-256 `42b92bc028673a2af0aa7730dcfb8fa24dfc84e834b1462289629a0b85a13df6`.

The five approved proposal identities are `mercedes-benz-eqb`, `mercedes-benz-eqe-sedan`, `mercedes-benz-eqe-suv`, `mercedes-benz-eqs-suv`, and `mercedes-benz-maybach-eqs`, each only at its exact before/after hashes in VERIFICATION.json. Approval permits no vehicle, availability, order acceptance, physical-stock, trim, price, technical-specification or ranking admission. No application changes were made.

## Integrity and minimal-change safety

- Both complete baseline-file hashes match current application data. All five before objects and canonical before hashes match the current unverifiedLeads entries
- Exactly sourceUrls, checkedAt, evidenceNote and limitations change. Held order/stock states, unresolved status, empty trims/aliases/related records and rankingEligible=false remain unchanged
- All 97 manifest files match their byte lengths and SHA-256 pins. All 19 selected evidence records resolve to matching capture pins, requested URLs, final URLs and observation timestamps
- The EQB extracted product object exactly matches the JSON product object parsed as data from the saved original HTML. No application or candidate code was executed
- No new records or count/ranking deltas are proposed. This review does not verify the whole application or claim that runtime checks passed

## Evidence findings

1. EQB: the embedded manufacturer product object identifies offer MB2RJ6VMXC, EQB 250+, manufacturer model year 2026, production 15 May 2025, and last product update 9 October 2026. Its NEW_CARS product type coexists with CPO and DEMO stock categories. That ambiguity warrants the hold. The Toowong dealer page says Demo, and Sydney City Edition is Pre-Owned/ex-demo
2. EQE sedan: saved request metadata and final-page title/canonical agree on the generic sedan redirect. Berwick’s exact advert says Pre-Owned and identifies EQE350 4MATIC. The Sydney EQE300 ex-demo description comes from a five-month-old search extraction; the saved direct request now ends at the stock index. The candidate correctly distinguishes these
3. EQE SUV: the legacy official page is reachable and has enquiry/Build/Buy links, but its generic order FAQ does not establish exact currently accepted Australian orders. The descriptive URL records a 404 error without a response body. Brighton’s Pre-Owned advert is present in an older search extraction while the direct request redirects to the showroom. Historical August 2023 technical applicability is retained as a limitation, with no PDF numerical values newly promoted
4. EQS SUV: the descriptive URL records a 404 error; the old campaign’s direct request ends at the generic electric range. The exact Canberra EQS450 advert is Pre-Owned. Its SUV field and saloon prose conflict, so retaining the hold without importing technical identity is sound
5. Maybach EQS: the fresh saved brand-page body features EQS680 and Night Series. The campaign’s direct request and final canonical point to a generic model list; older web-extractor campaign content is not current-page proof. Sydney’s exact EQS680 advert is Pre-Owned. No independent mechanical-grade status for Night Series is established

The electric range’s ten model cards and returned configurator do not establish the five families’ current exact order scope. Absence from these pages or this bounded dealer sample is not proof of national unavailability. Low kilometres, a new-car warranty, an inStock field, generic shopping links and seller-advertised years are not promoted into new-condition, live-order or manufacturer-model-year claims.

## Provenance qualifications

This is an independent review of saved material, not a second network fetch. Original HTML response bytes, locally derived text/product JSON, web-search/extractor responses and request metadata are correctly distinguished by the bundle. Recorded observation times are not manufacturer publication dates. The two 404 entries provide error metadata only; no absent response body is claimed. Older search results remain usable only for the qualified historical-advert statements.

Keep the candidate and capture-manifest pins with any application change: the proposed sourceArtifacts arrays still name the earlier inventory/evidence files, so those arrays alone do not identify this new research bundle. Full captures remain analysis-only and must not be delivered or uploaded as buyer materials.

## Buyer-facing wording

Nonblocking for this exact held-lead storage change: “pinned fresh HTTP outcome”, “grade/order matrix”, “numeric ranking admission”, “strict New” and raw NEW_CARS/CPO/DEMO labels are research language. The current source component reads inventory.records, not unverifiedLeads; the portable runtime inspected outside embedded data also contains no unverifiedLeads access. Thus no direct display of these amended notes was found statically. This is not a browser-rendering test.

If the notes later become buyer-facing, use plain language such as “the latest checked page”, “versions currently available to order”, “new-car availability is still unconfirmed” and “the manufacturer uses conflicting new, demonstrator and pre-owned labels”. BUYER-COPY-SUGGESTIONS.json provides optional rewrites; it is not an alternate approved application proposal.

## Review boundary

Read-only application/candidate inspection and static JSON parsing/hashing, plus new review files only. No Git, application edits, imports, syntax checks, execution, tests, builds, browser, live-source retrieval, upload or Codex task occurred. Runtime and integration verification remain with the parent. Recheck the before hashes immediately before any eventual application change.
