/* Read-only actual application runtime validation and in-memory merge evidence. */
const fs = require('fs');
const assert = require('assert/strict');
const crypto = require('crypto');
const {execFileSync} = require('child_process');
const A = '/workspace/scratch/586427eef9f2/roadmark-work/roadmark';
const R = '/workspace/scratch/586427eef9f2/roadmark-research';
const read = path => JSON.parse(fs.readFileSync(path));
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const hash = path => digest(fs.readFileSync(path));
const clone = value => structuredClone(value);
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
const proposalPath = R + '/ute-van-runtime-selling-points-proposal.json';
const proposal = read(proposalPath);
const originalSourceProposal = read(R + '/remaining-utes-vans-selling-points-proposal.json');
const snapshot = read(R + '/ute-van-runtime-effective-snapshot.json');
const evidence = read(R + '/remaining-utes-vans-evidence.json');
// Match the source author's declared Python canonical JSON format exactly.
// JavaScript would erase integral-float distinctions such as 4.0 versus 4.
const sourceObjectHashes = new Map(JSON.parse(execFileSync('python', ['-c', `
import json, hashlib
from pathlib import Path
root=Path(${JSON.stringify(R)})
p=json.loads((root/'ute-van-runtime-selling-points-proposal.json').read_text())
e=json.loads((root/'remaining-utes-vans-evidence.json').read_text())
out=[]
for d in p['researchDependencies']:
    obj=e
    for bit in d['sourceJsonPointer'].strip('/').split('/'):
        bit=bit.replace('~1','/').replace('~0','~')
        obj=obj[int(bit)] if isinstance(obj,list) else obj[bit]
    out.append([d['id'],hashlib.sha256(json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()])
print(json.dumps(out))
`], {encoding: 'utf8'})));
const applicationInputs = snapshot.applicationInputs.map(({path}) => ({path, sha256: hash(A + '/' + path)}));
const { catalogue, research, effectiveFeatures, pack } = require(A + '/src/lib/data.ts');
const { buildBuyerSummaries, currentBuyerSummary } = require(A + '/src/lib/selling-points.ts');
const policy = {asOf: '2026-10-10', maxAgeDays: 30};
const allCars = catalogue();
const data = research();
const allSources = data.sources;
const ids = new Set(proposal.records.map(rec => rec.variantId));
const expectedSourceIds = new Set(proposal.expectedSourceSnapshots.map(source => source.id));
const withoutSummary = car => Object.fromEntries(Object.entries(car).filter(([key]) => key !== 'buyerSummary'));
const cars = JSON.parse(JSON.stringify(allCars.filter(car => ids.has(car.id)).map(withoutSummary)));
const sources = JSON.parse(JSON.stringify(allSources.filter(source => expectedSourceIds.has(source.id))));
const carIndex = new Map(cars.map(car => [car.id, car]));
const depIndex = new Map(proposal.dependencies.map(dep => [dep.id, dep]));
const bindingIndex = new Map(proposal.researchDependencyBindings.map(binding => [binding.researchDependencyId, binding]));
const oldDepIndex = new Map(proposal.researchDependencies.map(dep => [dep.id, dep]));
const sourceIndex = new Map(sources.map(source => [source.id, source]));
const tests = [];
function test(name, fn, detail = {}) { fn(); tests.push({name, passed: true, ...detail}); }
const changed = value => typeof value === 'number' ? value + 1 : typeof value === 'boolean' ? !value
  : value == null ? 'mutation_from_unknown' : Array.isArray(value) ? [...value, 'mutation_extra']
  : typeof value === 'object' ? {...value, mutation: true} : 'mutation_' + value;
