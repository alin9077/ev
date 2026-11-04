# Independent static review: buyer-copy97 candidate

## Verdict

**No static blocker found. Suitable for root-owned application and runtime validation as this exact 12-file set.** This is not a test, build, browser, or release pass. The reviewer did not import application code, execute application tests/builds, mutate the app, use a browser, or make Git/network writes.

Reviewed candidate: `/workspace/scratch/586427eef9f2/roadmark-research/buyer-copy97-candidate`

- `candidate.patch` SHA-256: `966f00e4fdb0d8c63cd66bf8ede7d2770343ca12bd99c92d95573c1538b73fb7`
- `MANIFEST.json` SHA-256: `beeadab6de71a00989fb16939e98a9bed7e3789fda0389017ae839c4f9eeed63`
- Baseline: all 1,662 files in `applied96/expected-inputs-revision3.json` independently match current application bytes
- Exact set: six modifications, six additions; all six additions are absent from the app
- All 117 data-file hashes and 24 protected-file hashes independently match
- Candidate patch independently regenerated from complete before/after files and found identical

Full per-file pins and static comparison results are in `static-consistency.json`. `static_review.py` is the reproducible, read-only text/JSON/hash review utility. It does not run or import the candidate.

## Subsequent root-owned application and focused checks

After the static verdict, root reported that it applied the exact 12 files. The review findings above describe the pre-application snapshot; the six additions are now expected to exist. Root reported the new 1,668-file input map at `applied97`, SHA-256 `ee49a83e78db7eeca389a54926004dc1753f49bf717ce2897f4f679ae87b8edc`.

Root also reported 43 focused tests passed (including all 21 new tests, the96 chain, prefetch, detail and hero coverage; execution3977, exit0) and typecheck passed (execution72467, exit0). These are **root-observed results**, not executions by this reviewer. Full QA, builds and browser validation were still pending at that update.

## Runtime scope and JSX review

Application changes are exactly three imports, four JSX text substitutions, and the new pure-string helper:

1. `Discovery`: configuration scope only, inside the existing `c.configurationEvidence` guard
2. `Detail`: configuration scope only, inside the same existing presence guard
3. `MarketAudit`: evidence note and the original indexed limitation text, inside the existing record/limitation maps

Every JSX call uses the current record ID, the exact reviewed field name, and the current original field text. The limitation call retains the original index rather than searching or reordering limitations. Original element types, keys, class names, conditionals, links, filter/limit state, and surrounding text are otherwise unchanged.

The helper has no imports, object arguments, write operations, data-loading, source/date processing, ranking logic, or clock access. It searches a closed ten-row literal map using three strict equalities and returns the original string on no match. There is no normalization, regex rewriting, generic jargon deletion, or fallback to another field or record.

Raw catalogue/Market evidence, projected configuration identity, packed detail data, buyer-summary snapshots, availability metadata, nulls, flags, source URLs, and dates are untouched. The unchanged portable entry imports the same three components, so the display layer is shared without rewriting the portable data producer. Root still needs the portable build and visual checks; the added portable test is a wiring/source assertion, not browser execution.

## Seven wording changes across ten record/field entries

All helper rows, the independent test fixture, and the copy manifest agree exactly. Each original string and exact record identity was independently resolved in the active JSON at the manifest's path.

- **FONZ, two rows:** retains the named advertised-selection boundary and required additional review; no claim that the configuration is already fully verified
- **Surron, three rows:** retains exact advertised New MY26 EBMX offer scope and required additional review; no physical-stock or manufacturer-MY promotion
- **Kawasaki, one row:** preserves Brisbane Motorcycles, New Ninja e-1 (LAMS) (MY26), NX011ATFNN and KAW-NE1-MY26_1; explicitly retains incomplete factory-build verification and separate specification review
- **Mazda limited visual check, one row:** preserves pages 5, 7 and 14 and the three inspected categories; explicitly withholds technical/specification-version/vehicle-specification verification
- **Mazda evidence note, one row:** only the final sentence changes. All prior seller wording, VIN, stock number, published seller fields, 6 October date, and unsold-physical-stock caveat remain identical. Adjacent cargo conflict, order uncertainty, formal-MY uncertainty, price-basis caveat and false ranking/count eligibility remain intact
- **Lexus, one row:** replaces the obsolete add-record instruction with the already-supported integration state. Current raw data contains the two BEV variant records; all BEV/hybrid separation and adjacent measurement/stock/source limitations stay intact
- **BCI, one row:** retains sales-sheet-only scope and unresolved technical conflicts, and explicitly rejects treatment as a verified exact build. Adjacent battery, motor, width, seating, stock/order and homologation limitations stay intact

