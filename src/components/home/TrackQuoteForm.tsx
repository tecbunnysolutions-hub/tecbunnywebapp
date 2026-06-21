'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export function TrackQuoteForm() {
  const router = useRouter();
  const [quoteNumberInput, setQuoteNumberInput] = React.useState('');
  const [lookupLoading, setLookupLoading] = React.useState(false);
  const [lookupError, setLookupError] = React.useState('');
  const [isPending, startTransition] = React.useTransition();

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputVal = quoteNumberInput.trim();
    if (!inputVal) return;
    
    setLookupLoading(true);
    setLookupError('');
    
    fetch(`/api/quotes/${inputVal}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Quote not found');
        }
        startTransition(() => {
          router.push(`/quotes/${inputVal}`);
        });
      })
      .catch(() => {
        setLookupError('Invalid quote number or quote not found.');
        setLookupLoading(false);
      });
  };

  return (
    <div className="tb-panel relative p-6 sm:p-8">
      <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-zinc-500">tecbunny_negotiation_v2.0</div>
      <h3 className="text-lg font-bold text-white font-tech tracking-wider uppercase mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        Track Active Negotiation
      </h3>
      <p className="text-xs text-zinc-400 mb-6">
        Already submitted a counter-offer? Enter your YYYYMMXXXXX quote ID to track engineers' review status, download revised PDFs, or make your payment.
      </p>

      <form onSubmit={handleLookupSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="homepage-quote-id" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Quote / Negotiation ID
          </label>
          <input
            id="homepage-quote-id"
            type="text"
            placeholder="e.g. 20260600001"
            value={quoteNumberInput}
            onChange={(e) => {
              setQuoteNumberInput(e.target.value);
              setLookupError('');
            }}
            className="min-h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-base text-white placeholder:text-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            disabled={lookupLoading || isPending}
          />
        </div>

        <button
          type="submit"
          disabled={lookupLoading || isPending || !quoteNumberInput.trim()}
          className="tb-button-primary w-full disabled:opacity-50"
        >
          {lookupLoading || isPending ? 'Validating ID...' : 'Check Status & Pay'}
          <ArrowRight size={14} />
        </button>
      </form>

      {lookupError && (
        <div className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 text-center animate-fade-in">
          {lookupError}
        </div>
      )}

      <div className="mt-6 border-t border-zinc-800 pt-6 flex items-center justify-between text-xs text-zinc-500">
        <span>Average engineering response time:</span>
        <span className="text-blue-500 font-semibold">&lt; 15 mins</span>
      </div>
    </div>
  );
}
