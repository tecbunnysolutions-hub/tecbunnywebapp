'use client';

import { useEffect } from 'react';
import { logger } from '@tecbunny/core';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { logger.error('Route error boundary triggered', { message: error?.message, digest: error?.digest }); }, [error]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center text-red-100">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-red-200/80">{error?.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
          Try again
        </button>
      </div>
    </div>
  );
}
