# Roadmark: bounded road-trike integration plan

Prepared 12 October 2026. Static plan only; no application imports, execution, tests, builds, browser use, Git actions or live application edits were performed.

## Recommendation and decision boundary

Use the next separately reviewed checkpoint (called **102** below as a planning label) to append **one Mate150 market-audit row, five unresolved lead entries, and one peripheral future candidate**. Retain all six family groups and seven dispositions from the research. This is a market-audit change, not a detailed-catalogue, ranking, physical-stock or complete-market admission.

The final independent review at `roadmark-research/trike-gap-review-2026-10-12/review.json` is `GO_BOUNDED_MARKET_AUDIT_ONLY`; the parent confirms root acceptance and a durable research/review save. This plan adopts its restrictions, including `stockStatus: "unverified"`, `physicalStockQuantity: null` and `completeVehicleCountEligible: null`. Integration is still gated on acceptance of this exact mapping and a separately reviewed source candidate. A research GO is not source, QA, artifact, save or release approval. No independent factual findings are added by this plan.

Keep current101 as the exact predecessor. The current101 source projection must survive: the Next market client receives only the existing 14 record fields and five top-level display fields; the portable build retains the complete canonical market object. Do not weaken historical hashes to make the new data pass old tests.

## Verified starting point

Static JSON and file inspection found:

- Canonical market file: `data/market-inventory-2026-10-10.json`, 1,653,304 bytes, SHA-256 `2469610f9bea19221ed99483b01ca23ca4f9bb62356a873398e9895c2eb838ac`
- Current view: `data/market-view.generated.json`, 446,265 bytes, SHA-256 `e9324e71479402b0e8d3c2e832c6cc0ed6b4be4f0097b6603214474804faed6e`
- 242 audit records, 143 unresolved entries, 21 reconciled leads, 5 peripheral entries, 395 named entries, 69 `new_stock_listed` rows and 54 rows with no exact trim set
- Detailed context: 345 configurations / 150 families, unchanged by this proposal
- Current101 is a 14-file source delta from100: eight modified, six introduced; its authored-input map has 1,684 paths
- The supplied parent context says current101 was verified and saved with 990 tests. The existing serial QA result reports passing stages and build `oWIsGbFiaYgzVUEyU5Zrg`; these are historical101 results, not fresh102 results
- Existing root README/start instructions still describe91. Preserve them as inherited historical bytes in this narrowly scoped candidate; they must not be used as the new checkpoint's status record

`baseline-inputs.json` records exact relevant file identities and the static authored-map check. The research packet's no-match duplication check agrees with the current canonical hash. Recheck after any concurrent work before preparing a candidate.

Read instructions: `AGENTS.md`, `CLAUDE.md`, `README.md`, `START-HERE-ROADMARK.txt`, `START-HERE-DOT.txt`, `IMPLEMENTATION_PLAN.md`, `docs/ARCHITECTURE.md`, `qa/ACCEPTANCE_TESTS.md`, package scripts and the installed Next `use-client` guide. The client import boundary is intentionally preserved.

## Seven dispositions, six family groups

These are proposed canonical placements, conditional on the final independent review. They are append operations; no existing family or lead is silently replaced.

