/**
 * tests/product-api-route-security.test.ts — Step 2.4.3 API route security.
 *
 * Verifies the route file's security contract through content inspection:
 *   - Imports only updateProductDetails (not the executor or factory)
 *   - Does not accept actor/permission/role fields from request
 *   - Returns only sanitized error shapes
 *   - Does not import test dependencies
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/product-api-route-security.test.ts
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const routePath = resolve(process.cwd(), 'app/api/admin/products/update-details/route.ts');
const routeContent = readFileSync(routePath, 'utf8');

describe('API route security contract', () => {
  it('imports updateProductDetails', () => {
    assert.ok(
      routeContent.includes('import { updateProductDetails }'),
      'Route must import updateProductDetails',
    );
  });

  it('does NOT import executeProductDetailsUpdate', () => {
    assert.ok(
      !routeContent.includes('executeProductDetailsUpdate'),
      'Route must not import the internal executor',
    );
  });

  it('does NOT import createAuthorizedProductDetailsUpdater', () => {
    assert.ok(
      !routeContent.includes('createAuthorizedProductDetailsUpdater'),
      'Route must not import the orchestration factory directly',
    );
  });

  it('does NOT import test dependencies', () => {
    assert.ok(!routeContent.includes('node:test'), 'No test runner imports');
    assert.ok(!routeContent.includes('node:assert'), 'No assert imports');
    assert.ok(!routeContent.includes('vitest'), 'No vitest imports');
    assert.ok(!routeContent.includes('jest'), 'No jest imports');
  });

  it('does NOT accept userId from request body', () => {
    // The route passes `body` directly to updateProductDetails
    // Check it doesn't destructure or reference actor fields
    assert.ok(!routeContent.includes('userId'), 'Must not reference userId');
  });

  it('does NOT accept roles from request body', () => {
    assert.ok(!routeContent.includes('roles'), 'Must not reference roles');
  });

  it('does NOT accept permissions from request body', () => {
    assert.ok(!routeContent.includes('permissions'), 'Must not reference permissions');
  });

  it('does NOT accept actor from request body', () => {
    assert.ok(!routeContent.includes('actor'), 'Must not reference actor');
  });

  it('does NOT accept authorization context from request', () => {
    assert.ok(
      !routeContent.includes('authorizationContext') &&
        !routeContent.includes('AuthorizationContext'),
      'Must not reference authorization context',
    );
  });

  it('retains strict request parsing (passes raw body)', () => {
    // Route calls updateProductDetails(body) — schema validates inside
    assert.ok(routeContent.includes('request.json()'), 'Must parse request JSON');
    assert.ok(
      routeContent.includes('updateProductDetails(body)'),
      'Must pass parsed body to updateProductDetails',
    );
  });

  it('returns sanitized errors only (500 handler)', () => {
    // The catch block returns a generic error
    assert.ok(
      routeContent.includes("'Internal server error.'"),
      'Must return sanitized 500 message',
    );
  });

  it('does NOT expose Prisma codes, SQL, or stack traces', () => {
    assert.ok(!routeContent.includes('stack'), 'No stack exposure');
    assert.ok(!routeContent.includes('Prisma'), 'No Prisma exposure');
    assert.ok(!routeContent.includes('SQL'), 'No SQL exposure');
    assert.ok(!routeContent.includes('credential'), 'No credential exposure');
    assert.ok(!routeContent.includes('session'), 'No session data exposure');
  });

  it('maps error types to correct HTTP status codes', () => {
    assert.ok(routeContent.includes('403'), 'forbidden → 403');
    assert.ok(routeContent.includes('409'), 'conflict → 409');
    assert.ok(routeContent.includes('404'), 'not_found → 404');
    assert.ok(routeContent.includes('400'), 'validation → 400');
    assert.ok(routeContent.includes('500'), 'error → 500');
  });
});
