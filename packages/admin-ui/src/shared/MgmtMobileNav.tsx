'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from "@tecbunny/core/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@tecbunny/ui";

export type MgmtNavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
  exact?: boolean;
};

export type MgmtNavSection = {
  title?: string;
  items: MgmtNavItem[];
};

interface MgmtMobileNavProps {
  title: string;
  sections: MgmtNavSection[];
}

export function MgmtMobileNav({ title, sections }: MgmtMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border/10 bg-card/95 px-4 backdrop-blur sm:hidden">
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/10 text-muted-foreground"
            aria-label="Open navigation menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] border-border/10 bg-card p-0 text-muted-foreground">
          <SheetHeader className="border-b border-border/10 px-4 py-4 text-left">
            <SheetTitle className="text-foreground">{title}</SheetTitle>
          </SheetHeader>
          <nav className="max-h-[calc(100vh-5rem)] overflow-y-auto p-3">
            {sections.map((section) => (
              <div key={section.title || section.items[0]?.href} className="mb-4 last:mb-0">
                {section.title ? (
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {section.title}
                  </p>
                ) : null}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          active
                            ? 'bg-card/10 text-foreground border border-border/10'
                            : 'text-muted-foreground hover:bg-card/5 hover:text-foreground'
                        )}
                      >
                        {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
