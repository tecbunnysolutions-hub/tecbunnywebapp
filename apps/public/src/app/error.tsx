'use client';

import { PublicRouteError } from '@/components/shared/PublicRouteError';
import { useEffect } from 'react';
import { logger } from '@tecbunny/core';

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error('App Fatal Client Exception', {
      message: error?.message || 'Unknown Error',
      stack: error?.stack,
      digest: error?.digest,
    });
  }, [error]);

  return (
    <PublicRouteError
      title="Something went wrong"
      description="We couldn’t load this page. Try again, or contact our team if you still need help."
      reset={reset}
    />
  );
}
