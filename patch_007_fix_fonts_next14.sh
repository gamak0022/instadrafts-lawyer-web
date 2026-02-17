#!/usr/bin/env bash
set -euo pipefail

FILE="app/layout.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ $FILE not found"
  exit 1
fi

cp -f "$FILE" "$FILE.bak_$(date +%Y%m%d_%H%M%S)"

python - <<'PY'
import re, pathlib
p = pathlib.Path("app/layout.tsx")
s = p.read_text(encoding="utf-8", errors="replace")

# 1) Replace Geist imports with Inter + JetBrains_Mono
s = re.sub(
    r'from\s+[\'"]next/font/(google|local)[\'"]\s*;?\s*$',
    lambda m: m.group(0),
    s,
    flags=re.M
)

# Remove any existing Geist imports line
s = re.sub(r'^\s*import\s*\{\s*Geist\s*,\s*Geist_Mono\s*\}\s*from\s*[\'"]next/font/google[\'"]\s*;?\s*\n', '', s, flags=re.M)
s = re.sub(r'^\s*import\s*\{\s*Geist\s*\}\s*from\s*[\'"]next/font/google[\'"]\s*;?\s*\n', '', s, flags=re.M)
s = re.sub(r'^\s*import\s*\{\s*Geist_Mono\s*\}\s*from\s*[\'"]next/font/google[\'"]\s*;?\s*\n', '', s, flags=re.M)

# Ensure we have a font import from next/font/google
if "next/font/google" not in s:
    # insert after first import line
    lines = s.splitlines(True)
    for i, line in enumerate(lines):
        if line.strip().startswith("import "):
            insert_at = i+1
            break
    else:
        insert_at = 0
    lines.insert(insert_at, "import { Inter, JetBrains_Mono } from 'next/font/google';\n")
    s = "".join(lines)

# 2) Replace Geist variable declarations with Inter + JetBrains_Mono
# Common pattern:
# const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
# const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
s = re.sub(
    r'const\s+\w+\s*=\s*Geist\(\{\s*[^}]*\}\);\s*',
    "const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });\n",
    s
)
s = re.sub(
    r'const\s+\w+\s*=\s*Geist_Mono\(\{\s*[^}]*\}\);\s*',
    "const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });\n",
    s
)

# If it didn't find Geist declarations, create them near top (after imports)
if "const inter =" not in s:
    # insert after import block
    lines = s.splitlines(True)
    last_import = -1
    for i, line in enumerate(lines):
        if line.strip().startswith("import "):
            last_import = i
    insert_at = last_import + 1
    lines.insert(insert_at, "\nconst inter = Inter({ subsets: ['latin'], variable: '--font-sans' });\n")
    lines.insert(insert_at+1, "const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });\n")
    s = "".join(lines)

# 3) Replace usage in <body className=...>
# Typical:
# className={`${geistSans.variable} ${geistMono.variable} antialiased`}
s = re.sub(r'\$\{\s*\w+\.variable\s*\}\s*\$\{\s*\w+\.variable\s*\}', '${inter.variable} ${jetbrainsMono.variable}', s)

# Also handle simple concatenation without template literals
s = s.replace("geistSans.variable", "inter.variable").replace("geistMono.variable", "jetbrainsMono.variable")

p.write_text(s, encoding="utf-8")
print("✅ patched app/layout.tsx to use Inter + JetBrains Mono")
PY

echo
echo "== show font-related lines =="
grep -n "next/font/google\|Inter\|JetBrains\|geist\|Geist" -n app/layout.tsx || true
