import React from 'react';
import * as Sentry from '@sentry/react';

export interface TelemetryErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function TelemetryErrorBoundary({ children, fallback }: TelemetryErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={fallback || <div className="p-4 text-red-500 bg-red-50 rounded-md border border-red-200">
        <h2 className="text-lg font-semibold">Something went wrong.</h2>
        <p className="text-sm">Our team has been notified. Please try refreshing the page.</p>
      </div>}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
