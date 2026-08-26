'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { DataTable } from '@/components/admin/data-table';
import { AdminStatusChip } from '@/components/admin/admin-status-chip';
import type {
  DataTableColumn,
  DataTableCursorPagination,
  DataTableSort,
} from '@/components/admin/data-table-types';
import type {
  AdminProductListItem,
  ProductListParams,
} from '@/server/admin/products/list-products';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(priceMinorStr: string | null, currency: string | null): string {
  if (!priceMinorStr || !currency) return '—';
  try {
    const value = Number(priceMinorStr) / 100;
    if (currency === 'BDT') return `৳${value.toLocaleString('en-BD')}`;
    if (currency === 'USD') return `$${value.toFixed(2)}`;
    return `${value.toFixed(2)} ${currency}`;
  } catch {
    return '—';
  }
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

type StatusVariant = 'neutral' | 'warning' | 'success' | 'inactive';
const STATUS_CHIP: Record<string, { label: string; variant: StatusVariant }> = {
  DRAFT: { label: 'Draft', variant: 'neutral' },
  PUBLISHED: { label: 'Published', variant: 'success' },
  ARCHIVED: { label: 'Archived', variant: 'inactive' },
};

// ── Toolbar ───────────────────────────────────────────────────────────────────

interface ToolbarProps {
  params: ProductListParams;
  categories: Array<{ id: string; name: string }>;
  isPending: boolean;
  onNavigate: (update: Partial<ProductListParams> & { resetCursor?: boolean }) => void;
}

function Toolbar({ params, categories, isPending, onNavigate }: ToolbarProps) {
  const hasFilters = !!params.q || !!params.status || !!params.categoryId;
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[200px] flex-1">
        <Search
          className="text-steel-500 pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          type="search"
          aria-label="Search products"
          placeholder="Name, SKU, or slug…"
          defaultValue={params.q ?? ''}
          className="adm-td border-steel-700 bg-bg-elevated text-steel-100 placeholder:text-steel-600 h-9 w-full rounded-md border pr-3 pl-9 text-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          disabled={isPending}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const v = (e.currentTarget.value ?? '').trim();
              onNavigate({ q: v || undefined, resetCursor: true });
            }
          }}
          onChange={(e) => {
            if (!e.currentTarget.value) onNavigate({ q: undefined, resetCursor: true });
          }}
        />
      </div>

      {/* Status filter */}
      <select
        aria-label="Filter by status"
        value={params.status ?? ''}
        disabled={isPending}
        onChange={(e) =>
          onNavigate({
            status: (e.target.value || undefined) as ProductListParams['status'],
            resetCursor: true,
          })
        }
        className="adm-td border-steel-700 bg-bg-elevated text-steel-200 h-9 rounded-md border text-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
      >
        <option value="">All statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
        <option value="ARCHIVED">Archived</option>
      </select>

      {/* Category filter */}
      {categories.length > 0 && (
        <select
          aria-label="Filter by category"
          value={params.categoryId ?? ''}
          disabled={isPending}
          onChange={(e) =>
            onNavigate({ categoryId: e.target.value || undefined, resetCursor: true })
          }
          className="adm-td border-steel-700 bg-bg-elevated text-steel-200 h-9 rounded-md border text-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <button
          type="button"
          aria-label="Clear all filters"
          disabled={isPending}
          onClick={() =>
            onNavigate({
              q: undefined,
              status: undefined,
              categoryId: undefined,
              resetCursor: true,
            })
          }
          className="text-steel-400 hover:bg-bg-elevated hover:text-steel-200 inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
        >
          <X className="h-4 w-4" aria-hidden />
          Clear filters
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ProductsTableProps {
  rows: AdminProductListItem[];
  pagination: DataTableCursorPagination;
  categories: Array<{ id: string; name: string }>;
  params: ProductListParams;
  hasError?: boolean;
}

export function ProductsTable({
  rows,
  pagination,
  categories,
  params,
  hasError,
}: ProductsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(update: Partial<ProductListParams> & { resetCursor?: boolean }) {
    const next = { ...params, ...update };
    const sp = new URLSearchParams();
    if (next.q) sp.set('q', next.q);
    if (next.status) sp.set('status', next.status);
    if (next.categoryId) sp.set('categoryId', next.categoryId);
    if (next.sort !== 'updatedAt') sp.set('sort', next.sort);
    if (next.direction !== 'desc') sp.set('direction', next.direction);
    if (next.pageSize !== 20) sp.set('pageSize', String(next.pageSize));
    if (!update.resetCursor) {
      if (next.cursor) {
        sp.set('cursor', next.cursor);
        sp.set('cursorDirection', next.cursorDirection);
      }
    }
    startTransition(() => router.push(`/admin/products?${sp.toString()}`));
  }

  function handleSort(sort: DataTableSort) {
    navigate({
      sort: sort.key as ProductListParams['sort'],
      direction: sort.direction,
      resetCursor: true,
    });
  }

  const columns: DataTableColumn<AdminProductListItem>[] = [
    {
      id: 'product',
      header: 'Product',
      sortKey: 'name',
      minWidth: '220px',
      cell: (row) => (
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="bg-bg-elevated border-steel-800 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border">
            {row.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.imageUrl}
                alt={row.imageAlt ?? ''}
                className="h-full w-full object-contain"
                width={40}
                height={40}
              />
            ) : (
              <span className="text-steel-600 font-mono text-[10px]">—</span>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/products/${row.id}`}
              className="text-steel-100 truncate rounded text-sm font-medium hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {row.name}
            </Link>
            <p className="text-steel-500 truncate font-mono text-[10px]">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'sku',
      header: 'SKU',
      sortKey: 'sku',
      hideBelow: 'md',
      cell: (row) => <span className="text-steel-300 font-mono text-xs">{row.sku}</span>,
    },
    {
      id: 'category',
      header: 'Category',
      hideBelow: 'lg',
      cell: (row) => <span className="text-steel-300 text-sm">{row.categoryName}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      sortKey: 'status',
      width: '120px',
      cell: (row) => {
        const s = STATUS_CHIP[row.status] ?? { label: row.status, variant: 'neutral' as const };
        return <AdminStatusChip variant={s.variant} label={s.label} size="sm" />;
      },
    },
    {
      id: 'stock',
      header: 'Stock',
      sortKey: 'stock',
      align: 'right',
      width: '80px',
      hideBelow: 'md',
      cell: (row) => <span className="text-steel-200 text-sm tabular-nums">{row.stock}</span>,
    },
    {
      id: 'price',
      header: 'Price',
      align: 'right',
      width: '120px',
      hideBelow: 'sm',
      cell: (row) => (
        <span className="text-steel-200 text-sm tabular-nums">
          {formatPrice(row.priceMinorStr, row.currency)}
        </span>
      ),
    },
    {
      id: 'updated',
      header: 'Updated',
      sortKey: 'updatedAt',
      align: 'right',
      hideBelow: 'lg',
      cell: (row) => (
        <span className="text-steel-400 font-mono text-xs">{formatDate(row.updatedAt)}</span>
      ),
    },
  ];

  const currentSort: DataTableSort | null = params.sort
    ? { key: params.sort, direction: params.direction }
    : null;

  const hasActiveFilters = !!params.q || !!params.status || !!params.categoryId;
  const emptyState = hasActiveFilters
    ? {
        title: 'No products match these filters',
        description: 'Adjust or clear the current search and filters.',
      }
    : {
        title: 'No products yet',
        description:
          'Product records will appear here after they are added through the approved product-management workflow.',
      };

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      sort={currentSort}
      onSortChange={handleSort}
      pagination={pagination}
      onNextPage={() =>
        navigate({ cursor: pagination.nextCursor ?? undefined, cursorDirection: 'after' })
      }
      onPreviousPage={() =>
        navigate({ cursor: pagination.previousCursor ?? undefined, cursorDirection: 'before' })
      }
      loading={isPending}
      error={
        hasError
          ? { title: 'Unable to load products', description: 'Refresh the page or try again.' }
          : null
      }
      emptyState={emptyState}
      toolbar={
        <Toolbar
          params={params}
          categories={categories}
          isPending={isPending}
          onNavigate={(u) => navigate(u)}
        />
      }
      caption="Products catalog"
      className="min-h-[400px]"
    />
  );
}
