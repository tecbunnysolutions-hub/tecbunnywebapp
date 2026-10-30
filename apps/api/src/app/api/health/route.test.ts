import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ from: vi.fn(), createClient: vi.fn() }));
vi.mock('@tecbunny/database/admin', () => ({ createServiceClient: mocks.createClient }));
vi.mock('@tecbunny/core/environment-validator', () => ({ environmentValidator: {
  isValid: () => true, getFeatureStatus: () => ({ email: true, whatsapp: true }),
  getErrors: () => [], getWarnings: () => [],
} }));
vi.mock('@tecbunny/core', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
import { GET } from './route';
afterEach(() => vi.unstubAllEnvs());
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('NODE_ENV', 'production');
  mocks.createClient.mockReturnValue({ from: mocks.from });
});
describe('server-side health probes', () => {
  it('checks private tables without returning rows or granting public access', async () => {
    const select = vi.fn().mockReturnValue({ limit: () => Promise.resolve({ data: null, error: null }) });
    mocks.from.mockReturnValue({ select });
    const response = await GET(new NextRequest('https://api.test/api/health'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(mocks.from.mock.calls.map(call => call[0])).toEqual(['products', 'otp_codes', 'user_communication_preferences']);
    expect(select).toHaveBeenCalledWith('id', { head: true });
    const body = await response.json();
    expect(body.checks.every((check: Record<string, unknown>) => !('details' in check))).toBe(true);
    expect(body.features).toBeUndefined();
  });
  it('retains a failing status and redacts dependency errors', async () => {
    mocks.from.mockReturnValue({ select: () => ({ limit: () => Promise.resolve({ error: { message: 'private database detail' } }) }) });
    const response = await GET(new NextRequest('https://api.test/api/health'));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private database detail');
  });
});
