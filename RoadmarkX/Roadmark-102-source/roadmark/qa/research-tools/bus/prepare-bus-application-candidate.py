"""Prepare append-only application candidates in research. Never writes the app."""
from pathlib import Path
import copy, hashlib, json
R=Path('/workspace/scratch/586427eef9f2/roadmark-research')
A=R.parent/'roadmark-work/roadmark'
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
stage=R/'bus-integration-staged-delta.json'
assert sha(stage)=='e2a9fcd5f78f5141e7c519a34ec13cfadf294318c9fc5fa084880dcfb2663b55'
s=read(stage); b=read(R/'bus-integration-boundaries.json')
a=read(A/'data/catalogue-additions-2026-10-10.json'); market=read(A/'data/market-inventory-2026-10-10.json')
baseline={n:sha(A/'data'/n) for n in ['catalogue-additions-2026-10-10.json','market-inventory-2026-10-10.json']}
original=copy.deepcopy(a); original_market=copy.deepcopy(market)
assert len(s['variants'])==7
for key in ['models','variants','sources']:
 prior_ids={x['id'] for x in a[key]}; new_ids=[x['id'] for x in s[key]]
 assert len(new_ids)==len(set(new_ids)) and not prior_ids.intersection(new_ids),key
 a[key].extend(copy.deepcopy(s[key]))
for key in ['facts','features']:a[key].extend(copy.deepcopy(s[key]))
for v in s['variants']:
 assert v['vehicle_class']=='bus' and v['model_year'] is None and v['seats'] is None
 assert v['availability_evidence']['orderStatus']=='listed_unconfirmed'
 assert v['availability_evidence']['stockStatus']=='unverified'
 a['auditNotes'].append('2026-10-10: '+v['id']+' added as a bounded published bus body/layout, not a closed factory-order matrix. Passenger, standing and driver capacities remain separate. No stock, accepted-order, comparable passenger range or ranking promotion.')
changed=[]
for bound in b['records']:
 if not bound['admitDetailedVariant']:continue
 family=bound['familyId'];matches=[i for i,r in enumerate(market['records']) if (r.get('familyId') or r.get('id'))==family]
 assert len(matches)==1,(family,matches)
 i=matches[0];r=market['records'][i];v=next(v for v in s['variants'] if v['id']==s['ids'][bound['sourceRecordId']]);old=copy.deepcopy(r)
 r.setdefault('evidenceHistory',[]).append({'checkedAt':old.get('checkedAt'),'sourceArtifact':'market-inventory-before-bus-integration','orderStatus':old.get('orderStatus'),'stockStatus':old.get('stockStatus'),'trims':old.get('trims',[]),'evidenceNote':old.get('evidenceNote'),'limitations':old.get('limitations',[]),'sourceUrls':old.get('sourceUrls',[])})
 for k,val in bound['marketReconciliationSuggestion'].items():
  if k not in ['countAsNewMarketFamily','note']:r[k]=val
 r['trims']=[v['trim']];r['modelYear']=None;r['vehicleClass']='bus';r['catalogueVariantIds']=[v['id']]
 r['checkedAt']='2026-10-10';r['reverifiedAt']='2026-10-10T13:43:00Z'
 r['sourceUrls']=list(dict.fromkeys(r.get('sourceUrls',[])+[x['url'] for x in s['sources'] if x['id'] in v['source_ids']]))
 r['sourceArtifacts']=list(dict.fromkeys(r.get('sourceArtifacts',[])+['yutong-bci-electric-buses-evidence.json','bus-integration-boundaries.json']))
 r['evidenceNote']='One bounded current Australian manufacturer/distributor bus body and layout is documented. Exact factory-order acceptance, delivered build, road approval and unsold New stock remain unconfirmed. This does not close the full bus order matrix.'
 r['limitations']=list(dict.fromkeys(r.get('limitations',[])+v['notes']))
 changed.append({'familyId':family,'recordIndex':i,'variantId':v['id']})
assert len(changed)==7 and len(market['records'])==len(original_market['records'])
assert market['unverifiedLeads']==original_market['unverifiedLeads']
for key in ['models','variants','sources','facts','features']:
 assert a[key][:len(original[key])]==original[key]
source_ids={x['id'] for x in a['sources']};variant_ids={x['id'] for x in a['variants']}
seen=set()
for f in s['facts']:
 assert f['variantId'] in variant_ids and set(f['sourceIds'])<=source_ids
 assert (f['variantId'],f['key']) not in seen;seen.add((f['variantId'],f['key']))
 assert f['status'] in ['conditional','not_verified','unavailable','not_applicable']
 if f['value'] is not None:assert f['sourceIds']
for n in baseline:assert baseline[n]==sha(A/'data'/n)
out={}
for name,obj in [('catalogue-additions',a),('market-inventory',market)]:
 path=R/('bus-candidate-'+name+'.json');path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');out[name]={'path':str(path),'sha256':sha(path)}
report={'status':'prepared_not_applied','applicationWrites':0,'baselineApplicationFiles':baseline,'candidateFiles':out,'newBusConfigurations':7,'newFacts':len(s['facts']),'newSources':len(s['sources']),'unchangedExistingArrays':True,'marketRecordsBefore':len(original_market['records']),'marketRecordsAfter':len(market['records']),'marketChangedRecords':changed,'unverifiedLeadsUnchanged':True,'mustVerifyAfterApplication':['all prior effective cars unchanged','281 total configurations and 119 families','bus-only report capacities remain separated','all seven exact detail pages render unknown comparison fields','stock filter excludes all seven','bind guarded source-copy summaries','full suite, build, mobile-layout and hero checks'],'sourceStageSHA256':sha(stage)}
(R/'bus-application-candidate-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
