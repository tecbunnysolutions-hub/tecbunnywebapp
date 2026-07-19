"use client";

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@tecbunny/core/hooks";
import { GlobalShell, NavSection } from '@tecbunny/admin-ui';
import { isAtLeast } from '@tecbunny/core/roles';
import type { UserRole } from '@tecbunny/core/roles';
import { 
  LayoutDashboard, Users, ShoppingCart, Activity, Briefcase,
  Megaphone, CheckSquare, ClipboardList, Box, X, UserCog
} from 'lucide-react';

const ALL_NAV_ITEMS = [
  { label: 'Dashboard', href: '/mgmt', icon: LayoutDashboard, exact: true, module: 'dashboard' },
  { label: 'CRM', href: '/mgmt/crm', icon: Users, module: 'crm' },
  { label: 'Orders', href: '/mgmt/orders', icon: ShoppingCart, module: 'orders' },
  { label: 'Inventory', href: '/mgmt/inventory', icon: Box, module: 'inventory' },
  { label: 'Accounts', href: '/mgmt/accounts', icon: Briefcase, module: 'accounts' },
  { label: 'Marketing', href: '/mgmt/marketing', icon: Megaphone, module: 'marketing' },
  { label: 'Tasks', href: '/mgmt/tasks', icon: CheckSquare, module: 'tasks' },
  { label: 'Approvals', href: '/mgmt/approvals', icon: ClipboardList, module: 'approvals' },
  { label: 'Reports', href: '/mgmt/reports', icon: Activity, module: 'reports' },
  { label: 'Profile Settings', href: '/mgmt/profile', icon: UserCog, module: 'profile' }
];

/** Derive allowed modules from the canonical role graph instead of fragile string matching. */
function getAllowedModules(role: UserRole): string[] {
  if (isAtLeast(role, 'admin')) {
    return ALL_NAV_ITEMS.map(i => i.module);
  }
  if (isAtLeast(role, 'sales_manager')) {
    return ['dashboard', 'crm', 'orders', 'inventory', 'tasks', 'reports', 'approvals', 'profile'];
  }
  if (isAtLeast(role, 'service_manager')) {
    return ['dashboard', 'crm', 'tasks', 'inventory', 'reports', 'profile'];
  }
  if (isAtLeast(role, 'sales_executive') || isAtLeast(role, 'sales_agent') || isAtLeast(role, 'store_executive')) {
    return ['dashboard', 'crm', 'orders', 'tasks', 'reports', 'profile'];
  }
  if (isAtLeast(role, 'service_engineer')) {
    return ['dashboard', 'crm', 'tasks', 'inventory', 'profile'];
  }
  if (role === 'accounts') {
    return ['dashboard', 'accounts', 'approvals', 'reports', 'profile'];
  }
  if (role === 'marketing_executive' || role === 'marketing_manager') {
    return ['dashboard', 'crm', 'marketing', 'reports', 'profile'];
  }
  return ['dashboard', 'profile'];
}

const QUICK_CREATE_ROUTES: Record<string, string> = {
  Lead: '/mgmt/crm?action=new-lead',
  Quotation: '/mgmt/sales/quotes?action=new',
  Order: '/mgmt/sales/orders?action=new',
  Customer: '/mgmt/crm?action=new-customer',
  Ticket: '/mgmt/service-engineer/jobs?action=new',
};

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fabOpen, setFabOpen] = useState(false);

  const handleQuickCreate = useCallback((label: string) => {
    setFabOpen(false);
    const route = QUICK_CREATE_ROUTES[label];
    if (route) router.push(route);
  }, [router]);

  const navigation = useMemo(() => {
    if (!user) return [];
    const role = (user.role ?? 'customer') as UserRole;
    const allowedModules = new Set(getAllowedModules(role));
    const allowed = ALL_NAV_ITEMS.filter(item => allowedModules.has(item.module));
    return [{ title: 'Workspace', items: allowed }] as NavSection[];
  }, [user]);

  if (loading || !user) {
    return null;
  }

  return (
    <>
      {/* Accessibility: skip-to-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>
    <GlobalShell 
      appName="Workspace" 
      appColor="indigo"
      navigation={navigation}
    >
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl p-4 lg:p-8 outline-none">
        {children}
      </main>

      {/* Quick Actions FAB */}
      <div className="fixed bottom-6 right-24 z-40">
        <div className="relative">
          <button
            aria-label={fabOpen ? 'Close quick actions' : 'Open quick actions'}
            aria-expanded={fabOpen}
            onClick={() => setFabOpen(prev => !prev)}
            className="flex items-center justify-center w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all shadow-emerald-600/30"
          >
            {fabOpen
              ? <X className="w-6 h-6" />
              : <span className="text-3xl leading-none font-light mb-1">+</span>
            }
          </button>

          {fabOpen && (
            <div className="absolute bottom-16 right-0 w-48 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden">
              <div className="py-1">
                <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b">Create New</p>
                {Object.keys(QUICK_CREATE_ROUTES).map(label => (
                  <button
                    key={label}
                    onClick={() => handleQuickCreate(label)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors focus-visible:outline focus-visible:outline-indigo-500"
                    aria-label={`Create new ${label}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </GlobalShell>
    </>
  );
}
