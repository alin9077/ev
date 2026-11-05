import guards from "../data/price-ladder-guards-2026-10-13.json";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  applyPriceLadder,
  priceCandidateRejection,
  priceCandidates,
  selectPriceCandidate,
  type PriceCandidate,
} from "../src/lib/price-ladder";
import { catalogueAdditions } from "../src/lib/catalogue-additions";
import type { Car, Fact, Source } from "../src/lib/types";

const source: Source = {
  id: "maker",
  url: "https://example.com/au/prices",
  title: "AU price list",
  publisher: "Maker Australia",
  source_type: "manufacturer",
  published_date: null,
  accessed_date: "2026-10-10",
  market: "AU",
  supports: "Named version price",
};
function candidate(patch: Partial<PriceCandidate> = {}): PriceCandidate {
  return {
    variantId: "a",
    value: 45000,
    sourceIds: ["maker"],
    sourceKey: "published_price",
    sourcePointer: "data/evidence.json#/named-version/price",
    date: "2026-10-10",
    rung: 1,
    basisTag: "Maker’s list price · before on-road costs",
    comparisonBasis: "Before on-road costs",
    qualifications: [],
    ...patch,
  };
}
function car(id = "a"): Car {
  return {
    id,
    modelId: "example_model",
    family: "Example Model",
    slug: id,
    generation: "current",
    year: null,
    availability: "current_or_order_listed",
    drive: "RWD",
    issues: [],
    brand: "Example",
    model: "Model",
    trim: "Version",
    vehicleClass: "passenger",
    facts: {
      price_aud: {
        key: "price_aud",
        label: "Price",
        value: null,
        unit: "AUD",
        basis: "Unknown",
        comparisonBasis: "",
        status: "not_verified",
        sourceIds: [],
        date: "2026-10-10",
        market: "AU",
        scope: "Exact version",
        qualifications: [],
        issues: [],
      } as Fact,
      ...structuredClone(
        (guards as unknown as { facts: Record<string, Record<string, Fact>> })
          .facts[id] ?? {},
      ),
    },
  };
}

test("chooses the highest rung, not the cheapest published number", () => {
  const list = candidate({ value: 55000 });
  const offer = candidate({
    rung: 2,
    value: 45000,
    basisTag: "Maker's national driveaway",
    comparisonBasis: "Driveaway",
  });
  const from = candidate({ rung: 3, value: 40000 });
  const dealer = candidate({
    rung: 6,
    value: 39000,
    basisTag: "Dealer ad · driveaway",
    comparisonBasis: "Driveaway",
  });
  assert.equal(
    selectPriceCandidate([dealer, offer, from, list], "a", [source])?.value,
    55000,
  );
});

test("never borrows a sibling's price, applies a future offer or uses an expired offer", () => {
  const rows = [
    candidate({ variantId: "sibling" }),
    candidate({ validFrom: "2026-10-14" }),
    candidate({ validUntil: "2026-10-12" }),
    candidate({ validUntil: "2026-02-30" }),
  ];
  assert.equal(selectPriceCandidate(rows, "a", [source]), undefined);
  assert.equal(
    selectPriceCandidate([candidate({ validUntil: "2026-10-13" })], "a", [
      source,
    ])?.value,
    45000,
  );
});

test("state prices require the exact state and do not become national quotes", () => {
  assert.match(
    priceCandidateRejection(
      candidate({ rung: 4 }),
      "a",
      [source],
      "2026-10-13",
    ) ?? "",
    /exact state/,
  );
  const wa = candidate({
    rung: 4,
    state: "WA",
    value: 40000,
    basisTag: "Maker's WA driveaway",
    comparisonBasis: "Driveaway",
  });
  const nsw = candidate({
    rung: 4,
    state: "NSW",
    value: 44000,
    basisTag: "Maker's NSW driveaway",
    comparisonBasis: "Driveaway",
  });
  assert.equal(selectPriceCandidate([wa, nsw], "a", [source])?.state, "NSW");
  assert.equal(selectPriceCandidate([wa, nsw], "a", [source])?.value, 44000);
});

test("unknown on-road treatment remains useful but does not invent a ranking group", () => {
  const c = candidate({ rung: 3, comparisonBasis: "", rankingEligible: false });
  assert.equal(selectPriceCandidate([c], "a", [source])?.comparisonBasis, "");
  assert.equal(
    priceCandidateRejection(
      candidate({ sourceIds: [] }),
      "a",
      [source],
      "2026-10-13",
    ),
    "No supporting source",
  );
});

