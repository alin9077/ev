# Mazda99 revision3 type-only repair review

**GO for the one-helper type repair. No static blockers.** Bound to manifest `ef550abc42ab248b26170b9b54c1121cf5e0d5aecead6d2f311d164072853a2f`. Exact pins are in `revision3-review-pins.json`; earlier reviews are retained unchanged.

The previous generic return type incorrectly promised the current99 record shape after restoring the historical95 Mazda row. The new return type preserves other top-level inferred fields and permits either current record types or the exact existing95 fixture's appendedRecord type. That fixture row is independently verified to equal99's stored market.beforeRow, including its null technical epoch. The import is explicitly type-only and the project's existing configuration enables JSON-module typing.

This addresses the reported impossible-never narrowing without changing the historical null assertion or disguising the problem with an any cast at the failing tests. Full current/predecessor hashes, the exact Mazda/context/artifact checks, cloning and reversal remain intact. Removing only the new type import, explanatory type alias/comment and signature/cast changes recovers byte-identical original helper text. No executable statement, runtime import, guard, assertion, fixture, hash, data or production source changes.

Candidate and retained predecessor bytes match the declared pins. Root applied the type repair during final review; the current helper matches its approved after-image. Original and revision2 manifests remain unchanged. This replaces one existing cumulative new-file after-image; totals remain22 candidate paths, five new files and1,675 expected inputs.

Root must confirm whole-project typecheck and lint, then complete required QA against final cumulative inputs. Reported earlier test passes are background, not execution claims for this revision. No candidate/project execution or app mutation occurred in this review.
