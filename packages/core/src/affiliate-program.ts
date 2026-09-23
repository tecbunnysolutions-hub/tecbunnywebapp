export type AffiliateTier = 'bronze' | 'silver' | 'gold';
export type AffiliateOrderState = 'booking_paid' | 'settled' | 'cancelled' | 'returned' | 'refunded';

export interface AffiliateTierPolicy {
  tier: AffiliateTier;
  baseRate: number;
  monthlyLimit: number;
  platinumDeposit: number;
}

export const AFFILIATE_TIER_POLICIES: Record<AffiliateTier, AffiliateTierPolicy> = {
  bronze: { tier: 'bronze', baseRate: 5, monthlyLimit: 200_000, platinumDeposit: 100_000 },
  silver: { tier: 'silver', baseRate: 7, monthlyLimit: 500_000, platinumDeposit: 250_000 },
  gold: { tier: 'gold', baseRate: 10, monthlyLimit: 2_000_000, platinumDeposit: 1_000_000 },
};

export interface AffiliateCommissionInput {
  tier: AffiliateTier;
  eligibleBaseAmount: number;
  affiliateQuotedAmount: number;
  orderState: AffiliateOrderState;
  platinumActive?: boolean;
  priceIncreaseApproved?: boolean;
  monthToDateEligibleBusiness?: number;
  occurredAt?: Date;
}

export interface AffiliatePayout {
  type: 'base_advance' | 'base_settlement' | 'price_increase_share' | 'platinum_bonus';
  amount: number;
  payableOn: Date;
}

export interface AffiliateCommissionCalculation {
  eligible: boolean;
  reason?: string;
  policy: AffiliateTierPolicy;
  baseCommission: number;
  platinumBonus: number;
  priceIncreaseShare: number;
  totalCommission: number;
  payouts: AffiliatePayout[];
}

const money = (value: number) => Math.round(value * 100) / 100;

function nextMonthOn(day: number, from: Date): Date {
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, day));
}

/**
 * Applies the published Affiliate Partner terms. Amounts must exclude GST and
 * include only products which are commission-eligible.
 */
export function calculateAffiliateCommission(input: AffiliateCommissionInput): AffiliateCommissionCalculation {
  const policy = AFFILIATE_TIER_POLICIES[input.tier];
  const empty = (reason: string): AffiliateCommissionCalculation => ({
    eligible: false,
    reason,
    policy,
    baseCommission: 0,
    platinumBonus: 0,
    priceIncreaseShare: 0,
    totalCommission: 0,
    payouts: [],
  });

  if (!Number.isFinite(input.eligibleBaseAmount) || input.eligibleBaseAmount <= 0) {
    return empty('No commission-eligible pre-GST amount was supplied.');
  }
  if (['cancelled', 'returned', 'refunded'].includes(input.orderState)) {
    return empty('Cancelled, returned, and refunded orders earn no commission.');
  }
  if ((input.monthToDateEligibleBusiness ?? 0) + input.eligibleBaseAmount > policy.monthlyLimit) {
    return empty(`This booking exceeds the ${policy.tier} monthly business limit.`);
  }

  const quoteDifference = money(Math.max(0, input.affiliateQuotedAmount - input.eligibleBaseAmount));
  if (quoteDifference > money(input.eligibleBaseAmount * 0.2)) {
    return empty('Affiliate quotations cannot exceed the eligible base amount by more than 20%.');
  }

  const baseCommission = money(input.eligibleBaseAmount * policy.baseRate / 100);
  const platinumBonus = input.platinumActive ? money(baseCommission * 2) : 0;
  const priceIncreaseShare = input.priceIncreaseApproved ? money(quoteDifference / 2) : 0;
  const occurredAt = input.occurredAt ?? new Date();
  const payouts: AffiliatePayout[] = [];

  if (input.orderState === 'booking_paid') {
    payouts.push({ type: 'base_advance', amount: money(baseCommission * 0.4), payableOn: nextMonthOn(7, occurredAt) });
  }
  if (input.orderState === 'settled') {
    payouts.push({ type: 'base_settlement', amount: money(baseCommission * 0.6), payableOn: nextMonthOn(7, occurredAt) });
    if (priceIncreaseShare > 0) payouts.push({ type: 'price_increase_share', amount: priceIncreaseShare, payableOn: nextMonthOn(15, occurredAt) });
    if (platinumBonus > 0) payouts.push({ type: 'platinum_bonus', amount: platinumBonus, payableOn: nextMonthOn(21, occurredAt) });
  }

  return {
    eligible: true,
    policy,
    baseCommission,
    platinumBonus,
    priceIncreaseShare,
    totalCommission: money(baseCommission + platinumBonus + priceIncreaseShare),
    payouts,
  };
}
