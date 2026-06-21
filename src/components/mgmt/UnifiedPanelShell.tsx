'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  ChevronRight,
  Command,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';

import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ROLE_DISPLAY_NAME, type UserRole } from '@/lib/roles';
import type { User as TecbunnyUser } from '@/lib/types';
import { getPanelNavigation, type UnifiedPanelNavSection } from './unified-panel-nav';

type UnifiedPanelShellProps = {
  children: React.ReactNode;
  role: UserRole;
  user?: Pick<TecbunnyUser, 'name' | 'email' | 'role'> | null;
  loading?: boolean;
  authorized?: boolean;
  mainId?: string;
  workspaceLabel?: string;
  statusLabel?: string;
  onLogout?: () => Promise<void> | void;
  logoutHref?: string;
};

function isActivePath(pathname: string, href: string, exact?: boolean) {
  const baseHref = href.split('?')[0] || href;
  if (exact) return pathname === baseHref;
  return pathname === baseHref || pathname.startsWith(`${baseHref}/`);
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 text-xs font-semibold text-blue-200">
      {ROLE_DISPLAY_NAME[role] ?? role}
    </span>
  );
}

function QuickSearch() {
  return (
    <button
      type="button"
      className="hidden h-10 min-w-[18rem] items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/80 px-3 text-left text-sm text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300 lg:flex"
      aria-label="Open universal search"
    >
      <Search className="h-4 w-4" />
      <span className="flex-1">Search orders, customers, invoices...</span>
      <span className="inline-flex items-center gap-1 rounded border border-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
        <Command className="h-3 w-3" /> K
      </span>
    </button>
  );
}

function SidebarContent({
  sections,
  pathname,
  role,
  user,
  onLogout,
  logoutHref,
}: {
  sections: UnifiedPanelNavSection[];
  pathname: string;
  role: UserRole;
  user?: Pick<TecbunnyUser, 'name' | 'email' | 'role'> | null;
  onLogout?: () => Promise<void> | void;
  logoutHref?: string;
}) {
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleLogoutHref = async () => {
    if (!logoutHref) return;

    setIsSigningOut(true);
    try {
      await fetch(logoutHref, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      window.location.assign('/superadmin/login?status=signed_out');
    }
  };

  const logoutControl = onLogout ? (
    <button
      type="button"
      onClick={onLogout}
      className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  ) : (
    <button
      type="button"
      onClick={handleLogoutHref}
      disabled={isSigningOut}
      className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
      {isSigningOut ? 'Signing out...' : 'Sign out'}
    </button>
  );

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-200">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-white p-1">
          <Logo width={28} height={28} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-black uppercase tracking-tight text-white">Tecbunny</p>
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Internal OS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-600">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActivePath(pathname, item.href, item.exact);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={`${section.title}-${item.href}-${item.label}`}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-10 items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'border-blue-500/25 bg-blue-500/10 text-white'
                          : 'border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-blue-300' : 'text-zinc-500')} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {active ? <ChevronRight className="h-3.5 w-3.5 text-blue-300" /> : null}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <div className="border-t border-zinc-800 p-3">
        <div className="mb-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500/10 text-blue-300">
              <User className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name || ROLE_DISPLAY_NAME[role]}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email || role}</p>
            </div>
          </div>
        </div>
        {logoutControl}
      </div>
    </div>
  );
}

export function UnifiedPanelShell({
  children,
  role,
  user,
  loading = false,
  authorized = true,
  mainId = 'internal-panel-main',
  workspaceLabel = 'Tecbunny Internal Panel',
  statusLabel = 'Operational',
  onLogout,
  logoutHref,
}: UnifiedPanelShellProps) {
  const pathname = usePathname() || '/';
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const sections = React.useMemo(() => getPanelNavigation(role), [role]);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div
      className="admin-shell flex min-h-screen bg-zinc-950 text-zinc-100"
      data-auth-state={authorized ? 'authorized' : loading ? 'checking' : 'redirecting'}
      data-panel-role={role}
    >
      <a
        href={`#${mainId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
      >
        Skip to main content
      </a>

      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-zinc-800 lg:block">
        <SidebarContent
          sections={sections}
          pathname={pathname}
          role={role}
          user={user}
          onLogout={onLogout}
          logoutHref={logoutHref}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-800 text-zinc-200 lg:hidden"
                  aria-label="Open navigation menu"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] border-zinc-800 bg-zinc-950 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Internal navigation</SheetTitle>
                </SheetHeader>
                <SidebarContent
                  sections={sections}
                  pathname={pathname}
                  role={role}
                  user={user}
                  onLogout={onLogout}
                  logoutHref={logoutHref}
                />
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-white sm:text-base">{workspaceLabel}</p>
                <RoleBadge role={role} />
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {statusLabel}
              </div>
            </div>

            <QuickSearch />

            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" className="h-10 gap-2 border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-white">
                <Plus className="h-4 w-4" />
                New
              </Button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white"
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-800 bg-blue-500/10 text-blue-300">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
          </div>
        </header>

        <main
          id={mainId}
          tabIndex={-1}
          aria-label="Internal panel main content"
          aria-busy={loading && !authorized}
          className="relative min-w-0 flex-1 bg-zinc-950 p-4 focus:outline-none sm:p-6 lg:p-8"
        >
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
          {loading && !authorized ? (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm" aria-live="polite">
              <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 shadow-sm">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-b-blue-400" />
                <span className="text-sm text-zinc-300">Checking access...</span>
              </div>
            </div>
          ) : null}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
