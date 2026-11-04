# Independent read-only review: correction guard hardening v63

Reviewed 11 October 2026 UTC. Repository: `/workspace/scratch/586427eef9f2/roadmark-work/roadmark`.

## Scope and verification boundary

Reviewed the in-progress `correction-guards.ts`, `feature-corrections.ts`, `availability-corrections.ts`, and `data.ts` against `roadmark-research/correction-guard-hardening-v63/baseline` and checkpoint A of `issue-reporting-gap-audit-v62.md`. Also read the existing correction tests, the newly added `tests/correction-guard-parity.test.ts`, relevant types, fact guards, research construction, and catalogue validation.

This review used source reading, diffs, and file hashes only. No application/runtime execution, tests, builds, browser, HTTP, deployment, or app-file modification occurred. Parent/root owns execution and verification. Findings describe inspected source logic, not reproduced runtime failures. The patch was changing during review; resolution status must be read with the final addendum below.

## Findings reported immediately to root

### 1. Medium: equipment `after` spread allows unvalidated identity and metadata writes

Initial inspected source: `src/lib/feature-corrections.ts:88–120`. The after patch validates `value`, `status`, `conditions`, and `source_ids`, but spreads the complete runtime object onto the accepted row. A persisted JSON patch may contain additional `variant_id`, `criterion`, `model_id`, `evidence_scope`, `condition_label`, or arbitrary metadata. TypeScript's `Pick` annotation does not remove these keys from imported JSON.

Consequences: a fully matched approval for one exact target can produce a row with a different identity or silently change unreviewed metadata. The preflight evaluates the original target, not these extra writes. This is a residual baseline weakness made important by the advertised exact-target/full-snapshot contract.

Recommended fix: reject own `after` keys outside the four documented patch fields, or explicitly project those fields. Rejecting is clearer for an editorial register because unexpected intended changes must not be silently discarded. Keep the complete literal before snapshot; do not whitelist the before state.

Required fixture: add one extraneous key at a time, including identity, evidence scope, verification metadata, and an unknown nested field; require rejection with unchanged inputs. Root's newly read parity test includes a corresponding extra-key matrix at lines 62–67.

### 2. Low: locale-sensitive key ordering can reject equivalent literal JSON snapshots

Initial inspected source: `src/lib/correction-guards.ts:9–13`. `localeCompare` may return zero for distinct Unicode strings, such as composed `é` and decomposed `e` plus combining acute. Stable array sorting then retains their original insertion order. Two objects containing the same exact keys and values, inserted in opposite orders, can serialize differently after this canonicalization and falsely conflict.

This is a false rejection rather than unauthorized approval. It matters because extra runtime JSON metadata is intentionally included and the helper promises object-key-order independence.

Recommended fix: deterministic code-unit comparator (`a < b ? -1 : a > b ? 1 : 0`), preserving exact strings. Add a nested Unicode-key reorder fixture. This also keeps the helper suitable for potential future cross-runtime reuse without making a digest claim now.

### 3. Low: availability snapshot helper captures an alias rather than an independent observation

Initial inspected source: `src/lib/availability-corrections.ts:30–39`. `availabilitySnapshot(car).evidence` is the same object as `car.availabilityEvidence`. A caller that stores this snapshot and later mutates the car can unknowingly alter the supposedly reviewed before state. Approval fixtures currently avoid this by wrapping the helper in `structuredClone`, but not every existing caller does so.

This does not bypass an independently persisted JSON before snapshot. It is a correctness hazard for in-memory proposal authoring/review and inconsistent with the helper's name. Return a detached clone and add a fixture that mutates the original car after capturing its snapshot, then verifies the old snapshot remains unchanged and stale approval conflicts.

### 4. Future runtime-contract boundary: JSON serialization is lossy for non-JSON inputs

Initial inspected source: `src/lib/correction-guards.ts:8–19`. The equality helper does not validate JSON-shaped inputs before stringification. Examples include non-finite numbers collapsing to `null`, sparse/undefined array entries collapsing to `null`, custom objects losing their original type, functions disappearing, and a callable own `toJSON` property influencing serialization. Cyclic inputs can recurse indefinitely until a stack error.

Ordinary checked-in JSON does not express functions, sparse arrays, or custom objects; the current registers are empty. This is not a current public endpoint exploit. However JSON numeric overflow can yield a non-finite JavaScript value, and future direct callers may supply runtime objects. Do not describe this helper as a complete hostile-runtime validator without a strict JSON-value check. Existing fact value validation provides a model but its literal full-before comparator has related limitations.

If hardening now, reject non-finite numbers, non-plain objects, sparse arrays, cycles, and other non-JSON defined values; preserve normal JSON object-key and array semantics. Decide explicitly how undefined object members should follow JSON absence semantics. Add isolated fixtures; do not introduce a compatibility bypass for approved records.

## Positive review results

