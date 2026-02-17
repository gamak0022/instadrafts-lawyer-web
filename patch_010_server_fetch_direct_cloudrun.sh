#!/usr/bin/env bash
set -euo pipefail

FILES=(
  "app/lawyer/inbox/page.tsx"
  "app/lawyer/case/[caseId]/page.tsx"
)

echo "== Patching server-side fetch to call API_ORIGIN directly (no /api proxy) =="

python - <<'PY'
from pathlib import Path
import re

files = [Path(p) for p in [
  "app/lawyer/inbox/page.tsx",
  "app/lawyer/case/[caseId]/page.tsx",
]]

def ensure_helpers(txt: str) -> str:
    if "__apiOriginUrl" in txt and "__lawyerHeaders" in txt:
        return txt

    insert = """
const __DEV_LAWYER_ROLE = process.env.NEXT_PUBLIC_DEV_ROLE || 'LAWYER';
const __DEV_LAWYER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || 'lawyer_1';

function __lawyerHeaders() {
  return {
    'x-user-role': __DEV_LAWYER_ROLE,
    'x-user-id': __DEV_LAWYER_ID,
  } as Record<string, string>;
}

function __apiOriginUrl(path: string) {
  const base =
    process.env.API_ORIGIN ||
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    '';
  if (!base) throw new Error('API_ORIGIN_MISSING');
  return new URL(path, base).toString();
}
""".strip() + "\n\n"

    # put helpers after last import block
    m = list(re.finditer(r"^(import .*?;\s*)+$", txt, flags=re.M))
    if m:
        end = m[-1].end()
        return txt[:end] + "\n\n" + insert + txt[end:]
    return insert + txt

def patch_urls(txt: str) -> str:
    # Replace absUrl('/api/v1/...') or absUrl("/api/v1/...") -> __apiOriginUrl('/v1/...')
    txt = re.sub(
        r"absUrl\(\s*([\"'])/api/v1/([^\"']+)\1\s*\)",
        r"__apiOriginUrl('\\/v1/\2')",
        txt
    )
    # Replace plain '/api/v1/...' inside fetch(...) URL arg -> __apiOriginUrl('/v1/...')
    txt = re.sub(
        r"fetch\(\s*([\"'])/api/v1/([^\"']+)\1\s*,",
        r"fetch(__apiOriginUrl('\\/v1/\2'),",
        txt
    )
    return txt

def ensure_fetch_headers(txt: str) -> str:
    # Ensure any fetch(__apiOriginUrl(...), { ... }) includes headers: __lawyerHeaders()
    def repl(m):
        before = m.group(1)
        obj = m.group(2)
        after = m.group(3)

        if re.search(r"\bheaders\s*:", obj):
            # if headers exists, merge
            obj2 = re.sub(
                r"\bheaders\s*:\s*\{",
                "headers: { ...__lawyerHeaders(), ",
                obj,
                count=1
            )
            if obj2 == obj:
                # headers might be headers: someVar
                obj2 = re.sub(
                    r"\bheaders\s*:\s*([A-Za-z0-9_.$()]+)\s*,",
                    r"headers: { ...__lawyerHeaders(), ...(\1 as any) },",
                    obj
                )
            return before + obj2 + after

        # no headers key: inject near start of object
        obj_stripped = obj.lstrip()
        prefix_len = len(obj) - len(obj_stripped)
        indent = obj[:prefix_len]
        injected = indent + "headers: __lawyerHeaders(),\n" + obj
        return before + injected + after

    return re.sub(
        r"(fetch\(\s*__apiOriginUrl\([^)]+\)\s*,\s*\{\s*)([\s\S]*?)(\}\s*\))",
        repl,
        txt
    )

for p in files:
    if not p.exists():
        print(f"skip (missing): {p}")
        continue
    txt = p.read_text(encoding="utf-8")
    out = txt
    out = ensure_helpers(out)
    out = patch_urls(out)
    out = ensure_fetch_headers(out)
    if out != txt:
        p.write_text(out, encoding="utf-8")
        print("patched:", p)
    else:
        print("no change:", p)
PY

echo "== Done =="
git status --porcelain=v1 || true
