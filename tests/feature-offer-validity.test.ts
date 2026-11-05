import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { applyBrandTermFeatures } from "../src/lib/brand-updates";
import { offerExpired, offerValidityLabel } from "../src/lib/fact-validity";
import { evidenceFreshness } from "../src/lib/freshness";
import {
  featureClaim,
  factClaim,
  makeReport,
  reportMarkdown,
  reportSchema,
} from "../src/lib/citable";
import {
  FeatureValue,
  EvidenceDrawer,
  featureEvidence,
} from "../src/components/ui";
import { FreshnessLabel } from "../src/components/freshness-label";
import { CitedClaim } from "../src/components/citable-report";
import { elementNodes } from "./helpers/compiled-source";
import { featureReportClaim } from "../src/lib/corrections";
import { validReportFact } from "../src/lib/report-claim-shape";
import { featureAsFact } from "../src/lib/evidence-regrade-policy";
import {
  applyFeatureCorrections,
  type FeatureCorrection,
} from "../src/lib/feature-corrections";
import {
  storePortablePacks,
  hydratePortablePacks,
} from "../src/lib/portable-packs";
import {
  encodePortableJson,
  parsePortableData,
} from "../src/lib/portable-string-codec";
import {
  buildStaleReport,
  freshnessEntries,
  formatStaleReport,
} from "../scripts/reporting/reports";
import {
  buildBuyerSummaries,
  currentBuyerSummary,
  type SellingPointProposal,
} from "../src/lib/selling-points";
import type { Fact, Feature, Pack, Source } from "../src/lib/types";

const checkedAt = "2026-10-14";
const deadline = "2026-10-31";
const days = ["2026-10-30", deadline, "2026-11-01", "2026-11-28", "2026-11-29"];
function fixture(supplemental = false) {
  const source: Source = {
    id: "maker-offer",
    url: "https://maker.example/au/offers",
    title: "Fixture offer",
    publisher: "Maker",
    source_type: "manufacturer",
    published_date: null,
    accessed_date: checkedAt,
    market: "AU",
    supports: "Exact version offer",
  };
  const offer: Fact = {
    key: supplemental ? "promotional_driveaway_aud" : "price_aud",
    label: "Driveaway offer",
    value: 36990,
    unit: "AUD",
    basis: "Maker national offer",
    comparisonBasis: "Driveaway",
    status: "conditional",
    buyerGrade: "check",
    gradeReview: {
      reviewedAt: "2026-10-15",
      overlayId: "fixture",
      reason: "Reviewed maker offer",
      evidenceScope: "exact_au_version",
      sourceIds: [source.id],
    },
    priceEvidence: {
      rung: 2,
      basisTag: "Maker national driveaway",
      sourceKey: "offer",
      sourcePointer: source.url,
      originalBasis: "Driveaway",
      rankingEligible: true,
    },
    validUntil: deadline,
    sourceIds: [source.id],
    date: checkedAt,
    market: "AU",
    scope: "Exact Australian version",
    qualifications: ["Private buyers; stock and paint conditions apply."],
    issues: [],
  };
  const primary: Fact = supplemental
    ? {
        ...offer,
        key: "price_aud",
        value: 35990,
        validUntil: undefined,
        label: "List price",
        basis: "Maker list price",
        comparisonBasis: "Before on-road costs",
        status: "standard",
        buyerGrade: "confirmed",
        qualifications: [],
        priceEvidence: {
          ...offer.priceEvidence!,
          rung: 1,
          basisTag: "Maker RRP",
        },
      }
    : offer;
  if (supplemental) delete primary.validUntil;
  const original: Feature = {
    variant_id: "fixture-car",
    model_id: "fixture-model",
    criterion: "driveaway_price",
    status: "not_verified",
    value: "Needs confirmation",
    conditions: "Older quote",
    source_ids: [],
    evidence_scope: "Exact version",
    last_evidence_date: "2026-10-01",
    reviewed_date: "2026-10-01",
    verification_state: "unverified",
  };
  const unrelated: Feature = {
    ...original,
    criterion: "heat_pump",
    value: "Included",
    status: "standard",
  };
  const pack: Pack = {
    car: {
      id: original.variant_id,
      modelId: original.model_id,
      family: "fixture",
      slug: "base",
      brand: "Maker",
      model: "Example",
      trim: "Base",
      year: 2026,
      generation: "Current",
      vehicleClass: "passenger",
      availability: "current_or_order_listed",
      drive: "RWD",
      issues: [],
      availabilityEvidence: {
        checkedAt,
        orderStatus: "current_or_order_listed",
        stockStatus: "unverified",
        sourceIds: [source.id],
      },
      facts: {
        price_aud: primary,
        ...(supplemental ? { promotional_driveaway_aud: offer } : {}),
        ...Object.fromEntries(
          [
            "range_km",
            "dc_charge_time_min",
            "boot_l",
            "towing_braked_kg",
            "warranty",
          ].map((key) => {
            const fact = { ...primary, key, value: 100, unit: "", label: key };
            delete fact.validUntil;
            return [key, fact];
          }),
        ),
      },
    },
    features: [original, unrelated],
    sources: [source],
    events: [],
    configuration: [],
    eligibility: {
      variant_id: original.variant_id,
      model_id: original.model_id,
      documented_family_minimum: null,
      exact_total_known: false,
      exact_total: null,
      scope: "Fixture",
      meaning: "Not counted",
      source_ids: [],
      observation_window_start: checkedAt,
      observation_window_end: checkedAt,
    },
  };
  pack.features = applyBrandTermFeatures(pack.car, pack.features);
  return {
    pack,
    offer,
    original,
    unrelated,
    feature: pack.features[0],
    source,
  };
}

