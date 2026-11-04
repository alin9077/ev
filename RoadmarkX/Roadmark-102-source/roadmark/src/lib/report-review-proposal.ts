/** RESEARCH CANDIDATE ONLY: pure local proposal primitives; no runtime adapter. */
import { canonicalReviewedJson } from "./correction-guards";
import type { Correction } from "./corrections";
import type { FeatureCorrection } from "./feature-corrections";
import type { AvailabilityCorrection } from "./availability-corrections";
import {
  isClaimBinding,
  MAX_STORED_REPORT_BYTES,
  type ClaimBinding,
  type ClaimDigest,
} from "./report-claim-binding";
import { boundReportFilename, isReportId, reportFileKind } from "./report-queue-files";
import { projectStoredIssueReport } from "./report-queue-projection";
import { validReportFact } from "./report-claim-shape";

export const REPORT_REVIEW_PROPOSAL_SCHEMA = "roadmark-local-review-proposal-v1" as const;
export const REPORT_REVIEW_PROVENANCE = "local_manual_unverified" as const;
export const MAX_REVIEW_PROPOSALS = 1000;
export const MAX_REVIEW_CONTEXT_BYTES = 8 * 1024 * 1024;
export const MAX_REVIEW_EVENT_BYTES = 600000;
export const MAX_CORRECTION_SNAPSHOT_BYTES = 512000;
export const MAX_PROJECTED_REVIEW_EVENTS = 100;
export const MAX_REVIEW_PROJECTION_BYTES = 2 * 1024 * 1024;
export const REVIEW_AUTHORITY_NOTICE =
  "Local review notes are unverified attributions. They do not authenticate a reviewer, approve changes or confirm publication." as const;

export type CorrectionKind = "fact" | "feature" | "availability";
export type CorrectionReference = Readonly<{ kind: CorrectionKind; id: string }>;
export type ReportReviewTarget = Readonly<{
  id: string;
  queueFile: string;
  variantId: string;
  factKey: string;
  claimKind: CorrectionKind;
  claimBinding: Readonly<ClaimBinding>;
}>;
export type CorrectionLink = CorrectionReference & Readonly<{
  /** Complete canonical row, including every defined unknown JSON field. */
  snapshotCanonical: string;
}>;
type ProposalBase = Readonly<{
  schema: typeof REPORT_REVIEW_PROPOSAL_SCHEMA;
  id: string;
  report: ReportReviewTarget;
  supersedes?: string;
  recordedAt: string;
  /** Self-declared text; never an authenticated identity. */
  recordedByLabel: string;
  reason: string;
  provenance: typeof REPORT_REVIEW_PROVENANCE;
}>;
export type ReportReviewProposal = ProposalBase & (
  | Readonly<{ proposal: "needs_evidence" | "no_change_proposed"; correction?: never }>
  | Readonly<{ proposal: "correction_link_proposed"; correction: CorrectionLink }>
);
export type CorrectionRegistries = Readonly<{
  fact: readonly Correction[];
  feature: readonly FeatureCorrection[];
  availability: readonly AvailabilityCorrection[];
}>;
export type ReportReviewContext = Readonly<{
  /** Full raw records, not truncated list entries; may be a partial supplied context. */
  reports: readonly Readonly<{ queueFile: string; report: unknown }>[];
  corrections: CorrectionRegistries;
  digest: ClaimDigest;
  asOf: string;
}>;
export type ReportDiagnostic =
  | "bound_snapshot" | "report_not_in_supplied_context" | "ambiguous_report"
  | "legacy_unbound" | "invalid_binding" | "verification_unavailable" | "report_reference_mismatch";
export type CorrectionDiagnostic =
  | "not_linked" | "exact_match" | "correction_not_in_supplied_context"
  | "ambiguous_correction" | "correction_entry_changed" | "correction_target_mismatch";
