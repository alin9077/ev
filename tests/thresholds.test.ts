import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  assessThresholds,
  CLOSE_TO_CAP_BAND,
  FBT_NOT_TAX_ADVICE,
  formatFbtRow,
  formatThresholdDate,
  REASON_CLOSE_TO_CAP,
  REASON_NEEDS_LIST_PRICE,
  REASON_THRESHOLD_NOT_RETRIEVED,
  rungOneListPrice,
  thresholdFreshness,
  type AuThresholds,
  type StateIncentive,
  type ThresholdVersion,
} from "../src/lib/thresholds";
import {
  buildStaleReport,
  formatStaleReport,
} from "../scripts/reporting/reports";
import { loadThresholds } from "../scripts/reporting/load";

const CAP = 100_000;
const LCT = 100_000;
const ASOF = "2026-11-05";
const ato = "https://www.ato.gov.au/example";
function money(value: number | null, checked = "2026-11-05") {
  return {
    status:
      value === null ? ("not retrieved" as const) : ("retrieved" as const),
    value,
    financial_year: "2026-27",
    source_url: ato,
    checked_at: checked,
  };
}
function incentive(over: Partial<StateIncentive> = {}): StateIncentive {
  return {
    state: "NSW",
    name: "Test scheme",
    type: "rebate",
    status: "open",
    amount_or_rule: "rule text",
    eligibility_price_cap: null,
    start: null,
    end: "open",
    source_url: "https://www.revenue.nsw.gov.au/x",
    checked_at: "2026-11-05",
    ...over,
  };
}
function thresholds(over: Partial<AuThresholds> = {}): AuThresholds {
  return {
    as_of: ASOF,
    fbt_exempt_price_cap: money(CAP),
    lct_threshold_fuel_efficient: money(LCT),
    lct_threshold_other: money(80_000),
    fbt_exemption_rules: {
      status: "retrieved",
      summary: "summary",
      source_url: ato,
      checked_at: "2026-11-05",
    },
    state_incentives: [],
    ...over,
  };
}
function version(
  value: unknown,
  rung: number | null = 1,
  comparisonBasis = "Before on-road costs",
): ThresholdVersion {
  return {
    facts: {
      price_aud: {
        value,
        comparisonBasis,
        ...(rung === null ? {} : { priceEvidence: { rung } }),
      },
    },
  };
}
const run = (v: ThresholdVersion, t = thresholds(), state?: string) =>
  assessThresholds(v, t, { asOf: ASOF, state });

test("rung-1 price clearly under the cap: under FBT cap true, LCT does not apply", () => {
  const r = run(version(CAP * 0.9));
  assert.equal(r.underFbtCap, true);
  assert.equal(r.fbtReason, null);
  assert.equal(r.lctApplies, false);
  assert.equal(r.lctReason, null);
  assert.equal(r.listPriceAud, CAP * 0.9);
});

test("rung-1 price clearly over the cap: under FBT cap false, LCT applies", () => {
  const r = run(version(CAP * 1.1));
  assert.equal(r.underFbtCap, false);
  assert.equal(r.lctApplies, true);
  assert.equal(r.fbtReason, null);
});

test("the 2% band is unknown on both sides, at the edge inclusive, with the specified reason", () => {
  assert.equal(CLOSE_TO_CAP_BAND, 0.02);
  for (const p of [CAP, CAP * 0.98, CAP * 1.02, CAP - 1, CAP + 1]) {
    const r = run(version(p));
    assert.equal(r.underFbtCap, "unknown", `price ${p}`);
    assert.equal(r.fbtReason, REASON_CLOSE_TO_CAP);
    assert.equal(r.lctApplies, "unknown");
    assert.equal(r.lctReason, REASON_CLOSE_TO_CAP);
  }
  assert.equal(
    REASON_CLOSE_TO_CAP,
    "close to cap; options and delivery change the outcome",
  );
  // One dollar outside the band resolves.
  assert.equal(run(version(CAP * 0.98 - 1)).underFbtCap, true);
  assert.equal(run(version(CAP * 1.02 + 1)).underFbtCap, false);
  assert.equal(run(version(CAP * 1.02 + 1)).lctApplies, true);
});

