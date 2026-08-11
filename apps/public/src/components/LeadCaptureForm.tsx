'use client';

import * as React from 'react';
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
      setForm({ name: '', company: '', email: '', phone: '', service: 'CCTV' });
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
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center space-y-4 max-w-xl mx-auto animate-fade-in">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 size={28} />
        </div>
        <h3 className="text-xl font-bold text-white font-tech">You&apos;re all set</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Check your email for the requested guide. Our team will reach out within 24 hours.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSuccess(false)}
          className="border-zinc-800 bg-zinc-900/30 text-white hover:bg-white/10"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto bg-zinc-950/40 p-8 rounded-2xl border border-zinc-900 backdrop-blur-sm"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="lc-name">
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
            className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="lc-company">
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
            className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="lc-email">
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
            className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="lc-phone">
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
            className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="lc-service">
          Service Needed *
        </label>
        <select
          id="lc-service"
          name="service"
          value={form.service}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full bg-[#09090B] border border-zinc-850 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
        >
          {SERVICE_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
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
