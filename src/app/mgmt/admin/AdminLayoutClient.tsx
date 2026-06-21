'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { UnifiedPanelShell } from '@/components/mgmt/UnifiedPanelShell';
import { useAuth } from '@/lib/hooks';
import { isAtLeast } from '@/lib/roles';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const { user, loading, logout, supabase } = useAuth();
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
    const userRole = user.role || 'customer';
    if (!isAtLeast(userRole, 'admin')) {
      redirectRef.current = true;
      router.replace('/');
    }
  }, [loading, user, router]);

  const authorized = !!user && isAtLeast(user.role || 'customer', 'admin');

  if (redirectRef.current) {
    // Prevent rendering protected content before redirect completes
    return null;
  }

  return (
    <UnifiedPanelShell
      role="admin"
      user={user}
      loading={loading}
      authorized={authorized}
      mainId="admin-main"
      workspaceLabel="Admin Workspace"
      statusLabel="Store operations online"
      onLogout={logout}
    >
      {children}
    </UnifiedPanelShell>
  );
}
