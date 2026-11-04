import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { catalogue, research } from "../src/lib/data";
import { buyerProposal } from "../src/lib/buyer-proposal";
import { attributes, rankAttribute } from "../src/lib/discovery";
import { buildBuyerSummaries } from "../src/lib/selling-points";
import fixture from "../qa/remaining-volkswagen-integration-fixture.json";
const all = catalogue(), data = research();
const cars = fixture.map(f => { const c = all.find(x => x.id === f.id); assert.ok(c); return c; });
const hash = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const policy = {asOf: "2026-10-10", maxAgeDays: 30};
test("four MY26 captured VW builds retain all facts, provenance and160 unknown fields", () => {
  assert.equal(cars.length, 4);
  assert.equal(cars.reduce((n,c) => n+Object.keys(c.facts).length,0),655);
  assert.equal(fixture.reduce((n,f) => n+f.nullKeys.length,0),160);
  for (const [i,c] of cars.entries()) {
    assert.equal(c.year,2026);
    assert.equal(c.modelFamily,fixture[i].modelFamily);
    assert.equal(hash(c.facts),fixture[i].factsSHA256);
    assert.equal(hash(c.configurationEvidence),fixture[i].configurationSHA256);
    assert.equal(c.configurationEvidence?.rankingEligible,false);
    assert.equal(c.configurationEvidence?.completeVehicleCountEligible,false);
    for (const key of fixture[i].nullKeys) assert.equal(c.facts[key].value,null,key);
  }
});
test("VW buyer clauses preserve captured-build scope and exact option dependencies", () => {
  for (const [i,c] of cars.entries()) {
    assert.equal(c.buyerSummary?.strength?.text,fixture[i].strength.text);
    assert.equal(c.buyerSummary?.tradeoff?.text,fixture[i].tradeoff.text);
    assert.deepEqual(c.buyerSummary?.conditions,fixture[i].conditions);
  }
  const deps=buyerProposal.dependencies.filter(d => cars.some(c => c.id===d.variantId));
  assert.equal(deps.length,27);
  assert.equal(deps.filter(d => d.kind==='configuration_option').length,4);
  assert.equal(fixture.reduce((n,f)=>n+f.conditions.length,0),24);
});
test("MY26 technical scalar promotion cannot create VW attribute ranks", () => {
  const altered=structuredClone(cars);
  for (const c of altered) for(const a of attributes) c.facts[a.key]={...c.facts[a.key],value:999,status:'standard',comparisonBasis:'WLTP',date:'2026-10-10',sourceIds:c.availabilityEvidence!.sourceIds};
  for (const a of attributes) assert.equal(rankAttribute(altered,data.sources,a.key,policy).groups.length,0);
});
test("MY26 Pro advertisements and MY25 Cargo stock remain separate", () => {
  assert.equal(cars.filter(c => c.availabilityEvidence?.stockStatus==='new_stock_listed').length,2);
  const cargo=cars.find(c => c.modelFamily==='volkswagen-id-buzz-cargo')!;
  assert.equal(cargo.availabilityEvidence?.stockStatus,'unverified');
  const old=all.find(c=>c.id==='volkswagen_id_buzz_cargo_my25__swb__20261010')!;
  assert.ok(old); assert.equal(old.availability,'outgoing');
  assert.equal(old.availabilityEvidence?.stockStatus,'new_stock_listed');
  assert.notEqual(old.id,cargo.id);
  assert.equal(data.feature_evidence.filter(f=>cars.some(c=>c.id===f.variant_id)&&f.status!=='not_verified').length,0);
});
test("changed selected option or scoped amendment suppresses affected VW copy", () => {
  const records=buyerProposal.records.filter(r=>cars.some(c=>c.id===r.variantId));
  const proposal={...buyerProposal,records};
  assert.equal(buildBuyerSummaries(cars,[],data.sources,proposal,policy).size,4);
  for(const original of cars) {
    const altered=structuredClone(cars),c=altered.find(c=>c.id===original.id)!;
    const options=c.configurationEvidence!.options as Record<string,unknown>[];
    options[0].selectedInCapturedBuild=!options[0].selectedInCapturedBuild;
    const result=buildBuyerSummaries(altered,[],data.sources,proposal,policy);
    assert.equal(result.has(c.id),false);
    for(const r of records.filter(r=>Object.hasOwn(r.expectedRelatedIdentities||{},c.id))) assert.equal(result.has(r.variantId),false);
    const changed=structuredClone(cars),target=changed.find(c=>c.id===original.id)!;
    (target.configurationEvidence!.projectionContract as Record<string,unknown>).scopedAmendmentLedger={};
    assert.equal(buildBuyerSummaries(changed,[],data.sources,proposal,policy).has(target.id),false);
  }
});
