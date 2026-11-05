import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, pack, research } from "../src/lib/data";
import type { Car } from "../src/lib/types";
import { exclusionReason } from "../src/lib/discovery";

// Admission fixtures verify the immutable imported layer. These checks exercise
// the public M1 catalogue and packs, so isolation cannot conceal unsafe overlays.
const cars = catalogue();
const data = research();
const snapshot = { cars, data };
const find = (predicate: (car: Car) => boolean, label: string) => {
  const matches = cars.filter(predicate);
  assert.equal(matches.length, 1, `Expected one exact ${label} version`);
  return matches[0];
};
const byTrim = (brand: string, trim: string) =>
  find((car) => car.brand === brand && car.trim === trim, `${brand} ${trim}`);
const byPrefix = (prefix: string, trim: string) =>
  find(
    (car) => car.id.startsWith(prefix) && car.trim === trim,
    `${prefix} ${trim}`,
  );

test("current optional fitment retains its own status, figure and exact base configuration", () => {
  const ariya = byPrefix("nissan_ariya", "Advance+ 2WD 87kWh");
  assert.equal(ariya.facts.ac_kw.value, 7.4);
  assert.equal(ariya.facts.ac_optional_kw.value, 22);
  assert.equal(ariya.facts.ac_optional_kw.status, "optional");
  assert.equal(ariya.facts.ac_optional_kw.buyerGrade, "check");
  const zeekr = find(
    (car) => car.id.startsWith("zeekr_x_my26") && car.trim.includes("AWD"),
    "Zeekr X MY26 AWD",
  );
  for (const key of [
    "equipment_automatic_front_doors",
    "equipment_black_forged_20_wheels",
  ]) {
    assert.equal(zeekr.facts[key].status, "optional", key);
    assert.equal(zeekr.facts[key].buyerGrade, "check", key);
  }
  const g6 = find(
    (car) =>
      car.id.startsWith("xpeng_g6_my26") && car.trim.includes("Standard"),
    "G6 Standard Range",
  );
  assert.equal(g6.facts.range_km.value, 480);
  assert.deepEqual(g6.facts.wheel_configuration_options.value, [
    {
      wheel_in: 18,
      status: "standard",
      wltp_km: 480,
      consumption_kwh_100km: 16.6,
    },
    {
      wheel_in: 20,
      status: "optional",
      wltp_km: 470,
      consumption_kwh_100km: 16.9,
      option_price_aud: null,
    },
  ]);
});

test("current charging facts never substitute station ratings or a different charging window", () => {
  const zeekrs = cars.filter((car) => car.id.startsWith("zeekr_009_116"));
  assert.ok(zeekrs.length > 0);
  for (const car of zeekrs) {
    // Current secondary peak reports and the two maker charger conditions are
    // distinct claims; neither station rating becomes a confirmed vehicle peak.
    assert.equal(
      car.facts.dc_peak_kw.value,
      "205 (CarExpert editorial); 206 (JATO data)",
    );
    assert.equal(car.facts.dc_peak_kw.buyerGrade, "reported");
    assert.equal(car.facts.dc_peak_kw.comparisonBasis, "");
    assert.equal(
      car.facts.dc_test_charger_kw.value,
      "150 (maker page / S3 brochure); 205 (linked Dato brochure)",
    );
    assert.equal(car.facts.dc_test_charger_kw.buyerGrade, "check");
    assert.equal(car.facts.dc_test_charger_kw.comparisonBasis, "");
    assert.equal(car.facts.dc_charge_time_min.value, 30);
    assert.equal(car.facts.dc_charge_time_min.buyerGrade, "check");
    assert.equal(car.facts.dc_charge_time_min.comparisonBasis, "10–80% SOC");
    assert.match(
      car.facts.dc_charge_time_min.conditionExplanation || "",
      /150/,
    );
    assert.match(
      car.facts.dc_charge_time_min.conditionExplanation || "",
      /205/,
    );
  }
  const genesis = cars.filter((car) => car.brand === "Genesis");
  assert.ok(genesis.length > 0);
  for (const car of genesis) {
    assert.equal(car.facts.dc_peak_kw.value, null);
    assert.equal(car.facts.dc_time_charger_kw.value, 350);
  }
  const cyberster = byPrefix("mg_cyberster_current", "77kWh AWD");
  assert.equal(cyberster.facts.dc_charge_time_min.value, 40);
  assert.equal(cyberster.facts.dc_charge_time_min.buyerGrade, "confirmed");
  assert.match(cyberster.facts.dc_charge_time_min.comparisonBasis, /10–80/);
  assert.equal(cyberster.facts.dc_charge_10_80_min.value, 40);
  assert.equal(cyberster.facts.dc_30_80_time_min.value, 34);
  assert.match(cyberster.facts.dc_30_80_time_min.comparisonBasis, /30–80/);
  assert.equal(cyberster.facts.dc_peak_kw.value, 144);
  assert.equal(cyberster.facts.dc_test_station_kw.value, 150);
});

