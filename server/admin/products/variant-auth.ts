import { requirePermission } from '@/server/auth/permissions';
import { PERMISSIONS } from '@/server/auth/permission-catalog';
import type { AuthorizationContext } from '@/server/auth/permissions';

/**
 * Session-based authorization for product variant wrappers — Step 2.4.5.
 *
 * These helpers resolve the caller's identity from the Better Auth session and
 * return the resolved `AuthorizationContext` (throws AuthenticationError /
 * AuthorizationError otherwise). They are the ONLY production entry points that
 * touch the session; executors receive the context through the shared
 * `authorizeProductRead` / `authorizeProductWrite` boundary in
 * `product-variant-mutation-helpers.ts` and never resolve identity themselves.
 *
 * Kept in a separate module so that real-service tests can import the executor
 * chain (helpers + schema + db) without loading `next/headers` / Better Auth.
 */

export async function requireProductWrite(): Promise<AuthorizationContext> {
  return requirePermission(PERMISSIONS.products.write);
}

export async function requireProductRead(): Promise<AuthorizationContext> {
  return requirePermission(PERMISSIONS.products.read);
}
