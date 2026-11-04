# Independent buyer identity storage audit

Read-only review completed 10 October 2026. Application: `/workspace/scratch/586427eef9f2/roadmark-work/roadmark`.

## Conclusion

No blocking correctness or client-boundary finding in the reviewed storage-only change. The actual normalized proposal expands to the exact ordinary `JSON.stringify` representation of the checked inline baseline. The pure evaluator is byte-for-byte unchanged from the frozen Kia/Cadillac runtime input lock. The loader shares only immutable expected identities; no actual catalogue input is accepted by its interface or borrowed by its implementation.

This audit does not establish full build/typecheck success or a runtime memory/time improvement. It ran no full catalogue evaluation, production build, exhaustive mutation matrix, or source changes. The only file written is this report.

## Independent checks

- Ran `node --import tsx --test tests/buyer-proposal-storage.test.ts`: all 5 tests passed (about 135 ms).
- Parsed the complete frozen baseline, normalized proposal, and ledger; invoked the real resolver once. Expanded ordinary JSON equals baseline ordinary JSON exactly, including key order, missing/null distinctions, all other proposal fields, records and dependencies.
- Repeated the complete equality check through the final `buyer-proposal.ts` filesystem loader after its IO change. Importing that module from the application project root succeeds and yields the same exact ordinary JSON hash.
- Ordinary JSON SHA-256 for both representations: `fb55c062ca66302d18cf83c4f961d662e693c343164d68ed1d3cc8acfa171617`.
- 287 records, 4,546 dependencies; 62 own identities and 100 related uses resolve to 72 distinct snapshots. Every reference resolves; no unused ledger entries.
- 225 records explicitly omit their own identity through `none`, and 225 explicitly omit related identities through `none`. Exact baseline equivalence verifies these are existing unguarded forms, not newly dropped guards.
- Recursively inspected all 46,073 object/array nodes in the resolved ledger snapshots: every node is frozen.
- Seven Kia/Cadillac targets retain two distinct expected shapes: EV4 Air/Earth/GT-Line; LYRIQ Sport/V; OPTIQ Sport; VISTIQ Platinum. Whole-object hashing does not merge them by vehicle ID or union their fields.
- Used the TypeScript parser to follow runtime static imports/re-exports and literal dynamic imports/require calls across 124 source modules. None of 19 `use client` roots reaches the loader, normalized proposal, or ledger. The portable entry also has no such path when applying its documented `@/lib/data` and chapter-art aliases.
- A separate small pure evaluator fixture passed 11 checks: an existing top-level expected null matches, deleting that actual property suppresses, changing an own nested value suppresses, adding a whole actual fact suppresses, changing a related value or source-array order suppresses, and restoring each value re-enables. Expected ledger JSON stays identical throughout; both actual fact graphs remain unfrozen and distinct from expected graphs.
- Current `src/lib/selling-points.ts` SHA-256 matches the frozen `kia-cadillac-runtime-input-lock.json`: `6bc95a324b3f0490950ac58a745d7f299554ad0a9fe98d203ff9e9ee7ff9dcb2`.

## Code review findings

### Reference resolution and fail-closed behavior

`src/lib/buyer-proposal-storage.ts:29–120` checks the storage discriminant, proposal/ledger containers, record containers, both explicit guard declarations, every ledger object's shape and hash, ref syntax, own-property existence, and snapshot target ID. Missing, null, malformed, unknown/prototype-named, wrong-target, and corrupted refs cannot become `undefined` guards. Mixed inline forms are rejected even when explicitly undefined. Invalid artifacts throw during server input loading.

The `none` sentinel intentionally preserves absence; it is not a nullish/default fallback. Null references remain invalid. Nested null values inside valid identities remain intact. Existing optional guard semantics remain in the unchanged evaluator, including its top-level `a ?? null` comparison plus own-key presence checks.

`Object.fromEntries` preserves ordinary source key ordering while renaming only the normalized identity fields. No sorted canonicalization, source/fact reorder, cloning of shared expected trees, actual-object shortcut, cached equality result, or serialization cache was introduced.

### Immutability and boundaries

