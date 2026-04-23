// server/src/prismaClient.js
// Singleton Prisma client — import this everywhere instead of instantiating per-file
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
