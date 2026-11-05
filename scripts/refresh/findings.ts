/** The researcher-facing findings file, and the read-only scaffold that creates it. */
import type { Car, Fact, Source } from "../../src/lib/types";
import { hasValue, isOnSale, isTierOne, coreFacts } from "../reporting/reports";
import { FINDINGS_SCHEMA, type Outcome } from "./findings-schema";
import type { WorkQueue } from "./queue";

export type CurrentFact = {
  value: string;
  basis: string;
  grade: string;
  checkedAt: string;
  sourceUrls: string[];
};
export type FieldFinding = {
  key: string;
  label: string;
  /** True when the claim is stale or will go stale inside the plan's horizon. */
  due: boolean;
  current: CurrentFact;
  outcome: Outcome;
  value?: Fact["value"];
  unit?: string;
  basis?: string;
  comparisonBasis?: string;
  /** Source IDs listed under `sources[]` in this file. */
  sourceIds?: string[];
  /** Date the page was read; defaults to the latest accessed_date among sourceIds. */
  checkedAt?: string;
  note?: string;
  buyerGrade?: "confirmed" | "check" | "reported" | "not_published";
  conditionExplanation?: string;
  qualifications?: string[];
  priceRung?: 1 | 2 | 3 | 4 | 5 | 6;
  priceBasisTag?: string;
  priceState?: string;
  publisher?: string;
  validUntil?: string;
  /** Reason text recorded in the grade review. Defaults to a statement of the recheck. */
  reason?: string;
};
export type AvailabilityFinding = {
  due: boolean;
  current: {
    availability: string;
    orderStatus: string;
    stockStatus: string;
    checkedAt: string;
    sourceUrls: string[];
  };
  outcome: Outcome;
  availability?: string;
  orderStatus?: string;
  stockStatus?: string;
  sourceIds?: string[];
  checkedAt?: string;
  qualifications?: string[];
  note?: string;
};
export type VersionFinding = {
  variantId: string;
  vehicle: string;
  availability: AvailabilityFinding;
  fields: FieldFinding[];
};
export type SummaryOverride = {
  strength?: { label?: string; text: string };
  tradeoff?: { label?: string; text: string };
};
export type Findings = {
  schema: typeof FINDINGS_SCHEMA;
  brand: string;
  asOf: string;
  reviewedAt: string;
  reviewedBy: string;
  sources: Source[];
  versions: VersionFinding[];
  /** Versions the maker lists that the catalogue lacks; recorded, never built here. */
  newVersions?: { name: string; url: string; note: string }[];
  summaryOverrides?: Record<string, SummaryOverride>;
};
const showValue = (fact?: Fact) =>
  !fact || !hasValue(fact.value)
    ? "Not published"
    : `${typeof fact.value === "number" ? fact.value.toLocaleString("en-AU") : String(fact.value)}${fact.unit ? ` ${fact.unit}` : ""}`;
const urls = (ids: string[], sources: Map<string, Source>) => [
  ...new Set(ids.flatMap((id) => sources.get(id)?.url ?? [])),
];
/** Every on-sale Tier 1 version of the brand; every core field pre-listed; nothing filled in. */
export function scaffoldFindings(
  cars: Car[],
  sources: Source[],
  queue: WorkQueue,
  options: { brand: string; asOf: string },
): Findings {
  const index = new Map(sources.map((source) => [source.id, source]));
  const dueKeys = new Map<string, Set<string>>();
  for (const brand of queue.brands)
    for (const claim of brand.claims) {
      const set = dueKeys.get(claim.carId) ?? new Set<string>();
      set.add(`${claim.kind}/${claim.key}`);
      dueKeys.set(claim.carId, set);
    }
  const brandCars = cars.filter(
    (car) =>
      isTierOne(car) &&
      isOnSale(car) &&
      car.brand.toLowerCase() === options.brand.toLowerCase(),
  );
  const versions: VersionFinding[] = brandCars.map((car) => {
    const due = dueKeys.get(car.id) ?? new Set<string>();
    const keys = [
      ...coreFacts.map((field) => field.key as string),
      ...[...due]
        .filter((entry) => entry.startsWith("fact/"))
        .map((entry) => entry.slice(5))
        .filter((key) => !coreFacts.some((field) => field.key === key))
        .sort(),
    ];
    const evidence = car.availabilityEvidence;
    return {
      variantId: car.id,
      vehicle: `${car.brand} ${car.model} ${car.trim}`,
      availability: {
        due: due.has("availability/availability"),
        current: {
          availability: car.availability,
          orderStatus: evidence?.orderStatus ?? "unverified",
          stockStatus: evidence?.stockStatus ?? "unverified",
          checkedAt: evidence?.checkedAt ?? "",
          sourceUrls: urls(evidence?.sourceIds ?? [], index),
        },
        outcome: "pending",
      },
      fields: keys.map((key) => {
        const fact = car.facts[key];
        return {
          key,
          label: fact?.label ?? coreFacts.find((f) => f.key === key)?.label ?? key,
          due: due.has(`fact/${key}`),
          current: {
            value: showValue(fact),
            basis: fact?.basis ?? "",
            grade: fact?.buyerGrade ?? "Unreviewed",
            checkedAt: fact?.date ?? "",
            sourceUrls: urls(fact?.sourceIds ?? [], index),
          },
          outcome: "pending" as Outcome,
        };
      }),
    };
  });
  return {
    schema: FINDINGS_SCHEMA,
    brand: options.brand,
    asOf: options.asOf,
    reviewedAt: options.asOf,
    reviewedBy: "",
    sources: [],
    versions,
  };
}
