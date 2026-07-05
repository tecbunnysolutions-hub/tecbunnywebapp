'use client';

import * as React from 'react';

import { RolePanelLayout } from '@/components/mgmt/RolePanelLayout';

interface SalesExternalLayoutClientProps {
  children: React.ReactNode;
}

const AGENT_ROLES = ['sales_agent', 'sales-external'] as const;

export default function SalesExternalLayoutClient({ children }: SalesExternalLayoutClientProps) {
  return (
    <RolePanelLayout
      allowedRoles={AGENT_ROLES}
      mainId="sales-agent-main"
      workspaceLabel="Sales Agent Portal"
      statusLabel="Commission workspace online"
    >
      {children}
    </RolePanelLayout>
  );
}
