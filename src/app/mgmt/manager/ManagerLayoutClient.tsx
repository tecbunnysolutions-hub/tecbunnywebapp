'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { UnifiedPanelShell } from '@/components/mgmt/UnifiedPanelShell';
import { useAuth } from '@/lib/hooks';

interface ManagerLayoutClientProps {
  children: React.ReactNode;
}

export default function ManagerLayoutClient({ children }: ManagerLayoutClientProps) {
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
    if (user.role !== 'manager') {
      redirectRef.current = true;
      router.replace('/staff/login?denied=1');
    }
  }, [loading, user, router]);

  const authorized = !!user && user.role === 'manager';

  return (
    <UnifiedPanelShell
      role="manager"
      user={user}
      loading={loading}
      authorized={authorized}
      mainId="manager-main"
      workspaceLabel="Manager Workspace"
      statusLabel="Team operations online"
      onLogout={logout}
    >
      {children}
    </UnifiedPanelShell>
  );
}
