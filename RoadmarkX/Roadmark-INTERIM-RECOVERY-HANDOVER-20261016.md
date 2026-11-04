# Roadmark interim recovery index and handover

16 October 2026. Working-state safety save; full audit closure is paused.

## What is recoverable now

The frozen Ford32 source and the later six-file Lexus33 delta are usable recovery inputs. Ford's local recovery replay passed; the Lexus delta also passed isolated local restoration and byte verification. Library creates succeeded and local hashes were verified. Downloaded Library bytes have not been independently verified (nativeByteReadbackVerified=false).

This is an interim index, not the final five-file Ford delivery or a release acceptance. Full-project TypeScript, a current clean full suite, production release and publication remain unpassed/unapproved.

The Ford core contains 150 archives: 144 reused historical archives and the six fresh archives below. Its accepted restore plan covers 16,569 logical files. The fresh archives contain 1,646 members; the standalone source has 706 source files plus its manifest. Restoring source does not require retrieving the entire historical research chain. Restoring the full historical proof chain still requires the 144 prior archives referenced by its retained recovery records.

## Six fresh Ford core archives

All six are version 0, create-confirmed with local hashes verified. Four proof parts and the support archive preserve the fresh Ford research, validation and recovery material. No Lexus changes are inside these archives.

1. Roadmark-recovery-source-FORD-WORKING-20261016T0145.tar.xz
   Library ID: libfile_9db369f625c08191901c89043a0f7bc7
   Bytes: 8617648
   SHA-256: d624a00ea9f9ae0c1e4c75e12930a7cb9554a537d3e1c6ca03a7a34406295444

2. Roadmark-recovery-FORD-WORKING-20261016T0145-part01of04.tar.xz
   Library ID: libfile_0becb3db15548191a87f4caa3daf7316
   Bytes: 306236
   SHA-256: 89873be0e7a5e9314bb3a8f15d3d3bfa57c5701cabb668c516e6243dfcface2a

3. Roadmark-recovery-FORD-WORKING-20261016T0145-part02of04.tar.xz
   Library ID: libfile_eb08fae52d848191b7e2054209d82ff3
   Bytes: 411060
   SHA-256: 67e3f30cbe0c41273c0c98f8389a10a383194f868c35bd4864b9e0225bfdfaf1

4. Roadmark-recovery-FORD-WORKING-20261016T0145-part03of04.tar.xz
   Library ID: libfile_03fbcc4b61dc8191bda53bf0508ffb6a
   Bytes: 603120
   SHA-256: 54c7dd7dac70a24e1f12a1e61218f7fec1990508c5bdf08b7577c9276b5eb795

5. Roadmark-recovery-FORD-WORKING-20261016T0145-part04of04.tar.xz
   Library ID: libfile_e1040a74144881919cc88be993a8c818
   Bytes: 313780
   SHA-256: 319e072cae7ade5e93ce63a3688790a08fbea5750b7a20d34b2d99fd31ed0bf0

6. Roadmark-recovery-FORD-WORKING-20261016T0145-support.tar.xz
   Library ID: libfile_05296a84912c8191955ce29065d706be
   Bytes: 1088392
   SHA-256: 3048e704994fadc8cbbc29c4ae34d86be226195beb29b90c2a96a11dfa3382ef

## Lexus working delta: apply only to this Ford baseline

Lexus-working-recovery-delta-v1.zip
Library ID: libfile_2ce87e3a1de48191bab83dd55c5ad013
Bytes: 183022
SHA-256: f94d39d860f9c8b6b94dfd07cb0af948a1b85424d0c13480a20fe72ad5561900
Required Ford source SHA-256: d624a00ea9f9ae0c1e4c75e12930a7cb9554a537d3e1c6ca03a7a34406295444

The ZIP is a partial research-audit/source save, not a complete new audit chain. Its 86 members and six-file application were verified locally; the resulting source has 709 files. It replaces three files and adds three, relative to roadmark-104:
- Replace src/lib/buyer-availability.ts
- Add tests/buyer-arrival.test.ts
- Replace data/m1-brand-updates/registry.json (Lexus becomes packet 33)
- Replace scripts/reporting/load.ts
- Add data/m1-brand-updates/lexus-2026-10-16.json
- Add data/m1-lexus-market-reconciliation-2026-10-16.json

No Lexus live docs/progress/status update was applied. The inherited sanitized Farizon/Foton/JAC member stays as captured; no full live-tree byte-equality claim is made, and removed header values must not be reconstructed.

