"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export function ViralWarrantyModal({ phone, serialNumber }) {
    const [claimed, setClaimed] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const handleViralShare = async () => {
        const text = encodeURIComponent(`I just secured my corporate infrastructure with TecBunny. 100% verified setup.\n\nCheck them out: https://tecbunny.com?ref=${serialNumber}`);
        window.open(`https://wa.me/?text=${text}`, "_blank");
        setSubmitting(true);
        setError(null);
        try {
            const response = await fetch("/api/promotions/claim-viral", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, serialNumber, action: "WHATSAPP_SHARE" }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data?.error || "Could not unlock credit");
            }
            setClaimed(true);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Could not unlock credit");
        }
        finally {
            setSubmitting(false);
        }
    };
    if (claimed) {
        return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-in fade-in duration-500 p-4", children: _jsxs("div", { className: "bg-card border border-border p-8 rounded-xl text-center max-w-md w-full shadow-2xl", children: [_jsx("h2", { className: "text-2xl font-black text-primary mb-2", children: "\u20B9500 CREDIT UNLOCKED" }), _jsxs("p", { className: "text-muted-foreground font-mono text-sm", children: ["Coupon Code: TB-VRL-", serialNumber.substring(0, 4)] })] }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-in zoom-in-95 duration-500 p-4", children: _jsxs("div", { className: "bg-card border border-border p-6 sm:p-8 rounded-xl max-w-md w-full shadow-2xl", children: [_jsx("div", { className: "inline-block bg-primary/10 text-primary px-3 py-1 font-black text-xs tracking-widest rounded-full mb-4", children: "ACTION REQUIRED" }), _jsx("h2", { className: "text-2xl sm:text-3xl font-black text-foreground mb-4 leading-tight", children: "Claim Your \u20B9500 System Upgrade Credit" }), _jsx("p", { className: "text-muted-foreground mb-6 text-sm", children: "Your hardware is secured. Share your verified setup status with your network to instantly unlock \u20B9500 towards your next security grid addition." }), error && _jsx("p", { className: "mb-4 text-sm text-rose-500", children: error }), _jsx("button", { onClick: handleViralShare, disabled: submitting, className: "w-full bg-[#25D366] hover:bg-[#1ebd5a] disabled:opacity-60 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] min-h-[48px]", children: submitting ? "UNLOCKING..." : "SHARE TO UNLOCK VIA WHATSAPP" })] }) }));
}
