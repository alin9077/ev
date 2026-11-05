import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { canonicalReviewedJson } from "../src/lib/correction-guards";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogue, research, pack } from "../src/lib/data";
import {
  attributes,
  rankAttribute,
  freshDate,
  exclusionReason,
} from "../src/lib/discovery";
import { comparisonPickerCars } from "../src/lib/picker-car";
import { offerExpired } from "../src/lib/fact-validity";
import { makeReport, reportMarkdown } from "../src/lib/citable";
import {
  storePortablePacks,
  hydratePortablePacks,
} from "../src/lib/portable-packs";
import Detail from "../src/components/detail";
import Discovery from "../src/components/discovery";
import market from "../data/market-inventory-2026-10-10.json";
import fixture from "./fixtures/transit-city-evidence.json";
const cars = catalogue(),
  data = research(),
  city = cars.find((c) => c.id === fixture.id)!,
  full = pack(city.id, { cars, data });
const escape = (s: string) =>
  renderToStaticMarkup(createElement("span", null, s)).slice(6, -7);
const sourceRecordHash = (value: unknown) =>
  createHash("sha256").update(canonicalReviewedJson(value)).digest("hex");

test("Transit City remains a provisional van without verified stock or ranking promotion", () => {
  assert.equal(city.buyerSummary, undefined);
  assert.equal(city.availability, "announced_provisional");
  assert.equal(city.year, "MY27");
  assert.equal(city.availabilityEvidence?.stockStatus, "unverified");
  assert.equal(city.configurationEvidence?.rankingEligible, false);
  assert.equal(city.configurationEvidence?.completeVehicleCountEligible, false);
});
test("reviewed full facts and explicit null guards survive runtime overlays unchanged", () => {
  assert.equal(
    new Set(fixture.proposedFullFacts.map((f: { key: string }) => f.key)).size,
    fixture.proposedFullFacts.length,
  );
  for (const row of fixture.proposedFullFacts) {
    const { variantId, ...expected } = row;
    assert.equal(variantId, city.id);
    assert.deepEqual(city.facts[row.key], expected, row.key);
  }
  for (const key of fixture.requiredNullKeys)
    assert.equal(city.facts[key].value, null, key);
  const extra = Object.keys(city.facts).filter(
    (k) => !fixture.proposedFullFacts.some((f: { key: string }) => f.key === k),
  );
  assert.deepEqual(extra, ["turning_circle_m"]);
  assert.equal(city.facts.turning_circle_m.value, null);
});
test("announced evidence stays conditional with optional paint separate and closed source references", () => {
  const distribution: Record<string, number> = {};
  for (const row of fixture.proposedFullFacts) {
    distribution[row.status] = (distribution[row.status] || 0) + 1;
    assert.equal(row.date, "2026-10-10");
    assert.equal(row.comparisonBasis, "");
    for (const id of row.sourceIds)
      assert.ok(
        data.sources.some((s) => s.id === id),
        id,
      );
  }
  assert.deepEqual(distribution, {
    conditional: 207,
    not_verified: 104,
    optional: 3,
  });
  assert.equal(city.facts.range_km.value, 254);
  assert.equal(city.facts.range_city_km.value, 380);
  assert.match(JSON.stringify(city.facts.range_km), /targeted|estimated/);
  assert.equal(city.facts.price_aud.value, null);
  assert.equal(
    city.facts.manufacturer_recommended_driveaway_from_aud.value,
    50000,
  );
  assert.equal(city.facts.cargo_loose_fill_m3.value, 6.4);
  assert.equal(city.facts.cargo_vda_m3.value, 5.75);
});
test("all attributes explicitly exclude provisional City even after a numerical fact is promoted", () => {
  for (const attribute of attributes) {
    const ranked = rankAttribute(cars, data.sources, attribute.key, {
      asOf: "2026-10-11",
      maxAgeDays: 30,
    });
    assert.equal(ranked.excluded.filter((e) => e.carId === city.id).length, 1);
    const changed = structuredClone(city);
    changed.facts[attribute.key] = {
      ...changed.facts[attribute.key],
      value: 999,
      status: "standard",
      comparisonBasis: "Artificial matching basis",
      issues: [],
    };
    assert.ok(
      exclusionReason(changed, changed.facts[attribute.key], data.sources, {
        asOf: "2026-10-11",
        maxAgeDays: 30,
      }),
    );
  }
});
test("freshness and voucher dates never imply delivered stock or base-price expiry", () => {
  assert.equal(
    freshDate("2026-10-10", { asOf: "2026-11-09", maxAgeDays: 30 }),
    true,
  );
  assert.equal(
    freshDate("2026-10-10", { asOf: "2026-11-10", maxAgeDays: 30 }),
    false,
  );
  const dated = Object.values(city.facts).filter(
    (f) => f.validUntil !== undefined,
  );
  assert.equal(dated.length, 1);
  assert.equal(dated[0].key, "source_city_pricing_advertised_launch_offer");
  assert.equal(offerExpired(dated[0], "2026-12-31"), false);
  assert.equal(offerExpired(dated[0], "2027-01-01"), true);
  assert.equal(
    city.facts.manufacturer_recommended_driveaway_from_aud.validUntil,
    undefined,
  );
  for (const asOf of ["2026-11-01", "2027-01-01"]) {
    assert.ok(
      exclusionReason(city, city.facts.range_km, data.sources, {
        asOf,
        maxAgeDays: 30,
      }),
    );
    assert.equal(city.availability, "announced_provisional");
    assert.equal(city.availabilityEvidence?.stockStatus, "unverified");
  }
});
test("embedded original record and full anchors survive pack serialization without a filesystem resolver", () => {
  const cfg = city.configurationEvidence!;
  assert.ok(cfg.preservedSourceRecord);
  assert.ok(cfg.sourceCitationLedger);
  assert.equal(
    sourceRecordHash(cfg.preservedSourceRecord),
    cfg.preservedSourceRecordCanonicalSHA256,
  );
  const store = storePortablePacks({ [city.id]: full });
  const hydrated = hydratePortablePacks(
    JSON.parse(JSON.stringify(store)),
    JSON.parse(JSON.stringify(data.sources)),
  );
  assert.deepEqual(hydrated[city.id], JSON.parse(JSON.stringify(full)));
  assert.deepEqual(hydrated[city.id].car.configurationEvidence, cfg);
  assert.match(String(cfg.sourceCaptureLimitations), /HTTP 403/);
  assert.match(String(cfg.sourceCaptureLimitations), /No original PDF bytes/);
});
test("detail renders all six conditions and full nested facts without inventing buyer copy", () => {
  const html = renderToStaticMarkup(
    createElement(Detail, { pack: full, criteria: data.criteria }),
  );
  for (const text of fixture.requiredConditions)
    assert.ok(html.includes(escape(text)), text);
  assert.ok(html.includes("Exact new stock not verified"));
  assert.ok(html.includes("MY27"));
  assert.ok(!html.includes("Why consider this exact version"));
  assert.ok(!html.includes("[object Object]"));
  assert.ok(!html.includes(">27<"));
});
test("discovery preserves provisional targeted scope and offers no numerical winning claim", () => {
  const html = renderToStaticMarkup(
    createElement(Discovery, { initialVehicleScope: "all", cars: [city], sources: data.sources }),
  );
  assert.ok(html.includes("announced/provisional"));
  assert.ok(html.includes("targeted/estimated WLTP"));
  assert.ok(html.includes("Stock not verified"));
  assert.ok(!html.includes("A relative strength"));
  assert.ok(!html.includes(">254 km<"));
});
test("citable report retains exact provisional generation and all availability conditions", () => {
  const report = makeReport([full], "/cars/test-city"),
    md = reportMarkdown(report),
    json = JSON.stringify(report);
  assert.match(md, /Transit City/);
  assert.match(json, /targeted\/estimated/);
  assert.match(json, /pre-delivery/);
  for (const s of fixture.requiredConditions)
    assert.ok(json.includes(JSON.stringify(s).slice(1, -1)), s);
  assert.ok(!md.includes("[object Object]"));
});
test("actual open picker shows provisional qualification rather than a bare projected range", async () => {
  const React = await import("react");
  const { compiledSource } = await import("./helpers/compiled-source");
  let pos = 0;
  const hooks = {
    ...React,
    useEffect: () => {},
    useRef: (v: unknown) => ({ current: v }),
    useState: (initial: unknown) => {
      const i = pos++;
      return [i === 0 ? true : i === 2 || i === 8 ? "all" : initial, () => {}];
    },
  };
  const Component = compiledSource("src/components/picker.tsx", {
    react: hooks,
  }).VariantPicker as (props: unknown) => React.ReactNode;
  const projected = comparisonPickerCars([city]);
  const html = renderToStaticMarkup(
    Component({
      cars: projected,
      selected: city.id,
      onSelect: () => {},
      label: "Choose an EV",
    }),
  );
  assert.ok(html.includes("targeted/estimated WLTP"));
  assert.ok(html.includes("pre-delivery"));
  assert.ok(!html.includes("254"));
  assert.ok(html.includes("MY27"));
  assert.ok(!html.includes(">27<"));
});
test("Transit City market entry keeps provisional stock and ranking boundaries", () => {
  const row = market.records.find((r) => r.id === "ford-transit-city")!;
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.rankingEligible, false);
  assert.deepEqual(row.catalogueVariantIds, [city.id]);
});
