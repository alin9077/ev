import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { projectMarketView, serializeMarketView, recordFields, topFields } from "../scripts/generate-market-view.mjs";
import { applicationRequire, compiledSource } from "./helpers/compiled-source";
import { createCheckpoint101SourceReader } from "./helpers/checkpoint101-source-history";
import historyFixture from "./fixtures/checkpoint101-source.json";
const inventory = applicationRequire("./data/market-inventory-2026-10-10.json");
const view = applicationRequire("./data/market-view.generated.json");

test("generated market projection exactly preserves all display and search values", () => {
  assert.deepEqual(view, projectMarketView(inventory));
  assert.equal(view.records.length, 242);
  assert.deepEqual(Object.keys(view), topFields);
  for (const [index, record] of view.records.entries()) {
    assert.deepEqual(Object.keys(record), recordFields.filter((key) => Object.hasOwn(inventory.records[index], key)));
    for (const key of Object.keys(record)) assert.deepEqual(record[key], inventory.records[index][key]);
  }
  assert.equal(readFileSync(new URL("../data/market-view.generated.json", import.meta.url), "utf8"), serializeMarketView(inventory));
});

test("projection does not mutate or alias canonical values and excludes audit metadata", () => {
  const before = JSON.stringify(inventory);
  const projected = projectMarketView(inventory);
  (projected.records[0] as { trims: string[] }).trims.push("test mutation");
  assert.equal(JSON.stringify(inventory), before);
  assert.ok(!Object.hasOwn(view, "unverifiedLeads"));
  assert.ok(view.records.every((record: object) => !Object.hasOwn(record, "evidenceHistory")));
});

test("projection rejects duplicate IDs and malformed arrays", () => {
  const duplicate = structuredClone(inventory);
  duplicate.records[1].id = duplicate.records[0].id;
  assert.throws(() => projectMarketView(duplicate), /duplicate/);
  const bad = structuredClone(inventory);
  bad.records[0].sourceUrls = [1];
  assert.throws(() => projectMarketView(bad), /Invalid display array/);
});

test("every market record renders identically through canonical and projected data", () => {
  const render = (data: unknown) => {
    const Component = compiledSource("src/components/market-audit.tsx", {
      "@/lib/market-view-data": { __esModule: true, default: data },
    }).default as () => ReactNode;
    return renderToStaticMarkup(createElement(Component));
  };
  for (let i = 0; i < inventory.records.length; i += 24) {
    assert.equal(render({ ...inventory, records: inventory.records.slice(i, i + 24) }), render({ ...view, records: view.records.slice(i, i + 24) }));
  }
});

test("checkpoint101 reader restores exact source100 import and fails closed on drift", () => {
  const read = (file: string) => readFileSync(new URL("../" + file, import.meta.url));
  const old = createCheckpoint101SourceReader(read);
  assert.match(old("src/components/market-audit.tsx").toString(), /@\/lib\/market-inventory-data/);
  assert.deepEqual(old("src/app/cars/[family]/[variant]/page.tsx"), read("src/app/cars/[family]/[variant]/page.tsx"));
  for (const file of [...historyFixture.introduced.map((entry) => entry.file), "tests/market-view.test.ts", "tests/helpers/checkpoint101-source-history.ts", "tests/fixtures/checkpoint101-source.json"]) assert.throws(() => old(file), /No checkpoint100 predecessor/);
  for (const file of [...historyFixture.changes, ...historyFixture.introduced].map((entry) => entry.file)) {
    assert.throws(() => createCheckpoint101SourceReader((name) => name === file ? Buffer.concat([read(name), Buffer.from(" ")]) : read(name)), /Unapproved checkpoint101 source/);
  }
  for (const file of ["./src/lib/market-view-data.ts", "src/lib/../lib/market-view-data.ts", "/src/lib/market-view-data.ts", "src\\lib\\market-view-data.ts", "src/lib/market%2dview-data.ts", "src/lib/market-view-data.ts?x", "src/lib/market-view-data.ts#x", ""]) assert.throws(() => old(file), /Unsafe checkpoint100 path/);
});
