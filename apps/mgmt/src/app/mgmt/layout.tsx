"use client";

import React, { useMemo } from 'react';
import { useAuth } from "@tecbunny/core/hooks";
import { GlobalShell, NavSection } from '@tecbunny/admin-ui';
import { 
  LayoutDashboard, Users, ShoppingCart, Activity, Briefcase,
  Megaphone, CheckSquare, ClipboardList, Box
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
  { label: 'Reports', href: '/mgmt/reports', icon: Activity, module: 'reports' }
];

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  const navigation = useMemo(() => {
    if (!user) return [];
    
    // Mocking role-based module filtering
    let allowed = [];
    if (user.role === 'admin' || user.role === 'superadmin') {
      allowed = ALL_NAV_ITEMS;
    } else if (user.role.includes('sales')) {
      allowed = ALL_NAV_ITEMS.filter(item => ['dashboard', 'crm', 'orders', 'tasks', 'reports'].includes(item.module));
    } else if (user.role.includes('service')) {
      allowed = ALL_NAV_ITEMS.filter(item => ['dashboard', 'crm', 'tasks', 'inventory'].includes(item.module));
    } else if (user.role === 'accounts') {
      allowed = ALL_NAV_ITEMS.filter(item => ['dashboard', 'accounts', 'approvals', 'reports'].includes(item.module));
    } else {
      allowed = ALL_NAV_ITEMS.filter(item => ['dashboard', 'tasks'].includes(item.module));
    }

    return [
      { title: 'Workspace', items: allowed }
    ] as NavSection[];
  }, [user]);

  if (loading || !user) {
    return null; // The DashboardClient/Auth hooks handle redirection
  }

  return (
    <GlobalShell 
      appName="Workspace" 
      appColor="indigo"
      navigation={navigation}
    >
      <div className="mx-auto max-w-7xl p-4 lg:p-8">
        {children}
      </div>

      {/* Quick Actions FAB */}
      <div className="fixed bottom-6 right-24 z-40">
        <div className="group relative">
          <button className="flex items-center justify-center w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all shadow-emerald-600/30">
            <span className="text-3xl leading-none font-light mb-1">+</span>
          </button>
          
          <div className="absolute bottom-16 right-0 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-bottom-right transform scale-95 group-hover:scale-100 overflow-hidden">
            <div className="py-1">
              <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b">Create New</p>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors">Lead</button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors">Quotation</button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors">Order</button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors">Customer</button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors">Ticket</button>
            </div>
          </div>
        </div>
      </div>
    </GlobalShell>
  );
}
