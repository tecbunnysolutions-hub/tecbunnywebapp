'use client';

import * as React from 'react';

import { RolePanelLayout } from '@/components/mgmt/RolePanelLayout';

interface SalesLayoutClientProps {
  children: React.ReactNode;
}

const SALES_ROLES = ['sales_executive', 'sales'] as const;

export default function SalesLayoutClient({ children }: SalesLayoutClientProps) {
  return (
    <RolePanelLayout
      allowedRoles={SALES_ROLES}
      mainId="sales-executive-main"
      workspaceLabel="Field Sales Workspace"
      statusLabel="Territory workspace online"
    >
      {children}
    </RolePanelLayout>
  );
}
