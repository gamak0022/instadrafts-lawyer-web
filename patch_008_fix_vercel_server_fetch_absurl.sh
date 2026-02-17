#!/usr/bin/env bash
set -euo pipefail

echo "== Patch: Fix server fetch('/api/...') -> fetch(absUrl('/api/...')) for Vercel =="

python - <<'PY'
from pathlib import Path
import re

ROOT = Path(".").resolve()
APP = ROOT / "app"
if not APP.exists():
    raise SystemExit("app/ not found; are you in instadrafts-lawyer-web repo?")

def is_client_component(txt: str) -> bool:
    head = "\n".join(txt.splitlines()[:8])
    return bool(re.search(r"^\s*['\"]use client['\"]\s*;?\s*$", head, re.M))

ABS_FUNC = """
import { headers } from "next/headers";

function absUrl(path: string) {
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  const fallback = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!host) return `${fallback}${path}`;
  return `${proto}://${host}${path}`;
}
""".lstrip("\n")

def ensure_absurl_helper(txt: str) -> str:
    if "function absUrl(" in txt:
        return txt
    if 'from "next/headers"' in txt or "from 'next/headers'" in txt:
        # headers import exists; still add function only
        insert = "\nfunction absUrl(path: string) {\n" \
                 "  const h = headers();\n" \
                 "  const proto = h.get(\"x-forwarded-proto\") || \"https\";\n" \
                 "  const host = h.get(\"x-forwarded-host\") || h.get(\"host\");\n" \
                 "  const fallback = process.env.NEXT_PUBLIC_SITE_URL || \"http://localhost:3000\";\n" \
                 "  if (!host) return `${fallback}${path}`;\n" \
                 "  return `${proto}://${host}${path}`;\n" \
                 "}\n"
    else:
        insert = "\n" + ABS_FUNC + "\n"

    # insert after last import block
    m = re.match(r"^((?:\s*import[^\n]*\n)+)", txt)
    if m:
        end = m.end(1)
        return txt[:end] + insert + txt[end:]
    else:
        return insert + txt

def wrap_fetches(txt: str) -> tuple[str, int]:
    # only wrap when first arg starts with /api
    if "fetch(absUrl(" in txt:
        return (txt, 0)

    cnt = 0

    # fetch("/api/...") or fetch('/api/...')
    def repl_q(m):
        nonlocal cnt
        cnt += 1
        return f'fetch(absUrl({m.group(1)}))'
    txt2 = re.sub(r"fetch\(\s*([\"']\/api\/[^\"']*[\"'])\s*(?=[,\)])", repl_q, txt)

    # fetch(`/api/...${x}`)
    def repl_bt(m):
        nonlocal cnt
        cnt += 1
        return f'fetch(absUrl({m.group(1)}))'
    txt3 = re.sub(r"fetch\(\s*(`\/api\/[^`]*`)\s*(?=[,\)])", repl_bt, txt2)

    return (txt3, cnt)

changed = []

for p in APP.rglob("*.tsx"):
    if "/app/api/" in str(p).replace("\\","/"):
        continue
    txt = p.read_text(encoding="utf-8", errors="replace")
    if is_client_component(txt):
        continue

    new_txt, c = wrap_fetches(txt)
    if c > 0:
        new_txt = ensure_absurl_helper(new_txt)
        if new_txt != txt:
            p.write_text(new_txt, encoding="utf-8")
            changed.append((str(p.relative_to(ROOT)), c))

print("== Updated files ==")
for f, c in changed:
    print(f" - {f} (wrapped {c} fetch call(s))")

if not changed:
    print("No server fetch('/api/...') patterns found to patch.")
PY

# also ensure .env.example exists
if [ ! -f .env.example ]; then
  cat > .env.example <<'ENV'
# Vercel + Local
API_ORIGIN="https://instadrafts-api-xkrdwictda-el.a.run.app"
NEXT_PUBLIC_SITE_URL="https://instadrafts-lawyer-web.vercel.app"

# Optional demo auth (if your proxy route uses these)
NEXT_PUBLIC_LAWYER_ROLE="LAWYER"
NEXT_PUBLIC_LAWYER_USER_ID="lawyer_1"
ENV
  echo "✅ wrote .env.example"
fi

echo "== Done. Git status =="
git status --porcelain=v1 || true
