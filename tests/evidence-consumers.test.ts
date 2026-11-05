import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { compiledSource, applicationRequire } from "./helpers/compiled-source";
import type { Car, Feature, Research, Source, Pack } from "../src/lib/types";
import type { CatalogueSnapshot, EvidenceConsumerDefaults } from "../src/lib/evidence-consumers";

type Consumers = {
  sourceEffectiveFeatures(car: Car, data?: Research): Feature[];
  effectiveFeatures(car: Car, data?: Research): Feature[];
  pack(id: string, snapshot?: CatalogueSnapshot): Pack;
};
type BoundaryModule = {
  createEvidenceConsumers(defaults: EvidenceConsumerDefaults): Consumers;
  readableValue(value: unknown): string;
  effectiveFeaturesFromRows(car: Car, data: Research, rows: Feature[]): Feature[];
};
const beforePath = "tests/fixtures/evidence-consumers/data-before.ts.txt";
const beforeText = fs.readFileSync(beforePath, "utf8");
// This retained program is a behavioural differential oracle, not a checkpoint-only pin.
assert.equal(createHash("sha256").update(beforeText).digest("hex"),
  "5298772968b4c7e671bad630726d39f615e2e49a3aa07ecf5b629ee5c502ee24");
const ts = applicationRequire("typescript") as typeof import("typescript");
const beforeOutput = ts.transpileModule(beforeText, {
  fileName: "src/lib/data.ts",
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
function compileBefore(overrides: Record<string, unknown>) {
  const filename = path.join(process.cwd(), "src/lib/data.ts");
  const scopedRequire = createRequire(filename);
  const compiledModule = { exports: {} as Record<string, unknown> };
  const load = (id: string) => Object.hasOwn(overrides, id) ? overrides[id] : scopedRequire(id);
  const run = vm.runInThisContext(`(function(require,module,exports){${beforeOutput}\n})`,
    { filename: beforePath }) as (requireFn: typeof load, moduleValue: typeof compiledModule,
      exports: Record<string, unknown>) => void;
  run(load, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
function fixture() {
  const id = "fixture_model__base__1";
  const sources: Source[] = ["fact", "feature", "warning", "context", "event"].map((key) => ({
    id: key, url: `https://maker.example/${key}`, title: key, publisher: "Maker",
    source_type: "manufacturer", published_date: null, accessed_date: "2026-10-14",
    market: "AU", supports: key,
  }));
  const car: Car = {
    id, modelId: "fixture_model", family: "fixture-model", slug: "base-1",
    brand: "Maker", model: "Example", trim: "Base", generation: "Current",
    year: null, availability: "current_or_order_listed", drive: "RWD", buyerGradesRequired: true,
    configurationEvidence: { rankingEligible: false, completeVehicleCountEligible: false,
      projectionScope: "Live configuration", sourceIds: ["context"] },
    facts: { range_km: { key: "range_km", label: "Range", value: 450, unit: "km", basis: "WLTP",
      comparisonBasis: "WLTP", status: "standard", sourceIds: ["fact"], date: "2026-10-14",
      market: "AU", scope: "Exact trim", qualifications: [], issues: [] } },
    issues: [],
  };
  const feature = (criterion: string, value: string): Feature => ({
    variant_id: id, model_id: car.modelId, criterion, value, status: "standard",
    conditions: "Original qualification.", source_ids: ["feature"], evidence_scope: "Exact trim",
    last_evidence_date: "2026-10-14", reviewed_date: "2026-10-14", verification_state: "verified",
  });
  const data: Research = {
    schema_version: "fixture",
    metadata: { as_of: "2026-10-14", baseline_variant_id: id, record_count: 1, criterion_count: 3, feature_row_count: 3 },
    criteria: ["range", "buyer", "software"].map((key) => ({ key, label: key, group: "Fixture", definition: key })),
    models: [{ id: car.modelId, brand: car.brand, model: car.model, generation: car.generation }],
    variants: [{ id, model_id: car.modelId, brand: car.brand, model: car.model, trim: car.trim,
      model_year: null, record_state: "current_or_order_listed", price_aud: null, price_basis: "",
      range_km: 450, range_cycle: "WLTP", seats: 5, source_ids: ["fact"], notes: [], variant_review_date: "2026-10-14" }],
    feature_evidence_variant_context: [{ id, model_id: car.modelId, record_state: "announced_provisional",
      configuration_evidence: { rankingEligible: false, completeVehicleCountEligible: false,
        projectionScope: "Historical configuration", sourceIds: ["context"] } }],
    trim_equipment: [],
    feature_evidence: [feature("range", "Original range"), feature("buyer", "Written for buyers"), feature("software", "Original software")],
    update_eligibility: [{ variant_id: id, model_id: car.modelId, documented_family_minimum: 3,
      exact_total_known: false, exact_total: null, scope: "Original eligibility", meaning: "Documented families",
      source_ids: ["event"], observation_window_start: "2026-01-01", observation_window_end: "2026-10-14" }],
    update_events: [{ event_id: "event-1", model_ids: [car.modelId], version: "ModelY", family_id: "family",
      release_date: "2026-10-14", date_basis: "", delivery_method: "OTA", category: "map",
      changes: ["AndroidAuto", "ComfortDriving"], source_ids: ["event"],
      notes: "Owner thread counted two families. Driver improvement.", market: "AU",
      verification: "manufacturer navigation notice", variant_review_state: "reviewed", count_in_headline: true, unit: "family" }],
    configuration_history: [{ model_id: car.modelId, change: "Original", old: "A", new: "B", type: "hardware", source_ids: ["context"] }],
    sources,
    publication_issues: [{ issue_id: "V2-06", title: "Provisional", priority: "high", model_ids: ["all"], publication_action: "Historical warning.", source_ids: ["warning"] }],
    prior_update_summary: [],
  };
  return { data, cars: [car] };
}
function pair(failAt?: string) {
  const snapshot = fixture();
  const events: string[] = [];
  const stage = (name: string) => { events.push(name); if (failAt === name) throw new Error(`Fixture failure: ${name}`); };
  const emptyOverlay = {
    features: [] as Partial<Feature>[], facts: [], sources: [], criteria: [] as { key: string }[],
    issues: [], eligibility: [] as { variant_id: string; scope: string }[],
    configuration: [] as { change: string }[], basis: {},
  };
  const overrides: Record<string, unknown> = {
    react: { cache: (fn: unknown) => fn },
    "./brand-update-registry": { brandUpdatePackets: [] },
    "./brand-updates": {
      applyBrandFeatureUpdates: (_car: Car, rows: Feature[]) => { stage("packet"); return rows; },
      applyBrandTermFeatures: (_car: Car, rows: Feature[]) => { stage("terms"); return rows; },
    },
    "./evidence-regrading": { applyFeatureRegrading: (_car: Car, rows: Feature[]) => { stage("regrade"); return rows; } },
    "./research-refresh": { refreshFeatures: (rows: Feature[]) => { stage("refresh"); return rows; } },
    "./feature-corrections": {
      validateFeatureCorrectionRegistry: () => stage("registry"),
      applyFeatureCorrections: (rows: Feature[]) => { stage("corrections"); return rows; },
    },
    "./launch-evidence": { auditedFeature: (row: Feature) => { stage("audit"); return row; } },
    "./retained-fact-fills": {}, "./price-ladder": {},
    "./catalogue-additions": { catalogueAdditions: { ...emptyOverlay, variants: [], models: [] } },
    "./buyer-proposal": { buyerProposal: {} }, "./selling-points": {},
  };
  for (const name of ["refinement", "usability", "sales", "completion", "editorial", "buyer"]) {
    const overlay = structuredClone(emptyOverlay);
    if (["refinement", "usability", "completion"].includes(name)) overlay.features = [
      { variant_id: snapshot.cars[0].id, criterion: "range", value: `${name} first` },
      { variant_id: snapshot.cars[0].id, criterion: "range", value: `${name} duplicate` },
    ];
    if (name === "buyer") overlay.criteria = [{ key: "buyer" }];
    if (name === "editorial") {
      overlay.eligibility = [{ variant_id: snapshot.cars[0].id, scope: "Editorial eligibility" }];
      overlay.configuration = [{ change: "Editorial configuration" }];
    }
    overrides[`../../data/research-${name}-2026-10-${["completion", "editorial", "buyer"].includes(name) ? "07" : "06"}.json`] = overlay;
  }
  for (const name of ["approved-feature-corrections", "approved-availability-corrections", "approved-corrections", "research-refresh-2026-10-10"])
    overrides[`../../data/${name}.json`] = [];
  const defaults: EvidenceConsumerDefaults = {
    sourceResearch: () => { stage("sourceResearch"); return snapshot.data; },
    research: () => { stage("research"); return snapshot.data; },
    catalogue: () => { stage("catalogue"); return snapshot.cars; },
  };
  const before = compileBefore(overrides);
  Object.assign(before, defaults);
  const boundary = compiledSource("src/lib/evidence-consumers.ts", overrides) as BoundaryModule;
  const after = boundary.createEvidenceConsumers(defaults);
  assert.deepEqual<string[]>(events, [], "Binding defaults must not call them");
  return {
    before: before as unknown as Consumers & { readableValue: BoundaryModule["readableValue"] },
    after: { ...after, readableValue: boundary.readableValue }, boundary, snapshot, events, defaults, overrides,
  };
}
function outcome(call: () => unknown) {
  try { return { value: call() }; }
  catch (error) { assert(error instanceof Error); return { error: { name: error.name, message: error.message } }; }
}
function parity(f: ReturnType<typeof pair>, call: (consumer: Consumers) => unknown) {
  f.events.length = 0;
  const before = outcome(() => call(f.before));
  const events = [...f.events];
  f.events.length = 0;
  const after = outcome(() => call(f.after));
  assert.deepEqual(after, before);
  assert.deepEqual(f.events, events);
  return after;
}

test("moved consumers preserve complete output, property order, references and input immutability", () => {
  const f = pair();
  const untouched = JSON.stringify(f.snapshot);
  const before = f.before.pack(f.snapshot.cars[0].id, f.snapshot);
  const after = f.after.pack(f.snapshot.cars[0].id, f.snapshot);
  assert.equal(JSON.stringify(after), JSON.stringify(before));
  assert.equal(after.car, f.snapshot.cars[0]);
  assert.equal(after.features[1], f.snapshot.data.feature_evidence[1]);
  assert(after.sources.every((source) => f.snapshot.data.sources.includes(source)));
  assert.notEqual(after.eligibility, f.snapshot.data.update_eligibility[0]);
  assert.equal(after.features[0].value, "completion first");
  assert.match(after.features[2].conditions, /Historical warning/);
  assert.deepEqual(after.events[0].changes, ["Android Auto", "Comfort Driving"]);
  assert.equal(after.events[0].notes, "Driver improvement.");
  assert.equal(after.eligibility.scope, "Editorial eligibility");
  assert.equal(after.configuration[0].change, "Editorial configuration");
  assert.equal(JSON.stringify(f.snapshot), untouched);
});

test("export names, arities and readable values match the pre-refactor functions", () => {
  const f = pair();
  for (const [name, arity] of [["sourceEffectiveFeatures", 1], ["effectiveFeatures", 1], ["pack", 2]] as const) {
    assert.equal(f.after[name].name, f.before[name].name);
    assert.equal(f.after[name].name, name);
    assert.equal(f.after[name].length, f.before[name].length);
    assert.equal(f.after[name].length, arity);
  }
  for (const value of [null, undefined, true, false, 0, "Text", ["A", null], { nested_key: [true, 4] }])
    assert.equal(f.after.readableValue(value), f.before.readableValue(value));
});

test("default callbacks retain exact invocation and guard order", () => {
  const f = pair();
  const car = f.snapshot.cars[0];
  parity(f, (c) => c.pack(car.id));
  assert.deepEqual(f.events, ["research", "catalogue", "audit", "audit", "audit", "registry", "refresh", "corrections", "regrade", "packet", "terms"]);
  parity(f, (c) => c.sourceEffectiveFeatures(car));
  assert.equal(f.events[0], "sourceResearch");
  parity(f, (c) => c.effectiveFeatures(car, undefined));
  assert.equal(f.events[0], "research");
});

test("explicit snapshots and research never invoke throwing fallback callbacks", () => {
  const f = pair();
  const unexpected = () => { throw new Error("Unexpected default loader"); };
  const explicit = f.boundary.createEvidenceConsumers({ sourceResearch: unexpected, research: unexpected, catalogue: unexpected });
  Object.assign(f.before, { sourceResearch: unexpected, research: unexpected, catalogue: unexpected });
  assert.deepEqual(explicit.sourceEffectiveFeatures(f.snapshot.cars[0], f.snapshot.data), f.before.sourceEffectiveFeatures(f.snapshot.cars[0], f.snapshot.data));
  assert.deepEqual(explicit.effectiveFeatures(f.snapshot.cars[0], f.snapshot.data), f.before.effectiveFeatures(f.snapshot.cars[0], f.snapshot.data));
  assert.deepEqual(explicit.pack(f.snapshot.cars[0].id, f.snapshot), f.before.pack(f.snapshot.cars[0].id, f.snapshot));
});

test("unknown IDs, null data and partial snapshots retain fallback and exception order", () => {
  const f = pair();
  parity(f, (c) => c.pack("missing", f.snapshot));
  assert.deepEqual(f.events, []);
  for (const snapshot of [undefined, null, {}, { data: f.snapshot.data }, { cars: f.snapshot.cars }, { data: null, cars: f.snapshot.cars }])
    parity(f, (c) => c.pack(f.snapshot.cars[0].id, snapshot as CatalogueSnapshot | undefined));
  for (const name of ["sourceEffectiveFeatures", "effectiveFeatures"] as const)
    parity(f, (c) => c[name](f.snapshot.cars[0], null as unknown as Research));
});

for (const stage of ["sourceResearch", "research", "catalogue", "audit", "registry", "refresh", "corrections", "regrade", "packet", "terms"])
  test(`moved consumers preserve the first ${stage} failure`, () => {
    const f = pair(stage);
    const result = parity(f, (c) => stage === "sourceResearch" ? c.sourceEffectiveFeatures(f.snapshot.cars[0]) : c.pack(f.snapshot.cars[0].id));
    assert.deepEqual(result, { error: { name: "Error", message: `Fixture failure: ${stage}` } });
    assert.equal(f.events.at(-1), stage);
  });

test("mutable explicit research is reread and Tier 1 guards remain marker-dependent", () => {
  const f = pair();
  const car = f.snapshot.cars[0];
  const prior = f.after.effectiveFeatures(car, f.snapshot.data);
  f.snapshot.data.feature_evidence[2] = { ...f.snapshot.data.feature_evidence[2], value: "Changed source row" };
  parity(f, (c) => c.effectiveFeatures(car, f.snapshot.data));
  assert.equal(f.after.effectiveFeatures(car, f.snapshot.data)[2].value, "Changed source row");
  assert.equal(prior[2].value, "Original software");
  const sourceCar = { ...car };
  delete sourceCar.buyerGradesRequired;
  parity(f, (c) => c.effectiveFeatures(sourceCar, f.snapshot.data));
  assert(!f.events.includes("packet"));
  assert.equal(f.events.at(-1), "terms");
});

test("pack retains source guard precedence and URL sanitization/reference behavior", () => {
  for (const missing of ["context", "fact", "feature"]) {
    const f = pair();
    f.snapshot.data.sources = f.snapshot.data.sources.filter((row) => row.id !== missing);
    const result = parity(f, (c) => c.pack(f.snapshot.cars[0].id, f.snapshot));
    assert.deepEqual(result, { error: { name: "Error", message: `${missing === "context" ? "Configuration" : "Pack"} evidence references missing source ${missing}` } });
  }
  const f = pair();
  f.snapshot.data.sources[0].url = "javascript:alert(1)";
  parity(f, (c) => c.pack(f.snapshot.cars[0].id, f.snapshot));
  const packed = f.after.pack(f.snapshot.cars[0].id, f.snapshot);
  assert.equal(packed.sources.find((row) => row.id === "fact")!.url, "");
  assert.notEqual(packed.sources.find((row) => row.id === "fact"), f.snapshot.data.sources[0]);
  assert.equal(f.snapshot.data.sources[0].url, "javascript:alert(1)");
});


test("public sourceCatalogue calls the single imported row helper without consumer defaults", () => {
  const f = pair();
  const sharedRows: Feature[][] = [];
  const unexpected = () => { throw new Error("Source catalogue called a consumer default"); };
  let bound: Consumers | undefined;
  const boundary = {
    ...f.boundary,
    effectiveFeaturesFromRows: (car: Car, data: Research, rows: Feature[]) => {
      assert.equal(data, f.snapshot.data);
      sharedRows.push(rows);
      return f.boundary.effectiveFeaturesFromRows(car, data, rows);
    },
    createEvidenceConsumers: () => {
      bound = f.boundary.createEvidenceConsumers({ sourceResearch: unexpected, research: unexpected, catalogue: unexpected });
      return bound;
    },
  };
  const current = compiledSource("src/lib/data.ts", {
    ...f.overrides,
    "./evidence-consumers": boundary,
    "./research-refresh": {
      ...(f.overrides["./research-refresh"] as object),
      refreshFacts: (_id: string, facts: Car["facts"]) => facts,
      refreshAvailability: (cars: Car[]) => cars,
    },
    "./launch-evidence": {
      ...(f.overrides["./launch-evidence"] as object),
      auditedFact: (fact: Car["facts"][string]) => fact,
    },
    "./selling-points": { buildBuyerSummaries: () => new Map() },
  }) as unknown as Consumers & { sourceResearch(): Research; sourceCatalogue(): Car[] };
  current.sourceResearch = () => f.snapshot.data;
  assert.equal(current.sourceCatalogue().length, 1);
  assert.equal(sharedRows.length, 1);
  assert.deepEqual(sharedRows[0], f.snapshot.data.feature_evidence);
  assert.equal(current.pack, bound!.pack);
  assert.equal(current.effectiveFeatures, bound!.effectiveFeatures);
  assert.equal(current.sourceEffectiveFeatures, bound!.sourceEffectiveFeatures);
});
