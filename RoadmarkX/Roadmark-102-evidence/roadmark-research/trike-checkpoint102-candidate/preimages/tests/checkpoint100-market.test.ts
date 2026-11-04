import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import currentMarket from "../data/market-inventory-2026-10-10.json";
import { fixture100 as fixture, reconstructMarketBeforeCheckpoint100, sourceBeforeCheckpoint100 } from "./helpers/checkpoint100-market-history";
import { createCheckpoint99SourceReader, dataBeforeCheckpoint99, reconstructMarketBeforeCheckpoint99, sourceBeforeCheckpoint99 } from "./helpers/checkpoint99-history";

type Row = Record<string, unknown> & { id: string };
type Market = { records: Row[]; unverifiedLeads: Row[]; counts: Record<string, unknown>; complete: boolean; [key: string]: unknown };
const market = currentMarket as unknown as Market;
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const hash = (value: unknown) => sha(Buffer.from(JSON.stringify(value)));
const read = (file: string) => readFileSync(new URL("../" + file, import.meta.url));
const before = reconstructMarketBeforeCheckpoint100(market);
const targetIds = ["bmw-i3", "bmw-ix4", "dfac-captain-45e", "dfac-captain-85e", "pioneer-ev-dfsk-ec35", "mercedes-benz-eqb", "mercedes-benz-eqe-sedan", "mercedes-benz-eqe-suv", "mercedes-benz-eqs-suv", "mercedes-benz-maybach-eqs"];

test("100 changes exactly ten held entries and only four evidence fields each", () => {
  assert.deepEqual(fixture.changes.map((change) => change.id), targetIds);
  assert.deepEqual(fixture.allowedFields, ["checkedAt", "evidenceNote", "limitations", "sourceUrls"]);
  assert.deepEqual(Object.keys(market).filter((key) => hash(market[key]) !== hash(before[key])), ["records", "unverifiedLeads"]);
  assert.equal(market.records.length, 242);
  assert.equal(market.unverifiedLeads.length, 143);
  assert.deepEqual(market.counts, before.counts);
  assert.deepEqual(market.counts, fixture.countsBefore);
  assert.deepEqual(fixture.countsBefore, fixture.countsAfter);
  assert.equal(market.complete, false);
  for (const section of ["records", "unverifiedLeads"] as const) {
    assert.deepEqual(market[section].map((row) => row.id), before[section].map((row) => row.id));
    const changed = market[section].filter((row, index) => hash(row) !== hash(before[section][index])).map((row) => row.id);
    assert.deepEqual(changed, fixture.changes.filter((change) => change.section === section).map((change) => change.id));
  }
});

for (const change of fixture.changes) test(`100 preserves every non-evidence field for ${change.id}`, () => {
  const row = market[change.section][change.index];
  assert.deepEqual(row, change.after);
  assert.deepEqual(before[change.section][change.index], change.before);
  const unchanged = (value: Row) => Object.fromEntries(Object.entries(value).filter(([key]) => !fixture.allowedFields.includes(key)));
  assert.deepEqual(unchanged(row), unchanged(change.before));
  assert.equal(row.checkedAt, "2026-10-12");
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.rankingEligible, false);
  if (change.section === "records") {
    assert.deepEqual(row.trims, ["50 xDrive"]);
    assert.equal(row.trimCoverage, "partial");
    assert.equal(row.availabilityCategory, "current_listing_order_stock_unconfirmed");
    assert.equal(row.catalogueCoverage, "market_audit_only");
    assert.equal(row.modelYear, null);
    assert.equal(row.completeVehicleCountEligible, null);
  } else {
    assert.deepEqual(row.trims, []);
    assert.equal(row.resolutionStatus, "unresolved");
  }
});

test("100 preserves the complete99 inventory as actual byte and value predecessors", () => {
  const bytes = read(fixture.marketFile);
  assert.equal(sha(bytes), fixture.afterSHA256);
  assert.equal(sha(sourceBeforeCheckpoint100(fixture.marketFile, bytes)), "ea4e4f7120e7739de987405740641997c15c6bb0704082724ae3d38055b6fdfa");
  assert.equal(hash(before), "f355371683ec63d2eedf1c0e6fbc37f2c872e01a3cc1715c39f01ce3d11646be");
  assert.deepEqual(JSON.parse(sourceBeforeCheckpoint100(fixture.marketFile, bytes).toString("utf8")), before);
  assert.equal(sha(read("qa/checkpoint99-mazda-fixture.json")), "405e14b6a02a771fba0fb8cdfea6f651c817f6b8e112dfb531dd94b73164e3a2");
  assert.throws(() => reconstructMarketBeforeCheckpoint100(before), "Already-old values cannot be reversed twice");
  assert.throws(() => sourceBeforeCheckpoint100(fixture.marketFile, sourceBeforeCheckpoint100(fixture.marketFile, bytes)));
  assert.throws(() => sourceBeforeCheckpoint100(fixture.marketFile, Buffer.concat([bytes, Buffer.from(" ")])));
  assert.throws(() => sourceBeforeCheckpoint100("./" + fixture.marketFile, bytes));
});

