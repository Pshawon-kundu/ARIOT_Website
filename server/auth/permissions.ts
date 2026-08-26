import type { RoleKey } from '@/lib/generated/prisma/client';
import { prisma } from '@/server/db';
import { getSession } from '@/server/auth';
import { AuthenticationError, AuthorizationError } from './errors';
import { hasAllPermissions, hasAnyPermission } from './permission-catalog';

/**
 * Server-side RBAC foundation — Step 2.2.4.
 *
 * Division of responsibility (per D-035 / ADMIN_DASHBOARD_PLAN §3):
 *   - Better Auth owns IDENTITY: OAuth, sessions, the session cookie.
 *   - ARIOT's normalized models own AUTHORIZATION: `Role`, `UserRole`, and the
 *     `Role.permissions` JSON array of permission keys. This module reads those
 *     and never duplicates roles into Better Auth session fields.
 *
 * All helpers are SERVER-ONLY (convention: `server/*` is never imported into
 * client code). Authorization always re-resolves from the database using the
 * authenticated session's `userId` — never from client-supplied role names,
 * cookies (other than the validated Better Auth session), or URL/body data.
 *
 * Fail-closed: a user with no roles, no permissions, a non-ACTIVE status, a
 * set `deletedAt`, or a missing DB record receives NO protected access.
 */

/** Minimal, safe projection of an authorized caller. */
export interface AuthorizationContext {
  /** Authenticated ARIOT `User.id` (the Better Auth session user id). */
  userId: string;
  /** Internal-only; never sent to the client. */
  email: string;
  /** Roles assigned to the user (ARIOT `Role.key` slugs). */
  roles: RoleKey[];
  /** Deduplicated permission keys aggregated across the user's roles. */
  permissions: string[];
}

/**
 * Load the caller's authorization context.
 *
 * @returns the context for a valid, ACTIVE user, or `null` when:
 *   - there is no Better Auth session, or
 *   - the `User` record is missing / not `ACTIVE` / soft-deleted.
 *
 * Does NOT throw for an ordinary anonymous request.
 */
export async function getAuthorizationContext(
  requestHeaders?: Headers,
): Promise<AuthorizationContext | null> {
  const session = await getSession(requestHeaders);
  const userId = session?.user?.id;
  if (!userId) return null;
  return resolveContext(userId);
}

/**
 * Resolve roles + permissions for a known user id.
 * Returns `null` when the user is missing, not `ACTIVE`, or soft-deleted.
 */
async function resolveContext(userId: string): Promise<AuthorizationContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      status: true,
      deletedAt: true,
      userRoles: {
        select: {
          role: {
            select: {
              key: true,
              permissions: true,
            },
          },
        },
      },
    },
  });

  // User-state control: only ACTIVE, non-deleted users are authorized.
  // SUSPENDED / DELETED / soft-deleted accounts are treated as invalid-session.
  if (!user || user.status !== 'ACTIVE' || user.deletedAt !== null) {
    return null;
  }

  const roles: RoleKey[] = [];
  const permissionSet = new Set<string>();

  for (const { role } of user.userRoles) {
    if (!roles.includes(role.key)) roles.push(role.key);
    const perms = role.permissions;
    if (Array.isArray(perms)) {
      for (const p of perms) {
        if (typeof p === 'string') permissionSet.add(p);
      }
    }
  }

  return {
    userId: user.id,
    email: user.email,
    roles,
    permissions: [...permissionSet],
  };
}

/**
 * Require an authenticated, authorized user.
 * @throws AuthenticationError (401) when no valid ACTIVE user exists.
 */
export async function requireAuthenticatedUser(
  requestHeaders?: Headers,
): Promise<AuthorizationContext> {
  const ctx = await getAuthorizationContext(requestHeaders);
  if (!ctx) throw new AuthenticationError();
  return ctx;
}

/**
 * Require one of the supplied roles (ANY-role semantics).
 *
 * The user is granted access if their assigned roles intersect the requested
 * set — i.e. holding ANY listed role is sufficient. An empty list fails closed.
 *
 * @throws AuthenticationError (401) if unauthenticated.
 * @throws AuthorizationError (403) if no listed role is assigned.
 */
export async function requireRole(
  roles: RoleKey | RoleKey[],
  requestHeaders?: Headers,
): Promise<AuthorizationContext> {
  const ctx = await requireAuthenticatedUser(requestHeaders);
  const wanted = Array.isArray(roles) ? roles : [roles];
  const granted = wanted.some((role) => ctx.roles.includes(role));
  if (!granted) throw new AuthorizationError();
  return ctx;
}

/**
 * Require ALL of the supplied permission keys (ALL-permission semantics).
 *
 * The user must hold every listed permission across their roles. An empty list
 * fails closed (throws AuthorizationError) — requesting "no permissions" is
 * never treated as a grant.
 *
 * Wildcard note: the seed assigns `permissions: ["*"]` to `SUPER_ADMIN`,
 * meaning that role holds every permission. `"*"` is a DB-backed convention,
 * not a hardcoded bypass — if a user's aggregated permissions include `"*"`,
 * ALL permission checks pass for that user. This is verified against the live
 * seed data and documented here so future callers understand the behaviour.
 *
 * Namespace wildcards (e.g. "products.*") are NOT supported and will NOT match
 * specific permissions — see D-060, D-063.
 *
 * @throws AuthenticationError (401) if unauthenticated.
 * @throws AuthorizationError (403) if any permission is missing.
 */
export async function requirePermission(
  permissions: string | string[],
  requestHeaders?: Headers,
): Promise<AuthorizationContext> {
  const ctx = await requireAuthenticatedUser(requestHeaders);
  const wanted = Array.isArray(permissions) ? permissions : [permissions];
  if (wanted.length === 0) throw new AuthorizationError();
  if (!hasAllPermissions(ctx.permissions, wanted)) {
    throw new AuthorizationError();
  }
  return ctx;
}

/**
 * Require ANY of the supplied permission keys (ANY-permission semantics).
 *
 * The user is granted access if they hold at least one listed permission.
 * An empty list fails closed. `"*"` wildcard applies (see `requirePermission`).
 *
 * Namespace wildcards (e.g. "products.*") are NOT supported — see D-060, D-063.
 *
 * @throws AuthenticationError (401) if unauthenticated.
 * @throws AuthorizationError (403) if none of the permissions is held.
 */
export async function requireAnyPermission(
  permissions: string | string[],
  requestHeaders?: Headers,
): Promise<AuthorizationContext> {
  const ctx = await requireAuthenticatedUser(requestHeaders);
  const wanted = Array.isArray(permissions) ? permissions : [permissions];
  if (!hasAnyPermission(ctx.permissions, wanted)) {
    throw new AuthorizationError();
  }
  return ctx;
}
