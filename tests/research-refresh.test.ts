import assert from "node:assert/strict";
import test from "node:test";
import editsJson from "../data/research-refresh-2026-10-10.json";
import approvedFacts from "../data/approved-corrections.json";
import approvedFeatures from "../data/approved-feature-corrections.json";
import approvedAvailability from "../data/approved-availability-corrections.json";
import {
  sourceCatalogue as catalogue,
  sourceEffectiveFeatures as effectiveFeatures,
  sourceResearch as research,
} from "../src/lib/data";
import {
  validateRefreshRegistry,
  refreshFacts,
  refreshFeatures,
  refreshAvailability,
  type ResearchRefresh,
} from "../src/lib/research-refresh";
import type { Car, Fact, Feature } from "../src/lib/types";
// Test the dated refresh before the later price, grade and brand overlays.
const edits = editsJson as ResearchRefresh[];
const d = research();
const cars = catalogue();
const car = (id: string) => cars.find((c) => c.id === id)!;
const f = (id: string, key: string) =>
  effectiveFeatures(car(id), d).find((f) => f.criterion === key)!;

test("research refresh preserves existing identities and human correction registers", () => {
  assert.equal(new Set(cars.map((car) => car.id)).size, cars.length);
  assert.equal(new Set(edits.map((e) => e.id)).size, 57);
  assert.equal(new Set(edits.map((e) => e.variantId)).size, 14);
  assert.deepEqual(approvedFacts, []);
  assert.deepEqual(approvedFeatures, []);
  assert.deepEqual(approvedAvailability, []);
});
test("EX5 tare stays separate from unknown kerb mass and old batteries stay untouched", () => {
  for (const [id, mass] of [
    ["geely_ex5__complete_extended_range__1", 1766],
    ["geely_ex5__inspire_extended_range__2", 1815],
  ] as const) {
    assert.equal(car(id).facts.kerb_weight_kg.value, null);
    assert.equal(car(id).facts.tare_mass_kg.value, mass);
    assert.match(car(id).facts.tare_mass_kg.basis, /tare.*not kerb/i);
    assert.equal(f(id, "battery_chemistry").status, "standard");
  }
  for (const id of ["geely_ex5__complete__3", "geely_ex5__inspire__4"])
    assert.equal(
      edits.some((e) => e.variantId === id),
      false,
    );
});
test("BYD exact equipment negatives do not become blanket equipment absence", () => {
  const id = "byd_atto_3_legacy__essential_fwd__1";
  assert.equal(f(id, "glass_roof").status, "unavailable");
  assert.equal(f(id, "wireless_charging").status, "unavailable");
  assert.match(
    f(id, "audio_system").conditions + " " + f(id, "audio_system").value,
    /FM|DAB/,
  );
  assert.equal(car(id).availability, "current_or_order_listed");
  assert.equal(car(id).model, "ATTO 3 (legacy FWD)");
  assert.equal(car("byd_atto_3_legacy__premium_fwd__2").model, car(id).model);
  for (const id of [
    "byd_atto_3_evo__dynamic_fwd__1",
    "byd_atto_3_evo__premium_rwd__2",
  ])
    assert.match(f(id, "spare_tyre").value, /repair/i);
  assert.doesNotMatch(
    f("byd_atto_3_evo__dynamic_fwd__1", "paint_options_quality").value,
    /Atlantis/,
  );
});
test("conditional price and warranty qualifications survive shared refresh", () => {
  assert.equal(
    car("byd_sealion_7__premium_rwd__1").facts.price_aud.status,
    "conditional",
  );
  const w = car("zeekr_7x__rwd__1").facts.warranty;
  assert.equal(w.status, "conditional");
  assert.match(w.qualifications.join(" "), /private.*commercial/i);
  assert.equal(
    car("byd_atto_3_legacy__premium_fwd__2").availabilityEvidence?.stockStatus,
    "unverified",
  );
  assert.equal(
    car("zeekr_7x__rwd__1").availabilityEvidence?.stockStatus,
    "unverified",
  );
});
test("fact refresh rejects changed qualifiers and unavailable supporting evidence", () => {
  const e = edits.find((e) => e.kind === "fact")!;
  if (e.kind !== "fact" || !e.before) throw new Error("fixture");
  const before = structuredClone(e.before);
  before.qualifications.push("Changed scope");
  assert.throws(
    () => refreshFacts(e.variantId, { [e.key]: before }, [e], d.sources),
    /conflict/,
  );
  assert.throws(
    () => refreshFacts(e.variantId, { [e.key]: e.before! }, [e], []),
    /unusable evidence/,
  );
  const sources = d.sources.map((s) =>
    e.evidence.some((x) => x.applicationSourceId === s.id)
      ? { ...s, publication_hold: true }
      : s,
  );
  assert.throws(
    () => refreshFacts(e.variantId, { [e.key]: e.before! }, [e], sources),
    /unusable evidence/,
  );
  const output = refreshFacts(
    e.variantId,
    { [e.key]: e.before },
    [e],
    d.sources,
  );
  assert.deepEqual(output[e.key], e.after);
  assert.deepEqual(e.before.qualifications, []);
});
test("full feature and availability before-state guards reject drift", () => {
  const feature = edits.find((e) => e.kind === "feature")!;
  if (feature.kind !== "feature") throw new Error("fixture");
  const before: Feature = {
    ...feature.before,
    conditions: feature.before.conditions + " changed",
  };
  assert.throws(
    () => refreshFeatures([before], [feature], d.sources),
    /conflict/,
  );
  assert.deepEqual(
    refreshFeatures([feature.before], [feature], d.sources)[0],
    feature.after,
  );
  const a = edits.find((e) => e.kind === "availability")!;
  if (a.kind !== "availability") throw new Error("fixture");
  const original = {
    ...car(a.variantId),
    availability: a.before.availability,
    availabilityEvidence: a.before.evidence,
    availabilityRevision: undefined,
  } as Car;
  const output = refreshAvailability([original], [a], d.sources);
  assert.equal(output[0].availabilityRevision, a.id);
  assert.throws(
    () =>
      refreshAvailability(
        [{ ...original, availabilityRevision: "changed" }],
        [a],
        d.sources,
      ),
    /conflict/,
  );
  assert.throws(
    () => refreshAvailability([], [a], d.sources),
    /unknown vehicle/,
  );
});
test("new facts cannot overwrite a previously populated field", () => {
  const e = edits.find((e) => e.kind === "fact" && e.before === null)!;
  assert.throws(
    () =>
      refreshFacts(e.variantId, { [e.key]: e.after as Fact }, [e], d.sources),
    /conflict/,
  );
});

