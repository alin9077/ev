import test from "node:test";
import assert from "node:assert/strict";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { site } from "../src/lib/config";
import { PAGE_UPDATED } from "../src/lib/publication-metadata";
import { evidenceFreshness } from "../src/lib/freshness";
import type { Fact, Pack } from "../src/lib/types";
import { compiledSource } from "./helpers/compiled-source";

const asOf = "2026-11-16";
const laterPublication = "2027-02-03";
type Citable = typeof import("../src/lib/citable");

function citable(publicationDate = PAGE_UPDATED): Citable {
  return compiledSource("src/lib/citable.ts", {
    "./publication-metadata": { PAGE_UPDATED: publicationDate },
    "./evidence-date": { australianEvidenceDate: () => asOf },
  }) as Citable;
}

function fixture(): Pack {
  const fact = (key: string): Fact => ({
    key,
    label: key,
    value: key === "warranty" ? "5 years" : 500,
    unit: key === "price_aud" ? "AUD" : "",
    basis: "Maker's Australian specification",
    comparisonBasis: key === "price_aud" ? "before on-road costs" : key,
    status: "standard",
    buyerGrade: "confirmed",
    gradeReview: {
      reviewedAt: "2026-10-08",
      overlayId: "synthetic-review",
      reason: "Named Australian version",
      evidenceScope: "exact_au_version",
      sourceIds: ["maker"],
    },
    date: "2026-10-01",
    sourceIds: ["maker"],
    market: "AU",
    scope: "Exact version",
    qualifications: [],
    issues: [],
    ...(key === "price_aud" ? { validUntil: "2026-10-20" } : {}),
  });
  return {
    car: {
      id: "fixture",
      modelId: "fixture",
      family: "fixture",
      slug: "base",
      brand: "Example",
      model: "Fixture",
      trim: "Base",
      generation: "First",
      year: 2026,
      drive: "RWD",
      vehicleClass: "passenger",
      issues: [],
      availability: "current_or_order_listed",
      availabilityEvidence: {
        checkedAt: "2026-09-30",
        orderStatus: "listed_unconfirmed",
        stockStatus: "unverified",
        sourceIds: ["maker"],
      },
      facts: Object.fromEntries(
        citable().keyMeasurements.map((key) => [key, fact(key)]),
      ),
    },
    features: [
      {
        variant_id: "fixture",
        model_id: "fixture",
        criterion: "v2l",
        status: "standard",
        value: "3.6 kW",
        conditions: "Approved adapter",
        source_ids: ["maker"],
        evidence_scope: "Exact version",
        last_evidence_date: "2026-05-01",
        reviewed_date: "2026-10-07",
        verification_state: "verified",
        buyerGrade: "confirmed",
        gradeReview: { ...fact("v2l").gradeReview!, reviewedAt: "2026-10-09" },
      },
    ],
    sources: [
      {
        id: "maker",
        url: "https://maker.example/au/fixture",
        title: "Fixture Australian specification",
        publisher: "Example",
        source_type: "manufacturer",
        market: "AU",
        supports: "Named version",
        published_date: "2026-04-20",
        accessed_date: "2026-09-29",
        full_text_checked_date: "2026-09-28",
      },
    ],
    eligibility: {
      variant_id: "fixture",
      model_id: "fixture",
      documented_family_minimum: 1,
      exact_total_known: true,
      exact_total: 1,
      scope: "Synthetic fixture",
      meaning: "Test only",
      source_ids: ["maker"],
      observation_window_start: "2026-09-01",
      observation_window_end: "2026-09-30",
    },
    events: [],
    configuration: [],
  };
}

test("publication changes only report metadata, never evidence, source or grade-review dates", () => {
  const pack = fixture();
  const before = structuredClone(pack);
  const initial = citable().makeReport([pack], "/compare/fixture");
  assert.equal(initial.dateModified, PAGE_UPDATED);
  for (const publication of [PAGE_UPDATED, laterPublication]) {
    const api = citable(publication);
    const report = api.makeReport([pack], "/compare/fixture");
    assert.equal(report.dateModified, publication);
    assert.deepEqual(
      { ...report, dateModified: initial.dateModified },
      initial,
    );
    const exported = JSON.parse(JSON.stringify(report));
    assert.equal(exported.dateModified, publication);
    assert.deepEqual(
      { ...exported, dateModified: initial.dateModified },
      JSON.parse(JSON.stringify(initial)),
    );
    const price = report.keyFacts.find((claim) => claim.key === "price_aud")!;
    const v2l = report.questions.find((question) => question.id === "v2l")!
      .claims[0];
    assert.equal(price.evidenceDate, before.car.facts.price_aud.date);
    assert.deepEqual(price.gradeReview, before.car.facts.price_aud.gradeReview);
    assert.equal(v2l.evidenceDate, before.features[0].last_evidence_date);
    assert.deepEqual(v2l.gradeReview, before.features[0].gradeReview);
    assert.equal(
      report.availability[0].evidenceDate,
      before.car.availabilityEvidence!.checkedAt,
    );
    for (const claim of [...report.keyFacts, ...report.availability, v2l]) {
      assert.equal(
        claim.sources[0].accessed_date,
        before.sources[0].accessed_date,
      );
      assert.equal(
        claim.sources[0].published_date,
        before.sources[0].published_date,
      );
      assert.equal(
        claim.sources[0].checked,
        before.sources[0].full_text_checked_date,
      );
    }
    assert.deepEqual(pack, before);
  }
});

