#!/usr/bin/env python3
"""Bind frozen Hyundai evidence to exact runtime snapshots; research outputs only."""
import copy, hashlib, json
from pathlib import Path
R=Path('/workspace/scratch/586427eef9f2/roadmark-research')
DATE='2026-10-10'
SOURCE_SHA='87addee8dcd5dffc87a35ece14850e90524fdc86bb0e84ae45080358fe0c162f'
EVIDENCE_SHA='583ce8eef94314a10003be3c48f346e67c432a6dfa827872543d677daa3f5e4d'
read=lambda name:json.loads((R/name).read_text())
sha=lambda path:hashlib.sha256(Path(path).read_bytes()).hexdigest()
canon=lambda value:json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
unique=lambda values:list(dict.fromkeys(values))
prefix=lambda sid:'r10_hy_'+sid
assert sha(R/'remaining-hyundai-selling-points-proposal.json')==SOURCE_SHA
assert sha(R/'remaining-hyundai-evidence.json')==EVIDENCE_SHA
original=read('remaining-hyundai-selling-points-proposal.json'); evidence=read('remaining-hyundai-evidence.json')
ids=read('hyundai-integrated-ids.json'); field_map=read('hyundai-field-map.json')
snapshot=read('hyundai-runtime-effective-snapshot.json'); cars={c['id']:c for c in snapshot['cars']}; sources={s['id']:s for s in snapshot['sources']}
assert len(cars)==12 and set(cars)==set(ids.values()) and set(ids)=={r['sourceRecordId'] for r in original['records']}
assert snapshot['priorCarCount']==262 and snapshot['priorCarsSerializedDeepEqual']
assert len(original['conflictLedger'])==23 and len(original['holdLedger'])==20 and len(original['optionContextLedger'])==4
assert sum(c['availabilityEvidence']['stockStatus']=='new_stock_listed' for c in cars.values())==4
assert cars[ids['hyundai-ioniq-5-n-84-awd']]['year'] is None
assert cars[ids['hyundai-ioniq-6-n-84-awd']]['availabilityEvidence']['stockStatus']=='not_verified'
whole_record=lambda car:{k:copy.deepcopy(v) for k,v in car.items() if k not in ('availabilityEvidence','buyerSummary')}
def family_targets(rid):
 if rid=='all':return sorted(cars)
 return sorted(v for v,c in cars.items() if c['modelFamily']==cars[ids[rid]]['modelFamily'])
def pointer(path):
 obj=evidence
 for bit in path.strip('/').split('/'):
  bit=bit.replace('~1','/').replace('~0','~');obj=obj[int(bit)] if isinstance(obj,list) else obj[bit]
 return obj
