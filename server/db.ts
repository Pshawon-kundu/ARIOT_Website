import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getDatabaseUrl } from '@/server/env';

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
 * Laziness is deliberate (see docs/08_KNOWN_ISSUES.md I-015): `DATABASE_URL`
 * is NOT required at the base env layer, so a Phase 1 static deploy must boot
 * without a database. Constructing the client (and therefore calling
 * `getDatabaseUrl()`) is deferred until the first property access, so merely
 * importing this module — which Next.js does for every route during "collect
 * page data", including admin API routes — never opens a connection or throws
 * the missing-URL error. The clear configuration error still surfaces the
 * moment database-backed code is actually invoked at runtime.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg(getDatabaseUrl()),
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = createPrismaClient();
    if (typeof prop === 'symbol') {
      return (client as unknown as Record<symbol, unknown>)[prop];
    }
    return (client as unknown as Record<string, unknown>)[prop];
  },
}) as PrismaClient;
