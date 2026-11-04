import { comparisonPickerCars } from "./picker-car";
import { catalogue, counts, pack, research } from "./data";
import { parseSelection } from "./compare";
import type { Pack, Source } from "./types";
/** Dynamic comparison navigation requests a new scope; offline switches retain the full registry. */
export function selectedPackSources(packs: Pack[], registry: Source[]) {
  const used = new Set(packs.flatMap((p) => p.sources.map((s) => s.id)));
  const sources = registry.filter((s) => used.has(s.id));
  if (sources.length !== used.size)
    throw new Error("Selected comparison has missing source records");
  return sources;
}
export type Query = Record<string, string | string[] | undefined>;
export function experienceProps(query: Query) {
  const q = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (typeof v === "string") q.set(k, v);
  });
  const cars = comparisonPickerCars(catalogue());
  const state = parseSelection(q, cars);
  return {
    cars,
    packs: state.ids.map((id) => pack(id)),
    state,
    criteria: research().criteria,
    counts: counts(),
  };
}
