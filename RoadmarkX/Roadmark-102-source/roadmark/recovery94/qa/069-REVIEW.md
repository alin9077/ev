# Checkpoint94 report-preview candidate: independent static review

Decision: **APPROVED FOR ROOT-OWNED ACCEPTANCE**, not runtime acceptance or a release claim.

Reviewed on 2026-10-12. Root may apply and execute this exact candidate only after checkpoint93 is saved and its application freeze is explicitly released. No source changes were requested from the candidate author.

## Exact reviewed packet

- Candidate: `roadmark-research/report-preview94-candidate/`
- `MANIFEST.json` SHA-256: `33ec7a7dc94784d360e4a4e62c491f69b42f2663919f72376b303e24dce72643`
- `CANDIDATE-PINS.sha256` SHA-256: `bdcf1c6dcf2f3e051b66f16f3d6257222578e592890ea0e74a50ea53d431b5c8`
- Design: `roadmark-research/report-adapter93/{README,MINIMAL-CANDIDATE,ACCEPTANCE}.md`
- Application: `roadmark-work/roadmark/`

Both provided digest anchors matched. Every candidate pin and every source pin passed a static SHA-256 comparison. The workflow-document preimage matches the application. Each of the five prospective source/test additions is absent, including the dangling-symlink check. The three pinned live approval registers contain `[]`.

The patch is six files: the pure adapter, local CLI, two tests, synthetic helper and workflow-document appendix. The manifest contains no UI, routes, package/lockfile, queue protocol/reader, existing proposal model, catalogue pipeline, register or build-input change.

## Review method and limits

This was an independent source-and-document review. I read the design, all six candidate files, handoff/acceptance documents and the existing model/binding/projection/canonicalization primitives. I inspected package, TypeScript and app instructions, traced runtime imports, checked existing callers, and compared cryptographic file hashes. I also read the installed tsx import-meta transformation source to inform the remaining execution-guard gate.

No candidate or application module was imported or executed. No test, typecheck, lint, validation, build, browser, server, Git operation, upload or external coding task was run. No application file was modified. Hash comparison and text inspection are not runtime acceptance. This review writes only its own research packet.

## Findings

No blocking source defect was found. The following controls are present and consistent with the design.

### 1. Strict, bounded operator intent

`files/src/lib/report-review-dry-run.ts:109–159` requires exactly six known fields, fixed schema, canonical existing UUID syntax, only the two allowed actions, exact label/reason length constraints and an explicit predecessor or null. The flat JSON parser rejects duplicate keys, including escaped-equivalent keys, nested/non-string values, extra syntax and over-cap source bytes. Accepted text is preserved. New identity, timestamps, bindings, correction data, authority/status overrides and unknown fields cannot enter the event.

`files/scripts/preview-report-review.ts:29–41,104–111` requires exactly the two explicit local paths, rejects unknown/duplicate flags, empty/NUL-containing paths and URL-scheme paths, and validates the entire bounded request before opening anything. There is no hidden queue/history default or fallback.

### 2. Full saved binding and target identity

`previewReportReview:176–189` derives the sole bound basename using the existing primitive and calls `captureReportReviewReference` on the detached raw report. The existing capture implementation canonicalizes the full saved record, respects the report cap and delegates to the bound-v2 projection, which recomputes the complete saved Fact-shaped digest, checks protocol/marker/filename/UUID and compares the reconstructed issue fields. A display entry or declared bound flag cannot replace the raw saved claim. Only `bound_snapshot` proceeds.

The resulting proposal target comes entirely from this verified reference; it is not rebuilt from current catalogue data or accepted from stdin. This is saved-snapshot binding, not current-source truth or reporter authentication.

### 3. History validity before predecessor selection

`previewReportReview:173–182` requires an array, reserves one slot under the existing event count, and validates the supplied history against itself before selecting a predecessor. Existing structural validation owns shape, canonical snapshot, same-report chain, immutable report-reference, duplicate/colliding identity and chronology checks. It does not truncate a broken newest event or use an older valid prefix.

`188–198` requires the exact most recent supplied same-report event ID or null, allocates one local event ID, and validates the complete append against the validated prefix. Model context-size errors remain explicit. Historical context is intentionally partial: model semantics do not reauthorize old correction snapshots or require all old reports to be currently supplied.

### 4. Async detachment and immutable output

`snapshotJson:73–108` accepts bounded plain JSON without invoking ordinary accessors or caller `toJSON`/array methods, rejects invalid graphs, and creates detached objects. Request, report and history are copied before clock/ID/digest callbacks. Dependency functions are captured before asynchronous work. The model independently captures its own combined context.

The candidate history is validated and projected in full. The exact new ID is selected from the projection, so a superseding event is not incorrectly projected as an isolated history. The result recursively freezes its proposal, preview and other nested values. This boundary applies to normal JSON inputs; it is not a sandbox for malicious in-process JavaScript proxies/dependencies.

### 5. Pending, unverified and unsaved authority boundary

`190–204,212–222` supplies fixed schema/provenance and the unchanged authority notice, and requires a bound, pending, unattributed, non-link preview without `correctionReference`. The envelope states `mode: dry_run`, `saved: false` and all three partial-context labels.

Only `needs_evidence` and `no_change_proposed` are constructible. Correction arrays are explicitly empty and mean not supplied. A historic approved-shaped link may remain immutable in supplied history, but the output includes only the new non-link event/preview and cannot gain current approved-register wording or expose the historical correction row. Full reason/label text is retained separately from the disclosed truncated display preview.

### 6. Canonical history anchors

