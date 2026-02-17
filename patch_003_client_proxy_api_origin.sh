#!/usr/bin/env bash
set -euo pipefail

cd ~/instadrafts-client-web

cat > next.config.js <<'EOF'
/** @type {import('next').NextConfig} */

// Server-only env var for rewrites (NOT exposed to browser)
const API_ORIGIN = process.env.API_ORIGIN || '';
const api = API_ORIGIN.replace(/\/$/, '');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  async rewrites() {
    if (!api) return [];
    return [
      // handle /api exactly
      { source: '/api', destination: `${api}/` },
      // handle everything under /api/*
      { source: '/api/:path*', destination: `${api}/:path*` },
    ];
  },
};

module.exports = nextConfig;
EOF

git add next.config.js
git commit -m "chore: proxy /api/* to Cloud Run via API_ORIGIN" || true
git push
