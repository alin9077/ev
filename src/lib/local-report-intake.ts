import {
  prepareBoundIssueReport,
  ReportBindingError,
  REPORT_CONTENT_TYPE,
  REPORT_SUBMISSION_PROTOCOL,
  type BoundIssueReport,
} from "./report-claim-binding";

export const MAX_REPORT_BODY_BYTES = 12000;
export type ReportIntakeResponse = {
  status: number;
  body: Record<string, unknown>;
};
export type ReportIntakeDependencies = Parameters<
  typeof prepareBoundIssueReport
>[1] & {
  port: number;
  persist: (report: BoundIssueReport) => Promise<void>;
};

/** Pure transport adapter: no listener, filesystem, network or catalogue startup. */
export async function handleBoundReportIntake(
  request: {
    host?: string;
    origin?: string;
    contentType?: string;
    chunks: AsyncIterable<Uint8Array>;
  },
  dependencies: ReportIntakeDependencies,
): Promise<ReportIntakeResponse> {
  try {
    if (
      request.host !== `127.0.0.1:${dependencies.port}` &&
      request.host !== `localhost:${dependencies.port}`
    )
      throw new ReportBindingError(403, "Invalid host");
    if (
      request.origin !== `http://127.0.0.1:${dependencies.port}` &&
      request.origin !== `http://localhost:${dependencies.port}`
    )
      throw new ReportBindingError(403, "Same-origin reports only");
    const media =
      request.contentType?.split(";").map((part) => part.trim()) || [];
    if (
      media[0]?.toLowerCase() !== REPORT_CONTENT_TYPE ||
      media.length > 2 ||
      (media.length === 2 && !/^charset=(?:utf-8|"utf-8")$/i.test(media[1]))
    )
      throw new ReportBindingError(
        415,
        "A current claim-bound report is required. Reload the paired preview and service; your description has not been submitted.",
      );
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    for await (const chunk of request.chunks) {
      if (!(chunk instanceof Uint8Array))
        throw new ReportBindingError(400, "Invalid report body");
      bytes += chunk.byteLength;
      if (bytes > MAX_REPORT_BODY_BYTES)
        throw new ReportBindingError(413, "Report too large");
      chunks.push(Uint8Array.from(chunk));
    }
    const buffer = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    let input: unknown;
    try {
      input = JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(buffer),
      );
    } catch {
      throw new ReportBindingError(400, "Invalid JSON or UTF-8");
    }
    const report = await prepareBoundIssueReport(input, dependencies);
    const acknowledgement = {
      id: report.id,
      status: "pending",
      mode: "local",
      submissionProtocol: REPORT_SUBMISSION_PROTOCOL,
      claimBinding: { ...report.claimBinding },
    };
    // The concrete sink must serialize this prepared record synchronously on entry.
    await dependencies.persist(report);
    return { status: 201, body: acknowledgement };
  } catch (error) {
    if (error instanceof ReportBindingError)
      return { status: error.status, body: { error: error.message } };
    return {
      status: 500,
      body: {
        error:
          "Could not confirm that the report was saved. Your description has not been cleared. Check the local queue before retrying, or save a device draft.",
      },
    };
  }
}
