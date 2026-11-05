import test from "node:test";
import assert from "node:assert/strict";
import {
  decideRetainedFactGrade,
  withoutStandingCaveats,
} from "../src/lib/evidence-regrade-policy";
import {
  applyEvidenceRegrading,
  evidenceDigest,
  type RegradingOverlay,
} from "../src/lib/evidence-regrading";
import { buyerGradeOf, hasEarnedBuyerGrade } from "../src/lib/evidence-grading";
import { discoveryCars, rankAttribute } from "../src/lib/discovery";
import type { Car, Fact, Source } from "../src/lib/types";
const maker: Source = {
  id: "maker",
  url: "https://maker.example/au/specifications",
  title: "Australian exact-grade specification",
  publisher: "Maker Australia",
  source_type: "manufacturer_primary_AU",
  market: "AU",
  published_date: null,
  accessed_date: "2026-10-10",
  supports: "Exact Australian version",
};
const media: Source = {
  ...maker,
  id: "media",
  url: "https://media.example/car",
  publisher: "Australian Review",
  source_type: "secondary_report",
};
const sources = [maker, media];
const fact = (changes: Partial<Fact> = {}): Fact => ({
  key: "range_km",
  label: "Claimed range",
  value: 500,
  unit: "km",
  basis: "WLTP combined",
  comparisonBasis: "WLTP combined",
  status: "conditional",
  sourceIds: ["maker"],
  date: "2026-10-10",
  market: "AU",
  scope: "Maker Example Base Australian specification",
  qualifications: [
    "Manufacturer model year is unconfirmed; a dealer-advertised MY does not establish this specification’s model year.",
    "Laboratory range declaration; real-world range varies.",
  ],
  issues: [],
  ...changes,
});
const car = (id: string, f: Fact): Car => ({
  id,
  modelId: "example",
  model: "Example",
  family: "example",
  slug: id,
  brand: "Maker",
  trim: id,
  generation: "Current",
  year: null,
  availability: "current_or_order_listed",
  drive: "RWD",
  facts: { range_km: f },
  issues: [],
  vehicleClass: "passenger",
  availabilityEvidence: {
    checkedAt: "2026-10-10",
    orderStatus: "listed",
    stockStatus: "unverified",
    sourceIds: ["maker"],
  },
});
const decide = (f: Fact) =>
  decideRetainedFactGrade(f, new Map(sources.map((s) => [s.id, s])))!;
