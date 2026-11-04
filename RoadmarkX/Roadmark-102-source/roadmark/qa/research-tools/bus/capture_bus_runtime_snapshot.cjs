/* Read-only capture and recursive executable input lock for seven bus summaries. */
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const A='/workspace/scratch/586427eef9f2/roadmark-work/roadmark',R='/workspace/scratch/586427eef9f2/roadmark-research';
process.chdir(A);
const read=p=>JSON.parse(fs.readFileSync(p));const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');const serial=x=>JSON.parse(JSON.stringify(x));
const seen=new Set();
function scan(p){p=path.resolve(p);if(seen.has(p))return;seen.add(p);if(!/\.[cm]?[jt]sx?$/.test(p))return;const text=fs.readFileSync(p,'utf8');const re=/(?:from\s+|import\s*\(\s*|require\s*\(\s*|import\s*)['"](\.[^'"]+)['"]/g;for(const m of text.matchAll(re)){const base=path.resolve(path.dirname(p),m[1]);const q=[base,...['.ts','.tsx','.js','.json','/index.ts'].map(e=>base+e)].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile());assert.ok(q,'Unresolved import '+m[1]);scan(q);}}
for(const p of ['src/lib/data.ts','src/lib/selling-points.ts'])scan(A+'/'+p);
for(const p of ['data/au_ev_all_variants_2026-10-06.json','data/market-inventory-2026-10-10.json','package.json','pnpm-lock.yaml','tsconfig.json'])scan(A+'/'+p);
const files=[...seen].sort().map(p=>({path:path.relative(A,p),sha256:hash(p)}));
const {catalogue,research,effectiveFeatures}=require(A+'/src/lib/data.ts');const all=serial(catalogue());const data=research();
const ids=new Set(Object.values(read(R+'/bus-integration-staged-delta.json').ids));const prior=read(R+'/pre-bus-catalogue.json');assert.equal(prior.length,274);assert.deepEqual(all.filter(c=>!ids.has(c.id)),prior);assert.equal(all.length,281);
const cars=all.filter(c=>ids.has(c.id)),sources=serial(data.sources.filter(s=>s.id.startsWith('r10_bus_'))),features=serial(cars.flatMap(c=>effectiveFeatures(c,data)));
const supplied=read(R+'/bus-runtime-effective-snapshot.json');assert.deepEqual(cars,supplied.cars);assert.deepEqual(sources,supplied.sources);const suppliedFeatureSnapshotMatches=JSON.stringify(features)===JSON.stringify(supplied.features);const suppliedFeatureSnapshotDifferences=features.filter(f=>JSON.stringify(f)!==JSON.stringify(supplied.features.find(x=>x.variant_id===f.variant_id&&x.criterion===f.criterion))).map(f=>({variantId:f.variant_id,criterion:f.criterion,actual: f,supplied:supplied.features.find(x=>x.variant_id===f.variant_id&&x.criterion===f.criterion)}));
for(const f of files)assert.equal(hash(A+'/'+f.path),f.sha256);
const capturedAt=new Date().toISOString();
const snapshot={capturedAt,suppliedFeatureSnapshotMatches,suppliedFeatureSnapshotDifferences,cars,sources,features,priorCarsUnchanged:274,priorCarsSerializedDeepEqual:true,totalCars:all.length,totalFamilies:new Set(all.map(c=>c.modelFamily||c.family)).size,totalGenerations:new Set(all.map(c=>(c.modelFamily||c.family)+':'+c.generation)).size,applicationInputs:files};
fs.writeFileSync(R+'/bus-binding-effective-snapshot.json',JSON.stringify(snapshot,null,2)+'\n');
fs.writeFileSync(R+'/bus-runtime-input-lock.json',JSON.stringify({capturedAt,scope:'Recursive static import graph of data.ts and selling-points.ts, fs-loaded base catalogue, market inventory, package/lock/TypeScript configuration. Only exact append to buyer-summary data may change after proof.',files},null,2)+'\n');
fs.copyFileSync(A+'/data/buyer-selling-points-2026-10-10.json',R+'/bus-prior-buyer-selling-points.json');
console.log(JSON.stringify({cars:cars.length,sources:sources.length,facts:cars.reduce((n,c)=>n+Object.keys(c.facts).length,0),features:features.length,priorCarsUnchanged:274,runtimeGraphFiles:files.length,capturedAt}));
