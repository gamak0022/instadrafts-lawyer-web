'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Attachment = {
  id: string;
  caseId: string;
  fileName?: string | null;
  url?: string | null;
  metaJson?: string | null;
  createdAt?: string;
};

function safeJson<T = any>(s: any): T | null {
  try {
    if (!s) return null;
    if (typeof s === 'string') return JSON.parse(s);
    return s as T;
  } catch {
    return null;
  }
}

export default function Attachments(props: { caseId: string }) {
  const { caseId } = props;
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<Attachment[]>([]);

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/v1/lawyer/cases/${encodeURIComponent(caseId)}/attachments`, {
        cache: 'no-store',
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error?.message || `HTTP_${res.status}`);
      setItems(Array.isArray(j?.attachments) ? j.attachments : []);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const rows = useMemo(() => {
    return items.map((a) => {
      const meta = safeJson<any>(a.metaJson);
      const extracted = meta?.extractedText ? String(meta.extractedText) : '';
      const downloadHref = a.url ? `/api${a.url}` : null;
      const mimeType = meta?.mimeType ? String(meta.mimeType) : '';
      const sizeBytes = meta?.sizeBytes != null ? Number(meta.sizeBytes) : null;
      return { a, extracted, downloadHref, mimeType, sizeBytes };
    });
  }, [items]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Attachments</h2>
          <p className="text-sm text-slate-600">Review client uploads and extracted text.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {err ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{err}</div>
      ) : null}

      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
            No attachments uploaded.
          </div>
        ) : (
          rows.map(({ a, extracted, downloadHref, mimeType, sizeBytes }) => (
            <div key={a.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{a.fileName || a.id}</div>
                  <div className="mt-1 text-xs text-slate-600">
                    {mimeType ? <span className="mr-2">{mimeType}</span> : null}
                    {sizeBytes != null ? <span>{sizeBytes} bytes</span> : null}
                    {a.createdAt ? <span className="ml-2">• {new Date(a.createdAt).toLocaleString()}</span> : null}
                  </div>
                </div>
                {downloadHref ? (
                  <a
                    href={downloadHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                  >
                    Open / Download
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">No download URL</span>
                )}
              </div>

              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-700">Extracted text</div>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs text-slate-800">
                  {extracted || '(No extracted text)'}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
