import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { headers } from 'next/headers';
import { prisma } from '@/server/db';
import { env } from '@/server/env';

/**
 * Base Better Auth configuration — Step 2.2.2 (decision D-035, supersedes D-034),
 * extended with the Google OAuth provider in Step 2.2.3.
 *
 * Design notes:
 *   - Uses the existing Prisma singleton from `@/server/db` (no second client).
 *   - Targets PostgreSQL via the official Prisma adapter.
 *   - Keeps ARIOT's custom model/field names via `modelName` + `fields` mapping
 *     (docs/07_DECISIONS.md D-035, docs/08_KNOWN_ISSUES.md — I-017 closed).
 *   - Reads BETTER_AUTH_SECRET / BETTER_AUTH_URL through typed `server/env.ts`.
 *
 * Origin/trust posture (Step 2.2.3, TASK 4):
 *   - `trustHost` is intentionally REMOVED. We use an explicit `baseURL`
 *     (BETTER_AUTH_URL) plus an explicit `trustedOrigins` list instead of
 *     trusting arbitrary forwarded-host headers. A `http://localhost:3000`
 *     dev fallback is applied only outside production.
 *
 * Google provider (Step 2.2.3, TASK 3):
 *   - Enabled ONLY when both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
 *   - `disableSignUp: true` — unknown Google users cannot create ARIOT accounts.
 *   - Minimum identity scopes only (`openid`, `email`, `profile`); no Drive,
 *     Calendar, Gmail, contacts, or other Google API access; no One Tap.
 *
 * This step does NOT yet:
 *   - build middleware/proxy, RBAC guards, or admin routes (Step 2.2.4 complete);
 *   - implement custom password auth or public registration;
 *   - expose admin routes (Step 2.3.1+).
 *
 * Authorization (RBAC) remains the ARIOT `Role`/`UserRole`/`Permission` model
 * in `server/auth/permissions.ts` (later step), not Better Auth role fields.
 */

const DEV_ORIGIN = 'http://localhost:3000';

function resolveBaseURL(): string {
  // Prefer the explicit auth base URL; fall back to the public site URL
  // (NEXT_PUBLIC_SITE_URL, defaults to localhost:3000) so the auth server
  // always has a resolvable origin. In production both should equal the real
  // ARIOT domain — never an arbitrary forwarded-host value.
  return env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_SITE_URL ?? DEV_ORIGIN;
}

function resolveTrustedOrigins(): string[] {
  const origins = new Set<string>();
  for (const url of [env.BETTER_AUTH_URL, env.NEXT_PUBLIC_SITE_URL]) {
    if (!url) continue;
    try {
      origins.add(new URL(url).origin);
    } catch {
      // Invalid URL is validated elsewhere; ignore here to avoid crashing boot.
    }
  }
  return [...origins];
}

const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

function createAuth() {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: resolveBaseURL(),
    trustedOrigins: resolveTrustedOrigins(),
    user: {
      modelName: 'User',
      fields: {
        image: 'avatarUrl',
      },
    },
    session: {
      modelName: 'Session',
      fields: {
        token: 'tokenHash',
        ipAddress: 'ip',
      },
    },
    account: {
      modelName: 'Account',
      /**
       * Encrypt OAuth tokens at rest using AES-256-GCM (Step 2.2.5, D-040).
       *
       * Stored OAuth tokens (access, refresh, ID) are encrypted with the same
       * BETTER_AUTH_SECRET used for session signing. This protects token data
       * if the database is ever compromised. No additional key is introduced.
       * Tokens are never logged or exposed to the client.
       */
      encryptOAuthTokens: true,
      /**
       * Account-linking policy (Step 2.2.5, D-039).
       *
       * The bootstrap pre-provisions a User with the approved admin email but
       * no OAuth Account row. When the admin signs in with Google for the first
       * time, Better Auth must automatically link that Google account to the
       * pre-provisioned User — this requires implicit linking to be enabled.
       *
       * - enabled: true              — account linking is allowed
       * - disableImplicitLinking: false — automatic link on matching-email sign-in
       * - allowDifferentEmails: false — a different Google email MUST NOT link
       * - updateUserInfoOnLink: false — do not overwrite our admin's name/avatar
       */
      accountLinking: {
        enabled: true,
        disableImplicitLinking: false,
        allowDifferentEmails: false,
        updateUserInfoOnLink: false,
      },
    },
    verification: {
      modelName: 'Verification',
    },
    socialProviders: googleEnabled
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
            // Identity scopes only — do not request Drive/Calendar/Gmail/contacts.
            scope: ['openid', 'email', 'profile'],
            // Unknown Google users must not be able to create ARIOT accounts.
            disableSignUp: true,
          },
        }
      : {},
  });
}

/**
 * Lazily-constructed Better Auth instance.
 *
 * `betterAuth()` is invoked on first property access, never at module import.
 * This keeps the Phase 1 static build green when auth env vars (notably
 * `BETTER_AUTH_SECRET`) are absent — Next.js still evaluates this module graph
 * for `/sign-in` and `/admin` during "collect page data", but it must not
 * throw merely from importing it. The clear configuration error surfaces the
 * moment authentication is actually used at runtime.
 */
let authInstance: ReturnType<typeof createAuth> | undefined;
function getAuthInstance(): ReturnType<typeof createAuth> {
  if (!authInstance) authInstance = createAuth();
  return authInstance;
}

export const auth = new Proxy({} as ReturnType<typeof createAuth>, {
  get(_target, prop) {
    return getAuthInstance()[prop as keyof ReturnType<typeof createAuth>];
  },
}) as ReturnType<typeof createAuth>;

/**
 * Minimal server-side session read — Step 2.2.3 (TASK 9), reused by 2.2.4 RBAC.
 *
 * Returns the active session (with user) or `null` when unauthenticated.
 * This is AUTHENTICATION only: it grants no roles, no permissions, and must
 * not be used to infer admin access. RBAC lives in `server/auth/permissions.ts`.
 *
 * @param requestHeaders Optional request `Headers`. When omitted, the current
 *   Next.js request headers are resolved via `next/headers`. Route handlers may
 *   pass the incoming `Request.headers` explicitly.
 */
export async function getSession(requestHeaders?: Headers) {
  const resolvedHeaders = requestHeaders ?? (await headers());
  return auth.api.getSession({ headers: resolvedHeaders });
}
