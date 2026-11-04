import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import inventory from "../data/market-inventory-2026-10-10.json";
import sidecar from "../data/market-road-trikes-evidence-2026-10-12.json";
import view from "../data/market-view.generated.json";
import { checkpoint102Fixture, reconstructMarketBeforeCheckpoint102 } from "./helpers/checkpoint102-market-history";
import { applicationRequire, compiledSource, elementNodes } from "./helpers/compiled-source";

type Row = Record<string, unknown> & { id: string; trims: string[]; sourceIds?: string[]; sourceUrls: string[]; limitations: string[] };
type Market = Record<string, unknown> & { records: Row[]; unverifiedLeads: Row[]; reconciledLeads: Row[]; peripheralRecords: Row[] };
const market = inventory as unknown as Market;
const before = reconstructMarketBeforeCheckpoint102(market);
const expectedIds = ["ozetrike-mate150", "kyburz-dxp", "emos-ct-kargo", "emos-ct-kube", "stealth-ozpod", "ozetrike-mate150l", "jinpeng-e-ql150"];
const additions = [market.records.at(-1)!, ...market.unverifiedLeads.slice(-5), market.peripheralRecords.at(-1)!];
const fixture = checkpoint102Fixture();

test("102 has exactly seven bounded dispositions and six family groups", () => {
  assert.deepEqual(additions.map(row => row.id), expectedIds);
  assert.equal(new Set(additions.map(row => row.familyId)).size, 6);
  assert.equal(market.records.length, 243);
  assert.equal(market.unverifiedLeads.length, 148);
  assert.equal(market.reconciledLeads.length, 21);
  assert.equal(market.peripheralRecords.length, 6);
  const all = [...market.records, ...market.unverifiedLeads, ...market.reconciledLeads, ...market.peripheralRecords];
  for (const section of ["records", "unverifiedLeads", "reconciledLeads", "peripheralRecords"] as const) assert.equal(new Set(market[section].map(row => row.id)).size, market[section].length, section);
  const oldIds = new Set([...before.records, ...before.unverifiedLeads, ...before.reconciledLeads, ...before.peripheralRecords].map(row => row.id));
  for (const id of expectedIds) { assert.ok(!oldIds.has(id), id); assert.equal(all.filter(row => row.id === id).length, 1, id); }
  for (const section of ["records", "unverifiedLeads", "peripheralRecords"] as const) {
    assert.deepEqual(market[section].slice(0, before[section].length), before[section], `Every prior ${section} row and unknown field survives`);
  }
  assert.deepEqual(market.reconciledLeads, before.reconciledLeads);
  for (const row of additions) {
    assert.deepEqual(row.trims, []);
    assert.equal(row.checkedAt, "2026-10-12");
    assert.equal(row.rankingEligible, false);
    assert.equal(row.physicalStockVerified, false);
    assert.equal(row.physicalStockQuantity, null);
    assert.equal(row.factoryOrderAcceptanceVerified, false);
    assert.equal(row.stockStatus, "unverified");
    assert.equal(row.modelYear, null);
    assert.equal(row.completeVehicleCountEligible, row.id === "ozetrike-mate150" ? null : false);
  }
});

test("102 counts preserve the advertised-stock, named-trim and detailed boundaries", () => {
  assert.deepEqual(inventory.counts, fixture.market.countsAfter);
  assert.deepEqual(inventory.counts, {
    consolidatedModelAuditRecords: 243,
    byVehicleClass: { bus: 28, passenger: 114, truck: 28, ute: 13, van: 19, motorcycle: 41 },
    byOrderStatus: { listed_unconfirmed: 193, accepting_orders: 36, accepting_order_requests_advertised: 8, not_current: 4, preorder: 2 },
    namedTrimConfigurationEntries: 395, exactTrimSetMissingRecords: 55, newStockListedModelRecords: 69,
    unresolvedLeadGroups: 148, reconciledLeadGroups: 21, peripheralRecords: 6, duplicateModelMerges: 6,
  });
  assert.equal(market.records.reduce((sum, row) => sum + row.trims.length, 0), 395);
  assert.equal(market.records.filter(row => !row.trims.length).length, 55);
  assert.equal(market.records.filter(row => row.stockStatus === "new_stock_listed").length, 69);
  assert.equal(inventory.detailedCatalogueContext.knownDetailedTrimCount, 345);
  assert.equal(inventory.detailedCatalogueContext.knownDetailedFamilyCount, 150);
  for (const key of ["checkedAt", "complete", "validation", "coverageStatus", "scopeClarification", "detailedCatalogueContext", "deduplicationLog", "motorcycleExclusions", ...Object.keys(before).filter(key => key.startsWith("historical"))]) assert.deepEqual(market[key], before[key], key);
  assert.equal(inventory.checkedAt, "2026-10-10");
  assert.equal(inventory.complete, false);
});

