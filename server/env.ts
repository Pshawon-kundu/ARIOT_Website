import { z } from 'zod';
import { isAbsolute } from 'node:path';

/**
 * Type-safe environment variable validation.
 *
 * Adding a new env var:
 *   1. Add it to `.env.example` with a comment explaining its purpose.
 *   2. Add it to `serverSchema` (server-only) or `clientSchema` (NEXT_PUBLIC_).
 *   3. Reference it via `env.YOUR_VAR` — never `process.env.YOUR_VAR` directly.
 *
 * Validation runs at module load. A missing or malformed env throws at boot —
 * that is intentional. Configuration errors must surface immediately, not
 * silently corrupt runtime behavior (per AGENTS.md §9 security baseline).
 */

const isUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isAbsolutePath = (value: string): boolean => isAbsolute(value);

/**
 * Returns the byte length of a base64 or base64url-encoded string, accepting
 * either encoding regardless of padding. Returns 0 if the value is not valid
 * base64/base64url.
 */
const base64DecodedByteLength = (value: string): number => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  try {
    const buf = Buffer.from(padded, 'base64');
    // Buffer.from('junk', 'base64') returns a non-empty buffer even when the
    // input is not valid base64. Reject by checking that re-encoding matches.
    const reEncoded = buf.toString('base64').replace(/=+$/, '');
    const stripped = normalized.replace(/=+$/, '');
    return reEncoded === stripped ? buf.length : 0;
  } catch {
    return 0;
  }
};

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /**
   * DATABASE_URL is OPTIONAL at the base env layer.
   *
   * Rationale: `server/env.ts` is imported by the root layout, so it is
   * evaluated for every page at boot. The Phase 1 public site is fully
   * static/SSG and never opens a database connection, so a Phase 1 deploy
   * must not fail when DATABASE_URL is absent. Phase 2 database-backed code
   * (e.g. a future `server/db.ts`) MUST assert DATABASE_URL presence itself
   * before opening a connection — see docs/08_KNOWN_ISSUES.md (I-015).
   */
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string.').optional(),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required for email delivery.').optional(),
  /**
   * BETTER_AUTH_SECRET — HMAC secret for Better Auth session/JWT signing.
   * Required in production; in development Better Auth auto-generates a fallback.
   * Generate with `openssl rand -base64 32`.
   * Added in Step 2.2.2 (Better Auth foundation). Optional at base env layer so a
   * Phase 1 static deploy boots without auth configured.
   */
  BETTER_AUTH_SECRET: z
    .string()
    .min(1, 'BETTER_AUTH_SECRET is required for production auth.')
    .optional(),
  /**
   * BETTER_AUTH_URL — public base URL of the auth server (e.g. https://ariot.tech).
   * Used for callback/redirect URLs and as the trusted origin. Optional; a
   * `http://localhost:3000` dev fallback is applied in `server/auth.ts` when unset.
   */
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a fully-qualified URL.').optional(),
  /**
   * GOOGLE_CLIENT_ID — OAuth client ID for the Google provider (Step 2.2.3).
   * Must be set together with `GOOGLE_CLIENT_SECRET`. Public signup is disabled,
   * so these credentials only authenticate pre-approved/allowlisted admins once
   * admin bootstrap (Step 2.2.5) is in place.
   */
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID must not be empty.').optional(),
  /**
   * GOOGLE_CLIENT_SECRET — OAuth client secret for the Google provider (Step 2.2.3).
   * Must be set together with `GOOGLE_CLIENT_ID`. Never logged.
   */
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET must not be empty.').optional(),
  /**
   * Cloudflare R2 — media storage for the admin media library (Step 2.4.4,
   * STORAGE-1R / D-067). One bucket per environment.
   *
   * R2 is OPTIONAL at the base env layer (a Phase 1 static deploy has no media
   * storage and must still boot). R2-backed server code MUST call
   * `getR2Config()` before use. If any R2_* variable is present, the whole set
   * must be present — partial config fails fast below.
   */
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID must not be empty.').optional(),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID must not be empty.').optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY must not be empty.').optional(),
  R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME must not be empty.').optional(),
  /**
   * R2_PUBLIC_BASE_URL — public base URL for R2 media (e.g. https://media.ariot.tech).
   * Optional: when unset, media URLs fall back to site-relative `/{storageKey}`
   * paths (see server/admin/products/get-product-media.ts).
   */
  R2_PUBLIC_BASE_URL: z
    .string()
    .url('R2_PUBLIC_BASE_URL must be a fully-qualified URL.')
    .optional(),
  /**
   * MEDIA_UPLOAD_TOKEN_SECRET — HMAC-SHA256 signing secret for upload completion
   * tokens (STORAGE-1R / D-067). Must decode to at least 32 raw bytes when
   * interpreted as base64 or base64url; raw-string length must also be ≥ 32.
   * Generate with `openssl rand -base64 32`. Never logged.
   */
  MEDIA_UPLOAD_TOKEN_SECRET: z
    .string()
    .min(32, 'MEDIA_UPLOAD_TOKEN_SECRET must be at least 32 characters.')
    .refine(
      (v) => base64DecodedByteLength(v) >= 32,
      'MEDIA_UPLOAD_TOKEN_SECRET must decode to at least 32 bytes (base64 or base64url).',
    )
    .optional(),
  /**
   * MEDIA_STORAGE_PROVIDER — active media storage provider (D-068).
   * 'local' = persistent VPS filesystem (default in development); 'r2' =
   * Cloudflare R2 (STORAGE-1R / D-067). Optional at boot (Phase 1 static
   * deploy has no media storage); the provider selector
   * (server/storage/get-media-storage-provider.ts) fails closed in production
   * when unset. An unknown value throws at boot.
   */
  MEDIA_STORAGE_PROVIDER: z
    .enum(['local', 'r2'], { message: 'MEDIA_STORAGE_PROVIDER must be "local" or "r2".' })
    .optional(),
  /**
   * MEDIA_LOCAL_ROOT — absolute provider root for the `local` provider
   * (e.g. /var/lib/ariot/media). Must be an absolute path; the provider
   * additionally rejects roots containing `..` or inside the Next.js
   * `public/` directory (see server/storage/media-storage-config.ts).
   * Required in production when MEDIA_STORAGE_PROVIDER=local.
   */
  MEDIA_LOCAL_ROOT: z
    .string()
    .refine(isAbsolutePath, 'MEDIA_LOCAL_ROOT must be an absolute path.')
    .optional(),
  /**
   * MEDIA_PUBLIC_BASE_URL — optional external origin for locally served media
   * (e.g. https://media.ariot.tech). When unset, local media URLs are
   * site-relative (`/media/...`).
   */
  MEDIA_PUBLIC_BASE_URL: z
    .string()
    .url('MEDIA_PUBLIC_BASE_URL must be a fully-qualified URL.')
    .optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .default('http://localhost:3000')
    .refine(isUrl, 'NEXT_PUBLIC_SITE_URL must be a fully-qualified URL.'),
  /** Plausible Analytics domain — e.g. "ariot.tech". Optional in dev. */
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
});

