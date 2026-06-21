'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { UnifiedPanelShell } from '@/components/mgmt/UnifiedPanelShell';
import { useAuth } from '@/lib/hooks';

interface SalesStaffLayoutClientProps {
  children: React.ReactNode;
}

export default function SalesStaffLayoutClient({ children }: SalesStaffLayoutClientProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const redirectRef = React.useRef(false);

  React.useEffect(() => {
    if (loading) return;
    if (redirectRef.current) return;
    if (!user) {
      redirectRef.current = true;
      router.replace('/staff/login');
      return;
    }
    if (user.role !== 'sales-staff' && user.role !== 'sales') {
      redirectRef.current = true;
      router.replace('/staff/login?denied=1');
    }
  }, [loading, user, router]);

  const authorized = !!user && (user.role === 'sales-staff' || user.role === 'sales');

  return (
    <UnifiedPanelShell
      role="sales-staff"
      user={user}
      loading={loading}
      authorized={authorized}
      mainId="sales-staff-main"
      workspaceLabel="Staff Workspace"
      statusLabel="Sales desk online"
      onLogout={logout}
    >
      {children}
    </UnifiedPanelShell>
  );
}
