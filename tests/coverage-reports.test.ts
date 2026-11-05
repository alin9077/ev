import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCoverageReport,
  buildStaleReport,
  coreFacts,
  existingGrade,
  formatCoverageReport,
  formatStaleReport,
  hasValue,
  type ReportInput,
} from "../scripts/reporting/reports";
import type { Car, Fact, Feature, Source } from "../src/lib/types";

const source: Source = {
  id: "maker",
  url: "https://example.com/au",
  publisher: "Maker",
  title: "AU specification",
  source_type: "manufacturer",
  published_date: null,
  accessed_date: "2026-10-01",
  market: "AU",
  supports: "Exact version",
};
function fact(
  key: string,
  value: Fact["value"] = 100,
  date = "2026-10-01",
): Fact {
  return {
    key,
    label: key,
    value,
    unit: "",
    basis:
      key === "dc_charge_time_min"
        ? "10–80%"
        : key === "towing_braked_kg"
          ? "Braked towing"
          : "same basis",
    comparisonBasis:
      key === "dc_charge_time_min"
        ? "10–80%"
        : key === "towing_braked_kg"
          ? "Braked towing"
          : "same basis",
    status: "standard",
    sourceIds: [source.id],
    date,
    market: "AU",
    scope: "Exact version",
    qualifications: [],
    issues: [],
  };
}
function car(id = "one", vehicleClass: Car["vehicleClass"] = "passenger"): Car {
  return {
    id,
    modelId: id,
    family: id,
    slug: id,
    brand: "Maker",
    model: id,
    trim: "Standard",
    generation: "1",
    year: 2026,
    vehicleClass,
    availability: "current_or_order_listed",
    availabilityEvidence: {
      checkedAt: "2026-10-01",
      orderStatus: "current_or_order_listed",
      stockStatus: "unverified",
      sourceIds: [source.id],
    },
    drive: "AWD",
    facts: Object.fromEntries(
      coreFacts.map((definition) => [definition.key, fact(definition.key)]),
    ),
    issues: [],
    buyerSummary: {
      checkedAt: "2026-10-01",
      guardSourceIds: [source.id],
      conditions: [],
      strength: {
        label: "Useful",
        text: "Five seats fit a family",
        sourceIds: [source.id],
      },
      tradeoff: {
        label: "Consider",
        text: "Check garage width",
        sourceIds: [source.id],
      },
    },
  };
}
const input = (cars: Car[]): ReportInput => ({
  cars,
  sources: [source],
  features: [],
  inventory: { records: [], unverifiedLeads: [] },
});

test("coverage denominators include passenger/ute, retain outgoing new-stock evidence, and exclude lower tiers and provisional cars", () => {
  const outgoing = {
    ...car("stock"),
    availability: "outgoing",
    availabilityEvidence: {
      ...car().availabilityEvidence!,
      stockStatus: "new_stock_listed",
    },
  };
  const report = buildCoverageReport(
    input([
      car(),
      car("ute", "ute"),
      car("van", "van"),
      car("truck", "truck"),
      { ...car("future"), availability: "announced_provisional" },
      { ...car("old"), availability: "outgoing" },
      outgoing,
    ]),
    "2026-10-13",
  );
  assert.equal(report.onSaleVersions, 3);
  assert.equal(report.tierOneVersions, 5);
  assert.equal(report.allCatalogueVersions, 7);
  assert.ok(report.core.every((f) => f.total === 3));
  assert.equal(
    report.criteria.find((c) => c.id === "C1")?.pass,
    false,
    "a full tiny catalogue cannot prove market closure",
  );
  assert.equal(
    report.criteria.find((c) => c.id === "C3")?.pass,
    false,
    "existing standard statuses do not certify revised grading",
  );
  assert.deepEqual(report.brandsDone, []);
});

