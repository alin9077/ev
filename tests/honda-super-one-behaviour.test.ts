// Admission behaviour is checked against the immutable source layer.
// Dated M1 overlays have separate current-catalogue safety coverage.
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  sourceCatalogue as catalogue,
  sourceResearch as research,
  sourceEffectiveFeatures as effectiveFeatures,
} from "../src/lib/data";
import { sourceSnapshotPack as pack } from "./helpers/source-fixture";
import { attributes, rankAttribute } from "../src/lib/discovery";
import { buyerProposal } from "../src/lib/buyer-proposal";
import {
  buildBuyerSummaries,
  type SellingPointProposal,
} from "../src/lib/selling-points";
import { factClaim, makeReport, reportMarkdown } from "../src/lib/citable";
import Detail from "../src/components/detail";
import market from "../data/market-inventory-2026-10-10.json";
import fixture from "./fixtures/honda-evidence.json";
const cars = catalogue(),
  data = research(),
  snapshot = { cars, data };
const ids = new Set(fixture.newAdapter.variants.map((v) => v.id));
const added = cars.filter((c) => ids.has(c.id));
const policy = { asOf: "2026-10-11" };

test("two source-bound Honda26YM grades add useful detail without stock or ranking promotion", () => {
  assert.equal(added.length, 2);
  assert.deepEqual(
    added.map((c) => c.trim),
    ["Mono Tone", "Two Tone"],
  );
  for (const car of added) {
    const proposed = fixture.newAdapter.variants.find((v) => v.id === car.id)!;
    assert.equal(car.year, "MY2026");
    assert.equal(car.researchStage, "partial");
    assert.deepEqual(
      car.configurationEvidence,
      proposed.configuration_evidence,
    );
    assert.deepEqual(car.availabilityEvidence, proposed.availability_evidence);
    assert.equal(car.configurationEvidence?.rankingEligible, false);
    assert.equal(
      car.configurationEvidence?.completeVehicleCountEligible,
      false,
    );
    assert.equal(car.availabilityEvidence?.orderStatus, "listed_unconfirmed");
    assert.equal(car.availabilityEvidence?.stockStatus, "unverified");
    assert.equal(car.availabilityEvidence?.physicalStockVerified, false);
    assert.equal(
      car.availabilityEvidence?.factoryOrderAcceptanceVerified,
      false,
    );
  }
});

test("every compatible ranking excludes the manufacturer-only Honda rows", () => {
  for (const attribute of attributes) {
    assert.deepEqual(
      rankAttribute(added, data.sources, attribute.key, policy).groups,
      [],
    );
  }
});

test("exact Honda facts preserve primitives, source boundaries and qualification citations", () => {
  for (const { variantId, ...expected } of fixture.newAdapter.facts) {
    const full = pack(variantId, snapshot),
      actual = full.car.facts[expected.key];
    assert.deepEqual(actual, expected);
    assert.ok(
      actual.value === null ||
        ["string", "number", "boolean"].includes(typeof actual.value),
    );
    const claim = factClaim(full, actual);
    for (const issue of actual.issues)
      for (const sourceId of issue.source_ids)
        assert.ok(claim.sources.some((s) => s.id === sourceId));
  }
  for (const car of added) {
    assert.equal(car.facts.source_catalogue_formal_model_year.value, "2026");
    assert.equal(car.facts.source_catalogue_battery_label_kwh.value, 29.6);
    assert.equal(car.facts.range_km.value, 202);
    assert.equal(car.facts.source_catalogue_nedc_range_km.value, 253);
    for (const key of [
      "price_aud",
      "battery_gross_kwh",
      "battery_usable_kwh",
      "dc_charge_time_min",
      "kerb_weight_kg",
      "payload_kg",
      "deposit_amount_aud",
    ])
      assert.equal(car.facts[key].value, null, key);
    assert.match(
      String(car.facts.source_catalogue_dc_warninglight_80_pdf.value),
      /warning-light.*50 kW.*25°C/,
    );
    assert.equal(car.facts.source_catalogue_printed_tare_kg.value, 1101);
    assert.equal(car.facts.source_catalogue_printed_kerb_kg.value, 1093);
    assert.ok(
      car.facts.source_catalogue_service_offer_aud_each.qualifications.some(
        (q) => q.includes("alter or discontinue"),
      ),
    );
  }
});

test("Honda criteria retain current dates, service meaning and explicit unknowns", () => {
  for (const car of added) {
    const features = effectiveFeatures(car, data);
    assert.equal(features.length, data.criteria.length);
    for (const feature of features) {
      assert.equal(feature.reviewed_date, "2026-10-11");
      assert.equal(feature.last_evidence_date, "2026-10-11");
    }
    const service = features.find((f) => f.criterion === "warranty_service")!;
    assert.match(String(service.value), /12 months.*15,000 km.*A\$199/);
    assert.ok(service.conditions.includes("alter or discontinue"));
    assert.ok(!String(service.value).includes("unlimited km"));
    assert.equal(
      features.find((f) => f.criterion === "novated_fbt")?.status,
      "not_verified",
    );
    assert.equal(
      features.find((f) => f.criterion === "phone_key")?.status,
      "conditional",
    );
    assert.match(
      features.find((f) => f.criterion === "phone_key")!.conditions,
      /physical key/,
    );
  }
});

