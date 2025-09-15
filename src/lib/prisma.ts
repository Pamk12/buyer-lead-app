// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// This declares a global variable to hold the Prisma client instance.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// This line either reuses the existing Prisma client instance from the global scope
// or creates a new one if it doesn't exist yet.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// In development, we assign the created Prisma client to the global variable.
// This ensures that on hot-reloads, the same instance is reused.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}