import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { checkpoint102Fixture, isCheckpoint102MarketBytes, isCheckpoint102MarketValue, reconstructMarketBeforeCheckpoint102, sourceBeforeCheckpoint102 } from "./helpers/checkpoint102-market-history";
import { createCheckpoint102SourceReader } from "./helpers/checkpoint102-source-history";
import { createCheckpoint101SourceReader } from "./helpers/checkpoint101-source-history";
import { reconstructMarketBeforeCheckpoint100, sourceBeforeCheckpoint100 } from "./helpers/checkpoint100-market-history";
import { createCheckpoint99SourceReader, reconstructMarketBeforeCheckpoint99, sourceBeforeCheckpoint99 } from "./helpers/checkpoint99-history";
import { createCheckpoint97SourceReader } from "./helpers/checkpoint97-source-history";
import { createCheckpoint96SourceReader } from "./helpers/checkpoint96-source-history";
const read = (file: string) => readFileSync(new URL("../" + file, import.meta.url));
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const hash = (value: unknown) => sha(Buffer.from(JSON.stringify(value)));
const fixture = checkpoint102Fixture();
const bytes = read(fixture.market.file);
type Row = Record<string, unknown> & { id: string };
type Market = Record<string, unknown> & { records: Row[]; unverifiedLeads: Row[]; peripheralRecords: Row[]; counts: Record<string, unknown> };
const market = JSON.parse(bytes.toString("utf8")) as Market;

test("102 reverses only the sealed whole value and exact bytes to the actual101/100 market", () => {
  const snapshot = JSON.stringify(market);
  assert.equal(isCheckpoint102MarketValue(market), true);
  assert.equal(isCheckpoint102MarketBytes(fixture.market.file, bytes), true);
  const old = reconstructMarketBeforeCheckpoint102(market);
  assert.equal(hash(old), fixture.market.beforeJSONSHA256);
  const oldBytes = sourceBeforeCheckpoint102(fixture.market.file, bytes);
  assert.equal(sha(oldBytes), "2469610f9bea19221ed99483b01ca23ca4f9bb62356a873398e9895c2eb838ac");
  assert.equal(oldBytes.length, 1653304);
  assert.deepEqual(JSON.parse(oldBytes.toString("utf8")), old);
  assert.equal(JSON.stringify(market), snapshot);
  old.records[0].unknown = "caller mutation";
  oldBytes.fill(0);
  assert.equal(hash(reconstructMarketBeforeCheckpoint102(market)), fixture.market.beforeJSONSHA256);
  assert.equal(sha(sourceBeforeCheckpoint102(fixture.market.file, bytes)), fixture.market.beforeSHA256);
  assert.throws(() => reconstructMarketBeforeCheckpoint102(reconstructMarketBeforeCheckpoint102(market)));
  assert.throws(() => sourceBeforeCheckpoint102(fixture.market.file, sourceBeforeCheckpoint102(fixture.market.file, bytes)));
});

test("102 retains100-to99-to98 semantic and byte chains and their original pins", () => {
  const old101 = reconstructMarketBeforeCheckpoint102(market);
  const old99 = reconstructMarketBeforeCheckpoint100(old101);
  assert.equal(hash(old99), "f355371683ec63d2eedf1c0e6fbc37f2c872e01a3cc1715c39f01ce3d11646be");
  assert.deepEqual(reconstructMarketBeforeCheckpoint99(market), reconstructMarketBeforeCheckpoint99(old99));
  const bytes101 = sourceBeforeCheckpoint102(fixture.market.file, bytes);
  assert.throws(() => sourceBeforeCheckpoint100(fixture.market.file, bytes), "Old100 helper must reject direct102 bytes");
  assert.throws(() => reconstructMarketBeforeCheckpoint100(market), "Old100 helper must reject direct102 values");
  assert.equal(sha(sourceBeforeCheckpoint100(fixture.market.file, bytes101)), "ea4e4f7120e7739de987405740641997c15c6bb0704082724ae3d38055b6fdfa");
  assert.equal(sha(sourceBeforeCheckpoint99(fixture.market.file, bytes)), "64f38d5d72f75c2a5264568602d5a1eacae49b1aba8b1e8cfcf5a9708a35c023");
});

