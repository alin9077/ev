import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { catalogue, pack, research } from "../src/lib/data";
import { attributes, rankAttribute } from "../src/lib/discovery";
import fixture from "../qa/jeep-ora-integration-fixture.json";

const cars = catalogue();
const data = research();
const selected = fixture.map((row) => cars.find((car) => car.id === row.id)!);
const jeep = selected.find((car) => car.modelId === "jeep_avenger")!;
const ora = selected.filter((car) => car.modelId === "gwm_ora5_suv");
const hash = (value: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("Jeep residual Longitude and ORA SUV grades keep distinct exact catalogue scopes", () => {
  assert.equal(selected.length, 3);
  assert.equal(jeep.year, 2024);
  assert.equal(jeep.availability, "outgoing");
  assert.equal(jeep.trim, "Longitude");
  assert.equal(jeep.buyerSummary, undefined);
  assert.deepEqual(
    ora.map((car) => car.trim),
    ["Lux", "Ultra"],
  );
  assert.ok(ora.every((car) => car.year === null && car.buyerSummary));
  assert.ok(selected.every((car) => car.researchStage === "partial"));
});

test("all Jeep and ORA Facts, copy and context sources survive their checked binding", () => {
  for (const row of fixture) {
    const car = cars.find((item) => item.id === row.id)!;
    assert.equal(hash(car.facts), row.factsSHA256);
    assert.equal(hash(car.configurationEvidence), row.configurationSHA256);
    assert.deepEqual(car.buyerSummary?.strength ?? null, row.strength);
    assert.deepEqual(car.buyerSummary?.tradeoff ?? null, row.tradeoff);
    assert.deepEqual(car.buyerSummary?.conditions ?? [], row.conditions);
    const packed = pack(car.id, { cars, data });
    for (const id of row.sourceIds) {
      const source = data.sources.find((item) => item.id === id);
      assert.ok(source);
      assert.deepEqual(
        packed.sources.find((item) => item.id === id),
        source,
      );
    }
  }
});

test("117 explicit unknowns and availability boundaries prevent unsupported leaders", () => {
  assert.equal(
    fixture.reduce((total, row) => total + row.nullKeys.length, 0),
    117,
  );
  for (const row of fixture) {
    const car = cars.find((item) => item.id === row.id)!;
    for (const key of row.nullKeys)
      assert.equal(car.facts[key].value, null, key);
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

test("Jeep range discrepancy and charging window never become compatible measurements", () => {
  assert.equal(jeep.facts.range_km.value, 396);
  assert.match(jeep.facts.range_km.qualifications.join(" "), /390/);
  assert.equal(jeep.facts.battery_gross_kwh.value, 54);
  assert.equal(jeep.facts.battery_usable_kwh.value, null);
  assert.equal(jeep.facts.dc_charge_time_min.value, 24);
  assert.match(jeep.facts.dc_charge_time_min.basis, /20–80%/);
  assert.equal(jeep.facts.dc_peak_kw.value, null);
});

test("ORA preserves WLTC and charger-rated time without inventing vehicle peak", () => {
  for (const car of ora) {
    assert.equal(car.facts.range_km.value, 435);
    assert.match(JSON.stringify(car.facts.range_km), /WLTC/);
    assert.equal(car.facts.dc_charge_time_min.value, 30);
    assert.equal(car.facts.dc_peak_kw.value, null);
    assert.equal(car.facts.battery_gross_kwh.value, null);
    assert.equal(car.facts.battery_usable_kwh.value, null);
    assert.match(car.buyerSummary!.conditions.join(" "), /120 kW|120kW/);
  }
});

test("market preserves historical Jeep and active hatch while admitting only three named configurations", () => {
  const market = JSON.parse(
    fs.readFileSync("data/market-inventory-2026-10-10.json", "utf8"),
  ) as {
    records: {
      id: string;
      trims: string[];
      stockStatus: string;
      orderStatus: string;
    }[];
    unverifiedLeads: {
      id: string;
      resolutionStatus: string;
      trims: string[];
    }[];
    reconciledLeads: {
      id: string;
      countsAsAdditionalFamily?: boolean;
      countsAsNamedConfiguration?: boolean;
    }[];
  };
  assert.deepEqual(
    market.records.find((row) => row.id === "jeep-avenger")!.trims,
    ["Longitude"],
  );
  assert.deepEqual(
    market.records.find((row) => row.id === "gwm-ora5-suv")!.trims,
    ["Lux", "Ultra"],
  );
  assert.ok(!market.unverifiedLeads.some((row) => row.id === "jeep-avenger"));
  const history = market.reconciledLeads.filter(
    (row) => row.id === "jeep-avenger",
  );
  assert.equal(history.length, 1);
  assert.equal(history[0].countsAsAdditionalFamily, false);
  assert.equal(history[0].countsAsNamedConfiguration, false);
  const hatch = market.unverifiedLeads.find(
    (row) => row.id === "gwm-ora-ora-5",
  )!;
  assert.equal(
    hatch.resolutionStatus,
    "partially_reconciled_residual_hatch_unresolved",
  );
  assert.deepEqual(hatch.trims, []);
  for (const id of ["jeep-avenger", "gwm-ora5-suv"]) {
    const rows = market.records.filter((row) => row.id === id);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].stockStatus, "unverified");
    assert.equal(rows[0].orderStatus, "listed_unconfirmed");
  }
});

test("complete vehicle packs retain attached Issue citations and reject missing sources", () => {
  for (const car of selected) {
    const packed = pack(car.id, { cars, data });
    for (const fact of Object.values(car.facts))
      for (const issue of fact.issues)
        for (const id of issue.source_ids) {
          const canonical = data.sources.find((source) => source.id === id);
          assert.ok(canonical, id);
          assert.deepEqual(
            packed.sources.find((source) => source.id === id),
            canonical,
          );
        }
  }
  const changed = structuredClone(jeep);
  changed.facts.range_km.issues.push({
    issue_id: "PACK-ONLY-ISSUE",
    title: "Unknown citation",
    priority: "low",
    model_ids: [jeep.modelId],
    publication_action: "Keep qualified",
    source_ids: ["pack-issue-only-source"],
  });
  const altered = cars.map((car) => (car.id === changed.id ? changed : car));
  assert.throws(
    () => pack(changed.id, { cars: altered, data }),
    /Pack evidence references missing source pack-issue-only-source/,
  );
  const source = { ...data.sources[0], id: "pack-issue-only-source" };
  const packed = pack(changed.id, {
    cars: altered,
    data: { ...data, sources: [...data.sources, source] },
  });
  assert.equal(
    packed.sources.find((item) => item.id === source.id),
    source,
  );
});