test("every non-rung-1 price type returns unknown with 'needs maker list price'", () => {
  for (const rung of [2, 3, 4, 5, 6]) {
    // Prices that would be clearly under and clearly over the cap.
    for (const p of [CAP * 0.5, CAP * 2]) {
      const r = run(
        version(
          p,
          rung,
          rung === 2 || rung === 4 ? "Driveaway" : "Before on-road costs",
        ),
      );
      assert.equal(r.underFbtCap, "unknown", `rung ${rung} price ${p}`);
      assert.equal(r.fbtReason, REASON_NEEDS_LIST_PRICE);
      assert.equal(r.lctApplies, "unknown");
      assert.equal(r.lctReason, REASON_NEEDS_LIST_PRICE);
      assert.equal(r.listPriceAud, null);
    }
  }
  assert.equal(REASON_NEEDS_LIST_PRICE, "needs maker list price");
});

test("rung 1 tagged with a driveaway basis, no rung, no price or an unusable value is not a list price", () => {
  assert.equal(rungOneListPrice(version(50_000, 1, "Driveaway")), null);
  assert.equal(rungOneListPrice(version(50_000, null)), null);
  assert.equal(rungOneListPrice({ facts: {} }), null);
  for (const bad of [null, "50000", 0, -5, Number.NaN, Infinity, undefined])
    assert.equal(rungOneListPrice(version(bad)), null, String(bad));
  const r = run({ facts: {} });
  assert.equal(r.underFbtCap, "unknown");
  assert.equal(r.fbtReason, REASON_NEEDS_LIST_PRICE);
  assert.equal(rungOneListPrice(version(50_000)), 50_000);
});

test("a threshold that was not retrieved gives unknown, never a guess", () => {
  const t = thresholds({
    fbt_exempt_price_cap: money(null),
    lct_threshold_fuel_efficient: money(null),
  });
  const r = run(version(10_000), t);
  assert.equal(r.underFbtCap, "unknown");
  assert.equal(r.fbtReason, REASON_THRESHOLD_NOT_RETRIEVED);
  assert.equal(r.lctApplies, "unknown");
  assert.equal(r.lctReason, REASON_THRESHOLD_NOT_RETRIEVED);
  // A row marked not retrieved is ignored even if a value sneaks in.
  const sneaky = thresholds({
    fbt_exempt_price_cap: { ...money(CAP), status: "not retrieved" },
  });
  assert.equal(
    run(version(10_000), sneaky).fbtReason,
    REASON_THRESHOLD_NOT_RETRIEVED,
  );
});

test("the cap and the LCT threshold are judged independently", () => {
  const t = thresholds({
    fbt_exempt_price_cap: money(100_000),
    lct_threshold_fuel_efficient: money(60_000),
  });
  const r = run(version(80_000), t);
  assert.equal(r.underFbtCap, true);
  assert.equal(r.lctApplies, true);
});

test("cap label data: as-at date, financial year and staleness come from the cap row", () => {
  const fresh = run(version(10_000));
  assert.equal(fresh.capCheckedAt, "2026-11-05");
  assert.equal(fresh.capFinancialYear, "2026-27");
  assert.equal(fresh.capStale, false);
  const old = run(
    version(10_000),
    thresholds({ fbt_exempt_price_cap: money(CAP, "2026-09-01") }),
  );
  assert.equal(old.capStale, true);
  // Ageing never removes the verdict.
  assert.equal(old.underFbtCap, true);
});

test("state incentives appear only for a chosen state and never claim a personal outcome", () => {
  const t = thresholds({
    state_incentives: [
      incentive({ state: "NSW", name: "open", status: "open" }),
      incentive({ state: "NSW", name: "closed", status: "closed" }),
      incentive({ state: "NSW", name: "unconfirmed", status: "unconfirmed" }),
      incentive({
        state: "NSW",
        name: "gone",
        status: "not retrieved",
        amount_or_rule: null,
      }),
      incentive({ state: "VIC", name: "vic" }),
    ],
  });
  assert.deepEqual(run(version(50_000), t).stateIncentives, []);
  assert.deepEqual(run(version(50_000), t, null).stateIncentives, []);
  const nsw = run(version(50_000), t, "nsw").stateIncentives;
  assert.deepEqual(
    nsw.map((r) => [r.name, r.currentlyOffered]),
    [
      ["open", true],
      ["closed", false],
      ["unconfirmed", "unknown"],
      ["gone", "unknown"],
    ],
  );
  assert.equal(run(version(50_000), t, "VIC").stateIncentives.length, 1);
  assert.deepEqual(run(version(50_000), t, "WA").stateIncentives, []);
  for (const row of nsw)
    assert.ok(!("eligible" in row) && !("youQualify" in row));
});

