#!/usr/bin/env bash
set -euo pipefail

echo "== Fix: fetch(absUrl(...)), {..}  -> fetch(absUrl(...), {..} =="

python - <<'PY'
from pathlib import Path
import re

ROOT = Path(".").resolve()
APP = ROOT / "app"
if not APP.exists():
    raise SystemExit("app/ not found")

def is_client(txt: str) -> bool:
    head = "\n".join(txt.splitlines()[:10])
    return bool(re.search(r"^\s*['\"]use client['\"]\s*;?\s*$", head, re.M))

changed = []

for p in APP.rglob("*.tsx"):
    # skip API route handlers
    if "/app/api/" in str(p).replace("\\","/"):
        continue

    txt = p.read_text(encoding="utf-8", errors="replace")
    if is_client(txt):
        continue

    new = txt

    # 1) object literal as 2nd arg
    new = re.sub(
        r"fetch\(\s*absUrl\(([^)]*)\)\)\s*,\s*\{",
        r"fetch(absUrl(\1), {",
        new
    )

    # 2) any 2nd arg (variable/expression): fetch(absUrl(x)), y  -> fetch(absUrl(x), y
    new = re.sub(
        r"fetch\(\s*absUrl\(([^)]*)\)\)\s*,\s*([^\n;]+)",
        r"fetch(absUrl(\1), \2",
        new
    )

    if new != txt:
        p.write_text(new, encoding="utf-8")
        changed.append(str(p.relative_to(ROOT)))

print("Updated files:")
for f in changed:
    print(" -", f)
if not changed:
    print("No broken patterns found.")
PY

echo "== Done =="
git status --porcelain=v1 || true
