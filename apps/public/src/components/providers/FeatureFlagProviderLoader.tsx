'use client';

import React from 'react';
import { trpc } from '@/components/providers/TRPCProvider';
import { FeatureFlagProvider } from '@tecbunny/ui';

export function FeatureFlagProviderLoader({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = trpc.featureFlags.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  return (
    <FeatureFlagProvider flags={data || {}} isLoading={isLoading}>
      {children}
    </FeatureFlagProvider>
  );
}
