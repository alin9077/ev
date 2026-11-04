import type { Pack } from "./types";
/** Fetches one variant's public pack. The offline file embeds every pack and replaces this module. */
export async function fetchPack(id: string): Promise<Pack> {
  const response = await fetch(`/pack/${encodeURIComponent(id)}/pack.json`);
  if (!response.ok) throw new Error(`Pack ${id} unavailable`);
  return (await response.json()) as Pack;
}
