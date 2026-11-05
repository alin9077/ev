import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { applicationRequire, compiledSource } from "./helpers/compiled-source";

const inventory = applicationRequire("./data/market-inventory-2026-10-10.json");
const codec = applicationRequire("./src/lib/portable-string-codec.ts") as typeof import("../src/lib/portable-string-codec");

function loadPortable(marketInventory: unknown) {
  const raw = JSON.stringify({
    marketInventory,
    cars: [], packs: {},
    research: { sources: [], criteria: [], publication_issues: [], trim_equipment: [] },
    counts: { variants: 0, families: 0, generations: 0, criteria: 0, evidence: 0, current: 0, outgoing: 0, provisional: 0 },
    art: {},
  });
  const encoded = codec.encodePortableJson(raw, 32).json;
  let reads = 0;
  const data = compiledSource("src/portable/data.ts", {}, {
    getElementById: (id: string) => {
      assert.equal(id, "ev-data"); reads++;
      return { textContent: encoded };
    },
  });
  const adapter = compiledSource("src/portable/market-inventory-data.ts", { "./data": data });
  return { data, adapter, reads, encoded };
}

test("canonical market provider retains the original complete shared JSON object", () => {
  const provider = compiledSource("src/lib/market-inventory-data.ts");
  assert.equal(provider.default, inventory);
  assert.deepEqual(provider.default, inventory);
});

test("portable market transport preserves every record and hidden audit metadata", () => {
  const { data, adapter, reads } = loadPortable(inventory);
  assert.equal(reads, 1);
  assert.deepEqual(data.marketInventory, inventory);
  assert.deepEqual(Object.keys(data.marketInventory as object), Object.keys(inventory));
  assert.equal(adapter.default, data.marketInventory);
  assert.equal(adapter.default, adapter.default);
  assert.notEqual(data.marketInventory, inventory);
});

test("portable market transport keeps metadata, literal references and prototype-like keys safe", () => {
  const fixture = JSON.parse('{"records":[],"notes":["~0","</script>","line\\u2028end"],"futureMetadata":{"__proto__":{"polluted":"no"},"constructor":{"prototype":{"marker":true}}},"left":{"same":"a sufficiently long shared string for the thirty two byte dictionary"},"right":{"same":"a sufficiently long shared string for the thirty two byte dictionary"}}');
  const { data, encoded } = loadPortable(fixture);
  const actual = data.marketInventory as typeof fixture;
  assert.deepEqual(actual, fixture);
  assert.equal(Object.getPrototypeOf(actual.futureMetadata), Object.prototype);
  assert.ok(Object.hasOwn(actual.futureMetadata, "__proto__"));
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.notEqual(actual.left, actual.right);
  actual.left.same = "changed";
  assert.equal(actual.right.same, fixture.right.same);
  assert.equal(fixture.left.same, fixture.right.same);
  assert.ok(!encoded.includes("<") && !encoded.includes("\u2028") && !encoded.includes("\u2029"));
});

test("portable market type imports erase and the build selects the portable data boundary", () => {
  const source = fs.readFileSync("src/portable/data.ts", "utf8");
  assert.match(source, /import type \{ MarketInventory \} from "@\/lib\/market-inventory-data"/);
  const builder = fs.readFileSync("scripts/build-portable.ts", "utf8");
  assert.match(builder, /"@\/lib\/market-inventory-data": path\.join\([\s\S]*?"src\/portable\/market-inventory-data\.ts"/);
  assert.match(builder, /const data = \{\s*marketInventory,/);
  assert.match(builder, /encodePortableJson\(JSON\.stringify\(data\), 32\)/);
});
