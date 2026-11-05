// Admission behaviour is checked against the immutable source layer.
// Dated M1 overlays have separate current-catalogue safety coverage.
import test from "node:test";
import assert from "node:assert/strict";
import {
  sourceCatalogue as catalogue,
  sourceResearch as research,
  sourceEffectiveFeatures as effectiveFeatures,
} from "../src/lib/data";
import { formatFact } from "../src/lib/compare";
const cars = catalogue().filter((c) =>
  /^(mg_mgs[56]_current|mg_cyberster_current|im_im[56]_my25)/.test(c.modelId),
);
const find = (prefix: string, trim: string) =>
  cars.find((c) => c.modelId === prefix && c.trim === trim)!;
test("twelve current MG/IM configurations retain independent MY and exact-stock evidence", () => {
  assert.equal(cars.length, 12);
  assert.equal(cars.filter((c) => c.year === null).length, 4);
  assert.equal(
    cars.filter(
      (c) => c.availabilityEvidence?.stockStatus === "new_stock_listed",
    ).length,
    7,
  );
  assert.ok(cars.every((c) => c.facts.price_aud.value === null));
  assert.ok(
    cars
      .filter((c) => c.modelId.startsWith("im_"))
      .every((c) => c.year === 2025),
  );
  assert.equal(
    find("im_im5_my25", "Performance AWD").availabilityEvidence?.stockStatus,
    "unverified",
  );
  assert.ok(
    cars
      .filter((c) => c.modelId.startsWith("mg_"))
      .every((c) => c.facts.seats.value === null),
  );
});
test("MG/IM charge windows, unspecified battery basis and conflicting MGS6 facts remain guarded", () => {
  for (const c of cars) {
    assert.match(
      c.facts.dc_charge_time_min.comparisonBasis,
      c.modelId === "mg_mgs6_current" ? /10–80/ : /30–80/,
    );
    assert.equal(c.facts.dc_charge_time_min.status, "conditional");
    assert.equal(c.facts.battery_usable_kwh.value, null);
    assert.equal(c.facts.range_km.status, "conditional");
    assert.equal(c.facts.boot_l.status, "conditional");
  }
  const rwd = find("mg_mgs6_current", "Essence RWD");
  assert.equal(rwd.facts.zero_to_100_s.value, null);
  assert.equal(rwd.facts.frunk_l.value, null);
  assert.equal(find("mg_mgs6_current", "Essence AWD").facts.frunk_l.value, 67);
});
test("IM AWD motor components are never summed into a fabricated system rating", () => {
  for (const model of ["im_im5_my25", "im_im6_my25"]) {
    const c = find(model, "Performance AWD");
    assert.equal(c.facts.power_kw.value, null);
    assert.equal(c.facts.torque_nm.value, null);
    assert.deepEqual(c.facts.motor_power_components_kw.value, {
      front: 200,
      rear: 372,
    });
    assert.match(
      formatFact(c.facts.motor_power_components_kw),
      /front: 200; rear: 372/,
    );
    assert.ok(!formatFact(c.facts.motor_power_components_kw).includes("572"));
  }
});
test("MY-conflicted equipment stays conditional and no unsupported warranty is inherited", () => {
  const d = research();
  const im5Ventilation = effectiveFeatures(
    find("im_im5_my25", "Premium RWD"),
    d,
  ).find((f) => f.criterion === "front_ventilated_seats")!;
  const im6Ventilation = effectiveFeatures(
    find("im_im6_my25", "Performance AWD"),
    d,
  ).find((f) => f.criterion === "front_ventilated_seats")!;
  assert.match(im5Ventilation.conditions, /ventilation is backrest-only/);
  assert.match(
    im6Ventilation.conditions,
    /ventilation cover both cushion and backrest/,
  );
  for (const c of cars) {
    assert.equal(c.facts.warranty.value, null);
    assert.equal(c.facts.battery_warranty.value, null);
    if (c.year === null)
      assert.equal(
        effectiveFeatures(c, d).find(
          (f) => f.criterion === "front_heated_seats",
        )?.status,
        "conditional",
      );
  }
});

test("Cyberster separately attributed charge windows and IM6 offer identity conflict stay separate", () => {
  const awd = find("mg_cyberster_current", "77kWh AWD");
  const rwd = find("mg_cyberster_current", "77kWh RWD");
  assert.equal(awd.facts.dc_charge_time_min.value, 34);
  assert.equal(awd.facts.dc_charge_10_80_min.value, 40);
  assert.equal(awd.facts.dc_test_station_kw.value, 150);
  assert.equal(awd.facts.dc_peak_kw.value, 144);
  assert.equal(rwd.facts.dc_charge_10_80_min, undefined);
  assert.match(rwd.facts.boot_l.comparisonBasis, /boundary.*unverified/);
  const im6 = find("im_im6_my25", "Performance AWD");
  assert.equal(im6.facts.advertised_driveaway_aud.value, null);
  assert.equal(
    im6.facts.attributed_configurator_offer_aud.status,
    "conditional",
  );
  assert.match(
    im6.facts.attributed_configurator_offer_aud.qualifications.join(" "),
    /driveTrain:RWD/,
  );
});
