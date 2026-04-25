import { z } from 'zod';

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

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .default('http://localhost:3000')
    .refine(isUrl, 'NEXT_PUBLIC_SITE_URL must be a fully-qualified URL.'),
});

const serverEnv = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
});

const clientEnv = clientSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!serverEnv.success) {
  console.error(
    'Invalid server environment variables:',
    serverEnv.error.flatten().fieldErrors,
  );
  throw new Error('Invalid server environment variables. See server/env.ts.');
}

if (!clientEnv.success) {
  console.error(
    'Invalid client environment variables:',
    clientEnv.error.flatten().fieldErrors,
  );
  throw new Error('Invalid client environment variables. See server/env.ts.');
}

export const env = {
  ...serverEnv.data,
  ...clientEnv.data,
} as const;

export type Env = typeof env;
