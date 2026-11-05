import { configurationSourceIds } from "./configuration-evidence";
import type { Car, Pack, Source } from "./types";

/** Explicit citations used outside the original fleet's vehicle packs. */
export const HERO_EVIDENCE_IDS = [
  "r5_au_ev_sales_sep2026",
  "r3_tesla_fsd",
] as const;

/** Retain the complete evidence graph of every transported car, including hidden cards. */
export function carEvidenceIds(cars: readonly Car[]): Set<string> {
  const ids = new Set<string>();
  const add = (values: readonly string[] | undefined) => {
    for (const id of values || []) ids.add(id);
  };
  for (const car of cars) {
    add(configurationSourceIds(car));
    add(car.projectedEvidenceSourceIds);
    add(car.availabilityEvidence?.sourceIds);
    for (const issue of car.issues) add(issue.source_ids);
    for (const fact of Object.values(car.facts)) {
      add(fact.sourceIds);
      for (const issue of fact.issues) add(issue.source_ids);
    }
    const summary = car.buyerSummary;
    add(summary?.guardSourceIds);
    add(summary?.strength?.sourceIds);
    add(summary?.tradeoff?.sourceIds);
    add(summary?.expectedSourceSnapshots?.map((source) => source.id));
  }
  return ids;
}

/** Page-specific allowlist only: never project source fields, dates, flags or snapshots. */
export function pageEvidenceSources(
  canonicalSources: readonly Source[],
  {
    cars = [],
    packs = [],
    extraIds = [],
  }: {
    cars?: readonly Car[];
    packs?: readonly Pack[];
    extraIds?: readonly string[];
  },
): Source[] {
  const ids = carEvidenceIds(cars);
  for (const pack of packs) {
    for (const source of pack.sources) ids.add(source.id);
  }
  for (const id of extraIds) ids.add(id);
  const selected = canonicalSources.filter((source) => ids.has(source.id));
  const found = new Set(selected.map((source) => source.id));
  const missing = [...ids].filter((id) => !found.has(id));
  if (missing.length) {
    throw new Error(
      `Page evidence references missing sources: ${missing.join(", ")}`,
    );
  }
  return selected;
}
