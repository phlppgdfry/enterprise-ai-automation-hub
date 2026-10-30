"""Offline release hygiene: tracked artifacts, JSON/XML, action pins and Git-history text.

This limited pattern scanner is not a substitute for dedicated secret-scanning services.
"""
import json
from pathlib import Path
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]

def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)

patterns=[rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
          rb'gh[pousr]_[A-Za-z0-9]{30,}',rb'github_pat_[A-Za-z0-9_]{30,}',
          rb'sk-[A-Za-z0-9]{30,}',rb'AKIA[0-9A-Z]{16}']
errors=[];files=git('ls-files','-z').decode().split('\0')
for name in filter(None,files):
    path=ROOT/name
    if not path.exists():continue
    if path.name.startswith('.env') and path.name!='.env.example':errors.append('Tracked environment file: '+name)
    if path.suffix.lower() in {'.db','.sqlite','.sqlite3','.dll','.exe'} or path.name=='requests.json':errors.append('Unexpected runtime artifact: '+name)
    raw=path.read_bytes()
    if any(re.search(pattern,raw) for pattern in patterns):errors.append('Credential pattern in '+name)
    if path.suffix=='.py':compile(raw,str(path),'exec')
    if path.suffix=='.json':json.loads(raw)
    if path.suffix in {'.svg','.bpmn'}:
        doc=ET.fromstring(raw)
        if path.suffix=='.bpmn':
            ids={e.get('id') for e in doc.iter() if e.get('id')}
            for element in doc.iter():
                for key in ('sourceRef','targetRef','bpmnElement'):
                    if element.get(key) and element.get(key) not in ids:errors.append('Broken BPMN reference in '+name)
    if '.github/workflows/' in name and path.suffix in {'.yml','.yaml'}:
        for target in re.findall(r'uses:\s*([^\s]+)',raw.decode()):
            if not re.fullmatch(r'[\w.-]+/[\w./-]+@[0-9a-f]{40}',target):errors.append('Unpinned action '+target)
        if 'pull_request_target' in raw.decode():errors.append('Review privileged PR trigger: '+name)
# Every reachable historical Git blob, including old commits, scanned once. Never print values.
objects={line.split()[0] for line in git('rev-list','--objects','--all').decode().splitlines()}
blobs=0
for identity in objects:
    if git('cat-file','-t',identity).strip()!=b'blob':continue
    blobs+=1
    raw=git('cat-file','blob',identity)
    if any(re.search(pattern,raw) for pattern in patterns):errors.append('Credential pattern in history blob '+identity[:12])
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {len(list(filter(None,files)))} tracked paths; {blobs} historical blobs; JSON/XML/action pins and limited credential patterns')
