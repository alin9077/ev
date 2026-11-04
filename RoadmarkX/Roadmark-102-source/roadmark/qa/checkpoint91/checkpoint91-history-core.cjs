'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const H = require('./checkpoint91-harness.cjs');
function readRuntimeFixture(dir) {
  const file = path.join(dir, 'checkpoint91-runtime-fixture.json');
  const pin = fs.readFileSync(file + '.sha256', 'utf8').trim();
  assert.match(pin, /^[a-f0-9]{64}$/);
  const bytes = fs.readFileSync(file);
  assert.equal(H.sha(bytes), pin, 'immutable checkpoint91 runtime fixture');
  const fixture = JSON.parse(bytes);
  assert.equal(fixture.schemaVersion, 'roadmark-checkpoint91-runtime.v1');
  assert.equal(fixture.candidateManifestSHA256, H.SEAL);
  assert.equal(fixture.targetId, H.TARGET);
  assert.deepEqual(fixture.delta, { records: 1, dependencies: 3, identities: 1, sourceSnapshots: 0, summaries: 1, cars: 0 });
  return H.freeze(fixture);
}
function previousCars(cars, fixture) {
  assert.equal(cars.length, 343);
  assert.equal(fixture.previousCars.length, 343);
  assert.equal(new Set(cars.map(c => c.id)).size, 343);
  H.equal(cars.map(c => c.id), fixture.previousCars.map(c => c.id), 'unchanged catalogue order and IDs');
  assert.equal(cars.filter(c => c.buyerSummary).length, 331);
  assert.equal(cars.filter(c => c.buyerSummary?.strength && c.buyerSummary?.tradeoff).length, 329);
  assert.equal(cars.filter(c => c.buyerSummary?.strength && !c.buyerSummary?.tradeoff).length, 2);
  assert.equal(cars.find(c => c.id === H.HELD)?.buyerSummary, undefined);
  const target = cars.find(c => c.id === H.TARGET);
  assert.ok(target);
  H.equal(target.buyerSummary, fixture.approvedSummary, 'only the exact reviewed Brown summary may be removed');
  assert.equal(H.hash(target), fixture.approvedTargetSHA256, 'whole approved Brown target');
  let oldSummaries = 0;
  const previous = cars.map((car, index) => {
    const row = fixture.previousCars[index];
    if (car.id === H.TARGET) {
      const { buyerSummary, ...old } = car;
      void buyerSummary;
      assert.equal(H.hash(old), row.hash, 'entire reconstructed target');
      assert.equal(row.summaryHash, null);
      return { ...old, buyerSummary: undefined };
    }
    assert.equal(H.hash(car), row.hash, 'unchanged non-target: ' + car.id);
    if (row.summaryHash) {
      assert.equal(H.hash(car.buyerSummary), row.summaryHash, 'unchanged old summary: ' + car.id);
      oldSummaries++;
    } else assert.equal(car.buyerSummary, undefined, 'no unapproved new summary: ' + car.id);
    return car;
  });
  assert.equal(oldSummaries, 330);
  assert.equal(previous.filter(c => c.buyerSummary).length, 330);
  return previous;
}
function previousStorage(stored, ledger, fixture, f) {
  H.assertCandidateIntegrity(f);
  assert.equal(H.hash(stored), fixture.storage.approvedProposalJSONSHA256, 'entire post91 proposal incl. metadata and order');
  assert.equal(H.hash(ledger), fixture.storage.approvedLedgerJSONSHA256, 'entire post91 ledger incl. order');
  assert.equal(stored.records.length, 334);
  assert.equal(stored.dependencies.length, 4873);
  assert.equal(Object.keys(ledger.snapshots).length, 119);
  H.equal(stored.records.slice(-1), f.delta.records, 'one exact appended record');
  H.equal(stored.dependencies.slice(-3), f.delta.dependencies, 'three exact appended dependencies');
  H.equal(ledger.snapshots[H.REF], f.identity, 'one exact own identity');
  const oldStored = { ...stored, records: stored.records.slice(0, -1), dependencies: stored.dependencies.slice(0, -3) };
  const oldLedger = { ...ledger, snapshots: { ...ledger.snapshots } };
  delete oldLedger.snapshots[H.REF];
  assert.equal(H.hash(oldStored), fixture.storage.previousProposalJSONSHA256, 'exact reconstructed prior proposal');
  assert.equal(H.hash(oldLedger), fixture.storage.previousLedgerJSONSHA256, 'exact reconstructed prior ledger');
  return { stored: oldStored, ledger: oldLedger };
}
function checkResearch(data, fixture) {
  assert.equal(data.sources.length, 2196, 'entire catalogue still has all2196 sources');
  assert.equal(H.hash(data), fixture.previousResearchSHA256, 'full research unchanged');
  for (const [id, pin] of Object.entries(fixture.previousSourceHashes)) {
    const matches = data.sources.filter(source => source.id === id);
    assert.equal(matches.length, 1, id);
    assert.equal(H.hash(matches[0]), pin, 'source unchanged: ' + id);
  }
}
module.exports = { readRuntimeFixture, previousCars, previousStorage, checkResearch };
