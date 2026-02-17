import { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function Page() {
  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Search</h1>

      {/* ✅ Fix: useSearchParams must be inside a Suspense boundary */}
      <Suspense fallback={<div>Loading search…</div>}>
        <SearchClient />
      </Suspense>
    </main>
  );
}
