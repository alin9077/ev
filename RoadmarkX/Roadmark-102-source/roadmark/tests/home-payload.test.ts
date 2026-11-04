import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CarAvatar } from "../src/components/car-avatar";
import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, pack, research } from "../src/lib/data";
import { curatedFleetCars, fleetSelection } from "../src/lib/fleet";
import {
  attributes,
  discoveryCars,
  rankAttribute,
  filterDiscoveryCars,
} from "../src/lib/discovery";

const cars = catalogue();
const data = research();
const slim = discoveryCars(cars);
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };

test("discovery boundary preserves every identity, summary and retained evidence claim", () => {
  assert.equal(slim.length, cars.length);
  for (let i = 0; i < cars.length; i++) {
    const { facts: original, configurationEvidence, ...identity } = cars[i];
    const {
      facts,
      configurationEvidence: projectedConfiguration,
      projectedEvidenceSourceIds,
      ...reducedIdentity
    } = slim[i];
    const dimensionSources = new Set(
      ["height_mm", "wheelbase_mm"].flatMap((key) => {
        const fact = original[key];
        return fact
          ? [
              ...fact.sourceIds,
              ...fact.issues.flatMap((issue) => issue.source_ids),
            ]
          : [];
      }),
    );
    assert.equal(
      new Set(projectedEvidenceSourceIds ?? []).size,
      (projectedEvidenceSourceIds ?? []).length,
    );
    for (const id of projectedEvidenceSourceIds ?? [])
      assert.ok(dimensionSources.has(id));
    assert.deepEqual(reducedIdentity, identity);
    assert.deepEqual(
      projectedConfiguration,
      configurationEvidence && {
        rankingEligible: configurationEvidence.rankingEligible,
        completeVehicleCountEligible:
          configurationEvidence.completeVehicleCountEligible,
        projectionScope: configurationEvidence.projectionScope,
      },
    );
    if (configurationEvidence)
      assert.notEqual(projectedConfiguration, configurationEvidence);
    else
      assert.equal(
        Object.hasOwn(slim[i], "configurationEvidence"),
        Object.hasOwn(cars[i], "configurationEvidence"),
      );

    assert.ok(Object.keys(facts).length <= attributes.length + 2);
    for (const { key } of attributes) assert.equal(facts[key], original[key]);
    assert.equal(
      renderToStaticMarkup(createElement(CarAvatar, { car: slim[i] })),
      renderToStaticMarkup(createElement(CarAvatar, { car: cars[i] })),
    );
  }
  assert.ok(
    Buffer.byteLength(JSON.stringify(slim)) <
      Buffer.byteLength(JSON.stringify(cars)),
  );
});

test("all discovery rankings and filters retain identical results with reduced props", () => {
  for (const { key } of attributes) {
    const normalize = (input: typeof cars) => {
      const result = rankAttribute(input, data.sources, key, policy);
      return {
        ...result,
        groups: result.groups.map((group) => ({
          ...group,
          entries: group.entries.map(({ car, ...entry }) => ({
            ...entry,
            carId: car.id,
          })),
        })),
      };
    };
    assert.deepEqual(normalize(slim), normalize(cars), key);
  }
  for (const query of ["", "MG", "IM5", "Model Y", "van", "no match"]) {
    for (const vehicleClass of [
      "",
      "passenger",
      "van",
      "ute",
      "truck",
      "bus",
      "motorcycle",
    ]) {
      for (const stockOnly of [false, true]) {
        const ids = (input: typeof cars) =>
          filterDiscoveryCars(
            input,
            query,
            vehicleClass,
            stockOnly,
            policy,
          ).map((car) => car.id);
        assert.deepEqual(ids(slim), ids(cars));
      }
    }
  }
});

