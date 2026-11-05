import { prepareBrandResearch, applyBrandUpdates } from "./brand-updates";
import { brandUpdatePackets } from "./brand-update-registry";
import { applyRetainedFactFills } from "./retained-fact-fills";
import { applyPriceLadder, priceLadderSources } from "./price-ladder";
import { applyEvidenceRegrading } from "./evidence-regrading";
// Preserve this entry point's original dependency evaluation order.
import "./configuration-evidence";
import { australianEvidenceDate } from "./evidence-date";
import refreshEdits from "../../data/research-refresh-2026-10-10.json";
import {
  validateRefreshRegistry,
  refreshFacts,
  refreshAvailability,
  type ResearchRefresh,
} from "./research-refresh";
import availabilityEdits from "../../data/approved-availability-corrections.json";
import {
  applyAvailabilityCorrections,
  type AvailabilityCorrection,
} from "./availability-corrections";
import fs from "node:fs";
import "../../data/approved-feature-corrections.json";
import "./feature-corrections";
import { catalogueAdditions as additions } from "./catalogue-additions";
import { buyerProposal as sellingPoints } from "./buyer-proposal";
import {
  buildBuyerSummaries,
  type SellingPointProposal,
} from "./selling-points";
import corrections from "../../data/approved-corrections.json";
import {
  applyCorrections,
  validateFactCorrectionRegistry,
  validDate,
  type Correction,
} from "./corrections";
import path from "node:path";
import { cache } from "react";
import type { Research, Car, Fact, Feature, Variant } from "./types";
import "./config";
import refinement from "../../data/research-refinement-2026-10-06.json";
import usability from "../../data/research-usability-2026-10-06.json";
import sales from "../../data/research-sales-2026-10-06.json";
import completion from "../../data/research-completion-2026-10-07.json";
import editorial from "../../data/research-editorial-2026-10-07.json";
import buyer from "../../data/research-buyer-2026-10-07.json";
import { auditedSource, auditedFact } from "./launch-evidence";
import {
  applies,
  createEvidenceConsumers,
  effectiveFeaturesFromRows,
  featureKey,
  type CatalogueSnapshot,
} from "./evidence-consumers";
export { readableValue } from "./evidence-consumers";
export type { CatalogueSnapshot } from "./evidence-consumers";
/** Immutable imported overlays, grouped without reordering duplicate field patches. */
function factsByVariant<T>(rows: readonly T[], key: keyof T): Map<string, T[]> {
  const result = new Map<string, T[]>();
  for (const row of rows) {
    const id = String(row[key]);
    const group = result.get(id) || [];
    group.push(row);
    result.set(id, group);
  }
  return result;
}
const refinementFactsByVariant = factsByVariant(refinement.facts, "variant_id");
const completionFactsByVariant = factsByVariant(completion.facts, "variant_id");
const editorialFactsByVariant = factsByVariant(editorial.facts, "variant_id");
const buyerFactsByVariant = factsByVariant(buyer.facts, "variant_id");
const additionsFactsByVariant = factsByVariant(additions.facts, "variantId");
const addedVariantIds = new Set(
  additions.variants.map((variant) => variant.id),
);

