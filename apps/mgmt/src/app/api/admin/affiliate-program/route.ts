import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdminContext } from '@tecbunny/core/auth/admin-guard';
import { calculateAffiliateCommission, type AffiliateTier } from '@tecbunny/core/affiliate-program';

const tiers = new Set<AffiliateTier>(['bronze', 'silver', 'gold']);
const states = new Set(['booking_paid', 'settled', 'cancelled', 'returned', 'refunded']);

async function adminContext() {
  try {
    return await requireAdminContext();
  } catch (error) {
    const status = error instanceof AdminAuthError ? error.status : 401;
    return NextResponse.json({ error: 'Administrator access is required.' }, { status });
  }
}

export async function GET() {
  const context = await adminContext();
  if (context instanceof NextResponse) return context;
  const db = context.serviceSupabase;

  const [profiles, investments, productRules, ledger, agents, products] = await Promise.all([
    db.from('affiliate_program_profiles').select('*').order('created_at', { ascending: false }),
    db.from('affiliate_investments').select('*').order('created_at', { ascending: false }).limit(100),
    db.from('affiliate_product_rules').select('*, products(name)').order('updated_at', { ascending: false }),
    db.from('affiliate_commission_ledger').select('*').order('payable_on', { ascending: false }).limit(250),
    db.from('sales_agents').select('id, user_id, referral_code, status').order('created_at', { ascending: false }),
    db.from('products').select('id, name').order('name').limit(500),
  ]);
  const failure = [profiles, investments, productRules, ledger, agents, products].find((result) => result.error)?.error;
  if (failure) return NextResponse.json({ error: failure.message }, { status: 500 });

  const total = (ledger.data ?? []).reduce((sum, entry: any) => sum + Number(entry.commission_amount ?? 0), 0);
  return NextResponse.json({
    profiles: profiles.data ?? [], investments: investments.data ?? [], productRules: productRules.data ?? [], ledger: ledger.data ?? [], agents: agents.data ?? [], products: products.data ?? [],
    summary: {
      scheduled: (ledger.data ?? []).filter((entry: any) => ['scheduled', 'approved'].includes(entry.status)).reduce((sum, entry: any) => sum + Number(entry.commission_amount ?? 0), 0),
      paid: (ledger.data ?? []).filter((entry: any) => entry.status === 'paid').reduce((sum, entry: any) => sum + Number(entry.commission_amount ?? 0), 0),
      total,
    },
  });
}

export async function POST(request: Request) {
  const context = await adminContext();
  if (context instanceof NextResponse) return context;
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!payload || typeof payload.action !== 'string') return NextResponse.json({ error: 'A valid action is required.' }, { status: 400 });
  const db = context.serviceSupabase;

  if (payload.action === 'configure-affiliate') {
    const { agentId, tier, status, platinumStatus } = payload;
    if (typeof agentId !== 'string' || typeof tier !== 'string' || !tiers.has(tier as AffiliateTier)) return NextResponse.json({ error: 'Agent and valid tier are required.' }, { status: 400 });
    const isPlatinum = platinumStatus === true || platinumStatus === 'active';
    const result = await db.from('affiliate_program_profiles').upsert({
      agent_id: agentId, tier, status: status === 'approved' ? 'approved' : 'pending', platinum_status: isPlatinum ? 'active' : 'not_enrolled',
      platinum_started_at: isPlatinum ? new Date().toISOString() : null,
      platinum_ends_at: isPlatinum ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'agent_id' }).select().single();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    return NextResponse.json({ profile: result.data });
  }

  if (payload.action === 'record-investment') {
    const { affiliateProfileId, amount, reference, notes } = payload;
    if (typeof affiliateProfileId !== 'string' || !Number.isFinite(Number(amount)) || Number(amount) <= 0) return NextResponse.json({ error: 'Affiliate profile and deposit amount are required.' }, { status: 400 });
    const result = await db.from('affiliate_investments').insert({ affiliate_profile_id: affiliateProfileId, amount: Number(amount), status: 'received', received_at: new Date().toISOString(), reference: typeof reference === 'string' ? reference : null, notes: typeof notes === 'string' ? notes : null }).select().single();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    return NextResponse.json({ investment: result.data });
  }

  if (payload.action === 'set-product-eligibility') {
    const { productId, commissionEligible, reason } = payload;
    if (typeof productId !== 'string' || typeof commissionEligible !== 'boolean') return NextResponse.json({ error: 'Product and eligibility are required.' }, { status: 400 });
    const result = await db.from('affiliate_product_rules').upsert({ product_id: productId, commission_eligible: commissionEligible, reason: typeof reason === 'string' ? reason : null, updated_by: context.user.id, updated_at: new Date().toISOString() }, { onConflict: 'product_id' }).select().single();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    return NextResponse.json({ productRule: result.data });
  }

  if (payload.action === 'calculate-commission') {
    const { affiliateProfileId, orderId, eligibleBaseAmount, affiliateQuotedAmount, orderState, priceIncreaseApproved, monthToDateEligibleBusiness } = payload;
    if (typeof affiliateProfileId !== 'string' || typeof orderId !== 'string' || !states.has(String(orderState))) return NextResponse.json({ error: 'Affiliate, order, and valid order state are required.' }, { status: 400 });
    const { data: profile, error: profileError } = await db.from('affiliate_program_profiles').select('*').eq('id', affiliateProfileId).single();
    if (profileError || !profile) return NextResponse.json({ error: 'Affiliate profile was not found.' }, { status: 404 });
    const calculation = calculateAffiliateCommission({ tier: profile.tier as AffiliateTier, eligibleBaseAmount: Number(eligibleBaseAmount), affiliateQuotedAmount: Number(affiliateQuotedAmount), orderState: orderState as any, platinumActive: profile.platinum_status === 'active' && Boolean((await db.from('affiliate_investments').select('id').eq('affiliate_profile_id', affiliateProfileId).eq('status', 'received').limit(1)).data?.length), priceIncreaseApproved: Boolean(priceIncreaseApproved), monthToDateEligibleBusiness: Number(monthToDateEligibleBusiness) || 0 });
    if (!calculation.eligible) return NextResponse.json({ calculation }, { status: 422 });
    const rows = calculation.payouts.map((payout) => ({ affiliate_profile_id: affiliateProfileId, order_id: orderId, payout_type: payout.type, order_state: orderState, eligible_base_amount: eligibleBaseAmount, affiliate_quoted_amount: affiliateQuotedAmount, commission_amount: payout.amount, payable_on: payout.payableOn.toISOString().slice(0, 10), calculation }));
    const result = rows.length ? await db.from('affiliate_commission_ledger').upsert(rows, { onConflict: 'affiliate_profile_id,order_id,payout_type' }).select() : { data: [], error: null };
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    return NextResponse.json({ calculation, ledger: result.data });
  }

  if (payload.action === 'mark-paid') {
    const ids = Array.isArray(payload.ledgerIds) ? payload.ledgerIds.filter((id): id is string => typeof id === 'string') : [];
    if (!ids.length) return NextResponse.json({ error: 'At least one payout is required.' }, { status: 400 });
    const result = await db.from('affiliate_commission_ledger').update({ status: 'paid', paid_at: new Date().toISOString(), updated_at: new Date().toISOString() }).in('id', ids).select();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    return NextResponse.json({ ledger: result.data });
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
