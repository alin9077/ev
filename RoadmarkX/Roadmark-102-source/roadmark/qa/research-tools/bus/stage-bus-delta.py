"""Prepare a research-only bus delta; never edits application files."""
from pathlib import Path
import json,copy,re,hashlib
from urllib.parse import urlparse
R=Path('/workspace/scratch/586427eef9f2/roadmark-research')
p=json.loads((R/'yutong-bci-electric-buses-evidence.json').read_text());b=json.loads((R/'bus-integration-boundaries.json').read_text());assert hashlib.sha256((R/'yutong-bci-electric-buses-evidence.json').read_bytes()).hexdigest()=='e843b9941b25b9384245b8403c3e0fe8925f1384d731df1886bed34494650874'
slug=lambda s:re.sub('[^a-z0-9]+','_',s.lower()).strip('_')
snake=lambda s:re.sub(r'(?<=[a-z0-9])(?=[A-Z])','_',s).lower()
sid=lambda s:'r10_bus_'+s
sources={s['id']:s for s in p['sourceRegistry']}
delta={'checkedAt':'2026-10-10','status':'research_staging_not_integrated','models':[],'variants':[],'sources':[],'facts':[],'features':[],'mapping':[],'ids':{},'sourceHashes':[],'holds':b['sharedNonNegotiableHolds']}
for s in sources.values():
 for pathkey,hashkey in [('snapshot_path','sha256'),('text_snapshot_path','text_sha256')]:
  if s.get(pathkey):
   path=Path(s[pathkey]);assert hashlib.sha256(path.read_bytes()).hexdigest()==s[hashkey],path;delta['sourceHashes'].append({'sourceId':s['id'],'path':str(path),'sha256':s[hashkey],'bytes':path.stat().st_size})
 host=urlparse(s['url']).hostname;pub='VDI Australia / Yutong'if host and('vdiaustralia.com.au'in host)else'BCI Bus Australia'if host and('bcibus.com.au'in host)else host
 row={'id':sid(s['id']),'url':s['url'],'title':s['id'].replace('_',' ').replace('bci','BCI').replace('vdi','VDI').replace('yutong','Yutong')+' — Australian bus source','publisher':pub,'source_type':s.get('publisherType','Australian bus evidence'),'published_date':s.get('sourceDate'),'accessed_date':'2026-10-10','market':'AU','supports':'Exact published body/layout/technical epoch and declared source conditions; not confirmed open orders or physical stock'}
 if s.get('status')not in [200,201]:row['access_limitation']='Failed or unmatched research lead; not current technical/availability evidence'
 delta['sources'].append(row)
def source_pointer(path):
 file,ptr=path.split('#',1);assert Path(file).name=='yutong-bci-electric-buses-evidence.json';obj=p
 for part in ptr.strip('/').split('/'):
  part=part.replace('~1','/').replace('~0','~');obj=obj[int(part)]if isinstance(obj,list)else obj[part]
 return obj
