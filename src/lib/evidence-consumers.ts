/** Server/build evidence consumers; no catalogue construction or persistent derived cache. */
import { applyBrandTermFeatures, applyBrandFeatureUpdates } from "./brand-updates";
import { brandUpdatePackets } from "./brand-update-registry";
import { applyFeatureRegrading } from "./evidence-regrading";
import { configurationSourceIds } from "./configuration-evidence";
import refreshEdits from "../../data/research-refresh-2026-10-10.json";
import { refreshFeatures, type ResearchRefresh } from "./research-refresh";
import featureCorrections from "../../data/approved-feature-corrections.json";
import {
  applyFeatureCorrections,
  validateFeatureCorrectionRegistry,
  type FeatureCorrection,
} from "./feature-corrections";
import type { Research, Car, Feature, Pack, Variant } from "./types";
import { safeUrl } from "./config";
import refinement from "../../data/research-refinement-2026-10-06.json";
import usability from "../../data/research-usability-2026-10-06.json";
import completion from "../../data/research-completion-2026-10-07.json";
import editorial from "../../data/research-editorial-2026-10-07.json";
import buyer from "../../data/research-buyer-2026-10-07.json";
import { auditedFeature } from "./launch-evidence";

export type CatalogueSnapshot = { data: Research; cars: Car[] };
export type EvidenceConsumerDefaults = {
  sourceResearch: () => Research;
  research: () => Research;
  catalogue: () => Car[];
};

/** Rows added for buyer questions the supplied criteria did not cover. */
const buyerKeys = new Set(buyer.criteria.map((c) => c.key));
export const featureKey = (row: { variant_id: string; criterion: string }) =>
  `${row.variant_id}\0${row.criterion}`;
function firstFeatureIndex<T extends { variant_id: string; criterion: string }>(
  rows: T[],
) {
  const index = new Map<string, T>();
  for (const row of rows) {
    const key = featureKey(row);
    if (!index.has(key)) index.set(key, row);
  }
  return index;
}
// Imported overlays are immutable build inputs. Preserve the previous first-match
// behavior and completion > usability > refinement precedence without repeated scans.
const completionFeatures = firstFeatureIndex(completion.features);
const usabilityFeatures = firstFeatureIndex(usability.features);
const refinementFeatures = firstFeatureIndex(refinement.features);
const editorialFeatures = firstFeatureIndex(editorial.features);

export function applies(
  issueId: string,
  key: string,
  v: Pick<Variant, "id" | "record_state">,
) {
  const map: Record<string, string[]> = {
    "V2-01": ["safety_ancap"],
    "V2-02": ["zero_to_100_s"],
    "V2-03": ["length_mm"],
    "V2-04": ["v2l"],
    "V2-05": ["software"],
    "V2-06": ["all"],
    "V2-07": ["all"],
    "V2-08": ["safety_ancap"],
    "V2-09": ["price_aud", "range_km"],
    "V2-10": ["price_aud"],
    "V2-11": ["software", "adas_optional", "remote_summon"],
    "V2-12": [],
    "V2-13": ["dc_charge_time_min", "dc_peak_kw"],
    "V2-14": ["battery_kwh", "software"],
    "V2-15": ["subjective"],
  };
  if (issueId === "V2-02" && !v.id.includes("__l_")) return false;
  if (issueId === "V2-06" && v.record_state !== "announced_provisional")
    return false;
  if (issueId === "V2-09" && !v.id.includes("black_special")) return false;
  // This issue's driving qualification concerns Model Y L activation;
  // its general software-history caveat is not an ADAS limit on other cars.
  if (
    issueId === "V2-11" &&
    ["adas_optional", "remote_summon"].includes(key) &&
    !v.id.startsWith("tesla_model_y__l_")
  )
    return false;
  return map[issueId]?.some((x) => x === "all" || x === key);
}

const months =
  "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec";
