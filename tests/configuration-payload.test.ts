import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { catalogue, research, pack } from "../src/lib/data";
import {
  attributes,
  discoveryCars,
  rankAttribute,
  buildStrengthsIndex,
} from "../src/lib/discovery";
import { currentBuyerSummary } from "../src/lib/selling-points";
import { carEvidenceIds, pageEvidenceSources } from "../src/lib/page-evidence";
import type {
  Car,
  Fact,
  ConfigurationEvidence,
  Source,
} from "../src/lib/types";
const cars = catalogue();
const data = research();
const slim = discoveryCars(cars);
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const bounded = cars.filter((car) => car.configurationEvidence);

test("configuration projection is non-mutating and leaves full packs and all evidence intact", () => {
  const before = cars.map(hash);
  const fullConfigs = bounded.map((car) => hash(car.configurationEvidence));
  const projected = discoveryCars(cars);
  assert.deepEqual(cars.map(hash), before);
  assert.ok(bounded.length > 0);
  for (const car of bounded) {
    const client = projected.find((c) => c.id === car.id)!;
    assert.deepEqual(Object.keys(client.configurationEvidence!).sort(), [
      "completeVehicleCountEligible",
      "projectionScope",
      "rankingEligible",
    ]);
    assert.equal(client.buyerSummary, car.buyerSummary);
    assert.equal(client.availabilityEvidence, car.availabilityEvidence);
    assert.equal(client.issues, car.issues);
    for (const [key, fact] of Object.entries(client.facts))
      assert.equal(fact, car.facts[key]);
    assert.deepEqual(
      pack(car.id, { cars, data }).car.configurationEvidence,
      car.configurationEvidence,
    );
    if (car.modelFamily?.startsWith("volkswagen-"))
      assert.ok(Array.isArray(car.configurationEvidence!.options));
    else
      assert.ok(
        Array.isArray(
          car.configurationEvidence!.requiredBuyerVisibleConditions,
        ),
      );
  }
  assert.deepEqual(
    bounded.map((car) => hash(car.configurationEvidence)),
    fullConfigs,
  );
  const originalBytes = Buffer.byteLength(
    JSON.stringify(bounded.map((c) => c.configurationEvidence)),
  );
  const projectedBytes = Buffer.byteLength(
    JSON.stringify(
      projected
        .filter((c) => c.configurationEvidence)
        .map((c) => c.configurationEvidence),
    ),
  );
  assert.ok(projectedBytes < originalBytes / 100);
});

function ranks(input: Car[], asOf: string) {
  return attributes.map(({ key }) => {
    const result = rankAttribute(input, data.sources, key, { ...policy, asOf });
    return {
      ...result,
      unranked: result.unranked.map(({ car, ...entry }) => ({
        ...entry,
        carId: car.id,
      })),
      groups: result.groups.map((group) => ({
        ...group,
        entries: group.entries.map(({ car, ...entry }) => ({
          ...entry,
          carId: car.id,
        })),
      })),
    };
  });
}
test("configuration projection preserves all ranks, exclusions, strengths and date boundaries", () => {
  for (const asOf of [
    "2026-10-09",
    "2026-10-10",
    "2026-10-31",
    "2026-11-09",
    "2026-11-10",
    "2026-12-01",
  ]) {
    assert.deepEqual(ranks(slim, asOf), ranks(cars, asOf));
    const strengths = (input: Car[]) =>
      [...buildStrengthsIndex(input, data.sources, { ...policy, asOf })].map(
        ([id, entries]) => [
          id,
          entries.map(({ car, ...entry }) => ({ ...entry, carId: car.id })),
        ],
      );
    assert.deepEqual(strengths(slim), strengths(cars));
  }
});

