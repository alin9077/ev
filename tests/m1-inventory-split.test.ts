/** Installed-layout regression tests: import the real report helpers, with small local fixtures. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildMarketReconciliation,
  type CurrentVersionReview,
  type InventoryResolution,
  type InventorySplitResolution,
  type M1MarketReconciliation,
  type Resolution,
} from "../scripts/reporting/m1-reconciliation";
import {
  buildCoverageReport,
  isCurrentListEligible,
  isOnSale,
  type ReportInventory,
} from "../scripts/reporting/reports";
import type { Car, Fact, Source } from "../src/lib/types";

const asOf = "2026-10-15";
const leadId = "audi-my27-q6-sq6-suv-and-sportback";
const settledId = `lead:${leadId}`;
const fixture = <T>(name: string): T =>
  JSON.parse(readFileSync(new URL(`./fixtures/m1-inventory-split/${name}`, import.meta.url), "utf8"));
const fullRegistry = () => fixture<M1MarketReconciliation>("reconciliation.json");
type Split = InventorySplitResolution & { kind: "record" | "lead"; inventoryId: string };
type TestData = { registry: M1MarketReconciliation; cars: Car[]; inventory: ReportInventory; sources: Source[] };
type Packet = {
  sources: Source[];
  availability: { variantId: string; after: { availability: string; evidence: NonNullable<Car["availabilityEvidence"]> } }[];
};

/** Narrow unit fixture: exact review identities plus real packet availability, no invented body facts. */
function identityCars(review: CurrentVersionReview, future = false): Car[] {
  const packet = fixture<Packet>("packet-q6-my27.json");
  return review.versions.map((version) => {
    const availability = packet.availability.find((entry) => entry.variantId === version.carId)?.after;
    return {
      id: version.carId, modelId: review.modelId, brand: review.brand, model: version.model,
      trim: version.trim, year: version.modelYear, vehicleClass: review.vehicleClass,
      family: review.modelId, slug: version.carId, generation: "Synthetic identity fixture", drive: "",
      availability: future ? availability!.availability : "current_or_order_listed",
      ...(future ? { availabilityEvidence: structuredClone(availability!.evidence) } : {}),
      facts: {}, issues: [],
    };
  });
}
function bodyFact(value: string | number): Fact {
  return { key: "body_style", label: "Body", value, unit: "", basis: "Unit fixture only", comparisonBasis: "Unit fixture only", status: "standard", sourceIds: [], date: asOf, market: "AU", scope: "Unit fixture only", qualifications: [], issues: [] };
}
function guardedField(input: TestData, key: "bodyStyle" | "trim" | "catalogueVariantIds", value: string | string[]) {
  Object.assign(input.inventory.unverifiedLeads[0], { [key]: value });
  Object.assign(split(input).originalRecord, { [key]: structuredClone(value) });
}
function data(): TestData {
  const registry = fullRegistry();
  registry.currentVersionReviews = registry.currentVersionReviews.filter((review) =>
    ["audi_q6_suv_my27", "audi_q6_sportback_my27"].includes(review.modelId));
  registry.inventoryResolutions = registry.inventoryResolutions.filter((entry) => entry.inventoryId === leadId);
  return {
    registry,
    cars: registry.currentVersionReviews.flatMap((review) => identityCars(review, true)),
    inventory: { records: [], unverifiedLeads: [fixture("original-combined-lead.json")] },
    sources: fixture<Packet>("packet-q6-my27.json").sources,
  };
}
const split = (input: TestData): Split => input.registry.inventoryResolutions[0] as Split;
const run = (input: TestData) => buildMarketReconciliation(input.registry, input.cars, input.inventory, asOf);
function rejects(input: TestData) {
  const report = run(input);
  assert.ok(!report.settledInventory.includes(settledId));
  assert.ok(report.issues.some((issue) => issue.code === "inventory_unresolved" && issue.reference === settledId));
}
type OrdinaryCaseId = "single-valid" | "single-invalid-model" | "published-list-alias";
type OrdinaryCases = {
  schemaVersion: 1;
  asOf: string;
  base: Omit<TestData, "sources">;
  cases: {
    id: OrdinaryCaseId;
    registryOverrides: Partial<M1MarketReconciliation>;
    reviewOverrides: Partial<CurrentVersionReview>;
    inventoryRecordOverrides: Partial<ReportInventory["records"][number]>;
  }[];
};
function singleData(id: OrdinaryCaseId = "single-valid"): TestData {
  const cases = fixture<OrdinaryCases>("ordinary-cases.json");
  assert.equal(cases.asOf, asOf);
  const selected = cases.cases.find((item) => item.id === id)!;
  assert.ok(selected, `missing ordinary case ${id}`);
  const input = structuredClone(cases.base);
  Object.assign(input.registry, structuredClone(selected.registryOverrides));
  Object.assign(input.registry.currentVersionReviews[0], structuredClone(selected.reviewOverrides));
  Object.assign(input.inventory.records[0], structuredClone(selected.inventoryRecordOverrides));
  return { ...input, sources: [] };
}
function expectOrdinary(input: TestData, id: OrdinaryCaseId) {
  type ExpectedReport = Omit<ReturnType<typeof buildMarketReconciliation>, "evidence">;
  const captured = fixture<{
    cases: Record<OrdinaryCaseId, { expected: ExpectedReport; ownUndefinedPaths: string[][] }>;
  }>("ordinary-expected.json").cases[id];
  assert.ok(captured, `missing captured ordinary expectation ${id}`);
  const expected = captured.expected;
  for (const path of captured.ownUndefinedPaths) {
    assert.ok(path.length > 0, "undefined-property paths identify an exact own property");
    let parent: unknown = expected;
    for (const key of path.slice(0, -1)) {
      assert.ok(parent !== null && typeof parent === "object" && Object.hasOwn(parent, key));
      parent = (parent as Record<string, unknown>)[key];
    }
    const key = path[path.length - 1];
    assert.ok(parent !== null && typeof parent === "object" && !Object.hasOwn(parent, key));
    Object.defineProperty(parent, key, { value: undefined, enumerable: true, writable: true, configurable: true });
  }
  const { evidence, ...actual } = run(input);
  assert.equal(evidence, input.registry, "the evidence field is the unchanged input registry");
  assert.deepEqual(actual, expected);
  return actual;
}