for boundary in b['records']:
 if not boundary['admitDetailedVariant']:continue
 r=next(x for x in p['records']if x['id']==boundary['sourceRecordId']);v=copy.deepcopy(boundary['variantMappingSuggestion']);mid=copy.deepcopy(boundary['modelMappingSuggestion']);vid=v['id'];delta['ids'][r['id']]=vid;v['availability_evidence']['orderStatus']='listed_unconfirmed';v['availability_evidence']['stockStatus']='unverified';v['availability_evidence']['configuration']=boundary['safeDisplayName'];v['notes']=list(dict.fromkeys(v.get('notes',[])+boundary['nonNegotiableHolds']+v['availability_evidence']['qualifications']));v['availability_evidence']['qualifications']=v['notes'];scope=boundary['safeDisplayName']+'; current Australian sales-sheet scope, exact delivered build and order acceptance unconfirmed'
 if 'mini-bus'in r['id']:v['trim']='Advertised 12-seat layout; driver inclusion and powertrain unresolved · Feb 2025 sheet'
 delta['models'].append(mid);delta['variants'].append(v);seen=set();mappedsource=set()
 def add(key,value,unit,basis,qs,es,status,label,sourcePath):
  assert key not in seen,(r['id'],key);seen.add(key);refs=list(dict.fromkeys(e['sourceId']for e in es));assert all(x in sources for x in refs);
  if value is not None and not refs:qs=qs+['Unsourced research state retained as uncertainty: '+str(value)];value=None;status='not_verified'
  loc=[', '.join(f'{k}: {e[k]}'for k in ['sourceId','pdfPage','section','row','column']if e.get(k)is not None)for e in es];qs=list(dict.fromkeys(qs+['Only the named published bus body/layout and source epoch; not proof of a complete factory order or delivered VIN.']+loc));row={'variantId':vid,'key':key,'label':label,'value':value,'unit':unit or'','basis':basis,'comparisonBasis':basis,'status':status,'sourceIds':[sid(x)for x in refs],'date':'2026-10-10','market':'AU','scope':scope,'qualifications':qs,'issues':[]}
  if status=='conditional':row['conditionExplanation']=' '.join([basis]+[q for q in qs if not q.startswith('sourceId:')])
  delta['facts'].append(row);delta['mapping'].append({'recordId':r['id'],'variantId':vid,'sourcePath':sourcePath,'key':key,'effectiveValue':value,'effectiveStatus':status})
 for m in boundary['fieldMappingSuggestions']:
  key=m['target'].replace('facts[].','');value=copy.deepcopy(m['proposedValue']);status='conditional' if m['proposedStatus']=='optional' else m['proposedStatus'];assert status in ['conditional','not_verified','unavailable','not_applicable'],status
  source=m.get('sourceFactPath');qs=m.get('qualifications',[])+(['Optional only, not standard base configuration equipment.'] if m['proposedStatus']=='optional' else [])+[str(m.get('mappingAction',''))]+boundary['nonNegotiableHolds'];basis=m.get('basis')or'Exact Australian source declaration; retain body, layout and measurement scope';label={'seated_passengers':'Seated passengers, excluding driver','standing_passengers':'Standing passengers','driver_seats':'Driver places','battery_kwh':'Declared battery energy; gross/usable unverified','gvm_kg':'Gross vehicle mass','length_mm':'Published bus length','warranty':'Published vehicle warranty','battery_warranty':'Published battery warranty','range_km':'Comparable range; method unverified','seats':'Passenger-car-style seat count not applicable','standard_safety':'Published safety equipment; see source applicability','standard_equipment_text':'Published equipment text; option/conflict scope applies'}.get(key,key.replace('_',' ').capitalize())
  if source:mappedsource.add(source.split('/')[-1])
  add(key,value,m.get('unit'),basis,qs,m.get('evidence',[]),status,label,source)
 # Preserve any unnormalized raw source wrappers without creating ranking aliases.
 for name,w in r['facts'].items():
  if name in mappedsource:continue
  value=copy.deepcopy(w['value']);status='not_verified'if value is None else'unavailable'if value is False else'conditional';qs=w.get('conditions',[])+boundary['nonNegotiableHolds']
  if w.get('status')in ['held','conflicted','unknown']:value=None;status='not_verified'
  key='source_'+snake(name);add(key,value,w.get('unit'),w.get('basis')or'Raw source declaration, not a normalized comparable vehicle measurement',qs,w.get('evidence',[]),status,'Source declaration: '+snake(name).replace('_',' '),'records/'+r['id']+'/facts/'+name)
 # Keep alternative layouts as labelled options, never Cartesian-product variant rows.
 for oi,opt in enumerate(p.get('bodyOptions',[])):
  if opt.get('parentRecordId')!=r['id'] or opt.get('id')==b['namedDerivative']['sourceRecordId']:continue
  for k,w in opt.get('facts',{}).items():
   value=copy.deepcopy(w['value']);status='not_verified'if value is None else'unavailable'if value is False else'conditional';qs=w.get('conditions',[])+['Explicit alternative/related layout '+opt['id']+' only; not necessarily the selected base layout and not an extra vehicle. No wheelchair/seated/standing capacity arithmetic.',opt.get('compatibility','Confirm exact option compatibility')]
   if w.get('status')in ['held','conflicted','unknown']:value=None;status='not_verified'
   add('layout_'+str(oi)+'_'+snake(k),value,w.get('unit'),w.get('basis')or'Explicit source layout option',qs,w.get('evidence',[]),status,'Layout option: '+opt['id']+' / '+snake(k).replace('_',' '),'bodyOptions/'+str(oi)+'/facts/'+k)
 for key in b['sharedRequiredNullFields']:
  if key not in seen:add(key,None,'','Compatible exact-build measurement not established; no arithmetic or cross-layout substitution',[],[],'not_verified',key.replace('_',' ').capitalize(),'required_null')
 for key in ['boot_l','towing_braked_kg','towing_unbraked_kg']:
  if key not in seen:add(key,None,'','Passenger cargo or separately classified towing measurement not established',[],[],'not_verified',key.replace('_',' ').capitalize(),'required_null')
assert len(delta['variants'])==7
(R/'bus-integration-staged-delta.json').write_text(json.dumps(delta,ensure_ascii=False,indent=2)+'\n')
print('Staged only',len(delta['variants']),'bounded rows',len(delta['facts']),'facts',len(delta['sourceHashes']),'verified source entries; application unchanged')
