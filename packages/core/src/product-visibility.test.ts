import { describe, expect, it } from 'vitest';

import {
  PUBLIC_PRODUCT_PRICE_COLUMNS,
  applyPublicProductVisibilityFilters,
  isPubliclyVisibleProduct,
} from './product-visibility';

function createQueryRecorder() {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const query = {
    calls,
    eq(...args: unknown[]) {
      calls.push({ method: 'eq', args });
      return query;
    },
    is(...args: unknown[]) {
      calls.push({ method: 'is', args });
      return query;
    },
    or(...args: unknown[]) {
      calls.push({ method: 'or', args });
      return query;
    },
  };

  return query;
}

describe('product visibility', () => {
  it('accepts a product with offer_price = 0, selling_price > 0', () => {
    expect(isPubliclyVisibleProduct({
      status: 'active',
      is_deleted: false,
      offer_price: 0,
      selling_price: 5000,
    })).toBe(true);
  });

  it('accepts a product with selling_price = null, mrp > 0', () => {
    expect(isPubliclyVisibleProduct({
      status: 'active',
      is_deleted: false,
      selling_price: null,
      mrp: 3200,
    })).toBe(true);
  });

  it('accepts a product with status = published', () => {
    expect(isPubliclyVisibleProduct({
      status: 'published',
      selling_price: 1500,
    })).toBe(true);
  });

  it('rejects a product when all prices = 0', () => {
    expect(isPubliclyVisibleProduct({
      status: 'active',
      offer_price: 0,
      selling_price: 0,
      mrp: 0,
      dealer_price: 0,
    })).toBe(false);
  });

  it('rejects a deleted product (is_deleted = true)', () => {
    expect(isPubliclyVisibleProduct({
      status: 'active',
      is_deleted: true,
      selling_price: 5000,
    })).toBe(false);
  });

  it('rejects a product when deleted_at is populated', () => {
    expect(isPubliclyVisibleProduct({
      status: 'active',
      deleted_at: '2026-08-30T00:00:00.000Z',
      selling_price: 5000,
    })).toBe(false);
  });

  it('rejects a product with status = draft', () => {
    expect(isPubliclyVisibleProduct({
      status: 'draft',
      selling_price: 5000,
    })).toBe(false);
  });

  it('rejects products explicitly marked inactive (is_active = false)', () => {
    expect(isPubliclyVisibleProduct({
      status: 'active',
      is_active: false,
      selling_price: 5000,
    })).toBe(false);
  });

  it('applies the same public price rule and active/deleted rules to Supabase queries', () => {
    const query = createQueryRecorder();

    applyPublicProductVisibilityFilters(query);

    expect(query.calls).toContainEqual({
      method: 'or',
      args: ['status.is.null,status.eq.active,status.eq.published'],
    });
    expect(query.calls).toContainEqual({
      method: 'or',
      args: ['is_active.is.null,is_active.eq.true'],
    });
    expect(query.calls).toContainEqual({
      method: 'or',
      args: ['is_deleted.is.null,is_deleted.eq.false'],
    });
    expect(query.calls).toContainEqual({
      method: 'is',
      args: ['deleted_at', null],
    });
    expect(query.calls).toContainEqual({
      method: 'or',
      args: [PUBLIC_PRODUCT_PRICE_COLUMNS.map((column) => `${column}.gt.0`).join(',')],
    });
  });
});