test("core gaps and grade percentages use each version once, retain zero, and never count a mismatched DC window", () => {
  const a = car(),
    b = car("two");
  a.facts.price_aud.value = null;
  a.facts.price_aud.qualifications = ["Maker has not published this price"];
  b.facts.price_aud.status = "conditional";
  b.facts.price_aud.buyerGrade = "check";
  b.facts.price_aud.gradeReview = {
    reviewedAt: "2026-10-01",
    reason: "Named wheel option changes the figure",
    evidenceScope: "exact_au_version",
    sourceIds: [source.id],
    overlayId: "m1-test",
  };
  a.facts.towing_braked_kg.value = 0;
  a.facts.dc_charge_time_min = {
    ...fact("dc_charge_time_min", 28),
    basis: "20–80%",
    comparisonBasis: "20–80%",
  };
  b.facts.battery_kwh.resolvedElsewhere = true;
  b.facts.battery_kwh.buyerGrade = "reported";
  b.facts.battery_kwh.gradeReview = {
    reviewedAt: "2026-10-01",
    reason: "Sibling version report",
    evidenceScope: "secondary_or_sibling",
    sourceIds: [source.id],
    overlayId: "m1-test",
  };
  delete a.facts.drive;
  const report = buildCoverageReport(input([a, b]), "2026-10-13");
  const price = report.core.find((f) => f.key === "price_aud")!;
  assert.equal(price.filledPercent, 50);
  assert.equal(price.confirmedPercent, 0);
  assert.equal(price.grades.Check, 1);
  assert.equal(price.grades["Not published"], 0);
  assert.equal(
    price.grades.Unreviewed,
    1,
    "a missing value and old caveat do not certify a two-source search",
  );
  assert.equal(
    report.core.find((f) => f.key === "towing_braked_kg")?.filled,
    2,
  );
  assert.equal(
    report.core.find((f) => f.key === "dc_charge_time_min")?.filled,
    1,
  );
  assert.equal(
    report.core.find((f) => f.key === "battery_kwh")?.grades.Reported,
    1,
  );
  assert.equal(
    report.core.find((f) => f.key === "drive")?.grades.Unreviewed,
    2,
  );
  assert.ok(report.gaps.every((gap) => gap.reason.length > 0));
  assert.ok(
    report.gaps.some(
      (gap) => gap.key === "dc_charge_time_min" && /window/.test(gap.reason),
    ),
  );
  assert.equal(
    existingGrade(fact("x", "Needs confirmation"), false),
    "Unreviewed",
  );
  assert.equal(hasValue(false), true);
  assert.equal(hasValue(NaN), false);
});

test("10 percent to up to 80 percent and explicit 10–80 fields are recognised without converting other windows", () => {
  const a = car(),
    b = car("two");
  a.facts.dc_charge_time_min.basis =
    "From 10 per cent to up to 80 per cent SoC";
  a.facts.dc_charge_time_min.comparisonBasis = "maker conditions";
  b.facts.dc_charge_time_min.value = null;
  b.facts.dc_10_80_min = fact("dc_10_80_min", 25);
  const report = buildCoverageReport(input([a, b]), "2026-10-13");
  assert.equal(
    report.core.find((f) => f.key === "dc_charge_time_min")?.filled,
    2,
  );
});

test("model matching uses explicit IDs and known names but retains every unresolved difference and lead", () => {
  const data = input([car("record")]);
  data.inventory.records = [
    {
      brand: "Maker",
      model: "different label",
      vehicleClass: "passenger",
      catalogueVariantIds: ["record"],
    },
    { brand: "Maker", model: "record BEV", vehicleClass: "passenger" },
    {
      brand: "Other",
      model: "Missing ute",
      vehicleClass: "ute",
      limitations: ["Version list still pending"],
    },
    { brand: "Other", model: "Van", vehicleClass: "van" },
  ];
  data.inventory.unverifiedLeads = [
    {
      brand: "Other",
      model: "Open lead",
      vehicleClass: "passenger",
      evidenceNote: "Not yet resolved",
    },
  ];
  const report = buildCoverageReport(data, "2026-10-13");
  assert.equal(report.missingModels.length, 1);
  assert.equal(report.missingModels[0].reason, "Version list still pending");
  assert.equal(report.unresolvedLeads.length, 1);
  assert.ok(report.brandsRemaining.includes("Other"));
  const text = formatCoverageReport(report, true);
  assert.match(text, /Tier 1 on-sale versions \| Price \| Range/);
  assert.match(text, /Missing ute: Version list still pending/);
});

test("C4 rejects generic placeholders and headline ranking percentage is intersection, not averaged", () => {
  const a = car();
  a.buyerSummary!.strength!.text = "Evidence first: worth checking in detail";
  a.facts.boot_l.value = null;
  const report = buildCoverageReport(input([a]), "2026-10-13");
  assert.equal(report.pairedOnSale, 0);
  assert.equal(report.inAllRankingsPercent, 0);
  assert.equal(report.criteria.find((c) => c.id === "C4")?.pass, false);
  assert.ok(report.rankings.some((ranking) => ranking.ranked === 1));
});

