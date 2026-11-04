# Roadmark100 portable static delta checker: derivation and bounds

Status: preparation-only. The checker has not been imported, executed, syntax-checked, tested or run against an actual100 build by its preparer. Root alone may execute the reviewed, hash-pinned script after final QA/build and after independently establishing the actual100 HTML hash.

## Delivered entrypoint

`verify-portable100-delta.py` uses only Python standard-library modules. It reads inputs and writes a JSON pass report to stdout or a JSON failure report to stderr. It does not write files, extract ZIP members to disk, import application/candidate modules, evaluate HTML/JavaScript, browse, use the network, build the app, invoke subprocesses or upload anything.

## Explicit derivation

Original reviewed checker: `roadmark-research/applied99/verify-portable-delta-final.py`, SHA256 `b1f7ef1ca8e55245cdbb3b3242be6f55c3741d92baf8ef0b6404e3d16137c991`.

The contiguous source region beginning `class VerificationFailure` and ending immediately before `def keyed` is copied verbatim into the new checker, between explicit BEGIN/END comments. It is separately preserved as `reviewed99-helpers.txt` and hash-pinned in `INPUT-PINS.json`. It supplies failure handling, SHA256, JSON-pointer paths, typed semantic equality, duplicate-key/non-finite-number rejection, strict UTF-8 parsing, pinned reads, HTML splitting, raw byte-difference diagnostics and the independent string-table decoder. No module is imported from the previous checker.

`derivation.diff` is the complete unified text diff against the original. All checkpoint99-specific Mazda projections, catalogue additions, feature/audit exceptions, row generation and summary logic are removed. The only new model-specific logic replaces ten exact pinned market objects. `ordered_json_differences` is a short independent comparison wrapper that retains all differences and strengthens the previous comparator by also preserving object-key order. The original helpers are unchanged.

The decoder handles only `roadmark-string-table-v1`, with the exact three envelope keys, string-only dictionary, canonical base36 references and `~~` literal escaping. It never recursively decodes dictionary values and never interprets source code. Dictionary representation is permitted to change because the encoder interns repeated string values; decoded values remain constrained exactly. Canonical encoder output and unused dictionary entries are not proved.

## Inspected baseline and serialization

The saved99 ZIP and its `roadmark/index.html` member match the supplied hashes and 37,013,686-byte HTML size. The HTML has one `ev-data` script with the expected versioned envelope. The saved99 decoded top-level keys, in order, are `marketInventory`, `cars`, `packs`, `research`, `counts`, `art`.

Plain-text inspection of `scripts/build-portable.ts` shows `marketInventory` is inserted directly into `data`, then `JSON.stringify(data)` is passed to `encodePortableJson(..., 32)`. Plain-text `src/lib/market-inventory-data.ts` directly imports and exports the market JSON. Thus the portable data includes both the two `records` amendments and eight `unverifiedLeads` amendments. Data inclusion does not establish UI visibility; root separately found that the market audit UI renders records only.

Static inspection of the saved99 bytes established all ten baseline objects equal their fixture `before` objects, and replacing them with the pinned `after` objects reconstructs the entire candidate market JSON exactly. No generated market audit projection is justified. The saved99 baseline already contains the existing catalogue audit projections; the checker requires those, buyer summaries, source registry, equipment, counts, art, all unrelated market rows/fields and every other payload value to remain unchanged. There are zero audit-projection exceptions.

Inspection source hashes and structured baseline observations are included in `INPUT-PINS.json` and `BASELINE-STATIC-INSPECTION.json`. These are preparation evidence, not an actual100 execution result. Only static standard-library reads, decoding of JSON data, hashing, comparisons and file writes outside the application were used to prepare these files. No candidate code was executed.

## Acceptance contract

