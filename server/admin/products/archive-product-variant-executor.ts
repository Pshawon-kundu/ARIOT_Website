import { prisma } from '@/server/db';
import type { AuthorizationContext } from '@/server/auth/permissions';
import { archiveVariantRequestSchema } from './product-variant-schema';
import {
  actorRole,
  authorizeProductWrite,
  checkConcurrency,
  loadProduct,
  type VariantMutationResult,
} from './product-variant-mutation-helpers';

/**
 * Archive (soft-delete) a product variant — Step 2.4.5 (executor).
 *
 * Runs inside the shared production authorization boundary
 * (`authorizeProductWrite`), then enforces strict validation and optimistic
 * concurrency on Product.updatedAt. Archived variants are excluded from the
 * loader; their SKU remains reserved (global unique index spans archived rows).
 * Archiving an already-archived variant is an idempotent no-op. Writes an
 * audit log on real archive.
 *
 * Wrapper: `archive-product-variant.ts` (session resolution).
 */

export async function archiveProductVariantWithContext(
  ctx: AuthorizationContext,
  rawInput: unknown,
): Promise<VariantMutationResult> {
  authorizeProductWrite(ctx);

  const parsed = archiveVariantRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, type: 'validation', message: 'Invalid input.' };
  }

  const { productId, variantId, expectedUpdatedAt } = parsed.data;

  const product = await loadProduct(productId);
  if (!product) {
    return { ok: false, type: 'not_found', message: 'Product not found.' };
  }

  const conflict = checkConcurrency(product.updatedAt, expectedUpdatedAt);
  if (conflict) return conflict;

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
    select: { id: true, sku: true, name: true, deletedAt: true },
  });

  if (!variant) {
    return { ok: false, type: 'validation', message: 'Variant not found.' };
  }

  // Idempotent: already archived is a no-op.
  if (variant.deletedAt !== null) {
    return { ok: true, updatedAt: product.updatedAt.toISOString(), variantId };
  }

  const archivedAt = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    await tx.productVariant.update({
      where: { id: variantId },
      data: { deletedAt: archivedAt },
    });

    const p = await tx.product.update({
      where: { id: productId },
      data: { updatedBy: ctx.userId },
      select: { updatedAt: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: ctx.userId,
        actorRole: actorRole(ctx.roles),
        action: 'PRODUCT_VARIANT_ARCHIVED',
        entityType: 'Product',
        entityId: productId,
        before: { sku: variant.sku, name: variant.name, deletedAt: null },
        after: {
          sku: variant.sku,
          name: variant.name,
          deletedAt: archivedAt.toISOString(),
        },
      },
    });

    return p;
  });

  return { ok: true, updatedAt: updated.updatedAt.toISOString(), variantId };
}
