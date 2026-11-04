from pathlib import Path
import json,hashlib,zipfile
root=Path('/workspace/scratch/586427eef9f2'); app=root/'roadmark-work/roadmark'; out=root/'roadmark-handover102/packages'
sha=lambda b:hashlib.sha256(b).hexdigest()
m=json.loads((root/'roadmark-rebuild102/qa-expected-inputs.json').read_text()); files={}
for p,h in m.items():
 b=(app/p).read_bytes(); assert sha(b)==h,p;files['roadmark/'+p]=b
files['roadmark/CHECKPOINT-SOURCE-MANIFEST.json']=(app/'CHECKPOINT-SOURCE-MANIFEST.json').read_bytes()
readme='''ROADMARK CHECKPOINT 102 — START HERE
Saved 13 October 2026 UTC. Verified development checkpoint; NOT a completed public release.

This is a standalone source archive. Extract into a NEW folder. It contains all 2,820 checked source/history inputs plus the original historical CHECKPOINT-SOURCE-MANIFEST.json. No checkpoint100/101 patch chain is required. SOURCE-MANIFEST102.json is the current package authority; older README/checkpoint documents inside roadmark/ remain historical and may describe91 or a candidate stage.

Keep this original ZIP unchanged. Edit a separate extracted working copy. Do not discard your previous backups. The earlier research recovery index and full lost audit history have not been restored.

START DEVELOPMENT
Install Node22 or newer (tested24.19.0) and pnpm. The project declares pnpm11.19.0; the verification environment used11.25.0. From roadmark/:
pnpm install --frozen-lockfile --ignore-scripts
pnpm check:market-view
pnpm dev
Use the local URL printed by the server. For checks: pnpm validate; pnpm test; pnpm typecheck; pnpm lint; pnpm build. Historical source fingerprints intentionally fail if protected files drift; do not casually rewrite or disable history tests.

PREVIEW
The matching Roadmark-102-portable-preview.zip contains four generated HTML aliases under roadmark/. Merge these into this extracted roadmark/ folder if using pnpm preview:review, which serves http://127.0.0.1:3013/index.html. A standalone preview can instead be served with Python as described in that ZIP. file:// opening was not tested.

VERIFIED
1,043 tests (1,042 nonHTTP +1 localHTTP), typecheck, lint, data validation,391 production pages and portable generation passed. BuildID: SCilKbWANhL34GKoq5Td2. Scoped market and nine-point ModelY hero journeys passed production+portable HTTP at1180px and400CSSpx desktop-Chromium widths. This is NOT real iPhone/Android signoff. All four generated HTML aliases are37,037,396bytes, SHA25697e5186cacce6062d8e7c088f7c36f9cc71fe4f79a36807a7ee7cb2b7877652c.

SCOPE / REMAINING
243 audit records;148 unresolved entries;395 named audit configurations;55 records lack exact trim sets. These are not buyable-stock counts. Detailed catalogue345 configurations/150 families,333 summaries,2,202 source records. Market completeness, exact-trim/stock verification, real-phone journeys, full design/accessibility/performance signoff, operational correction workflow and deployment remain open. Original ModelY hero and nine selling points remain intact.

HANDOVER
Read Roadmark-handover-and-resume.docx for architecture, completed/remaining goal status, safe edit workflow, release gates and resumption instructions. Roadmark-102-evidence.zip contains execution/proof/browser-text/research evidence. Exclude node_modules/, .next/, secrets and private .roadmark/review-queue from anything you return. Return your modified source with a change note; your edits become the new starting point. Development is paused after this handover until you ask to resume.
'''
files['START-HERE-ROADMARK102.txt']=readme.encode()
manifest={'checkpoint':102,'purpose':'Standalone verified development source, not release approval','buildId':'SCilKbWANhL34GKoq5Td2','qaSourceInputs':2820,'historicalMetadataExtra':'roadmark/CHECKPOINT-SOURCE-MANIFEST.json','excluded':['node_modules','.next','generated HTML aliases','private queue','secrets'],'files':{p:{'sha256':sha(b),'bytes':len(b)} for p,b in sorted(files.items())}}
files['SOURCE-MANIFEST102.json']=(json.dumps(manifest,indent=2)+'\n').encode()
def save(name, fs):
 p=out/name
 with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for n,b in sorted(fs.items()):z.writestr(n,b)
 with zipfile.ZipFile(p) as z:
  assert z.testzip() is None
  assert set(z.namelist())==set(fs)
  for n,b in fs.items():assert sha(z.read(n))==sha(b),n
 return {'name':name,'bytes':p.stat().st_size,'sha256':sha(p.read_bytes()),'members':len(fs)}
r=[save('Roadmark-102-source.zip',files)]
pf={}
for n in ['index.html','index-b.html','public/index.html','public/index-b.html']:
 b=(app/n).read_bytes();assert len(b)==37037396 and sha(b)=='97e5186cacce6062d8e7c088f7c36f9cc71fe4f79a36807a7ee7cb2b7877652c';pf['roadmark/'+n]=b
pf['START-HERE-PREVIEW102.txt']=b'''ROADMARK CHECKPOINT102 PORTABLE PREVIEW
This matches Roadmark-102-source.zip, build SCilKbWANhL34GKoq5Td2. Development preview, not public release approval.
Extract into a new folder. From its roadmark/ directory run:
python3 -m http.server 3013 --bind 127.0.0.1
Then open http://127.0.0.1:3013/index.html
Market route: http://127.0.0.1:3013/index.html?page=%2Fmarket
All assets/data are embedded; four identical aliases are included for compatibility. Direct file:// use is untested. Local HTTP preview has no live shared correction backend. To run the read-only review route, merge these generated files into the extracted102 source and use pnpm preview:review. Use the source archive, not generatedHTML, for editing. Read the separate comprehensive handover DOCX and retain evidence ZIP. Real-phone signoff and full-market audit remain open.
'''
pf['PREVIEW-MANIFEST102.json']=(json.dumps({'checkpoint':102,'buildId':'SCilKbWANhL34GKoq5Td2','matchingSourceArchive':r[0],'files':{n:{'sha256':sha(b),'bytes':len(b)}for n,b in sorted(pf.items())}},indent=2)+'\n').encode()
r.append(save('Roadmark-102-portable-preview.zip',pf));(out/'source-preview-identities.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
