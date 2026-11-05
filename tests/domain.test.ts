import { test } from "node:test";
import assert from "node:assert/strict";
import {
  catalogue,
  counts,
  pack,
  research,
  readableValue,
  sourceCatalogue,
  sourceResearch,
} from "../src/lib/data";
import { sourceSnapshotPack } from "./helpers/source-fixture";
import {
  compareFacts,
  featuresDiffer,
  parseSelection,
  selectionUrl,
} from "../src/lib/compare";
import { resolveAsset, type ApprovedAsset } from "../src/lib/media";
import { validateResearch } from "../src/lib/validate";
import { BASELINE, CHALLENGER, safeUrl } from "../src/lib/config";
import { fleetSelection, featureCondition } from "../src/lib/fleet";
// One current snapshot per file; historical source fixtures remain separate.
const cars = catalogue();
const snapshot = { data: research(), cars };
const y = pack(BASELINE, snapshot);
const s = pack(CHALLENGER, snapshot);
const sourceSnapshot = { cars: sourceCatalogue(), data: sourceResearch() };
function sourcePack(id: string) {
  return sourceSnapshotPack(id, sourceSnapshot);
}
test("fleet covers ten distinct families and respects current trims and valid URLs", () => {
  const initial = fleetSelection(cars, new URLSearchParams());
  assert.equal(initial.baseline, "tesla_model_y__premium_rwd__2");
  assert.equal(initial.ids.length, 9);
  assert.equal(
    new Set(
      [initial.baseline, ...initial.ids].map(
        (id) => cars.find((c) => c.id === id)!.family,
      ),
    ).size,
    10,
  );
  assert.ok(
    initial.ids.every(
      (id) =>
        cars.find((c) => c.id === id)!.availability ===
        "current_or_order_listed",
    ),
  );
  const selected = fleetSelection(
    cars,
    new URLSearchParams({
      baseline: "byd_sealion_7__premium_rwd__1",
      fleet: "byd_sealion_7__performance_awd__2",
      focus: "byd-sealion-7",
    }),
  );
  assert.equal(selected.baseline, BASELINE);
  assert.equal(selected.ids[0], "byd_sealion_7__performance_awd__2");
  assert.ok(
    featureCondition({
      ...s.features[0],
      conditions: "",
      confirmation_needed: undefined,
    }).includes("exact trim"),
  );
});
test("research counts are calculated from live family, generation and availability data", () => {
  const current = counts();
  assert.equal(current.variants, cars.length);
  assert.equal(
    current.families,
    new Set(cars.map((car) => car.modelFamily || car.family)).size,
  );
  assert.equal(current.generations, snapshot.data.models.length);
  assert.equal(current.criteria, snapshot.data.criteria.length);
  assert.equal(current.evidence, snapshot.data.feature_evidence.length);
  assert.equal(
    current.current,
    cars.filter((car) => car.availability === "current_or_order_listed").length,
  );
  assert.equal(
    current.outgoing,
    cars.filter((car) => car.availability === "outgoing").length,
  );
  assert.equal(
    current.provisional,
    cars.filter((car) => car.availability === "announced_provisional").length,
  );
});
test("all evidence references and structural coverage validate", () =>
  assert.deepEqual(validateResearch(snapshot.data), []));
