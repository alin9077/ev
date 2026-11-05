import {
  projectStoredIssueReport,
  REPORT_LIST_PROTOCOL,
  type ReportListEntry,
} from "./report-queue-projection";
import { reportFileKind } from "./report-queue-files";
import {
  MAX_STORED_REPORT_BYTES,
  isClaimBinding,
  type ClaimDigest,
} from "./report-claim-binding";
export const MAX_REPORT_FILE_BYTES = MAX_STORED_REPORT_BYTES;
export const MAX_LOADED_REPORTS = 200;
export type ReportListEnvelope = {
  mode: "local";
  listProtocol: typeof REPORT_LIST_PROTOCOL;
  reports: ReportListEntry[];
  totalRecognizedFiles: number;
  loadedFiles: number;
  unreadableFiles: number;
  inaccessibleNames: number;
};
/** No filesystem or HTTP dependency: the adapter supplies regular-file metadata and bounded reads. */
export async function loadReportQueue(dependencies: {
  files: { name: string; mtime: number }[];
  read: (name: string) => Promise<string>;
  labels: (
    variantId: string,
    factKey: string,
  ) => { vehicleLabel?: string; claimLabel?: string };
  digest: ClaimDigest;
}): Promise<ReportListEnvelope> {
  const files = dependencies.files
    .filter((f) => reportFileKind(f.name) && Number.isFinite(f.mtime))
    .sort((a, b) => b.mtime - a.mtime || a.name.localeCompare(b.name));
  const reports: ReportListEntry[] = [];
  let unreadableFiles = 0;
  for (const file of files.slice(0, MAX_LOADED_REPORTS)) {
    try {
      const raw = await dependencies.read(file.name);
      if (new TextEncoder().encode(raw).byteLength > MAX_REPORT_FILE_BYTES)
        throw new Error("Oversized record");
      const value: unknown = JSON.parse(raw);
      const ids =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as Record<string, unknown>)
          : {};
      const labels =
        typeof ids.variantId === "string" && typeof ids.factKey === "string"
          ? dependencies.labels(ids.variantId, ids.factKey)
          : {};
      const projected = await projectStoredIssueReport(value, {
        fileKind: reportFileKind(file.name)!,
        filename: file.name,
        digest: dependencies.digest,
        ...labels,
      });
      if (!projected) throw new Error("Invalid record");
      reports.push(projected);
    } catch {
      unreadableFiles++;
    }
  }
  return {
    mode: "local",
    listProtocol: REPORT_LIST_PROTOCOL,
    reports: reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    totalRecognizedFiles: files.length,
    loadedFiles: Math.min(files.length, MAX_LOADED_REPORTS),
    unreadableFiles,
    inaccessibleNames: 0,
  };
}
export function isReportListEnvelope(
  value: unknown,
): value is ReportListEnvelope {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (
    v.mode !== "local" ||
    v.listProtocol !== REPORT_LIST_PROTOCOL ||
    !Array.isArray(v.reports) ||
    v.reports.length > MAX_LOADED_REPORTS ||
    ![
      "totalRecognizedFiles",
      "loadedFiles",
      "unreadableFiles",
      "inaccessibleNames",
    ].every((k) => Number.isSafeInteger(v[k]) && (v[k] as number) >= 0)
  )
    return false;
  if (
    (v.loadedFiles as number) > MAX_LOADED_REPORTS ||
    (v.loadedFiles as number) > (v.totalRecognizedFiles as number) ||
    (v.unreadableFiles as number) > (v.loadedFiles as number) ||
    v.reports.length + (v.unreadableFiles as number) !== v.loadedFiles
  )
    return false;
  if (new Set(v.reports.map((r) => r?.queueFile)).size !== v.reports.length)
    return false;
  return v.reports.every(
    (r) =>
      r &&
      typeof r === "object" &&
      [
        "queueFile",
        "id",
        "variantId",
        "factKey",
        "description",
        "createdAt",
        "vehicleLabel",
        "claimLabel",
        "observedValuePreview",
      ].every((k) => typeof r[k] === "string") &&
      !!reportFileKind(r.queueFile) &&
      r.status === "pending" &&
      (r.bindingState !== "bound_snapshot" ||
        (isClaimBinding(r.claimBinding) &&
          r.labelProvenance === "recorded_snapshot")) &&
      (r.bindingState === "bound_snapshot" ||
        (r.claimBinding === undefined &&
          r.labelProvenance === "current_catalogue_or_identifier")) &&
      [
        "bound_snapshot",
        "legacy_unbound",
        "invalid_binding",
        "verification_unavailable",
      ].includes(r.bindingState) &&
      ["recorded_snapshot", "current_catalogue_or_identifier"].includes(
        r.labelProvenance,
      ) &&
      typeof r.fieldsTruncated === "boolean" &&
      Number.isSafeInteger(r.omittedSourceCount) &&
      r.omittedSourceCount >= 0 &&
      Array.isArray(r.sourceIds) &&
      r.sourceIds.every((s: unknown) => typeof s === "string") &&
      (r.observedStatus === undefined ||
        typeof r.observedStatus === "string") &&
      (r.observedConditions === undefined ||
        typeof r.observedConditions === "string"),
  );
}
