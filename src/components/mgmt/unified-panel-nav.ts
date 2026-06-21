import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Archive,
  BarChart2,
  Bot,
  Building,
  ClipboardList,
  CreditCard,
  FileSearch,
  FileText,
  Gift,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  Package,
  PackageCheck,
  PackageSearch,
  Percent,
  Settings,
  Share2,
  ShieldAlert,
  ShoppingBag,
  Ticket,
  Users,
  Wrench,
  Zap,
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

export const unifiedPanelNavSections: UnifiedPanelNavSection[] = [
  {
    title: 'Workspace',
    items: [
      { href: '/superadmin/mgmt/dashboard', label: 'Root Console', icon: ShieldAlert, roles: ['superadmin'], exact: true },
      { href: '/mgmt/admin', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['admin'], exact: true },
      { href: '/mgmt/manager', label: 'Manager Dashboard', icon: LayoutDashboard, roles: ['manager'], exact: true },
      { href: '/mgmt/sales', label: 'Sales Dashboard', icon: LayoutDashboard, roles: ['sales', 'service_engineer'], exact: true },
      { href: '/mgmt/sales-staff', label: 'Staff Dashboard', icon: LayoutDashboard, roles: ['sales-staff'], exact: true },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { href: '/mgmt/sales/quick-billing', label: 'Quick Billing', icon: Zap, roles: ['sales', 'service_engineer'] },
      { href: '/mgmt/sales-staff/quick-billing', label: 'Quick Billing', icon: Zap, roles: ['sales-staff'] },
      { href: '/mgmt/manager/quick-billing', label: 'Quick Billing', icon: Zap, roles: ['manager'] },
      { href: '/mgmt/admin/orders', label: 'All Orders', icon: ShoppingBag, roles: ['admin'] },
      { href: '/mgmt/sales/orders', label: 'Pickup Orders', icon: ShoppingBag, roles: ['sales', 'service_engineer'] },
      { href: '/mgmt/sales-staff/order-tracking', label: 'Order Tracking', icon: ShoppingBag, roles: ['sales-staff'] },
      { href: '/mgmt/sales/online-orders', label: 'Online Orders', icon: PackageCheck, roles: ['sales', 'service_engineer'] },
      { href: '/mgmt/manager/online-orders', label: 'Online Orders', icon: PackageCheck, roles: ['manager'] },
      { href: '/mgmt/sales/agent-order', label: 'Agent Order', icon: ShoppingBag, roles: ['sales'] },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/superadmin/mgmt/users', label: 'User Management', icon: Users, roles: ['superadmin'] },
      { href: '/mgmt/admin/staff', label: 'Staff Management', icon: Users, roles: ['admin'] },
      { href: '/mgmt/manager/salesperson', label: 'Salesperson Management', icon: Users, roles: ['manager'] },
      { href: '/superadmin/mgmt/products', label: 'Product Catalog', icon: Wrench, roles: ['superadmin'] },
      { href: '/mgmt/admin/inventory', label: 'Inventory Management', icon: Package, roles: ['admin'] },
      { href: '/mgmt/manager/inventory', label: 'Inventory', icon: Package, roles: ['manager'] },
      { href: '/mgmt/sales/inventory', label: 'Inventory', icon: PackageSearch, roles: ['sales'], permission: PERMS.INVENTORY_MANAGE },
      { href: '/mgmt/sales/products', label: 'Product Management', icon: Package, roles: ['sales'], permission: PERMS.INVENTORY_MANAGE },
      { href: '/superadmin/mgmt/custom-setups', label: 'Custom Setups', icon: Settings, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/services', label: 'Services Manager', icon: Settings, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/leads', label: 'Infrastructure Leads', icon: ClipboardList, roles: ['superadmin'] },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/mgmt/admin/purchase', label: 'Purchase Management', icon: Archive, roles: ['admin'] },
      { href: '/mgmt/manager/purchase', label: 'Purchase Entry', icon: Archive, roles: ['manager'] },
      { href: '/mgmt/sales/purchase-entry', label: 'Purchase Entry', icon: Archive, roles: ['sales'], permission: PERMS.INVENTORY_MANAGE },
      { href: '/mgmt/admin/invoice-lookup', label: 'Invoice Lookup', icon: FileSearch, roles: ['admin'] },
      { href: '/mgmt/sales/invoice-lookup', label: 'Invoice Lookup', icon: FileSearch, roles: ['sales', 'service_engineer'] },
      { href: '/mgmt/sales-staff/invoice-lookup', label: 'Invoice Lookup', icon: FileSearch, roles: ['sales-staff'] },
      { href: '/mgmt/manager/invoice-lookup', label: 'Invoice Lookup', icon: FileSearch, roles: ['manager'] },
      { href: '/mgmt/admin/quotes', label: 'Quotes Management', icon: FileText, roles: ['admin'] },
      { href: '/superadmin/mgmt/catalogue', label: 'PDF Catalogue', icon: FileText, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/payment-settings', label: 'Payment Settings', icon: CreditCard, roles: ['superadmin'] },
    ],
  },
  {
    title: 'Growth',
    items: [
      { href: '/mgmt/admin/broadcast-desk', label: 'Broadcast Desk', icon: Megaphone, roles: ['admin'] },
      { href: '/superadmin/mgmt/social-media', label: 'Social Media', icon: Share2, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/offers', label: 'Offers & Coupons', icon: Ticket, roles: ['superadmin'] },
      { href: '/superadmin/mgmt/marketing', label: 'Marketing Target', icon: Activity, roles: ['superadmin'] },
    ],
  },
  {
    title: 'Reports',
    items: [
      { href: '/mgmt/manager/reports', label: 'Reports', icon: BarChart2, roles: ['manager'] },
      { href: '/mgmt/sales-staff/reports', label: 'Reports', icon: BarChart2, roles: ['sales-staff'] },
      { href: '/mgmt/sales/history', label: 'Billing History', icon: FileSearch, roles: ['sales', 'service_engineer'] },
      { href: '/mgmt/sales/expenses', label: 'Expense Entry', icon: FileText, roles: ['sales', 'service_engineer'] },
      { href: '/superadmin/mgmt/reports', label: 'System Reports', icon: ClipboardList, roles: ['superadmin'] },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/superadmin/mgmt/ai-config', label: 'AI Configurations', icon: Bot, roles: ['superadmin'], permission: PERMS.AI_ORCHESTRATION },
      { href: '/superadmin/mgmt/settings?section=website', label: 'Website Settings', icon: Activity, roles: ['superadmin'], permission: PERMS.SETTINGS_MANAGE },
      { href: '/superadmin/mgmt/settings?section=brand', label: 'Brand Settings', icon: ImageIcon, roles: ['superadmin'], permission: PERMS.SETTINGS_MANAGE },
      { href: '/superadmin/mgmt/settings?section=company', label: 'Company Details', icon: Building, roles: ['superadmin'], permission: PERMS.SETTINGS_MANAGE },
      { href: '/superadmin/mgmt/settings?section=tax', label: 'Tax Configuration', icon: Percent, roles: ['superadmin'], permission: PERMS.SETTINGS_MANAGE },
      { href: '/superadmin/mgmt/policies', label: 'Policies Management', icon: FileText, roles: ['superadmin'] },
    ],
  },
];

export function canAccessPanelItem(role: UserRole, item: UnifiedPanelNavItem) {
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
