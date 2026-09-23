'use client';

import { SalesAgentsManagement } from '@tecbunny/admin-ui';
import Link from 'next/link';

export default function SalesAgentsAdminPage() {
  return <div className="space-y-4"><div className="flex justify-end"><Link href="/mgmt/admin/affiliate-program" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Open Affiliate Programme</Link></div><SalesAgentsManagement initialApplications={[]} /></div>;
}
