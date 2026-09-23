import { describe, expect, it } from 'vitest';
import { calculateAffiliateCommission } from './affiliate-program';

describe('affiliate programme calculations', () => {
  const date = new Date('2026-01-20T12:00:00.000Z');

  it('calculates the published Bronze Platinum example without GST', () => {
    const result = calculateAffiliateCommission({
      tier: 'bronze', eligibleBaseAmount: 100_000, affiliateQuotedAmount: 120_000,
      orderState: 'settled', platinumActive: true, priceIncreaseApproved: true, occurredAt: date,
    });
    expect(result).toMatchObject({ eligible: true, baseCommission: 5_000, platinumBonus: 10_000, priceIncreaseShare: 10_000, totalCommission: 25_000 });
    expect(result.payouts.map(({ type, amount }) => ({ type, amount }))).toEqual([
      { type: 'base_settlement', amount: 3_000 },
      { type: 'price_increase_share', amount: 10_000 },
      { type: 'platinum_bonus', amount: 10_000 },
    ]);
  });

  it('pays only forty percent of the base commission at booking', () => {
    const result = calculateAffiliateCommission({ tier: 'silver', eligibleBaseAmount: 100_000, affiliateQuotedAmount: 100_000, orderState: 'booking_paid', occurredAt: date });
    expect(result.payouts).toMatchObject([{ type: 'base_advance', amount: 2_800 }]);
  });

  it.each(['cancelled', 'returned', 'refunded'] as const)('pays zero for %s orders', (orderState) => {
    expect(calculateAffiliateCommission({ tier: 'gold', eligibleBaseAmount: 100_000, affiliateQuotedAmount: 100_000, orderState }).totalCommission).toBe(0);
  });

  it('rejects unapproved pricing beyond the twenty percent cap and tier limit', () => {
    expect(calculateAffiliateCommission({ tier: 'bronze', eligibleBaseAmount: 100_000, affiliateQuotedAmount: 120_001, orderState: 'settled' }).eligible).toBe(false);
    expect(calculateAffiliateCommission({ tier: 'bronze', eligibleBaseAmount: 1, affiliateQuotedAmount: 1, orderState: 'settled', monthToDateEligibleBusiness: 200_000 }).eligible).toBe(false);
  });
});
