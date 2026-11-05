/** Synthetic scaling check; not a real-device or network performance measurement. */
import { performance } from "node:perf_hooks";
import fs from "node:fs";
import { catalogue, research } from "../src/lib/data";
import { buildStrengthsIndex } from "../src/lib/discovery";
const base = catalogue(),
  sources = research().sources;
const results = [];
for (const size of [base.length, 250, 500, 1000]) {
  const cars = Array.from({ length: size }, (_, i) => ({
    ...base[i % base.length],
    id: `synthetic-${i}`,
  }));
  buildStrengthsIndex(cars, sources, { asOf: "2026-10-10", maxAgeDays: 30 });
  const samples = [];
  for (let n = 0; n < 10; n++) {
    const start = performance.now();
    buildStrengthsIndex(cars, sources, { asOf: "2026-10-10", maxAgeDays: 30 });
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  results.push({
    size,
    meanMs: samples.reduce((a, b) => a + b, 0) / samples.length,
    p95Ms: samples[Math.ceil(samples.length * 0.95) - 1],
  });
}
const result = {
  checkedAt: "2026-10-10",
  method:
    "Own VM,10 warm iterations; repeated synthetic trim records; CPU only, not mobile or network performance",
  results,
};
fs.writeFileSync(
  "qa/roadmark-scaling.json",
  JSON.stringify(result, null, 2) + "\n",
);
console.log(result);
