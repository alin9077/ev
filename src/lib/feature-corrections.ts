import type { Feature, Source } from "./types";
import { validDate } from "./corrections";
import {
  assertReviewedJson,
  nonemptyReviewText,
  sameReviewedState as equal,
  usableCorrectionSources,
} from "./correction-guards";
export type FeatureCorrection = {
  id: string;
  variantId: string;
  criterion: string;
  beforeFeature: Feature;
  before: Pick<Feature, "value" | "status" | "conditions" | "source_ids">;
  after: Pick<Feature, "value" | "status" | "conditions" | "source_ids">;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string;
  reviewedAt: string;
  evidenceDate: string;
  reason: string;
  supersedes?: string;
};
/** Validate against the full target registry before applying any per-car slice. */
export function validateFeatureCorrectionRegistry(
  edits: FeatureCorrection[],
  features: Feature[],
) {
  const approved = edits.filter((edit) => edit.status === "approved");
  if (!approved.length) return;
  const targets = new Map<string, number>();
  const key = (variant: string, criterion: string) =>
    JSON.stringify([variant, criterion]);
  for (const row of features) {
    const target = key(row.variant_id, row.criterion);
    targets.set(target, (targets.get(target) || 0) + 1);
  }
  const seen = new Set<string>(),
    last = new Map<string, FeatureCorrection>();
  for (const edit of approved) {
    if (!nonemptyReviewText(edit.id) || seen.has(edit.id))
      throw new Error(`Duplicate or empty equipment correction ${edit.id}`);
    seen.add(edit.id);
    const target = key(edit.variantId, edit.criterion);
    if (targets.get(target) !== 1)
      throw new Error(
        `Equipment correction ${edit.id} has unknown or ambiguous target`,
      );
    const prior = last.get(target);
    if (
      edit.supersedes !== prior?.id ||
      (prior && edit.reviewedAt < prior.reviewedAt)
    )
      throw new Error(
        `Equipment correction ${edit.id} has invalid predecessor or review chronology`,
      );
    last.set(target, edit);
  }
}
/** Apply after all editorial and evidence-hold overlays, preserving exact reviewed state. */
export function applyFeatureCorrections(
  features: Feature[],
  edits: FeatureCorrection[],
  sources: Source[],
): Feature[] {
  validateFeatureCorrectionRegistry(edits, features);
  const result = structuredClone(features);
  const seen = new Set<string>();
  for (const edit of edits) {
    if (edit.status !== "approved") continue;
    if (seen.has(edit.id))
      throw new Error(`Duplicate equipment correction ${edit.id}`);
    seen.add(edit.id);
    const i = result.findIndex(
      (f) => f.variant_id === edit.variantId && f.criterion === edit.criterion,
    );
    const f = result[i];
    if (
      !f ||
      !edit.beforeFeature ||
      !equal(f, edit.beforeFeature) ||
      !equal(
        {
          value: f.value,
          status: f.status,
          conditions: f.conditions,
          source_ids: f.source_ids,
        },
        edit.before,
      )
    )
      throw new Error(
        `Equipment correction conflict ${edit.id}: reviewed claim has changed`,
      );
    if (
      !nonemptyReviewText(edit.id) ||
      !nonemptyReviewText(edit.reviewedBy) ||
      !nonemptyReviewText(edit.reason) ||
      !validDate(edit.reviewedAt) ||
      !validDate(edit.evidenceDate) ||
      edit.evidenceDate > edit.reviewedAt
    )
      throw new Error(
        `Equipment correction ${edit.id} lacks review provenance`,
      );
    assertReviewedJson(edit.after);
    if (
      Object.keys(edit.after).some(
        (key) => !["value", "status", "conditions", "source_ids"].includes(key),
      ) ||
      typeof edit.after.value !== "string" ||
      typeof edit.after.conditions !== "string" ||
      ![
        "standard",
        "conditional",
        "not_verified",
        "subjective",
        "unavailable",
        "optional",
        "not_applicable",
      ].includes(edit.after.status) ||
      (["conditional", "optional"].includes(edit.after.status) &&
        !edit.after.conditions.trim())
    )
      throw new Error(
        `Equipment correction ${edit.id} has invalid value or conditions`,
      );
    if (
      !usableCorrectionSources(edit.after.source_ids, sources, edit.reviewedAt)
    )
      throw new Error(
        `Equipment correction ${edit.id} lacks usable supporting sources`,
      );
    result[i] = {
      ...f,
      ...structuredClone(edit.after),
      reviewed_date: edit.reviewedAt,
      last_evidence_date: edit.evidenceDate,
      conditions: [
        edit.after.conditions,
        `Correction ${edit.id}: ${edit.reason}`,
      ]
        .filter(Boolean)
        .join(" "),
      verification_state: "approved_exact_claim_correction",
    };
  }
  return result;
}
