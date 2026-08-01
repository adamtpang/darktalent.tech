import { PrismaClient } from "@prisma/client";

/**
 * Lazy Prisma access.
 *
 * The trifecta has to keep working with no database configured: /hiring falls
 * back to the labeled seed pool, /scout is pure compute, and the marketing
 * pages must build on a machine with no DATABASE_URL. So the client is
 * constructed on first use rather than at import, and callers check
 * isDbConfigured() before touching it.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** True when a database connection string is present in the environment. */
export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Get the shared client, or null when no database is configured.
 * Reuses one instance across hot reloads so dev does not exhaust the pool.
 */
export function getPrisma(): PrismaClient | null {
  if (!isDbConfigured()) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}
