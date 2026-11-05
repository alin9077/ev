/** Buyer grades describe source quality, separately from freshness or equipment inclusion. */
import { isRetainedAUMakerSource } from "./evidence-regrade-policy";
import type { BuyerGrade, Fact, Feature, GradeReview, Source } from "./types";

export const gradeLabels: Record<BuyerGrade, string> = {
  confirmed: "Confirmed",
  check: "Check",
  reported: "Reported",
  not_published: "Not published",
};
export function gradeLabel(grade: BuyerGrade): string {
  return gradeLabels[grade];
}
/** Unreviewed unknowns are not evidence of a completed unsuccessful search. */
export function buyerGradeOf(fact: {
  buyerGrade?: BuyerGrade;
}): BuyerGrade | undefined {
  return fact.buyerGrade;
}
function realDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );
}
/** A reporting check, never an automatic promotion from status or source presence. */
export function hasEarnedBuyerGrade(
  fact:
    | Pick<
        Fact,
        | "value"
        | "status"
        | "buyerGrade"
        | "gradeReview"
        | "gradeReviewStatus"
        | "sourceIds"
      >
    | Pick<
        Feature,
        | "value"
        | "status"
        | "buyerGrade"
        | "gradeReview"
        | "gradeReviewStatus"
        | "source_ids"
      >,
  sources: Source[],
  asOf: string,
  sourceIndex: ReadonlyMap<string, Source> = new Map(
    sources.map((source) => [source.id, source]),
  ),
): boolean {
  const review = fact.gradeReview;
  if (
    fact.gradeReviewStatus === "review_required" ||
    !fact.buyerGrade ||
    !Object.hasOwn(gradeLabels, fact.buyerGrade) ||
    !review ||
    ![
      "exact_au_version",
      "explicit_au_range",
      "brand_au_terms",
      "secondary_or_sibling",
      "searched_not_found",
    ].includes(review.evidenceScope) ||
    !realDate(asOf) ||
    !realDate(review.reviewedAt) ||
    review.reviewedAt > asOf ||
    typeof review.overlayId !== "string" ||
    !review.overlayId.trim() ||
    typeof review.reason !== "string" ||
    !review.reason.trim() ||
    !Array.isArray(review.sourceIds) ||
    !review.sourceIds.length ||
    review.sourceIds.some((id) => typeof id !== "string" || !id)
  )
    return false;
  const supportingIds = "sourceIds" in fact ? fact.sourceIds : fact.source_ids;
  if (
    !Array.isArray(supportingIds) ||
    !review.sourceIds.every((id) => supportingIds.includes(id))
  )
    return false;
  const cited = review.sourceIds.map((id) => sourceIndex.get(id));
  if (
    cited.some(
      (source) =>
        !source ||
        !/^https?:\/\//.test(source.url) ||
        !realDate(source.accessed_date) ||
        source.accessed_date > review.reviewedAt ||
        source.access_limitation ||
        source.publication_hold,
    )
  )
    return false;
  if (fact.buyerGrade === "not_published") {
    // Facts retain actual nulls. Only the string-valued equipment shape uses
    // the canonical label; a hybrid carrying sourceIds still follows Fact rules.
    const missingValue =
      "sourceIds" in fact
        ? fact.value === null
        : fact.value === "Not published";
    return (
      review.evidenceScope === "searched_not_found" &&
      fact.status === "not_verified" &&
      missingValue &&
      new Set(cited.map((source) => source!.url.replace(/#.*$/, ""))).size >= 2
    );
  }
  if (fact.value === null || fact.value === undefined) return false;
  return fact.buyerGrade === "reported"
    ? review.evidenceScope === "secondary_or_sibling"
    : review.evidenceScope !== "secondary_or_sibling" &&
        review.evidenceScope !== "searched_not_found" &&
        cited.every((source) => source && isRetainedAUMakerSource(source));
}
export function gradeReview(
  reviewedAt: string,
  overlayId: string,
  reason: string,
  evidenceScope: GradeReview["evidenceScope"],
  sourceIds: string[],
): GradeReview {
  return {
    reviewedAt,
    overlayId,
    reason,
    evidenceScope,
    sourceIds: [...sourceIds],
  };
}
/** A trailer-total observation does not fill or rank a braked-towing field. */
export function isBrakedTowingBasisEstablished(fact: Fact): boolean {
  const basis = `${fact.basis} ${fact.comparisonBasis}`;
  const context = `${basis} ${(fact.qualifications ?? []).join(" ")} ${fact.conditionExplanation || ""}`;
  if (
    fact.value === 0 &&
    /towing (?:not (?:permitted|allowed)|prohibited)|not (?:permitted|allowed) to tow/i.test(
      context,
    )
  )
    return true;
  const unclear =
    /(?:braked|brake|braking).{0,65}(?:not (?:stated|specified|established)|unspecified|unknown|unverified)|(?:no|without).{0,30}(?:braked|brake).{0,25}(?:rating|basis|qualification|label|distinction)|does not (?:state|specify|establish).{0,30}\bbraked\b/i;
  // Preserve the exact structured source label without normalising arbitrary
  // underscore tokens or inferring a measurement basis from review prose.
  const knownBrakedToken = [fact.basis, fact.comparisonBasis].includes(
    "braked_trailer_mass",
  );
  return (
    (/\bbraked\b/i.test(basis) || knownBrakedToken) && !unclear.test(context)
  );
}