old_deps={d['id']:d for d in original['dependencies']}; lead_ids={d for r in original['records'] for part in ('strength','tradeoff') for d in r[part]['dependencyIds']}
# Only reviewed sources actually backing effective records may participate in runtime
# support. Chullora's IONIQ5N advert is a held MY/roof lead, never exact-current support.
runtime_backing={s for c in cars.values() for f in c['facts'].values() for s in f['sourceIds']}|{s for c in cars.values() for s in c['availabilityEvidence']['sourceIds']}
explicit_held={prefix('hn_chullora_ioniq5n_new')}
unusable={s['id'] for s in snapshot['sources'] if any(s.get(k) for k in ('conflict','publication_hold','access_limitation'))}
accepted=runtime_backing-explicit_held-unusable
excluded=set(sources)-accepted
assert not accepted&unusable
exclusion_reasons={sid:('Failed/blocked/redirected research capture' if sid in unusable else 'MY/roof-held IONIQ5N grade advert; no exact-current support' if sid in explicit_held else 'Research-only negative, legacy, rejected or unused contextual lead; not effective support') for sid in excluded}
deps={}; bindings={}; checks=[]
def bind_fact(old):
 rid=old['sourceRecordId'];vid=ids[rid]
 map_key='facts.'+old['key'] if old['kind']=='source_fact' else 'features.'+old['sourceJsonPointer'].split('/')[-1]
 key=field_map[rid][map_key];fact=cars[vid]['facts'][key];raw=old['expectedValue']
 assert fact['value']==raw,(old['id'],raw,fact['value'])
 assert set(fact['sourceIds'])=={prefix(s) for s in old['sourceIds']},old['id']
 assert not fact['issues']
 row={'researchDependencyId':old['id'],'sourceRecordId':rid,'variantId':vid,'guardedVariantIds':[vid],'runtimeDependencyIds':[],
  'factKeys':[key],'sourceIds':[s for s in fact['sourceIds'] if s in accepted],'excludedSourceIds':[s for s in fact['sourceIds'] if s in excluded],
  'guards':['exact complete effective fact map, including source-less unknowns, omitted fields and option-child facts'],'rawValue':copy.deepcopy(raw),'effectiveValue':copy.deepcopy(fact['value']),'transformation':'exact source value preserved'}
 if fact['sourceIds'] and not row['excludedSourceIds']:
  did=f'fact:{vid}:{key}'
  if did not in deps:
   deps[did]={'id':did,'kind':'fact','variantId':vid,'key':key,'expectedValue':copy.deepcopy(fact['value']),
    'expectedStatus':fact['status'],'expectedUnit':fact['unit'],'expectedBasis':fact['basis'],
    'expectedComparisonBasis':fact.get('comparisonBasis'),'expectedMarket':fact.get('market'),'expectedScope':fact.get('scope'),
    'expectedQualifications':copy.deepcopy(fact['qualifications']),'expectedConditionExplanation':fact.get('conditionExplanation'),
    'expectedEffectiveFact':copy.deepcopy(fact),'sourceIds':list(fact['sourceIds']),'checkedAt':DATE,
    'sourceRecordId':rid,'researchDependencyId':old['id'],'researchEvidence':copy.deepcopy(old)}
  row['runtimeDependencyIds']=[did];row['bindingType']='sourced_effective_fact';row['guards']+=['exact expectedEffectiveFact','exact accepted expectedSourceSnapshots']
 else:
  assert old['id'] not in lead_ids
  assert raw is None or row['excludedSourceIds']
  row['bindingType']='source_less_unknown_guarded_by_complete_fact_map' if not fact['sourceIds'] else 'held_source_interpretation_guarded_by_complete_fact_map'
  row['unknownSemantics']='Unresolved/held evidence remains unresolved; no fabricated source or zero/absence inference'
 checks.append({'sourceDependencyId':old['id'],'variantId':vid,'key':key,'sourceValue':raw,'effectiveValue':fact['value'],'leadClaim':old['id'] in lead_ids,'sourceMembershipExact':True,'unitConversion':False})
 return row
for i in original['inputs']:assert sha(i['path'])==i['sha256']
for old in original['dependencies']:
 assert sha(old['sourceEvidenceFile'])==old['sourceEvidenceFileSha256'];obj=pointer(old['sourceJsonPointer']);assert obj==old['sourceSnapshot'];assert hashlib.sha256(canon(obj)).hexdigest()==old['sourceObjectSha256']
 for e in old['evidence']:
  assert sha(e['originalSnapshotPath'])==e['originalSha256']
  if e.get('textSnapshotPath'):assert sha(e['textSnapshotPath'])==e['textSha256']
  if e.get('textLineStart'):
   lines=Path(e['textSnapshotPath']).read_text().splitlines();assert hashlib.sha256('\n'.join(lines[e['textLineStart']-1:e['textLineEnd']]).encode()).hexdigest()==e['textRangeSha256']
 if old['kind'] in ('source_fact','source_feature'):bindings[old['id']]=bind_fact(old)
