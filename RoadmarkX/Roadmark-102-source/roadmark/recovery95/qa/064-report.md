# Checkpoint95 static implementation candidate

Status: staged, unexecuted, awaiting independent implementation review and the root's checkpoint94 save. No real application files were changed.

## Scope

Seven exact files are staged under `candidate/` and pinned in `candidate-manifest.json`. The only application-data change is the reviewed HTML-only disposition of the existing Mazda CX-6e lead into one audited GT/Azami family record, with the original lead preserved intact in historical reconciliation and one evidence sidecar appended.

Records change 241 → 242, active leads 144 → 143, historical reconciled leads 20 → 21 and source artifacts 18 → 19. Dependent counts follow the independent review: passenger records 113 → 114, preorder records 1 → 2, named configurations 393 → 395 and advertised-New-stock records 68 → 69. Peripheral records remain 5. These are market-audit collection counts.

Detailed catalogue configurations remain 343, families 149, sources 2196 and hero variants 9. No technical candidate, technical epoch, manufacturer model year, accepted-order claim, physical-stock claim or ranking eligibility is admitted. Global checkedAt remains 2026-10-10 and complete remains false.

## Subsequent PDF visual-status correction

The root requested a narrow correction after it visually inspected printed brochure pages 5, 7 and 14. The staged record and sidecar no longer claim that those visual checks remain blocked. They identify the limited pages and preserve the held detailed technical candidate, null technical epoch, null manufacturer model year, unavailable raw PDF byte hash and unresolved cargo conflict.

`visual-status-delta.json` enumerates every sidecar change and the single record-limitation change against the original reviewed files. Those historical review files and their pins remain unchanged. The updated sidecar and successor market pins therefore differ intentionally from the earlier HTML-only proposal and require the independent implementation review.

## Exact predecessor handling

The new checkpoint95 helper pins the complete successor, its fixture and the corrected sidecar. It removes only the exact appended record, historical entry and artifact, restores the exact original lead at zero-based index40 and restores only the reviewed dependent counts. It requires the complete predecessor canonical hash before exporting that value.

The checkpoint93 helper and checkpoint93 test each change exactly one import line to consume that predecessor. All checkpoint93 assertions and fixture hashes are unchanged; checkpoint91 helper/test and earlier history remain untouched. No historical baseline is repinned or weakened.

Static JSON reconstruction returned:

- Pre95 canonical: `1f1c0cd52a18794ea249f4295b94b2d0b1981c42d570cd68070f0cb4cb243be2`
- Staged95 canonical: `29b406b2179013a99100771ab9ccec20f21f6736bc06ad39295a5bce017f5576`
- Staged95 raw market: `64f38d5d72f75c2a5264568602d5a1eacae49b1aba8b1e8cfcf5a9708a35c023`
- Corrected sidecar: `370449ee44a832977f99952ec6fc764fe38180c5c4aa10128fc4187856863c68`

Only counts, records, reconciledLeads, sourceArtifacts and unverifiedLeads differ as JSON values. Unrelated ordered data and metadata are preserved by the exact predecessor hash.

## Test proposal and validation boundary

The new test file covers scope/count preservation, exact original-lead history, seller date/condition distinctions, the limited visual check and cargo hold, unchanged detailed-catalogue totals, exact predecessor handoff to unchanged checkpoint93 checks, sidecar byte drift, empty approval registers and 23 negative market mutations.

These are proposed tests, not passed tests. No app imports, validation scripts, typecheck, tests, lint, builds, browser work, uploads or Git operations were run. Work was limited to reading source text, static file staging, JSON processing, diffs and hashes. Executable validation remains the root's responsibility after the freeze is released and the candidate is independently approved.

## Application gate

The root should verify checkpoint94 is saved, obtain independent approval of the seven files and visual wording correction, recheck every listed preimage or new-file absence, and then apply only the manifest files. Raw source captures and the separate technical candidate must stay outside the application. Recheck postimage pins before running the normal application checks; any source or candidate drift requires reconciliation instead of blindly applying.
