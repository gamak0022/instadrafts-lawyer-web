#!/usr/bin/env bash
set -euo pipefail

cd ~/instadrafts-client-web

# Update next.config.js to proxy /api/* to your backend base URL
cat > next.config.js <<'EOF'
/** @type {import('next').NextConfig} */
const API_BASE =
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
git commit -m "chore: proxy /api to backend via rewrites" || true
git push
