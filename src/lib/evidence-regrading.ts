/** Server/build-only application of the dated M1 review. Imported evidence stays immutable. */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import type { Car, Fact, Feature, Source } from "./types";
import { gradeReview } from "./evidence-grading";
import type { GradeDecision } from "./evidence-regrade-policy";
export type RegradeEntry = GradeDecision & {
  variantId: string;
  key: string;
  before: string;
};
export type RegradingOverlay = {
  id: string;
  reviewedAt: string;
  standingNote: string;
  sourceDigests: Record<string, string>;
  facts: RegradeEntry[];
  features: RegradeEntry[];
};
export function evidenceDigest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
const ledger = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "data/m1-evidence-regrading-2026-10-13.json"),
    "utf8",
  ),
) as RegradingOverlay;
const factIndex = new Map(
  ledger.facts.map((row) => [`${row.variantId}\0${row.key}`, row]),
);
const featureIndex = new Map(
  ledger.features.map((row) => [`${row.variantId}\0${row.key}`, row]),
);
function matchingSources(
  ids: string[],
  sources: Map<string, Source>,
  overlay: RegradingOverlay,
): boolean {
  return (
    ids.length > 0 &&
    ids.every((id) => {
      const source = sources.get(id);
      return source && overlay.sourceDigests[id] === evidenceDigest(source);
    })
  );
}
function reviewFor(
  row: RegradeEntry,
  ids: string[],
  sources: Map<string, Source>,
  overlay: RegradingOverlay,
) {
  return {
    ...gradeReview(
      overlay.reviewedAt,
      overlay.id,
      row.reason,
      row.evidenceScope,
      ids,
    ),
    sourceLabel: [
      ...new Set(ids.map((id) => sources.get(id)?.publisher).filter(Boolean)),
    ].join(" / "),
  };
}
export function applyFactGradeReview(
  fact: Fact,
  row: RegradeEntry | undefined,
  sources: Map<string, Source>,
  overlay = ledger,
): Fact {
  if (
    !row ||
    evidenceDigest(fact) !== row.before ||
    !matchingSources(fact.sourceIds, sources, overlay)
  )
    return fact.value === null
      ? fact
      : {
          ...fact,
          buyerGrade: undefined,
          gradeReview: undefined,
          gradeReviewStatus: "review_required",
        };
  // Source confidence must not turn an option into included equipment.
  const status = ["optional", "unavailable", "not_applicable"].includes(
    fact.status,
  )
    ? fact.status
    : row.grade === "confirmed"
      ? "standard"
      : row.grade === "not_published"
        ? "not_verified"
        : "conditional";
  return {
    ...fact,
    status,
    buyerGrade: row.grade,
    gradeReviewStatus: undefined,
    gradeReview: reviewFor(row, fact.sourceIds, sources, overlay),
    ...(row.qualifications ? { qualifications: [...row.qualifications] } : {}),
    ...(row.conditionExplanation !== undefined
      ? { conditionExplanation: row.conditionExplanation }
      : {}),
    resolvedElsewhere: row.grade === "reported",
  };
}
export function applyEvidenceRegrading(
  cars: Car[],
  sources: Source[],
  overlay = ledger,
): Car[] {
  const sourceIndex = new Map(sources.map((source) => [source.id, source]));
  const rows =
    overlay === ledger
      ? factIndex
      : new Map(
          overlay.facts.map((row) => [`${row.variantId}\0${row.key}`, row]),
        );
  return cars.map((car) =>
    !["passenger", "ute"].includes(car.vehicleClass || "passenger")
      ? car
      : {
          ...car,
          buyerGradesRequired: true,
          facts: Object.fromEntries(
            Object.entries(car.facts).map(([key, fact]) => [
              key,
              applyFactGradeReview(
                fact,
                rows.get(`${car.id}\0${key}`),
                sourceIndex,
                overlay,
              ),
            ]),
          ),
        },
  );
}
export function applyFeatureRegrading(
  car: Car,
  features: Feature[],
  sources: Source[],
  overlay = ledger,
): Feature[] {
  if (!["passenger", "ute"].includes(car.vehicleClass || "passenger"))
    return features;
  const sourceIndex = new Map(sources.map((source) => [source.id, source]));
  const rows =
    overlay === ledger
      ? featureIndex
      : new Map(
          overlay.features.map((row) => [`${row.variantId}\0${row.key}`, row]),
        );
  return features.map((feature) => {
    const row = rows.get(`${car.id}\0${feature.criterion}`);
    if (
      !row ||
      evidenceDigest(feature) !== row.before ||
      !matchingSources(feature.source_ids, sourceIndex, overlay)
    )
      return !row && ["not_verified", "not_applicable"].includes(feature.status)
        ? feature
        : {
            ...feature,
            buyerGrade: undefined,
            gradeReview: undefined,
            gradeReviewStatus: "review_required",
          };
    return {
      ...feature,
      // Retain fitment independently of the explicit buyer-facing grade.
      status: ["optional", "unavailable", "not_applicable"].includes(
        feature.status,
      )
        ? feature.status
        : row.grade === "confirmed"
          ? "standard"
          : row.grade === "not_published"
            ? "not_verified"
            : "conditional",
      buyerGrade: row.grade,
      gradeReviewStatus: undefined,
      gradeReview: reviewFor(row, feature.source_ids, sourceIndex, overlay),
      conditions: row.qualifications?.join(" ") ?? feature.conditions,
      condition_label: row.grade === "check" ? feature.condition_label : "",
    } as Feature;
  });
}