test("both compact buyer summaries fail closed on facts, scope, source and availability changes", () => {
  const proposal = buyerProposal as SellingPointProposal;
  const narrow = {
    ...proposal,
    records: proposal.records.filter((r) => ids.has(r.variantId)),
    dependencies: proposal.dependencies.filter((d) => ids.has(d.variantId)),
  };
  const features = added.flatMap((c) => effectiveFeatures(c, data));
  assert.equal(
    buildBuyerSummaries(added, features, data.sources, narrow, policy).size,
    2,
  );
  for (const car of added) {
    assert.ok(car.buyerSummary?.strength && car.buyerSummary?.tradeoff);
    assert.deepEqual(
      car.buyerSummary.conditions,
      car.configurationEvidence?.requiredBuyerVisibleConditions,
    );
    assert.ok(
      car.buyerSummary.conditions.some((c) =>
        c.includes("does not add passenger capacity"),
      ),
    );
    assert.ok(
      car.buyerSummary.conditions.some((c) =>
        c.includes("real-world guarantee"),
      ),
    );
    assert.ok(
      car.buyerSummary.conditions.some((c) =>
        c.includes("load height or seating position"),
      ),
    );
    const changed = structuredClone(added);
    changed.find((c) => c.id === car.id)!.facts.length_mm.value = 9999;
    assert.equal(
      buildBuyerSummaries(changed, features, data.sources, narrow, policy).get(
        car.id,
      )?.strength,
      undefined,
    );
    const stock = structuredClone(added);
    stock.find(
      (c) => c.id === car.id,
    )!.availabilityEvidence!.physicalStockVerified = true;
    assert.equal(
      buildBuyerSummaries(stock, features, data.sources, narrow, policy).size,
      0,
    );
  }
  const sources = structuredClone(data.sources);
  sources.find((s) => s.id === "r11_honda_superone_brochure")!.accessed_date =
    "2026-07-01";
  assert.equal(
    buildBuyerSummaries(added, features, sources, narrow, policy).size,
    0,
  );
  assert.equal(
    buildBuyerSummaries(added, features, data.sources, narrow, {
      ...policy,
      asOf: "2026-10-10",
    }).size,
    0,
  );
});

test("actual Honda detail markup and existing report formats retain every visible qualification", () => {
  const escape = (s: string) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#x27;");
  for (const car of added) {
    const full = pack(car.id, snapshot),
      html = renderToStaticMarkup(
        createElement(Detail, { pack: full, criteria: data.criteria }),
      );
    const report = makeReport([full], "/cars/honda-super-one/" + car.slug),
      markdown = reportMarkdown(report);
    for (const condition of car.configurationEvidence!
      .requiredBuyerVisibleConditions!) {
      assert.ok(html.includes(escape(condition)), condition);
      assert.ok(
        report.availability[0].qualifications.includes(condition),
        condition,
      );
      assert.ok(markdown.includes(condition), condition);
    }
    // All age-limited buyer copy now awaits the current browser date.
    assert.ok(!html.includes(escape(car.buyerSummary!.strength!.text)));
    assert.ok(!html.includes(escape(car.buyerSummary!.tradeoff!.text)));
    assert.ok(!html.includes("2,026") && !markdown.includes("2,026"));
    assert.equal(report.cars[0].year, "MY2026");
  }
});

test("market audit keeps Honda and held leads honest about availability", () => {
  const honda = market.records.find((r) => r.id === "honda-super-one")!;
  assert.deepEqual(honda.trims, ["Mono Tone", "Two Tone"]);
  assert.equal(honda.orderStatus, "listed_unconfirmed");
  assert.equal(honda.completeVehicleCountEligible, false);
  assert.ok(
    market.reconciledLeads.some(
      (row) => row.originalRecord?.id === "honda-super-one",
    ),
  );
  for (const id of [
    "benzina-zero-city",
    "benzina-zero-sport",
    "challenger-electric-low-floor",
  ]) {
    const row = market.records.find((r) => r.id === id)!;
    assert.deepEqual(row.trims, []);
    assert.equal(row.stockStatus, "unverified");
    assert.equal(row.rankingEligible, false);
    assert.ok(
      !added.some(
        (c) =>
          (
            c.configurationEvidence?.sourceIdentity as
              { marketInventoryId?: string } | undefined
          )?.marketInventoryId === id,
      ),
    );
  }
});
