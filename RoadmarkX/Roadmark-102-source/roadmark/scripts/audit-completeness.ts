// Lists every homepage cell that still has no value or an unverified status.
import { catalogue, pack } from "../src/lib/data";
let open = 0;
let held = 0;
for (const car of catalogue()) {
  for (const f of Object.values(car.facts))
    if (f.value === null || f.status === "not_verified") {
      if (f.qualifications.some((q) => /withheld/.test(q))) held++;
      else {
        open++;
        console.log("FACT", car.id, f.key);
      }
    }
  for (const f of pack(car.id).features)
    if (
      f.status === "not_verified" ||
      /needs confirmation|not stated|: null/i.test(f.value) ||
      !f.value ||
      f.confirmation_needed
    ) {
      if (f.verification_state === "full_text_audit_2026-10-08") held++;
      else {
        open++;
        console.log("FEATURE", car.id, f.criterion, "|", f.value);
      }
    }
}
console.log(
  `${open} unexplained open cells; ${held} explicit source-audit holds`,
);
process.exitCode = open ? 1 : 0;