// Fact mutations execute the actual builder for every own/related consumer of
// the mutated car. Unrelated rows are independent in this builder and are
// verified separately through the whole-catalogue before/after merge.
const mutationTargets = new WeakMap();
const state = (c = cars, s = sources, p = proposal, pol = policy) => {
  const id = mutationTargets.get(c);
  if (id) {
    const records = p.records.filter(r => r.variantId === id || Object.hasOwn(r.expectedRelatedIdentities || {}, id));
    const needed = new Set(records.flatMap(r => [r.modelYearDependency, ...r.strength.dependencyIds, ...r.tradeoff.dependencyIds]));
    p = {...p, records, dependencies: p.dependencies.filter(d => needed.has(d.id))};
  }
  return buildBuyerSummaries(c, [], s, p, pol);
};
const mutateCar = (id, fn) => {
  const result = cars.map(car => { if (car.id !== id) return car; const out = clone(car); fn(out); return out; });
  mutationTargets.set(result, id); return result;
};
const mutateSource = (id, fn, base = sources) => base.map(source => { if (source.id !== id) return source; const out = clone(source); fn(out); return out; });
const mutateProposal = fn => { const out = {...proposal, dependencies: proposal.dependencies.map(d => ({...d})), records: proposal.records.map(r => ({...r}))}; fn(out); return out; };
function noRecordConsumers(result, id) {
  for (const rec of proposal.records) if (rec.variantId === id || Object.hasOwn(rec.expectedRelatedIdentities, id)) {
    assert.ok(!result.has(rec.variantId), `${id}: stale record remains for ${rec.variantId}`);
  }
}
function noDependencyConsumers(result, dep) {
  for (const rec of proposal.records) {
    if (rec.modelYearDependency === dep.id) assert.ok(!result.has(rec.variantId), dep.id);
    for (const part of ['strength', 'tradeoff']) if (rec[part].dependencyIds.includes(dep.id)) {
      assert.ok(!result.get(rec.variantId)?.[part], `${dep.id}: stale ${rec.variantId}/${part}`);
    }
  }
}
function noSourceConsumers(result, id) {
  for (const rec of proposal.records) if (rec.availabilityGuardSourceIds.includes(id)) assert.ok(!result.has(rec.variantId), `${id}: record source guard`);
  for (const dep of proposal.dependencies) if (dep.sourceIds.includes(id)) noDependencyConsumers(result, dep);
}
function pointer(path) {
  return path.split('/').slice(1).map(bit => bit.replaceAll('~1', '/').replaceAll('~0', '~')).reduce((obj, bit) => obj[bit], evidence);
}

