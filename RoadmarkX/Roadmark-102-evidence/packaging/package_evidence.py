from pathlib import Path,PurePosixPath
import json,hashlib,zipfile
root=Path('/workspace/scratch/586427eef9f2');out=root/'roadmark-handover102/packages';files={};sha=lambda b:hashlib.sha256(b).hexdigest()
for d in ['roadmark-rebuild101','roadmark-rebuild102','roadmark-research']:
 for p in sorted((root/d).rglob('*')):
  if not p.is_file() or p.is_symlink() or p.suffix.lower() in ['.zip','.pyc','.png','.jpg','.jpeg','.webp'] or '__pycache__' in p.parts:continue
  files[p.relative_to(root).as_posix()]=p.read_bytes()
for p in (root/'roadmark-measurement101').iterdir():
 if p.is_file() and p.suffix not in ['.zip','.pyc']:files[p.relative_to(root).as_posix()]=p.read_bytes()
for p in (root/'roadmark-recovery/reassembled100').iterdir():
 if p.is_file() and p.suffix not in ['.zip','.pyc']:files[p.relative_to(root).as_posix()]=p.read_bytes()
for archive,prefix in [('roadmark-measurement101/Roadmark-101-measured-market-assets-final.zip','roadmark-measurement101/saved-artifact-packet/'),('roadmark-recovery/attached100/Roadmark-100-recovery-research-supplement(1).zip','recovered100-research-supplement/')]:
 with zipfile.ZipFile(root/archive) as z:
  assert z.testzip() is None
  for n in z.namelist():
   assert not PurePosixPath(n).is_absolute() and '..' not in PurePosixPath(n).parts
   if n.endswith('/'):continue
   assert not n.lower().endswith(('.png','.jpg','.jpeg','.webp'))
   files[prefix+n]=z.read(n)
files['packaging/package_source_preview.py']=(root/'roadmark-handover102/package_source_preview.py').read_bytes()
files['packaging/package_evidence.py']=Path(__file__).read_bytes()
files['packaging/source-preview-identities.json']=(out/'source-preview-identities.json').read_bytes()
files['START-HERE-EVIDENCE102.txt']=b'''ROADMARK CHECKPOINT102 EVIDENCE
This is a verified development handover, not a complete market census or public-release approval.

Current102: roadmark-rebuild102/ holds exact source maps, application receipt, actual execution/exit receipts, full seven-stage QA, portable preservation proof, eight scoped browser observations and final-review/. The root actually executed all application builds/tests/proofs. Some filename/schema labels retain99/101 for the historical runner; the receipts bind the actual102 inputs and outputs.

Historical101: roadmark-rebuild101/ contains rebuilt101 evidence, including failed earlier focused attempts, corrected checks and final successful QA. Do not treat a failed intermediate run as the final result or an old pass as verification of new source.

Measurement: roadmark-measurement101/ contains the fresh100-vs101 raw route-file comparison and saved-artifact-packet/ with measured emitted files. It is not102 performance, network transfer or real-phone testing. The ~1.8GB temporary baseline build and dependencies are excluded.

Research: roadmark-research/ contains bounded research observations, proposed changes/preimages and independent static reviews. recovered100-research-supplement/ preserves the recovered100 research supplement unchanged, with its historical manifest. Older missing evidence recovery index/full lost audit history remain unavailable. The source archive additionally contains historical QA/evidence files recovered with checkpoint100.

Portability: paths and absolute interpreter/workspace locations in old receipts describe the original execution. Do not blindly rerun these scripts in a different folder or weaken pins. Use the project commands in the separate handover for ordinary development. Prior baseline binaries/source not bundled here must be restored from their named archives for an exact historical replay. This archive is evidence, not a self-contained runtime.

Privacy: no browser screenshot images, credentials, private review queue, node_modules, temporary Next builds or nested checkpoint ZIPs included. Text browser observations only. All original submitted source/preview archives remain separate rollback assets.

All current source and four preview aliases were byte-checked against the recorded maps and outputs. See matching standalone source/preview package identities in packaging/source-preview-identities.json. EVIDENCE-MANIFEST102.json enumerates every payload except itself. No file can contain its own archive hash; the final evidence ZIP hash is in the separate handover DOCX.
'''
manifest={'checkpoint':102,'sourceAndPreviewArchives':json.loads((out/'source-preview-identities.json').read_text()),'files':{p:{'bytes':len(b),'sha256':sha(b)}for p,b in sorted(files.items())}}
files['EVIDENCE-MANIFEST102.json']=(json.dumps(manifest,indent=2)+'\n').encode()
p=out/'Roadmark-102-evidence.zip'
with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as z:
 for n,b in sorted(files.items()):z.writestr(n,b)
with zipfile.ZipFile(p)as z:
 assert z.testzip()is None
 assert set(z.namelist())==set(files)
 for n,b in files.items():assert sha(z.read(n))==sha(b),n
r={'name':p.name,'bytes':p.stat().st_size,'sha256':sha(p.read_bytes()),'members':len(files)}
(out/'evidence-identity.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
