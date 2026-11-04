# Checkpoint102 source candidate: independent static review

Verdict: **GO_STATIC_SOURCE_CANDIDATE**

Reviewed 12 October 2026. No blocking findings and no required source amendments. This verdict concerns only the frozen source candidate, not application execution, QA, emitted artifacts, browser behavior, durable checkpoint storage or release acceptance.

## Exact review subject and method

- Candidate: `roadmark-research/trike-checkpoint102-candidate`
- Manifest SHA-256: `ac9860734726b5b23424df7875c64baa58b22c725614eeea2b09a7f049de59ef`
- Unmodified live predecessor: `roadmark-work/roadmark`, checkpoint101
- Candidate consists of exactly 18 application paths: 11 modifications and seven introductions
- All candidate file lengths and SHA-256 values matched the manifest. Every modified path's preserved preimage matched both its manifest identity and the live predecessor bytes. Every introduced path was absent from the live app. The candidate files/preimages directories contained exactly those declared sets
- All 1,684 paths in `roadmark-rebuild101/final-authored-inputs.json` still matched their frozen hashes, and all 23 fixture preservation pins matched the live predecessor
- Independently read/diffed the new and affected source/tests, parsed JSON, recomputed counts and hashes, compared field contracts, and statically reconstructed historical data. Python and shell were used only for independent read-only inspection/calculation and writing this review
- No application/candidate JS or TS import, application execution, generator invocation, test, typecheck, lint, structural validator, build, browser, network research, Git operation, candidate edit or live-app edit occurred

All line references below are relative to `candidate/files/`, unless an unchanged live predecessor path is identified explicitly.

## Data and evidence boundary

PASS. `data/market-inventory-2026-10-10.json:24425` introduces the sole audit record, `ozetrike-mate150`. It has `trims: []`, `stockStatus: unverified`, advertised order requests, `completeVehicleCountEligible: null`, false ranking/physical-stock/factory-order flags and null stock quantity/model year. The projected evidence note and limitations preserve the physical-stock, acceptance, delivery, individual registration and lithium-approval holds.

Five appended unresolved rows begin at lines 30135, 30190, 30253, 30312 and 30360: KYBURZ DXP, CT-KARGO, CT-KUBE, OzPOD and Mate150L. E-QL150 is appended to the peripheral array at line 32317, with unresolved road eligibility, `coreRoadVehicleRecord: false`, `orderStatus: not_current` and `vehicleClass: other`. KOOL remains a source-listed derivative within CT-KARGO; the Mate150L link resolves to the one admitted family. Seven dispositions represent six family groups. All exact trims remain empty.

Independently recomputed the following from arrays rather than trusting the candidate's static-check report:

- 243 audit records, 148 unresolved entries, 21 reconciled leads, six peripheral entries
- 395 named trim/configuration entries, 55 missing exact-trim sets, 69 advertised-stock rows
- Motorcycle records 41; passenger114, bus28, truck28, ute13 and van19 unchanged
- Advertised-order-request records eight; listed_unconfirmed193, accepting_orders36, not_current4 and preorder2 unchanged
- Duplicate-merge count six and detailed context345 configurations/150 families unchanged

Every previous row and array order is retained exactly. The only changed canonical keys are scope, notes, unresolvedMarketUniverse, records, unverifiedLeads, peripheralRecords, sourceArtifacts, counts, countQualifications and coverageGaps. Each is represented by an exact append or scope/count replacement in the fixture. All other keys/unknown values remain unchanged, including global checked date, completeness, validation holds, historical metadata, detailed context and existing related leads.

IDs are unique within each collection; no new ID, normalized name or alias collides with old identity/name/alias values. Exactly the same 13 historical record/reconciled-lead ID overlaps remain. This applies the accepted correction to the plan's original global-uniqueness wording.

The sidecar's 22 unique source IDs resolve to the exact saved URLs and observation date. Its seven row copies equal the new canonical rows. All research-artifact and accepted-review file hashes/lengths match the saved evidence. The sidecar clearly distinguishes supplier AU$6,195 from marketplace AU$6,386.55 and does not turn ACTIVE/InStock/Buy It Now into physical stock. Type-level LB approval, lead-acid RVD scope, applicant-supplied specification caveats, no exact-build/VIN/RAV bridge, and no lithium transfer remain explicit. No renewed source retrieval is claimed.

## Projection and scope preservation

PASS. The existing live `scripts/generate-market-view.mjs:6–11` fixes 14 record fields and five top-level fields. Independently selected precisely those fields, preserving key/array order and optional absence, and reproduced the candidate's complete 449,469-byte projection exactly. There are 243 projected records. No hidden audit collections, family metadata, stock quantities, type-approval object or advertising object enters the projected client data.

The only component changes are `src/components/market-audit.tsx:34` and `:68`: the motorcycle grouping label and scope sentence. The projected import, search predicate, filters, reset, 24-row pagination, source links, disclosures and buyerDisplayCopy calls are otherwise byte-identical. Static matching of the unchanged search algorithm and new data gives one Mate150 card for Mate150/OZ eTrike/OZetrike/JP1500DZH-B and no cards for held candidates or Cargo 01/02.

