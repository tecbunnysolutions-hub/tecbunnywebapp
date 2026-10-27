'use client';

import { useEffect } from 'react';
import { PublicRouteError } from '@/components/shared/PublicRouteError';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[TecBunny profile]", error); }, [error]);
  return <PublicRouteError title="Your profile couldn’t load" description="Try again to view your account details, or reload the page." reset={reset} />;
}
