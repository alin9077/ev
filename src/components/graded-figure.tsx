"use client";
import { useEffect, useState } from "react";
import { australianEvidenceDate } from "@/lib/evidence-date";
import { formatFact } from "@/lib/compare";
import { buyerGradeOf, gradeLabel } from "@/lib/evidence-grading";
import { factCondition } from "@/lib/fleet";
import type { BuyerGrade, Fact } from "@/lib/types";
import { FootnoteRefs } from "./footnotes";
import { FreshnessLabel } from "./freshness-label";
import { statusLabels } from "@/lib/config";
import type { Feature } from "@/lib/types";

export function Status({
  status,
  label,
}: {
  status: Feature["status"];
  label?: string;
}) {
  return (
    <span className={`status ${status}`}>
      <span aria-hidden="true">
        {status === "standard"
          ? "✓"
          : status === "not_verified"
            ? "?"
            : status === "conditional"
              ? "◇"
              : "·"}
      </span>{" "}
      {label || statusLabels[status]}
    </span>
  );
}
export function shortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
}
/** Native details keeps each real condition keyboard- and touch-accessible. */
export function BuyerGradeMark({
  grade,
  condition,
  sourceLabel,
}: {
  grade: BuyerGrade;
  condition?: string;
  sourceLabel?: string;
}) {
  if (grade === "confirmed" || grade === "not_published") return null;
  if (grade === "check")
    return (
      <details className="conditional-context evidence-grade-check">
        <summary>
          <span aria-hidden="true">◇ </span>Check
        </summary>
        <p>
          {condition ||
            "Check the stated specification and source before signing."}
        </p>
      </details>
    );
  return (
    <span className="small muted evidence-grade-reported">
      {sourceLabel
        ? `Reported by ${sourceLabel}`
        : `${gradeLabel(grade)} · see source`}
    </span>
  );
}
function OfferAmount({ fact }: { fact: Fact }) {
  const [asOf, setAsOf] = useState("");
  useEffect(() => {
    const update = () => setAsOf(australianEvidenceDate());
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);
  return <>{asOf ? formatFact(fact, asOf) : "Checking offer validity…"}</>;
}
/**
 * The one place a figure's grade is styled (Confirmed plain, Check marked,
 * Reported muted with its source, Not published in words, aged amber).
 * Catalogue cards, version pages and comparison rows all render through here.
 */
export function FactValue({
  fact,
  compact = false,
  dateStyle = "full",
  basisLabel,
}: {
  fact: Fact;
  onEvidence?: () => void;
  compact?: boolean;
  /** "short" is the catalogue-card style: "checked 14 Oct", amber when aged. */
  dateStyle?: "full" | "short";
  /** Replaces the long source basis text, e.g. "WLTP" on a card. */
  basisLabel?: string;
}) {
  const grade = buyerGradeOf(fact);
  return (
    <div className="fact-value">
      <strong className={grade === "reported" ? "muted" : undefined}>
        {grade === "not_published" ? (
          "Not published"
        ) : fact.validUntil ? (
          <OfferAmount fact={fact} />
        ) : (
          formatFact(fact)
        )}
      </strong>
      {fact.validUntil && (
        <span className="qualification">
          Offer deadline: {shortDate(fact.validUntil)}. Eligibility and earlier
          stock exhaustion may apply.
        </span>
      )}
      {grade ? (
        <BuyerGradeMark
          grade={grade}
          condition={[
            ...new Set(
              [factCondition(fact), ...fact.qualifications].filter(Boolean),
            ),
          ].join(" ")}
          sourceLabel={
            fact.gradeReview?.sourceLabel || fact.priceEvidence?.publisher
          }
        />
      ) : dateStyle === "short" ? (
        // Cards say only that the figure has not earned a grade; the legacy
        // condition text lives on the version page.
        fact.value !== null && (
          <span className="small muted evidence-unreviewed">
            {fact.gradeReviewStatus ? "Needs review" : "Unreviewed"}
          </span>
        )
      ) : (
        <>
          {fact.gradeReviewStatus ? (
            <Status status="not_verified" label="Needs review" />
          ) : (
            fact.status !== "standard" && <Status status={fact.status} />
          )}
          {fact.status === "conditional" && (
            <div className="conditional-context">
              <strong>Why conditional</strong>
              <p>{factCondition(fact)}</p>
            </div>
          )}
        </>
      )}
      <span className="fact-basis">
        {basisLabel === ""
          ? null
          : `${basisLabel ?? (fact.priceEvidence?.basisTag || fact.basis)} · `}
        <FreshnessLabel
          checkedAt={fact.date}
          factKey={fact.key}
          modelYearChangedAt={fact.modelYearChangedAt}
          short={dateStyle === "short"}
        />
      </span>
      {!compact &&
        grade !== "check" &&
        fact.qualifications.map((q) => (
          <span className="qualification" key={q}>
            {q}
          </span>
        ))}
      <FootnoteRefs ids={fact.sourceIds} />
    </div>
  );
}
