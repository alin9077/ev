import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { compiledSource } from "./helpers/compiled-source";
import {
  prepareBrandResearch,
  applyBrandUpdates,
  type BrandUpdatePacket,
} from "../src/lib/brand-updates";
import type { CatalogueSnapshot } from "../src/lib/data";
import type { Car, Feature, Research } from "../src/lib/types";

type DataModule = typeof import("../src/lib/data");

/** Small inputs exercise the actual loader; full current-data parity is checked separately. */
function fixture(failAt?: string, requestCaching = false) {
  const events: string[] = [];
  let reads = 0;
  type CachedCall = (...args: unknown[]) => unknown;
  let requestScope = new Map<
    CachedCall,
    { args: unknown[]; value: unknown }[]
  >();
  const requestCache =
    (fn: CachedCall) =>
    (...args: unknown[]) => {
      const entries = requestScope.get(fn) ?? [];
      const existing = entries.find(
        (entry) =>
          entry.args.length === args.length &&
          entry.args.every((value, i) => value === args[i]),
      );
      if (existing) return existing.value;
      const value = fn(...args);
      entries.push({ args, value });
      requestScope.set(fn, entries);
      return value;
    };
  const source = {
    id: "snapshot-fixture-source",
    url: "https://maker.example/au/specifications",
    title: "Synthetic specifications",
    publisher: "Maker",
    source_type: "manufacturer",
    published_date: null,
    accessed_date: "2026-10-14",
    market: "AU",
    supports: "Synthetic loader tests",
  };
  const raw = {
    schema_version: "fixture",
    metadata: { as_of: "2026-10-14" },
    models: [
      {
        id: "fixture_model",
        brand: "Maker",
        model: "Example",
        generation: "Current",
      },
    ],
    variants: [
      {
        id: "fixture_model__base__1",
        model_id: "fixture_model",
        brand: "Maker",
        model: "Example",
        trim: "Base",
        model_year: null,
        record_state: "current_or_order_listed",
        price_aud: 40000,
        price_basis: "MLP",
        range_km: 450,
        range_cycle: "WLTP",
        seats: 5,
        source_ids: [source.id],
        variant_review_date: "2026-10-14",
        drive: "RWD",
        vehicle_class: "passenger",
      },
    ],
    sources: [source],
    criteria: [],
    trim_equipment: [],
    feature_evidence: [],
    update_eligibility: [],
    update_events: [],
    configuration_history: [],
    publication_issues: [],
  };
  const packet: BrandUpdatePacket = {
    schemaVersion: 1,
    id: "fixture-loader-packet",
    brand: "Maker",
    reviewedAt: "2026-10-14",
    reviewedBy: "Synthetic test",
    sources: [structuredClone(source)],
    models: [],
    variants: [],
    versionGuards: [],
    versionUpdates: [],
    facts: [],
    availability: [],
    summaries: [],
  };
  const overlay = {
    features: [],
    facts: [],
    sources: [],
    criteria: [],
    issues: [],
    eligibility: [],
    configuration: [],
    basis: {},
  };
  const stage = (name: string) => {
    events.push(name);
    if (failAt === name) throw new Error(`Guard failure: ${name}`);
  };
  let sourceAtPreparation: Research | undefined;
  const overrides: Record<string, unknown> = {
    react: { cache: requestCaching ? requestCache : (fn: unknown) => fn },
    "node:fs": {
      readFileSync: () => {
        reads++;
        stage("read");
        return JSON.stringify(raw);
      },
    },
    "./brand-update-registry": { brandUpdatePackets: [packet] },
    "./brand-updates": {
      prepareBrandResearch: (base: Research, packets: BrandUpdatePacket[]) => {
        stage("prepare");
        sourceAtPreparation = base;
        const before = JSON.stringify(base);
        const result = prepareBrandResearch(base, packets);
        assert.equal(
          JSON.stringify(base),
          before,
          "Preparing current research must not mutate source input",
        );
        if (failAt === "prepared-source-drift")
          result.sources[0] = {
            ...result.sources[0],
            title: "Changed after preparation",
          };
        return result;
      },
      applyBrandUpdates: (
        cars: Car[],
        data: Research,
        packets: BrandUpdatePacket[],
      ) => {
        stage("apply");
        const before = JSON.stringify({ cars, data });
        const result = applyBrandUpdates(cars, data, packets);
        assert.equal(
          JSON.stringify({ cars, data }),
          before,
          "Applying packets must not mutate inputs",
        );
        return result;
      },
    },
    "./retained-fact-fills": {
      applyRetainedFactFills: (cars: Car[]) => {
        stage("retained");
        return cars;
      },
    },
    "./price-ladder": {
      priceLadderSources: [],
      applyPriceLadder: (car: Car) => {
        stage("price");
        return car;
      },
    },
    "./evidence-regrading": {
      applyEvidenceRegrading: (cars: Car[]) => {
        stage("regrade");
        return cars;
      },
    },
    "./research-refresh": {
      validateRefreshRegistry: () => stage("refresh-registry"),
      refreshFacts: (_id: string, facts: Car["facts"]) => {
        stage("refresh-facts");
        return facts;
      },
      refreshAvailability: (cars: Car[]) => {
        stage("refresh-availability");
        return cars;
      },
      refreshFeatures: (features: Feature[]) => {
        stage("refresh-features");
        return features;
      },
    },
    "./corrections": {
      validateFactCorrectionRegistry: () => stage("fact-registry"),
      applyCorrections: (_id: string, facts: Car["facts"]) => {
        stage("fact-corrections");
        return structuredClone(facts);
      },
    },
    "./availability-corrections": {
      applyAvailabilityCorrections: (cars: Car[]) => {
        stage("availability-corrections");
        return cars;
      },
    },
    "./feature-corrections": {
      validateFeatureCorrectionRegistry: () => stage("feature-registry"),
      applyFeatureCorrections: (features: Feature[]) => {
        stage("feature-corrections");
        return features;
      },
    },
    "./catalogue-additions": {
      catalogueAdditions: {
        ...overlay,
        checkedAt: "2026-10-14",
        models: [],
        variants: [],
      },
    },
    "./buyer-proposal": { buyerProposal: { records: [], dependencies: [] } },
    "./selling-points": {
      buildBuyerSummaries: () => {
        stage("summaries");
        return new Map();
      },
    },
    "./launch-evidence": {
      auditedSource: (value: unknown) => value,
      auditedFact: (value: unknown) => value,
    },
  };
  for (const name of [
    "refinement",
    "usability",
    "sales",
    "completion",
    "editorial",
    "buyer",
  ])
    overrides[
      `../../data/research-${name}-2026-10-${["completion", "editorial", "buyer"].includes(name) ? "07" : "06"}.json`
    ] = overlay;
  for (const name of [
    "approved-feature-corrections",
    "approved-availability-corrections",
    "approved-corrections",
    "research-refresh-2026-10-10",
  ])
    overrides[`../../data/${name}.json`] = [];
  const loaded = compiledSource("src/lib/data.ts", {
    ...overrides,
    "./evidence-consumers": compiledSource("src/lib/evidence-consumers.ts", overrides),
  }) as DataModule;
  return {
    loaded,
    raw,
    packet,
    events,
    reads: () => reads,
    sourceAtPreparation: () => sourceAtPreparation,
    nextRequest: () => {
      requestScope = new Map();
    },
  };
}

