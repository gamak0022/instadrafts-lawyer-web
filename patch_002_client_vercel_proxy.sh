#!/usr/bin/env bash
set -euo pipefail

cd ~/instadrafts-client-web

cat > next.config.js <<'EOF'
/** @type {import('next').NextConfig} */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  '';

const api = API_BASE.replace(/\/$/, '');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  async rewrites() {
    if (!api) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${api}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
EOF

git add next.config.js
git commit -m "chore(client): proxy /api to backend (Cloud Run)" || true
git push
