/** Local, unsaved proposal preview only. No runtime application wiring. */
import { canonicalReviewedJson } from "./correction-guards";
import type { ClaimDigest } from "./report-claim-binding";
import { boundReportFilename, isReportId } from "./report-queue-files";
import {
  captureReportReviewReference,
  MAX_REVIEW_CONTEXT_BYTES,
  MAX_REVIEW_PROPOSALS,
  projectReportReviewProposals,
  REPORT_REVIEW_PROPOSAL_SCHEMA,
  REPORT_REVIEW_PROVENANCE,
  ReportReviewProposalError,
  REVIEW_AUTHORITY_NOTICE,
  validateReportReviewProposalAppend,
  type ReportReviewContext,
  type ReportReviewProjectionEntry,
  type ReportReviewProposal,
} from "./report-review-proposal";

export const MAX_PREVIEW_REQUEST_BYTES = 24000;
export const MAX_PREVIEW_OUTPUT_BYTES = 64000;
export const PREVIEW_REQUEST_SCHEMA = "roadmark-local-review-request-v1" as const;
export type PreviewRequest = Readonly<{
  schema: typeof PREVIEW_REQUEST_SCHEMA;
  reportId: string;
  proposal: "needs_evidence" | "no_change_proposed";
  recordedByLabel: string;
  reason: string;
  expectedPreviousProposalId: string | null;
}>;
export type DryRunResult = Readonly<{
  schema: "roadmark-local-review-dry-run-v1";
  mode: "dry_run";
  saved: false;
  authorityNotice: typeof REVIEW_AUTHORITY_NOTICE;
  contextCoverage: Readonly<{
    reports: "one_explicit_report";
    corrections: "not_supplied";
    history: "supplied_snapshot_only";
  }>;
  priorEventCount: number;
  priorHistoryCanonicalSha256: string;
  candidateHistoryCanonicalSha256: string;
  proposal: ReportReviewProposal;
  preview: ReportReviewProjectionEntry;
}>;
export type PreviewErrorCode =
  | "invalid_arguments" | "invalid_request" | "request_too_large"
  | "invalid_json" | "invalid_utf8" | "context_too_large"
  | "invalid_history" | "history_full" | "report_unverified"
  | "predecessor_mismatch" | "invalid_proposal" | "invalid_projection"
  | "verification_unavailable" | "output_too_large" | "output_failed"
  | "protection_unavailable" | "file_unreadable" | "file_not_regular"
  | "file_too_large" | "file_changed" | "input_failed" | "preview_failed";
