'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Bell, User, Menu, X, Sparkles, ChevronRight, LogOut
} from 'lucide-react';
import { cn } from "@tecbunny/core/utils";
import { useAuth } from "@tecbunny/core/hooks";
import { Logo } from "@tecbunny/ui";
import { Button } from "@tecbunny/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tecbunny/ui";
import { GlobalDrawer } from './GlobalDrawer';
import { FloatingAIAssistant } from './FloatingAIAssistant';
import { CommandPalette, FloatingQuickActions } from "@tecbunny/ui";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

interface GlobalShellProps {
  children: React.ReactNode;
  navigation: NavSection[];
  appName: string;
  appColor?: 'blue' | 'indigo' | 'emerald' | 'rose' | 'slate';
  onSearchClick?: () => void;
  onAIClick?: () => void;
}

const colorMaps = {
  blue: 'bg-primary text-primary-foreground',
  indigo: 'bg-primary text-primary-foreground',
  emerald: 'bg-success text-success-foreground',
  rose: 'bg-destructive text-destructive-foreground',
  slate: 'bg-card text-foreground',
};

const activeBgMaps = {
  blue: 'bg-primary/10 text-primary',
  indigo: 'bg-primary/10 text-primary',
  emerald: 'bg-success/10 text-success',
  rose: 'bg-destructive/10 text-destructive',
  slate: 'bg-muted text-foreground',
};

export function GlobalShell({
  children,
  navigation,
  appName,
  appColor = 'indigo',
  onSearchClick,
  onAIClick
}: GlobalShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen || window.matchMedia('(min-width: 1024px)').matches) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = navigationRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]') ?? []);
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setMobileMenuOpen(false); return; }
      if (event.key !== 'Tab' || window.matchMedia('(min-width: 1024px)').matches) return;
      const items = focusable();
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/staff/login';
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-dvh bg-muted overflow-hidden font-sans">
      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-overlay/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside ref={navigationRef} role={mobileMenuOpen ? 'dialog' : undefined} aria-modal={mobileMenuOpen || undefined} aria-label="Workspace navigation" className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full invisible lg:visible"
      )}>
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <Logo className={cn("h-8 w-8", "text-primary")} />
            <span className="text-xl font-bold tracking-tight text-foreground">
              TecBunny <span className="text-muted-foreground font-medium">| {appName}</span>
            </span>
          </Link>
          <button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="ml-auto flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted lg:hidden"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>

        <nav aria-label="Workspace navigation" className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navigation.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map(item => {
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive ? activeBgMaps[appColor] : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button
              aria-label="Open navigation" aria-expanded={mobileMenuOpen} className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-md"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Global Search Button */}
            <button
              onClick={onSearchClick ?? (() => window.dispatchEvent(new Event('tecbunny:command-palette')))}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted text-muted-foreground rounded-lg max-w-md w-full transition-colors border border-transparent focus:border-primary outline-none"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Find a workspace action · Ctrl/⌘ K</span>
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* AI Command Button */}
            <button
              onClick={onAIClick ?? (() => window.dispatchEvent(new Event('tecbunny:workspace-help')))}
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm border",
                "bg-gradient-to-r from-primary/10 to-primary/10 text-primary border-primary/10 hover:shadow-md hover:scale-105"
              )}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Workspace help
            </button>

            {/* Notifications */}
            <span className="sr-only">Notifications are not connected in this workspace.</span>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Open account menu" className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-muted transition-colors">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm", colorMaps[appColor])}>
                    {user?.name?.[0] || user?.email?.[0] || 'U'}
                  </div>
                  <div className="hidden sm:block text-left text-sm leading-tight">
                    <p className="font-medium text-foreground">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>Profile Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto bg-background relative">
          {children}
        </main>
      </div>

      <FloatingAIAssistant />
      <FloatingQuickActions />
      <CommandPalette />
      <GlobalDrawer />
    </div>
  );
}
