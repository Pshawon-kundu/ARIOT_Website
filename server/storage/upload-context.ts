/**
 * Shared upload context (STORAGE-1R / D-067).
 *
 * R2 config resolution, the media.write RBAC gate, and actor-role extraction
 * shared by the initiate + complete steps. Split out of the storage service
 * to respect the 300-line file limit.
 */

import { PERMISSIONS } from '../auth/permission-catalog.ts';
import { getR2Config, type R2Config } from '../env.ts';

export type { R2Config } from '../env.ts';

export function getR2ConfigSafe(): R2Config | null {
  try {
    return getR2Config();
  } catch {
    return null;
  }
}

/**
 * Test seam: allows the smoke test to bypass the HTTP cookie session and
 * return a fixed AuthorizationContext with the required media.write
 * permission. No effect unless `setAuthContextOverride` is called.
 */
let authContextOverride:
  | ((req?: Request) => Promise<{
      userId: string;
      email: string;
      roles: string[];
      permissions: string[];
    } | null>)
  | null = null;

export function setAuthContextOverride(fn: typeof authContextOverride): void {
  authContextOverride = fn;
}

export function clearAuthContextOverride(): void {
  authContextOverride = null;
}

/**
 * RBAC gate for both upload steps (D-067: initiate and completion both require
 * media.write). Mirrors the requireProductWrite pattern in update-product-media.
 * Returns `null` when the caller is unauthenticated or lacks the permission.
 */
export async function requireMediaWrite(req?: Request) {
  if (authContextOverride) {
    const ctx = await authContextOverride(req);
    if (!ctx) return null;
    if (ctx.permissions.includes(PERMISSIONS.media.write)) return ctx;
    return null;
  }
  // Lazy import keeps `requirePermission`'s transitive `@/server` imports out
  // of the storage module graph when the test auth seam is in use.
  const { requirePermission } = await import('../auth/permissions.ts');
  try {
    return await requirePermission(PERMISSIONS.media.write);
  } catch {
    return null;
  }
}

/** Primary role slug for the AuditLog actorRole column (may be null). */
export function actorRole(ctx: { roles: string[] }): string | null {
  return ctx.roles[0] ?? null;
}
