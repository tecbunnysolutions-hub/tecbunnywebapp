import { describe, expect, it, vi } from 'vitest';

import { listAmcContracts, summarizeAmcContracts } from './amc-contracts.service';

const rows = [
  { id: 'active', customer_name: 'Acme', contract_number: 'A-1', end_date: '2027-01-01', status: 'ACTIVE' },
  { id: 'expiring', customer_name: 'Bee Ltd', contract_number: 'B-2', end_date: '2026-10-30', status: 'ACTIVE' },
  { id: 'expired', customer_name: 'Cee Ltd', contract_number: 'C-3', end_date: '2026-10-01', status: 'ACTIVE' },
  { id: 'draft', customer_name: 'Delta', contract_number: 'D-4', end_date: null, status: 'DRAFT' },
];
const now = new Date('2026-10-20T00:00:00Z').getTime();

describe('summarizeAmcContracts', () => {
  it('derives statuses, counts, and ascending end-date order on the API', () => {
    const result = summarizeAmcContracts(rows, { search: undefined, status: 'ALL' }, now);
    expect(result.contracts.map((contract) => [contract.id, contract.status])).toEqual([
      ['expired', 'EXPIRED'],
      ['expiring', 'EXPIRING'],
      ['active', 'ACTIVE'],
      ['draft', 'DRAFT'],
    ]);
    expect(result.counts).toEqual({ ACTIVE: 1, EXPIRING: 1, EXPIRED: 1 });
  });

  it('searches customer and contract number and applies the resolved status filter', () => {
    const byCustomer = summarizeAmcContracts(rows, { search: 'bee', status: 'EXPIRING' }, now);
    expect(byCustomer.contracts.map((contract) => contract.id)).toEqual(['expiring']);
    const byNumber = summarizeAmcContracts(rows, { search: 'C-3', status: 'EXPIRED' }, now);
    expect(byNumber.contracts.map((contract) => contract.id)).toEqual(['expired']);
  });

  it('preserves non-active stored statuses and leaves invalid dates without remaining days', () => {
    const result = summarizeAmcContracts(
      [{ id: 'cancelled', status: 'CANCELLED', end_date: 'invalid' }],
      { status: 'ALL' },
      now,
    );
    expect(result.contracts[0]).toMatchObject({ status: 'CANCELLED', days_remaining: null });
  });
});

describe('listAmcContracts', () => {
  it('selects only declared columns and applies safe search and null-last ordering', async () => {
    const calls: Array<[string, ...unknown[]]> = [];
    const data = rows;
    const builder: any = new Proxy({}, {
      get: (_target, property: string) => {
        if (property === 'then') return (resolve: (value: unknown) => void) => resolve({ data, error: null });
        return (...args: unknown[]) => {
          calls.push([property, ...args]);
          return builder;
        };
      },
    });
    const db = { from: vi.fn(() => builder) } as any;
    await listAmcContracts(db, { search: 'A,1', status: 'ALL' });
    expect(db.from).toHaveBeenCalledWith('amc_contracts');
    expect(calls).toContainEqual(['select', 'id,customer_name,customer_phone,contract_number,contract_type,end_date,status,annual_value']);
    expect(calls).toContainEqual(['or', 'customer_name.ilike.%A\\,1%,contract_number.ilike.%A\\,1%']);
    expect(calls).toContainEqual(['order', 'end_date', { ascending: true, nullsFirst: false }]);
  });
});