Unknown IDs/fields, altered punctuation/case/spacing, extended warnings and moved limitation indices do not match this map and therefore retain exact original text. Existing unrelated FONZ limitations are not swept into the replacement.

## Strict historical-source chain

The new reader checks the complete approved bytes of all three changed components plus the introduced display helper before serving any historical input. Every source replacement must appear exactly once; reconstructed predecessors must match both length and SHA-256. It rejects unrecognized delta paths, predecessor/current mixtures, drift and requests for a pre-existing version of the new helper. Cached reconstructed buffers are copied before returning.

Independent literal text inversion, without executing the TypeScript reader, verified:

| Source | 97 approved SHA-256 | Recovered 96 SHA-256 |
| --- | --- | --- |
| Discovery | `5769cee0feddf21dcf532d39fe65aa752bf8d920891a0ad951e1f6adc7ce3480` | `02be90e98919418e433a853ae6019adfdb833b1a0e86a7d9d2d3564da9afecb8` |
| Detail | `421556c025400b37aeb513411e6b319597101885fdc1bc5b7de2be87510a20ec` | `978ab14e0eda23a2369b46348195d1d82a67bb229533a340c5051ccd735505db` |
| Market | `6062cb777b0943c09aeed8bb457b279ac9ab510509e39773d3aa77c34ecacfc1` | `6b52fec78d11617b6bd1f74142765186c6b647a72fbe3dc928afdc07336401cf` |

The helper is pinned to `2d977241a95d6f83d25cee03c58cab1eb406042d3956e5133e0670f1da4f17be`.

The unchanged96 adapter then reconstructs Discovery to `c382047506d1881d4483e6478757dca41fc6d8011855e151027df027f689aa6f` and portable Link to `0add93ac8b2209b4cba733f805d3bfb7f9252fd3d33bd0d9b3da65c95a8ecfe6`. Both are byte-identical to `applied96/before95`. All 32 applicable original sealed91 source/input pins match after this composition. The two coordinated proposal/ledger inputs remain under the original separate history machinery.

- The96 adapter stays byte-identical: `fe9d9db20d712e71971c4a7458762cfd3653c6addc5cb019b42372be4b0c6d16`
- The sealed91 pins file stays byte-identical: `7e164c30217b8eff2180c1cdaefccea9effa95a2c9cce283cec01dfbe5768fb9`
- The97 adapter itself: `838dd04e58cf9185bb483294d5cf3614f08d0e31f23a1914ce485152cedca44e`

The91 helper's outer hash comparison, proposal/ledger exclusions, research check and historical storage logic remain unchanged. The only source-input change is composing97 before96. No current digest is substituted for an old expected digest, and no historical fixture is repinned.

## Test review

There are 21 newly declared tests: six helper tests, seven rendering tests, eight97 historical-source tests. They remain unexecuted by this reviewer.

The new independent before/after fixture protects intended wording rather than merely deriving expected text from the helper. It covers all ten entries and seven distinct replacement strings. Helper negatives cover unknown identities/fields, altered source strings, unchanged unrelated jargon, and wrong limitation indices. Rendering checks cover all six configuration rows, all four Market fields, preserved neighboring limitations/source links, raw-object immutability, guarded identities/freshness outcomes, and a valid synthetic summary withheld by the existing initial clock gate.

History mutation coverage includes old/swapped/truncated/appended/CRLF inputs, changes to display calls, preserved clock and prefetch gates, the new helper's wording, every nonempty subset of old97 component predecessors, defensive copies, unknown paths, raw unrelated drift, and the full97→96→95 chain. The existing96 rejection/mutation cases and fixed95 expected hashes remain intact; only the input reader and explicit composition assertion adapt to97.

The existing detail rendering assertion now obtains approved display copy. Its bounded-record count and special-configuration assertions remain. The independent new fixture and rendering suite prevent that adjustment from being the sole circular oracle. Existing original Model Y hero/nine-target test and its source files are unchanged.

## Root validation gate

Apply only after rechecking the recorded baseline and preserve exact candidate bytes. Formatting a pinned file is a new candidate revision, requiring reviewed new pins rather than bypassing history checks.

Required before completion: focused new/affected tests, typecheck, lint, data validation, full suite, both builds, and browser checks of Discovery/detail FONZ, Surron and Kawasaki plus Mazda/Lexus/BCI Market limitations in both app and portable. Retain the original Model Y hero and all nine reasons, initial clock/freshness behavior, four Discovery prefetch restrictions, and the source/stock/unknown boundaries in those checks. Expected new test arithmetic is +21; only actual root execution can establish a pass.
