#!/usr/bin/env python3
"""Bind seven exact ute/van buyer pairs. Application files are read-only inputs."""
import copy
import hashlib
import json
from pathlib import Path

R = Path('/workspace/scratch/586427eef9f2/roadmark-research')
DATE = '2026-10-10'
read = lambda name: json.loads((R / name).read_text())
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
canon = lambda value: json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
prefix = lambda sid: 'r10_uv_' + sid
unique = lambda values: list(dict.fromkeys(values))
ORIGINAL_SHA = 'cfeff45e8d73f26d2dab8c3ccf9b0937487b544b56f22e502badc0859406360b'
assert sha(R/'remaining-utes-vans-selling-points-proposal.json') == ORIGINAL_SHA
original = read('remaining-utes-vans-selling-points-proposal.json')
evidence = read('remaining-utes-vans-evidence.json')
ids = read('ute-van-integrated-ids.json')
field_map = read('ute-van-field-map.json')
feature_aliases = read('ute-van-feature-aliases.json')
canonical_aliases = read('ute-van-canonical-aliases.json')
supplied = read('ute-van-effective-snapshot.json')
snapshot = read('ute-van-runtime-effective-snapshot.json')
cars = {c['id']: c for c in snapshot['cars']}
sources = {s['id']: s for s in snapshot['sources']}
assert set(ids) == {r['sourceRecordId'] for r in original['records']}
assert set(cars) == set(ids.values()) and len(cars) == 7
assert snapshot['priorCarCount'] == 255 and snapshot['priorCarsSerializedDeepEqual']
without_summary = lambda c: {k:v for k,v in c.items() if k != 'buyerSummary'}
refinements = []
for old_car in supplied['cars']:
    current = without_summary(cars[old_car['id']]); old = copy.deepcopy(without_summary(old_car))
    if current != old:
        if old['id'] == ids['kia-pv5-cargo-s-4dr-long-range-my26']:
            assert old['facts']['warranty']['unit'] == 'years' and current['facts']['warranty']['unit'] == ''
            old['facts']['warranty']['unit'] = ''
            refinements.append({'variantId':old['id'], 'field':'facts.warranty.unit', 'before':'years', 'after':'', 'reason':'Canonical prose alias is unitless; raw source wrappers unchanged'})
        elif old['id'].startswith('farizon_'):
            k='continuous_power'; assert current['facts'][k]['label'] == 'Source-rated power; duration standard unverified'
            refinements.append({'variantId':old['id'], 'field':'facts.continuous_power.label', 'before':old['facts'][k]['label'], 'after':current['facts'][k]['label']})
            old['facts'][k]['label'] = current['facts'][k]['label']
        assert current == old, 'Unapproved source fact or identity drift'
assert supplied['sources'] == snapshot['sources'], 'Source metadata changed; re-review required'
old_features = {(x['variant_id'], x['criterion']): x for x in supplied['features']}
for f in snapshot['features']:
    old = old_features[(f['variant_id'], f['criterion'])]
    if old != f:
        assert f['variant_id'].startswith('kgm_musso_ev_') and f['criterion'] == 'front_ventilated_seats'
        c = copy.deepcopy(old); c['value'] = f['value']; assert c == f
        assert f['value'] == 'Ventilated front seats; automatic seat-climate behaviour not established'
        refinements.append({'variantId':f['variant_id'], 'field':'feature.front_ventilated_seats.value', 'before':old['value'], 'after':f['value']})
assert len(supplied['features']) == len(snapshot['features'])
old_deps = {d['id']:d for d in original['dependencies']}
lead_ids = {d for r in original['records'] for part in ('strength','tradeoff') for d in r[part]['dependencyIds']}
deps = {}; bindings = {}; checks = []
excluded_source_ids = {s['id'] for s in snapshot['sources'] if any(s.get(k) for k in ('conflict','publication_hold','access_limitation'))}
assert prefix('farizon_stock_39435_web') in excluded_source_ids


