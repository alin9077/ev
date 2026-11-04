import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BuyerSummary } from "../src/components/buyer-summary";
import Discovery from "../src/components/discovery";
import { buyerSummaryNeedsClock } from "../src/lib/buyer-summary-timing";
import { compiledSource } from "./helpers/compiled-source";
import type { Car, Source } from "../src/lib/types";

const require = createRequire(import.meta.url);
const H = require("../qa/checkpoint91/checkpoint91-harness.cjs");
const h = H.createHarness(process.cwd(), fileURLToPath(new URL("../qa/checkpoint91/", import.meta.url)));
const car = { ...h.car, buyerSummary: h.cached } as Car;
const sources = h.sources as Source[];

test("Brown uses one own full215-Fact identity and three own dependencies, without weakening any hold", () => {
  H.assertCandidateIntegrity(h.f);
  assert.equal(Object.keys(h.car.facts).length, 215);
  const facts = Object.values(h.car.facts) as Car["facts"][string][];
  assert.equal(facts.filter(f => f.value === null).length, 79);
  assert.equal(facts.filter(f => f.issues.length > 0).length, 135);
  assert.equal(h.proposal.dependencies.length, 3);
  assert.equal(sources.length, 21);
  assert.equal(h.cached.conditions.length, 8);
  H.equal(h.cached.conditions, h.car.configurationEvidence.requiredBuyerVisibleConditions);
  assert.equal(h.car.availability, "current_or_order_listed");
  assert.equal(h.car.availabilityEvidence.stockStatus, "unverified");
  for (const key of ["rankingEligible", "completeVehicleCountEligible", "fullyClosedFactoryBuild"])
    assert.equal(h.car.configurationEvidence[key], false);
  for (const key of ["physicalStockVerified", "factoryOrderAcceptanceVerified", "factoryBuildSpecificationVerified", "deliveryToBuyerVerified"])
    assert.equal(h.car.availabilityEvidence[key], false);
  assert.equal(Object.hasOwn(h.f.delta.records[0], "tradeoff"), false);
  assert.equal(h.cached.tradeoff, undefined);
  H.equal(h.cached.strength.sourceIds, ["r10_surron_hp_s01_importer_my26"]);
  H.equal(h.build(), h.expected);
  assert.equal(h.buildBuyerSummaries([], [], sources, h.proposal, h.policy).size, 0);
  h.checkUnchanged();
});

test("all883 declared Brown build, normalized-storage and candidate-integrity cases execute", () => {
  const phases: Record<string, number> = { build: 0, storage: 0, premerge: 0 };
  for (const c of h.f.spec.cases) phases[h.runBuildCase(c)]++;
  assert.equal(Object.values(phases).reduce((a, b) => a + b, 0), 883);
  // A build rejection is not used as a substitute for a candidate-integrity rejection.
  assert.equal(phases.premerge, 6);
  assert.equal(phases.storage, 6);
  assert.equal(phases.build, 871);
  h.checkUnchanged();
});

test("all183 cached-presentation cases call currentBuyerSummary without rebuilding changed sources", () => {
  let checks = 0;
  for (const c of h.f.spec.cachedPresentationAcceptance.cases) { h.runCachedCase(c); checks++; }
  assert.equal(checks, 183);
  h.checkUnchanged();
});

test("foreign MY2026 is a premerge integrity rejection, not a generic evaluator guarantee", () => {
  const index = h.proposal.dependencies.findIndex((d: { kind: string }) => d.kind === "variant_property");
  const changed = H.editAt(h.proposal, `/dependencies/${index}/variantId`, "replace", H.CARBON);
  const carbon = Object.values(h.f.carbonLedger.snapshots)[0];
  // A foreign MY dependency can legitimately resolve if that foreign car is present.
  const result = h.buildBuyerSummaries([h.car, carbon], [], sources, changed, h.policy).get(H.TARGET);
  assert.ok(result?.strength);
  const malformedDelta = H.editAt(h.f.delta, `/dependencies/${index}/variantId`, "replace", H.CARBON);
  assert.throws(() => H.assertCandidateIntegrity(h.f, malformedDelta));
  // The resolver's generic none sentinel likewise is not a Brown permission.
  const none = H.editAt(h.f.delta, "/records/0/expectedIdentityRef", "replace", "none");
  assert.doesNotThrow(() => h.resolveBuyerProposal(none, h.f.ledger));
  assert.throws(() => H.assertCandidateIntegrity(h.f, none));
  h.checkUnchanged();
});

