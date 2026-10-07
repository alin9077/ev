import type { Research } from "./types";
export function validateResearch(input: unknown): string[] {
  const errors: string[] = [];
  if (!input || typeof input !== "object")
    return ["Research must be an object"];
  const d = input as Research;
  const arrays = [
    "criteria",
    "models",
    "variants",
    "trim_equipment",
    "feature_evidence",
    "update_eligibility",
    "update_events",
    "configuration_history",
    "sources",
    "publication_issues",
    "prior_update_summary",
  ] as const;
  for (const key of arrays)
    if (!Array.isArray(d[key])) errors.push(`${key} must be an array`);
  if (errors.length) return errors;
  if (!d.metadata || typeof d.metadata.as_of !== "string")
    return ["metadata.as_of missing"];
  function unique(values: string[], label: string) {
    if (new Set(values).size !== values.length)
      errors.push(`Duplicate ${label}`);
    if (values.some((v) => typeof v !== "string" || !v))
      errors.push(`Missing ${label}`);
  }
  unique(
    d.variants.map((v) => v.id),
    "variant id",
  );
  unique(
    d.models.map((m) => m.id),
    "model id",
  );
  unique(
    d.sources.map((s) => s.id),
    "source id",
  );
  unique(
    d.criteria.map((c) => c.key),
    "criterion key",
  );
  unique(
    d.update_events.map((e) => e.event_id),
    "event id",
  );
  unique(
    d.feature_evidence.map((f) => `${f.variant_id}:${f.criterion}`),
    "feature pair",
  );
  const variants = new Set(d.variants.map((v) => v.id)),
    models = new Set(d.models.map((m) => m.id)),
    sources = new Set(d.sources.map((s) => s.id)),
    criteria = new Set(d.criteria.map((c) => c.key));
  for (const group of [
    "variants",
    "trim_equipment",
    "feature_evidence",
    "update_eligibility",
    "update_events",
    "configuration_history",
    "publication_issues",
  ] as const) {
    for (const r of d[group])
      for (const id of r.source_ids || [])
        if (!sources.has(id)) errors.push(`Missing source ${id}`);
  }
  for (const v of d.variants) {
    if (!models.has(v.model_id)) errors.push(`Unknown model ${v.model_id}`);
    if (
      d.feature_evidence.filter((f) => f.variant_id === v.id).length !==
      criteria.size
    )
      errors.push(`Incomplete criteria for ${v.id}`);
    if (d.update_eligibility.filter((e) => e.variant_id === v.id).length !== 1)
      errors.push(`Missing/duplicate eligibility ${v.id}`);
    if (d.trim_equipment.filter((e) => e.variant_id === v.id).length !== 1)
      errors.push(`Missing/duplicate equipment ${v.id}`);
    for (const key of ["price_aud", "range_km", "seats"] as const)
      if (v[key] !== null && (typeof v[key] !== "number" || Number(v[key]) < 0))
        errors.push(`Invalid numeric ${key} ${v.id}`);
  }
  for (const f of d.feature_evidence) {
    if (
      !variants.has(f.variant_id) ||
      !criteria.has(f.criterion) ||
      !models.has(f.model_id)
    )
      errors.push(`Invalid feature reference ${f.variant_id}:${f.criterion}`);
    if (
      ![
        "standard",
        "conditional",
        "not_verified",
        "subjective",
        "unavailable",
        "optional",
        "not_applicable",
      ].includes(f.status)
    )
      errors.push(`Unknown feature state ${f.status}`);
    if (!Array.isArray(f.source_ids) || typeof f.conditions !== "string")
      errors.push("Malformed feature evidence");
  }
  // Later overlays declare what they add; the supplied counts must still reconcile.
  const added = (key: string) => Number(d.metadata[key] ?? 0);
  if (
    d.metadata.record_count !== d.variants.length ||
    d.metadata.criterion_count + added("added_criterion_count") !==
      d.criteria.length ||
    d.metadata.feature_row_count + added("added_feature_row_count") !==
      d.feature_evidence.length
  )
    errors.push("Metadata counts differ from input");
  if (!variants.has(d.metadata.baseline_variant_id))
    errors.push("Baseline not found");
  return errors;
}
