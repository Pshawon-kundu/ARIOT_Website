/**
 * tests/product-variant-schema.test.ts — Step 2.4.5.
 *
 * Unit tests for the product variant validation module: SKU normalization,
 * option-values normalization + order-independent combination keys, the strict
 * variant field schema, and the create/update/archive request schemas.
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/product-variant-schema.test.ts
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  normalizeSku,
  normalizeOptionValues,
  optionCombinationKey,
  variantFieldsSchema,
  createVariantRequestSchema,
  updateVariantRequestSchema,
  archiveVariantRequestSchema,
  MAX_OPTION_KEYS,
  OPTION_KEY_MAX_LENGTH,
  OPTION_VALUE_MAX_LENGTH,
} from '../server/admin/products/product-variant-schema.ts';

// ── normalizeSku ─────────────────────────────────────────────────────────────

describe('normalizeSku', () => {
  it('trims surrounding whitespace', () => {
    assert.strictEqual(normalizeSku('  SKU-001  '), 'SKU-001');
  });

  it('uppercases lowercase input', () => {
    assert.strictEqual(normalizeSku('ts-001'), 'TS-001');
  });

  it('collapses internal whitespace', () => {
    assert.strictEqual(normalizeSku('sku   001'), 'SKU 001');
  });
});

// ── normalizeOptionValues ─────────────────────────────────────────────────────

describe('normalizeOptionValues', () => {
  it('accepts a valid map and trims keys/values', () => {
    const result = normalizeOptionValues({ color: '  Black ', voltage: '12V ' });
    assert.strictEqual(result.ok, true);
    if (result.ok) {
      assert.deepStrictEqual(result.data, { color: 'Black', voltage: '12V' });
    }
  });

  it('rejects null and undefined', () => {
    assert.strictEqual(normalizeOptionValues(null).ok, false);
    assert.strictEqual(normalizeOptionValues(undefined).ok, false);
  });

  it('rejects arrays', () => {
    assert.strictEqual(normalizeOptionValues(['black']).ok, false);
  });

  it('rejects empty option key', () => {
    const result = normalizeOptionValues({ '': 'Black' });
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.match(result.message, /cannot be empty/);
  });

  it('rejects empty option value', () => {
    const result = normalizeOptionValues({ color: '   ' });
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.match(result.message, /cannot be empty/);
  });

  it('rejects non-string option values', () => {
    assert.strictEqual(normalizeOptionValues({ color: 12 }).ok, false);
    assert.strictEqual(normalizeOptionValues({ color: null }).ok, false);
  });

  it('rejects more than MAX_OPTION_KEYS keys', () => {
    const map: Record<string, string> = {};
    for (let i = 0; i < MAX_OPTION_KEYS + 1; i++) map[`key${i}`] = `v${i}`;
    const result = normalizeOptionValues(map);
    assert.strictEqual(result.ok, false);
    if (!result.ok) assert.match(result.message, /At most/);
  });

  it('rejects option key longer than the limit', () => {
    const result = normalizeOptionValues({ ['x'.repeat(OPTION_KEY_MAX_LENGTH + 1)]: 'v' });
    assert.strictEqual(result.ok, false);
  });

  it('rejects option value longer than the limit', () => {
    const result = normalizeOptionValues({ color: 'v'.repeat(OPTION_VALUE_MAX_LENGTH + 1) });
    assert.strictEqual(result.ok, false);
  });

  it('accepts an empty object', () => {
    const result = normalizeOptionValues({});
    assert.strictEqual(result.ok, true);
  });
});

// ── optionCombinationKey ─────────────────────────────────────────────────────

describe('optionCombinationKey', () => {
  it('is order-independent', () => {
    const a = optionCombinationKey({ color: 'black', voltage: '12V' });
    const b = optionCombinationKey({ voltage: '12V', color: 'black' });
    assert.strictEqual(a, b);
  });

  it('differs when a value differs', () => {
    const a = optionCombinationKey({ color: 'black' });
    const b = optionCombinationKey({ color: 'white' });
    assert.notStrictEqual(a, b);
  });

  it('differs when a key set differs', () => {
    const a = optionCombinationKey({ color: 'black' });
    const b = optionCombinationKey({ color: 'black', voltage: '12V' });
    assert.notStrictEqual(a, b);
  });
});

// ── variantFieldsSchema ──────────────────────────────────────────────────────

describe('variantFieldsSchema', () => {
  const validData = {
    name: 'Black, 12V',
    sku: 'ts-001',
    optionValues: { color: 'Black', voltage: '12V' },
    priceMinor: '25000',
    currency: 'BDT',
    stock: 4,
    barcode: '0123456789012',
    isDefault: true,
  };

  it('accepts valid input', () => {
    const result = variantFieldsSchema.safeParse(validData);
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.sku, 'TS-001');
      assert.deepStrictEqual(result.data.optionValues, { color: 'Black', voltage: '12V' });
    }
  });

  it('rejects empty name', () => {
    assert.strictEqual(variantFieldsSchema.safeParse({ ...validData, name: '' }).success, false);
  });

  it('rejects name over 200 chars', () => {
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, name: 'x'.repeat(201) }).success,
      false,
    );
  });

  it('rejects empty sku', () => {
    assert.strictEqual(variantFieldsSchema.safeParse({ ...validData, sku: '  ' }).success, false);
  });

  it('rejects sku over 60 chars', () => {
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, sku: 'x'.repeat(61) }).success,
      false,
    );
  });

  it('rejects invalid optionValues', () => {
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, optionValues: 'not-an-object' }).success,
      false,
    );
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, optionValues: { color: '' } }).success,
      false,
    );
  });

  it('accepts empty optionValues object', () => {
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, optionValues: {} }).success,
      true,
    );
  });

  it('accepts null priceMinor and converts empty string to null', () => {
    const r1 = variantFieldsSchema.safeParse({ ...validData, priceMinor: null });
    const r2 = variantFieldsSchema.safeParse({ ...validData, priceMinor: '' });
    assert.strictEqual(r1.success, true);
    assert.strictEqual(r2.success, true);
    if (r2.success) assert.strictEqual(r2.data.priceMinor, null);
  });

  it('rejects negative price', () => {
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, priceMinor: '-5' }).success,
      false,
    );
  });

  it('rejects non-numeric price', () => {
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, priceMinor: 'abc' }).success,
      false,
    );
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, priceMinor: '12.5' }).success,
      false,
    );
  });

  it('accepts BDT/USD currency and rejects others', () => {
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, currency: 'USD' }).success,
      true,
    );
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, currency: null }).success,
      true,
    );
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, currency: 'EUR' }).success,
      false,
    );
  });

  it('rejects negative stock, fractional stock, and non-number stock', () => {
    assert.strictEqual(variantFieldsSchema.safeParse({ ...validData, stock: -1 }).success, false);
    assert.strictEqual(variantFieldsSchema.safeParse({ ...validData, stock: 1.5 }).success, false);
    assert.strictEqual(variantFieldsSchema.safeParse({ ...validData, stock: '5' }).success, false);
  });

  it('converts empty barcode to null and rejects over 100 chars', () => {
    const r = variantFieldsSchema.safeParse({ ...validData, barcode: '' });
    assert.strictEqual(r.success, true);
    if (r.success) assert.strictEqual(r.data.barcode, null);
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, barcode: 'x'.repeat(101) }).success,
      false,
    );
  });

  it('defaults isDefault to false when omitted', () => {
    const result = variantFieldsSchema.safeParse({
      ...validData,
      isDefault: undefined,
    });
    assert.strictEqual(result.success, true);
    if (result.success) assert.strictEqual(result.data.isDefault, false);
  });

  it('rejects unknown fields (strict)', () => {
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, status: 'DRAFT' }).success,
      false,
    );
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...validData, createdAt: '2026-01-01' }).success,
      false,
    );
  });
});

// ── Request schemas ──────────────────────────────────────────────────────────

describe('variant request schemas', () => {
  const validFields = {
    name: 'Black, 12V',
    sku: 'TS-001',
    optionValues: { color: 'Black' },
    priceMinor: null,
    currency: null,
    stock: 2,
    barcode: null,
    isDefault: false,
  };
  const token = '2026-01-01T00:00:00.000Z';

  it('createVariantRequestSchema accepts valid payload', () => {
    const result = createVariantRequestSchema.safeParse({
      productId: 'prod1',
      expectedUpdatedAt: token,
      data: validFields,
    });
    assert.strictEqual(result.success, true);
  });

  it('createVariantRequestSchema requires productId and token', () => {
    assert.strictEqual(
      createVariantRequestSchema.safeParse({ expectedUpdatedAt: token, data: validFields }).success,
      false,
    );
    assert.strictEqual(
      createVariantRequestSchema.safeParse({ productId: 'prod1', data: validFields }).success,
      false,
    );
  });

  it('createVariantRequestSchema rejects unknown top-level fields', () => {
    assert.strictEqual(
      createVariantRequestSchema.safeParse({
        productId: 'prod1',
        expectedUpdatedAt: token,
        data: validFields,
        actorId: 'user1',
      }).success,
      false,
    );
  });

  it('updateVariantRequestSchema requires variantId', () => {
    const base = { productId: 'prod1', expectedUpdatedAt: token, data: validFields };
    assert.strictEqual(updateVariantRequestSchema.safeParse(base).success, false);
    assert.strictEqual(
      updateVariantRequestSchema.safeParse({ ...base, variantId: 'var1' }).success,
      true,
    );
  });

  it('archiveVariantRequestSchema accepts minimal payload and rejects extras', () => {
    const base = { productId: 'prod1', variantId: 'var1', expectedUpdatedAt: token };
    assert.strictEqual(archiveVariantRequestSchema.safeParse(base).success, true);
    assert.strictEqual(
      archiveVariantRequestSchema.safeParse({ ...base, data: validFields }).success,
      false,
    );
  });
});

// ── Task 5: lifecycle/identity fields must be REJECTED, never accepted ───────

describe('variant request schemas reject lifecycle/identity fields', () => {
  const forbiddenKeys = [
    'actorId',
    'actorRole',
    'userId',
    'role',
    'roles',
    'permissions',
    'createdAt',
    'updatedAt',
    'deletedAt',
  ];

  const validFields = {
    name: 'Black, 12V',
    sku: 'TS-001',
    optionValues: { color: 'Black' },
    priceMinor: null,
    currency: null,
    stock: 2,
    barcode: null,
    isDefault: false,
  };
  const token = '2026-01-01T00:00:00.000Z';

  for (const key of forbiddenKeys) {
    it(`create rejects ${key}`, () => {
      const result = createVariantRequestSchema.safeParse({
        productId: 'prod1',
        expectedUpdatedAt: token,
        data: validFields,
        [key]: 'x',
      });
      assert.strictEqual(result.success, false);
    });

    it(`update rejects ${key}`, () => {
      const result = updateVariantRequestSchema.safeParse({
        productId: 'prod1',
        variantId: 'var1',
        expectedUpdatedAt: token,
        data: validFields,
        [key]: 'x',
      });
      assert.strictEqual(result.success, false);
    });

    it(`archive rejects ${key}`, () => {
      const result = archiveVariantRequestSchema.safeParse({
        productId: 'prod1',
        variantId: 'var1',
        expectedUpdatedAt: token,
        [key]: 'x',
      });
      assert.strictEqual(result.success, false);
    });
  }

  it('variant fields reject lifecycle/identity fields inside data', () => {
    for (const key of forbiddenKeys) {
      const result = variantFieldsSchema.safeParse({ ...validFields, [key]: 'x' });
      assert.strictEqual(result.success, false, `expected ${key} to be rejected`);
    }
  });
});

// ── I-028 pattern: priceMinor safeParse must NEVER throw ─────────────────────

describe('variantFieldsSchema priceMinor never throws (I-028 pattern)', () => {
  const base = {
    name: 'Black, 12V',
    sku: 'TS-001',
    optionValues: { color: 'Black' },
    priceMinor: '25000',
    currency: 'BDT',
    stock: 2,
    barcode: null,
    isDefault: false,
  };

  it('never throws for malformed price inputs', () => {
    assert.doesNotThrow(() => variantFieldsSchema.safeParse({ ...base, priceMinor: '-5' }));
    assert.doesNotThrow(() => variantFieldsSchema.safeParse({ ...base, priceMinor: 'abc' }));
    assert.doesNotThrow(() => variantFieldsSchema.safeParse({ ...base, priceMinor: '12.5' }));
    assert.doesNotThrow(() => variantFieldsSchema.safeParse({ ...base, priceMinor: '123abc' }));
  });

  it('parses an extremely large valid integer without throwing (schema-level)', () => {
    assert.doesNotThrow(() =>
      variantFieldsSchema.safeParse({ ...base, priceMinor: '9'.repeat(300) }),
    );
    const result = variantFieldsSchema.safeParse({ ...base, priceMinor: '9'.repeat(300) });
    assert.strictEqual(result.success, true);
    if (result.success) assert.strictEqual(result.data.priceMinor, '9'.repeat(300));
  });

  it('rejects a huge malformed price without throwing', () => {
    assert.doesNotThrow(() =>
      variantFieldsSchema.safeParse({ ...base, priceMinor: '9'.repeat(300) + 'x' }),
    );
    assert.strictEqual(
      variantFieldsSchema.safeParse({ ...base, priceMinor: '9'.repeat(300) + 'x' }).success,
      false,
    );
  });
});
