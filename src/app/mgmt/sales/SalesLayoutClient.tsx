'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { UnifiedPanelShell } from '@/components/mgmt/UnifiedPanelShell';
import { useAuth } from '@/lib/hooks';

const SALES_ROLES = new Set(['sales', 'service_engineer']);

interface SalesLayoutClientProps {
  children: React.ReactNode;
}

export default function SalesLayoutClient({ children }: SalesLayoutClientProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    if (!user || !SALES_ROLES.has(user.role)) {
      router.replace('/staff/login?denied=1');
    }
  }, [user, loading, router]);

  const role = user?.role === 'service_engineer' ? 'service_engineer' : 'sales';
  const authorized = !!user && SALES_ROLES.has(user.role);

  return (
    <UnifiedPanelShell
      role={role}
      user={user}
      loading={loading}
      authorized={authorized}
      mainId="sales-main"
      workspaceLabel="Sales Workspace"
      statusLabel="Retail operations online"
      onLogout={logout}
    >
      {children}
    </UnifiedPanelShell>
  );
}
