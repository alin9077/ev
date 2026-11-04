import test from "node:test";
import assert from "node:assert/strict";
import { makeDeviceIssueDraft } from "../src/lib/device-issue-drafts";
import { makeIssueDraft, featureReportClaim } from "../src/lib/corrections";
import { canonicalReviewedJson } from "../src/lib/correction-guards";
import { projectStoredIssueReport } from "../src/lib/report-queue-projection";
import { availabilityReportClaim } from "../src/lib/availability-corrections";
import type { Fact } from "../src/lib/types";
const now = "2026-10-11T08:00:00.000Z";
const id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const description = "Please check this exact claim.";
const issue = { issue_id: "issue-one", title: "Measurement scope", priority: "high", publication_action: "hold", model_ids: ["fixture"], source_ids: ["source-one"] };
const claim = (): Fact => ({ key: "range_km", label: "Published range", value: 300, unit: "km", basis: "WLTP combined", comparisonBasis: "WLTP combined", status: "conditional", sourceIds: ["source-one", "source-two"], date: "2026-10-11", market: "AU", scope: "Exact fixture grade", qualifications: ["Published test result", "Not guaranteed real-world range"], issues: [] });
const save = (f: Fact) => makeDeviceIssueDraft("fixture-current", f, description, now, id);

test("device snapshot distinguishes each full-claim field omitted by legacy drafts", () => {
  for (const [key, value] of Object.entries({ basis: "NEDC", comparisonBasis: "NEDC", date: "2026-10-10", scope: "Different grade", issues: [issue] })) {
    const a = claim(), b = { ...claim(), [key]: value };
    assert.deepEqual(makeIssueDraft("fixture-current", a, description, now, id), makeIssueDraft("fixture-current", b, description, now, id), key);
    assert.notDeepEqual(save(a).deviceClaimSnapshot, save(b).deviceClaimSnapshot, key);
  }
});

test("device capture preserves legacy draft projection and adds no service markers", () => {
  const f = claim(), draft = save(f);
  const { deviceClaimSnapshot, ...legacy } = draft;
  assert.deepEqual(legacy, makeIssueDraft("fixture-current", f, description, now, id));
  assert.deepEqual(Object.keys(legacy).sort(), ["id", "variantId", "factKey", "observedValue", "sourceIds", "description", "createdAt", "status", "claimKind", "observedStatus", "observedConditions"].sort());
  assert.equal(draft.status, "pending");
  assert.equal(deviceClaimSnapshot.schema, "roadmark-device-claim-v1");
  assert.equal(deviceClaimSnapshot.provenance, "device_only_unverified");
  assert.equal(deviceClaimSnapshot.variantId, draft.variantId);
  assert.equal(deviceClaimSnapshot.fact.key, draft.factKey);
  for (const key of ["submissionProtocol", "claimBinding", "observedClaim", "bindingState"]) assert.ok(!Object.hasOwn(draft, key));
});

test("complete JSON claim metadata, explicit null and literal object keys survive round trip", () => {
  const f = Object.assign(claim(), { value: { values: [0, false, null, "電動"], nested: JSON.parse('{"__proto__":{"kept":true},"constructor":"literal"}') }, issues: [issue], conditionExplanation: null, validUntil: "2026-10-31", resolvedElsewhere: false, extra: { order: ["second", "first"], optional: undefined }, optional: undefined }) as unknown as Fact;
  const draft = save(f), captured = JSON.parse(JSON.stringify(draft)).deviceClaimSnapshot.fact;
  assert.equal(canonicalReviewedJson(captured), canonicalReviewedJson(f));
  assert.equal(captured.conditionExplanation, null);
  assert.ok(!Object.hasOwn(captured, "optional"));
  assert.deepEqual(captured.sourceIds, f.sourceIds);
  assert.deepEqual(captured.qualifications, f.qualifications);
  assert.equal(captured.value.nested.__proto__.kept, true);
  assert.equal(Object.getPrototypeOf(captured), Object.prototype);
});

