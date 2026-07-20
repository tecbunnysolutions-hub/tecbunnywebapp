import { PrismaClient } from '@tecbunny/types';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '../logger';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { UserRole } from '../roles';

export interface PrismaServiceContext {
  role: UserRole;
  userId?: string;
  permissions: string[];
}

export const prismaServiceContext = new AsyncLocalStorage<PrismaServiceContext>();

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

import { checkPolicy, type Resource, type Action } from '../auth/policy';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const adapter = new PrismaPg(process.env.DATABASE_URL ?? '');

const isProduction = process.env.NODE_ENV === 'production';

const basePrisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: isProduction ? ['error', 'warn'] : ['query', 'error', 'info', 'warn'],
});

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        let role: any = 'customer';
        let permissions: string[] = [];
        let userId: string | undefined;

        const serviceCtx = prismaServiceContext.getStore();
        if (serviceCtx) {
          role = serviceCtx.role;
          permissions = serviceCtx.permissions;
          userId = serviceCtx.userId;
        } else {
          try {
            // Attempt to fetch context dynamically via Next.js
            const { getServerAuthState } = await import('../server-role-guard');
            const auth = await getServerAuthState();
            role = auth.role;
            permissions = auth.permissions;
            userId = auth.session?.user?.id;
          } catch (e) {
            // If called outside Next.js request context (e.g., CLI or background jobs)
            // and no service context exists, fail closed.
            logger.error('prisma_auth_error', { error: 'Executing DB query outside Request context without service context. Denying.' });
            throw new Error('Forbidden: Database operation attempted outside authorization context.');
          }
        }

        // Map Prisma operation to Policy Action
        let action: Action = 'read';
        if (['create', 'createMany'].includes(operation)) action = 'create';
        else if (['update', 'updateMany', 'upsert'].includes(operation)) action = 'write';
        else if (['delete', 'deleteMany'].includes(operation)) action = 'delete';
        else if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation)) action = 'read';

        const isAllowed = checkPolicy({ role, userId, permissions }, action, (model || 'All') as Resource);

        if (!isAllowed) {
          throw new Error(`Forbidden: Role '${role}' is not authorized to perform '${action}' on '${model}'`);
        }

        return query(args);
      },
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;


