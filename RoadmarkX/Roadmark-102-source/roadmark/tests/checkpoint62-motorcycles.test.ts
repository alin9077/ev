import { carsBeforeCheckpoint82 } from "./helpers/checkpoint82-history";
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { marketBeforeCheckpoint80 } from "./helpers/checkpoint80-history";
import { catalogue, research, pack } from "../src/lib/data";
import { attributes, rankAttribute } from "../src/lib/discovery";
import fixture from "../qa/checkpoint62-motorcycle-fixture.json";
const cars = carsBeforeCheckpoint82(catalogue()),
  data = research();
const selected = fixture.map((row) => cars.find((car) => car.id === row.id)!);
const hash = (v: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex");
test("new motorcycle offers retain exact grade and dealer catalogue identities", () => {
  assert.equal(selected.length, 4);
  assert.ok(selected.every(Boolean));
  assert.deepEqual(
    selected.map((car) => car.year),
    [2026, 2026, 2026, 2026],
  );
  assert.equal(
    selected.filter((car) => car.modelId === "surron_ultra_bee_hp").length,
    3,
  );
  assert.ok(
    selected.every(
      (car) => car.researchStage === "partial" && !car.buyerSummary,
    ),
  );
});
test("all 852 motorcycle Facts and source-bound qualifications match checked runtime candidates", () => {
  assert.equal(
    fixture.reduce((n, row) => n + row.factCount, 0),
    852,
  );
  for (const row of fixture) {
    const car = cars.find((item) => item.id === row.id)!;
    assert.equal(hash(car.facts), row.factsSHA256);
    assert.equal(hash(car.configurationEvidence), row.configurationSHA256);
    assert.equal(hash(car.availabilityEvidence), row.availabilitySHA256);
    const result = pack(car.id, { cars, data });
    for (const id of row.sourceIds)
      assert.deepEqual(
        result.sources.find((source) => source.id === id),
        data.sources.find((source) => source.id === id),
      );
  }
});
test("362 explicit motorcycle unknowns stay null without ranking or closed-build promotion", () => {
  assert.equal(
    fixture.reduce((n, row) => n + row.nullKeys.length, 0),
    362,
  );
  for (const row of fixture) {
    const car = cars.find((item) => item.id === row.id)!;
    for (const key of row.nullKeys) assert.equal(car.facts[key].value, null);
    assert.equal(car.configurationEvidence?.rankingEligible, false);
    assert.equal(
      car.configurationEvidence?.completeVehicleCountEligible,
      false,
    );
    assert.equal(car.availabilityEvidence?.physicalStockVerified, false);
    assert.equal(
      car.availabilityEvidence?.factoryOrderAcceptanceVerified,
      false,
    );
    assert.equal(car.availabilityEvidence?.stockStatus, "unverified");
  }
  for (const attribute of attributes)
    assert.deepEqual(
      rankAttribute(selected, data.sources, attribute.key, {
        asOf: "2026-10-10",
        maxAgeDays: 30,
      }).groups,
      [],
    );
});
test("motorcycle advertised purchase and enquiry routes stay distinct", () => {
  assert.deepEqual(
    fixture.map((row) => row.orderStatus),
    [
      "accepting_orders",
      "accepting_orders",
      "accepting_orders",
      "accepting_order_requests_advertised",
    ],
  );
  const market = marketBeforeCheckpoint80;
  const surron = market.records.find(
    (row: { id: string }) => row.id === "surron-ultra-bee-hp",
  );
  const kawasaki = market.records.find(
    (row: { id: string }) => row.id === "kawasaki-ninja-e1-au-my26",
  );
  assert.ok(surron?.detailedCoverageIds);
  assert.ok(surron.heldImporterPurchaseRoute);
  assert.ok(kawasaki?.detailedCoverageIds);
  assert.equal(surron.detailedCoverageIds.length, 3);
  assert.equal(surron.heldImporterPurchaseRoute.year, 2025);
  assert.deepEqual(surron.trims, ["Ultra Bee HP R", "Ultra Bee HP T"]);
  assert.equal(kawasaki.detailedCoverageIds.length, 1);
  assert.equal(kawasaki.orderStatus, "accepting_order_requests_advertised");
  assert.equal(market.records.length, 239);
  assert.equal(market.counts.namedTrimConfigurationEntries, 391);
  assert.equal(market.counts.byOrderStatus.accepting_orders, 36);
  assert.equal(
    market.counts.byOrderStatus.accepting_order_requests_advertised,
    7,
  );
});
