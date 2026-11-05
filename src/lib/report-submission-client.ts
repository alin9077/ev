import {
  matchingReportAcknowledgement,
  REPORT_CONTENT_TYPE,
  type ClaimBinding,
} from "./report-claim-binding";
export const UNCONFIRMED_REPORT_SAVE =
  "Could not confirm that the report was saved. Your description is still here. Check the local queue before retrying, or save a device draft.";
/** Exactly one POST; transport and decoding failures never imply that persistence failed. */
export async function submitBoundIssueReport(
  input: {
    variantId: string;
    factKey: string;
    description: string;
    claimBinding: ClaimBinding;
  },
  post: typeof fetch = fetch,
): Promise<{ id: string }> {
  const expectedBinding = { ...input.claimBinding };
  const body = JSON.stringify({
    variantId: input.variantId,
    factKey: input.factKey,
    description: input.description,
    claimBinding: expectedBinding,
  });
  let response: Response, result: unknown;
  try {
    response = await post("/api/issues", {
      method: "POST",
      headers: { "content-type": REPORT_CONTENT_TYPE },
      body,
    });
    result = await response.json();
  } catch {
    throw new Error(UNCONFIRMED_REPORT_SAVE);
  }
  if (!response.ok) {
    const error =
      result && typeof result === "object" && "error" in result
        ? result.error
        : undefined;
    throw new Error(
      typeof error === "string"
        ? error
        : "Report was not accepted. Your description is still here.",
    );
  }
  if (!matchingReportAcknowledgement(result, expectedBinding))
    throw new Error(UNCONFIRMED_REPORT_SAVE);
  return { id: result.id };
}