1. **OZ eTrike Mate150** (`ozetrike-mate150`): append to `records`. Use `orderStatus: accepting_order_requests_advertised`, `stockStatus: unverified`, `rankingEligible: false`, `completeVehicleCountEligible: null`, `physicalStockQuantity: null`, `physicalStockVerified: false`, `factoryOrderAcceptanceVerified: false`, `modelYear: null`, `catalogueCoverage: market_audit_only`. Retain positive seller advertisement evidence separately. Use `trims: []`, `sourceListedConfigurations: ["Mate150"]` and a qualified trim-coverage label such as `advertised_model_offer_exact_trims_unverified`. The final review establishes a named advertised model offer but no separately named retail grade. Store AGM/hydraulic-tipper description in evidence text rather than inventing a compound factory trim name. A named-trim entry can be considered later only on separately approved evidence. `Cargo 01` and `Cargo 02` are type-approval variants, not two retail entries.
2. **KYBURZ DXP** (`kyburz-dxp`): one `unverifiedLeads` entry. `listed_unconfirmed`, `unverified`, unresolved, ranking/count ineligible. Preserve source-listed `DXP 5.3 Australia` in `sourceListedConfigurations`; `trims: []` is the conservative exact-current-retail-trim position. Preserve the local/generic power conflict; no synthesized replacement trim or current-stock inference.
3. **EMoS CT-KARGO** (`emos-ct-kargo`): one `unverifiedLeads` entry. Same held statuses. Preserve `CT-KARGO` and `CT-KARGO KOOL` as two source-listed configurations inside this one family; do not make KOOL an eighth disposition or seventh family. Current exact retail trims stay held. Record dealer approval language as an attributed claim and failed direct retrieval/index age as limitations.
4. **EMoS CT-KUBE** (`emos-ct-kube`): one `unverifiedLeads` entry. Same held statuses. Keep its three cargo-body options in evidence-only metadata, not three trims or independent models. Do not turn an inaccessible page into a discontinuation finding.
5. **Stealth Special Vehicles OzPOD** (`stealth-ozpod`): one `unverifiedLeads` entry. Same held statuses. Fresh product-page presence alone is not current new supply, accepted orders or exact approval. No MilPOD/QuadPOD/C-17 inheritance.
6. **OZ eTrike Mate150L** (`ozetrike-mate150l`): one separate `unverifiedLeads` entry with `familyId`/`relatedRecordIds` joining `ozetrike-mate150`, `orderStatus: preorder`, `stockStatus: unverified`, and future-batch advertising in evidence-only metadata. It is the seventh disposition but not an additional independent family. Its December forecast, advertised batch quantity, deposit and lithium claims stay supplier-attributed. Explicitly mark lithium approval unverified; never inherit the base lead-acid RVD, put Mate150L in base `trims`, or count advertised batch units as physical stock.
7. **Jinpeng E-QL150** (`jinpeng-e-ql150`): one `peripheralRecords` entry with `coreRoadVehicleRecord: false`, `peripheralCategory: future_road_eligibility_unverified`, `orderStatus: not_current`, `stockStatus: unverified`, ranking/count ineligible. This placement records a future candidate with unresolved road eligibility, not proof that it is off-road-only. EOI is not preorder. Do not join it to JP1500DZH-B/Mate150 merely because of the Jinpeng brand.

For all seven: retain `checkedAt: 2026-10-12` as the source-observation date, exact saved `sourceUrls`, source IDs/sidecar references, a bounded `recordScope`, explicit limitations and false ranking eligibility. No new public retrieval or contact is needed to implement this approved saved-evidence packet; if implementation is delayed, preserve the observation date and never imply renewed current availability. Source publication dates, approval dates, seller years, observation dates and future forecasts remain distinct.

### Classification without expanding the ranked catalogue

Use the existing market grouping `vehicleClass: "motorcycle"` for the six road-trike/base/derivative records and leads, plus a precise evidence-only `vehicleType: "electric_road_trike"` or candidate subtype. This is a Roadmark display grouping for moped/motorcycle-category road vehicles; it is not a new legal or per-VIN classification. Preserve the exact regulatory LB scope for Mate150 in its evidence. E-QL150 remains `vehicleClass: "other"` in the peripheral collection because exact road eligibility is unverified.

Change only the market UI's motorcycle label to **“Motorcycles, scooters & road trikes”** and its scope sentence to include road trikes with cited road-use evidence. Do not create a `trike` VehicleClass enum/ranking cohort in this checkpoint. `src/lib/types.ts` need not change. The detailed discovery label need not change because no detailed trike enters discovery.

## Exact counter effects for this recommended mapping

