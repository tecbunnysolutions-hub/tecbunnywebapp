'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, X, Sparkles, ArrowRight, ArrowUp } from 'lucide-react';

import { cn } from "@tecbunny/core/utils";

const EXCLUDED_PREFIXES = ['/auth', '/mgmt', '/checkout'];

export function FloatingAIAssistant() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = React.useState(false);
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isExcluded = EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isExcluded) return null;

  const getWhatsAppLink = () => {
    const baseText = "Hi TecBunny, ";
    let customText = "I have a question about your services.";

    if (pathname === '/') {
      customText = "I am on your homepage and would like to learn more about your custom tech solutions.";
    } else if (pathname.startsWith('/products/')) {
      customText = `I am looking at your product page (${pathname}) and wanted to inquire about bulk B2B pricing and availability.`;
    } else if (pathname === '/products') {
      customText = "I am browsing your product catalog and have a question about custom hardware options.";
    } else if (pathname.includes('/network-infrastructure')) {
      customText = "I am interested in your Network & Infrastructure Solutions for a home/office setup in Goa.";
    } else if (pathname.includes('/physical-security')) {
      customText = "I am looking at your Physical Security & Surveillance solutions for a villa/office perimeter in Goa.";
    } else if (pathname.includes('/smart-access-control')) {
      customText = "I am interested in your Smart Access Control & biometric lock installations for my premises.";
    } else if (pathname.includes('/lifecycle-hardware')) {
      customText = "I would like to inquire about your Lifecycle Hardware and IT AMC support programs.";
    } else if (pathname.includes('/software-system-admin')) {
      customText = "I need information regarding your software administration and custom system provisioning.";
    } else if (pathname === '/customised-setups') {
      customText = "I am using your Custom Setup Configurator and would like a direct quotation on my designs.";
    } else if (pathname === '/portfolio') {
      customText = "I just reviewed your project portfolio case studies and would like to discuss a similar deployment.";
    } else if (pathname === '/contact') {
      customText = "I am on your contact page and would like to schedule an on-site technical survey.";
    }

    return `https://wa.me/919604136010?text=${encodeURIComponent(baseText + customText)}`;
  };

  const aiHref = '/ai-research';

  return (
    <div className="floating-ai-anchor fixed bottom-6 right-4 z-50 sm:right-6 flex flex-col gap-4 items-end">
      {open && (
        <div className="mb-1 w-[290px] rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Assistant</p>
                <p className="text-xs text-muted-foreground">Ask anything about products.</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close AI assistant"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground transition hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <Link
              href={aiHref}
              className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary/50 hover:bg-primary/20"
              onClick={() => setOpen(false)}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Start AI Research
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-[11px] text-muted-foreground">
              Need pricing? Share your requirements and get recommendations.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            type="button"
            aria-label="Scroll to top"
            onClick={scrollToTop}
            className="group flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 shadow-lg backdrop-blur transition hover:bg-zinc-700 hover:text-white hover:scale-105 border border-zinc-700/50"
          >
            <ArrowUp className="h-6 w-6 transition-transform group-hover:-translate-y-1" />
          </button>
        )}

        {/* WhatsApp Button */}
        <Link
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="group flex h-14 w-14 items-center justify-center rounded-full shadow-[0_0_25px_rgba(37,211,102,0.45)] transition hover:shadow-[0_0_35px_rgba(37,211,102,0.65)] hover:scale-105"
        >
          <img src="/whatsapp.svg" alt="WhatsApp" className="h-[52px] w-[52px] transition-transform group-hover:scale-110 drop-shadow-md" />
        </Link>

        {/* AI Bot Button */}
        <button
          type="button"
          aria-label="Open AI assistant"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'group flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/60 to-primary text-white shadow-[0_0_25px_rgba(37,99,235,0.45)] transition hover:shadow-[0_0_35px_rgba(37,99,235,0.65)]',
            open && 'ring-2 ring-primary/60'
          )}
        >
          <Bot className="h-6 w-6 transition-transform group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}
