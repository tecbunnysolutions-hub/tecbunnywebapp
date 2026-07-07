"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useWarrantyTelemetry } from "@tecbunny/core/client";
import { ShieldCheck } from "lucide-react";
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
        return () => { };
    }, [activeEvent]);
    if (pathname?.startsWith('/mgmt') || pathname?.startsWith('/superadmin') || pathname?.startsWith('/staff')) {
        return null;
    }
    return (_jsx("div", { className: `fixed top-24 right-4 z-50 transition-all duration-700 transform ${visible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0 pointer-events-none"}`, children: _jsxs("div", { className: "bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-lg shadow-2xl flex items-start gap-3 w-[340px]", children: [_jsx("div", { className: "bg-green-500/20 p-2 rounded-full", children: _jsx(ShieldCheck, { className: "w-5 h-5 text-green-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-slate-200 text-sm font-medium leading-snug", children: "New enterprise system setup successfully authenticated and certified under active SLA." }), _jsx("p", { className: "text-green-400 text-xs mt-2 font-mono font-bold tracking-wider uppercase", children: activeEvent?.region })] })] }) }));
}
