from pathlib import Path
import subprocess,datetime,json,hashlib,sys
w=Path('/workspace/scratch/586427eef9f2'); base=w/'roadmark-research/applied93'
p=w/'roadmark-research/market93-output-check/verify_market93.py';pin='f5f3e793f7db9d2cc3db244f805db63d7b90b0db4ff76d2dd2dfec8d17894a83'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
assert sha(p)==pin
b=base/'build-observer-attempt1/build-output-binding.json'; t=base/'build-observer-attempt1-terminal.json'
assert json.loads(b.read_text())['passed'] is True and json.loads(t.read_text())['exitCode']==0
for stage in ['non_http_tests','local_http_tests','typecheck','lint','validation','production_build','portable_build']:
 assert json.loads((base/'qa'/f'{stage}.json').read_text())['exitCode']==0
out=base/'emitted-output-proof-attempt1';log=base/'emitted-proof-attempt1.log';receipt=base/'emitted-proof-attempt1-terminal.json'
assert not out.exists() and not log.exists() and not receipt.exists()
argv=['python','-B',str(p),'--workspace',str(w),'--qa-directory','roadmark-research/applied93/qa','--output',str(out.relative_to(w)),'--approved-verifier-sha256',pin,'--build-output-binding',str(b.relative_to(w)),'--build-output-binding-sha256',sha(b),'--observer-terminal',str(t.relative_to(w)),'--observer-terminal-sha256',sha(t)]
start=now();print('PROOF_START',start,flush=True)
with log.open('xb') as f:r=subprocess.run(argv,cwd=w,stdout=f,stderr=subprocess.STDOUT)
proof=out/'proof.json'
d={'schemaVersion':'roadmark93.root-emitted-proof-terminal.v1','checkpoint':93,'exitCode':r.returncode,'startedAtUTC':start,'finishedAtUTC':now(),'command':argv,'cwd':str(w),'verifierSHA256':pin,'proofSHA256':sha(proof) if proof.exists() else None,'frozenInputManifestSHA256':'e8161ffb02c560a482c4dbf4fbde2fd3d908a0cd8e9f47585e092fc22411d5ad','log':{'path':str(log.relative_to(w)),'sha256':sha(log),'bytes':log.stat().st_size}}
with receipt.open('x') as f:json.dump(d,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps(d),flush=True);sys.exit(r.returncode)
