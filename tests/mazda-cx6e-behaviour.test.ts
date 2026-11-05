// Admission behaviour is checked against the immutable source layer.
// Dated M1 overlays have separate current-catalogue safety coverage.
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  sourceCatalogue as catalogue,
  sourceResearch as research,
  sourceEffectiveFeatures as effectiveFeatures,
} from "../src/lib/data";
import { sourceSnapshotPack as pack } from "./helpers/source-fixture";
import { buyerProposal } from "../src/lib/buyer-proposal";
import {
  buildBuyerSummaries,
  currentBuyerSummary,
} from "../src/lib/selling-points";
import {
  attributes,
  rankAttribute,
  exclusionReason,
  discoveryCars,
} from "../src/lib/discovery";
import { hasCarAvatarShape } from "../src/lib/car-avatar-shapes";
import {
  storePortablePacks,
  hydratePortablePacks,
} from "../src/lib/portable-packs";
import { makeReport } from "../src/lib/citable";
import Detail from "../src/components/detail";
import { BuyerSummary } from "../src/components/buyer-summary";
import market from "../data/market-inventory-2026-10-10.json";
import sidecar from "../data/mazda-cx6e-technical-evidence-2026-10-12.json";
import fixture from "./fixtures/mazda-cx6e-evidence.json";
import type { Car, Source } from "../src/lib/types";
const cars = catalogue(),
  data = research(),
  ids = fixture.ids;
const mazda = cars.filter((c) => ids.includes(c.id));
const policy = { asOf: "2026-10-12", maxAgeDays: 180 };
const proposal = {
  ...buyerProposal,
  records: buyerProposal.records.filter((record) =>
    ids.includes(record.variantId),
  ),
  dependencies: buyerProposal.dependencies.filter((dependency) =>
    ids.includes(dependency.variantId),
  ),
};
const build = (cc = mazda, ss = data.sources, asOf = policy.asOf) =>
  buildBuyerSummaries(
    cc,
    cc.flatMap((c) => effectiveFeatures(c, data)),
    ss,
    proposal,
    { ...policy, asOf },
  );

test("full exact-grade facts preserve unknowns and precise charging, mirrors, cargo and device qualifications", () => {
  for (const car of mazda) {
    assert.equal(car.year, null);
    assert.equal(car.configurationEvidence?.rankingEligible, false);
    assert.equal(
      car.configurationEvidence?.completeVehicleCountEligible,
      false,
    );
    for (const key of [
      "seats",
      "battery_gross_kwh",
      "battery_usable_kwh",
      "boot_l",
      "climate_zones",
      "central_screen_inches",
      "manufacturer_model_year",
      "factory_production",
      "factory_order_acceptance",
      "actual_delivery_date",
      "physical_stock",
      "independent_comfort",
      "price_aud",
    ])
      assert.equal(car.facts[key].value, null, key);
    assert.equal(car.facts.battery_kwh.value, 78);
    assert.match(car.facts.battery_kwh.basis, /gross\/usable basis undefined/);
    assert.equal(car.facts.ac_kw.label, "On-board charger maximum capacity");
    assert.equal(car.facts.ac_kw.value, 11);
    assert.equal(car.facts.dc_charge_time_min.value, 24);
    assert.equal(car.facts.dc_30_to_80_min.value, 15);
    assert.match(car.facts.dc_charge_time_min.basis, /10–80/);
    assert.match(car.facts.dc_30_to_80_min.basis, /30–80/);
    assert.match(
      car.facts.equipment_phone_integration.qualifications.join(" "),
      /Not every device or feature/,
    );
    assert.equal(car.facts.source_brochure_boot_l.value, 363);
    assert.equal(car.facts.source_model_page_boot_l.value, 468);
    assert.match(
      car.facts.max_total_cargo_l.basis,
      /VDA; second row folded; to ceiling; includes underfloor/,
    );
    assert.match(
      car.facts.towing_braked_kg.qualifications.join(" "),
      /Genuine Towing Kit.*State\/Territory/,
    );
    assert.equal(car.facts.towball_max_kg.value, 75);
    assert.ok(Object.values(car.facts).every((f) => f.comparisonBasis === ""));
    assert.ok(
      Object.values(car.facts).every(
        (f) => f.status === "conditional" || f.status === "not_verified",
      ),
    );
    for (const fact of Object.values(car.facts))
      for (const sourceId of fact.sourceIds)
        assert.ok(
          data.sources.some((source) => source.id === sourceId),
          sourceId,
        );
  }
  assert.equal(
    mazda[0].facts.equipment_exterior_mirrors.value,
    "Standard exterior mirrors",
  );
  assert.equal(
    mazda[0].facts.equipment_interior_mirror.value,
    "Standard interior mirror",
  );
  assert.equal(
    mazda[1].facts.equipment_exterior_mirrors.value,
    "Digital exterior mirrors",
  );
  assert.equal(
    mazda[1].facts.equipment_interior_mirror.value,
    "Digital interior mirror",
  );
});