for old in original['dependencies']:
 if old['id'] in bindings:continue
 rid=old['sourceRecordId'];cited=unique(prefix(s) for s in old['sourceIds'])
 if old['kind']=='source_document':cited=[prefix(old['key'])]
 assert all(s in sources for s in cited)
 row={'researchDependencyId':old['id'],'sourceRecordId':rid,'variantId':ids.get(rid),'guardedVariantIds':family_targets(rid),'runtimeDependencyIds':[],
  'sourceIds':[s for s in cited if s in accepted],'excludedSourceIds':[s for s in cited if s in excluded],
  'sourceJsonPointer':old['sourceJsonPointer'],'sourceObjectSha256':old['sourceObjectSha256'],'bindingType':old['kind'],
  'guards':['exact own/related identities and complete effective fact maps','exact own/related availability','accepted source metadata snapshots','hashed original research source/scope/caution interpretation'],
  'sourceSnapshot':copy.deepcopy(old['sourceSnapshot'])}
 if rid!='all':row['identityFields']=['id','modelFamily','trim','year','generation','vehicleClass'];row['factKeys']=list(cars[ids[rid]]['facts'])
 if old['kind']=='source_scope' and rid!='all':
  field={'brand':'brand','model':'model','familyId':'modelFamily','configurationName':'trim','technicalEpoch':'generation','modelYear':'year'}.get(old['key'])
  if field:assert cars[ids[rid]][field]==old['expectedValue'],(old['id'],cars[ids[rid]][field],old['expectedValue'])
 if old['kind']=='source_global':row['scopeNote']='Source counting is hash-checked at build/validation; runtime guards explicit own/related records, not unrelated future catalogue additions.'
 if row['excludedSourceIds']:row['exclusionNote']='Excluded research leads retain downloaded/object hashes and exact current interpretation but cannot support, create, rescue or poison runtime summary eligibility.'
 bindings[old['id']]=row
bound_ids=lambda source_ids:unique(did for sid in source_ids for did in bindings[sid]['runtimeDependencyIds'])
proposal=copy.deepcopy(original)
for rec in proposal['records']:
 rid=rec['sourceRecordId'];vid=ids[rid];car=cars[vid];assert car['vehicleClass']=='passenger' and car['availability']=='current_or_order_listed'
 rec['variantId']=vid;rec['expectedIdentity']=whole_record(car);rec['expectedAvailabilityEvidence']=copy.deepcopy(car['availabilityEvidence']);rec['availabilityRevision']=car.get('availabilityRevision','')
 rec['sourceContextDependencyIds']=copy.deepcopy(rec['contextDependencyIds']);rec['sourceClauseDependencyIds']=copy.deepcopy(rec['clauseDependencyIds'])
 rec['contextDependencyIds']=bound_ids(rec['sourceContextDependencyIds']);rec['clauseDependencyIds']=bound_ids(rec['sourceClauseDependencyIds'])
 all_ids=rec['allDependencyIds'];rec['runtimeContextBindings']=[copy.deepcopy(bindings[d]) for d in all_ids]
 related=[other for other in family_targets(rid) if other!=vid]
 # Include every explicitly named identity from clauses AND visible conditions,
 # even if future source copy names a record outside the family.
 guards=[g for part in ('strength','tradeoff') for g in rec[part].get('contextIdentityGuards',[])]+[g for c in rec['visibleConditionBindings'] for g in c.get('contextIdentityGuards',[])]
 related=sorted(set(related)|{ids[g['sourceRecordId']] for g in guards if ids[g['sourceRecordId']]!=vid})
 rec['expectedRelatedIdentities']={other:whole_record(cars[other]) for other in related}
 rec['expectedRelatedAvailabilityEvidence']={other:copy.deepcopy(cars[other]['availabilityEvidence']) for other in related}
 guard_sources=unique([s for target in [vid]+related for s in cars[target]['availabilityEvidence']['sourceIds'] if s in accepted]+[s for d in all_ids for s in bindings[d]['sourceIds']]+[s for target in [vid]+related for f in cars[target]['facts'].values() for s in f['sourceIds'] if s in accepted])
 rec['availabilityGuardSourceIds']=guard_sources;rec['guardSourceScope']='Accepted effective/source-context metadata only; failed, held and unused research leads remain hashed exclusion provenance.'
 rec['excludedResearchSourceIds']=unique([s for d in all_ids for s in bindings[d]['excludedSourceIds']]+[s for target in [vid]+related for f in cars[target]['facts'].values() for s in f['sourceIds'] if s in excluded])
 mid=f'variant:{vid}:model_year';deps[mid]={'id':mid,'kind':'variant_property','variantId':vid,'key':'model_year','expectedValue':car['year'],'sourceIds':[s for s in car['availabilityEvidence']['sourceIds'] if s in accepted],'checkedAt':DATE,'basis':'Exact current configuration MY; null remains unknown, never inferred from retrieval year, held dealer MY or related package.'};assert deps[mid]['sourceIds'];rec['modelYearDependency']=mid
 for part in ('strength','tradeoff'):
  clause=rec[part];clause['researchDependencyIds']=copy.deepcopy(clause['dependencyIds']);clause['researchContextDependencyIds']=copy.deepcopy(clause['contextDependencyIds'])
  clause['dependencyIds']=unique(bound_ids(clause['researchDependencyIds']+clause['researchContextDependencyIds'])+rec['contextDependencyIds']);clause['contextDependencyIds']=bound_ids(clause['researchContextDependencyIds']);clause['sourceIds']=unique(s for d in clause['dependencyIds'] for s in deps[d]['sourceIds'])
  clause['researchLabelDependencyIds']=clause.pop('labelDependencyIds');clause['researchAssertions']=clause.pop('assertions');assert clause['dependencyIds'] and not clause['derivations']
 for c in rec['visibleConditionBindings']:
  c['researchDependencyIds']=copy.deepcopy(c['dependencyIds']);c['dependencyIds']=bound_ids(c['researchDependencyIds']);c['runtimeBindings']=[copy.deepcopy(bindings[d]) for d in c['researchDependencyIds']]
  c['researchSourceIds']=copy.deepcopy(c['sourceIds']);c['sourceIds']=[prefix(s) for s in c['sourceIds'] if prefix(s) in accepted];c['excludedSourceIds']=[prefix(s) for s in c['researchSourceIds'] if prefix(s) in excluded];c['recordGuardsRequired']=True
 rec['runtimeBinding']={'status':'bound_effective_snapshot_runtime_validation_pending','integratedVariantId':vid,'effectiveSnapshotSha256':sha(R/'hyundai-runtime-effective-snapshot.json'),'exactIdentityGuard':True,'exactCompleteFactMapGuard':True,'exactAvailabilityGuard':True,'relatedConfigurationGuards':len(related)}
 rec['status']='bound_effective_snapshot_runtime_validation_pending';rec['copyReadyWhen']='Runtime and fail-closed mutation validation must pass with all source, fact-map, identity, availability, option and visible-condition guards retained.'
