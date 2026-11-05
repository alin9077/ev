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
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
/** "2026-10-14" → "14 Oct". Anything that is not a real ISO date is returned unchanged. */
export function shortCheckedDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const month = Number(m[2]);
  return month >= 1 && month <= 12
    ? `${Number(m[3])} ${MONTHS[month - 1]}`
    : iso;
}
export function FreshnessLabel({
  checkedAt,
  factKey,
  asOf,
  modelYearChangedAt,
  validUntil,
  prefix = "Checked on",
  short = false,
}: {
  checkedAt: string;
  factKey: string;
  asOf?: string;
  modelYearChangedAt?: string;
  validUntil?: string;
  prefix?: string;
  /** Card style: "checked 14 Oct", amber when aged; the figure itself never changes. */
  short?: boolean;
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
  if (short)
    return (
      <span
        className={
          needsCheck || (date && offerNeedsCheck)
            ? "evidence-freshness evidence-stale"
            : "evidence-freshness"
        }
      >
        {checkedAt
          ? `checked ${shortCheckedDate(checkedAt)}`
          : "date not recorded"}
        {(needsCheck || (date && offerNeedsCheck)) && (
          <span className="sr-only"> (needs a fresh check)</span>
        )}
      </span>
    );
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
