import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Only fields validated below are exposed. Other original fields remain on the
// same parsed object. Extend the validator and contract before accessing them.
export type KiaCadillacStage = Readonly<{
  variants: readonly Readonly<{ id: string }>[];
  facts: readonly Readonly<{
    variantId: string;
    key: string;
    value: unknown; // Consumed only by assert.deepEqual; nested use needs narrowing.
    status: string;
    unit: string;
    comparisonBasis: string;
    sourceIds: readonly string[];
    qualifications: readonly string[];
  }>[];
  features: readonly unknown[]; // Existing test still asserts length === 0.
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  if (!Array.isArray(value)) return false;
  // for...of also rejects holes; Array.every alone would skip them.
  for (const item of value) if (typeof item !== "string") return false;
  return true;
}

export function assertKiaCadillacStage(
  value: unknown,
): asserts value is KiaCadillacStage {
  assert.ok(isRecord(value), "Kia/Cadillac fixture must be an object");
  for (const key of ["variants", "facts", "features"])
    assert.ok(Object.hasOwn(value, key), `Kia/Cadillac fixture missing ${key}`);
  assert.ok(Array.isArray(value.variants), "variants must be an array");
  const variants: readonly unknown[] = value.variants;
  for (const [index, variant] of variants.entries()) {
    assert.ok(isRecord(variant), `variants[${index}] must be an object`);
    assert.ok(Object.hasOwn(variant, "id") && typeof variant.id === "string",
      `variants[${index}].id must be a string`);
  }
  assert.ok(Array.isArray(value.facts), "facts must be an array");
  const facts: readonly unknown[] = value.facts;
  for (const [index, fact] of facts.entries()) {
    assert.ok(isRecord(fact), `facts[${index}] must be an object`);
    for (const key of ["variantId", "key", "status", "unit", "comparisonBasis"])
      assert.ok(Object.hasOwn(fact, key) && typeof fact[key] === "string",
        `facts[${index}].${key} must be a string`);
    assert.ok(Object.hasOwn(fact, "value"), `facts[${index}] missing value`);
    for (const key of ["sourceIds", "qualifications"])
      assert.ok(Object.hasOwn(fact, key) && isStringArray(fact[key]),
        `facts[${index}].${key} must be a string array`);
  }
  assert.ok(Array.isArray(value.features), "features must be an array");
}

export function readKiaCadillacStage(): KiaCadillacStage {
  const text = readFileSync(
    new URL("../fixtures/catalogue/kia-cadillac-staged-delta.json", import.meta.url),
    "utf8",
  );
  const value: unknown = JSON.parse(
    text.charCodeAt(0) === 0xfeff ? text.slice(1) : text,
  );
  assertKiaCadillacStage(value);
  return value;
}
