# Working57 portable string-codec implementation review

10 October 2026 UTC. Independent static, read-only review of the application. The reviewed hashes and archive comparison are recorded in `implementation-review-evidence.json` beside this report.

## Verdict and blockers

**No static correctness or security blocker found.** The production TypeScript implementation closely follows the previously audited Map-based prototype and retains the intended serialization-only boundary. Root's subsequently added tests address the two initially suggested coverage gaps.

Root's initial actual generated-output proof reports complete decoded data parity and successful Node execution of the portable data-module accessors. I reviewed that proof and its generating script statically; I did not execute them. Final aggregate checks were still running when root requested this addendum. Browser, offline UI/navigation and phone behavior remain unverified by this review.

No application file was changed or imported, and no app tests/builds, HTTP/localhost requests or browser checks were performed by this reviewer. No production code fix is requested.

### Follow-up test additions reviewed

- `tests/portable-string-codec.test.ts:121–133` now constructs 80 distinct repeated values, round-trips the whole array, checks encoded `~z`, `~10`, `~1z`, and `~20` boundary tokens, explicitly decodes two multi-digit tokens, and rejects alternate spellings. This meaningfully tests the base-36 boundary that was missing from the original fixtures. Existing malformed-reference coverage still checks an out-of-range token.
- `tests/portable-packs.test.ts:61–74` now constructs every catalogue pack, stores it, encodes and decodes the complete stored-pack/source-registry tree, checks exact normalized serialization, hydrates it and deep-compares every original pack. It also checks the input was not mutated and that every hydrated source is the identical restored canonical registry object. This correctly composes the codec and existing hydration rather than separately testing them.
- `tests/portable-packs.test.ts:76–81` round-trips a real stored pack and confirms hydrating it with an empty registry still throws the existing missing-source error. It verifies that no codec step silently absorbs the provenance failure.

These are static test-design conclusions. Any statement that they passed belongs to root's actual test output, not this independent review.

## Source56 and scope verification

I verified the saved source56 ZIP against the package-pair manifest:

- File: `roadmark-recovery/roadmark-checkpoint-2026-10-10(1).zip`
- Bytes: 19,305,141
- SHA-256: `f9ee126c82e7269be1a446c09055656ca8d44006d8d476e3eb53bcd1f4cff854`

The initial comparison had 824 byte-identical saved entries and only the two intended integration files changed. A second comparison captured root's concurrent status update: 823 entries remain identical, with `qa/current-work-status.json` additionally changed. The archive-only `OPEN-THIS-CHECKPOINT.txt` and `CHECKPOINT-SOURCE-MANIFEST.json` are checkpoint packaging files, not deleted app source.

Within `src`, `tests`, `scripts`, `data`, and `public`, the additions are only the new codec/test plus the two existing working-tree portable public copies absent from the source archive. At that initial snapshot, the only modifications in those trees were:

- `scripts/build-portable.ts`: imports the encoder and replaces final raw serialization with `encodePortableJson(JSON.stringify(data), 64)`
- `src/portable/data.ts`: imports the decoder and replaces the `JSON.parse` boundary with `parsePortableData`, retaining the `PortableData` assertion

The follow-up also adds the codec import and two tests to `tests/portable-packs.test.ts`, as described above. Generated HTML and QA outputs are now changing as root builds and verifies working57. `storePortablePacks`, `hydratePortablePacks`, all consumers/UI, CSS, catalogue and source data, art generation, aliases, hero flags and output destinations remain unchanged in application source from source56. The new codec does not affect normal-route data loading.

## Correctness and safety findings

### JSON semantics

`src/lib/portable-string-codec.ts:10–44` accepts the already serialized JSON string. The builder calls the original `JSON.stringify(data)` exactly once before encoding (`scripts/build-portable.ts:66`). Thus `undefined`, sparse arrays, non-finite numbers, `-0`, Dates and user `toJSON` hooks undergo the same original serialization normalization; they are not serialized from the original JS object a second time.

The codec's parse/stringify pass acts only on that normalized JSON tree. It preserves object-key order and all representable resulting primitive values. Repeated-string selection is value-only, uses original first-occurrence JSON order, and applies an explicit 64-UTF-8-byte build policy. Reverse insertion into the traversal stack (`:21–24`) reproduces the prototype's depth-first visitation order, so its dictionary ordering should match the frozen330 reference exactly.

