#!/usr/bin/env python3
"""Package verified research-only Hyundai buyer-summary runtime artifacts."""
import hashlib,json,re
from pathlib import Path
R=Path('/workspace/scratch/586427eef9f2/roadmark-research')
report=json.loads((R/'hyundai-runtime-selling-points-validation.json').read_text())
payload=json.loads((R/'hyundai-runtime-selling-points-merge-payload.json').read_text())
assert report['status']=='passed_read_only_actual_runtime_and_in_memory_merge'
assert payload['status']=='runtime_validated_exact_executable_payload'
assert report['fullCatalogueVisibleBefore']==258 and report['fullCatalogueVisibleAfter']==270
assert report['priorCarsSerializedDeepEqual']==262 and report['applicationEdits']==0
app=R.parent/'roadmark-work/roadmark'
input_lock=json.loads((R/'hyundai-runtime-input-lock.json').read_text())
for item in input_lock['files']:assert hashlib.sha256((app/item['path']).read_bytes()).hexdigest()==item['sha256'],item['path']
assert hashlib.sha256((R/'hyundai-prior-buyer-selling-points.json').read_bytes()).hexdigest()==next(x['sha256'] for x in input_lock['files'] if x['path']=='data/buyer-selling-points-2026-10-10.json')
md=R/'hyundai-runtime-selling-points-proposal.md'
text=md.read_text()
summary=(f"Passed: {report['testsPassed']:,} checks, including {report['mutationTestsPassed']:,} actual-builder mutation checks. "
 'All 12 complete pairs render through actual builders. In-memory merge adds 12 summaries (258 → 270) and 24 clauses (516 → 540), '
 'with all 258 prior eligible summaries and old rows/snapshots unchanged. All 262 prior cars are serialized-deep-equal. '
 'Failed/held/rejected leads cannot support, rescue or poison eligibility. All 23 conflicts, 20 holds and four non-additive option children retained. No application files were written.')
text=re.sub(r'Static mapping passed; actual runtime and mutation validation pending\.|Passed: [^\n]+',summary,text);md.write_text(text)
names=['hyundai-runtime-selling-points-proposal.json','hyundai-runtime-selling-points-proposal.md','hyundai-runtime-selling-points-merge-payload.json','hyundai-runtime-selling-points-validation.json','hyundai-runtime-selling-points-validation-log.txt','hyundai-runtime-effective-snapshot.json','capture_hyundai_runtime_snapshot.cjs','bind_hyundai_selling_points.py','validate_hyundai_selling_points.cjs','finalize_hyundai_selling_points.py','verify_hyundai_post_merge.cjs','hyundai-prior-buyer-selling-points.json','hyundai-runtime-input-lock.json']
manifest={k:report[k] for k in ['status','validationMode','records','visibleClauses','testsPassed','mutationTestsPassed','priorCarsSerializedDeepEqual','fullCatalogueVisibleBefore','fullCatalogueVisibleAfter','applicationEdits']}
manifest['exactRuntimeGraphFilesLocked']=len(input_lock['files'])
manifest.update(executableDependencies=len(payload['dependencies']),acceptedSourceSnapshots=len(payload['expectedSourceSnapshots']),completeEffectiveFactsGuarded=report['completeEffectiveFactsGuarded'],sourceLessUnknownFacts=report['sourceLessUnknownFacts'],requiredVisibleConditions=48,retainedConflicts=23,retainedHolds=20,nonAdditiveOptionChildren=4,coreNewStockRecords=4)
manifest['files']=[{'path':str(R/n),'sha256':hashlib.sha256((R/n).read_bytes()).hexdigest(),'bytes':(R/n).stat().st_size} for n in names]
manifest['integrationInstructions']=[f"Append only 12 records, {len(payload['dependencies'])} dependencies and {len(payload['expectedSourceSnapshots'])} accepted expectedSourceSnapshots from the minimal executable payload.",'Do not regenerate/rebind any existing summary, dependency or source snapshot.','Retain complete own/related effective fact maps, identity, availability, all accepted-source guards and 48 visible conditions.','The full proposal is research provenance, not application data. Failed/held/rejected sources and four non-additive children stay in research/context; only four core configurations have exact New stock.','After the exact append-only merge, run verify_hyundai_post_merge.cjs under app tsx. It preserves this exhaustive proof and checks current 270 summaries, all 258 prior summaries/262 prior cars, exact payload/source/input hashes and representative guard mutations. It explicitly does not rerun the exhaustive matrix.']
manifest['quickPostMergeCommand']='cd /workspace/scratch/586427eef9f2/roadmark-work/roadmark && node --import tsx ../../roadmark-research/verify_hyundai_post_merge.cjs'
manifest['reproducibleCommands']=report['reproducibleCommands']+['python /workspace/scratch/586427eef9f2/roadmark-research/finalize_hyundai_selling_points.py']
(R/'hyundai-runtime-selling-points-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
