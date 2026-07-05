import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Archive,
  BarChart2,
  Bot,
  Building,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileSearch,
  FileText,
  Gauge,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Package,
  PackageCheck,
  Percent,
  Receipt,
  Settings,
  Share2,
  ShieldAlert,
  ShoppingBag,
  Ticket,
  Users,
  Wrench,
  Zap,
  MessageSquare,
} from 'lucide-react';

import { hasPermission, isAtLeast, PERMS, type Permission, type UserRole } from '@/lib/roles';

export type UnifiedPanelNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  roles?: UserRole[];
  minRole?: UserRole;
  permission?: Permission;
};

export type UnifiedPanelNavSection = {
  title: string;
  items: UnifiedPanelNavItem[];
};

const SALES_EXECUTION_ROLES: UserRole[] = ['sales_executive', 'sales'];
const STORE_ROLES: UserRole[] = ['store_executive', 'sales-staff'];
const AGENT_ROLES: UserRole[] = ['sales_agent', 'sales-external'];
const SALES_MANAGER_ROLES: UserRole[] = ['sales_manager', 'manager'];

export const unifiedPanelNavSections: UnifiedPanelNavSection[] = [
  {
    title: 'Workspace',
    items: [
      { href: '/superadmin/mgmt/dashboard', label: 'Root Console', icon: ShieldAlert, roles: ['superadmin'], exact: true },
      { href: '/mgmt/admin', label: 'Admin Overview', icon: LayoutDashboard, roles: ['admin'], exact: true },
      { href: '/mgmt/manager', label: 'Sales Command', icon: Gauge, roles: SALES_MANAGER_ROLES, exact: true },
      { href: '/mgmt/service-manager', label: 'Service Command', icon: Gauge, roles: ['service_manager'], exact: true },
      { href: '/mgmt/sales', label: 'Field Sales', icon: LayoutDashboard, roles: SALES_EXECUTION_ROLES, exact: true },
      { href: '/mgmt/sales-staff', label: 'Store Desk', icon: LayoutDashboard, roles: STORE_ROLES, exact: true },
      { href: '/mgmt/sales-external', label: 'Agent Portal', icon: LayoutDashboard, roles: AGENT_ROLES, exact: true },
      { href: '/mgmt/service-engineer', label: 'My Service Day', icon: Wrench, roles: ['service_engineer'], exact: true },
      { href: '/mgmt/accounts', label: 'Accounts Overview', icon: Receipt, roles: ['accounts'], exact: true },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { href: '/mgmt/sales/quick-billing', label: 'Create Field Order', icon: Zap, roles: SALES_EXECUTION_ROLES },
      { href: '/mgmt/sales-staff/quick-billing', label: 'Quick Billing', icon: Zap, roles: STORE_ROLES },
      { href: '/mgmt/manager/quick-billing', label: 'Manager Billing', icon: Zap, roles: SALES_MANAGER_ROLES },
      { href: '/mgmt/sales-external/quick-billing', label: 'Customer Order', icon: ShoppingBag, roles: AGENT_ROLES },
      { href: '/mgmt/admin/orders', label: 'Order Operations', icon: ShoppingBag, roles: ['admin'] },
      { href: '/mgmt/sales/orders', label: 'Assigned Orders', icon: ShoppingBag, roles: SALES_EXECUTION_ROLES },
      { href: '/mgmt/sales-staff/order-tracking', label: 'Store Fulfilment', icon: PackageCheck, roles: STORE_ROLES },
      { href: '/mgmt/manager/online-orders', label: 'Regional Dispatch', icon: PackageCheck, roles: SALES_MANAGER_ROLES },
      { href: '/mgmt/sales/agent-order', label: 'Agent Order', icon: ShoppingBag, roles: SALES_EXECUTION_ROLES },
    ],
  },
  {
    title: 'Service Operations',
    items: [
      { href: '/mgmt/service-manager/orders', label: 'Service Orders', icon: ShoppingBag, roles: ['service_manager'] },
      { href: '/mgmt/service-manager/tickets', label: 'Regional Tickets', icon: ClipboardList, roles: ['service_manager'] },
      { href: '/mgmt/service-engineer/jobs', label: 'Assigned Jobs', icon: ClipboardCheck, roles: ['service_engineer'] },
      { href: '/mgmt/admin/services', label: 'Service Operations', icon: Wrench, roles: ['admin'] },
      { href: '/superadmin/mgmt/services', label: 'Service Catalogue', icon: Settings, roles: ['superadmin'] },
    ],
  },
  {
    title: 'People & Inventory',
    items: [
      { href: '/superadmin/mgmt/users', label: 'User Governance', icon: Users, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/areas', label: 'Areas & Teams', icon: MapPin, roles: ['superadmin'] },
      { href: '/mgmt/admin/staff', label: 'Staff Operations', icon: Users, roles: ['admin'] },
      { href: '/mgmt/manager/salesperson', label: 'Regional Sales Team', icon: Users, roles: SALES_MANAGER_ROLES },
      { href: '/superadmin/mgmt/products', label: 'Product Catalogue', icon: Package, roles: ['superadmin'] },
      { href: '/mgmt/admin/inventory', label: 'Inventory Tuning', icon: Package, roles: ['admin'] },
      { href: '/mgmt/manager/inventory', label: 'Regional Inventory', icon: Package, roles: SALES_MANAGER_ROLES },
      { href: '/superadmin/mgmt/custom-setups', label: 'Custom Setups', icon: Settings, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/leads', label: 'Inquiry Pipeline', icon: ClipboardList, roles: ['superadmin'] },
      { href: '/projects', label: 'Project Pipeline', icon: ClipboardList, roles: ['superadmin'] },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/mgmt/admin/purchase', label: 'Purchase Operations', icon: Archive, roles: ['admin'] },
      { href: '/mgmt/manager/purchase', label: 'Purchase Entry', icon: Archive, roles: SALES_MANAGER_ROLES },
      { href: '/mgmt/admin/invoice-lookup', label: 'Invoice Lookup', icon: FileSearch, roles: ['admin'] },
      { href: '/mgmt/sales/invoice-lookup', label: 'Invoice Lookup', icon: FileSearch, roles: SALES_EXECUTION_ROLES },
      { href: '/mgmt/sales-staff/invoice-lookup', label: 'Invoice Lookup', icon: FileSearch, roles: STORE_ROLES },
      { href: '/mgmt/manager/invoice-lookup', label: 'Invoice Lookup', icon: FileSearch, roles: SALES_MANAGER_ROLES },
      { href: '/mgmt/sales-external/commission-report', label: 'My Commission', icon: BarChart2, roles: AGENT_ROLES },
      { href: '/mgmt/admin/quotes', label: 'Contract Quotes', icon: FileText, roles: ['admin'] },
      { href: '/superadmin/mgmt/catalogue', label: 'Catalogue', icon: Settings, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/services', label: 'Services', icon: Wrench, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/payment-settings', label: 'Payment Settings', icon: CreditCard, roles: ['superadmin'] },
    ],
  },
  {
    title: 'Reports',
    items: [
      { href: '/mgmt/manager/reports', label: 'Regional Reports', icon: BarChart2, roles: SALES_MANAGER_ROLES },
      { href: '/mgmt/sales-staff/reports', label: 'Store Reports', icon: BarChart2, roles: STORE_ROLES },
      { href: '/mgmt/sales/history', label: 'Order History', icon: FileSearch, roles: SALES_EXECUTION_ROLES },
      { href: '/mgmt/sales/expenses', label: 'Expense Entry', icon: FileText, roles: SALES_EXECUTION_ROLES },
      { href: '/mgmt/sales-external/reports', label: 'Agent Reports', icon: BarChart2, roles: AGENT_ROLES },
      { href: '/superadmin/mgmt/reports', label: 'System Intelligence', icon: ClipboardList, roles: ['superadmin'] },
    ],
  },
  {
    title: 'Growth & System',
    items: [
      { href: '/mgmt/admin/broadcast-desk', label: 'Broadcast Desk', icon: Megaphone, roles: ['admin'] },
      { href: '/superadmin/mgmt/social-media', label: 'Social Media', icon: Share2, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/offers', label: 'Offers & Coupons', icon: Ticket, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/marketing', label: 'Marketing Target', icon: Activity, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/ai-config', label: 'AI Configuration', icon: Bot, roles: ['superadmin'], permission: PERMS.AI_CONFIG },
      { href: '/superadmin/mgmt/settings?section=website', label: 'Website Settings', icon: Activity, roles: ['superadmin'], permission: PERMS.SYSTEM_CONFIG },
      { href: '/superadmin/mgmt/settings?section=brand', label: 'Brand Settings', icon: ImageIcon, roles: ['superadmin'], permission: PERMS.SYSTEM_CONFIG },
      { href: '/superadmin/mgmt/settings?section=company', label: 'Company Details', icon: Building, roles: ['superadmin'], permission: PERMS.SYSTEM_CONFIG },
      { href: '/superadmin/mgmt/settings?section=tax', label: 'Tax Configuration', icon: Percent, roles: ['superadmin'], permission: PERMS.SYSTEM_CONFIG },
    ],
  },
];

export function canAccessPanelItem(role: UserRole, item: UnifiedPanelNavItem): boolean {
  if (item.roles && !item.roles.includes(role)) return false;
  if (item.minRole && !isAtLeast(role, item.minRole)) return false;
  if (item.permission && !hasPermission(role, item.permission)) return false;
  return true;
}

export function getPanelNavigation(role: UserRole): UnifiedPanelNavSection[] {
  return unifiedPanelNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessPanelItem(role, item)),
    }))
    .filter((section) => section.items.length > 0);
}