test("canonical and supplemental offer projection retain deadline, source history, grades and the selected primary price", () => {
  for (const supplemental of [false, true]) {
    const { pack, offer, original, unrelated, feature } = fixture(supplemental);
    const before = structuredClone(pack);
    assert.equal(feature.validUntil, deadline);
    assert.equal(feature.value, "A$36,990");
    assert.equal(feature.last_evidence_date, checkedAt);
    assert.equal(feature.reviewed_date, "2026-10-15");
    assert.equal(feature.buyerGrade, "check");
    assert.deepEqual(feature.gradeReview, offer.gradeReview);
    assert.deepEqual(feature.source_ids, offer.sourceIds);
    assert.equal(pack.car.facts.price_aud.value, supplemental ? 35990 : 36990);
    assert.equal(pack.features[1], unrelated);
    assert.equal(original.validUntil, undefined);
    assert.equal(original.value, "Needs confirmation");
    for (const asOf of days) {
      const expired = asOf > deadline;
      assert.equal(offerExpired(feature, asOf), expired);
      assert.equal(
        evidenceFreshness(feature.last_evidence_date, feature.criterion, asOf)
          .fresh,
        asOf <= "2026-11-28",
      );
      const html = renderToStaticMarkup(
        createElement(FeatureValue, { feature, asOf }),
      );
      assert.match(html, /A\$36,990/);
      assert.equal(html.includes(`Offer ended ${deadline}`), expired);
      assert.equal(html.includes("evidence-stale"), expired);
      assert.equal(html.includes("Needs a fresh check"), asOf > "2026-11-28");
      assert.match(html, /Checked on.*2026-10-14/);
      assert.match(html, /Private buyers/);
      assert.doesNotMatch(html, /Not published|Needs review/);
    }
    assert.deepEqual(pack, before);
  }
});