- `consolidatedModelAuditRecords`: 242 → **243**
- `byVehicleClass.motorcycle`: 40 → **41**; bus28, passenger114, truck28, ute13 and van19 unchanged
- `byOrderStatus.accepting_order_requests_advertised`: 7 → **8**; listed_unconfirmed193, accepting_orders36, not_current4 and preorder2 unchanged because those counters cover `records` only
- `namedTrimConfigurationEntries`: **395**, unchanged; the model offer is not promoted to an exact trim
- `exactTrimSetMissingRecords`: 54 → **55**, because the new Mate150 record retains empty exact trims
- `newStockListedModelRecords`: **69**, unchanged; no stock promotion
- `unresolvedLeadGroups`: 143 → **148**. This inherited counter is the number of unresolved array entries, not a newly asserted distinct-family count. Five added entries include four new unresolved families and the derivative Mate150L of the admitted family
- `reconciledLeadGroups`: **21**, unchanged. None of these target names existed, so do not fabricate original leads or reconciliation history
- `peripheralRecords`: 5 → **6**
- `duplicateModelMerges`: **6**, unchanged. No merger was performed; KOOL and Mate150L have explicit family relationships
- Detailed context: **345 configurations / 150 families**, unchanged; sources, summaries, detailed additions and ranking groups unchanged
- Verified physical stock units in this research: **0**; verified current-deliverable complete vehicles newly admitted: **0**

Do not present 243 as a currently buyable-vehicle count, 148 as 148 independent families, 395 as 395 factory grades, or six families as six current Australian new offers. Do not count the source-listed model label or the two approval variants in the named-trim total. Any alternative trimmed mapping requires explicit evidence-review approval and newly computed counters.

## Canonical data and evidence operations

### Existing canonical file: tightly allowlisted operations

Append to `records`, `unverifiedLeads` and `peripheralRecords` in the counts/order above. Preserve every previous row, unknown field and order exactly.

Recompute `counts` by the repository's existing collection semantics, with the explicit values above. Append the new approved evidence artifact identity to `sourceArtifacts`. Append a targeted dated `notes` item: this research found one advertised-new Mate150 offer and held the other dispositions; it did not reverify the inventory. Add a bounded `countQualifications` item explaining six families/seven dispositions, derivative counting and no physical-stock/trim inflation. Add one `coverageGaps` item for current supply/approval/exact-build resolution across these candidates and one `unresolvedMarketUniverse` category for road-going electric delivery/cargo trikes. Amend only the current `scope` sentence needed to include non-pedal road trikes explicitly.

Keep top-level `checkedAt: 2026-10-10`, `complete: false`, all validation false flags, `coverageStatus`, `scopeClarification` and all `historical*` fields unchanged. The global checked date is not advanced by a targeted new check. `detailedCatalogueContext`, `reconciledLeads`, existing EMoS/WYLD/Horwin leads, deduplication history and motorcycle exclusions remain byte/value-equivalent.

### New evidence sidecar

Add `data/market-road-trikes-evidence-2026-10-12.json`, containing the accepted seven dispositions, their exact source-ID/URL/date relationships, limitations, final review reference and research hashes. Retain the 22-source packet as provenance without treating all 22 as current-sale proof. Preserve short excerpts within the research's limits; do not create missing full source bodies or imply the packet contains them.

Within the sidecar and Mate150 `advertisingEvidence`, distinguish the supplier advertised price from the separate eBay listing amount and advertising metadata. ACTIVE/InStock/Buy It Now describe the seller page, not physical inventory or a completed order. The final independent reviewer requires canonical `stockStatus: unverified`. The original packet field `new_offer_advertised_not_unit_verified` is a research description, not an allowed new canonical status.

Keep type-approval identity, scope, RVD battery chemistry and approval variants source-bound. No VIN/RAV/state-registration verification, lithium approval, model year, exact-build bridge, payload arithmetic, current delivery, or ranked technical facts are inferred. Do not add to catalogue-additions, buyer summaries, feature overlays or the detailed source registry.

### Current buyer-facing evidence copy

