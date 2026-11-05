/** Read-only milestone reports over the effective catalogue, never the immutable snapshot. */
import { rankAttribute, type AttributeKey } from "../../src/lib/discovery";
import {
  thresholdFreshness,
  type AuThresholds,
  type ThresholdFreshness,
} from "../../src/lib/thresholds";
import {
  evidenceDateValue,
  evidenceFreshness,
  factFreshness,
} from "../../src/lib/freshness";
import {
  buyerGradeOf,
  gradeLabel,
  hasEarnedBuyerGrade,
  isBrakedTowingBasisEstablished,
} from "../../src/lib/evidence-grading";
import {
  buildMarketReconciliation,
  inventoryRecordId,
  type M1MarketReconciliation,
} from "./m1-reconciliation";
import { usableCorrectionSources } from "../../src/lib/correction-guards";
import { currentBuyerSummary } from "../../src/lib/selling-points";
import type { Car, Fact, Feature, Source } from "../../src/lib/types";

export type AuditRecord = {
  id?: string;
  familyId?: string;
  brand: string;
  model: string;
  vehicleClass?: string;
  modelAliases?: string[];
  bodyStyle?: string;
  trim?: string;
  catalogueVariantIds?: string[];
  catalogueCoverage?: string;
  orderStatus?: string;
  limitations?: string[];
  evidenceNote?: string;
  sourceUrls?: string[];
};
export type ReportInventory = {
  records: AuditRecord[];
  unverifiedLeads: AuditRecord[];
  benchmark?: { sourceUrl?: string; limitations?: string };
};
export type ReportInput = {
  cars: Car[];
  sources: Source[];
  features: Feature[];
  inventory: ReportInventory;
  m1Reconciliation?: M1MarketReconciliation;
};
export const coreFacts = [
  { key: "price_aud", label: "Price", target: 100 },
  { key: "range_km", label: "Range", target: 95 },
  { key: "battery_kwh", label: "Battery", target: 95 },
  { key: "dc_peak_kw", label: "DC peak power", target: 95 },
  { key: "dc_charge_time_min", label: "DC 10–80% time", target: 95 },
  { key: "ac_kw", label: "AC charging power", target: 95 },
  { key: "seats", label: "Seats", target: 95 },
  { key: "boot_l", label: "Boot", target: 95 },
  { key: "zero_to_100_s", label: "0–100 km/h", target: 95 },
  { key: "power_kw", label: "Motor power", target: 95 },
  { key: "drive", label: "Drive type", target: 95 },
  { key: "length_mm", label: "Length", target: 95 },
  { key: "width_mm", label: "Width", target: 95 },
  { key: "height_mm", label: "Height", target: 95 },
  { key: "towing_braked_kg", label: "Braked towing", target: 95 },
  { key: "warranty", label: "Vehicle warranty", target: 95 },
  { key: "battery_warranty", label: "Battery warranty", target: 95 },
] as const;
const rankedKeys: AttributeKey[] = [
  "range_km",
  "price_aud",
  "dc_charge_time_min",
  "seats",
  "boot_l",
  "towing_braked_kg",
];
export const isTierOne = (car: { vehicleClass?: string }) =>
  !car.vehicleClass || ["passenger", "ute"].includes(car.vehicleClass);
export const isOnSale = (car: Car) =>
  car.availability === "current_or_order_listed" ||
  (car.availability === "outgoing" &&
    car.availabilityEvidence?.stockStatus === "new_stock_listed" &&
    !!car.availabilityEvidence.sourceIds.length);
/** C1 also checks explicitly orderable versions; this never changes on-sale metrics. */
export const isCurrentListEligible = (
  car: Car,
  sources: Source[],
  asOf: string,
) =>
  isOnSale(car) ||
  (["announced_provisional", "outgoing"].includes(car.availability) &&
    ["preorder", "accepting_orders", "accepting_orders_advertised"].includes(
      car.availabilityEvidence?.orderStatus ?? "",
    ) &&
    !!car.availabilityEvidence &&
    evidenceFreshness(car.availabilityEvidence.checkedAt, "availability", asOf)
      .fresh &&
    usableCorrectionSources(
      car.availabilityEvidence.sourceIds,
      sources,
      asOf,
      car.availabilityEvidence.checkedAt,
    ));
export function hasValue(value: unknown): boolean {
  if (value == null || (typeof value === "number" && !Number.isFinite(value)))
    return false;
  if (typeof value === "string")
    return (
      !!value.trim() &&
      !/^(?:unknown|unverified|needs confirmation|not (?:published|stated|verified|available|applicable)|n\/?a)(?:\b|$)/i.test(
        value.trim(),
      )
    );
  if (Array.isArray(value)) return value.some(hasValue);
  if (typeof value === "object") return Object.values(value).some(hasValue);
  return true; // A sourced zero or false is a value, not a missing cell.
}
const pct = (count: number, total: number) =>
  total ? Math.round((count / total) * 1000) / 10 : null;
