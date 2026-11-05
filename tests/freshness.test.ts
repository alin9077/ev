import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { evidenceFreshness, freshnessWindowDays } from "../src/lib/freshness";
import { rankAttribute, filterDiscoveryCars } from "../src/lib/discovery";
import {
  buildBuyerSummaries,
  currentBuyerSummary,
  type SellingPointProposal,
} from "../src/lib/selling-points";
import { FreshnessLabel } from "../src/components/freshness-label";
import { formatFact } from "../src/lib/compare";
import type { Car, Fact, Source } from "../src/lib/types";
const checkedAt = "2026-10-10";
const source: Source = {
  id: "maker",
  url: "https://maker.example/au",
  title: "Australian specification",
  publisher: "Maker",
  source_type: "manufacturer",
  published_date: null,
  accessed_date: checkedAt,
  market: "AU",
  supports: "Named version",
};
function fixture() {
  const fact = (key: string, value: number, unit: string): Fact => ({
    key,
    value,
    unit,
    label: key,
    basis: "published",
    comparisonBasis: key === "price_aud" ? "before on-road costs" : "same",
    status: "standard",
    market: "AU",
    scope: "Exact version",
    date: checkedAt,
    sourceIds: [source.id],
    qualifications: [],
    issues: [],
  });
  const car: Car = {
    id: "test",
    brand: "Maker",
    model: "Car",
    trim: "Base",
    modelId: "car",
    family: "car",
    slug: "base",
    generation: "Current",
    year: 2026,
    drive: "RWD",
    availability: "current_or_order_listed",
    vehicleClass: "passenger",
    availabilityEvidence: {
      checkedAt,
      orderStatus: "listed",
      stockStatus: "unverified",
      sourceIds: [source.id],
    },
    facts: {
      price_aud: fact("price_aud", 45000, "AUD"),
      range_km: fact("range_km", 450, "km"),
      seats: fact("seats", 5, "people"),
    },
    issues: [],
  };
  const dependency = (key: string) => ({
    id: key,
    kind: "fact",
    variantId: car.id,
    key,
    expectedValue: car.facts[key].value,
    expectedStatus: "standard",
    expectedUnit: car.facts[key].unit,
    expectedBasis: "published",
    expectedQualifications: [],
    expectedEffectiveFact: structuredClone(car.facts[key]),
    checkedAt,
    sourceIds: [source.id],
  });
  const proposal: SellingPointProposal = {
    dependencies: [
      dependency("range_km"),
      dependency("price_aud"),
      {
        id: "my",
        kind: "variant_property",
        variantId: car.id,
        key: "model_year",
        expectedValue: 2026,
        sourceIds: [source.id],
        checkedAt,
      },
    ],
    records: [
      {
        variantId: car.id,
        checkedAt,
        modelYearDependency: "my",
        expectedAvailabilityEvidence: structuredClone(car.availabilityEvidence),
        availabilityGuardSourceIds: [source.id],
        requiredVisibleConditions: [],
        strength: {
          label: "Range reason",
          text: "450 km published range",
          dependencyIds: ["range_km"],
        },
        tradeoff: {
          label: "Price trade-off",
          text: "A$45,000 before on-road costs",
          dependencyIds: ["price_aud"],
        },
      },
    ],
  };
  return { car, proposal };
}

test("price and availability have 45 days; dynamic specs 180; dimensions and ownership 365", () => {
  for (const key of [
    "price_aud",
    "mrlp_aud",
    "advertised_dealer_offer_aud",
    "availability",
    "source_national_driveaway_aud",
  ])
    assert.equal(freshnessWindowDays(key), 45, key);
  for (const key of [
    "range_km",
    "battery_kwh",
    "dc_charge_time_min",
    "ac_kw",
    "zero_to_100_s",
    "motor_power_kw",
    "equipment_front_heated_seats",
    "front_heated_seats",
    "cargo_lamps",
    "storage_box_included",
    "equipment_seat_count",
  ])
    assert.equal(freshnessWindowDays(key), 180, key);
  for (const key of [
    "length_mm",
    "width_mm",
    "height_mm",
    "wheelbase_mm",
    "seats",
    "boot_l",
    "cargo_volume_l",
    "max_total_cargo_l",
    "tub_volume_l",
    "approved_seat_count",
    "under_seat_storage_l",
    "source_cargo_seats_down_l",
    "unknown_seating_capacity",
    "towing_braked_kg",
    "warranty",
    "battery_warranty_years",
    "source_vehicle_warranty",
    "model_year",
  ])
    assert.equal(freshnessWindowDays(key), 365, key);
});

