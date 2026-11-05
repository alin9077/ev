import assert from "node:assert/strict";
import {
  pack,
  sourceCatalogue,
  sourceEffectiveFeatures,
  sourceResearch,
} from "../../src/lib/data";
import type { Car, Pack, Research } from "../../src/lib/types";

/** Build the public pack shape for an explicit immutable admission snapshot.
 * The production pack intentionally regrades equipment, even with supplied cars.
 * Historical fixture tests instead need the equipment that accompanied those cars.
 * Keep source closure strict; never remove or loosen an evidence assertion.
 */
export function sourceSnapshotPack(
  id: string,
  snapshot: { data: Research; cars: Car[] } = {
    data: sourceResearch(),
    cars: sourceCatalogue(),
  },
): Pack {
  const result = pack(id, snapshot);
  const features = sourceEffectiveFeatures(result.car, snapshot.data);
  const sources = new Set(result.sources.map((source) => source.id));
  for (const feature of features)
    for (const sourceId of feature.source_ids)
      assert.ok(
        sources.has(sourceId),
        `Source snapshot feature lacks ${sourceId}`,
      );
  return { ...result, features };
}
