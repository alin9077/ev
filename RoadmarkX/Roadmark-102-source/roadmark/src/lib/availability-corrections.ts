import type { Car, Fact, Source } from "./types";
import { validDate } from "./corrections";
import {
  assertReviewedJson,
  nonemptyReviewText,
  sameReviewedState as same,
  usableCorrectionSources,
} from "./correction-guards";
import { availabilityLabels } from "./config";
export function orderEvidenceText(status: string) {
  if (status === "accepting_order_requests_advertised")
    return "Order requests are advertised; acceptance and delivery need confirmation.";
  if (["accepting_orders", "accepting_orders_advertised"].includes(status))
    return "Orders advertised as open.";
  if (status === "not_accepting_orders")
    return "New factory orders are not currently advertised as open.";
  return "Factory-order acceptance has not been confirmed.";
}
export type AvailabilitySnapshot = {
  availability: string;
  evidence: NonNullable<Car["availabilityEvidence"]>;
};
export type AvailabilityCorrection = {
  id: string;
  variantId: string;
  before: AvailabilitySnapshot;
  after: AvailabilitySnapshot;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string;
  reviewedAt: string;
  evidenceDate: string;
  reason: string;
  supersedes?: string;
};
export function availabilitySnapshot(car: Car): AvailabilitySnapshot {
  return {
    availability: car.availability,
    evidence: structuredClone(
      car.availabilityEvidence || {
        checkedAt: "",
        orderStatus: "unverified",
        stockStatus: "unverified",
        sourceIds: [],
      },
    ),
  };
}
/** Full-snapshot approval; a report can never promote stock or order status itself. */
export function applyAvailabilityCorrections(
  cars: Car[],
  edits: AvailabilityCorrection[],
  sources: Source[],
): Car[] {
  const result = cars.map((c) => ({ ...c }));
  const seen = new Set<string>();
  const last = new Map<string, AvailabilityCorrection>();
  for (const edit of edits) {
    if (edit.status !== "approved") continue;
    if (!nonemptyReviewText(edit.id) || seen.has(edit.id))
      throw new Error("Invalid or duplicate availability correction ID");
    seen.add(edit.id);
    const i = result.findIndex((c) => c.id === edit.variantId);
    if (
      cars.filter((car) => car.id === edit.variantId).length !== 1 ||
      i < 0 ||
      !same(availabilitySnapshot(result[i]), edit.before)
    )
      throw new Error(
        `Availability correction conflict ${edit.id}: reviewed snapshot changed or variant missing`,
      );
    const prior = last.get(edit.variantId);
    if (
      edit.supersedes !== prior?.id ||
      (prior && edit.reviewedAt < prior.reviewedAt)
    )
      throw new Error(
        `Availability correction ${edit.id} has invalid predecessor or review chronology`,
      );
    assertReviewedJson(edit.after);
    const e = edit.after.evidence;
    if (
      !nonemptyReviewText(edit.reviewedBy) ||
      !nonemptyReviewText(edit.reason) ||
      !validDate(edit.reviewedAt) ||
      !validDate(edit.evidenceDate) ||
      edit.evidenceDate > edit.reviewedAt ||
      !validDate(e.checkedAt) ||
      e.checkedAt !== edit.evidenceDate
    )
      throw new Error(
        `Availability correction ${edit.id} lacks review provenance`,
      );
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
      (e.physicalStockVerified !== undefined &&
        typeof e.physicalStockVerified !== "boolean") ||
      (e.factoryOrderAcceptanceVerified !== undefined &&
        typeof e.factoryOrderAcceptanceVerified !== "boolean") ||
      !Array.isArray(e.qualifications) ||
      !e.qualifications.length ||
      e.qualifications.some((q) => typeof q !== "string" || !q.trim())
    )
      throw new Error(
        `Availability correction ${edit.id} has invalid status or qualifications`,
      );
    if (
      edit.after.availability === "not_current" &&
      (e.stockStatus === "new_stock_listed" ||
        e.orderStatus.startsWith("accepting_"))
    )
      throw new Error(
        `Availability correction ${edit.id} has contradictory eligibility`,
      );
    if (
      !usableCorrectionSources(
        e.sourceIds,
        sources,
        edit.reviewedAt,
        e.checkedAt,
      )
    )
      throw new Error(
        `Availability correction ${edit.id} lacks usable supporting sources`,
      );
    last.set(edit.variantId, edit);
    result[i] = {
      ...result[i],
      availability: edit.after.availability,
      availabilityEvidence: structuredClone(e),
      availabilityRevision: edit.id,
      buyerSummary: undefined,
    };
  }
  return result;
}
export function availabilityReportClaim(car: Car): Fact {
  const { availability, evidence: e } = availabilitySnapshot(car);
  return {
    key: "availability:exact_version",
    label: "Availability of this exact version",
    value: `${availabilityLabels[availability] || availability}; orders: ${e.orderStatus}; stock: ${e.stockStatus}`,
    unit: "",
    basis: "Exact Australian version availability",
    comparisonBasis: "",
    status: "conditional",
    sourceIds: [...e.sourceIds],
    date: e.checkedAt,
    market: "AU",
    scope: `Exact variant ${car.id}`,
    qualifications: [
      `Checked ${e.checkedAt || "date unverified"}`,
      ...(e.qualifications || []),
    ],
    issues: [],
  };
}
