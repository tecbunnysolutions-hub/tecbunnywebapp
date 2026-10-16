'use client';

import * as React from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea, useToast } from '@tecbunny/ui';

type StartingPrice = {
  id: string;
  service: string;
  label: string;
  amount: number;
  summary: string;
  href: string;
};

// Shown until an admin saves; mirrors the defaults in apps/public/src/content/pricing.ts.
const DEFAULT_PRICES: StartingPrice[] = [
  {
    id: 'cctv-4-camera',
    service: 'CCTV',
    label: '4-camera CCTV setup',
    amount: 19999,
    summary: '4 cameras, DVR, 500GB HDD, 100m cable, SMPS, connectors, adaptor, PVC boxes, 2U rack, screws and installation.',
    href: '/services/cctv-security',
  },
  {
    id: 'repair-visit',
    service: 'Repairs',
    label: 'Computer repair first visit',
    amount: 599,
    summary: 'We assess the device and explain the problem. The repair is charged separately; the visit charge is waived when the total hardware and service charge is more than Rs 1,499.',
    href: '/services/it-support',
  },
  {
    id: 'custom-computer',
    service: 'Computers',
    label: 'Custom-built computer',
    amount: 14999,
    summary: 'Built around the work you need it for, with the final configuration confirmed in a written quote.',
    href: '/services/it-support',
  },
  {
    id: 'laptop',
    service: 'Laptops',
    label: 'Laptops',
    amount: 24999,
    summary: 'Laptops matched to your budget and use, with setup help available.',
    href: '/services/it-support',
  },
];

export default function StartingPricesEditor() {
  const { toast } = useToast();
  const [prices, setPrices] = React.useState<StartingPrice[]>(DEFAULT_PRICES);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/settings?key=starting_prices');
        const result = await response.json();
        if (!cancelled && response.ok && Array.isArray(result.value) && result.value.length > 0) {
          setPrices(result.value);
        }
      } catch {
        // Keep defaults; saving still works.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const update = (id: string, patch: Partial<StartingPrice>) =>
    setPrices((current) => current.map((price) => (price.id === id ? { ...price, ...patch } : price)));

  const save = async () => {
    if (prices.some((price) => !(price.amount > 0) || !price.label.trim() || !price.summary.trim())) {
      toast({ variant: 'destructive', title: 'Check the prices', description: 'Every price needs a label, a summary and an amount above zero.' });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'starting_prices',
          value: prices,
          description: 'Public "from" prices shown on the homepage and service pages',
        }),
      });
      if (!response.ok) throw new Error('Failed to save prices');
      toast({ title: 'Prices saved', description: 'The website shows the new prices within a minute.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not save', description: error instanceof Error ? error.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Starting prices</h1>
        <p className="text-sm text-muted-foreground">The &quot;from&quot; prices shown on the homepage, the CCTV and IT support pages, and in search-result markup.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {prices.map((price) => (
          <Card key={price.id}>
            <CardHeader>
              <CardTitle className="text-base">{price.service}</CardTitle>
              <CardDescription>{price.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor={`${price.id}-label`}>Label</Label>
                <Input id={`${price.id}-label`} value={price.label} maxLength={120} disabled={loading} onChange={(event) => update(price.id, { label: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${price.id}-amount`}>Starting price (₹)</Label>
                <Input id={`${price.id}-amount`} type="number" min={1} step={1} value={price.amount || ''} disabled={loading} onChange={(event) => update(price.id, { amount: Number(event.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${price.id}-summary`}>What the price covers</Label>
                <Textarea id={`${price.id}-summary`} rows={4} value={price.summary} maxLength={400} disabled={loading} onChange={(event) => update(price.id, { summary: event.target.value })} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={save} disabled={loading || saving}>{saving ? 'Saving…' : 'Save prices'}</Button>
    </div>
  );
}
