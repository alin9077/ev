import test from "node:test";
import assert from "node:assert/strict";
import {
  copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import {
  assertKiaCadillacStage,
  readKiaCadillacStage,
  type KiaCadillacStage,
} from "./helpers/kia-cadillac-stage";

const helperUrl = new URL("./helpers/kia-cadillac-stage.ts", import.meta.url);
const realFixtureUrl = new URL(
  "./fixtures/catalogue/kia-cadillac-staged-delta.json", import.meta.url,
);

function sample() {
  return {
    variants: [{ id: "car", model_id: "model", extra: { nested: [1, 2] } }],
    facts: [{
      variantId: "car", key: "attribute", value: { nested: [null, true, 7] },
      status: "conditional", unit: "unit", comparisonBasis: "basis",
      sourceIds: ["source"], qualifications: ["qualification"],
      scope: "unused_scope", extra: { keep: "fact metadata" },
    }],
    features: [] as unknown[],
    mapping: [{ keep: { original: true } }],
    metadata: { unused: ["root metadata"] },
  };
}

function record(value: object): Record<string, unknown> {
  return value as Record<string, unknown>;
}

function reject(value: unknown, message: RegExp): void {
  assert.throws(() => assertKiaCadillacStage(value), message);
}

function freezeDeep(value: unknown): void {
  if (value === null || typeof value !== "object") return;
  for (const nested of Object.values(value)) freezeDeep(nested);
  Object.freeze(value);
}

function retainObjectReferences(value: unknown, refs: object[] = []): object[] {
  if (value === null || typeof value !== "object") return refs;
  refs.push(value);
  for (const nested of Object.values(value)) retainObjectReferences(nested, refs);
  return refs;
}

function expectNoMutation(value: unknown): void {
  const before = JSON.stringify(value);
  const references = retainObjectReferences(value);
  freezeDeep(value);
  assertKiaCadillacStage(value);
  assert.equal(JSON.stringify(value), before);
  const afterReferences = retainObjectReferences(value);
  assert.equal(afterReferences.length, references.length);
  for (let i = 0; i < references.length; i += 1)
    assert.strictEqual(afterReferences[i], references[i], `object reference ${i}`);
}

test("accepts the consumed contract without projecting or mutating metadata", () => {
  const value = sample();
  const expected: unknown = JSON.parse(JSON.stringify(value));
  const root = value;
  const mapping = value.mapping;
  const metadata = value.metadata;
  const row = value.facts[0];
  const nestedValue = row.value;
  assertKiaCadillacStage(value);
  assert.strictEqual(value, root);
  assert.strictEqual(value.mapping, mapping);
  assert.strictEqual(value.metadata, metadata);
  assert.strictEqual(value.facts[0], row);
  assert.strictEqual(value.facts[0].value, nestedValue);
  assert.deepStrictEqual(value, expected);
  assert.equal(Object.isFrozen(value), false, "validator must not freeze data");
  expectNoMutation(value);
});

test("allows each present value without inventing a nested value schema", () => {
  for (const payload of [null, "string", 42, false, { x: [1, null] }, [true, {}]]) {
    const value = sample();
    record(value.facts[0]).value = payload;
    assertKiaCadillacStage(value);
    assert.strictEqual(value.facts[0].value, payload);
  }
  const value = sample();
  record(value.facts[0]).value = undefined;
  assertKiaCadillacStage(value); // unknown + own presence; not JSON-reachable.
  assert.equal(value.facts[0].value, undefined);
});

test("leaves semantic counts and nonempty features to integration assertions", () => {
  assertKiaCadillacStage({ variants: [], facts: [], features: [{ unvalidated: true }] });
  const value = sample();
  value.facts[0].sourceIds = [];
  value.facts[0].qualifications = [];
  assertKiaCadillacStage(value);
});

test("rejects null, array, and primitive roots", () => {
  for (const value of [null, [], "text", 0, true, undefined])
    reject(value, /fixture must be an object/);
});

for (const key of ["variants", "facts", "features"] as const) {
  test(`rejects missing, inherited, and non-array ${key}`, () => {
    const missing = sample();
    delete record(missing)[key];
    reject(missing, new RegExp(`missing ${key}`));
    const inherited = sample();
    const inheritedValue = inherited[key];
    delete record(inherited)[key];
    Object.setPrototypeOf(inherited, { [key]: inheritedValue });
    reject(inherited, new RegExp(`missing ${key}`));
    for (const invalid of [null, {}, "array", 0]) {
      const value = sample();
      record(value)[key] = invalid;
      reject(value, new RegExp(`${key} must be an array`));
    }
  });
}

for (const key of ["variants", "facts"] as const) {
  test(`rejects invalid entries and holes in ${key}`, () => {
    for (const invalid of [null, [], "entry", 5, undefined]) {
      const value = sample();
      record(value)[key] = [invalid];
      reject(value, new RegExp(`${key}\\[0\\] must be an object`));
    }
    const sparse = sample();
    record(sparse)[key] = new Array(1);
    reject(sparse, new RegExp(`${key}\\[0\\] must be an object`));
  });
}

test("requires an own string variant id", () => {
  for (const invalid of [null, 8, false, {}, []]) {
    const value = sample();
    record(value.variants[0]).id = invalid;
    reject(value, /variants\[0\].id must be a string/);
  }
  for (const inherited of [false, true]) {
    const value = sample();
    delete record(value.variants[0]).id;
    if (inherited) Object.setPrototypeOf(value.variants[0], { id: "car" });
    reject(value, /variants\[0\].id must be a string/);
  }
});

for (const key of ["variantId", "key", "status", "unit", "comparisonBasis"] as const) {
  test(`requires an own string fact ${key}`, () => {
    for (const invalid of [null, 8, false, {}, []]) {
      const value = sample();
      record(value.facts[0])[key] = invalid;
      reject(value, new RegExp(`facts\\[0\\].${key} must be a string`));
    }
    for (const inherited of [false, true]) {
      const value = sample();
      delete record(value.facts[0])[key];
      if (inherited) Object.setPrototypeOf(value.facts[0], { [key]: "inherited" });
      reject(value, new RegExp(`facts\\[0\\].${key} must be a string`));
    }
  });
}

test("requires an own fact value", () => {
  for (const inherited of [false, true]) {
    const value = sample();
    delete record(value.facts[0]).value;
    if (inherited) Object.setPrototypeOf(value.facts[0], { value: "inherited" });
    reject(value, /facts\[0\] missing value/);
  }
});

for (const key of ["sourceIds", "qualifications"] as const) {
  test(`requires own dense string arrays for ${key}`, () => {
    for (const invalid of [null, {}, "string", [1, "ok"], ["ok", 1], new Array(1)]) {
      const value = sample();
      record(value.facts[0])[key] = invalid;
      reject(value, new RegExp(`facts\\[0\\].${key} must be a string array`));
    }
    for (const inherited of [false, true]) {
      const value = sample();
      delete record(value.facts[0])[key];
      if (inherited) Object.setPrototypeOf(value.facts[0], { [key]: ["inherited"] });
      reject(value, new RegExp(`facts\\[0\\].${key} must be a string array`));
    }
  });
}

test("actual fixture retains its entire parsed data, references, and input bytes", () => {
  const bytes = readFileSync(realFixtureUrl);
  const independentlyParsed: unknown = JSON.parse(bytes.toString("utf8"));
  const loaded = readKiaCadillacStage();
  assert.deepStrictEqual(loaded, independentlyParsed);
  assert.ok("mapping" in loaded);
  assert.ok(Array.isArray(loaded.mapping));
  expectNoMutation(independentlyParsed);
  assert.deepStrictEqual(readFileSync(realFixtureUrl), bytes);
});

test("loader is module-relative, preserves errors and metadata, and does not cache calls", async () => {
  // A distinct module and tiny fixture permit failure tests without touching real input.
  const base = mkdtempSync(join(tmpdir(), "roadmark-kia-loader path with spaces-"));
  const helperPath = join(base, "tests/helpers/kia-cadillac-stage.ts");
  const fixturePath = join(base, "tests/fixtures/catalogue/kia-cadillac-staged-delta.json");
  const unrelatedCwd = join(base, "unrelated cwd");
  const priorCwd = process.cwd();
  try {
    mkdirSync(dirname(helperPath), { recursive: true });
    mkdirSync(dirname(fixturePath), { recursive: true });
    mkdirSync(unrelatedCwd);
    copyFileSync(helperUrl, helperPath);
    const helper: { readKiaCadillacStage: () => KiaCadillacStage } =
      await import(pathToFileURL(helperPath).href);
    assert.throws(() => helper.readKiaCadillacStage(), { code: "ENOENT" });
    writeFileSync(fixturePath, "{ invalid json");
    assert.throws(() => helper.readKiaCadillacStage(), SyntaxError);
    writeFileSync(fixturePath, JSON.stringify({ variants: [], facts: [] }));
    assert.throws(() => helper.readKiaCadillacStage(), /missing features/);
    const expected = sample();
    const contents = JSON.stringify(expected);
    writeFileSync(fixturePath, contents);
    process.chdir(unrelatedCwd);
    const first = helper.readKiaCadillacStage();
    const second = helper.readKiaCadillacStage();
    assert.deepStrictEqual(first, expected);
    assert.deepStrictEqual(second, expected);
    assert.notStrictEqual(first, second, "fresh parse on each call is intentional");
    assert.notStrictEqual(first.facts, second.facts);
    assert.equal(readFileSync(fixturePath, "utf8"), contents);
    expected.metadata.unused.push("updated file");
    writeFileSync(fixturePath, JSON.stringify(expected));
    assert.deepStrictEqual(helper.readKiaCadillacStage(), expected);
    // Match the JSON module path's removal of one leading UTF-8 BOM.
    writeFileSync(fixturePath, `\uFEFF${contents}`);
    assert.deepStrictEqual(helper.readKiaCadillacStage(), JSON.parse(contents));
    writeFileSync(fixturePath, `\uFEFF\uFEFF${contents}`);
    assert.throws(() => helper.readKiaCadillacStage(), SyntaxError);
    writeFileSync(fixturePath, ` \uFEFF${contents}`);
    assert.throws(() => helper.readKiaCadillacStage(), SyntaxError);
    expected.metadata.unused = ["BOM inside a JSON string: \uFEFF"];
    writeFileSync(fixturePath, JSON.stringify(expected));
    assert.deepStrictEqual(helper.readKiaCadillacStage(), expected);
  } finally {
    process.chdir(priorCwd);
    rmSync(base, { recursive: true, force: true });
  }
});
