'use client';

import { useEffect } from 'react';
import { PublicRouteError } from '@/components/shared/PublicRouteError';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[TecBunny products/[id]]", error); }, [error]);
  return <PublicRouteError title="This product couldn’t load" description="Try again to view the product details, or contact us for help finding an option for your setup." reset={reset} />;
}