test("validator rejects broken source lineage and duplicate criterion", () => {
  const d = structuredClone(snapshot.data);
  d.feature_evidence[0].source_ids = ["missing"];
  d.feature_evidence.push(d.feature_evidence[0]);
  assert.ok(validateResearch(d).length >= 2);
});
test("numeric deltas require unconditional evidence and matching measurement basis", () => {
  const y = sourcePack(BASELINE),
    s = sourcePack(CHALLENGER);
  assert.equal(
    compareFacts(y.car.facts.price_aud, s.car.facts.price_aud).delta,
    undefined,
  );
  assert.equal(
    compareFacts(y.car.facts.price_aud, s.car.facts.price_aud).state,
    "conditional",
  );
  assert.equal(
    compareFacts(y.car.facts.range_km, s.car.facts.range_km).state,
    "different_basis",
  );
  assert.equal(
    compareFacts(
      sourcePack("tesla_model_y__premium_long_range_awd__1").car.facts.range_km,
      sourcePack("tesla_model_y__premium_rwd__2").car.facts.range_km,
    ).delta,
    -134,
  );
  assert.equal(
    compareFacts(y.car.facts.dc_charge_time_min, s.car.facts.dc_charge_time_min)
      .state,
    "conditional",
  );
});
test("charging windows, capacity and cargo bases remain distinct", () => {
  const y = sourcePack(BASELINE),
    s = sourcePack(CHALLENGER);
  const geely = sourcePack("geely_ex5__complete_extended_range__1");
  assert.equal(
    compareFacts(
      geely.car.facts.dc_charge_time_min,
      s.car.facts.dc_charge_time_min,
    ).state,
    "different_basis",
  );
  assert.equal(y.car.facts.battery_kwh.value, 60);
  assert.equal(y.car.facts.battery_kwh.status, "conditional");
  assert.match(
    y.car.facts.battery_kwh.basis,
    /Tesla publishes no battery capacity/,
  );
  assert.equal(
    compareFacts(y.car.facts.boot_l, s.car.facts.boot_l).state,
    "different_basis",
  );
});
test("Model Y L does not inherit software count or child safety score", () => {
  const l = pack("tesla_model_y__l_premium_awd__4", snapshot);
  assert.equal(l.eligibility.documented_family_minimum, null);
  assert.match(
    l.features.find((f) => f.criterion === "safety_ancap")!.value,
    /child 84%/,
  );
  assert.equal(l.car.facts.seats.value, 6);
  assert.equal(
    compareFacts(l.car.facts.zero_to_100_s, y.car.facts.zero_to_100_s).state,
    "comparable",
  );
});
test("EV3 retains six reverified and two pending notices", () => {
  const ev3 = pack("kia_ev3__air_2wd_standard_range__1", snapshot);
  assert.equal(ev3.eligibility.documented_family_minimum, 6);
  assert.equal(
    ev3.events.filter(
      (e) =>
        e.variant_review_state === "AU_manufacturer_notice_index_reverified",
    ).length,
    6,
  );
  const pending = ev3.events.filter((e) =>
    e.variant_review_state.startsWith("pending"),
  );
  assert.equal(pending.length, 2);
  assert.ok(pending.every((e) => !e.count_in_headline));
});
test("EVO checked specifications resolve independently of safety, price and Black Edition", () => {
  const evo = sourcePack("byd_atto_3_evo__dynamic_fwd__1");
  assert.equal(
    evo.features.find((f) => f.criterion === "safety_ancap")!.status,
    "conditional",
  );
  assert.equal(evo.car.facts.range_km.status, "standard");
  assert.deepEqual(evo.car.facts.range_km.sourceIds, ["r3_evo_spec"]);
  assert.equal(evo.car.facts.price_aud.status, "conditional");
  assert.equal(
    sourcePack("zeekr_7x__black_special_edition_awd__4").car.facts.range_km
      .status,
    "conditional",
  );
});
test("five-seat V2L stays conditional", () => {
  const f = y.features.find((f) => f.criterion === "v2l")!;
  assert.equal(f.status, "conditional");
  assert.match(f.conditions, /VIN|build/);
});
test("different conditions count as differences even for equal values", () => {
  const f = y.features[0];
  assert.ok(featuresDiffer([f, { ...f, conditions: "Different hardware" }]));
  assert.ok(!featuresDiffer([f, { ...f }]));
});
test("URL validation removes duplicates, restores baseline and retains third", () => {
  const third = "kia_ev3__air_2wd_standard_range__1";
  const state = parseSelection(
    new URLSearchParams({
      cars: `${BASELINE},${CHALLENGER},${third}`,
      active: third,
    }),
    cars,
  );
  assert.equal(state.ids.length, 3);
  assert.equal(
    parseSelection(
      new URL(selectionUrl(state), "http://localhost").searchParams,
      cars,
    ).active,
    third,
  );
  assert.equal(
    parseSelection(
      new URLSearchParams({ cars: `bad,${CHALLENGER},${CHALLENGER}` }),
      cars,
    ).ids.length,
    2,
  );
});
test("different Model Ys are allowed but exact duplicate is not", () => {
  const ids = [BASELINE, "tesla_model_y__premium_long_range_awd__1"];
  assert.deepEqual(
    parseSelection(new URLSearchParams({ cars: ids.join(",") }), cars).ids,
    ids,
  );
  assert.equal(
    parseSelection(
      new URLSearchParams({ cars: `${BASELINE},${BASELINE}` }),
      cars,
    ).ids[1],
    CHALLENGER,
  );
});
test("shared dataset mismatch is visible and never silently re-dates evidence", () =>
  assert.match(
    parseSelection(new URLSearchParams({ data: "2025-01-01" }), cars).warning,
    /2025-01-01/,
  ));