test("each window is inclusive and rejects future or invalid dates", () => {
  for (const [key, last, stale] of [
    ["price_aud", "2026-11-24", "2026-11-25"],
    ["range_km", "2027-04-08", "2027-04-09"],
    ["seats", "2027-10-10", "2027-10-11"],
  ]) {
    assert.equal(evidenceFreshness(checkedAt, key, last).fresh, true);
    assert.equal(evidenceFreshness(checkedAt, key, stale).fresh, false);
    assert.equal(evidenceFreshness(checkedAt, key, stale).expiresOn, last);
    assert.equal(evidenceFreshness(checkedAt, key, stale).staleOn, stale);
    for (const date of ["", "invalid", "2026-02-30", "2026-10-11"])
      assert.equal(evidenceFreshness(date, key, checkedAt).fresh, false, date);
  }
  assert.equal(
    evidenceFreshness(checkedAt, "seats", "2026-10-11", true).fresh,
    false,
  );
  assert.equal(
    evidenceFreshness(checkedAt, "battery_warranty_years", "2026-10-11", true)
      .fresh,
    false,
  );
});

test("December retains every card and numeric attribute row; stale prices never receive rank", () => {
  const { car } = fixture();
  const policy = { asOf: "2026-12-01" };
  assert.deepEqual(filterDiscoveryCars([car], "", "", false, policy), [car]);
  for (const key of ["price_aud", "range_km", "seats"] as const) {
    const ranking = rankAttribute([car], [source], key, policy);
    if (key === "price_aud") {
      assert.equal(ranking.groups.length, 0);
      assert.equal(ranking.unranked.length, 1);
      assert.equal(ranking.unranked[0].fact.value, car.facts[key].value);
      assert.equal("rank" in ranking.unranked[0], false);
    } else {
      assert.equal(
        ranking.groups[0].entries[0].fact.value,
        car.facts[key].value,
      );
    }
  }
  assert.equal(formatFact(car.facts.price_aud, policy.asOf), "A$45,000");
});

test("a fresh availability check preserves range and seats ranks without revalidating an old price", () => {
  const { car } = fixture();
  car.availabilityEvidence!.checkedAt = "2026-12-01";
  car.availabilityEvidence!.sourceIds = ["availability"];
  const sources = [
    source,
    { ...source, id: "availability", accessed_date: "2026-12-01" },
  ];
  const policy = { asOf: "2026-12-01", maxAgeDays: 30 };
  for (const key of ["range_km", "seats"] as const)
    assert.equal(
      rankAttribute([car], sources, key, policy).groups[0].entries[0].rank,
      1,
    );
  const prices = rankAttribute([car], sources, "price_aud", policy);
  assert.equal(prices.groups.length, 0);
  assert.equal(prices.unranked[0].fact.value, 45000);
});

test("source access dates use the fact window and do not silently refresh evidence", () => {
  const { car } = fixture();
  delete car.availabilityEvidence;
  car.facts.range_km.date = "2026-12-01";
  assert.equal(
    rankAttribute([car], [source], "range_km", { asOf: "2026-12-01" }).groups
      .length,
    1,
  );
  assert.equal(
    rankAttribute(
      [car],
      [{ ...source, accessed_date: "2026-03-01" }],
      "range_km",
      { asOf: "2026-12-01" },
    ).groups.length,
    0,
  );
});

