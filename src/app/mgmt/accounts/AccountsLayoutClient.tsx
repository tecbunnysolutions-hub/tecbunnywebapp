'use client';

import * as React from 'react';

import { RolePanelLayout } from '@/components/mgmt/RolePanelLayout';

interface AccountsLayoutClientProps {
  children: React.ReactNode;
}

const ACCOUNT_ROLES = ['accounts'] as const;

export default function AccountsLayoutClient({ children }: AccountsLayoutClientProps) {
  return (
    <RolePanelLayout
      allowedRoles={ACCOUNT_ROLES}
      mainId="accounts-main"
      workspaceLabel="Accounts Workspace"
      statusLabel="Finance ledger online"
    >
      {children}
    </RolePanelLayout>
  );
}