test("new publication metadata does not freshen old claims or extend expired offers in exports", () => {
  const pack = fixture();
  for (const publication of [PAGE_UPDATED, laterPublication]) {
    const api = citable(publication);
    const report = api.makeReport([pack], "/compare/fixture");
    const price = report.keyFacts.find((claim) => claim.key === "price_aud")!;
    const v2l = report.questions.find((question) => question.id === "v2l")!
      .claims[0];
    assert.equal(
      evidenceFreshness(price.evidenceDate, price.key, asOf).fresh,
      false,
    );
    assert.equal(
      evidenceFreshness(v2l.evidenceDate, v2l.key, asOf).fresh,
      false,
    );
    assert.equal(price.validUntil, pack.car.facts.price_aud.validUntil);
    assert.match(price.sentence, /Offer ended 2026-10-20/);
    const markdown = api.reportMarkdown(report);
    assert.ok(markdown.includes(`Page updated: ${publication}.`));
    for (const claim of [price, v2l]) {
      assert.ok(markdown.includes(`evidence checked ${claim.evidenceDate}`));
      assert.ok(markdown.includes(api.citationText(claim.sources[0])));
    }
    const graph = api.reportSchema(report)["@graph"];
    const webPage = graph.find((item) => item["@type"] === "WebPage");
    assert.ok(webPage && "dateModified" in webPage);
    assert.equal(webPage.dateModified, publication);
    const faq = graph.find((item) => item["@type"] === "FAQPage");
    assert.ok(faq && "dateModified" in faq && "mainEntity" in faq);
    assert.equal(faq.dateModified, publication);
    assert.ok(JSON.stringify(faq.mainEntity).includes(v2l.evidenceDate));
    // An explicit observation clock still controls offer validity independently.
    const earlier = api.makeReport([pack], "/compare/fixture", "2026-10-15");
    assert.match(
      earlier.keyFacts.find((claim) => claim.key === "price_aud")!.sentence,
      /Offer deadline: 2026-10-20/,
    );
  }
});

test("glossary review labels and definition schema stay on their own review date", () => {
  const render = (publication: string) => {
    const { default: Glossary } = compiledSource("src/app/glossary/page.tsx", {
      "next/link": "a",
      "@/lib/config": { site },
      "@/lib/citable": { PAGE_UPDATED: publication },
      "@/lib/publication-metadata": { PAGE_UPDATED: publication },
    });
    return renderToStaticMarkup(createElement(Glossary as ComponentType));
  };
  const initial = render(PAGE_UPDATED);
  assert.equal(render(laterPublication), initial);
  assert.match(
    initial,
    /Definitions reviewed <time dateTime="2026-10-10">2026-10-10<\/time>/,
  );
  const definitionSections = [
    ...initial.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g),
  ];
  assert.ok(definitionSections.length > 0);
  for (const [, section] of definitionSections) {
    assert.match(section, /Definition reviewed 2026-10-10/);
  }
  const schema = JSON.parse(
    initial.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)![1],
  );
  assert.equal(schema["@type"], "DefinedTermSet");
  assert.equal(schema.dateModified, "2026-10-10");
});

test("generated sitemap and machine-readable index use publication metadata with synthetic cars", async () => {
  const pack = fixture();
  for (const publication of [PAGE_UPDATED, laterPublication]) {
    const overrides = {
      "@/lib/citable": citable(publication),
      "@/lib/config": { site },
      "@/lib/data": { catalogue: () => [pack.car] },
      "@/lib/pair-pages": {
        pairPages: [{ slug: "fixture" }],
        pairLinks: () => [
          { label: "Fixture comparison", href: "/compare/fixture" },
        ],
      },
    };
    const { default: sitemap } = compiledSource(
      "src/app/sitemap.ts",
      overrides,
    ) as {
      default: () => { url: string; lastModified: string }[];
    };
    const entries = sitemap();
    assert.ok(
      entries.some((entry) => entry.url.endsWith("/cars/fixture/base")),
    );
    assert.ok(entries.every((entry) => entry.lastModified === publication));
    const { GET } = compiledSource("src/app/llms.txt/route.ts", overrides) as {
      GET: () => Response;
    };
    const text = await GET().text();
    assert.ok(text.includes(`Page update: ${publication}.`));
    assert.ok(text.includes("Original research: 6 October 2026"));
    assert.ok(text.includes("/cars/fixture/base"));
  }
});
