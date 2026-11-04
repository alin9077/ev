import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  loadReportQueue,
  isReportListEnvelope,
  MAX_REPORT_FILE_BYTES,
} from "../src/lib/report-queue-reader";
import { REPORT_LIST_PROTOCOL } from "../src/lib/report-queue-projection";
const digest = async (s: string) =>
  createHash("sha256").update(s).digest("hex");
const legacy = {
  id: "abc",
  variantId: "car",
  factKey: "range",
  description: "Please review this claim.",
  createdAt: "2026-10-11T00:00:00.000Z",
  status: "pending",
  sourceIds: ["source"],
  observedValue: 420,
};
const dependencies = {
  files: [] as { name: string; mtime: number }[],
  read: async () => JSON.stringify(legacy),
  labels: () => ({ vehicleLabel: "Car", claimLabel: "Range" }),
  digest,
};
test("empty queue is a valid explicit v2 response", async () => {
  const r = await loadReportQueue(dependencies);
  assert.equal(isReportListEnvelope(r), true);
  assert.equal(r.listProtocol, REPORT_LIST_PROTOCOL);
  assert.equal(r.totalRecognizedFiles, 0);
});
test("queue reads only the newest 200 recognized files and reports exact counts", async () => {
  const names = Array.from({ length: 205 }, (_, i) => ({
    name: i.toString(16) + ".json",
    mtime: i,
  }));
  const seen: string[] = [];
  const r = await loadReportQueue({
    ...dependencies,
    files: [...names, { name: "private.txt", mtime: 999 }],
    read: async (n) => {
      seen.push(n);
      return JSON.stringify({ ...legacy, id: n });
    },
  });
  assert.equal(r.totalRecognizedFiles, 205);
  assert.equal(r.loadedFiles, 200);
  assert.equal(r.reports.length, 200);
  assert.equal(seen.length, 200);
  assert.ok(!seen.includes("0.json"));
  assert.equal(isReportListEnvelope(r), true);
});
test("malformed, unreadable and oversized recent files stay untouched and are counted separately", async () => {
  const r = await loadReportQueue({
    ...dependencies,
    files: [
      { name: "a.json", mtime: 1 },
      { name: "b.json", mtime: 2 },
      { name: "c.json", mtime: 3 },
      { name: "d.json", mtime: 4 },
    ],
    read: async (n) => {
      if (n === "a.json") throw new Error("private path");
      if (n === "b.json") return "{";
      if (n === "c.json") return "x".repeat(MAX_REPORT_FILE_BYTES + 1);
      return JSON.stringify(legacy);
    },
  });
  assert.equal(r.loadedFiles, 4);
  assert.equal(r.unreadableFiles, 3);
  assert.equal(r.reports.length, 1);
  assert.equal(isReportListEnvelope(r), true);
  assert.ok(!JSON.stringify(r).includes("private path"));
});
test("client rejects legacy response and malformed v2 display shapes/counts", async () => {
  const valid = await loadReportQueue({
    ...dependencies,
    files: [{ name: "a.json", mtime: 1 }],
  });
  assert.equal(
    isReportListEnvelope({ mode: "local", reports: [], total: 0 }),
    false,
  );
  for (const patch of [
    { loadedFiles: 999 },
    { unreadableFiles: 2 },
    { totalRecognizedFiles: -1 },
    { listProtocol: "old" },
    { reports: [{ ...valid.reports[0], sourceIds: [3] }] },
    { reports: [{ ...valid.reports[0], observedValuePreview: undefined }] },
  ])
    assert.equal(isReportListEnvelope({ ...valid, ...patch }), false);
});
test("duplicate legacy report IDs retain separate exact file identities", async () => {
  const r = await loadReportQueue({
    ...dependencies,
    files: [
      { name: "a.json", mtime: 1 },
      { name: "b.json", mtime: 2 },
    ],
  });
  assert.deepEqual(
    r.reports.map((v) => v.id),
    ["abc", "abc"],
  );
  assert.equal(new Set(r.reports.map((v) => v.queueFile)).size, 2);
  assert.equal(isReportListEnvelope(r), true);
});
test("client validates omission counts, snapshot metadata and unique per-file row keys", async () => {
  const valid = await loadReportQueue({
    ...dependencies,
    files: [{ name: "a.json", mtime: 1 }],
  });
  for (const patch of [
    { inaccessibleNames: -1 },
    { inaccessibleNames: undefined },
    { reports: [{ ...valid.reports[0], bindingState: "bound_snapshot" }] },
    {
      reports: [{ ...valid.reports[0], labelProvenance: "recorded_snapshot" }],
    },
  ])
    assert.equal(isReportListEnvelope({ ...valid, ...patch }), false);
  assert.equal(
    isReportListEnvelope({
      ...valid,
      reports: [valid.reports[0], valid.reports[0]],
      loadedFiles: 2,
      totalRecognizedFiles: 2,
    }),
    false,
  );
});
