'use client';

import React, { useState } from 'react';
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
  blue: 'bg-blue-600 text-white',
  indigo: 'bg-indigo-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  rose: 'bg-rose-600 text-white',
  slate: 'bg-slate-900 text-white',
};

const activeBgMaps = {
  blue: 'bg-blue-50 text-blue-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-900',
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

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/staff/login';
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <Logo className={cn("h-8 w-8", `text-${appColor}-600`)} />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              TecBunny <span className="text-slate-400 font-medium">| {appName}</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navigation.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map(item => {
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive ? activeBgMaps[appColor] : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? `text-${appColor}-600` : "text-slate-400")} />
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
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 rounded-md"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Global Search Button */}
            <button 
              onClick={onSearchClick}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg max-w-md w-full transition-colors border border-transparent focus:border-indigo-500 outline-none"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Search anywhere... (Cmd+K)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* AI Command Button */}
            <button 
              onClick={onAIClick}
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm border",
                "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-100 hover:shadow-md hover:scale-105"
              )}
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Command
            </button>

            {/* Notifications */}
            <button className="p-2 text-slate-400 hover:text-slate-600 relative rounded-full hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 transition-colors">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm", colorMaps[appColor])}>
                    {user?.name?.[0] || user?.email?.[0] || 'U'}
                  </div>
                  <div className="hidden sm:block text-left text-sm leading-tight">
                    <p className="font-medium text-slate-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>Profile Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          {children}
        </main>
      </div>

      <FloatingAIAssistant />
      <GlobalDrawer />
    </div>
  );
}
