"""Run the built local Hub with a stable repository-relative store; never reseed or erase data."""
import os
from pathlib import Path
import subprocess
import sys
ROOT=Path(__file__).resolve().parents[1]
dll=ROOT/'src/bin/Release/net10.0/AutomationHub.dll'
if not dll.exists():raise SystemExit('Run make build first')
env=dict(os.environ,HUB_DATA=os.environ.get('HUB_DATA',str(ROOT/'data/requests.json')))
try:
    raise SystemExit(subprocess.call(['dotnet',str(dll)],cwd=ROOT,env=env))
except KeyboardInterrupt:
    pass