// These assignments are also compile-time tests when the explicitly scoped typecheck is authorized.
function listTypeBoundary(value: Split) {
  // @ts-expect-error Inventory split cannot be assigned to ordinary/list Resolution.
  const ordinary: Resolution = value;
  const inventory: InventoryResolution = value;
  return { ordinary, inventory };
}
void listTypeBoundary;

test("fixture preserves exact unchanged reviews and ordinary dispositions", () => {
  const proposed = fullRegistry();
  const unchanged = fixture<Pick<M1MarketReconciliation, "currentVersionReviews" | "inventoryResolutions">>("unchanged-review-dispositions.json");
  assert.deepEqual(proposed.currentVersionReviews, unchanged.currentVersionReviews);
  assert.deepEqual(proposed.inventoryResolutions.filter((entry) => entry.inventoryId !== leadId), unchanged.inventoryResolutions);
  const combined = proposed.inventoryResolutions.filter((entry) => entry.inventoryId === leadId);
  assert.equal(combined.length, 1, "the one combined lead has exactly one replacement disposition");
  const mapped = combined[0] as Split;
  const actualAudiRow = fixture<ReportInventory>("inventory-audi.json").unverifiedLeads.find((row) => row.id === leadId);
  assert.deepEqual(mapped.originalRecord, actualAudiRow);
  assert.deepEqual(mapped.originalRecord, fixture("original-combined-lead.json"));
  assert.deepEqual(mapped.components.map((component) => component.versions.length), [2, 2]);
  assert.equal(mapped.declaredCoverage.versions.length, 4);
});

test("valid exact split settles the one inherited lead without pretending whole-market closure", () => {
  const input = data();
  const before = structuredClone(input);
  const report = run(input);
  assert.deepEqual(report.settledInventory, [settledId]);
  assert.equal(report.reviewedModels, 2);
  assert.equal(report.reviewedVersions, 4);
  assert.equal(report.pass, false);
  assert.deepEqual(report.issues.map((issue) => issue.code), ["independent_lists"]);
  assert.deepEqual(input, before, "the original inventory, reviews and candidate cars must remain untouched");
});

