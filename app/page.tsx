import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Instadrafts Lawyer Portal</h1>
          <p className="mt-2 text-slate-600">
            Go to your inbox to work on assigned cases.
          </p>
          <div className="mt-6">
            <Link
              href="/lawyer/inbox"
              className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Open Inbox
            </Link>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
            Uses API proxy at <span className="font-semibold">/api/*</span> with headers{' '}
            <span className="font-semibold">x-user-role=LAWYER</span> and <span className="font-semibold">x-user-id=lawyer_1</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
