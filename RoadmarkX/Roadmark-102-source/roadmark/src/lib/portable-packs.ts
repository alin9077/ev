import type { Feature, Pack, Source } from "./types";
/** Keep evidence once in the portable source registry, with exact per-trim references. */
type StoredFeature = Omit<Feature, "variant_id" | "model_id"> &
  Partial<Pick<Feature, "variant_id" | "model_id">>;
export type StoredPack = Omit<Pack, "sources" | "features"> & {
  sourceIds: string[];
  features: StoredFeature[];
};
export function storePortablePacks(
  packs: Record<string, Pack>,
): Record<string, StoredPack> {
  return Object.fromEntries(
    Object.entries(packs).map(([id, { sources, ...pack }]) => [
      id,
      {
        ...pack,
        features: pack.features.map(({ variant_id, model_id, ...feature }) => ({
          ...feature,
          ...(variant_id === pack.car.id ? {} : { variant_id }),
          ...(model_id === pack.car.modelId ? {} : { model_id }),
        })),
        sourceIds: sources.map((source) => source.id),
      },
    ]),
  );
}
export function hydratePortablePacks(
  packs: Record<string, StoredPack>,
  sources: Source[],
): Record<string, Pack> {
  const byId = new Map(sources.map((source) => [source.id, source]));
  return Object.fromEntries(
    Object.entries(packs).map(([id, { sourceIds, ...pack }]) => [
      id,
      {
        ...pack,
        features: pack.features.map((feature) => ({
          ...feature,
          variant_id: feature.variant_id ?? pack.car.id,
          model_id: feature.model_id ?? pack.car.modelId,
        })),
        sources: sourceIds.map((sourceId) => {
          const source = byId.get(sourceId);
          if (!source)
            throw new Error(`Missing portable source ${sourceId} for ${id}`);
          return source;
        }),
      },
    ]),
  );
}
