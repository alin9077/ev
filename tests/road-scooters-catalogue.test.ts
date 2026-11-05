import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research, pack, effectiveFeatures } from "../src/lib/data";
import { rankAttribute } from "../src/lib/discovery";
import evidence from "../data/segway-zeeho-road-scooters-evidence.json";
import mapping from "../qa/road-scooter-integrated-ids.json";
import fieldMap from "../qa/road-scooter-field-map.json";
import checks from "../qa/road-scooter-integration-checks.json";
import market from "../data/market-inventory-2026-10-10.json";
const data = research();
const cars = catalogue();
const scooter = (sourceId: keyof typeof mapping) =>
  cars.find((car) => car.id === mapping[sourceId])!;
const added = Object.keys(mapping).map((id) =>
  scooter(id as keyof typeof mapping),
);

test("five standard road-scooter configurations keep optional packs and unknown approvals separate", () => {
  assert.equal(added.length, 5);
  assert.equal(new Set(added.map((car) => car.family)).size, 5);
  for (const car of added) {
    assert.equal(car.vehicleClass, "motorcycle");
    assert.equal(car.year ?? null, null);
    assert.equal(car.facts.seats.value, null);
    assert.equal(car.availability, "current_or_order_listed");
    assert.equal(car.availabilityEvidence?.stockStatus, "new_stock_listed");
    assert.equal(
      car.availabilityEvidence?.orderStatus,
      "accepting_order_requests_advertised",
    );
    assert.match(
      car.availabilityEvidence!.qualifications!.join(" "),
      /not inspected physical stock/,
    );
    for (const key of [
      "battery_gross_kwh",
      "battery_usable_kwh",
      "approved_seat_count",
      "pillion_approval",
      "adr_approval_number",
      "ac_kw",
      "dc_peak_kw",
      "dc_10_80_min",
      "payload_kg",
    ])
      assert.equal(car.facts[key].value, null, `${car.id}:${key}`);
  }
  assert.equal(
    cars.some((car) => /segway.*e110s/i.test(car.id)),
    false,
  );
  assert.equal(
    scooter("zeeho-ae4-au").facts.battery_pack_count_included.value,
    1,
  );
  assert.equal(
    scooter("zeeho-ae4-au").facts.battery_optional_additional_packs.value,
    1,
  );
  assert.equal(
    scooter("zeeho-ae8-plus-au").facts.battery_pack_count_included.value,
    2,
  );
  assert.equal(
    scooter("segway-e300se-au").facts.battery_pack_count_included.value,
    2,
  );
});

test("scooter range claims and charge windows never become passenger or public-DC measurements", () => {
  const ae6 = scooter("zeeho-ae6-plus-au"),
    e300 = scooter("segway-e300se-au"),
    e125 = scooter("segway-e125s-au");
  assert.equal(ae6.facts.range_km.value, 100);
  assert.equal(ae6.facts.range_test_speed.value, 20);
  assert.match(ae6.facts.range_km.qualifications.join(" "), /20/);
  assert.equal(e300.facts.range_km.value, 130);
  assert.equal(e300.facts.range_wmtc_km.value, 85);
  assert.equal(e125.facts.range_test_method.value, null);
  assert.equal(ae6.facts.charge_time_20_80_hours.value, 2);
  assert.equal(ae6.facts.charge_time_20_80_hours.unit, "h");
  assert.equal(e300.facts.charge_time_to_100_hours.value, 5.5);
  assert.match(
    e300.facts.charge_time_to_100_hours.label,
    /starting SOC unspecified/,
  );
  assert.equal(
    rankAttribute(added, data.sources, "range_km", {
      asOf: "2026-10-10",
      maxAgeDays: 30,
    }).groups.length,
    0,
  );
});

test("conflicts and battery arithmetic remain visible without replacing unknown compatible facts", () => {
  const e125 = scooter("segway-e125s-au"),
    e300 = scooter("segway-e300se-au"),
    ae4 = scooter("zeeho-ae4-au"),
    ae8 = scooter("zeeho-ae8-plus-au");
  assert.equal(e125.facts.power_kw.value, null);
  assert.match(e125.facts.power_kw.qualifications.join(" "), /3\.5/);
  assert.equal(e300.facts.curb_mass_declared_kg.value, null);
  assert.match(
    e300.facts.curb_mass_declared_kg.qualifications.join(" "),
    /127/,
  );
  assert.equal(ae4.facts.battery_kwh.value, null);
  assert.equal(ae4.facts.battery_energy_arithmetic.value, 1.998);
  assert.equal(ae4.facts.battery_energy_arithmetic.status, "conditional");
  assert.equal(ae4.facts.abs.value, false);
  assert.equal(ae4.facts.abs.status, "unavailable");
  assert.equal(ae8.facts.abs.value, true);
  assert.equal(ae8.facts.brake_system.status, "conditional");
  assert.match(
    ae8.facts.brake_system.qualifications.join(" "),
    /CBS|conflict/i,
  );
  for (const car of added) assert.equal(car.facts.kerb_weight_kg.value, null);
});

