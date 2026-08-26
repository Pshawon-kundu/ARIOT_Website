/**
 * Shared authorization orchestration factory — Step 2.4.3.
 *
 * Single implementation used by BOTH:
 *   - Production updateProductDetails() (with real auth + real executor)
 *   - Authorization contract tests (with controlled stubs)
 *
 * This eliminates the previous separate test-only wrapper that duplicated
 * authorization logic using a different code path.
 *
 * Architecture:
 *   1. authorize() — resolves caller identity + verifies permission
 *   2. executeUpdate() — performs the validated mutation
 *   3. Error sanitization — executor failures never leak internals
 */

// ── Result type (re-exported from update-product-details) ────────────────────

export type OrchestrationResult =
  | { ok: true; [key: string]: unknown }
  | { ok: false; type: 'forbidden'; message: string }
  | { ok: false; type: string; message?: string; [key: string]: unknown };

// ── Dependency contracts ─────────────────────────────────────────────────────

/** Resolves the authenticated actor. Throws on denial or missing session. */
export type AuthorizeFn = () => Promise<{ userId: string; roles: string[] }>;

/** Performs the validated mutation. May throw on DB/logic failure. */
export type ExecuteUpdateFn = (
  rawInput: unknown,
  actor: { userId: string; roles: string[] },
) => Promise<OrchestrationResult>;

export interface ProductDetailsOrchestrationDeps {
  /** Authenticate + authorize the caller. Must throw to deny. */
  authorize: AuthorizeFn;
  /** Execute the product details update after authorization succeeds. */
  executeUpdate: ExecuteUpdateFn;
}

// ── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates an authorized product details updater.
 *
 * The returned function:
 *   1. Calls authorize() — if it throws, returns { ok: false, type: 'forbidden' }.
 *   2. Calls executeUpdate() with the raw input and resolved actor.
 *   3. If executeUpdate() throws, returns a sanitized error (no stack/SQL/creds).
 */
export function createAuthorizedProductDetailsUpdater(deps: ProductDetailsOrchestrationDeps) {
  return async function authorizedProductDetailsUpdate(
    rawInput: unknown,
  ): Promise<OrchestrationResult> {
    // Step 1: Authorization gate
    let actor: { userId: string; roles: string[] };
    try {
      actor = await deps.authorize();
    } catch {
      return { ok: false, type: 'forbidden', message: 'Insufficient permissions.' };
    }

    // Step 2: Execute mutation
    try {
      return await deps.executeUpdate(rawInput, actor);
    } catch {
      // Step 3: Sanitize executor failures — never expose internals
      return { ok: false, type: 'error', message: 'Internal server error.' };
    }
  };
}
