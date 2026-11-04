import test from "node:test";
import assert from "node:assert/strict";
import {
  rankAttribute,
  freshDate,
  marketLeaderAllowed,
} from "../src/lib/discovery";
import type { Car, Fact, Source } from "../src/lib/types";
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
const source = {
  id: "maker",
  url: "https://example.com/au/spec",
  accessed_date: "2026-10-09",
} as Source;
function car(id: string, value: number, basis = "WLTP"): Car {
  return {
    id,
    availability: "current_or_order_listed",
    facts: {
      range_km: {
        key: "range_km",
        value,
        unit: "km",
        comparisonBasis: basis,
        status: "standard",
        market: "AU",
        date: "2026-10-09",
        sourceIds: ["maker"],
        issues: [],
      } as unknown as Fact,
    },
  } as unknown as Car;
}
test("ranks only matching units and test cycles; preserves competition ties", () => {
  const r = rankAttribute(
    [car("a", 600), car("b", 600), car("c", 500), car("d", 700, "NEDC")],
    [source],
    "range_km",
    policy,
  );
  assert.equal(r.groups.length, 2);
  assert.deepEqual(
    r.groups[0].entries.map((x) => [x.rank, x.tied]),
    [
      [1, true],
      [1, true],
      [3, false],
    ],
  );
});
test("stale, conditional, outgoing and missing-source claims are excluded", () => {
  const a = car("a", 600);
  a.facts.range_km.date = "2026-08-01";
  const b = car("b", 600);
  b.facts.range_km.status = "conditional";
  const c = car("c", 600);
  c.availability = "outgoing";
  const d = car("d", 600);
  d.facts.range_km.sourceIds = ["missing"];
  assert.equal(
    rankAttribute([a, b, c, d], [source], "range_km", policy).excluded.length,
    4,
  );
});
test("inaccessible evidence cannot retain rank", () => {
  assert.equal(
    rankAttribute(
      [car("a", 600)],
      [{ ...source, access_limitation: "not retrieved" }],
      "range_km",
      policy,
    ).groups.length,
    0,
  );
});
test("future and invalid dates are never fresh", () => {
  assert.equal(freshDate("2026-10-11", policy), false);
  assert.equal(freshDate("2026-02-30", policy), false);
  assert.equal(freshDate("", policy), false);
});
test("partial coverage cannot receive market-leading badge", () => {
  const audit = {
    checkedAt: "2026-10-09",
    complete: false,
    eligibleTrimIds: ["a", "b"],
    reviewedTrimIds: ["a", "b"],
    unresolved: [],
  };
  assert.equal(marketLeaderAllowed(audit, policy, ["a", "b"]), false);
  assert.equal(
    marketLeaderAllowed({ ...audit, complete: true }, policy, ["a"]),
    false,
  );
  assert.equal(
    marketLeaderAllowed({ ...audit, complete: true }, policy, ["a", "b"]),
    true,
  );
});
test("corrections recompute ranking from facts rather than stale cached badges", () => {
  const a = car("a", 600),
    b = car("b", 500);
  assert.equal(
    rankAttribute([a, b], [source], "range_km", policy).groups[0].entries[0].car
      .id,
    "a",
  );
  b.facts.range_km.value = 650;
  assert.equal(
    rankAttribute([a, b], [source], "range_km", policy).groups[0].entries[0].car
      .id,
    "b",
  );
});
test("comparison respects non-Tesla choices", async () => {
  const { parseSelection } = await import("../src/lib/compare");
  const { catalogue } = await import("../src/lib/data");
  const ids = catalogue()
    .filter((c) => c.brand !== "Tesla")
    .slice(0, 2)
    .map((c) => c.id);
  assert.deepEqual(
    parseSelection(new URLSearchParams({ cars: ids.join(",") }), catalogue())
      .ids,
    ids,
  );
});

test("passenger cars and commercial vehicles never share an attribute ranking", () => {
  const bus = { ...car("bus", 700), vehicleClass: "bus" as const };
  const r = rankAttribute(
    [car("passenger", 600), bus],
    [source],
    "range_km",
    policy,
  );
  assert.equal(r.groups.length, 2);
  assert.deepEqual(
    new Set(r.groups.map((x) => x.vehicleClass)),
    new Set(["passenger", "bus"]),
  );
});