test("source URLs reject scripts and credential URLs", () => {
  assert.equal(safeUrl("javascript:alert(1)"), null);
  assert.equal(safeUrl("https://user:password@example.com"), null);
  assert.equal(safeUrl("https://example.com"), "https://example.com/");
});
test("media fails closed without provenance, on expiry and wrong scope", () => {
  assert.equal(resolveAsset([], "tesla", "hero", "tesla_model_y"), null);
  const a: ApprovedAsset = {
    id: "test",
    src: "/media/test.webp",
    owner: "Creator",
    licenceEvidence: "Private recorded licence",
    placements: ["article"],
    transformations: [],
    credit: "Creator",
    reviewer: "Editor",
    reviewDate: "2026-10-06",
    expires: null,
    territory: "AU",
    modelIds: ["tesla_model_y"],
    width: 600,
    height: 400,
    production_allowed: true,
    technicalReview: true,
  };
  assert.equal(resolveAsset([a], "test", "hero", "tesla_model_y"), null);
  assert.equal(
    resolveAsset(
      [{ ...a, licenceEvidence: "" }],
      "test",
      "article",
      "tesla_model_y",
    ),
    null,
  );
  assert.equal(
    resolveAsset(
      [{ ...a, expires: "2020-01-01" }],
      "test",
      "article",
      "tesla_model_y",
    ),
    null,
  );
  assert.equal(
    resolveAsset([a], "test", "article", "tesla_model_y")?.id,
    "test",
  );
});
test("structured values and unknown booleans render as readable text", () => {
  assert.equal(readableValue(null), "Needs confirmation");
  assert.match(readableValue({ seats: 6 }), /seats: 6/);
  assert.ok(
    cars.every((c) =>
      pack(c.id, snapshot).features.every((f) => typeof f.value === "string"),
    ),
  );
});

test("screenshot criteria are covered exactly once in the seven buyer chapters", async () => {
  const { chapters, orderChapters } = await import("../src/lib/chapters");
  const keys = chapters.flatMap((c) => c.features);
  assert.deepEqual(
    [...keys].sort(),
    snapshot.data.criteria.map((c) => c.key).sort(),
  );
  assert.equal(new Set(keys).size, keys.length);
  assert.deepEqual(
    chapters.slice(0, 4).map((c) => c.category),
    ["Price", "Automated driving", "Range and charging", "Family space"],
  );
  assert.equal(orderChapters("Price")[0].category, "Price");
  assert.equal(orderChapters("Software")[0].category, "Price");
  assert.equal(orderChapters("Software")[1].category, "Automated driving");
  assert.equal(orderChapters("Software")[2].category, "Software");
  assert.deepEqual(chapters[1].features, [
    "adas_optional",
    "adas_standard",
    "driver_alerts",
    "parking_cameras",
    "remote_summon",
    "auto_shift",
    "traffic_light_chime",
  ]);
});
test("fresh research keeps subscription, adapter and device limits", () => {
  const y = sourcePack(BASELINE),
    s = sourcePack(CHALLENGER);
  const byKey = (key: string) => y.features.find((f) => f.criterion === key)!;
  assert.equal(byKey("remote_summon").status, "unavailable");
  assert.match(byKey("remote_summon").value, /Upcoming in Australia/);
  assert.match(byKey("adas_optional").conditions, /HW4-only/);
  assert.match(byKey("voice_assistant").conditions, /2026.2.6/);
  assert.equal(
    sourcePack("tesla_model_y__l_premium_awd__4").features.find(
      (f) => f.criterion === "v2l",
    )!.status,
    "optional",
  );
  assert.equal(
    s.features.find((f) => f.criterion === "phone_key")!.status,
    "standard",
  );
});

