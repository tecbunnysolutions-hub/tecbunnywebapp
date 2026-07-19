export type EnterpriseAction = {
  id: string;
  label: string;
  href: string;
  shortcut?: string;
};

export const enterpriseActions = {
  createFieldOrder: {
    id: 'createFieldOrder',
    label: 'Create Field Order',
    href: '/mgmt/sales/quick-billing',
    shortcut: 'Ctrl+B',
  },
  leadCenter: {
    id: 'leadCenter',
    label: 'Open Lead Center',
    href: '/mgmt/sales/lead-center',
  },
  findInvoice: {
    id: 'findInvoice',
    label: 'Find Invoice',
    href: '/mgmt/admin/invoice-lookup',
  },
  orderOperations: {
    id: 'orderOperations',
    label: 'Order Operations',
    href: '/mgmt/admin/orders',
  },
  salesDashboard: {
    id: 'salesDashboard',
    label: 'Sales Dashboard',
    href: '/mgmt/sales',
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory',
    href: '/mgmt/manager/inventory',
  },
  accounts: {
    id: 'accounts',
    label: 'Accounts',
    href: '/mgmt/accounts',
  },
  serviceTickets: {
    id: 'serviceTickets',
    label: 'Service Tickets',
    href: '/mgmt/service-manager/tickets',
  },
  staffOperations: {
    id: 'staffOperations',
    label: 'Staff Operations',
    href: '/mgmt/admin/staff',
  },
  broadcastDesk: {
    id: 'broadcastDesk',
    label: 'Broadcast Desk',
    href: '/mgmt/admin/broadcast-desk',
  },
  adminSettings: {
    id: 'adminSettings',
    label: 'Settings',
    href: '/mgmt/admin/settings',
  },
} as const satisfies Record<string, EnterpriseAction>;

export type EnterpriseActionId = keyof typeof enterpriseActions;

export const commandActionGroups: Array<{ heading: string; actionIds: EnterpriseActionId[] }> = [
  {
    heading: 'Suggestions',
    actionIds: ['createFieldOrder', 'leadCenter', 'findInvoice'],
  },
  {
    heading: 'Navigation',
    actionIds: ['orderOperations', 'salesDashboard', 'inventory', 'accounts', 'serviceTickets'],
  },
  {
    heading: 'Administration',
    actionIds: ['staffOperations', 'broadcastDesk', 'adminSettings'],
  },
];

export const quickActionIds: EnterpriseActionId[] = ['leadCenter', 'createFieldOrder', 'findInvoice'];