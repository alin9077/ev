import { factReaderLabel } from "./fact-presentation";
import { australianEvidenceDate } from "./evidence-date";
import { offerExpired } from "./fact-validity";
import type { Fact, Feature, Selection, Car } from "./types";
import { BASELINE, CHALLENGER, site, priorities } from "./config";
export function compareFacts(
  a: Fact,
  b: Fact,
): {
  state: "comparable" | "different_basis" | "conditional" | "unknown";
  delta?: number;
  reason: string;
} {
  if (
    offerExpired(a, australianEvidenceDate()) ||
    offerExpired(b, australianEvidenceDate())
  )
    return {
      state: "unknown",
      reason: "An offer has expired; recheck the exact price and conditions.",
    };
  if (
    a.value === null ||
    b.value === null ||
    [a.status, b.status].includes("not_verified")
  )
    return {
      state: "unknown",
      reason: "A comparable value has not been established.",
    };
  if (
    [a.status, b.status].some(
      (s) => s === "conditional" || s === "subjective" || s === "optional",
    )
  )
    return {
      state: "conditional",
      reason: "Build, evidence or equipment conditions require confirmation.",
    };
  // Identical unknown-method labels are not evidence of compatible measurements.
  // A generic model-year caveat is deliberately not a measurement-method flag.
  const unresolvedMethod =
    /\bunclassified\b|\b(?:method|basis|cycle|window)\s+(?:is\s+)?(?:unspecified|unknown|unverified|not (?:stated|published|established))\b|\b(?:unspecified|unknown|unverified)\s+(?:measurement|method|basis|cycle|window)\b/i;
  if (
    [a.comparisonBasis, b.comparisonBasis].some((basis) =>
      unresolvedMethod.test(basis),
    )
  )
    return {
      state: "different_basis",
      reason:
        "The measurement method is not established; matching labels do not make the figures comparable.",
    };
  if (a.unit !== b.unit || a.comparisonBasis !== b.comparisonBasis)
    return {
      state: "different_basis",
      reason: "Different measurement or quotation bases; no direct delta.",
    };
  return {
    state: "comparable",
    delta:
      typeof a.value === "number" && typeof b.value === "number"
        ? b.value - a.value
        : undefined,
    reason: a.basis,
  };
}
export function featuresDiffer(features: Feature[]) {
  return (
    new Set(
      features.map((f) =>
        JSON.stringify([
          f.status,
          f.value,
          f.conditions,
          f.condition_label,
          f.usability_notes,
          f.confirmation_needed,
          f.evidence_scope,
          f.verification_state,
          f.last_evidence_date,
        ]),
      ),
    ).size > 1
  );
}
export function factsDiffer(facts: Fact[]) {
  return (
    new Set(
      facts.map((f) =>
        JSON.stringify([
          f.value,
          f.unit,
          f.basis,
          f.status,
          f.qualifications,
          f.issues.map((i) => i.issue_id),
        ]),
      ),
    ).size > 1
  );
}
export function parseSelection(
  query: URLSearchParams,
  cars: readonly Pick<Car, "id">[],
): Selection {
  const valid = new Map(cars.map((c) => [c.id, c]));
  const requested = (query.get("cars") || `${BASELINE},${CHALLENGER}`).split(
    ",",
  );
  let ids = [...new Set(requested.filter((id) => valid.has(id)))].slice(0, 3);
  const warnings: string[] = [];
  if (requested.some((id) => !valid.has(id)))
    warnings.push("An unknown or removed variant was omitted.");
  if (!ids.length) {
    ids = [BASELINE, CHALLENGER];
    warnings.push("No valid variants were selected; showing the default pair.");
  }
  if (ids.length === 1) ids.push(ids[0] === CHALLENGER ? BASELINE : CHALLENGER);
  const rawSection = query.get("section");
  const section =
    rawSection === "features" || rawSection === "software"
      ? rawSection
      : "overview";
  const dataset = query.get("data") || site.date;
  if (dataset !== site.date)
    warnings.push(
      `This link used research dated ${dataset.slice(0, 30)}. Showing the available ${site.date} snapshot.`,
    );
  return {
    ids,
    active: ids.slice(1).includes(query.get("active") || "")
      ? query.get("active")!
      : ids[1],
    section,
    q: (query.get("q") || "").slice(0, 100),
    category: (query.get("category") || "All categories").slice(0, 100),
    diff: query.get("diff") === "1",
    priority: priorities.includes(query.get("priority") || "")
      ? query.get("priority")!
      : "",
    warning: warnings.join(" "),
    dataset,
  };
}
export function selectionUrl(state: Selection, path = "/compare") {
  const q = new URLSearchParams({
    cars: state.ids.join(","),
    active: state.active,
    section: state.section,
    data: site.date,
  });
  if (state.q) q.set("q", state.q);
  if (state.category !== "All categories") q.set("category", state.category);
  if (state.diff) q.set("diff", "1");
  if (state.priority) q.set("priority", state.priority);
  return `${path}?${q}`;
}
/** Preserve structured source observations without coercing them to [object Object]. */
export function formatEvidenceValue(value: unknown): string {
  if (value == null) return "Not verified";
  if (typeof value === "number")
    return Number.isFinite(value)
      ? value.toLocaleString("en-AU")
      : "Not verified";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map(formatEvidenceValue).join(" / ");
  if (typeof value === "object")
    return Object.entries(value)
      .map(([key, part]) => {
        const label = key
          .replaceAll("_", " ")
          .replace(/\bkw\b/g, "kW")
          .replace(/\bnm\b/g, "Nm")
          .replace(/\bpct\b/g, "%");
        return `${label}: ${formatEvidenceValue(part)}`;
      })
      .join("; ");
  return String(value);
}
export function formatFact(
  f: Pick<Fact, "value" | "unit" | "validUntil"> &
    Partial<Pick<Fact, "key" | "buyerGrade">>,
  asOf = australianEvidenceDate(),
) {
  if (offerExpired(f, asOf)) return "Expired offer: needs confirmation";
  if (f.value === null)
    return f.buyerGrade === "not_published"
      ? "Not published"
      : "Needs confirmation";
  if (f.unit === "AUD")
    return typeof f.value === "number" && Number.isFinite(f.value)
      ? `A$${f.value.toLocaleString("en-AU")}`
      : "Needs confirmation";
  if (
    (f.key === "source_model_year" || f.key === "model_year") &&
    typeof f.value === "number" &&
    Number.isInteger(f.value)
  )
    return String(f.value);
  const unit = f.unit === "people" && f.value === 1 ? "person" : f.unit;
  return `${formatEvidenceValue(f.value)}${unit ? ` ${unit}` : ""}`;
}

/** Shared headings cannot impose one vehicle's measurement or model-year basis on others. */
export function comparisonFactLabel(
  key: string,
  facts: (Pick<Fact, "label" | "basis"> | undefined)[],
  fallback = key,
): string {
  const present = facts.filter(
    (fact): fact is Pick<Fact, "label" | "basis"> => !!fact,
  );
  const mixedBasis =
    new Set(present.map((fact) => `${fact.label}|${fact.basis}`)).size > 1;
  if (mixedBasis) {
    if (key === "dc_charge_time_min") return "Published DC charging duration";
    if (key === "boot_l") return "Cargo behind occupied seats";
    if (key === "zero_to_100_s") return "Published 0–100 km/h claim";
    if (key === "price_aud") return "Published price";
  }
  return factReaderLabel(key, present[0]?.label || fallback);
}
