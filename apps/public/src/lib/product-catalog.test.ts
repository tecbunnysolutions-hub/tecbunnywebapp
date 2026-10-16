import { describe, expect, it } from 'vitest';

import { deduplicateCatalogProducts, getCatalogProductDisplayName } from './product-catalog';

describe('product catalog normalization', () => {
  it('removes repeated brand prefixes from product link names', () => {
    expect(getCatalogProductDisplayName({
      id: 'one',
      brand: 'EVM',
      title: 'EVM EVMNV 128GB Black',
    })).toBe('EVMNV 128GB Black');
  });

  it('merges duplicate catalogue entries by keeping the lower-priced product', () => {
    const products = deduplicateCatalogProducts([
      { id: 'higher', brand: 'EVM', title: 'EVM EVMNV 128GB Black', category: 'SSD', price: 2849 },
      { id: 'lower', brand: 'EVM', title: 'EVMNV 128GB Black', category: 'SSD', price: 2799 },
    ]);

    expect(products).toHaveLength(1);
    expect(products[0].id).toBe('lower');
  });
});