test("driving qualifications do not assign Model Y L rollout limits to other cars", () => {
  for (const car of cars.filter((c) => c.brand !== "Tesla")) {
    const features = pack(car.id, snapshot).features.filter((f) =>
      ["adas_optional", "remote_summon"].includes(f.criterion),
    );
    for (const feature of features) {
      assert.doesNotMatch(feature.conditions, /Model Y L FSD activation/);
      assert.doesNotMatch(feature.conditions, /Minimum evidence counts/);
    }
  }
});
test("operating thresholds stay distinct from feature availability and unverified automation", () => {
  const s = sourcePack(CHALLENGER);
  const feature = (key: string) => s.features.find((f) => f.criterion === key)!;
  assert.equal(feature("v2l").status, "standard");
  assert.match(feature("v2l").value, /3.3 kW.*15%/);
  assert.match(
    feature("battery_preconditioning_navigation").value,
    /above 40%/,
  );
  assert.equal(feature("walk_away_lock").status, "unavailable");
  assert.equal(feature("walk_away_lock").confirmation_needed, undefined);
  assert.equal(feature("safety_ancap").status, "standard");
  assert.equal(
    feature("driver_profiles_local").value,
    "2 seat-and-mirror memory positions",
  );
});

test("current reviewed claims retain incompatible bases, paid adapters and operating limits", () => {
  // Fresh maker reviews establish matching WLTP range, but not cargo methods.
  assert.equal(
    y.car.facts.range_km.comparisonBasis,
    s.car.facts.range_km.comparisonBasis,
  );
  assert.equal(
    compareFacts(y.car.facts.range_km, s.car.facts.range_km).state,
    "comparable",
  );
  assert.equal(
    compareFacts(y.car.facts.range_km, s.car.facts.range_km).delta,
    Number(s.car.facts.range_km.value) - Number(y.car.facts.range_km.value),
  );
  assert.equal(
    compareFacts(y.car.facts.boot_l, s.car.facts.boot_l).state,
    "different_basis",
  );
  assert.equal(
    compareFacts(y.car.facts.boot_l, s.car.facts.boot_l).delta,
    undefined,
  );
  assert.equal(
    compareFacts(y.car.facts.dc_charge_time_min, s.car.facts.dc_charge_time_min)
      .delta,
    undefined,
  );
  assert.ok(
    s.car.facts.range_km.sourceIds.some((id) =>
      id.startsWith("m1-byd-2026-10-14-"),
    ),
  );
  const adapter = pack(
    "tesla_model_y__l_premium_awd__4",
    snapshot,
  ).features.find((feature) => feature.criterion === "v2l")!;
  assert.equal(adapter.buyerGrade, "check");
  assert.notEqual(adapter.status, "standard");
  assert.match(adapter.conditions, /adapter is sold separately/i);
  const v2l = s.features.find((feature) => feature.criterion === "v2l")!;
  assert.match(String(v2l.value), /3.3 kW.*15%/);
  assert.match(
    s.features.find(
      (feature) => feature.criterion === "battery_preconditioning_navigation",
    )!.value,
    /above 40%/,
  );
  assert.equal(
    s.features.find((feature) => feature.criterion === "walk_away_lock")!
      .status,
    "unavailable",
  );
});
test("brochure trim coverage and structured warranty facts are preserved", () => {
  const regular = pack("zeekr_7x__rwd__1", snapshot);
  assert.match(
    String(regular.car.facts.warranty.value),
    /5 years \/ unlimited km/,
  );
  assert.match(
    String(regular.car.facts.battery_warranty.value),
    /8 years \/ 160,000 km/,
  );
  assert.equal(
    regular.features.find((f) => f.criterion === "v2l")!.status,
    "standard",
  );
  assert.ok(
    !pack("zeekr_7x__black_special_edition_awd__4", snapshot)
      .features.find((f) => f.criterion === "v2l")!
      .source_ids.includes("r4_zeekr_spec"),
  );
  const sourceIds = new Set(snapshot.data.sources.map((s) => s.id));
  for (const c of cars)
    for (const f of pack(c.id, snapshot).features) {
      assert.ok(
        f.source_ids.every((id) => sourceIds.has(id)),
        `${c.id}/${f.criterion}`,
      );
    }
});

