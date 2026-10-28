"""Run with the Hub already listening on 127.0.0.1:5088."""
import json
import urllib.request
import uuid


def call(path, identity, body=None, key=None):
    headers = {"Authorization": "Bearer " + identity, "Content-Type": "application/json"}
    if key:
        headers["Idempotency-Key"] = key
    request = urllib.request.Request("http://127.0.0.1:5088" + path,
        data=json.dumps(body).encode() if body is not None else None, headers=headers)
    with urllib.request.urlopen(request, timeout=5) as response:
        return json.load(response)


if __name__ == "__main__":
    key = "demo-" + str(uuid.uuid4())
    item = call("/requests", "demo-alice", dict(title="Veiligheidsmateriaal werf", category="materials", amount=320), key)
    print("1. Medewerker dient in:", item["id"], item["status"], item["queue"])
    retry = call("/requests", "demo-alice", dict(title="Veiligheidsmateriaal werf", category="materials", amount=320), key)
    assert retry["id"] == item["id"]
    print("2. Retry behoudt dezelfde aanvraag:", retry["id"])
    result = call("/requests/" + item["id"] + "/decision", "demo-manager",
                  dict(outcome="approved", reason="Budget en noodzaak gecontroleerd", version=item["version"]))
    print("3. Mens beslist:", result["status"], "versie", result["version"])
    print(json.dumps(result["events"], indent=2, ensure_ascii=False))
