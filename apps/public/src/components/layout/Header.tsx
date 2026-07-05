'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../ui/logo';
import {
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  ShoppingCart,
  User,
  LogOut,
} from 'lucide-react';

import { useAnalytics } from '../../hooks/use-analytics';
import { useAuth, useCart } from '@/lib/hooks';
import { hasRoleClient } from '@/lib/permissions-client';
import { getPanelHome } from '@/lib/panel-routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { EnhancedCartSheet as CartSheet } from '../cart/EnhancedCartSheet';
import companyInfo from '../../../public/company-info.json';

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m.01 1.67c4.56 0 8.25 3.69 8.25 8.25 0 4.56-3.69 8.25-8.25 8.25-1.53 0-3-.42-4.29-1.19l-.3-.18-3.18.83.85-3.11-.2-.32a8.182 8.182 0 0 1-1.25-4.38c0-4.56 3.69-8.25 8.25-8.25M9.42 7.72l-.12.02c-.15.03-.3.06-.44.09-.15.03-.28.06-.41.1-.39.12-.76.3-1.09.56-.33.27-.63.6-.88.97-.27.41-.43.85-.43 1.32 0 .5.16.98.48 1.41.32.43.72.84 1.2 1.24.48.4 1 1.03 1.63 1.28.63.25 1.22.4 1.84.4.45 0 .86-.08 1.23-.25.37-.17.63-.38.83-.63.2-.25.32-.54.4-.85.08-.31.13-.64.13-1s-.05-.72-.13-1.03c-.08-.31-.2-.59-.4-.84-.2-.25-.46-.46-.83-.63-.37-.17-.78-.25-1.23-.25-.62 0-1.21.15-1.84.4-.05.02-.1.04-.15.07-.1.03-.18.07-.27.1-.1.03-.18.05-.28.07l-.17.04c-.06.01-.1.02-.12.02-.02 0-.04.01-.06.01-.02 0-.03 0-.03-.01s0-.01 0-.01l-.01-.01c0-.01.01-.02.01-.04 0-.02 0-.04.01-.06.01-.02.01-.04.02-.06a.7.7 0 0 1 .05-.12c.04-.08.08-.15.14-.23.06-.08.12-.15.2-.22.07-.07.15-.14.23-.2.08-.06.16-.12.25-.17.09-.05.18-.09.28-.13.05-.02.1-.04.13-.05.28-.11.53-.17.75-.17.22 0 .43.03.62.09.19.06.37.14.53.25.16.11.3.25.41.41s.19.34.24.54c.05.2.07.4.07.61 0 .02 0 .03 0 .03s0 .02 0 .02l-.01.03c0 .01-.01.02-.01.03 0 .01-.01.02-.02.03-.01.01-.02.02-.04.03l-.05.03-.06.03c-.02.01-.05.02-.08.03-.03.01-.06.02-.1.04-.04.01-.07.02-.11.04-.04.01-.07.03-.11.04-.04.02-.07.03-.1.05s-.07.04-.1.06-.06.04-.1.07c-.03.02-.06.04-.1.07l-.07.05c-.01 0-.01.01-.01.01s0 .01 0 .01l.01.01c.22-.12.44-.24.67-.35.23-.11.45-.24.67-.35.22-.11.44-.22.65-.33.21-.11.42-.22.62-.33l.2-.1c.14-.07.26-.15.39-.22.13-.07.25-.15.36-.24.11-.09.22-.18.31-.29s.18-.23.25-.36a2.64 2.64 0 0 0 .28-1.38c0-.52-.13-1-.39-1.44a3.17 3.17 0 0 0-1.08-1.21c-.4-.33-.86-.57-1.36-.72s-1.02-.22-1.56-.22c-.54 0-1.06.07-1.56.22s-.96.39-1.36.72c-.4.34-.72.75-.97 1.21-.25.46-.38.96-.38 1.51 0 .42.09.82.26 1.17.17.35.4.66.68.92.28.26.59.47.92.62.33.15.68.25 1.04.28h.1c.02 0 .03 0 .03-.01s0-.01 0-.01l-.01-.01c0-.01 0-.01.01-.02l.01-.02c0-.01.01-.02.01-.03l.01-.03c.01-.02.01-.03.01-.05 0-.02 0-.04.01-.06 0-.02.01-.04.01-.06a.71.71 0 0 0 0-.1c0-.04 0-.08-.02-.13s-.04-.1-.07-.15a.43.43 0 0 0-.1-.13c-.04-.04-.08-.08-.13-.11-.05-.03-.1-.06-.17-.08-.07-.02-.13-.04-.2-.06-.07-.02-.15-.03-.22-.04-.04-.01-.07-.01-.11-.02l-.11-.02h-.04z" />
    </svg>
  );
}

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Solutions', href: '/solutions' },
  { name: 'Products', href: '/products' },
  { 
    name: 'Services', 
    href: '/services',
    children: [
      { name: 'All Services', href: '/services' },
      { name: 'Network & Infrastructure Solutions', href: '/services/network-infrastructure' },
      { name: 'Physical Security & Surveillance', href: '/services/physical-security' },
      { name: 'Smart Access Control Systems', href: '/services/smart-access-control' },
      { name: 'Lifecycle Hardware Management', href: '/services/lifecycle-hardware' },
      { name: 'Software & System Administration', href: '/services/software-system-admin' },
    ]
  },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  {
    name: 'Policies',
    href: '/info/policies',
    children: [
      { name: 'Privacy Policy', href: '/info/policies/privacy' },
      { name: 'Shipping Policies', href: '/info/policies/shipping' },
      { name: 'Terms & Conditions', href: '/info/policies/terms' },
    ],
  },
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
  let initialLocation = 'Goa';
  if (typeof (companyInfo as any)?.locationShort === 'string' && (companyInfo as any).locationShort.trim()) {
    initialLocation = (companyInfo as any).locationShort.trim();
  } else if (typeof (companyInfo as any)?.registeredAddress === 'string') {
    const match = (companyInfo as any).registeredAddress.match(/([A-Za-z\s]+Goa)/i);
    if (match && match[1]) {
      initialLocation = match[1].replace(/\s+/g, ' ').trim();
    }
  } else if (typeof (companyInfo as any)?.city === 'string' && typeof (companyInfo as any)?.state === 'string') {
    initialLocation = `${(companyInfo as any).city}, ${(companyInfo as any).state}`;
  }

  const [topInfo, setTopInfo] = React.useState({
    location: initialLocation,
    phone: (companyInfo as any)?.supportPhone || (companyInfo as any)?.phone || process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91 96041 36010',
    hours: (companyInfo as any)?.supportHours || '',
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
      className="sticky top-0 z-50 w-full transition-all duration-300 ease-in-out border-b tech-header bg-zinc-950/95 backdrop-blur-md shadow-sm"
    >
      {/* Trust Ribbon */}
      <div className="w-full bg-[#030712] border-b border-zinc-900/60 py-1.5 px-6 sm:px-8 text-[11px] text-zinc-400 font-medium">
        <div className="mx-auto max-w-screen-2xl flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[10px] tracking-wider text-zinc-300">GSTIN: {companyInfo.gstin || '30AAMCT1608G1ZO'}</span>
            </span>
            <span className="hidden sm:inline text-zinc-800">|</span>
            <span className="font-mono text-[10px] tracking-wider">CIN: U80200GA2025PTC017488</span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
            <span className="hidden md:inline font-light text-zinc-400">Headquarters: Nhayginwada, Parse, Pernem, Goa</span>
            <a 
              href="https://wa.me/919604136010" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors font-bold uppercase tracking-wider text-[10px] shrink-0"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500 shrink-0" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

      <div className={`mx-auto max-w-screen-2xl px-6 sm:px-8 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3.5'}`}>
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="relative z-20 flex min-w-0 flex-shrink items-center gap-3 group sm:w-[280px]">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200/50 bg-white p-1.5 transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
              <Logo width={28} height={28} className="sm:hidden text-white" />
              <Logo width={36} height={36} className="hidden sm:block text-white" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="font-sans text-base font-black leading-none tracking-tight text-white sm:text-xl uppercase">
                TECBUNNY
              </span>
              <span className="mt-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 transition-colors group-hover:text-blue-200">
                Solutions Pvt Ltd
              </span>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
            <nav className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 p-1">
              {navLinks.map((item) => (
                item.children ? (
                  <div
                    key={item.name}
                    className="relative group"
                  >
                    <Link
                      href={item.href}
                      className={`relative rounded-full px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all duration-200 inline-flex items-center gap-1 lg:px-3 lg:text-xs xl:px-4.5 xl:text-sm
                        ${isActive(item.href)
                          ? 'bg-blue-500/20 text-white border border-blue-500/30 shadow-sm'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                        }
                      `}
                    >
                      {item.name}
                      {isActive(item.href) && (
                        <span className="h-1 w-1 rounded-full bg-blue-500" />
                      )}
                    </Link>
                    <div
                      className="absolute left-1/2 top-full z-50 mt-2.5 w-48 -translate-x-1/2 rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-lg backdrop-blur-md transition-all duration-200 before:content-[''] before:absolute before:-top-3 before:left-0 before:h-3 before:w-full invisible opacity-0 -translate-y-1 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white"
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
                    className={`relative inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-bold transition-all duration-200 lg:px-3 lg:text-xs xl:px-4.5 xl:text-sm
                      ${isActive(item.href)
                        ? 'bg-blue-500/20 text-white border border-blue-500/30 shadow-sm'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                      }
                    `}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <span className="h-1 w-1 rounded-full bg-blue-500" />
                    )}
                  </Link>
                )
              ))}
            </nav>
          </div>

          <div className="relative z-20 hidden flex-shrink-0 items-center gap-2 xl:flex xl:gap-3.5">
            {loading ? (
              <div className="flex items-center gap-2 animate-pulse">
                <div className="h-8 w-14 rounded-full bg-zinc-100" />
                <div className="h-8 w-14 rounded-full bg-zinc-150" />
              </div>
            ) : !user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-bold text-zinc-300 transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white shadow-sm"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full border border-blue-500 bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-blue-500 shadow-sm"
                >
                  Signup
                </Link>
              </div>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 transition-all duration-200 hover:border-zinc-500 hover:text-white shadow-sm"
                      aria-label="Open profile menu"
                    >
                      <User size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-zinc-200 bg-white text-zinc-700">
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-50 focus:text-zinc-900 text-xs py-1.5">
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-50 focus:text-zinc-900 text-xs py-1.5">
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    {showDashboard && (
                      <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-50 focus:text-zinc-900 text-xs py-1.5">
                        <Link href={accountHref}>Account</Link>
                      </DropdownMenuItem>
                    )}
                    {showAdminOption && (
                      <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-50 focus:text-zinc-900 text-xs py-1.5">
                        <Link href="/mgmt/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-50 focus:text-zinc-900 text-xs py-1.5">
                      <Link href="/auth/change-password">Change Password</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-100" />
                    <DropdownMenuItem
                      className="cursor-pointer focus:bg-zinc-50 focus:text-zinc-900 text-xs py-1.5 text-red-600 focus:text-red-700"
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
                    className="relative flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 transition-all duration-200 hover:border-zinc-500 hover:text-white shadow-sm"
                    aria-label="Open cart"
                  >
                    <ShoppingCart size={20} />
                    {isHydrated && cartCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </CartSheet>

                <Link
                  href="/customised-setups"
                  onMouseMove={applyMagneticEffect}
                  onMouseLeave={resetMagneticEffect}
                  className="group relative rounded-xl border border-blue-600/30 bg-zinc-900 px-6 py-3 text-sm font-bold text-blue-400 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm"
                >
                  Get Quote
                </Link>
              </>
            )}
          </div>

          {/* Mobile: cart icon + hamburger */}
          <div className="flex items-center gap-2 xl:hidden">
            {!isB2BPath && (
              <CartSheet>
                <button
                  type="button"
                  className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white transition-colors shadow-sm"
                  aria-label="Open cart"
                >
                  <ShoppingCart size={20} />
                  {isHydrated && cartCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </CartSheet>
            )}
            <button
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors shadow-sm"
              onClick={() =>
                setMobileMenuOpen((open) => {
                  const next = !open;
                  if (!next) {
                    setMobileSubmenuOpen(null);
                  }
                  return next;
                })
              }
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`absolute left-0 top-full w-full border-t border-zinc-800 bg-zinc-950 xl:hidden transition-all duration-300
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
                        ? 'text-white font-bold bg-zinc-900'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    {item.name}
                    <ChevronRight
                      size={14}
                      className={`text-zinc-500 transition-transform ${mobileSubmenuOpen === item.name ? 'rotate-90' : ''}`}
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
                        className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                      >
                        All {item.name}
                        <ChevronRight size={12} className="text-zinc-600" />
                      </Link>
                    )}
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                      >
                        {child.name}
                        <ChevronRight size={12} className="text-zinc-600" />
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
                      ? 'text-white font-bold bg-zinc-900'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  {item.name}
                  <ChevronRight size={14} className="text-zinc-500" />
                </Link>
              )}
            </div>
          ))}
          {showDashboard && (
            <Link
              href={dashboardHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              Dashboard
              <ChevronRight size={14} className="text-zinc-500" />
            </Link>
          )}
          <Link
            href="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            Cart
            <ChevronRight size={14} className="text-zinc-500" />
          </Link>
          {loading ? (
            <div className="space-y-1.5 animate-pulse pt-2">
              <div className="h-8 w-full rounded-lg bg-zinc-900" />
              <div className="h-8 w-full rounded-lg bg-zinc-900" />
            </div>
          ) : !user ? (
            <div className="space-y-1.5 pt-2">
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[48px] items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Login
                <ChevronRight size={14} className="text-zinc-500" />
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[48px] items-center justify-between rounded-lg border border-blue-500/20 bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500 transition-colors"
              >
                Signup
                <ChevronRight size={14} className="text-white" />
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5 pt-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                Profile
                <ChevronRight size={14} className="text-zinc-500" />
              </Link>
              {showDashboard && (
                <Link
                  href={accountHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  Account
                  <ChevronRight size={14} className="text-zinc-500" />
                </Link>
              )}
              {showAdminOption && (
                <Link
                  href="/mgmt/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  Admin Panel
                  <ChevronRight size={14} className="text-zinc-500" />
                </Link>
              )}
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await handleLogout();
                }}
                className="flex min-h-[48px] w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Logout
                <ChevronRight size={14} className="text-zinc-500" />
              </button>
            </div>
          )}
          <div className="pt-3 border-t border-zinc-800">
            <Link
              href="/customised-setups"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full rounded-lg bg-blue-600 py-2.5 text-center text-xs font-bold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              Get Instant Quote
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
