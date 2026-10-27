'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@tecbunny/ui';

interface SiteVisitButtonProps { service: string; className?: string; label?: string; }
const emptyForm = { name: '', phone: '', email: '', address: '', preferredDate: '', message: '', website: '' };

export function SiteVisitButton({ service, className, label = 'Book a site visit' }: SiteVisitButtonProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const update = (key: keyof typeof emptyForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(previous => ({ ...previous, [key]: event.target.value }));
  const close = () => { setOpen(false); if (status === 'done') { setForm(emptyForm); setStatus('idle'); } };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setStatus('sending'); setError('');
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, email: form.email || undefined, type: 'site_visit', service }) });
      if (response.ok) { setStatus('done'); return; }
      const data = await response.json().catch(() => ({}));
      setError(data?.error || 'We couldn’t send your request. Please try again, or contact us on WhatsApp.'); setStatus('error');
    } catch { setError('We couldn’t connect. Check your connection and try again, or contact us on WhatsApp.'); setStatus('error'); }
  };
  const input = 'mt-1.5 min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground focus-visible:ring-2 focus-visible:ring-ring';
  return <Dialog open={open} onOpenChange={next => next ? setOpen(true) : close()}>
    <DialogTrigger asChild><button type="button" className={className}><Phone size={17} aria-hidden="true" /> {label}</button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border-border bg-card p-6 text-foreground">
      <DialogTitle className="pr-8 text-xl">Book a site visit</DialogTitle>
      <DialogDescription>Tell us about your {service.toLowerCase()} requirement. We’ll contact you to confirm the visit time.</DialogDescription>
      {status === 'done' ? <div className="space-y-4"><p role="status" className="text-muted-foreground">Thanks — your request has been received. We’ll call you to confirm the details.</p><button type="button" onClick={close} className="tb-button">Done</button></div> :
        <form onSubmit={submit} className="space-y-4" aria-busy={status === 'sending'}>
          <label className="block text-sm font-medium">Your name <span className="text-muted-foreground">(required)</span><input className={input} autoComplete="name" required maxLength={120} value={form.name} onChange={update('name')} /></label>
          <label className="block text-sm font-medium">Phone or WhatsApp <span className="text-muted-foreground">(required)</span><input className={input} autoComplete="tel" required type="tel" maxLength={16} value={form.phone} onChange={update('phone')} /></label>
          <label className="block text-sm font-medium">Email <span className="text-muted-foreground">(optional)</span><input className={input} autoComplete="email" type="email" maxLength={160} value={form.email} onChange={update('email')} /></label>
          <label className="block text-sm font-medium">Address or area <span className="text-muted-foreground">(required)</span><input className={input} autoComplete="street-address" required maxLength={300} value={form.address} onChange={update('address')} /></label>
          <label className="block text-sm font-medium">Preferred date and time <span className="text-muted-foreground">(optional)</span><input className={input} maxLength={80} placeholder="For example, Saturday morning" value={form.preferredDate} onChange={update('preferredDate')} /></label>
          <label className="block text-sm font-medium">What would you like help with? <span className="text-muted-foreground">(optional)</span><textarea className={input} rows={3} maxLength={1000} value={form.message} onChange={update('message')} /></label>
          <input className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={update('website')} />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={status === 'sending'} className="tb-button w-full disabled:opacity-60">{status === 'sending' ? 'Sending your request…' : 'Request a site visit'}</button>
        </form>}
    </DialogContent>
  </Dialog>;
}
