import Link from 'next/link';
import Attachments from './Attachments';
import FinalEditor from './FinalEditor';


const __DEV_LAWYER_ROLE = process.env.NEXT_PUBLIC_DEV_ROLE || 'LAWYER';
const __DEV_LAWYER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || 'lawyer_1';

function __lawyerHeaders() {
  return {
    'x-user-role': __DEV_LAWYER_ROLE,
    'x-user-id': __DEV_LAWYER_ID,
  } as Record<string, string>;
}

function __apiOriginUrl(path: string) {
  const base =
    process.env.API_ORIGIN ||
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    '';
  if (!base) throw new Error('API_ORIGIN_MISSING');
  return new URL(path, base).toString();
}


async function fetchCase(caseId: string) {
  // Lawyer list endpoint exists; case detail might be via admin or client preview.
  // We will rely on list + attachments + final submit.
  // Try an admin-safe preview endpoint if present later; for now show identifiers.
  return { id: caseId };
}

export default async function LawyerCasePage({ params }: { params: { caseId: string } }) {
  const c = await fetchCase(params.caseId);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">Case</div>
            <h1 className="text-xl font-bold text-slate-900">{c.id}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Review attachments, draft final, and submit.
            </p>
          </div>
          <Link
            href="/lawyer/inbox"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Back to Inbox
          </Link>
        </div>
      </div>

      <Attachments caseId={params.caseId} />
      <FinalEditor caseId={params.caseId} />
    </div>
  );
}
