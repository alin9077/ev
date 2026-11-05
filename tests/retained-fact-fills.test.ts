import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { decideRetainedFactGrade } from "../src/lib/evidence-regrade-policy";
import {
  applyRetainedFactFills,
  retainedFactSnapshot,
  type RetainedFactFill,
} from "../src/lib/retained-fact-fills";
import type { Car, Fact, Source } from "../src/lib/types";

test("a provisional AWD output cannot borrow confirmation from a FWD-only maker brochure", () => {
  const registry = JSON.parse(
    readFileSync("data/m1-retained-fact-fills-2026-10-13.json", "utf8"),
  );
  const row = (registry.rows as RetainedFactFill[]).find(
    (r) =>
      r.variantId === "kia_ev3__gt_line_awd_long_range__5" &&
      r.key === "power_kw",
  )!;
  assert.ok(row);
  assert.equal(row.fact.value, 195);
  assert.equal(row.fact.resolvedElsewhere, true);
  assert.ok(!row.fact.sourceIds.includes("kia_ev3_spec"));
  const original = JSON.parse(
    readFileSync("data/au_ev_all_variants_2026-10-06.json", "utf8"),
  );
  const sources = new Map<string, Source>(
    (original.sources as Source[]).map((s) => [s.id, s]),
  );
  assert.equal(decideRetainedFactGrade(row.fact, sources)?.grade, "reported");
});

