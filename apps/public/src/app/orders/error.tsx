'use client';

import { useEffect } from 'react';
import { PublicRouteError } from '@/components/shared/PublicRouteError';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[TecBunny orders]", error); }, [error]);
  return <PublicRouteError title="Your orders couldn’t load" description="Try again to check your order history and status." reset={reset} />;
}
