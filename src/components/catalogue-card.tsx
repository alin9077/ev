"use client";
import Link from "next/link";
import type { Car } from "@/lib/types";
import type { CardModel } from "@/lib/catalogue-card";
import { CarAvatar } from "./car-avatar";
import { EvidenceConditions } from "./evidence-conditions";
import { FootnoteRefs } from "./footnotes";
import { FactValue } from "./graded-figure";
import { VisualActionFeedback } from "./visual-action-feedback";
import type { Fact } from "@/lib/types";

function Figure({
  label,
  fact,
  basisLabel,
}: {
  label: string;
  fact?: Fact;
  basisLabel?: string;
}) {
  return (
    <div className="catalogue-figure">
      <dt>{label}</dt>
      <dd>
        {fact ? (
          <FactValue
            fact={fact}
            compact
            dateStyle="short"
            basisLabel={basisLabel}
          />
        ) : (
          <div className="fact-value">
            <strong>Not checked yet</strong>
          </div>
        )}
      </dd>
    </div>
  );
}
/** A range that is only a maker's target or estimate must say so on the card. */
const rangeBasis = (fact?: Fact) => {
  if (!fact) return "";
  const text = JSON.stringify([
    fact.basis,
    fact.comparisonBasis,
    fact.qualifications,
    fact.conditionExplanation,
  ]);
  if (/targeted|estimated/i.test(text)) return "Targeted/estimated WLTP";
  return /WLTP/i.test(`${fact.comparisonBasis} ${fact.basis}`)
    ? "WLTP"
    : fact.comparisonBasis || "";
};

/**
 * One catalogue card, phone-first. It carries exactly: brand, model, version,
 * price, range, one class-appropriate third figure, a strength, a trade-off,
 * an availability chip and a Compare button. Standing caveats live in the
 * methodology and footer, not here.
 */
export function CatalogueCard({
  card,
  car,
  selected,
  onToggle,
  feedback,
}: {
  card: CardModel;
  car: Car;
  selected: boolean;
  onToggle: () => void;
  feedback?: string;
}) {
  return (
    <article className="catalogue-card" data-car-id={card.id}>
      <div className="catalogue-card-head">
        <div>
          <p className="eyebrow">{card.brand}</p>
          <h3>
            <Link href={card.href} prefetch={false}>
              {card.model}
            </Link>
          </h3>
          <p className="catalogue-card-version">{card.version}</p>
        </div>
        <CarAvatar car={car} />
      </div>
      <p className={`catalogue-chip catalogue-chip-${card.availabilityState}`}>
        {card.availabilityText}
      </p>
      <dl className="catalogue-figures">
        <Figure
          label="Price"
          fact={card.price}
          basisLabel={
            card.price?.priceEvidence?.basisTag ||
            card.price?.comparisonBasis ||
            ""
          }
        />
        <Figure
          label="Range"
          fact={card.range}
          basisLabel={rangeBasis(card.range)}
        />
        <Figure label={card.third.label} fact={card.third.fact} basisLabel="" />
      </dl>
      {card.configurationNotice && (
        <div className="small muted catalogue-notice">
          <p>Captured configuration · specifications incomplete</p>
          <p>{card.configurationNotice}</p>
        </div>
      )}
      {card.strength && (
        <p className="catalogue-strength">
          <strong>{card.strength.label}.</strong> {card.strength.text}{" "}
          <FootnoteRefs ids={card.strength.sourceIds} />
        </p>
      )}
      {card.tradeoff && (
        <p className="catalogue-tradeoff">
          <strong>Trade-off.</strong> {card.tradeoff.text}{" "}
          <FootnoteRefs ids={card.tradeoff.sourceIds} />
        </p>
      )}
      {!card.strength && !card.tradeoff && (
        <p className="small muted catalogue-placeholder">
          No strength or trade-off written for this version yet.
        </p>
      )}
      <EvidenceConditions conditions={card.conditions} />
      <div className="catalogue-card-actions">
        <button
          type="button"
          aria-pressed={selected}
          aria-label={`${selected ? "Remove" : "Compare"} ${card.brand} ${card.model} ${card.version}`}
          onClick={onToggle}
        >
          {selected ? "Remove" : "Compare +"}
        </button>
      </div>
      <VisualActionFeedback message={feedback} />
    </article>
  );
}