test("stale report uses per-field windows and inclusive expiry, separates aged/invalid claims, groups brands, and preserves input", () => {
  const a = car(),
    b = car("van", "van");
  a.facts = {
    price_aud: fact("price_aud", 50000, "2026-09-01"), // fresh through Oct 16, stale Oct 17
    range_km: fact("range_km", 400, "2026-04-17"), // fresh through Oct 14, stale Oct 15
    seats: fact("seats", 5, "2025-10-13"), // fresh through Oct 13, stale Oct 14
    old: fact("battery_kwh", 50, "2025-01-01"),
    invalid: fact("height_mm", 1600, "2026-02-30"),
    future: fact("width_mm", 1800, "2027-01-01"),
    empty: fact("length_mm", null, "2020-01-01"),
  };
  const data = input([a, b]);
  const feature: Feature = {
    variant_id: a.id,
    model_id: a.modelId,
    criterion: "equipment_heat_pump",
    status: "standard",
    value: "Fitted",
    conditions: "",
    source_ids: [source.id],
    evidence_scope: "AU",
    last_evidence_date: "2026-04-17",
    reviewed_date: "2026-10-01",
    verification_state: "reviewed",
  };
  data.features = [feature];
  const before = JSON.stringify(data);
  const report = buildStaleReport(data, "2026-10-13", 30);
  assert.equal(report.cars, 1);
  assert.equal(
    report.due.find((entry) => entry.key === "price_aud")?.staleOn,
    "2026-10-17",
  );
  assert.equal(
    report.due.find((entry) => entry.key === "range_km")?.staleOn,
    "2026-10-15",
  );
  assert.equal(
    report.due.find((entry) => entry.key === "seats")?.staleOn,
    "2026-10-14",
  );
  assert.equal(
    report.due.find((entry) => entry.kind === "equipment")?.staleOn,
    "2026-10-15",
    "review date cannot reset older evidence age",
  );
  assert.equal(report.overdue.length, 1);
  assert.equal(report.invalid.length, 2);
  assert.equal(
    report.due.some((entry) => entry.key === "empty"),
    false,
  );
  assert.equal(report.brands.length, 1);
  assert.match(
    formatStaleReport(report),
    /Maker: 4 due; 1 already aged; 2 dates need review/,
  );
  assert.equal(buildStaleReport(data, "2026-10-13", 30, true).cars, 2);
  assert.equal(JSON.stringify(data), before);
});

test("empty catalogues do not manufacture 100% coverage or target passes", () => {
  const report = buildCoverageReport(input([]), "2026-10-13");
  assert.ok(
    report.core.every((fact) => fact.filledPercent === null && !fact.passes),
  );
  assert.equal(report.inAllRankingsPercent, null);
  assert.equal(report.criteria.find((c) => c.id === "C5")?.pass, false);
  assert.match(formatCoverageReport(report), /n\/a/);
});

test("explicit offer deadlines and sourced model-year changes take precedence over age windows", () => {
  const a = car();
  a.facts = {
    price_aud: { ...fact("price_aud", 50000), validUntil: "2026-10-15" },
    seats: { ...fact("seats", 5), modelYearChangedAt: "2026-10-20" },
    warranty: {
      ...fact("warranty", "5 years"),
      modelYearChangedAt: "2026-10-10",
    },
    invalid: { ...fact("height_mm", 1600), modelYearChangedAt: "invalid" },
  };
  const report = buildStaleReport(input([a]), "2026-10-13");
  assert.equal(
    report.due.find((e) => e.key === "price_aud")?.staleOn,
    "2026-10-16",
  );
  assert.equal(
    report.due.find((e) => e.key === "price_aud")?.dueReason,
    "offer deadline",
  );
  assert.equal(
    report.due.find((e) => e.key === "seats")?.staleOn,
    "2026-10-20",
  );
  assert.equal(
    report.overdue.find((e) => e.key === "warranty")?.staleOn,
    "2026-10-10",
  );
  assert.equal(report.invalid.length, 1);
  assert.match(formatStaleReport(report), /offer deadline/);
});

test("explicitly historical expired offers remain auditable without hiding active source or canonical offer failures", () => {
  const a = car();
  a.facts = {
    history: {
      ...fact("source_expired_introductory_offer_1", 45000),
      validUntil: "2026-09-01",
    },
    active: {
      ...fact("source_current_offer", 46000),
      validUntil: "2026-10-10",
    },
    canonical: { ...fact("price_aud", 47000), validUntil: "2026-10-10" },
  };
  const report = buildStaleReport(input([a]), "2026-10-13");
  assert.equal(report.historical.length, 1);
  assert.match(report.historical[0].exclusionReason, /historical/);
  assert.equal(report.overdue.length, 2);
  assert.ok(report.overdue.some((e) => e.key === "price_aud"));
  assert.ok(report.overdue.some((e) => e.key === "source_current_offer"));
  assert.equal(
    buildCoverageReport(input([a]), "2026-10-13").criteria.find(
      (c) => c.id === "C6",
    )?.pass,
    false,
  );
});