Generator, canonical/projected providers, portable providers/build script, package scripts/lockfile, 32-byte codec, types, detailed source/catalogue/buyer data, discovery/ranking code, hero, art and CSS are unchanged. The frozen authored-input map independently confirms no live predecessor drift. Portable providers still reference the complete canonical market; actual emitted artifacts remain a later verification gate.

## Strict market adapter

PASS. `tests/helpers/checkpoint102-market-history.ts:20–25` pins the exact fixture and returns a deep copy to callers. Lines 26–29 recognize only whole-hash-exact value or exact-path/raw-byte identities. Lines 32–47 require the whole approved102 ordinary-JSON hash before reversing the exact reviewed append/metadata operations, then require the complete101 semantic hash. Lines 51–59 additionally require raw102 length/hash and exact101 serialization/length/hash.

Independently reconstructing from the reviewed fixture reproduced exact canonical101 bytes:

- 1,653,304 bytes
- SHA-256 `2469610f9bea19221ed99483b01ca23ca4f9bb62356a873398e9895c2eb838ac`

Applying the unchanged100 and99 fixture deltas as static data operations also reproduced their pinned full semantic/raw predecessors, through98. No candidate helper was executed. The candidate's ordinary-JSON hashes agree with independent static serialization, anchored by byte-exact predecessor reproduction and the unchanged historical pins.

The helper does not import legacy adapters or application code. It neither accepts counts-only equivalence nor regenerates an alleged historical projected view.

## Strict coordinated source adapter

PASS. `tests/helpers/checkpoint102-source-history.ts:17–39` checks every modified and introduced file before returning a reader. Every nonmarket modified preimage is stored as exact text, and every predecessor's byte length/hash is rechecked. The canonical preimage is reconstructed only through the strict market adapter.

The fixture contains exactly the manifest's 11 modified and seven introduced paths. At `:40–44`, reader requests reject unsafe/aliased paths and all introduced-file predecessor requests. Cached predecessors and passthrough reads are copied on return.

Bootstrap exclusions are explicit and bounded: fixture and both helpers avoid an impossible self-hash cycle. The market helper pins the fixture; the source helper pins the market helper; its own injected bytes must equal its disk bytes. The external reviewed manifest binds all three, as well as tests and documentation. This is acceptable only with a fresh external seal immediately before application/execution; it is not an independent self-authentication claim.

Old101,100,97 and96 helper implementations and fixtures retain their original bytes and pins. Direct102 data/source continues to fail their unnormalized contracts. The102→101 reader's exact predecessor state satisfies every unchanged101 fixture source pin. The99 four-file data delta and101 source-pinned file sets are disjoint, supporting the preserved nesting order.

## Historical wiring and test coverage

PASS by source review, with execution pending.

- `tests/helpers/checkpoint99-history.ts:16–20,58–71` adds only exact102 normalization before the unchanged100 normalization and99 assertions. Unknown/mutated102 inputs cannot become accepted historical data. Existing95 and buyer-copy consumers inherit this central normalization
- `tests/helpers/checkpoint91-history.ts:20–28` puts102 before the old99/101/97/96 chain and leaves the existing pin loop/exclusions unchanged
- Existing96 and97 source tests wrap the raw reader in102 before101, retaining their original assertions and pins
- Existing99/100 tests receive exact historical market values/source rather than changing literal historical counts or weakening negative assertions
- Current market-audit advertised-order-request count changes only7→8; the stock enum remains unchanged
- `tests/market-view.test.ts:14–23,43–64` remains current projection/render parity coverage, with243 records, while its specific101-history test receives exact102→101 preimages
- `tests/checkpoint102-history.test.ts:21–50` covers nonmutation, returned-copy isolation, repeated reversal rejection, untouched100 direct-input rejection and100→99→98 byte/value chaining
- Lines52–89 cover target/unrelated mutations, removal/duplication/reordering, metadata/date/count/status/source/trim/lithium/peripheral changes, whitespace/CRLF/truncation/same-length byte edits and noncanonical byte-entry paths
- Lines92–123 cover every reviewed path's exact preimage, direct102-to101 rejection, introduced-path rejection, path aliases/traversal/query/fragment/backslash/encoding rejection, fixture copy isolation, every changed/introduced file mutated or missing, mixed101/102 states and the full source-history chain
- `tests/checkpoint102-trikes.test.ts:19–107` covers placements, families, conservative fields/counts, exact source mapping/sidecar rows/prices/holds and source-artifact identity
- Lines109–153 exercise the actual compiled component source for accepted queries, labels/stock/trim/limitations/source links, absence of held candidates, repeated evidence filters, reset, pagination and search reset
- Existing market interaction, buyer-copy and portable full-canonical tests are unchanged; existing broad package test/lint/typecheck globbing includes the newly introduced tests

No preexisting test or historical assertion was removed. This review does not predict a passing test count or claim runtime/type-system correctness without the later allowed run.

## Decision and remaining gates

No patch is required for this frozen candidate. Root may accept this source review and move to the already planned gated application/verification workflow after freshly checking the candidate and predecessor seals.

Any candidate amendment requires a distinct new revision/hash and re-review. A generator result that differs from the reviewed projection is a discrepancy to resolve rather than silently accepting a new file. Retain failed-stage evidence and all preexisting tests. Full engineering checks, actual Next/portable output inspection, browser behavior, source/artifact pairing and durable save/readback remain outstanding. Nothing here establishes current deliverability, complete market census, performance improvement or release readiness.
