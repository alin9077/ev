import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  projectMarketView,
  serializeMarketView,
  recordFields,
  topFields,
} from "../scripts/generate-market-view.mjs";
import { applicationRequire, compiledSource } from "./helpers/compiled-source";

const inventory = applicationRequire("./data/market-inventory-2026-10-10.json");
const view = applicationRequire("./data/market-view.generated.json");

test("generated market projection exactly preserves all display and search values", () => {
  assert.deepEqual(view, projectMarketView(inventory));
  assert.equal(view.records.length, 243);
  assert.deepEqual(Object.keys(view), topFields);
  for (const [index, record] of view.records.entries()) {
    assert.deepEqual(
      Object.keys(record),
      recordFields.filter((key) =>
        Object.hasOwn(inventory.records[index], key),
      ),
    );
    for (const key of Object.keys(record))
      assert.deepEqual(record[key], inventory.records[index][key]);
  }
  assert.equal(
    readFileSync(
      new URL("../data/market-view.generated.json", import.meta.url),
      "utf8",
    ),
    serializeMarketView(inventory),
  );
});

test("projection does not mutate or alias canonical values and excludes audit metadata", () => {
  const before = JSON.stringify(inventory);
  const projected = projectMarketView(inventory);
  (projected.records[0] as { trims: string[] }).trims.push("test mutation");
  assert.equal(JSON.stringify(inventory), before);
  assert.ok(!Object.hasOwn(view, "unverifiedLeads"));
  assert.ok(
    view.records.every(
      (record: object) => !Object.hasOwn(record, "evidenceHistory"),
    ),
  );
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
    assert.equal(
      render({ ...inventory, records: inventory.records.slice(i, i + 24) }),
      render({ ...view, records: view.records.slice(i, i + 24) }),
    );
  }
});
