// Admission behaviour is checked against the immutable source layer.
// Dated M1 overlays have separate current-catalogue safety coverage.
import test from "node:test";
import assert from "node:assert/strict";
import {
  sourceCatalogue as catalogue,
  sourceResearch as research,
  sourceEffectiveFeatures as effectiveFeatures,
} from "../src/lib/data";
import ids from "../qa/hyundai-integrated-ids.json";
import mapping from "../qa/hyundai-integration-checks.json";
import aliases from "../qa/hyundai-feature-aliases.json";
import market from "../data/market-inventory-2026-10-10.json";
const cars = catalogue(),
  data = research();
const get = (id: keyof typeof ids) => cars.find((c) => c.id === ids[id])!;
const added = Object.keys(ids).map((id) => get(id as keyof typeof ids));
test("Hyundai adds twelve core configurations in six families without option-count inflation", () => {
  assert.equal(added.length, 12);
  assert.equal(new Set(added.map((c) => c.modelFamily)).size, 6);
  assert.ok(added.every((c) => c.vehicleClass === "passenger"));
  assert.equal(
    added.filter(
      (c) => c.availabilityEvidence?.stockStatus === "new_stock_listed",
    ).length,
    4,
  );
  for (const c of added) {
    assert.equal(c.availabilityEvidence?.orderStatus, "listed");
    assert.match(
      c.availabilityEvidence!.qualifications!.join(" "),
      /physical stock/,
    );
  }
  assert.equal(get("hyundai-inster-202608-standard-range-42-fwd").year, null);
  assert.equal(get("hyundai-inster-202608-cross-49-fwd-sunroof").year, null);
  assert.equal(get("hyundai-ioniq-5-n-84-awd").year, null);
  assert.equal(
    get("hyundai-ioniq-5-n-84-awd").availabilityEvidence?.stockStatus,
    "not_verified",
  );
  assert.match(
    get("hyundai-ioniq-6-n-84-awd").availabilityEvidence!.qualifications!.join(
      " ",
    ),
    /sunroof configuration only/,
  );
});
test("every mapped Hyundai field preserves effective values and never receives automatic standard status", () => {
  assert.equal(mapping.sourceHashes.length, 309);
  assert.equal(mapping.fields.length, 4283);
  for (const row of mapping.fields) {
    const f = cars.find((c) => c.id === row.variantId)!.facts[row.key];
    assert.ok(f, row.key);
    assert.deepEqual(
      f.value,
      row.effectiveValue,
      `${row.variantId}:${row.key}`,
    );
    assert.equal(f.status, row.effectiveStatus);
    assert.notEqual(f.status, "standard");
    for (const id of f.sourceIds)
      assert.ok(
        data.sources.some((s) => s.id === id),
        id,
      );
  }
  for (const c of added) {
    assert.equal(c.facts.battery_gross_kwh.value, null);
    assert.equal(c.facts.battery_usable_kwh.value, null);
    assert.equal(c.facts.dc_peak_kw.value, null);
    assert.equal(c.facts.kerb_weight_kg.value, null);
  }
});
test("ELEXIO preserves FWD, exact seat equipment, wheel-specific range and cargo discrepancy", () => {
  const base = get("hyundai-elexio-my26-base-fwd"),
    elite = get("hyundai-elexio-my26-elite-fwd");
  assert.equal(base.facts.power_kw.value, 160);
  assert.equal(base.facts.range_km.value, 562);
  assert.equal(elite.facts.range_km.value, 546);
  assert.equal(base.facts.driver_seat_adjustment.value, "6-way power");
  assert.equal(base.facts.driver_seat_memory.value, false);
  assert.equal(base.facts.sunroof.value, null);
  assert.equal(base.facts.boot_l.value, 506);
  assert.match(base.facts.boot_l.qualifications.join(" "), /504.*conflicts/);
  assert.equal(base.facts.dc_charge_time_min.value, 38);
  assert.equal(base.facts.price_aud.value, 58990);
});
test("IONIQ 9 separates seat layouts and holds inconsistent portable charging declaration", () => {
  for (const [id, seats] of [
    ["hyundai-ioniq-9-my27-calligraphy-awd-7-seat", 7],
    ["hyundai-ioniq-9-my27-calligraphy-awd-6-seat", 6],
  ] as const) {
    const c = get(id);
    assert.equal(c.facts.seats.value, seats);
    assert.equal(c.facts.boot_l.value, 338);
    assert.equal(c.facts.cargo_behind_second_row.value, 908);
    assert.equal(c.facts.portable_charge_time.value, null);
    assert.equal(c.facts.dc_charge_time_min.value, 24);
    assert.equal(c.availabilityEvidence?.stockStatus, "not_verified");
  }
});
test("INSTER and KONA keep loading-method, heat-pump, MY and 444 km Elite boundaries", () => {
  const inster = get("hyundai-inster-202608-standard-range-42-fwd");
  assert.equal(inster.facts.heat_pump.value, null);
  assert.equal(inster.facts.boot_l.value, null);
  assert.equal(inster.facts.dc_charging_capacity_declared.value, 120);
  const elite = get("hyundai-kona-electric-my27-elite-extended-range-64-8-fwd");
  assert.equal(elite.facts.range_km.value, 444);
  assert.equal(elite.year, 2027);
  assert.equal(elite.facts.boot_l.value, null);
  assert.equal(elite.facts.dc_peak_kw.value, null);
  assert.equal(elite.facts.dc_charge_time_min.value, 43);
  assert.ok(!added.some((c) => /non-cross.*49|n.line/i.test(c.trim)));
});
test("N variants keep normal/boost power, safety applicability and optional roof separate", () => {
  for (const id of [
    "hyundai-ioniq-5-n-84-awd",
    "hyundai-ioniq-6-n-84-awd",
  ] as const) {
    const c = get(id);
    assert.equal(c.facts.power_kw.value, 448);
    assert.equal(c.facts.boost_power.value, 478);
    assert.equal(c.facts.dc_charge_time_min.value, 18);
    assert.equal(c.facts.ancap_stars.value, null);
    assert.equal(c.facts.track_use_warranty.value, null);
    assert.equal(c.facts.boot_l.value, null);
  }
  const six = get("hyundai-ioniq-6-n-84-awd");
  assert.equal(six.facts.range_km.value, 487);
  assert.equal(six.facts.ancap_rating.value, null);
  assert.match(String(six.facts.roof.value), /optional/);
});
test("Hyundai warranty and feature fitment qualifiers survive canonical aliases", () => {
  for (const c of added) {
    assert.equal(c.facts.warranty.unit, "");
    assert.match(
      String(c.facts.warranty.value),
      /5 years.*7 years.*conditions/,
    );
    assert.match(c.facts.battery_warranty.qualifications.join(" "), /70%|70/);
  }
  assert.equal(aliases.length, 180);
  const features = added.flatMap((c) => effectiveFeatures(c, data));
  for (const a of aliases) {
    const f = features.find(
      (x) => x.variant_id === a.variantId && x.criterion === a.criterion,
    )!;
    assert.ok(f);
    assert.notEqual(f.status, "standard");
    assert.ok(f.source_ids.length);
  }
  for (const c of added)
    for (const f of Object.values(c.facts)) {
      if (f.value === "not_available") assert.equal(f.status, "unavailable");
      if (f.value === "optional")
        assert.match(f.qualifications.join(" "), /Optional equipment/);
    }
});
test("Hyundai market rows reuse six existing families and preserve order uncertainty", () => {
  for (const family of new Set(added.map((c) => c.modelFamily))) {
    const rows = market.records.filter((r) => r.id === family);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].orderStatus, "listed_unconfirmed");
    assert.equal(rows[0].rankingEligible, false);
  }
});

test("Hyundai home-charge summaries do not imply a common 7 kW test", () => {
  for (const c of added.filter(
    (c) => !c.id.includes("elexio") && !c.id.includes("ioniq_5_n"),
  )) {
    const f = effectiveFeatures(c, data).find(
      (f) => f.criterion === "home_charging",
    )!;
    assert.match(String(f.value), /^7 kW home charging time unverified/);
    assert.match(String(f.value), /min/);
  }
  const nine = get("hyundai-ioniq-9-my27-calligraphy-awd-7-seat");
  assert.match(
    String(
      effectiveFeatures(nine, data).find((f) => f.criterion === "energy_use")!
        .value,
    ),
    /Wh\/km/,
  );
  assert.equal(
    get("hyundai-ioniq-6-n-84-awd").availabilityEvidence?.stockStatus,
    "not_verified",
  );
});
