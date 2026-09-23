import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), getTwoFactorStatus: vi.fn(), verifyToken: vi.fn(), enableTwoFactor: vi.fn() }));
vi.mock('@tecbunny/database', () => ({ createClient: async () => ({ auth: { getUser: mocks.getUser } }) }));
vi.mock('@tecbunny/core', () => ({ logger: { error: vi.fn() } }));
vi.mock('@tecbunny/core/two-factor-manager', () => ({ twoFactorManager: mocks }));
import { PUT } from './route';

const validBody = { secret: 'JBSWY3DPEHPK3PXP', backupCodes: ['ABCD-1234'], verificationCode: '123456' };
const request = (body = validBody) => new NextRequest('https://test.local/api/auth/2fa/setup', { method: 'PUT', body: JSON.stringify(body) });

describe('2FA enrollment', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mocks.getTwoFactorStatus.mockResolvedValue({ enabled: false });
    mocks.verifyToken.mockReturnValue(true);
    mocks.enableTwoFactor.mockResolvedValue(true);
  });

  it('cannot replace an active factor using a code for a new secret', async () => {
    mocks.getTwoFactorStatus.mockResolvedValue({ enabled: true });
    expect((await PUT(request())).status).toBe(409);
    expect(mocks.verifyToken).not.toHaveBeenCalled();
    expect(mocks.enableTwoFactor).not.toHaveBeenCalled();
  });

  it('fails closed when the existing factor cannot be read', async () => {
    mocks.getTwoFactorStatus.mockResolvedValue(null);
    expect((await PUT(request())).status).toBe(503);
    expect(mocks.enableTwoFactor).not.toHaveBeenCalled();
  });

  it('allows first enrollment after verification', async () => {
    expect((await PUT(request())).status).toBe(200);
    expect(mocks.enableTwoFactor).toHaveBeenCalledWith('user-1', validBody.secret, validBody.backupCodes, expect.anything());
  });

  it('rejects invalid codes and malformed enrollment input', async () => {
    mocks.verifyToken.mockReturnValue(false);
    expect((await PUT(request())).status).toBe(400);
    expect((await PUT(request({ ...validBody, backupCodes: [] }))).status).toBe(400);
    expect(mocks.enableTwoFactor).not.toHaveBeenCalled();
  });

  it('requires authentication', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await PUT(request())).status).toBe(401);
    expect(mocks.getTwoFactorStatus).not.toHaveBeenCalled();
  });
});
