import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import {
  persistLocalReport,
  localReportStoreIO,
  type LocalReportStoreIO,
} from "../src/lib/local-report-store";
import {
  createClaimBinding,
  prepareBoundIssueReport,
  serializeBoundIssueReport,
  REPORT_CONTENT_TYPE,
  MAX_STORED_REPORT_BYTES,
} from "../src/lib/report-claim-binding";
import {
  boundReportFilename,
  reportFileKind,
} from "../src/lib/report-queue-files";
import { loadReportQueue } from "../src/lib/report-queue-reader";
import { handleBoundReportIntake } from "../src/lib/local-report-intake";
import type { Fact } from "../src/lib/types";

const id = "12345678-1234-1234-1234-123456789abc";
const stageId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const now = "2026-10-11T14:00:00.000Z";
const digest = async (text: string) =>
  createHash("sha256").update(text).digest("hex");
const fact = {
  key: "range",
  label: "Range",
  value: 420,
  unit: "km",
  basis: "WLTP",
  comparisonBasis: "WLTP",
  status: "standard",
  sourceIds: ["source-a"],
  date: "2026-10-11",
  market: "AU",
  scope: "Exact version",
  qualifications: [],
  issues: [],
  conditionExplanation: null,
} as unknown as Fact; // Runtime report schema explicitly preserves null explanations.
const dependencies = {
  resolveClaim: () => ({ fact, vehicleLabel: "Éxample exact trim" }),
  digest,
  now: () => now,
  id: () => id,
};
const input = async () => ({
  variantId: "car",
  factKey: "range",
  description: "Please verify this Australian claim.",
  claimBinding: await createClaimBinding("car", fact, digest),
});
const record = async () => prepareBoundIssueReport(await input(), dependencies);
async function queue(t: TestContext) {
  const directory = await fs.mkdtemp(
    path.join(tmpdir(), "roadmark-atomic-test-"),
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return directory;
}
function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}
async function recognized(directory: string) {
  return (await fs.readdir(directory)).filter((name) => reportFileKind(name));
}

test("capture precedes the very first await and directory identity cannot drift", async (t) => {
  const directory = await queue(t),
    otherDirectory = await queue(t),
    report = await record();
  const expected = serializeBoundIssueReport(report),
    entered = gate(),
    resume = gate();
  const synced: string[] = [];
  const options = {
    directory,
    io: {
      ...localReportStoreIO,
      openStage: async (filename: string) => {
        entered.release();
        await resume.promise;
        return localReportStoreIO.openStage(filename);
      },
      syncDirectory: async (dir: string) => {
        synced.push(dir);
        return localReportStoreIO.syncDirectory(dir);
      },
    },
  };
  const saving = persistLocalReport(report, options);
  await entered.promise;
  report.id = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
  report.description = "Mutated before opening the stage.";
  report.observedClaim.value = 999;
  options.directory = otherDirectory;
  resume.release();
  await saving;
  assert.equal(
    await fs.readFile(path.join(directory, boundReportFilename(id)), "utf8"),
    expected,
  );
  assert.deepEqual(synced, [directory]);
  assert.deepEqual(await fs.readdir(otherDirectory), []);
});

test("every required write and commit step completes in order before persistence resolves", async () => {
  const stages = [
    "open",
    "write",
    "file-sync",
    "close",
    "publish",
    "directory-sync",
  ];
  const entered = stages.map(() => gate()),
    resume = stages.map(() => gate());
  const trace: string[] = [];
  const step = async (index: number) => {
    trace.push(stages[index]);
    entered[index].release();
    await resume[index].promise;
  };
  let settled = false;
  const saving = persistLocalReport(await record(), {
    directory: "/synthetic-queue",
    io: {
      openStage: async () => {
        await step(0);
        return {
          writeFile: () => step(1),
          sync: () => step(2),
          close: () => step(3),
        };
      },
      publish: () => step(4),
      syncDirectory: () => step(5),
      removeStage: async () => {
        trace.push("cleanup");
      },
    },
  }).then(() => {
    settled = true;
  });
  for (let index = 0; index < stages.length; index++) {
    await entered[index].promise;
    assert.deepEqual(trace, stages.slice(0, index + 1));
    assert.equal(settled, false);
    resume[index].release();
  }
  await saving;
  assert.deepEqual(trace, [...stages, "cleanup"]);
});

test("partial staged bytes stay invisible and identity/Unicode/null snapshot is captured synchronously", async (t) => {
  const directory = await queue(t),
    report = await record();
  const expected = serializeBoundIssueReport(report),
    entered = gate(),
    resume = gate();
  const io: LocalReportStoreIO = {
    ...localReportStoreIO,
    openStage: async (filename) => {
      const handle = await fs.open(filename, "wx", 0o600);
      return {
        writeFile: async (text) => {
          await handle.writeFile(text.slice(0, 23));
          entered.release();
          await resume.promise;
          await handle.writeFile(text.slice(23));
        },
        sync: () => handle.sync(),
        close: () => handle.close(),
      };
    },
  };
  const saving = persistLocalReport(report, { directory, io });
  await entered.promise;
  assert.deepEqual(await recognized(directory), []);
  report.id = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
  report.description = "Changed after capture";
  report.observedClaim.value = 999;
  resume.release();
  await saving;
  assert.deepEqual(await recognized(directory), [boundReportFilename(id)]);
  assert.equal(
    await fs.readFile(path.join(directory, boundReportFilename(id)), "utf8"),
    expected,
  );
  assert.equal((await fs.readdir(directory)).length, 1);
  assert.equal(JSON.parse(expected).observedClaim.conditionExplanation, null);
  assert.match(expected, /Éxample/);
});

