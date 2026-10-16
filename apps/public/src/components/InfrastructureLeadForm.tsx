'use client';

import * as React from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@tecbunny/ui";
import { Input } from "@tecbunny/ui";
import { Textarea } from "@tecbunny/ui";
import { useToast } from "@tecbunny/ui";

export function InfrastructureLeadForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'All-in-One Integration',
    message: '',
    // Honeypot: hidden from humans, must stay empty
    website: '',
    consent: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in name, email, phone, and project details.',
      });
      return;
    }

    if (!form.consent) {
      toast({
        variant: 'destructive',
        title: 'Consent required',
        description: 'Please agree to be contacted regarding your project enquiry.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedMessage = `
Company / Property: ${form.company || 'Not Provided'}
Requested Service: ${form.service}

Project Details:
${form.message}
      `.trim();

      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company_name: form.company.trim(),
          subject: `Smart Infrastructure Lead - ${form.service}`,
          message: formattedMessage,
          origin_path: '/services/smart-infrastructure',
          form_identifier: 'smart_infrastructure_proposal',
          website: form.website,
          consent: form.consent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry.');
      }

      setIsSuccess(true);
      toast({
        title: 'Proposal Request Received!',
        description: "Our enterprise engineering team will get back to you within 24 hours.",
      });
      
      setForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: 'All-in-One Integration',
        message: '',
        website: '',
        consent: false,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: 'Could not send proposal request. Please try again.',
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
        <h3 className="text-xl font-bold text-white font-tech">Lead Registered Successfully</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Thanks for reaching out! Our systems architect is reviewing your property setup and will connect with you on WhatsApp / Email shortly.
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-zinc-950/40 p-8 rounded-2xl border border-zinc-900 backdrop-blur-sm">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Name Column */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="lead-name">
            Contact Name *
          </label>
          <Input
            id="lead-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            disabled={isSubmitting}
            className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white"
          />
        </div>

        {/* Company/Property Column */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="lead-company">
            Property / Company Name
          </label>
          <Input
            id="lead-company"
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="e.g. Grand Resort Goa"
            disabled={isSubmitting}
            className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white"
          />
        </div>

        {/* Email Column */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="lead-email">
            Email Address *
          </label>
          <Input
            id="lead-email"
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

        {/* Phone Column */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="lead-phone">
            Mobile / WhatsApp *
          </label>
          <Input
            id="lead-phone"
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

      {/* Service Type Select Column */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="lead-service">
          Primary Service Interest
        </label>
        <select
          id="lead-service"
          name="service"
          value={form.service}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full bg-[#09090B] border border-zinc-850 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
        >
          <option value="All-in-One Integration">Complete Infrastructure (All-in-One Integration)</option>
          <option value="CCTV Elite Projects">CCTV Elite Projects & AI Surveillance</option>
          <option value="Hotel RFID Locks & Access Systems">Hotel RFID Locks & Access Systems</option>
          <option value="Smart Lights & Automation Projects">Smart Lights & Automation Projects</option>
          <option value="IT Services & Network Infrastructure">IT Services & Network Infrastructure</option>
        </select>
      </div>

      {/* Message Column */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="lead-message">
          Project Requirements & Details *
        </label>
        <Textarea
          id="lead-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Describe your property layout, number of rooms, or construction timeline..."
          required
          rows={5}
          disabled={isSubmitting}
          className="bg-[#09090B] border-zinc-850 focus-visible:ring-blue-500/40 text-white"
        />
      </div>

      {/* Honeypot: visually hidden, bots fill it, humans never see it */}
      <div className="absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor="lead-website">Website</label>
        <input
          id="lead-website"
          name="website"
          type="text"
          value={form.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-4">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm(prev => ({ ...prev, consent: e.target.checked }))}
            disabled={isSubmitting}
            className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500/40 accent-blue-600"
          />
          <span className="text-xs text-zinc-400 leading-relaxed">
            I agree that TecBunny Solutions may contact me via WhatsApp / Phone or Email regarding my enterprise project enquiry, as described in the{' '}
            <a href="/info/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Privacy Policy
            </a>.
          </span>
        </label>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
      >
        {isSubmitting ? 'Submitting Details...' : <><span className="font-tech font-bold uppercase tracking-wider">Request Proposal</span><Send size={16} /></>}
      </Button>
    </form>
  );
}