test("102 evidence preserves exact source identities, dates, prices and approval holds", () => {
  assert.equal(sidecar.sources.length, 22);
  assert.equal(new Set(sidecar.sources.map(source => source.id)).size, 22);
  assert.equal(sidecar.independentReview.verdict, "GO_BOUNDED_MARKET_AUDIT_ONLY");
  const sourceMap = new Map(sidecar.sources.map(source => [source.id, source]));
  for (const row of additions) {
    assert.deepEqual(row.sourceUrls, [...new Set(row.sourceIds!.map(id => {
      const source = sourceMap.get(id);
      assert.ok(source, id);
      assert.equal(source.observedAt, "2026-10-12");
      return source.url;
    }))]);
    assert.deepEqual(sidecar.dispositions.find(entry => entry.row.id === row.id)!.row, row);
  }
  const mate = sidecar.dispositions.find(entry => entry.row.id === "ozetrike-mate150")!.row;
  assert.deepEqual(mate.sourceListedConfigurations, ["Mate150"]);
  assert.deepEqual(mate.typeApprovalEvidence!.variants, ["Cargo 01", "Cargo 02"]);
  assert.equal(mate.typeApprovalEvidence!.bothVariantBatteries, "58 Ah lead-acid");
  assert.equal(mate.typeApprovalEvidence!.lithiumApprovalVerified, false);
  assert.equal(mate.typeApprovalEvidence!.unitVinVerified, false);
  assert.equal(mate.advertisingEvidence!.supplier.advertisedPriceAUD, 6195);
  assert.equal(mate.advertisingEvidence!.marketplace.advertisedPriceAUD, 6386.55);
  assert.equal(mate.advertisingEvidence!.marketplace.embeddedListingStatus, "ACTIVE");
  assert.equal(mate.modelYear, null);
  const lithium = additions.find(row => row.id === "ozetrike-mate150l")!;
  assert.equal(lithium.familyId, mate.id);
  assert.deepEqual(lithium.relatedRecordIds, [mate.id]);
  assert.equal(lithium.orderStatus, "preorder");
  assert.equal(lithium.lithiumApprovalVerified, false);
  const kargo = additions.find(row => row.id === "emos-ct-kargo")!;
  assert.deepEqual(kargo.sourceListedConfigurations, ["CT-KARGO", "CT-KARGO KOOL"]);
  const peripheral = additions.at(-1)!;
  assert.equal(peripheral.orderStatus, "not_current");
  assert.equal(peripheral.coreRoadVehicleRecord, false);
  assert.equal(peripheral.peripheralCategory, "future_road_eligibility_unverified");
  assert.equal(peripheral.vehicleClass, "other");
  const artifact = inventory.sourceArtifacts.at(-1)!;
  const bytes = readFileSync(new URL("../data/market-road-trikes-evidence-2026-10-12.json", import.meta.url));
  assert.equal(artifact.sha256, createHash("sha256").update(bytes).digest("hex"));
  assert.equal(sidecar.sourceSnapshotCopiesIncluded, false);
  assert.equal(sidecar.counts.verifiedPhysicalStockUnits, 0);
});

function harness(initial: [string, string, string, number]) {
  const state: (string | number)[] = [...initial];
  let cursor = 0;
  const component = compiledSource("src/components/market-audit.tsx", {
    react: { ...applicationRequire("react"), useState: (initialValue: string | number) => {
      const index = cursor++;
      if (!(index in state)) state[index] = initialValue;
      return [state[index], (value: string | number) => { state[index] = value; }];
    } },
    "@/lib/market-view-data": { __esModule: true, default: view },
  }).default as () => unknown;
  return { state, render: () => { cursor = 0; return elementNodes(component()); } };
}

for (const query of ["Mate150", "OZ eTrike", "OZetrike", "JP1500DZH-B"]) test(`102 actual market component finds the bounded Mate150 offer: ${query}`, () => {
  const nodes = harness([query, "accepting_order_requests_advertised", "motorcycle", 24]).render();
  assert.equal(nodes.filter(node => node.type === "article").length, 1);
  assert.ok(nodes.some(node => node.type === "h2" && node.props.children === "Mate150"));
  assert.ok(nodes.some(node => node.type === "span" && node.props.children === "Stock not verified"));
  assert.ok(nodes.some(node => node.type === "p" && node.props.children === "Exact trim names still need verification."));
  assert.ok(nodes.some(node => node.type === "option" && node.props.children === "Motorcycles, scooters & road trikes"));
  assert.ok(nodes.some(node => node.type === "summary" && node.props.children === "Evidence & limitations"));
  assert.ok(nodes.some(node => node.type === "li" && typeof node.props.children === "string" && node.props.children.includes("lithium preorder whose approval is unverified")));
  assert.ok(nodes.some(node => node.type === "a" && node.props.href === "https://www.ebay.com.au/itm/376747254821"));
});

test("102 held candidates remain absent from cards and repeated filters/reset preserve behavior", () => {
  for (const query of ["DXP 5.3", "CT-KARGO", "CT-KARGO KOOL", "CT-KUBE", "OzPOD", "Mate150L", "E-QL150", "Cargo 01", "Cargo 02"]) assert.equal(harness([query, "all", "all", 24]).render().filter(node => node.type === "article").length, 0, query);
  const h = harness(["Mate150", "all", "motorcycle", 72]);
  for (const status of ["accepting_orders", "accepting_order_requests_advertised", "accepting_orders"]) {
    h.render().filter(node => node.type === "select")[1].props.onChange!({ target: { value: status } });
    assert.equal(h.state[3], 24);
    assert.equal(h.render().filter(node => node.type === "article").length, status === "accepting_orders" ? 0 : 1);
  }
  const clear = h.render().find(node => node.type === "button" && node.props.children === "Clear filters")!;
  clear.props.onClick!(); clear.props.onClick!();
  assert.deepEqual(h.state, ["", "all", "all", 24]);
  for (const expected of [48, 72]) {
    h.render().find(node => node.type === "button" && node.props.children === "Show 24 more records")!.props.onClick!();
    assert.equal(h.render().filter(node => node.type === "article").length, expected);
  }
  h.render().find(node => node.type === "input")!.props.onChange!({ target: { value: "Mate150" } });
  assert.equal(h.state[3], 24);
  assert.equal(h.render().filter(node => node.type === "article").length, 1);
});