def pointer(path):
    obj = evidence
    for bit in path.strip('/').split('/'):
        bit = bit.replace('~1','/').replace('~0','~')
        obj = obj[int(bit)] if isinstance(obj,list) else obj[bit]
    return obj


def whole_record(car):
    return {k:copy.deepcopy(v) for k,v in car.items() if k not in ('availabilityEvidence','buyerSummary')}


def family_targets(rid):
    if rid == 'all': return sorted(cars)
    car = cars[ids[rid]]
    return sorted(v for v,c in cars.items() if c['modelFamily'] == car['modelFamily'])


def fact_binding(old):
    rid = old['sourceRecordId']; vid = ids[rid]
    key = field_map[rid]['facts.' + old['key']]; fact = cars[vid]['facts'][key]
    raw = old['expectedValue']; conversion = old['key'] == 'cargoVolume' and rid.startswith('farizon-')
    if conversion:
        assert raw == 6.95 and old['expectedUnit'] in ('m3','m³') and fact['value'] == raw * 1000 and fact['unit'] == 'L'
    else: assert raw == fact['value'], (old['id'],raw,fact['value'])
    assert set(fact['sourceIds']) == {prefix(s) for s in old['sourceIds']}, old['id']
    assert not set(fact['sourceIds']) & excluded_source_ids and not fact['issues']
    row = {'researchDependencyId':old['id'], 'sourceRecordId':rid, 'variantId':vid,
           'guardedVariantIds':[vid], 'runtimeDependencyIds':[], 'factKeys':[key],
           'sourceIds':list(fact['sourceIds']), 'excludedSourceIds':[],
           'guards':['expectedIdentity.facts: exact complete effective map, including source-less nulls and absent fields'],
           'rawValue':copy.deepcopy(raw), 'effectiveValue':copy.deepcopy(fact['value']),
           'transformation':'Declared cubic metres multiplied by 1000 to litres; unspecified measurement method stays unspecified' if conversion else 'exact value preserved'}
    if fact['sourceIds']:
        did = f'fact:{vid}:{key}'; assert did not in deps
        deps[did] = {'id':did,'kind':'fact','variantId':vid,'key':key,
            'expectedValue':copy.deepcopy(fact['value']),'expectedStatus':fact['status'],
            'expectedUnit':fact['unit'],'expectedBasis':fact['basis'],
            'expectedComparisonBasis':fact.get('comparisonBasis'),'expectedMarket':fact.get('market'),
            'expectedScope':fact.get('scope'),'expectedQualifications':copy.deepcopy(fact['qualifications']),
            'expectedConditionExplanation':fact.get('conditionExplanation'),
            'expectedEffectiveFact':copy.deepcopy(fact),'sourceIds':list(fact['sourceIds']),
            'checkedAt':DATE,'sourceRecordId':rid,'researchDependencyId':old['id'],
            'researchEvidence':copy.deepcopy(old)}
        row['runtimeDependencyIds'] = [did]; row['bindingType'] = 'sourced_effective_fact'
        row['guards'] += ['exact expectedEffectiveFact','exact expectedSourceSnapshots']
    else:
        assert raw is None and old['id'] not in lead_ids
        row['bindingType'] = 'source_less_unknown_guarded_by_complete_fact_map'
        row['unknownSemantics'] = 'Unresolved evidence, never zero or absent equipment; no fabricated source'
    checks.append({'sourceDependencyId':old['id'],'variantId':vid,'key':key,
                   'sourceValue':raw,'effectiveValue':fact['value'],'leadClaim':old['id'] in lead_ids,
                   'sourceMembershipExact':True,'unitConversion':conversion})
    return row


for input in original['inputs']: assert sha(input['path']) == input['sha256']
for old in original['dependencies']:
    assert sha(old['sourceEvidenceFile']) == old['sourceEvidenceFileSha256']
    obj = pointer(old['sourceJsonPointer']); assert obj == old['sourceSnapshot'], old['id']
    assert hashlib.sha256(canon(obj)).hexdigest() == old['sourceObjectSha256'], old['id']
    for e in old['evidence']:
        assert sha(e['originalSnapshotPath']) == e['originalSha256']
        if e.get('textSnapshotPath'): assert sha(e['textSnapshotPath']) == e['textSha256']
        if e.get('textLineStart'):
            lines=Path(e['textSnapshotPath']).read_text().splitlines()
            assert hashlib.sha256('\n'.join(lines[e['textLineStart']-1:e['textLineEnd']]).encode()).hexdigest() == e['textRangeSha256']
    if old['kind'] == 'source_fact': bindings[old['id']] = fact_binding(old)

