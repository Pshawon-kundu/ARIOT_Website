import type { Prisma } from '@/lib/generated/prisma/client';
import { prisma } from '@/server/db';
import { requirePermission } from '@/server/auth/permissions';
import type { DataTableCursorPagination } from '@/components/admin/data-table-types';

/**
 * Server-only product-list data function — Step 2.4.2.
 *
 * Authorization: requires `products.read` permission (checked before any DB
 * access).  The admin layout RBAC guard is the first line of defence; this
 * function is a second, per-operation server-side check.
 *
 * Query constraints:
 *   - searchVector (I-019) is NOT queried — uses Prisma `contains` / ILIKE
 *     on name, sku, slug instead.
 *   - priceMinor (BigInt) is serialized to string for safe client transfer.
 *   - Cursor pagination uses product `id` as the stable unique tie-breaker.
 *   - No writes, no counts by default, no raw SQL.
 *
 * Permission key: `products.read`
 *   SUPER_ADMIN  → matched via `'*'` wildcard ✓
 *   SALES_ADMIN  → explicit `'products.read'` entry ✓
 *   SUPPORT_ADMIN→ explicit `'products.read'` entry ✓
 *   CONTENT_ADMIN→ explicit `'products.read'` entry ✓ (C.1 reconciled)
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type SortKey = 'name' | 'sku' | 'status' | 'stock' | 'updatedAt';

export interface ProductListParams {
  q?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId?: string;
  sort: SortKey;
  direction: 'asc' | 'desc';
  cursor?: string;
  cursorDirection: 'after' | 'before';
  pageSize: 10 | 20 | 50;
}

export interface AdminProductListItem {
  id: string;
  slug: string;
  name: string;
  sku: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId: string;
  categoryName: string;
  imageUrl: string | null;
  imageAlt: string | null;
  stock: number;
  priceMinorStr: string | null;
  currency: 'BDT' | 'USD' | null;
  updatedAt: string;
}

export interface ProductListResult {
  items: AdminProductListItem[];
  pagination: DataTableCursorPagination;
  categories: Array<{ id: string; name: string }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildOrderBys(
  sort: SortKey,
  direction: 'asc' | 'desc',
): {
  forward: Prisma.ProductOrderByWithRelationInput[];
  backward: Prisma.ProductOrderByWithRelationInput[];
} {
  const rev: 'asc' | 'desc' = direction === 'asc' ? 'desc' : 'asc';
  const fwdField: Prisma.ProductOrderByWithRelationInput =
    sort === 'name'
      ? { name: direction }
      : sort === 'sku'
        ? { sku: direction }
        : sort === 'status'
          ? { status: direction }
          : sort === 'stock'
            ? { stock: direction }
            : /* updatedAt */ { updatedAt: direction };
  const bwdField: Prisma.ProductOrderByWithRelationInput =
    sort === 'name'
      ? { name: rev }
      : sort === 'sku'
        ? { sku: rev }
        : sort === 'status'
          ? { status: rev }
          : sort === 'stock'
            ? { stock: rev }
            : /* updatedAt */ { updatedAt: rev };
  return {
    forward: [fwdField, { id: 'asc' }],
    backward: [bwdField, { id: 'desc' }],
  };
}

const SELECT = {
  id: true,
  slug: true,
  name: true,
  sku: true,
  status: true,
  categoryId: true,
  stock: true,
  priceMinor: true,
  currency: true,
  updatedAt: true,
  category: { select: { name: true } },
  heroImage: { select: { cdnUrl: true, altText: true } },
} satisfies Prisma.ProductSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof SELECT }>;

function toDto(p: ProductRow): AdminProductListItem {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    status: p.status as AdminProductListItem['status'],
    categoryId: p.categoryId,
    categoryName: p.category.name,
    imageUrl: p.heroImage?.cdnUrl ?? null,
    imageAlt: p.heroImage?.altText ?? null,
    stock: p.stock,
    priceMinorStr: p.priceMinor != null ? p.priceMinor.toString() : null,
    currency: p.currency as AdminProductListItem['currency'],
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function listProducts(params: ProductListParams): Promise<ProductListResult> {
  // Authorization — fail closed before any DB access.
  await requirePermission('products.read');

  const { q, status, categoryId, sort, direction, cursor, cursorDirection, pageSize } = params;

  // WHERE clause — never uses searchVector (I-019 open)
  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(status && { status }),
    ...(categoryId && { categoryId }),
    ...(q &&
      q.length > 0 && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      }),
  };

  const { forward, backward } = buildOrderBys(sort, direction);

  let items: AdminProductListItem[] = [];
  let hasPreviousPage = false;
  let hasNextPage = false;

  const fetchForward = async (cursorId?: string): Promise<ProductRow[]> => {
    return prisma.product.findMany({
      where,
      orderBy: forward,
      ...(cursorId && { cursor: { id: cursorId }, skip: 1 }),
      take: pageSize + 1,
      select: SELECT,
    });
  };

  const fetchBackward = async (cursorId: string): Promise<ProductRow[]> => {
    return prisma.product.findMany({
      where,
      orderBy: backward,
      cursor: { id: cursorId },
      skip: 1,
      take: pageSize + 1,
      select: SELECT,
    });
  };

  try {
    if (cursorDirection === 'before' && cursor) {
      const reversed = await fetchBackward(cursor);
      const hasMoreBefore = reversed.length > pageSize;
      const page = reversed.slice(0, pageSize).reverse();
      items = page.map(toDto);
      hasPreviousPage = hasMoreBefore;
      hasNextPage = true; // cursor page exists after us
    } else {
      const fetched = await fetchForward(cursor);
      hasNextPage = fetched.length > pageSize;
      const page = fetched.slice(0, pageSize);
      items = page.map(toDto);
      hasPreviousPage = cursor != null; // came from somewhere
    }
  } catch (err) {
    // P2001: cursor record not found (stale/deleted). Fall back to first page.
    if ((err as { code?: string }).code === 'P2001') {
      const fetched = await fetchForward(undefined);
      hasNextPage = fetched.length > pageSize;
      items = fetched.slice(0, pageSize).map(toDto);
      hasPreviousPage = false;
    } else {
      throw err;
    }
  }

  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return {
    items,
    pagination: {
      hasNextPage,
      hasPreviousPage,
      nextCursor: hasNextPage || items.length > 0 ? (items[items.length - 1]?.id ?? null) : null,
      previousCursor: items[0]?.id ?? null,
    },
    categories,
  };
}