test("a published partial charging window stays visible without filling the requested 10–80% figure", () => {
  const versions = cars.filter(
    (car) => car.brand === "Geely" && car.trim.includes("Extended Range"),
  );
  assert.ok(versions.length > 0);
  for (const car of versions) {
    const requested = car.facts.dc_charge_time_min;
    const published = car.facts.dc_30_80_min;
    assert.equal(requested.value, null);
    assert.equal(requested.buyerGrade, "not_published");
    assert.ok(requested.sourceIds.length >= 2);
    assert.equal(published.value, 20);
    assert.match(published.comparisonBasis, /30[–-]80/);
    assert.equal(published.buyerGrade, "confirmed");
    const full = pack(car.id, snapshot);
    assert.deepEqual(full.car.facts.dc_30_80_min, published);
    assert.equal(full.car.facts.dc_charge_time_min.value, null);
  }
});

test("current battery and motor figures never inherit larger options or fabricated component sums", () => {
  for (const trim of ["Taycan", "Taycan 4"]) {
    const car = byTrim("Porsche", trim);
    assert.equal(car.facts.battery_gross_kwh.value, 89);
    assert.equal(car.facts.battery_kwh.value, 82.3);
    assert.equal(car.facts.dc_peak_kw.value, 270);
  }
  const larger = byTrim("Porsche", "Taycan 4S");
  assert.equal(larger.facts.battery_gross_kwh.value, 105);
  assert.equal(larger.facts.battery_kwh.value, 97);
  for (const prefix of ["im_im5_my25", "im_im6_my25"]) {
    const car = byPrefix(prefix, "Performance AWD");
    // A cited combined-output report is allowed; adding component maxima is not.
    assert.equal(car.facts.power_kw.value, 572);
    assert.equal(car.facts.torque_nm.value, 802);
    for (const key of ["power_kw", "torque_nm"]) {
      assert.equal(car.facts[key].buyerGrade, "reported");
      assert.equal(car.facts[key].comparisonBasis, "");
      assert.equal(
        car.facts[key].gradeReview?.evidenceScope,
        "secondary_or_sibling",
      );
      assert.ok(
        car.facts[key].sourceIds.some((id) =>
          data.sources
            .find((source) => source.id === id)
            ?.url.includes("carexpert.com.au"),
        ),
      );
    }
    assert.deepEqual(car.facts.motor_power_components_kw.value, {
      front: 200,
      rear: 372,
    });
  }
});

test("current cargo figures retain occupied-seat, folded-row and roof-height boundaries", () => {
  const gt = find(
    (car) => car.model === "EV9" && car.trim === "GT AWD",
    "EV9 GT AWD",
  );
  assert.equal(gt.facts.seats.value, 6);
  assert.equal(gt.facts.boot_l.value, 333);
  assert.equal(gt.facts.boot_l.buyerGrade, "reported");
  assert.match(gt.facts.boot_l.basis, /all three rows in use \(six seats\)/);
  assert.equal(gt.facts.boot_l.comparisonBasis, "");
  assert.ok(
    gt.facts.boot_l.sourceIds.some(
      (id) =>
        data.sources.find((source) => source.id === id)?.url ===
        "https://www.carexpert.com.au/car-reviews/2026-kia-ev9-gt-review",
    ),
  );
  assert.equal(gt.facts.max_total_cargo_l.value, 2393);
  const ex90 = byPrefix("volvo_ex90_my27", "Plus Single Motor");
  assert.equal(ex90.facts.boot_l.value, 324);
  assert.equal(ex90.facts.cargo_open_second_row_up_l.value, 697);
  const polestar = byPrefix("polestar_4_suv_my27", "Rear motor");
  assert.equal(polestar.facts.boot_l.value, 530);
  assert.equal(polestar.facts.cargo_rear_to_inner_roof_l.value, 655);
  const mazda = cars.filter((car) => car.model === "CX-6e");
  assert.ok(mazda.length > 0);
  for (const car of mazda) {
    const boot = car.facts.boot_l;
    assert.equal(boot.value, 363);
    assert.equal(boot.buyerGrade, "check");
    assert.match(boot.basis, /VDA; seats up.*including underfloor storage/);
    assert.match(boot.comparisonBasis, /VDA seats up.*underfloor included/);
    assert.match(boot.conditionExplanation!, /363 L.*468 L.*unresolved/);
    assert.equal(car.facts.source_brochure_boot_l.value, 363);
    assert.equal(car.facts.source_model_page_boot_l.value, 468);
    assert.equal(car.facts.source_boot_web_l.value, 468);
    assert.equal(car.facts.source_boot_web_l.comparisonBasis, "");
    const conflict = boot.issues.find((issue) =>
      /boot.*conflict/i.test(issue.title),
    );
    assert.ok(conflict);
    assert.deepEqual(conflict.source_ids, boot.sourceIds);
    assert.deepEqual(
      boot.sourceIds.map((id) => data.sources.find((source) => source.id === id)?.url),
      [
        "https://www.mazda.com.au/4a4bb0/globalassets/brochures/cx-6e-digital-brochure.pdf",
        "https://www.mazda.com.au/cars/cx-6e/",
      ],
    );
    // Prove the cargo conflict independently of the separate preorder exclusion.
    assert.match(
      exclusionReason(
        { ...car, availability: "current_or_order_listed" },
        boot,
        data.sources,
        { asOf: "2026-10-15" },
      )!,
      /Unresolved claim conflict/,
    );
  }
});

