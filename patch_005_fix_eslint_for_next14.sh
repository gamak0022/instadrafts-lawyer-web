#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
import json
from pathlib import Path

p = Path("package.json")
data = json.loads(p.read_text())

# Next 14 expects eslint 8 (eslint-config-next peer)
data.setdefault("devDependencies", {})
data["devDependencies"]["eslint"] = "^8.57.1"

# keep eslint-config-next already set to 14.2.35 (from previous patch)
# keep other deps as-is

p.write_text(json.dumps(data, indent=2) + "\n")
print("✅ patched eslint to v8")
PY

echo "== sanity check versions =="
node -e "const p=require('./package.json'); console.log({next:p.dependencies.next, react:p.dependencies.react, eslint:p.devDependencies.eslint, eslintConfigNext:p.devDependencies['eslint-config-next']})"
