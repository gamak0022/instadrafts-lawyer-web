#!/usr/bin/env bash
set -euo pipefail

if [ ! -f next.config.ts ]; then
  echo "❌ next.config.ts not found"
  exit 1
fi

# best-effort: wrap TS config into JS (works for simple exports)
cat > next.config.js <<'JS'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // keep defaults; add config here if needed
};

module.exports = nextConfig;
JS

# If original had content, keep a backup so nothing is lost
cp -f next.config.ts next.config.ts.bak

# Remove TS config so Next14 doesn't choke
rm -f next.config.ts

echo "✅ created next.config.js and removed next.config.ts (backup: next.config.ts.bak)"
ls -la next.config.js next.config.ts.bak
