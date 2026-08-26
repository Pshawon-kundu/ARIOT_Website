/**
 * tests/permission-evaluator.test.ts — Corrective Step C.1.
 *
 * Focused pure-logic tests for the permission evaluator.
 * Uses Node.js built-in test runner (node:test, available since Node 18).
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/permission-evaluator.test.ts
 *
 * Or via pnpm:
 *   pnpm test:permissions
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  GLOBAL_WILDCARD,
  PERMISSIONS,
  ROLE_PERMISSION_SETS,
} from '../server/auth/permission-catalog.ts';

// ── hasPermission (single permission check) ──────────────────────────────────

describe('hasPermission', () => {
  it('allows exact permission match', () => {
    assert.strictEqual(hasPermission(['products.read', 'products.write'], 'products.read'), true);
  });

  it('denies missing permission', () => {
    assert.strictEqual(hasPermission(['products.read'], 'products.write'), false);
  });

  it('allows global wildcard "*"', () => {
    assert.strictEqual(hasPermission(['*'], 'products.read'), true);
  });

  it('denies namespace wildcard "products.*" for products.read', () => {
    assert.strictEqual(hasPermission(['products.*'], 'products.read'), false);
  });

  it('denies namespace wildcard "products.*" for products.write', () => {
    assert.strictEqual(hasPermission(['products.*'], 'products.write'), false);
  });

  it('denies empty permission list', () => {
    assert.strictEqual(hasPermission([], 'products.read'), false);
  });

  it('allows "*" for any arbitrary permission string', () => {
    assert.strictEqual(hasPermission(['*'], 'some.random.perm'), true);
  });

  it('does not allow products.read to satisfy products.update', () => {
    assert.strictEqual(hasPermission(['products.read'], 'products.update'), false);
  });

  it('duplicate permissions do not change behavior', () => {
    assert.strictEqual(
      hasPermission(['products.read', 'products.read', 'products.read'], 'products.read'),
      true,
    );
    assert.strictEqual(
      hasPermission(['products.read', 'products.read', 'products.read'], 'products.write'),
      false,
    );
  });

  it('unknown permission string fails closed', () => {
    assert.strictEqual(hasPermission(['products.read', 'blog.write'], 'unknown.perm'), false);
  });
});

// ── hasAllPermissions (ALL semantics) ────────────────────────────────────────

describe('hasAllPermissions', () => {
  it('allows when all required permissions are present', () => {
    assert.strictEqual(
      hasAllPermissions(
        ['products.read', 'products.write', 'blog.read'],
        ['products.read', 'products.write'],
      ),
      true,
    );
  });

  it('denies when any required permission is missing', () => {
    assert.strictEqual(
      hasAllPermissions(['products.read'], ['products.read', 'products.write']),
      false,
    );
  });

  it('denies empty required list (fail closed)', () => {
    assert.strictEqual(hasAllPermissions(['products.read', 'products.write'], []), false);
  });

  it('allows global wildcard "*" for all requirements', () => {
    assert.strictEqual(
      hasAllPermissions(['*'], ['products.read', 'blog.write', 'settings.write']),
      true,
    );
  });

  it('namespace wildcard does not satisfy requirements', () => {
    assert.strictEqual(
      hasAllPermissions(['products.*', 'blog.*'], ['products.read', 'blog.write']),
      false,
    );
  });
});

// ── hasAnyPermission (ANY semantics) ─────────────────────────────────────────

describe('hasAnyPermission', () => {
  it('allows when at least one required permission matches', () => {
    assert.strictEqual(
      hasAnyPermission(['products.read'], ['products.read', 'products.write']),
      true,
    );
  });

  it('denies when no required permissions match', () => {
    assert.strictEqual(hasAnyPermission(['blog.read'], ['products.read', 'products.write']), false);
  });

  it('allows global wildcard "*"', () => {
    assert.strictEqual(hasAnyPermission(['*'], ['products.read', 'blog.write']), true);
  });

  it('namespace wildcard does not match any specific permission', () => {
    assert.strictEqual(hasAnyPermission(['products.*'], ['products.read']), false);
  });

  it('denies empty required list (evaluates as "none match")', () => {
    assert.strictEqual(hasAnyPermission(['products.read'], []), false);
  });
});

// ── SUPER_ADMIN global wildcard ──────────────────────────────────────────────

describe('SUPER_ADMIN wildcard', () => {
  const superPerms = [...ROLE_PERMISSION_SETS.SUPER_ADMIN];

  it('SUPER_ADMIN has exactly ["*"]', () => {
    assert.deepStrictEqual(superPerms, [GLOBAL_WILDCARD]);
  });

  it('SUPER_ADMIN passes any single permission check', () => {
    assert.strictEqual(hasPermission(superPerms, 'products.read'), true);
    assert.strictEqual(hasPermission(superPerms, 'settings.write'), true);
    assert.strictEqual(hasPermission(superPerms, 'audit_log.read'), true);
  });

  it('SUPER_ADMIN passes any multi-permission check', () => {
    assert.strictEqual(
      hasAllPermissions(superPerms, [
        'products.read',
        'products.write',
        'user.manage',
        'settings.write',
      ]),
      true,
    );
  });
});

// ── CONTENT_ADMIN specific tests ─────────────────────────────────────────────

describe('CONTENT_ADMIN permissions', () => {
  const contentPerms: readonly string[] = [...ROLE_PERMISSION_SETS.CONTENT_ADMIN];

  it('satisfies products.read', () => {
    assert.strictEqual(hasPermission(contentPerms, 'products.read'), true);
  });

  it('satisfies products.write', () => {
    assert.strictEqual(hasPermission(contentPerms, 'products.write'), true);
  });

  it('satisfies blog.write', () => {
    assert.strictEqual(hasPermission(contentPerms, 'blog.write'), true);
  });

  it('does NOT satisfy order.read', () => {
    assert.strictEqual(hasPermission(contentPerms, 'order.read'), false);
  });

  it('does NOT satisfy ticket.read', () => {
    assert.strictEqual(hasPermission(contentPerms, 'ticket.read'), false);
  });

  it('does NOT satisfy user.manage', () => {
    assert.strictEqual(hasPermission(contentPerms, 'user.manage'), false);
  });

  it('does NOT satisfy settings.write', () => {
    assert.strictEqual(hasPermission(contentPerms, 'settings.write'), false);
  });

  it('contains no namespace wildcards', () => {
    const wildcards = contentPerms.filter((p) => p.endsWith('.*') && p !== '*');
    assert.deepStrictEqual(wildcards, []);
  });
});

// ── All role permission sets validation ──────────────────────────────────────

describe('Role permission sets structural validation', () => {
  it('no non-SUPER_ADMIN role contains namespace wildcards', () => {
    for (const [role, perms] of Object.entries(ROLE_PERMISSION_SETS)) {
      if (role === 'SUPER_ADMIN') continue;
      const wildcards = (perms as readonly string[]).filter((p) => p.endsWith('.*'));
      assert.deepStrictEqual(
        wildcards,
        [],
        `Role ${role} contains namespace wildcards: ${wildcards.join(', ')}`,
      );
    }
  });

  it('no permission string is empty', () => {
    for (const [role, perms] of Object.entries(ROLE_PERMISSION_SETS)) {
      for (const p of perms as readonly string[]) {
        assert.notStrictEqual(p, '', `Role ${role} contains empty permission string`);
      }
    }
  });

  it('no permission string contains whitespace', () => {
    for (const [role, perms] of Object.entries(ROLE_PERMISSION_SETS)) {
      for (const p of perms as readonly string[]) {
        assert.strictEqual(p.trim(), p, `Role ${role} permission "${p}" contains whitespace`);
      }
    }
  });

  it('all non-SUPER_ADMIN permissions are lowercase', () => {
    for (const [role, perms] of Object.entries(ROLE_PERMISSION_SETS)) {
      if (role === 'SUPER_ADMIN') continue;
      for (const p of perms as readonly string[]) {
        assert.strictEqual(p, p.toLowerCase(), `Role ${role} permission "${p}" is not lowercase`);
      }
    }
  });

  it('PERMISSIONS catalog values match role permission set values', () => {
    const allCatalogPerms = new Set<string>();
    for (const group of Object.values(PERMISSIONS)) {
      for (const perm of Object.values(group)) {
        allCatalogPerms.add(perm);
      }
    }

    for (const [role, perms] of Object.entries(ROLE_PERMISSION_SETS)) {
      if (role === 'SUPER_ADMIN') continue;
      for (const p of perms as readonly string[]) {
        assert.ok(
          allCatalogPerms.has(p),
          `Role ${role} has permission "${p}" not in PERMISSIONS catalog`,
        );
      }
    }
  });
});
