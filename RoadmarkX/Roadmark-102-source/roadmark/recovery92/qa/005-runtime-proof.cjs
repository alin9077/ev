/* ROOT-EXECUTABLE CANDIDATE. Not run during preparation.
 * Ordinary React/tsx accessors, one shared snapshot for every main-phase pack.
 * The short accessors phase runs pickerCatalogue, counts and llms in a separate process.
 */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createHash } = require("node:crypto");
const { createRequire } = require("node:module");
const cfg = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const mode = process.argv[3];
assert.ok(["accessors", "main"].includes(mode));
const root = cfg.appRoot;
const output = cfg.proofOutput;
assert.equal(process.cwd(), root);
const appRequire = createRequire(path.join(root, "package.json"));
appRequire("tsx/cjs");
const load = (name) => appRequire(path.join(root, name));
const hash = (value) => createHash("sha256").update(value).digest("hex");
const json = (value) => JSON.stringify(value);
const normal = (value) => JSON.parse(json(value));
const shaJson = (value) => hash(json(value));
const write = (name, value) => fs.writeFileSync(path.join(output, name), json(value) + "\n");
const collect = () => { if (global.gc) global.gc(); };
const assertSame = (a, b, reason) => (a === undefined || b === undefined)
  ? assert.equal(a, b, reason) : assert.deepStrictEqual(normal(a), normal(b), reason);
const SOURCE_ID = "r10_surron_hp_s01_importer_my26";
const SOURCE_URL = "https://ridesurron.com.au/2026-surron-ultra-bee-hp/";
const TITLE = "2026 Surron Ultra Bee HP";
const RAW_TITLE = "Surron Light Bee X (MY25) | Electric Dirt Bike";
const NOTE = "Title follows the captured page heading. The publisher’s captured title metadata says “Surron Light Bee X (MY25) | Electric Dirt Bike”.";
const CARBON = "surron_ultra_bee_hp_t_carbon_black_ebmx_19851__20261010";
const BROWN = "surron_ultra_bee_hp_t_desert_brown_ebmx_19852__20261010";
const HELD_R = "surron_ultra_bee_hp_r_carbon_black_ebmx_19849__20261010";
const policy = { asOf: cfg.policyDate, maxAgeDays: 30 };
const inputText = () => fs.readFileSync(path.join(output, "embedded-data.json"), "utf8");
const stat = { startedAtUTC: new Date().toISOString(), mode };

function compileSource(source, filename, overrides = {}, documentValue) {
  const ts = appRequire("typescript");
  const compiled = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    reportDiagnostics: true,
  });
  assert.ok(!compiled.diagnostics?.some(d => d.category === ts.DiagnosticCategory.Error), "Transpile errors");
  const scoped = createRequire(filename);
  const instance = { exports: {} };
  const fn = vm.runInThisContext(`(function(require,module,exports,document){${compiled.outputText}\n})`, { filename });
  fn(id => Object.hasOwn(overrides, id) ? overrides[id] : scoped(id), instance, instance.exports, documentValue);
  return instance.exports;
}

function executeCJS(code, filename, documentValue) {
  const instance = { exports: {} };
  const fn = vm.runInThisContext(`(function(require,module,exports,document){${code}\n})`, { filename });
  fn(createRequire(filename), instance, instance.exports, documentValue);
  return instance.exports;
}

function checkShape(left, right, label) {
  // Compare ordinary JSON own-key sets, prototypes, and data descriptors as
  // well as values. Hydration appends feature identity keys, so key insertion
  // order is intentionally not treated as a factual delta.
  let containers = 0;
  const walk = (a, b) => {
    if (a === null || typeof a !== "object") { assert.equal(a, b, label); return; }
    assert.ok(b && typeof b === "object", label);
    assert.equal(Object.getPrototypeOf(a), Object.getPrototypeOf(b), label);
    const ak = Reflect.ownKeys(a), bk = Reflect.ownKeys(b);
    assert.ok(ak.every(k => typeof k === "string") && bk.every(k => typeof k === "string"), label);
    assert.deepStrictEqual([...ak].sort(), [...bk].sort(), label);
    for (const key of ak) {
      const ad = Object.getOwnPropertyDescriptor(a, key), bd = Object.getOwnPropertyDescriptor(b, key);
      assert.ok(Object.hasOwn(ad, "value") && Object.hasOwn(bd, "value"), label);
      assert.deepStrictEqual([ad.enumerable, ad.configurable, ad.writable], [bd.enumerable, bd.configurable, bd.writable], label);
      walk(ad.value, bd.value);
    }
    containers++;
  };
  walk(left, right);
  return containers;
}