test("invalid identity and oversized stored bytes fail before creating any file", async (t) => {
  const directory = await queue(t),
    report = await record();
  await assert.rejects(
    persistLocalReport({ ...report, id: "../escape" }, { directory }),
  );
  await assert.rejects(
    persistLocalReport(report, { directory, stageId: () => "../escape" }),
  );
  await assert.rejects(
    persistLocalReport(
      { ...report, description: "é".repeat(MAX_STORED_REPORT_BYTES) },
      { directory },
    ),
  );
  assert.deepEqual(await fs.readdir(directory), []);
});

for (const failure of ["open", "write", "sync", "close", "publish"] as const) {
  test(`failure before publication at ${failure} leaves no recognized partial record`, async (t) => {
    const directory = await queue(t),
      report = await record();
    const io: LocalReportStoreIO = {
      ...localReportStoreIO,
      openStage: async (filename) => {
        if (failure === "open") throw new Error("injected open");
        const handle = await fs.open(filename, "wx", 0o600);
        let closeAttempt = 0;
        return {
          writeFile: async (text) => {
            if (failure === "write") {
              await handle.writeFile("partial");
              throw new Error("injected write");
            }
            await handle.writeFile(text);
          },
          sync: async () => {
            if (failure === "sync") throw new Error("injected sync");
            await handle.sync();
          },
          close: async () => {
            if (failure === "close" && closeAttempt++ === 0)
              throw new Error("injected close");
            await handle.close();
          },
        };
      },
      publish: async (staged, final) => {
        if (failure === "publish") throw new Error("injected publish");
        await fs.link(staged, final);
      },
    };
    await assert.rejects(
      persistLocalReport(report, { directory, io }),
      /injected/,
    );
    assert.deepEqual(await fs.readdir(directory), []);
  });
}

test("failed exclusive stage creation never deletes another writer's file", async (t) => {
  const directory = await queue(t),
    filename = path.join(directory, `.roadmark-stage-${stageId}.tmp`);
  await fs.writeFile(filename, "owned by another writer");
  await assert.rejects(
    persistLocalReport(await record(), { directory, stageId: () => stageId }),
  );
  assert.equal(await fs.readFile(filename, "utf8"), "owned by another writer");
});

for (const existing of ["file", "directory", "symlink"] as const) {
  test(`publication never replaces an existing final ${existing}`, async (t) => {
    const directory = await queue(t),
      final = path.join(directory, boundReportFilename(id));
    const target = path.join(directory, "existing-private-target");
    if (existing === "directory") await fs.mkdir(final);
    else if (existing === "symlink") {
      await fs.writeFile(target, "existing");
      await fs.symlink(target, final);
    } else await fs.writeFile(final, "existing");
    await assert.rejects(persistLocalReport(await record(), { directory }));
    const stat = await fs.lstat(final);
    assert.equal(
      existing === "directory"
        ? stat.isDirectory()
        : existing === "symlink"
          ? stat.isSymbolicLink()
          : stat.isFile(),
      true,
    );
    if (existing !== "directory")
      assert.equal(await fs.readFile(final, "utf8"), "existing");
    assert.equal(
      (await fs.readdir(directory)).filter((name) =>
        name.startsWith(".roadmark-stage-"),
      ).length,
      0,
    );
  });
}

test("concurrent same-ID writers have exactly one complete winner", async (t) => {
  const directory = await queue(t),
    first = await record(),
    second = await record();
  second.description = "A separately prepared competing report.";
  const outcomes = await Promise.allSettled([
    persistLocalReport(first, { directory }),
    persistLocalReport(second, { directory }),
  ]);
  assert.equal(
    outcomes.filter((outcome) => outcome.status === "fulfilled").length,
    1,
  );
  assert.equal(
    outcomes.filter((outcome) => outcome.status === "rejected").length,
    1,
  );
  const raw = await fs.readFile(
    path.join(directory, boundReportFilename(id)),
    "utf8",
  );
  assert.ok(
    [
      serializeBoundIssueReport(first),
      serializeBoundIssueReport(second),
    ].includes(raw),
  );
  assert.deepEqual(await fs.readdir(directory), [boundReportFilename(id)]);
});

