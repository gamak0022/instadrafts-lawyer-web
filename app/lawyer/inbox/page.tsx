import Link from 'next/link';

type CaseRow = any;

async function fetchCases(): Promise<CaseRow[]> {
  const res = await fetch('/api/v1/lawyer/cases', { cache: 'no-store' });
  const j = await res.json().catch(() => null);
  if (!res.ok) throw new Error(j?.error?.message || `HTTP_${res.status}`);
  return Array.isArray(j?.cases) ? j.cases : (Array.isArray(j) ? j : []);
}

export default async function InboxPage() {
  let cases: CaseRow[] = [];
  let err: string | null = null;

  try {
    cases = await fetchCases();
  } catch (e: any) {
    err = String(e?.message || e);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assigned Cases</h1>
          <p className="mt-1 text-sm text-slate-600">Cases assigned to you for drafting and submission.</p>
        </div>
        <div className="text-xs text-slate-500">Endpoint: /v1/lawyer/cases</div>
      </div>

      {err ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{err}</div>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Case</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">State</th>
              <th className="py-2 pr-3">Language</th>
              <th className="py-2 pr-3">Updated</th>
              <th className="py-2 pr-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 ? (
              <tr>
                <td className="py-4 text-slate-600" colSpan={6}>
                  No assigned cases found.
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-3 pr-3 font-semibold text-slate-900">{c.publicId || c.id}</td>
                  <td className="py-3 pr-3 text-slate-700">{c.status || '-'}</td>
                  <td className="py-3 pr-3 text-slate-700">{c.state || '-'}</td>
                  <td className="py-3 pr-3 text-slate-700">{c.language || '-'}</td>
                  <td className="py-3 pr-3 text-slate-600">
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '-'}
                  </td>
                  <td className="py-3 pr-3">
                    <Link
                      href={`/lawyer/case/${encodeURIComponent(c.id)}`}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
