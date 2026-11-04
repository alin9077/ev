# Fact.issues structural preflight recommendation

## Recommended change

Add one dependency-free, pure `validateCatalogueFactIssues(input: unknown): string[]` export to `src/lib/validate.ts`, call it on the **fully composed catalogue** in `scripts/validate.ts` before the pack loop, reuse it in `scripts/build-portable.ts` before pack conversion, and add `tests/fact-issue-validation.test.ts`. No data migration, type widening, renderer fallback, or schema library is necessary.

This is the smallest build/test guard for this failure class. `Fact.issues` is already correctly typed as `Issue[]` (`src/lib/types.ts:21–28,152–172`). Imported additions are asserted as `Fact` in `src/lib/data.ts:437–445`, so TypeScript does not validate their JSON. `validateResearch()` never receives compiled Facts; the CLI checks feature overlays only (`scripts/validate.ts:28–39`). Raw IDs therefore reach `issueReaderText()` as strings, yielding `undefined`; `factClaim()` passes that into `clean()`, which calls `.replace()` (`src/lib/citable.ts:178–208`).

## Exact helper

Append to `src/lib/validate.ts`; leave `validateResearch()` and `Fact.issues: Issue[]` unchanged:

```ts
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function validateIssueArray(input: unknown, path: string): string[] {
  if (!Array.isArray(input))
    return [`${path} must be an array of Issue objects`];
  const errors: string[] = [];
  for (const [index, issue] of input.entries()) {
    const at = `${path}[${index}]`;
    if (!isRecord(issue)) {
      errors.push(`${at} must be an Issue object, not an issue ID`);
      continue;
    }
    for (const key of ["issue_id", "title", "priority", "publication_action"])
      if (!isText(issue[key]))
        errors.push(`${at}.${key} must be a non-empty string`);
    for (const key of ["model_ids", "source_ids"]) {
      const values = issue[key];
      if (!Array.isArray(values)) {
        errors.push(`${at}.${key} must be a string array`);
        continue;
      }
      for (const [i, id] of values.entries())
        if (!isText(id))
          errors.push(`${at}.${key}[${i}] must be a non-empty string`);
    }
  }
  return errors;
}
export function validateCatalogueFactIssues(input: unknown): string[] {
  if (!Array.isArray(input)) return ["Catalogue must be an array"];
  const errors: string[] = [];
  for (const [index, car] of input.entries()) {
    const at = `catalogue[${index}]${
      isRecord(car) && isText(car.id) ? ` (${car.id})` : ""
    }`;
    if (!isRecord(car) || !isRecord(car.facts)) {
      errors.push(`${at}.facts must be an object`);
      continue;
    }
    for (const [key, fact] of Object.entries(car.facts)) {
      const path = `${at}.facts[${JSON.stringify(key)}]`;
      if (!isRecord(fact)) {
        errors.push(`${path} must be a Fact object`);
        continue;
      }
      errors.push(...validateIssueArray(fact.issues, `${path}.issues`));
    }
  }
  return errors;
}
```

The guard deliberately validates the issue structure, not the entire Fact schema. It returns actionable car/fact/index paths, traverses every dictionary entry rather than a shortlist of fact keys, accepts empty issue arrays, aggregates errors, and never mutates or silently repairs evidence. Extra Issue fields remain allowed. Sparse arrays are rejected rather than silently skipped.

## CLI wiring

Import the new helper beside `validateResearch`. Immediately after `const snapshot = { data: d, cars: catalogue() };` and before `for (const c of snapshot.cars)`, insert:

```ts
errors.push(...validateCatalogueFactIssues(snapshot.cars));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
```

Keep the existing final error block for errors found by the subsequent pack/feature checks. Both `pnpm build` and `pnpm build:public` already run `pnpm validate`, so malformed issue data fails before export. Direct `pnpm build:portable` bypasses the validation CLI, so also import the same helper in `scripts/build-portable.ts` and insert immediately after `const cars = catalogue();` (currently line 38), before creating/converting packs:

```ts
const errors = validateCatalogueFactIssues(cars);
if (errors.length) throw new Error(errors.join("\n"));
```

Its existing `main().catch(...)` reports the failure and sets exit code 1; this happens before any output HTML is written. The initial esbuild call has `write: false`. This four-file patch covers ordinary builds and direct portable generation. Direct `pnpm dev` and arbitrary `catalogue()` callers still bypass build preflight; if needed, the same helper can also be used in `catalogue()` after `availableCars` is assembled and before buyer summaries, but that is additional runtime hardening.

Do not use `String(issue)`, filter out invalid entries, convert missing issues to `[]`, or suppress undefined warning text in the exporter: that would hide evidence restrictions.

## Regression tests

Use `node:test` and `node:assert/strict` as in existing tests. Small hand-built fixtures may stay `unknown`; avoid pretending malformed fixtures are valid `Fact` values with a cast.

1. **All real data:** `assert.deepEqual(validateCatalogueFactIssues(catalogue()), [])`. Use the entire current catalogue, not named makes or a fixed count of 63 FONZ references.
2. **Accept:** empty `issues`; a complete Issue; multiple complete Issues; a local issue ID absent from `research().publication_issues`; `model_ids: ["all"]`; empty `model_ids`/`source_ids`; additional fields. The type permits empty string arrays. Keep priority as unrestricted non-empty text, not a new enum.
3. **Reject original regression:** `issues: ["battery-rated-unit"]`; also `[validIssue, "battery-rated-unit"]` to prove every element is examined. Assert the error names the car, fact key, and offending index.
4. **Reject container errors:** missing/undefined/null/string/object `issues`; null/string/number/array Issue members; sparse arrays. Return diagnostics rather than throw.
5. **Reject incomplete Issue objects:** omit each of the six required fields in turn; use blank or non-string `issue_id`, `title`, `priority`, or `publication_action`; use non-array `model_ids`/`source_ids`, or arrays containing numbers/null/blank IDs.
6. **Robust traversal:** reject non-array catalogue, malformed car/facts containers, or non-object Fact entries. Put failures in multiple cars/facts and assert all paths appear. Freeze a good fixture and assert validation leaves it unchanged.
7. **Whole-catalogue export smoke:** construct one shared `{ data: research(), cars: catalogue() }` snapshot; for every car call `pack(car.id, snapshot)`, then `factClaim(pack, fact)` for **every** Fact. Assert qualifications are strings and each normalized `issueReaderText(issue)` appears in the qualifications. `makeReport()` alone samples displayed measurements and cannot prove every Fact is safe. Keep the existing FONZ-specific report/hash tests.

## Compatibility verified read-only

On 2026-10-10, an inline prototype of this exact guard passed 28 positive/negative fixture cases and the current assembled catalogue:

- 325 cars; 27,680 Facts; 281 Fact issue references
- Every referenced Issue satisfies all six required fields and non-blank text/ID checks
- All issue source IDs exist in `research().sources`; every model scope includes the owning model or `all`
- 74 valid issue references have IDs absent from `research().publication_issues`, including the 63 FONZ references. Do **not** require registry membership, global ID uniqueness, or object-reference identity
- All 27,680 `factClaim()` calls succeeded; all 281 normalized issue warnings survived in export qualifications

No application files were edited. These were targeted read-only checks, not a rerun of the full suite/build. After implementation, run `pnpm validate`, the new test plus `tests/fonz-integration.test.ts` and `tests/citable.test.ts`, then the repository's usual full test/typecheck/lint/build checks.
