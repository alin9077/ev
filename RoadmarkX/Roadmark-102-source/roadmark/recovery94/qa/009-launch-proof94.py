from pathlib import Path
import subprocess,hashlib,json,datetime,sys
w=Path('/workspace/scratch/586427eef9f2');b=w/'roadmark-research/applied94';p=w/'roadmark-research/qa94-candidate/verify_qa94.py';runner=w/'roadmark-research/qa94-candidate/run_qa94.py';pin='24f473f37067048d2e721fe321c67ca30dc3bd4c762d4f3079652d1aace85f64';runnerpin='84304ed39011cc5e52e1be59c9c5b74fd743b22358cf5ee04c81a5593ced4b6e'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
assert sha(p)==pin and sha(runner)==runnerpin
qa=b/'qa-attempt1';result=qa/'run-result.json';qaterminal=b/'qa-attempt1-terminal.json';assert json.loads(result.read_text())['passed'] is True
assert json.loads(qaterminal.read_text())['exitCode']==0 and json.loads(qaterminal.read_text())['runResultSHA256']==sha(result)
out=b/'emitted-proof-attempt1';log=b/'emitted-proof-attempt1.log';terminal=b/'emitted-proof-attempt1-terminal.json';assert not out.exists() and not log.exists() and not terminal.exists()
argv=['python','-B',str(p),'--workspace',str(w),'--runner',str(runner),'--approved-runner-sha256',runnerpin,'--approved-verifier-sha256',pin,'--qa-directory',str(qa.relative_to(w)),'--run-result-sha256',sha(result),'--output',str(out.relative_to(w))]
start=now();print('PROOF94_START',start,flush=True)
with log.open('xb') as f:r=subprocess.run(argv,cwd=w,stdout=f,stderr=subprocess.STDOUT)
proof=out/'proof.json'
d={'schemaVersion':'roadmark94.root-emitted-proof-terminal.v1','checkpoint':94,'exitCode':r.returncode,'startedAtUTC':start,'finishedAtUTC':now(),'command':argv,'cwd':str(w),'verifierSHA256':pin,'runnerSHA256':runnerpin,'runResultSHA256':sha(result),'qaTerminalSHA256':sha(qaterminal),'proofSHA256':sha(proof) if proof.exists() else None,'log':{'path':str(log.relative_to(w)),'sha256':sha(log),'bytes':log.stat().st_size}}
with terminal.open('x') as f:json.dump(d,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps(d),flush=True);sys.exit(r.returncode)
