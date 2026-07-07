'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Zap, Check, Loader } from 'lucide-react';
import { Badge } from './badge';
export function FreeInstallationOfferBanner({ installationPrice = 0, isEligible = true, variant = 'inline' }) {
    const [slotsRemaining, setSlotsRemaining] = useState(null);
    const [confirmedCount, setConfirmedCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const maxFreeInstallationValue = 2499;
    const isFreeEligible = isEligible && installationPrice > 0 && installationPrice <= maxFreeInstallationValue;
    useEffect(() => {
        const fetchSlots = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/free-installation-slots');
                const data = await response.json();
                if (data.success) {
                    setSlotsRemaining(data.remainingSlots);
                    setConfirmedCount(data.confirmedCount);
                }
                else {
                    // Fallback to default value
                    setSlotsRemaining(10);
                }
            }
            catch (error) {
                console.error('Error fetching free installation slots:', error);
                setSlotsRemaining(10); // Fallback
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchSlots();
        // Refresh every 5 minutes to show updated slot count
        const interval = setInterval(fetchSlots, 300000);
        return () => clearInterval(interval);
    }, []);
    if (variant === 'card') {
        return (_jsx("div", { className: `rounded-lg border p-4 ${isFreeEligible
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-slate-500/30 bg-slate-500/10'}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `mt-1 ${isFreeEligible ? 'text-emerald-400' : 'text-slate-400'}`, children: isFreeEligible ? _jsx(Check, { className: "h-5 w-5" }) : _jsx(Zap, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold text-white", children: isFreeEligible ? '✓ Free Installation Eligible' : 'Installation Offer' }), _jsx("p", { className: `text-sm mt-1 ${isFreeEligible ? 'text-emerald-200' : 'text-slate-300'}`, children: isFreeEligible ? (_jsxs(_Fragment, { children: ["Your installation (\u20B9", Math.round(installationPrice).toLocaleString(), ") qualifies for our ", _jsx("strong", { children: "FREE installation offer" }), " (up to \u20B92,499/-).", _jsx("strong", { className: "ml-1", children: isLoading ? (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Loader, { className: "h-3 w-3 animate-spin" }), " Loading..."] })) : (_jsxs(_Fragment, { children: [slotsRemaining, " confirmed installations so far this month"] })) })] })) : (_jsxs(_Fragment, { children: ["Free installation available for setups up to \u20B92,499/-. Your installation: \u20B9", Math.round(installationPrice).toLocaleString()] })) })] })] }) }));
    }
    return (_jsxs("div", { className: `flex items-center justify-between rounded-md p-3 text-sm ${isFreeEligible
            ? 'border border-emerald-500/30 bg-emerald-500/10'
            : 'border border-slate-500/30 bg-slate-500/10'}`, children: [_jsx("div", { className: "flex items-center gap-2", children: isFreeEligible ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "h-4 w-4 text-emerald-400" }), _jsxs("span", { className: "text-emerald-200", children: [_jsx("strong", { children: "Free Installation" }), " \u2022 ", isLoading ? 'Loading...' : `${slotsRemaining} confirmed`] })] })) : (_jsxs(_Fragment, { children: [_jsx(Zap, { className: "h-4 w-4 text-slate-400" }), _jsxs("span", { className: "text-slate-300", children: ["Free installation up to \u20B92,499/- \u2022 Your setup: \u20B9", Math.round(installationPrice).toLocaleString()] })] })) }), isFreeEligible && !isLoading && (_jsx(Badge, { className: "bg-emerald-600 text-white hover:bg-emerald-700", children: "OFFER ACTIVE" }))] }));
}
