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
export function parseSelection(query: URLSearchParams, cars: Car[]): Selection {
  const valid = new Map(cars.map((c) => [c.id, c]));
  const requested = (query.get("cars") || `${BASELINE},${CHALLENGER}`).split(
    ",",
  );
  let ids = [...new Set(requested.filter((id) => valid.has(id)))].slice(0, 3);
  const warnings: string[] = [];
  if (requested.some((id) => !valid.has(id)))
    warnings.push("An unknown or removed variant was omitted.");
  if (!ids.length || valid.get(ids[0])?.modelId !== "tesla_model_y") {
    ids = [BASELINE, ...ids.filter((id) => id !== BASELINE)].slice(0, 3);
    warnings.push("Model Y restored as the comparison baseline.");
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
export function formatFact(f: Fact) {
  if (f.value === null) return "Needs confirmation";
  if (f.unit === "AUD") return `A$${Number(f.value).toLocaleString("en-AU")}`;
  return `${typeof f.value === "number" ? f.value.toLocaleString("en-AU") : f.value}${f.unit ? ` ${f.unit}` : ""}`;
}
