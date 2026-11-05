/** Read-only work queue: which claims need rechecking, grouped by brand in sales order. */
import {
  buildStaleReport,
  hasValue,
  isOnSale,
  type FreshnessEntry,
  type ReportInput,
} from "../reporting/reports";
import {
  brandMatches,
  compareBrands,
  type BrandRank,
} from "./brands";
import type { Car, Fact, Feature, Source } from "../../src/lib/types";

export type QueueClaim = {
  carId: string;
  vehicle: string;
  kind: FreshnessEntry["kind"];
  key: string;
  label: string;
  currentValue: string;
  basis: string;
  grade: string;
  checkedAt: string;
  staleOn: string | null;
  /** Days from the as-of date to the first stale day; zero or less means already stale. */
  daysUntilStale: number | null;
  sourceIds: string[];
  sourceUrls: string[];
  /** Equipment rows are projected from price facts; recheck the fact, not the row. */
  projectedFrom?: string;
};
export type QueueBrand = {
  brand: string;
  onSale: boolean;
  claims: QueueClaim[];
  versions: number;
  alreadyStale: number;
};
export type WorkQueue = {
  asOf: string;
  horizonDays: number;
  through: string;
  brands: QueueBrand[];
};
const dayMs = 86_400_000;
export const daysBetween = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / dayMs,
  );
function show(value: unknown, unit = ""): string {
  if (!hasValue(value)) return "Not published";
  const text =
    typeof value === "number"
      ? value.toLocaleString("en-AU")
      : typeof value === "string"
        ? value
        : JSON.stringify(value);
  return unit ? `${text} ${unit}` : text;
}
const sourceUrls = (ids: string[], index: Map<string, Source>) => [
  ...new Set(
    ids.flatMap((id) => {
      const url = index.get(id)?.url;
      return url ? [url] : [];
    }),
  ),
];
function describe(
  entry: FreshnessEntry,
  car: Car,
  features: Map<string, Feature>,
): Pick<QueueClaim, "currentValue" | "basis" | "grade" | "projectedFrom"> {
  if (entry.kind === "fact") {
    const fact: Fact | undefined = car.facts[entry.key];
    return {
      currentValue: show(fact?.value, fact?.unit),
      basis: fact?.basis ?? "",
      grade: fact?.buyerGrade ?? "Unreviewed",
    };
  }
  if (entry.kind === "availability") {
    const evidence = car.availabilityEvidence;
    return {
      currentValue: `${car.availability}; orders: ${evidence?.orderStatus ?? "unverified"}; stock: ${evidence?.stockStatus ?? "unverified"}`,
      basis: "Exact Australian version availability",
      grade: "n/a",
    };
  }
  const feature = features.get(`${car.id}\0${entry.key}`);
  const projected =
    entry.key === "driveaway_price"
      ? car.facts.price_aud?.comparisonBasis === "Driveaway"
        ? "price_aud"
        : car.facts.promotional_driveaway_aud
          ? "promotional_driveaway_aud"
          : car.facts.published_driveaway_aud
            ? "published_driveaway_aud"
            : undefined
      : undefined;
  return {
    currentValue: show(feature?.value),
    basis: feature?.condition_label ?? "",
    grade: feature?.buyerGrade ?? "Unreviewed",
    ...(projected ? { projectedFrom: projected } : {}),
  };
}
export function buildWorkQueue(
  input: Pick<ReportInput, "cars" | "features" | "sources">,
  asOf: string,
  options: { horizonDays?: number; brand?: string; order: BrandRank[] },
): WorkQueue {
  const horizonDays = options.horizonDays ?? 45;
  const report = buildStaleReport(input, asOf, horizonDays);
  const sources = new Map(input.sources.map((source) => [source.id, source]));
  const cars = new Map(input.cars.map((car) => [car.id, car]));
  const features = new Map(
    input.features.map((feature) => [
      `${feature.variant_id}\0${feature.criterion}`,
      feature,
    ]),
  );
  const claims = [...report.overdue, ...report.due].filter((entry) =>
    options.brand ? brandMatches(options.brand, entry.brand) : true,
  );
  const grouped = new Map<string, QueueClaim[]>();
  for (const entry of claims) {
    const car = cars.get(entry.carId)!;
    const claim: QueueClaim = {
      carId: entry.carId,
      vehicle: entry.vehicle,
      kind: entry.kind,
      key: entry.key,
      label: entry.label,
      checkedAt: entry.checkedAt,
      staleOn: entry.staleOn,
      daysUntilStale: entry.staleOn ? daysBetween(asOf, entry.staleOn) : null,
      sourceIds: entry.sourceIds,
      sourceUrls: sourceUrls(entry.sourceIds, sources),
      ...describe(entry, car, features),
    };
    const list = grouped.get(entry.brand) ?? [];
    list.push(claim);
    grouped.set(entry.brand, list);
  }
  const brands = [...grouped.keys()]
    .sort((a, b) => compareBrands(a, b, options.order))
    .map((brand) => {
      const list = grouped.get(brand)!.sort(
        (a, b) =>
          (a.daysUntilStale ?? 0) - (b.daysUntilStale ?? 0) ||
          a.vehicle.localeCompare(b.vehicle) ||
          a.key.localeCompare(b.key),
      );
      return {
        brand,
        onSale: input.cars.some((car) => car.brand === brand && isOnSale(car)),
        claims: list,
        versions: new Set(list.map((claim) => claim.carId)).size,
        alreadyStale: list.filter((claim) => (claim.daysUntilStale ?? 1) <= 0)
          .length,
      };
    });
  return { asOf, horizonDays, through: report.through, brands };
}
export function formatWorkQueue(queue: WorkQueue): string {
  const lines = [
    `Refresh work queue as of ${queue.asOf}: claims already stale or going stale by ${queue.through} (${queue.horizonDays}-day horizon). Brands in sales order.`,
  ];
  if (!queue.brands.length) lines.push("Nothing is due.");
  for (const brand of queue.brands) {
    lines.push(
      "",
      `${brand.brand}: ${brand.claims.length} claims across ${brand.versions} versions (${brand.alreadyStale} already stale)`,
    );
    for (const claim of brand.claims) {
      const days =
        claim.daysUntilStale === null
          ? "no date"
          : claim.daysUntilStale <= 0
            ? `stale ${-claim.daysUntilStale} d`
            : `${claim.daysUntilStale} d left`;
      lines.push(
        `  [${days}] ${claim.vehicle} · ${claim.kind}/${claim.key} = ${claim.currentValue} (${claim.grade}, checked ${claim.checkedAt})`,
      );
      if (claim.projectedFrom)
        lines.push(
          `      projected from ${claim.projectedFrom}; recheck that fact, not this row`,
        );
      for (const url of claim.sourceUrls) lines.push(`      ${url}`);
    }
  }
  return lines.join("\n");
}
