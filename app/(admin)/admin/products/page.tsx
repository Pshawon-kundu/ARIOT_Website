import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthenticationError, AuthorizationError } from '@/server/auth/errors';
import {
  listProducts,
  type ProductListParams,
  type SortKey,
} from '@/server/admin/products/list-products';
import { ProductsTable } from '@/components/admin/products/products-table';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Products',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  q?: string;
  status?: string;
  categoryId?: string;
  sort?: string;
  direction?: string;
  cursor?: string;
  cursorDirection?: string;
  pageSize?: string;
}>;

const ALLOWED_SORTS: SortKey[] = ['name', 'sku', 'status', 'stock', 'updatedAt'];
const ALLOWED_SIZES = [10, 20, 50] as const;

function parseParams(sp: Awaited<SearchParams>): ProductListParams {
  const sort = ALLOWED_SORTS.includes(sp.sort as SortKey) ? (sp.sort as SortKey) : 'updatedAt';
  const direction = sp.direction === 'asc' ? 'asc' : 'desc';
  const rawSize = Number(sp.pageSize);
  const pageSize = (ALLOWED_SIZES as readonly number[]).includes(rawSize)
    ? (rawSize as 10 | 20 | 50)
    : 20;
  return {
    q: sp.q?.trim().slice(0, 200) || undefined,
    status: ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(sp.status ?? '')
      ? (sp.status as ProductListParams['status'])
      : undefined,
    categoryId: sp.categoryId || undefined,
    sort,
    direction,
    cursor: sp.cursor || undefined,
    cursorDirection: sp.cursorDirection === 'before' ? 'before' : 'after',
    pageSize,
  };
}

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const params = parseParams(sp);

  let result;
  try {
    result = await listProducts(params);
  } catch (err) {
    if (err instanceof AuthenticationError) redirect('/sign-in');
    if (err instanceof AuthorizationError) redirect('/');
    // All other errors: surface via error state in the table
    result = {
      error: true as const,
      items: [],
      pagination: { hasNextPage: false, hasPreviousPage: false },
      categories: [],
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-steel-50 text-2xl font-semibold tracking-tight">
          Products
        </h1>
        <p className="text-steel-400 mt-1 text-sm">
          Manage catalog products. Click a product name to view or edit details.
        </p>
      </div>

      <ProductsTable
        rows={'error' in result ? [] : result.items}
        pagination={
          'error' in result ? { hasNextPage: false, hasPreviousPage: false } : result.pagination
        }
        categories={'error' in result ? [] : result.categories}
        params={params}
        hasError={'error' in result}
      />
    </div>
  );
}