The Mate150 `evidenceNote` should explicitly say that an Australian seller advertises a New Mate150 offer, with order requests advertised, and that physical stock, seller acceptance, delivery and individual registration remain unverified. Explain the supplier-to-type-approval join and lead-acid scope in limitations. Keep a visible limitation that Mate150L is a separately named future lithium preorder whose approval is unverified; the base record must not transfer approval to it.

Important caveat: current `/market` renders `records` only. The five leads and peripheral candidate will be retained in the canonical audit and portable evidence, but will not become searchable result cards. That is intentional for this minimal checkpoint. Say so in the checkpoint note; do not claim every held candidate is visible in search. If a later user-visible lead browser is required, scope and review that as a separate UI change rather than pulling hidden audit collections into the client bundle now.

## Projection and UI preservation

The generator `scripts/generate-market-view.mjs` is already sufficient. Leave its record/top field allowlists and implementation unchanged; regenerate `data/market-view.generated.json` once after the approved canonical edit, then use its non-writing check in all verification paths.

The view must have exactly the same field contract, array order and optional-field absence as canonical consumption. Newly appended provenance, approval/advertising metadata, unresolved leads, peripheral entries and historical records stay out of the Next market client. Necessary cautions must be in projected `evidenceNote`/`limitations`, not only hidden metadata.

Leave `src/lib/market-view-data.ts`, `src/lib/market-inventory-data.ts`, `src/portable/data.ts`, `src/portable/market-inventory-data.ts`, `scripts/build-portable.ts`, `package.json` and the 32-byte string codec unchanged. Preserve both portable aliases and full canonical `data.marketInventory`; do not ship a second projected dataset in the portable artifact.

For `src/components/market-audit.tsx`, change only the grouping label and scope sentence. Preserve the projected import, search inputs, status filter, class predicate, reset behavior, 24-row pagination, source links, evidence disclosure order and buyerDisplayCopy calls. No new stock/order status label is required: the existing labels correctly render advertised order requests and unverified stock. Do not expand the scope into a design/layout change.

## Historical compatibility: preserve old contracts, add one new boundary

A new JSON row alone is insufficient. Existing100/99 reconstructors require whole-value/whole-byte matches. The101 source reader validates the whole coordinated runtime delta, including the generated view, market component and modified historical-test entrypoints. Directly passing new data/source to these old contracts must continue to fail.

### New102 test-only boundary

Add `tests/helpers/checkpoint102-market-history.ts`, `tests/helpers/checkpoint102-source-history.ts` and `tests/fixtures/checkpoint102-trikes.json` (names are proposed). Separate market/value reversal from the source reader to avoid importing legacy helpers into the new base layer.

The fixture must capture every reviewed changed path, exact preimages/postimages and lengths, raw plus ordinary-JSON hashes of the full canonical market, exact appended rows/metadata edits/counters and all introduced paths. Bind exact prior101 bytes from the current baseline, including the existing101 projection. Verify the complete102 changed-file state before exposing any101 predecessor. Source preimages may be stored as exact text or unambiguous reviewed deltas; never regenerate an alleged old view with a newer generator or accept only matching counts. For the large market file, exact allowlisted reversal plus verified original serialization is preferable to duplicating the full inventory text.

Every market reversal starts with a whole approved102-value hash, verifies the exact seven appended dispositions and metadata operations, undoes only those operations, then requires the exact full101/100 semantic hash. The byte entrypoint additionally checks exact raw input SHA/length and the exact raw predecessor. The current canonical101 equals canonical100, so the existing100→99→98 chain can then remain intact.

Do not repin `tests/fixtures/checkpoint101-source.json`, `qa/checkpoint100-market-fixture.json`, `qa/checkpoint99-mazda-fixture.json` or older fixtures. Keep the implementations and hashes of the101,100,97 and96 helpers untouched. Keep new helpers test-only. Preserve path safety, no-predecessor checks for introduced files, copy-on-return, non-mutation and strict rejection of mixed states. Exclude fixture/self-helper hash cycles explicitly; an external reviewed input map must bind all newly introduced fixture/helper/test bytes.