test("flexible price rungs reject an opposite comparison basis in either retained provenance field", () => {
  for (const rung of [3, 5, 6] as const) {
    for (const field of ["basisTag", "originalBasis"] as const) {
      for (const [retained, comparisonBasis] of [
        ["Published driveaway price", "Before on-road costs"],
        ["Published price before on-road costs", "Driveaway"],
        ["Published price excluding on-road costs", "Driveaway"],
        ["Published price excludes on-road costs", "Driveaway"],
        ["Dealer Drive Away", "Before on-road costs"],
        ["Maker drive-away price", "Before on-road costs"],
        ["drive_away", "Before on-road costs"],
      ] as const) {
        const row = candidate({
          rung,
          basisTag: "Named version price",
          originalBasis: "Named version price",
          [field]: retained,
          comparisonBasis,
        });
        const before = structuredClone(row);
        assert.match(
          priceCandidateRejection(row, "a", [source], "2026-10-13") ?? "",
          /comparison basis contradicts retained price provenance/,
          `${rung}/${field}/${retained}`,
        );
        assert.equal(selectPriceCandidate([row], "a", [source]), undefined);
        assert.deepEqual(row, before);
      }
    }
  }
});

test("price provenance consistency never guesses from ambiguous wording or unrelated prose", () => {
  const ambiguous = [
    "Before on-road costs or driveaway",
    "Not a driveaway quote",
    "Driveaway basis not established",
    "Driveaway basis unconfirmed",
    "On-road costs are not included",
    "Excludes options, not on-road costs",
    "No formal ex-on-road or final driveaway total inferred",
    "Driveaway?",
    "RRP / MLP / MSRP / MRDP / D/A / +ORC",
    "Prix hors frais de mise en circulation",
  ];
  for (const retained of ambiguous) {
    for (const comparisonBasis of [
      "Before on-road costs",
      "Driveaway",
      "",
    ] as const) {
      const row = candidate({
        rung: 3,
        basisTag: retained,
        originalBasis: retained,
        comparisonBasis,
      });
      assert.equal(
        priceCandidateRejection(row, "a", [source], "2026-10-13"),
        null,
        retained,
      );
    }
  }
  const row = candidate({
    rung: 3,
    comparisonBasis: "Before on-road costs",
    qualifications: ["An unrelated driveaway offer was also seen."],
    conditionExplanation:
      "The separately priced driveaway offer has conditions.",
  });
  assert.equal(
    priceCandidateRejection(
      row,
      "a",
      [{ ...source, supports: "Separate driveaway offer" }],
      "2026-10-13",
    ),
    null,
  );
  const ungrouped = candidate({
    rung: 3,
    comparisonBasis: "",
    originalBasis:
      "Maker selected-configuration MLP including GST, excluding separately itemised LCT/on-road costs",
    rankingEligible: false,
  });
  assert.deepEqual(selectPriceCandidate([ungrouped], "a", [source]), ungrouped);
});

test("explicit retained price bases remain usable across maker, configurator, state, reported and dealer prices", () => {
  for (const rung of [1, 2, 3, 4, 5, 6] as const) {
    const bases =
      rung === 1
        ? (["Before on-road costs"] as const)
        : rung === 2 || rung === 4
          ? (["Driveaway"] as const)
          : (["Before on-road costs", "Driveaway"] as const);
    for (const comparisonBasis of bases) {
      const row = candidate({
        rung,
        basisTag: `Named version price · ${comparisonBasis}`,
        originalBasis: comparisonBasis,
        comparisonBasis,
        ...(rung === 4 ? { state: "NSW" } : {}),
        ...(rung >= 5 ? { rankingEligible: false } : {}),
      });
      assert.equal(
        priceCandidateRejection(row, "a", [source], "2026-10-13"),
        null,
      );
      assert.deepEqual(selectPriceCandidate([row], "a", [source]), row);
    }
  }
});

test("every extracted price has an exact original source pointer and unchanged published amount", () => {
  const known = new Set(catalogueAdditions.variants.map((v) => v.id));
  const sources = catalogueAdditions.sources;
  const files = new Map<string, unknown>();
  for (const row of priceCandidates) {
    assert.ok(known.has(row.variantId), row.variantId);
    assert.equal(
      priceCandidateRejection(row, row.variantId, sources, "2026-10-13"),
      null,
      row.variantId,
    );
    const [filename, pointer] = row.sourcePointer.split("#");
    if (!files.has(filename))
      files.set(
        filename,
        JSON.parse(fs.readFileSync(path.join(process.cwd(), filename), "utf8")),
      );
    let value: unknown = files.get(filename);
    for (const part of pointer.split("/").filter(Boolean))
      value = (value as Record<string, unknown>)[
        part.replaceAll("~1", "/").replaceAll("~0", "~")
      ];
    // Existing facts point to their whole immutable row; packet extraction can
    // point directly to the numerical value or its original field object.
    if (value && typeof value === "object") {
      const object = value as {
        value?: unknown;
        amountAud?: number;
        amount?: number;
      };
      value = object.value ?? object.amountAud ?? object.amount;
      if (value && typeof value === "object")
        value =
          (value as { amountAud?: number; amount?: number }).amountAud ??
          (value as { amount?: number }).amount;
    }
    assert.equal(value, row.value, `${row.variantId}: ${row.sourcePointer}`);
  }
});