The decoder (`:75–90`) does not reserialize numbers, so a literal `-0` supplied in an envelope is retained. Encoder losslessness is intentionally scoped to the existing `JSON.stringify` boundary, not arbitrary raw JSON numerical spellings or non-JSON JavaScript objects. In particular, it does not claim preservation of an arbitrary raw JSON `-0` through the encoder, which is outside that integration contract.

### Prefix collision handling

The encoder chooses a dictionary token before considering literal-prefix escaping (`:34–36`). Every non-interned value starting with `~` gains one leading `~`. Keys are untouched. The decoder removes exactly one prefix for `~~…`, and otherwise performs an exact lookup of the complete token (`:66–73`). Dictionary strings are never encoded by the replacer and are never decoded recursively, preserving literals such as `~0`, `~~0`, or a dictionary value referencing its own token text. Empty-string dictionary entries remain valid because absence is checked against `undefined`.

### Envelopes and reference rejection

The decoder requires a non-array object with exactly three own properties, the expected format, all named required fields, and an array of only strings (`:49–61`). It accepts arbitrary envelope property order, has no legacy-data fallback, and retains JSON syntax errors.

Generated canonical token keys in a `Map` reject uppercase, negative, signed, leading-zero, partial and out-of-range references without numeric parsing ambiguity. Dictionary duplicates and unused entries are harmless valid inputs, not required errors. A malformed nested reference throws before the caller receives the data tree. Although earlier leaves may already be decoded internally, the tree is locally allocated and has not escaped; hydration starts only after successful return.

### Dangerous keys and prototypes

The parse boundary accepts text, not caller-provided objects with accessors or custom prototypes. `JSON.parse` creates ordinary own writable data properties for dangerous names. Decoder iteration uses `Object.keys` only, and assignments update those already existing properties (`:80–87`). An own `__proto__` is therefore updated without invoking the inherited setter. `constructor`, `prototype`, `toString` and `hasOwnProperty` remain ordinary data.

There is no reconstruction, merge, `Object.assign`, inherited lookup, evaluation, object-key rewriting or marker-object mechanism. The TypeScript `ownValues` helper is only an identity cast. It changes neither arrays nor object prototypes.

### Independent containers

Every object and array remains the independent container created by `JSON.parse` for its position. Only immutable string primitives are shared through the table. Repeated current-source and expected-source snapshot objects are not interned, merged or reconstructed. Existing hydration's source-registry sharing remains exactly its prior behavior; the codec does not introduce additional object sharing.

### HTML script safety

The complete envelope, including dictionary values, object keys and data leaves, escapes every literal `<`, U+2028 and U+2029 (`:41`). With no literal `<`, mixed-case closing tags and HTML comment openers cannot terminate or change the JSON script element. Quotes, backslashes, literal `\\u` text, NULs and lone surrogates retain ordinary JSON escaping semantics.

The builder retains `type="application/json"` and the reader uses `JSON.parse`, with no execution of data or decoded strings. Executable-bundle handling is unchanged. This is a sound static safety design; scan the final emitted data node as an integration check.

### Browser boundary and tree-shaking

The browser reader imports only `parsePortableData`. The module is dependency-free, with no Node imports or top-level encoder work. `TextEncoder`, dictionary frequency counting and encoding statistics occur exclusively inside the unused exported encoder function. Esbuild's bundled ES-module pipeline should eliminate that function; the remaining decoder needs only standard ES2022 browser facilities already consistent with the configured target.

Root subsequently checked the actual executable JS for both decoder error strings and absence of the three encoder-specific strings `Invalid portable string threshold`, `dictionaryValues`, and `replacedOccurrences`. This supports removal of the build-only encoder and is correctly scoped to runtime scripts rather than the JSON payload. The proof does not execute the emitted IIFE or provide a standalone size attribution for decoder versus other bundle bytes. Do not infer success merely because `TextEncoder` appears or disappears elsewhere in the complete app.

## Root's initial actual generated-output proof: reviewed, not rerun

Sources reviewed:

- `roadmark-research/audits/portable-string-codec/actual-app57-portable-proof.json`
- `roadmark-research/verify_portable_codec_actual.cjs`

The script verifies frozen source56 HTML against the saved SHA-256, reads all four newly emitted HTML copies and requires equality, extracts the actual encoded data, invokes the production codec, checks deep equality and exact normalized serialization against source56, and confirms determinism by re-encoding the original tree. It checks script-safe data text, unchanged non-script HTML, runtime decoder/encoder markers, and all 102 recorded source-data hashes. It then imports the actual portable data module in Node with only a `document.getElementById(...).textContent` accessor stub and checks its exports against baseline hydration.

Root's recorded initial result:

