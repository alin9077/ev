/** Draft only: synthetic fixtures; intentionally no catalogue, filesystem or live register import. */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { Fact, Feature } from "../src/lib/types";
import type { Correction } from "../src/lib/corrections";
import type { FeatureCorrection } from "../src/lib/feature-corrections";
import type { AvailabilityCorrection } from "../src/lib/availability-corrections";
import { makeIssueDraft } from "../src/lib/corrections";
import { canonicalReviewedJson } from "../src/lib/correction-guards";
import { createClaimBinding, REPORT_SUBMISSION_PROTOCOL, type BoundIssueReport } from "../src/lib/report-claim-binding";
import { boundReportFilename } from "../src/lib/report-queue-files";
import {
  captureReportReviewReference, validateReportReviewProposalAppend, projectReportReviewProposals,
  REPORT_REVIEW_PROPOSAL_SCHEMA, REPORT_REVIEW_PROVENANCE, REVIEW_AUTHORITY_NOTICE,
  MAX_REVIEW_PROPOSALS, MAX_PROJECTED_REVIEW_EVENTS, MAX_CORRECTION_SNAPSHOT_BYTES,
  MAX_REVIEW_CONTEXT_BYTES, MAX_REVIEW_EVENT_BYTES, MAX_REVIEW_PROJECTION_BYTES, ReportReviewProposalError,
  type CorrectionKind, type CorrectionLink, type ReportReviewTarget, type ReportReviewProposal,
  type ReportReviewContext, type ReportReviewProjectionEntry,
} from "../src/lib/report-review-proposal";
const digest = async (value: string) => createHash("sha256").update(value).digest("hex");
const uuid = (n: number) => `00000000-0000-0000-0000-${n.toString(16).padStart(12, "0")}`;
const createdAt = "2026-10-11T01:00:00.000Z";
const recordedAt = "2026-10-11T02:00:00.000Z";
const asOf = "2026-10-11T03:00:00.000Z";
const json = (value: unknown) => JSON.stringify(value);
const clone = <T>(value: T): T => structuredClone(value);
const fact = (key = "range"): Fact => ({
  key, label: "Synthetic exact claim", value: 420, unit: "km", basis: "WLTP",
  comparisonBasis: "WLTP", status: "standard", sourceIds: ["source-a"],
  date: "2026-10-10", market: "AU", scope: "Exact version", qualifications: ["Combined"], issues: [],
});
const feature = (): Feature => ({
  variant_id: "car-a", model_id: "model-a", criterion: "heated_seats", status: "standard",
  value: "Front seats", conditions: "Exact version only", source_ids: ["source-a"],
  evidence_scope: "AU exact version", last_evidence_date: "2026-10-10",
  reviewed_date: "2026-10-10", verification_state: "source_recorded",
});
function rows(status: "pending" | "approved" | "rejected" = "approved") {
  const base = { id: "same-id", variantId: "car-a", status, reviewedBy: "Unverified fixture label",
    reviewedAt: "2026-10-11", evidenceDate: "2026-10-10", reason: "Synthetic review explanation" };
  const f = fact();
  const factRow: Correction = { ...base, factKey: "range", before: 420, after: 430,
    sourceIds: ["source-a"], basis: "WLTP", comparisonBasis: "WLTP", unit: "km", beforeFact: f };
  const oldFeature = feature();
  const patch = { value: oldFeature.value, status: oldFeature.status,
    conditions: oldFeature.conditions, source_ids: [...oldFeature.source_ids] };
  const featureRow: FeatureCorrection = { ...base, criterion: oldFeature.criterion,
    beforeFeature: oldFeature, before: patch, after: { ...patch, value: "Front and rear seats" } };
  const before = { availability: "current_or_order_listed", evidence: { checkedAt: "2026-10-10",
    orderStatus: "unverified", stockStatus: "unverified", sourceIds: ["source-a"],
    qualifications: ["Check exact version"] } };
  const availabilityRow: AvailabilityCorrection = { ...base, before, after: clone(before) };
  return { fact: [factRow], feature: [featureRow], availability: [availabilityRow] };
}
async function fixture(kind: CorrectionKind = "fact", status: "pending" | "approved" | "rejected" = "approved", reportNumber = 1) {
  const key = kind === "feature" ? "feature:heated_seats" : kind === "availability" ? "availability:exact_version" : "range";
  const observedClaim = fact(key);
  const raw: BoundIssueReport = {
    ...makeIssueDraft("car-a", observedClaim, "The source needs another look.", createdAt, uuid(reportNumber)),
    submissionProtocol: REPORT_SUBMISSION_PROTOCOL, observedClaim,
    claimBinding: await createClaimBinding("car-a", observedClaim, digest),
    bindingState: "matched_service_snapshot", vehicleLabel: "Synthetic exact trim",
  };
  const file = boundReportFilename(raw.id);
  const captured = await captureReportReviewReference(raw, file, digest);
  assert.equal(captured.state, "bound_snapshot");
  if (captured.state !== "bound_snapshot") throw new Error("Fixture reference failed");
  const context = { reports: [{ queueFile: file, report: raw }], corrections: rows(status), digest, asOf };
  return { raw, file, report: captured.reference, context };
}
function note(report: ReportReviewTarget, n = 101, supersedes?: string): ReportReviewProposal {
  return { schema: REPORT_REVIEW_PROPOSAL_SCHEMA, id: uuid(n), report,
    recordedAt, recordedByLabel: "Local fixture writer", reason: "More supporting evidence is needed.",
    provenance: REPORT_REVIEW_PROVENANCE, proposal: "needs_evidence", ...(supersedes ? { supersedes } : {}) };
}
function link(f: Awaited<ReturnType<typeof fixture>>, n = 101, supersedes?: string): ReportReviewProposal {
  const row = f.context.corrections[f.report.claimKind][0];
  return { ...note(f.report, n, supersedes), proposal: "correction_link_proposed",
    correction: { kind: f.report.claimKind, id: row.id, snapshotCanonical: canonicalReviewedJson(row) } };
}
async function rejects(previous: unknown, candidate: unknown, context: ReportReviewContext, code?: string) {
  await assert.rejects(validateReportReviewProposalAppend(previous, candidate, context), (error: unknown) =>
    error instanceof ReportReviewProposalError && (!code || error.code === code));
}

