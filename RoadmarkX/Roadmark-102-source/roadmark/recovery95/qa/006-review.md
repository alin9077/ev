# Independent static review: staged Mazda market95 implementation

## Decision

Approved for root application after checkpoint94 is saved and its freeze is released. This is static approval of the seven frozen files, not runtime QA or release approval. No implementation blocker was found.

Reviewed manifest: `roadmark-research/market-lead95-implementation/candidate-manifest.json`

SHA256: `2b8f983e5da1524d0517aa0e400231c651a179fd524b71359cebb707516499ed`

## Verified scope

- Exactly one existing Mazda CX-6e lead is removed at its original zero-based index40 and preserved unchanged in one appended historical entry; one GT/Azami family audit and one evidence artifact are appended
- Every prior record, remaining lead, historical entry, source artifact and their order are preserved. Peripheral records and all unrelated top-level metadata are unchanged
- The only market fields changed are records, unverifiedLeads, reconciledLeads, sourceArtifacts and counts. Counts independently recompute to records242, active leads143, history21, artifacts19, passenger114, preorder2, named configurations395 and advertised-New records69; missing-trim54 and peripheral5 remain unchanged
- The narrowed HTML-only candidate differs from the earlier reviewed record only in the authorized visual-status sentence. The sidecar differs only by the enumerated limited visual-status updates. The actual root observation and prior review addendum hashes match
- The visual check covers stated pages5/7/14. Full technical-candidate verification stays false; no raw PDF hash, normalized cargo resolution, technical epoch, formal manufacturer MY, physical stock, accepted order or ranking admission is added
- Both detailed data files retain their earlier hashes. Detailed343/families149/sources2196 and heroes9 remain required runtime invariants; this patch includes no detailed catalogue or hero edit

## Historical integrity and test review

The new helper pins exact successor canonical JSON, fixture bytes, sidecar bytes and the original lead. It removes only the verified final record/history/artifact, restores the exact original lead at index40, restores old counts, then requires the entire predecessor hash. Independent static JSON reconstruction returns the original full market object exactly.

The two checkpoint93 modifications are each one import-line substitution only. All old assertions and pins remain intact. The predecessor dependency chain continues through checkpoint93 to earlier historical helpers without a new cycle. No historical fixture is repinned.

New tests cover disposition and order preservation, fail-closed evidence fields, seller identity and freshness, limited PDF scope and cargo conflict, exact checkpoint93 reconstruction, detailed catalogue exclusion, 23 negative whole-state mutations, and evidence byte drift. These tests have been read, not executed. No TypeScript compilation or other executable check is claimed.

## Pins and remaining steps

- Successor market raw SHA256: `64f38d5d72f75c2a5264568602d5a1eacae49b1aba8b1e8cfcf5a9708a35c023`
- Successor canonical SHA256: `29b406b2179013a99100771ab9ccec20f21f6736bc06ad39295a5bce017f5576`
- Exact predecessor canonical SHA256: `1f1c0cd52a18794ea249f4295b94b2d0b1981c42d570cd68070f0cb4cb243be2`
- Evidence sidecar SHA256: `370449ee44a832977f99952ec6fc764fe38180c5c4aa10128fc4187856863c68`
- Full independent static findings: `static-review.json`

Root must recheck all seven staged hashes and app preimages/new-target absence immediately before applying, then run required validation, typecheck, lint, tests, build and buyer-visible QA. Raw publisher captures and the larger technical candidate must remain outside the app.

Only review files were written. No app edits, staged/application code imports, tests, builds, browser use, uploads or Git operations occurred.
