import Link from 'next/link';

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/lawyer/inbox" className="text-xl font-extrabold tracking-tight text-slate-900">
            Instadrafts <span className="text-slate-500">Lawyer</span>
          </Link>
          <div className="text-xs text-slate-600">
            Auth: <span className="font-semibold">x-user-role=LAWYER</span> • <span className="font-semibold">lawyer_1</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Navigation</div>
            <nav className="mt-3 space-y-2 text-sm">
              <Link className="block rounded-xl px-3 py-2 hover:bg-slate-50" href="/lawyer/inbox">
                Inbox (Assigned Cases)
              </Link>
              <Link className="block rounded-xl px-3 py-2 hover:bg-slate-50" href="/">
                Home
              </Link>
            </nav>

            <div className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <div className="font-semibold text-slate-700">Workflow</div>
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>Review case + Q&A</li>
                <li>Review attachments</li>
                <li>Edit final draft</li>
                <li>Submit</li>
              </ol>
            </div>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
