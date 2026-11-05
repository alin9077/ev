import { canonicalReviewedJson } from "./correction-guards";
import { makeIssueDraft, type IssueDraft } from "./corrections";
import { validReportFact } from "./report-claim-shape";
import type { Fact } from "./types";

export type DeviceIssueDraft = IssueDraft & {
  deviceClaimSnapshot: {
    schema: "roadmark-device-claim-v1";
    provenance: "device_only_unverified";
    variantId: string;
    fact: Fact;
  };
};

/** Capture the displayed report claim without implying a service match or submission. */
export function makeDeviceIssueDraft(
  variantId: string,
  fact: Fact,
  description: string,
  now: string,
  id: string,
): DeviceIssueDraft {
  if (typeof variantId !== "string" || !variantId.trim())
    throw new Error("This claim needs an exact vehicle reference.");
  const captured: unknown = JSON.parse(canonicalReviewedJson(fact));
  if (!validReportFact(captured))
    throw new Error("The complete claim could not be captured. Your description has not been saved.");
  return {
    ...makeIssueDraft(variantId, captured, description, now, id),
    deviceClaimSnapshot: {
      schema: "roadmark-device-claim-v1",
      provenance: "device_only_unverified",
      variantId,
      fact: captured,
    },
  };
}