test("stock evidence stays separate, GR stays seller series, and no PDF byte hash or supersession is invented", () => {
  assert.equal(sidecar.specificNewAdvertisement.sellerBadge, "E35 Azami");
  assert.equal(sidecar.specificNewAdvertisement.sellerSeries, "GR");
  assert.equal(
    sidecar.specificNewAdvertisement.fullListingDesignation,
    "E35 Azami GR",
  );
  assert.equal(
    sidecar.specificNewAdvertisement.sellerPublishedModelCode,
    "C6EAAW5E35AWB",
  );
  assert.equal(sidecar.specificNewAdvertisement.physicalStockVerified, false);
  assert.equal(
    sidecar.specificNewAdvertisement.independentUnsoldVerified,
    false,
  );
  assert.equal(
    sidecar.specificNewAdvertisement.buildMatchesBrochureVerified,
    false,
  );
  assert.equal(sidecar.pdfVerification.rawPublisherBytesSHA256, null);
  assert.equal(sidecar.pdfVerification.rawPdfBytesRetained, false);
  assert.equal(sidecar.formalManufacturerModelYear, null);
  for (const conflict of sidecar.heldConflicts)
    assert.equal(conflict.normalizedValue, null);
  for (const id of ["CX6E95-CLIMATE", "CX6E95-SCREEN"])
    assert.match(
      sidecar.heldConflicts.find((c) => c.id === id)!.action,
      /No formal correction or supersession is established/,
    );
  for (const car of mazda) {
    assert.equal(car.availabilityEvidence!.orderStatus, "preorder");
    assert.equal(car.availabilityEvidence!.physicalStockVerified, false);
    assert.equal(
      car.availabilityEvidence!.factoryOrderAcceptanceVerified,
      false,
    );
    assert.doesNotMatch(
      car.buyerSummary!.strength!.text,
      /stock|in_stock|dealer|delivery|market.leading/i,
    );
  }
});

test("both bounded Mazda grades stay excluded without changing other ranking results", () => {
  const otherCars = cars.filter((car) => !ids.includes(car.id));
  for (const attribute of attributes) {
    const current = rankAttribute(cars, data.sources, attribute.key, policy);
    const before = rankAttribute(
      otherCars,
      data.sources,
      attribute.key,
      policy,
    );
    assert.deepEqual(
      {
        ...current,
        excluded: current.excluded.filter((e) => !ids.includes(e.carId)),
        unranked: current.unranked.filter(
          (entry) => !ids.includes(entry.car.id),
        ),
      },
      before,
    );
    for (const car of mazda) {
      assert.ok(current.excluded.some((e) => e.carId === car.id));
      const changed = structuredClone(car);
      changed.facts[attribute.key] = {
        ...changed.facts[attribute.key],
        value: 9999,
        status: "standard",
        comparisonBasis: "Artificial matching basis",
        issues: [],
      };
      assert.ok(
        exclusionReason(
          changed,
          changed.facts[attribute.key],
          data.sources,
          policy,
        ),
      );
    }
  }
});

