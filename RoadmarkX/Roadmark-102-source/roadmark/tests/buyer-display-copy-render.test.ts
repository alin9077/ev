import { reconstructMarketBeforeCheckpoint99 } from "./helpers/checkpoint99-history";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Discovery from "../src/components/discovery";
import Detail from "../src/components/detail";
import { WithEvidence } from "../src/components/with-evidence";
import { catalogue, pack, research } from "../src/lib/data";
import { buyerProposal } from "../src/lib/buyer-proposal";
import { buyerDisplayCopy } from "../src/lib/buyer-display-copy";
import { currentBuyerSummary } from "../src/lib/selling-points";
import currentInventory from "../src/lib/market-inventory-data";
const inventory = reconstructMarketBeforeCheckpoint99(currentInventory);
import type { Car, Source } from "../src/lib/types";
import { compiledSource } from "./helpers/compiled-source";

type Replacement = { id: string; field: string; before: string; after: string };
const { replacements } = JSON.parse(
  readFileSync(new URL("./fixtures/buyer-copy97.json", import.meta.url), "utf8"),
) as { replacements: Replacement[] };
const scopeRows = replacements.filter((r) => r.field === "configurationEvidence.projectionScope");
const marketRows = replacements.filter((r) => r.field !== "configurationEvidence.projectionScope");
const cars = catalogue();
const data = research();
const snapshot = { cars, data };
const escape = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
function render(node: ReactNode, sources: Source[] = data.sources) {
  // createElement's types do not infer a required prop from its positional child.
  // This test-only assertion is paired with the required node argument below.
  const props = { sources } as Parameters<typeof WithEvidence>[0];
  return renderToStaticMarkup(createElement(WithEvidence, props, node));
}

function marketHtml(records: typeof inventory.records) {
  const Component = compiledSource("src/components/market-audit.tsx", {
    "@/lib/market-view-data": { __esModule: true, default: { ...inventory, records } },
  }).default as () => ReactNode;
  return render(createElement(Component));
}

test("Discovery and exact detail display all six notices without changing their source objects", () => {
  for (const row of scopeRows) {
    const car = cars.find((c) => c.id === row.id)!;
    assert.ok(car, row.id);
    assert.equal(car.configurationEvidence!.projectionScope, row.before);
    const before = hash(car);
    const discovery = render(createElement(Discovery, { cars: [car], sources: data.sources }));
    const detail = render(createElement(Detail, { pack: pack(car.id, snapshot), criteria: data.criteria }));
    for (const html of [discovery, detail]) {
      assert.ok(html.includes(escape(row.after)), row.id);
      assert.ok(!html.includes(escape(row.before)), row.id);
      assert.match(html, /Captured configuration · specifications incomplete/);
    }
    assert.equal(hash(car), before);
    assert.equal(car.configurationEvidence!.rankingEligible, false);
    assert.equal(car.configurationEvidence!.completeVehicleCountEligible, false);
  }
});

test("Discovery revised and unknown records retain original copy and absent configurations stay absent", () => {
  const row = scopeRows[0];
  const original = cars.find((c) => c.id === row.id)!;
  const cases = [
    { ...original, id: `unknown-${original.id}` },
    { ...original, configurationEvidence: { ...original.configurationEvidence!, projectionScope: row.before + " Review changed." } },
  ];
  for (const car of cases) {
    const html = render(createElement(Discovery, { cars: [car], sources: data.sources }));
    assert.ok(html.includes(escape(car.configurationEvidence!.projectionScope)));
    assert.ok(!html.includes(escape(row.after)));
    assert.equal(car.configurationEvidence!.rankingEligible, false);
  }
  const without = { ...original, configurationEvidence: undefined };
  const html = render(createElement(Discovery, { cars: [without], sources: data.sources }));
  assert.doesNotMatch(html, /Captured configuration · specifications incomplete/);
  assert.ok(!html.includes(escape(row.after)));
});

test("Market renders only the four approved fields and preserves all adjacent limitations and sources", () => {
  const records = inventory.records.filter((r) => marketRows.some((row) => row.id === r.id));
  assert.equal(records.length, 3);
  const before = hash(inventory);
  for (const record of records) {
    const html = marketHtml([record]);
    const evidence = marketRows.find((r) => r.id === record.id && r.field === "evidenceNote");
    assert.ok(html.includes(escape(evidence?.after ?? record.evidenceNote)), record.id);
    for (const [i, limitation] of record.limitations.entries()) {
      const row = marketRows.find((r) => r.id === record.id && r.field === `limitations[${i}]`);
      if (row) {
        assert.equal(limitation, row.before);
        assert.ok(html.includes(escape(row.after)), row.id);
        assert.ok(!html.includes(escape(row.before)), row.id);
      } else assert.ok(html.includes(escape(limitation)), `${record.id} limitation ${i}`);
    }
    for (const url of record.sourceUrls) assert.ok(html.includes(escape(url)), url);
    assert.ok(html.includes(record.checkedAt));
  }
  assert.equal(hash(inventory), before);
});

