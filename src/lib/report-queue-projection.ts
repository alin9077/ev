import { validReportFact } from "./report-claim-shape";
import { boundReportFilename } from "./report-queue-files";
import type { Fact } from "./types";
import { makeIssueDraft, type IssueDraft } from "./corrections";
import { canonicalReviewedJson } from "./correction-guards";
import {
  createClaimBinding,
  isClaimBinding,
  REPORT_SUBMISSION_PROTOCOL,
  type ClaimBinding,
  type ClaimDigest,
} from "./report-claim-binding";

export const REPORT_LIST_PROTOCOL = "roadmark-report-list-v2";
export const REPORT_LIST_CONTENT_TYPE =
  "application/vnd.roadmark.report-list-v2+json";
export const MAX_REPORT_LIST_ENTRY_BYTES = 24000;
export type ReportListEntry = Omit<IssueDraft, "observedValue"> & {
  queueFile: string;
  vehicleLabel: string;
  claimLabel: string;
  observedValuePreview: string;
  fieldsTruncated: boolean;
  omittedSourceCount: number;
  bindingState:
    | "bound_snapshot"
    | "legacy_unbound"
    | "invalid_binding"
    | "verification_unavailable";
  labelProvenance: "recorded_snapshot" | "current_catalogue_or_identifier";
  claimBinding?: ClaimBinding;
};
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const string = (value: unknown): value is string => typeof value === "string";
const nonempty = (value: unknown): value is string =>
  string(value) && !!value.trim();
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && Array.from(value).every(string);
const own = (value: Record<string, unknown>, key: string) =>
  Object.hasOwn(value, key);
function isoDate(value: unknown): value is string {
  return (
    string(value) &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 19) === value.slice(0, 19)
  );
}
function baseDraft(value: unknown): value is IssueDraft {
  if (
    !object(value) ||
    !["id", "variantId", "factKey"].every(
      (key) => nonempty(value[key]) && (value[key] as string).length <= 1024,
    ) ||
    !string(value.description) ||
    value.description.trim().length < 10 ||
    !isoDate(value.createdAt) ||
    value.status !== "pending" ||
    !own(value, "observedValue") ||
    !strings(value.sourceIds)
  )
    return false;
  if (
    value.claimKind !== undefined &&
    (!string(value.claimKind) ||
      !["fact", "feature", "availability"].includes(value.claimKind))
  )
    return false;
  if (value.observedStatus !== undefined && !string(value.observedStatus))
    return false;
  if (
    value.observedConditions !== undefined &&
    !string(value.observedConditions)
  )
    return false;
  try {
    canonicalReviewedJson(value.observedValue);
  } catch {
    return false;
  }
  return true;
}

