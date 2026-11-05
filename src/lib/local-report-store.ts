import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  serializeBoundIssueReport,
  type BoundIssueReport,
} from "./report-claim-binding";
import { boundReportFilename, isReportId } from "./report-queue-files";

type StagedFile = {
  writeFile: (text: string) => Promise<unknown>;
  sync: () => Promise<unknown>;
  close: () => Promise<unknown>;
};
export type LocalReportStoreIO = {
  openStage: (filename: string) => Promise<StagedFile>;
  publish: (staged: string, final: string) => Promise<unknown>;
  syncDirectory: (directory: string) => Promise<unknown>;
  removeStage: (filename: string) => Promise<unknown>;
};

export const localReportStoreIO: LocalReportStoreIO = {
  openStage: (filename) => fs.open(filename, "wx", 0o600),
  // link is atomic and fails if the destination exists; rename may overwrite it.
  publish: (staged, final) => fs.link(staged, final),
  syncDirectory: async (directory) => {
    const handle = await fs.open(directory, "r");
    try {
      await handle.sync();
    } finally {
      await handle.close();
    }
  },
  removeStage: (filename) => fs.unlink(filename),
};

/** Node-only local sink. Never publishes a partially written recognized file. */
export async function persistLocalReport(
  report: BoundIssueReport,
  options: {
    directory: string;
    io?: LocalReportStoreIO;
    stageId?: () => string;
    onCleanupError?: (operation: "close" | "unlink") => void;
  },
): Promise<void> {
  // Capture both identity and complete bytes before the first asynchronous step.
  const finalName = boundReportFilename(report.id);
  const serialized = serializeBoundIssueReport(report);
  const directory = path.resolve(options.directory);
  const stageId = (options.stageId || randomUUID)();
  if (!isReportId(stageId))
    throw new Error("Invalid private staging identity.");
  const staged = path.join(directory, `.roadmark-stage-${stageId}.tmp`);
  const final = path.join(directory, finalName);
  const io = options.io || localReportStoreIO;
  let owned = false;
  let handle: StagedFile | undefined;
  const cleanupWarning = (operation: "close" | "unlink") => {
    try {
      options.onCleanupError?.(operation);
    } catch {
      // A logging failure must not change the already established save outcome.
    }
  };
  try {
    handle = await io.openStage(staged);
    owned = true;
    await handle.writeFile(serialized);
    await handle.sync();
    await handle.close();
    handle = undefined;
    await io.publish(staged, final);
    // Failure here is an unconfirmed save. Keep the complete final entry intact.
    await io.syncDirectory(directory);
  } finally {
    if (handle) {
      try {
        await handle.close();
      } catch {
        cleanupWarning("close");
      }
    }
    if (owned) {
      try {
        await io.removeStage(staged);
      } catch {
        cleanupWarning("unlink");
      }
    }
    // Never delete a final entry, or a stage whose exclusive creation failed.
  }
}
