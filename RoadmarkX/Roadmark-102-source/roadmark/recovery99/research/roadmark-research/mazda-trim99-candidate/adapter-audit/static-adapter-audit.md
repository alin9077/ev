# Checkpoint99 historical adapter audit

Read-only static inspection of checkpoint98 application source and tests, 2026-10-12 UTC. No application imports, app execution, tests, builds, browser, network or Git were used. No application files were changed. This document is an integration plan, not runtime verification.

## Result

A99 needs to reconstruct three coordinated data files, full runtime Research, and full runtime Car[] before older adapters run. The minimal existing helper touch points are checkpoint91-history.ts and checkpoint84-runtime.ts. Seven directly pinned test files also need scoped historical inputs. checkpoint96-source-history.test.ts has literal source-wiring assertions that must either see an exactly reconstructed predecessor helper or be deliberately extended without changing any historic numeric/hash pins.

Prefer wrapping individual historical assertions while leaving ordinary live-catalogue parity and validation tests live. Blanket replacement of imports can introduce double reconstruction and reduce new-catalogue coverage.

## Existing baseline

Data files and verified raw SHA-256:

- data/catalogue-additions-2026-10-10.json: ef6322d7e2dd416d209954e6049ba5821a252748ffb83a62fa521a557eb0752e
- data/buyer-selling-points-2026-10-10.json: fb674e43f2905858ff81a20dd59bf121874a395d61c7602a6816c8a0b884e633
- data/buyer-identity-snapshots-2026-10-10.json: e33ddb85e2f84b84dbf1de00b8ae2eae9940ac88e9b787837275666fc7505677

All three are two-space indented JSON with trailing LF. A byte adapter must actually reproduce and hash predecessor bytes, not return a stored old digest as if it were the live file's hash.

Catalogue additions currently contain models142, variants309, sources1772, facts28586, features957, auditNotes168. Proposal contains records334, dependencies4873 and expectedSourceSnapshots372. Ledger contains snapshots119. Preserve every existing field/key order and prefix; appended metadata must be declared separately. Top-level variantCount225 and other old proposal metadata are historical scoped fields, not unqualified live counts.

Old runtime pins: cars343, families149, models153, criteria69, feature rows23667; current327, outgoing11, provisional5. There are sources2196, summaries331 (paired329, strength-only2), and bounded configurations32. The two new grades would normally add138 research feature rows (2 x69) regardless of how many replacement feature records are supplied.

## Required helper wiring

### tests/helpers/checkpoint91-history.ts

1. Lines18-23: add the checkpoint99 verified-byte/data reader before createCheckpoint97SourceReader and createCheckpoint96SourceReader. The current raw callback means catalogue-additions hits the immutable source91 byte pin unchanged and would reject an append.
2. Line17 and line28: the JSON read used by core.previousStorage must reconstruct BOTH proposal and ledger before the unchanged91 storage check. That check pins full hashes, records334, dependencies4873, snapshots119, and the exact91 Brown suffix.
3. Line29: core.checkResearch must receive researchBeforeCheckpoint99(research()). It pins the entire object and all2196 source hashes.
4. Lines31-32: core.previousCars must receive carsBeforeCheckpoint99(cars). It pins full order, all343 Car objects, all331 summaries and the exact91 Brown summary.
5. Lines35-37: dataBeforeCheckpoint91's ordinary-data fallback must also read through A99. Otherwise dataBeforeCheckpoint84 ->82 ->73 ->71 sees changed catalogue additions and fails, even if the top-level byte check was fixed.
6. buyerProposalBeforeCheckpoint91 then works transitively from reconstructed previousStorage; no independent change in selling-points.test.ts is necessary.

Keep qa/checkpoint91/checkpoint91-history-core.cjs, checkpoint91-harness.cjs, fixture seals, before-app-input-hashes.json and all existing expected pins unchanged. The harness's isolated Brown test uses frozen fixture identity/sources with the actual unchanged evaluator and does not load the full live catalogue.

### tests/helpers/checkpoint84-runtime.ts

researchBeforeCheckpoint84(data = liveResearch()) directly asserts fixture.approvedResearchHash at line38. It bypasses A91 and must reconstruct99 before this assertion and before cloning/reversing84. Its Car and JSON routes already go through A91 and should not be wrapped99 a second time.

Downstream consumers then work transitively: checkpoint82-history, checkpoint73-history, checkpoint71-history, checkpoint62-motorcycles, checkpoint71-offer, checkpoint73-honda, checkpoint77-market, checkpoint80-market, checkpoint81-market, checkpoint82-strength, checkpoint83-market, remaining-electric-vans-catalogue, remaining-utes-vans, and selling-points.

## Seven directly pinned test files