export type CapturedReportReference =
  | Readonly<{ state: "bound_snapshot"; reference: ReportReviewTarget; createdAt: string }>
  | Readonly<{ state: Exclude<ReportDiagnostic, "bound_snapshot"> }>;
export type ReportReviewProjectionEntry = Readonly<{
  id: string;
  report: ReportReviewTarget;
  reportStatus: "pending";
  proposal: ReportReviewProposal["proposal"];
  provenance: typeof REPORT_REVIEW_PROVENANCE;
  recordedAt: string;
  recordedByLabel: string;
  attributionVerified: false;
  reason: string;
  fieldsTruncated: boolean;
  reportDiagnostic: ReportDiagnostic;
  correctionDiagnostic: CorrectionDiagnostic;
  correctionReference?: CorrectionReference;
  label: string;
}>;
export type ReportReviewProjection = Readonly<{
  state: "valid" | "invalid_context";
  authorityNotice: typeof REVIEW_AUTHORITY_NOTICE;
  events: readonly ReportReviewProjectionEntry[];
  latest: readonly ReportReviewProjectionEntry[];
  totalEvents: number | null;
  omittedEventCount: number | null;
  totalReports: number | null;
  omittedReportCount: number | null;
  truncated: boolean;
  /** Counted once per returned event ID, not the entire unsupplied queue. */
  evaluatedEventCount: number | null;
  invalidContextCount: number;
  emptyLabel?: "No local review proposal recorded";
}>;
export class ReportReviewProposalError extends Error {
  constructor(public readonly code: string) {
    super(`Invalid local report-review proposal: ${code}`);
    this.name = "ReportReviewProposalError";
  }
}
const fail = (code: string): never => { throw new ReportReviewProposalError(code); };
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 1024): v is string =>
  typeof v === "string" && !!v.trim() && v.length <= max;
const bytes = (v: string) => new TextEncoder().encode(v).byteLength;
const keys = (v: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []) =>
  required.every((key) => Object.hasOwn(v, key)) &&
  Object.keys(v).every((key) => required.includes(key) || optional.includes(key));
function iso(value: unknown): value is string {
  return typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
/** Resource preflight only; canonicalReviewedJson remains the equality protocol. */
function canonical(value: unknown): string {
  let nodes = 0, stringBytes = 0;
  const parents = new Set<object>();
  const visit = (part: unknown, depth: number): void => {
    if (++nodes > 100000 || depth > 64) fail("json_complexity_limit");
    if (typeof part === "string") stringBytes += bytes(part);
    if (stringBytes > MAX_REVIEW_CONTEXT_BYTES) fail("context_too_large");
    if (!part || typeof part !== "object") return;
    if (parents.has(part)) fail("invalid_json");
    // The reused canonicalizer calls value.map. Reject inherited array behavior
    // before it can alter a captured history or execute a caller-owned method.
    const prototype = Object.getPrototypeOf(part);
    if (Array.isArray(part) ? prototype !== Array.prototype :
      ![Object.prototype, null].includes(prototype))
      fail("invalid_json");
    if (Object.getOwnPropertySymbols(part).length) fail("invalid_json");
    parents.add(part);
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(part))) {
      if (Array.isArray(part) && key === "length") continue;
      if (!descriptor.enumerable || !Object.hasOwn(descriptor, "value")) fail("invalid_json");
      stringBytes += bytes(key);
      visit(descriptor.value, depth + 1);
    }
    parents.delete(part);
  };
  visit(value, 0);
  try {
    const result = canonicalReviewedJson(value);
    if (bytes(result) > MAX_REVIEW_CONTEXT_BYTES) fail("context_too_large");
    return result;
  } catch (error) {
    if (error instanceof ReportReviewProposalError) throw error;
    return fail("invalid_json");
  }
}
function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function claimKind(key: string): CorrectionKind {
  return key.startsWith("feature:") ? "feature" : key.startsWith("availability:") ? "availability" : "fact";
}
function validTarget(value: unknown): value is ReportReviewTarget {
  return object(value) && keys(value, ["id", "queueFile", "variantId", "factKey", "claimKind", "claimBinding"]) &&
    isReportId(value.id) && value.queueFile === boundReportFilename(value.id) &&
    text(value.variantId) && text(value.factKey) && value.claimKind === claimKind(value.factKey) &&
    isClaimBinding(value.claimBinding);
}
function rowTarget(kind: CorrectionKind, row: Record<string, unknown>) {
  return kind === "feature" ? (text(row.criterion) ? `feature:${row.criterion}` : undefined)
    : kind === "availability" ? "availability:exact_version"
      : text(row.factKey) && claimKind(row.factKey) === "fact" ? row.factKey : undefined;
}
function rowMatchesTarget(kind: CorrectionKind, row: Record<string, unknown>, report: ReportReviewTarget) {
  return kind === report.claimKind && row.variantId === report.variantId && rowTarget(kind, row) === report.factKey;
}
function recognizedRow(row: unknown): row is Record<string, unknown> {
  return object(row) && text(row.id) && text(row.variantId) &&
    typeof row.status === "string" && ["pending", "approved", "rejected"].includes(row.status);
}
const semanticStatuses = new Set([
  "standard", "conditional", "not_verified", "subjective", "unavailable", "optional", "not_applicable",
]);
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((part) => typeof part === "string");
const optionalString = (row: Record<string, unknown>, key: string, nullable = false) =>
  !Object.hasOwn(row, key) || typeof row[key] === "string" || (nullable && row[key] === null);
