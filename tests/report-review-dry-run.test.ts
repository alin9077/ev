import test from "node:test";
import assert from "node:assert/strict";
import { canonicalReviewedJson } from "../src/lib/correction-guards";
import { MAX_REVIEW_CONTEXT_BYTES, MAX_REVIEW_PROPOSALS } from "../src/lib/report-review-proposal";
import {
  MAX_PREVIEW_OUTPUT_BYTES, MAX_PREVIEW_REQUEST_BYTES, parsePreviewRequest, parsePreviewRequestJson,
  previewReportReview, ReportPreviewError, serializeDryRunResult, type PreviewErrorCode,
} from "../src/lib/report-review-dry-run";
import { asOf, defaultRequest, dependencies, digest, fixture, uuid } from "./helpers/report-preview-fixture";
const rejects = async (promise: Promise<unknown>, code?: PreviewErrorCode) => assert.rejects(promise,
  (error: unknown) => error instanceof ReportPreviewError && (!code || error.code === code));
const throws = (fn: () => unknown, code?: PreviewErrorCode) => assert.throws(fn,
  (error: unknown) => error instanceof ReportPreviewError && (!code || error.code === code));

for (const key of ["range", "feature:heated_seats", "availability:exact_version"]) {
  for (const proposal of ["needs_evidence", "no_change_proposed"] as const) {
    test(`${key}: ${proposal} preserves binding and pending, unsaved, unverified boundary`, async () => {
      const f = await fixture(key), request = { ...f.request, proposal };
      const result = await previewReportReview({ request, rawReport: f.raw, history: [] }, dependencies());
      assert.equal(result.mode, "dry_run"); assert.equal(result.saved, false);
      assert.equal(result.proposal.report.id, f.raw.id); assert.equal(result.proposal.report.queueFile, f.file);
      assert.equal(result.proposal.report.variantId, f.raw.variantId); assert.equal(result.proposal.report.factKey, key);
      assert.deepEqual(result.proposal.report.claimBinding, f.raw.claimBinding);
      assert.equal(result.preview.reportDiagnostic, "bound_snapshot"); assert.equal(result.preview.reportStatus, "pending");
      assert.equal(result.preview.correctionDiagnostic, "not_linked"); assert.equal(result.preview.attributionVerified, false);
      assert.deepEqual(result.contextCoverage, { reports: "one_explicit_report", corrections: "not_supplied", history: "supplied_snapshot_only" });
      const output = serializeDryRunResult(result);
      assert.ok(!output.includes(f.raw.description)); assert.ok(!output.includes("observedClaim"));
      assert.ok(!Object.hasOwn(result.proposal, "correction")); assert.ok(!Object.hasOwn(result.proposal, "supersedes"));
    });
  }
}
test("strict request keys/actions/identities reject unknown fields and path-like IDs", () => {
  for (const key of ["approve", "approved", "rejected", "resolved", "status", "reviewedBy", "correction", "report", "claimBinding", "id", "recordedAt"]) {
    throws(() => parsePreviewRequest({ ...defaultRequest(), [key]: "forbidden" }), "invalid_request");
  }
  for (const proposal of ["approve", "approved", "rejected", "resolved", "correction_link_proposed", ""]) {
    throws(() => parsePreviewRequest({ ...defaultRequest(), proposal }), "invalid_request");
  }
  for (const reportId of ["../x", "a/b", "a\\b", "/tmp/x", "%2f", uuid(10).toUpperCase(), "x", "https://example.com"]) {
    throws(() => parsePreviewRequest({ ...defaultRequest(), reportId }), "invalid_request");
  }
  for (const key of Object.keys(defaultRequest())) {
    const value = { ...defaultRequest() } as Record<string, unknown>; delete value[key];
    throws(() => parsePreviewRequest(value), "invalid_request");
  }
});
test("flat request JSON rejects duplicates, equivalent escaped keys, invalid types, extra syntax and byte overflow", () => {
  const source = JSON.stringify(defaultRequest());
  assert.deepEqual(parsePreviewRequestJson(` \n${source}\t`), defaultRequest());
  for (const value of [source.replace("{", '{"reason":"first reason",'), source.replace("{", '{"reas\\u006fn":"first reason",'),
    source.replace('"needs_evidence"', "[]"), source + "{}", source.replace("}", ",}"), "null", "[]", "{", source + "\u0000"]) {
    throws(() => parsePreviewRequestJson(value), "invalid_request");
  }
  throws(() => parsePreviewRequestJson(" ".repeat(MAX_PREVIEW_REQUEST_BYTES + 1)), "request_too_large");
  throws(() => parsePreviewRequestJson("é".repeat(MAX_PREVIEW_REQUEST_BYTES / 2 + 1)), "request_too_large");
});
test("request text validation preserves exact accepted text and rejects accessors/non-JSON data", () => {
  const value = { ...defaultRequest(), reason: "  Ten substantive characters.  ", recordedByLabel: "  Local label  " };
  assert.deepEqual(parsePreviewRequest(value), value);
  for (const reason of ["", " ".repeat(20), "123456789", "x".repeat(2001)])
    throws(() => parsePreviewRequest({ ...value, reason }), "invalid_request");
  for (const recordedByLabel of ["", "   ", "x".repeat(201)])
    throws(() => parsePreviewRequest({ ...value, recordedByLabel }), "invalid_request");
  let called = false;
  const accessor = Object.defineProperty({}, "schema", { enumerable: true, get() { called = true; return value.schema; } });
  throws(() => parsePreviewRequest(accessor), "invalid_json"); assert.equal(called, false);
});
test("unbound, projected, forged and changed raw claims fail without fallback", async () => {
  const f = await fixture();
  const variants: unknown[] = [f.note().report, { ...f.raw, bindingState: "bound_snapshot" }, { ...f.raw, id: uuid(2) },
    { ...f.raw, observedValue: 999 }, { ...f.raw, submissionProtocol: "legacy" }, { ...f.raw, claimBinding: undefined },
    { ...f.raw, observedClaim: { ...f.raw.observedClaim, conditionExplanation: "changed" } },
    { ...f.raw, observedClaim: { ...f.raw.observedClaim, sourceIds: [...f.raw.observedClaim.sourceIds].reverse() } },
    { ...f.raw, observedClaim: { ...f.raw.observedClaim, fixtureMetadata: { b: ["first", "second"] } } }];
  for (const rawReport of variants) await rejects(previewReportReview({ request: f.request, rawReport, history: [] }, dependencies()));
  await rejects(previewReportReview({ request: f.request, rawReport: f.raw, history: [] }, {
    ...dependencies(), digest: async () => { throw new Error("private hash failure"); },
  }), "verification_unavailable");
});
test("exact predecessor is required and full-history projection handles supersession", async () => {
  const f = await fixture(), history = [f.note(101), f.note(102, uuid(101))];
  for (const expectedPreviousProposalId of [null, uuid(101), uuid(999)])
    await rejects(previewReportReview({ request: { ...f.request, expectedPreviousProposalId }, rawReport: f.raw, history }, dependencies()), "predecessor_mismatch");
  const result = await previewReportReview({ request: { ...f.request, expectedPreviousProposalId: uuid(102) }, rawReport: f.raw, history }, dependencies());
  assert.equal(result.proposal.supersedes, uuid(102)); assert.equal(result.preview.id, result.proposal.id);
  assert.equal(result.priorEventCount, 2); assert.equal(result.preview.reportDiagnostic, "bound_snapshot");
});
test("corrupt prefix, duplicate IDs, chain drift, invalid chronology and collisions never trim or retarget", async () => {
  const f = await fixture();
  for (const history of [[f.note(), f.note()], [f.note(), f.note(102)], [{ ...f.note(), recordedAt: "2030-01-01T00:00:00.000Z" }],
    [f.note(), { ...f.note(102, uuid(101)), report: { ...f.note().report, variantId: "changed" } }], [f.note(), { bad: true }]]) {
    await rejects(previewReportReview({ request: f.request, rawReport: f.raw, history }, dependencies()), "invalid_history");
  }
  for (const id of [1, 101]) await rejects(previewReportReview({
    request: { ...f.request, expectedPreviousProposalId: uuid(101) }, rawReport: f.raw, history: [f.note()],
  }, dependencies(id)), "invalid_proposal");
  await rejects(previewReportReview({ request: f.request, rawReport: f.raw, history: [] }, {
    ...dependencies(), now: () => "2026-10-10T00:00:00.000Z",
  }), "invalid_proposal");
});
test("historical correction snapshots remain immutable but new output has no approved-register label", async () => {
  const f = await fixture(), history = [f.historicalLink()], before = JSON.stringify(history);
  const result = await previewReportReview({ request: { ...f.request, expectedPreviousProposalId: history[0].id }, rawReport: f.raw, history }, dependencies());
  assert.equal(JSON.stringify(history), before); assert.equal(result.proposal.supersedes, history[0].id);
  assert.equal(result.preview.correctionDiagnostic, "not_linked");
  assert.ok(!JSON.stringify(result).includes("Linked approved register entry"));
  assert.ok(!JSON.stringify(result).includes("historic-synthetic-row"));
});
test("all data and dependency functions are captured before async digest mutation; results are detached/frozen", async () => {
  const f = await fixture(), request = { ...f.request }, history = [f.note()];
  request.expectedPreviousProposalId = history[0].id;
  const originalReason = request.reason, originalDigest = f.raw.claimBinding.digest;
  const deps = { ...dependencies(), digest: async (value: string) => {
    request.reason = "Mutated after snapshot"; f.raw.observedClaim.value = 99; f.raw.claimBinding.digest = "0".repeat(64);
    history[0] = { ...history[0], reason: "Mutated old reason" }; deps.id = () => uuid(999); deps.now = () => "2030-01-01T00:00:00.000Z";
    return digest(value);
  } };
  const result = await previewReportReview({ request, rawReport: f.raw, history }, deps);
  assert.equal(result.proposal.reason, originalReason); assert.equal(result.proposal.report.claimBinding.digest, originalDigest);
  assert.equal(result.proposal.id, uuid(501)); assert.equal(result.proposal.recordedAt, asOf);
  assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.proposal.report.claimBinding));
});
test("allocate ID and timestamp once; do not allocate ID on stale intent", async () => {
  const f = await fixture(); let ids = 0, clocks = 0;
  const deps = { digest, now: () => { clocks++; return asOf; }, id: () => { ids++; return uuid(501); } };
  await previewReportReview({ request: f.request, rawReport: f.raw, history: [] }, deps);
  assert.equal(ids, 1); assert.equal(clocks, 1);
  await rejects(previewReportReview({ request: { ...f.request, expectedPreviousProposalId: uuid(999) }, rawReport: f.raw, history: [] }, deps), "predecessor_mismatch");
  assert.equal(ids, 1); assert.equal(clocks, 2);
});
test("full label/reason survive while preview truncation is disclosed, JSON escapes terminal controls", async () => {
  const f = await fixture(), request = { ...f.request, recordedByLabel: "人".repeat(200), reason: "\u001b[31m" + "🧪".repeat(900) };
  const result = await previewReportReview({ request, rawReport: f.raw, history: [] }, dependencies());
  assert.equal(result.proposal.reason, request.reason); assert.equal(result.proposal.recordedByLabel, request.recordedByLabel);
  assert.equal(result.preview.fieldsTruncated, true); assert.equal(result.preview.reason.length, 400);
  const serialized = serializeDryRunResult(result);
  assert.ok(!serialized.includes("\u001b")); assert.deepEqual(JSON.parse(serialized), result);
  throws(() => serializeDryRunResult({ ...result, authorityNotice: "é".repeat(MAX_PREVIEW_OUTPUT_BYTES) as typeof result.authorityNotice }), "output_too_large");
});
test("canonical history hashes are stable under key ordering but change under significant state", async () => {
  const f = await fixture(), old = f.note();
  const run = (history: unknown) => previewReportReview({ request: { ...f.request, expectedPreviousProposalId: old.id }, rawReport: f.raw, history }, dependencies());
  const a = await run([old]), b = await run([Object.fromEntries(Object.entries(old).reverse())]);
  assert.equal(a.priorHistoryCanonicalSha256, await digest(canonicalReviewedJson([old])));
  assert.equal(a.priorHistoryCanonicalSha256, b.priorHistoryCanonicalSha256);
  assert.equal(a.candidateHistoryCanonicalSha256, b.candidateHistoryCanonicalSha256);
  assert.notEqual(a.priorHistoryCanonicalSha256, (await run([{ ...old, reason: "Significantly changed history text" }])).priorHistoryCanonicalSha256);
});
test("history count and doubled combined context cap fail without truncating", async () => {
  const f = await fixture();
  await rejects(previewReportReview({ request: f.request, rawReport: f.raw, history: Array(MAX_REVIEW_PROPOSALS).fill(f.note()) }, dependencies()), "history_full");
  const history = Array.from({ length: 600 }, (_, i) => ({ ...f.note(1000 + i, i ? uuid(999 + i) : undefined),
    reason: "界".repeat(2000), recordedByLabel: "界".repeat(200) }));
  assert.ok(Buffer.byteLength(JSON.stringify(history)) < MAX_REVIEW_CONTEXT_BYTES);
  await rejects(previewReportReview({ request: { ...f.request, expectedPreviousProposalId: history.at(-1)!.id }, rawReport: f.raw, history }, dependencies()), "context_too_large");
});
test("latest event is selected by exact ID even when prior history exceeds display limit", async () => {
  const f = await fixture(), history = Array.from({ length: 125 }, (_, i) => f.note(1000 + i, i ? uuid(999 + i) : undefined));
  const result = await previewReportReview({ request: { ...f.request, expectedPreviousProposalId: history.at(-1)!.id }, rawReport: f.raw, history }, dependencies());
  assert.equal(result.preview.id, uuid(501)); assert.equal(result.priorEventCount, 125);
});
