// Prepared for tests/bus-integration.test.ts after the seven-row candidate is applied.
import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research, pack } from "../src/lib/data";
import { comparisonOverviewKeys, makeReport } from "../src/lib/citable";
import stage from "../data/research-pending/bus-integration-staged-delta.json";
import market from "../data/market-inventory-2026-10-10.json";
const cars = catalogue();
const sourceIds = new Set(research().sources.map((s) => s.id));
const buses = stage.variants.map((v) => {
  const car = cars.find((c) => c.id === v.id);
  assert.ok(car, `Missing integrated bus ${v.id}`);
  return car;
});
const get = (prefix: string) => buses.find((c) => c.id.startsWith(prefix))!;
test("seven bounded bus layouts retain separate identities without option inflation", () => {
  assert.equal(buses.length, 7);
  assert.equal(new Set(buses.map((c) => c.modelFamily)).size, 7);
  assert.ok(buses.every((c) => c.vehicleClass === "bus" && c.year === null));
  for (const c of buses) {
    assert.equal(c.facts.seats.value, null);
    assert.equal(c.availabilityEvidence?.orderStatus, "listed_unconfirmed");
    assert.equal(c.availabilityEvidence?.stockStatus, "unverified");
  }
  assert.ok(!buses.some((c) => /fleetmaster|citirider|u18/i.test(c.id)));
});
test("all 383 bus facts preserve staged values, status and source boundaries", () => {
  assert.equal(stage.facts.length, 383);
  for (const row of stage.facts) {
    const c = buses.find((c) => c.id === row.variantId)!;
    const f = c.facts[row.key];
    assert.ok(f, `${row.variantId}:${row.key}`);
    assert.deepEqual(f.value, row.value);
    assert.equal(f.status, row.status);
    assert.notEqual(f.status, "standard");
    assert.deepEqual(f.sourceIds, row.sourceIds);
    assert.ok(f.sourceIds.every((id) => sourceIds.has(id)));
    for (const q of row.qualifications) assert.ok(f.qualifications.includes(q));
  }
});
test("seated passengers, standees and driver are never summed into generic seats", () => {
  for (const [prefix, seated, standing, driver] of [
    ["yutong_d7e_", 28, 0, 1],
    ["yutong_e7s_", 16, 8, 1],
    ["yutong_c12e_", 57, 0, 1],
    ["yutong_e12_", 44, 20, 1],
    ["bci_classmaster_", 57, null, null],
    ["bci_mini_bus_", null, null, null],
    ["bci_proma_", 28, null, null],
  ] as const) {
    const c = get(prefix);
    assert.equal(c.facts.seated_passengers.value, seated);
    assert.equal(c.facts.standing_passengers.value, standing);
    assert.equal(c.facts.driver_seats.value, driver);
    assert.equal(c.facts.seats.value, null);
  }
  assert.ok(!comparisonOverviewKeys(buses).includes("seats"));
  const report = makeReport([pack(get("yutong_e7s_").id)], "/test-bus");
  assert.ok(report.keyFacts.some((f) => f.key === "seated_passengers"));
  assert.ok(report.keyFacts.some((f) => f.key === "standing_passengers"));
  assert.ok(report.keyFacts.some((f) => f.key === "driver_seats"));
  assert.ok(!report.keyFacts.some((f) => f.key === "seats"));
});
test("bus malformed battery units and conflicting build data remain held", () => {
  assert.equal(get("yutong_e12_").facts.battery_kwh.value, null);
  for (const c of buses.filter((c) => c.brand === "BCI")) {
    assert.equal(c.facts.battery_kwh.value, null);
  }
  const mini = get("bci_mini_bus_");
  assert.equal(mini.facts.width_mm.value, null);
  assert.match(mini.trim, /driver inclusion and powertrain unresolved/);
  for (const c of buses) {
    for (const key of [
      "range_km",
      "price_aud",
      "dc_peak_kw",
      "ac_kw",
      "battery_gross_kwh",
      "battery_usable_kwh",
      "completed_vehicle_payload_kg",
      "boot_l",
      "towing_braked_kg",
      "towing_unbraked_kg",
    ]) {
      assert.equal(c.facts[key]?.value, null, `${c.id}:${key}`);
    }
  }
});
test("bus market records agree with exact listed-only detail and retain audit history", () => {
  for (const c of buses) {
    const m = market.records.find((r) => r.id === c.modelFamily)!;
    assert.ok(m, c.modelFamily);
    assert.equal(m.orderStatus, "listed_unconfirmed");
    assert.equal(m.stockStatus, "unverified");
    assert.equal(m.rankingEligible, false);
    assert.ok(
      (m as { catalogueVariantIds?: string[] }).catalogueVariantIds?.includes(
        c.id,
      ),
    );
    assert.ok(m.evidenceHistory?.length);
  }
});

test("bus overview explanations stay concise while full source qualifications remain", () => {
  for (const car of buses) {
    for (const key of comparisonOverviewKeys([car])) {
      const f = car.facts[key];
      if (f?.status !== "conditional") continue;
      assert.ok(typeof f.conditionExplanation === "string");
      assert.ok(
        f.conditionExplanation.startsWith(
          "Published for this bus body and layout; confirm the exact delivered build.",
        ),
      );
      assert.ok(f.conditionExplanation.length < 500, `${car.id}:${key}`);
      assert.ok(!f.conditionExplanation.includes("source_declaration_only"));
      const staged = stage.facts.find(
        (r) => r.variantId === car.id && r.key === key,
      )!;
      assert.deepEqual(f.qualifications, staged.qualifications);
      assert.ok(f.qualifications.some((q) => q.startsWith("sourceId:")));
    }
  }
});
