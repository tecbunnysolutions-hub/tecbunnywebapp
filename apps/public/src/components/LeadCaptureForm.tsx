'use client';

import * as React from 'react';
import Link from 'next/link';
import { Send, CheckCircle2 } from 'lucide-react';
import { Button, Input, useToast } from '@tecbunny/ui';

const SERVICE_OPTIONS = ['CCTV', 'Networking', 'Smart Automation'] as const;
type ServiceOption = (typeof SERVICE_OPTIONS)[number];

export function LeadCaptureForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [form, setForm] = React.useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: 'CCTV' as ServiceOption,
    // Honeypot: hidden from humans, must stay empty
    website: '',
    consent: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.company || !form.email || !form.phone) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in your name, company, email, and phone.',
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
      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company_name: form.company.trim(),
          subject: `Lead Capture - ${form.service}`,
          message: `Requested service: ${form.service} for ${form.company.trim()}.`,
          service_interest: form.service,
          origin_path: '/lead-capture',
          form_identifier: 'lead_capture_webhook',
          website: form.website,
          consent: form.consent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit lead.');
      }

      setIsSuccess(true);
      toast({
        title: 'Request received!',
        description: 'Your technical guide is on its way to your inbox.',
      });
      setForm({ name: '', company: '', email: '', phone: '', service: 'CCTV', website: '', consent: false });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: 'Could not send your request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-success/20 bg-success/5 p-8 text-center space-y-4 max-w-xl mx-auto animate-fade-in">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={28} />
        </div>
        <h3 className="text-xl font-bold text-foreground font-tech">You&apos;re all set</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Check your email for the requested guide. Our team will reach out within 24 hours.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSuccess(false)}
          className="border-border bg-card/30 text-foreground hover:bg-card/10"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto bg-background/40 p-8 rounded-2xl border border-border backdrop-blur-sm"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="lc-name">
            Name *
          </label>
          <Input
            id="lc-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            disabled={isSubmitting}
            className="bg-card border-border focus-visible:ring-primary/40 text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="lc-company">
            Hotel / Company Name *
          </label>
          <Input
            id="lc-company"
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="e.g. Grand Resort Goa"
            required
            disabled={isSubmitting}
            className="bg-card border-border focus-visible:ring-primary/40 text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="lc-email">
            Email *
          </label>
          <Input
            id="lc-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@resort.com"
            required
            disabled={isSubmitting}
            className="bg-card border-border focus-visible:ring-primary/40 text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="lc-phone">
            Phone *
          </label>
          <Input
            id="lc-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. +91 98765 43210"
            required
            disabled={isSubmitting}
            className="bg-card border-border focus-visible:ring-primary/40 text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="lc-service">
          Service Needed *
        </label>
        <select
          id="lc-service"
          name="service"
          value={form.service}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
        >
          {SERVICE_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Honeypot: visually hidden, bots fill it, humans never see it */}
      <div className="absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor="lc-website">Website</label>
        <input
          id="lc-website"
          name="website"
          type="text"
          value={form.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="rounded-xl border border-border bg-card/30 p-4">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm(prev => ({ ...prev, consent: e.target.checked }))}
            disabled={isSubmitting}
            className="mt-1 h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary/40 accent-blue-600"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            I agree that TecBunny Solutions may contact me via Phone, WhatsApp, or Email regarding this enquiry, as described in the{' '}
            <Link href="/info/policies/privacy" target="_blank" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary text-primary-foreground font-bold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
      >
        {isSubmitting ? (
          'Submitting...'
        ) : (
          <>
            <span className="font-tech font-bold uppercase tracking-wider">Get My Free Guide</span>
            <Send size={16} />
          </>
        )}
      </Button>
    </form>
  );
}