# Non-numeric scope, hold and conflict records are guarded by exact own/related
# Car snapshots and accepted source metadata. Rejected source documents remain
# hashed negative provenance; a conflicted advert must never support eligibility.
for old in original['dependencies']:
    if old['id'] in bindings: continue
    rid=old['sourceRecordId']; targets=family_targets(rid)
    cited=[prefix(s) for s in old['sourceIds']]
    if old['kind']=='source_document': cited=[prefix(old['key'])]
    assert all(s in sources for s in cited)
    row={'researchDependencyId':old['id'],'sourceRecordId':rid,
         'variantId':ids.get(rid), 'guardedVariantIds':targets,
         'runtimeDependencyIds':[], 'sourceIds':[s for s in cited if s not in excluded_source_ids],
         'excludedSourceIds':[s for s in cited if s in excluded_source_ids],
         'sourceJsonPointer':old['sourceJsonPointer'],'sourceObjectSha256':old['sourceObjectSha256'],
         'bindingType':old['kind'],'guards':['exact own/related identity and complete effective fact maps','exact own/related availability','accepted source metadata snapshots'],
         'sourceSnapshot':copy.deepcopy(old['sourceSnapshot'])}
    if rid != 'all':
        row['identityFields']=['id','modelFamily','trim','year','generation','vehicleClass']
        row['factKeys']=list(cars[ids[rid]]['facts'])
    if old['kind'] == 'source_scope' and rid != 'all':
        field={'brand':'brand','model':'model','familyId':'modelFamily','configurationName':'trim','technicalEpoch':'generation'}.get(old['key'])
        if field: assert cars[ids[rid]][field] == old['expectedValue']
        if old['key']=='modelYear':
            if rid.endswith('liftback'):
                assert old['expectedValue']==2027 and cars[ids[rid]]['year'] is None
                row['transformation']='Source inherited 2027 is withheld for Liftback; no exact configuration formal-MY evidence'
            else: assert cars[ids[rid]]['year']==old['expectedValue']
    if old['kind']=='source_review_caution':
        row['scopeNote']='Caution preserved verbatim. Farizon seats remain dealer-conditional three; Liftback formal MY and seats remain null; PV5 advertised VIN is not physically inspected or independently decoded.'
    if old['kind'] in ('source_counting',) or (rid=='all' and old['kind']=='source_scope'):
        row['scopeNote']='Global research scope is hash-verified at binding/validation. Runtime uses the seven explicit IDs and exact family records; it does not police unrelated future catalogue additions.'
    if row['excludedSourceIds']:
        row['guards']=['hashed source-stage exclusion provenance'] if not row['sourceIds'] else row['guards']
        row['exclusionNote']='Rejected CountryCars 39435 New advert is not a runtime support/availability guard. Current seller Demo evidence and accepted exact-New advertisements are guarded. Rejected metadata changes cannot create eligibility; source bytes and conflict interpretation are checked at build time.'
    bindings[old['id']]=row


def bound_ids(source_ids):
    return unique(did for source_id in source_ids for did in bindings[source_id]['runtimeDependencyIds'])