for (const kind of ["fact", "feature", "availability"] as const) {
  for (const status of ["pending", "approved", "rejected"] as const) {
    test(`${kind} link to ${status} register entry stays an unverified pending-report proposal`, async () => {
      const f = await fixture(kind, status), event = link(f);
      const before = json(f.context);
      const accepted = await validateReportReviewProposalAppend([], [event], f.context);
      const view = await projectReportReviewProposals(accepted, f.context);
      assert.equal(view.state, "valid");
      assert.equal(view.latest[0].correctionDiagnostic, "exact_match");
      assert.equal(view.latest[0].reportStatus, "pending");
      assert.equal(view.latest[0].attributionVerified, false);
      assert.equal(view.latest[0].provenance, "local_manual_unverified");
      assert.equal(view.authorityNotice, REVIEW_AUTHORITY_NOTICE);
      if (status === "approved") assert.equal(view.latest[0].label, "Linked approved register entry; publication not verified");
      assert.equal(json(f.context), before);
    });
  }
  for (const proposal of ["needs_evidence", "no_change_proposed"] as const) {
    test(`${kind} ${proposal} has no correction authority`, async () => {
      const f = await fixture(kind), event = { ...note(f.report), proposal };
      const accepted = await validateReportReviewProposalAppend([], [event], f.context);
      const view = await projectReportReviewProposals(accepted, f.context);
      assert.equal(view.latest[0].reportStatus, "pending");
      assert.equal(view.latest[0].correctionDiagnostic, "not_linked");
      assert.ok(!Object.hasOwn(view.latest[0], "correctionReference"));
    });
  }
}
test("same ID across all three correction kinds is allowed; same-kind duplicates are not", async () => {
  const f = await fixture();
  await validateReportReviewProposalAppend([], [link(f)], f.context);
  f.context.corrections.fact.push(clone(f.context.corrections.fact[0]));
  await rejects([], [link(f)], f.context, "ambiguous_correction");
  const view = await projectReportReviewProposals([link(f)], f.context);
  assert.equal(view.latest[0].correctionDiagnostic, "ambiguous_correction");
});
test("all correction identities remain exact and namespaces are not inferred from ID alone", async () => {
  for (const kind of ["fact", "feature", "availability"] as const) {
    const f = await fixture(kind), event = link(f);
    f.context.corrections[kind][0].variantId = "car-b";
    if (kind === "feature") f.context.corrections.feature[0].beforeFeature.variant_id = "car-b";
    await rejects([], [event], f.context, "correction_target_mismatch");
  }
  const f = await fixture("feature"), event = link(f);
  f.context.corrections.feature[0].criterion = "feature:heated_seats";
  f.context.corrections.feature[0].beforeFeature.criterion = "feature:heated_seats";
  await rejects([], [event], f.context, "correction_target_mismatch");
  const g = await fixture(), factEvent = link(g);
  g.context.corrections.fact[0].factKey = "Range";
  await rejects([], [factEvent], g.context, "correction_target_mismatch");
  const wrongKind = { ...factEvent, correction: { ...link(g).correction!, kind: "availability" } };
  await rejects([], [wrongKind], g.context);
});
test("unknown correction references and unavailable sampled reports have different diagnostics", async () => {
  const f = await fixture(), event = link(f);
  f.context.corrections.fact = [];
  await rejects([], [event], f.context, "correction_not_in_supplied_context");
  assert.equal((await projectReportReviewProposals([event], f.context)).latest[0].correctionDiagnostic, "correction_not_in_supplied_context");
  f.context.reports = [];
  await rejects([], [event], f.context, "report_not_in_supplied_context");
  const view = await projectReportReviewProposals([event], f.context);
  assert.equal(view.latest[0].reportDiagnostic, "report_not_in_supplied_context");
  assert.doesNotMatch(json(view), /nonexistent|deleted|resolved"/);
});
test("absence from a full 200-record sample remains context-unavailable", async () => {
  const f = await fixture(), event = note(f.report);
  f.context.reports = Array.from({ length: 200 }, (_, i) => ({
    queueFile: boundReportFilename(uuid(i + 10)), report: { ...clone(f.raw), id: uuid(i + 10) },
  }));
  const view = await projectReportReviewProposals([event], f.context);
  assert.equal(view.latest[0].reportDiagnostic, "report_not_in_supplied_context");
  assert.equal(view.evaluatedEventCount, 1);
  assert.equal(view.invalidContextCount, 1);
});
test("capture rejects mismatched UUID filenames, protocol claims and mutated full claims", async () => {
  const f = await fixture();
  for (const file of [boundReportFilename(uuid(2)), `../${f.file}`, f.file.toUpperCase()])
    assert.notEqual((await captureReportReviewReference(f.raw, file, digest)).state, "bound_snapshot");
  for (const patch of [
    { id: f.raw.id.toUpperCase().replace("00000000", "ABCDEF00") },
    { bindingState: "bound_snapshot" }, { submissionProtocol: "roadmark-issue-v1" },
    { observedValue: 1 }, { claimKind: "availability" },
    { observedClaim: { ...f.raw.observedClaim, scope: "Changed exact scope" } },
    { observedClaim: { ...f.raw.observedClaim, unknownMetadata: [1, 2] } },
  ]) assert.notEqual((await captureReportReviewReference({ ...f.raw, ...patch }, f.file, digest)).state, "bound_snapshot");
  for (const patch of [{ schema: "old" }, { algorithm: "md5" }, { digest: "A".repeat(64) }, { extra: true }])
    assert.notEqual((await captureReportReviewReference({ ...f.raw, claimBinding: { ...f.raw.claimBinding, ...patch } }, f.file, digest)).state, "bound_snapshot");
});
test("legacy data is readable but not linkable; unavailable hashing is separate from invalid binding", async () => {
  const f = await fixture();
  const legacy = makeIssueDraft("car-a", f.raw.observedClaim, "Legacy description needing review.", createdAt, f.raw.id);
  assert.equal((await captureReportReviewReference(legacy, `${f.raw.id}.json`, digest)).state, "legacy_unbound");
  assert.equal((await captureReportReviewReference(f.raw, f.file, async () => { throw new Error("/private/hash/path"); })).state, "verification_unavailable");
  const bad = { ...f.raw, claimBinding: { ...f.raw.claimBinding, digest: "0".repeat(64) } };
  assert.equal((await captureReportReviewReference(bad, f.file, digest)).state, "invalid_binding");
  const view = await projectReportReviewProposals([note(f.report)], { ...f.context, digest: async () => { throw new Error("/private/hash/path"); } });
  assert.equal(view.latest[0].reportDiagnostic, "verification_unavailable");
  assert.doesNotMatch(json(view), /private\/hash/);
});
test("same UUID cannot acquire a new digest or exact target in history or current context", async () => {
  const f = await fixture(), first = note(f.report);
  const changed = { ...note(f.report, 102, first.id), report: { ...f.report, claimBinding: { ...f.report.claimBinding, digest: "0".repeat(64) } } };
  await rejects([first], [first, changed], f.context, "historic_report_reference_changed");
  f.raw.observedClaim.value = 430;
  f.raw.observedValue = 430;
  f.raw.claimBinding = await createClaimBinding("car-a", f.raw.observedClaim, digest);
  await rejects([], [first], f.context, "report_reference_mismatch");
  assert.equal((await projectReportReviewProposals([first], f.context)).latest[0].reportDiagnostic, "report_reference_mismatch");
});
test("proposal IDs remain distinct from linked and supplied correction or report identities", async () => {
  const f = await fixture();
  f.context.corrections.fact[0].id = uuid(101);
  await rejects([], [link(f)], f.context, "proposal_identity_collision");
  // Even a non-link new event cannot reuse a known supplied correction identity.
  await rejects([], [note(f.report)], f.context, "proposal_identity_collision");
  const g = await fixture(), h = await fixture("feature", "approved", 2);
  const context = { ...g.context, reports: [...g.context.reports, ...h.context.reports] };
  await rejects([], [note(g.report, 2)], context, "proposal_identity_collision");
  // The rule covers other reports and correction links throughout recorded history.
  await rejects([], [note(g.report, 2), note(h.report, 102)], context, "proposal_identity_collision");
  const first = note(g.report);
  g.context.corrections.feature[0].id = first.id;
  h.context.corrections = g.context.corrections;
  await rejects([], [first, link(h, 102)], { ...context, corrections: g.context.corrections }, "proposal_identity_collision");
  // Equal correction IDs across the three kind namespaces are still legal.
  const ordinary = await fixture();
  await validateReportReviewProposalAppend([], [link(ordinary)], ordinary.context);
});
test("complete correction shape rejects malformed known fields even when snapshot and current row match", async () => {
  const cases: { kind: CorrectionKind; mutate: (row: Record<string, unknown>) => void }[] = [
    { kind: "fact", mutate: (row) => { row.beforeFact = 0; } },
    { kind: "fact", mutate: (row) => { row.beforeFact = {}; } },
    { kind: "fact", mutate: (row) => { row.beforeFact = { ...fact(), resolvedElsewhere: {} }; } },
    { kind: "fact", mutate: (row) => { row.afterStatus = "approved"; } },
    { kind: "fact", mutate: (row) => { row.resolvedIssueIds = "issue-a"; } },
    { kind: "fact", mutate: (row) => { row.qualifications = [{}]; } },
    { kind: "fact", mutate: (row) => { row.validUntil = {}; } },
    { kind: "fact", mutate: (row) => { row.conditionExplanation = []; } },
    { kind: "feature", mutate: (row) => { row.beforeFeature = {}; } },
    { kind: "feature", mutate: (row) => { row.beforeFeature = { ...feature(), status: "approved" }; } },
    { kind: "feature", mutate: (row) => { row.beforeFeature = { ...feature(), source_ids: [0] }; } },
    { kind: "feature", mutate: (row) => { row.beforeFeature = { ...feature(), condition_label: {} }; } },
    { kind: "feature", mutate: (row) => { row.beforeFeature = { ...feature(), usability_notes: "not-an-array" }; } },
    { kind: "feature", mutate: (row) => { row.beforeFeature = { ...feature(), confirmation_needed: false }; } },
    { kind: "feature", mutate: (row) => { (row.after as Record<string, unknown>).status = "approved"; } },
    { kind: "availability", mutate: (row) => { ((row.after as { evidence: Record<string, unknown> }).evidence).physicalStockVerified = {}; } },
    { kind: "availability", mutate: (row) => { ((row.before as { evidence: Record<string, unknown> }).evidence).factoryOrderAcceptanceVerified = "true"; } },
    { kind: "availability", mutate: (row) => { ((row.after as { evidence: Record<string, unknown> }).evidence).qualifications = {}; } },
    { kind: "availability", mutate: (row) => { ((row.before as { evidence: Record<string, unknown> }).evidence).sourceIds = [0]; } },
    ...(["fact", "feature", "availability"] as const).map((kind) => ({ kind,
      mutate: (row: Record<string, unknown>) => { row.supersedes = {}; } })),
  ];
  for (const { kind, mutate } of cases) {
    const f = await fixture(kind);
    mutate(f.context.corrections[kind][0] as unknown as Record<string, unknown>);
    const matchingMalformedSnapshot = link(f);
    await rejects([], [matchingMalformedSnapshot], f.context);
    const view = await projectReportReviewProposals([matchingMalformedSnapshot], f.context);
    assert.equal(view.state, "invalid_context");
    assert.deepEqual(view.latest, []);
    assert.doesNotMatch(json(view), /exact_match|Linked approved register entry/);
  }
});
test("shape-only checks preserve null allowances, undefined-as-absent and unknown finite metadata", async () => {
  const f = await fixture();
  Object.assign(f.context.corrections.fact[0], {
    validUntil: null, conditionExplanation: null, qualifications: [], resolvedIssueIds: [],
    futureMetadata: { explicitNull: null, ordered: [2, 1], omitted: undefined },
  });
  // Explicit null explanation in persisted Fact-shaped snapshots is an existing supported shape.
  (f.context.corrections.fact[0].beforeFact as unknown as { conditionExplanation: unknown }).conditionExplanation = null;
  await validateReportReviewProposalAppend([], [link(f)], f.context);
  const g = await fixture("feature");
  Object.assign(g.context.corrections.feature[0].beforeFeature, {
    condition_label: "Optional", usability_notes: ["Check source"], confirmation_needed: "Exact trim",
    unknownMetadata: { retained: true },
  });
  await validateReportReviewProposalAppend([], [link(g)], g.context);
  const h = await fixture("availability");
  Object.assign(h.context.corrections.availability[0].after.evidence, {
    physicalStockVerified: false, factoryOrderAcceptanceVerified: false, qualifications: [], unknownMetadata: { retained: true },
  });
  await validateReportReviewProposalAppend([], [link(h)], h.context);
});
test("duplicate context report identity is ambiguous, including another filename", async () => {
  const f = await fixture();
  f.context.reports.push({ queueFile: `${f.raw.id}.json`, report: clone(f.raw) });
  await rejects([], [note(f.report)], f.context, "ambiguous_report");
  assert.equal((await projectReportReviewProposals([note(f.report)], f.context)).latest[0].reportDiagnostic, "ambiguous_report");
});
test("availability links require exact_version and explicit report kind must agree with key", async () => {
  const f = await fixture("availability");
  for (const report of [
    { ...f.report, factKey: "availability:family" },
    { ...f.report, claimKind: "fact" },
    { ...f.report, factKey: "feature:heated_seats", claimKind: "feature" },
  ]) await rejects([], [{ ...link(f), report }], f.context);
});
test("full canonical correction snapshot includes unknown metadata, optional nulls and array order", async () => {
  const mutations: ((row: Correction & Record<string, unknown>) => void)[] = [
    (r) => { r.after = 999; }, (r) => { r.status = "rejected"; },
    (r) => { r.reason = "Changed reason"; }, (r) => { r.reviewedBy = "Other label"; },
    (r) => { r.sourceIds = ["source-b"]; }, (r) => { r.evidenceDate = "2026-10-09"; },
    (r) => { r.reviewedAt = "2026-10-10"; }, (r) => { r.validUntil = null; },
    (r) => { r.qualifications = []; }, (r) => { r.metadata = { future: true }; },
    (r) => { r.beforeFact = { ...r.beforeFact!, scope: "Changed scope" }; },
  ];
  for (const mutate of mutations) {
    const f = await fixture(), event = link(f);
    mutate(f.context.corrections.fact[0] as Correction & Record<string, unknown>);
    await rejects([], [event], f.context, "correction_entry_changed");
    const view = await projectReportReviewProposals([event], f.context);
    assert.equal(view.latest[0].correctionDiagnostic, "correction_entry_changed");
    assert.equal(view.latest[0].label, "Referenced correction has changed; review the proposed link again");
  }
  const f = await fixture();
  f.context.corrections.fact[0].sourceIds = ["a", "b"];
  const event = link(f);
  f.context.corrections.fact[0].sourceIds.reverse();
  await rejects([], [event], f.context, "correction_entry_changed");
});
test("object property order is immaterial, but malformed or noncanonical stored snapshot text fails", async () => {
  const f = await fixture(), event = link(f);
  const row = f.context.corrections.fact[0];
  f.context.corrections.fact[0] = Object.fromEntries(Object.entries(row).reverse()) as Correction;
  await validateReportReviewProposalAppend([], [event], f.context);
  for (const snapshotCanonical of ["{", JSON.stringify(row, null, 2), "null", "[]", "{}"])
    await rejects([], [{ ...event, correction: { ...event.correction!, snapshotCanonical } }], f.context);
});
test("feature and availability unknown metadata and explicit flags remain in full snapshots", async () => {
  const featureFixture = await fixture("feature"), featureEvent = link(featureFixture);
  featureFixture.context.corrections.feature[0].beforeFeature.verification_state = "Changed metadata";
  await rejects([], [featureEvent], featureFixture.context, "correction_entry_changed");
  const availabilityFixture = await fixture("availability"), availabilityEvent = link(availabilityFixture);
  availabilityFixture.context.corrections.availability[0].after.evidence.physicalStockVerified = false;
  await rejects([], [availabilityEvent], availabilityFixture.context, "correction_entry_changed");
  const withFalse = link(availabilityFixture);
  delete availabilityFixture.context.corrections.availability[0].after.evidence.physicalStockVerified;
  await rejects([], [withFalse], availabilityFixture.context, "correction_entry_changed");
});
test("a historical link survives correction drift and can be superseded by needs_evidence", async () => {
  const f = await fixture(), old = link(f);
  const previous = await validateReportReviewProposalAppend([], [old], f.context);
  const immutable = json(previous);
  f.context.corrections.fact[0].reason = "Later register revision";
  const next = note(f.report, 102, old.id);
  const result = await validateReportReviewProposalAppend(previous, [...previous, next], f.context);
  assert.equal(json(result[0]), json(previous[0]));
  assert.equal(json(previous), immutable);
  const view = await projectReportReviewProposals(result, f.context);
  assert.equal(view.events[0].correctionDiagnostic, "correction_entry_changed");
  assert.equal(view.latest[0].proposal, "needs_evidence");
  assert.equal(view.latest[0].reportStatus, "pending");
});
test("idempotent preservation needs no current report; new append still requires verified binding", async () => {
  const f = await fixture(), first = note(f.report);
  const previous = await validateReportReviewProposalAppend([], [first], f.context);
  f.context.reports = [];
  assert.deepEqual(await validateReportReviewProposalAppend(previous, previous, f.context), previous);
  await rejects(previous, [...previous, note(f.report, 102, first.id)], f.context, "report_not_in_supplied_context");
});
test("prefix truncation, mutation and reordering cannot change historical bytes", async () => {
  const f = await fixture(), a = note(f.report), b = note(f.report, 102, a.id);
  const previous = await validateReportReviewProposalAppend([], [a, b], f.context);
  await rejects(previous, [a], f.context);
  await rejects(previous, [b, a], f.context);
  await rejects(previous, [{ ...a, reason: "A rewritten historical explanation" }, b], f.context, "history_prefix_changed");
  await rejects(previous, [{ ...a, extra: "Hidden approval" }, b], f.context);
});
test("immediate predecessor rejects missing, stale, unknown, self, future and duplicate IDs", async () => {
  const f = await fixture(), a = note(f.report), b = note(f.report, 102, a.id);
  for (const third of [note(f.report, 103), note(f.report, 103, a.id), note(f.report, 103, uuid(999)),
    note(f.report, 103, uuid(103)), note(f.report, 103, uuid(104)), note(f.report, 102, b.id)])
    await rejects([a, b], [a, b, third], f.context);
});
test("interleaved reports keep independent chains; cross-report predecessor fails", async () => {
  const f = await fixture(), g = await fixture("feature", "approved", 2);
  const context = { ...f.context, reports: [...f.context.reports, ...g.context.reports] };
  const a = note(f.report), b = note(g.report, 102), c = note(f.report, 103, a.id);
  await validateReportReviewProposalAppend([], [a, b, c], context);
  await rejects([a, b], [a, b, { ...c, supersedes: b.id }], context);
});
test("timestamps use exact UTC ISO, verified report creation, explicit asOf and append order", async () => {
  const f = await fixture(), a = note(f.report);
  for (const time of ["2026-02-30T02:00:00.000Z", "2026-10-11T02:00:00Z", "not-a-time", "2026-10-11T00:59:59.999Z", "2026-10-11T03:00:00.001Z"])
    await rejects([], [{ ...a, recordedAt: time }], f.context);
  await rejects([], [a], { ...f.context, asOf: "2026-10-11" });
  await validateReportReviewProposalAppend([], [{ ...a, recordedAt: createdAt }], f.context);
  await validateReportReviewProposalAppend([], [{ ...a, recordedAt: asOf }], f.context);
  await validateReportReviewProposalAppend([], [a, note(f.report, 102, a.id)], f.context);
  await rejects([a], [a, { ...note(f.report, 102, a.id), recordedAt: "2026-10-11T01:59:59.999Z" }], f.context);
});
test("forged authority fields and wrong discriminant-specific keys reject", async () => {
  const f = await fixture(), a = note(f.report), linked = link(f);
  for (const patch of [{ approved: true }, { resolved: true }, { published: true }, { reviewerAuthenticated: true },
    { proposal: "approved" }, { proposal: ["needs_evidence"] }, { provenance: "authenticated" }, { report: { ...f.report, status: "approved" } },
    { correction: linked.correction }, { status: "resolved" }])
    await rejects([], [{ ...a, ...patch }], f.context);
  const missing = { ...linked } as Record<string, unknown>;
  delete missing.correction;
  await rejects([], [missing], f.context);
  (f.context.corrections.fact[0] as unknown as { status: unknown }).status = ["approved"];
  await rejects([], [a], f.context, "invalid_correction_context");
});
test("finite plain JSON guards reject cycles, sparse arrays, NaN, Infinity, classes, getters and symbols", async () => {
  const invalid: unknown[] = [NaN, Infinity, new Date(), new Map(), [undefined], Array(2), 1n, () => true];
  const cycle: Record<string, unknown> = {}; cycle.self = cycle; invalid.push(cycle);
  const getter = Object.defineProperty({}, "x", { enumerable: true, get: () => "unsafe" }); invalid.push(getter);
  invalid.push({ [Symbol("secret")]: 1 });
  for (const value of invalid) {
    const f = await fixture();
    (f.context.corrections.fact[0] as Correction & Record<string, unknown>).metadata = value;
    await rejects([], [note(f.report)], f.context);
  }
});
test("plain-array preflight rejects subclass and custom inherited map before history capture", async () => {
  type Attack = (values: unknown[], touched: () => void) => unknown[];
  const attacks: Record<string, Attack> = {
    subclass: (values) => {
      class Subclass<T> extends Array<T> {}
      return new Subclass<unknown>(...values);
    },
    subclass_inherited_map: (values, touched) => {
      class Subclass<T> extends Array<T> {}
      Object.defineProperty(Subclass.prototype, "map", { value: () => { touched(); return []; } });
      return new Subclass<unknown>(...values);
    },
    custom_array_prototype: (values, touched) => Object.setPrototypeOf([...values],
      Object.create(Array.prototype, { map: { value: () => { touched(); return []; } } })),
    custom_inherited_map_getter: (values, touched) => Object.setPrototypeOf([...values],
      Object.create(Array.prototype, { map: { get: () => { touched(); return () => []; } } })),
    custom_inherited_iterator: (values, touched) => Object.setPrototypeOf([...values],
      Object.create(Array.prototype, { [Symbol.iterator]: { value: () => { touched(); return [][Symbol.iterator](); } } })),
    subclass_species: (values, touched) => {
      class Subclass<T> extends Array<T> {
        static get [Symbol.species]() { touched(); return Array; }
      }
      return new Subclass<unknown>(...values);
    },
    null_array_prototype: (values) => Object.setPrototypeOf([...values], null),
  };
  for (const [name, attack] of Object.entries(attacks)) {
    const f = await fixture(), previous = note(f.report);
    let callbacks = 0, hashes = 0;
    const touched = () => { callbacks++; };
    const context = { ...f.context, digest: async (text: string) => { hashes++; return digest(text); } };
    // An inherited map returning [] must not erase the old immutable prefix.
    await rejects(attack([previous], touched), [], context, "invalid_json");
    await rejects(attack([previous], touched), [{ ...previous, reason: "Rewritten historical explanation" }], context, "invalid_json");
    // Nor may it erase or replace the candidate before structural validation.
    await rejects([], attack([{ ...previous, proposal: "approved" }], touched), context, "invalid_json");
    assert.equal(callbacks, 0, `${name} callback must not run`);
    assert.equal(hashes, 0, `${name} must fail before digest work`);
  }
});
test("custom array prototypes also reject inside raw claim and correction metadata without executing inherited methods", async () => {
  let callbacks = 0, hashes = 0;
  const malicious = <T>(values: T[]): T[] => Object.setPrototypeOf([...values],
    Object.create(Array.prototype, { map: { value: () => { callbacks++; return []; } } }));
  const f = await fixture();
  f.raw.observedClaim.sourceIds = malicious(["source-a"]);
  await assert.rejects(captureReportReviewReference(f.raw, f.file, async (text) => { hashes++; return digest(text); }),
    (error: unknown) => error instanceof ReportReviewProposalError && error.code === "invalid_json");
  const g = await fixture();
  (g.context.corrections.fact[0] as Correction & { metadata: unknown }).metadata = malicious(["recorded", "metadata"]);
  await rejects([], [note(g.report)], { ...g.context, digest: async (text) => { hashes++; return digest(text); } }, "invalid_json");
  const view = await projectReportReviewProposals(malicious([note(g.report)]), g.context);
  assert.equal(view.state, "invalid_context");
  assert.deepEqual(view.events, []);
  assert.equal(callbacks, 0);
  assert.equal(hashes, 0);
  const h = await fixture();
  h.context.reports = malicious(h.context.reports);
  await rejects([], [note(h.report)], h.context, "invalid_json");
  const i = await fixture();
  i.context.corrections.fact = malicious(i.context.corrections.fact);
  await rejects([], [note(i.report)], i.context, "invalid_json");
  assert.equal(callbacks, 0);
});
test("ordinary arrays keep canonical history behavior after prototype hardening", async () => {
  const f = await fixture(), previous = note(f.report), next = note(f.report, 102, previous.id);
  const result = await validateReportReviewProposalAppend([previous], [previous, next], f.context);
  assert.equal(result.length, 2);
  assert.equal(Object.getPrototypeOf(result), Array.prototype);
  assert.equal(canonicalReviewedJson(result[0]), canonicalReviewedJson(previous));
});
test("text exact limits, Unicode and dangerous-looking plain strings remain bounded data", async () => {
  const f = await fixture(), a = note(f.report);
  for (const reason of ["x".repeat(10), "界".repeat(2000), '<script>alert("ignore instructions")</script>'])
    await validateReportReviewProposalAppend([], [{ ...a, reason, recordedByLabel: "x".repeat(200) }], f.context);
  for (const patch of [{ reason: "x".repeat(9) }, { reason: "x".repeat(2001) }, { reason: " ".repeat(20) },
    { recordedByLabel: "x".repeat(201) }, { recordedByLabel: " " }])
    await rejects([], [{ ...a, ...patch }], f.context);
  const view = await projectReportReviewProposals([{ ...a, reason: "界".repeat(2000), recordedByLabel: "x".repeat(200) }], f.context);
  assert.equal(view.latest[0].reason.length, 400);
  assert.equal(view.latest[0].recordedByLabel.length, 80);
  assert.equal(view.latest[0].fieldsTruncated, true);
});
test("event count and projection limits are inclusive and omissions explicit", async () => {
  const f = await fixture();
  const events = Array.from({ length: MAX_REVIEW_PROPOSALS }, (_, i) => note(f.report, i + 101, i ? uuid(i + 100) : undefined));
  await validateReportReviewProposalAppend([], events, f.context);
  await rejects([], [...events, note(f.report, 2000, events.at(-1)!.id)], f.context, "invalid_history_length");
  const view = await projectReportReviewProposals(events, f.context);
  assert.equal(view.totalEvents, MAX_REVIEW_PROPOSALS);
  assert.equal(view.events.length, MAX_PROJECTED_REVIEW_EVENTS);
  assert.equal(view.omittedEventCount, MAX_REVIEW_PROPOSALS - MAX_PROJECTED_REVIEW_EVENTS);
  assert.equal(view.latest.length, 1);
  assert.equal(view.latest[0].id, events.at(-1)!.id);
  assert.equal(view.truncated, true);
  assert.ok(new TextEncoder().encode(json(view)).byteLength <= MAX_REVIEW_PROJECTION_BYTES);
});
test("correction snapshot byte limit uses UTF-8 and accepts its exact inclusive edge", async () => {
  const f = await fixture();
  const row = f.context.corrections.fact[0] as Correction & { metadata: string };
  row.metadata = "";
  const base = new TextEncoder().encode(canonicalReviewedJson(row)).byteLength;
  row.metadata = "x".repeat(MAX_CORRECTION_SNAPSHOT_BYTES - base);
  assert.equal(new TextEncoder().encode(link(f).correction!.snapshotCanonical).byteLength, MAX_CORRECTION_SNAPSHOT_BYTES);
  await validateReportReviewProposalAppend([], [link(f)], f.context);
  row.metadata += "界";
  await rejects([], [link(f)], f.context);
});
test("total input and complexity limits reject before hashing", async () => {
  const f = await fixture(); let hashes = 0;
  f.context.digest = async (value) => { hashes++; return digest(value); };
  (f.context.corrections.fact[0] as Correction & { metadata: string }).metadata = "x".repeat(MAX_REVIEW_CONTEXT_BYTES + 1);
  await rejects([], [note(f.report)], f.context, "context_too_large");
  assert.equal(hashes, 0);
  let nested: unknown = null;
  for (let i = 0; i < 70; i++) nested = { nested };
  (f.context.corrections.fact[0] as Correction & { metadata: unknown }).metadata = nested;
  await rejects([], [note(f.report)], f.context, "json_complexity_limit");
  assert.equal(hashes, 0);
});
test("total canonical input byte cap accepts the exact edge and rejects one byte more", async () => {
  const f = await fixture(), event = note(f.report);
  const row = f.context.corrections.fact[0] as Correction & { metadata: string };
  row.metadata = "";
  const base = new TextEncoder().encode(canonicalReviewedJson({
    other: { previous: [], candidate: [event] }, reports: f.context.reports,
    corrections: f.context.corrections, asOf: f.context.asOf,
  })).byteLength;
  row.metadata = "x".repeat(MAX_REVIEW_CONTEXT_BYTES - base);
  await validateReportReviewProposalAppend([], [event], f.context);
  row.metadata += "x";
  await rejects([], [event], f.context, "context_too_large");
});
test("per-event byte cap accounts for escaped canonical snapshot text exactly", async () => {
  const f = await fixture();
  const row = f.context.corrections.fact[0] as Correction & { metadata: string };
  row.metadata = "";
  const base = new TextEncoder().encode(canonicalReviewedJson(link(f))).byteLength;
  const remaining = MAX_REVIEW_EVENT_BYTES - base;
  row.metadata = "\\".repeat(Math.floor(remaining / 4)) + "x".repeat(remaining % 4);
  assert.equal(new TextEncoder().encode(canonicalReviewedJson(link(f))).byteLength, MAX_REVIEW_EVENT_BYTES);
  await validateReportReviewProposalAppend([], [link(f)], f.context);
  row.metadata += "x";
  await rejects([], [link(f)], f.context, "event_too_large");
});
test("inputs detach before async hashing and returned references/history/projections are deep frozen", async () => {
  const f = await fixture(), event = link(f);
  const expected = canonicalReviewedJson(event);
  let release!: () => void, started!: () => void;
  const waiting = new Promise<void>((resolve) => { release = resolve; });
  const entered = new Promise<void>((resolve) => { started = resolve; });
  const pending = validateReportReviewProposalAppend([], [event], { ...f.context, digest: async (text) => { started(); await waiting; return digest(text); } });
  await entered;
  f.raw.observedClaim.value = 999;
  f.context.corrections.fact[0].reason = "Changed while hashing";
  (event as unknown as { reason: string }).reason = "Caller changed while hashing";
  release();
  const result = await pending;
  assert.equal(canonicalReviewedJson(result[0]), expected);
  assert.ok(Object.isFrozen(result) && Object.isFrozen(result[0]) && Object.isFrozen(result[0].report.claimBinding));
  const g = await fixture();
  const view = await projectReportReviewProposals([link(g)], g.context);
  assert.ok(Object.isFrozen(view) && Object.isFrozen(view.events) && Object.isFrozen(view.latest[0].correctionReference));
  assert.throws(() => { (view.latest[0] as unknown as { reportStatus: string }).reportStatus = "approved"; });
});
test("projection captures register status before async hashing, rather than reading a changed caller after await", async () => {
  const f = await fixture(), event = link(f);
  let release!: () => void, entered!: () => void;
  const wait = new Promise<void>((resolve) => { release = resolve; });
  const started = new Promise<void>((resolve) => { entered = resolve; });
  const pending = projectReportReviewProposals([event], { ...f.context, digest: async (text) => { entered(); await wait; return digest(text); } });
  await started;
  f.context.corrections.fact[0].status = "rejected";
  release();
  assert.equal((await pending).latest[0].label, "Linked approved register entry; publication not verified");
});
test("projection omits raw claim/report/correction snapshots and malformed newest events are visible failures", async () => {
  const f = await fixture(), first = link(f);
  f.raw.description = "The private report description must never appear.";
  const view = await projectReportReviewProposals([first], f.context);
  const serialized = json(view);
  for (const field of ["observedClaim", "observedValue", "snapshotCanonical", "reviewedBy", "private report description", "vehicleLabel"])
    assert.ok(!serialized.includes(field), field);
  const invalid = await projectReportReviewProposals([first, { ...note(f.report, 102, first.id), proposal: "resolved" }], f.context);
  assert.equal(invalid.state, "invalid_context");
  assert.deepEqual(invalid.latest, []);
  assert.equal(invalid.invalidContextCount, 1);
  assert.equal(invalid.totalEvents, null);
});
test("empty history is explicitly valid with zero counts and no inferred report resolution", async () => {
  const f = await fixture();
  const view = await projectReportReviewProposals([], f.context);
  assert.equal(view.state, "valid");
  assert.equal(view.totalEvents, 0);
  assert.equal(view.totalReports, 0);
  assert.deepEqual(view.latest, []);
  assert.equal(view.emptyLabel, "No local review proposal recorded");
});

// Compile-time contract: included in normal project tsc after gated adoption; never invoked.
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type Contract = [
  Assert<Equal<ReportReviewProposal["proposal"], "needs_evidence" | "no_change_proposed" | "correction_link_proposed">>,
  Assert<Equal<ReportReviewProjectionEntry["reportStatus"], "pending">>,
  Assert<Equal<ReportReviewProjectionEntry["attributionVerified"], false>>,
  Assert<Equal<ReportReviewProposal["provenance"], "local_manual_unverified">>,
  Assert<Equal<Extract<ReportReviewProposal, { proposal: "correction_link_proposed" }>["correction"], CorrectionLink>>,
  Assert<Equal<Extract<ReportReviewProposal, { proposal: "needs_evidence" | "no_change_proposed" }>["correction"], undefined>>,
  Assert<Equal<Parameters<typeof validateReportReviewProposalAppend>[0], unknown>>,
];
function typeContract(event: ReportReviewProposal, target: ReportReviewTarget): Contract | undefined {
  // @ts-expect-error A proposal cannot assign report status.
  event.report.status = "approved";
  // @ts-expect-error Captured bindings are read-only.
  target.claimBinding.digest = "0".repeat(64);
  // @ts-expect-error Local proposals cannot become approvals.
  event.proposal = "approved";
  return undefined;
}
void typeContract;