const showPct = (value: number | null) =>
  value === null ? "n/a" : `${value.toFixed(1)}%`;
const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();
function coreFact(
  car: Car,
  key: string,
): { fact?: Fact; value: unknown; issue?: string; ungraded?: boolean } {
  const aliases: Record<string, string[]> = {
    drive: ["drive", "drive_type", "drivetrain"],
    dc_charge_time_min: [
      "dc_charge_time_min",
      "dc_10_80_min",
      "dc_charge_10_80_min",
    ],
  };
  const candidates = (aliases[key] || [key])
    .map((alias) => car.facts[alias])
    .filter(Boolean);
  if (key === "dc_charge_time_min") {
    const fact = candidates.find(
      (f) =>
        hasValue(f.value) &&
        (f.key !== key ||
          /10\s*(?:%|per cent)?\s*(?:[–—-]|to)\s*(?:up to\s*)?80/i.test(
            `${f.basis} ${f.comparisonBasis} ${car.facts.dc_charge_window?.value || ""}`,
          )),
    );
    if (fact) return { fact, value: fact.value };
    const other = candidates.find((f) => hasValue(f.value));
    if (other)
      return {
        fact: other,
        value: null,
        issue: `Published charging duration uses a different or unestablished state-of-charge window: ${other.basis || other.comparisonBasis}`,
      };
  }
  const fact = candidates.find((f) => hasValue(f.value)) || candidates[0];
  if (
    key === "towing_braked_kg" &&
    fact &&
    hasValue(fact.value) &&
    !isBrakedTowingBasisEstablished(fact)
  )
    return {
      fact,
      value: null,
      issue:
        "Published towing limit does not establish a braked-towing measurement basis",
    };
  if (key === "drive" && !fact && hasValue(car.drive))
    return { value: car.drive, ungraded: true };
  return { fact, value: fact?.value };
}
export type Grade =
  "Confirmed" | "Check" | "Reported" | "Not published" | "Unreviewed";
