import assert from "node:assert/strict";
import test from "node:test";
import { buildCoverageReport, isCurrentListEligible, isOnSale, type ReportInput } from "../scripts/reporting/reports";
import type { Car, Source } from "../src/lib/types";
import type { M1MarketReconciliation } from "../scripts/reporting/m1-reconciliation";

const source = { id: "maker-au", url: "https://example.com/au", publisher: "Maker", title: "Current Australian pre-order offer", source_type: "manufacturer", published_date: null, accessed_date: "2026-10-15", market: "AU", supports: "Exact named version pre-orders" } as Source;
const sources = [source];
const car = (id: string, availability = "announced_provisional", orderStatus = "preorder", sourceIds = [source.id]): Car => ({ id, modelId: "maker-model", family: "maker-model", slug: id, brand: "Maker", model: "Model", trim: id, generation: "Current", year: null, vehicleClass: "passenger", availability, availabilityEvidence: { checkedAt: "2026-10-15", orderStatus, stockStatus: "unverified", sourceIds, qualifications: [], physicalStockVerified: false, factoryOrderAcceptanceVerified: false }, drive: "RWD", facts: {}, issues: [] });
const registry = (cars: Car[]): M1MarketReconciliation => ({ schemaVersion: 1, checkedAt: "2026-10-15", notes: [], publishedLists: [], currentVersionReviews: [{ id: "maker-current", modelId: "maker-model", brand: "Maker", model: "Model", bodyStyle: "SUV", vehicleClass: "passenger", checkedAt: "2026-10-15", officialSourceUrls: [source.url], reason: "Complete current maker cohort, including explicitly advertised pre-orders", versions: cars.map(c => ({ carId: c.id, model: c.model, trim: c.trim, modelYear: c.year })) }], listResolutions: [], catalogueOnlyDifferences: [], inventoryResolutions: [] });
const input = (cars: Car[], reviews: Car[] = cars): ReportInput => ({ cars, sources: [source], features: [], inventory: { records: [], unverifiedLeads: [] }, m1Reconciliation: registry(reviews) });

for (const status of ["preorder", "accepting_orders", "accepting_orders_advertised"]) {
  test(`C1 admits sourced explicit ${status} without changing on-sale status`, () => {
    const c = car(status, "announced_provisional", status);
    assert.equal(isCurrentListEligible(c, sources, "2026-10-15"), true);
    assert.equal(isOnSale(c), false);
    const r = buildCoverageReport(input([c]), "2026-10-15");
    assert.equal(r.reconciliation.reviewedVersions, 1);
    assert.equal(r.reconciliation.issues.some(i => i.code === "version_review"), false);
    assert.equal(r.onSaleVersions, 0);
    assert.equal(r.reconciliation.pass, false, "pre-order membership does not close independent whole-market lists");
  });
}
test("C1 does not promote announcement timing, missing sources, dangling source IDs or unknown states", () => {
  const arrival = car("arrival", "announced_provisional", "listed_unconfirmed");
  arrival.availabilityEvidence!.qualifications = ["First customer deliveries expected November 2026"];
  for (const c of [arrival, car("no-source", "announced_provisional", "preorder", []), car("dangling", "announced_provisional", "preorder", ["missing"]), car("unknown", "unverified", "preorder")]) assert.equal(isCurrentListEligible(c, sources, "2026-10-15"), false, c.id);
});
test("not-current is never promoted by order or stock badges", () => {
  for (const status of ["preorder", "accepting_orders", "accepting_orders_advertised"]) {
    const c = car(status, "not_current", status);
    c.availabilityEvidence!.stockStatus = "new_stock_listed";
    assert.equal(isCurrentListEligible(c, sources, "2026-10-15"), false);
  }
});
test("existing current and sourced outgoing-stock semantics are retained; sourced outgoing orders are C1-only", () => {
  assert.equal(isCurrentListEligible(car("current", "current_or_order_listed", "listed_unconfirmed", []), sources, "2026-10-15"), true);
  const stock = car("stock", "outgoing", "unverified"); stock.availabilityEvidence!.stockStatus = "new_stock_listed";
  assert.equal(isCurrentListEligible(stock, sources, "2026-10-15"), true); assert.equal(isOnSale(stock), true);
  const order = car("outgoing-order", "outgoing", "accepting_orders_advertised");
  assert.equal(isCurrentListEligible(order, sources, "2026-10-15"), true); assert.equal(isOnSale(order), false);
});
test("C1 eligibility is Tier 1 only in the report caller", () => {
  const van = { ...car("van"), vehicleClass: "van" } as Car;
  const r = buildCoverageReport(input([van]), "2026-10-15");
  assert.equal(r.tierOneVersions, 0); assert.equal(r.reconciliation.reviewedVersions, 0);
  assert(r.reconciliation.issues.some(i => i.code === "version_review"));
});
test("changing an arrival-only car to sourced preorder changes only C1 outputs, not C2–C6 or rankings", () => {
  const current = car("current", "current_or_order_listed", "listed_unconfirmed");
  const announced = car("arriving", "announced_provisional", "listed_unconfirmed");
  const ordered = car("arriving", "announced_provisional", "accepting_orders_advertised");
  const before = buildCoverageReport(input([current, announced]), "2026-10-15");
  const after = buildCoverageReport(input([current, ordered]), "2026-10-15");
  for (const key of ["onSaleVersions", "tierOneVersions", "allCatalogueVersions", "core", "gaps", "rankings", "summaryGaps", "pairedOnSale", "pairedOnSalePercent", "inAllRankings", "inAllRankingsPercent", "grading", "ageing"] as const) assert.deepEqual(after[key], before[key], key);
  assert.deepEqual(after.criteria.filter(c => c.id !== "C1"), before.criteria.filter(c => c.id !== "C1"));
  for (const id of ["C2", "C3", "C4", "C5", "C6"] as const) assert.equal(after.brandProgress[0].criteria[id], before.brandProgress[0].criteria[id]);
  assert.equal(after.onSaleVersions, 1); assert.equal(after.reconciliation.reviewedVersions, 2);
  assert.equal(before.reconciliation.reviewedVersions, 0, "incomplete mixed list fails as a whole before eligibility is evidenced");
});

test("C1 rejects stale, invalid and future availability checks", () => {
  for (const date of ["", "2026-02-30", "2026-10-16", "2026-08-30"]) {
    const c = car(date); c.availabilityEvidence!.checkedAt = date;
    assert.equal(isCurrentListEligible(c, sources, "2026-10-15"), false, date);
  }
  const lastDay = car("last-day"); lastDay.availabilityEvidence!.checkedAt = "2026-08-31";
  assert.equal(isCurrentListEligible(lastDay, [{ ...source, accessed_date: "2026-08-31" }], "2026-10-15"), true);
});
test("C1 rejects held, conflicted, inaccessible, unsafe or invalid-date source evidence", () => {
  for (const change of [{publication_hold: true}, {conflict: true}, {access_limitation: "blocked"}, {url: "javascript:alert(1)"}, {accessed_date: "2026-10-16"}, {accessed_date: "invalid"}, {accessed_date: "2026-08-30"}]) {
    assert.equal(isCurrentListEligible(car("bad-source"), [{ ...source, ...change }], "2026-10-15"), false, JSON.stringify(change));
  }
  assert.equal(isCurrentListEligible(car("duplicate-source"), [source, source], "2026-10-15"), false);
});
