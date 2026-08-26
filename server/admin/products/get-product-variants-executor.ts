import { prisma } from '@/server/db';
import { hasPermission, PERMISSIONS } from '@/server/auth/permission-catalog';
import type { AuthorizationContext } from '@/server/auth/permissions';
import { authorizeProductRead } from './product-variant-mutation-helpers';

/**
 * Product variants loader — Step 2.4.5 (executor).
 *
 * Runs inside the shared production authorization boundary
 * (`authorizeProductRead`), then returns the product's active (non-archived)
 * variants plus the product concurrency token (`updatedAt`). `canEditVariants`
 * is derived server-side from `products.write` via the real permission
 * evaluator. Throws `AuthorizationError` when `products.read` is missing.
 *
 * Wrapper: `get-product-variants.ts` (session resolution).
 */

// ── DTO ──────────────────────────────────────────────────────────────────────

export interface AdminProductVariantDto {
  id: string;
  name: string;
  sku: string;
  optionValues: Record<string, string>;
  priceMinor: string | null;
  currency: 'BDT' | 'USD' | null;
  stock: number;
  barcode: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductVariantsDto {
  productId: string;
  productName: string;
  productSku: string;
  productStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  /** Product-level concurrency token for variant mutations. */
  updatedAt: string;
  variants: AdminProductVariantDto[];
  canEditVariants: boolean;
}

// ── Loader ───────────────────────────────────────────────────────────────────

export async function getProductVariantsWithContext(
  ctx: AuthorizationContext,
  productId: string,
): Promise<AdminProductVariantsDto | null> {
  authorizeProductRead(ctx);
  const canEdit = hasPermission(ctx.permissions, PERMISSIONS.products.write);

  const product = await prisma.product.findUnique({
    where: { id: productId, deletedAt: null },
    select: { id: true, name: true, sku: true, status: true, updatedAt: true },
  });

  if (!product) return null;

  const variants = await prisma.productVariant.findMany({
    where: { productId, deletedAt: null },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      name: true,
      sku: true,
      optionValues: true,
      priceMinor: true,
      currency: true,
      stock: true,
      barcode: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    productId: product.id,
    productName: product.name,
    productSku: product.sku,
    productStatus: product.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    updatedAt: product.updatedAt.toISOString(),
    variants: variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      optionValues: variant.optionValues as Record<string, string>,
      priceMinor: variant.priceMinor != null ? variant.priceMinor.toString() : null,
      currency: variant.currency as 'BDT' | 'USD' | null,
      stock: variant.stock,
      barcode: variant.barcode,
      isDefault: variant.isDefault,
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    })),
    canEditVariants: canEdit,
  };
}
