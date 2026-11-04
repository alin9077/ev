import { countsBeforeCheckpoint99, researchBeforeCheckpoint99, carsBeforeCheckpoint99 } from "./helpers/checkpoint99-history";
import { carsBeforeCheckpoint91 } from "./helpers/checkpoint91-history";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
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
import { marketBeforeCheckpoint86 as market } from "./helpers/checkpoint86-history";
import {
  marketBeforeCheckpoint84,
  marketHash84,
} from "./helpers/checkpoint84-history";
import {
  carsBeforeCheckpoint84,
  researchBeforeCheckpoint84,
  countsBeforeCheckpoint84,
  dataBeforeCheckpoint84,
} from "./helpers/checkpoint84-runtime";
import type { Fact } from "../src/lib/types";
const fixture = JSON.parse(
  readFileSync(
    new URL("../qa/checkpoint84-runtime-fixture.json", import.meta.url),
    "utf8",
  ),
);
const marketFixture = JSON.parse(
  readFileSync(
    new URL("../qa/checkpoint84-market-fixture.json", import.meta.url),
    "utf8",
  ),
);
const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");
const cars = catalogue(),
  data = research(),
  city = cars.find((c) => c.id === fixture.id)!,
  full = pack(city.id, { cars, data })!;
const pre91 = carsBeforeCheckpoint91(cars);
const escape = (s: string) =>
  renderToStaticMarkup(createElement("span", null, s)).slice(6, -7);
test("City adds one provisional van while current outgoing source and summary counts remain unchanged", () => {
  assert.deepEqual(countsBeforeCheckpoint99(cars, data), {
    variants: 343,
    families: 149,
    generations: 153,
    criteria: 69,
    evidence: 23667,
    current: 327,
    outgoing: 11,
    provisional: 5,
  });
  assert.equal(pre91.filter((c) => c.buyerSummary).length, 330);
  assert.equal(researchBeforeCheckpoint99(data).sources.length, 2196);
  assert.equal(city.buyerSummary, undefined);
  assert.equal(city.availability, "announced_provisional");
  assert.equal(city.year, "MY27");
  assert.equal(city.availabilityEvidence?.stockStatus, "unverified");
  assert.equal(city.configurationEvidence?.rankingEligible, false);
  assert.equal(city.configurationEvidence?.completeVehicleCountEligible, false);
});
test("every previous342 car and pack and2196 source remains exact before historical reconstruction", () => {
  const previous = carsBeforeCheckpoint84(cars);
  assert.equal(previous.length, 342);
  for (const row of fixture.previousCars)
    assert.equal(hash(pack(row.id, { cars: pre91, data })), row.packHash, row.id);
  assert.equal(
    hash(researchBeforeCheckpoint84(data)),
    fixture.previousResearchHash,
  );
  assert.deepEqual(countsBeforeCheckpoint84(), fixture.previousCounts);
  for (const [id, h] of Object.entries(fixture.previousSourceHashes))
    assert.equal(hash(data.sources.find((s) => s.id === id)), h, id);
  dataBeforeCheckpoint84("data/catalogue-additions-2026-10-10.json");
});
test("all314 reviewed full Facts and79 explicit null guards survive final overlays unchanged", () => {
  assert.equal(fixture.proposedFullFacts.length, 314);
  assert.equal(
    new Set(fixture.proposedFullFacts.map((f: Fact) => f.key)).size,
    314,
  );
  for (const row of fixture.proposedFullFacts) {
    const { variantId, ...expected } = row;
    assert.equal(variantId, city.id);
    assert.deepEqual(city.facts[row.key], expected, row.key);
  }
  assert.equal(fixture.requiredNullKeys.length, 79);
  for (const key of fixture.requiredNullKeys)
    assert.equal(city.facts[key].value, null, key);
  const extra = Object.keys(city.facts).filter(
    (k) => !fixture.proposedFullFacts.some((f: Fact) => f.key === k),
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
test("all seven ranked groups stay exact and City adds only an explicit excluded record", () => {
  const before99Cars = carsBeforeCheckpoint99(cars);
  const before99Sources = researchBeforeCheckpoint99(data).sources;
  for (const attribute of attributes) {
    const ranked = rankAttribute(before99Cars, before99Sources, attribute.key, {
      asOf: "2026-10-11",
      maxAgeDays: 30,
    });
    assert.equal(ranked.excluded.filter((e) => e.carId === city.id).length, 1);
    assert.equal(
      hash({
        ...ranked,
        excluded: ranked.excluded.filter((e) => e.carId !== city.id),
      }),
      fixture.previousRankingHashes[attribute.key],
    );
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
    marketHash84(cfg.preservedSourceRecord),
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
    createElement(Discovery, { cars: [city], sources: data.sources }),
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
      return [i === 0 ? true : i === 2 ? "all" : initial, () => {}];
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
test("City market amendment preserves C9H and all other239 rows and changes only documented context counts", () => {
  assert.equal(marketHash84(market), marketFixture.approvedCanonicalSHA256);
  assert.equal(
    marketHash84(marketBeforeCheckpoint84),
    marketFixture.previousCanonicalSHA256,
  );
  assert.deepEqual(
    market.records.filter((r) => r.id !== "ford-transit-city"),
    marketBeforeCheckpoint84.records.filter(
      (r) => r.id !== "ford-transit-city",
    ),
  );
  assert.deepEqual(market.counts, marketBeforeCheckpoint84.counts);
  assert.equal(market.records.length, 240);
  assert.equal(market.counts.namedTrimConfigurationEntries, 393);
  assert.equal(market.complete, false);
  assert.equal(market.detailedCatalogueContext.knownDetailedFamilyCount, 149);
  assert.equal(market.detailedCatalogueContext.knownDetailedTrimCount, 343);
  const row = market.records.find((r) => r.id === "ford-transit-city")!;
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.rankingEligible, false);
  assert.deepEqual(row.catalogueVariantIds, [city.id]);
});