test("December preserves fact-dependent strength while price-dependent trade-off ages out", () => {
  const { car, proposal } = fixture();
  const cached = buildBuyerSummaries([car], [], [source], proposal, {
    asOf: checkedAt,
  }).get(car.id)!;
  const december = { asOf: "2026-12-01" };
  const live = buildBuyerSummaries([car], [], [source], proposal, december).get(
    car.id,
  )!;
  assert.equal(live.strength?.label, "Range reason");
  assert.equal(live.tradeoff, undefined);
  assert.deepEqual(currentBuyerSummary(cached, [source], december), live);
  assert.ok(
    currentBuyerSummary(cached, [source], { asOf: "2027-04-08" })?.strength,
  );
  assert.equal(
    currentBuyerSummary(cached, [source], { asOf: "2027-04-09" }),
    undefined,
  );
  car.year = 2027;
  assert.equal(
    buildBuyerSummaries([car], [], [source], proposal, december).has(car.id),
    false,
  );
});

test("older published dates turn amber with their checked-on date", () => {
  const markup = renderToStaticMarkup(
    createElement(FreshnessLabel, {
      checkedAt,
      factKey: "price_aud",
      asOf: "2026-12-01",
    }),
  );
  assert.match(markup, /evidence-stale/);
  assert.match(markup, /Checked on 2026-10-10/);
  assert.match(markup, /Needs a fresh check/);
  const fresh = renderToStaticMarkup(
    createElement(FreshnessLabel, {
      checkedAt,
      factKey: "range_km",
      asOf: "2026-12-01",
    }),
  );
  assert.doesNotMatch(fresh, /evidence-stale/);
});

test("the complete catalogue remains navigable on 1 December with every published numeric figure retained", async () => {
  const { catalogue, research } = await import("../src/lib/data");
  const { attributes, discoveryCars } = await import("../src/lib/discovery");
  const allCars = catalogue();
  const sources = research().sources;
  const visible = discoveryCars(allCars);
  const policy = { asOf: "2026-12-01" };
  assert.deepEqual(
    filterDiscoveryCars(visible, "", "all", false, policy).map((car) => car.id),
    allCars.map((car) => car.id),
  );
  assert.deepEqual(
    filterDiscoveryCars(visible, "", "", false, policy).map((car) => car.id),
    allCars.filter((car) => !car.vehicleClass || ["passenger", "ute"].includes(car.vehicleClass)).map((car) => car.id),
  );
  for (const attribute of attributes) {
    const result = rankAttribute(visible, sources, attribute.key, policy);
    const numeric = visible.filter(
      (car) =>
        typeof car.facts[attribute.key]?.value === "number" &&
        Number.isFinite(car.facts[attribute.key].value),
    );
    const ranked = result.groups.flatMap((group) => group.entries);
    if (["range_km", "seats", "towing_braked_kg"].includes(attribute.key))
      assert.ok(ranked.length > 0, attribute.key + " stays populated");
    assert.deepEqual(
      new Set([...ranked, ...result.unranked].map((entry) => entry.car.id)),
      new Set(numeric.map((car) => car.id)),
      attribute.key,
    );
    for (const entry of ranked) {
      assert.ok(
        evidenceFreshness(entry.fact.date, entry.fact.key, policy.asOf).fresh,
      );
    }
    for (const entry of result.unranked) assert.equal("rank" in entry, false);
    if (attribute.key === "price_aud") {
      assert.ok(result.unranked.length > 0);
      for (const entry of result.unranked.filter(
        (entry) => entry.fact.validUntil && entry.fact.validUntil < policy.asOf,
      ))
        assert.match(formatFact(entry.fact, policy.asOf), /Expired offer/);
    }
  }
  const rangeReasons = allCars.filter(
    (car) =>
      car.buyerSummary?.strength?.freshness?.every(
        (item) =>
          evidenceFreshness(item.checkedAt, item.key, policy.asOf).fresh,
      ) && car.availability === "current_or_order_listed",
  );
  assert.ok(rangeReasons.length > 0);
  assert.ok(
    rangeReasons.some(
      (car) => currentBuyerSummary(car.buyerSummary, sources, policy)?.strength,
    ),
  );
});

