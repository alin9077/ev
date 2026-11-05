// Admission behaviour is checked against the immutable source layer.
// Dated M1 overlays have separate current-catalogue safety coverage.
import test from "node:test";
import assert from "node:assert/strict";
import {
  sourceCatalogue as catalogue,
  sourceResearch as research,
} from "../src/lib/data";
import { rankAttribute } from "../src/lib/discovery";
const cars = catalogue().filter((c) => c.model === "EV6" || c.model === "EV9");
test("Kia keeps eight exact current configurations and model-year price uncertainty", () => {
  assert.equal(cars.length, 8);
  for (const c of cars) {
    assert.equal(c.year, c.model === "EV6" ? 2027 : 2026);
    assert.equal(c.facts.price_aud.value, null);
    assert.equal(c.facts.configurator_rrp_aud.status, "conditional");
    assert.equal(c.facts.driveaway_price_aud.status, "conditional");
    assert.equal(c.facts.dc_peak_kw.value, null);
    assert.equal(c.availabilityEvidence?.orderStatus, "listed_unconfirmed");
  }
  assert.equal(
    cars.filter(
      (c) => c.availabilityEvidence?.stockStatus === "new_stock_listed",
    ).length,
    6,
  );
});
test("EV9 six-seat GT cannot inherit seven-seat cargo or uncorroborated towing rank", () => {
  const gt = cars.find((c) => c.model === "EV9" && c.trim === "GT AWD")!;
  assert.equal(gt.facts.seats.value, 6);
  assert.equal(gt.facts.boot_l.value, null);
  assert.equal(gt.facts.max_total_cargo_l.value, 2393);
  assert.equal(gt.facts.max_total_cargo_l.status, "conditional");
  assert.equal(gt.facts.towing_braked_kg.status, "conditional");
  const towing = rankAttribute(cars, research().sources, "towing_braked_kg", {
    asOf: "2026-10-10",
    maxAgeDays: 30,
  });
  assert.ok(
    towing.groups
      .flatMap((g) => g.entries)
      .some((e) => e.car.model === "EV9" && e.car.trim === "Earth AWD"),
  );
  assert.ok(
    !towing.groups.flatMap((g) => g.entries).some((e) => e.car.id === gt.id),
  );
});
test("EV9 Earth conflicting mass and acceleration remain unknown", () => {
  const earth = cars.find((c) => c.model === "EV9" && c.trim === "Earth AWD")!;
  for (const key of ["kerb_weight_kg", "tare_weight_kg", "zero_to_100_s"])
    assert.equal(earth.facts[key].value, null);
  assert.ok(!earth.facts.range_km.sourceIds.includes("r10_kia_ev9_spec"));
  assert.ok(earth.facts.range_km.sourceIds.includes("r10_kia_ev9_page"));
});

test("Kia warranty follows model year and price caveats do not cite an unrelated brochure", () => {
  for (const c of cars) {
    assert.equal(
      c.facts.battery_warranty.value,
      c.model === "EV6" ? "8 years / 160,000 km" : "7 years / 150,000 km",
    );
    assert.ok(
      !c.facts.price_aud.qualifications.some((q) =>
        q.includes("brochure footer"),
      ),
    );
  }
  const gt = cars.find((c) => c.model === "EV9" && c.trim === "GT AWD")!;
  assert.match(gt.facts.boot_l.basis, /Six-seat/);
  assert.doesNotMatch(gt.facts.boot_l.basis, /7 seats/);
});
