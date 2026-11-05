import test from "node:test";
import assert from "node:assert/strict";
import { catalogue } from "../src/lib/data";
import { formatFact, formatEvidenceValue } from "../src/lib/compare";
test("structured observations retain named fields and never show object coercion", () => {
  const cars = catalogue();
  const structured = cars
    .flatMap((c) => Object.values(c.facts))
    .filter((f) => f.value !== null && typeof f.value === "object");
  assert.ok(structured.length > 20);
  for (const f of structured)
    assert.ok(!formatFact(f).includes("[object Object]"), f.key);
  assert.equal(
    formatEvidenceValue({ front: 200, rear: 372 }),
    "front: 200; rear: 372",
  );
  assert.equal(formatEvidenceValue([2009, 2081]), "2,009 / 2,081");
  assert.match(
    formatEvidenceValue({ three_phase_required: true, cable_separate: true }),
    /three phase required: Yes; cable separate: Yes/,
  );
  assert.match(
    formatEvidenceValue([{ through_years: 3, minimum_net_capacity_pct: 80 }]),
    /through years: 3; minimum net capacity %: 80/,
  );
});
