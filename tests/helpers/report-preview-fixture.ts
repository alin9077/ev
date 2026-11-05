/** Synthetic claims only; never import catalogue, live reports or approval registers. */
import { createHash } from "node:crypto";
import { makeIssueDraft } from "../../src/lib/corrections";
import { canonicalReviewedJson } from "../../src/lib/correction-guards";
import { createClaimBinding, REPORT_SUBMISSION_PROTOCOL, type BoundIssueReport } from "../../src/lib/report-claim-binding";
import { boundReportFilename } from "../../src/lib/report-queue-files";
import { captureReportReviewReference, REPORT_REVIEW_PROPOSAL_SCHEMA, REPORT_REVIEW_PROVENANCE, type ReportReviewProposal } from "../../src/lib/report-review-proposal";
import { PREVIEW_REQUEST_SCHEMA, type PreviewRequest } from "../../src/lib/report-review-dry-run";
import type { Fact } from "../../src/lib/types";
export const uuid = (n: number) => `00000000-0000-0000-0000-${n.toString(16).padStart(12, "0")}`;
export const digest = async (value: string) => createHash("sha256").update(value).digest("hex");
export const asOf = "2026-10-12T00:00:00.000Z";
export const createdAt = "2026-10-11T00:00:00.000Z";
export const defaultRequest = (reportId = uuid(1)): PreviewRequest => ({
  schema: PREVIEW_REQUEST_SCHEMA, reportId, proposal: "needs_evidence",
  recordedByLabel: "Self-declared fixture reviewer", reason: "More primary evidence is required.", expectedPreviousProposalId: null,
});
export async function fixture(key = "range", n = 1) {
  const claim: Fact = {
    key, label: "Synthetic claim", value: 420, unit: "km", basis: "WLTP", comparisonBasis: "WLTP",
    status: "standard", sourceIds: ["synthetic-a", "synthetic-b"], date: "2026-10-10", market: "AU",
    scope: "Exact synthetic version", qualifications: ["Synthetic only"], issues: [],
  };
  Object.assign(claim, { conditionExplanation: null, fixtureMetadata: { b: ["first", "second"], a: null } });
  const raw: BoundIssueReport = {
    ...makeIssueDraft("synthetic-car", claim, "Synthetic reporter text must stay private.", createdAt, uuid(n)),
    observedClaim: claim, submissionProtocol: REPORT_SUBMISSION_PROTOCOL,
    claimBinding: await createClaimBinding("synthetic-car", claim, digest),
    bindingState: "matched_service_snapshot", vehicleLabel: "Synthetic car",
  };
  const file = boundReportFilename(raw.id);
  const captured = await captureReportReviewReference(raw, file, digest);
  if (captured.state !== "bound_snapshot") throw new Error("Invalid synthetic fixture");
  const note = (id = 101, supersedes?: string): ReportReviewProposal => ({
    schema: REPORT_REVIEW_PROPOSAL_SCHEMA, id: uuid(id), report: captured.reference,
    recordedAt: "2026-10-11T01:00:00.000Z", recordedByLabel: "Prior synthetic writer",
    reason: "Prior synthetic review rationale.", provenance: REPORT_REVIEW_PROVENANCE,
    proposal: "needs_evidence", ...(supersedes ? { supersedes } : {}),
  });
  const historicalLink = (): ReportReviewProposal => ({
    ...note(), proposal: "correction_link_proposed",
    correction: { kind: "fact", id: "historic-synthetic-row", snapshotCanonical: canonicalReviewedJson({
      id: "historic-synthetic-row", variantId: "synthetic-car", factKey: "range", status: "approved",
      reviewedBy: "Unverified historic label", reviewedAt: "2026-10-11", evidenceDate: "2026-10-10",
      reason: "Synthetic historical row only", before: 420, after: 430, sourceIds: ["synthetic-a"],
      basis: "WLTP", comparisonBasis: "WLTP", unit: "km",
    }) },
  });
  return { raw, file, note, historicalLink, request: defaultRequest(raw.id) };
}
export const dependencies = (id = 501) => ({ digest, now: () => asOf, id: () => uuid(id) });
export async function* chunks(value: string | Uint8Array, width = 7): AsyncGenerator<Uint8Array> {
  const data = typeof value === "string" ? new TextEncoder().encode(value) : value;
  for (let at = 0; at < data.length; at += width) yield data.subarray(at, at + width);
}