test("request-scoped research and source builders share work across all public entry points", () => {
  for (const order of [
    ["research", "catalogue", "sourceCatalogue"],
    ["catalogue", "research", "sourceCatalogue"],
    ["sourceCatalogue", "research", "catalogue"],
  ] as const) {
    const f = fixture(undefined, true);
    for (const name of order) f.loaded[name]();
    const snapshot = f.loaded.catalogueSnapshot();
    assert.equal(f.reads(), 1, order.join(","));
    assert.equal(f.events.filter((stage) => stage === "prepare").length, 1);
    assert.equal(
      f.events.filter((stage) => stage === "fact-registry").length,
      1,
    );
    assert.equal(snapshot.data, f.loaded.research());
    assert.equal(snapshot.cars, f.loaded.catalogue());
    assert.equal(f.loaded.sourceCatalogue()[0].buyerGradesRequired, undefined);
  }
});

test("separate request scopes reread and rebuild current source without cross-request sharing", () => {
  const f = fixture(undefined, true);
  const first = f.loaded.catalogueSnapshot();
  f.raw.variants[0].range_km = 460;
  assert.equal(f.loaded.catalogueSnapshot(), first);
  assert.equal(f.loaded.research(), first.data);
  f.nextRequest();
  const nextData = f.loaded.research();
  const nextCars = f.loaded.sourceCatalogue();
  const second = f.loaded.catalogueSnapshot();
  assert.equal(f.reads(), 2);
  assert.equal(f.events.filter((stage) => stage === "prepare").length, 2);
  assert.equal(f.events.filter((stage) => stage === "fact-registry").length, 2);
  assert.equal(second.data, nextData);
  assert.equal(nextCars[0].facts.range_km.value, 460);
  assert.equal(second.cars[0].facts.range_km.value, 460);
  assert.equal(first.cars[0].facts.range_km.value, 450);
  assert.notEqual(first.data, second.data);
  f.raw.sources[0].title = "Changed source in a later request";
  f.nextRequest();
  assert.throws(() => f.loaded.catalogueSnapshot(), /source snapshot changed/);
  assert.equal(f.reads(), 3);
});