test("known model-year changes stop long-lived fact rankings without changing the value or checked date", async () => {
  const { factFreshness } = await import("../src/lib/freshness");
  const { car } = fixture();
  const original = { ...car.facts.seats };
  car.facts.seats.modelYearChangedAt = "2026-10-12";
  assert.equal(factFreshness(car.facts.seats, "2026-10-11").fresh, true);
  assert.equal(factFreshness(car.facts.seats, "2026-10-12").fresh, false);
  const result = rankAttribute([car], [source], "seats", {
    asOf: "2026-10-13",
  });
  assert.equal(result.groups.length, 0);
  assert.equal(result.unranked[0].fact.value, original.value);
  assert.equal(result.unranked[0].fact.date, original.date);
  const markup = renderToStaticMarkup(
    createElement(FreshnessLabel, {
      checkedAt,
      factKey: "seats",
      asOf: "2026-10-13",
      modelYearChangedAt: "2026-10-12",
    }),
  );
  assert.match(markup, /evidence-stale/);
});

test("a sourced model-year change survives discovery, portable packs and citable exports", async () => {
  const { discoveryCars } = await import("../src/lib/discovery");
  const { storePortablePacks, hydratePortablePacks } =
    await import("../src/lib/portable-packs");
  const { encodePortableJson, parsePortableData } =
    await import("../src/lib/portable-string-codec");
  const { factClaim } = await import("../src/lib/citable");
  const { factFreshness } = await import("../src/lib/freshness");
  const { car } = fixture();
  car.facts.seats.modelYearChangedAt = "2026-10-12";
  const pack = {
    car,
    features: [],
    sources: [source],
    events: [],
    configuration: [],
    eligibility: {},
  } as unknown as import("../src/lib/types").Pack;
  const input = {
    packs: storePortablePacks({ [car.id]: pack }),
    sources: [source],
  };
  const decoded = parsePortableData(
    encodePortableJson(JSON.stringify(input)).json,
  ) as typeof input;
  const restored = hydratePortablePacks(decoded.packs, decoded.sources)[car.id];
  for (const fact of [
    discoveryCars([car])[0].facts.seats,
    restored.car.facts.seats,
  ]) {
    assert.deepEqual(fact, car.facts.seats);
    assert.equal(factFreshness(fact, "2026-10-13").fresh, false);
  }
  const claim = factClaim(restored, restored.car.facts.seats);
  assert.equal(
    JSON.parse(JSON.stringify(claim)).modelYearChangedAt,
    "2026-10-12",
  );
  assert.match(claim.sentence, /Known model-year change: 2026-10-12/);
  assert.equal(claim.evidenceDate, checkedAt);
  assert.equal(claim.status, "standard");
  assert.equal("modelYearChangedAt" in car.facts.range_km, false);
});

test("actual feature display applies price 45 and warranty 365 windows from the criterion", async () => {
  const { compiledSource } = await import("./helpers/compiled-source");
  const { FeatureValue } = compiledSource("src/components/ui.tsx", {
    "./freshness-label": {
      FreshnessLabel: (props: Parameters<typeof FreshnessLabel>[0]) =>
        createElement(FreshnessLabel, { ...props, asOf: "2026-12-01" }),
    },
  }) as { FeatureValue: typeof import("../src/components/ui").FeatureValue };
  const feature: import("../src/lib/types").Feature = {
    variant_id: "test",
    model_id: "car",
    criterion: "driveaway_price",
    status: "standard",
    value: "A$45,000",
    conditions: "",
    source_ids: [],
    evidence_scope: "Exact version",
    last_evidence_date: checkedAt,
    reviewed_date: checkedAt,
    verification_state: "verified",
  };
  const price = renderToStaticMarkup(createElement(FeatureValue, { feature }));
  assert.match(price, /A\$45,000/);
  assert.match(price, /evidence-stale/);
  assert.match(price, /Checked on 2026-10-10/);
  for (const criterion of ["warranty_service", "roadside_assistance"]) {
    const warranty = renderToStaticMarkup(
      createElement(FeatureValue, {
        feature: { ...feature, criterion, value: "Five years" },
      }),
    );
    assert.match(warranty, /Five years/);
    assert.doesNotMatch(warranty, /evidence-stale/);
  }
});

