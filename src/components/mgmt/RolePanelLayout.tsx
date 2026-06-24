'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { UnifiedPanelShell } from './UnifiedPanelShell';
import { useAuth } from '@/lib/hooks';
import type { UserRole } from '@/lib/roles';

interface RolePanelLayoutProps {
  allowedRoles: readonly UserRole[];
  children: React.ReactNode;
  mainId: string;
  workspaceLabel: string;
  statusLabel: string;
  displayRole?: UserRole;
}

export function RolePanelLayout({
  allowedRoles,
  children,
  mainId,
  workspaceLabel,
  statusLabel,
  displayRole,
}: RolePanelLayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const allowedRoleSet = React.useMemo(() => new Set<UserRole>(allowedRoles), [allowedRoles]);
  const authorized = Boolean(user && allowedRoleSet.has(user.role));

  React.useEffect(() => {
    if (loading) return;
    if (!user || !allowedRoleSet.has(user.role)) {
      router.replace('/staff/login?denied=1');
    }
  }, [allowedRoleSet, loading, router, user]);

  const role = displayRole ?? user?.role ?? allowedRoles[0] ?? 'customer';

  return (
    <UnifiedPanelShell
      role={role}
      user={user}
      loading={loading}
      authorized={authorized}
      mainId={mainId}
      workspaceLabel={workspaceLabel}
      statusLabel={statusLabel}
      onLogout={logout}
    >
      {children}
    </UnifiedPanelShell>
  );
}