test("curated hero packs preserve all selectable versions while full catalogue stays available", () => {
  const curated = curatedFleetCars(cars);
  const snapshot = { cars, data };
  const packs = curated.map((car) => pack(car.id, snapshot));
  assert.equal(packs.length, curated.length);
  assert.ok(curated.length < cars.length);
  for (const car of cars) {
    const query = new URLSearchParams({
      baseline: car.id,
      cars: car.id,
      fleet: car.id,
      active: car.id,
    });
    assert.deepEqual(
      fleetSelection(cars, query),
      fleetSelection(curated, query),
    );
  }
  assert.equal(catalogue().length, cars.length);
});

test("exact pack sources preserve canonical identity without weakening URL sanitization", () => {
  const snapshot = { cars, data };
  for (const c of curatedFleetCars(cars)) {
    for (const source of pack(c.id, snapshot).sources) {
      const original = data.sources.find((s) => s.id === source.id)!;
      if (source.url === original.url) assert.equal(source, original);
    }
  }
  const changed = structuredClone(data);
  const target = pack(cars[0].id, snapshot).sources[0].id;
  const source = changed.sources.find((s) => s.id === target)!;
  source.url = "javascript:alert(1)";
  const sanitized = pack(cars[0].id, { cars, data: changed }).sources.find(
    (s) => s.id === target,
  )!;
  assert.equal(sanitized.url, "");
  assert.notEqual(sanitized, source);
  assert.equal(source.url, "javascript:alert(1)");
});

test("picker-only boundary omits summaries while preserving selection facts and controls", async () => {
  const { pickerCatalogue } = await import("../src/lib/data");
  const { parseSelection } = await import("../src/lib/compare");
  const pickers = pickerCatalogue();
  assert.equal(pickers.length, cars.length);
  for (let i = 0; i < cars.length; i++) {
    const { buyerSummary, facts, issues, ...identity } = cars[i];
    void buyerSummary;
    void issues;
    assert.deepEqual(pickers[i], {
      ...identity,
      facts: Object.fromEntries(
        ["price_aud", "range_km", "seats"].map((k) => [k, facts[k]]),
      ),
      issues: [],
    });
    const q = new URLSearchParams({
      cars: cars[i].id + "," + cars[(i + 1) % cars.length].id,
    });
    assert.deepEqual(parseSelection(q, pickers), parseSelection(q, cars));
  }
});

test("dynamic comparison scopes sources to full selected packs in canonical order", async () => {
  const { selectedPackSources } = await import("../src/lib/page-props");
  const selected = [
    "byd_atto_3_legacy__essential_fwd__1",
    "geely_ex5__inspire_extended_range__2",
  ].map((id) => pack(id, { cars, data }));
  const scoped = selectedPackSources(selected, data.sources);
  assert.ok(scoped.length < data.sources.length);
  const used = new Set(selected.flatMap((p) => p.sources.map((s) => s.id)));
  assert.equal(scoped.length, used.size);
  assert.deepEqual(
    scoped,
    data.sources.filter((s) => used.has(s.id)),
  );
  for (const s of scoped)
    assert.equal(
      s,
      data.sources.find((x) => x.id === s.id),
    );
  assert.throws(() => selectedPackSources(selected, []), /missing source/);
});

test("public equipment reads observe mutations to supplied research without a stale snapshot index", async () => {
  const { effectiveFeatures } = await import("../src/lib/data");
  const input = structuredClone(data);
  const target = cars.find(
    (c) => c.id === "leapmotor_b05_my26__style__20261010",
  )!;
  const row = input.feature_evidence.find(
    (f) => f.variant_id === target.id && f.criterion === "pet_mode",
  )!;
  const first = effectiveFeatures(target, input).find(
    (f) => f.criterion === "pet_mode",
  )!;
  const position = input.feature_evidence.indexOf(row);
  input.feature_evidence[position] = {
    ...row,
    value: "New exact-row marker",
    conditions: "Changed body scope",
    status: "conditional",
  };
  const second = effectiveFeatures(target, input).find(
    (f) => f.criterion === "pet_mode",
  )!;
  assert.notEqual(first.value, second.value);
  assert.equal(second.value, "New exact-row marker");
  assert.match(second.conditions, /Changed body scope/);
});