/** Historical API name retained; only a valid, explicit M1 review now earns a grade. */
export function existingGrade(
  fact: Fact | undefined,
  filled: boolean,
  sources: Source[] = [],
  asOf = "",
  sourceIndex?: ReadonlyMap<string, Source>,
): Grade {
  if (!fact || !hasEarnedBuyerGrade(fact, sources, asOf, sourceIndex))
    return "Unreviewed";
  const grade = buyerGradeOf(fact);
  if (
    !grade ||
    (filled ? grade === "not_published" : grade !== "not_published")
  )
    return "Unreviewed";
  return gradeLabel(grade) as Grade;
}
function gradePattern(
  fact: Fact | undefined,
  issue?: string,
  grade?: Grade,
): string {
  if (issue) return oneLine(issue);
  if (grade === "Unreviewed") {
    if (!hasValue(fact?.value))
      return "Value missing; no valid completed two-source search recorded";
    return fact?.gradeReview
      ? "Recorded grade review has incomplete or invalid evidence"
      : "Published value has no auditable M1 grading review";
  }
  if (fact?.gradeReview?.reason) return oneLine(fact.gradeReview.reason);
  if (!hasValue(fact?.value))
    return "Value missing; no completed two-source search recorded";
  return "Published value has no auditable M1 grading review";
}
function gapReason(fact: Fact | undefined, issue?: string) {
  return oneLine(
    issue ||
      fact?.conditionExplanation ||
      fact?.qualifications.filter(Boolean).join(" ") ||
      fact?.basis ||
      "No effective value recorded; research has not established a published figure",
  );
}
function normalise(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\bbev\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}
function missingModels(cars: Car[], records: AuditRecord[]) {
  return records
    .filter(isTierOne)
    .filter(
      (record) =>
        !cars.some((car) => {
          if (
            normalise(car.brand) !== normalise(record.brand) ||
            (car.vehicleClass || "passenger") !==
              (record.vehicleClass || "passenger")
          )
            return false;
          if (record.trim && normalise(record.trim) !== normalise(car.trim))
            return false;
          const body =
            car.facts.body_style?.value ?? car.facts.body_type?.value;
          if (
            record.bodyStyle &&
            (typeof body !== "string" ||
              normalise(body) !== normalise(record.bodyStyle))
          )
            return false;
          if (record.catalogueVariantIds?.includes(car.id)) return true;
          // Exact model/body names only. A shared brand, family prefix or sibling trim is not proof.
          return [record.model, ...(record.modelAliases || [])].some(
            (name) =>
              normalise(name) === normalise(car.model) ||
              normalise(name) === normalise(`${car.brand} ${car.model}`),
          );
        }),
    )
    .map((record) => ({
      id: inventoryRecordId(record),
      brand: record.brand,
      model: record.model,
      vehicleClass: record.vehicleClass,
      orderStatus: record.orderStatus,
      reason: oneLine(
        [record.evidenceNote, ...(record.limitations || [])]
          .filter(Boolean)
          .join(" ") ||
          "Exact current Australian version list and sale eligibility remain unverified",
      ),
      sourceUrls: record.sourceUrls || [],
    }));
}
export type FreshnessEntry = {
  brand: string;
  carId: string;
  vehicle: string;
  kind: "fact" | "equipment" | "availability";
  key: string;
  label: string;
  checkedAt: string;
  windowDays: number;
  expiresOn: string | null;
  staleOn: string | null;
  state: "fresh" | "stale" | "invalid";
  sourceIds: string[];
  dueReason: "evidence age" | "offer deadline" | "model-year change";
};
export function freshnessEntries(
  input: Pick<ReportInput, "cars" | "features">,
  asOf: string,
): FreshnessEntry[] {
  const entries: FreshnessEntry[] = [];
  const carIndex = new Map(input.cars.map((car) => [car.id, car]));
  const add = (
    car: Car,
    kind: FreshnessEntry["kind"],
    key: string,
    label: string,
    checkedAt: string,
    sourceIds: string[],
    fact?: Fact,
    validUntil = fact?.validUntil,
  ) => {
    const age = fact
      ? factFreshness(fact, asOf)
      : evidenceFreshness(checkedAt, key, asOf);
    let expiresOn = age.expiresOn,
      staleOn = age.staleOn;
    let dueReason: FreshnessEntry["dueReason"] = "evidence age";
    let invalid = age.ageDays === null || age.ageDays < 0;
    if (validUntil !== undefined) {
      const deadline = evidenceDateValue(validUntil);
      if (!Number.isFinite(deadline)) invalid = true;
      else if (expiresOn && validUntil < expiresOn) {
        expiresOn = validUntil;
        staleOn = new Date(deadline + 86400000).toISOString().slice(0, 10);
        dueReason = "offer deadline";
      }
    }
    if (age.windowDays === 365 && fact?.modelYearChangedAt !== undefined) {
      const change = evidenceDateValue(fact.modelYearChangedAt);
      if (!Number.isFinite(change)) invalid = true;
      else if (
        fact.modelYearChangedAt > checkedAt &&
        staleOn &&
        fact.modelYearChangedAt < staleOn
      ) {
        staleOn = fact.modelYearChangedAt;
        expiresOn = new Date(change - 86400000).toISOString().slice(0, 10);
        dueReason = "model-year change";
      }
    }
    entries.push({
      brand: car.brand,
      carId: car.id,
      vehicle: `${car.brand} ${car.model} ${car.trim}`,
      kind,
      key,
      label,
      checkedAt,
      windowDays: age.windowDays,
      expiresOn,
      staleOn,
      state: invalid
        ? "invalid"
        : age.fresh && (!staleOn || asOf < staleOn)
          ? "fresh"
          : "stale",
      sourceIds,
      dueReason,
    });
  };
  for (const car of input.cars) {
    for (const fact of Object.values(car.facts))
      if (hasValue(fact.value))
        add(car, "fact", fact.key, fact.label, fact.date, fact.sourceIds, fact);
    if (car.availabilityEvidence)
      add(
        car,
        "availability",
        "availability",
        "Availability",
        car.availabilityEvidence.checkedAt,
        car.availabilityEvidence.sourceIds,
      );
    else add(car, "availability", "availability", "Availability", "", []);
  }
  for (const feature of input.features) {
    const car = carIndex.get(feature.variant_id);
    if (car && hasValue(feature.value))
      add(
        car,
        "equipment",
        feature.criterion,
        feature.criterion.replaceAll("_", " "),
        feature.last_evidence_date || feature.reviewed_date,
        feature.source_ids,
        undefined,
        feature.validUntil,
      );
  }
  return entries;
}
export function buildStaleReport(
  input: Pick<ReportInput, "cars" | "features">,
  asOf: string,
  days = 30,
  allTiers = false,
  thresholds?: AuThresholds,
) {
  const cars = allTiers ? input.cars : input.cars.filter(isTierOne);
  const end = new Date(`${asOf}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + days);
  const through = end.toISOString().slice(0, 10);
  const allEntries = freshnessEntries({ cars, features: input.features }, asOf);
  // Explicit historical observations stay auditable, but are not present-tense offers.
  // A source_ prefix alone never excludes active/inherited evidence.
  const historical = allEntries
    .filter(
      (entry) =>
        entry.kind === "fact" &&
        /^source_(?:expired|historical|superseded|withdrawn|previous|prior)(?:_|$)/.test(
          entry.key,
        ),
    )
    .map((entry) => ({
      ...entry,
      exclusionReason:
        "Explicit historical source observation; retained for audit, not a current offer or specification claim",
    }));
  const historicalKeys = new Set(
    historical.map((entry) => `${entry.carId}:${entry.kind}:${entry.key}`),
  );
  const entries = allEntries.filter(
    (entry) => !historicalKeys.has(`${entry.carId}:${entry.kind}:${entry.key}`),
  );
  const due = entries.filter(
    (entry) =>
      entry.state === "fresh" &&
      !!entry.staleOn &&
      entry.staleOn > asOf &&
      entry.staleOn <= through,
  );
  const overdue = entries.filter((entry) => entry.state === "stale");
  const invalid = entries.filter((entry) => entry.state === "invalid");
  // Money-threshold rows (WS4) use the 45-day price window and are reported apart from per-version claims.
  const thresholdRows = thresholds ? thresholdFreshness(thresholds, asOf) : [];
  const thresholdReport = thresholds
    ? {
        rows: thresholdRows,
        due: thresholdRows.filter(
          (row) =>
            row.state === "fresh" &&
            !!row.staleOn &&
            row.staleOn > asOf &&
            row.staleOn <= through,
        ),
        overdue: thresholdRows.filter((row) => row.state === "stale"),
        invalid: thresholdRows.filter((row) => row.state === "invalid"),
      }
    : null;
  const brandNames = [
    ...new Set([...due, ...overdue, ...invalid].map((e) => e.brand)),
  ].sort();
  const brands = brandNames.map((brand) => ({
    brand,
    due: due.filter((e) => e.brand === brand),
    overdue: overdue.filter((e) => e.brand === brand),
    invalid: invalid.filter((e) => e.brand === brand),
  }));
  return {
    asOf,
    through,
    days,
    scope: allTiers
      ? "All tiers"
      : "Tier 1 (passenger cars, SUVs, people movers and utes)",
    cars: cars.length,
    checkedClaims: entries.length,
    historical,
    due,
    overdue,
    invalid,
    brands,
    thresholds: thresholdReport,
  };
}
function coreCoverage(
  cars: Car[],
  sources: Source[],
  asOf: string,
  sourceIndex: ReadonlyMap<string, Source>,
) {
  const total = cars.length;
  const gaps: {
    brand: string;
    carId: string;
    vehicle: string;
    key: string;
    reason: string;
  }[] = [];
  const core = coreFacts.map((definition) => {
    const grades: Record<Grade, number> = {
      Confirmed: 0,
      Check: 0,
      Reported: 0,
      "Not published": 0,
      Unreviewed: 0,
    };
    let filled = 0;
    const lowGradeReasons = new Map<string, number>();
    for (const car of cars) {
      const cell = coreFact(car, definition.key),
        present = hasValue(cell.value);
      if (present) filled++;
      // An earned review describes the published fact, independently of whether
      // its measurement basis fills this strict core field.
      const grade = existingGrade(
        cell.fact,
        hasValue(cell.fact?.value),
        sources,
        asOf,
        sourceIndex,
      );
      grades[grade]++;
      if (!present)
        gaps.push({
          brand: car.brand,
          carId: car.id,
          vehicle: `${car.brand} ${car.model} ${car.trim}`,
          key: definition.key,
          reason: gapReason(cell.fact, cell.issue),
        });
      if (grade !== "Confirmed") {
        const reason = cell.ungraded
          ? "Drive value exists without a per-fact grade"
          : gradePattern(cell.fact, cell.issue, grade);
        lowGradeReasons.set(reason, (lowGradeReasons.get(reason) || 0) + 1);
      }
    }
    return {
      ...definition,
      total,
      filled,
      filledPercent: pct(filled, total),
      confirmedPercent: pct(grades.Confirmed, total),
      grades,
      reviewed: total - grades.Unreviewed,
      reviewedPercent: pct(total - grades.Unreviewed, total),
      gradingPasses: total > 0 && grades.Unreviewed === 0,
      passes: total > 0 && (filled / total) * 100 >= definition.target,
      explanation:
        total && grades.Confirmed / total < 0.5
          ? [...lowGradeReasons]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 2)
              .map(([reason, count]) => `${count}: ${reason}`)
              .join("; ")
          : null,
    };
  });
  return { core, gaps };
}
export function buildCoverageReport(input: ReportInput, asOf: string) {
  const tierOne = input.cars.filter(isTierOne),
    cars = tierOne.filter(isOnSale),
    total = cars.length;
  const sourceIndex = new Map(
    input.sources.map((source) => [source.id, source]),
  );
  const { core, gaps } = coreCoverage(cars, input.sources, asOf, sourceIndex);
  const policy = { asOf, maxAgeDays: 180 };
  const rankings = rankedKeys.map((key) => {
    const ranking = rankAttribute(cars, input.sources, key, policy);
    const ranked = ranking.groups.flatMap((group) =>
      group.entries.map((e) => e.car.id),
    );
    const reasons: Record<string, number> = {};
    for (const item of ranking.excluded)
      reasons[item.reason] = (reasons[item.reason] || 0) + 1;
    return {
      key,
      label: coreFacts.find((fact) => fact.key === key)!.label,
      ranked: ranked.length,
      percent: pct(ranked.length, total),
      rankedIds: ranked,
      passes: total > 0 && ranked.length / total >= 0.9,
      groups: ranking.groups.map((group) => ({
        vehicleClass: group.vehicleClass,
        basis: group.basis,
        unit: group.unit,
        count: group.entries.length,
      })),
      excluded: ranking.excluded,
      exclusionReasons: reasons,
    };
  });
  const summaryGaps = tierOne
    .filter((car) => {
      const summary = currentBuyerSummary(
        car.buyerSummary,
        input.sources,
        policy,
      );
      return (
        !summary?.strength?.text ||
        !summary.tradeoff?.text ||
        /evidence first|worth checking in detail/i.test(
          `${summary.strength.text} ${summary.tradeoff.text}`,
        )
      );
    })
    .map((car) => ({
      carId: car.id,
      brand: car.brand,
      vehicle: `${car.brand} ${car.model} ${car.trim}`,
      reason:
        "A currently supported strength and trade-off pair is not available",
    }));
  const summaryMissing = new Set(summaryGaps.map((gap) => gap.carId));
  const pairedOnSale = cars.filter((car) => !summaryMissing.has(car.id)).length;
  const reconciliation = buildMarketReconciliation(
    input.m1Reconciliation,
    tierOne.filter((car) => isCurrentListEligible(car, input.sources, asOf)),
    input.inventory,
    asOf,
  );
  const missing = missingModels(tierOne, input.inventory.records).filter(
    (record) =>
      !reconciliation.settledInventory.includes(`record:${record.id}`),
  );
  const leads = input.inventory.unverifiedLeads
    .filter(isTierOne)
    .filter(
      (record) =>
        !reconciliation.settledInventory.includes(
          `lead:${inventoryRecordId(record)}`,
        ),
    )
    .map((record) => ({
      id: inventoryRecordId(record),
      brand: record.brand,
      model: record.model,
      orderStatus: record.orderStatus,
      reason: oneLine(
        [record.evidenceNote, ...(record.limitations || [])]
          .filter(Boolean)
          .join(" ") ||
          "Australian sale eligibility and current version list have not been resolved",
      ),
      sourceUrls: record.sourceUrls || [],
    }));
  const ageing = buildStaleReport(
    { cars: tierOne, features: input.features },
    asOf,
  );
  const brandLabels = new Map<string, string>();
  for (const brand of [
    ...tierOne.map((car) => car.brand),
    ...missing.map((record) => record.brand),
    ...leads.map((record) => record.brand),
    ...reconciliation.issues.flatMap((issue) =>
      issue.brand ? [issue.brand] : [],
    ),
    ...(input.m1Reconciliation?.currentVersionReviews || []).map(
      (review) => review.brand,
    ),
  ])
    if (!brandLabels.has(normalise(brand)))
      brandLabels.set(normalise(brand), brand);
  const brands = [...brandLabels.values()].sort();
  const inAllRankings = cars.filter((car) =>
    rankings.every((ranking) => ranking.rankedIds.includes(car.id)),
  ).length;
  const reviewedCoreCells = core.reduce((sum, fact) => sum + fact.reviewed, 0);
  const totalCoreCells = total * coreFacts.length;
  const brandProgress = brands.map((brand) => {
    const brandCars = cars.filter(
      (car) => normalise(car.brand) === normalise(brand),
    );
    const brandCore = coreCoverage(brandCars, input.sources, asOf, sourceIndex);
    const closureIssues = reconciliation.issues.filter(
      (issue) => !issue.brand || normalise(issue.brand) === normalise(brand),
    );
    const summaryCount = summaryGaps.filter(
      (gap) => normalise(gap.brand) === normalise(brand),
    ).length;
    const agedCount = [...ageing.overdue, ...ageing.invalid].filter(
      (entry) => normalise(entry.brand) === normalise(brand),
    ).length;
    const rankingCoverage = rankings.map((ranking) => {
      const included = brandCars.filter((car) =>
        ranking.rankedIds.includes(car.id),
      ).length;
      return {
        key: ranking.key,
        ranked: included,
        total: brandCars.length,
        percent: pct(included, brandCars.length),
        passes: brandCars.length > 0 && included / brandCars.length >= 0.9,
      };
    });
    const unreviewedCore = brandCore.core.reduce(
      (sum, fact) => sum + fact.grades.Unreviewed,
      0,
    );
    const criteria = {
      C1: closureIssues.length === 0,
      C2: brandCore.core.every((fact) => fact.passes),
      C3: brandCore.core.every(
        (fact) =>
          fact.gradingPasses &&
          (fact.confirmedPercent! >= 50 || !!fact.explanation),
      ),
      C4:
        tierOne.some((car) => normalise(car.brand) === normalise(brand)) &&
        summaryCount === 0,
      C5: rankingCoverage.every((ranking) => ranking.passes),
      C6: agedCount === 0,
    };
    const researchClosureIssues = closureIssues.filter(
      (issue) => !!issue.brand,
    );
    const researchRemaining = [
      ...(!reconciliation.registryValid
        ? ["A current dated research registry is missing"]
        : []),
      ...(!brandCars.length ? ["No on-sale versions are established"] : []),
      ...(researchClosureIssues.length
        ? [
            `${researchClosureIssues.length} current-version or known model/lead dispositions remain open`,
          ]
        : []),
      ...(!criteria.C3
        ? [
            `${unreviewedCore} core grades need an auditable review or completed two-source search`,
          ]
        : []),
      ...(!criteria.C4
        ? [`${summaryCount} strength/trade-off pairs remain unsupported`]
        : []),
      ...(!criteria.C6 ? [`${agedCount} claims need a freshness check`] : []),
    ];
    const researchCompleted = researchRemaining.length === 0;
    const remaining = [
      ...(criteria.C1
        ? []
        : [`C1: ${closureIssues.length} current-list/reconciliation blockers`]),
      ...(criteria.C2
        ? []
        : [
            `C2: ${brandCore.gaps.length} core gaps; ${brandCore.core.filter((fact) => !fact.passes).length} fields below target`,
          ]),
      ...(criteria.C3 ? [] : [`C3: ${unreviewedCore} core grades unreviewed`]),
      ...(criteria.C4
        ? []
        : [`C4: ${summaryCount} missing strength/trade-off pairs`]),
      ...(criteria.C5
        ? []
        : [
            `C5: ${rankingCoverage.filter((ranking) => !ranking.passes).length} rankings below 90%`,
          ]),
      ...(criteria.C6 ? [] : [`C6: ${agedCount} aged or invalid claims`]),
    ];
    return {
      brand,
      onSaleVersions: brandCars.length,
      done: Object.values(criteria).every(Boolean),
      completionAsOf: Object.values(criteria).every(Boolean) ? asOf : null,
      researchCompleted,
      researchCompletedAsOf: researchCompleted ? asOf : null,
      researchRemaining,
      criteria,
      currentVersionReviews: (
        input.m1Reconciliation?.currentVersionReviews || []
      ).filter((review) => normalise(review.brand) === normalise(brand)),
      core: brandCore.core,
      coreGaps: brandCore.gaps.length,
      unreviewedCoreGrades: unreviewedCore,
      missingModels: missing.filter(
        (model) => normalise(model.brand) === normalise(brand),
      ).length,
      unresolvedLeads: leads.filter(
        (lead) => normalise(lead.brand) === normalise(brand),
      ).length,
      missingSummaries: summaryCount,
      agedOrInvalidClaims: agedCount,
      rankings: rankingCoverage,
      closureIssues,
      remaining,
      reason:
        remaining.join("; ") || "All six criteria demonstrated for this brand",
    };
  });
  return {
    asOf,
    allCatalogueVersions: input.cars.length,
    tierOneVersions: tierOne.length,
    onSaleVersions: total,
    denominatorNote:
      "On-sale denominator: current/order-listed Tier 1 versions plus outgoing versions with sourced new-stock advertisements. Announced/provisional and unevidenced outgoing versions are excluded; listings do not prove physical stock or accepted orders.",
    gradeNote: `Grades require an explicit sourced M1 review; legacy statuses do not earn Confirmed. ${reviewedCoreCells}/${totalCoreCells} on-sale core cells reviewed; unsuccessful searches need two cited sources. A reviewed value can still leave a measurement-basis gap; rankings apply their own eligibility checks.`,
    core,
    gaps,
    rankings,
    summaryGaps,
    pairedOnSale,
    pairedOnSalePercent: pct(pairedOnSale, total),
    inAllRankings,
    inAllRankingsPercent: pct(inAllRankings, total),
    missingModels: missing,
    unresolvedLeads: leads,
    reconciliation,
    grading: {
      reviewedCoreCells,
      totalCoreCells,
      reviewedPercent: pct(reviewedCoreCells, totalCoreCells),
    },
    brandsResearchCompleted: brandProgress
      .filter((brand) => brand.researchCompleted)
      .map((brand) => brand.brand),
    brandsResearchRemaining: brandProgress
      .filter((brand) => !brand.researchCompleted)
      .map((brand) => brand.brand),
    brandsDone: brandProgress
      .filter((brand) => brand.done)
      .map((brand) => brand.brand),
    brandsRemaining: brandProgress
      .filter((brand) => !brand.done)
      .map((brand) => brand.brand),
    brandProgress,
    criteria: [
      {
        id: "C1",
        pass: reconciliation.pass,
        detail: `${reconciliation.reviewedModels} exact current model lists reviewed; ${reconciliation.settledListEntryCount}/${reconciliation.listEntryCount} entries settled across ${reconciliation.independentListCount} independent lists; ${reconciliation.issues.length} blockers. ${missing.length} unmatched audit models; ${leads.length} unresolved leads.`,
        sources: (input.m1Reconciliation?.publishedLists || []).map(
          (list) => list.url,
        ),
      },
      {
        id: "C2",
        pass: core.every((fact) => fact.passes),
        detail: `${core.filter((fact) => fact.passes).length}/${core.length} core fields meet their target; ${gaps.length} version/field gaps, each with a reason in --details or --json.`,
      },
      {
        id: "C3",
        pass: core.every(
          (fact) =>
            fact.gradingPasses &&
            (fact.confirmedPercent! >= 50 || !!fact.explanation),
        ),
        detail: `${reviewedCoreCells}/${totalCoreCells} core cells have earned reviews; ${core.filter((fact) => fact.confirmedPercent !== null && fact.confirmedPercent < 50).length} fields below half Confirmed have patterns in --details. No grade quota is applied.`,
      },
      {
        id: "C4",
        pass: tierOne.length > 0 && summaryGaps.length === 0,
        detail: `${tierOne.length - summaryGaps.length}/${tierOne.length} Tier 1 versions have both a supported strength and trade-off (${pairedOnSale}/${total} on sale).`,
      },
      {
        id: "C5",
        pass: rankings.every((ranking) => ranking.passes),
        detail: `${rankings.filter((ranking) => ranking.passes).length}/6 ranking lists reach 90% of on-sale Tier 1 versions; measurement groups stay separate.`,
      },
      {
        id: "C6",
        pass: ageing.overdue.length === 0 && ageing.invalid.length === 0,
        detail: `${ageing.overdue.length} aged claims and ${ageing.invalid.length} invalid/future/undated claims across all Tier 1 versions, including availability and equipment. Model-year changes still require a recorded review.`,
      },
    ],
    ageing: {
      overdue: ageing.overdue,
      invalid: ageing.invalid,
      dueNext30Days: ageing.due.length,
      excludedHistory: ageing.historical,
    },
  };
}
export function formatCoverageReport(
  report: ReturnType<typeof buildCoverageReport>,
  details = false,
) {
  const keys = [
    "price_aud",
    "range_km",
    "battery_kwh",
    "dc_charge_time_min",
    "seats",
    "boot_l",
    "warranty",
  ];
  const cells = keys.map((key) => {
    const fact = report.core.find((f) => f.key === key)!;
    return `${showPct(fact.filledPercent)} / ${showPct(fact.confirmedPercent)}`;
  });
  const lines = [
    `Tier 1 coverage as of ${report.asOf}`,
    "",
    "| Tier 1 on-sale versions | Price | Range | Battery | DC time | Seats | Boot | Warranty | Strength + trade-off | In rankings |",
    "|---|---|---|---|---|---|---|---|---|---|",
    `| ${report.onSaleVersions} | ${cells.join(" | ")} | ${showPct(report.pairedOnSalePercent)} | ${showPct(report.inAllRankingsPercent)} |`,
    "Cells are % filled / % earned Confirmed; Warranty means vehicle warranty; In rankings means eligible in all six required lists (not a mean).",
    report.denominatorNote,
    report.gradeNote,
    `Scope: ${report.tierOneVersions} Tier 1 versions; all ${report.allCatalogueVersions} catalogue versions preserved.`,
    "",
    ...report.criteria.map(
      (c) => `${c.id} ${c.pass ? "PASS" : "OPEN"}: ${c.detail}`,
    ),
    "",
    `Brands done (research): ${report.brandsResearchCompleted.join(", ") || "none yet demonstrated"}; coverage-qualified (C1–C6): ${report.brandsDone.join(", ") || "none"}`,
    `Brands remaining (research, ${report.brandsResearchRemaining.length}): ${report.brandsResearchRemaining.join(", ") || "none recorded"}`,
    `Models still missing a matched catalogue version (${report.missingModels.length}; sale eligibility still needs reconciliation): ${
      report.missingModels
        .slice(0, 8)
        .map((m) => `${m.brand} ${m.model}`)
        .join("; ") || "none in the current audit"
    }${report.missingModels.length > 8 ? `; +${report.missingModels.length - 8} in --details` : ""}`,
  ];
  if (details) {
    lines.push(
      "",
      "Per-core facts: filled / earned Confirmed; counts by grade (Confirmed, Check, Reported, Not published, Unreviewed)",
      ...report.core.map(
        (f) =>
          `${f.label}: ${showPct(f.filledPercent)} / ${showPct(f.confirmedPercent)} (${Object.values(f.grades).join(", ")}); target ${f.target}%${f.explanation ? `; under half Confirmed: ${f.explanation}` : ""}`,
      ),
      "",
      "Ranking coverage (eligible; shown in separate measurement groups)",
      ...report.rankings.map(
        (r) =>
          `${r.label}: ${r.ranked}/${report.onSaleVersions} (${showPct(r.percent)}), ${r.groups.length} groups; excluded: ${
            Object.entries(r.exclusionReasons)
              .map(([why, n]) => `${n} ${why}`)
              .join("; ") || "none"
          }`,
      ),
      "",
      "Brands: actual remaining work",
      ...report.brandProgress.map(
        (brand) => `${brand.brand}: ${brand.done ? "DONE" : brand.reason}`,
      ),
      "",
      "C1 auditable reconciliation blockers",
      ...report.reconciliation.issues.map(
        (issue) =>
          `${issue.brand || "Market"}: ${issue.reason}${issue.reference ? ` [${issue.reference}]` : ""}`,
      ),
      "",
      "C1 model differences and open leads",
      ...report.missingModels.map(
        (m) =>
          `${m.brand} ${m.model}: ${m.reason} [${m.sourceUrls.join(", ")}]`,
      ),
      ...report.unresolvedLeads.map(
        (m) =>
          `Lead: ${m.brand} ${m.model}: ${m.reason} [${m.sourceUrls.join(", ")}]`,
      ),
      "",
      "C2 missing core facts (one line per version/field)",
      ...report.gaps.map(
        (g) => `${g.vehicle} [${g.carId}] — ${g.key}: ${g.reason}`,
      ),
      "",
      "C4 missing strength/trade-off",
      ...report.summaryGaps.map(
        (g) => `${g.vehicle} [${g.carId}]: ${g.reason}`,
      ),
      "",
      "C5 measurement groups",
      ...report.rankings.flatMap((r) =>
        r.groups.map(
          (g) =>
            `${r.label}: ${g.vehicleClass}, ${g.basis}, ${g.unit}: ${g.count} versions`,
        ),
      ),
      "",
      "C6 aged/invalid claims",
      ...[...report.ageing.overdue, ...report.ageing.invalid].map(
        (e) =>
          `${e.vehicle} [${e.carId}] ${e.kind}/${e.key}: checked ${e.checkedAt || "undated"}; stale ${e.staleOn || "unknown"}`,
      ),
    );
  } else
    lines.push(
      "",
      "Use --details for all 17 core grade splits, low-Confirmed patterns, individual gaps, model reasons and ranking groups; --json for the complete structured report.",
    );
  return lines.join("\n");
}
export function formatStaleReport(
  report: ReturnType<typeof buildStaleReport>,
  details = false,
) {
  const lines = [
    `Freshness report: ${report.asOf} through ${report.through} (${report.days} days)`,
    report.scope,
    "Windows: prices/offers/availability 45 days; range/battery/charging/performance/equipment 180; dimensions/seats/towing/warranty 365 (or recorded model-year change). Ageing changes labels and ranking eligibility; it does not remove cards.",
    `${report.historical.length} explicitly historical source observations retained separately in --json; excluded from current-claim freshness.`,
    `${report.due.length} claims age out in this window; ${report.overdue.length} already aged; ${report.invalid.length} invalid/future/undated. ${report.checkedClaims} published facts, equipment claims and availability records checked across ${report.cars} versions.`,
  ];
  if (!report.brands.length)
    lines.push("No claims require a freshness check in this window.");
  for (const brand of report.brands) {
    lines.push(
      "",
      `${brand.brand}: ${brand.due.length} due; ${brand.overdue.length} already aged; ${brand.invalid.length} dates need review`,
    );
    const grouped = new Map<string, FreshnessEntry[]>();
    for (const entry of brand.due) {
      const key = `${entry.staleOn}|${entry.kind}|${entry.key}|${entry.windowDays}|${entry.dueReason}`;
      grouped.set(key, [...(grouped.get(key) || []), entry]);
    }
    for (const group of [...grouped.values()].sort((a, b) =>
      `${a[0].staleOn}${a[0].key}`.localeCompare(`${b[0].staleOn}${b[0].key}`),
    )) {
      const first = group[0];
      lines.push(
        `  ${first.staleOn}: ${first.label} [${first.kind}/${first.key}], ${new Set(group.map((e) => e.carId)).size} versions (${first.dueReason === "evidence age" ? `${first.windowDays}-day window` : first.dueReason})`,
      );
    }
    if (details)
      for (const entry of [...brand.due, ...brand.overdue, ...brand.invalid])
        lines.push(
          `  ${entry.state}: ${entry.vehicle} [${entry.carId}] ${entry.kind}/${entry.key}; checked ${entry.checkedAt || "undated"}; fresh through ${entry.expiresOn || "unknown"}; stale ${entry.staleOn || "unknown"}`,
        );
  }
  if (report.thresholds) {
    const t = report.thresholds;
    lines.push(
      "",
      `Money thresholds (45-day window): ${t.due.length} due; ${t.overdue.length} already aged; ${t.invalid.length} dates need review; ${t.rows.length} rows checked`,
    );
    const line = (label: string, row: ThresholdFreshness) =>
      `  ${label}: ${row.label} [${row.key}]; checked ${row.checkedAt || "undated"}; fresh through ${row.expiresOn || "unknown"}; stale ${row.staleOn || "unknown"}; ${row.status}`;
    for (const row of t.due) lines.push(line("due", row));
    for (const row of t.overdue) lines.push(line("aged", row));
    for (const row of t.invalid) lines.push(line("review", row));
  }
  if (!details)
    lines.push(
      "",
      "Use --details for exact version IDs and checked dates, or --json for complete entries.",
    );
  return lines.join("\n");
}
