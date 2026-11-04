#!/usr/bin/env python3
"""Bind bus source copy to the actual frozen app snapshot. Research-only writes."""
import copy,hashlib,json,collections
from pathlib import Path
R=Path('/workspace/scratch/586427eef9f2/roadmark-research'); A=R.parent/'roadmark-work/roadmark'; DATE='2026-10-10'
read=lambda n:json.loads((R/n).read_text()); sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest(); canon=lambda o:json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode(); unique=lambda xs:list(dict.fromkeys(xs)); pref=lambda s:'r10_bus_'+s
original=read('bus-selling-points-proposal.json');delta=read('bus-integration-staged-delta.json');snapshot=read('bus-binding-effective-snapshot.json');sv=read('bus-selling-points-validation.json')
cars={c['id']:c for c in snapshot['cars']}
review=read('bus-condition-explanation-review.json');before_display=read('bus-condition-explanation-before.json')
assert review['status']=='applied_condition_explanation_only' and review['stageSHA256']==sha(R/'bus-integration-staged-delta.json')
strip_explanation=lambda obj:({k:strip_explanation(v) for k,v in obj.items() if k!='conditionExplanation'} if isinstance(obj,dict) else [strip_explanation(x) for x in obj] if isinstance(obj,list) else obj)
assert strip_explanation(before_display)==strip_explanation(delta)
assert len(review['changes'])==194
for row in review['changes']:
 old=next(f for f in before_display['facts'] if f['variantId']==row['variantId'] and f['key']==row['key']);new=next(f for f in delta['facts'] if f['variantId']==row['variantId'] and f['key']==row['key'])
 assert old.get('conditionExplanation')==row['before'] and new.get('conditionExplanation')==row['after']
 assert cars[row['variantId']]['facts'][row['key']].get('conditionExplanation')==row['after']
assert sv['passed'] and not sv['runtimeValidationPerformed'];ids=delta['ids'];cars={c['id']:c for c in snapshot['cars']};sources={s['id']:s for s in snapshot['sources']}
assert len(ids)==7 and set(ids)=={r['sourceRecordId'] for r in original['records']} and len(cars)==7
assert snapshot['priorCarsUnchanged']==274 and snapshot['priorCarsSerializedDeepEqual']
old_deps={d['id']:d for d in original['dependencies']}; used=unique(d for rec in original['records'] for d in rec['allDependencyIds']); assert len(used)==840
for i in original['inputs']:assert sha(i['path'])==i['sha256']
file_cache={}; verified_files={}; checks=[]
def verify_file(p,h):
 if p not in verified_files:verified_files[p]=sha(p)
 assert verified_files[p]==h,p
for row in delta['sourceHashes']:verify_file(row['path'],row['sha256'])
for d in original['dependencies']:
 verify_file(d['sourceEvidenceFile'],d['sourceEvidenceFileSha256'])
 e=file_cache.setdefault(d['sourceEvidenceFile'],json.loads(Path(d['sourceEvidenceFile']).read_text()))
 for bit in d['sourceJsonPointer'].strip('/').split('/'):
  bit=bit.replace('~1','/').replace('~0','~');e=e[int(bit)] if isinstance(e,list) else e[bit]
 assert e==d['sourceSnapshot'] and hashlib.sha256(canon(e)).hexdigest()==d['sourceObjectSha256'],d['id']
 for ev in d['evidence']:
  verify_file(ev['originalSnapshotPath'],ev['originalSha256'])
  if ev.get('textSnapshotPath'):verify_file(ev['textSnapshotPath'],ev['textSha256'])
  if ev.get('textLineStart'):
   lines=Path(ev['textSnapshotPath']).read_text().splitlines(); assert hashlib.sha256('\n'.join(lines[ev['textLineStart']-1:ev['textLineEnd']]).encode()).hexdigest()==ev['textRangeSha256']
map_by_path=collections.defaultdict(list)
for m in delta['mapping']:
 assert cars[m['variantId']]['facts'][m['key']]['value']==m['effectiveValue'] and cars[m['variantId']]['facts'][m['key']]['status']==m['effectiveStatus'];map_by_path[m['sourcePath']].append(m)
