"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@tecbunny/core/hooks";
import { isAtLeast, normalizeRole, type UserRole } from "@tecbunny/core/roles";

type ModuleKey = 'orders' | 'inventory' | 'marketing' | 'tasks' | 'approvals' | 'reports';

const MODULE_ROUTES: Record<ModuleKey, Partial<Record<UserRole, string>>> = {
  orders: {
    superadmin: '/mgmt/admin/orders',
    admin: '/mgmt/admin/orders',
    sales_manager: '/mgmt/manager/online-orders',
    manager: '/mgmt/manager/online-orders',
    service_manager: '/mgmt/service-manager/orders',
    sales_executive: '/mgmt/sales/orders',
    sales: '/mgmt/sales/orders',
    store_executive: '/mgmt/sales-staff/order-tracking',
    'sales-staff': '/mgmt/sales-staff/order-tracking',
    sales_agent: '/mgmt/sales-external/quick-billing',
    'sales-external': '/mgmt/sales-external/quick-billing',
  },
  inventory: {
    superadmin: '/mgmt/admin/inventory',
    admin: '/mgmt/admin/inventory',
    sales_manager: '/mgmt/manager/inventory',
    manager: '/mgmt/manager/inventory',
    sales_executive: '/mgmt/sales/inventory',
    sales: '/mgmt/sales/inventory',
    store_executive: '/mgmt/sales-staff/order-tracking',
    'sales-staff': '/mgmt/sales-staff/order-tracking',
    service_manager: '/mgmt/service-manager/orders',
    service_engineer: '/mgmt/service-engineer/jobs',
  },
  marketing: {
    superadmin: '/mgmt/admin/broadcast-desk',
    admin: '/mgmt/admin/broadcast-desk',
    marketing_manager: '/mgmt/admin/broadcast-desk',
    marketing_executive: '/mgmt/admin/broadcast-desk',
  },
  tasks: {
    superadmin: '/mgmt/admin/tasks',
    admin: '/mgmt/admin/tasks',
    sales_manager: '/mgmt/manager',
    manager: '/mgmt/manager',
    service_manager: '/mgmt/service-manager/tickets',
    service_engineer: '/mgmt/service-engineer/jobs',
    sales_executive: '/mgmt/sales/lead-center',
    sales: '/mgmt/sales/lead-center',
    store_executive: '/mgmt/sales-staff/order-tracking',
    'sales-staff': '/mgmt/sales-staff/order-tracking',
  },
  approvals: {
    superadmin: '/mgmt/admin/orders',
    admin: '/mgmt/admin/orders',
    sales_manager: '/mgmt/manager/online-orders',
    manager: '/mgmt/manager/online-orders',
    accounts: '/mgmt/accounts',
  },
  reports: {
    superadmin: '/mgmt/admin/analytics',
    admin: '/mgmt/admin/analytics',
    sales_manager: '/mgmt/manager/reports',
    manager: '/mgmt/manager/reports',
    store_executive: '/mgmt/sales-staff/reports',
    'sales-staff': '/mgmt/sales-staff/reports',
    sales_agent: '/mgmt/sales-external/reports',
    'sales-external': '/mgmt/sales-external/reports',
    sales_executive: '/mgmt/sales/history',
    sales: '/mgmt/sales/history',
    accounts: '/mgmt/accounts',
  },
};

function resolveModuleRoute(module: ModuleKey, role: UserRole) {
  const moduleRoutes = MODULE_ROUTES[module];
  if (moduleRoutes[role]) return moduleRoutes[role]!;
  if (isAtLeast(role, 'admin') && moduleRoutes.admin) return moduleRoutes.admin;
  if (isAtLeast(role, 'sales_manager') && moduleRoutes.sales_manager) return moduleRoutes.sales_manager;
  if (isAtLeast(role, 'service_manager') && moduleRoutes.service_manager) return moduleRoutes.service_manager;
  return '/mgmt';
}

export function ModuleRedirect({ module }: { module: ModuleKey }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    const role = normalizeRole(user.role) ?? 'customer';
    router.replace(resolveModuleRoute(module, role));
  }, [loading, module, router, user]);

  return (
    <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground" role="status" aria-live="polite">
      Opening the right workspace...
    </div>
  );
}