test("day30 is inclusive and cached/browser refresh must suppress on day31", () => {
  for (const date of ["2026-10-10", "2026-11-09"]) {
    assert.ok(h.build(undefined, undefined, undefined, date)?.strength, date);
    assert.ok(h.currentBuyerSummary(h.cached, sources, { ...h.policy, asOf: date })?.strength, date);
  }
  for (const date of ["2026-11-10", "2026-10-09", "invalid", "2026-02-30", ""]) {
    assert.equal(h.build(undefined, undefined, undefined, date), undefined, date);
    assert.equal(h.currentBuyerSummary(h.cached, sources, { ...h.policy, asOf: date }), undefined, date);
  }
  for (const date of ["invalid", "", "2026-12-01", "2026-08-01"]) {
    const proposal = H.editAt(h.proposal, "/records/0/checkedAt", "replace", date);
    assert.equal(h.build(undefined, undefined, proposal), undefined, date);
    for (let i = 0; i < 3; i++)
      assert.equal(h.build(undefined, undefined, H.editAt(h.proposal, `/dependencies/${i}/checkedAt`, "replace", date)), undefined);
  }
});

test("strength-only omission differs from a malformed present tradeoff and no placeholders are added", () => {
  const p = { ...h.proposal, records: [{ ...h.proposal.records[0], tradeoff: undefined }] };
  assert.equal(h.build(undefined, undefined, p), undefined);
  assert.equal(h.cached.tradeoff, undefined);
  assert.equal(Object.hasOwn(h.f.delta.records[0], "tradeoff"), false);
});

test("static/no-JavaScript detail and discovery withhold age-limited Brown text", () => {
  assert.equal(buyerSummaryNeedsClock(car.buyerSummary), true);
  for (const checkedAt of ["2026-10-10", "invalid", "2026-08-01"]) {
    const c = { ...car, buyerSummary: { ...car.buyerSummary!, checkedAt } };
    assert.equal(renderToStaticMarkup(createElement(BuyerSummary, { car: c, sources })), "");
    const html = renderToStaticMarkup(createElement(Discovery, { cars: [c], sources }));
    assert.ok(!html.includes(h.expected.strength.text));
    assert.ok(!html.includes(h.expected.strength.label));
  }
});

test("actual detail/discovery sources render Brown after clock readiness and omit every tradeoff fallback", async () => {
  const React = await import("react");
  const render = (kind: "detail" | "discovery", c: Car, ss: Source[], asOf: string, ready = true) => {
    let position = 0;
    const hooks = {
      ...React,
      useEffect: () => {},
      useMemo: (fn: () => unknown) => fn(),
      useRef: (value: unknown) => ({ current: value }),
      useState: (initial: unknown) => {
        const index = position++;
        const clockIndex = kind === "detail" ? 0 : 9;
        const dateIndex = kind === "detail" ? 1 : 10;
        return [index === clockIndex ? ready : index === dateIndex ? asOf : initial, () => {}];
      },
    };
    const mod = compiledSource(kind === "detail" ? "src/components/buyer-summary.tsx" : "src/components/discovery.tsx", { react: hooks });
    const Component = (kind === "detail" ? mod.BuyerSummary : mod.default) as (props: unknown) => React.ReactNode;
    const output = renderToStaticMarkup(Component(kind === "detail" ? { car: c, sources: ss } : { cars: [c], sources: ss }));
    assert.equal(position, kind === "detail" ? 2 : 11, "Review hook fixture if component state order changes");
    return output;
  };
  const escape = (s: string) => renderToStaticMarkup(createElement("span", null, s)).slice(6, -7);
  for (const kind of ["detail", "discovery"] as const) {
    const html = render(kind, car, sources, "2026-11-09");
    assert.ok(html.includes(escape(h.expected.strength.label)), kind);
    assert.ok(html.includes(escape(h.expected.strength.text)), kind);
    assert.ok(!html.includes("Keep in mind"), kind);
    assert.ok(html.includes("Evidence &amp; conditions"), kind);
    for (const condition of h.cached.conditions) assert.ok(html.includes(escape(condition)), kind);
    for (const [date, ready] of [["2026-11-09", false], ["2026-11-10", true], ["2026-10-09", true], ["invalid", true]] as const)
      assert.ok(!render(kind, car, sources, date, ready).includes(h.expected.strength.text), `${kind}:${date}:${ready}`);
    const heldSources = sources.map((s, i) => i ? s : { ...s, publication_hold: true });
    assert.ok(!render(kind, car, heldSources, "2026-10-12").includes(h.expected.strength.text));
    const wrongConditions = { ...car, buyerSummary: { ...car.buyerSummary!, conditions: [] } };
    assert.ok(!render(kind, wrongConditions, sources, "2026-10-12").includes(h.expected.strength.text));
    const noSummary = { ...car, buyerSummary: undefined };
    const fallback = render(kind, noSummary, sources, "2026-10-12");
    assert.ok(!fallback.includes(h.expected.strength.text));
    if (kind === "discovery") assert.ok(fallback.includes("Keep in mind"));
  }
});