test("unknown cargo measurement methods cannot rank merely because labels match", () => {
  const c = car("cargo", 500);
  c.facts.boot_l = {
    ...c.facts.range_km,
    key: "boot_l",
    unit: "L",
    comparisonBasis: "Manufacturer figure, seats up; method not stated",
  };
  assert.equal(rankAttribute([c], [source], "boot_l", policy).groups.length, 0);
});

test("optimized strength percentiles retain tie-aware distinct-value semantics", async () => {
  const { buildStrengthsIndex } = await import("../src/lib/discovery");
  const samples = [car("a", 600), car("b", 600), car("c", 500), car("d", 400)];
  samples.forEach((c, i) => (c.family = `family-${i}`));
  const strengths = buildStrengthsIndex(samples, [source], policy);
  assert.deepEqual(
    samples.map((c) => strengths.get(c.id)![0].percentile),
    [1, 1, 0.5, 0],
  );
});

test("outgoing vehicles need fresh source-backed new stock to remain eligible", () => {
  const outgoing = car("outgoing-new", 500);
  outgoing.availability = "outgoing";
  outgoing.availabilityEvidence = {
    checkedAt: "2026-10-09",
    stockStatus: "new_stock_listed",
    orderStatus: "not_current",
    sourceIds: ["stock"],
  };
  const stock = { ...source, id: "stock" };
  assert.equal(
    rankAttribute([outgoing], [source, stock], "range_km", policy).groups
      .length,
    1,
  );
  assert.equal(
    rankAttribute([outgoing], [source], "range_km", policy).groups.length,
    0,
  );
  assert.equal(
    rankAttribute(
      [outgoing],
      [source, { ...stock, accessed_date: "2026-08-01" }],
      "range_km",
      policy,
    ).groups.length,
    0,
  );
  outgoing.availabilityEvidence.sourceIds = [];
  assert.equal(
    rankAttribute([outgoing], [source, stock], "range_km", policy).groups
      .length,
    0,
  );
});

test("discovery filters preserve query and class while stale or unsourced stock is excluded", async () => {
  const { filterDiscoveryCars } = await import("../src/lib/discovery");
  const cars = [car("a", 500), car("b", 500), car("c", 500), car("d", 500)];
  cars.forEach((c) => {
    c.brand = "Kia";
    c.model = "EV9";
    c.trim = "Air";
    c.vehicleClass = "passenger";
    c.availabilityEvidence = {
      checkedAt: "2026-10-10",
      orderStatus: "listed_unconfirmed",
      stockStatus: "new_stock_listed",
      sourceIds: ["maker"],
    };
  });
  cars[1].vehicleClass = "van";
  cars[2].availabilityEvidence!.checkedAt = "2026-08-01";
  cars[3].availabilityEvidence!.sourceIds = [];
  assert.deepEqual(
    filterDiscoveryCars(cars, " ev9 ", "passenger", true, policy).map(
      (c) => c.id,
    ),
    ["a"],
  );
  assert.equal(filterDiscoveryCars(cars, "", "", false, policy).length, 4);
  assert.equal(
    filterDiscoveryCars(cars, "missing", "", false, policy).length,
    0,
  );
});


test("bounded configurations stay excluded even if a scalar is promoted to standard", () => {
  const bounded = car("bounded", 999);
  bounded.configurationEvidence = {
    rankingEligible: false,
    completeVehicleCountEligible: false,
    projectionScope: "Exact selected build; incomplete technical evidence",
  };
  const result = rankAttribute([bounded, car("ordinary", 600)], [source], "range_km", policy);
  assert.deepEqual(result.groups.flatMap(group => group.entries.map(entry => entry.car.id)), ["ordinary"]);
  assert.match(result.excluded[0].reason, /Bounded configuration/);
  delete (bounded.configurationEvidence as Partial<typeof bounded.configurationEvidence>).rankingEligible;
  assert.equal(rankAttribute([bounded], [source], "range_km", policy).groups.length, 0);
});
