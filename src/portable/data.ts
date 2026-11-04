import type { Car, Pack, Research } from "@/lib/types";
import { fromWire, type WirePack } from "@/lib/pack-wire";
export type PortableData = {
  cars: Car[];
  /** Packs with their sources listed by id; see pack-wire.ts. */
  packs: Record<string, WirePack>;
  research: Pick<Research, "sources" | "criteria" | "publication_issues">;
  /** Yes/no equipment for the explorer filter (public variants only). */
  equipment: Record<string, Record<string, boolean | null>>;
  verification: {
    facts: number;
    factsShown: number;
    factsHidden: number;
    rows: number;
    rowsShown: number;
    rowsHidden: number;
  };
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
const sources = new Map(data.research.sources.map((s) => [s.id, s]));
const packs = new Map<string, Pack>();
export const pack = (id: string) => {
  let hydrated = packs.get(id);
  if (!hydrated && data.packs[id]) {
    hydrated = fromWire(data.packs[id], (sid) => sources.get(sid));
    packs.set(id, hydrated);
  }
  return hydrated as Pack;
};
export const catalogue = () =>
  Object.keys(data.packs).map((id) => pack(id).car);
export const pickerCatalogue = () => data.cars;
export const research = () => data.research;
export const counts = () => data.counts;
// Everything embedded is already public: the build wrote it through publicPack and publicSources.
export const publicCatalogue = catalogue;
export const publicPack = pack;
export const publicCounts = counts;
export const publicEquipment = () => data.equipment;
export const verificationCounts = () => data.verification;
export const publicSourcesById = (ids: string[]) =>
  data.research.sources.filter((s) => ids.includes(s.id));
export const art = () => data.art;
export const fetchPack = async (id: string) => pack(id);