test("100 normalization keeps every99 whole-value, whole-byte and coordinated-file assertion", () => {
  const bytes99 = sourceBeforeCheckpoint100(fixture.marketFile, read(fixture.marketFile));
  const expected98 = sourceBeforeCheckpoint99(fixture.marketFile, bytes99);
  assert.equal(sha(expected98), "64f38d5d72f75c2a5264568602d5a1eacae49b1aba8b1e8cfcf5a9708a35c023");
  assert.deepEqual(sourceBeforeCheckpoint99(fixture.marketFile, read(fixture.marketFile)), expected98);
  assert.deepEqual(createCheckpoint99SourceReader(read)(fixture.marketFile), expected98);
  assert.deepEqual(dataBeforeCheckpoint99(fixture.marketFile), JSON.parse(expected98.toString("utf8")));
  assert.deepEqual(reconstructMarketBeforeCheckpoint99(market), reconstructMarketBeforeCheckpoint99(before));
  assert.throws(() => createCheckpoint99SourceReader((file) => file === fixture.marketFile ? expected98 : read(file)));
  assert.throws(() => createCheckpoint99SourceReader((file) => file === "data/catalogue-additions-2026-10-10.json" ? Buffer.concat([read(file), Buffer.from(" ")]) : read(file)));
  const one = sourceBeforeCheckpoint100(fixture.marketFile, read(fixture.marketFile));
  one.fill(0);
  assert.equal(sha(sourceBeforeCheckpoint100(fixture.marketFile, read(fixture.marketFile))), fixture.beforeSHA256, "A caller cannot mutate a cached predecessor");
});

test("100 keeps BMW local/global timing and announced variants separate from held grades", () => {
  const i3 = market.records.find((row) => row.id === "bmw-i3")!;
  const ix4 = market.records.find((row) => row.id === "bmw-ix4")!;
  assert.match(String(i3.evidenceNote), /electric-range FAQ says arrival in 2027/);
  assert.match(String(ix4.evidenceNote), /global, not certified Australian timing/);
  assert.match(JSON.stringify(i3.limitations), /not a formal model year/);
  assert.match(JSON.stringify(i3.limitations), /M60 order timing applies only to M60, not 50 xDrive/);
  assert.match(JSON.stringify(ix4.limitations), /no Australian launch month/);
  assert.match(JSON.stringify(ix4.limitations), /Historical sales code 22HU has not been reverified/);
});

test("100 keeps commercial interest, layout, approval and measurement evidence bounded", () => {
  for (const id of ["dfac-captain-45e", "dfac-captain-85e"]) {
    const row = market.unverifiedLeads.find((entry) => entry.id === id)!;
    assert.match(String(row.evidenceNote), /general enquiry form/);
    assert.match(String(row.evidenceNote), /diesel Captain 45 campaign is not evidence/);
    assert.equal(row.roadRegistrationScope, "unverified");
    assert.equal(row.exactConfigurationStatus, "partial_or_unverified");
  }
  const pioneer = market.unverifiedLeads.find((row) => row.id === "pioneer-ev-dfsk-ec35")!;
  assert.equal(pioneer.brand, "Pioneer EV / DFSK");
  assert.match(String(pioneer.evidenceNote), /DFSK badge association and road approval remain unverified/);
  assert.match(JSON.stringify(pioneer.limitations), /not verified independently orderable Australian grades/);
  assert.match(JSON.stringify(pioneer.limitations), /WLTP heading conflicts with an NEDC-labelled range/);
  assert.match(JSON.stringify(pioneer.limitations), /approval wording concerns chargers/);
  assert.match(JSON.stringify(pioneer.limitations), /separate from later HTTP 406/);
});

type Mutation = [string, (draft: Market) => void];
const mutations: Mutation[] = [
  ["unrelated record", (draft) => { draft.records[0].model = "changed"; }],
  ["unrelated lead", (draft) => { draft.unverifiedLeads[0].model = "changed"; }],
  ["record order", (draft) => { draft.records.reverse(); }],
  ["lead order", (draft) => { draft.unverifiedLeads.reverse(); }],
  ["missing record", (draft) => { draft.records.pop(); }],
  ["extra lead", (draft) => { draft.unverifiedLeads.push(structuredClone(draft.unverifiedLeads[0])); }],
  ["count drift", (draft) => { draft.counts.namedTrimConfigurationEntries = 396; }],
  ["global date", (draft) => { draft.checkedAt = "2026-10-12"; }],
  ["completeness", (draft) => { draft.complete = true; }],
  ["ranking", (draft) => { draft.records[33].rankingEligible = true; }],
  ["invented grade", (draft) => { draft.records[40].trims = ["50 xDrive", "M60 xDrive"]; }],
  ["order acceptance", (draft) => { draft.unverifiedLeads[47].orderStatus = "accepting_orders"; }],
  ["stock promotion", (draft) => { draft.unverifiedLeads[74].stockStatus = "new_stock_listed"; }],
  ["physical-stock claim", (draft) => { draft.records[33].physicalStockVerified = true; }],
  ["formal model year", (draft) => { draft.records[40].modelYear = 2027; }],
  ["count eligibility", (draft) => { draft.records[40].completeVehicleCountEligible = true; }],
];
for (const change of fixture.changes) {
  mutations.push([`mixed before/after state: ${change.id}`, (draft) => { draft[change.section][change.index] = structuredClone(change.before); }]);
  for (const key of fixture.allowedFields) mutations.push([`unreviewed ${key}: ${change.id}`, (draft) => { draft[change.section][change.index][key] = "unreviewed"; }]);
}
for (const [name, mutate] of mutations) test(`100 rejects ${name}`, () => {
  const draft = structuredClone(market);
  mutate(draft);
  assert.throws(() => reconstructMarketBeforeCheckpoint100(draft));
  assert.throws(() => reconstructMarketBeforeCheckpoint99(draft));
});
