'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  Shield,
  Users,
  Package,
  Wrench,
  CreditCard,
  Activity,
  Bot,
  Settings,
  ClipboardList,
  Menu,
  X,
  Search,
  Sparkles,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Logo } from '@tecbunny/ui';
import { cn } from '@tecbunny/core/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Command Center',
    items: [
      { href: '/superadmin/mgmt/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'Governance',
    items: [
      { href: '/superadmin/mgmt/organizations', label: 'Organizations', icon: Building2 },
      { href: '/superadmin/mgmt/branches', label: 'Branches', icon: GitBranch },
      { href: '/superadmin/mgmt/roles', label: 'RBAC (Roles)', icon: Shield },
      { href: '/superadmin/mgmt/users', label: 'Users', icon: Users },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { href: '/superadmin/mgmt/products', label: 'Products', icon: Package },
      { href: '/superadmin/mgmt/services', label: 'Services', icon: Wrench },
      { href: '/superadmin/mgmt/payment-settings', label: 'Payment Settings', icon: CreditCard },
      { href: '/superadmin/mgmt/marketing', label: 'Marketing', icon: Activity },
    ],
  },
  {
    title: 'Platform',
    items: [
      { href: '/superadmin/mgmt/ai-config', label: 'AI Configuration', icon: Bot },
      { href: '/superadmin/mgmt/settings', label: 'System Settings', icon: Settings },
      { href: '/superadmin/mgmt/audit-logs', label: 'Audit Logs', icon: ClipboardList },
    ],
  },
];

export function SuperadminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100 shrink-0">
          <Logo className="h-8 w-8 text-red-600" />
          <div>
            <p className="text-sm font-black uppercase tracking-tight text-slate-900 leading-tight">
              TecBunny
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 leading-tight">
              Superadmin
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all',
                        isActive
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-red-600' : 'text-slate-400'
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="border-t border-slate-100 p-3 shrink-0">
          <Link
            href="/api/admin-auth/logout"
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Link>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 rounded-md"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search */}
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-400 rounded-lg max-w-md w-full transition-colors text-sm">
              <Search className="h-4 w-4" />
              Search anywhere… (Cmd+K)
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Command */}
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100 hover:shadow-md transition-all">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              AI Command
            </button>

            {/* Notifications */}
            <button className="p-2 text-slate-400 hover:text-slate-600 relative rounded-full hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2 pl-1">
              <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                S
              </div>
              <div className="hidden sm:block text-left text-sm leading-tight">
                <p className="font-semibold text-slate-900">System Super Administrator</p>
                <p className="text-xs text-slate-400">Superadmin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