proposal=copy.deepcopy(original)
for rec in proposal['records']:
    rid=rec['sourceRecordId'];vid=ids[rid];car=cars[vid]
    assert car['vehicleClass'] in ('ute','van') and car['availability']=='current_or_order_listed'
    rec['variantId']=vid;rec['expectedIdentity']=whole_record(car)
    rec['expectedAvailabilityEvidence']=copy.deepcopy(car['availabilityEvidence'])
    rec['availabilityRevision']=car.get('availabilityRevision','')
    rec['sourceContextDependencyIds']=copy.deepcopy(rec['contextDependencyIds'])
    rec['sourceClauseDependencyIds']=copy.deepcopy(rec['clauseDependencyIds'])
    rec['contextDependencyIds']=bound_ids(rec['sourceContextDependencyIds'])
    rec['clauseDependencyIds']=bound_ids(rec['sourceClauseDependencyIds'])
    source_dep_ids=rec['allDependencyIds']
    rec['runtimeContextBindings']=[copy.deepcopy(bindings[did]) for did in source_dep_ids]
    # Same-family guards cover shared declaration and cross-door/pack caution.
    related=[other for other in family_targets(rid) if other != vid]
    rec['expectedRelatedIdentities']={other:whole_record(cars[other]) for other in related}
    rec['expectedRelatedAvailabilityEvidence']={other:copy.deepcopy(cars[other]['availabilityEvidence']) for other in related}
    guard_sources=unique(list(car['availabilityEvidence']['sourceIds'])
        +[s for did in source_dep_ids for s in bindings[did]['sourceIds']]
        +[s for other in related for s in cars[other]['availabilityEvidence']['sourceIds']]
        +[s for target in [vid]+related for f in cars[target]['facts'].values() for s in f['sourceIds']])
    assert not set(guard_sources)&excluded_source_ids
    rec['availabilityGuardSourceIds']=guard_sources
    rec['guardSourceScope']='Every accepted clause/condition source and source backing own/related complete effective facts. Rejected historical advert is retained only as separately hashed exclusion provenance.'
    rec['excludedResearchSourceIds']=unique(s for did in source_dep_ids for s in bindings[did]['excludedSourceIds'])
    mid=f'variant:{vid}:model_year'
    deps[mid]={'id':mid,'kind':'variant_property','variantId':vid,'key':'model_year',
               'expectedValue':car['year'],'sourceIds':list(car['availabilityEvidence']['sourceIds']),'checkedAt':DATE,
               'basis':'Exact configuration model year; null remains unknown and never inferred from retrieval date or a related body configuration.'}
    rec['modelYearDependency']=mid
    for part in ('strength','tradeoff'):
        clause=rec[part];clause['researchDependencyIds']=copy.deepcopy(clause['dependencyIds'])
        clause['researchContextDependencyIds']=copy.deepcopy(clause['contextDependencyIds'])
        clause['dependencyIds']=unique(bound_ids(clause['researchDependencyIds']+clause['researchContextDependencyIds'])+rec['contextDependencyIds'])
        clause['contextDependencyIds']=bound_ids(clause['researchContextDependencyIds'])
        clause['sourceIds']=unique(s for did in clause['dependencyIds'] for s in deps[did]['sourceIds'])
        clause['researchLabelDependencyIds']=clause.pop('labelDependencyIds')
        clause['researchAssertions']=clause.pop('assertions')
        assert clause['dependencyIds'] and not clause['derivations']
    for c in rec['visibleConditionBindings']:
        c['researchDependencyIds']=copy.deepcopy(c['dependencyIds']);c['dependencyIds']=bound_ids(c['researchDependencyIds'])
        c['runtimeBindings']=[copy.deepcopy(bindings[did]) for did in c['researchDependencyIds']]
        c['researchSourceIds']=copy.deepcopy(c['sourceIds']);c['sourceIds']=[prefix(s) for s in c['sourceIds'] if prefix(s) not in excluded_source_ids]
        c['excludedSourceIds']=[prefix(s) for s in c['researchSourceIds'] if prefix(s) in excluded_source_ids]
        c['recordGuardsRequired']=True
    rec['runtimeBinding']={'status':'bound_effective_snapshot_runtime_validation_pending','integratedVariantId':vid,
        'effectiveSnapshotSha256':sha(R/'ute-van-runtime-effective-snapshot.json'),'exactIdentityGuard':True,
        'exactCompleteFactMapGuard':True,'exactAvailabilityGuard':True,'relatedConfigurationGuards':len(related)}
    rec['status']='bound_effective_snapshot_runtime_validation_pending'
    rec['copyReadyWhen']='Actual runtime/mutation validation must pass; retain full fact-map, own/related identity, availability, accepted-source snapshots and all visible conditions.'

