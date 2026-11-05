// Admission behaviour is checked against the immutable source layer.
// Dated M1 overlays have separate current-catalogue safety coverage.
import test from "node:test";
import assert from "node:assert/strict";
import {
  sourceCatalogue as catalogue,
  sourceResearch as research,
  sourceEffectiveFeatures as effectiveFeatures,
} from "../src/lib/data";
import { sourceSnapshotPack as pack } from "./helpers/source-fixture";
import { rankAttribute } from "../src/lib/discovery";
import { makeReport, reportSchema } from "../src/lib/citable";
import ids from "../qa/ute-van-integrated-ids.json";
import mapping from "../qa/ute-van-integration-checks.json";
import aliases from "../qa/ute-van-feature-aliases.json";
import market from "../data/market-inventory-2026-10-10.json";
const cars = catalogue(),
  data = research();
const get = (id: keyof typeof ids) => cars.find((c) => c.id === ids[id])!;
const added = Object.keys(ids).map((id) => get(id as keyof typeof ids));
test("seven ute/van configurations keep four families and door/package boundaries", () => {
  assert.equal(added.length, 7);
  assert.equal(new Set(added.map((c) => c.modelFamily)).size, 4);
  assert.equal(added.filter((c) => c.vehicleClass === "ute").length, 2);
  assert.equal(added.filter((c) => c.vehicleClass === "van").length, 5);
  assert.equal(
    added.filter(
      (c) => c.availabilityEvidence?.stockStatus === "new_stock_listed",
    ).length,
    6,
  );
  const lift = get("hyundai-staria-load-electric-84-fwd-liftback");
  assert.equal(lift.year, null);
  assert.equal(lift.facts.seats.value, null);
  assert.equal(lift.availabilityEvidence?.stockStatus, "not_verified");
  const twin = get("hyundai-staria-load-electric-84-fwd-twin-swing");
  assert.equal(twin.year, 2027);
  assert.equal(twin.facts.seats.value, 2);
  assert.equal(twin.facts.seats.status, "conditional");
  assert.equal(
    added.some((c) => /black.edge/i.test(c.trim)),
    false,
  );
  for (const c of added) {
    assert.equal(c.availabilityEvidence?.orderStatus, "listed");
    assert.match(
      c.availabilityEvidence!.qualifications!.join(" "),
      /physical stock/,
    );
  }
});
test("all mapped commercial facts preserve source values, nulls and conditional status", () => {
  assert.equal(mapping.fields.length, 1168);
  assert.equal(mapping.sourceHashes.length, 201);
  for (const row of mapping.fields) {
    const c = cars.find((c) => c.id === row.variantId)!;
    const f = c.facts[row.key];
    assert.ok(f, `${row.variantId}:${row.key}`);
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
    assert.equal(c.facts.boot_l.value, null);
  }
});
test("Musso keeps six-airbag correction, optional package and unresolved AWD towball", () => {
  const two = get("kgm-musso-ev-my26-2wd"),
    awd = get("kgm-musso-ev-my26-awd");
  for (const c of [two, awd]) {
    assert.equal(c.facts.airbag_count.value, 6);
    assert.equal(c.facts.centre_airbag.value, false);
    assert.equal(c.facts.driver_knee_airbag.value, false);
    assert.equal(c.facts.ancap_rating.value, "unrated");
    assert.equal(c.facts.dc_peak_kw.value, null);
    assert.equal(c.facts.dc_charge_time_min.value, 36);
    assert.match(c.facts.dc_charge_time_min.basis, /10–80.*300/);
  }
  assert.equal(two.facts.range_km.value, 419);
  assert.equal(awd.facts.range_km.value, 379);
  assert.equal(awd.facts.towball_download.value, null);
  assert.equal(two.facts.towball_download.value, 180);
  assert.ok(two.facts.optional_black_edge_package_name);
  assert.equal(awd.facts.optional_black_edge_package_name, undefined);
  assert.equal(two.facts.tub_volume_l.value, 1011);
});
test("PV5 preserves conflicting masses and battery warranty plus distinct ANCAP assessment", () => {
  const c = get("kia-pv5-cargo-s-4dr-long-range-my26");
  assert.equal(c.facts.kerb_weight_kg.value, null);
  assert.equal(c.facts.tare_mass_declared.value, 1955);
  assert.equal(c.facts.kerb_mass_declared.value, 1910);
  assert.equal(c.facts.battery_warranty.value, null);
  assert.match(c.facts.battery_warranty.qualifications.join(" "), /conflict/i);
  assert.equal(c.facts.warranty.unit, "");
  assert.equal(c.facts.ancap_crash_stars.value, null);
  assert.equal(c.facts.ancap_commercial_van_score.value, 91);
  assert.equal(c.facts.aeb_backover.value, false);
  assert.equal(c.facts.dc_peak_kw.value, 128);
  assert.equal(c.facts.dc_charge_time_min.value, 30);
  assert.match(c.facts.dc_charge_time_min.basis, /350|10.?80/i);
});
test("Farizon retains 20–80 charging, exact New ads and dealer-only seating", () => {
  for (const id of [
    "farizon-v7e-standard-range-50kwh",
    "farizon-v7e-extended-range-66kwh",
  ] as const) {
    const c = get(id);
    assert.equal(c.year, null);
    assert.equal(c.facts.dc_10_80_min.value, null);
    assert.match(c.facts.dc_charge_time_min.basis, /20–80/);
    assert.equal(c.facts.cargo_volume_l.value, 6950);
    assert.match(c.facts.cargo_volume_l.basis, /method not identified/);
    assert.equal(c.facts.seats.value, 3);
    assert.match(c.facts.seats.label, /Dealer/);
    assert.equal(
      c.availabilityEvidence!.sourceIds.some((x) => x.includes("39435")),
      false,
    );
  }
  assert.equal(
    get("farizon-v7e-standard-range-50kwh").facts.dc_charge_time_min.value,
    26,
  );
  assert.equal(
    get("farizon-v7e-extended-range-66kwh").facts.dc_peak_kw.value,
    97,
  );
  const held = data.sources.find((s) => s.id === "r10_uv_farizon_stock_39435")!;
  assert.ok(held.conflict);
});
test("STARIA keeps unrated electric scope, held vehicle DC limit and commercial warranty", () => {
  for (const id of [
    "hyundai-staria-load-electric-84-fwd-liftback",
    "hyundai-staria-load-electric-84-fwd-twin-swing",
  ] as const) {
    const c = get(id);
    assert.equal(c.facts.ancap_rating.value, "unrated");
    assert.equal(c.facts.ancap_stars.value, null);
    assert.equal(c.facts.dc_peak_kw.value, null);
    assert.equal(c.facts.dc_charging_capacity_published.value, 350);
    assert.equal(c.facts.dc_charge_time_min.value, 20);
    assert.match(
      c.facts.dc_charge_time_min.qualifications.join(" "),
      /350 kW charger/,
    );
    assert.equal(c.facts.kerb_weight_kg.value, null);
    assert.equal(c.facts.payload_kg.value, 1005);
    assert.match(String(c.facts.warranty.value), /5 years.*160,000/);
    assert.equal(c.facts.cargo_volume_l.value, 4935);
  }
});
test("commercial shared features are qualified and new measurements cannot enter rankings", () => {
  assert.equal(aliases.length, 60);
  for (const row of aliases) {
    const c = cars.find((c) => c.id === row.variantId)!;
    const f = effectiveFeatures(c, data).find(
      (f) => f.criterion === row.criterion,
    )!;
    assert.equal(f.status, "conditional");
    assert.equal(f.value, row.value);
  }
  for (const key of [
    "price_aud",
    "range_km",
    "dc_charge_time_min",
    "boot_l",
    "towing_braked_kg",
    "length_mm",
    "zero_to_100_s",
  ])
    assert.equal(
      rankAttribute(
        added,
        data.sources,
        key as Parameters<typeof rankAttribute>[2],
        { asOf: "2026-10-10", maxAgeDays: 30 },
      ).groups.length,
      0,
    );
  for (const c of added)
    assert.equal(
      effectiveFeatures(c, data).some((f) => f.status === "standard"),
      false,
    );
});
test("commercial primary reports retain tub/cargo/charging definitions rather than passenger boot claims", () => {
  const selected = [
    get("kgm-musso-ev-my26-2wd"),
    get("farizon-v7e-standard-range-50kwh"),
  ];
  const report = makeReport(
    selected.map((c) => pack(c.id, { cars, data })),
    "/compare",
  );
  assert.equal(report.keyFacts.length, 12);
  assert.ok(report.keyFacts.some((f) => f.key === "tub_volume_l"));
  assert.ok(report.keyFacts.some((f) => f.key === "cargo_volume_l"));
  assert.equal(
    report.keyFacts.some((f) => f.key === "boot_l"),
    false,
  );
  assert.ok(
    report.keyFacts
      .find(
        (f) => f.carId === selected[1].id && f.key === "dc_charge_time_min",
      )!
      .sentence.includes("20–80"),
  );
  assert.equal(
    reportSchema(report)["@graph"].filter((g) => g["@type"] === "Vehicle")
      .length,
    2,
  );
});
test("refreshed market audit counts four existing commercial families once", () => {
  assert.equal(
    market.detailedCatalogueContext.knownDetailedTrimCount,
    cars.length,
  );
  assert.equal(
    market.detailedCatalogueContext.knownDetailedFamilyCount,
    new Set(cars.map((car) => car.modelFamily || car.family)).size,
  );
  for (const id of [
    "kgm-musso-ev",
    "kia-pv5-cargo",
    "farizon-v7e",
    "hyundai-staria-load-electric",
  ]) {
    const rows = market.records.filter((r) => r.id === id);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].orderStatus, "listed_unconfirmed");
    assert.equal(rows[0].stockStatus, "new_stock_listed");
  }
});

test("interactive overview uses the same class-specific keys and keeps missing cells separate", async () => {
  const { comparisonOverviewKeys } = await import("../src/lib/citable");
  const two = get("kgm-musso-ev-my26-2wd"),
    van = get("farizon-v7e-standard-range-50kwh");
  const keys = comparisonOverviewKeys([two, van]);
  assert.ok(keys.includes("tub_volume_l"));
  assert.ok(keys.includes("cargo_volume_l"));
  assert.ok(keys.includes("seats"));
  assert.ok(!keys.includes("boot_l"));
  assert.ok(keys.includes("recommended_driveaway_aud"));
  assert.ok(keys.includes("promotional_driveaway_aud"));
  assert.equal(van.facts.tub_volume_l, undefined);
  const passenger = cars.find((c) => c.vehicleClass === "passenger")!;
  assert.deepEqual(comparisonOverviewKeys([passenger]), [
    "price_aud",
    "range_km",
    "seats",
    "dc_charge_time_min",
    "boot_l",
    "warranty",
  ]);
});