test("Market changed IDs, positions and wording retain their original unreviewed strings", () => {
  const record = inventory.records.find((r) => r.id === "mazda-cx-6e")!;
  const rows = marketRows.filter((r) => r.id === record.id);
  const unknown = { ...record, id: "unknown-cx-6e" };
  const unknownHtml = marketHtml([unknown]);
  for (const row of rows) {
    assert.ok(unknownHtml.includes(escape(row.before)));
    assert.ok(!unknownHtml.includes(escape(row.after)));
  }
  const moved = { ...record, limitations: ["Additional warning", ...record.limitations], evidenceNote: record.evidenceNote + " Revised." };
  const movedHtml = marketHtml([moved]);
  for (const row of rows) {
    assert.ok(movedHtml.includes(escape(row.before)));
    assert.ok(!movedHtml.includes(escape(row.after)));
  }
  assert.equal(moved.stockStatus, record.stockStatus);
  assert.equal(moved.orderStatus, record.orderStatus);
});

test("guarded identities, buyer summaries and freshness outcomes remain untouched by display formatting", () => {
  const guarded = scopeRows.filter((row) => buyerProposal.records.some((r) => r.variantId === row.id));
  assert.equal(guarded.length, 4);
  const before = hash({ cars, proposal: buyerProposal, sources: data.sources });
  for (const row of guarded) {
    const car = cars.find((c) => c.id === row.id)!;
    const approved = buyerProposal.records.find((r) => r.variantId === row.id)!;
    assert.deepEqual(car.configurationEvidence, approved.expectedIdentity!.configurationEvidence);
    for (const asOf of ["2026-10-12", "2026-12-31", "invalid"]) {
      const prior = currentBuyerSummary(car.buyerSummary, data.sources, { asOf, maxAgeDays: 30 });
      assert.equal(buyerDisplayCopy(car.id, row.field, car.configurationEvidence!.projectionScope), row.after);
      assert.deepEqual(currentBuyerSummary(car.buyerSummary, data.sources, { asOf, maxAgeDays: 30 }), prior);
    }
    assert.equal(car.configurationEvidence!.projectionScope, row.before);
  }
  assert.equal(hash({ cars, proposal: buyerProposal, sources: data.sources }), before);
});

test("pre-clock Discovery keeps the existing evidence fallback and does not reveal buyer claims", () => {
  const row = scopeRows[0];
  const original = cars.find((c) => c.id === row.id)!;
  const source: Source = {
    id: "copy97-clock-proof",
    url: "https://example.com/evidence",
    title: "Clock test evidence",
    publisher: "Test fixture",
    source_type: "audit",
    published_date: null,
    accessed_date: "2026-10-10",
    market: "AU",
    supports: "Synthetic clock-bound display test",
  };
  const car: Car = {
    ...original,
    buyerSummary: {
      checkedAt: "2026-10-10",
      guardSourceIds: [source.id],
      conditions: [],
      strength: { label: "CLOCK-BOUND-LABEL", text: "CLOCK-BOUND-TEXT", sourceIds: [source.id] },
    },
  };
  const sources = [...data.sources, source];
  assert.ok(currentBuyerSummary(car.buyerSummary, sources, { asOf: "2026-10-10", maxAgeDays: 30 })?.strength);
  const html = render(createElement(Discovery, { cars: [car], sources }), sources);
  assert.ok(html.includes(escape(row.after)));
  assert.match(html, /Comparable evidence is still incomplete/);
  assert.doesNotMatch(html, /CLOCK-BOUND-LABEL|CLOCK-BOUND-TEXT|Checking evidence freshness/);
});

test("portable routes use the same component display layer without rewriting packed evidence", () => {
  const entry = readFileSync(new URL("../src/portable/entry.tsx", import.meta.url), "utf8");
  assert.match(entry, /import Discovery from "@\/components\/discovery"/);
  assert.match(entry, /import MarketAudit from "@\/components\/market-audit"/);
  const build = readFileSync(new URL("../scripts/build-portable.ts", import.meta.url), "utf8");
  assert.doesNotMatch(build, /buyerDisplayCopy|buyer-display-copy/);
  const projection = readFileSync(new URL("../src/lib/discovery.ts", import.meta.url), "utf8");
  assert.match(projection, /projectionScope: car\.configurationEvidence\.projectionScope/);
  assert.doesNotMatch(projection, /buyerDisplayCopy|buyer-display-copy/);
});