function fixture() {
  const source: Source = {
    id: "maker",
    url: "https://maker.example/au/specification",
    title: "Australian specification",
    publisher: "Maker",
    source_type: "manufacturer",
    market: "AU",
    accessed_date: "2026-10-10",
    published_date: null,
    supports: "Exact grade usable battery",
  };
  const usable: Fact = {
    key: "battery_usable_kwh",
    value: 62,
    label: "Usable battery",
    unit: "kWh",
    basis: "Explicit usable capacity",
    comparisonBasis: "Usable capacity",
    status: "standard",
    sourceIds: [source.id],
    date: "2026-10-10",
    market: "AU",
    scope: "Maker Car Base",
    qualifications: [],
    issues: [],
  };
  const missing: Fact = {
    ...usable,
    key: "battery_kwh",
    value: null,
    status: "not_verified",
  };
  const car: Car = {
    id: "maker_car_base",
    brand: "Maker",
    model: "Car",
    trim: "Base",
    modelId: "maker_car",
    family: "maker-car",
    slug: "base",
    generation: "Current",
    year: null,
    drive: "RWD",
    availability: "current_or_order_listed",
    vehicleClass: "passenger",
    issues: [],
    facts: { battery_kwh: missing, battery_usable_kwh: usable },
  };
  const row: RetainedFactFill = {
    variantId: car.id,
    brand: car.brand,
    model: car.model,
    trim: car.trim,
    key: "battery_kwh",
    before: retainedFactSnapshot(missing),
    kind: "same-version-alias",
    reason: "Expose retained usable measurement",
    evidenceLocation: "Exact version usable battery fact",
    sources: [
      { id: source.id, url: source.url, snapshot: structuredClone(source) },
    ],
    supportingFact: { key: usable.key, before: retainedFactSnapshot(usable)! },
    fact: { ...usable, key: "battery_kwh", label: "Battery capacity" },
  };
  return { car, source, row };
}
test("retained aliases fill missing core cells without changing original facts, dates or other versions", () => {
  const { car, source, row } = fixture();
  const original = structuredClone(car);
  const other = { ...structuredClone(car), id: "other", trim: "Other" };
  const result = applyRetainedFactFills([car, other], [source], [row]);
  assert.equal(result[0].facts.battery_kwh.value, 62);
  assert.equal(result[0].facts.battery_kwh.basis, "Explicit usable capacity");
  assert.equal(result[0].facts.battery_kwh.date, "2026-10-10");
  assert.equal(result[1], other);
  assert.deepEqual(car, original);
  assert.deepEqual(applyRetainedFactFills(result, [source], [row]), result);
  result[0].facts.battery_kwh.sourceIds.push("changed");
  assert.deepEqual(row.fact.sourceIds, ["maker"]);
});
test("version identity and same-version supporting measurements prevent cross-trim aliasing", () => {
  const { car, source, row } = fixture();
  assert.throws(
    () =>
      applyRetainedFactFills(
        [{ ...car, trim: "Performance" }],
        [source],
        [row],
      ),
    /changed version/,
  );
  const changed = structuredClone(car);
  changed.facts.battery_usable_kwh.value = 94;
  assert.throws(
    () => applyRetainedFactFills([changed], [source], [row]),
    /source fact changed/,
  );
});
test("retained fills reject stale before snapshots, unknown sources and redated aliases", () => {
  const { car, source, row } = fixture();
  const filled = structuredClone(car);
  filled.facts.battery_kwh.value = 60;
  assert.throws(
    () => applyRetainedFactFills([filled], [source], [row]),
    /before snapshot changed/,
  );
  assert.throws(
    () => applyRetainedFactFills([car], [], [row]),
    /source is missing/,
  );
  assert.throws(
    () =>
      applyRetainedFactFills(
        [car],
        [{ ...source, url: "https://maker.example/global" }],
        [row],
      ),
    /source is missing or changed/,
  );
  const redated = structuredClone(row);
  redated.fact.date = "2026-10-13";
  assert.throws(
    () => applyRetainedFactFills([car], [source], [redated]),
    /observation date/,
  );
});
test("brand inheritance stays explicit and limited to warranty cells", () => {
  const { car, source, row } = fixture();
  const brandRow: RetainedFactFill = {
    ...row,
    key: "warranty",
    before: null,
    kind: "brand-warranty",
    supportingFact: undefined,
    fact: {
      ...row.fact,
      key: "warranty",
      value: "5 years / unlimited km",
      unit: "",
    },
  };
  const result = applyRetainedFactFills([car], [source], [brandRow]);
  assert.equal(result[0].facts.warranty.value, "5 years / unlimited km");
  assert.equal(car.facts.warranty, undefined);
  assert.throws(
    () =>
      applyRetainedFactFills(
        [car],
        [source],
        [{ ...row, kind: "brand-warranty" }],
      ),
    /not a warranty/,
  );
});
test("units, market, publication holds and duplicate sources invalidate a retained admission", () => {
  const { car, source, row } = fixture();
  const changedUnit = structuredClone(car);
  changedUnit.facts.battery_usable_kwh.unit = "Wh";
  assert.throws(
    () => applyRetainedFactFills([changedUnit], [source], [row]),
    /source fact changed/,
  );
  for (const changed of [
    { ...source, market: "UK" },
    { ...source, publication_hold: true },
  ]) {
    assert.throws(
      () => applyRetainedFactFills([car], [changed], [row]),
      /source is missing or changed/,
    );
  }
  assert.throws(
    () => applyRetainedFactFills([car], [source, source], [row]),
    /source is missing or changed/,
  );
});
test("conditional launch-control output and charger conditions survive admission", () => {
  const { car, source, row } = fixture();
  const launch: RetainedFactFill = {
    ...row,
    key: "zero_to_100_s",
    before: null,
    kind: "retained-packet",
    supportingFact: undefined,
    fact: {
      ...row.fact,
      key: "zero_to_100_s",
      value: 3.6,
      unit: "s",
      status: "conditional",
      basis: "Launch Control",
      comparisonBasis: "Launch Control",
      conditionExplanation: "Velocity Max and Launch Control required",
      qualifications: ["Velocity Max and Launch Control required"],
    },
  };
  const fact = applyRetainedFactFills([car], [source], [launch])[0].facts
    .zero_to_100_s;
  assert.equal(fact.status, "conditional");
  assert.equal(
    fact.conditionExplanation,
    "Velocity Max and Launch Control required",
  );
  assert.deepEqual(fact.qualifications, [
    "Velocity Max and Launch Control required",
  ]);
});
