"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@tecbunny/ui";
import { Input } from "@tecbunny/ui";
import { Label } from "@tecbunny/ui";

export function QuotationStatusLookup() {
  const router = useRouter();
  const [quoteNumberInput, setQuoteNumberInput] = React.useState('');
  const [lookupLoading, setLookupLoading] = React.useState(false);
  const [lookupError, setLookupError] = React.useState('');

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputVal = quoteNumberInput.trim();
    if (!inputVal) return;

    setLookupLoading(true);
    setLookupError('');
    const actionToken = new URLSearchParams(window.location.search).get('token') || '';

    const tokenQuery = actionToken ? `?token=${encodeURIComponent(actionToken)}` : '';
    fetch(`/api/quotes/${encodeURIComponent(inputVal)}${tokenQuery}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(String(res.status));
        const quoteQuery = new URLSearchParams();
        if (actionToken) quoteQuery.set('token', actionToken);
        const query = quoteQuery.toString();
        router.push(`/quotes/${encodeURIComponent(inputVal)}${query ? `?${query}` : ''}`);
      })
      .catch((error: Error) => {
        setLookupError(error.message === '401'
          ? 'Sign in to view your quote, or use the secure quote link sent to your email.'
          : error.message === '403'
            ? 'This quote belongs to another account. Use the secure link sent to your email.'
            : error.message === '404'
              ? 'Quote not found. Check the quote number and try again.'
              : 'Unable to check this quote right now. Please try again.');
        setLookupLoading(false);
      });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm text-primary font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse text-primary-foreground" />
              Check Quotation Status
            </p>
            <p className="text-xs text-muted-foreground">Track revisions, approval, or proceed with payment.</p>
          </div>
        </div>
        <form onSubmit={handleLookupSubmit} className="space-y-3 mt-4">
          <div className="space-y-1">
            <Label htmlFor="lookup-quote-number">Quote Number or ID</Label>
            <div className="flex gap-2">
              <Input
                id="lookup-quote-number"
                type="text"
                placeholder="e.g. 20260600001"
                value={quoteNumberInput}
                onChange={(e) => {
                  setQuoteNumberInput(e.target.value);
                  setLookupError('');
                }}
                disabled={lookupLoading}
                className="flex-1 bg-muted/10 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                disabled={lookupLoading || !quoteNumberInput.trim()}
                className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition shrink-0"
              >
                {lookupLoading ? 'Checking...' : 'Track'}
              </Button>
            </div>
          </div>
        </form>
      </div>
      {lookupError && (
        <p className="text-xs text-destructive mt-2">{lookupError}</p>
      )}
    </div>
  );
}
