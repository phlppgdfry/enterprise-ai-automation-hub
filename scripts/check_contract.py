"""Offline contract/handoff checks. Does not prove connector import or tenant execution."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
d=json.loads((ROOT/'contracts/openapi.json').read_text())
expected={('/health','get'),('/requests','get'),('/requests','post'),('/requests/{id}','get'),('/requests/{id}/decision','post')}
actual={(p,m) for p,methods in d['paths'].items() for m in methods if m in {'get','post','put','delete','patch'}}
assert actual==expected,'Unexpected API surface'
assert d['servers']==[{'url':'http://127.0.0.1:5088'}]
assert d['paths']['/health']['get']['security']==[]
assert 'Never expose as an agent tool' in d['paths']['/requests/{id}/decision']['post']['description']
assert '503' in d['paths']['/requests']['post']['responses']
def walk(value):
 if isinstance(value,dict):
  if '$ref' in value:
   ref=value['$ref'];assert ref.startswith('#/'),'External references require review'
   target=d
   for part in ref[2:].split('/'):target=target[part]
  for child in value.values():walk(child)
 elif isinstance(value,list):
  for child in value:walk(child)
walk(d)
settings=json.loads((ROOT/'power-platform/deployment-settings.example.json').read_text())
assert set(settings)=={'EnvironmentVariables','ConnectionReferences'}
for ref in settings['ConnectionReferences']:assert set(ref)=={'LogicalName','ConnectionId','ConnectorId'}
print('PASS: offline API refs/surface and illustrative deployment-settings shape; tenant import NOT EXECUTED')
