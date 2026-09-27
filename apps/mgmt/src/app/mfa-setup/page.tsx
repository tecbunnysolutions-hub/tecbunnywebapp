'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@tecbunny/database';

import { NativeMfaSetup } from '@/components/auth/NativeMfaSetup';

function resolveNextPath(next: string | null): string {
  if (!next) return '/mgmt';

  try {
    // Parse against this origin so `/\host` and similar forms cannot leave it.
    const target = new URL(next, window.location.origin);
    if (target.origin !== window.location.origin || target.pathname === '/mfa-setup') {
      return '/mgmt';
    }
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return '/mgmt';
  }
}

export default function MfaSetupPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/mgmt');

  useEffect(() => {
    const requestedPath = new URLSearchParams(window.location.search).get('next');
    setNextPath(resolveNextPath(requestedPath));
  }, []);

  return (
    <NativeMfaSetup
      // The next request carries the upgraded (AAL2) session cookies to the gateway.
      onComplete={() => {
        router.replace(nextPath);
        router.refresh();
      }}
      onCancel={async () => {
        await createClient().auth.signOut();
        router.replace('/auth/login');
      }}
    />
  );
}
