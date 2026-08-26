/**
 * tests/product-auth-wrapper.test.ts — Step 2.4.3 authorization orchestration.
 *
 * Exercises the SAME createAuthorizedProductDetailsUpdater() factory used by
 * production updateProductDetails(). Tests inject controlled authorize/execute
 * dependencies to prove the orchestration's gating behavior.
 *
 * Previous approach (separate createTestableWrapper using hasPermission) is
 * removed — these tests now share the production orchestration code path.
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/product-auth-wrapper.test.ts
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  createAuthorizedProductDetailsUpdater,
  type AuthorizeFn,
  type ExecuteUpdateFn,
} from '../server/admin/products/authorized-product-update.ts';
import { hasPermission, PERMISSIONS } from '../server/auth/permission-catalog.ts';
import { AuthorizationError } from '../server/auth/errors.ts';

// ── Test helpers ─────────────────────────────────────────────────────────────

/** Simulates requirePermission behavior for a given permission set. */
function createControlledAuthorize(grantedPermissions: readonly string[]): AuthorizeFn {
  return async () => {
    const required = PERMISSIONS.products.write;
    if (!hasPermission(grantedPermissions, required)) {
      throw new AuthorizationError();
    }
    return { userId: 'test-user-id', roles: ['CONTENT_ADMIN'] };
  };
}

/** Creates a spy executor that tracks calls and returns success. */
function createSpyExecutor() {
  let callCount = 0;
  let lastInput: unknown = undefined;
  let lastActor: unknown = undefined;

  const executor: ExecuteUpdateFn = async (rawInput, actor) => {
    callCount++;
    lastInput = rawInput;
    lastActor = actor;
    return { ok: true as const, updatedAt: '2026-01-01T00:00:00.000Z', changedFields: ['name'] };
  };

  return {
    executor,
    getCallCount: () => callCount,
    getLastInput: () => lastInput,
    getLastActor: () => lastActor,
  };
}

/** Creates an executor that throws (simulates DB/runtime failure). */
function createFailingExecutor(error: Error): ExecuteUpdateFn {
  return async () => {
    throw error;
  };
}

