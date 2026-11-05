import { parsePortableData } from "@/lib/portable-string-codec";
import { hydratePortablePacks, type StoredPack } from "@/lib/portable-packs";
import type { Car, Research } from "@/lib/types";
import type { MarketInventory } from "@/lib/market-inventory-data";
import type { ChangesMonth } from "@/lib/changes";
export type PortableData = {
  marketInventory: MarketInventory;
  cars: Car[];
  packs: Record<string, StoredPack>;
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
  changes: ChangesMonth[];
};
const data = parsePortableData(
  document.getElementById("ev-data")!.textContent!,
) as PortableData;
const packs = hydratePortablePacks(data.packs, data.research.sources);
export const catalogue = () => Object.values(packs).map((p) => p.car);
export const pickerCatalogue = () => data.cars;
export const pack = (id: string) => packs[id];
export const research = () => data.research;
export const counts = () => data.counts;
export const art = () => data.art;
export const changes = () => data.changes ?? [];
export const marketInventory = data.marketInventory;
