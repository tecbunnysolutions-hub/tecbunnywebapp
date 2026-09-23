'use client';

import * as React from 'react';
import Link from 'next/link';

type AffiliateProfile = { id: string; agent_id: string; tier: string; status: string; platinum_status: string; platinum_ends_at?: string | null };
type Ledger = { id: string; affiliate_profile_id: string; payout_type: string; commission_amount: number; payable_on: string; status: string };
type Data = { profiles: AffiliateProfile[]; agents: { id: string; referral_code: string; status: string }[]; products: { id: string; name: string }[]; productRules: { id: string; product_id: string; commission_eligible: boolean; products?: { name?: string } | null }[]; ledger: Ledger[]; investments: { affiliate_profile_id: string; amount: number; status: string }[]; summary: { scheduled: number; paid: number; total: number } };

const currency = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function AffiliateProgramPage() {
  const [data, setData] = React.useState<Data | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    const response = await fetch('/api/admin/affiliate-program');
    const body = await response.json();
    if (!response.ok) setMessage(body.error || 'Unable to load the affiliate programme.');
    else setData(body);
    setLoading(false);
  }, []);

  React.useEffect(() => { void refresh(); }, [refresh]);

  async function submit(event: React.FormEvent<HTMLFormElement>, action: string) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const body = Object.fromEntries(fields.entries()) as Record<string, unknown>;
    body.action = action;
    if ('platinumStatus' in body) body.platinumStatus = body.platinumStatus === 'active';
    if ('commissionEligible' in body) body.commissionEligible = body.commissionEligible === 'true';
    if ('priceIncreaseApproved' in body) body.priceIncreaseApproved = body.priceIncreaseApproved === 'on';
    const response = await fetch('/api/admin/affiliate-program', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    setMessage(response.ok ? 'Saved.' : (result.error || 'Unable to save.'));
    if (response.ok) { event.currentTarget.reset(); await refresh(); }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Partner operations</p>
          <h1 className="mt-2 text-3xl font-bold">Affiliate programme</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Manage affiliate enrollment, tier limits, Platinum deposits, commission-free products, settlement calculations, and payout reporting.</p>
        </div>
        <Link className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted" href="/mgmt/admin/sales-agents">Sales agent applications</Link>
      </header>

      {message && <p className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm">{message}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Scheduled payouts', data?.summary.scheduled ?? 0],
          ['Paid payouts', data?.summary.paid ?? 0],
          ['Programme earnings', data?.summary.total ?? 0],
        ].map(([label, value]) => <div key={String(label)} className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{currency(Number(value))}</p></div>)}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-3 rounded-xl border bg-card p-5" onSubmit={(event) => submit(event, 'configure-affiliate')}>
          <div><h2 className="font-semibold">Register or configure an affiliate</h2><p className="text-sm text-muted-foreground">Free Bronze, Silver and Gold categories; Platinum requires its recorded refundable deposit.</p></div>
          <select required name="agentId" className="w-full rounded-md border bg-background p-2"><option value="">Select approved sales agent</option>{data?.agents.filter((agent) => agent.status === 'approved').map((agent) => <option key={agent.id} value={agent.id}>{agent.referral_code} · {agent.id.slice(0, 8)}</option>)}</select>
          <div className="grid grid-cols-2 gap-3"><select name="tier" className="rounded-md border bg-background p-2"><option value="bronze">Bronze · 5% · ₹2L limit</option><option value="silver">Silver · 7% · ₹5L limit</option><option value="gold">Gold · 10% · ₹20L limit</option></select><select name="status" className="rounded-md border bg-background p-2"><option value="approved">Approve</option><option value="pending">Pending</option></select></div>
          <label className="flex items-center gap-2 text-sm"><input name="platinumStatus" type="checkbox" value="active" /> Activate Platinum after deposit verification (12 months)</label>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" type="submit">Save affiliate</button>
        </form>

        <form className="space-y-3 rounded-xl border bg-card p-5" onSubmit={(event) => submit(event, 'record-investment')}>
          <div><h2 className="font-semibold">Record Platinum security deposit</h2><p className="text-sm text-muted-foreground">Bronze ₹1L, Silver ₹2.5L, Gold ₹10L. Deposits stay refundable in the programme ledger.</p></div>
          <select required name="affiliateProfileId" className="w-full rounded-md border bg-background p-2"><option value="">Select affiliate</option>{data?.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.tier.toUpperCase()} · {profile.agent_id.slice(0, 8)}</option>)}</select>
          <input required name="amount" type="number" min="1" step="0.01" placeholder="Deposit received (₹)" className="w-full rounded-md border bg-background p-2" />
          <input name="reference" placeholder="Payment reference" className="w-full rounded-md border bg-background p-2" />
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" type="submit">Record deposit</button>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-3 rounded-xl border bg-card p-5" onSubmit={(event) => submit(event, 'set-product-eligibility')}>
          <div><h2 className="font-semibold">Commission-free products</h2><p className="text-sm text-muted-foreground">Exclude a product from affiliate commission. The calculator accepts only the resulting eligible, pre-GST amount.</p></div>
          <select required name="productId" className="w-full rounded-md border bg-background p-2"><option value="">Select product</option>{data?.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
          <select name="commissionEligible" className="w-full rounded-md border bg-background p-2"><option value="false">Commission-free</option><option value="true">Commission eligible</option></select>
          <input name="reason" placeholder="Reason or product policy" className="w-full rounded-md border bg-background p-2" />
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" type="submit">Save product rule</button>
        </form>
        <div className="rounded-xl border bg-card p-5"><h2 className="font-semibold">Current product rules</h2><div className="mt-3 space-y-2 text-sm">{data?.productRules?.length ? data.productRules.map((rule: any) => <div className="flex justify-between border-b pb-2" key={rule.id}><span>{rule.products?.name || rule.product_id}</span><span className={rule.commission_eligible ? 'text-emerald-600' : 'text-destructive'}>{rule.commission_eligible ? 'Eligible' : 'Commission-free'}</span></div>) : <p className="text-muted-foreground">All products remain eligible until a rule is added.</p>}</div></div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-3 rounded-xl border bg-card p-5" onSubmit={(event) => submit(event, 'calculate-commission')}>
          <div><h2 className="font-semibold">Calculate and schedule commission</h2><p className="text-sm text-muted-foreground">Enter only the commission-eligible pre-GST amount. Booking pays 40% of base; settlement schedules the balance, approved uplift share, and Platinum bonus.</p></div>
          <select required name="affiliateProfileId" className="w-full rounded-md border bg-background p-2"><option value="">Select affiliate</option>{data?.profiles.filter((profile) => profile.status === 'approved').map((profile) => <option key={profile.id} value={profile.id}>{profile.tier.toUpperCase()} · {profile.agent_id.slice(0, 8)}</option>)}</select>
          <div className="grid grid-cols-2 gap-3"><input required name="orderId" placeholder="Order UUID" className="rounded-md border bg-background p-2" /><select name="orderState" className="rounded-md border bg-background p-2"><option value="booking_paid">Booking paid</option><option value="settled">Installed & settled</option><option value="cancelled">Cancelled</option><option value="returned">Returned</option><option value="refunded">Refunded</option></select></div>
          <div className="grid grid-cols-2 gap-3"><input required name="eligibleBaseAmount" type="number" min="0" step="0.01" placeholder="Eligible base, pre-GST" className="rounded-md border bg-background p-2" /><input required name="affiliateQuotedAmount" type="number" min="0" step="0.01" placeholder="Affiliate quotation" className="rounded-md border bg-background p-2" /></div>
          <input name="monthToDateEligibleBusiness" type="number" min="0" step="0.01" placeholder="This month eligible business before this order" className="w-full rounded-md border bg-background p-2" />
          <label className="flex items-center gap-2 text-sm"><input name="priceIncreaseApproved" type="checkbox" /> Written price-increase approval received</label>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" type="submit">Calculate and schedule</button>
        </form>

        <div className="rounded-xl border bg-card p-5"><h2 className="font-semibold">Tier policy</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="pb-2">Tier</th><th>Base</th><th>Monthly limit</th><th>Platinum deposit</th></tr></thead><tbody>{[['Bronze', '5%', '₹2,00,000', '₹1,00,000'], ['Silver', '7%', '₹5,00,000', '₹2,50,000'], ['Gold', '10%', '₹20,00,000', '₹10,00,000']].map((row) => <tr className="border-b" key={row[0]}>{row.map((cell) => <td className="py-3" key={cell}>{cell}</td>)}</tr>)}</tbody></table></div><p className="mt-4 text-sm text-muted-foreground">Platinum pays the base rate plus a two-times-base bonus. Approved uplift is capped at 20% and shares 50% of the difference. Cancelled, returned, and refunded orders always pay ₹0.</p></div>
      </section>

      <section className="rounded-xl border bg-card p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Commission report</h2><p className="text-sm text-muted-foreground">Payout schedule and settlement ledger.</p></div><button onClick={() => void refresh()} className="rounded-md border px-3 py-2 text-sm">Refresh</button></div><div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="pb-2">Due</th><th>Payout</th><th>Affiliate</th><th>Amount</th><th>Status</th></tr></thead><tbody>{loading ? <tr><td className="py-4" colSpan={5}>Loading…</td></tr> : data?.ledger.length ? data.ledger.map((entry) => <tr className="border-b" key={entry.id}><td className="py-3">{entry.payable_on}</td><td>{entry.payout_type.replaceAll('_', ' ')}</td><td className="font-mono text-xs">{entry.affiliate_profile_id.slice(0, 8)}</td><td>{currency(entry.commission_amount)}</td><td className="capitalize">{entry.status}</td></tr>) : <tr><td className="py-4 text-muted-foreground" colSpan={5}>No payout entries yet.</td></tr>}</tbody></table></div></section>
    </main>
  );
}
