/**
 * Typed authorization errors — Step 2.2.4 (TASK 2).
 *
 * Two distinct, distinguishable failures:
 *   - AuthenticationError  → no valid session (HTTP 401)
 *   - AuthorizationError   → valid session, but missing role/permission (HTTP 403)
 *
 * These are domain errors only. They do NOT build a `NextResponse` — route
 * handlers and server actions translate them into responses using the
 * `httpStatus` / `code` fields. Messages are user-safe: no tokens, roles,
 * assignments, or database details are exposed.
 */

export class AuthzError extends Error {
  /** Stable machine-readable code for route handlers / server actions. */
  readonly code: string;
  /** HTTP semantics for the eventual response. */
  readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus: number) {
    super(message);
    this.name = 'AuthzError';
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

/** No valid session (or suspended/deleted/invalid user). */
export class AuthenticationError extends AuthzError {
  constructor() {
    super('AUTHENTICATION_REQUIRED', 'Authentication is required to access this resource.', 401);
    this.name = 'AuthenticationError';
  }
}

/** Valid session, but the caller lacks the required role or permission. */
export class AuthorizationError extends AuthzError {
  constructor() {
    super('AUTHORIZATION_DENIED', 'You do not have permission to access this resource.', 403);
    this.name = 'AuthorizationError';
  }
}