function compareCitationDelta(actual, previous, location) {
  // Remove only the separately checked two presentation properties. Every other
  // field (including raw title, URLs, dates, claim text and all numeric values)
  // must compare to the immutable91 citable implementation.
  let count = 0;
  const strip = (value) => {
    if (Array.isArray(value)) return value.map(strip);
    if (!value || typeof value !== "object") return value;
    const result = {};
    const hasTitle = Object.hasOwn(value, "displayTitle");
    const hasNote = Object.hasOwn(value, "displayTitleNote");
    if (hasTitle || hasNote) {
      assert.ok(hasTitle && hasNote, location + ": partial presentation override");
      assert.equal(value.id, SOURCE_ID, location);
      assert.equal(value.url, SOURCE_URL, location);
      assert.equal(value.title, RAW_TITLE, location);
      assert.equal(value.displayTitle, TITLE, location);
      assert.equal(value.displayTitleNote, NOTE, location);
      count++;
    }
    for (const [key, child] of Object.entries(value))
      if (key !== "displayTitle" && key !== "displayTitleNote") result[key] = strip(child);
    return result;
  };
  assertSame(strip(actual), previous, location);
  return count;
}

function* leaves(value, parts = []) {
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) yield* leaves(child, [...parts, key]);
  } else yield parts;
}
function change(value) {
  if (typeof value === "string") return value + " [unreviewed]";
  if (typeof value === "number") return value + 1;
  if (typeof value === "boolean") return !value;
  if (value === null || value === undefined) return "unreviewed";
  if (Array.isArray(value)) return [...value, "unreviewed"];
  return { ...value, unreviewed: true };
}
function edit(original, parts, remove = false) {
  const copy = structuredClone(original);
  let cursor = copy;
  for (const key of parts.slice(0, -1)) cursor = cursor[key];
  const key = parts.at(-1);
  if (remove) delete cursor[key]; else cursor[key] = change(cursor[key]);
  return copy;
}
function* mutations(source) {
  yield { ...source, unreviewed: true };
  yield { ...source, publication_hold: true };
  yield { ...source, conflict: "unreviewed" };
  yield { ...source, access_limitation: "unreviewed" };
  yield Object.fromEntries(Object.entries(source).reverse());
  for (const key of Object.keys(source)) {
    yield edit(source, [key]);
    yield edit(source, [key], true);
  }
  for (const parts of leaves(source)) yield edit(source, parts);
}

async function accessors() {
  const api = load("src/lib/data.ts");
  const { parsePortableData } = load("src/lib/portable-string-codec.ts");
  let data = parsePortableData(inputText());
  const expected = { picker: shaJson(data.cars), counts: data.counts };
  data = undefined;
  collect();
  // Each is the actual public accessor with ordinary React, without injection.
  let picker = api.pickerCatalogue();
  assert.equal(picker.length, 343);
  assert.equal(shaJson(picker), expected.picker, "Actual pickerCatalogue differs from immutable91 emitted projection");
  picker = undefined;
  collect();
  const counts = api.counts();
  assert.deepStrictEqual(counts, expected.counts, "Actual counts differs from immutable91 emitted counts");
  collect();
  const llms = load("src/app/llms.txt/route.ts");
  const llmsBody = await llms.GET().text();
  assert.equal(fs.readFileSync(path.join(root, ".next/server/app/llms.txt.body"), "utf8"), llmsBody);
  write("accessor-result.json", { passed: true, ordinaryReact: true, additionalCatalogueConstructions: 3,
    llmsBodySHA256: hash(llmsBody), actualLlmsRouteBodyExact: true,
    pickerCatalogueSHA256: expected.picker, counts, elapsedSeconds: (Date.now() - Date.parse(stat.startedAtUTC)) / 1000 });
}

