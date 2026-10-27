'use client';

import { useEffect } from 'react';
import { logger } from '@tecbunny/core';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Fatal root layout crash', {
      message: error?.message || 'Unknown Error',
      stack: error?.stack,
      digest: error?.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background font-sans text-muted-foreground antialiased p-6">
        <div className="max-w-md w-full border border-border bg-card/50 backdrop-blur-md p-8 rounded-xl text-center shadow-2xl">
          <div className="w-16 h-16 bg-destructive/50 text-destructive border border-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            We couldn’t load TecBunny. Try again, or reload the page to start fresh.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="w-full bg-primary hover:bg-primary text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-card hover:bg-secondary text-muted-foreground font-medium py-2.5 px-4 rounded-lg transition-colors border border-border active:scale-95 cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