const optionalStrings = (row: Record<string, unknown>, key: string) =>
  !Object.hasOwn(row, key) || strings(row[key]);
function featureShape(value: unknown): value is Record<string, unknown> {
  return object(value) && [
    "variant_id", "model_id", "criterion", "value", "conditions", "evidence_scope",
    "last_evidence_date", "reviewed_date", "verification_state",
  ].every((key) => typeof value[key] === "string") &&
    typeof value.status === "string" && semanticStatuses.has(value.status) && strings(value.source_ids) &&
    optionalString(value, "condition_label") && optionalStrings(value, "usability_notes") &&
    optionalString(value, "confirmation_needed");
}
function availabilitySnapshotShape(value: unknown): boolean {
  if (!object(value) || typeof value.availability !== "string" || !object(value.evidence)) return false;
  const evidence = value.evidence;
  return ["checkedAt", "orderStatus", "stockStatus"].every((key) => typeof evidence[key] === "string") &&
    strings(evidence.sourceIds) && optionalStrings(evidence, "qualifications") &&
    ["physicalStockVerified", "factoryOrderAcceptanceVerified"].every((key) =>
      !Object.hasOwn(evidence, key) || typeof evidence[key] === "boolean");
}
/** Envelope shape only; existing application guards still own evidence/approval semantics. */
function correctionShape(kind: CorrectionKind, row: Record<string, unknown>): boolean {
  if (!["reviewedBy", "reviewedAt", "evidenceDate", "reason"].every((key) => typeof row[key] === "string")) return false;
  if (!optionalString(row, "supersedes")) return false;
  if (!Object.hasOwn(row, "before") || !Object.hasOwn(row, "after")) return false;
  if (kind === "fact") return !!rowTarget(kind, row) && strings(row.sourceIds) &&
    ["basis", "comparisonBasis", "unit"].every((key) => typeof row[key] === "string") &&
    (!Object.hasOwn(row, "beforeFact") || validReportFact(row.beforeFact)) &&
    (!Object.hasOwn(row, "afterStatus") || (typeof row.afterStatus === "string" && semanticStatuses.has(row.afterStatus))) &&
    optionalStrings(row, "resolvedIssueIds") && optionalStrings(row, "qualifications") &&
    optionalString(row, "validUntil", true) && optionalString(row, "conditionExplanation", true);
  if (kind === "feature") {
    const patch = (value: unknown) => object(value) &&
      ["value", "conditions"].every((key) => typeof value[key] === "string") &&
      typeof value.status === "string" && semanticStatuses.has(value.status) && strings(value.source_ids);
    return text(row.criterion) && featureShape(row.beforeFeature) &&
      row.beforeFeature.variant_id === row.variantId && row.beforeFeature.criterion === row.criterion &&
      patch(row.before) && patch(row.after);
  }
  return availabilitySnapshotShape(row.before) && availabilitySnapshotShape(row.after);
}
function validProposal(value: unknown): value is ReportReviewProposal {
  if (!object(value)) return false;
  const required = ["schema", "id", "report", "recordedAt", "recordedByLabel", "reason", "provenance", "proposal"];
  if (value.proposal === "correction_link_proposed") required.push("correction");
  if (!keys(value, required, ["supersedes"]) || value.schema !== REPORT_REVIEW_PROPOSAL_SCHEMA ||
    !isReportId(value.id) || !validTarget(value.report) || value.id === value.report.id ||
    (Object.hasOwn(value, "supersedes") && !isReportId(value.supersedes)) ||
    !iso(value.recordedAt) || !text(value.recordedByLabel, 200) ||
    !text(value.reason, 2000) || value.reason.trim().length < 10 || value.provenance !== REPORT_REVIEW_PROVENANCE)
    return false;
  if (value.proposal === "needs_evidence" || value.proposal === "no_change_proposed") return true;
  const link = value.correction;
  if (value.proposal !== "correction_link_proposed" || !object(link) ||
    !keys(link, ["kind", "id", "snapshotCanonical"]) ||
    typeof link.kind !== "string" || !["fact", "feature", "availability"].includes(link.kind) || !text(link.id) ||
    typeof link.snapshotCanonical !== "string" || bytes(link.snapshotCanonical) > MAX_CORRECTION_SNAPSHOT_BYTES)
    return false;
  try {
    const snapshot: unknown = JSON.parse(link.snapshotCanonical);
    return recognizedRow(snapshot) && correctionShape(link.kind as CorrectionKind, snapshot) && snapshot.id === link.id &&
      rowMatchesTarget(link.kind as CorrectionKind, snapshot, value.report) &&
      canonical(snapshot) === link.snapshotCanonical;
  } catch { return false; }
}
/** Immutable chain checks do not require current correction or report availability. */
function structuralHistory(raw: unknown, asOf: string): ReportReviewProposal[] {
  if (!iso(asOf)) return fail("invalid_as_of");
  if (!Array.isArray(raw) || raw.length > MAX_REVIEW_PROPOSALS) return fail("invalid_history_length");
  const seen = new Set<string>(), last = new Map<string, ReportReviewProposal>();
  const relatedIdentities = new Set<string>();
  const result: ReportReviewProposal[] = [];
  for (const entry of raw) {
    if (!validProposal(entry)) return fail("invalid_proposal_shape");
    if (bytes(canonical(entry)) > MAX_REVIEW_EVENT_BYTES) return fail("event_too_large");
    if (seen.has(entry.id)) return fail("duplicate_proposal_id");
    seen.add(entry.id);
    relatedIdentities.add(entry.report.id);
    if (entry.proposal === "correction_link_proposed") relatedIdentities.add(entry.correction.id);
    const prior = last.get(entry.report.id);
    if (entry.supersedes !== prior?.id) return fail("not_immediate_same_report_predecessor");
    if (prior && canonical(entry.report) !== canonical(prior.report)) return fail("historic_report_reference_changed");
    if (entry.recordedAt > asOf || (prior && entry.recordedAt < prior.recordedAt)) return fail("invalid_proposal_chronology");
    last.set(entry.report.id, entry);
    result.push(entry);
  }
  if ([...seen].some((id) => relatedIdentities.has(id))) return fail("proposal_identity_collision");
  return result;
}
/** No declared bound_snapshot flag is trusted; full saved claim is rehashed. */
export async function captureReportReviewReference(
  raw: unknown,
  queueFile: string,
  digest: ClaimDigest,
): Promise<CapturedReportReference> {
  const snapshot = canonical(raw);
  if (bytes(snapshot) > MAX_STORED_REPORT_BYTES) return freeze({ state: "invalid_binding" as const });
  const kind = reportFileKind(queueFile);
  if (!kind || typeof digest !== "function") return freeze({ state: "invalid_binding" as const });
  const projection = await projectStoredIssueReport(JSON.parse(snapshot), { fileKind: kind, filename: queueFile, digest });
  if (!projection) return freeze({ state: "invalid_binding" as const });
  if (projection.bindingState !== "bound_snapshot") return freeze({ state: projection.bindingState });
  if (!isReportId(projection.id) || queueFile !== boundReportFilename(projection.id) ||
    !projection.claimBinding || projection.claimKind !== claimKind(projection.factKey))
    return freeze({ state: "invalid_binding" as const });
  return freeze({ state: "bound_snapshot" as const, createdAt: projection.createdAt, reference: {
    id: projection.id, queueFile, variantId: projection.variantId, factKey: projection.factKey,
    claimKind: claimKind(projection.factKey), claimBinding: projection.claimBinding,
  } });
}
type CapturedContext = { reports: ReportReviewContext["reports"]; corrections: CorrectionRegistries; asOf: string };
function captureContext(context: ReportReviewContext, other: unknown) {
  if (typeof context.digest !== "function") return fail("missing_digest");
  if (!Array.isArray(context.reports) || context.reports.length > 1000 || !object(context.corrections))
    return fail("invalid_context");
  for (const kind of ["fact", "feature", "availability"] as const)
    if (!Array.isArray(context.corrections[kind]) || context.corrections[kind].length > 5000)
      return fail("invalid_correction_context");
  const result = JSON.parse(canonical({ other, reports: context.reports, corrections: context.corrections, asOf: context.asOf })) as
    CapturedContext & { other: unknown };
  if (!iso(result.asOf) || !Array.isArray(result.reports) || result.reports.length > 1000 ||
    !object(result.corrections) || !keys(result.corrections, ["fact", "feature", "availability"]))
    return fail("invalid_context");
  for (const kind of ["fact", "feature", "availability"] as const) {
    const rows = result.corrections[kind];
    if (!Array.isArray(rows) || rows.length > 5000 ||
      !rows.every((row) => recognizedRow(row) && correctionShape(kind, row))) return fail("invalid_correction_context");
  }
  for (const file of result.reports)
    if (!object(file) || !keys(file, ["queueFile", "report"]) || typeof file.queueFile !== "string")
      return fail("invalid_report_context");
  return result;
}
async function currentReport(report: ReportReviewTarget, context: CapturedContext, digest: ClaimDigest): Promise<CapturedReportReference> {
  const matches = context.reports.filter((file) => file.queueFile === report.queueFile ||
    (object(file.report) && file.report.id === report.id));
  if (!matches.length) return { state: "report_not_in_supplied_context" };
  if (matches.length !== 1) return { state: "ambiguous_report" };
  const match = await captureReportReviewReference(matches[0].report, matches[0].queueFile, digest);
  if (match.state === "bound_snapshot" && canonical(match.reference) !== canonical(report))
    return { state: "report_reference_mismatch" };
  return match;
}
function currentCorrection(entry: ReportReviewProposal, context: CapturedContext): { diagnostic: CorrectionDiagnostic; status?: string } {
  if (entry.proposal !== "correction_link_proposed") return { diagnostic: "not_linked" };
  const link = entry.correction;
  const matches = context.corrections[link.kind].filter((row) => row.id === link.id);
  if (!matches.length) return { diagnostic: "correction_not_in_supplied_context" };
  if (matches.length !== 1) return { diagnostic: "ambiguous_correction" };
  const row = matches[0] as unknown as Record<string, unknown>;
  if (!rowMatchesTarget(link.kind, row, entry.report)) return { diagnostic: "correction_target_mismatch" };
  if (canonical(row) !== link.snapshotCanonical) return { diagnostic: "correction_entry_changed" };
  return { diagnostic: "exact_match", status: row.status as string };
}
function assertUnambiguousAppendContext(context: CapturedContext) {
  const files = new Set<string>(), ids = new Set<string>();
  for (const file of context.reports) {
    const id = object(file.report) ? file.report.id : undefined;
    if (files.has(file.queueFile) || (typeof id === "string" && ids.has(id))) fail("ambiguous_report");
    files.add(file.queueFile);
    if (typeof id === "string") ids.add(id);
  }
  for (const kind of ["fact", "feature", "availability"] as const) {
    const correctionIds = new Set<string>();
    for (const row of context.corrections[kind]) {
      if (correctionIds.has(row.id)) fail("ambiguous_correction");
      correctionIds.add(row.id);
    }
  }
}
/** Validate a complete candidate in memory; never write or apply it. */
export async function validateReportReviewProposalAppend(
  previous: unknown,
  candidate: unknown,
  context: ReportReviewContext,
): Promise<readonly ReportReviewProposal[]> {
  // Capture function and every data input before any digest can await or mutate a caller.
  const digest = context.digest;
  if (!Array.isArray(previous) || !Array.isArray(candidate) ||
    previous.length > MAX_REVIEW_PROPOSALS || candidate.length > MAX_REVIEW_PROPOSALS)
    return fail("invalid_history_length");
  const copy = captureContext(context, { previous, candidate });
  const history = copy.other as { previous: unknown[]; candidate: unknown[] };
  const entries = structuralHistory(history.candidate, copy.asOf);
  if (entries.length < history.previous.length) return fail("history_truncated");
  for (let i = 0; i < history.previous.length; i++)
    if (canonical(history.previous[i]) !== canonical(entries[i])) return fail("history_prefix_changed");
  if (entries.length > history.previous.length) assertUnambiguousAppendContext(copy);
  // Historical entry snapshots are immutable evidence of what was linked THEN.
  // Only newly appended events must match the currently supplied context.
  const reportCache = new Map<string, CapturedReportReference>();
  const suppliedIdentities = new Set<string>();
  for (const file of copy.reports)
    if (object(file.report) && typeof file.report.id === "string") suppliedIdentities.add(file.report.id);
  for (const kind of ["fact", "feature", "availability"] as const)
    for (const row of copy.corrections[kind]) suppliedIdentities.add(row.id);
  for (const entry of entries.slice(history.previous.length)) {
    if (suppliedIdentities.has(entry.id)) return fail("proposal_identity_collision");
    let report = reportCache.get(entry.report.id);
    if (!report) {
      report = await currentReport(entry.report, copy, digest);
      reportCache.set(entry.report.id, report);
    }
    if (report.state !== "bound_snapshot") return fail(report.state);
    if (Date.parse(entry.recordedAt) < Date.parse(report.createdAt)) return fail("proposal_precedes_report");
    const correction = currentCorrection(entry, copy);
    if (!["not_linked", "exact_match"].includes(correction.diagnostic)) return fail(correction.diagnostic);
  }
  return freeze(entries);
}
function label(entry: ReportReviewProposal, report: ReportDiagnostic, correction: ReturnType<typeof currentCorrection>) {
  if (report !== "bound_snapshot") return "This proposal cannot be matched to a verified report in the supplied context";
  if (entry.proposal === "needs_evidence") return "More evidence proposed; report remains pending";
  if (entry.proposal === "no_change_proposed") return "No change proposed locally; report remains pending";
  if (correction.diagnostic === "correction_entry_changed") return "Referenced correction has changed; review the proposed link again";
  if (correction.diagnostic !== "exact_match") return "The proposed correction link cannot be verified in the supplied context";
  return correction.status === "approved" ? "Linked approved register entry; publication not verified"
    : correction.status === "rejected" ? "Linked rejected register entry; report remains pending"
      : "Linked pending correction proposal; no facts changed by this note";
}
/** Structural failure returns a visible invalid context, never an older apparent success. */
export async function projectReportReviewProposals(
  history: unknown,
  context: ReportReviewContext,
): Promise<ReportReviewProjection> {
  const invalid = (): ReportReviewProjection => freeze({
    state: "invalid_context", authorityNotice: REVIEW_AUTHORITY_NOTICE, events: [], latest: [],
    totalEvents: null, omittedEventCount: null, totalReports: null, omittedReportCount: null,
    truncated: false, evaluatedEventCount: null, invalidContextCount: 1,
  });
  try {
    if (!Array.isArray(history) || history.length > MAX_REVIEW_PROPOSALS) return invalid();
    const digest = context.digest;
    const copy = captureContext(context, history);
    const entries = structuralHistory(copy.other, copy.asOf);
    const latest = new Map<string, ReportReviewProposal>();
    entries.forEach((entry) => latest.set(entry.report.id, entry));
    const selectedHistory = entries.slice(-MAX_PROJECTED_REVIEW_EVENTS);
    const selectedLatest = [...latest.values()].slice(-MAX_PROJECTED_REVIEW_EVENTS);
    const selected = new Map([...selectedHistory, ...selectedLatest].map((entry) => [entry.id, entry]));
    const projected = new Map<string, ReportReviewProjectionEntry>();
    const reportCache = new Map<string, CapturedReportReference>();
    for (const entry of selected.values()) {
      let report = reportCache.get(entry.report.id);
      if (!report) {
        report = await currentReport(entry.report, copy, digest);
        reportCache.set(entry.report.id, report);
      }
      // A structurally valid historical event can still have unverifiable current context.
      const reportState = report.state === "bound_snapshot" && Date.parse(entry.recordedAt) < Date.parse(report.createdAt)
        ? "report_reference_mismatch" : report.state;
      const correction = currentCorrection(entry, copy);
      projected.set(entry.id, {
        id: entry.id, report: entry.report, reportStatus: "pending", proposal: entry.proposal,
        provenance: REPORT_REVIEW_PROVENANCE, recordedAt: entry.recordedAt,
        recordedByLabel: entry.recordedByLabel.slice(0, 80), attributionVerified: false,
        reason: entry.reason.slice(0, 400), fieldsTruncated: entry.recordedByLabel.length > 80 || entry.reason.length > 400,
        reportDiagnostic: reportState, correctionDiagnostic: correction.diagnostic,
        ...(entry.proposal === "correction_link_proposed" ? { correctionReference: { kind: entry.correction.kind, id: entry.correction.id } } : {}),
        label: label(entry, reportState, correction),
      });
    }
    const output: ReportReviewProjection = {
      state: "valid", authorityNotice: REVIEW_AUTHORITY_NOTICE,
      events: selectedHistory.map((entry) => projected.get(entry.id)!),
      latest: selectedLatest.map((entry) => projected.get(entry.id)!),
      totalEvents: entries.length, omittedEventCount: entries.length - selectedHistory.length,
      totalReports: latest.size, omittedReportCount: latest.size - selectedLatest.length,
      truncated: entries.length > selectedHistory.length || latest.size > selectedLatest.length ||
        [...projected.values()].some((entry) => entry.fieldsTruncated),
      evaluatedEventCount: projected.size,
      invalidContextCount: [...projected.values()].filter((entry) => entry.reportDiagnostic !== "bound_snapshot" ||
        !["not_linked", "exact_match"].includes(entry.correctionDiagnostic)).length,
      ...(entries.length === 0 ? { emptyLabel: "No local review proposal recorded" as const } : {}),
    };
    if (bytes(canonical(output)) > MAX_REVIEW_PROJECTION_BYTES) return invalid();
    return freeze(output);
  } catch { return invalid(); }
}