1. Require `--html100` and a 64-character lowercase `--expected-html100-sha256` supplied independently by root; there is no default actual100 hash. Reject the saved99 hash.
2. Pin the saved99 archive and exact member, candidate fixture, candidate five-file manifest and candidate market file. Reject duplicate ZIP member names for the chosen member.
3. Verify the ten hard-coded section/index/ID targets; exact before and after IDs and ordered keys; exactly the four declared changed fields; all ranking holds remain false; unchanged market counts; and full reconstruction of candidate market JSON.
4. Compare raw HTML prefix and suffix, retaining the script tags in those regions. Both must be byte-identical to actual saved99, covering HTML shell, CSS, bundled runtime, hero flag and title. Any drift is a failure with hashes, offsets and changed-span diagnostics.
5. Deep-copy the actual saved99 decoded payload and replace only the ten fixture objects. Compare actual100 against that entire expected payload. Preserve ordered arrays and ordered object keys, exact strings/nulls/booleans and JSON numeric values without tolerance. Booleans cannot equal numbers. Numeric spelling and string escape spelling inside JSON are not byte-compared.
6. Report all decoded differences and all outside-payload drift together when both artifacts are decodable. Invalid inputs, hashes or decoding fail closed; a malformed input can prevent later comparison. Nothing is stripped or ignored to obtain a pass.

No report should be accepted from a nonzero exit. Failure diagnostics are on stderr; save them intact. A failure does not prove that checks beyond the failing prerequisite ran. Do not normalize unexpected changes or silently add an allowance; return the evidence for review.

## Root execution, only once the final actual build is known

After independent static review and checking the script against `SHA256SUMS`, root may substitute the actual path/hash into:

```
PYTHONDONTWRITEBYTECODE=1 python roadmark-research/artifact100-candidate/verify-portable100-delta.py \
  --workspace-root /workspace/scratch/586427eef9f2 \
  --html100 /absolute/path/to/final/actual100/index.html \
  --expected-html100-sha256 ACTUAL100_HASH_FROM_ROOT \
  > /approved/output/location/portable100-delta.stdout.json \
  2> /approved/output/location/portable100-delta.stderr.json
```

This command was not run by the preparer. Do not use a fabricated HTML, patched baseline, prebuild approximation or a hash default. Preserve the original result and diagnostics if it fails. Any subsequent revision needs fresh review rather than a hidden retry.

## Result schema and save-gate join

A successful result has `schema: roadmark-portable100-static-observation-v1`, `status: passed`, `checkpoint: 100`, `baselineCheckpoint: 99`, and the executing `scriptSHA256`. It includes:

- `inputs.saved99ZIP.sha256`, `inputs.saved99HTML.sha256` and `.bytes`
- `inputs.actual100HTML.sha256`, `.bytes`, `.path`, `.expectedSHA256SuppliedExternally`
- `inputs.reviewedFixtureSHA256`, `.candidateManifestSHA256`, `.candidateMarketSHA256`
- `outsideEvData.byteIdentical: true`, raw segment hashes and lengths
- `delta.fixtureExact: true`, `.candidateMarketExact: true`, the ten targets, forty allowed field paths, and `.additionalAuditExceptions: []`
- `preserved.allOtherDecodedValues`, `.arrayOrder`, `.objectKeyOrder` all true
- Explicit `notVerified` limitations

The save gate must check these fields and join the observed actual100 HTML hash to its actual archived HTML bytes and independent QA/build/source-map evidence. The candidate manifest hash is not a source-tree-map proof. This checker does not assert it inspected the full applied source tree or established build provenance.

## Explicit limits

This is a static portable artifact delta proof only. It does not prove browser hydration, visual or mobile behavior, runtime ranking execution, the entire Next production module graph, source-tree/build provenance, other generated HTML files or delivery ZIPs, publisher-origin bytes, claim truth/freshness, or a complete market/trim universe. It does not inspect or save screenshots. Hash identity is integrity evidence, not provenance by itself. Root's separate full QA/build, visual checks, alias/archive validation and save proof remain necessary.
