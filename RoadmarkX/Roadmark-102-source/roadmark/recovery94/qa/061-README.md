# Revision 2: two test-only corrections

Status: static-only revised candidate. Root alone applied/executed revision 1; this worker has not written application files or run/imported code, tests or builds. The original candidate, original manifest, all original pins and both first-attempt root logs are unchanged.

## Exact changes

1. `tests/report-review-cli.test.ts`: add `TSX_DISABLE_CACHE: "1"` to the import-test subprocess environment. Every open/write/mkdir/rename/unlink/link/chmod tripwire, both server tripwires, the empty-tree comparison and stdout/stderr assertions remain byte-identical. The setting applies only to that child process, before the loader initializes; it does not modify production behavior or relax any filesystem boundary
2. `tests/helpers/report-preview-fixture.ts`: move `conditionExplanation: null` out of the typed `Fact` initializer and into the existing `Object.assign` JSON-extension step. The saved-report runtime explicitly permits a null explanation (`report-claim-shape.ts:54–56`), while the broader application `Fact` type is optional string. This constructs the runtime-accepted saved JSON without changing the production type or using a cast. The complete synthetic claim remains byte-equivalent to revision 1: null-to-string digest rejection and `fixtureMetadata.a: null` coverage are both preserved

`REVISION2.patch` is the exact three-line diff across two test files. `preimages/` preserves the two actual applied revision-1 test files; `files/` contains complete replacements. `MANIFEST.json` pins exact pre/postimages plus revision-1 manifest/pin anchors. `SOURCE-PINS.sha256` pins the installed loader sources and failed attempt logs. `REVISION2-PINS.sha256` covers the complete revision handoff, excluding itself.

## Installed-loader evidence

Installed `tsx/package.json` reports version 4.23.15. Static inspection found:

- `dist/cli.mjs`: the supported no-cache CLI option assigns `u.TSX_DISABLE_CACHE = "1"` in its spawned process environment
- `dist/index-DE3OBZuV.mjs`: `process.env.TSX_DISABLE_CACHE ? new Map : new Er` chooses in-memory versus disk cache
- `dist/register-B1c7OH6V.cjs`: equivalent `process.env.TSX_DISABLE_CACHE ? new Map : new bi` guard in the CommonJS transformer

Exact file hashes, offsets and short source excerpts are in `LOADER-EVIDENCE.json`. No setting was inferred from an unverified name or generic documentation. The original failure stack was `Er.set → transformSync`, consistent with the loader's disk cache hitting the retained `fs.writeFile` tripwire.

The original test was too broad for tsx's default transform cache. This revision makes loader caching in-memory while leaving application-data IO forbidden. It does not establish a general zero-loader-side-effects claim. Root must rerun the actual import test to verify the correction.

## Root-owned apply and acceptance

Only after independent revision review; no application write below was performed by this worker:

```sh
set -eu
cd /workspace/scratch/586427eef9f2
R=roadmark-research/report-preview94-candidate/revision2
A=roadmark-work/roadmark
sha256sum -c "$R/SOURCE-PINS.sha256"
sha256sum -c "$R/REVISION2-PINS.sha256"
for f in tests/report-review-cli.test.ts tests/helpers/report-preview-fixture.ts; do
  cmp "$R/preimages/$f" "$A/$f"
done
for f in tests/report-review-cli.test.ts tests/helpers/report-preview-fixture.ts; do
  cp "$R/files/$f" "$A/$f"
  cmp "$R/files/$f" "$A/$f"
done
cd "$A"
node --import tsx --test --test-concurrency=2 tests/report-review-dry-run.test.ts tests/report-review-cli.test.ts
pnpm typecheck
```

Preserve first-attempt logs; write new root evidence under distinct attempt/revision names. Once focused tests and typecheck pass, continue the regression, lint, validation, aggregate, normal production/portable build and unchanged-register gates. Root has clarified that public export requires an explicitly configured approved HTTPS origin; do not invent an origin, alter public-export wiring or claim that separate release gate passed. An amended test is not a passing test. Update root's applied-input receipt for these two exact replacements, not the immutable revision-1 candidate manifest.
