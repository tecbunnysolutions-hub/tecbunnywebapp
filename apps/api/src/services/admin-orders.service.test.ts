import { describe, expect, it, vi } from 'vitest';

import { listAdminOrders } from './admin-orders.service';

function fakeDb(rows: unknown[] = []) {
  const calls: Array<[string, ...unknown[]]> = [];
  const builder: any = new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        if (prop === 'then') return (resolve: (v: unknown) => void) => resolve({ data: rows, count: rows.length, error: null });
        return (...args: unknown[]) => {
          calls.push([prop, ...args]);
          return builder;
        };
      },
    },
  );
  return { db: { from: vi.fn(() => builder) } as any, calls };
}

describe('listAdminOrders', () => {
  it('scopes processedBy=me to the caller', async () => {
    const { db, calls } = fakeDb([{ id: 'a' }]);
    const result = await listAdminOrders(db, { processedBy: 'me', status: 'Completed' }, { userId: 'u1', canViewAll: false });
    expect(calls).toContainEqual(['eq', 'processed_by', 'u1']);
    expect(calls).toContainEqual(['eq', 'status', 'Completed']);
    expect(result.total).toBe(1);
  });

  it('rejects other users for non-admin callers', async () => {
    const { db } = fakeDb();
    await expect(listAdminOrders(db, { processedBy: 'u2' }, { userId: 'u1', canViewAll: false })).rejects.toMatchObject({ status: 403 });
  });

  it('allows admins to view another user', async () => {
    const { db, calls } = fakeDb();
    await listAdminOrders(db, { processedBy: 'u2' }, { userId: 'u1', canViewAll: true });
    expect(calls).toContainEqual(['eq', 'processed_by', 'u2']);
  });
});
