import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import superjson from 'superjson';
import { isAtLeast, normalizeRole } from '@tecbunny/core';

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  if ((ctx.role === 'admin' || ctx.role === 'superadmin') && ctx.mfaLevel !== 'aal2') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'MFA Required' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
      role: ctx.role,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  if ((ctx.role === 'admin' || ctx.role === 'superadmin') && ctx.mfaLevel !== 'aal2') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'MFA Required' });
  }
  const role = normalizeRole(ctx.role);
  if (!role || !isAtLeast(role, 'admin')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
      role: ctx.role,
    },
  });
});

export const adminProcedure = t.procedure.use(isAdmin);