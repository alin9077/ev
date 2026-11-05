import test from "node:test";
import assert from "node:assert/strict";
import {
  applyAvailabilityCorrections,
  availabilitySnapshot,
  type AvailabilityCorrection,
} from "../src/lib/availability-corrections";
import { buyerAvailabilityText } from "../src/lib/buyer-availability";
import { isCurrentListEligible, isOnSale } from "../scripts/reporting/reports";
import type { Car, Source } from "../src/lib/types";

const asOf = "2026-10-15";
const source: Source = {
  id: "qa-current-maker-preorder",
  url: "https://www.mazda.com.au/electric/battery-electric/",
  title: "Current Australian maker preorder evidence fixture",
  publisher: "Mazda Australia",
  source_type: "manufacturer_primary",
  published_date: null,
  accessed_date: asOf,
  market: "AU",
  supports: "Explicit preorder advertising, without accepted factory orders or physical stock.",
};
const original: Car = {
  id: "qa-cx6e-preorder",
  modelId: "qa-cx6e",
  family: "qa-cx6e",
  slug: "qa-cx6e-preorder",
  brand: "Mazda",
  model: "CX-6e",
  trim: "E35 GT",
  generation: "Australian named-grade fixture",
  year: null,
  vehicleClass: "passenger",
  availability: "current_or_order_listed",
  availabilityEvidence: {
    checkedAt: "2026-10-12",
    orderStatus: "preorder",
    stockStatus: "unverified",
    sourceIds: [source.id],
    physicalStockVerified: false,
    factoryOrderAcceptanceVerified: false,
    qualifications: ["Manufacturer preorder advertising; accepted order and stock unverified."],
  },
  drive: "RWD",
  facts: {},
  issues: [],
  configurationEvidence: {
    rankingEligible: false,
    completeVehicleCountEligible: false,
    projectionScope: "Named-grade fixture only",
  },
};
function edit(): AvailabilityCorrection {
  return {
    id: "qa-source-supported-preorder-refresh",
    variantId: original.id,
    before: availabilitySnapshot(original),
    after: {
      availability: "announced_provisional",
      evidence: {
        ...structuredClone(original.availabilityEvidence!),
        checkedAt: asOf,
        orderStatus: "preorder",
        qualifications: ["Current maker advertises preorder; enquiry is not factory acceptance."],
      },
    },
    status: "approved",
    reviewedBy: "Behavioral test fixture",
    reviewedAt: asOf,
    evidenceDate: asOf,
    reason: "Preserve source-supported preorder semantics without on-sale or stock promotion.",
  };
}
const apply = (change = edit(), sources: Source[] = [source], cars: Car[] = [original]) =>
  applyAvailabilityCorrections(cars, [change], sources);

test("a sourced announced preorder refresh preserves buyer meaning and C1 while leaving on-sale scope", () => {
  const before = structuredClone(original);
  const [car] = apply();
  assert.equal(car.availability, "announced_provisional");
  assert.equal(car.availabilityEvidence?.orderStatus, "preorder");
  assert.equal(buyerAvailabilityText(original), "Order open or arriving");
  assert.equal(buyerAvailabilityText(car), "Order open or arriving");
  assert.equal(isOnSale(original), true);
  assert.equal(isOnSale(car), false);
  assert.equal(isCurrentListEligible(car, [source], asOf), true);
  assert.equal(isCurrentListEligible(car, [], asOf), false);
  assert.equal(isCurrentListEligible(car, [source], "2026-12-01"), false);
  assert.equal(car.availabilityEvidence?.physicalStockVerified, false);
  assert.equal(car.availabilityEvidence?.factoryOrderAcceptanceVerified, false);
  assert.equal(car.year, null);
  assert.deepEqual(car.facts, original.facts);
  assert.deepEqual(car.configurationEvidence, original.configurationEvidence);
  assert.deepEqual(original, before);
});

test("preorder cannot bypass exact identity, before snapshot or usable-source guards", () => {
  assert.throws(() => apply({ ...edit(), variantId: "missing" }), /conflict/);
  assert.throws(() => apply(edit(), [source], [original, original]), /conflict/);
  const mismatch = edit();
  mismatch.before.availability = "not_current";
  assert.throws(() => apply(mismatch), /conflict/);
  const missing = edit();
  missing.after.evidence.sourceIds = [];
  assert.throws(() => apply(missing), /supporting sources/);
  assert.throws(() => apply(edit(), []), /supporting sources/);
  assert.throws(() => apply(edit(), [source, source]), /supporting sources/);
  const heldSources: Partial<Source>[] = [
    { accessed_date: "2026-07-01" },
    { accessed_date: "2026-10-16" },
    { url: "javascript:alert(1)" },
    { access_limitation: "blocked" },
    { conflict: "unresolved" },
    { publication_hold: true },
  ];
  for (const change of heldSources)
    assert.throws(() => apply(edit(), [{ ...source, ...change }]), /supporting sources/);
});

test("preorder retains approval, chronology, valid status and contradictory-eligibility checks", () => {
  const invalid: Partial<AvailabilityCorrection>[] = [
    { reviewedBy: "" },
    { reason: "" },
    { evidenceDate: "2026-02-30" },
    { evidenceDate: "2026-10-14" },
    { reviewedAt: "2026-10-14" },
    { supersedes: "missing-predecessor" },
  ];
  for (const change of invalid)
    assert.throws(() => apply({ ...edit(), ...change }), /provenance|chronology/);
  for (const status of ["pending", "rejected"] as const)
    assert.deepEqual(apply({ ...edit(), status }, []), [original]);
  const invalidStatus = edit();
  invalidStatus.after.evidence.orderStatus = "invented_preorder_status";
  assert.throws(() => apply(invalidStatus), /invalid status/);
  const contradiction = edit();
  contradiction.after.availability = "not_current";
  assert.throws(() => apply(contradiction), /contradictory eligibility/);
  const duplicate = edit();
  assert.throws(
    () => applyAvailabilityCorrections([original], [duplicate, duplicate], [source]),
    /duplicate/,
  );
});

test("previously supported order statuses keep their buyer and reporting meaning", () => {
  const cases = [
    ["listed_unconfirmed", false, "Not confirmed"],
    ["accepting_orders", true, "Order open or arriving"],
    ["accepting_orders_advertised", true, "Order open or arriving"],
    ["accepting_order_requests_advertised", false, "Not confirmed"],
    ["not_accepting_orders", false, "Not confirmed"],
    ["unverified", false, "Not confirmed"],
  ] as const;
  for (const [status, c1Eligible, buyerLabel] of cases) {
    const change = edit();
    change.after.evidence.orderStatus = status;
    const [car] = apply(change);
    assert.equal(car.availabilityEvidence?.orderStatus, status);
    assert.equal(buyerAvailabilityText(car), buyerLabel);
    assert.equal(isOnSale(car), false);
    assert.equal(isCurrentListEligible(car, [source], asOf), c1Eligible);
    assert.deepEqual(car.facts, original.facts);
    assert.deepEqual(car.configurationEvidence, original.configurationEvidence);
  }
});