1. tests/domain.test.ts:62-71: counts() expects343/149/153/69/23667/327/11/5. Use countsBeforeCheckpoint99 for this historical assertion; leave validateResearch and ordinary live tests live.
2. tests/research-refresh.test.ts:24: cars.length343. Assert carsBeforeCheckpoint99(cars).length. Its old edit counts and exact refreshed identities remain unchanged; no reason to remove new cars from unrelated validation.
3. tests/configuration-payload.test.ts:32: bounded.length32. Assert the old bounded count through carsBeforeCheckpoint99; keep projection/rank/strength parity on the full new catalogue if possible. New grades need their own current-count proof.
4. tests/checkpoint84-transit-city.test.ts:58-69: direct counts() pin and data.sources.length2196. Use countsBeforeCheckpoint99 and researchBeforeCheckpoint99 for these assertions. Keep raw cars/data passed to A91/A84 chain entry points (lines55,78,83), otherwise strict A99 may be called twice. The old source-ID loop and old per-car packs can continue on current data because source-scoped packs do not include unrelated new sources, provided old objects remain exact.
5. tests/checkpoint93-market.test.ts:63-69: local catalogue counts343/families149 and sources2196. Use A99 predecessor cars/research in this historical test. The no-Deepway assertion remains unchanged.
6. tests/checkpoint95-market.test.ts:94-100: same old343/149/2196 pins, plus explicit absence of Mazda CX-6e. This MUST see predecessor catalogue even if one merely adjusted counts elsewhere. Preserve the absence assertion verbatim.
7. tests/source-citation-label92.test.ts:123-130: old2196 count, unique count and COMPLETE source-ID->hash mapping to fixture91.previousSourceHashes. Reconstruct99 sources for this historical block. Other exact Sur-Ron tests should continue to use actual current cars/sources/proposal.

## Literal source-wiring constraint

At tests/checkpoint96-source-history.test.ts:180-191, assertions inspect current tests/helpers/checkpoint91-history.ts as text and demand:

- createCheckpoint97SourceReader's direct readFileSync callback
- the exact readSourceBefore96 = createCheckpoint96SourceReader(readSourceBefore97) statement
- the unchanged byte-pin loop and its H.PROPOSAL_FILE/H.LEDGER_FILE exceptions
- core.checkResearch(research(), fixture)
- core.previousStorage(read(H.PROPOSAL_FILE), read(H.LEDGER_FILE), fixture, f)

Normal A99 wrapping will change some of these strings. Options:

A. Add an exact whole-file-approved source99 reverse adapter for the91 helper and route only this test's historical source read through it. This preserves every original assertion, with a separate new99 test proving the new wiring and predecessor hash.
B. Explicitly extend this source-contract test to assert the verified99 ->97 ->96 chain and reconstructed data/research input path. Keep all existing numeric/hash expectations and fixture-seal checks unchanged; do not silently delete the old contract.

Do not edit tests/helpers/checkpoint96-source-history.ts: checkpoint97-source-history.test.ts:131 pins its exact bytes to fe9d9db20d712e71971c4a7458762cfd3653c6addc5cb019b42372be4b0c6d16. No change is needed to97 source adapter or97 source tests when application sources stay unchanged. Both96/97 pass-through drift tests intentionally use raw src/lib/discovery.ts and must keep rejecting unapproved mutations.

## Runtime reconstruction: critical layout and validation

src/lib/data.ts:88-183 constructs Research. New sources are inserted into an INTERIOR segment, not appended at the end: raw sources283, existing addition sources1772, new99 sources, then old overlay sources141. For six new sources, the exact insertion begins at index2055. Blindly removing the last six deletes historical overlay evidence. Verify the full inserted block and both unchanged sides before removing it; whole before/after hashes should also match.

Models, variants, trim_equipment, update_eligibility, feature_evidence receive new suffixes. Feature rows are69 per new variant, with additions.features replacing exact unknown cells. No facts[] are exposed directly in Research; new full Facts are assembled in Car[]. Metadata changes only the reviewed added_variant_count and added_feature_row_count fields, unless a separately declared delta says otherwise. The checkedAt global must remain2026-10-10; use each new variant's explicit unknown_evidence_date so old missing facts/dates do not change.

Car[] order is variant order; new99 cars are the final two if variants are appended. Validate both complete new Car objects/summaries and the complete old prefix before stripping. Validate full proposal/ledger graphs in one coordinated check before reconstructing either: suffix lengths alone or filtering by ID is not enough.

A99 should reject current-input drift, old-input substitution, extra appends, reordering, duplicate IDs, changed metadata, altered old prefixes, reordered full source records, mixed proposal/ledger, changed snapshot refs, and changed new objects. Returned predecessor objects/buffers must be detached from cached verified state. The test helper must not whitelist arbitrary new data solely by prefix/name.

Do not silently accept already-pre99 values to fix double wrapping. Choose a single chain entry, or separate explicit functions for post99 input and checked pre99 internal values. In particular A84-transit tests currently pass their own raw cars/research into helper functions, while defaults load the same current exports.

## Paths that should remain live/unmodified

- server-catalogue-additions.test.ts compares raw current JSON to current loader output, with no historical count/hash pin; leave live.
- checkpoint82-strength.test.ts:333-371 reads current proposal/ledger to mutate old references and check global uniqueness; no exact old whole-file count there. Leave live.
- buyer-proposal-storage.test.ts uses synthetic isolated inputs; no adapter required.
- mache-mazda6e-integration.test.ts selects fixture IDs before counting Mazda6e grades; a separate CX-6e model does not change its count2.
- Generic pack, discovery, evidence, report-binding, detail, projection and storage round-trip tests should continue to see the new records. Do not blanket-wrap every import from data.ts.
- The91 isolated Brown harness is fixture-bound, so its test is not a substitute for full post99 catalogue integrity proof.

If99 also changes market-inventory, this audit's data-only assumption no longer suffices: checkpoint95-market-history and checkpoint95-market.test.ts currently consume raw market input, while93 and older are chained behind95. A separate exact market99 predecessor layer and display-copy97 compatibility check would then be needed.

## New99 acceptance proof still needed

The current legacy suite can only prove old behavior after reconstruction. Add a dedicated current99 test proving the exact coordinated delta, all old cars/packs/sources/summaries unchanged, new facts/features/identity guards, current and predecessor counts, source-seam placement, rejected mutations, unchanged old pins, and runtime/buyer-policy dates. No such runtime result was produced during this static audit.
