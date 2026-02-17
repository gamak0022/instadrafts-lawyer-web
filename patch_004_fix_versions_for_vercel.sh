#!/usr/bin/env bash
set -euo pipefail

FILE="package.json"

# Patch package.json to valid versions (stable)
python - <<'PY'
import json
from pathlib import Path

p = Path("package.json")
data = json.loads(p.read_text())

data["dependencies"]["next"] = "14.2.35"
data["dependencies"]["react"] = "18.3.1"
data["dependencies"]["react-dom"] = "18.3.1"

data["devDependencies"]["eslint-config-next"] = "14.2.35"
data["devDependencies"]["@types/react"] = "^18"
data["devDependencies"]["@types/react-dom"] = "^18"

p.write_text(json.dumps(data, indent=2) + "\n")
print("✅ patched package.json")
PY

echo "== package.json (deps) =="
node -e "const p=require('./package.json'); console.log(p.dependencies, p.devDependencies['eslint-config-next']);"

echo "✅ Done. Now regenerate lockfile with: npm install"