test("JSON object key order is irrelevant but every original key and array entry is guarded", () => {
  const input = data();
  const row = input.inventory.unverifiedLeads[0];
  input.inventory.unverifiedLeads[0] = Object.fromEntries(Object.entries(row).reverse()) as typeof row;
  assert.deepEqual(run(input).settledInventory, [settledId]);
});

const failures: [string, (input: TestData) => void][] = [
  ["original model identity drift", (d) => { d.inventory.unverifiedLeads[0].model = "Q4 e-tron"; }],
  ["original hidden metadata drift", (d) => { (d.inventory.unverifiedLeads[0] as unknown as Record<string, unknown>).rankingEligible = true; }],
  ["original added metadata", (d) => { (d.inventory.unverifiedLeads[0] as unknown as Record<string, unknown>).extra = "new"; }],
  ["original deleted metadata", (d) => { delete (d.inventory.unverifiedLeads[0] as unknown as Record<string, unknown>).resolutionStatus; }],
  ["original nested metadata drift", (d) => { d.inventory.unverifiedLeads[0].limitations![0] = "changed"; }],
  ["original guard missing metadata", (d) => { delete split(d).originalRecord.sourceArtifacts; }],
  ["missing original guard", (d) => { split(d).originalRecord = undefined as unknown as Split["originalRecord"]; }],
  ["wrong inventory target", (d) => { split(d).inventoryId = "unrelated"; }],
  ["wrong inventory kind", (d) => { split(d).kind = "record"; }],
  ["stale disposition", (d) => { split(d).reviewedAt = "2026-08-30"; }],
  ["future disposition", (d) => { split(d).reviewedAt = "2026-10-16"; }],
  ["missing disposition reason", (d) => { split(d).reason = " "; }],
  ["missing disposition citations", (d) => { split(d).sourceUrls = []; }],
  ["missing coverage reason", (d) => { split(d).declaredCoverage.reason = ""; }],
  ["stale coverage review", (d) => { split(d).declaredCoverage.reviewedAt = "2026-08-30"; }],
  ["missing source record", (d) => { split(d).declaredCoverage.sources.pop(); }],
  ["stale source check", (d) => { split(d).declaredCoverage.sources[0].checkedAt = "2026-08-30"; }],
  ["future source check", (d) => { split(d).declaredCoverage.sources[0].checkedAt = "2026-10-16"; }],
  ["invalid source check date", (d) => { split(d).declaredCoverage.sources[0].checkedAt = "2026-02-30"; }],
  ["missing source interpretation", (d) => { split(d).declaredCoverage.sources[0].supports = " "; }],
  ["source absent from disposition", (d) => { split(d).declaredCoverage.sources[0].url = "https://example.test/unrelated"; }],
  ["missing official source", (d) => { d.registry.currentVersionReviews[0].officialSourceUrls = []; }],
  ["source not linked to referenced official review", (d) => { d.registry.currentVersionReviews[0].officialSourceUrls = ["https://example.test/unrelated"]; }],
  ["stale current review", (d) => { d.registry.currentVersionReviews[0].checkedAt = "2026-08-30"; }],
  ["wrong component brand", (d) => { split(d).components[0].brand = "Porsche"; }],
  ["wrong component class", (d) => { split(d).components[0].vehicleClass = "ute"; }],
  ["wrong component body", (d) => { split(d).components[0].bodyStyle = "Sportback SUV"; }],
  ["wrong component model", (d) => { split(d).components[0].model = "Q4 e-tron"; }],
  ["wrong component model ID", (d) => { split(d).components[0].modelId = "audi_q4_suv_my27"; }],
  ["wrong component year", (d) => { split(d).components[0].versions[0].modelYear = 2026; }],
  ["wrong component year type", (d) => { split(d).components[0].versions[0].modelYear = "2027"; }],
  ["unknown component year", (d) => { split(d).components[0].versions[0].modelYear = null; }],
  ["wrong component trim", (d) => { split(d).components[0].versions[0].trim = "SQ6 e-tron"; }],
  ["fuzzy component model cannot stand in for exact identity", (d) => { split(d).components[0].model = "Q6 E TRON"; }],
  ["wrong component car ID", (d) => { split(d).components[0].versions[0].carId = "unrelated"; }],
  ["missing review target", (d) => { split(d).components[0].modelReviewId = "missing"; }],
  ["unrelated review target", (d) => { split(d).components[0].modelReviewId = split(d).components[1].modelReviewId; }],
  ["wrong declared body", (d) => { split(d).declaredCoverage.versions[0].bodyStyle = "Wagon"; }],
  ["wrong declared model", (d) => { split(d).declaredCoverage.versions[0].model = "Q4 e-tron"; }],
  ["wrong declared trim", (d) => { split(d).declaredCoverage.versions[0].trim = "unrelated"; }],
  ["wrong declared year", (d) => { split(d).declaredCoverage.versions[0].modelYear = 2026; }],
  ["wrong declared car", (d) => { split(d).declaredCoverage.versions[0].carId = "unrelated"; }],
  ["conflicting present catalogue body", (d) => { d.cars[0].facts.body_style = bodyFact("Sportback SUV"); }],
  ["conflicting secondary body fact", (d) => { d.cars[0].facts.body_style = bodyFact("SUV"); d.cars[0].facts.body_type = bodyFact("Wagon"); }],
  ["invalid present catalogue body", (d) => { d.cars[0].facts.body_style = bodyFact(123); }],
  ["wrong catalogue model", (d) => { d.cars[0].model = "Q4 e-tron"; }],
  ["wrong catalogue model ID", (d) => { d.cars[0].modelId = "audi_q4_suv_my27"; }],
  ["wrong catalogue trim", (d) => { d.cars[0].trim = "SQ6 e-tron"; }],
  ["wrong catalogue year", (d) => { d.cars[0].year = 2026; }],
  ["inherited explicit body conflicts despite matching original guard", (d) => { guardedField(d, "bodyStyle", "SUV"); }],
  ["inherited explicit trim missing despite matching original guard", (d) => { guardedField(d, "trim", "not a declared trim"); }],
  ["inherited exact car ID missing despite matching original guard", (d) => { guardedField(d, "catalogueVariantIds", ["unrelated"]); }],
  ["missing catalogue car", (d) => { d.cars.shift(); }],
  ["missing body component", (d) => { split(d).components.pop(); }],
  ["missing component trim", (d) => { split(d).components[0].versions.pop(); }],
  ["missing declared trim", (d) => { split(d).declaredCoverage.versions.pop(); }],
  ["duplicate component review", (d) => { split(d).components[1] = structuredClone(split(d).components[0]); }],
  ["duplicate component car", (d) => { split(d).components[0].versions[1] = structuredClone(split(d).components[0].versions[0]); }],
  ["duplicate declared car", (d) => { split(d).declaredCoverage.versions.push(structuredClone(split(d).declaredCoverage.versions[0])); }],
  ["duplicate current review", (d) => { d.registry.currentVersionReviews.push(structuredClone(d.registry.currentVersionReviews[0])); }],
  ["duplicate catalogue car", (d) => { d.cars.push(structuredClone(d.cars[0])); }],
  ["duplicate source URL", (d) => { split(d).sourceUrls.push(split(d).sourceUrls[0]); }],
  ["duplicate source record", (d) => { split(d).declaredCoverage.sources.push(structuredClone(split(d).declaredCoverage.sources[0])); }],
  ["duplicate inventory mapping", (d) => { d.registry.inventoryResolutions.push(structuredClone(split(d))); }],
  ["duplicate original inventory row", (d) => { d.inventory.unverifiedLeads.push(structuredClone(d.inventory.unverifiedLeads[0])); }],
  ["another review reuses the same car", (d) => { const other = structuredClone(d.registry.currentVersionReviews[0]); other.id = "duplicate-car-review"; d.registry.currentVersionReviews.push(other); }],
  ["declared complete coverage survives a jointly shortened component and review", (d) => {
    const removed = split(d).components[0].versions.pop()!;
    d.registry.currentVersionReviews[0].versions.pop();
    d.cars = d.cars.filter((car) => car.id !== removed.carId);
  }],
  ["another split reuses the same reviews", (d) => {
    const other = structuredClone(split(d)); other.inventoryId = "second-combined-lead"; other.originalRecord.id = other.inventoryId;
    d.registry.inventoryResolutions.push(other); d.inventory.unverifiedLeads.push(structuredClone(other.originalRecord));
  }],
];
for (const [name, mutate] of failures) test(`split rejects ${name}`, () => { const input = data(); mutate(input); rejects(input); });

