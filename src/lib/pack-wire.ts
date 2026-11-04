import type { Pack, Source } from "./types";

/**
 * A pack for the offline file, which embeds the whole source registry once: each pack lists its sources by
 * id (a pack's sources are most of what its neighbours in the same family repeat) and they are rebuilt on load.
 */
export type WirePack = Omit<Pack, "sources"> & { sources: string[] };
export function toWire(pack: Pack): WirePack {
  return { ...pack, sources: pack.sources.map((s) => s.id) };
}
export function fromWire(
  wire: WirePack,
  source: (id: string) => Source | undefined,
): Pack {
  return {
    ...wire,
    sources: wire.sources.flatMap((id) => {
      const found = source(id);
      return found ? [found] : [];
    }),
  };
}
