"""Root serial QA runner. No application edits. Every completed stage records hashes and exit."""
from pathlib import Path
import hashlib,json,datetime,subprocess,os,sys
W=Path('/workspace/scratch/586427eef9f2'); A=W/'roadmark-work/roadmark'; Q=W/'roadmark-research/applied93/qa'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def encoded(d):return json.dumps(d,sort_keys=True,separators=(',',':')).encode()
def write(p,d):p.write_text(json.dumps(d,indent=2,sort_keys=True)+'\n')
def digest(d):return hashlib.sha256(encoded(d)).hexdigest()
assert not Q.exists(), 'Use a new QA directory; no overwrite of prior evidence'
Q.mkdir()
manifest=Q/'frozen-inputs.json'
expected_path=W/'roadmark-research/applied93/expected-inputs-after-type-fix.json'
assert sha(expected_path)=='e8161ffb02c560a482c4dbf4fbde2fd3d908a0cd8e9f47585e092fc22411d5ad'
expected=json.loads(expected_path.read_text())
assert len(expected)==1650
candidate_path=W/'roadmark-research/market-lead93-implementation/candidate-manifest-revision3.json'
assert sha(candidate_path)=='23c7857372a56d9eb2492e924d61bf7bc1294762734bc6a800d31bdce948a22f'
changes={r['path']:r['sha256'] for r in json.loads(candidate_path.read_text())['files']}
assert len(changes)==7 and all(expected[n]==pin for n,pin in changes.items())
actual={n:sha(A/n) for n in expected};assert actual==expected,'Application drift before freeze'
if manifest.exists():assert json.loads(manifest.read_text())==actual,'Frozen inputs differ'
else:write(manifest,actual)
fixed=digest(actual)
write(Q/'freeze-receipt.json',{'atUTC':now(),'fileCount':len(actual),'frozenInputManifestSHA256':sha(manifest),'canonicalDigest':fixed,'algorithm':'SHA256(UTF8(json.dumps(path_to_SHA256,sort_keys=True,separators=(comma,colon))))','changedOrAddedFiles':changes})
env={**os.environ,'NODE_OPTIONS':'--max-old-space-size=1280 --max-semi-space-size=8','NEXT_TELEMETRY_DISABLED':'1'}
tests=sorted(str(p.relative_to(A)) for p in (A/'tests').glob('*.test.ts') if p.name!='local-review.test.ts')
stages=[('non_http_tests',['node','--import','tsx','--test','--test-concurrency=1',*tests]),('local_http_tests',['node','--import','tsx','--test','tests/local-review.test.ts']),('typecheck',['node','node_modules/typescript/bin/tsc','--noEmit']),('lint',['node','node_modules/eslint/bin/eslint.js','src','tests','scripts']),('validation',['node','--import','tsx','scripts/validate.ts']),('production_build',['node','node_modules/next/dist/bin/next','build']),('portable_build',['node','--import','tsx','scripts/build-portable.ts'])]
for stage,argv in stages:
 receipt=Q/(stage+'.json');log=Q/(stage+'.log');assert not receipt.exists() and not log.exists(),'Will not overwrite prior stage result'
 before=digest({n:sha(A/n) for n in actual});assert before==fixed,'Input drift before '+stage
 start=now();print('START',stage,start,flush=True)
 with log.open('wb') as f:r=subprocess.run(argv,cwd=A,env=env,stdout=f,stderr=subprocess.STDOUT)
 after=digest({n:sha(A/n) for n in actual})
 result={'schema':'roadmark-stage93-receipt-v1','checkpoint':93,'stage':stage,'startedAtUTC':start,'finishedAtUTC':now(),'command':argv,'cwd':str(A),'environment':{'NODE_OPTIONS':env['NODE_OPTIONS'],'NEXT_TELEMETRY_DISABLED':'1'},'exitCode':r.returncode,'frozenInputManifestSHA256':sha(manifest),'frozenInputDigestBefore':before,'frozenInputDigestAfter':after,'log':{'path':str(log.relative_to(W)),'sha256':sha(log),'bytes':log.stat().st_size}}
 write(receipt,result);print('END',stage,r.returncode,result['finishedAtUTC'],flush=True)
 if r.returncode or after!=fixed:sys.exit(r.returncode or 90)
print('SEVEN_QA_STAGES_COMPLETE; emitted proof and browser still pending',flush=True)
