import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import market from "../data/market-inventory-2026-10-10.json";
import evidence from "../data/market-deepway-star-lead-evidence-2026-10-12.json";
import { catalogue, research } from "../src/lib/data";
import { marketBeforeCheckpoint93 as before, marketHash93, reconstructMarketBeforeCheckpoint93, assertMarketEvidence93 } from "./helpers/checkpoint93-market-history";

const lead = market.unverifiedLeads.at(-1)!;
test("93 appends exactly one held family lead and evidence artifact, with no record or global-date change", () => {
  const changed = Object.keys(market).filter(key => JSON.stringify((market as Record<string, unknown>)[key]) !== JSON.stringify((before as Record<string, unknown>)[key])).sort();
  assert.deepEqual(changed, ["counts", "sourceArtifacts", "unverifiedLeads"]);
  assert.deepEqual(market.records, before.records);
  assert.equal(market.records.length, 241);
  assert.equal(market.unverifiedLeads.length, 144);
  assert.deepEqual(market.unverifiedLeads.slice(0, -1), before.unverifiedLeads);
  assert.deepEqual(market.sourceArtifacts.slice(0, -1), before.sourceArtifacts);
  assert.equal(market.sourceArtifacts.length, 18);
  assert.deepEqual(market.counts, { ...before.counts, unresolvedLeadGroups: 144 });
  assert.equal(market.checkedAt, "2026-10-10");
  assert.equal(market.complete, false);
  assert.equal(marketHash93(before), "1ef8b23a540877e4bf8bf0a52dcf1effa3670e2b4bad606abff8cec6169c2643");
});
test("Deepway remains one unresolved family with no exact trim, stock, authority or ranking promotion", () => {
  assert.equal(lead.id, "deepway-star");
  assert.equal(market.unverifiedLeads.filter(row => row.id === lead.id).length, 1);
  assert.ok(!market.records.some(row => row.id === lead.id));
  assert.deepEqual(lead.trims, []);
  assert.deepEqual(lead.modelAliases, []);
  assert.equal(lead.orderStatus, "listed_unconfirmed");
  assert.equal(lead.stockStatus, "unverified");
  assert.equal(lead.rankingEligible, false);
  assert.equal(lead.roadRegistrationScope, "unverified");
  assert.equal(lead.exactConfigurationStatus, "partial_or_unverified");
  assert.equal(lead.recordScope, "unverified_lead");
  assert.equal(lead.resolutionStatus, "unresolved");
  assert.equal(lead.checkedAt, "2026-10-12");
  assert.ok(lead.limitations);
  assert.match(lead.limitations.join(" "), /authority is self-described/);
  assert.match(lead.limitations.join(" "), /No numerical specification/);
  assert.ok(Object.values(evidence.holds).every(value => value === false));
});
test("evidence distinguishes direct dealer text from indexed404 articles and preserves date scope", () => {
  assert.equal(evidence.sources.length, 3);
  const direct = evidence.sources[0];
  assert.equal(direct.retrieval, "direct_web_open_success");
  assert.equal(direct.httpStatus, null);
  assert.equal(direct.authorityIndependentlyVerified, false);
  assert.equal(direct.capture.originHTMLRetained, false);
  for (const source of evidence.sources.slice(1)) {
    assert.equal(source.retrieval, "search_index_text_available_direct_web_open_404");
    assert.equal(source.toolReportedHTTPStatus, 404);
  }
  assert.equal(evidence.applicationScope.wholeMarketReverified, false);
  assert.equal(evidence.applicationScope.exactDetailedConfigurationProposalApproved, false);
  assert.equal(evidence.proposedCountEffect.activeLeadGroups, 1);
  assert.equal(evidence.proposedCountEffect.detailedConfigurations, 0);
  assert.equal(evidence.proposedCountEffect.catalogueSourceRecords, 0);
  assert.equal(evidence.proposedCountEffect.verifiedAvailableVehicles, 0);
  assert.ok(evidence.sources.every(source => source.capture.rawCaptureIncludedInThisSidecar === false));
  assert.equal(market.sourceArtifacts.at(-1)!.path, "market-deepway-star-lead-evidence-2026-10-12.json");
});
test("catalogue remains343 configurations149 families and2196 sources without Deepway admission", () => {
  const cars = catalogue();
  assert.equal(cars.length, 343);
  assert.equal(new Set(cars.map(car => car.modelFamily || car.family)).size, 149);
  assert.equal(research().sources.length, 2196);
  assert.ok(!cars.some(car => /deepway/i.test(car.brand + " " + car.model)));
});
const mutations: [string, (draft: typeof market) => void][] = [
  ["prior record", draft => { draft.records[0].model = "changed"; }],
  ["record order", draft => { draft.records.reverse(); }],
  ["prior lead", draft => { draft.unverifiedLeads[0].model = "changed"; }],
  ["lead order", draft => { draft.unverifiedLeads.reverse(); }],
  ["extra lead", draft => { draft.unverifiedLeads.push(draft.unverifiedLeads.at(-1)!); }],
  ["missing lead", draft => { draft.unverifiedLeads.pop(); }],
  ["candidate ranking", draft => { draft.unverifiedLeads.at(-1)!.rankingEligible = true; }],
  ["invented trim", draft => { const last = draft.unverifiedLeads.at(-1)!; assert.ok(last.trims); last.trims.push("Invented trim"); }],
  ["unrelated count", draft => { draft.counts.namedTrimConfigurationEntries += 1; }],
  ["wrong lead count", draft => { draft.counts.unresolvedLeadGroups = 143; }],
  ["missing artifact", draft => { draft.sourceArtifacts.pop(); }],
  ["artifact drift", draft => { draft.sourceArtifacts.at(-1)!.sha256 = "0".repeat(64); }],
  ["global date", draft => { draft.checkedAt = "2026-10-12"; }],
  ["extra note", draft => { draft.notes.push("unexpected"); }],
];
for (const [name, change] of mutations) test("93 predecessor reconstruction rejects " + name, () => {
  const draft = structuredClone(market); change(draft);
  assert.throws(() => reconstructMarketBeforeCheckpoint93(draft));
});
test("93 sidecar verification rejects changed bytes and preserves approval registers", () => {
  const bytes = readFileSync(new URL("../data/market-deepway-star-lead-evidence-2026-10-12.json", import.meta.url));
  assert.doesNotThrow(() => assertMarketEvidence93(bytes));
  assert.throws(() => assertMarketEvidence93(Buffer.concat([bytes, Buffer.from(" ")])));
  for (const name of ["approved-corrections", "approved-feature-corrections", "approved-availability-corrections"])
    assert.deepEqual(JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8")), []);
});
