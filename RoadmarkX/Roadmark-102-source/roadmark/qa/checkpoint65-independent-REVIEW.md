# Independent bound-report integration review

Reviewed 11 October 2026, 01:30–01:38 UTC. Final static source seal was made after the root confirmed the working source65 application files were stable. Historical findings and intermediate status entries below are retained; the final verdict supersedes those intermediate statuses.

Scope: static reading of the working report binding, claim shape, intake, queue projection/reader/file families, submission gate, ClaimReport, ReviewQueue, server adapter, related report claim factories and tests. This reviewer has not run application code, tests, builds, browser, HTTP, listeners, a local preview or live queue reads. Only this new independent audit folder is being written.

## Final verdict

No unresolved must-fix was found in the final inspected source. All six findings raised in this review were addressed and re-read. The separate omission-count/provenance/unique-file-identity notes were also closed. This is a static source acceptance with explicit verification limits, not permission to run or publish the local service.

The final client helper captures both the explicit request body and a detached expected binding before any await, then compares the receipt to that detached binding. The newly added deferred fake-POST test mutates the caller's original binding after request capture and expects the original receipt to remain accepted. R6 is therefore closed by inspection.

The baseline comparison covers 344 pre-existing files. Exactly five existing files changed: ClaimReport, ReviewQueue, correction-guards, serve-roadmark, and the unrun real-HTTP integration test. All 105 baseline data files are unchanged; no baseline file is missing. New report modules/tests are pinned separately in SOURCE-MANIFEST.sha256.

Observed test evidence: the root's pre-R6 focused log records 33 passes and no failures/skips. The final mutation regression was added afterward; the root restarted broader QA after a deliberately interrupted prior run. This reviewer does not claim the last helper change or full suite passed from the earlier log. No tests or application code were executed by this reviewer.

### Residual limits and evidence

- No mounted React/browser interaction, actual HTTP listener/service, real filesystem-race execution, real phone or cross-browser test was performed by this reviewer. The real-HTTP test remains an explicit separate authorization gate. Browser/service/phone success must not be inferred from the pure mocks or static audit.
- Full final tests, type check, lint, build and portable artifact parity belong to the root's final QA record. Earlier or interrupted results do not validate a later source revision.
- Canonicalization uses the documented v1 ECMAScript numeric-key ordering after recursive code-unit entry sorting. Fixed complete canonical-string/digest vectors, Node/Web Crypto parity, exact serialized-limit edges, all projection-budget fallback/omission branches and the complete GET header/adapter matrix remain useful evidence beyond the focused assertions reviewed here.
- Content reads are capped at 200 selected records and 512,000 bytes per stored record; projected entries are capped at 24,000 bytes. The directory enumeration and metadata pass still inspect all recognized names. This is not a fixed bound on all directory work.
- A rejected/thrown digest provider yields verification_unavailable; a provider returning a malformed digest string is currently classified invalid_binding. The concrete Node SHA-256 provider returns the required format. This non-production injected-provider distinction remains documented.
- Bindings verify internal consistency of an unsigned local claim snapshot. They do not authenticate the reporter/service, report text/time/vehicle label, source freshness or reviewer approval. Exclusive creation prevents filename overwrite; this is not a crash-atomic transactional queue or an idempotent retry design.
- Application inputs are existing JSON catalogue/generated Fact data. The earlier prototype/accessor/symbol-key pre-clone canonical contract caveat remains; normal JSON requests cannot inject those JavaScript-only shapes.

## Findings reported immediately

### R1 — Stale pending UI survives A → B → A

Initial source: `src/components/claim-report.tsx:20,27–31,38–40,59`.

`pendingContext` is set to A when a submit starts. A committed switch to B disposes/invalidates A's token, but does not reconcile `pendingContext`. A's eventual `finish(token)` is false and therefore cannot clear it. Return to A and `pendingContext === context` is true even though the gate is idle; all action buttons remain disabled with “Saving report…”. Reconcile pending display state against committed context/operation ownership. Add an adapter-level A → B → A test with completion before and after the return, not merely a pure gate assertion.

Status: reported to root at 01:30 UTC; fix/review pending.

### R2 — Duplicate report IDs are duplicate React row keys

Initial source: `src/lib/report-queue-reader.ts:14–28` and `src/components/review-queue.tsx:108–109`.

The collector admits every valid projected file and does not distinguish duplicate record IDs. Legacy file names need not match the record ID; a legacy and a bound record can also share the same ID. `key={r.id}` is therefore not unique. React row reconciliation after refresh can be ambiguous. Preserve a unique per-file presentation identity or explicitly isolate/count duplicate records without rewriting their originals. Keep stored report IDs exact and visible.

