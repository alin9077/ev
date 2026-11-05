import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

test("source archives round-trip, preserve bytes, exclude generated files and enforce their size limit", () => {
  const result = spawnSync(
    "python3",
    ["-B", path.resolve("tests/package_source_test.py")],
    { encoding: "utf8", timeout: 60_000 },
  );
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
