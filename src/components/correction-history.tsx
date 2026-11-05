import { formatEvidenceValue } from "@/lib/compare";
import availabilityEdits from "../../data/approved-availability-corrections.json";
import type { AvailabilityCorrection } from "@/lib/availability-corrections";
import factEdits from "../../data/approved-corrections.json";
import equipmentEdits from "../../data/approved-feature-corrections.json";
import { correctionHistoryStatus, type Correction } from "@/lib/corrections";
import type { FeatureCorrection } from "@/lib/feature-corrections";
import Link from "next/link";
export function CorrectionHistory() {
  const entries = [
    ...(availabilityEdits as AvailabilityCorrection[])
      .filter((e) => e.status === "approved")
      .map((e) => ({
        ...e,
        key: "exact_version_availability",
        kind: "Availability",
        beforeText: `${e.before.availability}; orders: ${e.before.evidence.orderStatus}; stock: ${e.before.evidence.stockStatus}`,
        afterText: `${e.after.availability}; orders: ${e.after.evidence.orderStatus}; stock: ${e.after.evidence.stockStatus}`,
        sourceIds: e.after.evidence.sourceIds,
        restrictionText: null,
      })),
    ...(factEdits as Correction[])
      .filter((e) => e.status === "approved")
      .map((e) => ({
        ...e,
        key: e.factKey,
        kind: "Fact",
        beforeText: `${e.before === null ? "No recorded value" : formatEvidenceValue(e.before)} (${correctionHistoryStatus(e).before})`,
        afterText: `${e.after === null ? "No recorded value" : formatEvidenceValue(e.after)} (${correctionHistoryStatus(e).after})`,
        restrictionText: [
          e.qualifications !== undefined
            ? `Reviewed qualifications: ${e.qualifications.join("; ") || "none"}`
            : "Qualifications preserved",
          e.conditionExplanation !== undefined
            ? `Reviewed condition explanation: ${e.conditionExplanation ?? "cleared"}`
            : "Condition explanation preserved",
          e.validUntil !== undefined
            ? `Reviewed expiry: ${e.validUntil ?? "cleared"}`
            : "Expiry preserved",
        ].join(". "),
      })),
    ...(equipmentEdits as FeatureCorrection[])
      .filter((e) => e.status === "approved")
      .map((e) => ({
        ...e,
        key: e.criterion,
        kind: "Equipment",
        beforeText: `${e.before.value} (${e.before.status})`,
        afterText: `${e.after.value} (${e.after.status})`,
        sourceIds: e.after.source_ids,
        restrictionText: null,
      })),
  ].sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt));
  return (
    <section
      className="editorial-text"
      aria-label="Approved claim correction history"
    >
      <h2>Approved claim corrections</h2>
      <p>
        Reports never change claims automatically. Approved edits retain the
        exact version, previous value, replacement and dated evidence. Static
        copies need rebuilding after an approved change.
      </p>
      {entries.length ? (
        entries.map((e) => (
          <article key={e.id}>
            <h3>
              {e.kind}: {e.key.replaceAll("_", " ")}
            </h3>
            <p className="small muted" style={{ overflowWrap: "anywhere" }}>
              {e.variantId} · Reviewed {e.reviewedAt} · Evidence{" "}
              {e.evidenceDate}
            </p>
            <p>
              {e.beforeText} → {e.afterText}
            </p>
            <p>{e.reason}</p>
            {e.restrictionText && <p className="small">{e.restrictionText}</p>}
            <Link
              href={`/sources?ids=${encodeURIComponent(e.sourceIds.join(","))}`}
            >
              View supporting sources
            </Link>
            {e.supersedes && (
              <p className="small">Supersedes correction {e.supersedes}</p>
            )}
          </article>
        ))
      ) : (
        <p>
          No approved entries in the shared correction register yet. Earlier
          research-audit changes remain documented separately; pending reports
          are not corrections.
        </p>
      )}
    </section>
  );
}
