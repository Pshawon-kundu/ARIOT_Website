import { prisma } from '@/server/db';
import { requirePermission } from '@/server/auth/permissions';
import { PERMISSIONS } from '@/server/auth/permission-catalog';
import type { AuthorizationContext } from '@/server/auth/permissions';

/**
 * Server-only product detail loader — Step 2.4.3.
 *
 * Loads a single product by ID for the admin editor.
 * Requires products.read; returns canEdit based on products.write.
 */

// ── DTO ──────────────────────────────────────────────────────────────────────

export interface AdminProductDetailsDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  tagline: string | null;
  description: string | null;
  brand: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId: string;
  categoryName: string;
  salesType: 'B2C' | 'B2B' | 'HYBRID';
  priceMinor: string | null;
  currency: 'BDT' | 'USD' | null;
  stock: number;
  stockPolicy: 'IN_STOCK' | 'BACKORDER' | 'MADE_TO_ORDER';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
}

export interface GetProductResult {
  product: AdminProductDetailsDto;
  categories: Array<{ id: string; name: string }>;
}

// ── Loader ───────────────────────────────────────────────────────────────────

export async function getProductForEditor(productId: string): Promise<GetProductResult | null> {
  const ctx = await requirePermission(PERMISSIONS.products.read);
  const canEdit = hasWritePermission(ctx);

  const product = await prisma.product.findUnique({
    where: { id: productId, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      tagline: true,
      description: true,
      brand: true,
      status: true,
      categoryId: true,
      salesType: true,
      priceMinor: true,
      currency: true,
      stock: true,
      stockPolicy: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { name: true } },
    },
  });

  if (!product) return null;

  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const dto: AdminProductDetailsDto = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    tagline: product.tagline,
    description: product.description,
    brand: product.brand,
    status: product.status as AdminProductDetailsDto['status'],
    categoryId: product.categoryId,
    categoryName: product.category.name,
    salesType: product.salesType as AdminProductDetailsDto['salesType'],
    priceMinor: product.priceMinor != null ? product.priceMinor.toString() : null,
    currency: product.currency as AdminProductDetailsDto['currency'],
    stock: product.stock,
    stockPolicy: product.stockPolicy as AdminProductDetailsDto['stockPolicy'],
    publishedAt: product.publishedAt?.toISOString() ?? null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    canEdit,
  };

  return { product: dto, categories };
}

function hasWritePermission(ctx: AuthorizationContext): boolean {
  if (ctx.permissions.includes('*')) return true;
  return ctx.permissions.includes(PERMISSIONS.products.write);
}