test("current measurement types cannot become pack voltage, turning diameter or braked towing", () => {
  const lexus = find(
    (car) => car.id.startsWith("lexus_es_bev") && car.trim.includes("350e"),
    "Lexus ES 350e",
  );
  assert.equal(lexus.facts.battery_cell_nominal_voltage_v.value, 3.76);
  assert.equal(lexus.facts.battery_pack_voltage_v.value, null);
  assert.equal(lexus.facts.turning_radius_tyres_m.value, 5.918);
  assert.equal(lexus.facts.turning_circle_m.value, null);
  const toyota = find(
    (car) => car.model === "bZ4X" && car.trim === "2WD",
    "Toyota bZ4X 2WD",
  );
  assert.equal(toyota.facts.towing_unclassified_kg.value, 750);
  const braked = toyota.facts.towing_braked_kg;
  assert.equal(braked.value, 750);
  assert.equal(braked.buyerGrade, "reported");
  assert.equal(braked.comparisonBasis, "");
  assert.equal(braked.resolvedElsewhere, true);
  assert.equal(braked.gradeReview?.evidenceScope, "secondary_or_sibling");
  assert.match(braked.basis, /Braked towing reported by CarExpert/);
  assert.ok(braked.qualifications.some((note) =>
    /CarExpert exact FWD.*Gross Trailer Weight Braked/.test(note),
  ));
  assert.ok(braked.sourceIds.some((id) =>
    data.sources.find((source) => source.id === id)?.url ===
      "https://www.carexpert.com.au/toyota/bz4x/2026-suv-fwd-electric-jsg5ffoo20251210",
  ));
  assert.match(
    exclusionReason(toyota, braked, data.sources, { asOf: "2026-10-15" })!,
    /Reported value/,
  );
  const charging = toyota.facts.dc_charge_time_min;
  assert.equal(charging.value, 28);
  assert.equal(charging.buyerGrade, "check");
  assert.equal(charging.comparisonBasis, "");
  assert.match(charging.basis, /10–80%; 150 kW DC charger/);
  for (const duration of [28, 30, 45])
    assert.ok(charging.conditionExplanation?.includes(`${duration} minutes`));
  assert.ok(charging.sourceIds.some((id) =>
    data.sources.find((source) => source.id === id)?.url ===
      "https://www.toyota.com.au/bz4x-ev",
  ));
  assert.match(
    exclusionReason(toyota, charging, data.sources, { asOf: "2026-10-15" })!,
    /Measurement basis missing/,
  );
});

test("current public packs retain complete claim, review and availability source closure", () => {
  const sourceIndex = new Map(
    data.sources.map((source) => [source.id, source]),
  );
  assert.equal(
    sourceIndex.size,
    data.sources.length,
    "Source identities must be unambiguous",
  );
  for (const car of cars.filter((car) =>
    ["passenger", "ute"].includes(car.vehicleClass || "passenger"),
  )) {
    const full = pack(car.id, snapshot);
    assert.strictEqual(full.car, car);
    assert.equal(full.features.length, data.criteria.length, car.id);
    const ids = new Set(full.sources.map((source) => source.id));
    const claimSources = [
      ...(car.availabilityEvidence?.sourceIds || []),
      ...Object.values(car.facts).flatMap((fact) => [
        ...fact.sourceIds,
        ...(fact.gradeReview?.sourceIds || []),
        ...fact.issues.flatMap((issue) => issue.source_ids),
      ]),
      ...full.features.flatMap((feature) => [
        ...feature.source_ids,
        ...(feature.gradeReview?.sourceIds || []),
      ]),
    ];
    for (const id of claimSources) {
      assert.ok(sourceIndex.has(id), `${car.id}: registry lacks ${id}`);
      assert.ok(ids.has(id), `${car.id}: pack lacks ${id}`);
    }
    for (const source of full.sources)
      assert.deepEqual(source, sourceIndex.get(source.id));
  }
});
