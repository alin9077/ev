# Implemented Fact issue guard: read-only review

Reviewed 2026-10-10:
- `src/lib/validate-catalogue-issues.ts`
- `scripts/validate.ts`
- `scripts/build-portable.ts`
- `tests/fact-issue-validation.test.ts`

## Result

No blocking defects found. The patch matches the intended narrow structural preflight and closes the raw-ID regression for ordinary builds and direct portable generation.

- Unknown inputs are narrowed before dereference. Catalogue, car, facts, Fact, issue-array and Issue-member checks return diagnostics for malformed JSON-shaped inputs rather than blindly casting them.
- `entries()` visits sparse catalogue and issue-array slots; `Array.from(ids).every(text)` catches sparse ID-array slots. Every required Issue field is checked. Empty `issues`, `model_ids`, and `source_ids` remain valid; blank/non-string IDs and required text fail.
- The validator only reads input and builds an independent diagnostics array. It neither normalizes nor removes evidence, and does not weaken or coerce issue warnings.
- There is no publication-issue registry lookup, priority enum, global ID uniqueness requirement, or object-identity test. Local issue IDs, repeated references, arbitrary nonblank priorities, and extra fields are accepted.
- CLI validation exits before `pack()` if any accumulated error exists. Standalone portable generation validates before pack serialization and before all HTML writes; its earlier esbuild call uses `write: false`, and its existing catch sets a failing exit status.
- Six regression groups cover acceptance/nonmutation, the original mixed object/string failure with index context, malformed/sparse containers, every required member, aggregated errors across cars/facts, and warning-preserving `factClaim()` calls for every compiled Fact. The broad test is not restricted to FONZ or the displayed key-measurement subset.

## Scope and nonblocking notes

This intentionally checks `Fact.issues`, not the complete Car/Fact schema, `Car.issues`, source existence, model applicability, or factual truth. Direct development/runtime callers that bypass these build entry points remain outside this preflight. These are stated scope boundaries, not regressions.

The source review confirms wiring order, but the new test file exercises the helper rather than spawning deliberately failing CLI/portable builds. A later smoke test of a malformed input producing a nonzero command result before writes would be optional integration hardening; it is not necessary to change this patch.

No application edits, browser use, network requests, or duplicate heavy checks were performed. Root owns the running tests, typecheck, lint, validation, and subsequent full-build verification.