### Minimal wiring, with historical assertions unchanged

1. `tests/helpers/checkpoint99-history.ts`: prepend only exact102 market normalization before its existing100 normalization, for both byte and value entrypoints. Keep every99/100 hash, reversal and assertion unchanged. Only a whole-hash-exact102 value/file may normalize; unknown/mutated values still reach the existing fail-closed rejection. This centralized entry covers existing95 and buyer-copy callers without editing each historical consumer. Record this helper's exact101 preimage in the102 fixture; do not pretend it was unchanged.
2. `tests/helpers/checkpoint91-history.ts`: place `createCheckpoint102SourceReader(rawRead)` before the existing99/101/97/96 source chain. Keep its existing34-pin loop and exclusions unchanged. The new102 reader restores this helper's exact101 text, then the unchanged101 reader restores its exact100 text for older textual assertions.
3. `tests/checkpoint96-source-history.test.ts` and `tests/checkpoint97-source-history.test.ts`: wrap their raw reader in102 before101. Keep all historical assertions and pins. Their old source bytes are also102 fixture preimages because101 currently pins both files.
4. `tests/market-view.test.ts`: use live102 canonical/view for projection/render parity and change its current record assertion to243. For the specifically historical101 reader test, provide `createCheckpoint102SourceReader(rawRead)` as the101 input. Mutations targeting101 then operate on exact historical101 values; new102 tests separately mutate current102. Preserve the101 introduced-path and unsafe-path assertions.
5. `tests/checkpoint99-mazda.test.ts` and `tests/checkpoint100-market.test.ts`: bind the historical `market` variable and raw-source reader to exact102→101 predecessors so their literal242/395/143 checks retain their historical meaning. Keep assertions and old failure cases; add102-specific mutation coverage separately. The centralized99 normalization handles `dataBeforeCheckpoint99` calls that still read live disk.
6. `tests/market-audit.test.ts`: this is current-state coverage, so its exact advertised-order-request count changes7→8; do not change its stock enum. Expand current counter assertions in the new102 tests rather than weakening existing guards.

This is eleven modified existing authored files including canonical data, generated view and UI; add the new evidence, fixture, helpers, tests and integration document. The exact reviewed candidate manifest, not this estimated count, is authoritative if a dependency/type issue requires another change. Do not broaden scope silently.

## Test and acceptance gates (later implementation only)

### A. Evidence and candidate approval

- Read the final independent review; verify its packet/source/review hashes and accepted seven-disposition map. Root accepts the exact mapping, no unsupported stock enum and no lithium/retail-trim transfer
- Freeze current101 baseline and exact authorized changed/introduced path map. Preserve every previous authored input outside that allowlist
- Independently inspect the candidate and strict history adapters; no application execution until that review permits the run

### B. Static data and adversarial history

- Unique IDs across all four canonical collections; no exact-name/alias collision with existing EMoS/WYLD/Horwin leads
- All counts derived independently from accepted collection semantics; assert exact old arrays are prefixes, seven new dispositions and six family groups, KOOL contained and Mate150L family-linked
- All old canonical keys/rows/source order retained outside explicit metadata operations; top global date and all complete/ranking/physical-stock holds preserved; Mate150 complete-vehicle eligibility remains null, never true
- All evidence source IDs resolve to exact sidecar URLs; no template source IDs, invented retrievals or missing artifact hashes
- Byte and semantic102→101→100→99→98 reconstruction; complete older chain remains exercised
- Reject altered/deleted/appended/reordered target and unrelated rows; altered source URLs/dates/statuses/counts; unknown metadata drift; same-length edits; whitespace/CRLF raw drift; missing/old/mixed files; changed fixtures; mutated introduced files; path aliases/traversal/query/fragment/backslashes; repeated reversal; introduced-file predecessor requests. Test returned buffers/clones cannot mutate cached evidence
- Preserve original101 fixture SHA `0a00252acf24358b9fa8551b08f90d04744487b45b14c194ac861485b7dabddb`,101 helper SHA `714bedc3eec27366a4421f15846d71b05cc99fbd7fd2a128fa08ee461b72cb62`,97 helper SHA `838dd04e58cf9185bb483294d5cf3614f08d0e31f23a1914ce485152cedca44e` and96 helper SHA `fe9d9db20d712e71971c4a7458762cfd3653c6addc5cb019b42372be4b0c6d16`

