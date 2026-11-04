import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { checkpoint102Fixture, checkpoint102FixtureSHA256, sourceBeforeCheckpoint102 } from "./checkpoint102-market-history";
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const marketHelperSHA256 = "e4685f141e8efbe0649c82595249a5d60c1112a3239c5ea3b84b26a3321e2c59";
const fixtureFile = "tests/fixtures/checkpoint102-trikes.json";
const marketHelperFile = "tests/helpers/checkpoint102-market-history.ts";
const sourceHelperFile = "tests/helpers/checkpoint102-source-history.ts";

/**
 * Verify the complete102 changed-file state before exposing any101 predecessor.
 * Bootstrap self-reference is explicit: root must check the external candidate seal
 * before execution. The sealed source helper's own disk bytes are the trust root;
 * no embedded hash pretends to authenticate itself.
 */
export function createCheckpoint102SourceReader(readCurrent: (file: string) => Buffer) {
  const fixture = checkpoint102Fixture();
  const previous = new Map<string, Buffer>();
  const noPredecessor = new Set(fixture.introduced.map(entry => entry.file));
  const sourceHelperBytes = readFileSync(new URL("./checkpoint102-source-history.ts", import.meta.url));
  assert.equal(sha(readFileSync(new URL("./checkpoint102-market-history.ts", import.meta.url))), marketHelperSHA256, "Unapproved checkpoint102 market helper on disk");
  for (const entry of [...fixture.changes, ...fixture.introduced]) {
    const bytes = readCurrent(entry.file);
    if (entry.file === fixtureFile) assert.equal(sha(bytes), checkpoint102FixtureSHA256, "Unapproved checkpoint102 fixture source");
    else if (entry.file === marketHelperFile) assert.equal(sha(bytes), marketHelperSHA256, "Unapproved checkpoint102 market helper source");
    else if (entry.file === sourceHelperFile) assert.deepEqual(bytes, sourceHelperBytes, "Unapproved checkpoint102 source helper; requires external reviewed seal");
    else {
      assert.equal(bytes.length, entry.approvedBytes, `Unapproved checkpoint102 source length: ${entry.file}`);
      assert.equal(sha(bytes), entry.approvedSHA256, `Unapproved checkpoint102 source: ${entry.file}`);
    }
    if (entry.file === fixture.market.file) previous.set(entry.file, sourceBeforeCheckpoint102(entry.file, bytes));
  }
  for (const entry of fixture.changes) {
    const bytes = entry.file === fixture.market.file ? previous.get(entry.file)! : Buffer.from(entry.previousText!);
    assert.equal(bytes.length, entry.previousBytes, `Checkpoint101 predecessor length: ${entry.file}`);
    assert.equal(sha(bytes), entry.previousSHA256, `Checkpoint101 predecessor bytes: ${entry.file}`);
    previous.set(entry.file, bytes);
  }
  return (file: string): Buffer => {
    assert.ok(/^[a-zA-Z0-9_./\[\]-]+$/.test(file) && !file.startsWith("/") && file.split("/").every(part => part !== "" && part !== "." && part !== ".."), "Unsafe checkpoint101 path");
    assert.ok(!noPredecessor.has(file), `No checkpoint101 predecessor: ${file}`);
    return Buffer.from(previous.get(file) ?? readCurrent(file));
  };
}
