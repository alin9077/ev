import test from "node:test";
import assert from "node:assert/strict";
import { australianEvidenceDate } from "../src/lib/evidence-date";
import { offerExpired } from "../src/lib/fact-validity";
test("Australian dated offers use Sydney midnight rather than a later UTC cutoff", () => {
  assert.equal(
    australianEvidenceDate(new Date("2026-10-31T12:59:59Z")),
    "2026-10-31",
  );
  assert.equal(
    australianEvidenceDate(new Date("2026-10-31T13:00:00Z")),
    "2026-11-01",
  );
  assert.equal(
    offerExpired(
      { validUntil: "2026-10-31" },
      australianEvidenceDate(new Date("2026-10-31T13:00:00Z")),
    ),
    true,
  );
  assert.equal(
    australianEvidenceDate(new Date("2026-06-30T14:00:00Z")),
    "2026-07-01",
  );
  assert.equal(australianEvidenceDate(new Date("invalid")), "");
});
test("explicit malformed deadlines fail closed while omitted deadlines stay untimed", () => {
  assert.equal(offerExpired({}, "2026-10-10"), false);
  for (const value of ["", null, false, 0, 42, "2026-02-30", "2026-13-01"]) {
    assert.equal(
      offerExpired(
        { validUntil: value } as { validUntil: string },
        "2026-10-10",
      ),
      true,
      String(value),
    );
  }
});
