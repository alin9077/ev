import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research, pack } from "../src/lib/data";
import { rankAttribute } from "../src/lib/discovery";
const cars = catalogue().filter(
  (c) => c.brand === "LDV" && c.model !== "eDeliver 5",
);
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
test("five exact LDV van versions retain body, battery and model-year identities", () => {
  assert.equal(cars.length, 5);
  assert.ok(
    cars.every((c) => c.vehicleClass === "van" && c.facts.seats.value === 3),
  );
  assert.equal(cars.filter((c) => c.model === "eDeliver 7").length, 4);
  const nine = cars.find((c) => c.model === "eDeliver 9")!;
  assert.equal(nine.trim, "LWB High Roof");
  assert.match(String(nine.year), /unverified/);
  assert.equal(nine.facts.battery_warranty_km.value, 160000);
  assert.ok(
    cars
      .filter((c) => c.model === "eDeliver 7")
      .every((c) => c.facts.battery_warranty_km.value === 250000),
  );
});
test("LDV stock and incomplete 88 kWh low-roof specifications fail closed", () => {
  assert.equal(
    cars.filter(
      (c) => c.availabilityEvidence?.stockStatus === "new_stock_listed",
    ).length,
    2,
  );
  const low77 = cars.find((c) => c.trim === "LWB Low Roof 77 kWh")!;
  assert.equal(low77.availabilityEvidence?.stockStatus, "unverified");
  const low88 = cars.find((c) => c.trim === "LWB Low Roof 88 kWh")!;
  assert.equal(low88.facts.range_km.value, 362);
  assert.equal(low88.facts.length_mm.value, null);
  assert.equal(low88.facts.payload_kg.value, null);
  assert.ok(cars.every((c) => c.facts.price_aud.value === null));
});
test("commercial cargo and 20–80 percent charging do not enter incompatible ranks", () => {
  for (const c of cars) {
    assert.equal(c.facts.boot_l.value, null);
    assert.notEqual(c.facts.cargo_volume_m3.status, "standard");
    assert.match(c.facts.dc_charge_time_min.basis, /20–80/);
    assert.notEqual(c.facts.dc_charge_time_min.status, "standard");
    assert.equal(c.facts.dc_peak_kw.value, null);
    const sourceIds = new Set(pack(c.id).sources.map((s) => s.id));
    assert.ok(
      Object.values(c.facts).every((f) =>
        f.sourceIds.every((id) => sourceIds.has(id)),
      ),
    );
  }
  const ranked = rankAttribute(
    catalogue(),
    research().sources,
    "range_km",
    policy,
  );
  assert.ok(
    ranked.groups
      .filter((g) => g.entries.some((e) => e.car.brand === "LDV"))
      .every((g) => g.vehicleClass === "van"),
  );
});
