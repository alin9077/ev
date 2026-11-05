import { applyRetainedFactFills } from "../src/lib/retained-fact-fills";
import { applyPriceLadder } from "../src/lib/price-ladder";
/** Explicit review materialisation; never runs in build or advances source checked dates. */
import fs from "node:fs";
import {
  sourceCatalogue,
  sourceEffectiveFeatures,
  sourceResearch,
} from "../src/lib/data";
import {
  decideRetainedFactGrade,
  featureAsFact,
  standingEvidenceNote,
} from "../src/lib/evidence-regrade-policy";
import {
  evidenceDigest,
  type RegradingOverlay,
} from "../src/lib/evidence-regrading";
const source = sourceResearch();
const sourceIndex = new Map(source.sources.map((row) => [row.id, row]));
const originalCars = sourceCatalogue();
const cars = applyRetainedFactFills(originalCars, source.sources)
  .map((car) => applyPriceLadder(car, source.sources))
  .filter((car) =>
    ["passenger", "ute"].includes(car.vehicleClass || "passenger"),
  );
const overlay: RegradingOverlay = {
  id: "m1-retained-evidence-2026-10-13",
  reviewedAt: "2026-10-13",
  standingNote: standingEvidenceNote,
  sourceDigests: {},
  facts: [],
  features: [],
};
const counts: Record<string, number> = {};
for (const car of cars) {
  for (const fact of Object.values(car.facts)) {
    const decision = decideRetainedFactGrade(fact, sourceIndex);
    if (!decision) continue;
    overlay.facts.push({
      variantId: car.id,
      key: fact.key,
      before: evidenceDigest(fact),
      ...decision,
    });
    for (const id of fact.sourceIds)
      overlay.sourceDigests[id] = evidenceDigest(sourceIndex.get(id));
    const move = `${fact.status} -> ${decision.grade}`;
    counts[move] = (counts[move] || 0) + 1;
  }
  for (const feature of sourceEffectiveFeatures(car, source)) {
    const decision = decideRetainedFactGrade(
      featureAsFact(feature),
      sourceIndex,
    );
    if (!decision) continue;
    overlay.features.push({
      variantId: car.id,
      key: feature.criterion,
      before: evidenceDigest(feature),
      ...decision,
    });
    for (const id of feature.source_ids)
      overlay.sourceDigests[id] = evidenceDigest(sourceIndex.get(id));
  }
}
console.log(
  JSON.stringify(
    {
      cars: cars.length,
      facts: overlay.facts.length,
      features: overlay.features.length,
      transitions: counts,
    },
    null,
    2,
  ),
);
if (process.argv.includes("--write"))
  fs.writeFileSync(
    "data/m1-evidence-regrading-2026-10-13.json",
    JSON.stringify(overlay) + "\n",
  );
if (process.argv.includes("--write")) {
  const rows = new Map(
    overlay.facts.map((row) => [`${row.variantId}\0${row.key}`, row]),
  );
  const core = new Set([
    "price_aud",
    "range_km",
    "battery_kwh",
    "dc_peak_kw",
    "dc_charge_time_min",
    "ac_kw",
    "seats",
    "boot_l",
    "zero_to_100_s",
    "power_kw",
    "length_mm",
    "width_mm",
    "height_mm",
    "towing_braked_kg",
    "warranty",
    "battery_warranty",
  ]);
  const brands: Record<
    string,
    {
      versions: number;
      conditionalToConfirmed: number;
      grades: Record<string, number>;
      examples: unknown[];
    }
  > = {};
  const grades: Record<string, number> = {};
  for (const row of overlay.facts)
    grades[row.grade] = (grades[row.grade] || 0) + 1;
  let upgrades = 0;
  for (const car of originalCars.filter((car) =>
    ["passenger", "ute"].includes(car.vehicleClass || "passenger"),
  )) {
    const brand = (brands[car.brand] ??= {
      versions: 0,
      conditionalToConfirmed: 0,
      grades: {},
      examples: [],
    });
    brand.versions++;
    for (const [key, fact] of Object.entries(car.facts)) {
      const reviewed = rows.get(`${car.id}\0${key}`);
      if (!reviewed) continue;
      brand.grades[reviewed.grade] = (brand.grades[reviewed.grade] || 0) + 1;
      if (fact.status === "conditional" && reviewed.grade === "confirmed") {
        upgrades++;
        brand.conditionalToConfirmed++;
        if (brand.examples.length < 3 && core.has(key))
          brand.examples.push({
            variantId: car.id,
            key,
            value: fact.value,
            before: {
              status: fact.status,
              qualifications: fact.qualifications,
              conditionExplanation: fact.conditionExplanation,
            },
            after: {
              grade: reviewed.grade,
              qualifications: reviewed.qualifications,
              conditionExplanation: reviewed.conditionExplanation,
            },
            checkedAt: fact.date,
            gradeReviewedAt: overlay.reviewedAt,
            sourceIds: fact.sourceIds,
            sourceUrls: fact.sourceIds.map((id) => sourceIndex.get(id)?.url),
            reason: reviewed.reason,
          });
      }
    }
  }
  fs.mkdirSync("qa", { recursive: true });
  fs.writeFileSync(
    "qa/m1-regrading-audit-2026-10-13.json",
    JSON.stringify(
      {
        reviewedAt: overlay.reviewedAt,
        scope:
          "Existing Tier 1 retained evidence only; no new web retrieval. Original snapshots and source records remain unchanged.",
        versions: cars.length,
        factReviewEntries: overlay.facts.length,
        featureReviewEntries: overlay.features.length,
        originalConditionalToConfirmed: upgrades,
        grades,
        brands,
        limitations: [
          "A null or unreviewed fact is not relabelled Not published without a completed two-source negative search.",
          "Mixed maker/secondary citations stay Reported unless a separately reviewed mapping isolates the supporting maker source.",
          "Wheel/options, gross/usable, test-method, source conflicts and provisional specifications remain Check.",
          "Review dates do not replace evidence checked dates; freshness and ranking guards still apply.",
          "This is the initial existing-evidence pass, not brand completion or C1–C6 closure.",
        ],
      },
      null,
      2,
    ) + "\n",
  );
}