test("applies exact-version configurator price without changing the original fact", () => {
  const id = "smart_1_pro_plus_current_au__20261010";
  const c = car(id);
  const original = JSON.stringify(c);
  const result = applyPriceLadder(c, catalogueAdditions.sources);
  const observed = catalogueAdditions.facts.find(
    (f) => f.variantId === id && f.key === "price_from_aud_excluding_on_roads",
  )!;
  assert.equal(result.facts.price_aud.value, observed.value);
  assert.equal(result.facts.price_aud.comparisonBasis, "Before on-road costs");
  assert.equal(result.facts.price_aud.priceEvidence?.rung, 3);
  assert.equal(result.facts.price_aud.date, observed.date);
  assert.equal(JSON.stringify(c), original);
});

test("prefers the ATTO 1 Essential national offer but never applies it to Premium", () => {
  const essential = applyPriceLadder(
    car("byd_atto_1__essential_fwd__20261010"),
    catalogueAdditions.sources,
  );
  const premium = applyPriceLadder(
    car("byd_atto_1__premium_fwd__20261010"),
    catalogueAdditions.sources,
  );
  assert.equal(essential.facts.price_aud.value, 19990);
  assert.equal(essential.facts.price_aud.validUntil, "2026-12-15");
  assert.equal(premium.facts.price_aud.value, null);
});

test("dealer and publication prices are Reported-compatible and never ranking-eligible", () => {
  const dealer = applyPriceLadder(
    car("bmw_ix1_current__22hm_xdrive30_m_sport__20261010"),
    catalogueAdditions.sources,
  ).facts.price_aud;
  assert.equal(dealer.priceEvidence?.rung, 6);
  assert.equal(dealer.priceEvidence?.rankingEligible, false);
  assert.equal(dealer.resolvedElsewhere, true);
  assert.match(dealer.basis, /Dealer ad/);
  const c = car();
  c.facts.price_aud = {
    ...c.facts.price_aud,
    value: 49000,
    sourceIds: [source.id],
    basis: "List price before on-road costs, reported by Example Motoring",
  };
  const publication = applyPriceLadder(c, [source]).facts.price_aud;
  assert.equal(publication.priceEvidence?.rung, 5);
  assert.equal(publication.priceEvidence?.rankingEligible, false);
  assert.match(publication.basis, /Reported by Example Motoring/);
});

test("state tags, qualification and expiry stay visible on selected prices", () => {
  const mazda = applyPriceLadder(
    car("mazda_6e_e35_gt_au__20261010"),
    catalogueAdditions.sources,
  ).facts.price_aud;
  assert.equal(mazda.priceEvidence?.state, "NSW");
  assert.match(mazda.basis, /NSW/);
  assert.ok(mazda.qualifications.some((q) => /Premium paint/.test(q)));
  const polestar = applyPriceLadder(
    car("polestar_2_my27_long_range_single_motor__20261010"),
    catalogueAdditions.sources,
  ).facts.price_aud;
  assert.equal(polestar.priceEvidence?.state, "WA");
  assert.equal(polestar.validUntil, "2026-12-31");
  assert.ok(polestar.qualifications.some((q) => /Plus pack|Plus Pack/.test(q)));
});

test("no derived, expired, unbound family or option-increment amount is automatically promoted", () => {
  const c = car();
  c.facts.qualified_derived_price_aud = { ...c.facts.price_aud, value: 39990 };
  c.facts.optional_package_price = { ...c.facts.price_aud, value: 3000 };
  assert.equal(applyPriceLadder(c, [source]).facts.price_aud.value, null);
  const expired = applyPriceLadder(
    car("gwm_ora5_suv_lux_au__20261010"),
    catalogueAdditions.sources,
  );
  assert.equal(expired.facts.price_aud.value, null);
});

test("Tier 2 and Tier 3 records remain untouched", () => {
  const c = {
    ...car("smart_1_pro_plus_current_au__20261010"),
    vehicleClass: "van" as const,
  };
  assert.equal(applyPriceLadder(c, catalogueAdditions.sources), c);
});

