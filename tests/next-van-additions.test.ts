import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research, pack } from "../src/lib/data";
import { rankAttribute } from "../src/lib/discovery";
const cars = catalogue().filter((c) =>
  ["eDeliver 5", "SuperVAN", "eVito"].includes(c.model),
);
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
test("eight current van configurations preserve unverified formal model years and seating", () => {
  assert.equal(cars.length, 8);
  assert.ok(
    cars.every(
      (c) => c.vehicleClass === "van" && String(c.year).includes("unverified"),
    ),
  );
  assert.ok(
    cars
      .filter((c) => c.model !== "eDeliver 5")
      .every((c) => c.facts.seats.value === null),
  );
  assert.ok(
    cars
      .filter((c) => c.model === "eDeliver 5")
      .every((c) => c.facts.seats.value === 3),
  );
  assert.equal(
    cars.filter(
      (c) => c.availabilityEvidence?.stockStatus === "new_stock_listed",
    ).length,
    3,
  );
  assert.ok(cars.every((c) => c.availabilityEvidence?.qualifications?.length));
});
test("Farizon charging conflicts and body-specific battery chemistry do not inherit defaults", () => {
  const farizon = cars.filter((c) => c.brand === "Farizon");
  assert.equal(farizon.length, 4);
  const long = farizon.find((c) => c.trim === "SLWB High Roof")!;
  assert.equal(long.facts.battery_kwh.value, 106);
  assert.equal(long.facts.dc_peak_kw.value, 120);
  assert.match(
    pack(long.id).features.find((f) => f.criterion === "battery_chemistry")!
      .value,
    /NMC/,
  );
  assert.ok(
    farizon
      .filter((c) => c !== long)
      .every((c) =>
        /LFP/.test(
          pack(c.id).features.find((f) => f.criterion === "battery_chemistry")!
            .value,
        ),
      ),
  );
  assert.ok(
    farizon
      .filter((c) => c !== long)
      .every(
        (c) =>
          c.facts.battery_kwh.value === 83 && c.facts.dc_peak_kw.value === 140,
      ),
  );
  assert.ok(
    farizon.every(
      (c) =>
        c.facts.dc_charge_time_min.value === null &&
        c.facts.dc_20_80_brochure_min.status === "conditional",
    ),
  );
  assert.ok(farizon.every((c) => c.facts.width_mm.status === "conditional"));
});
test("NEDC eVito, van cargo and unknown towing remain separate from WLTP and passenger claims", () => {
  const vito = cars.find((c) => c.model === "eVito")!;
  assert.equal(vito.facts.range_km.basis, "NEDC combined");
  assert.equal(vito.facts.range_km.value, 283);
  assert.equal(vito.facts.battery_kwh.basis, "Usable battery capacity");
  assert.equal(vito.facts.towing_braked_kg.value, null);
  assert.equal(vito.facts.height_mm.value, null);
  const ranks = rankAttribute(
    catalogue(),
    research().sources,
    "range_km",
    policy,
  );
  const group = ranks.groups.find((g) =>
    g.entries.some((e) => e.car.id === vito.id),
  )!;
  assert.equal(group.vehicleClass, "van");
  assert.equal(group.basis, "NEDC combined");
  assert.ok(!group.entries.some((e) => e.car.brand === "Farizon"));
  for (const c of cars) {
    assert.equal(c.facts.boot_l.value, null);
    assert.notEqual(c.facts.cargo_volume_m3.status, "standard");
    assert.equal(c.facts.price_aud.value, null);
    const ids = new Set(pack(c.id).sources.map((s) => s.id));
    assert.ok(c.availabilityEvidence!.sourceIds.every((id) => ids.has(id)));
  }
});