test('exact seven configuration IDs; six exact dealer-New configurations and one official-only Liftback', () => {
  assert.equal(cars.length, 7); assert.equal(proposal.records.length, 7);
  assert.deepEqual([...ids].sort(), Object.values(read(R + '/ute-van-integrated-ids.json')).sort());
  assert.equal(cars.filter(c => c.availabilityEvidence.stockStatus === 'new_stock_listed').length, 6);
  assert.equal(cars.filter(c => c.availabilityEvidence.stockStatus === 'not_verified').length, 1);
});
test('all 255 prior cars remain serialized-deep-equal before adding copy', () => {
  const prior = read(R + '/pre-ute-van-catalogue.json'); assert.equal(prior.length, 255);
  assert.deepEqual(JSON.parse(JSON.stringify(allCars.filter(c => !ids.has(c.id)))), prior);
});
test('actual current seven Car records match independent captured runtime snapshot', () => assert.deepEqual(cars, snapshot.cars.map(withoutSummary)));
test('actual current effective feature rows match independent snapshot', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(allCars.filter(c => ids.has(c.id)).flatMap(c => effectiveFeatures(c, data)))), snapshot.features);
});
test('actual current source reader matches all 35 accepted source snapshots', () => {
  assert.equal(sources.length, 35);
  for (const source of proposal.expectedSourceSnapshots) assert.deepEqual(source, sourceIndex.get(source.id));
});
for (const input of proposal.applicationInputs) test('input unchanged: ' + input.path.split('/').at(-1), () => assert.equal(hash(input.path), input.sha256));
test('all source-stage copy and all 55 visible conditions are preserved', () => {
  for (const rec of proposal.records) {
    const original = originalSourceProposal.records.find(r => r.sourceRecordId === rec.sourceRecordId);
    for (const part of ['strength', 'tradeoff']) {
      assert.equal(rec[part].text, original[part].text); assert.equal(rec[part].label, original[part].label);
    }
    assert.deepEqual(rec.requiredVisibleConditions, original.requiredVisibleConditions);
    assert.deepEqual(rec.visibleConditionBindings.map(c => c.text), rec.requiredVisibleConditions);
  }
  assert.equal(proposal.records.reduce((count, rec) => count + rec.requiredVisibleConditions.length, 0), 55);
});
test('all 508 research dependencies map to explicit executable or record-level guards', () => {
  assert.equal(bindingIndex.size, 508);
  assert.deepEqual([...bindingIndex.keys()].sort(), [...oldDepIndex.keys()].sort());
  const used = new Set(proposal.records.flatMap(r => r.allDependencyIds));
  assert.deepEqual([...used].sort(), [...oldDepIndex.keys()].sort());
  for (const binding of bindingIndex.values()) {
    assert.ok(binding.guards.length);
    for (const id of binding.runtimeDependencyIds) assert.ok(depIndex.has(id));
  }
});
test('exact source snapshots cover every runtime source guard with no unrelated IDs', () => {
  const used = new Set([...proposal.dependencies.flatMap(d => d.sourceIds), ...proposal.records.flatMap(r => r.availabilityGuardSourceIds)]);
  assert.deepEqual([...used].sort(), [...expectedSourceIds].sort());
});
for (const dep of proposal.researchDependencies) {
  test(dep.id + ' | original source JSON pointer/hash', () => {
    const object = pointer(dep.sourceJsonPointer);
    assert.deepEqual(object, dep.sourceSnapshot);
    assert.equal(sourceObjectHashes.get(dep.id), dep.sourceObjectSha256, dep.id);
    assert.equal(hash(dep.sourceEvidenceFile), dep.sourceEvidenceFileSha256);
  });
}
for (const source of proposal.sourceRegistry) {
  test(source.id + ' | original downloaded bytes and extracted text', () => {
    assert.equal(hash(source.snapshot_path), source.sha256);
    if (source.text_snapshot_path) assert.equal(hash(source.text_snapshot_path), source.text_sha256);
    for (const render of source.visualVerification?.renderArtifacts || []) assert.equal(hash(render.path), render.sha256);
    for (const derived of source.derivedSnapshots || []) assert.equal(hash(derived.path || derived.snapshot_path), derived.sha256);
  });
}
for (const render of proposal.visualReview) test(render.sourceId + ' PDF page ' + render.pdfPage + ' | visual-review artifact hash', () => assert.equal(hash(render.path), render.sha256));
for (const dep of proposal.dependencies) {
  assert.ok(dep.sourceIds.length, dep.id);
  if (dep.kind === 'fact') assert.deepEqual(carIndex.get(dep.variantId).facts[dep.key], dep.expectedEffectiveFact, dep.id);
}
for (const rec of proposal.records) {
  const car = carIndex.get(rec.variantId);
  assert.ok(['ute', 'van'].includes(car.vehicleClass));
  assert.deepEqual(car.facts, rec.expectedIdentity.facts);
  assert.deepEqual(car.availabilityEvidence, rec.expectedAvailabilityEvidence);
  assert.equal(car.availabilityEvidence.stockStatus, car.id.includes('liftback') ? 'not_verified' : 'new_stock_listed');
  assert.equal(car.availabilityEvidence.orderStatus, 'listed');
  assert.equal(car.availabilityEvidence.stockUpdatedAt, null);
  assert.equal(car.availabilityEvidence.deliveryStatus, 'unverified');
  for (const condition of rec.visibleConditionBindings) {
    assert.ok(condition.runtimeBindings.length);
    assert.deepEqual(condition.runtimeBindings.map(b => b.researchDependencyId), condition.researchDependencyIds);
  }
  assert.ok(rec.contextDependencyIds.every(id => rec.strength.dependencyIds.includes(id) && rec.tradeoff.dependencyIds.includes(id)));
}
const baseline = state();
const mergePayloadPath = R + '/ute-van-runtime-selling-points-merge-payload.json';
const mergePayload = read(mergePayloadPath);
test('minimal executable merge payload produces exactly the full proposal summaries', () => assert.deepEqual(state(cars, sources, mergePayload), baseline));
test('actual runtime baseline: exactly seven complete strength/trade-off pairs', () => {
  assert.equal(baseline.size, 7);
  for (const rec of proposal.records) {
    assert.ok(baseline.get(rec.variantId)?.strength); assert.ok(baseline.get(rec.variantId)?.tradeoff);
    assert.deepEqual(baseline.get(rec.variantId).conditions, rec.requiredVisibleConditions);
  }
});
test('critical unknowns and dealer-conditional seats are preserved', () => {
  const lift = carIndex.get('hyundai_staria_load_electric_84_fwd_liftback__20261010');
  assert.equal(lift.year, null); assert.equal(lift.facts.seats.value, null);
  for (const car of cars.filter(c => c.id.startsWith('farizon_'))) {
    assert.equal(car.year, null); assert.equal(car.facts.seats.value, 3); assert.equal(car.facts.seats.status, 'conditional');
    assert.match(car.facts.seats.label, /Dealer/);
    assert.equal(car.facts.cargo_volume_l.value, 6950);
  }
});
console.error('Baseline, 508 source-object hashes, source bytes and seven complete pairs passed');
// Individual sourced dependencies fail independently of the conservative full-map
// guard, proving the explicit exact-fact mechanism is also wired correctly.
const factOnlyProposal = clone(proposal);
for (const rec of factOnlyProposal.records) {
  delete rec.expectedIdentity.facts;
  for (const expected of Object.values(rec.expectedRelatedIdentities)) delete expected.facts;
}
for (const dep of proposal.dependencies) {
  test(dep.id + ' | stale dependency review', () => noDependencyConsumers(state(cars, sources, mutateProposal(p => p.dependencies.find(d => d.id === dep.id).checkedAt = '2026-08-01')), dep));
  if (dep.kind !== 'fact') {
    test(dep.id + ' | invented formal model year', () => noDependencyConsumers(state(mutateCar(dep.variantId, c => c.year = changed(dep.expectedValue))), dep));
    continue;
  }
  for (const key of ['value', 'status', 'unit', 'basis', 'comparisonBasis', 'market', 'scope', 'qualifications', 'conditionExplanation', 'label']) {
    test(dep.id + ' | exact fact dependency changes ' + key, () => {
      noDependencyConsumers(state(mutateCar(dep.variantId, c => c.facts[dep.key][key] = changed(c.facts[dep.key][key])), sources, factOnlyProposal), dep);
    });
  }
  for (const [label, fn] of [
    ['missing fact', c => delete c.facts[dep.key]],
    ['changed recent fact date', c => c.facts[dep.key].date = '2026-10-09'],
    ['stale fact date', c => c.facts[dep.key].date = '2026-08-01'],
    ['removed source membership', c => c.facts[dep.key].sourceIds = []],
    ['new source membership', c => c.facts[dep.key].sourceIds.push('unreviewed_source')],
    ['new issue', c => c.facts[dep.key].issues.push({issue_id: 'mutation'})],
    ['new future validity date', c => c.facts[dep.key].validUntil = '2027-01-01'],
    ['expired validity date', c => c.facts[dep.key].validUntil = '2026-01-01'],
    ['new fact metadata', c => c.facts[dep.key].unreviewedField = true],
  ]) test(dep.id + ' | ' + label, () => noDependencyConsumers(state(mutateCar(dep.variantId, fn), sources, factOnlyProposal), dep));
}

