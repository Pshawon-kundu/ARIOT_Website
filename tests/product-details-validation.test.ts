/**
 * tests/product-details-validation.test.ts — Step 2.4.3.
 *
 * Focused tests for product details validation, slug normalization,
 * and change detection.
 *
 * Run:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/product-details-validation.test.ts
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  productDetailsSchema,
  normalizeSlug,
  updateProductDetailsRequestSchema,
} from '../server/admin/products/product-details-schema.ts';

// ── Slug normalization ───────────────────────────────────────────────────────

describe('normalizeSlug', () => {
  it('lowercases input', () => {
    assert.strictEqual(normalizeSlug('Hello-World'), 'hello-world');
  });

  it('replaces spaces with hyphens', () => {
    assert.strictEqual(normalizeSlug('hello world'), 'hello-world');
  });

  it('removes non-URL-safe characters', () => {
    assert.strictEqual(normalizeSlug('hello@world!'), 'helloworld');
  });

  it('collapses multiple hyphens', () => {
    assert.strictEqual(normalizeSlug('hello---world'), 'hello-world');
  });

  it('trims leading/trailing hyphens', () => {
    assert.strictEqual(normalizeSlug('-hello-world-'), 'hello-world');
  });

  it('handles already valid slugs', () => {
    assert.strictEqual(normalizeSlug('my-product-slug'), 'my-product-slug');
  });

  it('handles name-like input', () => {
    assert.strictEqual(normalizeSlug('IoT Gateway Node v2'), 'iot-gateway-node-v2');
  });
});

// ── productDetailsSchema ─────────────────────────────────────────────────────

describe('productDetailsSchema', () => {
  const validData = {
    name: 'Test Product',
    slug: 'test-product',
    sku: 'SKU-001',
    tagline: 'A test tagline',
    description: 'A product description.',
    brand: 'ARIOT',
    categoryId: 'cat_robotics',
    salesType: 'B2C' as const,
    priceMinor: '10000',
    currency: 'BDT' as const,
  };

  it('accepts valid input', () => {
    const result = productDetailsSchema.safeParse(validData);
    assert.strictEqual(result.success, true);
  });

  it('rejects empty name', () => {
    const result = productDetailsSchema.safeParse({ ...validData, name: '' });
    assert.strictEqual(result.success, false);
  });

  it('rejects name shorter than 3 chars', () => {
    const result = productDetailsSchema.safeParse({ ...validData, name: 'AB' });
    assert.strictEqual(result.success, false);
  });

  it('rejects invalid slug format', () => {
    const result = productDetailsSchema.safeParse({
      ...validData,
      slug: 'INVALID SLUG!',
    });
    assert.strictEqual(result.success, false);
  });

  it('accepts valid slug', () => {
    const result = productDetailsSchema.safeParse({
      ...validData,
      slug: 'my-valid-slug-123',
    });
    assert.strictEqual(result.success, true);
  });

  it('rejects invalid salesType', () => {
    const result = productDetailsSchema.safeParse({
      ...validData,
      salesType: 'INVALID',
    });
    assert.strictEqual(result.success, false);
  });

  it('rejects status field (forbidden in Details)', () => {
    const withStatus = { ...validData, status: 'DRAFT' };
    const result = productDetailsSchema.safeParse(withStatus);
    assert.strictEqual(result.success, false);
  });

  it('rejects publishedAt field (forbidden in Details)', () => {
    const withPub = { ...validData, publishedAt: '2026-01-01' };
    const result = productDetailsSchema.safeParse(withPub);
    assert.strictEqual(result.success, false);
  });

  it('rejects stock field (forbidden in Details)', () => {
    const withStock = { ...validData, stock: 10 };
    const result = productDetailsSchema.safeParse(withStock);
    assert.strictEqual(result.success, false);
  });

  it('rejects heroImageId field (forbidden in Details)', () => {
    const withMedia = { ...validData, heroImageId: 'some_id' };
    const result = productDetailsSchema.safeParse(withMedia);
    assert.strictEqual(result.success, false);
  });

  it('rejects specs field (forbidden in Details)', () => {
    const withSpecs = { ...validData, specs: {} };
    const result = productDetailsSchema.safeParse(withSpecs);
    assert.strictEqual(result.success, false);
  });

  it('rejects seoTitle field (forbidden in Details)', () => {
    const withSeo = { ...validData, seoTitle: 'test' };
    const result = productDetailsSchema.safeParse(withSeo);
    assert.strictEqual(result.success, false);
  });

  it('rejects deletedAt field (forbidden in Details)', () => {
    const withDel = { ...validData, deletedAt: '2026-01-01' };
    const result = productDetailsSchema.safeParse(withDel);
    assert.strictEqual(result.success, false);
  });

  it('rejects arbitrary unknown field', () => {
    const withUnknown = { ...validData, malicious: 'payload' };
    const result = productDetailsSchema.safeParse(withUnknown);
    assert.strictEqual(result.success, false);
  });

  it('accepts null tagline', () => {
    const result = productDetailsSchema.safeParse({
      ...validData,
      tagline: null,
    });
    assert.strictEqual(result.success, true);
  });

  it('accepts null priceMinor', () => {
    const result = productDetailsSchema.safeParse({
      ...validData,
      priceMinor: null,
    });
    assert.strictEqual(result.success, true);
  });

  it('accepts null currency', () => {
    const result = productDetailsSchema.safeParse({
      ...validData,
      currency: null,
    });
    assert.strictEqual(result.success, true);
  });

  it('trims whitespace from name', () => {
    const result = productDetailsSchema.safeParse({
      ...validData,
      name: '  Trimmed Name  ',
    });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.name, 'Trimmed Name');
    }
  });

  it('rejects tagline over 140 chars', () => {
    const result = productDetailsSchema.safeParse({
      ...validData,
      tagline: 'x'.repeat(141),
    });
    assert.strictEqual(result.success, false);
  });

  it('rejects empty categoryId', () => {
    const result = productDetailsSchema.safeParse({
      ...validData,
      categoryId: '',
    });
    assert.strictEqual(result.success, false);
  });
});

// ── I-028 regression: priceMinor must NEVER throw from safeParse ────────────

describe('productDetailsSchema priceMinor (I-028 regression)', () => {
  const base = {
    name: 'Test Product',
    slug: 'test-product',
    sku: 'SKU-001',
    tagline: null,
    description: null,
    brand: 'ARIOT',
    categoryId: 'cat_robotics',
    salesType: 'B2C',
    currency: 'BDT',
  };

  it('never throws for any price input (safeParse contract)', () => {
    assert.doesNotThrow(() => productDetailsSchema.safeParse({ ...base, priceMinor: '-100' }));
    assert.doesNotThrow(() => productDetailsSchema.safeParse({ ...base, priceMinor: 'abc' }));
    assert.doesNotThrow(() => productDetailsSchema.safeParse({ ...base, priceMinor: '123abc' }));
    assert.doesNotThrow(() => productDetailsSchema.safeParse({ ...base, priceMinor: '10.5' }));
    assert.doesNotThrow(() => productDetailsSchema.safeParse({ ...base, priceMinor: '  -7  ' }));
  });

  it('accepts zero', () => {
    const result = productDetailsSchema.safeParse({ ...base, priceMinor: '0' });
    assert.strictEqual(result.success, true);
  });

  it('accepts a positive whole number', () => {
    const result = productDetailsSchema.safeParse({
      ...base,
      priceMinor: '10000',
    });
    assert.strictEqual(result.success, true);
  });

  it('accepts an extremely large valid integer (BigInt no overflow)', () => {
    const result = productDetailsSchema.safeParse({
      ...base,
      priceMinor: '9'.repeat(300),
    });
    assert.strictEqual(result.success, true);
  });

  it('rejects negative price without throwing', () => {
    const result = productDetailsSchema.safeParse({ ...base, priceMinor: '-100' });
    assert.strictEqual(result.success, false);
  });

  it('rejects decimal price without throwing', () => {
    const result = productDetailsSchema.safeParse({
      ...base,
      priceMinor: '100.50',
    });
    assert.strictEqual(result.success, false);
  });

  it('rejects alphabetic price without throwing', () => {
    const result = productDetailsSchema.safeParse({ ...base, priceMinor: 'abc' });
    assert.strictEqual(result.success, false);
  });

  it('rejects mixed numeric/text price without throwing', () => {
    const result = productDetailsSchema.safeParse({
      ...base,
      priceMinor: '123abc',
    });
    assert.strictEqual(result.success, false);
  });

  it('rejects huge malformed price without throwing', () => {
    const result = productDetailsSchema.safeParse({
      ...base,
      priceMinor: '9'.repeat(300) + 'x',
    });
    assert.strictEqual(result.success, false);
  });

  it('trims surrounding whitespace and preserves the value', () => {
    const result = productDetailsSchema.safeParse({
      ...base,
      priceMinor: '  1000  ',
    });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.priceMinor, '1000');
    }
  });

  it('treats empty string as null (unchanged contract)', () => {
    const result = productDetailsSchema.safeParse({ ...base, priceMinor: '' });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.priceMinor, null);
    }
  });
});

// ── updateProductDetailsRequestSchema ────────────────────────────────────────

describe('updateProductDetailsRequestSchema', () => {
  const validRequest = {
    productId: 'prod_123',
    expectedUpdatedAt: '2026-07-10T00:00:00.000Z',
    data: {
      name: 'Test Product',
      slug: 'test-product',
      sku: 'SKU-001',
      tagline: null,
      description: null,
      brand: 'ARIOT',
      categoryId: 'cat_robotics',
      salesType: 'B2C',
      priceMinor: null,
      currency: null,
    },
  };

  it('accepts valid request', () => {
    const result = updateProductDetailsRequestSchema.safeParse(validRequest);
    assert.strictEqual(result.success, true);
  });

  it('rejects missing productId', () => {
    const result = updateProductDetailsRequestSchema.safeParse({
      ...validRequest,
      productId: '',
    });
    assert.strictEqual(result.success, false);
  });

  it('rejects missing expectedUpdatedAt', () => {
    const result = updateProductDetailsRequestSchema.safeParse({
      ...validRequest,
      expectedUpdatedAt: '',
    });
    assert.strictEqual(result.success, false);
  });
});
