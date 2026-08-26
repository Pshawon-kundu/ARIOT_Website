import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env, getDatabaseUrl } from '@/server/env';

/**
 * Prisma client singleton — Phase 2 database access point.
 *
 * Import `prisma` from here; never construct `PrismaClient` elsewhere.
 *
 * Prisma 7 requires a driver adapter at runtime. We use `@prisma/adapter-pg`
 * (the PostgreSQL adapter) backed by the `pg` driver. The connection is
 * opened lazily on the first query, not at module load.
 *
 * Why the `globalThis` guard: Next.js / Turbopack hot-reload re-evaluates
 * modules in development, which would otherwise create a new `PrismaClient`
 * (and a new connection pool) on every reload. Reusing one instance avoids
 * exhausting database connections.
 *
 * DATABASE_URL is intentionally NOT required at the base env layer (see
 * docs/08_KNOWN_ISSUES.md I-015). This module is imported only by
 * database-backed server code, so Phase 1 static pages never load it and a
 * Phase 1 deploy boots cleanly without a database. If `DATABASE_URL` is
 * absent when database-backed server code imports this module, the typed
 * env helper fails with a clear, actionable configuration error.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(getDatabaseUrl()),
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
