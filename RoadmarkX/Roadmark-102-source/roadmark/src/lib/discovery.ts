/** Pure discovery policy. Never infer market leadership from a partial catalogue. */
import { carEvidenceIds } from "./page-evidence";
import { matchesSearch } from "./search";
import { hasCarAvatarShape } from "./car-avatar-shapes";
import { offerExpired } from "./fact-validity";
import type { Car, Fact, Source } from "./types";

export const attributes = [
  {
    key: "length_mm",
    title: "A smaller footprint",
    label: "Exterior length",
    direction: "lower",
    note: "Shorter exterior length can suit a tight parking space. Check width, turning circle and door clearance too; length alone does not prove easier parking.",
  },
  {
    key: "range_km",
    title: "Go further",
    label: "Claimed range",
    direction: "higher",
    note: "Compare the same test cycle. Claimed range is not a real-world guarantee.",
  },
  {
    key: "price_aud",
    title: "Spend less",
    label: "Listed price",
    direction: "lower",
    note: "Compare the same price basis. List price and driveaway quotes are separate.",
  },
  {
    key: "dc_charge_time_min",
    title: "Shorter charging stops",
    label: "DC charging time",
    direction: "lower",
    note: "Only matching charge windows and test conditions can be ranked.",
  },
  {
    key: "towing_braked_kg",
    title: "Bring more along",
    label: "Braked towing",
    direction: "higher",
    note: "Check towbar, payload and combination-mass limits for your exact configuration.",
  },
  {
    key: "seats",
    title: "Room for your people",
    label: "Seats",
    direction: "higher",
    note: "Seat count is not a measure of comfort, child-seat fit or usable luggage space.",
  },
  {
    key: "boot_l",
    title: "Space for everyday life",
    label: "Cargo behind occupied seats",
    direction: "higher",
    note: "Measurement method and seating configuration must match. Folded-seat capacity is separate.",
  },
] as const;
export type AttributeKey = (typeof attributes)[number]["key"];

/** Client discovery needs ranked facts and illustration dimensions; preserve each retained claim intact.
 * Detailed pages and comparison packs continue to use the full shared catalogue.
 */
export function discoveryCars(cars: Car[]): Car[] {
  const keys = new Set<string>(attributes.map((attribute) => attribute.key));
  return cars.map((car) => {
    const projected: Car = {
      ...car,
      // Summaries are already guarded against complete server-side provenance.
      // Discovery needs only the bounded-record notice, scope and ranking gate.
      // Keep the full configuration in catalogue/detail/comparison/export packs.
      ...(car.configurationEvidence
        ? {
            configurationEvidence: {
              rankingEligible: car.configurationEvidence.rankingEligible,
              completeVehicleCountEligible:
                car.configurationEvidence.completeVehicleCountEligible,
              projectionScope: car.configurationEvidence.projectionScope,
            },
          }
        : {}),
      facts: Object.fromEntries(
        Object.entries(car.facts).filter(
          ([key]) =>
            keys.has(key) ||
            (hasCarAvatarShape(car.modelId) &&
              (key === "height_mm" || key === "wheelbase_mm")),
        ),
      ),
    };
    // Omitting unused illustration dimensions must not sever their citation
    // context. Keep only IDs not already carried by retained claims/guards.
    const retainedIds = carEvidenceIds([projected]);
    const omittedIds = new Set<string>();
    for (const key of ["height_mm", "wheelbase_mm"]) {
      if (Object.hasOwn(projected.facts, key)) continue;
      const fact = car.facts[key];
      if (!fact) continue;
      for (const id of [
        ...fact.sourceIds,
        ...fact.issues.flatMap((issue) => issue.source_ids),
      ]) {
        if (!retainedIds.has(id)) omittedIds.add(id);
      }
    }
    if (omittedIds.size)
      projected.projectedEvidenceSourceIds = [
        ...(projected.projectedEvidenceSourceIds ?? []),
        ...omittedIds,
      ];
    return projected;
  });
}