used_sources={s for d in deps.values() for s in d['sourceIds']}|{s for r in proposal['records'] for s in r['availabilityGuardSourceIds']}
assert used_sources==accepted and not used_sources&excluded
assert set(bindings)==set(old_deps)
assert {d for r in proposal['records'] for d in r['allDependencyIds']} <= set(old_deps)
proposal.update(schemaVersion='hyundai-effective-editorial-1',status='bound_effective_snapshot_runtime_validation_pending',dependencies=list(deps.values()),researchDependencies=copy.deepcopy(original['dependencies']),researchDependencyBindings=list(bindings.values()),expectedSourceSnapshots=[copy.deepcopy(sources[s]) for s in sorted(used_sources)],excludedSourceSnapshots=[copy.deepcopy(sources[s]) for s in sorted(excluded)],excludedSourceReasons=exclusion_reasons,sourceStageBindingRequirements=copy.deepcopy(original['bindingRequirements']),bindingChecks=checks,sourceProposal={'path':str(R/'remaining-hyundai-selling-points-proposal.json'),'sha256':SOURCE_SHA},approvedRuntimeRefinements=[{'field':'IONIQ6N core availability.stockStatus','value':'not_verified','reason':'Exact New ad is only sunroof child; no core badge inheritance'},{'field':'IONIQ5N source guard membership','excludedSourceId':prefix('hn_chullora_ioniq5n_new'),'reason':'MY/roof-held advertisement remains negative provenance, not exact-current support'}],sourceMetadataRefinements=[],canonicalAliases=read('hyundai-canonical-aliases.json'),featureAliases=read('hyundai-feature-aliases.json'))
proposal['bindingRequirements']=['Append only these 12 records, dependencies and accepted source snapshots; preserve all existing 258 eligible summaries and their rows/snapshots unchanged.','Retain complete own/related fact maps, identity, availability, accepted-source snapshots and every visible condition. Unknown/held/null values and option-child facts must remain guarded.','IONIQ5N formal MY and exact dealer epoch/roof stay held. IONIQ6N core New badge stays unverified; its exact New advert concerns only the sunroof child.','12 core configurations / 6 existing families / 10 marketing grades / 4 non-additive option children; retain 23 conflicts and 20 holds verbatim.','Runtime guards metadata and current facts; downloaded source/object/locator/copy hashes are separately checked at binding/validation. Editorial proposal tampering requires source-copy revalidation.','Failed, rejected, epoch-held and unused research leads cannot support, rescue or poison runtime summary eligibility.']
input_names=['remaining-hyundai-evidence.json','remaining-hyundai-manifest.json','remaining-hyundai-selling-points-proposal.json','hyundai-integrated-ids.json','hyundai-field-map.json','hyundai-runtime-effective-snapshot.json','hyundai-feature-aliases.json','hyundai-canonical-aliases.json','pre-hyundai-remaining-catalogue.json']
proposal['applicationInputs']=[{'path':str(R/n),'sha256':sha(R/n)} for n in input_names]
proposal['summary'].update(executableDependencies=len(deps),exactSourceSnapshots=len(used_sources),runtimeMappedResearchDependencies=len(bindings),sourceLessUnknownFacts=sum(b['bindingType']=='source_less_unknown_guarded_by_complete_fact_map' for b in bindings.values()),requiredVisibleConditions=sum(len(r['requiredVisibleConditions']) for r in proposal['records']),relatedConfigurationRecords=sum(bool(r['expectedRelatedIdentities']) for r in proposal['records']),completeEffectiveFactsGuarded=sum(len(c['facts']) for c in cars.values()),priorCarsSerializedDeepEqual=262,runtimeCoreNewStockCount=4,applicationEdits=0)
proposal['sourceFileManifest']=read('remaining-hyundai-manifest.json')['sourceFiles']
assert len(proposal['sourceFileManifest'])==309
for item in proposal['sourceFileManifest']:assert sha(item['path'])==item['sha256']
proposal['validation']={'status':'static_binding_pass_runtime_pending','unmappedResearchDependencies':0,'leadValueDrift':0,'sourceMembershipDrift':0,'unitConversions':0,'applicationEdits':0}
(R/'hyundai-runtime-selling-points-proposal.json').write_text(json.dumps(proposal,ensure_ascii=False,indent=2)+'\n')
record_keys=['variantId','checkedAt','modelYearDependency','availabilityScope','availabilityRevision','expectedIdentity','expectedAvailabilityEvidence','expectedRelatedIdentities','expectedRelatedAvailabilityEvidence','availabilityGuardSourceIds','requiredVisibleConditions']
dep_keys=['id','kind','variantId','key','expectedValue','expectedStatus','expectedUnit','expectedBasis','expectedComparisonBasis','expectedMarket','expectedScope','expectedQualifications','expectedConditionExplanation','expectedConditions','expectedEffectiveFact','sourceIds','checkedAt']
pick=lambda obj,keys:{k:copy.deepcopy(obj[k]) for k in keys if k in obj}
records=[]
for rec in proposal['records']:
 row=pick(rec,record_keys)
 for part in ('strength','tradeoff'):row[part]=pick(rec[part],['label','text','dependencyIds','derivations'])
 records.append(row)
