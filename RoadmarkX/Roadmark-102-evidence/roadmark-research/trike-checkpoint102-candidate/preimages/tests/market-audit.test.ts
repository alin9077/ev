import test from "node:test";
import assert from "node:assert/strict";
import inventory from "../data/market-inventory-2026-10-10.json";
test("market audit preserves exact source dates and fails closed on rankings", () => {
  assert.equal(inventory.complete, false);
  assert.equal(
    new Set(inventory.records.map((r) => r.id)).size,
    inventory.records.length,
  );
  for (const r of inventory.records) {
    assert.equal(r.rankingEligible, false);
    assert.ok(r.sourceUrls.length, r.id);
    assert.match(r.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    for (const u of r.sourceUrls) assert.equal(new URL(u).protocol, "https:");
    assert.ok(r.limitations.length, r.id);
    assert.equal(new Set(r.trims).size, r.trims.length, r.id);
  }
});
test("future deliveries, stock and order evidence stay independent", () => {
  for (const r of inventory.records) {
    assert.ok(
      [
        "accepting_orders",
        "accepting_order_requests_advertised",
        "preorder",
        "listed_unconfirmed",
        "not_current",
      ].includes(r.orderStatus),
    );
    assert.ok(["unverified", "new_stock_listed"].includes(r.stockStatus));
  }
  assert.ok(
    inventory.records.some(
      (r) =>
        r.orderStatus === "accepting_orders" && r.stockStatus === "unverified",
    ),
  );
});

test("market summary counts follow the separate current order and stock states", () => {
  const orders = Object.fromEntries(
    Object.keys(inventory.statusDefinitions).map((key) => [
      key,
      inventory.records.filter((record) => record.orderStatus === key).length,
    ]),
  );
  assert.deepEqual(inventory.counts.byOrderStatus, orders);
  assert.equal(
    inventory.counts.newStockListedModelRecords,
    inventory.records.filter(
      (record) => record.stockStatus === "new_stock_listed",
    ).length,
  );
  assert.equal(
    inventory.records.filter(
      (record) => record.orderStatus === "accepting_order_requests_advertised",
    ).length,
    7,
  );
});