test("a later price correction is never overwritten by the dated admission overlay", () => {
  const c = car("smart_1_pro_plus_current_au__20261010");
  c.facts.price_aud = {
    ...c.facts.price_aud,
    value: 51500,
    basis: "Maker list price before on-road costs",
    sourceIds: ["r10_dgs_smart_configurator"],
  };
  assert.equal(
    applyPriceLadder(c, catalogueAdditions.sources).facts.price_aud.value,
    51500,
  );
});

test("changed alternative facts and changed source records invalidate saved admissions", () => {
  const id = "smart_1_pro_plus_current_au__20261010";
  const c = car(id);
  c.facts.price_from_aud_excluding_on_roads = {
    ...c.facts.price_from_aud_excluding_on_roads,
    value: 52000,
  };
  assert.equal(
    applyPriceLadder(c, catalogueAdditions.sources).facts.price_aud.value,
    null,
  );
  const sources = catalogueAdditions.sources.map((s) =>
    s.id === "r10_dgs_smart_configurator"
      ? { ...s, changedAfterReview: true }
      : s,
  );
  assert.equal(applyPriceLadder(car(id), sources).facts.price_aud.value, null);
  const duplicate = [
    ...catalogueAdditions.sources,
    catalogueAdditions.sources.find(
      (s) => s.id === "r10_dgs_smart_configurator",
    )!,
  ];
  assert.equal(
    applyPriceLadder(car(id), duplicate).facts.price_aud.value,
    null,
  );
});

test("canonical state driveaway stays state-tagged and unknown price basis is never maker list", () => {
  const c = car();
  c.facts.price_aud = {
    ...c.facts.price_aud,
    value: 48000,
    sourceIds: [source.id],
    basis: "Manufacturer NSW driveaway estimate",
  };
  const result = applyPriceLadder(c, [source]).facts.price_aud;
  assert.equal(result.priceEvidence?.state, "NSW");
  assert.equal(result.priceEvidence?.rung, 4);
  assert.match(result.basis, /NSW/);
  c.facts.price_aud.basis = "Price basis unconfirmed";
  assert.equal(
    applyPriceLadder(c, [source]).facts.price_aud.priceEvidence,
    undefined,
  );
});

test("legacy citation bundles do not turn reported prices into maker prices", () => {
  const c = car();
  c.facts.price_aud = {
    ...c.facts.price_aud,
    value: 41990,
    basis: "List price before on-road costs, standard paint",
    sourceIds: ["maker", "geely_price_change"],
  };
  const reported = {
    ...source,
    id: "geely_price_change",
    publisher: "CarExpert",
    source_type: "secondary_australian_reporting",
    market: "Australia",
  };
  const result = applyPriceLadder(c, [source, reported]).facts.price_aud;
  assert.equal(result.priceEvidence?.rung, 5);
  assert.deepEqual(result.sourceIds, ["geely_price_change"]);
  assert.match(result.basis, /Reported by CarExpert/);
});

test("reapplying the ladder preserves the selected exact price provenance", () => {
  const input = car("smart_1_pro_plus_current_au__20261010");
  const first = applyPriceLadder(input, catalogueAdditions.sources);
  const again = applyPriceLadder(first, catalogueAdditions.sources);
  assert.deepEqual(again.facts.price_aud, first.facts.price_aud);
});

test("Volvo's unknown configurator basis never inherits a null list-price template", () => {
  const id = "volvo_ex30_my27_plus_p5_long_range_electric__20261010";
  const result = applyPriceLadder(car(id), catalogueAdditions.sources).facts
    .price_aud;
  assert.equal(result.comparisonBasis, "");
  assert.equal(result.priceEvidence?.rankingEligible, false);
  assert.match(
    result.priceEvidence?.originalBasis ?? "",
    /unlocalized_display/,
  );
  assert.match(
    result.priceEvidence?.originalBasis ?? "",
    /on-road charges unresolved/,
  );
  assert.doesNotMatch(
    result.priceEvidence?.originalBasis ?? "",
    /^List price before on-road costs$/,
  );
});

test("all saved candidates preserve their own source price basis explicitly", () => {
  for (const row of priceCandidates)
    assert.ok(
      row.originalBasis?.trim(),
      `${row.variantId}: missing original source basis`,
    );
  const polestar = applyPriceLadder(
    car("polestar_2_my27_long_range_single_motor__20261010"),
    catalogueAdditions.sources,
  ).facts.price_aud;
  assert.match(
    polestar.priceEvidence?.originalBasis ?? "",
    /driveaway_example_not_MLP/,
  );
  assert.match(polestar.priceEvidence?.originalBasis ?? "", /WA/);
});