test("one fresh snapshot runs the complete loader sequence from one source read", () => {
  const f = fixture();
  const before = JSON.stringify({ raw: f.raw, packet: f.packet });
  const snapshot = f.loaded.catalogueSnapshot();
  assert.equal(f.reads(), 1);
  assert.deepEqual(f.events, [
    "read",
    "refresh-registry",
    "fact-registry",
    "refresh-facts",
    "fact-corrections",
    "refresh-availability",
    "availability-corrections",
    "feature-registry",
    "refresh-features",
    "feature-corrections",
    "summaries",
    "retained",
    "price",
    "regrade",
    "prepare",
    "apply",
  ]);
  assert.equal(snapshot.cars.length, 1);
  assert.equal(snapshot.cars[0].facts.range_km.value, 450);
  assert.equal(snapshot.cars[0].buyerGradesRequired, true);
  assert.deepEqual(
    f.sourceAtPreparation(),
    f.loaded.sourceResearch(),
    "Source builder leaves the complete source research unchanged",
  );
  assert.equal(JSON.stringify({ raw: f.raw, packet: f.packet }), before);
});

test("fresh top-level calls see changed input without changing prior snapshots", () => {
  const f = fixture();
  const first = f.loaded.catalogueSnapshot();
  f.raw.variants[0].range_km = 460;
  const second = f.loaded.catalogueSnapshot();
  assert.equal(f.reads(), 2);
  assert.equal(first.data.variants[0].range_km, 450);
  assert.equal(first.cars[0].facts.range_km.value, 450);
  assert.equal(second.data.variants[0].range_km, 460);
  assert.equal(second.cars[0].facts.range_km.value, 460);
  assert.notEqual(first, second);
  f.raw.sources[0].title = "Changed source";
  assert.throws(() => f.loaded.catalogueSnapshot(), /source snapshot changed/);
  assert.equal(f.reads(), 3);
});

test("source-only and effective entry points retain their separate boundaries", () => {
  const f = fixture();
  const source = f.loaded.sourceCatalogue();
  assert.equal(source[0].buyerGradesRequired, undefined);
  assert(!f.events.includes("prepare"));
  assert(!f.events.includes("apply"));
  const effective = f.loaded.catalogue();
  assert.equal(effective[0].buyerGradesRequired, true);
  assert.equal(f.reads(), 2);
  const standalone = f.loaded.research();
  assert.equal(f.reads(), 3);
  assert.deepEqual(standalone, f.loaded.catalogueSnapshot().data);
});

for (const stage of [
  "refresh-registry",
  "fact-registry",
  "refresh-facts",
  "fact-corrections",
  "refresh-availability",
  "availability-corrections",
  "feature-registry",
  "refresh-features",
  "feature-corrections",
  "summaries",
  "retained",
  "price",
  "regrade",
  "prepare",
  "apply",
])
  test(`fresh snapshot propagates ${stage} failure without returning partial results`, () => {
    const f = fixture(stage);
    assert.throws(
      () => f.loaded.catalogueSnapshot(),
      new RegExp(`Guard failure: ${stage}`),
    );
    assert.equal(f.events.at(-1), stage);
  });

test("catalogue application independently rejects drift after research preparation", () => {
  const f = fixture("prepared-source-drift");
  assert.throws(() => f.loaded.catalogueSnapshot(), /source snapshot changed/);
  assert.equal(f.events.at(-1), "apply");
});