test("refresh registry rejects duplicate IDs, duplicate targets and unknown vehicles", () => {
  const ids = cars.map((c) => c.id);
  assert.throws(
    () => validateRefreshRegistry([edits[0], edits[0]], ids, d.sources),
    /Duplicate/,
  );
  assert.throws(
    () =>
      validateRefreshRegistry(
        [edits[0], { ...edits[0], id: "different" }],
        ids,
        d.sources,
      ),
    /Duplicate/,
  );
  assert.throws(
    () =>
      validateRefreshRegistry(
        [{ ...edits[0], variantId: "missing" }],
        ids,
        d.sources,
      ),
    /unknown target/,
  );
});

test("order-request wording never promises accepted orders or delivery", async () => {
  const { orderEvidenceText } =
    await import("../src/lib/availability-corrections");
  assert.match(
    orderEvidenceText("accepting_order_requests_advertised"),
    /requests.*acceptance and delivery need confirmation/,
  );
  assert.equal(
    orderEvidenceText("accepting_orders_advertised"),
    "Orders advertised as open.",
  );
  assert.match(orderEvidenceText("unverified"), /has not been confirmed/);
});

test("fact approvals review the refreshed effective snapshot rather than the original research", async () => {
  const { applyCorrections } = await import("../src/lib/corrections");
  const e = edits.find(
    (entry) => entry.kind === "fact" && entry.before !== null,
  )!;
  if (e.kind !== "fact" || !e.before) throw new Error("fixture");
  const effective = refreshFacts(
    e.variantId,
    { [e.key]: e.before },
    [e],
    d.sources,
  );
  const current = effective[e.key];
  const correction = {
    id: "isolated-post-refresh",
    variantId: e.variantId,
    factKey: e.key,
    before: current.value,
    after: current.value,
    beforeFact: current,
    status: "approved" as const,
    reviewedBy: "test editor",
    reviewedAt: "2026-10-10",
    reason: "Isolated metadata review fixture",
    sourceIds: current.sourceIds,
    basis: current.basis,
    comparisonBasis: current.comparisonBasis,
    unit: current.unit,
    evidenceDate: current.date,
  };
  assert.equal(
    applyCorrections(e.variantId, effective, [correction], d.sources)[e.key]
      .status,
    current.status,
  );
  assert.throws(
    () =>
      applyCorrections(
        e.variantId,
        effective,
        [{ ...correction, beforeFact: e.before! }],
        d.sources,
      ),
    /reviewed claim has changed/,
  );
});