The final `buyer-proposal.ts:1–19` synchronously reads and parses the two fixed JSON inputs once during module initialization, types them as `unknown`, and passes them to the resolver. This avoids inferred giant JSON literal types and independently materializes the expected graph. `data.ts` imports the expanded proposal. `selling-points.ts` has no import of either storage module or JSON input; the storage resolver imports its proposal type only. Frozen objects are confined to the expected ledger subtree. Actual `Car` graphs do not enter the loader, and the existing evaluator projects summaries rather than expected identity objects into output cars.

`next.config.ts:4–9` explicitly includes both exact JSON paths under the all-route `/*` tracing key. This matches the installed Next 16.3.8 documentation at `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/output.md:80–130`: route keys are route globs, file paths resolve from the project root, and `/*` is the documented global route key. Fully static pages and Edge routes do not produce these server traces. Current application readers are Node/build-side, and static/portable exports evaluate the inputs at build time. After the final build, inspect emitted server `.nft.json` traces to confirm both files are actually packaged. A runtime deployment must retain the files under `data/` relative to the application working directory; this is the same cwd assumption as the existing raw catalogue reader.

The module's server-only comment is documentation, not an explicit Next `server-only` poison import. Current reachability is nevertheless correct, and its `node:fs`/`node:crypto` dependencies provide additional browser-bundling failure boundaries. Keep the import graph check or equivalent bundle validation as a regression gate; do not introduce the ledger into the pure evaluator. The final IO change adds only Node builtin imports and does not add a client-reachable edge. No new package/import is recommended merely for this already checked one-off change.

The helper accepts `unknown` but is designed for parsed JSON artifacts. It is not a general sanitizer for caller-created proxies, getters, cyclic objects, or exotic nested values. That limitation does not affect current production inputs. Avoid broadening its supported input contract without additional validation.

### Migration and release risks

- Low operational risk: `scripts/normalize-buyer-identities.ts:57–64` writes the proposal and ledger sequentially. The complete round-trip check happens before either write, but an interruption or write failure can leave a mismatched pair. The loader fails closed in that case. Keep the checked recovery input and publish/recover the pair together. If this becomes a recurring migration tool, consider staged output files plus a coordinated release rather than writing live inputs in place.
- Frozen research readers/proofs still have the old raw-inline format and hashes. Preserve them as historical evidence, and use a new migration/runtime proof for the normalized loader. The three application test readers now import the expanded proposal rather than interpreting normalized JSON as the old inline type.
- Root is separately responsible for final typecheck, complete test/build/portable checks, catalogue/output parity, representative source/expiry mutations, and performance claims. A pending typecheck or smaller stored JSON is not evidence of those outcomes.

## Pinned reviewed inputs

| File | SHA-256 |
| --- | --- |
| Frozen inline baseline | `31d7eae894540f72d630edb644758c649237885ac118e950cd8999e0ec6824fe` |
| Normalized proposal | `08afe6dcf5b9bf720fb4b8933306e204d11cef2747342f136420b0b77307f212` |
| Identity ledger | `afe66c77d3b132bce3500c051d3a229441009402a0fb57eb3d554eb928061a08` |
| `src/lib/buyer-proposal-storage.ts` | `2febace11633321f2c103a0b3db4c4632df8e3601195922c4b83fce6354f7f7c` |
| `src/lib/buyer-proposal.ts` (final fs loader) | `588c5e79b694e63ecb785a80f6cef902544505a8d8fdf0492c355254ccf21b6a` |
| `next.config.ts` (explicit file tracing) | `1b35e4432cc709a8413b35f4f633cc1a55d74a3d5b6944950b38ab83d5bdc371` |
| `scripts/normalize-buyer-identities.ts` | `467391c04dbf72414e99acd3bb5fbf048c7bb19cefa06d01e643a6ed1a0ab4ea` |
| `tests/buyer-proposal-storage.test.ts` | `05a2950e2c8a055cee4367a1bbcd4401ff23c1c6d4de9882454dc907eedddac6` |

Normalized proposal plus ledger are 41,527,940 bytes, compared with 70,256,293 physical bytes for the retained baseline. This is a storage measurement only.
