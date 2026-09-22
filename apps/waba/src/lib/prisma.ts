/**
 * Prisma client singleton for the WABA app.
 *
 * Reconstructed module — mirrors the connection pattern used by
 * packages/core/src/db/prisma.ts: the generated client is re-exported from
 * `@tecbunny/types` (Prisma schema lives in packages/types/prisma/schema.prisma)
 * and connections go through the `@prisma/adapter-pg` driver adapter using
 * DATABASE_URL.
 *
 * The client is attached to the `global` object in development to prevent
 * exhausting the database connection limit during Next.js hot reloads.
 * Learn more: https://pris.ly/d/help/next-js-best-practices
 */
import { PrismaClient } from '@tecbunny/types';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const adapter = new PrismaPg(process.env.DATABASE_URL ?? '');

const isProduction = process.env.NODE_ENV === 'production';

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: isProduction ? ['error', 'warn'] : ['error', 'warn'],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
