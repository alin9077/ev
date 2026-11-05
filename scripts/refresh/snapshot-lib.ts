/** A coverage snapshot: the effective on-sale state that /changes compares month to month. */
import type { Car, Fact, Source } from "../../src/lib/types";
import { hasValue, isOnSale, isTierOne } from "../reporting/reports";

export const SNAPSHOT_SCHEMA = "roadmark-coverage-snapshot-v1";
export type SnapshotFact = {
  value: string | number | null;
  unit: string;
  basis: string;
  comparisonBasis: string;
  /** Price ladder rung (1-6) for price facts, otherwise null. */
  rung: number | null;
  date: string;
  sourceIds: string[];
};
export type SnapshotVersion = {
  id: string;
  brand: string;
  vehicle: string;
  family: string;
  slug: string;
  onSale: boolean;
  availability: {
    state: string;
    orderStatus: string;
    stockStatus: string;
    checkedAt: string;
    sourceIds: string[];
  };
  facts: Record<string, SnapshotFact>;
};
export type Snapshot = {
  schema: typeof SNAPSHOT_SCHEMA;
  asOf: string;
  versions: SnapshotVersion[];
  sources: Pick<Source, "id" | "url" | "title" | "publisher" | "accessed_date">[];
};
/** Fact keys the changes page may report on. Prices are every fact the ladder carries. */
export const WARRANTY_KEYS = ["warranty", "battery_warranty"] as const;
const PRICE_KEYS = new Set([
  "price_aud",
  "promotional_driveaway_aud",
  "published_driveaway_aud",
]);
export const isPriceFact = (fact: Fact) =>
  PRICE_KEYS.has(fact.key) || !!fact.priceEvidence;
const tracked = (fact: Fact) =>
  isPriceFact(fact) ||
  fact.key === "range_km" ||
  (WARRANTY_KEYS as readonly string[]).includes(fact.key);
export function buildSnapshot(
  cars: Car[],
  sources: Source[],
  asOf: string,
): Snapshot {
  const versions: SnapshotVersion[] = cars
    .filter(isTierOne)
    .map((car) => {
      const evidence = car.availabilityEvidence;
      const facts: Record<string, SnapshotFact> = {};
      for (const fact of Object.values(car.facts)) {
        if (!tracked(fact) || !hasValue(fact.value)) continue;
        facts[fact.key] = {
          value: fact.value as string | number,
          unit: fact.unit,
          basis: fact.basis,
          comparisonBasis: fact.comparisonBasis,
          rung: isPriceFact(fact) ? (fact.priceEvidence?.rung ?? null) : null,
          date: fact.date,
          sourceIds: [...fact.sourceIds],
        };
      }
      return {
        id: car.id,
        brand: car.brand,
        vehicle: `${car.brand} ${car.model} ${car.trim}`,
        family: car.family,
        slug: car.slug,
        onSale: isOnSale(car),
        availability: {
          state: car.availability,
          orderStatus: evidence?.orderStatus ?? "unverified",
          stockStatus: evidence?.stockStatus ?? "unverified",
          checkedAt: evidence?.checkedAt ?? "",
          sourceIds: [...(evidence?.sourceIds ?? [])],
        },
        facts,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  const used = new Set(
    versions.flatMap((v) => [
      ...v.availability.sourceIds,
      ...Object.values(v.facts).flatMap((f) => f.sourceIds),
    ]),
  );
  return {
    schema: SNAPSHOT_SCHEMA,
    asOf,
    versions,
    sources: sources
      .filter((s) => used.has(s.id))
      .map(({ id, url, title, publisher, accessed_date }) => ({
        id,
        url,
        title,
        publisher,
        accessed_date,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
}
