import test from "node:test";
import assert from "node:assert/strict";
import { rankAttribute, vehicleStrengths, discoveryCars } from "../src/lib/discovery";
import { pageEvidenceSources } from "../src/lib/page-evidence";
import type { Car, Fact, Source } from "../src/lib/types";

const policy = { asOf: "2026-10-11", maxAgeDays: 30 };
const maker = { id: "maker", url: "https://example.com/au/spec", accessed_date: "2026-10-10" } as Source;
const availability = { id: "availability", url: "https://example.com/au/availability", accessed_date: "2026-10-10" } as Source;
function car(id = "candidate", value = 600): Car {
  return {
    id, modelId: "fixture", family: id, modelFamily: id,
    availability: "current_or_order_listed", issues: [],
    availabilityEvidence: { checkedAt: policy.asOf, sourceIds: ["availability"], orderStatus: "accepting_orders_advertised", stockStatus: "unverified" },
    facts: { range_km: { key: "range_km", label: "Range", value, unit: "km", basis: "WLTP", comparisonBasis: "WLTP", status: "standard", market: "AU", scope: "Exact fixture grade", date: "2026-10-10", sourceIds: ["maker"], qualifications: [], issues: [] } as Fact },
  } as unknown as Car;
}
function rank(cars: Car[], sources: Source[]) { return rankAttribute(cars, sources, "range_km", policy); }

test("current vehicles with fresh numerical and availability sources retain competition ties", () => {
  const result = rank([car("a"), car("b"), car("c", 500)], [maker, availability]);
  assert.deepEqual(result.groups[0].entries.map(e => [e.car.id, e.rank, e.tied]), [["a", 1, true], ["b", 1, true], ["c", 3, false]]);
  assert.equal(result.excluded.length, 0);
});

test("current ranking fails closed on every availability source safety boundary", () => {
  const failures = [
    { publication_hold: "Review pending" }, { conflict: "Unresolved availability" },
    { access_limitation: "Not retrieved" }, { accessed_date: "2026-07-01" },
    { accessed_date: "2026-10-12" }, { accessed_date: "2026-02-30" },
    { url: "file:///untrusted" },
  ];
  for (const change of failures) {
    const result = rank([car()], [maker, { ...availability, ...change }]);
    assert.equal(result.groups.length, 0, JSON.stringify(change));
    assert.deepEqual(result.excluded, [{ carId: "candidate", reason: "Source stale, inaccessible or held for review" }]);
  }
});

test("present current availability requires nonempty resolvable source references", () => {
  const missing = rank([car()], [maker]);
  assert.equal(missing.groups.length, 0);
  assert.equal(missing.excluded[0].reason, "Supporting source missing");
  const empty = car(); empty.availabilityEvidence!.sourceIds = [];
  const result = rank([empty], [maker, availability]);
  assert.equal(result.groups.length, 0);
  assert.equal(result.excluded[0].reason, "Availability evidence lacks supporting sources");
});

test("every availability citation is checked rather than accepting one good source", () => {
  const candidate = car(); candidate.availabilityEvidence!.sourceIds.push("held-secondary");
  const result = rank([candidate], [maker, availability, { ...availability, id: "held-secondary", publication_hold: "Review pending" }]);
  assert.equal(result.groups.length, 0);
  assert.equal(result.excluded.length, 1);
});

test("legacy absent availability record behavior remains separate from explicit empty evidence", () => {
  const legacy = car(); delete legacy.availabilityEvidence;
  assert.equal(rank([legacy], [maker]).groups[0].entries[0].car.id, legacy.id);
  const stale = car(); stale.availabilityEvidence!.checkedAt = "2026-07-01";
  assert.equal(rank([stale], [maker, availability]).excluded[0].reason, "Availability evidence needs a fresh check");
});

test("outgoing new-stock eligibility keeps its existing source and freshness gates", () => {
  const outgoing = car(); outgoing.availability = "outgoing"; outgoing.availabilityEvidence!.stockStatus = "new_stock_listed";
  assert.equal(rank([outgoing], [maker, availability]).groups.length, 1);
  assert.equal(rank([outgoing], [maker, { ...availability, publication_hold: "Review pending" }]).groups.length, 0);
  outgoing.availabilityEvidence!.sourceIds = [];
  assert.equal(rank([outgoing], [maker]).excluded[0].reason, "Outgoing new stock lacks supporting evidence");
});

test("availability hold changes immediately remove and restore derived strengths", () => {
  const candidate = car(), second = car("second", 500), third = car("third", 400);
  second.availabilityEvidence!.sourceIds = ["maker"]; third.availabilityEvidence!.sourceIds = ["maker"];
  const cars = [candidate, second, third];
  const good = [maker, availability], held = [maker, { ...availability, publication_hold: "Review pending" }];
  assert.equal(vehicleStrengths(candidate, cars, good, policy)[0].rank, 1);
  assert.deepEqual(vehicleStrengths(candidate, cars, held, policy), []);
  assert.equal(rank(cars, held).groups[0].entries[0].car.id, "second");
  assert.equal(vehicleStrengths(candidate, cars, good, policy)[0].rank, 1);
});

test("full and page-scoped evidence preserve availability failures and qualification wrappers", () => {
  const candidate = car(), held = { ...availability, publication_hold: "Review pending", extraEvidence: { qualifier: "Complete wrapper retained" } };
  const sources = [maker, held, { ...maker, id: "unrelated", publication_hold: "Unrelated hold" }];
  const scoped = pageEvidenceSources(sources, { cars: [candidate] });
  assert.equal(scoped.find(s => s.id === held.id), held);
  assert.deepEqual(rank(discoveryCars([candidate]), scoped), rank([candidate], sources));
  assert.equal(rank([candidate], sources).groups.length, 0);
  assert.equal(rank([candidate], [maker, availability, sources[2]]).groups.length, 1);
});

test("ranking and strength validation do not mutate cars, references or source objects", () => {
  const cars = [car(), car("other", 500)], sources = [maker, availability];
  cars[0].availabilityEvidence!.sourceIds.push("maker");
  const before = structuredClone({ cars, sources });
  rank(cars, sources); vehicleStrengths(cars[0], cars, sources, policy);
  assert.deepEqual({ cars, sources }, before);
});
