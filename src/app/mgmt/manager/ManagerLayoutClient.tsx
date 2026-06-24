'use client';

import * as React from 'react';

import { RolePanelLayout } from '@/components/mgmt/RolePanelLayout';

interface ManagerLayoutClientProps {
  children: React.ReactNode;
}

const MANAGER_ROLES = ['sales_manager', 'manager'] as const;

export default function ManagerLayoutClient({ children }: ManagerLayoutClientProps) {
  return (
    <RolePanelLayout
      allowedRoles={MANAGER_ROLES}
      mainId="sales-manager-main"
      workspaceLabel="Regional Sales Command"
      statusLabel="Area operations connected"
    >
      {children}
    </RolePanelLayout>
  );
}
