import { carsBeforeCheckpoint82 } from "./helpers/checkpoint82-history";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogue, pack } from "../src/lib/data";
import {
  countsBeforeCheckpoint84 as counts,
  researchBeforeCheckpoint84 as research,
} from "./helpers/checkpoint84-runtime";
import { attributes, rankAttribute } from "../src/lib/discovery";
import { factClaim, makeReport, reportMarkdown } from "../src/lib/citable";
import { auditedFeature } from "../src/lib/launch-evidence";
import Detail from "../src/components/detail";
import { marketBeforeCheckpoint73 as inventory } from "./helpers/checkpoint73-history";
import fixture from "../qa/checkpoint71-fixture.json";
import {
  marketBeforeCheckpoint71,
  verifiedPre71DataHash,
} from "./helpers/checkpoint71-history";
const cars = carsBeforeCheckpoint82(catalogue()),
  data = research(),
  snapshot = { cars, data };
const id = fixture.newAdapter.variants[0].id;
const car = cars.find((c) => c.id === id)!;
const full = pack(id, snapshot);
const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("one bounded New Streetdog offer adds no complete-build or ranking claim", () => {
  assert.deepEqual(counts(), {
    variants: 342,
    families: 148,
    generations: 152,
    criteria: 69,
    evidence: 23598,
    current: 327,
    outgoing: 11,
    provisional: 4,
  });
  assert.equal(data.sources.length, 2196);
  assert.equal(car.year, null);
  assert.equal(car.researchStage, "partial");
  assert.equal(car.buyerSummary, undefined);
  assert.equal(car.configurationEvidence?.rankingEligible, false);
  assert.equal(car.configurationEvidence?.completeVehicleCountEligible, false);
  assert.equal(car.availabilityEvidence?.physicalStockVerified, false);
  assert.equal(car.availabilityEvidence?.stockStatus, "unverified");
  assert.equal(car.facts.source_ftn_streetdog80_advertised_year.value, "2026");
  for (const key of Object.keys(
    fixture.newAdapter.variants[0].configuration_evidence.requiredNulls,
  ))
    assert.equal(car.facts[key].value, null, key);
});

test("all 339 prior complete packs and 327 buyer summaries remain exactly unchanged", () => {
  const old = cars.filter((c) =>
    Object.hasOwn(fixture.legacyRuntime.carHashes, c.id),
  );
  assert.equal(old.length, 339);
  for (const c of old) {
    assert.equal(
      hash(c),
      fixture.legacyRuntime.carHashes[
        c.id as keyof typeof fixture.legacyRuntime.carHashes
      ],
      c.id,
    );
    assert.equal(
      hash(pack(c.id, snapshot)),
      fixture.legacyRuntime.packHashes[
        c.id as keyof typeof fixture.legacyRuntime.packHashes
      ],
      c.id,
    );
  }
  assert.equal(old.filter((c) => c.buyerSummary).length, 327);
  assert.equal(
    verifiedPre71DataHash("data/catalogue-additions-2026-10-10.json"),
    fixture.previousAdditionsRawSHA256,
  );
});

test("all attribute rankings retain their previous compatible cohorts and exclude the bounded offer", () => {
  for (const attribute of attributes) {
    const options = { asOf: "2026-10-11", maxAgeDays: 30 };
    assert.deepEqual(
      rankAttribute([car], data.sources, attribute.key, options).groups,
      [],
    );
    assert.equal(
      hash(rankAttribute(cars, data.sources, attribute.key, options).groups),
      fixture.legacyRuntime.rankHashes[
        attribute.key as keyof typeof fixture.legacyRuntime.rankHashes
      ],
    );
  }
});

test("every source fact retains exact primitive provenance and citations for its qualifications", () => {
  for (const proposed of fixture.newAdapter.facts) {
    const { variantId, ...expected } = proposed;
    assert.equal(variantId, id);
    const actual = car.facts[proposed.key];
    assert.deepEqual(actual, expected);
    const claim = factClaim(full, actual);
    for (const issue of actual.issues)
      for (const sourceId of issue.source_ids)
        assert.ok(claim.sources.some((source) => source.id === sourceId));
    assert.ok(!Object.hasOwn(actual, "validUntil"));
  }
  assert.equal(
    car.facts.source_ftn_streetdog80_advertised_price_aud.value,
    8990,
  );
  assert.equal(
    car.facts.source_ftn_streetdog80_advertised_deposit_aud.value,
    500,
  );
  for (const source of fixture.newAdapter.sources)
    assert.ok(full.sources.some((s) => s.id === source.id));
});

