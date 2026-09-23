"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

interface TelemetryEvent {
  id: string;
  region: string;
  timestamp: number;
}

const REGIONS = ["North Goa Sector", "Panjim District", "Mapusa Hub", "South Goa Network"];

function useWarrantyTelemetry() {
  const [activeEvent, setActiveEvent] = useState<TelemetryEvent | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveEvent({
        id: Math.random().toString(36).substring(7),
        region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
        timestamp: Date.now(),
      });
    }, 12_000);

    return () => window.clearInterval(interval);
  }, []);

  return { activeEvent };
}

export function WarrantyTelemetryBadge() {
  const { activeEvent } = useWarrantyTelemetry();
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (activeEvent) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [activeEvent]);

  if (pathname?.startsWith('/mgmt') || pathname?.startsWith('/superadmin') || pathname?.startsWith('/staff')) {
    return null;
  }

  return (
    <div className={`fixed top-24 right-4 z-50 transition-all duration-700 transform ${visible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0 pointer-events-none"}`}>
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-lg shadow-2xl flex items-start gap-3 w-[340px]">
        <div className="bg-green-500/20 p-2 rounded-full">
          <ShieldCheck className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <p className="text-slate-200 text-sm font-medium leading-snug">
            New enterprise system setup successfully authenticated and certified under active SLA.
          </p>
          <p className="text-green-400 text-xs mt-2 font-mono font-bold tracking-wider uppercase">
            {activeEvent?.region}
          </p>
        </div>
      </div>
    </div>
  );
}