test("portable, JSON, Markdown, FAQ and evidence transports preserve the deadline and label ended amounts", () => {
  for (const supplemental of [false, true]) {
    const { pack, feature, source, offer } = fixture(supplemental);
    const input = {
      packs: storePortablePacks({ [pack.car.id]: pack }),
      sources: pack.sources,
    };
    const restored = parsePortableData(
      encodePortableJson(JSON.stringify(input)).json,
    ) as typeof input;
    const hydrated = hydratePortablePacks(restored.packs, restored.sources)[
      pack.car.id
    ];
    assert.deepEqual(hydrated, JSON.parse(JSON.stringify(pack)));
    assert.equal(hydrated.features[0].validUntil, deadline);
    assert.deepEqual(hydrated.sources, [source]);
    for (const asOf of days) {
      const claim = featureClaim(
        hydrated,
        feature.criterion,
        "Driveaway price",
        asOf,
      )!;
      const restoredClaim = JSON.parse(JSON.stringify(claim));
      assert.equal(JSON.stringify(restoredClaim), JSON.stringify(claim));
      assert.equal(claim.validUntil, deadline);
      assert.equal(claim.value, "A$36,990");
      assert.equal(claim.evidenceDate, checkedAt);
      assert.equal(claim.buyerGrade, "check");
      assert.equal(claim.sources[0].accessed_date, checkedAt);
      assert.equal(
        claim.sentence.includes(`Offer ended ${deadline}`),
        asOf > deadline,
      );
      assert.equal(factClaim(hydrated, offer, asOf).validUntil, deadline);
      const report = makeReport([hydrated], "/cars/fixture/base", asOf);
      const answer = report.questions.find((q) => q.id === "driveaway_price")!;
      assert.match(answer.answer, /A\$36,990/);
      assert.equal(
        answer.answer.includes(`Offer ended ${deadline}`),
        asOf > deadline,
      );
      assert.equal(
        reportMarkdown(report).includes(`Offer ended ${deadline}`),
        asOf > deadline,
      );
      assert.equal(
        JSON.stringify(reportSchema(report)).includes(
          `Offer ended ${deadline}`,
        ),
        asOf > deadline,
      );
      const rendered = renderToStaticMarkup(
        createElement(CitedClaim, { claim, compactEvidence: true }),
      );
      assert.match(rendered, /A\$36,990/);
      assert.equal(
        rendered.includes(`Offer ended ${deadline}`),
        asOf > deadline,
      );
      // A cached/static report keeps a live clock label, so the next day's client
      // can disclose expiry even when its serialized sentence predates it.
      const liveLabel = elementNodes(CitedClaim({ claim })).find(
        (node) => node.type === FreshnessLabel,
      )!;
      assert.equal(liveLabel.props.validUntil, deadline);
      assert.equal(liveLabel.props.checkedAt, checkedAt);
      const evidence = featureEvidence(feature, "Driveaway price");
      assert.equal(evidence.validUntil, deadline);
      assert.equal(evidence.value, "A$36,990");
      assert.equal(evidence.date, checkedAt);
      const drawer = renderToStaticMarkup(
        createElement(EvidenceDrawer, {
          evidence,
          sources: pack.sources,
          onClose() {},
          asOf,
        }),
      );
      assert.equal(drawer.includes(`Offer ended ${deadline}`), asOf > deadline);
      assert.match(drawer, /A\$36,990/);
    }
    assert.equal(
      featureReportClaim(feature, "Driveaway price").validUntil,
      deadline,
    );
    assert.ok(validReportFact(featureReportClaim(feature, "Driveaway price")));
    assert.equal(featureAsFact(feature).validUntil, deadline);
  }
});

