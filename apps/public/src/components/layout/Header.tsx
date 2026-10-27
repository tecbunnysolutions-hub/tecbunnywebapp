'use client';
import { getPanelHome } from "@tecbunny/core";



import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from "@tecbunny/ui";
import { ENTITY } from '@/lib/entity';
import {
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  ShoppingCart,
  User,
  LogOut,
} from 'lucide-react';

import { useAnalytics } from '@tecbunny/core';
import { useAuth, useCart } from "@tecbunny/core/hooks";
import { hasRoleClient } from "@tecbunny/core/permissions-client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tecbunny/ui";
import { EnhancedCartSheet as CartSheet } from '../cart/EnhancedCartSheet';
import companyInfo from '../../../public/company-info.json';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';

type NavLink = {
  name: string;
  href: string;
  children?: Array<{ name: string; href: string }>;
};

const navLinks: NavLink[] = [
  { name: 'CCTV', href: '/services/cctv-security' },
  { name: 'IT Support', href: '/services/it-support' },
  { name: 'RFID Locks', href: '/services/rfid-locks' },
  { name: 'Networking', href: '/services/networking' },
  { name: 'Website Development', href: '/webdev' },
];

export function Header() {
  useAnalytics({ autoTrackPageView: true });
  const { user, loading, logout } = useAuth();
  const { cartCount, isHydrated } = useCart();
  const pathname = usePathname();
  const isB2BPath = pathname === '/solutions';
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = React.useState<string | null>(null);
  const [desktopSubmenuOpen, setDesktopSubmenuOpen] = React.useState<string | null>(null);
  const company = companyInfo as typeof companyInfo & {
    city?: string;
    state?: string;
    phone?: string;
  };
  let initialLocation = 'Goa';
  if (typeof company.locationShort === 'string' && company.locationShort.trim()) {
    initialLocation = company.locationShort.trim();
  } else if (typeof company.registeredAddress === 'string') {
    const match = company.registeredAddress.match(/([A-Za-z\s]+Goa)/i);
    if (match && match[1]) {
      initialLocation = match[1].replace(/\s+/g, ' ').trim();
    }
  } else if (typeof company.city === 'string' && typeof company.state === 'string') {
    initialLocation = `${company.city}, ${company.state}`;
  }

  const [topInfo, setTopInfo] = React.useState({
    location: initialLocation,
    phone: company.supportPhone || company.phone || process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91 96041 36010',
    hours: company.supportHours || '',
  });

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadCompanyInfo = async () => {
      try {
        const settingsRes = await fetch('/api/settings?key=phone', { signal: controller.signal });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData && settingsData.value) {
            const dbPhone = String(settingsData.value).trim();
            if (isMounted && dbPhone) {
              setTopInfo((current) => ({ ...current, phone: dbPhone }));
            }
          }
        }
      } catch (_error) {
        // Keep defaults on failure
      }
    };

    loadCompanyInfo();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  React.useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSubmenuOpen(null);
    setDesktopSubmenuOpen(null);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const applyMagneticEffect = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    target.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  };

  const resetMagneticEffect = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.style.transform = 'translate(0px, 0px)';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // AuthProvider handles redirect; ignore here
    }
  };

  const showDashboard = !loading && !!user && user.role !== 'customer';
  const showAdminOption = !loading && hasRoleClient(user, 'admin');

  const dashboardHref = React.useMemo(() => {
    return getPanelHome(user?.role);
  }, [user?.role]);

  const accountHref = showDashboard ? dashboardHref : '/profile';

  return (
    <header
      id="navbar"
      className="sticky top-0 z-50 w-full transition-all duration-300 ease-in-out border-b tech-header bg-background/95 backdrop-blur-md shadow-sm"
    >
      {/* Trust Ribbon */}
      <div className="w-full bg-card border-b border-border/60 py-1.5 px-6 sm:px-8 text-[11px] text-muted-foreground font-medium">
        <div className="mx-auto max-w-screen-2xl flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse text-success-foreground"></span>
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground">Registered Company · Goa, India</span>
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
            <span className="hidden md:inline font-light text-muted-foreground">Headquarters: Nhayginwada, Parcem, Pernem, Goa</span>
            <a
              href="https://wa.me/919604136010"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary transition-colors font-bold uppercase tracking-wider text-[10px] shrink-0"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 text-success fill-success shrink-0" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

      <div className={`mx-auto max-w-screen-2xl px-6 sm:px-8 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3.5'}`}>
        <div className="flex items-center gap-[clamp(0.5rem,1.2vw,1.5rem)]">
          <Link href="/" className="flex shrink-0 items-center gap-3 group">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card p-1.5 transition-transform group-hover:scale-105 shadow-md">
              <Logo width={28} height={28} alt="TecBunny CCTV & IT Services Goa" className="sm:hidden text-foreground" />
              <Logo width={36} height={36} alt="TecBunny CCTV & IT Services Goa" className="hidden sm:block text-foreground" />
            </span>
            <div className="flex shrink-0 flex-col">
              <span className="font-sans text-base font-black leading-none tracking-tight text-foreground sm:text-xl uppercase">
                TECBUNNY
              </span>
              <span className="mt-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-primary transition-colors group-hover:text-primary">
                Solutions Pvt Ltd
              </span>
            </div>
          </Link>

          <nav className="hidden min-w-0 flex-[1_1_0%] items-center justify-center whitespace-nowrap gap-[clamp(0.125rem,0.35vw,0.5rem)] rounded-full border border-border bg-card p-1 min-[1280px]:flex">
              {navLinks.map((item) => (
                item.children ? (
                  <div
                    key={item.name}
                    className="relative group"
                  >
                    <Link
                      href={item.href}
                      className={`relative inline-flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-1.5 text-[11px] font-bold transition-all duration-200 2xl:px-2.5 2xl:text-xs
                        ${isActive(item.href)
                          ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                        }
                      `}
                    >
                      {item.name}
                      {isActive(item.href) && (
                        <span className="h-1 w-1 rounded-full bg-primary text-primary-foreground" />
                      )}
                    </Link>
                    <div
                      className="absolute left-1/2 top-full z-50 mt-2.5 w-48 -translate-x-1/2 rounded-xl border border-border bg-background p-1.5 shadow-lg backdrop-blur-md transition-all duration-200 before:content-[''] before:absolute before:-top-3 before:left-0 before:h-3 before:w-full invisible opacity-0 -translate-y-1 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative inline-flex items-center whitespace-nowrap rounded-full px-1.5 py-1.5 text-[11px] font-bold transition-all duration-200 2xl:px-2.5 2xl:text-xs
                      ${isActive(item.href)
                        ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                      }
                    `}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <span className="h-1 w-1 rounded-full bg-primary text-primary-foreground" />
                    )}
                  </Link>
                )
              ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-1.5 min-[1280px]:flex">
            {loading ? (
              <div className="flex items-center gap-2 animate-pulse">
                <div className="h-8 w-14 rounded-full bg-muted" />
                <div className="h-8 w-14 rounded-full bg-secondary" />
              </div>
            ) : !user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-200 hover:border-border hover:text-foreground shadow-sm"
                    aria-label="Login or sign up"
                  >
                    <User size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-border bg-card text-foreground">
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-foreground text-xs py-1.5">
                    <Link href="/auth/signin">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-foreground text-xs py-1.5">
                    <Link href="/auth/signup">Signup</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-200 hover:border-border hover:text-foreground shadow-sm"
                      aria-label="Open profile menu"
                    >
                      <User size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-border bg-card text-foreground">
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-foreground text-xs py-1.5">
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-foreground text-xs py-1.5">
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    {showDashboard && (
                      <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-foreground text-xs py-1.5">
                        <Link href={accountHref}>Account</Link>
                      </DropdownMenuItem>
                    )}
                    {showAdminOption && (
                      <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-foreground text-xs py-1.5">
                        <Link href="/mgmt/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-foreground text-xs py-1.5">
                      <Link href="/auth/change-password">Change Password</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-muted" />
                    <DropdownMenuItem
                      className="cursor-pointer focus:bg-muted focus:text-foreground text-xs py-1.5 text-destructive focus:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!isB2BPath && (
              <>
                <CartSheet>
                  <button
                    type="button"
                    className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-200 hover:border-border hover:text-foreground shadow-sm"
                    aria-label="Open cart"
                  >
                    <ShoppingCart size={20} />
                    {isHydrated && cartCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </CartSheet>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href="/contact?intent=service_request&source=header"
                    onMouseMove={applyMagneticEffect}
                    onMouseLeave={resetMagneticEffect}
                    className="group relative whitespace-nowrap rounded-xl border border-primary bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-all duration-200 hover:bg-primary shadow-lg shadow-primary/20 2xl:px-5 2xl:py-2.5 2xl:text-sm"
                  >
                    Discuss your project
                  </Link>
                  <Link
                    href="/products"
                    onMouseMove={applyMagneticEffect}
                    onMouseLeave={resetMagneticEffect}
                    className="group relative whitespace-nowrap rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition-all duration-200 hover:border-primary hover:text-foreground shadow-sm 2xl:px-5 2xl:py-2.5 2xl:text-sm"
                  >
                    Browse products
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile: cart icon + hamburger */}
          <div className="flex shrink-0 items-center gap-2 min-[1280px]:hidden">
            {!isB2BPath && (
              <CartSheet>
                <button
                  type="button"
                  className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                  aria-label="Open cart"
                >
                  <ShoppingCart size={20} />
                  {isHydrated && cartCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </button>
              </CartSheet>
            )}
            <button
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-card transition-colors shadow-sm"
              onClick={() =>
                setMobileMenuOpen((open) => {
                  const next = !open;
                  if (!next) {
                    setMobileSubmenuOpen(null);
                  }
                  return next;
                })
              }
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`absolute left-0 top-full w-full border-t border-border bg-background min-[1280px]:hidden transition-all duration-300
          ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
        `}
      >
        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-6 pt-3 pb-6 space-y-1.5">
          {navLinks.map((item) => (
            <div key={item.name} className="space-y-1">
              {item.children ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMobileSubmenuOpen((current) => (current === item.name ? null : item.name))}
                    className={`flex min-h-[48px] w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      mobileSubmenuOpen === item.name
                        ? 'text-foreground font-bold bg-card'
                        : 'text-muted-foreground hover:bg-card hover:text-foreground'
                    }`}
                  >
                    {item.name}
                    <ChevronRight
                      size={14}
                      className={`text-muted-foreground transition-transform ${mobileSubmenuOpen === item.name ? 'rotate-90' : ''}`}
                    />
                  </button>
                  <div
                    className={`space-y-1 pl-3 overflow-hidden transition-all ${
                      mobileSubmenuOpen === item.name
                        ? 'max-h-60 opacity-100'
                        : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    {!item.children.some((c) => c.href === item.href) && (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                      >
                        All {item.name}
                        <ChevronRight size={12} className="text-muted-foreground" />
                      </Link>
                    )}
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                      >
                        {child.name}
                        <ChevronRight size={12} className="text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive(item.href)
                      ? 'text-foreground font-bold bg-card'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  {item.name}
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>
              )}
            </div>
          ))}
          {showDashboard && (
            <Link
              href={dashboardHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
            >
              Dashboard
              <ChevronRight size={14} className="text-muted-foreground" />
            </Link>
          )}
          <Link
            href="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
          >
            Cart
            <ChevronRight size={14} className="text-muted-foreground" />
          </Link>
          {loading ? (
            <div className="space-y-1.5 animate-pulse pt-2">
              <div className="h-8 w-full rounded-lg bg-card" />
              <div className="h-8 w-full rounded-lg bg-card" />
            </div>
          ) : !user ? (
            <div className="space-y-1.5 pt-2">
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[48px] items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
              >
                Login
                <ChevronRight size={14} className="text-muted-foreground" />
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[48px] items-center justify-between rounded-lg border border-primary/20 bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary transition-colors"
              >
                Signup
                <ChevronRight size={14} className="text-foreground" />
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5 pt-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
              >
                Profile
                <ChevronRight size={14} className="text-muted-foreground" />
              </Link>
              {showDashboard && (
                <Link
                  href={accountHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                >
                  Account
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>
              )}
              {showAdminOption && (
                <Link
                  href="/mgmt/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                >
                  Admin Panel
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>
              )}
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await handleLogout();
                }}
                className="flex min-h-[48px] w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
              >
                Logout
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
            </div>
          )}
          <div className="pt-3 border-t border-border space-y-2">
            <Link
              href="/contact?intent=service_request&source=mobile_header"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full rounded-xl bg-primary py-3 text-center text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary transition-colors"
            >
              Discuss your project
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full rounded-xl border border-primary/20 bg-primary/10 py-2.5 text-center text-xs font-semibold text-primary hover:text-primary transition-colors"
            >
              Browse products
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
