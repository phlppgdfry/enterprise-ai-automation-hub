"""Offline startup, interruption and second-writer checks on isolated stores."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import unittest
ROOT=Path(__file__).resolve().parents[1]
DLL=ROOT/'src/bin/Release/net10.0/AutomationHub.dll'

class StorageTests(unittest.TestCase):
    def start(self,path):
        log=tempfile.TemporaryFile()
        process=subprocess.Popen(['dotnet',str(DLL)],env=dict(os.environ,HUB_DATA=str(path)),stdout=log,stderr=log)
        return process,log

    def test_corrupt_and_invalid_state_fail_without_modification(self):
        for content in ['{broken','null','[null]','[{}]', '[{"Id":"00000000-0000-0000-0000-000000000001","Status":"approved"}]']:
            with self.subTest(content=content),tempfile.TemporaryDirectory() as temp:
                path=Path(temp)/'requests.json';path.write_text(content)
                process,log=self.start(path)
                try:
                    self.assertNotEqual(0,process.wait(timeout=10))
                    self.assertEqual(content,path.read_text())
                finally:
                    if process.poll() is None:process.terminate();process.wait(timeout=10)
                    log.close()

    def test_interrupted_temp_is_ignored_and_second_writer_denied(self):
        with tempfile.TemporaryDirectory() as temp:
            path=Path(temp)/'requests.json';path.write_text('[]')
            Path(str(path)+'.tmp').write_text('{interrupted')
            process,log=self.start(path)
            try:
                for _ in range(100):
                    if process.poll() is not None:raise AssertionError('Store owner stopped')
                    if Path(str(path)+'.lock').exists():break
                    time.sleep(.05)
                second,otherlog=self.start(path)
                try:self.assertNotEqual(0,second.wait(timeout=10))
                finally:
                    if second.poll() is None:second.terminate();second.wait(timeout=10)
                    otherlog.close()
                self.assertEqual('[]',path.read_text())
                self.assertEqual('{interrupted',Path(str(path)+'.tmp').read_text())
            finally:
                process.terminate();process.wait(timeout=10);log.close()