function reviewedCar(id: string, f: Fact): Car {
  const decision = decide(f);
  const overlay: RegradingOverlay = {
    id: "review",
    reviewedAt: "2026-10-13",
    standingNote: "Standing caveats",
    sourceDigests: Object.fromEntries(
      sources.map((s) => [s.id, evidenceDigest(s)]),
    ),
    facts: [
      { variantId: id, key: f.key, before: evidenceDigest(f), ...decision },
    ],
    features: [],
  };
  return applyEvidenceRegrading([car(id, f)], sources, overlay)[0];
}
test("generic model year and laboratory disclaimers do not demote a sourced exact-version number", () => {
  const f = fact();
  const before = structuredClone(f);
  const graded = reviewedCar("a", f).facts.range_km;
  assert.equal(graded.buyerGrade, "confirmed");
  assert.equal(graded.status, "standard");
  assert.deepEqual(graded.qualifications, []);
  assert.equal(graded.date, "2026-10-10");
  assert.equal(graded.gradeReview?.reviewedAt, "2026-10-13");
  assert.deepEqual(f, before);
  assert.equal(hasEarnedBuyerGrade(graded, sources, "2026-10-13"), true);
});
test("real wheel options, charging methods and model-year conflicts remain Check", () => {
  for (const f of [
    fact({
      qualifications: [
        "Exact wheel configuration not established; optional 21-inch wheels change range.",
      ],
    }),
    fact({
      qualifications: [
        "MY27 specifications are explicitly provisional; inspections pending.",
      ],
    }),
    fact({
      key: "dc_charge_time_min",
      unit: "min",
      value: 28,
      basis: "10–80% at 350 kW station",
      qualifications: ["23 °C battery temperature"],
    }),
  ])
    assert.equal(decide(f).grade, "check");
  const condition =
    "Applies to production from July 2026; earlier model-year suspension dimensions differ.";
  assert.equal(withoutStandingCaveats(condition), condition);
});
test("secondary and mixed maker/secondary evidence never silently becomes Confirmed", () => {
  for (const sourceIds of [["media"], ["maker", "media"]])
    assert.equal(
      decide(fact({ sourceIds, status: "standard", qualifications: [] })).grade,
      "reported",
    );
  const forged = {
    ...fact(),
    buyerGrade: "confirmed" as const,
    gradeReview: {
      reviewedAt: "2026-10-13",
      overlayId: "forged",
      reason: "A source exists",
      evidenceScope: "exact_au_version" as const,
      sourceIds: ["media"],
    },
  };
  assert.equal(hasEarnedBuyerGrade(forged, sources, "2026-10-13"), false);
});
test("sibling borrowing remains Reported; an explicit maker range-wide body figure is Confirmed", () => {
  assert.equal(
    decide(
      fact({
        key: "length_mm",
        unit: "mm",
        value: 4500,
        basis: "Sibling trim carried from another version",
        qualifications: [],
      }),
    ).grade,
    "reported",
  );
  const result = decide(
    fact({
      key: "length_mm",
      unit: "mm",
      value: 4500,
      basis:
        "Manufacturer range-wide exterior length; shared row for all variants",
      qualifications: [],
    }),
  );
  assert.equal(result.grade, "confirmed");
  assert.equal(result.evidenceScope, "explicit_au_range");
});
test("unknown is not Not published and a single missing-data citation is not a completed search", () => {
  const unknown = fact({ value: null, status: "not_verified", sourceIds: [] });
  assert.equal(decideRetainedFactGrade(unknown, new Map()), undefined);
  assert.equal(buyerGradeOf(unknown), undefined);
  assert.equal(
    hasEarnedBuyerGrade(
      {
        ...unknown,
        buyerGrade: "not_published",
        gradeReview: {
          reviewedAt: "2026-10-13",
          overlayId: "review",
          reason: "No figure found",
          evidenceScope: "searched_not_found",
          sourceIds: ["maker"],
        },
      },
      sources,
      "2026-10-13",
    ),
    false,
  );
});
test("exact fact and source drift withdraw an earned grade without throwing or changing the new evidence", () => {
  const original = fact();
  const decision = decide(original);
  const overlay: RegradingOverlay = {
    id: "review",
    reviewedAt: "2026-10-13",
    standingNote: "Note",
    sourceDigests: { maker: evidenceDigest(maker) },
    facts: [
      {
        variantId: "a",
        key: "range_km",
        before: evidenceDigest(original),
        ...decision,
      },
    ],
    features: [],
  };
  const corrected = fact({ value: 490 });
  assert.deepEqual(
    applyEvidenceRegrading([car("a", corrected)], sources, overlay)[0].facts
      .range_km,
    {
      ...corrected,
      buyerGrade: undefined,
      gradeReview: undefined,
      gradeReviewStatus: "review_required",
    },
  );
  assert.equal(
    applyEvidenceRegrading(
      [car("a", original)],
      [{ ...maker, supports: "Revised publication" }],
      overlay,
    )[0].facts.range_km.buyerGrade,
    undefined,
  );
});
test("same-basis Confirmed and Check values rank together; Reported is visible and unranked", () => {
  const a = reviewedCar("confirmed", fact());
  const b = reviewedCar(
    "check",
    fact({
      value: 510,
      qualifications: [
        "Exact wheel configuration not established; optional 21-inch wheels change range.",
      ],
    }),
  );
  const c = reviewedCar("reported", fact({ sourceIds: ["media"], value: 700 }));
  const result = rankAttribute([a, b, c], sources, "range_km", {
    asOf: "2026-10-13",
  });
  assert.equal(result.groups.length, 1);
  assert.deepEqual(
    result.groups[0].entries.map((row) => row.car.id),
    ["check", "confirmed"],
  );
  assert.equal(result.unranked[0].car.id, "reported");
  assert.equal(result.unranked[0].fact.value, 700);
  assert.match(result.unranked[0].reason, /Reported/);
});
test("grading never changes availability, bounded configuration gates or stale rank rules", () => {
  const a = reviewedCar("a", fact());
  const bounded = {
    ...a,
    configurationEvidence: {
      rankingEligible: false,
      completeVehicleCountEligible: false,
      projectionScope: "Bounded",
    },
  };
  assert.equal(
    rankAttribute([bounded], sources, "range_km", { asOf: "2026-10-13" }).groups
      .length,
    0,
  );
  const stale = rankAttribute([a], sources, "range_km", { asOf: "2027-05-01" });
  assert.equal(stale.groups.length, 0);
  assert.equal(stale.unranked[0].fact.value, 500);
});
test("initial grades preserve source summaries while reviewed brand packets replace only their own copy", async () => {
  const { catalogue, sourceCatalogue, sourceResearch, research, pack } =
    await import("../src/lib/data");
  const original = sourceCatalogue();
  const { applyRetainedFactFills } =
    await import("../src/lib/retained-fact-fills");
  const { applyPriceLadder } = await import("../src/lib/price-ladder");
  const { brandUpdatePackets } =
    await import("../src/lib/brand-update-registry");
  const initialSources = sourceResearch().sources;
  const initial = applyEvidenceRegrading(
    applyRetainedFactFills(original, initialSources).map((car) =>
      applyPriceLadder(car, initialSources),
    ),
    initialSources,
  );
  const effective = catalogue();
  const reviewedSummaries = new Map(
    brandUpdatePackets.flatMap((packet) =>
      packet.summaries.map((row) => [row.variantId, { row, packet }] as const),
    ),
  );
  for (const car of original) {
    const current = effective.find((row) => row.id === car.id)!;
    assert.deepEqual(
      initial.find((row) => row.id === car.id)!.buyerSummary,
      car.buyerSummary,
    );
    const reviewed = reviewedSummaries.get(car.id);
    if (reviewed) {
      assert.equal(current.buyerSummary?.checkedAt, reviewed.packet.reviewedAt);
      assert.equal(
        current.buyerSummary?.strength?.text,
        reviewed.row.strength.text,
      );
      assert.equal(
        current.buyerSummary?.tradeoff?.text,
        reviewed.row.tradeoff.text,
      );
      for (const clause of [reviewed.row.strength, reviewed.row.tradeoff])
        for (const dependency of clause.dependencies)
          assert.deepEqual(current.facts[dependency.key], dependency.expected);
    } else assert.deepEqual(current.buyerSummary, car.buyerSummary);
    assert.equal(car.buyerGradesRequired, undefined);
    if (["passenger", "ute"].includes(current.vehicleClass || "passenger"))
      assert.equal(current.buyerGradesRequired, true);
  }
  const tier1 = effective.find((row) => row.buyerGradesRequired)!;
  assert.equal(discoveryCars([tier1])[0].buyerGradesRequired, true);
  const { comparisonPickerCars } = await import("../src/lib/picker-car");
  assert.equal(comparisonPickerCars([tier1])[0].buyerGradesRequired, true);
  const { storePortablePacks, hydratePortablePacks } =
    await import("../src/lib/portable-packs");
  const full = pack(tier1.id, { cars: effective, data: research() });
  const hydrated = hydratePortablePacks(
    JSON.parse(JSON.stringify(storePortablePacks({ [tier1.id]: full }))),
    full.sources,
  );
  assert.equal(hydrated[tier1.id].car.buyerGradesRequired, true);
  const { buyerSummaryCar, softwareTimelinePack } =
    await import("../src/lib/detail-client-props");
  assert.equal(buyerSummaryCar(tier1).buyerGradesRequired, true);
  assert.equal(softwareTimelinePack(full).car.buyerGradesRequired, true);
  // An actual retained standard claim must not regain its old ranking after review drift.
  const sourceRows = research().sources;
  const originallyStandard = rankAttribute(effective, sourceRows, "range_km", {
    // Rank at the date of the newest reviewed packet; claims dated after an
    // earlier as-of are not rankable, which left no Tier 1 candidate.
    asOf: brandUpdatePackets
      .map((packet) => packet.reviewedAt)
      .sort()
      .at(-1)!,
  })
    .groups.flatMap((group) => group.entries)
    .find((entry) => {
      const row = original.find((candidate) => candidate.id === entry.car.id);
      // Review-drift guarding applies to passenger and ute versions only (Tier 1);
      // vans and heavier classes are outside the buyer-grade regrading ledger.
      return (
        ["passenger", "ute"].includes(row?.vehicleClass || "passenger") &&
        row?.facts.range_km.status === "standard"
      );
    });
  assert.ok(
    originallyStandard,
    "Expected a real previously-standard range claim admitted by the reviewed ledger",
  );
  const baselineCar = original.find(
    (row) => row.id === originallyStandard.car.id,
  )!;
  const baselineFact = baselineCar.facts.range_km;
  const changedCar = {
    ...baselineCar,
    facts: {
      ...baselineCar.facts,
      range_km: { ...baselineFact, value: Number(baselineFact.value) + 1 },
    },
  };
  const changedSources = sourceRows.map((source) =>
    baselineFact.sourceIds.includes(source.id)
      ? { ...source, supports: `${source.supports} Revised supporting scope.` }
      : source,
  );
  for (const [input, citations] of [
    [changedCar, sourceRows],
    [baselineCar, changedSources],
  ] as const) {
    const guarded = applyEvidenceRegrading([input], citations)[0];
    const ranks = rankAttribute([guarded], citations, "range_km", {
      asOf: "2026-10-13",
    });
    assert.equal(guarded.facts.range_km.gradeReviewStatus, "review_required");
    assert.equal(guarded.facts.range_km.value, input.facts.range_km.value);
    assert.equal(ranks.groups.length, 0);
    assert.match(ranks.unranked[0].reason, /unreviewed/);
  }
  assert.ok(
    effective.some(
      (row) =>
        row.buyerSummary?.strength &&
        Object.values(row.facts).some((f) => f.buyerGrade === "confirmed"),
    ),
  );
});
test("Tier 1 price rankings have exactly the two price bases across passenger cars and utes", () => {
  const price = (value: number, basis: string) => ({
    ...fact({
      key: "price_aud",
      value,
      unit: "AUD",
      status: "standard",
      qualifications: [],
      basis,
      comparisonBasis: basis,
    }),
    buyerGrade: "confirmed" as const,
  });
  const vehicles = ["Before on-road costs", "Driveaway"].flatMap(
    (basis, index) =>
      ["passenger", "ute"].map((vehicleClass, n) => ({
        ...car(`${index}-${n}`, fact()),
        vehicleClass: vehicleClass as Car["vehicleClass"],
        facts: { price_aud: price(40000 + index * 5000 + n * 1000, basis) },
      })),
  );
  const result = rankAttribute(vehicles, sources, "price_aud", {
    asOf: "2026-10-13",
  });
  assert.equal(result.groups.length, 2);
  assert.ok(
    result.groups.every(
      (group) => group.vehicleClass === "Tier 1" && group.entries.length === 2,
    ),
  );
});
test("production-code mismatches remain Reported while merely unconfirmed delivered VIN stays generic", () => {
  const mismatch = fact({
    key: "battery_kwh",
    value: 83.9,
    unit: "kWh",
    basis: "Gross capacity",
    qualifications: [
      "Named grade in July-effective guide, but inner stale model codes 32FK/42FK require exact order/VIN confirmation",
      "claim attributed only, not confirmed current-code capacity",
    ],
  });
  assert.equal(decide(mismatch).grade, "reported");
  const current = fact({
    key: "battery_kwh",
    value: 54.2,
    unit: "kWh",
    status: "standard",
    basis: "Gross battery capacity",
    qualifications: [
      "PDF p4 Battery Capacity (Gross/Net)",
      "Technical production applicability: from 2026-09; advertisement-to-build equivalence unverified.",
    ],
  });
  assert.equal(decide(current).grade, "confirmed");
});
test("service-contingent extended cover and launch-control output are Check, while base cover stays Confirmed", () => {
  const terms = {
    ...maker,
    id: "warranty",
    title: "Australian warranty terms",
  };
  const index = new Map([[terms.id, terms]]);
  const extension = fact({
    key: "source_mache_vehicle_warranty",
    sourceIds: [terms.id],
    value: { standardYears: 5, conditionalYears: 7 },
    basis:
      "Five-year base; up to seven years conditional on every authorised-dealer service",
    qualifications: [
      "Seven-year coverage requires every service, including in the initial five years, at an authorised Ford dealer.",
    ],
  });
  assert.equal(decideRetainedFactGrade(extension, index)?.grade, "check");
  const base = {
    ...extension,
    value: "5 years / unlimited km base cover",
    basis: "Base vehicle warranty",
  };
  assert.equal(decideRetainedFactGrade(base, index)?.grade, "confirmed");
  assert.equal(
    decide(
      fact({
        key: "power_launch_control_kw",
        value: 500,
        unit: "kW",
        basis: "Overboost power with Launch Control",
        qualifications: ["Not ordinary or continuously available output"],
      }),
    ).grade,
    "check",
  );
});
test("a towing Check number with unstated braking basis remains visible but cannot rank", () => {
  const f = {
    ...fact({
      key: "towing_braked_kg",
      value: 750,
      unit: "kg",
      basis: "Handbook maximum trailer total; braking basis not stated",
      comparisonBasis: "Maximum trailer total",
      status: "conditional",
      qualifications: [],
    }),
    buyerGrade: "check" as const,
  };
  const vehicle = { ...car("tow", f), facts: { towing_braked_kg: f } };
  const result = rankAttribute([vehicle], sources, "towing_braked_kg", {
    asOf: "2026-10-13",
  });
  assert.equal(result.groups.length, 0);
  assert.equal(result.unranked[0].fact.value, 750);
  assert.match(result.unranked[0].reason, /Braked towing measurement basis/);
});
test("actual EV9 GT retained power keeps its future-publication/corroboration Check", async () => {
  const fs = await import("node:fs");
  const ledger = JSON.parse(
    fs.readFileSync("data/m1-retained-fact-fills-2026-10-13.json", "utf8"),
  ) as {
    rows: {
      variantId: string;
      key: string;
      fact: Fact;
      sources: { snapshot: Source }[];
    }[];
  };
  const row = ledger.rows.find(
    (entry) =>
      entry.variantId === "kia_ev9_my26__gt_awd__20261010" &&
      entry.key === "power_kw",
  )!;
  assert.ok(row);
  const decision = decideRetainedFactGrade(
    row.fact,
    new Map(row.sources.map((entry) => [entry.snapshot.id, entry.snapshot])),
  );
  assert.equal(decision?.grade, "check");
  assert.match(decision?.conditionExplanation || "", /future-dated/);
  const range = {
    ...fact(),
    buyerGrade: "check" as const,
    conditionExplanation: decision!.conditionExplanation,
  };
  assert.equal(
    rankAttribute([car("future", range)], sources, "range_km", {
      asOf: "2026-10-13",
    }).groups.length,
    0,
  );
});