/** Repairs words the research export ran together and drops notes written for the researchers. */
function tidy(input: unknown, internalNotes = false): string {
  const text = Array.isArray(input) ? input.join(" ") : String(input ?? "");
  return text
    .replace(/Model(3|Y)/g, "Model $1")
    .replace(/\b(old|refreshed|Original)Y\b/g, "$1 Model Y")
    .replace(/(Supervised|FSD)(\d)/g, "$1 $2")
    .replace(
      new RegExp(`\\b(late|in|before)?(${months})(\\d)`, "g"),
      "$1 $2 $3",
    )
    .replace(new RegExp(`\\b(late|in)(${months})\\b`, "g"), "$1 $2")
    .replace(/\b(in)(Australia|\d{4})/g, "$1 $2")
    .replace(/\band(IVI|A\$)/g, "and $1")
    .replace(/AndroidAuto/g, "Android Auto")
    .replace(/ComfortDriving/g, "Comfort Driving")
    .replace(/(\d)(kWh|km)\b/g, "$1 $2")
    .replace(/(\d)(Spring|Holiday)/g, "$1 $2")
    .split(/(?<=[.!?])\s+/)
    .filter(
      (sentence) =>
        !internalNotes ||
        !/\bdo not\b|\bcount(ed|s)?\b|famil(y|ies)\b|independently proven|owner ?thread|typo|manifest|→|retained for audit|filename/i.test(
          sentence,
        ),
    )
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
function evidenceLabel(verification: string) {
  if (/owner/i.test(verification)) return "Owner reports";
  if (/overseas|global/i.test(verification)) return "Overseas announcement";
  if (/fleet observation/i.test(verification))
    return "Release notes tracked by an independent Australian fleet log";
  if (/navigation notice/i.test(verification))
    return "Manufacturer navigation notice";
  if (/government/i.test(verification)) return "Government approval record";
  return "Manufacturer notice";
}
function categoryLabel(category: string) {
  if (/recall/.test(category)) return "Recall update";
  if (/map|navigation/.test(category)) return "Navigation maps";
  if (/overseas/.test(category)) return "Overseas only";
  if (/hardware|homologation|variant|specification/.test(category))
    return "Model change, not an update";
  if (/app/.test(category)) return "Phone app";
  if (/unverified|unresolved|owner_reported|lead|candidate/.test(category))
    return "Unconfirmed report";
  if (/dealer/.test(category)) return "Dealer-installed update";
  return "Software update";
}
export function readableValue(value: unknown): string {
  if (value === null || value === undefined) return "Needs confirmation";
  if (typeof value === "boolean")
    return value ? "Listed in research" : "Not listed as available";
  if (Array.isArray(value)) return value.map(readableValue).join(", ");
  if (typeof value === "object")
    return Object.entries(value)
      .map(([k, v]) => `${k.replaceAll("_", " ")}: ${readableValue(v)}`)
      .join("; ");
  return String(value);
}

export function effectiveFeaturesFromRows(
  car: Car,
  d: Research,
  rows: Feature[],
): Feature[] {
  const id = car.id;
  const variant = (
    d.feature_evidence_variant_context ?? d.variants
  ).find((v) => v.id === id)!;
  const features = rows.map((f) => {
    // Buyer rows are written for readers already; no inherited qualifications apply.
    if (buyerKeys.has(f.criterion)) return f;
    const key = featureKey(f);
    const fresh =
      completionFeatures.get(key) ||
      usabilityFeatures.get(key) ||
      refinementFeatures.get(key);
    if (fresh) return { ...f, ...fresh } as typeof f;
    const warnings = d.publication_issues.filter(
      (i) =>
        (i.model_ids.includes(variant.model_id) || i.model_ids.includes("all")) &&
        (applies(i.issue_id, f.criterion, variant) ||
          applies(
            i.issue_id,
            f.criterion === "performance_rear_motor"
              ? "zero_to_100_s"
              : f.criterion,
            variant,
          )),
    );
    const blocked = f.status === "not_verified";
    return {
      ...f,
      value: blocked
        ? "Needs confirmation"
        : typeof f.value === "boolean"
          ? f.value
            ? "Included"
            : "Not available in this specification"
          : readableValue(f.value),
      conditions: [
        f.conditions,
        ...warnings.map((i) => i.publication_action),
      ].join(" "),
      source_ids: [
        ...new Set([...f.source_ids, ...warnings.flatMap((i) => i.source_ids)]),
      ],
    };
  });
  // The editorial pass rewrote every cell; it keeps the evidence trail of the row it replaces.
  for (const [i, f] of features.entries()) {
    const edit = editorialFeatures.get(featureKey(f));
    if (!edit) continue;
    const { add_source_ids = [], ...text } = edit as typeof edit & {
      add_source_ids?: string[];
    };
    features[i] = {
      ...f,
      ...text,
      source_ids: [...new Set([...f.source_ids, ...add_source_ids])],
    } as typeof f;
  }
  for (const [i, feature] of features.entries())
    features[i] = auditedFeature(feature);
  validateFeatureCorrectionRegistry(featureCorrections as FeatureCorrection[], d.feature_evidence);
  return applyFeatureCorrections(
    refreshFeatures(features, refreshEdits as ResearchRefresh[], d.sources),
    (featureCorrections as FeatureCorrection[]).filter((edit) => edit.variantId === id),
    d.sources,
  );
}
/** Bind existing loaders once; supplied data/snapshots never invoke these defaults. */
export function createEvidenceConsumers({
  sourceResearch,
  research,
  catalogue,
}: EvidenceConsumerDefaults) {
/** One effective equipment pipeline for detail pages and claim guards. */
function sourceEffectiveFeatures(
  car: Car,
  d: Research = sourceResearch(),
): Feature[] {
  const historical = d.feature_evidence_variant_context?.find((row) => row.id === car.id);
  // Reconstruct source warnings using the original bounded-build scope. A live
  // configuration review must not silently rebase an earlier feature guard.
  const sourceCar = historical
    ? { ...car, configurationEvidence: historical.configuration_evidence }
    : car;
  return effectiveFeaturesFromRows(
    sourceCar,
    d,
    d.feature_evidence.filter((f) => f.variant_id === car.id),
  );
}
function effectiveFeatures(car: Car, d: Research = research()): Feature[] {
  const regraded = applyFeatureRegrading(car, sourceEffectiveFeatures(car, d), d.sources);
  // Explicit immutable source snapshots have not entered the M1 packet pipeline.
  // Current Tier 1 cars always carry this marker; their guards remain mandatory.
  return applyBrandTermFeatures(
    car,
    car.buyerGradesRequired
      ? applyBrandFeatureUpdates(car, regraded, d, brandUpdatePackets)
      : regraded,
    d.sources,
  );
}

/** A build-scoped snapshot avoids recomputing the entire catalogue for every exported trim. */
function pack(
  id: string,
  snapshot?: CatalogueSnapshot,
): Pack {
  const d = snapshot?.data ?? research();
  const car = (snapshot?.cars ?? catalogue()).find((c) => c.id === id);
  if (!car) throw new Error("Unknown variant");
  const features = effectiveFeatures(car, d);
  const eligibility = {
    ...d.update_eligibility.find((e) => e.variant_id === id)!,
  };
  if (id.includes("tesla_model_y__l_"))
    eligibility.documented_family_minimum = null;
  eligibility.scope =
    editorial.eligibility.find((e) => e.variant_id === id)?.scope ??
    eligibility.scope;
  const events = d.update_events
    .filter((e) => e.model_ids.includes(car.modelId))
    .map((e) => ({
      ...e,
      changes: (Array.isArray(e.changes) ? e.changes : [])
        .map((c) => tidy(c))
        .filter(Boolean),
      version: e.version ? tidy(e.version) : e.version,
      notes: tidy(e.notes, true),
      verification: e.verification || "Documented by the cited source",
      evidence_label: evidenceLabel(e.verification || ""),
      category_label: categoryLabel(e.category),
      date_basis: e.date_basis || "Exact release date not established",
    }))
    .sort((a, b) =>
      String(b.release_date || "").localeCompare(String(a.release_date || "")),
    );
  const configuration = d.configuration_history
    .map((c, i) => ({ ...c, ...editorial.configuration[i] }))
    .filter((c) => c.model_id === car.modelId);
  const contextSourceIds = configurationSourceIds(car);
  const availableSourceIds = new Set(d.sources.map((source) => source.id));
  for (const sourceId of contextSourceIds) {
    if (!availableSourceIds.has(sourceId))
      throw new Error(
        `Configuration evidence references missing source ${sourceId}`,
      );
  }
  const sourceIds = new Set([
    ...contextSourceIds,
    ...Object.values(car.facts).flatMap((f) => f.sourceIds),
    ...Object.values(car.facts).flatMap((f) =>
      f.issues.flatMap((issue) => issue.source_ids),
    ),
    ...(car.availabilityEvidence?.sourceIds || []),
    ...(car.buyerSummary?.guardSourceIds || []),
    ...(car.buyerSummary?.strength?.sourceIds || []),
    ...(car.buyerSummary?.tradeoff?.sourceIds || []),
    ...features.flatMap((f) => f.source_ids),
    ...eligibility.source_ids,
    ...events.flatMap((e) => e.source_ids),
    ...car.issues.flatMap((i) => i.source_ids),
    ...configuration.flatMap((c) => c.source_ids),
  ]);
  for (const sourceId of sourceIds) {
    if (!availableSourceIds.has(sourceId))
      throw new Error(`Pack evidence references missing source ${sourceId}`);
  }
  const sources = d.sources
    .filter((s) => sourceIds.has(s.id))
    .map((s) => {
      const url = safeUrl(s.url) || "";
      // Shared immutable evidence can be referenced once in React's wire format.
      // Still sanitize any URL whose canonical safe value differs.
      return url === s.url ? s : { ...s, url };
    });
  return { car, features, eligibility, events, configuration, sources };
}
return { sourceEffectiveFeatures, effectiveFeatures, pack };
}