The Ford source and Lexus ZIP were attached together in an accepted message at 2026-10-16T07:10:24.754708+00:00 (source first, delta second). This records accepted sending, not recipient reading or server-byte verification.

## Validation: keep the two states separate

Ford32 frozen cut: 433 catalogue / 356 Tier 1 / 314 on-sale; 151 scoped tests, structural validation, normal report and exhaustive comparison passed. These results predate the Lexus changes.

Lexus33 working cut: the accepted stage had 434 catalogue / 357 Tier 1 / 314 on-sale and 428 unchanged peers. Post-registration market view and changed-file lint passed.

The 144-test Lexus behavioral gate failed: 114 exact named tests passed and 30 names in tests/brand-updates.test.ts remain unverified. That file had SIGKILL; the fresh unchanged whole-file recovery attempt also had SIGKILL and established no new named passes. Both causes are unknown; neither is diagnosed as OOM. There is no accepted composite pass. The earlier helper's 30 tests overlap this scope and must not be added to inflate the total.

Live-safety tests, structural validation, the 16 October normal report and exhaustive comparator remain unrun for the Lexus working cut. The two older KGM compiler failures and original Renault report UNKNOWN remain separate historical outcomes; neither is upgraded by this recovery save.

## Unfinished audit work

The six Ford core archives are already locally verified and create-confirmed. A separate eleven-member bookkeeping supplement is only packaged locally and is outside that core. Its full scan preserved exit 2: three prose candidates and 14 unresolved raw matches. The 14 matches were identified and specifically approved as exact public JSON boolean tokens, but the required derived view, downstream classification/replay, native supplement upload and full closure were not executed. The raw findings remain unchanged.

The static derived-view proposal and review are preserved for possible later work. The four final Ford delivery documents and final active/terminal closure were not produced. This interim document does not close those gaps or relabel any failed or unknown result.

## Resume safely

1. Keep the exact Ford source archive and Lexus ZIP together. Before using copies retrieved from Library, compare their local byte sizes and SHA-256 values with this index. Existing native-create receipts are not a substitute for that comparison.
2. Restore into a new empty directory, using the delta's bundled guarded recovery instructions/applier. It requires the exact Ford archive, replacement-before hashes and required absences. Do not hand-overlay the six files onto an unknown live tree. The archive is a source save, not a complete installed dependency/runtime environment.
3. Read the bundled Lexus WORKING-STATE.md, state.json and their review clarification. The prospective composite schema was accepted for preparation; an actual composite test result was not accepted.
4. Further test retries, larger memory bounds, source changes, subsequent gates or next-brand work need a new explicit decision and reviewed plan. Preserve both failures and do not weaken tests or infer an OOM diagnosis.
5. For historical research recovery, retrieve the four Ford proof parts and support archive below, then follow the retained prior-chain references. The qualified Nissan active receipt is libfile_a136100e2ba88191a01643d14b319972. Do not refetch excluded raw headers, cookies or credentials.
6. Treat completing the paused late audit as optional separate work. Preserve its original raw scan and exact approvals if resumed. Some late bookkeeping remains local and is not recoverable from the delivered core alone; do not claim full audit closure.

## Audit anchors for later verification

- Ford core replay acceptance: INDEPENDENT-FORD-FRESH-REPLAY-RESULT-REVIEW-v1.json, SHA-256 39c81607757389e58d8061526a067b9c57041898608d04107898e24bfd1f340d
- Ford native/local identity table: ARCHIVE-UPLOAD-IDENTITIES.json, SHA-256 e4014b6728b1a1349461e3501882bbf4a686fbaf20a9975344023a656a16546e
- Lexus isolated recovery acceptance: recovery-delta-result-review-v1/review.json, SHA-256 46d64838546139aafa474522fa4786bf6bce9732f9ac72a5c73f505790df1dea
- Lexus native receipt acceptance: recovery-delta-delivery-review-v1/review.json, SHA-256 4d954df12dca9e1264bfbf2b98d8211bf589324500fb3ae6c75f672edf89b830
- Paused late-audit route review: INDEPENDENT-FORD-BOOKKEEPING-EXACT14-DERIVED-VIEW-ROUTE-REVIEW-v1.json, SHA-256 c6d6c3014abf8a04f5dc80bb341d4866d22be7c0329d5726e357bfdc8ec371ad

These are evidence pointers, not new test passes or a self-contained final audit certificate.