test("reviewed Tier 1 claims fail closed after source or fact drift instead of regaining legacy standard ranks", () => {
  const original = fact({ status: "standard", qualifications: [] });
  const overlay: RegradingOverlay = {
    id: "guarded-review",
    reviewedAt: "2026-10-13",
    standingNote: "Note",
    sourceDigests: { maker: evidenceDigest(maker) },
    facts: [
      {
        variantId: "guarded",
        key: original.key,
        before: evidenceDigest(original),
        ...decide(original),
      },
    ],
    features: [],
  };
  const scenarios = [
    { input: car("guarded", { ...original, value: 490 }), sources },
    {
      input: car("guarded", original),
      sources: [{ ...maker, supports: "Revised publication" }, media],
    },
  ];
  for (const scenario of scenarios) {
    const before = structuredClone(scenario.input);
    const effective = applyEvidenceRegrading(
      [scenario.input],
      scenario.sources,
      overlay,
    )[0];
    assert.equal(effective.buyerGradesRequired, true);
    assert.equal(effective.facts.range_km.buyerGrade, undefined);
    assert.equal(effective.facts.range_km.gradeReviewStatus, "review_required");
    assert.equal(
      effective.facts.range_km.value,
      scenario.input.facts.range_km.value,
    );
    assert.equal(effective.facts.range_km.status, "standard");
    const ranks = rankAttribute([effective], scenario.sources, "range_km", {
      asOf: "2026-10-13",
    });
    assert.equal(ranks.groups.length, 0);
    assert.match(ranks.unranked[0].reason, /unreviewed/);
    assert.equal(
      ranks.unranked[0].fact.value,
      scenario.input.facts.range_km.value,
    );
    assert.deepEqual(scenario.input, before);
  }
  const forged = {
    ...car("guarded", { ...original, buyerGrade: "confirmed" }),
    buyerGradesRequired: true as const,
  };
  assert.equal(
    rankAttribute([forged], sources, "range_km", { asOf: "2026-10-13" }).groups
      .length,
    0,
  );
});
