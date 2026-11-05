import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { catalogueAdditions } from "../src/lib/catalogue-additions";
import { compiledSource } from "./helpers/compiled-source";

test("server additions input preserves every original field and value", () => {
  const raw = readFileSync(
    new URL("../data/catalogue-additions-2026-10-10.json", import.meta.url),
    "utf8",
  );
  assert.deepEqual(catalogueAdditions, JSON.parse(raw));
});
test("server additions input rejects malformed roots and missing array containers", () => {
  const good = {
    checkedAt: "2026-10-10",
    models: [],
    variants: [],
    facts: [],
    features: [],
    sources: [],
  };
  const load = (value: unknown) =>
    compiledSource("src/lib/catalogue-additions.ts", {
      "node:fs": { readFileSync: () => JSON.stringify(value) },
    });
  for (const bad of [null, [], 1, "bad", {}, { ...good, checkedAt: null }])
    assert.throws(() => load(bad));
  for (const key of ["models", "variants", "facts", "features", "sources"]) {
    for (const bad of [undefined, null, {}, "bad"])
      assert.throws(() => load({ ...good, [key]: bad }));
  }
  assert.deepEqual(
    load({ ...good, retainedMetadata: { value: 123 } }).catalogueAdditions,
    { ...good, retainedMetadata: { value: 123 } },
  );
});
