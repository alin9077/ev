import { validReportFact } from "./report-claim-shape";
import type { Fact } from "./types";
import { isReportId } from "./report-queue-files";
import { makeIssueDraft, type IssueDraft } from "./corrections";
import { canonicalReviewedJson } from "./correction-guards";

export const REPORT_CLAIM_SCHEMA = "roadmark-report-claim-v1" as const;
export const REPORT_SUBMISSION_PROTOCOL = "roadmark-issue-v2" as const;
export const REPORT_CONTENT_TYPE = "application/vnd.roadmark.issue-v2+json";
export const MAX_STORED_REPORT_BYTES = 512000;
export type ClaimBinding = {
  schema: typeof REPORT_CLAIM_SCHEMA;
  algorithm: "sha256";
  digest: string;
};
export type ClaimDigest = (canonical: string) => Promise<string>;
export type BoundIssueReport = IssueDraft & {
  submissionProtocol: typeof REPORT_SUBMISSION_PROTOCOL;
  claimBinding: ClaimBinding;
  observedClaim: Fact;
  bindingState: "matched_service_snapshot";
  vehicleLabel: string;
};
export class ReportBindingError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ReportBindingError";
  }
}
const text = (value: unknown): value is string =>
  typeof value === "string" && !!value.trim();
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
export function isClaimBinding(value: unknown): value is ClaimBinding {
  return (
    record(value) &&
    Object.keys(value).length === 3 &&
    value.schema === REPORT_CLAIM_SCHEMA &&
    value.algorithm === "sha256" &&
    typeof value.digest === "string" &&
    /^[a-f0-9]{64}$/.test(value.digest)
  );
}
export const webClaimDigest: ClaimDigest = async (canonical) => {
  if (!globalThis.crypto?.subtle)
    throw new Error(
      "Secure claim verification is unavailable. Your description is still here; save or export a device draft instead.",
    );
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};
export function reportClaimContextKey(variantId: string, fact: Fact): string {
  if (!text(variantId) || !record(fact) || !text(fact.key))
    throw new Error("An exact trim and claim are required.");
  return canonicalReviewedJson({
    schema: REPORT_CLAIM_SCHEMA,
    variantId,
    fact,
  });
}
export async function createClaimBinding(
  variantId: string,
  fact: Fact,
  digest: ClaimDigest = webClaimDigest,
): Promise<ClaimBinding> {
  const canonical = reportClaimContextKey(variantId, fact);
  const result = {
    schema: REPORT_CLAIM_SCHEMA,
    algorithm: "sha256" as const,
    digest: await digest(canonical),
  };
  if (!isClaimBinding(result))
    throw new Error("Claim verification did not return a valid digest.");
  return result;
}
export function supportsBoundReporting(value: unknown): boolean {
  return (
    record(value) &&
    value.mode === "local" &&
    value.enabled === true &&
    value.submissionProtocol === REPORT_SUBMISSION_PROTOCOL &&
    value.claimSchema === REPORT_CLAIM_SCHEMA
  );
}
export function matchingReportAcknowledgement(
  value: unknown,
  binding: ClaimBinding,
): value is {
  id: string;
  status: "pending";
  mode: "local";
  claimBinding: ClaimBinding;
} {
  return (
    record(value) &&
    isReportId(value.id) &&
    value.status === "pending" &&
    value.mode === "local" &&
    value.submissionProtocol === REPORT_SUBMISSION_PROTOCOL &&
    isClaimBinding(value.claimBinding) &&
    value.claimBinding.digest === binding.digest
  );
}

export function serializeBoundIssueReport(report: BoundIssueReport): string {
  const serialized = JSON.stringify(report, null, 2);
  if (new TextEncoder().encode(serialized).byteLength > MAX_STORED_REPORT_BYTES)
    throw new ReportBindingError(
      413,
      "The complete claim is too large for the local queue. Your description is still here; save a device draft for review.",
    );
  return serialized;
}

/** Clone once; matching and persistence must refer to this same authoritative snapshot. */
export async function prepareBoundIssueReport(
  input: unknown,
  dependencies: {
    resolveClaim: (
      variantId: string,
      factKey: string,
    ) => { fact: Fact; vehicleLabel: string } | undefined;
    now: () => string;
    id: () => string;
    digest: ClaimDigest;
  },
): Promise<BoundIssueReport> {
  if (
    !record(input) ||
    !text(input.variantId) ||
    input.variantId.length > 1024 ||
    !text(input.factKey) ||
    input.factKey.length > 1024 ||
    typeof input.description !== "string"
  )
    throw new ReportBindingError(
      400,
      "Unknown trim or claim, or invalid description.",
    );
  if (!isClaimBinding(input.claimBinding))
    throw new ReportBindingError(
      428,
      "This report needs the current claim-verification protocol. Reload the paired preview and service; your description has not been submitted.",
    );
  const variantId = input.variantId,
    factKey = input.factKey,
    description = input.description;
  const submittedBinding = { ...input.claimBinding };
  const resolved = dependencies.resolveClaim(variantId, factKey);
  if (
    !resolved ||
    !validReportFact(resolved.fact) ||
    resolved.fact.key !== factKey ||
    !text(resolved.vehicleLabel)
  )
    throw new ReportBindingError(400, "Unknown trim or claim.");
  const observedClaim = structuredClone(resolved.fact),
    vehicleLabel = resolved.vehicleLabel;
  // Validate description before hashing or allocating an ID. This draft is never persisted.
  try {
    makeIssueDraft(
      variantId,
      observedClaim,
      description,
      "validate",
      "validate",
    );
  } catch (error) {
    throw new ReportBindingError(
      400,
      error instanceof Error ? error.message : "Invalid report description.",
    );
  }
  const claimBinding = await createClaimBinding(
    variantId,
    observedClaim,
    dependencies.digest,
  );
  if (claimBinding.digest !== submittedBinding.digest)
    throw new ReportBindingError(
      409,
      "This claim differs from the version shown when you reported it. Your description is still here. Reload and review the exact claim before submitting again.",
    );
  const now = dependencies.now(),
    id = dependencies.id();
  if (
    !isReportId(id) ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(now) ||
    !Number.isFinite(Date.parse(now)) ||
    new Date(now).toISOString() !== now
  )
    throw new Error("Invalid server report identity or timestamp.");
  const report: BoundIssueReport = {
    ...makeIssueDraft(variantId, observedClaim, description, now, id),
    submissionProtocol: REPORT_SUBMISSION_PROTOCOL,
    claimBinding,
    observedClaim,
    bindingState: "matched_service_snapshot",
    vehicleLabel,
  };
  serializeBoundIssueReport(report);
  return report;
}
