import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import fixture from "../fixtures/checkpoint101-source.json";

const sha = (value: Uint8Array) => createHash("sha256").update(value).digest("hex");
const noPredecessor = new Set([
  ...fixture.introduced.map((entry) => entry.file),
  "tests/market-view.test.ts",
  "tests/helpers/checkpoint101-source-history.ts",
  "tests/fixtures/checkpoint101-source.json",
]);

/** Verify the entire reviewed runtime delta before exposing exact source100 bytes. */
export function createCheckpoint101SourceReader(readCurrent: (file: string) => Buffer) {
  assert.equal(sha(readFileSync(new URL("../fixtures/checkpoint101-source.json", import.meta.url))), "0a00252acf24358b9fa8551b08f90d04744487b45b14c194ac861485b7dabddb", "Unapproved checkpoint101 fixture");
  const previous = new Map<string, Buffer>();
  for (const entry of [...fixture.changes, ...fixture.introduced]) {
    assert.equal(sha(readCurrent(entry.file)), entry.approvedSHA256, `Unapproved checkpoint101 source: ${entry.file}`);
  }
  for (const entry of fixture.changes) {
    const bytes = Buffer.from(entry.previousText);
    assert.equal(bytes.length, entry.previousBytes, entry.file);
    assert.equal(sha(bytes), entry.previousSHA256, entry.file);
    previous.set(entry.file, bytes);
  }
  return (file: string): Buffer => {
    assert.ok(/^[a-zA-Z0-9_./\[\]-]+$/.test(file) && !file.startsWith("/") && file.split("/").every((part) => part !== "" && part !== "." && part !== ".."), "Unsafe checkpoint100 path");
    assert.ok(!noPredecessor.has(file), `No checkpoint100 predecessor: ${file}`);
    return Buffer.from(previous.get(file) ?? readCurrent(file));
  };
}
