/** Explicit local read-only CLI; importing this module opens no files or streams. */
import { constants } from "node:fs";
import { open } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { MAX_STORED_REPORT_BYTES } from "../src/lib/report-claim-binding";
import { boundReportFilename } from "../src/lib/report-queue-files";
import { MAX_REVIEW_CONTEXT_BYTES } from "../src/lib/report-review-proposal";
import {
  MAX_PREVIEW_REQUEST_BYTES, parsePreviewRequestJson, previewFail,
  previewReportReview, ReportPreviewError, serializeDryRunResult,
  type PreviewErrorCode,
} from "../src/lib/report-review-dry-run";

type FileStat = {
  isFile(): boolean; size: number; dev: number; ino: number; mtimeMs: number; ctimeMs: number;
};
export type ReadOnlyHandle = {
  stat(): Promise<FileStat>;
  read(buffer: Uint8Array, offset: number, length: number, position: number): Promise<{ bytesRead: number }>;
  close(): Promise<void>;
};
export type ReadOnlyIO = {
  constants: { O_RDONLY: number; O_NOFOLLOW?: number; O_NONBLOCK?: number };
  open(filename: string, flags: number): Promise<ReadOnlyHandle>;
};
const localIO: ReadOnlyIO = { constants, open };
const safePath = (value: string) => !!value && !value.includes("\0") && !value.startsWith("--") &&
  !/^[a-z][a-z0-9+.-]*:/i.test(value);
export function parsePreviewArguments(argv: readonly string[]): { queueDir: string; history: string } {
  if (argv.length !== 4) return previewFail("invalid_arguments");
  const values = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i], value = argv[i + 1];
    if (!["--queue-dir", "--history"].includes(flag) || values.has(flag) || !safePath(value))
      return previewFail("invalid_arguments");
    values.set(flag, value);
  }
  if (values.size !== 2) return previewFail("invalid_arguments");
  return { queueDir: values.get("--queue-dir")!, history: values.get("--history")! };
}
export function decodePreviewUtf8(value: Uint8Array): string {
  // Reject BOM, rather than allowing TextDecoder to silently remove bytes.
  if (value[0] === 0xef && value[1] === 0xbb && value[2] === 0xbf) return previewFail("invalid_utf8");
  try { return new TextDecoder("utf-8", { fatal: true }).decode(value); }
  catch { return previewFail("invalid_utf8"); }
}
export async function readPreviewStdin(chunks: AsyncIterable<Uint8Array>): Promise<string> {
  const buffer = new Uint8Array(MAX_PREVIEW_REQUEST_BYTES);
  let size = 0;
  try {
    for await (const chunk of chunks) {
      if (!(chunk instanceof Uint8Array)) return previewFail("input_failed");
      if (chunk.byteLength > buffer.length - size) return previewFail("request_too_large");
      buffer.set(chunk, size); size += chunk.byteLength;
    }
  } catch (error) {
    if (error instanceof ReportPreviewError) throw error;
    return previewFail("input_failed");
  }
  return decodePreviewUtf8(buffer.subarray(0, size));
}
/** Final-file no-follow plus descriptor checks; parent-directory replacement is not defended. */
export async function readPreviewFile(filename: string, cap: number, io: ReadOnlyIO = localIO): Promise<unknown> {
  const c = io.constants;
  if (!Number.isInteger(c.O_RDONLY) || !Number.isInteger(c.O_NOFOLLOW) || !c.O_NOFOLLOW ||
    !Number.isInteger(c.O_NONBLOCK) || !c.O_NONBLOCK) return previewFail("protection_unavailable");
  let file: ReadOnlyHandle | undefined;
  let primaryError: unknown;
  try {
    file = await io.open(filename, c.O_RDONLY | c.O_NOFOLLOW | c.O_NONBLOCK);
    const before = await file.stat();
    if (!before.isFile()) return previewFail("file_not_regular");
    if (!Number.isSafeInteger(before.size) || before.size < 0 || before.size > cap) return previewFail("file_too_large");
    const buffer = new Uint8Array(cap + 1);
    let size = 0;
    while (size < buffer.length) {
      const part = await file.read(buffer, size, buffer.length - size, size);
      if (!Number.isInteger(part.bytesRead) || part.bytesRead < 0 || part.bytesRead > buffer.length - size)
        return previewFail("file_unreadable");
      if (part.bytesRead === 0) break;
      size += part.bytesRead;
      if (size > cap) return previewFail("file_too_large");
    }
    const after = await file.stat();
    if (!after.isFile() || size !== before.size ||
      (["dev", "ino", "size", "mtimeMs", "ctimeMs"] as const).some((key) => before[key] !== after[key]))
      return previewFail("file_changed");
    const text = decodePreviewUtf8(buffer.subarray(0, size));
    try { return JSON.parse(text) as unknown; }
    catch { return previewFail("invalid_json"); }
  } catch (error) {
    primaryError = error;
    if (error instanceof ReportPreviewError) throw error;
    return previewFail("file_unreadable");
  } finally {
    if (file) {
      try { await file.close(); }
      catch { if (!primaryError) previewFail("file_unreadable"); }
    }
  }
}
export async function runPreviewCli(
  argv: readonly string[], stdin: AsyncIterable<Uint8Array>, io: ReadOnlyIO = localIO,
): Promise<string> {
  // Validate every argument and the full bounded request before opening anything.
  const args = parsePreviewArguments(argv);
  const request = parsePreviewRequestJson(await readPreviewStdin(stdin));
  const rawReport = await readPreviewFile(path.join(args.queueDir, boundReportFilename(request.reportId)), MAX_STORED_REPORT_BYTES, io);
  const history = await readPreviewFile(args.history, MAX_REVIEW_CONTEXT_BYTES, io);
  const result = await previewReportReview({ request, rawReport, history }, {
    digest: async (canonical) => createHash("sha256").update(canonical).digest("hex"),
    now: () => new Date().toISOString(), id: randomUUID,
  });
  return serializeDryRunResult(result);
}
export function previewErrorCode(error: unknown): PreviewErrorCode {
  return error instanceof ReportPreviewError ? error.code : "preview_failed";
}
export async function main(): Promise<void> {
  try {
    const output = await runPreviewCli(process.argv.slice(2), process.stdin);
    process.stdout.once("error", () => { process.exitCode = 1; });
    await new Promise<void>((resolve, reject) => {
      // Single application-level write after all validation; a broken output pipe is not transactional.
      process.stdout.write(output, (error) => error ? reject(new ReportPreviewError("output_failed")) : resolve());
    });
  } catch (error) {
    process.exitCode = 1;
    process.stderr.once("error", () => { process.exitCode = 1; });
    process.stderr.write(previewErrorCode(error) + "\n");
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) void main();
