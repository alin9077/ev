"use client";
import { australianEvidenceDate } from "@/lib/evidence-date";

import { EvidenceConditions } from "./evidence-conditions";
import { useEffect, useState } from "react";
import type { Source } from "@/lib/types";
import type { BuyerSummaryCar } from "@/lib/detail-client-props";
import { currentBuyerSummary } from "@/lib/selling-points";
import { buyerSummaryNeedsClock } from "@/lib/buyer-summary-timing";
import { FootnoteRefs } from "./footnotes";
export function BuyerSummary({
  car,
  sources,
}: {
  car: BuyerSummaryCar;
  sources: Source[];
}) {
  const [clockReady, setClockReady] = useState(false);
  const [asOf, setAsOf] = useState(car.buyerSummary?.checkedAt || "2026-10-10");
  useEffect(() => {
    const refresh = () => setAsOf(australianEvidenceDate());
    refresh();
    setClockReady(true);
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, []);
  const summary = currentBuyerSummary(car.buyerSummary, sources, {
    asOf,
    maxAgeDays: 30,
  });
  if (!summary || (!clockReady && buyerSummaryNeedsClock(car.buyerSummary)))
    return null;
  return (
    <section
      className="buyer-summary"
      aria-label="Why consider this exact version"
    >
      {summary.strength && (
        <>
          <p className="eyebrow">Why consider it</p>
          <h2>{summary.strength.label}</h2>
          <p>
            {summary.strength.text}{" "}
            <FootnoteRefs ids={summary.strength.sourceIds} />
          </p>
        </>
      )}
      {summary.tradeoff && (
        <p>
          <strong>Keep in mind: </strong>
          {summary.tradeoff.text}{" "}
          <FootnoteRefs ids={summary.tradeoff.sourceIds} />
        </p>
      )}
      <EvidenceConditions conditions={summary.conditions} />
      <p className="small muted">
        Evidence {summary.checkedAt}. Buyer-use interpretation, not a
        market-leading claim.
      </p>
    </section>
  );
}
