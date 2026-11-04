import fs from "node:fs";
import path from "node:path";
import type {
  Research,
  Car,
  Fact,
  Feature,
  Pack,
  Source,
  Variant,
} from "./types";
import { safeUrl } from "./config";
import refinement from "../../data/research-refinement-2026-10-06.json";
import usability from "../../data/research-usability-2026-10-06.json";
import sales from "../../data/research-sales-2026-10-06.json";
import completion from "../../data/research-completion-2026-10-07.json";
import editorial from "../../data/research-editorial-2026-10-07.json";
import buyer from "../../data/research-buyer-2026-10-07.json";
import { auditedSource, auditedFact, auditedFeature } from "./launch-evidence";
import { loadImport } from "./research-import";
import { isVerifiedFact, maskCar } from "./verification";
import { readableLabel } from "./reader-text";
import { normaliseSourceType } from "./source-types";
/**
 * The data is static, so each loader runs once per process. React's cache() only memoises inside a
 * request, which made every CLI call (validate, tests) rebuild the whole catalogue.
 */
function once<T>(fn: () => T): () => T {
  let done = false;
  let value: T;
  return () => {
    if (!done) {
      value = fn();
      done = true;
    }
    return value;
  };
}
/** Group overlay rows by variant once, so each variant only walks its own rows. */
function byVariant<T extends { variant_id: string }>(rows: readonly T[]) {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const g = m.get(r.variant_id);
    if (g) g.push(r);
    else m.set(r.variant_id, [r]);
  }
  return m;
}
const refinementFacts = byVariant(refinement.facts);
const editorialFacts = byVariant(editorial.facts);
const buyerFacts = byVariant(buyer.facts);
/** Rows added for buyer questions the supplied criteria did not cover. */
const buyerKeys = new Set(buyer.criteria.map((c) => c.key));
export const research = once((): Research => {
  const d: Research = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "data/au_ev_all_variants_2026-10-06.json"),
      "utf8",
    ),
  );
  d.sources.push(
    ...refinement.sources,
    ...usability.sources,
    ...sales.sources,
    ...completion.sources,
    ...editorial.sources,
    ...buyer.sources,
  );
  d.sources = d.sources.map(auditedSource).map((s) => ({
    ...s,
    source_type: normaliseSourceType(s.source_type, s.url),
  }));
  // The warranty terms have their own rows, so this row covers servicing only.
  d.criteria = d.criteria.map((c) =>
    c.key === "warranty_service"
      ? {
          ...c,
          label: "Servicing",
          definition: "Service interval and published service pricing.",
        }
      : c,
  );
  // The supplied counts stay as supplied; the added rows are declared beside them.
  d.criteria.push(...buyer.criteria);
  d.feature_evidence.push(...(buyer.features as Feature[]));
  d.metadata = {
    ...d.metadata,
    added_criterion_count: buyer.criteria.length,
    added_feature_row_count: buyer.features.length,
  };
  // 16 October research import: more variants in the same schema, graded fact by fact.
  const imp = loadImport();
  if (imp) {
    d.models.push(...imp.models);
    d.variants.push(...imp.variants);
    for (const v of d.variants) Object.assign(v, imp.variant_patches[v.id]);
    d.trim_equipment.push(...imp.trim_equipment);
    d.sources.push(...imp.sources);
    const eligible = new Map(imp.eligibility.map((e) => [e.variant_id, e]));
    const rows: Feature[] = [];
    for (const v of imp.variants) {
      const date = imp.feature_defaults[v.id]?.date ?? v.variant_review_date;
      d.update_eligibility.push(
        eligible.get(v.id) ?? {
          variant_id: v.id,
          model_id: v.model_id,
          documented_family_minimum: null,
          exact_total_known: false,
          exact_total: null,
          scope: "No exact-trim software-update history established.",
          meaning: "Research pending",
          source_ids: [],
          observation_window_start: date,
          observation_window_end: date,
        },
      );
      const stored = new Map(
        (imp.features[v.id] ?? []).map((r) => [r.criterion, r]),
      );
      const fallback = imp.feature_defaults[v.id];
      for (const c of d.criteria) {
        const r = stored.get(c.key);
        rows.push({
          variant_id: v.id,
          model_id: v.model_id,
          ...(r ?? {
            criterion: c.key,
            status: "not_verified",
            value: fallback.value,
            conditions: fallback.conditions,
            source_ids: [],
            evidence_scope: fallback.evidence_scope,
            last_evidence_date: fallback.date,
            reviewed_date: fallback.date,
            verification_state: fallback.verification_state,
            grade: "not_published",
          }),
        } as Feature);
      }
    }
    d.feature_evidence.push(...rows);
    d.metadata = {
      ...d.metadata,
      record_count: d.variants.length,
      supplied_record_count: d.metadata.record_count,
      imported_variant_count: imp.variants.length,
      added_feature_row_count:
        Number(d.metadata.added_feature_row_count) + rows.length,
    };
  }
  d.publication_issues = d.publication_issues
    .map((issue) => ({
      ...issue,
      ...refinement.issues.find((patch) => patch.issue_id === issue.issue_id),
    }))
    // Instructions addressed to the researchers are not reader content.
    .map((issue) => ({
      ...issue,
      publication_action:
        issue.publication_action
          .split(/(?<=[.!?])\s+/)
          .filter((sentence) => !/^Do not\b/.test(sentence))
          .join(" ") || issue.publication_action,
    }));
  return d;
});
/** Labels of the four measurements the buyer pass added; the import re-uses them. */
const extraLabels: Record<string, string> = {
  ground_clearance_mm: "Ground clearance",
  turning_circle_m: "Turning circle",
  kerb_weight_kg: "Kerb weight",
  towing_unbraked_kg: "Unbraked towing",
};
const descriptors = [
  ["price_aud", "Listed price", "AUD", "price_basis"],
  ["range_km", "Claimed range", "km", "range_cycle"],
  ["seats", "Seats", "", ""],
  ["dc_charge_time_min", "DC charging time", "min", "dc_charge_window"],
  ["ac_kw", "AC charging", "kW", ""],
  ["dc_peak_kw", "Peak DC acceptance", "kW", ""],
  ["battery_kwh", "Battery capacity", "kWh", "battery_basis"],
  ["boot_l", "Cargo behind occupied seats", "L", "boot_basis"],
  ["frunk_l", "Front storage", "L", ""],
  ["max_total_cargo_l", "Maximum folded cargo", "L", "boot_basis"],
  ["zero_to_100_s", "0–100 km/h", "s", ""],
  ["length_mm", "Length", "mm", "length_basis"],
  ["width_mm", "Width", "mm", "width_basis"],
  ["height_mm", "Height", "mm", ""],
  ["wheelbase_mm", "Wheelbase", "mm", ""],
  ["towing_braked_kg", "Braked towing", "kg", ""],
  ["warranty", "Vehicle warranty", "", ""],
  ["battery_warranty", "Battery warranty", "", ""],
];
/** The scope a fact states for itself: the variant's own, else its generation, else nothing - never a placeholder word. */
function scopeOf(v: Variant, model: { generation?: unknown }): string {
  return (
    readableLabel(v.availability_scope) || readableLabel(model.generation) || ""
  );
}
function applies(issueId: string, key: string, v: Variant) {
  // These two rules were written for single Tesla/Zeekr records; the id patterns must not catch imported trims.
  const tesla = v.model_id === "tesla_model_y";
  const zeekr7x = v.model_id === "zeekr_7x";
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
  if (issueId === "V2-02" && !(tesla && v.id.includes("__l_"))) return false;
  if (issueId === "V2-06" && v.record_state !== "announced_provisional")
    return false;
  if (issueId === "V2-09" && !(zeekr7x && v.id.includes("black_special")))
    return false;
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
export const catalogue = once((): Car[] => {
  const d = research();
  const imp = loadImport();
  const models = new Map(d.models.map((m) => [m.id, m]));
  return d.variants.map((v) => {
    const model = models.get(v.model_id)!;
    const issues = d.publication_issues.filter(
      (i) => i.model_ids.includes(v.model_id) || i.model_ids.includes("all"),
    );
    const facts: Record<string, Fact> = {};
    for (const [key, label, unit, basisKey] of descriptors) {
      const raw = v[key];
      const warranty =
        ["warranty", "battery_warranty"].includes(key) &&
        raw &&
        typeof raw === "object"
          ? (raw as {
              years?: number;
              km?: number;
              km_unlimited?: boolean;
              minimum_retained_capacity_percent?: number;
              scope?: string;
              source_ids?: string[];
            })
          : null;
      const value = warranty?.years
        ? `${warranty.years} years / ${warranty.km_unlimited ? "unlimited km" : warranty.km ? `${warranty.km.toLocaleString("en-AU")} km` : "distance limit unconfirmed"}${warranty.minimum_retained_capacity_percent ? `; minimum ${warranty.minimum_retained_capacity_percent}% battery retention` : ""}`
        : typeof raw === "number" || typeof raw === "string"
          ? raw
          : null;
      let basis = String(
        v[basisKey] || "Manufacturer claim; supplied Australian variant record",
      );
      if (key === "seats") basis = "Occupied seating positions";
      if (key === "zero_to_100_s")
        basis =
          v.brand === "Tesla" && v.trim.includes("Performance")
            ? "Manufacturer claim; rollout subtracted"
            : "Manufacturer claim; timing protocol not fully established";
      // Research notes are internal working text; reader-facing notes come from the editorial overlay.
      const qualifications: string[] = [];
      const fieldIssues = issues.filter((i) => applies(i.issue_id, key, v));
      let status: Fact["status"] = value === null ? "not_verified" : "standard";
      if (
        v.record_state === "announced_provisional" ||
        (v.model_id === "byd_atto_3_evo" && key === "price_aud") ||
        (v.model_id === "zeekr_7x" &&
          v.id.includes("black_special") &&
          ["price_aud", "range_km"].includes(key)) ||
        (v.model_id === "tesla_model_y" &&
          v.id.includes("__l_") &&
          key === "zero_to_100_s")
      )
        status = value === null ? "not_verified" : "conditional";
      let comparisonBasis = basis;
      // Only normalise explicitly like-for-like manufacturer test cycles; charging and pricing remain conservative.
      if (key === "range_km") comparisonBasis = v.range_cycle;
      const fieldReview = v.field_review as
        Record<string, { date?: string }> | undefined;
      facts[key] = {
        key,
        label,
        value,
        unit,
        basis,
        comparisonBasis,
        status,
        sourceIds: warranty?.source_ids || v.source_ids,
        date:
          fieldReview?.[key]?.date ||
          String(v.specification_evidence_date || v.variant_review_date),
        market: "AU",
        scope: scopeOf(v, model),
        qualifications,
        issues: fieldIssues,
      };
    }
    for (const patch of refinementFacts.get(v.id) ?? []) {
      const f = facts[patch.key];
      if (f)
        Object.assign(f, {
          value: patch.value,
          status: patch.status,
          date: patch.date,
          sourceIds: patch.sourceIds,
          issues: f.issues.filter((i) => i.issue_id !== "V2-07"),
        });
    }
    // 7 October completion pass: sourced values for cells the earlier research left open.
    const completed = (
      completion.facts as {
        variant_id: string;
        key: string;
        value: number | string;
        status: Fact["status"];
        date: string;
        sourceIds: string[];
        basis?: string;
        unit?: string;
      }[]
    ).filter((f) => f.variant_id === v.id);
    for (const patch of completed) {
      const f = facts[patch.key];
      if (!f) continue;
      Object.assign(f, {
        value: patch.value,
        status: patch.status,
        date: patch.date,
        sourceIds: patch.sourceIds,
        resolvedElsewhere: patch.status === "conditional",
        unit: patch.unit ?? f.unit,
        basis: patch.basis ?? f.basis,
        comparisonBasis:
          patch.key === "range_km"
            ? f.comparisonBasis
            : (patch.basis ?? f.comparisonBasis),
      });
    }
    // 7 October editorial pass: one label per measurement basis, plus the cells it rewrote.
    const labels = editorial.basis as Record<string, string>;
    for (const f of Object.values(facts)) {
      f.basis = labels[f.basis] ?? f.basis;
      f.comparisonBasis = labels[f.comparisonBasis] ?? f.comparisonBasis;
    }
    for (const { variant_id, key, ...patch } of (editorialFacts.get(v.id) ??
      []) as ({
      variant_id: string;
      key: string;
    } & Partial<Fact>)[]) {
      if (variant_id !== v.id || !facts[key]) continue;
      Object.assign(facts[key], patch);
      if (patch.basis && key !== "range_km")
        facts[key].comparisonBasis = patch.basis;
      if (patch.status === "conditional") facts[key].resolvedElsewhere = true;
    }
    // 7 October buyer pass: measurements the supplied variant records did not carry.
    for (const { variant_id, ...fact } of (buyerFacts.get(v.id) ?? []) as ({
      variant_id: string;
    } & Pick<
      Fact,
      | "key"
      | "label"
      | "value"
      | "unit"
      | "basis"
      | "status"
      | "date"
      | "sourceIds"
      | "qualifications"
    >)[]) {
      if (variant_id !== v.id) continue;
      facts[fact.key] = {
        ...fact,
        comparisonBasis: fact.basis,
        market: "AU",
        scope: scopeOf(v, model),
        issues: [],
      };
    }
    for (const key of Object.keys(facts)) facts[key] = auditedFact(facts[key]);
    // 16 October research import: final values and the verification grade of every fact.
    for (const [key, patch] of Object.entries(imp?.facts[v.id] ?? {})) {
      const empty: Fact = {
        key,
        label: extraLabels[key] ?? key,
        value: null,
        unit: "",
        basis: "",
        comparisonBasis: "",
        status: "not_verified",
        sourceIds: [],
        date: String(v.variant_review_date),
        market: "AU",
        scope: scopeOf(v, model),
        qualifications: [],
        issues: [],
      };
      facts[key] = { ...empty, ...facts[key], ...patch };
      // A comparison basis equal to the basis is stored once.
      if (patch.basis !== undefined && patch.comparisonBasis === undefined)
        facts[key].comparisonBasis = patch.basis;
    }
    if (imp)
      for (const f of Object.values(facts))
        f.grade ??= v.vehicle_class ? "unrated" : "established";
    for (const f of Object.values(facts)) f.scope = readableLabel(f.scope);
    return {
      id: v.id,
      modelId: v.model_id,
      family: v.model_id.startsWith("byd_atto_3")
        ? "byd-atto-3"
        : v.model_id.replaceAll("_", "-"),
      // Ids with fewer than three "__" parts use the whole id, so (family, slug) routes never collide.
      slug: (v.id.split("__").length >= 3
        ? v.id.split("__").slice(1).join("-")
        : v.id
      ).replaceAll("_", "-"),
      brand: v.brand,
      model: v.model,
      trim: v.trim,
      generation:
        (v.generation as string | undefined) ||
        model.generation ||
        "Generation details not verified",
      year: v.model_year,
      vehicleClass: v.vehicle_class ?? "passenger",
      availability: v.record_state,
      drive: String(v.drive || "Unknown"),
      facts,
      issues: issues.filter(
        (i) =>
          (!["V2-10", "V2-12", "V2-13", "V2-15"].includes(i.issue_id) &&
            applies(i.issue_id, "all", v)) ||
          (!i.model_ids.includes("all") &&
            i.issue_id !== "V2-06" &&
            i.issue_id !== "V2-09") ||
          (i.issue_id === "V2-09" && v.id.includes("black_special")),
      ),
    };
  });
});
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
const lookups = once(() => {
  const d = research();
  return {
    cars: new Map(catalogue().map((c) => [c.id, c])),
    variants: new Map(d.variants.map((v) => [v.id, v])),
    rows: byVariant(d.feature_evidence),
    imported: new Set(loadImport()?.variants.map((v) => v.id)),
  };
});
/** The sources a pack cites: its facts, equipment rows, software records, issues and configuration history. */
function sourcesFor(p: Omit<Pack, "sources">): Source[] {
  const ids = new Set([
    ...Object.values(p.car.facts).flatMap((f) => f.sourceIds),
    ...p.features.flatMap((f) => f.source_ids),
    ...p.eligibility.source_ids,
    ...p.events.flatMap((e) => e.source_ids),
    ...p.car.issues.flatMap((i) => i.source_ids),
    ...p.configuration.flatMap((c) => c.source_ids),
  ]);
  return research()
    .sources.filter((s) => ids.has(s.id))
    .map((s) => ({ ...s, url: safeUrl(s.url) || "" }));
}
export function pack(id: string): Pack {
  const d = research();
  const lookup = lookups();
  const car = lookup.cars.get(id);
  if (!car) throw new Error("Unknown variant");
  const variant = lookup.variants.get(id)!;
  const imported = lookup.imported.has(id);
  const features = (lookup.rows.get(id) ?? []).map((f) => {
    // Imported rows are already final: they carry their own conditions, sources and grade.
    if (imported) return { ...f };
    // Buyer rows are written for readers already; no inherited qualifications apply.
    if (buyerKeys.has(f.criterion)) return f;
    const fresh =
      completion.features.find(
        (p) => p.variant_id === id && p.criterion === f.criterion,
      ) ||
      usability.features.find(
        (p) => p.variant_id === id && p.criterion === f.criterion,
      ) ||
      refinement.features.find(
        (p) => p.variant_id === id && p.criterion === f.criterion,
      );
    if (fresh) return { ...f, ...fresh } as typeof f;
    const warnings = d.publication_issues.filter(
      (i) =>
        (i.model_ids.includes(car.modelId) || i.model_ids.includes("all")) &&
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
    if (imported) break;
    const edit = editorial.features.find(
      (p) => p.variant_id === id && p.criterion === f.criterion,
    );
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
  if (!imported)
    for (const [i, feature] of features.entries())
      features[i] = auditedFeature(feature);
  // Research import: grades for the original rows, and replacement rows where the import is better graded.
  const gradePatches = loadImport()?.feature_patches[id];
  if (gradePatches)
    for (const [i, f] of features.entries()) {
      const patch = gradePatches[f.criterion];
      if (patch) features[i] = { ...f, ...patch };
    }
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
  const sources = sourcesFor({
    car,
    features,
    eligibility,
    events,
    configuration,
  });
  return { car, features, eligibility, events, configuration, sources };
}
export function counts() {
  const d = research();
  return {
    variants: d.variants.length,
    families: new Set(catalogue().map((c) => c.family)).size,
    generations: d.models.length,
    criteria: d.criteria.length,
    evidence: d.feature_evidence.length,
    current: d.variants.filter(
      (v) => v.record_state === "current_or_order_listed",
    ).length,
    outgoing: d.variants.filter((v) => v.record_state === "outgoing").length,
    provisional: d.variants.filter(
      (v) => v.record_state === "announced_provisional",
    ).length,
  };
}

/**
 * What visitors may see. `catalogue()` and `pack()` hold every fact, graded; the public versions below
 * apply isVerifiedFact once, on the server: unverified facts lose their value, basis, date and sources, and
 * unverified equipment rows are dropped (readers get the neutral "Needs confirmation" row). Pages,
 * components, exports and the portable build use these; only validation, audit and tests read the raw data.
 */
export const publicCatalogue = once((): Car[] => catalogue().map(maskCar));
const publicPacks = new Map<string, Pack>();
export function publicPack(id: string): Pack {
  const cached = publicPacks.get(id);
  if (cached) return cached;
  const raw = pack(id);
  const rest = {
    car: maskCar(raw.car),
    features: raw.features.filter((f) => isVerifiedFact(f)),
    eligibility: raw.eligibility,
    events: raw.events,
    configuration: raw.configuration,
  };
  const masked: Pack = { ...rest, sources: sourcesFor(rest) };
  publicPacks.set(id, masked);
  return masked;
}
/** Sources cited by static page copy, which no pack carries. */
const PAGE_SOURCES = ["r5_au_ev_sales_sep2026", "r3_tesla_fsd"];
/**
 * The source registry for visitors: a source that is cited only by facts or equipment rows that are
 * hidden stays out, because its summary can restate the withheld value.
 */
export const publicSources = once((): Source[] => {
  const shown = new Set<string>(PAGE_SOURCES);
  const withheld = new Set<string>();
  for (const c of catalogue()) {
    const raw = pack(c.id);
    for (const f of Object.values(raw.car.facts))
      for (const id of f.sourceIds)
        (isVerifiedFact(f) ? shown : withheld).add(id);
    for (const f of raw.features)
      for (const id of f.source_ids)
        (isVerifiedFact(f) ? shown : withheld).add(id);
    for (const s of publicPack(c.id).sources) shown.add(s.id);
  }
  return research()
    .sources.filter((s) => shown.has(s.id) || !withheld.has(s.id))
    .map((s) => ({ ...s, url: safeUrl(s.url) || "" }));
});
/** The public sources with these ids, for pages that cite a fixed few. */
export function publicSourcesById(ids: string[]): Source[] {
  const wanted = new Set(ids);
  return publicSources().filter((s) => wanted.has(s.id));
}
const SUMMARY_FACTS = ["price_aud", "range_km", "seats"];
/** A fact reduced to what a selection control shows. */
function summaryFact(f: Fact): Fact {
  return {
    key: f.key,
    label: f.label,
    value: f.value,
    unit: f.unit,
    // The picker only asks whether a price is a reported one; the range basis labels a card.
    basis:
      f.key === "range_km"
        ? f.basis
        : f.key === "price_aud" && /reported/i.test(f.basis)
          ? "Reported"
          : "",
    comparisonBasis: "",
    status: f.status,
    sourceIds: [],
    date: "",
    market: "",
    scope: "",
    qualifications: [],
    issues: [],
  };
}
// Selection controls need identity and three filter facts, not the full specifications. Public values only.
export const pickerCatalogue = once((): Car[] =>
  publicCatalogue().map((car) => ({
    ...car,
    facts: Object.fromEntries(
      SUMMARY_FACTS.map((key) => [key, summaryFact(car.facts[key])]),
    ),
    issues: [],
  })),
);
/** How much of the research visitors can see: the figures and equipment rows that pass isVerifiedFact. */
export const verificationCounts = once(() => {
  let facts = 0,
    factsShown = 0,
    rows = 0,
    rowsShown = 0;
  for (const c of catalogue()) {
    const raw = pack(c.id);
    for (const f of Object.values(raw.car.facts))
      if (f.value !== null && f.value !== undefined) {
        facts++;
        if (isVerifiedFact(f)) factsShown++;
      }
    for (const f of raw.features) {
      rows++;
      if (isVerifiedFact(f)) rowsShown++;
    }
  }
  return {
    facts,
    factsShown,
    factsHidden: facts - factsShown,
    rows,
    rowsShown,
    rowsHidden: rows - rowsShown,
  };
});
/** counts() with the evidence figure restricted to the rows visitors can see. */
export function publicCounts() {
  return { ...counts(), evidence: verificationCounts().rowsShown };
}
const EXPLORER_EQUIPMENT = [
  "front_ventilated",
  "hud",
  "adaptive_damping",
  "power_roof_shade",
];
/**
 * Yes/no equipment for the explorer filter. These trim records carry no grade; only the supplied
 * (established) variants have them, so imported variants, graded fact by fact, contribute none.
 * Variants with no recorded answer are left out: the filter keeps unknowns visible.
 */
export const publicEquipment = once(() => {
  const imported = lookups().imported;
  return Object.fromEntries(
    research()
      .trim_equipment.filter(
        (e) =>
          !imported.has(e.variant_id) &&
          EXPLORER_EQUIPMENT.some((k) => typeof e[k] === "boolean"),
      )
      .map((e) => [
        e.variant_id,
        Object.fromEntries(
          EXPLORER_EQUIPMENT.map((k) => [
            k,
            typeof e[k] === "boolean" ? e[k] : null,
          ]),
        ),
      ]),
  ) as Record<string, Record<string, boolean | null>>;
});
