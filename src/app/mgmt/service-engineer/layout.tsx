import type { ReactNode } from 'react';

import { RolePanelLayout } from '@/components/mgmt/RolePanelLayout';

export default function ServiceEngineerLayout({ children }: { children: ReactNode }) {
  return (
    <RolePanelLayout
      allowedRoles={['service_engineer']}
      mainId="service-engineer-main"
      workspaceLabel="Field Service Workspace"
      statusLabel="Personal schedule online"
    >
      {children}
    </RolePanelLayout>
  );
}