export type EvidencePolicy = { asOf: string; maxAgeDays: number };
export type RankEntry = { car: Car; fact: Fact; rank: number; tied: boolean };
export type RankGroup = {
  vehicleClass: string;
  basis: string;
  unit: string;
  entries: RankEntry[];
};
export type ExcludedClaim = { carId: string; reason: string };
const day = 86_400_000;
function dateValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) &&
    new Date(parsed).toISOString().slice(0, 10) === value
    ? parsed
    : NaN;
}
export function freshDate(value: string, policy: EvidencePolicy) {
  const age = (dateValue(policy.asOf) - dateValue(value)) / day;
  return Number.isFinite(age) && age >= 0 && age <= policy.maxAgeDays;
}
export function exclusionReason(
  car: Car,
  fact: Fact | undefined,
  sources: Source[],
  policy: EvidencePolicy,
  sourceIndex = new Map(sources.map((source) => [source.id, source])),
): string | null {
  if (
    car.configurationEvidence &&
    car.configurationEvidence.rankingEligible !== true
  )
    return "Bounded configuration is not eligible for attribute rankings";
  if (
    car.availabilityEvidence &&
    !freshDate(car.availabilityEvidence.checkedAt, policy)
  )
    return "Availability evidence needs a fresh check";
  const stockOnly =
    car.availability === "outgoing" &&
    car.availabilityEvidence?.stockStatus === "new_stock_listed";
  if (car.availability !== "current_or_order_listed" && !stockOnly)
    return "Not current/order-listed or evidenced outgoing new stock";
  if (stockOnly && !car.availabilityEvidence?.sourceIds.length)
    return "Outgoing new stock lacks supporting evidence";
  if (car.availabilityEvidence && !car.availabilityEvidence.sourceIds.length)
    return "Availability evidence lacks supporting sources";
  if (!fact || typeof fact.value !== "number" || !Number.isFinite(fact.value))
    return "No finite numeric value";
  if (offerExpired(fact, policy.asOf))
    return "Offer has expired or has an invalid deadline";
  if (fact.status !== "standard")
    return "Conditional, unsupported or non-standard evidence";
  if (fact.market !== "AU") return "Not an Australian-market claim";
  if (!fact.comparisonBasis?.trim()) return "Measurement basis missing";
  if (
    fact.key === "boot_l" &&
    /method not stated|method unspecified|standard.*(?:unknown|unverified)/i.test(
      fact.comparisonBasis,
    )
  )
    return "Cargo measurement method is not established";
  if (!freshDate(fact.date, policy))
    return "Claim evidence needs a fresh check";
  if (fact.issues.length)
    return "Unresolved claim qualification requires review";
  if (!fact.sourceIds.length) return "No supporting source";
  const ids = [
    ...fact.sourceIds,
    ...(car.availabilityEvidence?.sourceIds ?? []),
  ];
  const cited = ids.map((id) => sourceIndex.get(id));
  if (cited.some((s) => !s)) return "Supporting source missing";
  if (
    cited.some(
      (s) =>
        s &&
        (!/^https?:\/\//.test(s.url) ||
          !freshDate(s.accessed_date, policy) ||
          s.access_limitation ||
          s.conflict ||
          s.publication_hold),
    )
  )
    return "Source stale, inaccessible or held for review";
  return null;
}
export function rankAttribute(
  cars: Car[],
  sources: Source[],
  key: AttributeKey,
  policy: EvidencePolicy,
): { groups: RankGroup[]; excluded: ExcludedClaim[] } {
  const attribute = attributes.find((a) => a.key === key)!;
  const buckets = new Map<string, { car: Car; fact: Fact }[]>();
  const excluded: ExcludedClaim[] = [];
  const sourceIndex = new Map(sources.map((source) => [source.id, source]));
  for (const car of cars) {
    const fact = car.facts[key];
    const reason = exclusionReason(car, fact, sources, policy, sourceIndex);
    if (reason) {
      excluded.push({ carId: car.id, reason });
      continue;
    }
    const bucket = JSON.stringify([
      car.vehicleClass || "passenger",
      fact.comparisonBasis,
      fact.unit,
    ]);
    buckets.set(bucket, [...(buckets.get(bucket) || []), { car, fact }]);
  }
  const groups = [...buckets.values()]
    .map((items) => {
      items.sort(
        (a, b) =>
          (Number(a.fact.value) - Number(b.fact.value)) *
            (attribute.direction === "lower" ? 1 : -1) ||
          a.car.id.localeCompare(b.car.id),
      );
      const ranks = new Map<number, number>();
      const frequencies = new Map<number, number>();
      items.forEach((item, index) => {
        const value = Number(item.fact.value);
        if (!ranks.has(value)) ranks.set(value, index + 1);
        frequencies.set(value, (frequencies.get(value) || 0) + 1);
      });
      const entries = items.map((item) => ({
        ...item,
        rank: ranks.get(Number(item.fact.value))!,
        tied: frequencies.get(Number(item.fact.value))! > 1,
      }));
      return {
        vehicleClass: items[0].car.vehicleClass || "passenger",
        basis: items[0].fact.comparisonBasis,
        unit: items[0].fact.unit,
        entries,
      };
    })
    .sort(
      (a, b) =>
        b.entries.length - a.entries.length || a.basis.localeCompare(b.basis),
    );
  return { groups, excluded };
}
export function buildStrengthsIndex(
  cars: Car[],
  sources: Source[],
  policy: EvidencePolicy,
) {
  const result = new Map<
    string,
    {
      attribute: (typeof attributes)[number];
      car: Car;
      fact: Fact;
      rank: number;
      tied: boolean;
      compared: number;
      basis: string;
      percentile: number;
    }[]
  >();
  for (const car of cars) result.set(car.id, []);
  for (const attribute of attributes) {
    const ranking = rankAttribute(cars, sources, attribute.key, policy);
    for (const group of ranking.groups) {
      const values = [
        ...new Set(group.entries.map((e) => Number(e.fact.value))),
      ];
      if (
        new Set(group.entries.map((e) => e.car.modelFamily || e.car.family))
          .size < 2 ||
        values.length < 2
      )
        continue;
      const positions = new Map(values.map((value, index) => [value, index]));
      for (const entry of group.entries) {
        const worse =
          values.length - 1 - positions.get(Number(entry.fact.value))!;
        result.get(entry.car.id)!.push({
          attribute,
          ...entry,
          compared: group.entries.length,
          basis: group.basis,
          percentile: worse / (values.length - 1),
        });
      }
    }
  }
  for (const values of result.values())
    values.sort(
      (a, b) =>
        b.percentile - a.percentile ||
        a.attribute.key.localeCompare(b.attribute.key),
    );
  return result;
}
export function vehicleStrengths(
  car: Car,
  cars: Car[],
  sources: Source[],
  policy: EvidencePolicy,
) {
  return buildStrengthsIndex(cars, sources, policy).get(car.id) || [];
}
export type MarketAudit = {
  checkedAt: string;
  complete: boolean;
  eligibleTrimIds: string[];
  reviewedTrimIds: string[];
  unresolved: string[];
};
export function marketLeaderAllowed(
  audit: MarketAudit,
  policy: EvidencePolicy,
  rankedTrimIds: string[],
) {
  const eligible = new Set(audit.eligibleTrimIds),
    reviewed = new Set(audit.reviewedTrimIds),
    ranked = new Set(rankedTrimIds);
  return (
    audit.complete &&
    freshDate(audit.checkedAt, policy) &&
    audit.unresolved.length === 0 &&
    eligible.size > 1 &&
    [...eligible].every((id) => reviewed.has(id) && ranked.has(id))
  );
}

/** Discovery filters never turn an advertisement into physical-stock confirmation. */
export function filterDiscoveryCars(
  cars: Car[],
  query: string,
  vehicleClass: string,
  stockOnly: boolean,
  policy: EvidencePolicy,
) {
  return cars.filter(
    (car) =>
      matchesSearch(`${car.brand} ${car.model} ${car.trim}`, query) &&
      (!vehicleClass || (car.vehicleClass || "passenger") === vehicleClass) &&
      (!stockOnly ||
        (car.availabilityEvidence?.stockStatus === "new_stock_listed" &&
          car.availabilityEvidence.sourceIds.length > 0 &&
          freshDate(car.availabilityEvidence.checkedAt, policy))),
  );
}
