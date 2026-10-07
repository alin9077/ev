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
  const packs = ids.map(pack);
  const text = reportMarkdown(makeReport(packs, "/compare"));
  packs.forEach((p) => assert.ok(text.includes(carName(p.car))));
  assert.ok(!text.includes("Tesla Model Y Premium RWD:"));
});
test("audit covers every summary-only buyer source and withholds unsupported claims", () => {
  assert.equal(audit.sources.length, 32);
  assert.equal(
    audit.sources.filter((s) => s.status === "unavailable").length,
    10,
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
