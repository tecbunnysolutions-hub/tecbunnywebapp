import { describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ result: { data: [] as any[], error: null as any }, calls: [] as any[] }));
vi.mock('@tecbunny/core/server', () => {
  const query: any = {
    update: (v: any) => { m.calls.push(['update', v]); return query; },
    in: (c: string, v: any) => { m.calls.push(['in', c, v]); return query; },
    select: () => Promise.resolve(m.result),
  };
  return { createSupabaseServiceClient: () => ({ from: () => query }), isSupabaseServiceConfigured: true };
});
vi.mock('@tecbunny/core', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
import { EnhancedCommissionService } from './enhanced-commission-service';

describe('processCommissionPayment', () => {
  const details = { payment_method: 'bank' };

  it('restricts to payable statuses and reports the real count', async () => {
    m.result = { data: [{ id: 'a' }], error: null };
    const res = await new EnhancedCommissionService().processCommissionPayment(['a', 'b'], details);
    expect(res).toEqual({ success: true, processed_count: 1 });
    expect(m.calls).toContainEqual(['in', 'status', ['pending', 'approved']]);
  });

  it('fails when nothing was payable', async () => {
    m.result = { data: [], error: null };
    const res = await new EnhancedCommissionService().processCommissionPayment(['a'], details);
    expect(res.success).toBe(false);
    expect(res.processed_count).toBe(0);
  });
});