test("device capture detaches nested values, sources, qualifications and issues from caller mutation", () => {
  const f = Object.assign(claim(), { value: { nested: [1, 2] }, issues: [structuredClone(issue)] });
  const before = canonicalReviewedJson(f), draft = save(f), saved = canonicalReviewedJson(draft);
  assert.equal(canonicalReviewedJson(f), before);
  f.value.nested.push(3); f.sourceIds.push("new"); f.qualifications[0] = "changed"; f.issues[0].title = "changed";
  assert.equal(canonicalReviewedJson(draft), saved);
  assert.notEqual(draft.deviceClaimSnapshot.fact.value, f.value);
});

test("fact, equipment and availability report representations retain their exact keys and scope", () => {
  const equipment = featureReportClaim({ variant_id: "fixture-current", model_id: "fixture", criterion: "heated_seats", status: "conditional", value: "Front seats", conditions: "Specified grade only", source_ids: ["source-one"], evidence_scope: "Exact fixture equipment", last_evidence_date: "2026-10-11", reviewed_date: "2026-10-11", verification_state: "source_checked" }, "Heated seats");
  const availability = availabilityReportClaim({ id: "fixture-current", modelId: "fixture", family: "Fixture", slug: "fixture", brand: "Fixture", model: "Model", trim: "Exact grade", generation: "Current", year: null, availability: "current_or_order_listed", availabilityEvidence: { checkedAt: "2026-10-11", orderStatus: "listed_unconfirmed", stockStatus: "unverified", sourceIds: ["source-one"], qualifications: ["No physical stock confirmation"] }, drive: "RWD", facts: {}, issues: [] });
  for (const [f, kind] of [[claim(), "fact"], [equipment, "feature"], [availability, "availability"]] as const) {
    const draft = save(f);
    assert.equal(draft.claimKind, kind);
    assert.equal(canonicalReviewedJson(draft.deviceClaimSnapshot.fact), canonicalReviewedJson(f));
  }
});

test("malformed claim shapes and non-JSON values reject instead of losing metadata", () => {
  const cycle: Record<string, unknown> = {}; cycle.self = cycle;
  for (const extra of [NaN, Infinity, cycle, new Date(), new Map(), new Set(), [, 1], [undefined], 1n, () => 1]) {
    assert.throws(() => save(Object.assign(claim(), { extra })));
  }
  for (const patch of [{ key: "" }, { sourceIds: [1] }, { issues: [{ id: "wrong", message: "wrong shape" }] }, { status: "invented" }, { qualifications: null }, { scope: undefined }]) {
    assert.throws(() => save({ ...claim(), ...patch } as unknown as Fact));
  }
  assert.throws(() => makeDeviceIssueDraft(" ", claim(), description, now, id));
});

test("device-only drafts preserve existing description boundaries and do not require service crypto", () => {
  for (const length of [10, 2000]) assert.equal(makeDeviceIssueDraft("fixture", claim(), " "+"x".repeat(length)+" ", now, id).description.length, length);
  for (const length of [0, 9, 2001]) assert.throws(() => makeDeviceIssueDraft("fixture", claim(), "x".repeat(length), now, id), /10–2,000/);
  const originals = new Map(["crypto", "fetch"].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  try {
    for (const key of originals.keys()) Object.defineProperty(globalThis, key, { configurable: true, value: undefined });
    assert.equal(save(claim()).createdAt, now);
  } finally {
    for (const [key, descriptor] of originals) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});

test("device snapshot remains legacy-unbound in queue projection and cannot acquire service provenance", async () => {
  let digestCalls = 0;
  const projected = await projectStoredIssueReport(save(claim()), { fileKind: "legacy", filename: id+".json", digest: async () => { digestCalls++; throw new Error("Must not verify device snapshot"); } });
  assert.ok(projected);
  assert.equal(projected.bindingState, "legacy_unbound");
  assert.notEqual(projected.labelProvenance, "recorded_snapshot");
  assert.equal(digestCalls, 0);
  assert.ok(!Object.hasOwn(projected, "claimBinding"));
});
