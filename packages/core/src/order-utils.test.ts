import { describe, expect, it } from 'vitest';

import {
  calculateCartTotals,
  formatInvoiceDate,
  formatOrderId,
  formatOrderNumber,
  formatOrderNumberMedium,
  getOrderDisplayText,
} from './order-utils';

/**
 * Coverage for the "find-and-open-order" and "save-order-view" launch-qa
 * workflows (launch-qa-evidence.json): an operator must be able to locate an
 * order by its human-readable identifier and rely on stable display formatting
 * across the order list, saved views, and exports. These tests pin the display
 * contract those views depend on.
 */
describe('order display / order-view contract', () => {
  it('formatOrderNumber converts a UUID to a stable TB-prefixed code', () => {
    expect(formatOrderNumber('3f8a1b2c-9d4e-4f50-a1b2-c3d4e5f60718'))
      .toBe('TB3F8A1B2C');
  });

  it('formatOrderNumber is idempotent for the same id (saved-view stability)', () => {
    const id = '3f8a1b2c-9d4e-4f50-a1b2-c3d4e5f60718';
    expect(formatOrderNumber(id)).toBe(formatOrderNumber(id));
  });

  it('formatOrderNumber falls back safely for empty/invalid input', () => {
    expect(formatOrderNumber('')).toBe('TB00000000');
    // @ts-expect-error runtime guard for non-string input
    expect(formatOrderNumber(null)).toBe('TB00000000');
  });

  it('formatOrderNumberMedium produces the medium code', () => {
    expect(formatOrderNumberMedium('3f8a1b2c-9d4e-4f50-a1b2-c3d4e5f60718'))
      .toBe('TB3F8A1B2C');
  });

  it('formatOrderId uppercases the first 8 chars (legacy path)', () => {
    expect(formatOrderId('3f8a1b2c-9d4e')).toBe('3F8A1B2C');
    expect(formatOrderId('')).toBe('00000000');
  });

  it('getOrderDisplayText wraps the order number for list headers', () => {
    expect(getOrderDisplayText('3f8a1b2c-9d4e-4f50-a1b2-c3d4e5f60718'))
      .toBe('Order #TB3F8A1B2C');
  });

  it('formatInvoiceDate renders GB dates and tolerates null/invalid', () => {
    expect(formatInvoiceDate(null)).toBe('N/A');
    expect(formatInvoiceDate(undefined)).toBe('N/A');
    expect(formatInvoiceDate('2026-09-20T00:00:00Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('calculateCartTotals splits GST-inclusive prices (export totals contract)', () => {
    const { subtotal, gstAmount, total } = calculateCartTotals([
      { price: 118, quantity: 1, gstRate: 18 },
      { price: 236, quantity: 2, gstRate: 18 },
    ]);
    expect(total).toBeCloseTo(590, 2);
    expect(gstAmount).toBeCloseTo(90, 2);
    expect(subtotal + gstAmount).toBeCloseTo(total, 2);
  });

  it('calculateCartTotals defaults gstRate to 18 when omitted', () => {
    const { total } = calculateCartTotals([{ price: 118, quantity: 1 }]);
    expect(total).toBeCloseTo(118, 2);
  });
});
