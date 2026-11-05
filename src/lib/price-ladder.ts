/** M1 price admission. Original source facts and research snapshots stay immutable. */
import guards from "../../data/price-ladder-guards-2026-10-13.json";
import { sameReviewedState } from "./correction-guards";
import existing from "../../data/price-ladder-existing-candidates-2026-10-13.json";
import premium from "../../data/price-ladder-premium-candidates-2026-10-13.json";
import { offerExpired } from "./fact-validity";
import type { Car, Fact, Source } from "./types";

export type PriceRung = 1 | 2 | 3 | 4 | 5 | 6;
export type PriceComparisonBasis = "Before on-road costs" | "Driveaway" | "";
export type PriceCandidate = {
  variantId: string;
  value: number;
  sourceIds: string[];
  sourceKey: string;
  sourcePointer: string;
  date: string;
  rung: PriceRung;
  basisTag: string;
  comparisonBasis: PriceComparisonBasis;
  originalBasis?: string;
  state?: string;
  publisher?: string;
  validFrom?: string;
  validUntil?: string;
  qualifications: string[];
  conditionExplanation?: string;
  rankingEligible?: boolean;
};
type PriceOverlay = { candidates: PriceCandidate[]; sources?: Source[] };
const overlays = [existing, premium] as unknown as PriceOverlay[];
const reviewed = guards as unknown as {
  facts: Record<string, Record<string, Fact>>;
  sources: Record<string, Source>;
};
/** Full-state guards prevent an old admission overlay overriding a later correction. */
export function priceCandidateMatchesReviewedState(
  candidate: PriceCandidate,
  car: Car,
  sources: Source[],
): boolean {
  const expected = reviewed.facts[car.id];
  if (!expected || !expected.price_aud) return false;
  try {
    if (!sameReviewedState(expected.price_aud, car.facts.price_aud))
      return false;
    if (
      expected[candidate.sourceKey] &&
      !sameReviewedState(
        expected[candidate.sourceKey],
        car.facts[candidate.sourceKey],
      )
    )
      return false;
    return candidate.sourceIds.every((id) => {
      const current = sources.filter((source) => source.id === id);
      return (
        current.length === 1 &&
        !!reviewed.sources[id] &&
        sameReviewedState(reviewed.sources[id], current[0])
      );
    });
  } catch {
    return false;
  }
}
export const priceLadderSources: Source[] = overlays.flatMap(
  (o) => o.sources ?? [],
);
export const priceCandidates: PriceCandidate[] = overlays.flatMap(
  (o) => o.candidates,
);
const candidatesByVariant = new Map<string, PriceCandidate[]>();
for (const candidate of priceCandidates) {
  const values = candidatesByVariant.get(candidate.variantId) ?? [];
  values.push(candidate);
  candidatesByVariant.set(candidate.variantId, values);
}

const validDate = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  Number.isFinite(Date.parse(`${date}T00:00:00Z`)) &&
  new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;

/** Recognize only explicit labels in retained price provenance, never infer a basis. */
function explicitPriceBasis(value: string | undefined): PriceComparisonBasis {
  const label = (value ?? "").toLowerCase().replace(/[-_‐‑–—]/g, " ");
  // Ambiguous, negated or unresolved wording is not an affirmative basis label.
  // Abbreviations (including MLP/RRP) alone do not establish on-road treatment.
  if (
    /\b(?:not|no|non|never|neither|nor|without|unknown|unconfirmed|unverified|unresolved|unclear|unspecified|whether)\b|n['’]t\b|\?/.test(
      label,
    )
  )
    return "";
  const before = /\b(?:before|excluding|excludes) on road costs\b/.test(label);
  const driveaway = /\bdrive ?away\b/.test(label);
  return before === driveaway
    ? ""
    : before
      ? "Before on-road costs"
      : "Driveaway";
}