Status: reported to root at 01:31 UTC; fix/review pending.

### R3 — FIFO replacement can block before regular-file validation

Initial source: `scripts/serve-roadmark.ts:74–85`.

The adapter obtains regular-file metadata with lstat, then later opens the path with `O_RDONLY | O_NOFOLLOW`, then validates the opened descriptor. O_NOFOLLOW rejects symlinks, but a regular file replaced by a FIFO between lstat and open can block in open itself. The post-open check is never reached until another process opens the pipe. For the supported local platform, use nonblocking open in addition to no-follow, retain post-open regular-file validation, and read only the bounded descriptor. This is a local concurrent-filesystem race, not a remote report-body injection.

Status: reported to root at 01:31 UTC; fix/review pending.

### R4 — Writer can acknowledge a record that the reader always rejects

Initial source: `src/lib/report-claim-binding.ts:50–80`, `scripts/serve-roadmark.ts:119–122` and `src/lib/report-queue-reader.ts:4,18–19` / server lines 85–94.

Preparation accepts arbitrary complete authoritative claim metadata; compact requests carry only its digest. The concrete sink serializes the entire report, including the snapshot and reduced observed value, without a size check and can return 201. The reader rejects files over 512,000 bytes. A matching service claim above that serialized budget is therefore successfully persisted but necessarily omitted from every queue listing. Enforce a shared bound on the actual written UTF-8 serialization before writing (or provide a compatible reader contract). Include pretty-JSON whitespace, escaping and duplicate observedValue bytes in the check. Over-budget observations should remain unchanged and be explicitly rejected before persistence, not truncated.

Status: reported to root at 01:31 UTC; fix/review pending.

## Positive source observations

- Canonical binding includes variant ID and the complete Fact-shaped observation, including unknown enumerable JSON metadata. Client canonicalization is synchronous before its asynchronous digest; the service clones the resolved observation before hashing and reuses that snapshot for persistence.
- Request scalars/binding are captured before asynchronous work. Server-generated UUID/time/pending state replace client-supplied extras. A mismatch rejects before ID/time allocation and persistence.
- Old POST clients fail the vendor media-type requirement. New POST clients fail closed against old service capabilities, and an old service's historical media predicate rejects the new vendor media even if client capabilities were cached.
- New GET requires the exact vendor Accept value. ReviewQueue validates response media and protocol before consuming the projection. Old clients therefore receive a controlled error instead of misreading missing observedValue fields.
- New bound-v2 filenames are excluded from the old legacy filename regex, preventing old GET from spreading complete new snapshots. New readers accept both families without migration or deletion.
- Queue projection emits only explicit display fields, omits the full observation/private extra fields, retains accepted machine identifiers exactly, and counts omitted source IDs. The authoritative 24,000-byte entry cap is enforced after UTF-8 encoding.
- Bound labels come from the stored snapshot; fallback labels are marked. The UI distinguishes bound/legacy/invalid/unavailable and explicitly disclaims source freshness or correction approval.
- POST counts original byte chunks, copies them, requires UTF-8 and awaits the sink. The receipt is detached before awaiting persistence. The concrete sink serializes synchronously and uses exclusive create, so it cannot overwrite a collision.
- GET has a 200-selected-file limit and bounded descriptor reads for each selected file. Per-file parsing/projection failures are isolated. There are no correction-approval writes, automatic retry, old-draft imports or legacy migrations in the changed paths.

## Evidence still required

This audit is source review, not runtime verification. Pure/mock tests need to cover the identified integration races and contracts. Real local-service and browser/phone execution remain outside this review. Do not run the unfiltered test glob: `tests/local-review.test.ts` starts a listener at runtime despite its explanatory header comment.

## Re-read at 01:32–01:33 UTC

R1–R4 are closed by source inspection, pending test evidence:

- R1: ClaimReport stores the full pending token, requires both matching context and `gate.isCurrent(pendingToken)` for the sending display, and only clears a matching operation in finally. Returning to an old context cannot resurrect the invalidated token.
- R2: Projection adds `queueFile` from the actual recognized basename; the collector preserves both rows and ReviewQueue keys by that filename. Stored IDs remain unchanged. Actual readdir names are unique within a directory.
- R3: Open now includes `O_NONBLOCK` with `O_NOFOLLOW`, before fstat confirms a regular file. This prevents a replacement FIFO from blocking the regular-file check on the supported platform.
- R4: `MAX_STORED_REPORT_BYTES` is shared with the reader. `serializeBoundIssueReport` uses the exact pretty-printed UTF-8 representation and rejects over-budget records with 413. Preparation checks before returning; the concrete sink serializes/checks synchronously before writing.

