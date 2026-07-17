'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-zinc-100">Something went wrong</h2>
        <p className="mt-2 text-sm text-zinc-400">{error?.message || 'Please try again.'}</p>
        <button onClick={reset} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
          Try again
        </button>
      </div>
    </div>
  );
}
