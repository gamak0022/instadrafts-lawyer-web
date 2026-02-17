'use client';

import React, { useState } from 'react';

export default function FinalEditor(props: { caseId: string; defaultText?: string }) {
  const { caseId, defaultText } = props;

  const [text, setText] = useState(defaultText || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch(`/api/v1/lawyer/cases/${encodeURIComponent(caseId)}/draft-done`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalText: text }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error?.message || `HTTP_${res.status}`);
      setMsg('Submitted final draft successfully.');
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Final Draft</h2>
          <p className="text-sm text-slate-600">Edit and submit the final text to Admin.</p>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={saving || !text.trim()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? 'Submitting…' : 'Submit Final'}
        </button>
      </div>

      <textarea
        className="mt-4 h-80 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
        placeholder="Write final draft here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {msg ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{msg}</div>
      ) : null}
      {err ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{err}</div>
      ) : null}

      <div className="mt-3 text-xs text-slate-500">Endpoint: POST /v1/lawyer/cases/:caseId/draft-done</div>
    </section>
  );
}
