'use client';

import { useEffect } from 'react';
import { PublicRouteError } from '@/components/shared/PublicRouteError';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[TecBunny cart]", error); }, [error]);
  return <PublicRouteError title="Your cart couldn’t load" description="Try again to review your cart, or reload the page." reset={reset} />;
}
