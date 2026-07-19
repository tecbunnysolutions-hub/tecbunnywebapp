import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const checks = [
  {
    file: 'apps/waba/src/components/waba/ChatMain.tsx',
    snippets: [
      'role="log"',
      'aria-live="polite"',
      'aria-label="Conversation messages"',
      'aria-label="Message text"',
      'aria-label="Internal conversation note"',
      'aria-label="Conversation assignment and SLA"',
    ],
  },
  {
    file: 'apps/webmail/src/app/inbox/page.tsx',
    snippets: [
      'aria-label="Search email threads"',
      'aria-label="Refresh inbox"',
      'aria-label="Mailbox provider settings"',
      'aria-label="Communication audit trail"',
      'role="status"',
      'aria-label="Quick reply"',
    ],
  },
  {
    file: 'packages/admin-ui/src/shared/OrderDataTable.tsx',
    snippets: [
      'aria-label="Search orders on this page"',
      'aria-label="Visible order table columns"',
      'aria-label="Select all loaded orders"',
      'aria-live="polite"',
    ],
  },
  {
    file: 'apps/mgmt/src/components/mgmt/RoleWorkspaceDashboard.tsx',
    snippets: [
      'aria-label="Decision brief"',
      'aria-label="Workflow inbox"',
      'aria-label="Access summary"',
    ],
  },
  {
    file: 'apps/superadmin/src/components/superadmin/SuperadminShell.tsx',
    snippets: [
      'Skip to main content',
      'aria-label="Breadcrumb"',
      'id="superadmin-main-content"',
    ],
  },
  {
    file: 'apps/superadmin/src/app/superadmin/mgmt/system-health/page.tsx',
    snippets: [
      'aria-label="Launch risk summary"',
      'aria-label="Launch blockers"',
      'role="alert"',
    ],
  },
  {
    file: 'apps/superadmin/src/app/superadmin/mgmt/roles/page.tsx',
    snippets: [
      'aria-label="RBAC simulator"',
      'aria-label="Simulated permission action"',
    ],
  },
];

const missing = [];

for (const check of checks) {
  const source = readFileSync(join(root, check.file), 'utf8');
  for (const snippet of check.snippets) {
    if (!source.includes(snippet)) {
      missing.push(`${check.file}: ${snippet}`);
    }
  }
}

if (missing.length > 0) {
  console.error('Accessibility contract validation failed. Missing required accessible affordances:');
  for (const item of missing) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log('Validated enterprise accessibility contract markers.');
}