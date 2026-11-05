/**
 * Australian money thresholds (WS4). Pure rules over a dated, sourced data file
 * (`data/au-thresholds-*.json`). This module states where a published price sits
 * against published thresholds. It never produces a personal tax outcome: whether
 * anyone can use the FBT exemption depends on their employer and lease.
 */
import { evidenceFreshness } from "./freshness";

export type ThresholdStatus = "retrieved" | "not retrieved";
export type MoneyThreshold = {
  status: ThresholdStatus;
  value: number | null;
  financial_year?: string;
  source_url: string;
  checked_at: string;
};
export type IncentiveStatus =
  "open" | "closed" | "unconfirmed" | "not retrieved";
export type StateIncentive = {
  state: string;
  name: string;
  type: string;
  status: IncentiveStatus;
  amount_or_rule: string | null;
  eligibility_price_cap: number | null;
  start: string | null;
  end: string | null;
  source_url: string;
  checked_at: string;
};
export type AuThresholds = {
  as_of: string;
  fbt_exempt_price_cap: MoneyThreshold;
  lct_threshold_fuel_efficient: MoneyThreshold;
  lct_threshold_other: MoneyThreshold;
  fbt_exemption_rules: {
    status: ThresholdStatus;
    summary: string | null;
    source_url: string;
    checked_at: string;
  };
  state_incentives: StateIncentive[];
};

/** Reasons are fixed wording; the plan specifies the first two. */
export const REASON_NEEDS_LIST_PRICE = "needs maker list price";
export const REASON_CLOSE_TO_CAP =
  "close to cap; options and delivery change the outcome";
export const REASON_THRESHOLD_NOT_RETRIEVED = "threshold not retrieved";
export const FBT_NOT_TAX_ADVICE =
  "Whether you can use the exemption depends on your employer and lease; this is not tax advice.";
/** A price within this share of a threshold is too close to call. */
export const CLOSE_TO_CAP_BAND = 0.02;
/** Threshold rows use the same window as prices. */
export const THRESHOLD_WINDOW_DAYS = 45;

export type Tri = true | false | "unknown";
/** The slice of a version this module reads. */
export type ThresholdVersion = {
  facts: Record<
    string,
    | {
        value: unknown;
        comparisonBasis?: string;
        priceEvidence?: { rung: number };
      }
    | undefined
  >;
};
export type Verdict = { result: Tri; reason: string | null };

