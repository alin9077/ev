"use client";
import { useSyncExternalStore } from "react";
import { australianEvidenceDate } from "@/lib/evidence-date";
import { evidenceFreshness, modelYearChangedSince } from "@/lib/freshness";
import { offerExpired, offerValidityLabel } from "@/lib/fact-validity";

// One daily-clock watcher for the whole page, including long detail fact lists.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    let previous = australianEvidenceDate();
    timer = setInterval(() => {
      const today = australianEvidenceDate();
      if (today !== previous) {
        previous = today;
        for (const notify of listeners) notify();
      }
    }, 60000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}
const serverDate = () => "";
export function useEvidenceDate() {
  return useSyncExternalStore(subscribe, australianEvidenceDate, serverDate);
}
export function FreshnessLabel({
  checkedAt,
  factKey,
  asOf,
  modelYearChangedAt,
  validUntil,
  prefix = "Checked on",
}: {
  checkedAt: string;
  factKey: string;
  asOf?: string;
  modelYearChangedAt?: string;
  validUntil?: string;
  prefix?: string;
}) {
  const clockDate = useEvidenceDate();
  const date = asOf ?? clockDate;
  const needsCheck =
    !!date &&
    !evidenceFreshness(
      checkedAt,
      factKey,
      date,
      modelYearChangedSince(checkedAt, modelYearChangedAt, date),
    ).fresh;
  const offerLabel = offerValidityLabel({ validUntil }, date);
  const offerNeedsCheck =
    validUntil !== undefined && offerExpired({ validUntil }, date);
  return (
    <span
      className={
        needsCheck || (date && offerNeedsCheck)
          ? "evidence-freshness evidence-stale"
          : "evidence-freshness"
      }
    >
      {prefix} {checkedAt || "date not recorded"}
      {needsCheck && " · Needs a fresh check"}
      {offerLabel && ` · ${offerLabel}`}
    </span>
  );
}