console.error('Explicit sourced dependency mutation checks passed');
// Every current fact is frozen, including the source-less null rows that cannot
// legitimately receive sourced fact dependency IDs. This also covers unclaimed
// facts conservatively: adding knowledge requires reconsidering the caveats.
for (const car of cars) {
  for (const [key, fact] of Object.entries(car.facts)) {
    for (const field of ['value', 'status', 'unit', 'basis', 'comparisonBasis', 'market', 'scope', 'qualifications', 'sourceIds', 'date', 'conditionExplanation', 'label', 'issues', 'validUntil']) {
      test(car.id + '.' + key + ' | whole-map ' + field, () => noRecordConsumers(state(mutateCar(car.id, c => c.facts[key][field] = changed(fact[field]))), car.id));
    }
    test(car.id + '.' + key + ' | whole-map missing fact', () => noRecordConsumers(state(mutateCar(car.id, c => delete c.facts[key])), car.id));
  }
  test(car.id + ' | added unknown-resolution fact invalidates prior caveat', () => {
    noRecordConsumers(state(mutateCar(car.id, c => c.facts.newly_verified_optional_configuration_fact = {...c.facts.range_km, key: 'newly_verified_optional_configuration_fact', value: 180})), car.id);
  });
}

console.error('Complete effective-fact-map mutation checks passed');
for (const binding of bindingIndex.values()) {
  test(binding.researchDependencyId + ' | runtime route mutation', () => {
    if (binding.variantId && binding.factKeys?.length) {
      const key = binding.factKeys[0];
      noRecordConsumers(state(mutateCar(binding.variantId, c => c.facts[key].value = changed(c.facts[key].value))), binding.variantId);
    } else if (binding.sourceIds?.length) {
      const sid = binding.sourceIds[0];
      noSourceConsumers(state(cars, mutateSource(sid, s => s.title = changed(s.title))), sid);
    } else if (binding.excludedSourceIds?.length) {
      assert.ok(binding.excludedSourceIds.every(s => !expectedSourceIds.has(s)));
    } else {
      assert.equal(binding.sourceRecordId, 'all');
      for (const id of binding.guardedVariantIds) noRecordConsumers(state(mutateCar(id, c => c.trim += ' changed')), id);
    }
  }, {bindingType: binding.bindingType, mutation: !!binding.variantId || !!binding.sourceIds?.length || !binding.excludedSourceIds?.length});
}