const serverEnv = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
  MEDIA_UPLOAD_TOKEN_SECRET: process.env.MEDIA_UPLOAD_TOKEN_SECRET,
  MEDIA_STORAGE_PROVIDER: process.env.MEDIA_STORAGE_PROVIDER,
  MEDIA_LOCAL_ROOT: process.env.MEDIA_LOCAL_ROOT,
  MEDIA_PUBLIC_BASE_URL: process.env.MEDIA_PUBLIC_BASE_URL,
});

const clientEnv = clientSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
});

/**
 * During `next build`, Next.js evaluates this module while collecting
 * configuration for every route (including the static `/_not-found` page)
 * *before* a real request exists. A malformed-but-optional value (or a value
 * absent in the build environment) must not hard-kill a static deploy — the
 * Phase 1 public site is fully static and never opens a DB/connection at boot.
 *
 * We therefore downgrade validation failures to warnings during the build
 * phase and only fail fast at actual runtime. This preserves the AGENTS.md §9
 * security intent (misconfiguration surfaces immediately in production) while
 * keeping Vercel/static builds green.
 */
const isNextBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!serverEnv.success) {
  if (isNextBuildPhase) {
    console.warn(
      '[env] Server environment variables are invalid during build (this is non-fatal for static generation):',
      serverEnv.error.flatten().fieldErrors,
    );
  } else {
    console.error('Invalid server environment variables:', serverEnv.error.flatten().fieldErrors);
    throw new Error('Invalid server environment variables. See server/env.ts.');
  }
}