test("directory-sync failure keeps complete final record but rejects confirmation", async (t) => {
  const directory = await queue(t),
    report = await record();
  await assert.rejects(
    persistLocalReport(report, {
      directory,
      io: {
        ...localReportStoreIO,
        syncDirectory: async () => {
          throw new Error("injected directory sync");
        },
      },
    }),
    /directory sync/,
  );
  assert.equal(
    await fs.readFile(path.join(directory, boundReportFilename(id)), "utf8"),
    serializeBoundIssueReport(report),
  );
  assert.deepEqual(await fs.readdir(directory), [boundReportFilename(id)]);
});

test("post-commit staging cleanup and logger failures cannot turn a saved report into failure", async (t) => {
  const directory = await queue(t),
    report = await record(),
    warnings: string[] = [];
  await persistLocalReport(report, {
    directory,
    io: {
      ...localReportStoreIO,
      removeStage: async () => {
        throw new Error("injected unlink");
      },
    },
    onCleanupError: (operation) => {
      warnings.push(operation);
      throw new Error("logger unavailable");
    },
  });
  assert.deepEqual(warnings, ["unlink"]);
  assert.equal(
    await fs.readFile(path.join(directory, boundReportFilename(id)), "utf8"),
    serializeBoundIssueReport(report),
  );
  assert.equal((await fs.readdir(directory)).length, 2);
  assert.deepEqual(await recognized(directory), [boundReportFilename(id)]);
});

test("staged-only recovery files stay private and do not consume review-list capacity", async (t) => {
  const directory = await queue(t),
    report = await record();
  const legacy = JSON.stringify({
    id: "abc",
    variantId: "car",
    factKey: "range",
    description: "A preserved historical report.",
    createdAt: now,
    status: "pending",
    sourceIds: ["source-a"],
    observedValue: 420,
  });
  await fs.writeFile(path.join(directory, "abc.json"), legacy);
  await fs.writeFile(
    path.join(directory, `.roadmark-stage-${stageId}.tmp`),
    "interrupted partial",
  );
  await persistLocalReport(report, { directory });
  const files = [
    ...(await fs.readdir(directory)).map((name) => ({ name, mtime: 1 })),
    ...Array.from({ length: 205 }, (_, i) => ({
      name: `.roadmark-stage-${i}.tmp`,
      mtime: 99,
    })),
  ];
  const result = await loadReportQueue({
    files,
    read: (name) => fs.readFile(path.join(directory, name), "utf8"),
    digest,
    labels: () => ({}),
  });
  assert.equal(result.totalRecognizedFiles, 2);
  assert.equal(result.loadedFiles, 2);
  assert.equal(result.unreadableFiles, 0);
  assert.deepEqual(result.reports.map((row) => row.bindingState).sort(), [
    "bound_snapshot",
    "legacy_unbound",
  ]);
  assert.equal(
    await fs.readFile(path.join(directory, "abc.json"), "utf8"),
    legacy,
  );
  assert.equal(
    await fs.readFile(
      path.join(directory, `.roadmark-stage-${stageId}.tmp`),
      "utf8",
    ),
    "interrupted partial",
  );
});

test("local intake waits for directory commit before returning its detached receipt", async (t) => {
  const directory = await queue(t),
    entered = gate(),
    resume = gate();
  const body = new TextEncoder().encode(JSON.stringify(await input()));
  const chunks = async function* () {
    yield body;
  };
  let settled = false;
  const pending = handleBoundReportIntake(
    {
      host: "127.0.0.1:3000",
      origin: "http://127.0.0.1:3000",
      contentType: REPORT_CONTENT_TYPE,
      chunks: chunks(),
    },
    {
      ...dependencies,
      port: 3000,
      persist: (report) =>
        persistLocalReport(report, {
          directory,
          io: {
            ...localReportStoreIO,
            syncDirectory: async (dir) => {
              entered.release();
              await resume.promise;
              await localReportStoreIO.syncDirectory(dir);
            },
          },
        }),
    },
  ).then((result) => {
    settled = true;
    return result;
  });
  await entered.promise;
  assert.equal(settled, false);
  assert.deepEqual(await recognized(directory), [boundReportFilename(id)]);
  resume.release();
  const response = await pending;
  assert.equal(response.status, 201);
  assert.equal(response.body.id, id);
});

test("post-publication storage errors retain the existing redacted unconfirmed-save response", async (t) => {
  const directory = await queue(t),
    body = new TextEncoder().encode(JSON.stringify(await input()));
  const response = await handleBoundReportIntake(
    {
      host: "127.0.0.1:3000",
      origin: "http://127.0.0.1:3000",
      contentType: REPORT_CONTENT_TYPE,
      chunks: (async function* () {
        yield body;
      })(),
    },
    {
      ...dependencies,
      port: 3000,
      persist: (report) =>
        persistLocalReport(report, {
          directory,
          io: {
            ...localReportStoreIO,
            syncDirectory: async () => {
              throw new Error("private filesystem path /secret/example");
            },
          },
        }),
    },
  );
  assert.equal(response.status, 500);
  assert.match(String(response.body.error), /Could not confirm/);
  assert.doesNotMatch(JSON.stringify(response), /secret|filesystem/);
  assert.deepEqual(await recognized(directory), [boundReportFilename(id)]);
});
