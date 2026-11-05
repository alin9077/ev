// Compile only. This function is intentionally never called.
import assert from "node:assert/strict";
import type { KiaCadillacStage } from "../helpers/kia-cadillac-stage";

export function checkKiaCadillacStageContract(stage: KiaCadillacStage): void {
  const ids: string[] = stage.variants.map((variant) => variant.id);
  const row = stage.facts[0];
  const strings: readonly string[] = [
    row.variantId, row.key, row.status, row.unit, row.comparisonBasis,
  ];
  const sources: readonly string[] = row.sourceIds;
  const qualifications: readonly string[] = row.qualifications;
  for (const qualification of row.qualifications) {
    const actual: string[] = [];
    actual.includes(qualification);
  }
  assert.deepEqual({ nested: ["arbitrary", 1, null] }, row.value);
  const features: readonly unknown[] = stage.features;
  const count: number = features.length;
  if (typeof row.value === "string") row.value.toUpperCase();
  void [ids, strings, sources, qualifications, count];

  // @ts-expect-error Unvalidated root mapping stays hidden.
  void stage.mapping;
  // @ts-expect-error Unvalidated variant metadata stays hidden.
  void stage.variants[0].model_id;
  // @ts-expect-error Unvalidated fact metadata stays hidden.
  void row.scope;
  // @ts-expect-error value remains unknown until narrowed.
  void row.value.nested;
  // @ts-expect-error value is not implicitly a structured or string value.
  const unvalidatedValue: string = row.value;
  // @ts-expect-error Feature entries remain unknown.
  void stage.features[0].id;
  // @ts-expect-error Qualifications cannot contain numbers.
  const badQualification: KiaCadillacStage["facts"][number]["qualifications"][number] = 42;
  // @ts-expect-error String qualification values cannot be used as numbers.
  const numericQualification: number = row.qualifications[0];
  // @ts-expect-error Validated qualification arrays are readonly.
  row.qualifications.push("mutation");
  // @ts-expect-error Readonly fact fields cannot be overwritten.
  row.key = "replacement";
  // @ts-expect-error Readonly root containers cannot be overwritten.
  stage.variants = [];
  void [unvalidatedValue, badQualification, numericQualification];
}
