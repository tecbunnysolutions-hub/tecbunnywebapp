'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Activity } from 'lucide-react';
import { cn } from "@tecbunny/core/utils";

interface RegionalTrustBannerProps {
  className?: string;
  partnerBrands?: Array<{ name: string; logoUrl?: string }>;
}

const formatBrandList = (brands: Array<{ name: string; logoUrl?: string }> | undefined) => {
  const names = (brands ?? [])
    .map((brand) => brand.name.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (names.length === 0) {
    return 'trusted technology brands';
  }

  if (names.length === 1) {
    return names[0];
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }

  return `${names[0]}, ${names[1]}, and ${names[2]}`;
};

export const RegionalTrustBanner = ({ className, partnerBrands }: RegionalTrustBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const brandList = formatBrandList(partnerBrands);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!isVisible) return null;
  
  // Guard admin and management dashboards
  if (pathname?.startsWith('/mgmt') || pathname?.startsWith('/superadmin') || pathname?.startsWith('/staff')) {
    return null;
  }

  return (
    <div className={cn(
      "relative overflow-hidden bg-slate-900/40 border-y border-white/5 py-3 px-4",
      className
    )}>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-300">
            Authorized partner for {brandList} installations across Goa and Maharashtra.
          </p>
        </div>
        
        <div className="flex items-center gap-6 text-xs text-slate-400 uppercase tracking-widest font-semibold">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dedicated Support</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-blue-400" />
            <span>On-site SLA Cover</span>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Mesh */}
      <div className="absolute top-0 right-0 -z-10 h-full w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent blur-3xl" />
    </div>
  );
};