### C. Projection and actual component behavior

- `generate:market-view` is an explicit approved write; `check:market-view` is a non-writing freshness gate. Mutated/stale projection must fail
- 243 projected records with exact consumed values/order/optional absence and unchanged14-field/5-top-field contract
- Full canonical versus projected component render parity across every24-row window, including new row and count/scope copy
- Search Mate150 and approved aliases; class filter displays road-trike grouping; order filter finds advertised requests; stock displays “Stock not verified”; source links and limitations render; no Cargo01/02 trim inflation or lithium approval claim
- Reset/search/filter pagination and repeated interactions retain existing behavior. Held leads do not appear as cards or ranked/detail variants
- Source-copy guards remain intact; new evidence prose is already buyer-readable rather than relying on a broad rewrite rule

### D. Full engineering verification

After candidate review, use a newly pinned serial runner derived from the actual101 workflow, with truthful actual terminal receipts and frozen input seals. Run focused new/affected tests, the full non-HTTP and local-HTTP suites, typecheck, lint, structural validation, production build and portable build against the exact final source. Keep all990 preexisting101 tests represented; report the actual new total rather than predicting a pass/count. Run e2e/browser checks appropriate to market flows separately. Structural validation alone is not evidence approval.

The exact commands/environment/heap allowances and runner input boundaries must be reviewed for the new candidate, not blindly inherited from an old path. Failed stages and retry evidence remain preserved. Do not count source101 QA as102 QA.

### E. Emitted artifacts, browser and performance

- New portable embedded data must decode to the **complete new canonical audit**, including all five new leads and the peripheral candidate; all four portable aliases agree
- Record every expected artifact change. Portable HTML/data and the market component's bundled JS will change in this candidate, so101's whole-portable-byte-equality proof cannot be reused unchanged
- Unrelated detailed cars, sources, summaries, ranking groups, static transport bodies, original hero/nine points, CSS and protected visual assets retain exact intended boundaries
- Keep Next market client free of hidden audit metadata; verify the emitted market chunk/projection, not merely source import intent
- Recheck production and portable market flows on dot's own browser at desktop and narrow width after authorized implementation. Check repeated filter changes, reset, pagination, disclosure/source links and navigation. State precise limits, including any browser errors
- The101 raw initial-route payload reduction remains historical101 evidence; measure the new route against a clearly named baseline if making a102 performance claim. No claim of faster phones, memory fix, sustained stability or release readiness follows from file-size data

### F. Durable checkpoint and reporting

Save small cumulative checkpoint capsules at useful boundaries under the existing authorized save workflow; distinguish WIP/reviewed/QA-passed/verified stages. Preserve current101 and every old save. A local ZIP is not a durable save; require actual supported save receipts before saying it is saved. Final packaging needs explicit source/preview pairing, exact restore/readback and root acceptance. Publishing, release approval and complete-market closure remain separate and unestablished.

## Documentation and scope of this plan

Add `docs/TRIKE_MARKET_INTEGRATION_2026-10-12.md` with final accepted placements/count meanings, evidence links, hold states and actual verification results. Use a new102 recovery/read-first file in the next checkpoint's packaging to point at that note and distinguish the inherited91 root docs. Do not relabel old README/QA history as102, overwrite101 artifacts or add execution results before they exist.

No application or candidate edits were made by this worker. The only outputs are this research plan and its companion metadata under `roadmark-research/trike-integration-plan-2026-10-12`. Its conclusions describe a proposed implementation and acceptance route, not completed integration.
