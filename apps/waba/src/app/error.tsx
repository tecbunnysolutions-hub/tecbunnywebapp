'use client';

import { useEffect } from 'react';

export default function WabaError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[WABA Error]', error); }, [error]);
  return (
    <div className="flex h-screen items-center justify-center bg-[#0d1117] px-4">
      <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-red-300">Something went wrong</h2>
        <p className="mt-2 text-sm text-red-200/70">
          {error?.message || 'An unexpected error occurred in the WABA workspace.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