test("absent body facts are preserved; present exact facts must agree", () => {
  const input = data();
  assert.ok(input.cars.every((car) => !car.facts.body_style && !car.facts.body_type));
  assert.deepEqual(run(input).settledInventory, [settledId]);
  input.cars[0].facts.body_style = bodyFact("SUV");
  assert.deepEqual(run(input).settledInventory, [settledId]);
  delete input.cars[0].facts.body_style;
  input.cars[0].facts.body_type = bodyFact("SUV");
  assert.deepEqual(run(input).settledInventory, [settledId]);
});

test("inherited explicit trim and car IDs must be present in the complete covered union", () => {
  const input = data();
  guardedField(input, "trim", "SQ6 Sportback e-tron");
  guardedField(input, "catalogueVariantIds", [input.cars[0].id, input.cars[3].id]);
  assert.deepEqual(run(input).settledInventory, [settledId]);
});

test("a valid unrelated same-brand review cannot replace a declared body", () => {
  const input = data();
  const other = fullRegistry().currentVersionReviews.find((review) => review.modelId === "audi_q4_suv_my27")!;
  input.registry.currentVersionReviews.push(other);
  input.cars.push(...identityCars(other));
  split(input).components[0] = { brand: other.brand, model: other.model, modelId: other.modelId, bodyStyle: other.bodyStyle, vehicleClass: other.vehicleClass, modelReviewId: other.id, versions: structuredClone(other.versions) };
  rejects(input);
});