test("both summaries match authored copy and reject own, related, applicability or source drift", () => {
  const built = build();
  for (const car of mazda)
    assert.deepEqual(built.get(car.id), car.buyerSummary);
  assert.match(
    mazda[0].buyerSummary!.strength!.text,
    /484.*468.*19-inch.*standard exterior and interior mirrors/,
  );
  assert.match(
    mazda[1].buyerSummary!.strength!.text,
    /21-inch.*digital exterior and interior mirrors/,
  );
  assert.match(mazda[1].buyerSummary!.tradeoff!.text, /468.*19.4.*484.*18.9/);
  for (const targetId of ids)
    for (const mutate of [
      (c: Car) => {
        c.year = 2026;
      },
      (c: Car) => {
        c.facts.range_km.value = 500;
      },
      (c: Car) => {
        c.facts.equipment_exterior_mirrors.value = "Invented";
      },
      (c: Car) => {
        c.facts.equipment_phone_integration.qualifications = [];
      },
      (c: Car) => {
        c.configurationEvidence!.rankingEligible = true;
      },
      (c: Car) => {
        c.availabilityEvidence!.physicalStockVerified = true;
      },
    ]) {
      const changed = structuredClone(mazda);
      mutate(changed.find((c) => c.id === targetId)!);
      const result = build(changed);
      for (const id of ids) assert.equal(result.get(id), undefined);
    }
  for (const source of fixture.sources as Source[]) {
    const changed = data.sources.map((s) =>
      s.id === source.id ? { ...s, supports: s.supports + " changed" } : s,
    );
    const result = build(mazda, changed);
    for (const car of mazda) {
      assert.equal(result.get(car.id), undefined);
      assert.equal(
        currentBuyerSummary(car.buyerSummary, changed, policy),
        undefined,
      );
    }
  }
});

test("summary freshness is inclusive on day180 and fails closed on day181 or before evidence", () => {
  for (const asOf of ["2026-10-12", "2027-04-10"])
    for (const car of mazda) {
      assert.ok(build(mazda, data.sources, asOf).get(car.id)?.strength);
      assert.ok(
        currentBuyerSummary(car.buyerSummary, data.sources, { ...policy, asOf })
          ?.strength,
      );
    }
  for (const asOf of ["2027-04-11", "2026-10-11", "invalid"])
    for (const car of mazda) {
      assert.equal(build(mazda, data.sources, asOf).get(car.id), undefined);
      assert.equal(
        currentBuyerSummary(car.buyerSummary, data.sources, {
          ...policy,
          asOf,
        }),
        undefined,
      );
    }
});

test("existing detail, report, discovery projection and portable packs carry all scope boundaries", () => {
  const full = Object.fromEntries(
    mazda.map((car) => [car.id, pack(car.id, { cars, data })]),
  );
  const hydrated = hydratePortablePacks(
    JSON.parse(JSON.stringify(storePortablePacks(full))),
    JSON.parse(JSON.stringify(data.sources)),
  );
  assert.deepEqual(hydrated, JSON.parse(JSON.stringify(full)));
  for (const car of mazda) {
    const p = full[car.id];
    const html = renderToStaticMarkup(
      createElement(Detail, { pack: p, criteria: data.criteria }),
    );
    assert.ok(html.includes("MY unverified"));
    assert.ok(html.includes("On-board charger maximum capacity"));
    assert.ok(html.includes("Exterior mirrors"));
    assert.ok(html.includes("Interior mirror"));
    assert.ok(!html.includes("[object Object]"));
    assert.equal(
      renderToStaticMarkup(
        createElement(BuyerSummary, { car, sources: data.sources }),
      ),
      "",
      "Existing pre-clock suppression remains",
    );
    assert.equal(
      discoveryCars([car])[0].configurationEvidence!.rankingEligible,
      false,
    );
    const report = JSON.stringify(makeReport([p], "/cars/mazda-test"));
    assert.match(report, /August 2026/);
    assert.match(report, /manufacturer model year/i);
    assert.match(report, /Not every device or feature/);
  }
});

test("Mazda market entry retains exact grade names and unverified stock boundaries", () => {
  const row = market.records.find((r) => r.id === "mazda-cx-6e")!;
  assert.equal(row.modelYear, null);
  assert.equal(row.physicalStockVerified, false);
  assert.equal(row.factoryOrderAcceptanceVerified, false);
  assert.equal(row.rankingEligible, false);
  assert.equal(row.completeVehicleCountEligible, false);
  assert.deepEqual(row.trims, ["E35 GT", "E35 Azami"]);
});

test("Mazda discovery projection retains ranking facts and uses the generic avatar without manufacturing dimensions", () => {
  assert.ok(mazda.every((car) => !hasCarAvatarShape(car.modelId)));
  const projected = discoveryCars(cars);
  assert.equal(projected.length, cars.length);
  for (const id of ids) {
    const car = projected.find((car) => car.id === id)!;
    assert.equal(Object.hasOwn(car.facts, "height_mm"), false);
    assert.equal(Object.hasOwn(car.facts, "wheelbase_mm"), false);
    for (const attribute of attributes)
      assert.equal(
        car.facts[attribute.key],
        cars.find((car) => car.id === id)!.facts[attribute.key],
      );
  }
});
