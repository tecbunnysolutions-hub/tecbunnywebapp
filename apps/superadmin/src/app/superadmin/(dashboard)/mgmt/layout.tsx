import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, LogOut, Users, Package, Settings, CreditCard, Activity, Bot } from 'lucide-react';
import { verifySuperadminSessionToken } from "@tecbunny/core/auth/superadmin-session";
import { Logo } from "@tecbunny/ui";

export const dynamic = 'force-dynamic';

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const superadminCookie = cookieStore.get('superadmin-session')?.value;
  const isSuperadmin = Boolean(await verifySuperadminSessionToken(superadminCookie));

  if (!isSuperadmin) {
    redirect('/superadmin/login?error=session_expired');
  }

  const navItems = [
    { href: '/superadmin/mgmt/dashboard', label: 'Root Console', icon: ShieldCheck },
    { href: '/superadmin/mgmt/users', label: 'User Governance', icon: Users },
    { href: '/superadmin/mgmt/products', label: 'Product Catalogue', icon: Package },
    { href: '/superadmin/mgmt/services', label: 'Service Catalogue', icon: Settings },
    { href: '/superadmin/mgmt/payment-settings', label: 'Payment Settings', icon: CreditCard },
    { href: '/superadmin/mgmt/marketing', label: 'Marketing Target', icon: Activity },
    { href: '/superadmin/mgmt/ai-config', label: 'AI Configuration', icon: Bot },
  ];

  return (
    <div className="flex min-h-[100dvh] w-full overflow-x-hidden bg-zinc-950 text-zinc-100 font-sans">
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 border-r border-zinc-800 xl:flex flex-col bg-zinc-950 text-zinc-200">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg p-1">
            <Logo width={28} height={28} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black uppercase tracking-tight text-white">Tecbunny</p>
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-red-500">Superadmin OS</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-10 items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              <item.icon className="h-4 w-4 shrink-0 text-zinc-500" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-800 p-3">
           <Link href="/api/admin-auth/logout" prefetch={false} className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
              <LogOut className="h-4 w-4" />
              Sign out
           </Link>
        </div>
      </aside>
      
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-white sm:text-base">Superadmin Console</p>
                <span className="inline-flex min-h-7 items-center rounded-md border border-red-500/20 bg-red-500/10 px-2.5 text-xs font-semibold text-red-200">
                  ROOT
                </span>
              </div>
            </div>
          </div>
        </header>
        
        <main
          id="superadmin-main"
          className="relative min-w-0 flex-1 bg-zinc-950 px-3 pb-24 pt-5 focus:outline-none sm:px-5 sm:pb-8 sm:pt-6 lg:px-8"
        >
          <div className="mx-auto w-full min-w-0 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
