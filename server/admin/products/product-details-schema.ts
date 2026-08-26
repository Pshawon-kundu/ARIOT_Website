import { z } from 'zod';

/**
 * Product Details validation — Step 2.4.3.
 *
 * Server-authoritative validation for the Details tab fields.
 * Client-side validation may re-use this schema for UX but cannot replace it.
 */

// ── Slug normalization ───────────────────────────────────────────────────────

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Enums matching Prisma schema ─────────────────────────────────────────────

export const SALES_TYPES = ['B2C', 'B2B', 'HYBRID'] as const;
export const CURRENCIES = ['BDT', 'USD'] as const;

export type SalesTypeValue = (typeof SALES_TYPES)[number];
export type CurrencyValue = (typeof CURRENCIES)[number];

// ── Details update schema ────────────────────────────────────────────────────
// NOTE: `status` is excluded. Publishing/archival are lifecycle operations
// managed by separate explicit actions — not through ordinary Details autosave.
// `.strict()` ensures unknown/deferred/lifecycle fields are REJECTED, not stripped.

export const productDetailsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Name must be at least 3 characters.')
      .max(200, 'Name must be 200 characters or fewer.'),
    slug: z
      .string()
      .trim()
      .min(3, 'Slug must be at least 3 characters.')
      .max(200, 'Slug must be 200 characters or fewer.')
      .regex(SLUG_PATTERN, 'Slug must be lowercase, hyphen-separated, URL-safe.'),
    sku: z
      .string()
      .trim()
      .min(1, 'SKU is required.')
      .max(60, 'SKU must be 60 characters or fewer.'),
    tagline: z.string().trim().max(140, 'Tagline must be 140 characters or fewer.').nullable(),
    description: z
      .string()
      .trim()
      .max(10000, 'Description must be 10000 characters or fewer.')
      .nullable(),
    brand: z.string().trim().max(100, 'Brand must be 100 characters or fewer.').default('ARIOT'),
    categoryId: z.string().min(1, 'Category is required.'),
    salesType: z.enum(SALES_TYPES, { message: 'Invalid sales type.' }),
    // NOTE: I-028 — the transform must NEVER throw. `BigInt()` raises
    // SyntaxError on non-digit input, and throwing inside a Zod transform
    // escapes `safeParse` and crashes the route. Reject via `ctx.addIssue` +
    // `z.NEVER` instead; return the trimmed digit string (digits-only implies
    // the value is already a valid non-negative BigInt).
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
    currency: z.enum(CURRENCIES).nullable(),
  })
  .strict();

export type ProductDetailsInput = z.infer<typeof productDetailsSchema>;

// ── Update request schema (includes concurrency token) ───────────────────────

export const updateProductDetailsRequestSchema = z
  .object({
    productId: z.string().min(1, 'Product ID is required.'),
    expectedUpdatedAt: z.string().min(1, 'Concurrency token is required.'),
    data: productDetailsSchema,
  })
  .strict();

export type UpdateProductDetailsRequest = z.infer<typeof updateProductDetailsRequestSchema>;
