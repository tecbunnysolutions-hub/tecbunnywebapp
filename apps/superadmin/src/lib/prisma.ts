import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@tecbunny/types';

const globalForPrisma = globalThis as unknown as {
  superadminPrisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.superadminPrisma ?? new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL ?? ''),
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.superadminPrisma = prisma;
}