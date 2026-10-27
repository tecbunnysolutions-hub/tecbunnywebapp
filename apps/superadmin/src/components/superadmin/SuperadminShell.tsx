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
  SlidersHorizontal,
  CreditCard,
  Activity,
  Bot,
  Settings,
  ClipboardList,
  ChevronRight,
  Menu,
  Sparkles,
  Bell,
  LogOut,
} from 'lucide-react';

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
      { href: '/superadmin/mgmt/custom-setups', label: 'Custom Setups', icon: SlidersHorizontal },
      { href: '/superadmin/mgmt/payment-settings', label: 'Payment Settings', icon: CreditCard },
      { href: '/superadmin/mgmt/marketing', label: 'Marketing', icon: Activity },
    ],
  },
  {
    title: 'Platform',
    items: [
      { href: '/superadmin/mgmt/ai-config', label: 'AI Configuration', icon: Bot },
      { href: '/superadmin/mgmt/system-health', label: 'System Health', icon: Activity },
      { href: '/superadmin/mgmt/settings', label: 'System Settings', icon: Settings },
      { href: '/superadmin/mgmt/audit-logs', label: 'Audit Logs', icon: ClipboardList },
    ],
  },
];

function getBreadcrumbs(pathname: string) {
  const activeItem = NAV_SECTIONS
    .flatMap((section) => section.items)
    .find((item) => item.exact ? pathname === item.href : pathname.startsWith(item.href));

  if (!activeItem) {
    return ['Superadmin'];
  }

  const activeSection = NAV_SECTIONS.find((section) => section.items.some((item) => item.href === activeItem.href));
  return ['Superadmin', activeSection?.title, activeItem.label].filter(Boolean) as string[];
}

export function SuperadminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname || '/superadmin/mgmt/dashboard');

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-muted-foreground">
      <a
        href="#superadmin-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        Skip to main content
      </a>
      {/* Scrollbar-hide styles for clean sidebar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/80 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-destructive to-destructive flex items-center justify-center text-foreground font-black text-sm shrink-0">
            T
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight text-muted-foreground leading-tight">
              TecBunny
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-destructive leading-tight">
              Superadmin
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-destructive/40 text-destructive border border-destructive/50 shadow-sm'
                          : 'text-muted-foreground hover:bg-card/50 hover:text-muted-foreground'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-destructive' : 'text-muted-foreground'
                        }`}
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
        <form action="/superadmin/mgmt/logout" method="post" className="border-t border-border p-2.5 shrink-0">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground hover:bg-card/50 hover:text-muted-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
            Sign out
          </button>
        </form>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Topbar */}
        <header className="h-16 bg-card/30 border-b border-border/80 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-muted-foreground rounded-md hover:bg-card/50"
              onClick={() => setMobileOpen(true)}
              aria-label="Open superadmin navigation"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm md:flex">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={`${breadcrumb}-${index}`}>
                  {index > 0 ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
                  <span className={index === breadcrumbs.length - 1 ? 'truncate font-semibold text-muted-foreground' : 'truncate text-muted-foreground'}>
                    {breadcrumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/superadmin/mgmt/ai-config" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary/40 to-primary/40 text-primary border border-primary/50 hover:shadow-lg hover:border-primary/60 transition-all">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              AI Command
            </Link>

            <Link href="/superadmin/mgmt/audit-logs" className="p-2 text-muted-foreground hover:text-muted-foreground relative rounded-full hover:bg-card/60" aria-label="View superadmin activity log">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-ring text-destructive-foreground" />
            </Link>

            {/* Profile */}
            <div className="flex items-center gap-2 pl-1">
              <div className="h-8 w-8 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground font-bold text-sm shrink-0">
                S
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <p className="font-semibold text-muted-foreground">System Super Administrator</p>
                <p className="text-[10px] text-muted-foreground font-medium">Superadmin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="superadmin-main-content" tabIndex={-1} className="flex-1 overflow-y-auto bg-background focus:outline-none">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