- The full `beforeFeature` is required for each approved equipment edit; the four-field prior patch is also checked. Unknown defined JSON metadata participates in comparison rather than being reduced to the static Feature type.
- Availability comparison now includes all recorded evidence fields, both verification flags, arbitrary nested metadata, and absent/false/null/empty-array distinctions where JSON preserves them.
- Equipment global preflight is called in `data.ts` before per-car edit filtering. Duplicate approved IDs across variants and unknown or ambiguous variant/criterion pairs no longer disappear through per-car slicing. Standalone apply invokes the same preflight.
- Immediate predecessor enforcement is same-target, ordered, and exact in both paths. An initial predecessor, missing next predecessor, skipped predecessor, cross-target reference, self/future reference, or backward review date is rejected by the current logic. Each application also requires the full before snapshot to match the preceding result.
- Pending and rejected edits remain inert. Only approved IDs participate in uniqueness and chronology, as specified by checkpoint A.
- Shared source validation now requires an array, nonempty unique string IDs, exactly one matching source registry row, a safe HTTP(S) URL without credentials, a valid access date no later than review, and no current hold/conflict/access limitation.
- Equipment after arrays are cloned. Availability after evidence is cloned. Input rows and accepted proposal records are not mutated by application itself.
- Availability flags are validated as booleans when defined. Existing after status and qualification constraints are retained.

## Semantics deliberately preserved

- Equipment does not gain a 30-day source freshness requirement. Availability retains its existing 30-day check relative to evidence `checkedAt`.
- A source accessed after evidenceDate but on or before reviewedAt remains accepted, matching baseline fact/availability behavior. Changing that would be a new evidence-date policy.
- Availability still distinguishes advertising from verification through separate flags. This patch must not infer physical stock or factory-order acceptance from an advertised listing. The inspected source does not add such an inference.
- Review dates are monotonic, not strictly increasing; multiple corrections may share a date. Evidence dates need not be monotonic across a chain. That matches the stated checkpoint and fact path.
- Source usability/uniqueness is not historical source-content binding or independent factual verification. A same-ID source URL/title/content may change without a source snapshot comparison. This limitation was already documented in audit A3 and is outside this checkpoint.
- The global equipment preflight trusts its supplied feature rows as the known target registry. Canonical app builds also validate feature references against variants, models, and criteria. A future standalone handler must supply a trusted complete registry; it should not treat arbitrary caller-supplied feature rows as authoritative known identities.

## Test coverage review and proposed additions

Root's newly added `tests/correction-guard-parity.test.ts` was read at its 122-line state; it was not run. It covers broad declared/unknown equipment drift, missing full beforeFeature, duplicate global IDs, unknown/ambiguous targets, chains, several source failures, proposal immutability, extra after keys, availability flags and nested drift, same-target chronology, ambiguous cars, duplicate sources, freshness, false advertising flags, ASCII key-order equivalence, array order, and literal `__proto__` significance.

Before calling checkpoint A comprehensively covered, add or verify:

1. Explicit empty and non-string correction IDs for both paths, and rejected as well as pending inert entries
2. A real global-preflight-plus-two-slices fixture: different valid corrections on two cars apply to their respective slices; a duplicate cross-car ID is rejected before either slice is treated as globally validated
3. Complete availability evidence drift matrix: checked date, order status, stock status, sources, qualifications, availability itself, metadata addition/removal, and false/null/absent distinctions; existing baseline tests cover some but not all
4. Availability stale full before after a first edit, skipped predecessor across three edits, and explicit self/future references; corresponding equipment foreign-target/self/future references
5. Shared source boundary fixtures for blank/non-string IDs, malformed URLs, exact 30-day freshness pass and 31-day fail, and source access on review day versus next day
6. Detached availabilitySnapshot capture and nested after metadata/array mutation isolation
7. Nested Unicode key-order equivalence and, if adopting strict runtime validation, non-finite/sparse/cycle/custom-object rejection
8. An assertion that all three live correction registers remain empty

Existing integration tests already cover dependent equipment strength suppression while retaining independent tradeoff, availability revision invalidation, withdrawn-car ranking exclusion, and report/export propagation. They do not prove final suite/build/portable parity here; root must execute the authorized final gates.

## Performance observation, not a correctness blocker

`effectiveFeaturesFromRows` calls the full equipment registry preflight for each car. With no approved edits, it returns immediately, so this checkpoint does not add a large feature scan today. Once a real approved edit exists, each invocation rebuilds the full target count map. Prefer one preflight per catalogue evaluation plus a fresh global preflight for public mutable-snapshot calls, without introducing stale cache acceptance. No performance measurement was performed.

## Initial inspection anchors

At 00:40:59 UTC:

- correction-guards.ts: `4c3fdcb6dbfcdc30c4122bdca1f2a29c6cb371cbff62fadd72271939b031bb13`
- feature-corrections.ts: `97dbc807b02499e5c41755c50aeb8b763459facd63e1cb170d59b7855a7b476a`
- availability-corrections.ts: `6420f52776ae4771262a64d13e70a5e22f153983ab0fef3fded45f12d11e5d0d`
- data.ts: `7436916ab2a7409ccf1944acd80b419d62cfa553719f9a65f808dd3efd0b2609`
- All three approved correction registers were exactly `[]\n` and each hashed to `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570`

## Final addendum: resolved source findings

Final reread completed at approximately 00:43:22 UTC. No remaining must-fix correctness finding was identified in checkpoint A's persisted-JSON guard scope. This is a source-review conclusion, not a test/build pass.

- Finding 1 resolved: equipment after patches reject keys beyond the four documented fields before spreading the cloned patch.
- Finding 2 resolved: recursive canonicalization uses code-unit key ordering. A composed/decomposed Unicode-key reorder fixture is present.
- Finding 3 resolved: availabilitySnapshot returns independent evidence via structuredClone. A source-car mutation fixture is present.
- Finding 4 resolved for the supported plain JSON contract: canonicalization rejects non-finite values, cycles, non-plain objects, functions, undefined array elements, and sparse arrays. Undefined object properties deliberately follow JSON absence semantics. Normal object and array order behavior remains explicit.
- One additional runtime bypass found during the final reread was also reported and resolved: Array.prototype.every/some skipped sparse after-source/qualification slots, and Set size did not reliably detect those holes. Both correction paths now call assertReviewedJson on the full after payload, while usableCorrectionSources independently evaluates Array.from(ids). Three isolated sparse-after fixtures are present.

The new parity file now contains 14 test declarations. Root reported a focused passing run before the last sparse-after change; this reviewer did not execute it, inspect a final test log, or claim that report applies to the final hashes below. Root explicitly plans to exclude the existing HTTP-serving local-review.test.ts under the current no-HTTP restriction, and should report it as unrun rather than a complete unrestricted suite pass.

The remaining test suggestions above are incremental completeness opportunities. They do not represent an additional source defect found after the fixes. Global registry validation remains intentionally before per-car filtering. The repeated-preflight performance observation remains nonblocking and unmeasured. Current source/date/advertising semantics remain unchanged.

Final read-only hashes:

- correction-guards.ts: `8c4ef619ba9976753e030ad28cb4893c2f22d983017e5ed1ecdad626b92dbdba`
- feature-corrections.ts: `ea70dc9022ebc65107aede2100d790dbfb5a6fccc5906d99659000914381acd6`
- availability-corrections.ts: `dc082383730fb3c2e7fa298ea85ea1514efb5bda63fbc05aff967a5c6fc45cf2`
- data.ts: `7436916ab2a7409ccf1944acd80b419d62cfa553719f9a65f808dd3efd0b2609`
- tests/correction-guard-parity.test.ts: `318febce7b1b9c1442b849bc646721f62c4f5e814a547530b8c967e1072f875b`
- All three live approval registers remain unchanged at `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570` (`[]` plus newline)

No app/runtime/tests/build/browser/HTTP work was performed by this reviewer, and no app files were modified. Only this independent audit artifact was written.

## Test-only follow-up addendum

At approximately 00:46:54 UTC, read the three additional test declarations and root's completed focused-test log at `/tmp/roadmark-63-guards-focused.log`. No tests or application commands were executed by this reviewer. The original review and intermediate hashes above are preserved as history.

The added fixtures close these previously suggested coverage gaps:

- Two distinct valid equipment approvals pass complete-registry preflight and then apply to their respective per-car slices without changing target identity
- Empty and whitespace-only IDs are rejected in both paths, and rejected approvals remain inert in both paths
- Availability drift in checkedAt, orderStatus, stockStatus, sourceIds, qualifications, and availability is rejected; together with the existing verification-flag and nested-metadata fixtures, every declared availability evidence field is covered
- A second availability edit using the original snapshot after the first edit changes qualifications is rejected as stale
- Availability accepts a source exactly 30 days before the evidence date and rejects 31 days; equipment still accepts the older source, documenting that no new 30-day equipment policy was introduced

The parity file now contains 17 test declarations. The inspected focused log records 24 tests passed, zero failed, zero cancelled, and zero skipped across the parity and existing equipment/availability correction files. This is direct read-only inspection of root's run log, not an independently executed run and not a claim that the full suite or build has completed.

All four implementation hashes remain identical to the final source-review hashes above. The updated final parity-test hash is:

- tests/correction-guard-parity.test.ts: `d5529d7992f2ec23b5157c49ce6b0b23c6a9780baedc18e69dd0f05b3137dde0`

Root reports that the full non-HTTP suite and build are running. Their outcome remains pending and is not inferred from this focused result. The existing live-server local-review.test.ts remains outside the permitted worker verification scope.