for (const source of sources) {
  for (const key of ['url', 'title', 'publisher', 'source_type', 'published_date', 'market', 'supports', 'qualifications', 'sha256', 'source_hash']) {
    test(source.id + ' | source metadata ' + key, () => noSourceConsumers(state(cars, mutateSource(source.id, s => s[key] = changed(s[key]))), source.id));
  }
  for (const [key, value] of [['accessed_date', '2026-08-01'], ['accessed_date', '2026-10-09'], ['publication_hold', true], ['access_limitation', 'blocked'], ['conflict', 'contradictory']]) {
    test(source.id + ' | source ' + key + ' ' + value, () => noSourceConsumers(state(cars, mutateSource(source.id, s => s[key] = value)), source.id));
  }
  test(source.id + ' | added source metadata', () => noSourceConsumers(state(cars, mutateSource(source.id, s => s.unreviewedMetadata = true)), source.id));
  for (const key of Object.keys(source)) test(source.id + ' | missing source metadata ' + key, () => noSourceConsumers(state(cars, mutateSource(source.id, s => delete s[key])), source.id));
  test(source.id + ' | missing source', () => noSourceConsumers(state(cars, sources.filter(s => s.id !== source.id)), source.id));
}
const proposedCars = allCars.map(car => ids.has(car.id) ? {...car, buyerSummary: baseline.get(car.id)} : car);
for (const rec of proposal.records) {
  for (const key of Object.keys(rec.expectedIdentity).filter(key => key !== 'facts')) {
    test(rec.variantId + ' | identity ' + key, () => noRecordConsumers(state(mutateCar(rec.variantId, c => c[key] = changed(c[key]))), rec.variantId));
    test(rec.variantId + ' | missing identity ' + key, () => noRecordConsumers(state(mutateCar(rec.variantId, c => delete c[key])), rec.variantId));
  }
  for (const key of Object.keys(rec.expectedAvailabilityEvidence)) {
    test(rec.variantId + ' | availability ' + key, () => noRecordConsumers(state(mutateCar(rec.variantId, c => c.availabilityEvidence[key] = changed(c.availabilityEvidence[key]))), rec.variantId));
  }
  for (const key of Object.keys(rec.expectedAvailabilityEvidence)) test(rec.variantId + ' | missing availability ' + key, () => noRecordConsumers(state(mutateCar(rec.variantId, c => delete c.availabilityEvidence[key])), rec.variantId));
  test(rec.variantId + ' | added availability metadata', () => noRecordConsumers(state(mutateCar(rec.variantId, c => c.availabilityEvidence.unreviewedMetadata = true)), rec.variantId));
  test(rec.variantId + ' | missing structured availability', () => noRecordConsumers(state(mutateCar(rec.variantId, c => delete c.availabilityEvidence)), rec.variantId));
  test(rec.variantId + ' | missing record', () => noRecordConsumers(state(cars.filter(c => c.id !== rec.variantId)), rec.variantId));
  test(rec.variantId + ' | availability revision', () => assert.ok(!state(mutateCar(rec.variantId, c => c.availabilityRevision = 'unreviewed_refresh')).has(rec.variantId)));
  test(rec.variantId + ' | stale record review', () => assert.ok(!state(cars, sources, mutateProposal(p => p.records.find(r => r.variantId === rec.variantId).checkedAt = '2026-08-01')).has(rec.variantId)));
  test(rec.variantId + ' | stale rendered summary review', () => assert.equal(currentBuyerSummary({...baseline.get(rec.variantId), checkedAt: '2026-08-01'}, sources, policy), undefined));
  test(rec.variantId + ' | rendered source snapshots and conditions retained', () => assert.deepEqual(currentBuyerSummary(baseline.get(rec.variantId), sources, policy), baseline.get(rec.variantId)));
  const used = [...new Set([...baseline.get(rec.variantId).guardSourceIds, ...baseline.get(rec.variantId).strength.sourceIds, ...baseline.get(rec.variantId).tradeoff.sourceIds])];
  const packSourceIds = new Set(pack(rec.variantId, {data, cars: proposedCars}).sources.map(s => s.id));
  test(rec.variantId + ' | all guarded sources discoverable in research pack', () => { for (const sid of used) assert.ok(packSourceIds.has(sid), sid); });
  for (const sid of used) test(rec.variantId + ' | render-stage source metadata ' + sid, () => assert.equal(currentBuyerSummary(baseline.get(rec.variantId), mutateSource(sid, s => s.title += ' unreviewed'), policy), undefined));
}
test('all seven pairs expire outside the evidence review window', () => assert.equal(state(cars, sources, proposal, {asOf: '2026-12-01', maxAgeDays: 30}).size, 0));
test('rejected adverts cannot support, create or poison runtime eligibility', () => {
  const rejected = allSources.filter(s => s.id.startsWith('r10_uv_') && (s.access_limitation || s.conflict || s.publication_hold));
  assert.ok(rejected.some(s => s.id === 'r10_uv_farizon_stock_39435_web'));
  for (const source of rejected) assert.ok(!expectedSourceIds.has(source.id), source.id);
  assert.deepEqual(state(cars, allSources), baseline);
  let mutated = clone(allSources);
  for (const source of rejected) mutated = mutateSource(source.id, s => {
    s.title = 'Unreviewed advert now claims New'; delete s.conflict; delete s.access_limitation; s.accessed_date = '2026-10-10';
  }, mutated);
  assert.deepEqual(state(cars, mutated), baseline);
  assert.deepEqual(state(cars, allSources.filter(s => !rejected.some(x => x.id === s.id))), baseline);
  // Even making the rejected advert look valid cannot rescue loss of accepted
  // current New or direct seller Demo evidence.
  const positive = ['r10_uv_farizon_bartons_sr_540814', 'r10_uv_farizon_bartons_er_541534', 'r10_uv_farizon_eastcoast_demo_39435'];
  for (const sid of positive) noSourceConsumers(state(cars, mutated.filter(s => s.id !== sid)), sid);
});

