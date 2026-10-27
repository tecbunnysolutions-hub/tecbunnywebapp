'use client';

import { useEffect } from 'react';
import { PublicRouteError } from '@/components/shared/PublicRouteError';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[TecBunny checkout]", error); }, [error]);
  return <PublicRouteError title="Checkout couldn’t load" description="Try loading checkout again. Check your order status before starting another payment." reset={reset} />;
}