test("all 331 scooter field mappings survive the shared reader and cite existing exact sources", () => {
  assert.equal(checks.fields.length, 331);
  for (const check of checks.fields) {
    const car = cars.find((car) => car.id === check.variantId)!;
    const fact = car.facts[check.key];
    assert.deepEqual(
      fact.value,
      check.effectiveValue,
      `${car.id}:${check.key}`,
    );
    assert.equal(fact.status, check.effectiveStatus);
    assert.notEqual(fact.status, "standard");
    for (const id of fact.sourceIds)
      assert.ok(
        data.sources.some(
          (source) => source.id === id && !source.access_limitation,
        ),
        id,
      );
    const detailed = pack(car.id, { cars, data });
    assert.deepEqual(detailed.car.facts[check.key], fact);
  }
  for (const sourceId of Object.keys(mapping) as (keyof typeof mapping)[]) {
    const sourceRecord = evidence.records.find(
      (record) => record.id === sourceId,
    )!;
    for (const key of Object.keys(sourceRecord.facts))
      assert.ok(
        (fieldMap[sourceId] as Record<string, string>)[`facts.${key}`],
        key,
      );
    assert.equal(
      effectiveFeatures(scooter(sourceId), data).filter(
        (feature) => feature.status === "standard",
      ).length,
      0,
    );
  }
});

test("market audit and exact scooter availability agree without promising a specific stock unit", () => {
  for (const id of Object.keys(mapping) as (keyof typeof mapping)[]) {
    const row = market.records.find((record) => record.id === id)!;
    const car = scooter(id);
    assert.equal(row.orderStatus, car.availabilityEvidence!.orderStatus);
    assert.equal(row.stockStatus, car.availabilityEvidence!.stockStatus);
    assert.match(row.catalogueCoverage, /detailed/);
    assert.match(row.limitations.join(" "), /not a verified physical unit/);
  }
});

test("qualified scooter equipment aliases preserve storage and warranty scope", () => {
  for (const car of added) {
    const features = effectiveFeatures(car, data);
    const chemistry = features.find(
      (feature) => feature.criterion === "battery_chemistry",
    )!;
    assert.equal(chemistry.status, "conditional");
    assert.match(chemistry.value, /subtype unverified/);
    const warranty = features.find(
      (feature) => feature.criterion === "warranty_service",
    )!;
    assert.equal(warranty.status, "conditional");
    assert.match(
      warranty.value,
      /dealer-claimed.*retention conditions unverified/,
    );
    const storage = features.find(
      (feature) => feature.criterion === "storage",
    )!;
    if (car.facts.under_seat_storage_l.value !== null) {
      assert.equal(storage.status, "conditional");
      assert.match(storage.value, /under-seat.*not passenger-car boot/i);
    } else assert.equal(storage.status, "not_verified");
    for (const fact of Object.values(car.facts))
      for (const id of fact.sourceIds) {
        const source = data.sources.find((source) => source.id === id)!;
        assert.ok(
          !source.access_limitation &&
            !source.conflict &&
            !source.publication_hold,
          id,
        );
      }
  }
  assert.ok(
    data.sources.find((source) => source.id === "r10_scooter_teammoto_ae8")
      ?.conflict,
  );
});

test("failed historical E110S store retrieval remains held and outside scooter citations", () => {
  const failed = data.sources.find(
    (source) => source.id === "r10_scooter_segway_e110s_store",
  )!;
  assert.match(String(failed.access_limitation), /404/);
  for (const car of added) {
    assert.ok(!car.availabilityEvidence!.sourceIds.includes(failed.id));
    for (const fact of Object.values(car.facts))
      assert.ok(!fact.sourceIds.includes(failed.id));
  }
});

test("compact scooter conditions stay readable while full source locators remain available", () => {
  for (const car of added)
    for (const fact of Object.values(car.facts)) {
      if (fact.status !== "conditional") continue;
      assert.ok(!fact.conditionExplanation?.includes("sourceId:"));
      assert.ok(!fact.conditionExplanation?.includes("rangeTestMethod:"));
      assert.ok(fact.sourceIds.length > 0);
    }
  assert.match(
    scooter("zeeho-ae6-plus-au").facts.range_km.conditionExplanation!,
    /20 km\/h/,
  );
  assert.match(
    scooter("segway-e300se-au").facts.range_km.conditionExplanation!,
    /three packs/,
  );
  assert.ok(
    scooter("segway-e300se-au").facts.range_km.qualifications.some((text) =>
      text.includes("sourceId:"),
    ),
  );
  assert.match(scooter("zeeho-ae4-au").facts.price_aud.basis, /ride-away/);
  assert.ok(!scooter("zeeho-ae4-au").facts.price_aud.basis.includes("charger"));
});