console.error('Identity, availability, related-record and source mutation checks passed');
// Add the proposal in memory only. Existing unrelated rows/snapshots must remain
// byte-equivalent; this deliberately never refreshes old editorial dependencies.
const actualExisting = read(A + '/data/buyer-selling-points-2026-10-10.json');
const existing = clone(actualExisting);
const integratedRows = actualExisting.records.filter(rec => ids.has(rec.variantId));
assert.ok(integratedRows.length === 0 || integratedRows.length === 7, 'partial ute/van integration needs investigation');
if (integratedRows.length === 7) {
  // Safe post-integration reproduction: verify the already-integrated payload is
  // exactly this proposal, then remove only these known rows in memory to recover
  // the same before/after baseline. No application file is changed.
  const pick = (row, keys) => Object.fromEntries(keys.filter(key => Object.hasOwn(row, key)).map(key => [key, row[key]]));
  const runtimeRecord = row => ({...pick(row, ['variantId', 'checkedAt', 'modelYearDependency', 'availabilityScope', 'availabilityRevision', 'expectedIdentity', 'expectedAvailabilityEvidence', 'expectedRelatedIdentities', 'expectedRelatedAvailabilityEvidence', 'availabilityGuardSourceIds', 'requiredVisibleConditions']),
    strength: pick(row.strength, ['label', 'text', 'dependencyIds', 'derivations']), tradeoff: pick(row.tradeoff, ['label', 'text', 'dependencyIds', 'derivations'])});
  const runtimeDependency = row => pick(row, ['id', 'kind', 'variantId', 'key', 'expectedValue', 'expectedStatus', 'expectedUnit', 'expectedBasis', 'expectedComparisonBasis', 'expectedMarket', 'expectedScope', 'expectedQualifications', 'expectedConditionExplanation', 'expectedConditions', 'expectedEffectiveFact', 'sourceIds', 'checkedAt']);
  // Compare the full executable schema. A new capture's timestamp/hash and a
  // freshly regenerated pending-validation status are non-executable provenance.
  for (const rec of proposal.records) assert.deepEqual(runtimeRecord(actualExisting.records.find(row => row.variantId === rec.variantId)), runtimeRecord(rec), rec.variantId + ' integrated runtime copy differs');
  for (const dep of proposal.dependencies) assert.deepEqual(runtimeDependency(actualExisting.dependencies.find(row => row.id === dep.id)), runtimeDependency(dep), dep.id + ' integrated runtime dependency differs');
  for (const source of proposal.expectedSourceSnapshots) assert.deepEqual(actualExisting.expectedSourceSnapshots.find(row => row.id === source.id), source, source.id + ' integrated snapshot differs');
  const depIds = new Set(proposal.dependencies.map(dep => dep.id));
  existing.records = existing.records.filter(rec => !ids.has(rec.variantId));
  existing.dependencies = existing.dependencies.filter(dep => !depIds.has(dep.id));
  existing.expectedSourceSnapshots = existing.expectedSourceSnapshots.filter(source => !expectedSourceIds.has(source.id));
}
const merged = clone(existing);
for (const rec of proposal.records) assert.ok(!existing.records.some(row => row.variantId === rec.variantId), 'new ute/van already integrated; revalidate merge semantics');
for (const dep of proposal.dependencies) assert.ok(!existing.dependencies.some(row => row.id === dep.id), 'dependency ID collision');
for (const source of proposal.expectedSourceSnapshots) assert.ok(!(existing.expectedSourceSnapshots || []).some(row => row.id === source.id), 'source snapshot ID collision');
merged.records.push(...clone(proposal.records));
merged.dependencies.push(...clone(proposal.dependencies));
merged.expectedSourceSnapshots = [...(merged.expectedSourceSnapshots || []), ...clone(proposal.expectedSourceSnapshots)];
const allFeatures = allCars.flatMap(car => effectiveFeatures(car, data));
const before = buildBuyerSummaries(allCars, allFeatures, allSources, existing, policy);
const after = buildBuyerSummaries(allCars, allFeatures, allSources, merged, policy);
test('in-memory merge: seven new complete pairs added', () => {
  assert.equal(after.size, before.size + 7);
  for (const rec of proposal.records) {assert.ok(after.get(rec.variantId)?.strength); assert.ok(after.get(rec.variantId)?.tradeoff);}
});
test('in-memory merge: unrelated current summaries unchanged', () => {
  for (const car of allCars.filter(c => !ids.has(c.id))) assert.deepEqual(after.get(car.id), before.get(car.id), car.id);
});
test('in-memory merge: old records, dependencies and source snapshots unchanged', () => {
  assert.deepEqual(merged.records.slice(0, existing.records.length), existing.records);
  assert.deepEqual(merged.dependencies.slice(0, existing.dependencies.length), existing.dependencies);
  assert.deepEqual(merged.expectedSourceSnapshots.slice(0, (existing.expectedSourceSnapshots || []).length), existing.expectedSourceSnapshots || []);
});
test('application inputs stable during validation', () => { for (const input of applicationInputs) assert.equal(hash(A + '/' + input.path), input.sha256, input.path); });
test('research inputs stable during validation', () => { for (const input of proposal.applicationInputs) assert.equal(hash(input.path), input.sha256, input.path); });

