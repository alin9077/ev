from pathlib import Path
import json,copy,hashlib
R=Path('/workspace/scratch/586427eef9f2/roadmark-research');A=R.parent/'roadmark-work/roadmark'
read=lambda p:json.loads(p.read_text())
b=read(R/'bus-integration-boundaries.json');s=read(R/'bus-integration-staged-delta.json');a=read(A/'data/catalogue-additions-2026-10-10.json')
byid={s['ids'][r['sourceRecordId']]:r for r in b['records']if r['admitDetailedVariant']}
common='Only the named published bus body/layout and source epoch; not proof of a complete factory order or delivered VIN.'
actions={m.get('mappingAction','') for r in b['records']for m in r.get('fieldMappingSuggestions',[])}
changed=[];old=copy.deepcopy(a);staged=copy.deepcopy(s)
for f in s['facts']:
 if f['status']!='conditional':continue
 holds=set(byid[f['variantId']]['nonNegotiableHolds']);qs=[q for q in f['qualifications'] if q not in holds and q not in actions and q!=common and not q.startswith('sourceId:')]
 parts=['Published for this bus body and layout; confirm the exact delivered build.']
 if f['basis']!='Visible Australian source declaration':parts.append(f['basis'])
 parts.extend(qs);after=' '.join(dict.fromkeys(parts))
 before=f.get('conditionExplanation');f['conditionExplanation']=after
 target=next(x for x in a['facts']if x['variantId']==f['variantId']and x['key']==f['key']);assert target.get('conditionExplanation')==before
 target['conditionExplanation']=after
 changed.append({'variantId':f['variantId'],'key':f['key'],'before':before,'after':after})
assert len(changed)>0
for left,right in zip(old['facts'],a['facts']):
 l=copy.deepcopy(left);r=copy.deepcopy(right);l.pop('conditionExplanation',None);r.pop('conditionExplanation',None);assert l==r
for k in a:
 if k!='facts':assert a[k]==old[k]
(R/'bus-condition-explanation-before.json').write_text(json.dumps(staged,ensure_ascii=False,indent=2)+'\n')
for p,d in [(R/'bus-integration-staged-delta.json',s),(A/'data/research-pending/bus-integration-staged-delta.json',s),(A/'data/catalogue-additions-2026-10-10.json',a)]:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
report={'status':'applied_condition_explanation_only','changes':changed,'preserved':['all values','all statuses','all full qualifications','all source IDs and locators','all bases and technical comparison bases','all identities and availability','all prior non-bus facts'],'stageSHA256':hashlib.sha256((R/'bus-integration-staged-delta.json').read_bytes()).hexdigest()}
(R/'bus-condition-explanation-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('Shortened',len(changed),'inline explanations; all full qualifications and evidence preserved')
for x in changed:
 if x['key'] in ['seated_passengers','standing_passengers','driver_seats','length_mm','gvm_kg','battery_kwh','warranty']:print(x['variantId'],x['key'],len(x['after']),x['after'][:180])
