/* Independent read-only capture for binding the seven ute/van buyer pairs. */
const fs = require('fs');
const assert = require('assert/strict');
const crypto = require('crypto');
const A = '/workspace/scratch/586427eef9f2/roadmark-work/roadmark';
const R = '/workspace/scratch/586427eef9f2/roadmark-research';
const { catalogue, research, effectiveFeatures } = require(A + '/src/lib/data.ts');
const { buildBuyerSummaries } = require(A + '/src/lib/selling-points.ts');
const ids = new Set(Object.values(JSON.parse(fs.readFileSync(R + '/ute-van-integrated-ids.json'))));
const serial = value => JSON.parse(JSON.stringify(value));
const all = serial(catalogue());
const prior = JSON.parse(fs.readFileSync(R + '/pre-ute-van-catalogue.json'));
const currentPrior = all.filter(car => !ids.has(car.id));
assert.equal(prior.length, 255);
assert.deepEqual(currentPrior, prior, 'The 255 prior cars must be serialized-deep-equal before binding new copy');
const data = research();
const cars = all.filter(car => ids.has(car.id));
const paths = ['src/lib/data.ts', 'src/lib/selling-points.ts', 'src/lib/types.ts',
  'data/catalogue-additions-2026-10-10.json', 'data/buyer-selling-points-2026-10-10.json',
  'data/approved-corrections.json', 'data/approved-feature-corrections.json',
  'data/approved-availability-corrections.json', 'data/research-refresh-2026-10-10.json'];
const snapshot = {
  capturedAt: new Date().toISOString(),
  cars,
  sources: data.sources.filter(source => source.id.startsWith('r10_uv_')),
  features: cars.flatMap(car => effectiveFeatures(car, data)),
  priorCarCount: prior.length,
  priorCarsSerializedDeepEqual: true,
  priorSnapshotSha256: crypto.createHash('sha256').update(fs.readFileSync(R + '/pre-ute-van-catalogue.json')).digest('hex'),
  applicationInputs: paths.map(path => ({ path, sha256: crypto.createHash('sha256').update(fs.readFileSync(A + '/' + path)).digest('hex') })),
};
fs.writeFileSync(R + '/ute-van-runtime-effective-snapshot.json', JSON.stringify(snapshot, null, 2) + '\n');
console.log(JSON.stringify({ cars: cars.length, sources: snapshot.sources.length, features: snapshot.features.length, priorCarsSerializedDeepEqual: true, capturedAt: snapshot.capturedAt }));