test("new-row unknown evidence dates do not inherit earlier generic research", () => {
  assert.equal(full.eligibility.observation_window_start, "2026-10-11");
  assert.equal(full.eligibility.observation_window_end, "2026-10-11");
  for (const feature of full.features) {
    assert.equal(feature.status, "not_verified");
    assert.equal(feature.last_evidence_date, "2026-10-11");
    assert.equal(feature.reviewed_date, "2026-10-11");
  }
  for (const key of [
    "ground_clearance_mm",
    "turning_circle_m",
    "towing_unbraked_kg",
  ]) {
    assert.equal(car.facts[key].value, null);
    assert.equal(car.facts[key].date, "2026-10-11");
  }
});

test("offer-specific tax unknown exemption cannot promote a positive or sourced claim", () => {
  const f = full.features.find((f) => f.criterion === "novated_fbt")!;
  assert.equal(f.verification_state, "exact_offer_unverified");
  assert.deepEqual(auditedFeature(f), f);
  for (const altered of [
    { ...f, status: "standard" as const },
    { ...f, source_ids: ["example"] },
    { ...f, verification_state: "unverified" },
    { ...f, conditions: "" },
  ]) {
    const audited = auditedFeature(altered);
    assert.equal(audited.status, "not_verified");
    assert.equal(audited.verification_state, "full_text_audit_2026-10-08");
  }
});

test("detail disclosure and buyer export retain every commercial build and expiry guard", () => {
  const conditions =
    fixture.newAdapter.variants[0].configuration_evidence
      .requiredBuyerVisibleConditions;
  const html = renderToStaticMarkup(
    createElement(Detail, { pack: full, criteria: data.criteria }),
  );
  const report = makeReport([full], "/cars/ftn-motion-streetdog-80/offer");
  const markdown = reportMarkdown(report);
  const escape = (s: string) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#x27;");
  for (const condition of conditions) {
    assert.ok(car.availabilityEvidence?.qualifications?.includes(condition));
    assert.ok(html.includes(escape(condition)), condition);
    assert.ok(report.availability[0].qualifications.includes(condition));
    assert.ok(markdown.includes(condition), condition);
  }
  assert.ok(html.includes("MY unverified"));
  assert.ok(!html.includes("2,026"));
  assert.equal(report.cars[0].year, "Model year unverified");
});

test("market totals derive from the bounded admission while original identities remain recoverable", () => {
  assert.deepEqual(inventory.counts, fixture.counts);
  assert.equal(inventory.records.length, 238);
  assert.equal(inventory.unverifiedLeads.length, 144);
  assert.equal(inventory.reconciledLeads.length, 19);
  assert.equal(marketBeforeCheckpoint71.records.length, 237);
  assert.equal(marketBeforeCheckpoint71.unverifiedLeads.length, 145);
  assert.equal(
    inventory.records.reduce(
      (n, row) => n + (row.trims as unknown[]).length,
      0,
    ),
    389,
  );
  assert.equal(
    inventory.records.filter((row) => row.stockStatus === "new_stock_listed")
      .length,
    67,
  );
  assert.equal(
    inventory.records.filter((row) => row.orderStatus === "accepting_orders")
      .length,
    36,
  );
  assert.equal(
    inventory.records.filter((row) => row.orderStatus === "listed_unconfirmed")
      .length,
    190,
  );
});

test("SANY evidence-only refinement neither adds a detailed build nor resolves technical conflicts", () => {
  const row = inventory.records.find(
    (row) => row.id === "sany-6x4-prime-mover",
  )!;
  assert.deepEqual(row, fixture.newSanyRecord);
  assert.deepEqual(row.trims, []);
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.catalogueCoverage, "market_audit_only");
  assert.ok(!cars.some((c) => c.modelId === "sany_se588"));
  const text = JSON.stringify(row);
  assert.match(text, /unladen/);
  assert.match(text, /KEV126158692/);
});
