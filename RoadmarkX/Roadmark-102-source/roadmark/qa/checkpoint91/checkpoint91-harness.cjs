'use strict';
// Draft test-only harness. Imports real application entrypoints; never edits them.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const TARGET = 'surron_ultra_bee_hp_t_desert_brown_ebmx_19852__20261010';
const CARBON = 'surron_ultra_bee_hp_t_carbon_black_ebmx_19851__20261010';
const HELD = 'surron_ultra_bee_hp_r_carbon_black_ebmx_19849__20261010';
const REF = 'i_df21c7d501a76d354b560489e3512ce8d99b6656775203bc21a8fe595c284e09';
const SEAL = '6a63dcfe69e31758d5b2a634c7d5dc3c6da024d44bfe574a06df851198ba1e1a';
const PROPOSAL_FILE = 'data/buyer-selling-points-2026-10-10.json';
const LEDGER_FILE = 'data/buyer-identity-snapshots-2026-10-10.json';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const hash = value => sha(JSON.stringify(value));
const read = name => JSON.parse(fs.readFileSync(name, 'utf8'));
const equal = (actual, expected, label) => assert.equal(JSON.stringify(actual), JSON.stringify(expected), label);
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function unique(rows, key, label) {
  assert.ok(Array.isArray(rows), label);
  assert.equal(new Set(rows.map(row => row[key])).size, rows.length, label);
}
function loadFixtures(dir) {
  const pins = read(path.join(dir, 'fixture-pins.json'));
  assert.equal(pins.candidateManifestSHA256, SEAL);
  for (const [name, pin] of Object.entries(pins.files))
    assert.equal(sha(fs.readFileSync(path.join(dir, name))), pin, name);
  const load = name => freeze(read(path.join(dir, name)));
  const fixture = {
    delta: load('normalized-proposal-delta.json'),
    ledger: load('normalized-identity-ledger-delta.json'),
    identity: load('reviewed-effective-identity.json'),
    spec: load('mutation-acceptance-cases.json'),
    pins: load('before-app-input-hashes.json'),
    previous84: load('checkpoint84-runtime-fixture.json'),
    previous82: load('checkpoint82-summary-fixture.json'),
    carbonLedger: load('approved-carbon-identity.json'),
  };
  assert.equal(fixture.identity.id, TARGET);
  assert.equal('i_' + hash(fixture.identity), REF);
  equal(fixture.ledger.snapshots[REF], fixture.identity, 'full own identity/order');
  assert.equal(fixture.spec.explicitMutationCaseCount, 883);
  assert.equal(fixture.spec.cases.length, 883);
  assert.equal(fixture.spec.cachedPresentationAcceptance.caseCount, 183);
  assert.equal(fixture.spec.cachedPresentationAcceptance.cases.length, 183);
  unique(fixture.spec.cases, 'id', '883 unique build/merge IDs');
  unique(fixture.spec.cachedPresentationAcceptance.cases, 'id', '183 unique cached IDs');
  return freeze(fixture);
}
// An immutable copy-on-write actual-data mutation. The expected graph is untouched.
const parts = pointer => pointer.slice(1).split('/').map(s => s.replaceAll('~1', '/').replaceAll('~0', '~'));
const esc = key => String(key).replaceAll('~', '~0').replaceAll('/', '~1');
function editAt(value, pointer, operation, replacement) {
  const keys = parts(pointer);
  const walk = (node, at) => {
    assert.ok(node && typeof node === 'object', 'missing pointer ancestor: ' + pointer);
    const result = Array.isArray(node) ? [...node] : { ...node };
    const key = keys[at];
    if (at < keys.length - 1) result[key] = walk(node[key], at + 1);
    else if (operation === 'delete') {
      assert.ok(Object.hasOwn(node, key), 'delete absent path: ' + pointer);
      if (Array.isArray(result)) result.splice(Number(key), 1);
      else delete result[key];
    } else if (operation === 'reverse') {
      assert.ok(Array.isArray(node[key]));
      result[key] = [...node[key]].reverse();
    } else if (operation === 'append') {
      assert.ok(Array.isArray(node[key]));
      result[key] = [...node[key], structuredClone(replacement)];
    } else {
      assert.ok(operation === 'replace' || operation === 'add');
      result[key] = structuredClone(replacement);
    }
    return result;
  };
  return walk(value, 0);
}
function change(value) {
  if (value === null || value === undefined) return 'changed';
  if (typeof value === 'string') return value + ' [mutation]';
  if (typeof value === 'number') return value + 1;
  if (typeof value === 'boolean') return !value;
  if (Array.isArray(value)) return [...value, 'changed'];
  return { ...value, unreviewed: true };
}
function* leaves(value, prefix = '') {
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) yield* leaves(child, prefix + '/' + esc(key));
  } else yield { pointer: prefix, value };
}
function* objects(value, prefix = '') {
  if (!value || typeof value !== 'object') return;
  if (!Array.isArray(value) && Object.keys(value).length > 1) yield { pointer: prefix, value };
  for (const [key, child] of Object.entries(value)) yield* objects(child, prefix + '/' + esc(key));
}
function reversedObject(value) { return Object.fromEntries(Object.entries(value).reverse()); }
function expectedSummary(f) {
  const record = f.delta.records[0];
  const ids = [...new Set([
    ...f.delta.dependencies.find(d => d.id === record.modelYearDependency).sourceIds,
    ...record.availabilityGuardSourceIds,
  ])];
  const strengthIds = [...new Set(record.strength.dependencyIds.flatMap(id => f.delta.dependencies.find(d => d.id === id).sourceIds))];
  return freeze({
    checkedAt: record.checkedAt,
    guardSourceIds: ids,
    conditions: [...record.requiredVisibleConditions],
    expectedVisibleConditions: [...f.identity.configurationEvidence.requiredBuyerVisibleConditions],
    expectedSourceSnapshots: [...new Set([...ids, ...strengthIds])].map(id => f.delta.expectedSourceSnapshots.find(s => s.id === id)),
    strength: { label: record.strength.label, text: record.strength.text, sourceIds: strengthIds },
  });
}
function assertCandidateIntegrity(f, candidate = f.delta, ledger = f.ledger) {
  assert.equal(candidate.identityStorageVersion, 'buyer-identity-snapshots-1');
  assert.equal(candidate.records.length, 1);
  assert.equal(candidate.dependencies.length, 3);
  unique(candidate.records, 'variantId', 'candidate record uniqueness');
  unique(candidate.dependencies, 'id', 'candidate dependency uniqueness');
  unique(candidate.expectedSourceSnapshots, 'id', 'candidate source uniqueness');
  const record = candidate.records[0];
  assert.equal(record.variantId, TARGET);
  assert.equal(record.expectedIdentityRef, REF, 'own identity reference is mandatory, never none');
  assert.equal(record.expectedRelatedIdentityRefs, 'none');
  for (const dependency of candidate.dependencies)
    assert.equal(dependency.variantId, TARGET, 'all three dependencies must belong to Brown');
  assert.equal(Object.hasOwn(record, 'tradeoff'), false);
  assert.equal(record.requiredVisibleConditions.length, 8);
  assert.equal(candidate.expectedSourceSnapshots.length, 21);
  equal(candidate, f.delta, 'exact reviewed candidate including field order');
  equal(ledger, f.ledger, 'exact reviewed own snapshot ledger');
  assert.equal('i_' + hash(ledger.snapshots[REF]), REF);
}
function createHarness(root, fixtureDir, actualInputs) {
  const f = loadFixtures(fixtureDir);
  const appRequire = createRequire(path.join(root, 'package.json'));
  // These are the actual source exports. No substitute evaluator or source transformation.
  const { buildBuyerSummaries, currentBuyerSummary } = appRequire(path.join(root, 'src/lib/selling-points.ts'));
  const { resolveBuyerProposal } = appRequire(path.join(root, 'src/lib/buyer-proposal-storage.ts'));
  assertCandidateIntegrity(f);
  const proposal = freeze(resolveBuyerProposal(structuredClone(f.delta), structuredClone(f.ledger)));
  const car = freeze(structuredClone(actualInputs?.car || f.identity));
  const sources = freeze(structuredClone(actualInputs?.sources || f.delta.expectedSourceSnapshots));
  const { buyerSummary: ignored, ...bareCar } = car;
  void ignored;
  equal(bareCar, f.identity, 'actual own full identity before isolated tests');
  equal(sources, f.delta.expectedSourceSnapshots, 'actual source order/content before isolated tests');
  const policy = freeze({ ...f.spec.baselinePolicy });
  const expected = expectedSummary(f);
  const build = (actualCar = car, actualSources = sources, actualProposal = proposal, asOf = policy.asOf) =>
    buildBuyerSummaries([actualCar], [], actualSources, actualProposal, { ...policy, asOf }).get(TARGET);
  const cached = freeze(build());
  equal(cached, expected, 'positive exact actual-builder result');
  const guardsBefore = hash({ proposal, expected, car, sources });
  const sourceReplace = (all, id, fn) => {
    assert.equal(all.filter(s => s.id === id).length, 1);
    return all.map(source => source.id === id ? fn(source) : source);
  };
  function runBuildCase(c) {
    let actualCar = car, actualSources = sources, actualProposal = proposal;
    const apply = input => editAt(input, c.path, c.operation, c.value);
    if (c.expected.startsWith('candidate premerge integrity validation rejects')) {
      let delta = f.delta;
      if (c.target.startsWith('candidate dependency ') && c.target !== 'candidate dependency array') {
        const index = delta.dependencies.findIndex(d => d.id === c.target.slice('candidate dependency '.length));
        assert.ok(index >= 0);
        delta = editAt(delta, '/dependencies/' + index + c.path, c.operation, c.value);
      } else if (c.target === 'candidate normalized record') delta = editAt(delta, '/records/0' + c.path, c.operation, c.value);
      else delta = apply(delta);
      assert.throws(() => assertCandidateIntegrity(f, delta), undefined, c.id);
      return 'premerge';
    }
    if (c.expected.startsWith('normalized storage rejects')) {
      let stored = f.delta;
      let ledger = { schemaVersion: f.ledger.schemaVersion, snapshots: { ...f.ledger.snapshots, ...f.carbonLedger.snapshots } };
      if (c.target === 'candidate identity snapshot retaining original hash key')
        ledger = editAt(ledger, '/snapshots/' + REF + c.path, c.operation, c.value);
      else stored = editAt(stored, '/records/0' + c.path, c.operation, c.value);
      const message = c.expected.includes('target mismatch') ? /snapshot target mismatch/ : c.expected.includes('hash mismatch') ? /snapshot shape or hash/ : /Invalid buyer identity storage:/;
      assert.throws(() => resolveBuyerProposal(stored, ledger), message, c.id);
      return 'storage';
    }
    if (c.target === 'actual target car') actualCar = apply(car);
    else if (c.target === 'candidate record') actualProposal = editAt(proposal, '/records/0' + c.path, c.operation, c.value);
    else if (c.target.startsWith('actual sources: exact id ')) actualSources = sourceReplace(sources, c.target.slice('actual sources: exact id '.length), apply);
    else if (c.target === 'actual source array') {
      const id = c.path.slice('/source-with-id/'.length);
      assert.ok(sources.some(s => s.id === id));
      actualSources = sources.filter(s => s.id !== id);
    } else if (c.target === 'resolved proposal dependencies') {
      const id = c.path.slice('/dependency-with-id/'.length);
      assert.ok(proposal.dependencies.some(d => d.id === id));
      actualProposal = { ...proposal, dependencies: proposal.dependencies.filter(d => d.id !== id) };
    } else if (c.target.startsWith('candidate dependency ')) {
      const index = proposal.dependencies.findIndex(d => d.id === c.target.slice('candidate dependency '.length));
      assert.ok(index >= 0);
      actualProposal = editAt(proposal, '/dependencies/' + index + c.path, c.operation, c.value);
    } else assert.fail('Unimplemented declared build case: ' + c.id + ' / ' + c.target);
    assert.equal(build(actualCar, actualSources, actualProposal), undefined, c.id);
    return 'build';
  }
  function runCachedCase(c) {
    let summary = cached, currentSources = sources;
    if (c.target === 'current source array') currentSources = sources.filter(s => s.id !== c.sourceId);
    else if (c.target === 'current source with exact id') currentSources = sourceReplace(sources, c.sourceId, s => editAt(s, c.path, c.operation, c.value));
    else if (c.target === 'cached valid summary') summary = editAt(cached, c.path, c.operation, c.value);
    else assert.fail('Unimplemented cached case: ' + c.id);
    // Never rebuild from the changed actual sources. Approved embedded guards stay fixed.
    assert.equal(currentBuyerSummary(summary, currentSources, policy), undefined, c.id);
    return 'cached';
  }
  function checkUnchanged() { assert.equal(hash({ proposal, expected, car, sources }), guardsBefore, 'fixed graphs were not changed'); }
  function runDeclared() {
    const result = { build: 0, storage: 0, premerge: 0, cached: 0, buildCaseIds: [], cachedCaseIds: [] };
    for (const c of f.spec.cases) { result[runBuildCase(c)]++; result.buildCaseIds.push(c.id); }
    for (const c of f.spec.cachedPresentationAcceptance.cases) { runCachedCase(c); result.cached++; result.cachedCaseIds.push(c.id); }
    assert.equal(result.build + result.storage + result.premerge, 883);
    assert.equal(result.cached, 183);
    checkUnchanged();
    return result;
  }
  function runSweeps(progress = () => {}) {
    const result = { factScalarLeaves: 0, configurationScalarLeaves: 0, availabilityScalarLeaves: 0, directFactOwnFields: 0, sourceOwnFieldDeletions: 0, sourceScalarLeaves: 0, objectKeyOrderCases: 0, cachedSourceChecks: 0 };
    function suppressedCar(value, label) { assert.equal(build(value), undefined, label); }
    for (const [field, counter] of [['facts', 'factScalarLeaves'], ['configurationEvidence', 'configurationScalarLeaves'], ['availabilityEvidence', 'availabilityScalarLeaves']]) {
      for (const { pointer, value } of leaves(car[field], '/' + field)) {
        suppressedCar(editAt(car, pointer, 'replace', change(value)), counter + pointer);
        result[counter]++;
      }
      progress({ phase: counter, count: result[counter] });
      for (const { pointer, value } of objects(car[field], '/' + field)) {
        const next = reversedObject(value);
        if (JSON.stringify(next) === JSON.stringify(value)) continue; // Numeric keys are JS-ordered, not reorderable.
        suppressedCar(editAt(car, pointer, 'replace', next), 'key-order' + pointer);
        result.objectKeyOrderCases++;
      }
    }
    for (const dep of proposal.dependencies.filter(d => d.kind === 'fact')) {
      for (const [key, value] of Object.entries(car.facts[dep.key])) {
        suppressedCar(editAt(car, '/facts/' + esc(dep.key) + '/' + esc(key), 'replace', change(value)), 'direct own field ' + key);
        result.directFactOwnFields++;
      }
    }
    function suppressedSource(id, source, label) {
      const currentSources = sourceReplace(sources, id, () => source);
      assert.equal(build(car, currentSources), undefined, 'build ' + label);
      assert.equal(currentBuyerSummary(cached, currentSources, policy), undefined, 'cached ' + label);
      result.cachedSourceChecks++;
    }
    for (const source of sources) {
      for (const key of Object.keys(source)) {
        suppressedSource(source.id, editAt(source, '/' + esc(key), 'delete'), source.id + ':delete:' + key);
        result.sourceOwnFieldDeletions++;
      }
      for (const { pointer, value } of leaves(source)) {
        suppressedSource(source.id, editAt(source, pointer, 'replace', change(value)), source.id + pointer);
        result.sourceScalarLeaves++;
      }
      for (const { pointer, value } of objects(source)) {
        const next = reversedObject(value);
        if (JSON.stringify(next) === JSON.stringify(value)) continue;
        suppressedSource(source.id, pointer ? editAt(source, pointer, 'replace', next) : next, source.id + ':key-order:' + pointer);
        result.objectKeyOrderCases++;
      }
      progress({ phase: 'source', id: source.id });
    }
    assert.equal(result.factScalarLeaves, 17202);
    assert.equal(result.configurationScalarLeaves, 7309);
    assert.equal(result.availabilityScalarLeaves, 19);
    assert.equal(result.sourceScalarLeaves, 2117);
    checkUnchanged();
    return result;
  }
  return { f, car, sources, proposal, policy, expected, cached, build, buildBuyerSummaries, currentBuyerSummary, resolveBuyerProposal, runBuildCase, runCachedCase, runDeclared, runSweeps, checkUnchanged };
}
module.exports = { TARGET, CARBON, HELD, REF, SEAL, PROPOSAL_FILE, LEDGER_FILE, sha, hash, read, equal, freeze, loadFixtures, editAt, change, expectedSummary, assertCandidateIntegrity, createHarness };
