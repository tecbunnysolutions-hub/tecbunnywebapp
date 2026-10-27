'use client';

import { useEffect } from 'react';
import { PublicRouteError } from '@/components/shared/PublicRouteError';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[TecBunny blog]", error); }, [error]);
  return <PublicRouteError title="The articles couldn’t load" description="Try again to browse our guides and articles, or reload the page." reset={reset} />;
}