test("equipment stale reporting honours the inclusive deadline separately from the 45-day evidence age", () => {
  for (const supplemental of [false, true]) {
    const { pack, feature, offer } = fixture(supplemental);
    const input = { cars: [pack.car], features: pack.features };
    const before = structuredClone(input);
    for (const asOf of days) {
      const entries = freshnessEntries(input, asOf);
      const row = entries.find(
        (entry) =>
          entry.kind === "equipment" && entry.key === feature.criterion,
      )!;
      const fact = entries.find(
        (entry) => entry.kind === "fact" && entry.key === offer.key,
      )!;
      for (const entry of [row, fact]) {
        assert.equal(entry.checkedAt, checkedAt);
        assert.equal(entry.windowDays, 45);
        assert.equal(entry.expiresOn, deadline);
        assert.equal(entry.staleOn, "2026-11-01");
        assert.equal(entry.state, asOf > deadline ? "stale" : "fresh");
        assert.equal(entry.dueReason, "offer deadline");
        assert.deepEqual(entry.sourceIds, offer.sourceIds);
      }
      const report = buildStaleReport(input, asOf);
      const section = asOf > deadline ? report.overdue : report.due;
      assert.ok(
        section.some(
          (entry) =>
            entry.kind === "equipment" && entry.key === feature.criterion,
        ),
      );
      assert.equal(report.invalid.length, 0);
      assert.equal(report.historical.length, 0);
      if (asOf <= deadline)
        assert.match(formatStaleReport(report), /offer deadline/);
    }
    assert.deepEqual(input, before);
    const laterDeadline = { ...feature, validUntil: "2026-12-31" };
    const aged = freshnessEntries(
      { cars: [pack.car], features: [laterDeadline] },
      "2026-11-29",
    ).find((entry) => entry.kind === "equipment")!;
    assert.equal(aged.state, "stale");
    assert.equal(aged.dueReason, "evidence age");
    assert.equal(aged.staleOn, "2026-11-29");
    assert.equal(offerExpired(laterDeadline, "2026-11-29"), false);
  }
});

test("missing and malformed deadlines do not invent expiry or a start date; replacement clears obsolete metadata", () => {
  const { pack, feature } = fixture();
  for (const validUntil of ["", "unknown", "2026-02-30", "2026-13-01"]) {
    const invalid = { ...feature, validUntil };
    assert.equal(offerExpired(invalid, "2026-10-30"), true);
    assert.equal(
      offerValidityLabel(invalid, "2026-10-30"),
      "Offer deadline needs confirmation",
    );
    const html = renderToStaticMarkup(
      createElement(FeatureValue, { feature: invalid, asOf: "2026-10-30" }),
    );
    assert.match(html, /A\$36,990/);
    assert.match(html, /Offer deadline needs confirmation/);
    assert.match(html, /evidence-stale/);
    assert.doesNotMatch(html, /Offer ended/);
    const report = buildStaleReport(
      { cars: [pack.car], features: [invalid] },
      "2026-10-30",
    );
    assert.ok(report.invalid.some((entry) => entry.kind === "equipment"));
    assert.equal(
      featureClaim(
        { ...pack, features: [invalid] },
        invalid.criterion,
        "Driveaway price",
        "2026-10-30",
      )?.validUntil,
      validUntil,
    );
  }
  const unknown = { ...feature };
  delete unknown.validUntil;
  assert.equal(offerExpired(unknown, "2026-11-01"), false);
  assert.equal(offerValidityLabel(unknown, "2026-11-01"), undefined);
  assert.doesNotMatch(
    renderToStaticMarkup(
      createElement(FreshnessLabel, {
        checkedAt,
        factKey: feature.criterion,
        asOf: "2026-11-01",
      }),
    ),
    /Offer ended|Offer deadline|evidence-stale/,
  );
  assert.equal(
    freshnessEntries(
      { cars: [pack.car], features: [unknown] },
      "2026-11-01",
    ).find((e) => e.kind === "equipment")?.state,
    "fresh",
  );
  assert.equal(offerValidityLabel(feature, ""), `Offer deadline: ${deadline}`);
  assert.match(
    offerValidityLabel(feature, "invalid")!,
    /validity needs confirmation/,
  );
  assert.doesNotMatch(
    offerValidityLabel(feature, "2026-10-01")!,
    /starts|started|not yet|ended/,
  );
  delete pack.car.facts.price_aud.validUntil;
  const replacement = applyBrandTermFeatures(pack.car, [feature])[0];
  assert.equal(Object.hasOwn(replacement, "validUntil"), false);
  assert.doesNotMatch(replacement.conditions, /Offer deadline/);
  assert.equal(feature.validUntil, deadline);
});

