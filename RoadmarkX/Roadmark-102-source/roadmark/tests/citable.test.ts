import { test } from "node:test";
import assert from "node:assert/strict";
import { pairPages, pairReport } from "../src/lib/pair-pages";
import { catalogue, pack } from "../src/lib/data";
import {
  carName,
  claimText,
  makeReport,
  reportMarkdown,
  reportSchema,
} from "../src/lib/citable";
import { BASELINE, publicOrigin } from "../src/lib/config";
import audit from "../data/source-audit-2026-10-08.json";

test("nine permanent pairs describe two exact, distinct current families", () => {
  assert.equal(pairPages.length, 9);
  assert.equal(new Set(pairPages.map((p) => p.slug)).size, 9);
  const families = new Set<string>();
  for (const p of pairPages) {
    const report = pairReport(p.slug)!;
    assert.deepEqual(
      report.cars.map((c) => c.id),
      [BASELINE, p.rival],
    );
    const rival = catalogue().find((c) => c.id === p.rival)!;
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
  assert.equal(pairReport("made-up"), undefined);
});
test("exports and structured answers preserve qualifications and source dates", () => {
  for (const p of pairPages) {
    const report = pairReport(p.slug)!;
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
  const packs = ids.map((id) => pack(id));
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
  const zeekr = pack("zeekr_7x__rwd__1");
  assert.equal(
    zeekr.features.find((f) => f.criterion === "energy_use")!.status,
    "not_verified",
  );
  assert.equal(
    zeekr.features.find((f) => f.criterion === "charging_cable")!.status,
    "not_verified",
  );
  assert.match(
    pack(BASELINE).features.find((f) => f.criterion === "real_world_range")!
      .conditions,
    /April 2025/,
  );
  assert.equal(
    pack(BASELINE).features.find((f) => f.criterion === "driveaway_price")!
      .status,
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
  const c = catalogue().find((c) => c.modelId === "mini_cooper_j01")!;
  const report = makeReport([pack(c.id)], "/compare");
  assert.equal(report.cars[0].year, "Model year unverified");
  const car = reportSchema(report)["@graph"].find((x) => x["@type"] === "Car")!;
  assert.ok(!("vehicleModelDate" in car));
  assert.ok(!reportMarkdown(report).includes("Year: null"));
});

test("explanation-only claim restrictions remain visible in citable exports", async () => {
  const { factClaim } = await import("../src/lib/citable");
  const selected = pack(BASELINE);
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
  const selected = pack("segway_e300se_au__20261010");
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
  const scooter = pack("zeeho_ae4_au__20261010"),
    passenger = pack(BASELINE);
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
  const selected = pack("segway_e300se_au__20261010");
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

test("bounded VW report uses generic charging cautions without changing raw evidence or guarded copy", () => {
  const selected = pack("volkswagen_idbuzz_my26_pro_swb__20261010");
  const before = JSON.stringify(selected);
  const report = makeReport([selected], "/cars/vw-fixture");
  const charging = report.keyFacts.find((claim) => claim.key === "dc_charge_time_min")!;
  assert.equal(charging.status, "not_verified");
  assert.equal(selected.car.facts.dc_charge_time_min.value, null);
  assert.match(charging.sentence, /charge windows and test conditions match/);
  assert.doesNotMatch(charging.sentence, /Kia test|350 kW/);
  assert.ok(selected.car.facts.dc_charge_time_min.issues.some((issue) => issue.publication_action.includes("Kia test")));
  assert.ok(selected.car.buyerSummary?.strength);
  assert.equal(JSON.stringify(selected), before);
});


test("manufacturer phase labels remain exact text rather than invented schema dates", () => {
  const selected = pack(BASELINE);
  selected.car = { ...selected.car, year: "MY26.50", generation: "Australian MY26.50-labelled catalogue; production applicability unresolved" };
  const report = makeReport([selected], "/cars/phase-fixture");
  assert.equal(report.cars[0].year, "MY26.50");
  const schema = reportSchema(report)["@graph"].find((entry) => entry["@type"] === "Car")!;
  assert.ok(!("vehicleModelDate" in schema));
  assert.ok("vehicleConfiguration" in schema);
  assert.match(String(schema.vehicleConfiguration), /MY26.50/);
  assert.match(report.cars[0].generation, /MY26.50/);
});