const DUMMY_INPUT = { productId: 'p1', expectedUpdatedAt: '2026-01-01', data: {} };

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Authorization orchestration contract (shared factory)', () => {
  it('1. products.write — authorization succeeds, executor called once', async () => {
    const { executor, getCallCount } = createSpyExecutor();
    const updater = createAuthorizedProductDetailsUpdater({
      authorize: createControlledAuthorize(['products.write']),
      executeUpdate: executor,
    });

    const result = await updater(DUMMY_INPUT);
    assert.strictEqual(result.ok, true);
    assert.strictEqual(getCallCount(), 1);
  });

  it('2. global "*" — authorization succeeds, executor called once', async () => {
    const { executor, getCallCount } = createSpyExecutor();
    const updater = createAuthorizedProductDetailsUpdater({
      authorize: createControlledAuthorize(['*']),
      executeUpdate: executor,
    });

    const result = await updater(DUMMY_INPUT);
    assert.strictEqual(result.ok, true);
    assert.strictEqual(getCallCount(), 1);
  });

  it('3. products.read only — authorization denied, executor called zero times', async () => {
    const { executor, getCallCount } = createSpyExecutor();
    const updater = createAuthorizedProductDetailsUpdater({
      authorize: createControlledAuthorize(['products.read']),
      executeUpdate: executor,
    });

    const result = await updater(DUMMY_INPUT);
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.strictEqual(result.type, 'forbidden');
    assert.strictEqual(getCallCount(), 0);
  });

  it('4. empty permissions — authorization denied, executor called zero times', async () => {
    const { executor, getCallCount } = createSpyExecutor();
    const updater = createAuthorizedProductDetailsUpdater({
      authorize: createControlledAuthorize([]),
      executeUpdate: executor,
    });

    const result = await updater(DUMMY_INPUT);
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.strictEqual(result.type, 'forbidden');
    assert.strictEqual(getCallCount(), 0);
  });

  it('5. products.* — authorization denied, executor called zero times', async () => {
    const { executor, getCallCount } = createSpyExecutor();
    const updater = createAuthorizedProductDetailsUpdater({
      authorize: createControlledAuthorize(['products.*']),
      executeUpdate: executor,
    });

    const result = await updater(DUMMY_INPUT);
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.strictEqual(result.type, 'forbidden');
    assert.strictEqual(getCallCount(), 0);
  });

  it('6. unknown permission — authorization denied, executor called zero times', async () => {
    const { executor, getCallCount } = createSpyExecutor();
    const updater = createAuthorizedProductDetailsUpdater({
      authorize: createControlledAuthorize(['unknown.perm']),
      executeUpdate: executor,
    });

    const result = await updater(DUMMY_INPUT);
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.strictEqual(result.type, 'forbidden');
    assert.strictEqual(getCallCount(), 0);
  });

  it('7. invalid context (authorize throws non-AuthorizationError) — denied, executor zero', async () => {
    const { executor, getCallCount } = createSpyExecutor();
    const updater = createAuthorizedProductDetailsUpdater({
      authorize: async () => {
        throw new Error('Session expired or user inactive');
      },
      executeUpdate: executor,
    });

    const result = await updater(DUMMY_INPUT);
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.strictEqual(result.type, 'forbidden');
    assert.strictEqual(getCallCount(), 0);
  });

  it('8. valid auth + executor failure — called once, result sanitized', async () => {
    const prismaError = new Error(
      'PrismaClientKnownRequestError: P2002 Unique constraint violation on Product.slug',
    );
    (prismaError as unknown as Record<string, unknown>).code = 'P2002';
    (prismaError as unknown as Record<string, unknown>).meta = { target: ['slug'] };
    Object.defineProperty(prismaError, 'stack', {
      value:
        'Error: PrismaClientKnownRequestError\n    at /server/db.ts:42:5\n    at processTicksAndRejections',
    });

    const failingExecutor = createFailingExecutor(prismaError);
    let executorCallCount = 0;
    const countingExecutor: ExecuteUpdateFn = async (input, actor) => {
      executorCallCount++;
      return failingExecutor(input, actor);
    };

    const updater = createAuthorizedProductDetailsUpdater({
      authorize: createControlledAuthorize(['products.write']),
      executeUpdate: countingExecutor,
    });

    const result = await updater(DUMMY_INPUT);

    // Executor was called exactly once
    assert.strictEqual(executorCallCount, 1);

    // Result is a sanitized error
    assert.strictEqual(result.ok, false);
    if (!result.ok) {
      assert.strictEqual(result.type, 'error');
      const msg = 'message' in result ? (result.message as string) : '';
      // No raw stack trace, Prisma error code, SQL, or credential exposed
      assert.ok(!msg.includes('P2002'), 'Must not expose Prisma error code');
      assert.ok(!msg.includes('Unique constraint'), 'Must not expose constraint details');
      assert.ok(!msg.includes('stack'), 'Must not expose stack trace');
      assert.ok(!msg.includes('/server/'), 'Must not expose file paths');
      assert.strictEqual(msg, 'Internal server error.');
    }
  });

  // ── Additional coverage ──────────────────────────────────────────────────

  it('products.write among other permissions permits execution', async () => {
    const { executor, getCallCount } = createSpyExecutor();
    const updater = createAuthorizedProductDetailsUpdater({
      authorize: createControlledAuthorize(['products.read', 'products.write', 'blog.read']),
      executeUpdate: executor,
    });

    const result = await updater(DUMMY_INPUT);
    assert.strictEqual(result.ok, true);
    assert.strictEqual(getCallCount(), 1);
  });

  it('products.read + blog.write + media.write does not permit execution', async () => {
    const { executor, getCallCount } = createSpyExecutor();
    const updater = createAuthorizedProductDetailsUpdater({
      authorize: createControlledAuthorize(['products.read', 'blog.write', 'media.write']),
      executeUpdate: executor,
    });

    const result = await updater(DUMMY_INPUT);
    assert.strictEqual(result.ok, false);
    assert.strictEqual(getCallCount(), 0);
  });

  it('actor context is passed to executor correctly', async () => {
    const { executor, getLastActor } = createSpyExecutor();
    const updater = createAuthorizedProductDetailsUpdater({
      authorize: async () => ({ userId: 'actor-123', roles: ['SUPER_ADMIN'] }),
      executeUpdate: executor,
    });

    await updater(DUMMY_INPUT);
    const actor = getLastActor() as { userId: string; roles: string[] };
    assert.strictEqual(actor.userId, 'actor-123');
    assert.deepStrictEqual(actor.roles, ['SUPER_ADMIN']);
  });

  it('raw input is passed to executor unchanged', async () => {
    const { executor, getLastInput } = createSpyExecutor();
    const updater = createAuthorizedProductDetailsUpdater({
      authorize: createControlledAuthorize(['products.write']),
      executeUpdate: executor,
    });

    const specificInput = { productId: 'xyz', data: { name: 'test' } };
    await updater(specificInput);
    assert.deepStrictEqual(getLastInput(), specificInput);
  });
});