whole=lambda c:{k:copy.deepcopy(v) for k,v in c.items() if k not in ('buyerSummary','availabilityEvidence')}
deps={};bindings={}
# Source-bearing effective facts get explicit full-object dependencies. Unsourced
# unknowns are guarded by complete fact maps, never by invented source IDs.
for rid,vid in ids.items():
 for key,f in cars[vid]['facts'].items():
  if not f['sourceIds']:continue
  assert not f['issues'];did=f'fact:{vid}:{key}'
  deps[did]={'id':did,'kind':'fact','variantId':vid,'key':key,'expectedValue':copy.deepcopy(f['value']),'expectedStatus':f['status'],'expectedUnit':f['unit'],'expectedBasis':f['basis'],'expectedComparisonBasis':f.get('comparisonBasis'),'expectedMarket':f.get('market'),'expectedScope':f.get('scope'),'expectedQualifications':copy.deepcopy(f['qualifications']),'expectedConditionExplanation':f.get('conditionExplanation'),'expectedEffectiveFact':copy.deepcopy(f),'sourceIds':copy.deepcopy(f['sourceIds']),'checkedAt':DATE}
for did in used:
 d=old_deps[did];rid=d['sourceRecordId'];vid=ids.get(rid);keys=[]
 if d['kind']=='source_fact':
  rows=map_by_path.get(d['sourceEvidenceFile']+'#'+d['sourceJsonPointer'],[])+map_by_path.get('records/'+rid+'/facts/'+d['key'],[])
  keys=unique(x['key'] for x in rows);assert keys,did
 elif d['kind']=='boundary_field':
  target=d['sourceSnapshot']['target'];key=target.split('.')[-1]
  if key in cars[vid]['facts']:keys=[key]
  else:assert target in ['identity.model_year','variant.model_year','model_year','variants[].model_year'],(did,target)
 elif d['kind']=='source_option':
  keys=unique(m['key'] for m in delta['mapping'] if m['recordId']==rid and (m['sourcePath'].startswith(d['sourceEvidenceFile']+'#'+d['sourceJsonPointer']+'/') or m['sourcePath'].startswith(d['sourceJsonPointer'].lstrip('/')+'/')))
 runtime=unique(f'fact:{vid}:{k}' for k in keys if f'fact:{vid}:{k}' in deps)
 cited=unique(pref(s) for s in d['sourceIds']);assert all(s in sources for s in cited)
 consumers=[ids[r['sourceRecordId']] for r in original['records'] if did in r['allDependencyIds']]
 row={'researchDependencyId':did,'sourceRecordId':rid,'variantId':vid,'bindingType':d['kind'],'sourceJsonPointer':d['sourceJsonPointer'],'sourceEvidenceFile':d['sourceEvidenceFile'],'sourceObjectSha256':d['sourceObjectSha256'],'sourceIds':cited,'factKeys':keys,'runtimeDependencyIds':runtime,'guardedVariantIds':consumers,'guards':['exact own complete effective fact map including aliases, held/null values, optional-layout fields and unsourced unknowns','exact current identity and availability','exact referenced source metadata snapshots','source object/file/locator hashes checked at binding and validation']}
 if d['kind']=='source_fact':
  row.update(rawValue=copy.deepcopy(d['expectedValue']),effectiveValues={k:copy.deepcopy(cars[vid]['facts'][k]['value']) for k in keys},unknownSemantics='Held/unknown effective values stay held; raw claims remain source context, never inferred zeros or positive capabilities',transformation='exact staged field mapping, with all source-normalization holds retained')
 bindings[did]=row
