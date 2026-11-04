/* Quick post-merge verification. Does NOT replace or rerun the exhaustive matrix.
 * The completed exhaustive proof and exact executable inputs are hash-locked;
 * this checks the exact append-only merge and representative current guards.
 * Application files are read-only. */
const fs = require('fs');
const assert = require('assert/strict');
const crypto = require('crypto');
const A = '/workspace/scratch/586427eef9f2/roadmark-work/roadmark';
const R = '/workspace/scratch/586427eef9f2/roadmark-research';
process.chdir(A);
const read = p => JSON.parse(fs.readFileSync(p));
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const clone = x => structuredClone(x);
const serial = x => JSON.parse(JSON.stringify(x));
const dryRun = process.argv.includes('--dry-run');
const tests = [];
function test(name, fn) { fn(); tests.push({name, passed: true}); }
const manifestPath = R + '/hyundai-runtime-selling-points-manifest.json';
const manifest = read(manifestPath);
const exhaustive = read(R + '/hyundai-runtime-selling-points-validation.json');
assert.equal(exhaustive.status, 'passed_read_only_actual_runtime_and_in_memory_merge');
assert.equal(exhaustive.validationMode, 'new_proposal_in_memory_merge');
assert.equal(exhaustive.fullCatalogueVisibleBefore, 258);
assert.equal(exhaustive.fullCatalogueVisibleAfter, 270);
assert.ok(exhaustive.mutationTestsPassed > 130000);
for (const file of manifest.files) test('preserved exhaustive artifact hash: ' + file.path.split('/').at(-1), () => assert.equal(hash(file.path), file.sha256));
const priorPath = R + '/hyundai-prior-buyer-selling-points.json';
const prior = read(priorPath);
const summaryInputPath = 'data/buyer-selling-points-2026-10-10.json';
const priorExpectedHash = exhaustive.applicationInputs.find(x => x.path === summaryInputPath).sha256;
test('frozen pre-merge editorial bytes equal exhaustive proof input', () => assert.equal(hash(priorPath), priorExpectedHash));
const inputLock = read(R + '/hyundai-runtime-input-lock.json');
assert.equal(inputLock.files.length, 29);
for (const file of inputLock.files) {
  if (file.path !== summaryInputPath) test('full proven runtime graph input: ' + file.path, () => assert.equal(hash(A + '/' + file.path), file.sha256));
  const old = exhaustive.applicationInputs.find(x => x.path === file.path);
  if (old) assert.equal(file.sha256, old.sha256);
}
const applicationInputs = inputLock.files.map(x => ({path: x.path, sha256: hash(A + '/' + x.path)}));
for (const input of exhaustive.applicationInputs.filter(x => x.path !== summaryInputPath)) test('exact proven application input: ' + input.path, () => assert.equal(hash(A + '/' + input.path), input.sha256));
const payloadPath = R + '/hyundai-runtime-selling-points-merge-payload.json';
const payload = read(payloadPath);
const snapshot = read(R + '/hyundai-runtime-effective-snapshot.json');
const sourceManifest = read(R + '/remaining-hyundai-manifest.json');
assert.equal(sourceManifest.sourceFiles.length, 309);
for (const file of sourceManifest.sourceFiles) test('source capture remains unchanged: ' + file.path.split('/').at(-1), () => assert.equal(hash(file.path), file.sha256));
const physicalEditorial = read(A + '/' + summaryInputPath);
const actual = dryRun ? {...prior, records:[...prior.records,...payload.records], dependencies:[...prior.dependencies,...payload.dependencies], expectedSourceSnapshots:[...prior.expectedSourceSnapshots,...payload.expectedSourceSnapshots]} : physicalEditorial;
if (dryRun) for (const key of ['records','dependencies','expectedSourceSnapshots']) test('dry-run physical executable input still equals frozen baseline: ' + key, () => assert.equal(JSON.stringify(physicalEditorial[key]), JSON.stringify(prior[key])));
for (const key of ['records', 'dependencies', 'expectedSourceSnapshots']) {
  test('exact append-only executable array: ' + key, () => {
    assert.equal(JSON.stringify(actual[key]), JSON.stringify([...prior[key], ...payload[key]]));
  });
}
const ids = new Set(payload.records.map(r => r.variantId));
const depIds = new Set(payload.dependencies.map(d => d.id));
const sourceIds = new Set(payload.expectedSourceSnapshots.map(s => s.id));
assert.equal(ids.size, 12); assert.equal(depIds.size, 130); assert.equal(sourceIds.size, 35);
const {catalogue, research, effectiveFeatures} = require(A + '/src/lib/data.ts');
const {buildBuyerSummaries, currentBuyerSummary} = require(A + '/src/lib/selling-points.ts');
const data = research(); const all = catalogue();
const allFeatures = all.flatMap(c => effectiveFeatures(c, data));
const policy = {asOf: '2026-10-10', maxAgeDays: 30};
const priorCars = read(R + '/pre-hyundai-remaining-catalogue.json');
const strip = c => Object.fromEntries(Object.entries(c).filter(([k]) => k !== 'buyerSummary'));
const cars = serial(all.filter(c => ids.has(c.id)).map(strip));
const sources = serial(data.sources.filter(s => sourceIds.has(s.id)));
test('all 262 prior serialized cars and buyer summaries unchanged', () => {
  assert.equal(priorCars.length, 262); assert.deepEqual(serial(all.filter(c => !ids.has(c.id))), priorCars);
});
test('all new identities, complete fact maps and availability exactly match exhaustive capture', () => assert.deepEqual(cars, snapshot.cars.map(strip)));
test('new effective feature aliases match exhaustive capture', () => assert.deepEqual(serial(all.filter(c => ids.has(c.id)).flatMap(c => effectiveFeatures(c, data))), snapshot.features));
test('all 35 accepted runtime source snapshots match', () => {
  for (const source of payload.expectedSourceSnapshots) assert.deepEqual(sources.find(s => s.id === source.id), source);
});
const before = buildBuyerSummaries(all, allFeatures, data.sources, prior, policy);
const after = buildBuyerSummaries(all, allFeatures, data.sources, actual, policy);
test((dryRun ? 'in-memory' : 'actual') + ' full-catalogue merge has 270 summaries and 540 clauses', () => {
  assert.equal(all.length, 274); assert.equal(new Set(all.map(c => c.modelFamily || c.family)).size, 112);
  assert.equal(before.size, 258); assert.equal(after.size, 270);
  assert.equal([...after.values()].reduce((n,s) => n + !!s.strength + !!s.tradeoff, 0), 540);
  assert.equal(all.filter(c => !!c.buyerSummary?.strength && !!c.buyerSummary?.tradeoff).length, dryRun ? 258 : 270);
});
test('all 258 prior eligible summaries remain serialized byte-equivalent', () => {
  for (const [id, summary] of before) assert.equal(JSON.stringify(after.get(id)), JSON.stringify(summary), id);
});
test('four new core stock rows; both N cores held; INSTER and IONIQ5N MY remain unknown', () => {
  assert.equal(cars.filter(c => c.availabilityEvidence.stockStatus === 'new_stock_listed').length, 4);
  for (const c of cars.filter(c => /ioniq_[56]_n/.test(c.id))) assert.equal(c.availabilityEvidence.stockStatus, 'not_verified');
  for (const c of cars.filter(c => /inster|ioniq_5_n/.test(c.id))) assert.equal(c.year, null);
});
function state(c = cars, s = sources, target, policyOverride = policy) {
  let p = payload;
  if (target) {
    const records = p.records.filter(r => r.variantId === target || Object.hasOwn(r.expectedRelatedIdentities, target));
    const needs = new Set(records.flatMap(r => [r.modelYearDependency, ...r.strength.dependencyIds, ...r.tradeoff.dependencyIds]));
    p = {...p, records, dependencies: p.dependencies.filter(d => needs.has(d.id))};
  }
  return buildBuyerSummaries(c, [], s, p, policyOverride);
}
function mutate(id, fn) { return cars.map(c => { if (c.id !== id) return c; const v = clone(c); fn(v); return v; }); }
function suppressed(result, id) {
  for (const r of payload.records) if (r.variantId === id || Object.hasOwn(r.expectedRelatedIdentities, id)) assert.ok(!result.has(r.variantId), id + ' left consumer ' + r.variantId);
}
const baseline = state();
test('all 12 minimal-payload summaries equal actual merged runtime summaries', () => {
  assert.equal(baseline.size, 12);
  for (const r of payload.records) {
    assert.deepEqual(baseline.get(r.variantId), after.get(r.variantId));
    assert.deepEqual(baseline.get(r.variantId).conditions, r.requiredVisibleConditions);
    assert.ok(baseline.get(r.variantId).strength && baseline.get(r.variantId).tradeoff);
  }
});
for (const c of cars) {
  const d = payload.dependencies.find(d => d.variantId === c.id && d.kind === 'fact'); assert.ok(d);
  const unknown = Object.keys(c.facts).find(k => c.facts[k].value === null && c.facts[k].sourceIds.length === 0); assert.ok(unknown);
  const cases = [
    ['missing entire fact map', x => delete x.facts], ['null entire fact map', x => x.facts = null], ['empty entire fact map', x => x.facts = {}],
    ['changed lead value', x => x.facts[d.key].value = 'unreviewed'], ['deleted lead fact', x => delete x.facts[d.key]],
    ['changed lead basis', x => x.facts[d.key].basis += ' unreviewed'], ['changed lead units', x => x.facts[d.key].unit += ' unreviewed'],
    ['resolved source-less unknown', x => x.facts[unknown].value = 1], ['removed source-less unknown', x => delete x.facts[unknown]],
    ['new fact added', x => x.facts.unreviewed = {...x.facts[d.key], key: 'unreviewed'}],
    ['changed identity', x => x.trim += ' unreviewed'], ['changed model year', x => x.year = (x.year || 2026) + 1],
    ['changed stock scope', x => x.availabilityEvidence.stockStatus = 'unreviewed'], ['missing availability', x => delete x.availabilityEvidence],
    ['stale availability', x => x.availabilityEvidence.checkedAt = '2026-08-01'],
  ];
  for (const field of ['issues', 'sourceIds', 'qualifications']) for (const [label, value] of [['null', null], ['wrong type', 'unreviewed']]) cases.push([field + ' ' + label, x => x.facts[d.key][field] = value]);
  for (const field of ['issues', 'sourceIds', 'qualifications']) cases.push(['missing ' + field, x => delete x.facts[d.key][field]]);
  for (const [label, fn] of cases) test(c.id + ' | representative guard: ' + label, () => suppressed(state(mutate(c.id, fn), sources, c.id), c.id));
}
for (const s of sources) {
  for (const [label, changed] of [['removed', sources.filter(x => x.id !== s.id)], ['metadata changed', sources.map(x => x.id === s.id ? {...x, title: x.title + ' unreviewed'} : x)]]) {
    test(s.id + ' | representative source guard: ' + label, () => {
      const result = state(cars, changed);
      for (const r of payload.records) if (r.availabilityGuardSourceIds.includes(s.id)) assert.ok(!result.has(r.variantId));
      for (const r of payload.records) if (baseline.get(r.variantId).guardSourceIds.includes(s.id)) assert.equal(currentBuyerSummary(baseline.get(r.variantId), changed, policy), undefined);
    });
  }
}
test('all twelve summaries expire after review window', () => assert.equal(state(cars, sources, undefined, {asOf:'2026-12-01', maxAgeDays:30}).size, 0));
test('rejected/failed/held lead metadata cannot create or poison summaries', () => {
  assert.deepEqual(state(cars, data.sources), baseline);
  assert.deepEqual(state(cars, data.sources.map(s => s.id.startsWith('r10_hy_') && !sourceIds.has(s.id) ? {...s, title:'claims New unreviewed', access_limitation:undefined, conflict:undefined, publication_hold:undefined} : s)), baseline);
});
test('application bytes stable during quick verification', () => { for (const f of applicationInputs) assert.equal(hash(A + '/' + f.path), f.sha256); });
test('exhaustive proof remains unchanged', () => { for (const f of manifest.files) assert.equal(hash(f.path), f.sha256); });
const result = {
  status:dryRun ? 'passed_quick_verifier_in_memory_preflight_only_no_application_merge' : 'passed_quick_post_merge_verification_with_preserved_exhaustive_proof', checkedAt:'2026-10-10', verifiedAt:new Date().toISOString(),
  dryRun, scope:(dryRun ? 'IN-MEMORY PREFLIGHT ONLY. The application editorial file is still unmerged. ' : '') + 'Exact append-only runtime merge, current catalogue/source/input hashes, prior-car/summary preservation, and representative guards. The complete 130k+ matrix was NOT rerun; its original report and exact executable inputs are preserved and hash-verified.',
  records:12, completeSummaries:270, clauses:540, priorSummariesUnchanged:258, priorCarsUnchanged:262,
  executableDependencies:130, acceptedSourceSnapshots:35, coreNewStockRecords:4, sourceFilesReverified:309, exactRuntimeGraphFilesLocked:29,
  testsPassed:tests.length, representativeMutationTestsPassed:tests.filter(t => / \| /.test(t.name)).length,
  exhaustiveProof:{path:R+'/hyundai-runtime-selling-points-validation.json',sha256:hash(R+'/hyundai-runtime-selling-points-validation.json'),testsPassed:exhaustive.testsPassed,mutationTestsPassed:exhaustive.mutationTestsPassed},
  preservedManifest:{path:manifestPath,sha256:hash(manifestPath)},payloadSha256:hash(payloadPath),priorEditorialSha256:hash(priorPath),actualMergedEditorialSha256:dryRun ? null : hash(A+'/'+summaryInputPath),physicalEditorialSha256:hash(A+'/'+summaryInputPath),applicationInputs,applicationEdits:0,tests,
};
fs.writeFileSync(R + (dryRun ? '/hyundai-post-merge-verifier-preflight.json' : '/hyundai-post-merge-verification.json'), JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,tests:undefined,applicationInputs:undefined},null,2));