test("counts reuses supplied data and observes later caller-owned changes", () => {
  const f = fixture();
  const snapshot = f.loaded.catalogueSnapshot();
  assert.deepEqual(f.loaded.counts(snapshot), {
    variants: 1,
    families: 1,
    generations: 1,
    criteria: 0,
    evidence: 0,
    current: 1,
    outgoing: 0,
    provisional: 0,
  });
  assert.equal(f.reads(), 1);
  snapshot.cars[0].availability = "outgoing";
  assert.equal(f.loaded.counts(snapshot).outgoing, 1);
  assert.equal(f.loaded.counts(snapshot).current, 0);
  assert.equal(f.reads(), 1);
  assert.equal(f.loaded.counts().current, 1);
  assert.equal(f.reads(), 2);
});

test("report loading uses one fresh snapshot or the exact supplied data without rehydration", () => {
  const f = fixture();
  const seen: { car: Car; data: Research }[] = [];
  const overrides: Record<string, unknown> = {
    "../../src/lib/data": {
      catalogueSnapshot: f.loaded.catalogueSnapshot,
      effectiveFeatures: (car: Car, data: Research) => {
        seen.push({ car, data });
        return [];
      },
    },
    "../../src/lib/market-inventory-data": {},
    "./m1-reconciliation": {
      combineM1Reconciliations: () => ({ fixture: true }),
    },
  };
  const source = fs.readFileSync("scripts/reporting/load.ts", "utf8");
  for (const match of source.matchAll(/from\s+"([^\"]+\.json)"/g))
    overrides[match[1]] = {};
  const { loadReportInput } = compiledSource(
    "scripts/reporting/load.ts",
    overrides,
  ) as {
    loadReportInput(snapshot?: CatalogueSnapshot): {
      cars: Car[];
      sources: Research["sources"];
      features: unknown[];
    };
  };
  const first = loadReportInput();
  assert.equal(f.reads(), 1);
  const supplied = f.loaded.catalogueSnapshot();
  const second = loadReportInput(supplied);
  assert.equal(f.reads(), 2);
  assert.deepEqual(second, first);
  assert.equal(second.cars, supplied.cars);
  assert.equal(second.sources, supplied.data.sources);
  assert.equal(seen.at(-1)!.data, supplied.data);
  assert.equal(seen.at(-1)!.car, supplied.cars[0]);
});

for (const malformed of [false, true])
  test(`validation ${malformed ? "rejects malformed issues before packs" : "reuses the exact validated snapshot for packs and counts"}`, (t) => {
    const f = fixture();
    const snapshot = f.loaded.catalogueSnapshot();
    if (malformed)
      snapshot.cars[0].facts.range_km.issues = [
        null,
      ] as unknown as Car["issues"];
    let loads = 0,
      packs = 0,
      countCalls = 0;
    const output: string[] = [];
    const errors: string[] = [];
    t.mock.method(console, "log", (value: string) => output.push(value));
    t.mock.method(console, "error", (value: string) => errors.push(value));
    t.mock.method(process, "exit", (code: number) => {
      throw new Error(`Validation exit ${code}`);
    });
    const run = () =>
      compiledSource("scripts/validate.ts", {
        "../src/lib/data": {
          catalogueSnapshot: () => {
            loads++;
            return snapshot;
          },
          counts: (supplied: CatalogueSnapshot) => {
            countCalls++;
            assert.equal(supplied, snapshot);
            return f.loaded.counts(supplied);
          },
          pack: (_id: string, supplied: CatalogueSnapshot) => {
            packs++;
            assert.equal(supplied, snapshot);
            return { features: [] };
          },
        },
        "../src/lib/validate": {
          validateResearch: (data: Research) => {
            assert.equal(data, snapshot.data);
            return [];
          },
        },
        "node:fs": {
          readFileSync: (file: string) =>
            file === "media/approved-assets.json"
              ? "[]"
              : Buffer.from("same original evidence"),
        },
      });
    if (malformed) {
      assert.throws(run, /Validation exit 1/);
      assert(errors.some((message) => /issue/i.test(message)));
      assert.equal(packs, 0);
      assert.equal(countCalls, 0);
      assert.equal(output.length, 0);
    } else {
      run();
      assert.equal(packs, snapshot.cars.length);
      assert.equal(countCalls, 1);
      assert.equal(JSON.parse(output[0]).result, "PASS");
      assert.equal(errors.length, 0);
    }
    assert.equal(loads, 1);
    assert.equal(f.reads(), 1);
  });
