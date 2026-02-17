'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SearchClient() {
  const sp = useSearchParams();

  const query = useMemo(() => {
    const q = sp.get('q') ?? '';
    return q.trim();
  }, [sp]);

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <label style={{ fontSize: 12, opacity: 0.8 }}>Query (via URL param `?q=`)</label>
        <div
          style={{
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 10,
            padding: 10,
            background: 'rgba(0,0,0,0.02)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 13,
          }}
        >
          {query || '(empty)'}
        </div>
      </div>

      <div style={{ fontSize: 13, opacity: 0.85 }}>
        This page exists mainly to prevent the Next.js warning/error about <code>useSearchParams()</code> usage
        outside <code>&lt;Suspense&gt;</code>. Replace this UI with your real search implementation.
      </div>
    </section>
  );
}
