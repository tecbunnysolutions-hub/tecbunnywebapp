'use client';

import * as React from 'react';

import { RolePanelLayout } from '@/components/mgmt/RolePanelLayout';

interface SalesStaffLayoutClientProps {
  children: React.ReactNode;
}

const STORE_ROLES = ['store_executive', 'sales-staff'] as const;

export default function SalesStaffLayoutClient({ children }: SalesStaffLayoutClientProps) {
  return (
    <RolePanelLayout
      allowedRoles={STORE_ROLES}
      mainId="store-executive-main"
      workspaceLabel="Store Operations Desk"
      statusLabel="Point of sale online"
    >
      {children}
    </RolePanelLayout>
  );
}
