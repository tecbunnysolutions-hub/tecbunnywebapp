'use client';

import { useState } from 'react';
import { Phone, X } from 'lucide-react';

interface SiteVisitButtonProps {
  service: string;
  className?: string;
  label?: string;
}

const emptyForm = { name: '', phone: '', email: '', address: '', preferredDate: '', message: '', website: '' };

export function SiteVisitButton({ service, className, label = 'Book a site visit' }: SiteVisitButtonProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const update = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const close = () => {
    setOpen(false);
    if (status === 'done') {
      setForm(emptyForm);
      setStatus('idle');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email: form.email || undefined, type: 'site_visit', service }),
      });
      if (res.ok) {
        setStatus('done');
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Could not submit. Please try again or WhatsApp us.');
      setStatus('error');
    } catch {
      setError('Network error. Please try again or WhatsApp us.');
      setStatus('error');
    }
  };

  const input = 'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none';

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Phone size={17} /> {label}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Book a site visit"
          onClick={close}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold">Book a site visit</h2>
              <button type="button" onClick={close} aria-label="Close" className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            {status === 'done' ? (
              <div className="mt-5 space-y-4">
                <p className="text-zinc-300">Thanks! We received your request and will call you to confirm the visit time.</p>
                <button type="button" onClick={close} className="rounded-xl bg-blue-600 px-5 py-2 font-bold hover:bg-blue-500">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-3">
                <input className={input} placeholder="Your name *" required maxLength={120} value={form.name} onChange={update('name')} />
                <input className={input} placeholder="Phone / WhatsApp *" required type="tel" maxLength={16} value={form.phone} onChange={update('phone')} />
                <input className={input} placeholder="Email (optional)" type="email" maxLength={160} value={form.email} onChange={update('email')} />
                <input className={input} placeholder="Address / area *" required maxLength={300} value={form.address} onChange={update('address')} />
                <input className={input} placeholder="Preferred date & time" maxLength={80} value={form.preferredDate} onChange={update('preferredDate')} />
                <textarea className={input} placeholder="What do you need? (optional)" rows={3} maxLength={1000} value={form.message} onChange={update('message')} />
                <input className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={update('website')} />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500 disabled:opacity-60"
                >
                  {status === 'sending' ? 'Sending…' : 'Request site visit'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
