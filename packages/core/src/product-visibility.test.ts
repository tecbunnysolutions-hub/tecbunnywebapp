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
  it('accepts a product with a positive fallback sale price', () => {
    expect(isPubliclyVisibleProduct({
      status: 'active',
      is_deleted: false,
      price: 0,
      selling_price: 5000,
    })).toBe(true);
  });

  it('applies the same public price rule to Supabase queries', () => {
    const query = createQueryRecorder();

    applyPublicProductVisibilityFilters(query);

    expect(query.calls).toContainEqual({
      method: 'or',
      args: [PUBLIC_PRODUCT_PRICE_COLUMNS.map((column) => `${column}.gt.0`).join(',')],
    });
  });
});