/** A price may be shown without a comparable basis; it can never invent one. */
export function priceCandidateRejection(
  candidate: PriceCandidate,
  variantId: string,
  sources: Source[],
  asOf: string,
): string | null {
  if (candidate.variantId !== variantId)
    return "Price is for a different version";
  if (!Number.isFinite(candidate.value) || candidate.value <= 0)
    return "No positive published price";
  if (![1, 2, 3, 4, 5, 6].includes(candidate.rung)) return "Invalid price rung";
  if (!validDate(asOf) || !validDate(candidate.date) || candidate.date > asOf)
    return "Invalid or future observation date";
  if (
    candidate.validFrom &&
    (!validDate(candidate.validFrom) || candidate.validFrom > asOf)
  )
    return "Offer has not started";
  if (offerExpired(candidate, asOf))
    return "Offer has expired or has an invalid deadline";
  if (!candidate.sourcePointer || !candidate.sourceKey)
    return "Price provenance missing";
  if (!candidate.sourceIds.length) return "No supporting source";
  const index = new Map(sources.map((source) => [source.id, source]));
  if (
    candidate.sourceIds.some((id) => {
      const source = index.get(id);
      return (
        !source ||
        !/^(AU|Australia)$/i.test(source.market) ||
        !/^https?:\/\//.test(source.url)
      );
    })
  )
    return "Australian supporting source missing";
  if (
    candidate.rung === 4 &&
    !/^(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)$/.test(candidate.state ?? "")
  )
    return "State-specific price needs its exact state";
  if (
    !["", "Before on-road costs", "Driveaway"].includes(
      candidate.comparisonBasis,
    )
  )
    return "Unrecognized price comparison basis";
  if (candidate.comparisonBasis) {
    for (const field of ["basisTag", "originalBasis"] as const) {
      const retainedBasis = explicitPriceBasis(candidate[field]);
      if (retainedBasis && retainedBasis !== candidate.comparisonBasis)
        return `Price comparison basis contradicts retained price provenance (${field})`;
    }
  }
  return null;
}

/** Rung order, then newest evidence; never choose a cheaper sibling/state quote. */
export function selectPriceCandidate(
  candidates: PriceCandidate[],
  variantId: string,
  sources: Source[],
  asOf = existing.policyDate,
): PriceCandidate | undefined {
  return candidates
    .filter(
      (candidate) =>
        !priceCandidateRejection(candidate, variantId, sources, asOf),
    )
    .sort(
      (a, b) =>
        a.rung - b.rung ||
        b.date.localeCompare(a.date) ||
        Number(b.state === "NSW") - Number(a.state === "NSW") ||
        (a.state ?? "").localeCompare(b.state ?? "") ||
        a.sourceKey.localeCompare(b.sourceKey),
    )[0];
}

function existingPriceCandidate(
  car: Car,
  sources: Source[],
): PriceCandidate | undefined {
  const fact = car.facts.price_aud;
  if (
    !fact ||
    typeof fact.value !== "number" ||
    !Number.isFinite(fact.value) ||
    fact.value <= 0
  )
    return undefined;
  if (fact.priceEvidence) {
    return {
      variantId: car.id,
      value: fact.value,
      sourceIds: fact.sourceIds,
      sourceKey: fact.priceEvidence.sourceKey,
      sourcePointer: fact.priceEvidence.sourcePointer,
      date: fact.date,
      rung: fact.priceEvidence.rung,
      basisTag: fact.priceEvidence.basisTag,
      comparisonBasis: ["Before on-road costs", "Driveaway"].includes(
        fact.comparisonBasis,
      )
        ? (fact.comparisonBasis as PriceComparisonBasis)
        : "",
      originalBasis: fact.priceEvidence.originalBasis,
      state: fact.priceEvidence.state,
      publisher: fact.priceEvidence.publisher,
      validUntil: fact.validUntil,
      qualifications: fact.qualifications,
      conditionExplanation: fact.conditionExplanation,
      rankingEligible: fact.priceEvidence.rankingEligible,
    };
  }
  // Already-admitted amounts keep the supplied measurement basis. This only
  // assigns an honest ladder label; it does not extract arbitrary extra fields.
  const text = `${fact.basis} ${fact.qualifications.join(" ")}`;
  const before =
    /before .*on.road|excluding on.road|excludes on.road|on.road costs (?:calculated )?separat|before location-related/i.test(
      text,
    );
  const driveaway = !before && /drive.?away/i.test(fact.basis);
  const comparisonBasis: PriceComparisonBasis = before
    ? "Before on-road costs"
    : driveaway
      ? "Driveaway"
      : "";
  // The old baseline used whole-variant citation bundles. Identify the exact
  // source which actually publishes its price, without inheriting maker status
  // from an unrelated warranty or specification citation.
  const pricingRules: { id: string; rung: PriceRung }[] = [
    { id: "v2_tesla_l_launch_au_report", rung: 5 },
    { id: "geely_price_change", rung: 5 },
    { id: "v2_zeekr_black_price", rung: 5 },
    { id: "zeekr_au_price_20250808", rung: 5 },
    { id: "v2_kia_ev3_awd_report", rung: 5 },
    { id: "kia_ev3_price_news", rung: 5 },
    { id: "kia_ev5_price_review", rung: 5 },
    { id: "r10_refresh_byd_evo_config", rung: 6 },
    { id: "tesla_y_config", rung: 3 },
    { id: "tesla_3_config", rung: 3 },
    { id: "jaecoo_offers_oct2026", rung: 1 },
    { id: "byd_atto3_price", rung: 1 },
  ];
  const priceRule = pricingRules.find((rule) =>
    fact.sourceIds.includes(rule.id),
  );
  const sourceIds = priceRule ? [priceRule.id] : fact.sourceIds;
  const cited = sources.filter((source) => sourceIds.includes(source.id));
  const reported =
    /reported|secondary|price guide/i.test(fact.basis) ||
    fact.resolvedElsewhere;
  const dealer = /dealer (?:ad|advert|specific)/i.test(fact.basis);
  const configurator = /configurator|API price field|selection amount/i.test(
    text,
  );
  const state = driveaway
    ? text.match(/\b(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)\b/)?.[1]
    : undefined;
  if (!before && !driveaway && !configurator && !reported && !dealer)
    return undefined;
  const rung: PriceRung =
    priceRule?.rung ??
    (dealer
      ? 6
      : reported
        ? 5
        : state
          ? 4
          : configurator
            ? 3
            : driveaway
              ? 2
              : 1);
  const publication = cited.find((source) =>
    /review|media|publication|price_guide|secondary/i.test(source.source_type),
  );
  const publisher =
    rung === 5
      ? fact.basis.match(/reported by ([^,;.]+)/i)?.[1] ||
        publication?.publisher ||
        cited[0]?.publisher ||
        "the cited publication"
      : undefined;
  const basisTag =
    rung === 6
      ? "Dealer ad"
      : rung === 5
        ? `Reported by ${publisher}`
        : rung === 4
          ? `Maker’s ${state} driveaway`
          : rung === 3
            ? "Maker’s configurator"
            : rung === 2
              ? "Maker’s national driveaway"
              : "Maker’s list price";
  return {
    variantId: car.id,
    value: fact.value,
    sourceIds,
    sourceKey: "price_aud",
    sourcePointer: `catalogue-before-M1/${car.id}/facts/price_aud`,
    date: fact.date,
    rung,
    basisTag: `${basisTag}${comparisonBasis === "Before on-road costs" ? " · before on-road costs" : ""}`,
    comparisonBasis,
    originalBasis: fact.basis,
    publisher,
    state,
    validUntil: fact.validUntil,
    qualifications: fact.qualifications,
    conditionExplanation: fact.conditionExplanation,
    rankingEligible: !!comparisonBasis && rung < 5,
  };
}

