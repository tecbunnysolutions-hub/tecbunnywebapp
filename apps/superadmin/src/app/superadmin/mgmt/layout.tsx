import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import { verifySuperadminSessionToken } from '@tecbunny/core/auth/superadmin-session';
import { SuperadminShell } from '@/components/superadmin/SuperadminShell';

export const dynamic = 'force-dynamic';

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const superadminCookie = cookieStore.get('superadmin-session')?.value;
  const ip = headerStore.get('x-forwarded-for') || 'unknown';
  const ua = headerStore.get('user-agent') || 'unknown';
  const isSuperadmin = Boolean(await verifySuperadminSessionToken(superadminCookie, ip, ua));

  if (!isSuperadmin) {
    redirect('/superadmin/login?error=session_expired');
  }

  return <SuperadminShell>{children}</SuperadminShell>;
}