test("an open scheme stops being offered after its end date or before its start", () => {
  const t = thresholds({
    state_incentives: [
      incentive({ name: "ended", end: "2026-11-05" }),
      incentive({ name: "ends tomorrow", end: "2026-11-06" }),
      incentive({ name: "future", start: "2026-11-06" }),
      incentive({ name: "started today", start: "2026-11-05" }),
    ],
  });
  const rows = run(version(1), t, "NSW").stateIncentives;
  assert.deepEqual(
    rows.map((r) => [r.name, r.currentlyOffered]),
    [
      ["ended", false],
      ["ends tomorrow", true],
      ["future", false],
      ["started today", true],
    ],
  );
});

test("a state price cap uses the same rung-1 price and the 2% band", () => {
  const t = thresholds({
    state_incentives: [
      incentive({ name: "capped", eligibility_price_cap: 78_000 }),
      incentive({ name: "uncapped" }),
      incentive({
        name: "unretrieved",
        status: "not retrieved",
        eligibility_price_cap: 50_000,
      }),
    ],
  });
  const at = (p: unknown, rung = 1) =>
    run(version(p, rung), t, "NSW").stateIncentives;
  assert.equal(at(70_000)[0].underPriceCap, true);
  assert.equal(at(90_000)[0].underPriceCap, false);
  assert.equal(at(78_000 * 1.01)[0].underPriceCap, "unknown");
  assert.equal(at(70_000, 3)[0].underPriceCap, "unknown");
  assert.equal(at(70_000)[1].underPriceCap, null);
  assert.equal(at(70_000)[1].priceCap, null);
  assert.equal(at(70_000)[2].underPriceCap, null);
});

test("FBT row text: Yes, No and each Can't tell reason, with the as-at label and the mandatory sentence", () => {
  const yes = formatFbtRow(run(version(CAP * 0.5)));
  assert.equal(yes.label, "Under the FBT exemption price cap?");
  assert.equal(yes.answer, "Yes");
  assert.equal(yes.asAt, "as at 05 Nov 2026, ATO");
  assert.equal(yes.glossaryHref, "#fbt");
  assert.equal(
    yes.notice,
    "Whether you can use the exemption depends on your employer and lease; this is not tax advice.",
  );
  assert.equal(yes.notice, FBT_NOT_TAX_ADVICE);
  assert.equal(formatFbtRow(run(version(CAP * 2))).answer, "No");
  assert.equal(
    formatFbtRow(run(version(CAP))).answer,
    "Can't tell (close to cap; options and delivery change the outcome)",
  );
  assert.equal(
    formatFbtRow(run(version(CAP, 3))).answer,
    "Can't tell (needs maker list price)",
  );
  assert.equal(
    formatFbtRow(
      run(version(CAP), thresholds({ fbt_exempt_price_cap: money(null) })),
    ).answer,
    "Can't tell (threshold not retrieved)",
  );
  // The notice is present for every outcome.
  for (const p of [1, CAP, CAP * 3])
    assert.equal(formatFbtRow(run(version(p))).notice, FBT_NOT_TAX_ADVICE);
});

test("formatThresholdDate", () => {
  assert.equal(formatThresholdDate("2026-01-09"), "09 Jan 2026");
  assert.equal(formatThresholdDate("2026-12-31"), "31 Dec 2026");
  assert.equal(formatThresholdDate("not a date"), "not a date");
  assert.equal(formatThresholdDate("2026-13-01"), "2026-13-01");
});