test("bounded ranking presence and literal eligibility survive projection without permissive defaults", () => {
  const source = {
    id: "fixture",
    url: "https://example.com/au",
    accessed_date: policy.asOf,
  } as Source;
  for (const eligibility of [false, undefined, true]) {
    const car = {
      ...bounded[0],
      // This fixture isolates configuration eligibility using an ungraded synthetic fact.
      buyerGradesRequired: undefined,
      availabilityEvidence: undefined,
      configurationEvidence: {
        ...bounded[0].configurationEvidence,
        rankingEligible: eligibility,
      } as ConfigurationEvidence,
      facts: {
        range_km: {
          key: "range_km",
          value: 500,
          unit: "km",
          comparisonBasis: "WLTP",
          status: "standard",
          market: "AU",
          date: policy.asOf,
          sourceIds: [source.id],
          issues: [],
        } as unknown as Fact,
      },
    };
    const projected = discoveryCars([car]);
    const fullRank = rankAttribute([car], [source], "range_km", policy);
    const slimRank = rankAttribute(projected, [source], "range_km", policy);
    assert.deepEqual(slimRank.excluded, fullRank.excluded);
    assert.equal(slimRank.groups.length, eligibility === true ? 1 : 0);
    assert.equal(
      projected[0].configurationEvidence!.rankingEligible,
      eligibility,
    );
  }
});

test("configuration projection preserves cached summary source drift and expiry semantics", () => {
  for (const car of bounded) {
    const client = slim.find((c) => c.id === car.id)!;
    assert.equal(client.buyerSummary, car.buyerSummary);
    for (const asOf of ["2026-10-09", "2026-10-10", "2026-11-09", "2026-11-10"])
      assert.deepEqual(
        currentBuyerSummary(client.buyerSummary, data.sources, {
          ...policy,
          asOf,
        }),
        currentBuyerSummary(car.buyerSummary, data.sources, {
          ...policy,
          asOf,
        }),
      );
    if (!car.buyerSummary) {
      assert.equal(client.buyerSummary, undefined);
      continue;
    }
    const target = car.buyerSummary.guardSourceIds[0];
    for (const field of [
      "publication_hold",
      "conflict",
      "access_limitation",
      "url",
      "title",
      "accessed_date",
    ]) {
      const sources = data.sources.map((s) =>
        s.id === target
          ? {
              ...s,
              [field]:
                field === "accessed_date"
                  ? "2026-10-11"
                  : field === "url"
                    ? ""
                    : "Changed source",
            }
          : s,
      );
      assert.deepEqual(
        currentBuyerSummary(client.buyerSummary, sources, policy),
        currentBuyerSummary(car.buyerSummary, sources, policy),
      );
    }
    const removed = data.sources.filter((s) => s.id !== target);
    assert.deepEqual(
      currentBuyerSummary(client.buyerSummary, removed, policy),
      currentBuyerSummary(car.buyerSummary, removed, policy),
    );
  }
});

test("configuration projection omits only explicit context-only sources and preserves all claim snapshots", () => {
  // Compare the same retained fact set while restoring only full configuration.
  const withFullConfiguration = slim.map((car, i) => ({
    ...car,
    ...(cars[i].configurationEvidence
      ? { configurationEvidence: cars[i].configurationEvidence }
      : {}),
  }));
  const slimIds = carEvidenceIds(slim);
  const contextIds = new Set(
    cars.flatMap((car) => car.configurationEvidence?.sourceIds || []),
  );
  assert.deepEqual(
    carEvidenceIds(withFullConfiguration),
    new Set([...slimIds, ...contextIds]),
  );
  const scoped = pageEvidenceSources(data.sources, { cars: slim });
  const fullScoped = pageEvidenceSources(data.sources, {
    cars: withFullConfiguration,
  });
  assert.deepEqual(
    scoped,
    fullScoped.filter((source) => slimIds.has(source.id)),
  );
  assert.deepEqual(
    fullScoped
      .filter((source) => !slimIds.has(source.id))
      .map((source) => source.id),
    data.sources
      .filter((source) => contextIds.has(source.id) && !slimIds.has(source.id))
      .map((source) => source.id),
  );
  for (const source of scoped)
    assert.equal(
      source,
      data.sources.find((s) => s.id === source.id),
    );
});