| Measurement or check | Recorded result |
|---|---|
| Complete decoded tree / normalized serialization | Equal to source56 |
| Normalized JSON SHA-256 | `5232de6213a7a3a2580adb8bc3aeb4a35238b5e6d7df34e2376a3de79624f97d` |
| Actual HTML SHA-256 | `19269143aa122654fe8c738b3ba331117115412672345d81859151cb2717c2d1` |
| HTML bytes | 54,247,354 → 32,160,631; 22,086,723 removed |
| Same-Node gzip-9 bytes | 4,635,427 → 3,497,522; 1,137,905 removed |
| Embedded JSON bytes | 52,666,304 → 30,578,614 |
| Data-module coverage | 330 picker cars, 330 full packs, 2,096 registry sources |
| Canonical source identity assertions | 3,889 hydrated references |
| Recorded data files | All 102 unchanged |
| Browser / phone / release approval | False / false / false |

### Exact limitations and subsequently strengthened proof script

After the initial result, root revised the proof script. I statically reviewed that revision too. The saved JSON result still contained the old fields at this review snapshot, so the new assertions below are sound test designs pending root's final execution, not retroactively passed measurements.

1. **Accessor integration, not every UI consumer.** The initial `allPortableConsumersEqual` flag denotes the checked outputs of `pickerCatalogue`, `catalogue`, `pack`, `research`, `counts`, and `art`. Root has renamed it to the more precise `allPortableDataAccessorOutputsEqual` in the revised script. React views, navigation, comparison, source overlays, CopyForAI and the emitted browser entry are not executed. The document stub is correctly disclosed as a Node module test.
2. **Shell equality excludes every script, with a new separate hero-flag assertion.** `strip()` removes all script nodes, so that comparison is specifically remaining HTML/CSS shell equality. The revised script separately requires current runtime text to start with `window.__EV_B=true;` and verifies the baseline contains the same entry flag (`:48–49`), then emits `originalHeroEntryFlagPreserved`. This directly closes the initial flag-check gap when the revised run passes; it still does not execute the complete runtime script.
3. **Topology instrumentation has now been added to the script.** Initial deep equality/stringification did not independently test aliases or descriptor flags. The revised iterative paired-container walk (`:25–40`) correctly checks that every decoded object/array is encountered only once, compares ordinary prototypes, compares full `Reflect.ownKeys` order, and compares each writable/configurable/enumerable flag. It includes array length properties and safely handles own prototype-like keys through descriptors. Full primitive equality was already established by the preceding strict deep comparison. The revised record will report `independentContainersChecked` and `ownKeysDescriptorsAndPrototypesEqual`; those stronger measured claims await the new result. No static defect was found in the walk.
4. **Initial artifact, not automatically the final rebuilt artifact.** The record is tied to the stated HTML hash. Root should rerun or otherwise reconcile it after the final build and capture final source/artifact identities before durable save. Passing source tests cannot alone establish that an older generated HTML was rebuilt from those exact final sources.
5. **Local bytes, not delivery or device performance.** Gzip totals use the same local Node compressor; HTTP compression was not observed. There are no phone timings, DOM/render/GC measurements, mobile peak-memory measurements or browser/offline acceptance results. The prior prototype showed extra parse-plus-decode work, so a smaller artifact is not a proven speed improvement.
6. **Proof flags have precise scope.** The script checks safety and four-copy equality even though it does not emit individual named booleans for them. It does not record a separate encoded-data SHA-256, dictionary count/replacement totals or top-level hashes; complete equality still covers all payload values. Those supplementary measurements should only be claimed if captured separately.

The proof contains no evident circular comparison that would hide a changed tree: it anchors the input to frozen source56 and compares the actual emitted decoded tree to that original, not merely to another current-code serialization. Re-encoding with the same codec is a useful deterministic-byte check in addition to, rather than a substitute for, baseline equality.

## Remaining completion gates

- Root's focused codec/pack tests and normal test/typecheck/lint/validation/build batch must finish successfully; this review does not predeclare their results
- Reconcile the generated parity proof with the final rebuilt artifact and source hashes, then retain the four-copy/safety/bundle checks
- Keep any UI, offline navigation and real-phone checks pending until performed under the relevant authorization
- Keep publication/release approval separate from technical checkpoint verification

The initial actual 32,160,631-byte output replaces the earlier 32,159,664-byte prototype simulation that omitted decoder cost. Root's generated output is 967 raw bytes larger than that simulation. These are actual root-generated file measurements; I make no browser, phone-speed, real-device-memory, UI acceptance or release-readiness claim.
