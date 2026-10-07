import { pickerCatalogue, counts, pack, research } from "./data";
import { parseSelection } from "./compare";
export type Query = Record<string, string | string[] | undefined>;
export function experienceProps(query: Query) {
  const q = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (typeof v === "string") q.set(k, v);
  });
  const cars = pickerCatalogue();
  const state = parseSelection(q, cars);
  return {
    cars,
    packs: state.ids.map(pack),
    state,
    criteria: research().criteria,
    counts: counts(),
  };
}
