// Standalone frozen-artifact audit. Built-ins only; never imports/executes app code.
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const root = '/workspace/scratch/586427eef9f2';
const app = path.join(root, 'roadmark-work/roadmark');
const read = p => fs.readFileSync(p, 'utf8');
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const bytes = x => Buffer.byteLength(JSON.stringify(x));
const htmlPath = path.join(app, 'index.html');
const html = read(htmlPath);
const match = html.match(/<script[^>]*id="ev-data"[^>]*>(.*?)<\/script>/s);
if (!match) throw new Error('Frozen portable data script absent');
const data = JSON.parse(match[1]);
const cars = Object.values(data.packs).map(p => p.car);
const sources = data.research.sources;
const sourceIds = new Set(sources.map(s => s.id));
const measure = JSON.parse(read(path.join(app, 'qa/page-source-scope-measurement.json')));
const keys = new Set(['length_mm','range_km','price_aud','dc_charge_time_min','towing_braked_kg','seats','boot_l','height_mm','wheelbase_mm']);
const projected = cars.map(c => ({...c, facts:Object.fromEntries(Object.entries(c.facts).filter(([k])=>keys.has(k)))}));
// Schema-independent nested collector independently checks every retained graph reference.
function graphRefs(value, result = new Set()) {
  if (Array.isArray(value)) { for(const v of value) graphRefs(v,result); return result; }
  if (!value || typeof value!=='object') return result;
  for (const [k,v] of Object.entries(value)) {
    if ((k === 'sourceIds' || k === 'source_ids') && Array.isArray(v)) for(const id of v) result.add(id);
    if (k === 'expectedSourceSnapshots' && Array.isArray(v)) for(const s of v) result.add(s.id);
    graphRefs(v,result);
  }
  return result;
}
const discoveryIds=graphRefs(projected);
const curated=Object.values(data.packs).filter(p => p.car.researchStage !== 'partial');
const heroIds=new Set(curated.flatMap(p=>p.sourceIds));
for (const id of ['r5_au_ev_sales_sep2026','r3_tesla_fsd']) heroIds.add(id);
const homeIds=new Set([...discoveryIds,...heroIds]);
function summary(ids, expected) {
  const selected=sources.filter(s=>ids.has(s.id));
  const out={count:selected.length,bytes:bytes(selected),savedJSONBytes:bytes(sources)-bytes(selected),missing:[...ids].filter(id=>!sourceIds.has(id)),rawJSONSHA256:sha(JSON.stringify(selected))};
  out.matchesReportedMeasurement=['count','bytes','savedJSONBytes'].every(k=>out[k]===expected[k]);
  out.flaggedSources=selected.filter(s=>s.access_limitation || s.conflict || s.publication_hold).map(s=>s.id);
  return out;
}
// Hero's current citation-producing consumers: every fact/feature, eligibility,
// all events (including filtered-out events), and every configuration entry.
const renderedHeroRefs = new Set(['r5_au_ev_sales_sep2026','r3_tesla_fsd']);
for(const p of curated) {
  for(const f of Object.values(p.car.facts)) for(const id of f.sourceIds) renderedHeroRefs.add(id);
  for(const f of p.features) for(const id of f.source_ids) renderedHeroRefs.add(id);
  for(const id of p.eligibility.source_ids) renderedHeroRefs.add(id);
  for(const x of [...p.events,...p.configuration]) for(const id of x.source_ids) renderedHeroRefs.add(id);
}
const unconsumedHeroOnly=[...graphRefs(curated)].filter(id=>!heroIds.has(id));
const fullCatalogueSHA256=sha(JSON.stringify(cars));
const fullSourcesSHA256=sha(JSON.stringify(sources));
const out={
 scope:'Frozen portable JSON + file-text audit only. No application imports, tests, builds, browser or server runtime checks.',
 input:{path:htmlPath,sha256:sha(html),bytes:Buffer.byteLength(html),fullCatalogueSHA256,fullSourcesSHA256,catalogueMatchesRuntimeMeasurementHash:fullCatalogueSHA256===measure.fullCatalogueSHA256,sourcesMatchRuntimeMeasurementHash:fullSourcesSHA256===measure.fullSourcesSHA256},
 cars:cars.length,pairedSummaries:cars.filter(c=>c.buyerSummary?.strength&&c.buyerSummary?.tradeoff).length,curatedPacks:curated.length,uniqueCanonicalSourceIds:sourceIds.size,canonicalSourceRows:sources.length,duplicateCanonicalSourceIds:sources.length-sourceIds.size,
 groups:{discover:summary(discoveryIds,measure.groups.discover),home:summary(homeIds,measure.groups.home),original:summary(heroIds,measure.groups.original)},
 heroConsumerRefsMissingFromScope:[...renderedHeroRefs].filter(id=>!heroIds.has(id)),
 allPreservedHeroGraphRefsNotInPackUnion:unconsumedHeroOnly,
 retainedFacts:{count:projected.flatMap(c=>Object.values(c.facts)).length,nullValues:projected.flatMap(c=>Object.values(c.facts)).filter(f=>f.value===null).length,sourceLess:projected.flatMap(c=>Object.values(c.facts)).filter(f=>f.sourceIds.length===0).length,withIssues:projected.flatMap(c=>Object.values(c.facts)).filter(f=>f.issues.length).length},
 summarySnapshotRefs:cars.reduce((n,c)=>n+(c.buyerSummary?.expectedSourceSnapshots?.length||0),0),
 helperSHA256:sha(read(path.join(app,'src/lib/page-evidence.ts'))),testSHA256:sha(read(path.join(app,'tests/page-evidence.test.ts'))),
 measurementSHA256:sha(read(path.join(app,'qa/page-source-scope-measurement.json')))
};
const output=path.join(root,'roadmark-research/page-source-static-graph-audit.json');
fs.writeFileSync(output,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({...out,groups:Object.fromEntries(Object.entries(out.groups).map(([k,v])=>[k,{...v,flaggedSources:v.flaggedSources.length}]))},null,2));
