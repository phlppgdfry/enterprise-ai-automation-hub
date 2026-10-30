"""Start an isolated Hub, seed synthetic data and run browser acceptance. Port 5088 must be free."""
import os
from pathlib import Path
import subprocess
import socket
import sys
import tempfile
import time
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
with socket.socket() as probe:
    if probe.connect_ex(('127.0.0.1',5088)) == 0:
        raise SystemExit('Port 5088 occupied; refusing to write to an unrelated process')
with tempfile.TemporaryDirectory(prefix='noordwerk-browser-') as temp:
    env=dict(os.environ,HUB_DATA=str(Path(temp)/'requests.json'),ASPNETCORE_ENVIRONMENT='Production')
    with tempfile.TemporaryFile() as log:
        process=subprocess.Popen(['dotnet',str(ROOT/'src/bin/Release/net10.0/AutomationHub.dll')],cwd=ROOT,env=env,stdout=log,stderr=log)
        try:
            for _ in range(100):
                if process.poll() is not None:
                    log.seek(0)
                    raise RuntimeError(log.read().decode())
                try:
                    with urllib.request.urlopen('http://127.0.0.1:5088/health',timeout=.5):break
                except OSError:time.sleep(.1)
            else:raise RuntimeError('Hub did not start; check port 5088')
            # Reject accidental attachment to an unrelated server: give our process
            # time to report a bind failure before making any synthetic writes.
            time.sleep(.3)
            if process.poll() is not None:raise RuntimeError('Hub process stopped; port may be occupied')
            subprocess.run([sys.executable,'scripts/seed_demo.py'],cwd=ROOT,env=env,check=True)
            subprocess.run(['node','scripts/browser_verify.mjs'],cwd=ROOT,env=env,check=True)
        finally:
            if process.poll() is None:
                process.terminate()
            process.wait(timeout=10)