`205–219` hashes the validated prior history and complete validated candidate history with the existing canonical JSON protocol, checks the SHA-256 output shape and labels the values as history hashes. Object-key ordering is stable; meaningful state and array ordering remain material. These are supplied-snapshot change anchors, not a signature, ledger-completeness proof, approval token or concurrency lock.

### 7. Explicit bounded read-only filesystem boundary

`readPreviewFile:65–103` requires nonzero supported no-follow and nonblocking flags, opens read-only, checks descriptor regular-file type and size, allocates only cap + 1, bounds every positioned read, stops on growth beyond cap, compares read size and pre/post device/inode/size/mtime/ctime, decodes UTF-8 fatally and parses JSON. A BOM is rejected instead of silently removed.

The descriptor is closed in `finally` on successful reads and all failure paths. A close error also fails closed; an earlier safe error remains primary. Both reads finish and close before any model operation. There is no unrestricted input read, scan, queue-list limit, retry, fallback, directory creation, store import, write, rename, unlink, link or permission change in the new runtime code.

### 8. Output and safe errors

The complete envelope is serialized and checked against the byte cap, including the newline, before the single application-level stdout write. The full proposal is separate from its truncated preview. There is no raw report/observed claim, old history, correction row or absolute input path in the success envelope. JSON serialization escapes the tested C0 terminal-control characters.

`main:121–135` is guarded and maps failures to short error codes. Read/model failures cannot expose private exception messages or a partial success JSON. Broken output is explicitly not transactional; already accepted bytes cannot be retracted. Actual stdout/stderr transport behavior remains a root test gate.

### 9. Runtime import boundary and environment exception

The new runtime graph imports the existing proposal/binding/projection/shape/filename/canonicalization code. I found no catalogue data, live register, queue reader/store, server, HTTP/network client or child-process dependency in that application-code graph. No current runtime caller imports the proposed modules.

The unchanged `config.ts:21` transitively reads `process.env.NEXT_PUBLIC_SITE_URL` at module load. The candidate clearly documents this exception; it does not falsely claim a transitively environment-free graph. That public URL value does not choose input paths or grant any preview/report/correction authority. Existing primitives remain unchanged.

Module-loader behavior must remain distinct from application-data behavior. Importing TypeScript necessarily involves loader source reads and may involve loader-managed caches. The claim reviewed here is no candidate application-data side effect or server startup on ordinary import, not a whole-process zero-filesystem-activity guarantee.

### 10. Authored synthetic tests are meaningful, not passing evidence

The helper uses synthetic claims/reports/correction snapshots only. The pure suite exercises all three target kinds and both actions, strict request grammar, changed claim metadata/arrays/nulls, invalid bindings, predecessor/history/identity/chronology rejection, historical correction provenance, async mutation, one-time identity allocation, truncation and control escaping, canonical anchors, combined-context overflow and history beyond the projection limit.

The CLI suite includes injected exact opens/flags/close checks, partial reads, size/growth/shrink and all five metadata drifts, malformed JSON/UTF-8, safe denial errors, unsupported flags, pre-I/O input validation and closure before model failures. Real isolated fixtures cover more than 200 files, repeat runs, missing paths, directories, final symlinks, malformed/oversized inputs, effective permission denial, subprocess output/error behavior, a no-writer FIFO and a fresh-process import boundary. Fixture writes belong to tests and are isolated from live queue/history/registers.

The process import test is usefully supplemented by a static application-source boundary scan. Neither alone proves absence of every possible process/library side effect. Real permission-denied coverage deliberately skips as root and must be reported as skipped if that occurs. No authored test has been executed by this reviewer.

## Required root acceptance before any success claim

1. Confirm checkpoint93 has been saved and release its application freeze.
2. Reverify both pinned manifests, every candidate/source pin, exact workflow-doc preimage and all five absent destinations immediately before applying only the six manifest files.
3. Execute the new focused tests and all specified existing regressions. Check actual results rather than the authored coverage matrix.
4. Specifically establish that the installed Node/tsx combination runs `main` on direct invocation but not normal import, that the import tripwires do not conflict with module loading, and that the broken stdout test emits the safe code without a stack or unhandled error.
5. Run final-source typecheck, lint, validation, aggregate tests, normal/portable build and public build as specified. Record actual skip/failure outcomes. A change made during acceptance requires new candidate hashes and final-source reruns.
6. Recompare exact applied postimages and unchanged pinned sources/registers, and inspect final server/portable/public artifacts for accidental wiring or private queue/history content. The supplied pins cover declared inspected files; they are not a whole-filesystem invariance claim.
7. Preserve checkpoint93 browser/mobile evidence without claiming new browser acceptance. Do not claim production editorial authority, authentication, persistence, approval, correction application/publication or goal5 completion.

## Accepted, explicitly disclosed limitations

- Operator-controlled paths are required. Final-file flags and descriptor checks are not a filesystem transaction or defense against malicious parent-directory replacement.
- Stdin must reach EOF. No wall-clock deadline is promised for slow pipes, filesystems or external mounts; nonblocking FIFO protection is not a universal IO deadline.
- Supplied history can be incomplete, stale or manually altered. Exact predecessor and digest checks do not establish a global ledger or prevent concurrent external changes.
- Existing model limits, including duplicated-context size/complexity limits and display projection limits, remain authoritative. Nothing is silently reduced to fit.
- Exact output bytes may contain private self-declared label/reason and report references; keep them private. Manually retaining stdout is a draft, not persistence by this tool.
- Runtime/build/regression acceptance and any future production integration remain open until root actually verifies them.

Accurate post-acceptance wording remains: “Added a local dry-run proposal preview for already-bound reports; it leaves reports pending and does not save proposals or change approved facts.”