const mutations: [string, (value: Market) => void][] = [
  ["unrelated row", value => { value.records[0].unknown = "drift"; }],
  ["target deletion", value => { value.records.pop(); }],
  ["unrelated deletion", value => { value.records.splice(0, 1); }],
  ["target duplicate", value => { value.records.push(structuredClone(value.records.at(-1)!)); }],
  ["record reorder", value => { value.records.reverse(); }],
  ["lead reorder", value => { value.unverifiedLeads.reverse(); }],
  ["global date", value => { value.checkedAt = "2026-10-12"; }],
  ["unknown top metadata", value => { value.extra = null; }],
  ["count", value => { value.counts.namedTrimConfigurationEntries = 396; }],
  ["stock", value => { value.records.at(-1)!.stockStatus = "new_stock_listed"; }],
  ["trim inflation", value => { value.records.at(-1)!.trims = ["Cargo 01", "Cargo 02"]; }],
  ["source URL", value => { value.records.at(-1)!.sourceUrls = ["https://example.invalid/"]; }],
  ["source date", value => { value.records.at(-1)!.checkedAt = "2026-10-13"; }],
  ["lithium approval", value => { value.unverifiedLeads.at(-1)!.lithiumApprovalVerified = true; }],
  ["peripheral road promotion", value => { value.peripheralRecords.at(-1)!.coreRoadVehicleRecord = true; }],
];
for (const [label, mutate] of mutations) test(`102 rejects whole-value drift: ${label}`, () => {
  const value = structuredClone(market); mutate(value);
  assert.equal(isCheckpoint102MarketValue(value), false);
  assert.throws(() => reconstructMarketBeforeCheckpoint102(value), /Whole checkpoint102 market value/);
  assert.throws(() => reconstructMarketBeforeCheckpoint99(value), "Historical normalization never admits an unknown102 value");
});

for (const [section, ids] of [["records", ["ozetrike-mate150"]], ["unverifiedLeads", ["kyburz-dxp", "emos-ct-kargo", "emos-ct-kube", "stealth-ozpod", "ozetrike-mate150l"]], ["peripheralRecords", ["jinpeng-e-ql150"]]] as const)
  for (const id of ids) test(`102 binds the exact appended disposition: ${id}`, () => {
    const value = structuredClone(market);
    value[section].find(row => row.id === id)!.recordScope = "drift";
    assert.throws(() => reconstructMarketBeforeCheckpoint102(value));
  });

test("102 rejects raw whitespace, CRLF, truncation, same-length and unsafe-path mutations", () => {
  const mutations = [Buffer.concat([bytes, Buffer.from(" ")]), bytes.subarray(0, bytes.length - 1), Buffer.from(bytes.toString().replaceAll("\n", "\r\n")), Buffer.from(bytes.toString().replace('"Mate150"', '"Mate151"'))];
  for (const altered of mutations) {
    assert.equal(isCheckpoint102MarketBytes(fixture.market.file, altered), false);
    assert.throws(() => sourceBeforeCheckpoint102(fixture.market.file, altered));
  }
  for (const file of ["./" + fixture.market.file, "data/../" + fixture.market.file, "/" + fixture.market.file, "data\\market-inventory-2026-10-10.json", fixture.market.file + "?x", fixture.market.file + "#x", ""]) assert.throws(() => sourceBeforeCheckpoint102(file, bytes));
});

test("102 source reader verifies all reviewed files before exposing exact101 preimages", () => {
  const old = createCheckpoint102SourceReader(read);
  for (const entry of fixture.changes) {
    const before = old(entry.file);
    assert.equal(sha(before), entry.previousSHA256, entry.file);
    assert.equal(before.length, entry.previousBytes, entry.file);
    before.fill(0);
    assert.equal(sha(old(entry.file)), entry.previousSHA256, "Copy on return");
  }
  assert.throws(() => createCheckpoint101SourceReader(read), /Unapproved checkpoint101 source/, "Direct102 source must fail the untouched101 helper");
  for (const file of fixture.introduced.map(entry => entry.file)) assert.throws(() => old(file), /No checkpoint101 predecessor/);
  for (const file of ["./data/x", "data//x", "data/../x", "/data/x", "data\\x", "data/%78", "data/x?y", "data/x#y", ""]) assert.throws(() => old(file), /Unsafe checkpoint101 path/);
  const mutable = checkpoint102Fixture(); mutable.market.beforeSHA256 = "caller mutation";
  assert.equal(checkpoint102Fixture().market.beforeSHA256, fixture.market.beforeSHA256);
});

for (const file of [...fixture.changes, ...fixture.introduced].map(entry => entry.file)) test(`102 coordinated source rejects mutated or missing file: ${file}`, () => {
  assert.throws(() => createCheckpoint102SourceReader(name => name === file ? Buffer.concat([read(name), Buffer.from(" ")]) : read(name)), /Unapproved checkpoint102/);
  assert.throws(() => createCheckpoint102SourceReader(name => { if (name === file) throw new Error("missing " + file); return read(name); }), /missing/);
});

test("102 rejects mixed101/102 states and preserves the full101-to96 source chain", () => {
  const read101 = createCheckpoint102SourceReader(read);
  for (const entry of fixture.changes) assert.throws(() => createCheckpoint102SourceReader(file => file === entry.file ? read101(file) : read(file)), /Unapproved checkpoint102/);
  assert.throws(() => createCheckpoint102SourceReader(read101));
  const read98 = createCheckpoint99SourceReader(read101);
  const read100 = createCheckpoint101SourceReader(read98);
  const read96 = createCheckpoint97SourceReader(read100);
  const read95 = createCheckpoint96SourceReader(read96);
  assert.equal(sha(read95("src/components/discovery.tsx")), "c382047506d1881d4483e6478757dca41fc6d8011855e151027df027f689aa6f");
  for (const entry of fixture.preservedPins) assert.equal(sha(read(entry.file)), entry.sha256, entry.file);
});
