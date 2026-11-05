/** Read-only audit of retained prices before/after the dated M1 admission overlay. */
import { sourceCatalogue, research } from "../src/lib/data";
import {
  applyPriceLadder,
  priceCandidates,
  priceCandidateMatchesReviewedState,
} from "../src/lib/price-ladder";
import existing from "../data/price-ladder-existing-candidates-2026-10-13.json";
import premium from "../data/price-ladder-premium-candidates-2026-10-13.json";

const sources = research().sources;
const before = sourceCatalogue().filter((car) =>
  ["passenger", "ute"].includes(car.vehicleClass ?? "passenger"),
);
const after = before.map((car) => applyPriceLadder(car, sources));
const byId = new Map(before.map((car) => [car.id, car]));
const held = [...existing.unresolved, ...premium.unresolved];
const numeric = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value);
const versions = after.map((car) => {
  const fact = car.facts.price_aud;
  const prior = byId.get(car.id)!.facts.price_aud;
  return {
    variantId: car.id,
    brand: car.brand,
    model: car.model,
    trim: car.trim,
    availability: car.availability,
    before: prior.value,
    value: fact.value,
    recovered: !numeric(prior.value) && numeric(fact.value),
    checkedOn: fact.date,
    basis: fact.basis,
    comparisonBasis: fact.comparisonBasis,
    sourceIds: fact.sourceIds,
    priceEvidence: fact.priceEvidence,
    ...(numeric(fact.value)
      ? {}
      : {
          reason:
            held
              .filter((entry) => entry.variantId === car.id)
              .map((entry) => entry.reason)
              .join(" ") ||
            [prior.basis, ...prior.qualifications].filter(Boolean).join(" "),
        }),
  };
});
console.log(
  JSON.stringify(
    {
      policyDate: "2026-10-13",
      sourceRechecked: false,
      scope:
        "All existing Tier 1 records, including residual or arriving versions; the coverage report separately measures on-sale versions.",
      beforePriced: before.filter((car) => numeric(car.facts.price_aud.value))
        .length,
      afterPriced: versions.filter((car) => numeric(car.value)).length,
      total: versions.length,
      unresolvedCount: versions.filter((car) => !numeric(car.value)).length,
      rejectedByStateGuard: priceCandidates
        .filter(
          (row) =>
            !priceCandidateMatchesReviewedState(
              row,
              byId.get(row.variantId)!,
              sources,
            ),
        )
        .map((row) => ({ variantId: row.variantId, sourceKey: row.sourceKey })),
      brands: [...new Set(versions.map((car) => car.brand))]
        .sort()
        .map((brand) => {
          const rows = versions.filter((car) => car.brand === brand);
          return {
            brand,
            total: rows.length,
            priced: rows.filter((car) => numeric(car.value)).length,
            newlyPriced: rows.filter((car) => car.recovered).length,
          };
        }),
      versions,
    },
    null,
    2,
  ),
);
