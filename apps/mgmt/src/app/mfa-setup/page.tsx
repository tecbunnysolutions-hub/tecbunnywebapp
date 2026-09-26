'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';

function resolveNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next === '/mfa-setup') {
    return '/mgmt';
  }

  return next;
}

function MfaSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = resolveNextPath(searchParams.get('next'));

  return (
    <TwoFactorSetup
      onComplete={() => router.replace(nextPath)}
      onCancel={() => router.replace('/auth/login')}
    />
  );
}

export default function MfaSetupPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <MfaSetupContent />
    </Suspense>
  );
}
