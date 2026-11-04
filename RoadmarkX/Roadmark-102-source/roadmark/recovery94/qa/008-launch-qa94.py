from pathlib import Path
import subprocess,hashlib,json,datetime,sys
w=Path('/workspace/scratch/586427eef9f2');b=w/'roadmark-research/applied94';p=w/'roadmark-research/qa94-candidate/run_qa94.py';pin='84304ed39011cc5e52e1be59c9c5b74fd743b22358cf5ee04c81a5593ced4b6e'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
assert sha(p)==pin
out=b/'qa-attempt1';log=b/'qa-attempt1-launch.log';terminal=b/'qa-attempt1-terminal.json';assert not out.exists() and not log.exists() and not terminal.exists()
argv=['python','-B',str(p),'--workspace',str(w),'--output',str(out.relative_to(w)),'--expected-inputs','roadmark-research/applied94/expected-inputs-revision2.json','--expected-inputs-sha256','6fe274badc06ae64b9fa2be225d73019ef98bd503dcdf0cc9b38238daa33a3ba','--candidate-manifest','roadmark-research/report-preview94-candidate/MANIFEST.json','--candidate-manifest-sha256','33ec7a7dc94784d360e4a4e62c491f69b42f2663919f72376b303e24dce72643','--revision','roadmark-research/report-preview94-candidate/revision2/MANIFEST.json','7baf0f650bfc0b957c51555617aa3e80898815874672f02c28d2fae2bdf362cd','--approved-runner-sha256',pin,'--exclusive-workspace-confirmed']
start=now();print('QA94_START',start,flush=True)
with log.open('xb') as f:r=subprocess.run(argv,cwd=w,stdout=f,stderr=subprocess.STDOUT)
result=out/'run-result.json'
d={'schemaVersion':'roadmark94.root-qa-terminal.v1','checkpoint':94,'exitCode':r.returncode,'startedAtUTC':start,'finishedAtUTC':now(),'command':argv,'cwd':str(w),'runnerSHA256':pin,'runResultSHA256':sha(result) if result.exists() else None,'log':{'path':str(log.relative_to(w)),'sha256':sha(log),'bytes':log.stat().st_size}}
with terminal.open('x') as f:json.dump(d,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps(d),flush=True);sys.exit(r.returncode)
