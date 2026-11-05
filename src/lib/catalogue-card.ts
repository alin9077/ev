import { buyerAvailability, buyerAvailabilityText } from "./buyer-availability";
import { buyerDisplayCopy } from "./buyer-display-copy";
import { currentBuyerSummary } from "./selling-points";
import type { EvidencePolicy } from "./discovery";
import type { BuyerAvailability } from "./buyer-availability";
import type { Car, Fact, Source } from "./types";

/** A sentence shown on more cards than this is a standing note, not card content. */
export const REPEATED_SENTENCE_LIMIT = 20;

/** Sentences that appear on more than the limit of the given cars' summaries. */
export function standingSentences(
  cars: readonly Car[],
  sources: Source[],
  policy: EvidencePolicy,
  limit = REPEATED_SENTENCE_LIMIT,
): Set<string> {
  const counts = new Map<string, number>();
  for (const car of cars) {
    const summary = currentBuyerSummary(car.buyerSummary, sources, policy);
    if (!summary) continue;
    const seen = new Set<string>([
      ...(summary.strength ? [summary.strength.text] : []),
      ...(summary.tradeoff ? [summary.tradeoff.text] : []),
      ...summary.conditions,
    ]);
    for (const sentence of seen)
      counts.set(sentence, (counts.get(sentence) ?? 0) + 1);
  }
  return new Set(
    [...counts].filter(([, n]) => n > limit).map(([sentence]) => sentence),
  );
}

export type CardLine = { label: string; text: string; sourceIds: string[] };
export type CardThird =
  | { kind: "seats"; label: string; fact?: Fact }
  | { kind: "dc"; label: string; fact?: Fact };
export type CardModel = {
  id: string;
  href: string;
  brand: string;
  model: string;
  version: string;
  price?: Fact;
  range?: Fact;
  third: CardThird;
  strength?: CardLine;
  tradeoff?: CardLine;
  /** Present only for records captured from a configurator with incomplete specifications. */
  configurationNotice?: string;
  /** Conditions specific to this car; standing sentences are excluded. */
  conditions: string[];
  availabilityState: BuyerAvailability;
  availabilityText: string;
};

const TEN_TO_EIGHTY = /\b10\s*[–-]\s*80\b/;
/** Seat count, not charge time, is the third figure for 6/7-seaters and movers. */
export const SEATS_THIRD_FROM = 6;

export function thirdFigure(car: Car): CardThird {
  const seats = car.facts.seats;
  if (typeof seats?.value === "number" && seats.value >= SEATS_THIRD_FROM)
    return { kind: "seats", label: "Seats", fact: seats };
  const dc = car.facts.dc_charge_time_min;
  const basis = `${dc?.comparisonBasis ?? ""} ${dc?.basis ?? ""}`;
  // A 30–80% time is shown with its own window, never passed off as 10–80%.
  const other = basis.match(/\b(\d{2})\s*[–-]\s*(\d{2})\b/);
  const label =
    dc && !TEN_TO_EIGHTY.test(basis) && other
      ? `DC ${other[1]}–${other[2]}%`
      : "DC 10–80%";
  return { kind: "dc", label, fact: dc };
}

export function cardModel(
  car: Car,
  sources: Source[],
  policy: EvidencePolicy,
  standing: ReadonlySet<string> = new Set(),
): CardModel {
  const summary = currentBuyerSummary(car.buyerSummary, sources, policy);
  const line = (clause?: {
    label: string;
    text: string;
    sourceIds: string[];
  }): CardLine | undefined =>
    clause && !standing.has(clause.text)
      ? { label: clause.label, text: clause.text, sourceIds: clause.sourceIds }
      : undefined;
  return {
    id: car.id,
    href: `/cars/${car.family}/${car.slug}`,
    brand: car.brand,
    model: car.model,
    version: car.trim,
    price: car.facts.price_aud,
    range: car.facts.range_km,
    third: thirdFigure(car),
    strength: line(summary?.strength),
    tradeoff: line(summary?.tradeoff),
    configurationNotice: car.configurationEvidence
      ? buyerDisplayCopy(
          car.id,
          "configurationEvidence.projectionScope",
          car.configurationEvidence.projectionScope,
        )
      : undefined,
    conditions: (summary?.conditions ?? []).filter((c) => !standing.has(c)),
    availabilityState: buyerAvailability(car),
    availabilityText: buyerAvailabilityText(car),
  };
}
