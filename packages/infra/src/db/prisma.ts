import { PrismaClient } from '@tecbunny/types';

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined;
};

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!globalForPrisma._prisma) {
      globalForPrisma._prisma = new PrismaClient();
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma._prisma = globalForPrisma._prisma; // Keep reference
      }
    }
    return Reflect.get(globalForPrisma._prisma, prop);
  }
});