records=[]
for old in original['records']:
 rec=copy.deepcopy(old);rid=rec['sourceRecordId'];vid=ids[rid];car=cars[vid]
 assert car['year'] is None and car['facts']['seats']['value'] is None and car['vehicleClass']=='bus' and car['availabilityEvidence']['orderStatus']=='listed_unconfirmed' and car['availabilityEvidence']['stockStatus']=='unverified'
 rec.update(variantId=vid,expectedIdentity=whole(car),expectedAvailabilityEvidence=copy.deepcopy(car['availabilityEvidence']),availabilityRevision=car.get('availabilityRevision',''))
 # The shared boundary summary explicitly names all seven recommended base IDs.
 # Preserve these as related records; optional/excluded rows stay context only.
 related=unique(ids[x] for x in old_deps['boundary_rule:all:summary']['sourceSnapshot']['recommendedBaseIds'] if ids[x]!=vid)
 rec['expectedRelatedIdentities']={i:whole(cars[i]) for i in related};rec['expectedRelatedAvailabilityEvidence']={i:copy.deepcopy(cars[i]['availabilityEvidence']) for i in related}
 fact_deps=[d for d in deps if deps[d]['variantId']==vid]
 guard_sources=unique([s for target in [vid]+related for s in cars[target]['availabilityEvidence']['sourceIds']]+[s for d in rec['allDependencyIds'] for s in bindings[d]['sourceIds']]+[s for target in [vid]+related for f in cars[target]['facts'].values() for s in f['sourceIds']])
 assert guard_sources and all(not any(sources[s].get(k) for k in ['conflict','publication_hold','access_limitation']) for s in guard_sources)
 rec['availabilityGuardSourceIds']=guard_sources
 mid=f'variant:{vid}:model_year';deps[mid]={'id':mid,'kind':'variant_property','variantId':vid,'key':'model_year','expectedValue':None,'sourceIds':copy.deepcopy(car['availabilityEvidence']['sourceIds']),'checkedAt':DATE};rec['modelYearDependency']=mid
 rec['runtimeContextBindings']=[copy.deepcopy(bindings[d]) for d in rec['allDependencyIds']]
 for part in ['strength','tradeoff']:
  c=rec[part];c['researchDependencyIds']=copy.deepcopy(c['dependencyIds']);c['researchContextDependencyIds']=copy.deepcopy(c['contextDependencyIds']);c['dependencyIds']=fact_deps[:];c['contextDependencyIds']=[]
  c['researchSourceIds']=copy.deepcopy(c['sourceIds']);c['sourceIds']=unique(s for d in fact_deps for s in deps[d]['sourceIds']);assert c['dependencyIds'] and c['derivations']==[]
 for condition in rec['visibleConditionBindings']:
  condition['researchDependencyIds']=copy.deepcopy(condition['dependencyIds']);condition['runtimeBindings']=[copy.deepcopy(bindings[d]) for d in condition['dependencyIds']];condition['dependencyIds']=unique(rd for d in condition['researchDependencyIds'] for rd in bindings[d]['runtimeDependencyIds']);condition['recordGuardsRequired']=True
 rec['runtimeBinding']={'status':'bound_runtime_validation_pending','snapshotSha256':sha(R/'bus-binding-effective-snapshot.json'),'completeFactMap':True,'allReferencedDependenciesBound':True,'relatedRecords':len(related)}
 records.append(rec)
