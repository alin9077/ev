import { publicCounts, publicPack, research } from "./data";
import { parseSelection } from "./compare";
import { pickerCars } from "./picker-cars";
export type Query = Record<string, string | string[] | undefined>;
export function experienceProps(query: Query) {
  const q = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (typeof v === "string") q.set(k, v);
  });
  const cars = pickerCars();
  const state = parseSelection(q, cars);
  return {
    cars,
    packs: state.ids.map(publicPack),
    state,
    criteria: research().criteria,
    counts: publicCounts(),
  };
}
