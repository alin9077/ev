/** Dated display admissions of facts already held, never edits to original evidence. */
import fs from "node:fs";
import path from "node:path";
import { validDate } from "./corrections";
import { safeUrl } from "./config";
import type { Car, Fact, Source } from "./types";

export type RetainedFactFill = {
  variantId: string;
  brand: string;
  model: string;
  trim: string;
  key: string;
  before: Partial<Fact> | null;
  kind: "same-version-alias" | "retained-packet" | "brand-warranty";
  reason: string;
  evidenceLocation: string;
  sources: { id: string; url: string; snapshot: Source }[];
  supportingFact?: { key: string; before: Partial<Fact> };
  fact: Fact;
};
type Registry = {
  schemaVersion: number;
  reviewedOn: string;
  rows: RetainedFactFill[];
};
const registry = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "data/m1-retained-fact-fills-2026-10-13.json"),
    "utf8",
  ),
) as Registry;

export function retainedFactSnapshot(
  fact: Fact | undefined,
): Partial<Fact> | null {
  if (!fact) return null;
  return structuredClone(fact);
}
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonical(v)]),
    );
  return value;
}
const same = (a: unknown, b: unknown) =>
  JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const targets = new Set([
  "power_kw",
  "battery_kwh",
  "zero_to_100_s",
  "warranty",
  "battery_warranty",
  "width_mm",
  "height_mm",
  "dc_charge_time_min",
  "dc_peak_kw",
  "ac_kw",
  "towing_braked_kg",
]);

/** Only reviewed exact IDs and unchanged evidence can acquire a canonical display cell. */
export function applyRetainedFactFills(
  cars: Car[],
  sources: Source[],
  rows: readonly RetainedFactFill[] = registry.rows,
): Car[] {
  if (registry.schemaVersion !== 1 || !validDate(registry.reviewedOn))
    throw new Error("Invalid retained-fact registry");
  const byId = new Map(cars.map((car) => [car.id, car]));
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const patches = new Map<string, RetainedFactFill[]>();
  const seen = new Set<string>();
  for (const row of rows) {
    const car = byId.get(row.variantId);
    const identity = `${row.variantId}\0${row.key}`;
    if (
      !car ||
      car.brand !== row.brand ||
      car.model !== row.model ||
      car.trim !== row.trim
    )
      throw new Error(
        `Retained fact has an unknown or changed version: ${identity}`,
      );
    if (![undefined, "passenger", "ute"].includes(car.vehicleClass))
      throw new Error(`Retained fact is outside Tier 1: ${identity}`);
    if (seen.has(identity) || !targets.has(row.key) || row.fact.key !== row.key)
      throw new Error(`Invalid or duplicate retained fact target: ${identity}`);
    seen.add(identity);
    if (
      !row.reason.trim() ||
      !row.evidenceLocation.trim() ||
      !["same-version-alias", "retained-packet", "brand-warranty"].includes(
        row.kind,
      ) ||
      !validDate(row.fact.date) ||
      row.fact.date > registry.reviewedOn ||
      row.fact.value == null ||
      (typeof row.fact.value === "number" &&
        !Number.isFinite(row.fact.value)) ||
      !["standard", "conditional"].includes(row.fact.status) ||
      !["AU", "Australia"].includes(row.fact.market)
    )
      throw new Error(`Invalid retained evidence: ${identity}`);
    if (row.before?.value != null)
      throw new Error(
        `Retained fill would replace an existing value: ${identity}`,
      );
    const selected = row.sources.map((source) => source.id);
    if (
      !selected.length ||
      new Set(selected).size !== selected.length ||
      !same(selected, row.fact.sourceIds)
    )
      throw new Error(`Retained source mapping mismatch: ${identity}`);
    for (const source of row.sources) {
      if (
        !safeUrl(source.url) ||
        sourceById.get(source.id)?.url !== source.url ||
        sources.filter((candidate) => candidate.id === source.id).length !==
          1 ||
        !source.snapshot ||
        !same(sourceById.get(source.id), source.snapshot)
      )
        throw new Error(`Retained source is missing or changed: ${source.id}`);
    }
    if (
      row.supportingFact &&
      !same(
        retainedFactSnapshot(car.facts[row.supportingFact.key]),
        row.supportingFact.before,
      )
    )
      throw new Error(`Retained same-version source fact changed: ${identity}`);
    if (
      row.supportingFact &&
      (row.fact.date !== row.supportingFact.before.date ||
        !row.fact.sourceIds.every((id) =>
          row.supportingFact?.before.sourceIds?.includes(id),
        ))
    )
      throw new Error(
        `Retained alias changed its observation date or sources: ${identity}`,
      );
    if (row.kind === "same-version-alias" && !row.supportingFact)
      throw new Error(`Retained alias lacks a source fact: ${identity}`);
    if (
      row.kind === "brand-warranty" &&
      !["warranty", "battery_warranty"].includes(row.key)
    )
      throw new Error(`Brand inheritance is not a warranty: ${identity}`);
    // A second application is harmless; any different pre-existing value is rejected.
    if (same(car.facts[row.key], row.fact)) continue;
    if (!same(retainedFactSnapshot(car.facts[row.key]), row.before))
      throw new Error(`Retained fact before snapshot changed: ${identity}`);
    const group = patches.get(row.variantId) || [];
    group.push(row);
    patches.set(row.variantId, group);
  }
  return cars.map((car) => {
    const group = patches.get(car.id);
    if (!group) return car;
    const facts = { ...car.facts };
    for (const row of group) facts[row.key] = structuredClone(row.fact);
    return { ...car, facts };
  });
}
