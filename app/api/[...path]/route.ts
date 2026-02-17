import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.API_BASE ||
  'https://instadrafts-api-xkrdwictda-el.a.run.app';

function buildTarget(req: NextRequest, pathParts: string[]) {
  const path = '/' + pathParts.join('/');
  const url = new URL(req.url);
  const qs = url.search ? url.search : '';
  return API_BASE.replace(/\/+$/, '') + path + qs;
}

function withAuthHeaders(req: NextRequest, headers: Headers) {
  // Minimal default gating for now (matches API checks)
  // Can be swapped to cookie-based later.
  if (!headers.get('x-user-role')) headers.set('x-user-role', 'LAWYER');
  if (!headers.get('x-user-id')) headers.set('x-user-id', 'lawyer_1');
  return headers;
}

async function handler(req: NextRequest, ctx: { params: { path: string[] } }) {
  const target = buildTarget(req, ctx.params.path || []);
  const method = req.method.toUpperCase();

  // Clone headers (strip hop-by-hop headers that can break)
  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');

  withAuthHeaders(req, headers);

  // Forward body for non-GET/HEAD. Keep as stream to support multipart.
  const init: RequestInit = {
    method,
    headers,
    redirect: 'manual',
  };

  if (method !== 'GET' && method !== 'HEAD') {
    init.body = req.body as any;
  }

  const upstream = await fetch(target, init);

  // Stream back response
  const resHeaders = new Headers(upstream.headers);
  // Avoid CORS / encoding issues in Next dev
  resHeaders.delete('content-encoding');

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest, ctx: any) {
  return handler(req, ctx);
}
export async function POST(req: NextRequest, ctx: any) {
  return handler(req, ctx);
}
export async function PUT(req: NextRequest, ctx: any) {
  return handler(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: any) {
  return handler(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: any) {
  return handler(req, ctx);
}
