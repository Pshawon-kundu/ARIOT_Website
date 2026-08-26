import { createAuthClient } from 'better-auth/react';

/**
 * Shared Better Auth React client — single instance for the whole app.
 *
 * No secrets, no server-only imports. `baseURL` is omitted on purpose so the
 * client talks to the same origin that served the page (Better Auth infers
 * `window.location.origin`); the server route (`app/api/auth/[...all]`) owns
 * the canonical `baseURL`/`trustedOrigins` configuration.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, useSession } = authClient;
