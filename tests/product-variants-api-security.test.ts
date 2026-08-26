/**
 * tests/product-variants-api-security.test.ts — Step 2.4.5 variant route security.
 *
 * Verifies the variants route file's security contract through content inspection
 * (same approach as product-api-route-security.test.ts):
 *   - Imports only the three public mutation services (create/update/archive)
 *   - Never imports internal helpers, the schema, or the executor internals
 *   - Does not accept actor/permission/role fields from request
 *   - Returns only sanitized error shapes, never Prisma/SQL/stack data
 *   - Maps error types to correct HTTP status codes
 *   - Rejects unknown actions and missing payloads
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/product-variants-api-security.test.ts
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const routePath = resolve(process.cwd(), 'app/api/admin/products/variants/route.ts');
const routeContent = readFileSync(routePath, 'utf8');

describe('Variants API route security contract', () => {
  it('imports all three public mutation services', () => {
    assert.ok(
      routeContent.includes('import { createProductVariant }'),
      'must import createProductVariant',
    );
    assert.ok(
      routeContent.includes('import { updateProductVariant }'),
      'must import updateProductVariant',
    );
    assert.ok(
      routeContent.includes('import { archiveProductVariant }'),
      'must import archiveProductVariant',
    );
  });

  it('does NOT import the mutation helper module', () => {
    // Only the result TYPE import from helpers is allowed — the functions must
    // never be reachable from the route.
    assert.ok(
      routeContent.includes(
        "import type { VariantMutationResult } from '@/server/admin/products/product-variant-mutation-helpers'",
      ),
      'helpers imported as type-only result type',
    );
    assert.ok(
      !routeContent.includes('import { requireProductWrite }'),
      'must not import requireProductWrite',
    );
    assert.ok(
      !routeContent.includes('import { requirePermission }'),
      'must not import requirePermission',
    );
  });

  it('does NOT import the schema module', () => {
    assert.ok(
      !routeContent.includes('product-variant-schema'),
      'route must not import the schema module',
    );
  });

  it('does NOT import test dependencies', () => {
    assert.ok(!routeContent.includes('node:test'), 'No test runner imports');
    assert.ok(!routeContent.includes('node:assert'), 'No assert imports');
    assert.ok(!routeContent.includes('vitest'), 'No vitest imports');
    assert.ok(!routeContent.includes('jest'), 'No jest imports');
  });

  it('does NOT accept actor, userId, roles, or permissions from the request', () => {
    assert.ok(!routeContent.includes('actor'), 'No actor field');
    assert.ok(!routeContent.includes('userId'), 'No userId field');
    assert.ok(!routeContent.includes('roles'), 'No roles field');
    assert.ok(!routeContent.includes('permissions'), 'No permissions field');
    assert.ok(
      !routeContent.includes('authorizationContext') &&
        !routeContent.includes('AuthorizationContext'),
      'No authorization context',
    );
  });

  it('parses request JSON and dispatches on action', () => {
    assert.ok(routeContent.includes('request.json()'), 'parses request JSON');
    assert.ok(routeContent.includes('const action = body?.action'), 'reads action from body');
  });

  it('rejects a missing action and an unknown action as 400 validation', () => {
    assert.ok(routeContent.includes("'Missing action field.'"), 'missing action message');
    assert.ok(routeContent.includes("'Unknown action.'"), 'unknown action message');
    assert.ok(routeContent.includes('{ status: 400 }'), 'both paths return 400');
  });

  it('passes the raw payload to each mutation service', () => {
    assert.ok(
      routeContent.includes('createProductVariant(body.payload)'),
      'create receives body.payload',
    );
    assert.ok(
      routeContent.includes('updateProductVariant(body.payload)'),
      'update receives body.payload',
    );
    assert.ok(
      routeContent.includes('archiveProductVariant(body.payload)'),
      'archive receives body.payload',
    );
  });

  it('maps error types to correct HTTP status codes', () => {
    assert.ok(routeContent.includes('403'), 'forbidden → 403');
    assert.ok(routeContent.includes('409'), 'conflict → 409');
    assert.ok(routeContent.includes('404'), 'not_found → 404');
    assert.ok(routeContent.includes('400'), 'validation → 400');
    assert.ok(routeContent.includes('500'), 'error → 500');
  });

  it('returns sanitized 500 error only', () => {
    assert.ok(
      routeContent.includes("'Internal server error.'"),
      'must return sanitized 500 message',
    );
  });

  it('does NOT expose Prisma codes, SQL, or stack traces', () => {
    assert.ok(!routeContent.includes('stack'), 'No stack exposure');
    assert.ok(!routeContent.includes('Prisma'), 'No Prisma exposure');
    assert.ok(!routeContent.includes('SQL'), 'No SQL exposure');
    assert.ok(!routeContent.includes('credential'), 'No credential exposure');
    assert.ok(!routeContent.includes('session'), 'No session data exposure');
    assert.ok(!routeContent.includes('token='), 'No secret/token literal exposure');
  });
});
