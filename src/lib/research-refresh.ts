import type { Car, Fact, Feature, Source } from "./types";
import { validDate } from "./corrections";
import { availabilityLabels } from "./config";

type AvailabilityState = {
  availability: string;
  evidence: Car["availabilityEvidence"];
  availabilityRevision?: string | null;
};
type BaseRefresh = {
  id: string;
  variantId: string;
  key: string;
  checkedAt: string;
  reviewedBy: string;
  reason: string;
  evidence: {
    applicationSourceId: string;
    url: string;
    locator: string;
    sha256: string;
  }[];
};
export type ResearchRefresh = BaseRefresh &
  (
    | { kind: "fact"; before: Fact | null; after: Fact }
    | { kind: "feature"; before: Feature; after: Feature }
    | {
        kind: "availability";
        before: AvailabilityState;
        after: AvailabilityState;
      }
  );

// Object property order is not evidence; array order and every recorded field are.
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => `${JSON.stringify(key)}:${canonical(v)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "undefined";
}
function check(edit: ResearchRefresh, actual: unknown, sources: Source[]) {
  if (canonical(actual) !== canonical(edit.before))
    throw new Error(
      `Research refresh conflict ${edit.id}: exact reviewed state changed`,
    );
  if (
    !edit.id.trim() ||
    !edit.reviewedBy.trim() ||
    !edit.reason.trim() ||
    !validDate(edit.checkedAt) ||
    !edit.evidence.length
  )
    throw new Error(`Research refresh ${edit.id} lacks provenance`);
  const ids =
    edit.kind === "fact"
      ? edit.after.sourceIds
      : edit.kind === "feature"
        ? edit.after.source_ids
        : (edit.after.evidence?.sourceIds ?? []);
  if (
    !ids.length ||
    ids.some((id) => !edit.evidence.some((e) => e.applicationSourceId === id))
  )
    throw new Error(
      `Research refresh ${edit.id} lacks exact supporting evidence`,
    );
  for (const e of edit.evidence) {
    const source = sources.find((s) => s.id === e.applicationSourceId);
    if (
      !source ||
      source.url !== e.url ||
      source.publication_hold ||
      source.access_limitation ||
      source.conflict ||
      !/^https?:\/\//.test(e.url) ||
      !e.locator.trim() ||
      !/^[a-f0-9]{64}$/.test(e.sha256)
    )
      throw new Error(`Research refresh ${edit.id} has unusable evidence`);
  }
  if (edit.kind !== "availability") {
    const after = edit.after;
    if (
      ![
        "standard",
        "conditional",
        "not_verified",
        "subjective",
        "unavailable",
        "optional",
        "not_applicable",
      ].includes(after.status)
    )
      throw new Error(`Research refresh ${edit.id} has invalid status`);
    if (
      edit.kind === "feature" &&
      (!validDate(edit.after.last_evidence_date) ||
        !validDate(edit.after.reviewed_date) ||
        edit.after.last_evidence_date > edit.checkedAt ||
        edit.after.reviewed_date > edit.checkedAt)
    )
      throw new Error(
        `Research refresh ${edit.id} has invalid equipment dates`,
      );
    if (
      edit.kind === "fact" &&
      after.status === "not_verified" &&
      edit.after.value !== null
    )
      throw new Error(
        `Research refresh ${edit.id} exposes an unverified fact value`,
      );
  } else if (
    !edit.after.evidence ||
    !validDate(edit.after.evidence.checkedAt) ||
    edit.after.evidence.checkedAt > edit.checkedAt
  ) {
    throw new Error(
      `Research refresh ${edit.id} has invalid availability evidence date`,
    );
  }
  if (edit.kind === "availability") {
    const e = edit.after.evidence!;
    if (
      !Object.hasOwn(availabilityLabels, edit.after.availability) ||
      ![
        "listed_unconfirmed",
        "accepting_orders",
        "accepting_orders_advertised",
        "accepting_order_requests_advertised",
        "not_accepting_orders",
        "unverified",
      ].includes(e.orderStatus) ||
      !["new_stock_listed", "no_new_stock_verified", "unverified"].includes(
        e.stockStatus,
      ) ||
      !e.qualifications?.length
    )
      throw new Error(
        `Research refresh ${edit.id} has invalid availability scope`,
      );
    if (
      edit.after.availability === "not_current" &&
      (e.stockStatus === "new_stock_listed" ||
        e.orderStatus.startsWith("accepting_"))
    )
      throw new Error(
        `Research refresh ${edit.id} has contradictory eligibility`,
      );
  }
}

/** Research updates are explicit source-reviewed overlays, not human-approved issue reports. */
export function validateRefreshRegistry(
  edits: ResearchRefresh[],
  variantIds: string[],
  sources: Source[],
) {
  const ids = new Set<string>();
  const targets = new Set<string>();
  for (const edit of edits) {
    const target = `${edit.kind}:${edit.variantId}:${edit.key}`;
    if (ids.has(edit.id) || targets.has(target))
      throw new Error(`Duplicate research refresh ${edit.id}`);
    if (
      !variantIds.includes(edit.variantId) ||
      !["fact", "feature", "availability"].includes(edit.kind)
    )
      throw new Error(`Research refresh ${edit.id} has an unknown target`);
    ids.add(edit.id);
    targets.add(target);
    check(edit, edit.before, sources);
  }
}

export function refreshFacts(
  id: string,
  facts: Record<string, Fact>,
  edits: ResearchRefresh[],
  sources: Source[],
) {
  const result = { ...facts };
  for (const edit of edits) {
    if (edit.variantId !== id || edit.kind !== "fact") continue;
    check(edit, result[edit.key] ?? null, sources);
    if (
      edit.after.key !== edit.key ||
      (typeof edit.after.value === "number" &&
        !Number.isFinite(edit.after.value)) ||
      !validDate(edit.after.date) ||
      edit.after.date > edit.checkedAt
    )
      throw new Error(
        `Research refresh ${edit.id} has invalid fact identity/date/value`,
      );
    result[edit.key] = structuredClone(edit.after);
  }
  return result;
}
export function refreshFeatures(
  features: Feature[],
  edits: ResearchRefresh[],
  sources: Source[],
) {
  const result = [...features];
  for (const edit of edits) {
    if (
      edit.kind !== "feature" ||
      !result.some((f) => f.variant_id === edit.variantId)
    )
      continue;
    const i = result.findIndex(
      (f) => f.variant_id === edit.variantId && f.criterion === edit.key,
    );
    check(edit, result[i], sources);
    if (
      edit.after.variant_id !== edit.variantId ||
      edit.after.criterion !== edit.key ||
      edit.after.model_id !== result[i].model_id
    )
      throw new Error(`Research refresh ${edit.id} changes equipment identity`);
    result[i] = structuredClone(edit.after);
  }
  return result;
}
export function refreshAvailability(
  cars: Car[],
  edits: ResearchRefresh[],
  sources: Source[],
) {
  const result = [...cars];
  for (const edit of edits) {
    if (edit.kind !== "availability") continue;
    const i = result.findIndex((c) => c.id === edit.variantId);
    const car = result[i];
    if (!car)
      throw new Error(`Research refresh ${edit.id} targets an unknown vehicle`);
    check(
      edit,
      {
        availability: car.availability,
        evidence: car.availabilityEvidence,
        availabilityRevision: car.availabilityRevision ?? null,
      },
      sources,
    );
    result[i] = {
      ...car,
      availability: edit.after.availability,
      availabilityEvidence: structuredClone(edit.after.evidence),
      availabilityRevision: edit.id,
    };
  }
  return result;
}
