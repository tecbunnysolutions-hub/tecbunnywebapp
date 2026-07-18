import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@tecbunny/types';

const globalForPrisma = globalThis as unknown as {
  wabaPrisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.wabaPrisma ?? new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL ?? ''),
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.wabaPrisma = prisma;
}