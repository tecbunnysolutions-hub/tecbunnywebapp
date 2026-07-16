'use client';

import React from 'react';
import { GlobalShell, NavSection } from '@tecbunny/admin-ui';
import { Shield, LayoutDashboard, Users, Settings, Database, Server, Briefcase, Boxes, HardHat } from 'lucide-react';

const superadminNavigation: NavSection[] = [
  {
    title: 'Command Center',
    items: [
      { label: 'Dashboard', href: '/superadmin', icon: LayoutDashboard, exact: true },
    ]
  },
  {
    title: 'Governance',
    items: [
      { label: 'Organizations', href: '/superadmin/organizations', icon: Briefcase },
      { label: 'Branches', href: '/superadmin/branches', icon: HardHat },
      { label: 'RBAC (Roles)', href: '/superadmin/roles', icon: Shield },
      { label: 'Users', href: '/superadmin/users', icon: Users },
    ]
  },
  {
    title: 'Platform',
    items: [
      { label: 'Modules', href: '/superadmin/modules', icon: Boxes },
      { label: 'AI Configuration', href: '/superadmin/ai', icon: Server },
      { label: 'System Settings', href: '/superadmin/settings', icon: Settings },
      { label: 'Audit Logs', href: '/superadmin/audit', icon: Database },
    ]
  }
];

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GlobalShell 
      appName="Superadmin" 
      appColor="slate"
      navigation={superadminNavigation}
    >
      <div className="mx-auto max-w-7xl p-8">
        {children}
      </div>
    </GlobalShell>
  );
}