export const sourceResearch = cache((): Research => {
  const d: Research = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "data/au_ev_all_variants_2026-10-06.json"),
      "utf8",
    ),
  );
  d.models.push(...additions.models);
  d.variants.push(...(additions.variants as Variant[]));
  d.sources.push(
    ...(additions.sources as Research["sources"]),
    ...priceLadderSources,
    ...refinement.sources,
    ...usability.sources,
    ...sales.sources,
    ...completion.sources,
    ...editorial.sources,
    ...buyer.sources,
  );
  d.sources = d.sources.map(auditedSource);
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
  // New exact-trim records retain explicit unknowns until their equipment is researched.
  for (const v of additions.variants as Variant[]) {
    // Explicit dates scope generated unknowns to newly reviewed offers without
    // re-dating any legacy catalogue evidence.
    const unknownDate = v.unknown_evidence_date ?? additions.checkedAt;
    if (typeof unknownDate !== "string" || !validDate(unknownDate))
      throw new Error("Invalid variant unknown-evidence date");
    d.trim_equipment.push({
      variant_id: v.id,
      source_ids: [],
      notes: "Exact-trim equipment research pending",
    });
    for (const criterion of d.criteria)
      d.feature_evidence.push({
        variant_id: v.id,
        model_id: v.model_id,
        criterion: criterion.key,
        status: "not_verified",
        value: "Needs confirmation",
        conditions:
          "This exact-trim equipment claim has not yet been researched.",
        source_ids: [],
        evidence_scope: "AU exact trim; research pending",
        last_evidence_date: unknownDate,
        reviewed_date: unknownDate,
        verification_state: "unverified",
      });
    d.update_eligibility.push({
      variant_id: v.id,
      model_id: v.model_id,
      documented_family_minimum: null,
      exact_total_known: false,
      exact_total: null,
      scope: "No exact-trim software-update history established.",
      meaning: "Research pending",
      source_ids: [],
      observation_window_start: unknownDate,
      observation_window_end: unknownDate,
    });
  }
  const featurePositions = new Map<string, number>();
  d.feature_evidence.forEach((feature, index) => {
    const key = featureKey(feature);
    if (!featurePositions.has(key)) featurePositions.set(key, index);
  });
  for (const patch of additions.features as Feature[]) {
    const index = featurePositions.get(featureKey(patch)) ?? -1;
    if (index < 0 || d.feature_evidence[index].status !== "not_verified")
      throw new Error("Equipment patch must replace an exact unknown cell");
    d.feature_evidence[index] = patch;
  }
  d.metadata = {
    ...d.metadata,
    added_criterion_count: buyer.criteria.length,
    added_variant_count: additions.variants.length,
    added_feature_row_count:
      buyer.features.length + additions.variants.length * d.criteria.length,
  };
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
  validateRefreshRegistry(
    refreshEdits as ResearchRefresh[],
    d.variants.map((v) => v.id),
    d.sources,
  );
  return d;
});
/** Public identity/source registry includes only separately reviewed M1 brand packets. */
const prepareResearch = cache((source: Research): Research =>
  prepareBrandResearch(source, brandUpdatePackets),
);
export const research = cache((): Research => prepareResearch(sourceResearch()));

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
function buildSourceCatalogue(d: Research): Car[] {
  validateFactCorrectionRegistry(
    corrections as Correction[],
    d.variants.map((variant) => variant.id),
  );
  const cars: Car[] = d.variants.map((v) => {
    const model = d.models.find((m) => m.id === v.model_id)!;
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
        (v.id.includes("black_special") &&
          ["price_aud", "range_km"].includes(key)) ||
        (v.id.includes("__l_") && key === "zero_to_100_s")
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
        scope: String(
          v.availability_scope ||
            `${v.brand} ${v.model} ${v.trim} · ${v.model_year}`,
        ),
        qualifications,
        issues: fieldIssues,
      };
    }
    for (const patch of refinementFactsByVariant.get(v.id) || []) {
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
    const completed = (completionFactsByVariant.get(v.id) || []) as {
      variant_id: string;
      key: string;
      value: number | string;
      status: Fact["status"];
      date: string;
      sourceIds: string[];
      basis?: string;
      unit?: string;
    }[];
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
    for (const { variant_id, key, ...patch } of (editorialFactsByVariant.get(
      v.id,
    ) || []) as ({
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
    for (const { variant_id, ...fact } of (buyerFactsByVariant.get(v.id) ||
      []) as ({
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
        scope: String(
          v.availability_scope ||
            `${v.brand} ${v.model} ${v.trim} · ${v.model_year}`,
        ),
        issues: [],
      };
    }
    if (addedVariantIds.has(v.id)) {
      for (const fact of Object.values(facts)) {
        if (fact.value !== null) continue;
        fact.basis = "Exact-trim research pending";
        fact.comparisonBasis = "";
        fact.sourceIds = [];
        fact.qualifications = ["No exact-trim measurement verified yet."];
      }
    }
    // Keep the shared comparison schema complete without inventing missing measurements.
    for (const template of buyer.facts) {
      if (facts[template.key]) continue;
      facts[template.key] = {
        key: template.key,
        label: template.label,
        value: null,
        unit: template.unit,
        basis: "Exact-trim research pending",
        comparisonBasis: "",
        status: "not_verified",
        sourceIds: [],
        date: additions.checkedAt,
        market: "AU",
        scope: "Exact Australian trim",
        qualifications: [
          "No exact-trim measurement has been verified for this field.",
        ],
        issues: [],
      };
    }
    for (const key of Object.keys(facts)) facts[key] = auditedFact(facts[key]);
    for (const patch of (additionsFactsByVariant.get(v.id) || []) as ({
      variantId: string;
    } & Fact)[]) {
      if (patch.variantId !== v.id) continue;
      const { variantId: _variantId, ...fact } = patch;
      void _variantId;
      facts[fact.key] = fact;
    }
    const refreshedFacts = refreshFacts(
      v.id,
      facts,
      refreshEdits as ResearchRefresh[],
      d.sources,
    );
    const towing = refreshedFacts.towing_braked_kg;
    // Normalize the legacy label before review so published snapshots match the approval input.
    if (
      towing?.unit === "kg" &&
      towing.comparisonBasis === "Manufacturer figure"
    ) {
      towing.comparisonBasis = "Maximum braked towing";
    }
    const correctedFacts = applyCorrections(
      v.id,
      refreshedFacts,
      corrections as Correction[],
      d.sources,
    );
    return {
      id: v.id,
      ...(v.configuration_evidence
        ? { configurationEvidence: v.configuration_evidence }
        : {}),
      researchStage: addedVariantIds.has(v.id) ? "partial" : "established",
      modelId: v.model_id,
      modelFamily: model.family_id,
      vehicleClass: (v.vehicle_class || "passenger") as Car["vehicleClass"],
      family: v.model_id.startsWith("byd_atto_3")
        ? "byd-atto-3"
        : v.model_id.replaceAll("_", "-"),
      slug: (v.id.split("__").length >= 3
        ? v.id.split("__").slice(1).join("-")
        : v.id
      ).replaceAll("_", "-"),
      brand: v.brand,
      // A generation name must not claim both trims share the same sales status.
      model:
        v.model_id === "byd_atto_3_legacy" ? "ATTO 3 (legacy FWD)" : v.model,
      trim: v.trim,
      generation: model.generation || "Generation details not verified",
      year: v.model_year,
      availability: v.record_state,
      availabilityEvidence:
        (v.availability_evidence as Car["availabilityEvidence"]) || {
          checkedAt: v.variant_review_date,
          orderStatus: v.record_state,
          stockStatus: "unverified",
          sourceIds: v.source_ids,
        },
      drive: String(v.drive || "Unknown"),
      facts: correctedFacts,
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
  const availableCars = applyAvailabilityCorrections(
    refreshAvailability(cars, refreshEdits as ResearchRefresh[], d.sources),
    availabilityEdits as AvailabilityCorrection[],
    d.sources,
  );
  // This index belongs only to this evaluation. Public callers supplying a mutable
  // Research snapshot still get a fresh row selection in effectiveFeatures().
  const featureRows = new Map<string, Feature[]>();
  for (const row of d.feature_evidence) {
    const rows = featureRows.get(row.variant_id) || [];
    rows.push(row);
    featureRows.set(row.variant_id, rows);
  }
  const summaries = buildBuyerSummaries(
    availableCars,
    cars.flatMap((car) =>
      effectiveFeaturesFromRows(car, d, featureRows.get(car.id) || []),
    ),
    d.sources,
    sellingPoints as SellingPointProposal,
    { asOf: australianEvidenceDate() },
  );
  return availableCars.map((car) => ({
    ...car,
    buyerSummary: summaries.get(car.id),
  }));
}
// Share by source identity only within React's request scope; CLI calls stay fresh.
const sourceCatalogueFor = cache(buildSourceCatalogue);
export const sourceCatalogue = cache((): Car[] =>
  sourceCatalogueFor(sourceResearch()),
);

/** One fresh, caller-scoped load; all source and dated-overlay guards still run. */
export const catalogueSnapshot = cache((): CatalogueSnapshot => {
  const source = sourceResearch();
  const sources = source.sources;
  // Dated presentation review follows immutable summary-dependency validation.
  const filled = applyRetainedFactFills(sourceCatalogueFor(source), sources);
  const initial = applyEvidenceRegrading(filled.map((car) => applyPriceLadder(car, sources)), sources);
  const data = prepareResearch(source);
  const cars = applyBrandUpdates(initial, data, brandUpdatePackets).map((car) =>
    ["passenger", "ute"].includes(car.vehicleClass || "passenger")
      ? { ...car, buyerGradesRequired: true as const }
      : car,
  );
  return { data, cars };
});
export const catalogue = cache((): Car[] => catalogueSnapshot().cars);

export const { sourceEffectiveFeatures, effectiveFeatures, pack } =
  createEvidenceConsumers({ sourceResearch, research, catalogue });

export function counts(snapshot?: CatalogueSnapshot) {
  const { data: d, cars } = snapshot ?? catalogueSnapshot();
  return {
    variants: cars.length,
    families: new Set(cars.map((c) => c.modelFamily || c.family)).size,
    generations: d.models.length,
    criteria: d.criteria.length,
    evidence: d.feature_evidence.length,
    current: cars.filter((c) => c.availability === "current_or_order_listed")
      .length,
    outgoing: cars.filter((c) => c.availability === "outgoing").length,
    provisional: cars.filter((c) => c.availability === "announced_provisional")
      .length,
  };
}

// Selection controls need identity and three filter facts, not the full specifications.
export function pickerCatalogue(): Car[] {
  return catalogue().map((car) => {
    const { buyerSummary, ...identity } = car;
    void buyerSummary;
    return {
      ...identity,
      facts: Object.fromEntries(
        ["price_aud", "range_km", "seats"].map((key) => [key, car.facts[key]]),
      ),
      issues: [],
    };
  });
}