used_sources={s for d in deps.values() for s in d['sourceIds']}|{s for r in proposal['records'] for s in r['availabilityGuardSourceIds']}
assert not used_sources&excluded_source_ids
assert set(bindings)==set(old_deps)
assert {d for r in proposal['records'] for d in r['allDependencyIds']}==set(old_deps)
for sid in used_sources: assert sources[sid]['url'].startswith(('http://','https://'))
assert cars[ids['hyundai-staria-load-electric-84-fwd-liftback']]['year'] is None
assert cars[ids['hyundai-staria-load-electric-84-fwd-liftback']]['facts']['seats']['value'] is None
for rid in ids:
    if rid.startswith('farizon-'):
        f=cars[ids[rid]]['facts']['seats'];assert f['value']==3 and f['status']=='conditional' and 'dealer' in (f['label']+' '+f['conditionExplanation']).lower()
proposal.update(schemaVersion='ute-van-effective-editorial-1',status='bound_effective_snapshot_runtime_validation_pending',
    scope='Seven new exact Australian ute/van pairs; original source copy and visible conditions unchanged. Only accepted sources support runtime eligibility; rejected advert remains hashed exclusion provenance.',
    dependencies=list(deps.values()),researchDependencies=copy.deepcopy(original['dependencies']),
    researchDependencyBindings=list(bindings.values()),expectedSourceSnapshots=[copy.deepcopy(sources[s]) for s in sorted(used_sources)],
    excludedSourceSnapshots=[copy.deepcopy(sources[s]) for s in sorted(excluded_source_ids)],
    sourceStageBindingRequirements=copy.deepcopy(original['bindingRequirements']),bindingChecks=checks,
    sourceProposal={'path':str(R/'remaining-utes-vans-selling-points-proposal.json'),'sha256':ORIGINAL_SHA},
    approvedRuntimeRefinements=refinements,
    sourceMetadataRefinements=[], canonicalAliases=canonical_aliases,featureAliases=feature_aliases)
proposal['bindingRequirements']=[
    'Append only these seven records, new dependencies and accepted-source snapshots; retain all 251 prior summaries and their rows/snapshots unchanged.',
    'Keep complete expectedIdentity.facts and same-family expectedRelatedIdentities.facts: changed, removed or added facts, including source-less unknowns, invalidate copy.',
    'Keep exact identity, own/related availability and accepted-source metadata snapshots, and all 55 required visible conditions.',
    'Liftback formal MY and seats remain null. Farizon seats are three with dealer-conditional provenance. Two 6.95 m³ declarations become 6,950 L without inventing a measurement method.',
    'CountryCars stock 39435 remains rejected New evidence; its historical source metadata does not suppress runtime copy. Current direct seller Demo and accepted exact-New evidence are guarded; all original bytes and exclusion interpretation remain verified in this workflow.',
    'Runtime does not re-fetch source documents. Downloaded-byte, extracted-text, source-object and excerpt hashes are independently checked here.',
    'Any new source/fact changes require investigation and revalidation, never silent rebinding of unrelated prior summaries.'
]
input_names=['remaining-utes-vans-evidence.json','remaining-utes-vans-selling-points-proposal.json',
 'ute-van-integrated-ids.json','ute-van-field-map.json','ute-van-effective-snapshot.json',
 'ute-van-runtime-effective-snapshot.json','ute-van-feature-aliases.json','ute-van-canonical-aliases.json','pre-ute-van-catalogue.json']