/** The only price this module accepts: maker list price before on-road costs (rung 1). */
export function rungOneListPrice(version: ThresholdVersion): number | null {
  const price = version.facts.price_aud;
  if (!price) return null;
  if (price.priceEvidence?.rung !== 1) return null;
  if (price.comparisonBasis !== "Before on-road costs") return null;
  const value = price.value;
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

/** Compare a price to one threshold: below is true, at or above is false, within 2% is unknown. */
function against(
  price: number | null,
  limit: number | null,
  below: boolean,
): Verdict {
  if (price === null)
    return { result: "unknown", reason: REASON_NEEDS_LIST_PRICE };
  if (limit === null)
    return { result: "unknown", reason: REASON_THRESHOLD_NOT_RETRIEVED };
  if (Math.abs(price - limit) <= limit * CLOSE_TO_CAP_BAND)
    return { result: "unknown", reason: REASON_CLOSE_TO_CAP };
  const isBelow = price < limit;
  return { result: below ? isBelow : !isBelow, reason: null };
}
const limitOf = (row: MoneyThreshold) =>
  row.status === "retrieved" && typeof row.value === "number"
    ? row.value
    : null;

export type IncentiveRow = {
  state: string;
  name: string;
  type: string;
  /** What the cited page says about the scheme; not whether it applies to a person. */
  schemeStatus: IncentiveStatus;
  /** Scheme open today per the page's own status and dates. */
  currentlyOffered: Tri;
  amountOrRule: string | null;
  priceCap: number | null;
  /** null when the scheme states no price cap. */
  underPriceCap: Tri | null;
  start: string | null;
  end: string | null;
  sourceUrl: string;
  checkedAt: string;
};
export type ThresholdResult = {
  underFbtCap: Tri;
  fbtReason: string | null;
  lctApplies: Tri;
  lctReason: string | null;
  /** The maker list price used, or null when none qualified. */
  listPriceAud: number | null;
  /** Date the cap was checked and its financial year, for the "as at" label. */
  capCheckedAt: string;
  capFinancialYear: string | null;
  capStale: boolean;
  stateIncentives: IncentiveRow[];
};

function offered(row: StateIncentive, asOf: string): Tri {
  if (row.status === "closed") return false;
  if (row.status !== "open") return "unknown";
  if (row.end && row.end !== "open" && row.end <= asOf) return false;
  if (row.start && row.start > asOf) return false;
  return true;
}

/**
 * Pure rules. Uses only the rung-1 maker list price before on-road costs.
 * Driveaway, configurator, state-driveaway, reported and dealer prices, and
 * versions with no price, return `unknown` ("needs maker list price").
 */
export function assessThresholds(
  version: ThresholdVersion,
  thresholds: AuThresholds,
  options: { asOf: string; state?: string | null },
): ThresholdResult {
  const price = rungOneListPrice(version);
  const fbt = against(price, limitOf(thresholds.fbt_exempt_price_cap), true);
  const lct = against(
    price,
    limitOf(thresholds.lct_threshold_fuel_efficient),
    false,
  );
  const state = options.state?.toUpperCase();
  const stateIncentives = state
    ? thresholds.state_incentives
        .filter((row) => row.state.toUpperCase() === state)
        .map((row): IncentiveRow => {
          const cap =
            row.status === "not retrieved" ? null : row.eligibility_price_cap;
          return {
            state: row.state,
            name: row.name,
            type: row.type,
            schemeStatus: row.status,
            currentlyOffered: offered(row, options.asOf),
            amountOrRule: row.amount_or_rule,
            priceCap: cap,
            underPriceCap:
              cap === null ? null : against(price, cap, true).result,
            start: row.start,
            end: row.end,
            sourceUrl: row.source_url,
            checkedAt: row.checked_at,
          };
        })
    : [];
  const capRow = thresholds.fbt_exempt_price_cap;
  return {
    underFbtCap: fbt.result,
    fbtReason: fbt.reason,
    lctApplies: lct.result,
    lctReason: lct.reason,
    listPriceAud: price,
    capCheckedAt: capRow.checked_at,
    capFinancialYear: capRow.financial_year ?? null,
    capStale: thresholdRowState(capRow.checked_at, options.asOf) !== "fresh",
    stateIncentives,
  };
}

const months = [
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
/** `2026-11-05` becomes `05 Nov 2026`. Non-dates are returned unchanged. */
export function formatThresholdDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m && months[Number(m[2]) - 1]
    ? `${m[3]} ${months[Number(m[2]) - 1]} ${m[1]}`
    : iso;
}

export type FbtRowText = {
  label: string;
  answer: string;
  asAt: string;
  notice: string;
  glossaryHref: string;
};
/** Text for the version-detail and comparison row. Display components render this verbatim. */
export function formatFbtRow(result: ThresholdResult): FbtRowText {
  const answer =
    result.underFbtCap === true
      ? "Yes"
      : result.underFbtCap === false
        ? "No"
        : `Can't tell (${result.fbtReason ?? REASON_NEEDS_LIST_PRICE})`;
  return {
    label: "Under the FBT exemption price cap?",
    answer,
    asAt: `as at ${formatThresholdDate(result.capCheckedAt)}, ATO`,
    notice: FBT_NOT_TAX_ADVICE,
    glossaryHref: "#fbt",
  };
}

export type ThresholdFreshness = {
  key: string;
  label: string;
  checkedAt: string;
  windowDays: number;
  expiresOn: string | null;
  staleOn: string | null;
  state: "fresh" | "stale" | "invalid";
  sourceUrl: string;
  status: string;
};
function thresholdRowState(checkedAt: string, asOf: string) {
  const age = evidenceFreshness(checkedAt, "price_threshold", asOf);
  if (age.ageDays === null || age.ageDays < 0) return "invalid" as const;
  return age.fresh ? ("fresh" as const) : ("stale" as const);
}
/** One freshness entry per threshold row, using the 45-day price window. */
export function thresholdFreshness(
  thresholds: AuThresholds,
  asOf: string,
): ThresholdFreshness[] {
  const rows: {
    key: string;
    label: string;
    checkedAt: string;
    sourceUrl: string;
    status: string;
  }[] = [
    [
      "fbt_exempt_price_cap",
      "FBT exemption price cap",
      thresholds.fbt_exempt_price_cap,
    ],
    [
      "lct_threshold_fuel_efficient",
      "LCT threshold, fuel-efficient",
      thresholds.lct_threshold_fuel_efficient,
    ],
    [
      "lct_threshold_other",
      "LCT threshold, other vehicles",
      thresholds.lct_threshold_other,
    ],
    [
      "fbt_exemption_rules",
      "FBT exemption rules",
      thresholds.fbt_exemption_rules,
    ],
  ].map(([key, label, row]) => {
    const r = row as { checked_at: string; source_url: string; status: string };
    return {
      key: key as string,
      label: label as string,
      checkedAt: r.checked_at,
      sourceUrl: r.source_url,
      status: r.status,
    };
  });
  thresholds.state_incentives.forEach((row, index) =>
    rows.push({
      key: `state_incentive/${row.state}/${index}`,
      label: `${row.state} incentive: ${row.name}`,
      checkedAt: row.checked_at,
      sourceUrl: row.source_url,
      status: row.status,
    }),
  );
  return rows.map((row) => {
    const age = evidenceFreshness(row.checkedAt, "price_threshold", asOf);
    return {
      ...row,
      windowDays: THRESHOLD_WINDOW_DAYS,
      expiresOn: age.expiresOn,
      staleOn: age.staleOn,
      state: thresholdRowState(row.checkedAt, asOf),
    };
  });
}
