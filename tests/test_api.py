"""Contract tests against a real .NET process and an isolated, persisted store."""
import concurrent.futures
import json
import os
from pathlib import Path
import subprocess
import socket
import tempfile
import time
import unittest
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.env = dict(os.environ, HUB_DATA=str(Path(cls.tmp.name) / "requests.json"),
                       ASPNETCORE_ENVIRONMENT="Production")
        cls.start()

    @classmethod
    def start(cls):
        with socket.socket() as probe:
            if probe.connect_ex(("127.0.0.1", 5088)) == 0:
                raise RuntimeError("Port 5088 occupied; refusing to test an unrelated process")
        cls.log = tempfile.TemporaryFile()
        cls.process = subprocess.Popen(
            ["dotnet", str(ROOT / "src/bin/Release/net10.0/AutomationHub.dll")],
            env=cls.env, stdout=cls.log, stderr=cls.log, cwd=ROOT)
        for _ in range(100):
            if cls.process.poll() is not None:
                cls.log.seek(0)
                raise RuntimeError(cls.log.read().decode())
            try:
                with urllib.request.urlopen("http://127.0.0.1:5088/health", timeout=1):
                    return
            except (OSError, urllib.error.URLError):
                time.sleep(.1)
        cls.process.terminate()
        cls.process.wait(timeout=10)
        raise RuntimeError("API did not start")

    @classmethod
    def stop(cls):
        cls.process.terminate()
        cls.process.wait(timeout=10)
        cls.log.close()

    @classmethod
    def tearDownClass(cls):
        cls.stop()
        cls.tmp.cleanup()

    def call(self, method, path, payload=None, token="demo-alice", key=None):
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = "Bearer " + token
        if key:
            headers["Idempotency-Key"] = key
        req = urllib.request.Request("http://127.0.0.1:5088" + path,
            data=json.dumps(payload).encode() if payload is not None else None,
            headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                return response.status, json.load(response)
        except urllib.error.HTTPError as error:
            with error:
                return error.code, error.read()

    def create(self, key, **kwargs):
        body = dict(title="Werkmateriaal", category="materials", amount=75)
        body.update(kwargs)
        return self.call("POST", "/requests", body, key=key)

    def test_authentication(self):
        for token in (None, "unknown", "demo-manager-altered"):
            self.assertEqual(401, self.call("GET", "/requests", token=token)[0])

    def test_public_ui_does_not_bypass_api_auth(self):
        for path, expected in [("/", b"Noordwerk"), ("/app.js", b"/requests"), ("/app.css", b"--nav")]:
            with urllib.request.urlopen("http://127.0.0.1:5088" + path, timeout=5) as response:
                self.assertEqual(200, response.status)
                self.assertIn(expected, response.read())
                self.assertIn("frame-ancestors 'none'", response.headers["Content-Security-Policy"])
                self.assertEqual("nosniff", response.headers["X-Content-Type-Options"])
                self.assertEqual("no-store", response.headers["Cache-Control"])
        self.assertEqual(401, self.call("GET", "/requests", token=None)[0])

    def test_routing_boundaries(self):
        for index, (category, amount, queue) in enumerate([
            ("expense", 250, "Operations"), ("expense", 250.01, "Finance"),
            ("access", 0, "IT")]):
            status, item = self.create(f"routing-{index}", category=category, amount=amount)
            self.assertEqual(201, status)
            self.assertEqual(queue, item["queue"])
            self.assertEqual("pending", item["status"])

    def test_validation(self):
        for invalid in [dict(amount=-1), dict(amount=1.001), dict(amount=100001),
                        dict(title=" "), dict(title="x" * 161), dict(title="bad\ninput"),
                        dict(category="unknown"), dict(category="access", amount=1)]:
            self.assertEqual(400, self.create("invalid", **invalid)[0], invalid)
        self.assertEqual(400, self.call("POST", "/requests", dict(title="x", category="expense", amount=1))[0])

    def test_owner_isolation(self):
        _, item = self.create("private")
        self.assertEqual(404, self.call("GET", "/requests/" + item["id"], token="demo-bob")[0])
        _, others = self.call("GET", "/requests", token="demo-bob")
        self.assertNotIn(item["id"], [i["id"] for i in others])
        self.assertEqual(200, self.call("GET", "/requests/" + item["id"], token="demo-manager")[0])

    def test_required_fields_and_separation_of_roles(self):
        body = dict(title="x", category="materials", amount=0)
        for field in body:
            missing = {k: v for k, v in body.items() if k != field}
            self.assertEqual(400, self.call("POST", "/requests", missing, key="missing-" + field)[0])
        self.assertEqual(403, self.call("POST", "/requests", body, token="demo-manager", key="manager-create")[0])

    def test_idempotency_and_conflict(self):
        _, original = self.create("retry")
        _, retry = self.create("retry")
        self.assertEqual(original["id"], retry["id"])
        # The same EUR amount from an integer or floating-point JSON client is equivalent.
        _, decimal_retry = self.create("retry", amount=75.0)
        self.assertEqual(original["id"], decimal_retry["id"])
        self.assertEqual(409, self.create("retry", amount=76)[0])

    def test_concurrent_retry_creates_one_record(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            responses = list(pool.map(lambda _: self.create("concurrent"), range(12)))
        self.assertTrue(all(code == 201 for code, _ in responses))
        self.assertEqual(1, len({item["id"] for _, item in responses}))

    def test_human_approval_version_and_audit(self):
        _, item = self.create("decision")
        url = "/requests/" + item["id"] + "/decision"
        decision = dict(outcome="approved", reason="Budget gecontroleerd", version=1)
        self.assertEqual(403, self.call("POST", url, decision)[0])
        self.assertEqual(400, self.call("POST", url, dict(decision, reason=""), token="demo-manager")[0])
        self.assertEqual(409, self.call("POST", url, dict(decision, version=99), token="demo-manager")[0])
        code, result = self.call("POST", url, decision, token="demo-manager")
        self.assertEqual(200, code)
        self.assertEqual(2, result["version"])
        self.assertEqual(["submitted", "approved"], [e["action"] for e in result["events"]])
        self.assertEqual("maria", result["events"][-1]["actor"])
        self.assertEqual(409, self.call("POST", url, dict(decision, version=2), token="demo-manager")[0])

    def test_rejection(self):
        _, item = self.create("reject")
        code, result = self.call("POST", "/requests/" + item["id"] + "/decision",
            dict(outcome="rejected", reason="Geen budget", version=1), token="demo-manager")
        self.assertEqual(200, code)
        self.assertEqual("rejected", result["status"])

    def test_no_cancel_or_owner_role_escalation(self):
        status, item = self.call("POST", "/requests", dict(title="spoof",category="access",amount=0,
            owner="maria",role="approver",status="approved",tenant="other"),key="spoof")
        self.assertEqual(201,status)
        self.assertEqual(("alice","pending"),(item["owner"],item["status"]))
        self.assertEqual(404,self.call("GET","/requests/00000000-0000-0000-0000-000000000000")[0])
        self.assertEqual(405,self.call("DELETE","/requests/"+item["id"])[0])
        self.assertNotEqual(200,self.call("POST","/requests/"+item["id"]+"/cancel",{})[0])

    def test_failed_write_does_not_commit_memory_or_erase_store(self):
        path = Path(self.env["HUB_DATA"])
        before = path.read_bytes() if path.exists() else None
        blocker = Path(str(path)+".tmp")
        blocker.mkdir()
        try:
            self.assertEqual(503,self.create("failed-write")[0])
            _, visible = self.call("GET","/requests")
            self.assertNotIn("failed-write",[i["idempotencyKey"] for i in visible])
            self.assertEqual(before,path.read_bytes() if path.exists() else None)
        finally:
            blocker.rmdir()
        self.assertEqual(201,self.create("failed-write")[0])

    def test_concurrent_decisions_have_one_winner(self):
        _, item = self.create("competing-decisions")
        def decide(outcome):
            return self.call("POST", "/requests/" + item["id"] + "/decision",
                dict(outcome=outcome, reason="Concurrent review", version=1), token="demo-manager")[0]
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            codes = list(pool.map(decide, ["approved", "rejected"]))
        self.assertEqual([200, 409], sorted(codes))

    def test_z_restart_preserves_requests_and_idempotency(self):
        _, item = self.create("restart")
        self.stop()
        self.start()
        self.assertEqual(item, self.call("GET", "/requests/" + item["id"])[1])
        self.assertEqual(item["id"], self.create("restart")[1]["id"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
