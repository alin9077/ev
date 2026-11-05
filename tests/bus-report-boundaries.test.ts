import test from "node:test";
import assert from "node:assert/strict";
import { pack } from "../src/lib/data";
import { BASELINE } from "../src/lib/config";
import {
  keyMeasurementsFor,
  comparisonOverviewKeys,
  makeReport,
} from "../src/lib/citable";
import type { Fact } from "../src/lib/types";
function fixture() {
  const p = structuredClone(pack(BASELINE));
  p.car.vehicleClass = "bus";
  for (const [key, value] of Object.entries({
    seated_passengers: 28,
    standing_passengers: 0,
    driver_seats: 1,
    length_mm: 7730,
    gvm_kg: 9350,
    battery_kwh: 175,
  })) {
    p.car.facts[key] = {
      ...p.car.facts.seats,
      key,
      label: key.replaceAll("_", " "),
      value,
      status: "conditional",
      basis: "Test fixture: separate published bus layout declarations",
      qualifications: [
        "Seated and standing passengers exclude the separate driver; no summed passenger-car seat count.",
      ],
      unit:
        key.endsWith("passengers") || key === "driver_seats"
          ? "people"
          : key.endsWith("mm")
            ? "mm"
            : key.endsWith("kg")
              ? "kg"
              : "kWh",
    } as Fact;
  }
  p.car.facts.seats.value = null;
  return p;
}
test("bus primary reports keep seated passengers, standing and driver declarations separate", () => {
  const p = fixture();
  const keys = keyMeasurementsFor(p.car);
  assert.deepEqual(keys, [
    "seated_passengers",
    "standing_passengers",
    "driver_seats",
    "length_mm",
    "gvm_kg",
    "battery_kwh",
    "warranty",
  ]);
  assert.ok(!keys.includes("seats"));
  assert.ok(!keys.includes("boot_l"));
  const report = makeReport([p], "/test-bus");
  assert.equal(report.keyFacts.length, 7);
  const standing = report.keyFacts.find(
    (f) => f.key === "standing_passengers",
  )!;
  assert.equal(standing.value, "0 people");
  assert.ok(standing.qualifications.some((q) => q.includes("separate driver")));
});
test("bus-only overviews never insert a generic summed seat row", () => {
  const p = fixture();
  assert.ok(!comparisonOverviewKeys([p.car]).includes("seats"));
  const passenger = pack(BASELINE).car;
  const mixed = comparisonOverviewKeys([passenger, p.car]);
  assert.ok(mixed.includes("seats"));
  assert.ok(mixed.includes("seated_passengers"));
  assert.equal(p.car.facts.seats.value, null);
});