if (!clientEnv.success) {
  if (isNextBuildPhase) {
    console.warn(
      '[env] Client environment variables are invalid during build (this is non-fatal for static generation):',
      clientEnv.error.flatten().fieldErrors,
    );
  } else {
    console.error('Invalid client environment variables:', clientEnv.error.flatten().fieldErrors);
    throw new Error('Invalid client environment variables. See server/env.ts.');
  }
}

// Google OAuth credentials must be configured as a pair. A single value present
// without its counterpart is a misconfiguration that would fail at the provider
// boundary; fail fast with a clear, non-secret-leaking message.
// `serverData` falls back to an empty object so the checks below never throw a
// TypeError during the build phase (when a failed parse leaves `.data` undefined).
const serverData = (serverEnv.success ? serverEnv.data : {}) as Record<string, unknown>;
const googleId = serverData.GOOGLE_CLIENT_ID as string | undefined;
const googleSecret = serverData.GOOGLE_CLIENT_SECRET as string | undefined;
if ((googleId && !googleSecret) || (!googleId && googleSecret)) {
  const message =
    'Google OAuth misconfigured: set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or neither.';
  if (isNextBuildPhase) {
    console.warn(`[env] ${message}`);
  } else {
    throw new Error(message);
  }
}

// R2 storage must be configured as a complete set. A partial set (e.g. only
// ACCESS_KEY_ID) would fail at the S3 boundary with a confusing signature
// error; fail fast at boot instead. When the full set is present, the upload
// token secret is required too — completion tokens are part of the same flow.
const r2Values = [
  serverData.R2_ACCOUNT_ID,
  serverData.R2_ACCESS_KEY_ID,
  serverData.R2_SECRET_ACCESS_KEY,
  serverData.R2_BUCKET_NAME,
] as const;
const r2PresentCount = r2Values.filter((value) => value !== undefined).length;
if (r2PresentCount > 0 && r2PresentCount < r2Values.length) {
  const message =
    'R2 storage misconfigured: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME must all be set together.';
  if (isNextBuildPhase) {
    console.warn(`[env] ${message}`);
  } else {
    throw new Error(message);
  }
}
if (r2PresentCount === r2Values.length && !serverData.MEDIA_UPLOAD_TOKEN_SECRET) {
  const message =
    'R2 storage misconfigured: MEDIA_UPLOAD_TOKEN_SECRET is required when R2 storage is enabled.';
  if (isNextBuildPhase) {
    console.warn(`[env] ${message}`);
  } else {
    throw new Error(message);
  }
}

/**
 * `safeParse(...).data` in zod v4 is typed `Output | undefined`, so a plain
 * spread would widen every field (including `.default()`-ed ones like
 * NODE_ENV) to `T | undefined`. We assert the output type instead — at runtime
 * the data is always present once validation passes (and during the Vercel
 * build phase we deliberately tolerate a partial/missing object without
 * throwing, which is safe for static generation).
 */
type ServerOutput = z.infer<typeof serverSchema>;
type ClientOutput = z.infer<typeof clientSchema>;

export const env = (
  serverEnv.success && clientEnv.success
    ? { ...serverEnv.data, ...clientEnv.data }
    : { ...(serverEnv.data ?? {}), ...(clientEnv.data ?? {}) }
) as ServerOutput & ClientOutput;

export type Env = typeof env;

export function getDatabaseUrl(): string {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required before using database-backed server code.');
  }

  return env.DATABASE_URL;
}

/**
 * R2 storage configuration. Asserts that the full R2 set is present — call this
 * from any R2-backed server module (initiate/complete routes, storage service)
 * instead of reading `env.R2_*` directly.
 */
export function getR2Config(): R2Config {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
    R2_PUBLIC_BASE_URL,
    MEDIA_UPLOAD_TOKEN_SECRET,
  } = env;

  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET_NAME ||
    !MEDIA_UPLOAD_TOKEN_SECRET
  ) {
    throw new Error(
      'R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, ' +
        'R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and MEDIA_UPLOAD_TOKEN_SECRET.',
    );
  }

  return {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucketName: R2_BUCKET_NAME,
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    publicBaseUrl: R2_PUBLIC_BASE_URL,
    uploadTokenSecret: MEDIA_UPLOAD_TOKEN_SECRET,
  };
}

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  /** S3-compatible API endpoint derived from the account ID. */
  endpoint: string;
  /** Optional public URL prefix for served media; falls back to site-relative. */
  publicBaseUrl?: string;
  uploadTokenSecret: string;
};
