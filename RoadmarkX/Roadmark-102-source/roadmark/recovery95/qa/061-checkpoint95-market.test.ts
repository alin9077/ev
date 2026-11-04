import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import market from "../data/market-inventory-2026-10-10.json";
import evidence from "../data/market-mazda-cx6e-lead-evidence-2026-10-12.json";
import { catalogue, research } from "../src/lib/data";
import { marketBeforeCheckpoint95 as before, marketHash95, reconstructMarketBeforeCheckpoint95, assertMarketEvidence95 } from "./helpers/checkpoint95-market-history";
import { reconstructMarketBeforeCheckpoint93, marketHash93 } from "./helpers/checkpoint93-market-history";

const fixture = JSON.parse(readFileSync(new URL("../qa/checkpoint95-market-fixture.json", import.meta.url), "utf8"));
const row = market.records.find(record => record.id === "mazda-cx-6e")!;
test("95 promotes exactly one existing lead and preserves every other ordered value", () => {
  const changed = Object.keys(market).filter(key => JSON.stringify((market as Record<string, unknown>)[key]) !== JSON.stringify((before as Record<string, unknown>)[key])).sort();
  assert.deepEqual(changed, ["counts", "reconciledLeads", "records", "sourceArtifacts", "unverifiedLeads"]);
  assert.equal(market.records.length, 242);
  assert.equal(market.unverifiedLeads.length, 143);
  assert.equal(market.reconciledLeads.length, 21);
  assert.equal(market.sourceArtifacts.length, 19);
  assert.deepEqual(market.records.slice(0, -1), before.records);
  assert.deepEqual(market.unverifiedLeads, before.unverifiedLeads.filter(lead => lead.id !== "mazda-cx-6e"));
  assert.equal(before.unverifiedLeads[40].id, "mazda-cx-6e");
  assert.deepEqual(market.reconciledLeads.slice(0, -1), before.reconciledLeads);
  assert.deepEqual(market.sourceArtifacts.slice(0, -1), before.sourceArtifacts);
  assert.deepEqual(market.peripheralRecords, before.peripheralRecords);
  assert.deepEqual(market.counts, fixture.countsAfter);
  assert.equal(market.checkedAt, "2026-10-10");
  assert.equal(market.complete, false);
  assert.deepEqual(market.detailedCatalogueContext, before.detailedCatalogueContext);
});
test("CX-6e admits HTML grade identity only, with order, physical stock, model year and technical holds", () => {
  assert.deepEqual(row.trims, ["GT", "Azami"]);
  assert.equal(row.vehicleClass, "passenger");
  assert.equal(row.orderStatus, "preorder");
  assert.equal(row.stockStatus, "new_stock_listed");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.completeVehicleCountEligible, false);
  assert.equal(row.modelYear, null);
  assert.ok("sourceTechnicalEpoch" in row);
  assert.equal(row.sourceTechnicalEpoch, null);
  assert.ok("factoryOrderAcceptanceVerified" in row && "physicalStockVerified" in row);
  assert.equal(row.factoryOrderAcceptanceVerified, false);
  assert.equal(row.physicalStockVerified, false);
  assert.match(row.limitations.join(" "), /no technical epoch or specification is admitted/);
  assert.match(row.limitations.join(" "), /Cargo remains an unresolved/);
  assert.ok(!row.limitations.join(" ").includes("visual verification remains blocked"));
  assert.deepEqual(market.reconciledLeads.at(-1), fixture.appendedReconciledLead);
  assert.deepEqual(evidence.originalLead, before.unverifiedLeads[40]);
  assert.equal(evidence.detailedCatalogueVariantDelta, 0);
});
test("CX-6e New advertisement preserves seller freshness and unsold/physical uncertainty", () => {
  const stock = evidence.specificNewAdvertisement;
  assert.equal(stock.exactAdvertisedGrade, "E35 Azami GR");
  assert.equal(stock.stockNumber, "11397703");
  assert.equal(stock.vin, "LVRHDCEK6TN551337");
  assert.equal(stock.conditionLabel, "New");
  assert.equal(stock.advertisedStockState, "in_stock");
  assert.equal(stock.reservedAdvertised, false);
  assert.equal(stock.preorderAdvertised, false);
  assert.equal(stock.soldDateInPublicData, null);
  assert.equal(stock.sellerRecordUpdatedAt, "2026-10-06T22:34:05.842Z");
  assert.equal(stock.physicalStockVerified, false);
  assert.equal(stock.independentUnsoldVerified, false);
  assert.equal(stock.buildMatchesBrochureVerified, false);
  assert.equal(stock.advertisedPriceAud, null);
  assert.equal(evidence.priceObservations[0].amountAud, 56990);
  assert.match(evidence.priceObservations[0].basis, /Driveaway from/);
});
test("limited root PDF visual check supersedes the blocker without resolving cargo or admitting technical data", () => {
  assert.equal(evidence.pdfVerification.visuallyVerified, true);
  assert.deepEqual(evidence.pdfVerification.visuallyVerifiedPrintedPages, [5, 7, 14]);
  assert.equal(evidence.pdfVerification.fullTechnicalCandidateVisuallyVerified, false);
  assert.equal(evidence.pdfVerification.rawPublisherBytesSHA256, null);
  assert.equal(evidence.sourceTechnicalEpoch, null);
  assert.equal(evidence.formalManufacturerModelYear, null);
  const cargo = evidence.heldConflicts.find(conflict => conflict.id === "CX6E95-CARGO")!;
  assert.equal(cargo.normalizedValue, null);
  assert.deepEqual(cargo.observations.map(observation => observation.value), [363, 468]);
  const brochureCargo = cargo.observations[0];
  const htmlCargo = cargo.observations[1];
  assert.ok("basis" in brochureCargo && typeof brochureCargo.basis === "string");
  assert.ok("basis" in htmlCargo);
  assert.match(brochureCargo.basis, /VDA/);
  assert.equal(htmlCargo.basis, "unspecified");
  assert.match(evidence.technicalCandidateDisposition, /not approved for import/);
});
test("exact pre95 value enters unchanged93 reconstruction with every historical pin retained", () => {
  assert.equal(marketHash95(before), "1f1c0cd52a18794ea249f4295b94b2d0b1981c42d570cd68070f0cb4cb243be2");
  const pre93 = reconstructMarketBeforeCheckpoint93(before);
  assert.equal(marketHash93(pre93), "1ef8b23a540877e4bf8bf0a52dcf1effa3670e2b4bad606abff8cec6169c2643");
  const previousFixture = readFileSync(new URL("../qa/checkpoint93-market-fixture.json", import.meta.url));
  assert.equal(createHash("sha256").update(previousFixture).digest("hex"), "66211370041e236b81091b0a3d12c9db60b8cb7b10fead3b7de27c73050fdc61");
});
test("detailed catalogue remains 343 configurations, 149 families and 2196 sources without CX-6e", () => {
  const cars = catalogue();
  assert.equal(cars.length, 343);
  assert.equal(new Set(cars.map(car => car.modelFamily || car.family)).size, 149);
  assert.equal(research().sources.length, 2196);
  assert.ok(!cars.some(car => car.brand === "Mazda" && /CX[- ]?6e/i.test(car.model)));
});
const mutations: [string, (draft: typeof market) => void][] = [
  ["prior record", draft => { draft.records[0].model = "changed"; }],
  ["record order", draft => { draft.records.reverse(); }],
  ["missing appended record", draft => { draft.records.pop(); }],
  ["duplicate record", draft => { draft.records.push(draft.records.at(-1)!); }],
  ["prior lead", draft => { draft.unverifiedLeads[0].model = "changed"; }],
  ["lead order", draft => { draft.unverifiedLeads.reverse(); }],
  ["extra lead", draft => { draft.unverifiedLeads.push(draft.unverifiedLeads.at(-1)!); }],
  ["missing lead", draft => { draft.unverifiedLeads.pop(); }],
  ["ranking promotion", draft => { draft.records.at(-1)!.rankingEligible = true; }],
  ["invented trim", draft => { Object.assign(draft.records.at(-1)!, { trims: ["Invented trim"] }); }],
  ["technical admission", draft => { Object.assign(draft.records.at(-1)!, { sourceTechnicalEpoch: "invented" }); }],
  ["physical stock promotion", draft => { Object.assign(draft.records.at(-1)!, { physicalStockVerified: true }); }],
  ["model year promotion", draft => { Object.assign(draft.records.at(-1)!, { modelYear: 2026 }); }],
  ["historical archive", draft => { draft.reconciledLeads.pop(); }],
  ["archive order", draft => { draft.reconciledLeads.reverse(); }],
  ["wrong dependent count", draft => { draft.counts.unresolvedLeadGroups = 144; }],
  ["unrelated count", draft => { draft.counts.byVehicleClass.bus += 1; }],
  ["missing artifact", draft => { draft.sourceArtifacts.pop(); }],
  ["artifact drift", draft => { draft.sourceArtifacts.at(-1)!.sha256 = "0".repeat(64); }],
  ["global date", draft => { draft.checkedAt = "2026-10-12"; }],
  ["completion claim", draft => { draft.complete = true; }],
  ["extra note", draft => { draft.notes.push("unexpected"); }],
  ["peripheral change", draft => { draft.peripheralRecords.reverse(); }],
];
for (const [name, change] of mutations) test("95 predecessor reconstruction rejects " + name, () => {
  const draft = structuredClone(market); change(draft);
  assert.throws(() => reconstructMarketBeforeCheckpoint95(draft));
});
test("95 sidecar guard rejects byte drift and approval registers remain empty", () => {
  const bytes = readFileSync(new URL("../data/market-mazda-cx6e-lead-evidence-2026-10-12.json", import.meta.url));
  assert.doesNotThrow(() => assertMarketEvidence95(bytes));
  assert.throws(() => assertMarketEvidence95(Buffer.concat([bytes, Buffer.from(" ")])));
  for (const name of ["approved-corrections", "approved-feature-corrections", "approved-availability-corrections"])
    assert.deepEqual(JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8")), []);
});
