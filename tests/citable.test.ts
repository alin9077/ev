import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Fact } from "../src/lib/types";
import { pairPages, pairReport } from "../src/lib/pair-pages";
import { catalogue, pack, research } from "../src/lib/data";
import {
  carName,
  claimText,
  makeReport,
  reportMarkdown,
  reportSchema,
} from "../src/lib/citable";
import { BASELINE, publicOrigin } from "../src/lib/config";
import audit from "../data/source-audit-2026-10-08.json";

// Share only this file's current fixture; production defaults remain fresh.
const snapshot = { cars: catalogue(), data: research() };

test("nine permanent pairs describe two exact, distinct current families", () => {
  assert.equal(pairPages.length, 9);
  assert.equal(new Set(pairPages.map((p) => p.slug)).size, 9);
  const families = new Set<string>();
  for (const p of pairPages) {
    const report = pairReport(p.slug, snapshot)!;
    assert.deepEqual(
      report.cars.map((c) => c.id),
      [BASELINE, p.rival],
    );
    const rival = snapshot.cars.find((c) => c.id === p.rival)!;
    assert.equal(rival.availability, "current_or_order_listed");
    families.add(rival.family);
    assert.equal(report.keyFacts.length, 12);
    for (const c of [
      ...report.keyFacts,
      ...report.questions.flatMap((q) => q.claims),
    ]) {
      assert.ok(c.sentence.startsWith(c.car));
      assert.match(c.evidenceDate, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(c.basis && c.sources.length);
      for (const s of c.sources) {
        assert.match(s.url, /^https?:\/\//);
        assert.ok(claimText(c).includes(s.url));
      }
    }
  }
  assert.equal(families.size, 9);
  assert.equal(pairReport("made-up", snapshot), undefined);
});
test("exports and structured answers preserve qualifications and source dates", () => {
  for (const p of pairPages) {
    const report = pairReport(p.slug, snapshot)!;
    const markdown = reportMarkdown(report);
    for (const c of report.keyFacts) assert.ok(markdown.includes(claimText(c)));
    assert.ok(Buffer.byteLength(markdown) < 60000, p.slug);
    const graph = reportSchema(report)["@graph"];
    const faq = graph.find((g) => g["@type"] === "FAQPage")!;
    assert.ok("mainEntity" in faq && faq.mainEntity);
    assert.equal(faq.mainEntity!.length, report.questions.length);
    report.questions.forEach((q, i) =>
      assert.ok(faq.mainEntity![i].acceptedAnswer.text.includes(q.answer)),
    );
    assert.match(markdown, /2026-10-05/); // Publishing must not make older facts look new.
  }
});
test("copy reflects the selected trims rather than the default pair", () => {
  const ids = [
    "tesla_model_y__performance_awd__3",
    "byd_sealion_7__performance_awd__2",
  ];
  const packs = ids.map((id) => pack(id, snapshot));
  const text = reportMarkdown(makeReport(packs, "/compare"));
  packs.forEach((p) => assert.ok(text.includes(carName(p.car))));
  assert.ok(!text.includes("Tesla Model Y Premium RWD:"));
});
test("audit covers every summary-only buyer source and withholds unsupported claims", () => {
  assert.equal(audit.sources.length, 32);
  assert.equal(
    audit.sources.filter((s) => s.status === "unavailable").length,
    9,
  );
  const zeekr = pack("zeekr_7x__rwd__1", snapshot);
  assert.equal(
    zeekr.features.find((f) => f.criterion === "energy_use")!.status,
    "not_verified",
  );
  assert.equal(
    zeekr.features.find((f) => f.criterion === "charging_cable")!.status,
    "not_verified",
  );
  assert.match(
    pack(BASELINE, snapshot).features.find(
      (f) => f.criterion === "real_world_range",
    )!.conditions,
    /April 2025/,
  );
  assert.equal(
    pack(BASELINE, snapshot).features.find(
      (f) => f.criterion === "driveaway_price",
    )!.status,
    "not_verified",
  );
});
test("only valid public origins enable public metadata", () => {
  for (const url of [
    undefined,
    "http://example.com",
    "https://localhost",
    "https://127.0.0.1",
    "https://foo.local",
    "https://a:b@example.com",
    "https://example.com/path",
    "https://example.com?x=1",
  ])
    assert.equal(publicOrigin(url), null);
  assert.equal(publicOrigin("https://example.com/"), "https://example.com");
});

test("unknown formal model years stay explicit in exports and omitted from schema dates", () => {
  const c = snapshot.cars.find((c) => c.modelId === "mini_cooper_j01")!;
  const report = makeReport([pack(c.id, snapshot)], "/compare");
  assert.equal(report.cars[0].year, "Model year unverified");
  const car = reportSchema(report)["@graph"].find((x) => x["@type"] === "Car")!;
  assert.ok(!("vehicleModelDate" in car));
  assert.ok(!reportMarkdown(report).includes("Year: null"));
});

test("explanation-only claim restrictions remain visible in citable exports", async () => {
  const { factClaim } = await import("../src/lib/citable");
  const selected = pack(BASELINE, snapshot);
  const fact = {
    ...selected.car.facts.range_km,
    status: "conditional" as const,
    qualifications: [],
    conditionExplanation: "Only with the specified optional wheels",
  };
  const claim = factClaim(selected, fact);
  assert.equal(claim.status, "conditional");
  assert.ok(claim.qualifications.includes(fact.conditionExplanation));
  assert.ok(claimText(claim).includes(fact.conditionExplanation));
});

test("scooter reports lead with relevant battery, speed, storage and charging facts", () => {
  const selected = pack("segway_e300se_au__20261010", snapshot);
  const report = makeReport([selected], "/cars/scooter-fixture");
  assert.deepEqual(
    report.keyFacts.map((fact) => fact.key),
    [
      "advertised_dealer_offer_aud",
      "battery_pack_count_included",
      "maximum_speed_kmh",
      "under_seat_storage_l",
      "range_km",
      "charge_time_to_80_hours",
    ],
  );
  assert.equal(report.cars[0].vehicleClass, "motorcycle");
  assert.ok(!report.summary.includes("braked towing"));
  assert.ok(
    !report.questions.some((question) => question.id === "novated_fbt"),
  );
  assert.match(reportMarkdown(report), /three packs/);
  assert.ok(
    !report.keyFacts.some((fact) => fact.sentence.includes("Kia test")),
  );
});

test("mixed-type reports retain each exact vehicle's own measurements without cross-type substitutions", () => {
  const scooter = pack("zeeho_ae4_au__20261010", snapshot),
    passenger = pack(BASELINE, snapshot);
  const report = makeReport([passenger, scooter], "/compare");
  assert.equal(report.keyFacts.length, 12);
  assert.equal(
    report.keyFacts.find((claim) => claim.key === "boot_l")!.carId,
    BASELINE,
  );
  assert.equal(
    report.keyFacts.find((claim) => claim.key === "under_seat_storage_l")!
      .carId,
    scooter.car.id,
  );
  assert.match(report.summary, /not automatically comparable/);
});

test("compact cited scooter claims preserve complete conditions in a native disclosure", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { CitedClaim } = await import("../src/components/citable-report");
  const selected = pack("segway_e300se_au__20261010", snapshot);
  const claim = makeReport([selected], "/fixture").keyFacts.find(
    (claim) => claim.key === "range_km",
  )!;
  const html = renderToStaticMarkup(
    createElement(CitedClaim, { claim, compactEvidence: true }),
  );
  assert.match(html, /<details/);
  assert.ok(!/<details[^>]*\bopen/.test(html));
  assert.match(html, /three packs/);
  assert.match(html, /Segway Australia/);
  const firstParagraph = html.slice(html.indexOf("<p>"), html.indexOf("</p>"));
  assert.ok(!firstParagraph.includes("sourceId:"));
  assert.ok(firstParagraph.includes("conditional"));
});

function vwChargingReviewFixture() {
  const packet = JSON.parse(
    readFileSync(
      new URL("../data/m1-brand-updates/volkswagen-2026-10-14.json", import.meta.url),
      "utf8",
    ),
  ) as { facts: { variantId: string; before: Fact; after: Fact }[] };
  const review = packet.facts.find(
    (edit) =>
      edit.variantId === "volkswagen_idbuzz_my26_pro_swb__20261010" &&
      edit.after.key === "dc_charge_time_min",
  );
  assert.ok(review, "retain the exact reviewed Volkswagen charging before/after fixture");
  return review;
}

test("current VW charging report retains the reviewed 26-minute 10–80% figure and exact sources", () => {
  const selected = pack("volkswagen_idbuzz_my26_pro_swb__20261010", snapshot);
  const before = JSON.stringify(selected);
  const review = vwChargingReviewFixture();
  const fact = selected.car.facts.dc_charge_time_min;
  assert.deepEqual(fact, review.after);
  assert.equal(fact.value, 26);
  assert.equal(fact.status, "standard");
  assert.equal(fact.buyerGrade, "confirmed");
  assert.equal(fact.date, "2026-10-14");
  assert.equal(fact.gradeReview?.reviewedAt, "2026-10-14");
  assert.equal(fact.basis, "DC 10–80% state-of-charge, published 26 min");
  assert.equal(fact.comparisonBasis, "DC 10–80%");
  assert.deepEqual(fact.sourceIds, [
    "m1-volkswagen-2026-10-14-idbuzz_vw_buzz_page",
    "m1-volkswagen-2026-10-14-idbuzz_vw_buzz_my25_pdf",
  ]);
  assert.deepEqual(fact.qualifications, []);
  assert.deepEqual(fact.issues, []);
  const report = makeReport([selected], "/cars/vw-current-fixture", "2026-10-15");
  const charging = report.keyFacts.find((claim) => claim.key === "dc_charge_time_min")!;
  assert.equal(charging.value, "26 min");
  assert.equal(charging.status, "standard");
  assert.equal(charging.buyerGrade, "confirmed");
  assert.equal(charging.evidenceDate, fact.date);
  assert.equal(charging.basis, fact.basis);
  assert.deepEqual(charging.gradeReview, fact.gradeReview);
  assert.deepEqual(charging.sources.map((source) => source.id), fact.sourceIds);
  for (const source of charging.sources) {
    const retained = selected.sources.find((row) => row.id === source.id)!;
    assert.ok(retained);
    assert.equal(source.url, retained.url);
    assert.equal(source.accessed_date, retained.accessed_date);
    assert.equal(source.published_date, retained.published_date);
  }
  assert.deepEqual(charging.qualifications, []);
  assert.match(charging.sentence, /26 min; basis: DC 10–80%/);
  assert.match(charging.sentence, /evidence checked 2026-10-14; confirmed/);
  assert.doesNotMatch(charging.sentence, /Kia test|350 kW|charge windows and test conditions match|needs confirmation/i);
  assert.ok(selected.car.buyerSummary?.strength);
  assert.equal(JSON.stringify(selected), before);
});

test("bounded VW report uses generic charging cautions without changing raw evidence or guarded copy", () => {
  const current = pack("volkswagen_idbuzz_my26_pro_swb__20261010", snapshot);
  const currentBefore = JSON.stringify(current);
  const review = vwChargingReviewFixture();
  const guardBefore = JSON.stringify(review.before);
  const selected = structuredClone(current);
  // Exercise the exact historical held fact, not a downgrade of current evidence.
  selected.car.facts.dc_charge_time_min = structuredClone(review.before);
  const before = JSON.stringify(selected);
  const report = makeReport([selected], "/cars/vw-historical-fixture", "2026-10-15");
  const charging = report.keyFacts.find(
    (claim) => claim.key === "dc_charge_time_min",
  )!;
  assert.equal(charging.status, "not_verified");
  assert.equal(selected.car.facts.dc_charge_time_min.value, null);
  assert.match(charging.sentence, /charge windows and test conditions match/);
  assert.doesNotMatch(charging.sentence, /Kia test|350 kW/);
  assert.ok(
    selected.car.facts.dc_charge_time_min.issues.some((issue) =>
      issue.publication_action.includes("Kia test"),
    ),
  );
  assert.ok(selected.car.buyerSummary?.strength);
  assert.equal(JSON.stringify(selected), before);
  assert.equal(JSON.stringify(current), currentBefore);
  assert.equal(JSON.stringify(review.before), guardBefore);
});

test("manufacturer phase labels remain exact text rather than invented schema dates", () => {
  const selected = pack(BASELINE, snapshot);
  selected.car = {
    ...selected.car,
    year: "MY26.50",
    generation:
      "Australian MY26.50-labelled catalogue; production applicability unresolved",
  };
  const report = makeReport([selected], "/cars/phase-fixture");
  assert.equal(report.cars[0].year, "MY26.50");
  const schema = reportSchema(report)["@graph"].find(
    (entry) => entry["@type"] === "Car",
  )!;
  assert.ok(!("vehicleModelDate" in schema));
  assert.ok("vehicleConfiguration" in schema);
  assert.match(String(schema.vehicleConfiguration), /MY26.50/);
  assert.match(report.cars[0].generation, /MY26.50/);
});

test("pair reports reuse explicit snapshots without hiding later reviewed source drift", () => {
  const source = snapshot.data.sources.find((row) =>
    row.id.startsWith("m1-tesla-2026-10-14-"),
  )!;
  assert.ok(source);
  const changedSource = { ...source };
  const supplied = {
    cars: snapshot.cars,
    data: {
      ...snapshot.data,
      sources: snapshot.data.sources.map((row) =>
        row.id === source.id ? changedSource : row,
      ),
    },
  };
  const slug = pairPages[0].slug;
  assert.ok(pairReport(slug, supplied));
  changedSource.title += " Unreviewed metadata drift";
  assert.throws(() => pairReport(slug, supplied), /source snapshot changed/);
  assert.equal(
    snapshot.data.sources.find((row) => row.id === source.id),
    source,
  );
  assert.notEqual(changedSource.title, source.title);
  changedSource.title = source.title;
  assert.ok(pairReport(slug, supplied));
});
