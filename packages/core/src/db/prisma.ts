import { PrismaClient } from '@tecbunny/types';
import { logger } from '../logger';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

import { checkPolicy, type Resource, type Action } from '../auth/policy';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const basePrisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'info', 'warn'],
});

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        let role: any = 'customer';
        let permissions: string[] = [];
        let userId: string | undefined;

        try {
          // Attempt to fetch context dynamically via Next.js
          const { getServerAuthState } = await import('../server-role-guard');
          const auth = await getServerAuthState();
          role = auth.role;
          permissions = auth.permissions;
          userId = auth.session?.user?.id;
        } catch (e) {
          // If called outside Next.js request context (e.g., CLI or background jobs)
          // Defaulting to system role or restricted based on your security posture.
          // For now, assume background jobs have superadmin powers, but log a warning.
          logger.warn('prisma_auth_fallback', { warning: 'Executing DB query outside Request context. Defaulting to superadmin.' });
          role = 'superadmin';
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


