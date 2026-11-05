import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import status from "../src/lib/generated/brand-review-status.json";
import { catalogue } from "../src/lib/data";
import { brandCoverage, isDefaultListed } from "../src/lib/on-sale";

test("the generated brand review status matches the coverage report's research-complete brands", () => {
  const run = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/generate-brand-review-status.ts", "--check"],
    { encoding: "utf8" },
  );
  assert.equal(run.status, 0, run.stderr);
});

test("footer coverage counts every listed brand exactly once as fully or partly reviewed", () => {
  const cars = catalogue();
  const brands = new Set(cars.filter(isDefaultListed).map((c) => c.brand));
  const { fullyReviewed, partly } = brandCoverage(cars, status);
  assert.equal(fullyReviewed + partly, brands.size);
  assert.ok(fullyReviewed > 0 && partly > 0);
  for (const brand of status.fullyReviewed) assert.ok(brands.has(brand), brand);
});