async function main() {
  const { build } = appRequire("esbuild");
  // Match scripts/build-portable.ts options literally; pinned source gate also
  // ensures that recipe has not changed. This rebuild writes no app files.
  const alias = {
    "next/link": path.join(root, "src/portable/link.tsx"),
    "next/image": path.join(root, "src/portable/image.tsx"),
    "next/navigation": path.join(root, "src/portable/navigation.ts"),
    "@/lib/data": path.join(root, "src/portable/data.ts"),
    "@/lib/market-inventory-data": path.join(root, "src/portable/market-inventory-data.ts"),
    "@/lib/chapter-art-src": path.join(root, "src/portable/chapter-art-src.ts"),
  };
  let rebuilt = await build({ absWorkingDir: root, entryPoints: ["src/portable/entry.tsx"],
    bundle: true, minify: true, write: false, format: "iife", platform: "browser", target: ["es2022"],
    define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_SITE_URL": '""' },
    alias, metafile: true });
  const emitted = fs.readFileSync(path.join(output, "emitted-javascript.txt"), "utf8");
  assert.equal(rebuilt.outputFiles[0].text.replaceAll("</script", "<\\/script"), emitted, "Actual emitted JavaScript is not a rebuild of frozen source");
  const graph = Object.keys(rebuilt.metafile.inputs);
  for (const prohibited of ["src/lib/data.ts", "src/lib/catalogue-additions.ts", "src/lib/buyer-proposal.ts", "src/lib/report-review-proposal.ts", "data/market-inventory-2026-10-10.json", "data/buyer-identity-snapshots-2026-10-10.json"])
    assert.ok(!graph.includes(prohibited), "Server-only input entered portable JavaScript: " + prohibited);
  assert.ok(graph.includes("src/lib/source-presentation.ts"));
  assert.ok(graph.includes("data/source-citation-label-92.json"));
  const jsHash = hash(emitted);
  write("portable-bundle-inputs.json", rebuilt.metafile);
  rebuilt = undefined;
  collect();
  const portableBuild = await build({ absWorkingDir: root, stdin: {
    contents: 'export * from "./src/portable/data.ts"; export {default as defaultMarket} from "./src/portable/market-inventory-data.ts";',
    sourcefile: "proof-portable-accessors.ts", resolveDir: root, loader: "ts" }, bundle: true,
    minify: false, write: false, format: "cjs", platform: "node", target: ["node22"], metafile: true });
  assert.ok(!Object.keys(portableBuild.metafile.inputs).includes("src/lib/data.ts"));
  let encoded = inputText();
  const portable = executeCJS(portableBuild.outputFiles[0].text, path.join(root, "portable-proof-runtime.cjs"), {
    getElementById(id) { assert.equal(id, "ev-data"); return { textContent: encoded }; },
  });
  encoded = undefined;
  collect();
  const actual = load("src/lib/data.ts");
  const research = actual.research();
  const cars = actual.catalogue();
  const snapshot = { data: research, cars };
  const portableCars = portable.catalogue();
  const portableResearch = portable.research();
  const portableSources = new Map(portableResearch.sources.map(s => [s.id, s]));
  const actualSources = new Map(research.sources.map(s => [s.id, s]));
  assert.equal(cars.length, 343);
  assert.equal(portableCars.length, 343);
  assert.equal(new Set(cars.map(c => c.id)).size, 343);
  assert.equal(research.sources.length, 2196);
  assert.equal(actualSources.size, 2196);
  assert.equal(portableSources.size, 2196);
  assertSame(portableResearch, { sources: research.sources, criteria: research.criteria,
    publication_issues: research.publication_issues, trim_equipment: research.trim_equipment });
  assertSame(portable.marketInventory, load("src/lib/market-inventory-data.ts").default);
  assert.equal(portable.defaultMarket, portable.marketInventory, "Portable market default lost shared-object identity");
  const art = Object.fromEntries(fs.readdirSync(path.join(root, "public/media/chapters"))
    .filter(n => n.endsWith(".svg")).map(n => [path.basename(n, ".svg"),
      "data:image/svg+xml;base64," + fs.readFileSync(path.join(root, "public/media/chapters", n)).toString("base64")]));
  assert.deepStrictEqual(portable.art(), art);
  const citable = load("src/lib/citable.ts");
  const previousCitable = compileSource(fs.readFileSync(path.join(output, "baseline-citable.ts"), "utf8"), path.join(root, "src/lib/citable.ts"));
  const presentation = load("src/lib/source-presentation.ts");
  const correction = load("data/source-citation-label-92.json");
  assert.equal(correction.sourceId, SOURCE_ID);
  assert.equal(correction.url, SOURCE_URL);
  assert.equal(correction.displayTitle, TITLE);
  assert.equal(correction.displayNote, NOTE);
  assert.equal(json(correction.expectedSource), json(actualSources.get(SOURCE_ID)));
  assert.equal(json(portableSources.get(SOURCE_ID)), json(correction.expectedSource));
  assert.equal(actualSources.get(SOURCE_ID).title, RAW_TITLE);
  let labelledSources = 0;
  for (const source of research.sources) {
    const expected = source.id === SOURCE_ID ? { title: TITLE, note: NOTE } : { title: source.title };
    assert.deepStrictEqual(presentation.sourcePresentation(source), expected);
    if (source.id === SOURCE_ID) labelledSources++;
  }
  assert.equal(labelledSources, 1);
  const sourceHashesBefore = research.sources.map(s => shaJson(s));
  const carHashesBefore = cars.map(c => shaJson(c));
  const correctionBefore = shaJson(correction);
  const binding = load("src/lib/report-claim-binding.ts");
  const drafts = load("src/lib/device-issue-drafts.ts");
  const { canonicalReviewedJson } = load("src/lib/correction-guards.ts");
  const { featureReportClaim } = load("src/lib/corrections.ts");
  const { availabilityReportClaim } = load("src/lib/availability-corrections.ts");
  const { validReportFact } = load("src/lib/report-claim-shape.ts");
  const digest = async text => hash(text);
  const id = "00000000-0000-4000-8000-000000000092";
  const now = cfg.policyDate + "T12:00:00.000Z";
  const counters = { packs: 0, canonicalSourceReferences: 0, completeClaims: 0, citableClaims: 0,
    targetPresentationCitations: 0, maximumStoredReportBytes: 0, maximumDeviceDraftBytes: 0,
    summaryCount: 0, pairedSummaries: 0, strengthOnlySummaries: 0, staticWithheldSummaries: 0,
    presentationMutationChecks: 0, cachedSummaryMutationChecks: 0, buildSummaryMutationChecks: 0,
    claimMutationChecks: 0, transportBodies: 0, detailStaticPages: 0, ownShapeContainersChecked: 0 };
  const selected = new Map();
  const React = appRequire("react");
  const { renderToStaticMarkup } = appRequire("react-dom/server");
  const { BuyerSummary } = load("src/components/buyer-summary.tsx");
  const CitedClaim = load("src/components/citable-report.tsx").CitedClaim;
  const { currentBuyerSummary, buildBuyerSummaries } = load("src/lib/selling-points.ts");
  const buyerProposal = load("src/lib/buyer-proposal.ts").buyerProposal;
  const escapeText = text => renderToStaticMarkup(React.createElement("span", null, text)).slice(6, -7);
  for (let index = 0; index < cars.length; index++) {
    const car = cars[index];
    const p = actual.pack(car.id, snapshot);
    const q = portable.pack(car.id);
    assert.ok(q, "Portable pack missing: " + car.id);
    assertSame(p, q, "Complete actual pack differs: " + car.id);
    counters.ownShapeContainersChecked += checkShape(normal(p), q, car.id + ": own shape");
    assertSame(car, portableCars[index], "Catalogue order/full car differs: " + car.id);
    assert.equal(p.car, car, "Snapshot car identity lost");
    assert.equal(q.car, portableCars[index], "Portable accessor car identity lost");
    assert.equal(portable.pack(car.id), q, "Portable pack accessor instability");
    for (const source of q.sources) {
      assert.equal(source, portableSources.get(source.id), "Portable source is not registry-canonical");
      counters.canonicalSourceReferences++;
    }
    for (const source of p.sources)
      if (source.url === actualSources.get(source.id).url)
        assert.equal(source, actualSources.get(source.id), "Node pack source is not registry-canonical");
    if ([CARBON, BROWN, HELD_R].includes(car.id)) selected.set(car.id, p);
    if (car.buyerSummary) {
      counters.summaryCount++;
      if (car.buyerSummary.strength && car.buyerSummary.tradeoff) counters.pairedSummaries++;
      if (car.buyerSummary.strength && !car.buyerSummary.tradeoff) counters.strengthOnlySummaries++;
      assertSame(currentBuyerSummary(car.buyerSummary, p.sources, policy),
        currentBuyerSummary(q.car.buyerSummary, q.sources, policy));
      assert.equal(renderToStaticMarkup(React.createElement(BuyerSummary, { car, sources: p.sources })), "",
        "No-JS/SSR leaked clock-dependent summary: " + car.id);
      counters.staticWithheldSummaries++;
    }
    const sourceClaims = [
      ...Object.values(car.facts),
      ...p.features.map(f => featureReportClaim(f, research.criteria.find(c => c.key === f.criterion)?.label || f.criterion)),
      availabilityReportClaim(car),
    ];
    const portableClaims = [
      ...Object.values(q.car.facts),
      ...q.features.map(f => featureReportClaim(f, research.criteria.find(c => c.key === f.criterion)?.label || f.criterion)),
      availabilityReportClaim(q.car),
    ];
    assert.equal(sourceClaims.length, portableClaims.length);
    for (let claimIndex = 0; claimIndex < sourceClaims.length; claimIndex++) {
      const fact = sourceClaims[claimIndex], portableFact = portableClaims[claimIndex];
      assert.equal(validReportFact(fact), true, car.id + ": invalid report claim " + fact.key);
      assert.equal(canonicalReviewedJson(fact), canonicalReviewedJson(portableFact));
      const context = binding.reportClaimContextKey(car.id, fact);
      assert.equal(context, binding.reportClaimContextKey(car.id, portableFact));
      const claimBinding = await binding.createClaimBinding(car.id, fact, digest);
      assert.deepStrictEqual(claimBinding, await binding.createClaimBinding(car.id, portableFact, digest));
      const prepared = await binding.prepareBoundIssueReport({ variantId: car.id, factKey: fact.key,
        description: "Review this retained claim", claimBinding }, {
        resolveClaim: (variantId, key) => variantId === car.id && key === fact.key ? { fact, vehicleLabel: citable.carName(car) } : undefined,
        digest, now: () => now, id: () => id,
      });
      assert.equal(canonicalReviewedJson(prepared.observedClaim), canonicalReviewedJson(fact));
      assert.notEqual(prepared.observedClaim, fact);
      assert.equal(prepared.status, "pending");
      assert.equal(prepared.bindingState, "matched_service_snapshot");
      const device = drafts.makeDeviceIssueDraft(car.id, portableFact, "Review this retained claim", now, id);
      assert.equal(device.deviceClaimSnapshot.provenance, "device_only_unverified");
      assert.equal(canonicalReviewedJson(device.deviceClaimSnapshot.fact), canonicalReviewedJson(fact));
      assert.notEqual(device.deviceClaimSnapshot.fact, portableFact);
      counters.maximumStoredReportBytes = Math.max(counters.maximumStoredReportBytes, Buffer.byteLength(binding.serializeBoundIssueReport(prepared)));
      counters.maximumDeviceDraftBytes = Math.max(counters.maximumDeviceDraftBytes, Buffer.byteLength(json(device)));
      const currentClaim = citable.factClaim(p, fact);
      counters.targetPresentationCitations += compareCitationDelta(currentClaim, previousCitable.factClaim(p, fact), car.id + ":" + fact.key);
      assertSame(currentClaim, citable.factClaim(q, portableFact));
      assert.equal(citable.claimText(currentClaim), previousCitable.claimText(previousCitable.factClaim(p, fact)));
      counters.completeClaims++;
      counters.citableClaims++;
    }
    for (const feature of p.features) {
      const label = research.criteria.find(c => c.key === feature.criterion)?.label || feature.criterion;
      counters.targetPresentationCitations += compareCitationDelta(citable.featureClaim(p, feature.criterion, label),
        previousCitable.featureClaim(p, feature.criterion, label), car.id + ":feature:" + feature.criterion);
    }
    const reportPath = citable.carPath(car);
    const report = citable.makeReport([p], reportPath);
    const oldReport = previousCitable.makeReport([p], reportPath);
    counters.targetPresentationCitations += compareCitationDelta(report, oldReport, car.id + ":report");
    assert.equal(citable.reportMarkdown(report), previousCitable.reportMarkdown(oldReport));
    assertSame(citable.reportSchema(report), previousCitable.reportSchema(oldReport));
    const page = path.join(root, ".next/server/app", reportPath + ".html");
    assert.ok(fs.existsSync(page), "Generated detail HTML is absent: " + reportPath);
    const visible = visibleHTML(fs.readFileSync(page, "utf8"));
    if (car.buyerSummary) {
      for (const clause of [car.buyerSummary.strength, car.buyerSummary.tradeoff].filter(Boolean)) {
        assert.ok(!visible.includes(escapeText(clause.text)), "Static page leaks full guarded buyer copy: " + car.id);
      }
    }
    counters.detailStaticPages++;
    counters.packs++;
    if (index % 32 === 31) { collect(); console.log(`Compared ${index + 1}/343 complete packs`); }
  }
  assert.equal(counters.summaryCount, 331);
  assert.equal(counters.pairedSummaries, 329);
  assert.equal(counters.strengthOnlySummaries, 2);
  assert.equal(counters.completeClaims, 54617, "Complete claim inventory changed from91");
  assert.equal(selected.get(HELD_R).car.buyerSummary, undefined, "Unrestored R strength must remain absent");
  assert.equal(selected.size, 3);
  assert.ok(counters.targetPresentationCitations > 0);
  const source = actualSources.get(SOURCE_ID);
  for (const changed of mutations(source)) {
    assert.deepStrictEqual(presentation.sourcePresentation(changed), { title: changed.title });
    for (const p of selected.values()) {
      const fact = Object.values(p.car.facts).find(f => f.sourceIds.includes(SOURCE_ID));
      assert.ok(fact);
      const changedPack = { ...p, sources: p.sources.map(s => s.id === SOURCE_ID ? changed : s) };
      const claim = citable.factClaim(changedPack, fact);
      assertSame(claim, previousCitable.factClaim(changedPack, fact));
      const citation = claim.sources.find(s => s.id === SOURCE_ID);
      if (citation) {
        assert.equal(Object.hasOwn(citation, "displayTitle"), false);
        assert.equal(Object.hasOwn(citation, "displayTitleNote"), false);
      }
    }
    counters.presentationMutationChecks++;
  }
  for (const id of [CARBON, BROWN]) {
    const p = selected.get(id), car = p.car, summary = car.buyerSummary;
    assert.equal(summary.guardSourceIds.length, 21);
    assert.equal(summary.expectedSourceSnapshots.length, 21);
    assert.equal(summary.conditions.length, 8);
    assert.deepStrictEqual(summary.conditions, car.configurationEvidence.requiredBuyerVisibleConditions);
    assert.equal(summary.tradeoff, undefined);
    assert.deepStrictEqual(summary.strength.sourceIds, [SOURCE_ID]);
    for (const key of ["rankingEligible", "completeVehicleCountEligible", "fullyClosedFactoryBuild"])
      assert.equal(car.configurationEvidence[key], false);
    for (const key of ["physicalStockVerified", "factoryOrderAcceptanceVerified", "factoryBuildSpecificationVerified", "deliveryToBuyerVerified"])
      assert.equal(car.availabilityEvidence[key], false);
    assert.equal(car.availabilityEvidence.stockStatus, "unverified");
    const isolatedSources = research.sources.filter(s => summary.guardSourceIds.includes(s.id));
    const proposal = { ...buyerProposal, records: buyerProposal.records.filter(r => r.variantId === id),
      dependencies: buyerProposal.dependencies.filter(d => d.variantId === id) };
    const buildSummary = (sources, changedCar = car, currentPolicy = policy) => buildBuyerSummaries([changedCar], [], sources, proposal, currentPolicy).get(id);
    assertSame(buildSummary(isolatedSources), summary);
    const reject = sources => {
      assert.equal(buildSummary(sources), undefined, id + ": mutated-source build guard");
      assert.equal(currentBuyerSummary(summary, sources, policy), undefined, id + ": mutated-source cached guard");
      counters.buildSummaryMutationChecks++;
      counters.cachedSummaryMutationChecks++;
    };
    for (const guarded of isolatedSources) {
      reject(isolatedSources.filter(s => s.id !== guarded.id));
      for (const changed of mutations(guarded)) reject(isolatedSources.map(s => s.id === guarded.id ? changed : s));
    }
    for (const date of ["2026-10-10", "2026-11-09"])
      assert.ok(currentBuyerSummary(summary, isolatedSources, { asOf: date, maxAgeDays: 30 })?.strength);
    for (const date of ["2026-10-09", "2026-11-10", "invalid", "2026-02-30", ""]) {
      assert.equal(currentBuyerSummary(summary, isolatedSources, { asOf: date, maxAgeDays: 30 }), undefined);
      assert.equal(buildSummary(isolatedSources, car, { asOf: date, maxAgeDays: 30 }), undefined);
      counters.cachedSummaryMutationChecks++;
      counters.buildSummaryMutationChecks++;
    }
    for (const [key, fact] of Object.entries(car.facts)) {
      for (const changedFacts of [{ ...car.facts, [key]: { ...fact, value: change(fact.value) } },
        Object.fromEntries(Object.entries(car.facts).filter(([k]) => k !== key))]) {
        assert.equal(buildSummary(isolatedSources, { ...car, facts: changedFacts }), undefined, id + ": full-fact identity");
        counters.buildSummaryMutationChecks++;
      }
    }
    for (const conditions of [[], [...summary.conditions, "unreviewed"], [...summary.conditions].reverse()]) {
      assert.equal(currentBuyerSummary({ ...summary, conditions }, isolatedSources, policy), undefined);
      counters.cachedSummaryMutationChecks++;
    }
  }
  // Field-level binding rejection on every complete Surron report claim. This
  // supplements (rather than relabels) the full frozen regression suite.
  for (const p of selected.values()) {
    const facts = [...Object.values(p.car.facts), ...p.features.map(f => featureReportClaim(f, f.criterion)), availabilityReportClaim(p.car)];
    for (const fact of facts) {
      const originalBinding = await binding.createClaimBinding(p.car.id, fact, digest);
      for (const key of Object.keys(fact)) {
        const changed = { ...fact, [key]: change(fact[key]) };
        const changedBinding = await binding.createClaimBinding(p.car.id, changed, digest);
        assert.notEqual(changedBinding.digest, originalBinding.digest, p.car.id + ": unbound field " + key);
        await assert.rejects(binding.prepareBoundIssueReport({ variantId: p.car.id, factKey: fact.key,
          description: "Review this retained claim", claimBinding: changedBinding }, {
          resolveClaim: () => ({ fact, vehicleLabel: citable.carName(p.car) }), digest, now: () => now, id: () => id,
        }), error => error instanceof binding.ReportBindingError && error.status === 409);
        counters.claimMutationChecks++;
      }
    }
  }
  const discovery = load("src/lib/discovery.ts");
  assert.equal(discovery.attributes.length, 7);
  const rankProjection = result => ({ ...result, groups: result.groups.map(group => ({ ...group,
    entries: group.entries.map(entry => ({ ...entry, car: entry.car.id })) })) });
  for (const attribute of discovery.attributes)
    assertSame(rankProjection(discovery.rankAttribute(cars, research.sources, attribute.key, policy)),
      rankProjection(discovery.rankAttribute(portableCars, portableResearch.sources, attribute.key, policy)), "Ranking group differs: " + attribute.key);
  const { pairPages } = load("src/lib/pair-pages.ts");
  const { BASELINE } = load("src/lib/config.ts");
  for (const pair of pairPages) {
    const route = "/compare/" + pair.slug;
    const packs = [actual.pack(BASELINE, snapshot), actual.pack(pair.rival, snapshot)];
    const currentReport = citable.makeReport(packs, route);
    const oldReport = previousCitable.makeReport(packs, route);
    assertSame(currentReport, oldReport, "Non-target static comparison report changed");
    const jsonBody = fs.readFileSync(path.join(root, ".next/server/app", route, "comparison.json.body"), "utf8");
    const mdBody = fs.readFileSync(path.join(root, ".next/server/app", route, "comparison.md.body"), "utf8");
    assert.equal(jsonBody, json({ schemaVersion: "1.0", ...currentReport }));
    assert.equal(mdBody, citable.reportMarkdown(currentReport));
    counters.transportBodies += 2;
  }
  assert.equal(pairPages.length, 9);
  assert.equal(counters.transportBodies, 18);
  const accessorResult = JSON.parse(fs.readFileSync(path.join(output, "accessor-result.json"), "utf8"));
  assert.equal(hash(fs.readFileSync(path.join(root, ".next/server/app/llms.txt.body"))), accessorResult.llmsBodySHA256);
  counters.transportBodies++;
  // Inspect emitted HTML after removing script/style contents, so an RSC/JSON
  // payload containing retained copy is not mistaken for visible no-JS output.
  const home = visibleHTML(fs.readFileSync(path.join(root, ".next/server/app/index.html"), "utf8"));
  assert.ok(home.indexOf("Tesla Model Y is the EV car of the year") >= 0);
  assert.ok(home.indexOf("Tesla Model Y is the EV car of the year") < home.indexOf('id="discover"'));
  assert.equal((home.match(/class="verdict-reason"/g) || []).length, 9);
  for (const target of ["detail-adas_optional", "chapter-07", "detail-safety_ancap", "detail-supercharger_access", "detail-boot_l", "detail-bidirectional_v2g", "detail-sentry_parked_recording", "chapter-05", "detail-pet_mode"])
    assert.ok(home.includes(`href="#${target}"`) && home.includes(`id="${target}"`), "Original hero target changed: " + target);
  // /sources awaits searchParams and is dynamic in this production build.
  // Check real emitted route evidence, then the actual component's SSR only;
  // served production /sources HTML is a separate root browser check.
  const sourcesRouteManifest = JSON.parse(fs.readFileSync(path.join(root,
    ".next/server/app/sources/page/app-paths-manifest.json"), "utf8"));
  assert.deepStrictEqual(sourcesRouteManifest, { "/sources/page": "app/sources/page.js" });
  const sourcesPageFile = path.join(root, ".next/server/app/sources/page.js");
  assert.ok(fs.statSync(sourcesPageFile).isFile());
  const prerender = JSON.parse(fs.readFileSync(path.join(root, ".next/prerender-manifest.json"), "utf8"));
  assert.ok(!Object.hasOwn(prerender.routes, "/sources"));
  assert.ok(!Object.hasOwn(prerender.dynamicRoutes, "/sources"));
  assert.equal(fs.existsSync(path.join(root, ".next/server/app/sources.html")), false);
  const SourceRegistry = load("src/components/source-registry.tsx").default;
  const registryComponentHTML = visibleHTML(renderToStaticMarkup(
    React.createElement(SourceRegistry, { sources: research.sources })));
  assert.ok(registryComponentHTML.includes(escapeText(TITLE)) && registryComponentHTML.includes(escapeText(NOTE)),
    "Actual SourceRegistry component SSR lacks reviewed label/provenance");
  for (const p of selected.values()) {
    const fact = Object.values(p.car.facts).find(f => f.sourceIds.includes(SOURCE_ID));
    const claim = citable.factClaim(p, fact);
    const html = visibleHTML(renderToStaticMarkup(React.createElement(CitedClaim, { claim })));
    assert.ok(html.includes(`${escapeText(source.publisher)}: ${escapeText(TITLE)} (AU)</a>`));
    assert.ok(html.includes(escapeText(NOTE)));
    assert.ok(html.includes(`href="${SOURCE_URL}"`));
  }
  // Immutability is checked after all positive and adversarial paths.
  assert.deepStrictEqual(research.sources.map(s => shaJson(s)), sourceHashesBefore);
  assert.deepStrictEqual(cars.map(c => shaJson(c)), carHashesBefore);
  assert.equal(shaJson(correction), correctionBefore);
  const result = { passed: true, ...counters, actualJavascriptRebuildParity: true,
    emittedJavascriptSHA256: jsHash, wholeResearchProjectionExact: true, all343ActualPacksExact: true,
    all343ActualCarsExact: true, all2196SourcesExact: true, marketInventoryExact: true, artExact: true,
    actualAccessorSourceModulesExecuted: true, browserBundleNotMounted: true,
    allSevenRankingGroupsEqual: true, citableDeltaOnlyTwoExactTargetFields: true,
    sourceObjectsAndRawTitleUnchanged: true, heldRStrengthAbsent: true,
    originalHeroAndNineTargetsPreserved: true, pureReviewModelAbsentFromPortableGraph: true,
    sourcesDynamicRouteArtifactVerified: true, sourcesPageJavascriptSHA256: hash(fs.readFileSync(sourcesPageFile)),
    sourceRegistryComponentSSRVerified: true, servedSourcesHTMLVerified: false,
    servedSourcesHTMLStatus: "pending separate root browser verification",
    normalizedOwnKeySetsDescriptorsAndPrototypesEqual: true,
    noExhaustiveMutationSuiteClaim: true, missingRawResearchFilesRead: false,
    mainCatalogueConstructions: 1, elapsedSeconds: (Date.now() - Date.parse(stat.startedAtUTC)) / 1000 };
  write("runtime-result.json", result);
  console.log(json(result));
}

function visibleHTML(html) {
  // Build-generated script/style bodies cannot contain literal closing tags
  // inside encoded data; strip comments too. No browser or DOM simulation.
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

(mode === "accessors" ? accessors() : main()).catch(error => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
