'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Phone, Send, X, CheckCircle2 } from 'lucide-react';

import { Button, Input, Textarea, useToast } from '@tecbunny/ui';
import { useAnalytics, logger } from '@tecbunny/core';

import { useDeferredActivation } from '../../hooks/use-deferred-activation';

const CALL_HREF = 'tel:+919604136010';
const WHATSAPP_NUMBER = '919604136010';

// Pages where a lead-capture widget would distract from an in-flight conversion
// or account flow.
const HIDDEN_PATH_PREFIXES = ['/checkout', '/payment', '/auth', '/orders'];

interface PageContext {
  service?: string;
  context: string;
  pageType: string;
}

function titleCase(segment: string) {
  return segment
    .split(/[-_]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Maps the current pathname to a lead-capture context so the WhatsApp message,
 * enquiry subject, and stored origin all reflect the page the visitor is on.
 */
export function resolvePageContext(pathname: string): PageContext {
  const path = pathname.split('?')[0] || '/';

  const serviceMap: Record<string, string> = {
    '/services/cctv-security': 'Physical Security & CCTV',
    '/services/physical-security': 'Physical Security & CCTV',
    '/services/network-infrastructure': 'Network Infrastructure',
    '/services/smart-access-control': 'Smart Access Control',
    '/services/smart-infrastructure': 'Smart Infrastructure',
    '/services/lifecycle-hardware': 'IT Hardware & Workstations',
    '/services/software-system-admin': 'Software & Systems Administration',
  };
  for (const [prefix, service] of Object.entries(serviceMap)) {
    if (path.startsWith(prefix)) {
      return { service, context: service, pageType: 'service' };
    }
  }
  if (path.startsWith('/services')) {
    return { context: 'IT Services', pageType: 'service' };
  }

  if (path.startsWith('/industries/')) {
    const segment = path.split('/')[2] || '';
    const label = segment ? `${titleCase(segment)} Solutions` : 'Industry Solutions';
    return { service: label, context: label, pageType: 'industry' };
  }
  if (path.startsWith('/industries')) {
    return { context: 'Industry Solutions', pageType: 'industry' };
  }

  if (path.startsWith('/products/') || path.startsWith('/products') || path.startsWith('/shop')) {
    return { context: 'Product Enquiry', pageType: 'product' };
  }
  if (path.startsWith('/assessment')) {
    return { context: 'Free Technology Assessment', pageType: 'assessment' };
  }
  if (path.startsWith('/resources')) {
    return { context: 'Technical Resources', pageType: 'resource' };
  }
  if (path.startsWith('/projects') || path.startsWith('/portfolio')) {
    return { context: 'Project Reference', pageType: 'projects' };
  }
  if (path.startsWith('/blog')) {
    return { context: 'Blog & Guides', pageType: 'blog' };
  }
  if (path.startsWith('/webdev')) {
    return { context: 'Web Development', pageType: 'service' };
  }
  if (path.startsWith('/customised-setups')) {
    return { context: 'Customised Setups', pageType: 'service' };
  }

  return { context: 'General Enquiry', pageType: 'page' };
}

function buildWhatsAppUrl(context: PageContext, pageUrl: string) {
  const base = context.service
    ? `Hi TecBunny, I'm interested in *${context.service}*.`
    : `Hi TecBunny, I would like to discuss a technology requirement.`;
  const message = pageUrl ? `${base} (Page: ${pageUrl})` : base;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function WhatsAppGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em" {...props}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m.01 1.67c4.56 0 8.25 3.69 8.25 8.25 0 4.56-3.69 8.25-8.25 8.25-1.53 0-3-.42-4.29-1.19l-.3-.18-3.18.83.85-3.11-.2-.32a8.182 8.182 0 0 1-1.25-4.38c0-4.56 3.69-8.25 8.25-8.25" />
    </svg>
  );
}

export function QuickContactWidget() {
  const pathname = usePathname() || '/';
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const isActivated = useDeferredActivation({ timeout: 6000 });

  const [isOpen, setIsOpen] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [form, setForm] = React.useState({
    name: '',
    phone: '',
    email: '',
    requirement: '',
    // Honeypot: hidden from humans, must stay empty
    website: '',
    consent: false,
  });

  const context = React.useMemo(() => resolvePageContext(pathname), [pathname]);
  const isHidden = HIDDEN_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openDrawer = () => {
    setIsOpen(false);
    setIsDrawerOpen(true);
    try {
      trackEvent('quick_enquiry_opened', { page_type: context.pageType, origin_path: pathname });
    } catch {
      // Analytics must never block the UI
    }
  };

  const handleWhatsAppClick = () => {
    try {
      trackEvent('whatsapp_clicked', {
        context: 'quick_contact_widget',
        service: context.service || context.context,
        page_type: context.pageType,
      });
    } catch (err) {
      logger.error('WhatsApp click tracking failed', { error: err instanceof Error ? err.message : String(err) });
    }
  };

  const handleCallClick = () => {
    try {
      trackEvent('call_clicked', { context: 'quick_contact_widget', page_type: context.pageType });
    } catch {
      // Analytics must never block the call action
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please share your name and phone number so our team can reach you.',
      });
      return;
    }

    if (!form.consent) {
      toast({
        variant: 'destructive',
        title: 'Consent required',
        description: 'Please agree to be contacted regarding your enquiry.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const pageUrl = window.location.href;
      const searchParams = new URLSearchParams(window.location.search);
      const label = context.service || context.context;
      const requirement = form.requirement.trim() || 'Quick enquiry from the website contact widget.';

      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          subject: `Quick Enquiry - ${label}`,
          message: `${requirement}\n\nPage: ${pathname}\nURL: ${pageUrl}`,
          origin_path: pathname,
          form_identifier: 'quick_enquiry_widget',
          utm_source: searchParams.get('utm_source') ?? undefined,
          utm_medium: searchParams.get('utm_medium') ?? undefined,
          utm_campaign: searchParams.get('utm_campaign') ?? undefined,
          website: form.website,
          consent: form.consent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit enquiry.');
      }

      setIsSuccess(true);
      try {
        trackEvent('quick_enquiry_submitted', { page_type: context.pageType, origin_path: pathname });
      } catch {
        // Analytics must never block the UI
      }
      toast({
        title: 'Enquiry sent!',
        description: 'Our team will reach out to you shortly.',
      });
      setForm({ name: '', phone: '', email: '', requirement: '', website: '', consent: false });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: 'Could not send your enquiry. Please try WhatsApp or call us instead.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isActivated || isHidden) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-24 right-4 sm:right-6 z-40 flex flex-col items-end gap-2">
        {isOpen && (
          <div className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-md animate-fade-in">
            <a
              href={buildWhatsAppUrl(context, typeof window !== 'undefined' ? window.location.href : '')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-[#25D366] hover:bg-[#1fb857] transition-colors"
            >
              <WhatsAppGlyph className="h-4 w-4 fill-white" />
              WhatsApp us
            </a>
            <a
              href={CALL_HREF}
              onClick={handleCallClick}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-100 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors"
            >
              <Phone size={16} />
              Call +91 96041 36010
            </a>
            <button
              type="button"
              onClick={openDrawer}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-100 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors text-left"
            >
              <Send size={16} />
              Quick enquiry
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-950/30 transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/25 active:scale-95"
          aria-label={isOpen ? 'Close contact options' : 'Contact TecBunny Solutions'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </button>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Quick enquiry"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {isSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-lg font-bold text-white">Enquiry received</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Thanks! Our team will reach out within business hours.
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setIsSuccess(false); setIsDrawerOpen(false); }}
                  className="border-zinc-800 bg-zinc-900/30 text-white hover:bg-white/10"
                >
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Quick enquiry</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      {context.service ? `About: ${context.service}` : 'Tell us what you need and we will call you back.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-zinc-500 hover:text-zinc-300"
                    aria-label="Close quick enquiry"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="qc-name">
                    Name *
                  </label>
                  <Input
                    id="qc-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    disabled={isSubmitting}
                    className="bg-[#09090B] border-zinc-850 focus-visible:ring-emerald-500/40 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="qc-phone">
                    Phone / WhatsApp *
                  </label>
                  <Input
                    id="qc-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    required
                    disabled={isSubmitting}
                    className="bg-[#09090B] border-zinc-850 focus-visible:ring-emerald-500/40 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="qc-email">
                    Email (optional)
                  </label>
                  <Input
                    id="qc-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    className="bg-[#09090B] border-zinc-850 focus-visible:ring-emerald-500/40 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="qc-requirement">
                    What do you need? (optional)
                  </label>
                  <Textarea
                    id="qc-requirement"
                    name="requirement"
                    value={form.requirement}
                    onChange={handleChange}
                    placeholder="e.g. 8 CCTV cameras for a resort in Baga"
                    rows={2}
                    disabled={isSubmitting}
                    className="bg-[#09090B] border-zinc-850 focus-visible:ring-emerald-500/40 text-white"
                  />
                </div>

                {/* Honeypot: visually hidden, bots fill it, humans never see it */}
                <div className="absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
                  <label htmlFor="qc-website">Website</label>
                  <input
                    id="qc-website"
                    name="website"
                    type="text"
                    value={form.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={e => setForm(prev => ({ ...prev, consent: e.target.checked }))}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus:ring-emerald-500/40 accent-emerald-600"
                  />
                  <span className="text-xs text-zinc-400 leading-relaxed">
                    I agree that TecBunny Solutions may contact me via Phone, WhatsApp, or Email regarding this enquiry, as described in the{' '}
                    <Link href="/info/policies/privacy" target="_blank" className="text-emerald-400 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <span className="font-bold uppercase tracking-wider text-sm">Request Callback</span>
                      <Send size={16} />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
