'use client';

import { useEffect } from 'react';
import { RouteError } from '../../../../packages/ui/src/components/RouteState';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[TecBunny workspace]', error); }, [error]);
  return <RouteError reset={reset} />;
}
