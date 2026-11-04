# Mazda99 revision4 scoped type repair

**GO to apply this two-file repair and run root's whole-project typecheck/lint. No static blockers.** Bound to manifest `d744f716d6d5ca9c3db73bacf72390bc5315cafe4cd5575e1833e780fb3a6790`. Exact pins are in `revision4-review-pins.json`. Full QA remains conditional on the quick checks passing.

The shared checkpoint99 helper is restored byte-for-byte to its original approved `80ef31bac488635dbf69fdac7b7d4dbd2812ae53a6a08f3e8b68de7d2efe71d7` state. This removes revision3's globally propagated record union and restores unrelated historical consumers' prior type contracts.

Only checkpoint95's selected historical Mazda row receives a type assertion to the existing pinned95 appendedRecord shape. The imported helper chain first verifies the complete current99 market and reconstructed historical95 market, including that exact appended record. The referenced fixture row independently equals99's recorded beforeRow. The cast therefore describes a runtime-validated historical value; it is confined to that row, uses no any and does not weaken an assertion or guard.

Removing the type-only import, explanatory comment and local cast produces byte-identical previously approved checkpoint95 test text. Every historical count, null assertion, digest, mutation test and runtime statement is retained. No production source, evidence, data or fixture changes. Failed revision3 remains preserved and its execution hold is not recast as a pass.

Root must run whole-project typecheck and lint before another full QA attempt. This static review makes no execution-pass claim and performed no app mutation or candidate/project execution.