/** Read-only, bounded display projection; never upgrades or rewrites old queue data. */
export async function projectStoredIssueReport(
  raw: unknown,
  context: {
    fileKind: "legacy" | "bound-v2";
    filename: string;
    vehicleLabel?: string;
    claimLabel?: string;
    digest: ClaimDigest;
  },
): Promise<ReportListEntry | undefined> {
  if (!baseDraft(raw)) return undefined;
  let entry: IssueDraft & Record<string, unknown>;
  try {
    entry = structuredClone(raw) as IssueDraft & Record<string, unknown>;
  } catch {
    return undefined;
  }
  let bindingState: ReportListEntry["bindingState"] = "legacy_unbound";
  let binding: ClaimBinding | undefined;
  const hasNewMarkers = [
    "submissionProtocol",
    "claimBinding",
    "observedClaim",
    "bindingState",
  ].some((key) => own(entry, key));
  if (context.fileKind === "bound-v2" || hasNewMarkers) {
    bindingState = "invalid_binding";
    let digestFailed = false;
    try {
      if (
        context.fileKind === "bound-v2" &&
        context.filename === boundReportFilename(entry.id) &&
        entry.submissionProtocol === REPORT_SUBMISSION_PROTOCOL &&
        entry.bindingState === "matched_service_snapshot" &&
        isClaimBinding(entry.claimBinding) &&
        validReportFact(entry.observedClaim) &&
        entry.observedClaim.key === entry.factKey &&
        nonempty(entry.vehicleLabel)
      ) {
        const captured = structuredClone(entry.observedClaim);
        const checked = await createClaimBinding(
          entry.variantId,
          captured,
          async (canonical) => {
            try {
              return await context.digest(canonical);
            } catch (error) {
              digestFailed = true;
              throw error;
            }
          },
        );
        const expected = makeIssueDraft(
          entry.variantId,
          captured,
          entry.description,
          entry.createdAt,
          entry.id,
        );
        const actual = Object.fromEntries(
          Object.keys(expected).map((key) => [key, entry[key]]),
        );
        if (
          checked.digest === entry.claimBinding.digest &&
          canonicalReviewedJson(expected) === canonicalReviewedJson(actual)
        ) {
          bindingState = "bound_snapshot";
          binding = { ...entry.claimBinding };
        }
      }
    } catch {
      if (digestFailed) bindingState = "verification_unavailable";
      // Malformed records remain distinct from hashing infrastructure failures.
    }
  }
  let fieldsTruncated = false;
  const clip = (value: string, limit: number) => {
    if (value.length <= limit) return value;
    fieldsTruncated = true;
    return value.slice(0, limit) + "…";
  };
  const recordedClaim =
    bindingState === "bound_snapshot"
      ? (entry.observedClaim as Fact)
      : undefined;
  const rawValue =
    entry.observedValue === null
      ? "Unknown"
      : typeof entry.observedValue === "string"
        ? entry.observedValue
        : canonicalReviewedJson(entry.observedValue);
  const sourceIds = entry.sourceIds
    .filter((id) => id.length <= 1024)
    .slice(0, 30);
  const omittedSourceCount = entry.sourceIds.length - sourceIds.length;
  if (omittedSourceCount) fieldsTruncated = true;
  const result: ReportListEntry = {
    queueFile: context.filename,
    id: entry.id,
    variantId: entry.variantId,
    factKey: entry.factKey,
    description: clip(entry.description, 2000),
    createdAt: entry.createdAt,
    status: "pending",
    claimKind: entry.claimKind,
    observedStatus:
      entry.observedStatus === undefined
        ? undefined
        : clip(entry.observedStatus, 100),
    observedConditions:
      entry.observedConditions === undefined
        ? undefined
        : clip(entry.observedConditions, 1200),
    sourceIds,
    vehicleLabel: clip(
      bindingState === "bound_snapshot"
        ? (entry.vehicleLabel as string)
        : context.vehicleLabel || entry.variantId,
      200,
    ),
    claimLabel: clip(
      recordedClaim?.label || context.claimLabel || entry.factKey,
      200,
    ),
    observedValuePreview: clip(rawValue, 1000),
    fieldsTruncated,
    omittedSourceCount,
    bindingState,
    labelProvenance:
      bindingState === "bound_snapshot"
        ? "recorded_snapshot"
        : "current_catalogue_or_identifier",
    ...(binding ? { claimBinding: binding } : {}),
  };
  // JSON escaping can expand control characters; the byte cap is authoritative.
  if (
    new TextEncoder().encode(JSON.stringify(result)).byteLength >
    MAX_REPORT_LIST_ENTRY_BYTES
  ) {
    result.description = clip(result.description, 400);
    result.observedConditions = result.observedConditions?.slice(0, 300);
    result.observedValuePreview = result.observedValuePreview.slice(0, 300);
    result.sourceIds = result.sourceIds.slice(0, 5);
    result.omittedSourceCount =
      entry.sourceIds.length - result.sourceIds.length;
    result.fieldsTruncated = true;
  }
  if (
    new TextEncoder().encode(JSON.stringify(result)).byteLength >
    MAX_REPORT_LIST_ENTRY_BYTES
  )
    return undefined;
  return result;
}
