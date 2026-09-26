'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';

function resolveNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next === '/mfa-setup') {
    return '/mgmt';
  }

  return next;
}

export default function MfaSetupPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/mgmt');

  useEffect(() => {
    const requestedPath = new URLSearchParams(window.location.search).get('next');
    setNextPath(resolveNextPath(requestedPath));
  }, []);

  return (
    <TwoFactorSetup
      onComplete={() => router.replace(nextPath)}
      onCancel={() => router.replace('/auth/login')}
    />
  );
}
