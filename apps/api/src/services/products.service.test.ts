import type { SupabaseClient } from '@tecbunny/database';
import { describe, expect, it, vi } from 'vitest';

import { ServiceError } from './errors';
import { getPublicProductById, listPublicProducts } from './products.service';

vi.mock('@tecbunny/core/product-visibility', () => ({
  ensureProductColumns: vi.fn(async () => null),
  applyPublicProductVisibilityFilters: (q: unknown) => q,
  applyPublicProductOrdering: (q: unknown) => q,
  isPubliclyVisibleProduct: (p: { status?: string }) => p.status === 'active',
}));

type Result = { data: unknown; error: unknown; count?: number | null };

function fakeDb(tables: Record<string, Result>) {
  const from = vi.fn((table: string) => {
    const result = tables[table];
    const builder: Record<string, unknown> = {};
    builder.maybeSingle = async () => result;
    for (const method of ['select', 'eq', 'order']) builder[method] = () => builder;
    builder.range = vi.fn(() => builder);
    builder.then = (resolve: (value: Result) => unknown) => resolve(result);
    return builder;
  });
  return { from } as unknown as SupabaseClient;
}

describe('listPublicProducts', () => {
  it('returns products, offers and the exact total', async () => {
    const db = fakeDb({
      products: { data: [{ id: 1 }, { id: 2 }], error: null, count: 40 },
      auto_offers: { data: [{ id: 9 }], error: null },
    });
    const result = await listPublicProducts(db, { page: 2, pageSize: 2 });
    expect(result).toEqual({ products: [{ id: 1 }, { id: 2 }], offers: [{ id: 9 }], total: 40, page: 2, pageSize: 2 });
  });

  it('degrades to no offers when the offers query fails', async () => {
    const db = fakeDb({
      products: { data: [{ id: 1 }], error: null, count: 1 },
      auto_offers: { data: null, error: { message: 'boom' } },
    });
    expect((await listPublicProducts(db, { page: 1, pageSize: 10 })).offers).toEqual([]);
  });

  it('throws a 502 ServiceError when products fail to load', async () => {
    const db = fakeDb({
      products: { data: null, error: { message: 'boom' } },
      auto_offers: { data: [], error: null },
    });
    await expect(listPublicProducts(db, { page: 1, pageSize: 10 })).rejects.toMatchObject({
      status: 502,
      code: 'UPSTREAM_ERROR',
    });
    await expect(listPublicProducts(db, { page: 1, pageSize: 10 })).rejects.toBeInstanceOf(ServiceError);
  });
});

describe('getPublicProductById', () => {
  it('returns a visible product', async () => {
    const db = fakeDb({ products: { data: { id: 1, status: 'active' }, error: null } });
    await expect(getPublicProductById(db, '1')).resolves.toMatchObject({ id: 1 });
  });

  it('404s for hidden and missing products', async () => {
    const hidden = fakeDb({ products: { data: { id: 1, status: 'draft' }, error: null } });
    await expect(getPublicProductById(hidden, '1')).rejects.toMatchObject({ status: 404 });
    const missing = fakeDb({ products: { data: null, error: null } });
    await expect(getPublicProductById(missing, '9')).rejects.toMatchObject({ status: 404 });
  });

  it('502s on upstream errors', async () => {
    const db = fakeDb({ products: { data: null, error: { message: 'x' } } });
    await expect(getPublicProductById(db, '1')).rejects.toMatchObject({ status: 502 });
  });
});