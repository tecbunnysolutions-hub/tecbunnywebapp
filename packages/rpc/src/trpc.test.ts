import { describe, expect, it } from 'vitest';
import { router, protectedProcedure, publicProcedure } from './trpc';
import type { Context } from './context';

const testRouter = router({ privileged: protectedProcedure.query(() => 'allowed'), publicRead: publicProcedure.query(() => 'public') });
const context = (role: string, mfaLevel: string | null): Context => ({
  req: new Request('https://api.test/api/trpc'), resHeaders: new Headers(),
  session: { user: { id: 'user-1', email: 'test@example.com' } }, role, mfaLevel,
});

describe('RPC MFA boundary', () => {
  it.each(['admin', 'superadmin'])('rejects password-only %s sessions on protected procedures', async (role) => {
    await expect(testRouter.createCaller(context(role, 'aal1')).privileged()).rejects.toMatchObject({ code: 'FORBIDDEN', message: 'MFA Required' });
  });

  it('allows an admin with MFA', async () => {
    await expect(testRouter.createCaller(context('admin', 'aal2')).privileged()).resolves.toBe('allowed');
  });

  it('preserves customer access and public reads', async () => {
    await expect(testRouter.createCaller(context('customer', 'aal1')).privileged()).resolves.toBe('allowed');
    await expect(testRouter.createCaller({ ...context('customer', null), session: null }).publicRead()).resolves.toBe('public');
  });
});