export class ReportPreviewError extends Error {
  constructor(public readonly code: PreviewErrorCode) {
    super(code);
    this.name = "ReportPreviewError";
  }
}
export const previewFail = (code: PreviewErrorCode): never => {
  throw new ReportPreviewError(code);
};
const bytes = (value: string) => new TextEncoder().encode(value).byteLength;
function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
/** Detach plain JSON without invoking getters or caller-supplied toJSON/map methods. */
function snapshotJson(value: unknown): unknown {
  let nodes = 0, size = 0;
  const parents = new Set<object>();
  const copy = (part: unknown, depth: number): unknown => {
    if (++nodes > 100000 || depth > 64) return previewFail("invalid_json");
    if (typeof part === "string") {
      size += bytes(part);
      if (size > MAX_REVIEW_CONTEXT_BYTES) return previewFail("context_too_large");
      return part;
    }
    if (part === null || typeof part === "boolean") return part;
    if (typeof part === "number" && Number.isFinite(part)) return part;
    if (!part || typeof part !== "object" || parents.has(part)) return previewFail("invalid_json");
    const array = Array.isArray(part), prototype = Object.getPrototypeOf(part);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype))
      return previewFail("invalid_json");
    if (Object.getOwnPropertySymbols(part).length) return previewFail("invalid_json");
    const descriptors = Object.getOwnPropertyDescriptors(part);
    const entries = Object.entries(descriptors).filter(([key]) => !array || key !== "length");
    if (array && (entries.length !== part.length ||
      entries.some(([key], index) => key !== String(index)))) return previewFail("invalid_json");
    parents.add(part);
    const copied = entries.map(([key, descriptor]) => {
      if (!descriptor.enumerable || !Object.hasOwn(descriptor, "value")) return previewFail("invalid_json");
      size += bytes(key);
      if (size > MAX_REVIEW_CONTEXT_BYTES) return previewFail("context_too_large");
      return [key, copy(descriptor.value, depth + 1)] as const;
    });
    parents.delete(part);
    return array ? copied.map(([, item]) => item) : Object.fromEntries(copied);
  };
  const result = copy(value, 0);
  if (bytes(canonicalReviewedJson(result)) > MAX_REVIEW_CONTEXT_BYTES)
    return previewFail("context_too_large");
  return result;
}
export function parsePreviewRequest(value: unknown): PreviewRequest {
  const raw = snapshotJson(value);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return previewFail("invalid_request");
  const input = raw as Record<string, unknown>;
  const expected = ["schema", "reportId", "proposal", "recordedByLabel", "reason", "expectedPreviousProposalId"];
  if (Object.keys(input).length !== expected.length || expected.some((key) => !Object.hasOwn(input, key)) ||
    input.schema !== PREVIEW_REQUEST_SCHEMA || !isReportId(input.reportId) ||
    !["needs_evidence", "no_change_proposed"].includes(input.proposal as string) ||
    typeof input.recordedByLabel !== "string" || !input.recordedByLabel.trim() || input.recordedByLabel.length > 200 ||
    typeof input.reason !== "string" || input.reason.trim().length < 10 || input.reason.length > 2000 ||
    !(input.expectedPreviousProposalId === null || isReportId(input.expectedPreviousProposalId)))
    return previewFail("invalid_request");
  if (bytes(JSON.stringify(input)) > MAX_PREVIEW_REQUEST_BYTES) return previewFail("request_too_large");
  return freeze(input as PreviewRequest);
}
/** Flat request grammar also rejects duplicate (including escaped-equivalent) keys. */
export function parsePreviewRequestJson(source: string): PreviewRequest {
  if (bytes(source) > MAX_PREVIEW_REQUEST_BYTES) return previewFail("request_too_large");
  let at = 0;
  const whitespace = () => { while (at < source.length && /[\x20\t\r\n]/.test(source[at])) at++; };
  const token = /"(?:[^"\\\u0000-\u001f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"/y;
  const string = (): string => {
    token.lastIndex = at;
    const match = token.exec(source);
    if (!match) return previewFail("invalid_request");
    at = token.lastIndex;
    return JSON.parse(match[0]) as string;
  };
  whitespace();
  if (source[at++] !== "{") return previewFail("invalid_request");
  whitespace();
  const entries: [string, string | null][] = [], seen = new Set<string>();
  if (source[at] !== "}") {
    while (true) {
      const key = string();
      if (seen.has(key)) return previewFail("invalid_request");
      seen.add(key); whitespace();
      if (source[at++] !== ":") return previewFail("invalid_request");
      whitespace();
      let value: string | null;
      if (source.startsWith("null", at)) { value = null; at += 4; }
      else value = string();
      entries.push([key, value]); whitespace();
      if (source[at] !== ",") break;
      at++; whitespace();
    }
  }
  if (source[at++] !== "}") return previewFail("invalid_request");
  whitespace();
  if (at !== source.length) return previewFail("invalid_request");
  return parsePreviewRequest(Object.fromEntries(entries));
}
function modelFailure(error: unknown, fallback: PreviewErrorCode): never {
  if (error instanceof ReportReviewProposalError && error.code === "context_too_large")
    return previewFail("context_too_large");
  return previewFail(fallback);
}
export async function previewReportReview(
  input: { request: unknown; rawReport: unknown; history: unknown },
  dependencies: { digest: ClaimDigest; now: () => string; id: () => string },
): Promise<DryRunResult> {
  const { digest, now, id } = dependencies;
  // Snapshot all caller-owned data before clock, ID or async digest callbacks.
  const request = parsePreviewRequest(input.request);
  const report = snapshotJson(input.rawReport), history = snapshotJson(input.history);
  if (!Array.isArray(history)) return previewFail("invalid_history");
  if (history.length >= MAX_REVIEW_PROPOSALS) return previewFail("history_full");
  const asOf = now(), queueFile = boundReportFilename(request.reportId);
  const context: ReportReviewContext = {
    reports: [{ queueFile, report }], corrections: { fact: [], feature: [], availability: [] }, digest, asOf,
  };
  let previous: readonly ReportReviewProposal[];
  try { previous = await validateReportReviewProposalAppend(history, history, context); }
  catch (error) { return modelFailure(error, "invalid_history"); }
  let reference;
  try { reference = await captureReportReviewReference(report, queueFile, digest); }
  catch (error) { return modelFailure(error, "report_unverified"); }
  if (reference.state !== "bound_snapshot")
    return previewFail(reference.state === "verification_unavailable" ? "verification_unavailable" : "report_unverified");
  const predecessor = previous.filter((event) => event.report.id === request.reportId).at(-1);
  if (request.expectedPreviousProposalId !== (predecessor?.id ?? null)) return previewFail("predecessor_mismatch");
  const event: ReportReviewProposal = {
    schema: REPORT_REVIEW_PROPOSAL_SCHEMA, id: id(), report: reference.reference,
    recordedAt: asOf, recordedByLabel: request.recordedByLabel, reason: request.reason,
    provenance: REPORT_REVIEW_PROVENANCE, proposal: request.proposal,
    ...(predecessor ? { supersedes: predecessor.id } : {}),
  };
  let candidate: readonly ReportReviewProposal[];
  try { candidate = await validateReportReviewProposalAppend(previous, [...previous, event], context); }
  catch (error) { return modelFailure(error, "invalid_proposal"); }
  const projection = await projectReportReviewProposals(candidate, context);
  const preview = projection.events.find((entry) => entry.id === event.id);
  if (projection.state !== "valid" || !preview || preview.reportDiagnostic !== "bound_snapshot" ||
    preview.correctionDiagnostic !== "not_linked" || preview.reportStatus !== "pending" ||
    preview.attributionVerified !== false || Object.hasOwn(preview, "correctionReference"))
    return previewFail("invalid_projection");
  const hash = async (value: unknown) => {
    let result: string;
    try { result = await digest(canonicalReviewedJson(value)); }
    catch { return previewFail("verification_unavailable"); }
    if (!/^[a-f0-9]{64}$/.test(result)) return previewFail("verification_unavailable");
    return result;
  };
  const result: DryRunResult = {
    schema: "roadmark-local-review-dry-run-v1", mode: "dry_run", saved: false,
    authorityNotice: REVIEW_AUTHORITY_NOTICE,
    contextCoverage: { reports: "one_explicit_report", corrections: "not_supplied", history: "supplied_snapshot_only" },
    priorEventCount: previous.length,
    priorHistoryCanonicalSha256: await hash(previous),
    candidateHistoryCanonicalSha256: await hash(candidate),
    proposal: candidate[candidate.length - 1], preview,
  };
  serializeDryRunResult(result);
  return freeze(result);
}
/** Serialize fully before the CLI makes its one stdout write; cap includes newline. */
export function serializeDryRunResult(result: DryRunResult): string {
  const serialized = JSON.stringify(result) + "\n";
  if (bytes(serialized) > MAX_PREVIEW_OUTPUT_BYTES) return previewFail("output_too_large");
  return serialized;
}
