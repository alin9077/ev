import type { Car, Pack, Research } from "@/lib/types";
export type PortableData = {
  cars: Car[];
  packs: Record<string, Pack>;
  research: Pick<
    Research,
    "sources" | "criteria" | "publication_issues" | "trim_equipment"
  >;
  counts: {
    variants: number;
    families: number;
    generations: number;
    criteria: number;
    evidence: number;
    current: number;
    outgoing: number;
    provisional: number;
  };
  art: Record<string, string>;
};
const data: PortableData = JSON.parse(
  document.getElementById("ev-data")!.textContent!,
);
export const catalogue = () => Object.values(data.packs).map((p) => p.car);
export const pickerCatalogue = () => data.cars;
export const pack = (id: string) => data.packs[id];
export const research = () => data.research;
export const counts = () => data.counts;
export const art = () => data.art;
