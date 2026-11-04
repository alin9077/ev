from pathlib import Path
import subprocess,datetime,json,hashlib,sys
w=Path('/workspace/scratch/586427eef9f2');p=w/'roadmark-research/market93-output-check/observe_market93_build.py'
pin='af483048ca73c957fdb4553a01a534e265f9a885d2db161c3bd14a5ded798ff6'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
assert sha(p)==pin
log=w/'roadmark-research/applied93/build-observer-attempt1.log'; terminal=w/'roadmark-research/applied93/build-observer-attempt1-terminal.json'; out=w/'roadmark-research/applied93/build-observer-attempt1'
assert not log.exists() and not terminal.exists() and not out.exists()
argv=['python','-B',str(p),'--workspace',str(w),'--output',str(out.relative_to(w)),'--approved-observer-sha256',pin]
start=now();print('OBSERVER_START',start,flush=True)
with log.open('xb') as f:r=subprocess.run(argv,cwd=w,stdout=f,stderr=subprocess.STDOUT)
binding=out/'build-output-binding.json'
d={'schemaVersion':'roadmark.market93-root-observer-terminal.v1','checkpoint':93,'exitCode':r.returncode,'observerSHA256':pin,'buildBindingSHA256':sha(binding) if binding.exists() else None,'startedAtUTC':start,'finishedAtUTC':now(),'command':argv,'cwd':str(w),'log':{'path':str(log.relative_to(w)),'sha256':sha(log),'bytes':log.stat().st_size}}
with terminal.open('x') as f:json.dump(d,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps(d),flush=True);sys.exit(r.returncode)