test("legacy non-offer rows retain exact transport and display behaviour", () => {
  const { pack, unrelated } = fixture();
  const oldClaim = featureClaim(
    pack,
    unrelated.criterion,
    "Heat pump",
    "2026-10-30",
  )!;
  assert.equal(Object.hasOwn(oldClaim, "validUntil"), false);
  assert.equal(
    Object.hasOwn(featureEvidence(unrelated, "Heat pump"), "validUntil"),
    false,
  );
  assert.equal(
    Object.hasOwn(featureReportClaim(unrelated, "Heat pump"), "validUntil"),
    false,
  );
  assert.equal(Object.hasOwn(featureAsFact(unrelated), "validUntil"), false);
  assert.deepEqual(
    featureClaim(pack, unrelated.criterion, "Heat pump", "2026-11-29"),
    oldClaim,
  );
  assert.equal(
    renderToStaticMarkup(
      createElement(FeatureValue, { feature: unrelated, asOf: "2026-10-30" }),
    ),
    renderToStaticMarkup(
      createElement(FeatureValue, { feature: unrelated, asOf: "2026-11-29" }),
    ),
  );
  assert.equal(
    freshnessEntries(
      { cars: [pack.car], features: [unrelated] },
      "2026-11-29",
    ).find((e) => e.kind === "equipment")?.windowDays,
    180,
  );
});

test("full equipment correction guards include the optional deadline without changing historical snapshots", () => {
  const { feature, source } = fixture();
  const patch = {
    value: feature.value,
    status: feature.status,
    conditions: feature.conditions,
    source_ids: feature.source_ids,
  };
  const edit: FeatureCorrection = {
    id: "fixture-correction",
    variantId: feature.variant_id,
    criterion: feature.criterion,
    beforeFeature: structuredClone(feature),
    before: patch,
    after: patch,
    status: "approved",
    reviewedBy: "Fixture",
    reviewedAt: "2026-10-15",
    evidenceDate: checkedAt,
    reason: "Exact fixture review",
  };
  const corrected = applyFeatureCorrections([feature], [edit], [source])[0];
  assert.equal(corrected.validUntil, deadline);
  assert.throws(
    () =>
      applyFeatureCorrections(
        [{ ...feature, validUntil: "2026-11-30" }],
        [edit],
        [source],
      ),
    /reviewed claim has changed/,
  );
  const missing = structuredClone(edit);
  delete missing.beforeFeature.validUntil;
  assert.throws(
    () => applyFeatureCorrections([feature], [missing], [source]),
    /reviewed claim has changed/,
  );
});

test("feature-dependent summaries expire on the same deadline, including cached portable summaries", () => {
  const { pack, feature, source } = fixture();
  const proposal: SellingPointProposal = {
    dependencies: [
      {
        id: "year",
        kind: "variant_property",
        variantId: pack.car.id,
        key: "model_year",
        expectedValue: 2026,
        checkedAt,
        sourceIds: [source.id],
      },
      {
        id: "offer",
        kind: "feature",
        variantId: pack.car.id,
        key: feature.criterion,
        expectedValue: feature.value,
        expectedStatus: feature.status,
        expectedConditions: feature.conditions,
        checkedAt,
        sourceIds: feature.source_ids,
      },
    ],
    records: [
      {
        variantId: pack.car.id,
        checkedAt,
        modelYearDependency: "year",
        expectedAvailabilityEvidence: structuredClone(
          pack.car.availabilityEvidence,
        ),
        availabilityGuardSourceIds: [source.id],
        requiredVisibleConditions: [],
        strength: {
          label: "Offer",
          text: "Published driveaway amount",
          dependencyIds: ["offer"],
        },
      },
    ],
  };
  const cached = buildBuyerSummaries(
    [pack.car],
    pack.features,
    pack.sources,
    proposal,
    { asOf: deadline },
  ).get(pack.car.id)!;
  assert.equal(cached.strength?.validUntil, deadline);
  for (const asOf of days) {
    assert.equal(
      !!buildBuyerSummaries([pack.car], pack.features, pack.sources, proposal, {
        asOf,
      }).get(pack.car.id)?.strength,
      asOf <= deadline,
    );
    assert.equal(
      !!currentBuyerSummary(JSON.parse(JSON.stringify(cached)), pack.sources, {
        asOf,
      })?.strength,
      asOf <= deadline,
    );
  }
  assert.equal(feature.value, "A$36,990");
});