proposal['applicationInputs']=[{'path':str(R/name),'sha256':sha(R/name)} for name in input_names]
proposal['summary'].update(executableDependencies=len(deps),exactSourceSnapshots=len(used_sources),
    runtimeMappedResearchDependencies=len(bindings),sourceLessUnknownFacts=sum(b['bindingType']=='source_less_unknown_guarded_by_complete_fact_map' for b in bindings.values()),
    requiredVisibleConditions=sum(len(r['requiredVisibleConditions']) for r in proposal['records']),
    relatedConfigurationRecords=sum(bool(r['expectedRelatedIdentities']) for r in proposal['records']),
    completeEffectiveFactsGuarded=sum(len(c['facts']) for c in cars.values()),priorCarsSerializedDeepEqual=255,applicationEdits=0)
proposal['validation']={'status':'static_binding_pass_runtime_pending','unmappedResearchDependencies':0,'leadValueDrift':0,'sourceMembershipDrift':0,'unitConversions':2,'applicationEdits':0}
(R/'ute-van-runtime-selling-points-proposal.json').write_text(json.dumps(proposal,ensure_ascii=False,indent=2)+'\n')
# Executable-only payload: research provenance stays in the proposal artifact.
record_keys=['variantId','checkedAt','modelYearDependency','availabilityScope','availabilityRevision','expectedIdentity','expectedAvailabilityEvidence','expectedRelatedIdentities','expectedRelatedAvailabilityEvidence','availabilityGuardSourceIds','requiredVisibleConditions']
dependency_keys=['id','kind','variantId','key','expectedValue','expectedStatus','expectedUnit','expectedBasis','expectedComparisonBasis','expectedMarket','expectedScope','expectedQualifications','expectedConditionExplanation','expectedConditions','expectedEffectiveFact','sourceIds','checkedAt']
pick=lambda obj,keys:{k:copy.deepcopy(obj[k]) for k in keys if k in obj}
minimal_records=[]
for rec in proposal['records']:
    row=pick(rec,record_keys)
    for part in ('strength','tradeoff'): row[part]=pick(rec[part],['label','text','dependencyIds','derivations'])
    minimal_records.append(row)
merge_payload={'schemaVersion':'ute-van-runtime-merge-payload-1','checkedAt':DATE,'status':'runtime_validation_pending',
    'records':minimal_records,'dependencies':[pick(d,dependency_keys) for d in proposal['dependencies']],
    'expectedSourceSnapshots':copy.deepcopy(proposal['expectedSourceSnapshots'])}
(R/'ute-van-runtime-selling-points-merge-payload.json').write_text(json.dumps(merge_payload,ensure_ascii=False,indent=2)+'\n')

lines=['# Runtime-bound ute and van buyer summaries','',
 'Seven exact Australian configurations, checked 10 October 2026. All source-stage wording and 55 visible conditions are unchanged. Application runtime validation is pending. No application files were written.','',
 '## Binding design','']+['- '+x for x in proposal['bindingRequirements']]+['',
 f"- {len(bindings)} source dependencies mapped, {len(deps)} executable dependencies, {len(used_sources)} accepted-source snapshots, {proposal['summary']['completeEffectiveFactsGuarded']} exact effective facts and 49 referenced source-less unknown facts",'',
 '## Proposed pairs','']
for rec in proposal['records']:
    lines += ['### '+rec['displayName'],'Runtime ID: `'+rec['variantId']+'`','',
              'Strength — '+rec['strength']['label']+': '+rec['strength']['text'],'',
              'Trade-off — '+rec['tradeoff']['label']+': '+rec['tradeoff']['text'],'',
              'Required visible conditions:']+['- '+x for x in rec['requiredVisibleConditions']]+['']
lines += ['## Reproduce','',
 '1. From `roadmark-work/roadmark`: `node --import tsx ../../roadmark-research/capture_ute_van_runtime_snapshot.cjs`',
 '2. Run `python roadmark-research/bind_ute_van_selling_points.py` from the workspace',
 '3. From `roadmark-work/roadmark`: `node --import tsx ../../roadmark-research/validate_ute_van_selling_points.cjs`','',
 '## Validation status','','Static mapping passed; actual runtime and mutation validation pending.','']
(R/'ute-van-runtime-selling-points-proposal.md').write_text('\n'.join(lines))
print(json.dumps(proposal['summary'],indent=2))
