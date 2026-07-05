import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

import { UnifiedPanelShell } from '@/components/mgmt/UnifiedPanelShell';
import { verifySuperadminSessionToken } from "@tecbunny/core/auth/superadmin-session";

export const dynamic = 'force-dynamic';

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const superadminCookie = cookieStore.get('superadmin-session')?.value;
  const isSuperadmin = Boolean(await verifySuperadminSessionToken(superadminCookie));

  if (!isSuperadmin) {
    redirect('/superadmin/login?error=session_expired');
  }

  return (
    <UnifiedPanelShell
      role="superadmin"
      user={{
        name: 'Root Console',
        email: 'system@tecbunny.com',
        role: 'superadmin',
      }}
      authorized
      mainId="superadmin-main"
      workspaceLabel="Root Console"
      statusLabel="System controls online"
      logoutHref="/api/superadmin/logout"
    >
      {children}
    </UnifiedPanelShell>
  );
}