test("threshold rows use the 45-day window: fresh on day 45, stale on day 46, invalid when future-dated", () => {
  const t = thresholds({
    fbt_exempt_price_cap: money(CAP, "2026-09-21"), // 45 days before 2026-11-05
    lct_threshold_fuel_efficient: money(LCT, "2026-09-20"), // 46 days
    lct_threshold_other: money(80_000, "2026-11-06"), // future
    state_incentives: [incentive({ checked_at: "2026-11-05" })],
  });
  const rows = thresholdFreshness(t, ASOF);
  const byKey = new Map(rows.map((r) => [r.key, r]));
  assert.equal(byKey.get("fbt_exempt_price_cap")?.state, "fresh");
  assert.equal(byKey.get("fbt_exempt_price_cap")?.expiresOn, "2026-11-05");
  assert.equal(byKey.get("fbt_exempt_price_cap")?.staleOn, "2026-11-06");
  assert.equal(byKey.get("lct_threshold_fuel_efficient")?.state, "stale");
  assert.equal(byKey.get("lct_threshold_other")?.state, "invalid");
  assert.equal(byKey.get("fbt_exemption_rules")?.state, "fresh");
  assert.ok(rows.every((r) => r.windowDays === 45));
  const state = rows.find((r) => r.key.startsWith("state_incentive/NSW"));
  assert.ok(state && state.state === "fresh" && state.label.includes("NSW"));
  assert.equal(rows.length, 4 + 1);
});

test("the committed threshold data file is sourced, dated and never fabricated", () => {
  const files = readdirSync("data")
    .filter((f) => /^au-thresholds-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  assert.ok(files.length > 0, "a data/au-thresholds-<date>.json exists");
  const data = JSON.parse(
    readFileSync(`data/${files.at(-1)}`, "utf8"),
  ) as AuThresholds;
  const host = (url: string) => new URL(url).hostname;
  const govAu = (url: string) => /(^|\.)gov\.au$/.test(host(url));
  const rows = [
    data.fbt_exempt_price_cap,
    data.lct_threshold_fuel_efficient,
    data.lct_threshold_other,
    data.fbt_exemption_rules,
    ...data.state_incentives,
  ];
  for (const row of rows) {
    assert.ok(row.source_url && govAu(row.source_url), row.source_url);
    assert.match(row.checked_at, /^\d{4}-\d{2}-\d{2}$/);
  }
  for (const row of [
    data.fbt_exempt_price_cap,
    data.lct_threshold_fuel_efficient,
    data.lct_threshold_other,
  ]) {
    assert.equal(host(row.source_url), "www.ato.gov.au");
    assert.equal(row.status === "retrieved", typeof row.value === "number");
  }
  // A not-retrieved row never carries a value.
  for (const row of data.state_incentives)
    if (row.status === "not retrieved") {
      assert.equal(row.amount_or_rule, null);
      assert.equal(row.eligibility_price_cap, null);
    }
  // All eight states and territories are present.
  const states = new Set(data.state_incentives.map((r) => r.state));
  for (const s of ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"])
    assert.ok(states.has(s), `${s} has a row`);
  // The data file works end to end with the rules.
  const r = assessThresholds(version(10_000), data, {
    asOf: data.as_of,
    state: "NSW",
  });
  assert.ok(["boolean", "string"].includes(typeof r.underFbtCap));
});

test("report:stale includes threshold rows on the 45-day window, apart from per-version claims", () => {
  const empty = { cars: [], features: [] };
  assert.equal(buildStaleReport(empty, ASOF, 30).thresholds, null);
  const t = thresholds({
    fbt_exempt_price_cap: money(CAP, "2026-10-01"), // stale 2026-11-16: due within 30 days
    lct_threshold_fuel_efficient: money(LCT, "2026-08-01"), // already aged
    lct_threshold_other: money(80_000, "2026-11-05"), // not due within 30 days
    state_incentives: [],
  });
  const report = buildStaleReport(empty, ASOF, 30, false, t);
  assert.ok(report.thresholds);
  assert.deepEqual(
    report.thresholds.due.map((r) => r.key),
    ["fbt_exempt_price_cap"],
  );
  assert.deepEqual(
    report.thresholds.overdue.map((r) => r.key),
    ["lct_threshold_fuel_efficient"],
  );
  assert.equal(report.thresholds.invalid.length, 0);
  assert.equal(report.due.length + report.overdue.length, 0);
  const text = formatStaleReport(report, false);
  assert.match(
    text,
    /Money thresholds \(45-day window\): 1 due; 1 already aged/,
  );
  assert.match(text, /aged: LCT threshold, fuel-efficient/);
  // Without thresholds the report has no money section.
  assert.doesNotMatch(
    formatStaleReport(buildStaleReport(empty, ASOF, 30), false),
    /Money thresholds/,
  );
});

test("loadThresholds returns the newest dated file", () => {
  const loaded = loadThresholds();
  assert.ok(loaded);
  assert.match(loaded.as_of, /^\d{4}-\d{2}-\d{2}$/);
});
