import { cookies, headers } from 'next/headers';

import { verifySuperadminSessionToken } from "@tecbunny/core/server";
import { SuperadminCommandCenter } from '@/components/superadmin/SuperadminCommandCenter';
import { createForwardedApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function SuperadminDashboard() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const superadminCookie = cookieStore.get('superadmin-session')?.value;
  const ip = headerStore.get('x-forwarded-for') || 'unknown';
  const ua = headerStore.get('user-agent') || 'unknown';
  const isSuperadmin = Boolean(await verifySuperadminSessionToken(superadminCookie, ip, ua));

  if (!isSuperadmin) {
    // layout.tsx will handle the redirect, returning null here prevents concurrent redirect errors
    return null;
  }

  const api = createForwardedApi({ cookie: headerStore.get('cookie'), ip: headerStore.get('x-forwarded-for'), userAgent: headerStore.get('user-agent') });
  const dashboardData = await api.superadmin.commandCenter();

  return <SuperadminCommandCenter initialData={dashboardData} />;
}