export function applyPriceLadder(
  car: Car,
  sources: Source[],
  asOf = existing.policyDate,
): Car {
  if (car.vehicleClass && !["passenger", "ute"].includes(car.vehicleClass))
    return car;
  const prior = existingPriceCandidate(car, sources);
  const candidate = selectPriceCandidate(
    [
      ...(candidatesByVariant.get(car.id) ?? []).filter((row) =>
        priceCandidateMatchesReviewedState(row, car, sources),
      ),
      ...(prior ? [prior] : []),
    ],
    car.id,
    sources,
    asOf,
  );
  if (!candidate) return car;
  const sourceFact = car.facts[candidate.sourceKey];
  const original = sourceFact ?? car.facts.price_aud;
  const reported = candidate.rung >= 5;
  const rankingEligible =
    candidate.rankingEligible !== false &&
    !!candidate.comparisonBasis &&
    !reported;
  const qualifications = [...new Set(candidate.qualifications)];
  const fact: Fact = {
    ...original,
    key: "price_aud",
    label: "Published price",
    value: candidate.value,
    unit: "AUD",
    basis: candidate.basisTag,
    comparisonBasis: candidate.comparisonBasis,
    status: reported
      ? "not_verified"
      : candidate.conditionExplanation || qualifications.length
        ? "conditional"
        : "standard",
    sourceIds: candidate.sourceIds,
    date: candidate.date,
    market: "AU",
    scope: original?.scope ?? `${car.brand} ${car.model} ${car.trim}`,
    qualifications,
    issues: original?.issues ?? [],
    validUntil: candidate.validUntil,
    conditionExplanation:
      candidate.conditionExplanation ?? qualifications.join(" "),
    resolvedElsewhere: reported,
    priceEvidence: {
      rung: candidate.rung,
      basisTag: candidate.basisTag,
      sourceKey: candidate.sourceKey,
      sourcePointer: candidate.sourcePointer,
      state: candidate.state,
      publisher: candidate.publisher,
      originalBasis:
        candidate.originalBasis ??
        (sourceFact && sourceFact.value !== null
          ? sourceFact.basis
          : candidate.basisTag),
      rankingEligible,
    },
  };
  return { ...car, facts: { ...car.facts, price_aud: fact } };
}
