import { z } from 'zod';

/**
 * Product Variant validation — Step 2.4.5.
 *
 * Server-authoritative validation for the Variants tab.
 * Client-side validation may re-use this schema for UX but cannot replace it.
 *
 * Rules:
 *  - `optionValues` is a free-form key/value map (`{ color: "black", voltage: "12V" }`).
 *    Keys/values are trimmed and validated; the combination is normalized so
 *    duplicate combinations are detected order-independently.
 *  - SKUs are normalized to trimmed uppercase. Uniqueness is enforced globally
 *    (across products and variants) by the mutation services.
 *  - `.strict()` ensures unknown/deferred fields are REJECTED, not stripped.
 */

export const MAX_OPTION_KEYS = 20;
export const OPTION_KEY_MAX_LENGTH = 40;
export const OPTION_VALUE_MAX_LENGTH = 100;
export const VARIANT_NAME_MAX_LENGTH = 200;
export const VARIANT_SKU_MAX_LENGTH = 60;
export const VARIANT_BARCODE_MAX_LENGTH = 100;

export const CURRENCIES = ['BDT', 'USD'] as const;

export type CurrencyValue = (typeof CURRENCIES)[number];

// ── SKU normalization ─────────────────────────────────────────────────────────

export function normalizeSku(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toUpperCase();
}

// ── Option values ─────────────────────────────────────────────────────────────

export type NormalizedOptionValues = Record<string, string>;

/**
 * Validates + normalizes a raw `optionValues` value.
 * Returns a trimmed, validated map or a descriptive error.
 */
export function normalizeOptionValues(
  value: unknown,
): { ok: true; data: NormalizedOptionValues } | { ok: false; message: string } {
  if (value === null || value === undefined) {
    return { ok: false, message: 'Option values are required.' };
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, message: 'Option values must be an object.' };
  }

  const raw = value as Record<string, unknown>;
  const rawKeys = Object.keys(raw);
  if (rawKeys.length > MAX_OPTION_KEYS) {
    return { ok: false, message: `At most ${MAX_OPTION_KEYS} option groups are allowed.` };
  }

  const out: NormalizedOptionValues = {};
  for (const rawKey of rawKeys) {
    const key = rawKey.trim();
    if (key === '') {
      return { ok: false, message: 'Option group names cannot be empty.' };
    }
    if (key.length > OPTION_KEY_MAX_LENGTH) {
      return {
        ok: false,
        message: `Option group names must be ${OPTION_KEY_MAX_LENGTH} characters or fewer.`,
      };
    }

    const rawValue = raw[rawKey];
    if (typeof rawValue !== 'string') {
      return { ok: false, message: 'Option values must be strings.' };
    }
    const valueTrimmed = rawValue.trim();
    if (valueTrimmed === '') {
      return { ok: false, message: 'Option values cannot be empty.' };
    }
    if (valueTrimmed.length > OPTION_VALUE_MAX_LENGTH) {
      return {
        ok: false,
        message: `Option values must be ${OPTION_VALUE_MAX_LENGTH} characters or fewer.`,
      };
    }

    out[key] = valueTrimmed;
  }

  return { ok: true, data: out };
}

/**
 * Stable, order-independent fingerprint of a normalized option set.
 * Used to detect duplicate combinations within a product.
 */
export function optionCombinationKey(optionValues: NormalizedOptionValues): string {
  return JSON.stringify(
    Object.keys(optionValues)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => [key, optionValues[key]]),
  );
}

const parseOptionValues = z.unknown().transform((value, ctx): NormalizedOptionValues => {
  const result = normalizeOptionValues(value);
  if (!result.ok) {
    ctx.addIssue({ code: 'custom', message: result.message });
    return z.NEVER;
  }
  return result.data;
});

// ── Variant field schema (shared by create + update) ─────────────────────────

export const variantFieldsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required.')
      .max(VARIANT_NAME_MAX_LENGTH, `Name must be ${VARIANT_NAME_MAX_LENGTH} characters or fewer.`),
    sku: z
      .string()
      .trim()
      .min(1, 'SKU is required.')
      .max(VARIANT_SKU_MAX_LENGTH, `SKU must be ${VARIANT_SKU_MAX_LENGTH} characters or fewer.`)
      .transform((value) => normalizeSku(value)),
    optionValues: parseOptionValues,
    priceMinor: z
      .string()
      .nullable()
      .transform((value, ctx) => {
        if (value === null || value.trim() === '') return null;
        const trimmed = value.trim();
        if (!/^\d+$/.test(trimmed)) {
          ctx.addIssue({ code: 'custom', message: 'Price must be a non-negative whole number.' });
          return z.NEVER;
        }
        const num = BigInt(trimmed);
        if (num < BigInt(0)) {
          ctx.addIssue({ code: 'custom', message: 'Price cannot be negative.' });
          return z.NEVER;
        }
        return trimmed;
      }),
    currency: z.enum(CURRENCIES, { message: 'Invalid currency.' }).nullable(),
    stock: z.number().int('Stock must be a whole number.').min(0, 'Stock cannot be negative.'),
    barcode: z
      .string()
      .trim()
      .max(
        VARIANT_BARCODE_MAX_LENGTH,
        `Barcode must be ${VARIANT_BARCODE_MAX_LENGTH} characters or fewer.`,
      )
      .nullable()
      .transform((value) => (value === null || value === '' ? null : value)),
    isDefault: z.boolean().default(false),
  })
  .strict();

export type VariantFieldsInput = z.infer<typeof variantFieldsSchema>;

// ── Request schemas (include concurrency token) ──────────────────────────────

export const createVariantRequestSchema = z
  .object({
    productId: z.string().min(1, 'Product ID is required.'),
    expectedUpdatedAt: z.string().min(1, 'Concurrency token is required.'),
    data: variantFieldsSchema,
  })
  .strict();

export const updateVariantRequestSchema = z
  .object({
    productId: z.string().min(1, 'Product ID is required.'),
    variantId: z.string().min(1, 'Variant ID is required.'),
    expectedUpdatedAt: z.string().min(1, 'Concurrency token is required.'),
    data: variantFieldsSchema,
  })
  .strict();

export const archiveVariantRequestSchema = z
  .object({
    productId: z.string().min(1, 'Product ID is required.'),
    variantId: z.string().min(1, 'Variant ID is required.'),
    expectedUpdatedAt: z.string().min(1, 'Concurrency token is required.'),
  })
  .strict();

export type CreateVariantRequest = z.infer<typeof createVariantRequestSchema>;
export type UpdateVariantRequest = z.infer<typeof updateVariantRequestSchema>;
export type ArchiveVariantRequest = z.infer<typeof archiveVariantRequestSchema>;