test("original buyer audit rows preserve source lineage and explicitly hold unaudited figures", () => {
  const y = sourcePack(BASELINE);
  const s = sourcePack(CHALLENGER);
  const added = [
    "driveaway_price",
    "insurance_cost",
    "real_world_range",
    "energy_use",
    "child_seats",
    "spare_tyre",
  ];
  for (const c of sourceSnapshot.cars.filter(
    (c) => c.researchStage !== "partial",
  )) {
    const p = sourcePack(c.id);
    for (const key of added) {
      const f = p.features.find((x) => x.criterion === key)!;
      assert.ok(f.value, `${c.id}/${key}`);
      if (f.status === "not_verified")
        assert.equal(f.verification_state, "full_text_audit_2026-10-08");
      assert.ok(f.source_ids.length, `${c.id}/${key} has no source`);
    }
    for (const key of [
      "ground_clearance_mm",
      "turning_circle_m",
      "kerb_weight_kg",
      "towing_unbraked_kg",
    ])
      if (c.facts[key].value === null) {
        assert.equal(c.facts[key].status, "not_verified");
        assert.ok(c.facts[key].qualifications.length);
      } else
        assert.equal(typeof c.facts[key].value, "number", `${c.id}/${key}`);
  }
  const price = (id: string) =>
    sourcePack(id).features.find((f) => f.criterion === "driveaway_price")!;
  assert.equal(price(BASELINE).value, "Request a current driveaway quote");
  // Licensed industry-data estimates are held pending maker evidence or permission.
  assert.equal(
    price("tesla_model_y__performance_awd__3").status,
    "not_verified",
  );
  const fbt = (id: string) =>
    sourcePack(id).features.find((f) => f.criterion === "novated_fbt")!;
  assert.equal(fbt(BASELINE).status, "not_verified");
  assert.match(
    fbt("tesla_model_y__l_premium_awd__4").conditions,
    /not established.*law/,
  );
  assert.match(
    y.features.find((f) => f.criterion === "real_world_range")!.value,
    /450 km/,
  );
  assert.equal(
    compareFacts(y.car.facts.kerb_weight_kg, s.car.facts.kerb_weight_kg).state,
    "unknown",
  );
});

test("every exact-trim fact has a meaningful scope even when generation metadata is absent", () => {
  for (const car of cars) {
    assert.ok(car.generation && car.generation !== "undefined", car.id);
    for (const fact of Object.values(car.facts))
      assert.ok(
        fact.scope && fact.scope !== "undefined",
        `${car.id}/${fact.key}`,
      );
  }
});

test("every exact trim has a unique stable detail URL", () => {
  const paths = cars.map((c) => `${c.family}/${c.slug}`);
  assert.equal(new Set(paths).size, paths.length);
});