test("feature-dependent summaries use the criterion window rather than one equipment window", () => {
  const { car, proposal } = fixture();
  const feature: import("../src/lib/types").Feature = {
    variant_id: car.id,
    model_id: car.modelId,
    criterion: "driveaway_price",
    status: "standard",
    value: "A$45,000",
    conditions: "",
    source_ids: [source.id],
    evidence_scope: "Exact version",
    last_evidence_date: checkedAt,
    reviewed_date: checkedAt,
    verification_state: "verified",
  };
  proposal.dependencies.push({
    id: "price-feature",
    kind: "feature",
    variantId: car.id,
    key: feature.criterion,
    expectedValue: feature.value,
    expectedStatus: feature.status,
    expectedConditions: feature.conditions,
    sourceIds: feature.source_ids,
    checkedAt,
  });
  proposal.records[0].tradeoff!.dependencyIds = ["price-feature"];
  const cached = buildBuyerSummaries([car], [feature], [source], proposal, {
    asOf: checkedAt,
  }).get(car.id)!;
  assert.ok(cached.tradeoff);
  assert.equal(
    currentBuyerSummary(cached, [source], { asOf: "2026-12-01" })?.tradeoff,
    undefined,
  );
  assert.equal(
    buildBuyerSummaries([car], [feature], [source], proposal, {
      asOf: "2026-12-01",
    }).get(car.id)?.tradeoff,
    undefined,
  );
});

test("all catalogue volume, body-geometry and seat-count fields use 365 days without promoting equipment", async () => {
  const { catalogue } = await import("../src/lib/data");
  let volumes = 0,
    geometry = 0,
    seating = 0;
  for (const car of catalogue())
    for (const fact of Object.values(car.facts)) {
      // Components such as brake discs and shock travel are equipment; body
      // geometry and cabin/cargo measurements use the longer specification window.
      const hardware = /(^|_)equipment(_|$)|brake|shock|wheel_travel/.test(
        fact.key,
      );
      const volume = ["L", "m3", "m³"].includes(fact.unit) && !hardware;
      const body = fact.unit === "mm" && !hardware;
      const seats =
        !hardware &&
        (["seats", "people"].includes(fact.unit) ||
          (typeof fact.value === "number" && /(^|\s)seats$/i.test(fact.label)));
      if (volume || body || seats) {
        assert.equal(
          freshnessWindowDays(fact.key),
          365,
          `${car.id}: ${fact.key} (${fact.unit})`,
        );
        if (volume) volumes++;
        if (body) geometry++;
        if (seats) seating++;
      }
    }
  assert.ok(volumes > 0 && geometry > 0 && seating > 0);
  for (const key of [
    "cargo_cover",
    "cargo_light",
    "cargo_tie_down_count",
    "cargo_bag_hook_count",
    "luggage_net",
    "source_heated_front_seats",
    "second_row_relaxation_seats",
    "front_brake_diameter_mm",
    "rear_shock_travel_mm",
    "source_catalogue_equipment_rear_seats",
    "equipment_suspension_height_adjustment",
  ])
    assert.equal(freshnessWindowDays(key), 180, key);
  for (const key of [
    "cargo_measurement_method",
    "source_catalogue_cargo_method",
    "source_manual_technical_seating_claim",
    "source_fonz_z_fit_seating",
    "source_city_specifications_euro_pallet_capacity",
    "option_0_seats",
  ])
    assert.equal(freshnessWindowDays(key), 365, key);
});
