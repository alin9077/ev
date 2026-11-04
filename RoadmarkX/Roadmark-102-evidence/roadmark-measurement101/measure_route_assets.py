"""Read-only static emitted asset accounting, not browser transfer or timing."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import hashlib,json
class Assets(HTMLParser):
 def __init__(self): super().__init__();self.modern=[];self.legacy=[];self.css=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='script' and a.get('src'): (self.legacy if 'nomodule' in a else self.modern).append(a['src'])
  if tag=='link' and a.get('rel')=='stylesheet' and a.get('href'): self.css.append(a['href'])
def record(p):
 b=p.read_bytes();return {'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def measure(app):
 build=app/'.next';entry=build/'server/app/market.html';parser=Assets();parser.feed(entry.read_text());result={'app':str(app),'buildID':(build/'BUILD_ID').read_text().strip(),'html':record(entry)}
 for key,values in [('modernJS',parser.modern),('legacyJS',parser.legacy),('css',parser.css)]:
  rows=[]
  for url in dict.fromkeys(values):
   u=urlsplit(url);assert not u.scheme and not u.netloc and u.path.startswith('/_next/static/')
   rel=Path(unquote(u.path).removeprefix('/_next/'));assert '..' not in rel.parts
   p=build/rel;assert p.is_file();rows.append({'url':url,'path':str(p),**record(p)})
  result[key]={'files':rows,'count':len(rows),'rawBytes':sum(r['bytes'] for r in rows)}
 result['initialModernDocumentAssetsRawBytes']=result['html']['bytes']+result['modernJS']['rawBytes']+result['css']['rawBytes'];return result
if __name__=='__main__':
 before=measure(Path('roadmark-measurement101/baseline100/roadmark'));after=measure(Path('roadmark-work/roadmark'))
 comparisons={}
 for key in ['modernJS','css']:
  a,b=before[key]['rawBytes'],after[key]['rawBytes'];comparisons[key]={'before':a,'after':b,'reductionBytes':a-b,'reductionPercent':100*(a-b)/a}
 a,b=before['initialModernDocumentAssetsRawBytes'],after['initialModernDocumentAssetsRawBytes'];comparisons['initialModernDocumentAssets']={'before':a,'after':b,'reductionBytes':a-b,'reductionPercent':100*(a-b)/a}
 print(json.dumps({'method':'HTML external scripts, excluding noModule for modernJS; distinct URLs; raw emitted bytes only','beforeLabel':'fresh exact100 source rebuild using copied current101 dependencies','before':before,'after':after,'comparisons':comparisons,'notMeasured':['HTTP transfer compression','speed','async or prefetched resources','physical phones']},indent=2))
