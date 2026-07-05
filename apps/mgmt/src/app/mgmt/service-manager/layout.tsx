import type { ReactNode } from 'react';

import { RolePanelLayout } from '@/components/mgmt/RolePanelLayout';

export default function ServiceManagerLayout({ children }: { children: ReactNode }) {
  return (
    <RolePanelLayout
      allowedRoles={['service_manager']}
      mainId="service-manager-main"
      workspaceLabel="Regional Service Command"
      statusLabel="Dispatch network online"
    >
      {children}
    </RolePanelLayout>
  );
}