test("ordinary single-review inventory inclusion retains explicit expected results", () => {
  const input = singleData();
  const actual = expectOrdinary(input, "single-valid");
  assert.deepEqual(actual.settledInventory, ["record:audi-q6-e-tron"]);
  const invalid = singleData("single-invalid-model");
  assert.equal(expectOrdinary(invalid, "single-invalid-model").settledInventory.length, 0);
});

test("ordinary published-list inclusion and aliases retain explicit expected results", () => {
  const input = singleData("published-list-alias");
  const actual = expectOrdinary(input, "published-list-alias");
  assert.equal(actual.settledListEntryCount, 2);
  assert.equal(actual.pass, true);
  const illicit = { ...split(data()), listId: "a", entryId: "q6" };
  input.registry.listResolutions[0] = illicit as unknown as M1MarketReconciliation["listResolutions"][number];
  assert.equal(run(input).settledListEntryCount, 1, "a runtime-injected split must not settle a published list");
  assert.ok(run(input).issues.some((issue) => issue.code === "list_difference" && issue.reference === "a:q6"));
});

test("future order-open versions are current-list eligible while on-sale denominators stay separate", () => {
  const input = data();
  const current = singleData();
  input.cars.push(...current.cars);
  input.registry.currentVersionReviews.push(...current.registry.currentVersionReviews);
  const report = buildCoverageReport({ cars: input.cars, sources: input.sources, features: [], inventory: input.inventory, m1Reconciliation: input.registry }, asOf);
  assert.equal(input.cars.filter((car) => isCurrentListEligible(car, input.sources, asOf)).length, 7);
  assert.equal(input.cars.filter(isOnSale).length, 3);
  assert.equal(report.onSaleVersions, 3);
  assert.equal(report.reconciliation.reviewedVersions, 7);
  assert.deepEqual(report.reconciliation.settledInventory, [settledId]);
  assert.ok(input.cars.slice(0, 4).every((car) => !isOnSale(car)));
  assert.equal(report.reconciliation.pass, false, "the two independent whole-market lists remain missing");
});

test("stale or missing order-opening evidence cannot admit a future car to the current-list input", () => {
  const input = data();
  const car = input.cars[0];
  assert.equal(isCurrentListEligible(car, input.sources, asOf), true);
  car.availabilityEvidence!.checkedAt = "2026-08-30";
  assert.equal(isCurrentListEligible(car, input.sources, asOf), false);
  car.availabilityEvidence!.checkedAt = asOf;
  assert.equal(isCurrentListEligible(car, [], asOf), false);
  car.availabilityEvidence!.orderStatus = "unverified";
  assert.equal(isCurrentListEligible(car, input.sources, asOf), false);
  assert.equal(isOnSale(car), false);
});
