import { prisma } from '@/server/db';
import { requirePermission } from '@/server/auth/permissions';
import { PERMISSIONS } from '@/server/auth/permission-catalog';
import {
  updateProductDetailsRequestSchema,
  type ProductDetailsInput,
} from './product-details-schema';
import { createAuthorizedProductDetailsUpdater } from './authorized-product-update';

/**
 * Server-only product details update — Step 2.4.3.
 *
 * Architecture:
 *   - updateProductDetails(): production instance created by the shared
 *     orchestration factory (API route calls this)
 *   - executeProductDetailsUpdate(): internal service (testable with synthetic actor)
 *
 * The same createAuthorizedProductDetailsUpdater() factory is used by both
 * production and authorization contract tests — see authorized-product-update.ts.
 *
 * Status/lifecycle fields are excluded. Publishing/archival use separate actions.
 */

// ── Result types ─────────────────────────────────────────────────────────────

export type UpdateProductDetailsResult =
  | { ok: true; updatedAt: string; changedFields: string[] }
  | { ok: false; type: 'validation'; fieldErrors: Record<string, string[]>; formError?: string }
  | { ok: false; type: 'conflict'; message: string }
  | { ok: false; type: 'not_found'; message: string }
  | { ok: false; type: 'duplicate'; field: string; message: string }
  | { ok: false; type: 'forbidden'; message: string }
  | { ok: false; type: 'error'; message: string };

// ── Production authorized updater (created by shared orchestration factory) ──

export const updateProductDetails = createAuthorizedProductDetailsUpdater({
  authorize: async () => {
    const ctx = await requirePermission(PERMISSIONS.products.write);
    return { userId: ctx.userId, roles: ctx.roles as string[] };
  },
  executeUpdate: executeProductDetailsUpdate,
});

// ── Internal service (testable) ──────────────────────────────────────────────

export async function executeProductDetailsUpdate(
  rawInput: unknown,
  actor: { userId: string; roles: string[] },
): Promise<UpdateProductDetailsResult> {
  // 1. Parse + validate
  const parsed = updateProductDetailsRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      const key = path.replace(/^data\./, '');
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { ok: false, type: 'validation', fieldErrors };
  }

  const { productId, expectedUpdatedAt, data } = parsed.data;

  // 2. Load current state
  const current = await prisma.product.findUnique({
    where: { id: productId, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      tagline: true,
      description: true,
      brand: true,
      categoryId: true,
      salesType: true,
      priceMinor: true,
      currency: true,
      updatedAt: true,
    },
  });

  if (!current) {
    return { ok: false, type: 'not_found', message: 'Product not found.' };
  }

  // 3. Optimistic concurrency
  if (current.updatedAt.toISOString() !== expectedUpdatedAt) {
    return {
      ok: false,
      type: 'conflict',
      message: 'This product was updated elsewhere. Reload the latest version.',
    };
  }

  // 4. Detect changes
  const changes = detectChanges(current, data);
  if (changes.length === 0) {
    return { ok: true, updatedAt: current.updatedAt.toISOString(), changedFields: [] };
  }

  // 5. Check uniqueness (slug, sku)
  const dupError = await checkUniqueness(productId, data.slug, data.sku);
  if (dupError) return dupError;

  // 6. Validate category exists
  if (data.categoryId !== current.categoryId) {
    const cat = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!cat) {
      return {
        ok: false,
        type: 'validation',
        fieldErrors: { categoryId: ['Category not found.'] },
      };
    }
  }

  // 7. Build update data + audit in transaction
  const updateData = buildUpdateData(data);
  const beforeJson = buildAuditSnapshot(current, changes);
  const afterJson = buildAuditSnapshot(data, changes);

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where: { id: productId },
      data: { ...updateData, updatedBy: actor.userId },
      select: { updatedAt: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: actor.userId,
        actorRole:
          (actor.roles[0] as 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'SALES_ADMIN') ??
          null,
        action: 'PRODUCT_DETAILS_UPDATED',
        entityType: 'Product',
        entityId: productId,
        before: beforeJson as object,
        after: afterJson as object,
      },
    });

    return p;
  });

  return {
    ok: true,
    updatedAt: updated.updatedAt.toISOString(),
    changedFields: changes,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type CurrentProduct = {
  name: string;
  slug: string;
  sku: string;
  tagline: string | null;
  description: string | null;
  brand: string;
  categoryId: string;
  salesType: string;
  priceMinor: bigint | null;
  currency: string | null;
};

function detectChanges(current: CurrentProduct, data: ProductDetailsInput): string[] {
  const changed: string[] = [];
  if (current.name !== data.name) changed.push('name');
  if (current.slug !== data.slug) changed.push('slug');
  if (current.sku !== data.sku) changed.push('sku');
  if ((current.tagline ?? null) !== (data.tagline ?? null)) changed.push('tagline');
  if ((current.description ?? null) !== (data.description ?? null)) changed.push('description');
  if (current.brand !== data.brand) changed.push('brand');
  if (current.categoryId !== data.categoryId) changed.push('categoryId');
  if (current.salesType !== data.salesType) changed.push('salesType');
  const currentPrice = current.priceMinor?.toString() ?? null;
  if (currentPrice !== (data.priceMinor ?? null)) changed.push('priceMinor');
  if ((current.currency ?? null) !== (data.currency ?? null)) changed.push('currency');
  return changed;
}

async function checkUniqueness(
  productId: string,
  slug: string,
  sku: string,
): Promise<UpdateProductDetailsResult | null> {
  const [slugDup, skuDup] = await Promise.all([
    prisma.product.findFirst({
      where: { slug, id: { not: productId }, deletedAt: null },
      select: { id: true },
    }),
    prisma.product.findFirst({
      where: { sku, id: { not: productId }, deletedAt: null },
      select: { id: true },
    }),
  ]);
  if (slugDup)
    return { ok: false, type: 'duplicate', field: 'slug', message: 'This slug is already in use.' };
  if (skuDup)
    return { ok: false, type: 'duplicate', field: 'sku', message: 'This SKU is already in use.' };
  return null;
}

function buildUpdateData(data: ProductDetailsInput) {
  return {
    name: data.name,
    slug: data.slug,
    sku: data.sku,
    tagline: data.tagline,
    description: data.description,
    brand: data.brand,
    categoryId: data.categoryId,
    salesType: data.salesType,
    priceMinor: data.priceMinor != null ? BigInt(data.priceMinor) : null,
    currency: data.currency,
  };
}

function buildAuditSnapshot(
  source: Record<string, unknown> | CurrentProduct | ProductDetailsInput,
  changes: string[],
): Record<string, string | number | boolean | null> {
  const snap: Record<string, string | number | boolean | null> = {};
  for (const f of changes) {
    const val = (source as Record<string, unknown>)[f];
    if (typeof val === 'bigint') snap[f] = val.toString();
    else if (val === null || val === undefined) snap[f] = null;
    else snap[f] = val as string | number | boolean;
  }
  return snap;
}
