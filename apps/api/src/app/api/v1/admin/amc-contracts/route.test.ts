import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireCaller: vi.fn(),
  createServiceClient: vi.fn(),
  listAmcContracts: vi.fn(),
}));

vi.mock('../../../../../lib/v1-auth', () => ({
  PRIVATE_CACHE_CONTROL: 'private, no-store',
  requireCaller: mocks.requireCaller,
}));
vi.mock('@tecbunny/database/admin', () => ({
  createServiceClient: mocks.createServiceClient,
  isSupabaseServiceConfigured: true,
}));
vi.mock('../../../../../services/amc-contracts.service', () => ({
  listAmcContracts: mocks.listAmcContracts,
}));

import { GET } from './route';
import { ServiceError } from '../../../../../services/errors';

describe('GET /api/v1/admin/amc-contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires staff access inside the handler', async () => {
    mocks.requireCaller.mockRejectedValue(new ServiceError(401, 'UNAUTHENTICATED', 'Authentication required.'));
    const response = await GET(new NextRequest('http://localhost/api/v1/admin/amc-contracts'));
    expect(mocks.requireCaller).toHaveBeenCalledWith(expect.any(NextRequest), 'staff');
    expect(response.status).toBe(401);
    expect(mocks.listAmcContracts).not.toHaveBeenCalled();
  });

  it('validates query parameters and returns API-owned results', async () => {
    const data = { contracts: [], counts: { ACTIVE: 0, EXPIRING: 0, EXPIRED: 0 } };
    mocks.requireCaller.mockResolvedValue({ userId: 'staff-1', role: 'service_manager' });
    mocks.createServiceClient.mockReturnValue({});
    mocks.listAmcContracts.mockResolvedValue(data);

    const response = await GET(new NextRequest('http://localhost/api/v1/admin/amc-contracts?search=Acme&status=EXPIRING'));
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(mocks.listAmcContracts).toHaveBeenCalledWith({}, { search: 'Acme', status: 'EXPIRING' });
    expect(payload.data).toEqual(data);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('rejects other staff roles', async () => {
    mocks.requireCaller.mockResolvedValue({ userId: 'sales-1', role: 'sales_manager' });
    const response = await GET(new NextRequest('http://localhost/api/v1/admin/amc-contracts'));
    expect(response.status).toBe(403);
    expect(mocks.listAmcContracts).not.toHaveBeenCalled();
  });

  it('rejects an unsupported status filter', async () => {
    mocks.requireCaller.mockResolvedValue({ userId: 'staff-1', role: 'service_manager' });
    const response = await GET(new NextRequest('http://localhost/api/v1/admin/amc-contracts?status=UNKNOWN'));
    expect(response.status).toBe(400);
    expect(mocks.listAmcContracts).not.toHaveBeenCalled();
  });
});
