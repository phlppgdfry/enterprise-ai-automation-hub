"""Validate local Markdown targets and JSON syntax without third-party packages."""
import json
from pathlib import Path
import re
import sys
ROOT = Path(__file__).resolve().parents[1]
errors = []
for file in ROOT.rglob("*"):
    if any(part in {".git", "bin", "obj", "__pycache__"} for part in file.parts) or not file.is_file():
        continue
    if file.suffix == ".json":
        try:
            json.loads(file.read_text())
        except (ValueError, UnicodeError) as error:
            errors.append(f"{file}: {error}")
    if file.suffix == ".md":
        for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", file.read_text()):
            if "://" in target or target.startswith(("#", "mailto:")):
                continue
            path = target.split("#")[0]
            if not (file.parent / path).exists():
                errors.append(f"{file.relative_to(ROOT)}: missing {target}")
if errors:
    print("\n".join(errors), file=sys.stderr)
    raise SystemExit(1)
print("Local documentation targets and JSON: OK")