payload={'schemaVersion':'hyundai-runtime-merge-payload-1','checkedAt':DATE,'status':'runtime_validation_pending','records':records,'dependencies':[pick(d,dep_keys) for d in proposal['dependencies']],'expectedSourceSnapshots':copy.deepcopy(proposal['expectedSourceSnapshots'])}
(R/'hyundai-runtime-selling-points-merge-payload.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
lines=['# Runtime-bound Hyundai buyer summaries','','Twelve exact Australian configurations, checked 10 October 2026. Application runtime validation is pending. No application files were written.','','## Binding design','']+['- '+s for s in proposal['bindingRequirements']]+['','## Proposed pairs','']
for rec in proposal['records']:
 lines+=['### '+rec['displayName'],'Runtime ID: `'+rec['variantId']+'`','','Strength — '+rec['strength']['label']+': '+rec['strength']['text'],'','Trade-off — '+rec['tradeoff']['label']+': '+rec['tradeoff']['text'],'','Required visible conditions:']+['- '+s for s in rec['requiredVisibleConditions']]+['']
lines+=['## Reproduce','','Run capture_hyundai_runtime_snapshot.cjs under the app tsx loader, then bind_hyundai_selling_points.py, validate_hyundai_selling_points.cjs under tsx, and finalize_hyundai_selling_points.py.','','## Validation status','','Static mapping passed; actual runtime and mutation validation pending.','']
(R/'hyundai-runtime-selling-points-proposal.md').write_text('\n'.join(lines));print(json.dumps(proposal['summary'],indent=2))