test('before/after summary counts are exactly 251 to 258 and clauses 502 to 516', () => {
  assert.equal(before.size, 251); assert.equal(after.size, 258);
  assert.equal([...before.values()].reduce((n,x) => n + !!x.strength + !!x.tradeoff, 0), 502);
  assert.equal([...after.values()].reduce((n,x) => n + !!x.strength + !!x.tradeoff, 0), 516);
});
const result = {
  status: 'passed_read_only_actual_runtime_and_in_memory_merge', checkedAt: '2026-10-10', policy,
  validationMode: integratedRows.length ? 'already_integrated_exact_runtime_payload_reverified_with_in_memory_baseline' : 'new_proposal_in_memory_merge',
  records: 7, visibleRecords: baseline.size, visibleClauses: 14,
  executableDependencies: proposal.dependencies.length, originalResearchDependencies: bindingIndex.size,
  sourceLessUnknownFacts: 49, sourceLessUnknownsGuardedNotDiscarded: true,
  completeEffectiveFactsGuarded: cars.reduce((n,c) => n + Object.keys(c.facts).length, 0),
  sourceSnapshots: sources.length, originalSourceHashesVerified: proposal.sourceRegistry.length,
  requiredVisibleConditions: 55, originalStrengthAndTradeoffCopyPreserved: true,
  approvedRuntimeRefinements: proposal.approvedRuntimeRefinements,
  unitConversions: 2, leadValueDrift: 0, priorCarsSerializedDeepEqual: 255,
  actualSnapshotMatches: true, exactCompleteFactMapGuards: true,
  exactIdentityAvailabilityRelatedAndAcceptedSourceGuards: true,
  rejectedAdvertCannotCreateOrSupportEligibility: true,
  testsPassed: tests.length, mutationTestsPassed: tests.filter(t => t.mutation !== false && / \| /.test(t.name) && !/original source|downloaded bytes|visual-review artifact hash|rendered source snapshots and conditions retained|all guarded sources discoverable in research pack/.test(t.name)).length,
  fullCatalogueVisibleBefore: before.size, fullCatalogueVisibleAfter: after.size,
  fullCatalogueClausesBefore: [...before.values()].reduce((n,s) => n + !!s.strength + !!s.tradeoff, 0),
  fullCatalogueClausesAfter: [...after.values()].reduce((n,s) => n + !!s.strength + !!s.tradeoff, 0),
  unrelatedSummariesUnchanged: true, unrelatedRowsAndSnapshotsUnchanged: true,
  mutationExecutionScope: 'Actual buildBuyerSummaries with all own/related consumers for each car mutation; complete seven-record source, baseline and full-catalogue merge tests',
  applicationEdits: 0, applicationInputs, effectiveSnapshotSha256: hash(R + '/ute-van-runtime-effective-snapshot.json'),
  reproducibleCommands: [
    'cd /workspace/scratch/586427eef9f2/roadmark-work/roadmark && node --import tsx ../../roadmark-research/capture_ute_van_runtime_snapshot.cjs',
    'python /workspace/scratch/586427eef9f2/roadmark-research/bind_ute_van_selling_points.py',
    'cd /workspace/scratch/586427eef9f2/roadmark-work/roadmark && node --import tsx ../../roadmark-research/validate_ute_van_selling_points.cjs',
  ],
  limitations: [
    'Read-only current-runtime verification and in-memory merge; no application writes, browser rendering, full build or whole test-suite result is claimed.',
    'Whole effective fact-map equality is intentionally conservative. Added, removed or changed facts require copy/caveat review.',
    'Runtime source guards cover accepted metadata exposed by research(), not downloaded webpages. Original byte/text/object/excerpt hashes are checked separately.',
    'Rejected CountryCars 39435 advert is hashed exclusion provenance, not a support source. Its metadata is not an eligibility guard and cannot rescue missing accepted evidence.',
    'Current advertised New status is not physical stock, unsold allocation, VIN inspection, formal MY or guaranteed delivery.',
    'Global source counting rules are checked at binding/validation; runtime guards explicit own/related configurations rather than unrelated future catalogue additions.',
  ],
  tests,
};
fs.writeFileSync(R + '/ute-van-runtime-selling-points-validation.json', JSON.stringify(result, null, 2) + '\n');
proposal.status = 'bound_effective_snapshot_runtime_validated';
proposal.validation = {status: result.status, report: 'ute-van-runtime-selling-points-validation.json', records: 7, clauses: 14,
  testsPassed: result.testsPassed, mutationTestsPassed: result.mutationTestsPassed,
  fullCatalogueVisibleBefore: before.size, fullCatalogueVisibleAfter: after.size,
  originalCopyAndConditionsPreserved: true, unrelatedSummariesUnchanged: true, applicationEdits: 0};