accepted=sorted({s for r in records for s in r['availabilityGuardSourceIds']}|{s for d in deps.values() for s in d['sourceIds']});excluded=sorted(set(sources)-set(accepted))
proposal=copy.deepcopy(original);proposal.update(schemaVersion='bus-effective-editorial-1',status='bound_runtime_validation_pending',records=records,dependencies=list(deps.values()),researchDependencies=copy.deepcopy(original['dependencies']),researchDependencyBindings=list(bindings.values()),unreferencedResearchDependencyIds=sorted(set(old_deps)-set(used)),expectedSourceSnapshots=[copy.deepcopy(sources[s]) for s in accepted],excludedSourceSnapshots=[copy.deepcopy(sources[s]) for s in excluded],sourceProposal={'path':str(R/'bus-selling-points-proposal.json'),'sha256':sha(R/'bus-selling-points-proposal.json')})
proposal['bindingRequirements']=['Append only seven records, their executable dependencies and source snapshots; preserve all 270 prior summaries and 274 prior serialized cars.','Every complete own fact map, identity, availability, source metadata and all 310 required visible conditions are mandatory guards.','Null model year and generic seats remain null; seated passengers, standees and driver seats remain separate. All malformed battery, total-capacity, mini-bus and optional-layout conflicts stay held.','Fleetmaster derivative, Citirider and U18 stay excluded from detail records. No stock, open-order, road-approval, station-power conversion or voltage arithmetic claims.','Raw source/object/locator hashes are proof-time guards; runtime guards effective facts and exact accepted source metadata. Shared counting-summary identities guard all seven existing buses; excluded identities stay source-copy audit boundaries and future unrelated additions do not alter counts automatically.','The shared counting boundary names all seven buses, producing 42 non-self related identity/availability guards. Every related fact map remains exact.']
proposal['approvedDisplayRefinement']={'path':str(R/'bus-condition-explanation-review.json'),'sha256':sha(R/'bus-condition-explanation-review.json'),'changedConditionalExplanations':194,'scope':'Only inline conditionExplanation shortened; every full qualification, source locator, value, status, basis, technical comparison basis, identity and availability unchanged'}
proposal['sourceFileManifest']=[{'path':p,'sha256':h} for p,h in sorted(verified_files.items())]
proposal['applicationInputs']=[{'path':str(R/n),'sha256':sha(R/n)} for n in ['bus-selling-points-proposal.json','bus-selling-points-proposal.md','bus-selling-points-validation.json','bus-integration-staged-delta.json','bus-condition-explanation-review.json','bus-condition-explanation-before.json','bus-binding-effective-snapshot.json','bus-runtime-effective-snapshot.json','bus-runtime-input-lock.json','bus-prior-buyer-selling-points.json','pre-bus-catalogue.json']]+copy.deepcopy(original['inputs'])
proposal['summary'].update(executableDependencies=len(deps),sourceSnapshots=len(accepted),boundReferencedDependencies=len(bindings),completeEffectiveFactsGuarded=sum(len(c['facts']) for c in cars.values()),sourceLessUnknownFacts=sum(f['value'] is None and not f['sourceIds'] for c in cars.values() for f in c['facts'].values()),sourcedUnknownFacts=sum(f['value'] is None and bool(f['sourceIds']) for c in cars.values() for f in c['facts'].values()),requiredVisibleConditions=sum(len(r['requiredVisibleConditions']) for r in records),actualRelatedRecords=sum(len(r['expectedRelatedIdentities']) for r in records),applicationEdits=0)
record_keys=['variantId','checkedAt','modelYearDependency','availabilityRevision','expectedIdentity','expectedAvailabilityEvidence','expectedRelatedIdentities','expectedRelatedAvailabilityEvidence','availabilityGuardSourceIds','requiredVisibleConditions'];pick=lambda o,ks:{k:copy.deepcopy(o[k]) for k in ks if k in o}
payload={'schemaVersion':'bus-runtime-merge-payload-1','checkedAt':DATE,'status':'runtime_validation_pending','records':[{**pick(rec,record_keys),**{part:pick(rec[part],['label','text','dependencyIds','derivations']) for part in ['strength','tradeoff']}} for rec in records],'dependencies':copy.deepcopy(proposal['dependencies']),'expectedSourceSnapshots':copy.deepcopy(proposal['expectedSourceSnapshots'])}
copy_report={'status':'passed_exact_source_copy_and_binding','sourceProposalSha256':sha(R/'bus-selling-points-proposal.json'),'records':[], 'referencedDependencyCount':len(bindings),'preservedSourceDependencies':len(old_deps),'sourceFilesVerified':len(verified_files),'sourceObjectsVerified':len(old_deps),'unitArithmeticPerformed':False,'applicationEdits':0}
for old,rec in zip(original['records'],records):
 row={'sourceRecordId':old['sourceRecordId'],'variantId':rec['variantId'],'checks':{}}
 for part in ['strength','tradeoff']:
  for key in ['label','text']:
   assert old[part][key]==rec[part][key];row['checks'][part+'_'+key]=True
 assert old['requiredVisibleConditions']==rec['requiredVisibleConditions'];assert [c['text'] for c in rec['visibleConditionBindings']]==rec['requiredVisibleConditions'];row['checks']['allVisibleConditions']=True;row['visibleConditions']=len(rec['requiredVisibleConditions']);copy_report['records'].append(row)
copy_report['sourceFactMappings']=[{'researchDependencyId':b['researchDependencyId'],'factKeys':b['factKeys'],'rawValue':b['rawValue'],'effectiveValues':b['effectiveValues']} for b in bindings.values() if b['bindingType']=='source_fact']
copy_report['sourceOptionMappings']=[{'researchDependencyId':b['researchDependencyId'],'factKeys':b['factKeys'],'runtimeDependencyIds':b['runtimeDependencyIds'],'guardedVariantIds':b['guardedVariantIds']} for b in bindings.values() if b['bindingType']=='source_option']
assert sum(len(b['factKeys']) for b in copy_report['sourceOptionMappings'])==30
assert sum(bool(b['factKeys']) for b in copy_report['sourceOptionMappings'])==13
copy_report['preservedLedgers']={k:True for k in ['holdLedger','epochBoundaries','availabilityEvidenceBoundaries','excludedAmbiguousCases','deliberatelyNotClaimed','countingPolicy','optionalNamedDerivatives','auditOnlyRecords'] if proposal[k]==original[k]}
for name,obj in [('bus-runtime-selling-points-proposal.json',proposal),('bus-runtime-selling-points-merge-payload.json',payload),('bus-runtime-source-copy-match.json',copy_report)]: (R/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(proposal['summary'],indent=2))
