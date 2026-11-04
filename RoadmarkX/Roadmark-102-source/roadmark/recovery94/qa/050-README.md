# Report preview94 candidate: static handoff

Status: authored and statically inspected only. **No candidate or application code was imported or executed. No tests, typecheck, lint, build, server, browser, Git, uploads, Codex task or application edit was performed by this worker.** Checkpoint93 application freeze remains in force. Root may apply and execute only after independent review and the checkpoint93 save.

## Staged changes

`files/` mirrors intended application paths:

- `src/lib/report-review-dry-run.ts`: strict flat request parser, detached JSON snapshots, existing model orchestration, immutable unsaved result and bounded output serializer
- `scripts/preview-report-review.ts`: explicit two-path CLI, bounded stdin, mandatory read-only/no-follow/nonblocking descriptor reads, safe errors and guarded main
- `tests/helpers/report-preview-fixture.ts`: synthetic claims only
- `tests/report-review-dry-run.test.ts`: model/intent/identity/chronology/snapshot/hash/size/provenance cases
- `tests/report-review-cli.test.ts`: parser, injected descriptor failures, real isolated files/FIFO, process boundary, import and source boundary cases
- `docs/REVIEW_WORKFLOW.md`: complete prospective file; original is preserved in `preimages/docs/REVIEW_WORKFLOW.md`

The five source/test additions have required ABSENT preimages. No package, lockfile, existing model, queue protocol/reader, runtime component, route, server, register, catalogue or build input is changed. The docs append does not wire the CLI into an application.

`MANIFEST.json` records intended file operations and exact SHA-256 pre/postimages. `SOURCE-PINS.sha256` pins the inspected application/design inputs. `CANDIDATE-PINS.sha256` pins every handoff artifact except itself. `ROOT-ACCEPTANCE.md` contains guarded root-owned copy and test commands. `ACCEPTANCE-COVERAGE.md` maps the design requirements and unresolved limits. These manifests identify bytes, not approval or runtime acceptance.

## Important implementation choices

- Only `needs_evidence` and `no_change_proposed`; both keep the report pending and unverified. No correction/register argument exists
- Exactly six request keys, including an explicit predecessor or null; duplicate JSON keys and escaped duplicates also fail
- One generated UUID and one captured timestamp. Exact saved bound reference is rehashed; no current catalogue reconstruction or display-list fallback
- Validate supplied history against itself before predecessor selection. Preserve immutable historical links without pretending to supply correction registries
- Validate and project complete candidate history, then find exactly the generated event. New preview must be bound, not linked, pending and unattributed
- Explicit full label/reason plus bounded preview and `fieldsTruncated`; canonical history hashes and partial-context labels
- Pure orchestration detaches request/report/history before external callbacks. The model's combined-context bound remains authoritative
- Open only selected report and supplied history. Reads stop at cap + 1, close before model work, and compare descriptor identity/size/mtime/ctime. No atime claim, queue scan, fallback or writes

## Inspected transitive boundary

The new pure module imports the existing proposal, claim-binding types, filename and canonicalization primitives. Runtime paths are:

- report-review-proposal → correction-guards, report-claim-binding, report-queue-files, report-queue-projection, report-claim-shape
- report-claim-binding → report-claim-shape, report-queue-files, corrections, correction-guards
- report-queue-projection → report-claim-shape, report-queue-files, corrections, correction-guards, report-claim-binding
- correction-guards → config and corrections
- corrections → config
- config → no imports

Type-only imports of `types`, `feature-corrections` and `availability-corrections` are erased. The existing `config.ts` computes `publishedOrigin` from `process.env.NEXT_PUBLIC_SITE_URL` at module load. No network, credential, store, queue, register, file, server or process-launch action was found in this runtime graph. It initializes ordinary constants/functions/Sets and that public config value. Neither the candidate's filesystem input selection nor any authority decision uses the site URL. Existing primitives are deliberately unchanged. **Do not call this graph transitively environment-free.**

Importing a module necessarily entails module-loader source reads. The proposed import check concerns application-data operations/output/server startup beyond module loading; it does not claim that importing JavaScript can occur with zero filesystem reads. The main execution guard and tsx module behavior remain unexecuted acceptance gates.

## Limits that must stay explicit

1. Mandatory final-file flags and descriptor checks are not a transaction, lock, source truth check or defense against malicious parent-directory replacement. Operator-controlled local paths are required
2. One stdout write means no success bytes before validation. An output stream can accept partial bytes and then fail; software cannot roll those bytes back. Do not promise transactional stdout on transport failure
3. Stdin waits for EOF. No timeout is promised for a stalled pipe, very slow filesystem or an external network mount. O_NONBLOCK protects the tested FIFO case; it is not a universal filesystem deadline
4. The supplied history may be incomplete. No global-ledger authority, persistence, reconciliation or concurrency guarantee exists
5. Request limits use existing JavaScript string-length semantics (UTF-16 code units); byte caps are additional. No silently normalized text
6. This is an unexecuted candidate. Test code and commands are proposed verification, not passing evidence. A root-found defect requires a revised pin set and final-source reruns
7. Runtime platform is the current Linux VM with Node >=22 and installed tsx. Unsupported flag platforms fail closed. New URLs and Windows drive-letter paths are rejected by this Linux-local CLI

No production editorial workflow, goal5 completion, browser gate, deployment, authenticated identity, approval or published correction is claimed.
