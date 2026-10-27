'use client';

import { useEffect } from 'react';
import { PublicRouteError } from '@/components/shared/PublicRouteError';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[TecBunny auth]", error); }, [error]);
  return <PublicRouteError title="We couldn’t load this account page" description="Try again to continue with your account, or reload the page." reset={reset} />;
}
