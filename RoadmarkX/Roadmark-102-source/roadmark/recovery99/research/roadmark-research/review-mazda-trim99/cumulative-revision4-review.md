# Mazda99 cumulative revision4 reconciliation

**GO for the static cumulative composition, pending root's whole-project typecheck/lint.** No manifest or delta-scope blockers. This is not a typecheck or runtime pass; full QA remains gated on the quick checks succeeding.

Verified hashes:

- Candidate: `c710eb25970241c720c8695024f66a31cbaaaa2e6dd4b101143b531a02ae0850`
- Expected inputs: `4a4204128daf108f35296c77d3beb4476a453c98ab571648da9d85b1b0085e86`
- QA candidate: `51e2b73e998f80b4fd10260df54c97ba8d337642c384a4c57606e58875ee590a`

Final22 rows exactly overlay the reviewed two-file revision4 on the retained failed revision3 state. All17 checkpoint98 replacement preimages and five new paths remain intact. All22 current applied files match final hashes and byte counts. The1,675-entry map equals checkpoint98 plus exactly those22 deltas, preserving1,653 old paths.

The shared helper is back to exact initial80ef31 bytes. Relative to cumulative revision2, only checkpoint95's scoped test after-image changes. The normalized QA projection matches all22 final rows and the correct candidate hash.

Lineage retains initial candidate, revision2 repair and failed revision3 type repair, while correctly adding revision4's scoped repair and the previous failed cumulative manifest. All failed revision3 records remain hash-identical. Evidence, data, guards, historical assertions, counts and protected visual/runtime declarations are unchanged.

Exact file/hash records are in `cumulative-revision4-review-pins.json`. Root owns execution gates and subsequent QA. No application mutation or candidate/project execution was performed by this reviewer.