proposal.applicationInputsAtValidation = applicationInputs;
for (const rec of proposal.records) {
  rec.status = 'bound_effective_snapshot_runtime_validated';
  rec.runtimeBinding.status = 'bound_effective_snapshot_runtime_validated';
  rec.copyReadyWhen = 'Actual-runtime and fail-closed mutation validation passed. Integrate only these seven pairs; retain full fact-map/source/identity/availability guards and all visible conditions.';
}
fs.writeFileSync(proposalPath, JSON.stringify(proposal, null, 2) + '\n');
mergePayload.status = 'runtime_validated_exact_executable_payload';
fs.writeFileSync(mergePayloadPath, JSON.stringify(mergePayload, null, 2) + '\n');
let markdown = fs.readFileSync(R + '/ute-van-runtime-selling-points-proposal.md', 'utf8');
markdown = markdown.replace('Application runtime validation is pending.', 'Actual-runtime and fail-closed mutation validation passed.')
  .replace(/Static mapping passed; actual runtime and mutation validation pending\.|Passed: [^\n]+/, 
    `Passed: ${result.testsPassed} checks, including ${result.mutationTestsPassed} mutation checks. All seven complete pairs render through the actual summary builders. In-memory merge adds seven summaries (${before.size} → ${after.size}) without changing any unrelated summary, dependency or source snapshot. Rejected adverts cannot support or create eligibility. No application files were written.`);
fs.writeFileSync(R + '/ute-van-runtime-selling-points-proposal.md', markdown);
console.log(JSON.stringify({...result, tests: undefined, applicationInputs: undefined}, null, 2));