### R5 — Unconfirmed transport failures show raw errors instead of actionable uncertainty

Current ClaimReport catch uses `error.message` for every Error. A rejected fetch or response.json parse failure can occur after the server persisted the report; its message commonly says only “Failed to fetch” or shows parser internals. The careful fallback that says saving could not be confirmed and to check the queue is only used for non-Error throws. Wrap transport/decoding failures in the unconfirmed-save copy, while preserving intentional validation/crypto errors and controlled server rejection messages. This is a duplicate-risk/helpfulness gap; text is retained and the code does not automatically retry.

Status: reported to root at 01:33 UTC; fix/review pending.

### Remaining lower-priority validation/disclosure notes

1. Server tracks and emits `inaccessibleNames` for recognized names whose lstat fails or which are not regular files, but the envelope type/predicate and UI ignore that count. The visible total accurately says regular files, yet skipped recognized names are not disclosed. Showing that explicit count would make omissions easier to distinguish from an empty queue.
2. `isReportListEnvelope` accepts `bound_snapshot` rows with absent/malformed claimBinding and fallback label provenance. The actual projector emits a consistent combination, but a malformed v2 response can produce the stronger bound text without the corresponding envelope shape. Validate these cross-field invariants and reject duplicate queueFile identities at the client boundary. This is shape validation, not cryptographic authentication of the response.
3. Directory enumeration and lstat cover all recognized names before selecting 200 files. Selected-file content reads and list bytes are bounded; total directory-enumeration/metadata work is not fixed at 200. Do not describe the whole directory operation as a fixed resource bound.
4. Invalid digest-provider output (as distinct from a thrown/rejected provider call) still produces invalid_binding because createClaimBinding's output-shape rejection happens outside the digestFailed wrapper. The concrete Node provider always returns a valid SHA-256 string; a future/injected provider contract should define this explicitly.

## Static test review caveats

At this read, the new source tests cover many protocol, snapshot-mutation, queue and gate cases, including duplicate file identity and an oversized serialized snapshot. The tests were read, not run by this reviewer. Some names overstate their assertions: the test saying it “awaits persistence before receipt” uses an immediately resolving sink, and the “deferred clear” test directly invokes gate methods rather than actually queuing/replaying a functional updater. A gate test also is not a React adapter test. Fixed whole-envelope canonical strings/digest constants, Node/Web Crypto parity, exact storage-limit boundaries, the output-budget fallback/omission branches, and full old/new GET adapter/header matrix should be either tested in the allowed pure/mock stage or reported as remaining evidence. These are not claimed passes here.

## Final-stage re-read at 01:35–01:36 UTC

R5 is closed by source inspection: the new importable `report-submission-client.ts` performs exactly one injected POST, wraps fetch/JSON failures and mismatching acknowledgements with explicit unconfirmed-save advice, and retains controlled server rejection messages. ClaimReport delegates to it. Numeric validation and UI disclosure now include inaccessibleNames; the client validator enforces bound snapshot binding/provenance consistency and unique queueFile keys.

The root's focused-test log (`/tmp/roadmark-65-pure-tests-final.log`) was read, not executed by this reviewer. It records 33 tests, 33 passes, zero failures/skips. Added assertions genuinely hold persistence unresolved before checking that no receipt settled, and exercise a scheduled React-style updater after finish and after later edit/operation invalidation. These close the earlier narrow assertion gaps; they still do not constitute a mounted React/browser test.

The root's existing-catalogue shape check exposed explicit null conditionExplanation values. The reviewed predicate now accepts only that specific persisted null in addition to string/undefined; other optional guards remain. factConditions safely uses optional chaining, while canonicalization preserves null distinctly in the snapshot/digest. The focused log includes a null round-trip test. No catalogue data was edited for this compatibility correction.

### R6 — New client helper must detach expected receipt binding before await

The extracted client helper serializes the request before await but originally compared the response with `input.claimBinding` after await. A caller retaining/mutating input can change the expected receipt digest independently of the bytes actually sent. The current component does not retain/mutate that object, so this is a helper contract race rather than an observed current UI failure. Copy the expected binding before POST; validate receipts against that copy. Add a deferred mock post that mutates the caller's original input after request capture.

Status: reported to root at 01:36 UTC; final seal held until the response is inspected.

## Final R6 closure

At 01:37 UTC, re-read the final detached expectedBinding/request-body implementation and the deferred caller-mutation test. No further source correction is requested. SOURCE-MANIFEST.sha256 pins the exact final application/test bytes; BASELINE-COMPARISON.json records the unchanged data boundary. No earlier sealed audit was modified.
