'use client';

/**
 * DataTable — shared admin data-table foundation — Step 2.4.1.
 *
 * Fully controlled: the parent provides rows, sort, filter state, pagination
 * cursors, loading, and error state.  The table never fetches data, touches
 * Prisma, or assumes an entity type.
 *
 * Key conventions:
 *   - Native semantic table elements (table/thead/tbody/tr/th/td).
 *   - Density driven by `.adm-td` / `.adm-th` CSS classes in globals.css;
 *     changed by `data-density` on the admin shell root.
 *   - Sort is server-side only — clicking a header calls `onSortChange` and
 *     the parent re-queries.  Sort cycle: none → asc → desc → asc.
 *   - Cursor pagination is opaque — cursors are never parsed or displayed.
 *   - Row interaction is opt-in; static rows are not focusable.
 *
 * Sub-components (SortIcon, SkeletonRows, EmptyRow, ErrorRow) live in
 * `./data-table-states.tsx` to keep this file under the 300-line limit.
 * Types live in `./data-table-types.ts`.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SortIcon, SkeletonRows, EmptyRow, ErrorRow } from './data-table-states';
import type {
  DataTableColumn,
  DataTableCursorPagination,
  DataTableProps,
} from './data-table-types';

// Re-export all types so consumers only need one import path.
export type {
  DataTableColumn,
  DataTableCursorPagination,
  DataTableEmptyState,
  DataTableErrorState,
  DataTableProps,
  DataTableSort,
  DataTableSortDirection,
} from './data-table-types';

// ── Data row ──────────────────────────────────────────────────────────────────

interface DataRowProps<T> {
  row: T;
  rowId: string;
  columns: ReadonlyArray<DataTableColumn<T>>;
  onRowActivate?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
}

function DataRow<T>({ row, rowId, columns, onRowActivate, rowActions }: DataRowProps<T>) {
  const isInteractive = !!onRowActivate;

  function handleClick(e: React.MouseEvent) {
    // Don't fire when user clicks an interactive child (button/link/etc.)
    if ((e.target as HTMLElement).closest('a,button,[role=button]')) return;
    onRowActivate?.(row);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTableRowElement>) {
    if (e.key !== 'Enter') return;
    // Only activate when the row element itself is the event target.
    // If a nested interactive element (button, a, input, select…) is focused
    // and the user presses Enter, e.target will be that child, not the tr.
    // We intentionally do NOT activate the row in that case — the child handles
    // its own Enter key (e.g. a button click).
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    onRowActivate?.(row);
  }

  return (
    <tr
      data-rowid={rowId}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      className={cn(
        'border-steel-800/40 border-t transition-colors duration-100',
        isInteractive && [
          'hover:bg-bg-elevated/50 cursor-pointer',
          'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none focus-visible:ring-inset',
        ],
      )}
    >
      {columns.map((col) => (
        <td
          key={col.id}
          className={cn(
            'adm-td align-middle',
            col.hideBelow === 'sm' && 'hidden sm:table-cell',
            col.hideBelow === 'md' && 'hidden md:table-cell',
            col.hideBelow === 'lg' && 'hidden lg:table-cell',
            col.className,
          )}
          style={{ textAlign: col.align, width: col.width, minWidth: col.minWidth }}
        >
          {col.cell(row)}
        </td>
      ))}
      {rowActions && (
        <td className="adm-td text-right align-middle" onClick={(e) => e.stopPropagation()}>
          {rowActions(row)}
        </td>
      )}
    </tr>
  );
}

// ── Pagination controls ───────────────────────────────────────────────────────

interface PaginationProps {
  pagination: DataTableCursorPagination;
  /** Actual number of rows currently rendered (used for "Showing X records"). */
  rowCount: number;
  loading?: boolean;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}

function DataTablePagination({
  pagination,
  rowCount,
  loading,
  onNextPage,
  onPreviousPage,
}: PaginationProps) {
  const { hasNextPage, hasPreviousPage, itemCount } = pagination;
  const btnCls = cn(
    'inline-flex items-center gap-1.5 rounded-md border border-steel-800 bg-bg-elevated',
    'px-3 py-1.5 text-sm text-steel-200 transition-colors duration-150',
    'hover:bg-bg-raised hover:text-steel-100',
    'disabled:cursor-not-allowed disabled:opacity-40',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
  );
  // Show count only when not loading. itemCount = server-provided total (optional).
  // "Showing X of Y records" only when a real total is available.
  const countText = loading
    ? null
    : itemCount != null
      ? `Showing ${rowCount} of ${itemCount} records`
      : `Showing ${rowCount} record${rowCount !== 1 ? 's' : ''}`;

  return (
    <div className="border-steel-800 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-steel-500 text-xs">{countText}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage || loading}
          aria-label="Previous page"
          className={btnCls}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </button>
        <button
          type="button"
          onClick={onNextPage}
          disabled={!hasNextPage || loading}
          aria-label="Next page"
          className={btnCls}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

// ── Main DataTable ────────────────────────────────────────────────────────────

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  sort,
  onSortChange,
  pagination,
  onNextPage,
  onPreviousPage,
  loading = false,
  skeletonRowCount = 5,
  error,
  emptyState = {},
  toolbar,
  caption,
  onRowActivate,
  rowActions,
  className,
}: DataTableProps<T>) {
  const colSpan = columns.length + (rowActions ? 1 : 0);

  function handleSortClick(col: DataTableColumn<T>) {
    if (!col.sortKey || !onSortChange) return;
    const key = col.sortKey;
    if (!sort || sort.key !== key) {
      onSortChange({ key, direction: 'asc' });
    } else if (sort.direction === 'asc') {
      onSortChange({ key, direction: 'desc' });
    } else {
      // desc → cycle back to asc
      onSortChange({ key, direction: 'asc' });
    }
  }

  function getSortDir(col: DataTableColumn<T>): 'asc' | 'desc' | 'none' {
    if (!col.sortKey || !sort || sort.key !== col.sortKey) return 'none';
    return sort.direction;
  }

  return (
    <div className={cn('border-steel-800 bg-bg-raised flex flex-col rounded-lg border', className)}>
      {/* Toolbar slot — parent supplies search, filters, bulk actions */}
      {toolbar && (
        <div className="border-steel-800 flex flex-wrap items-center gap-3 border-b px-4 py-3">
          {toolbar}
        </div>
      )}

      {/* Horizontal-scroll container for wide tables */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <caption className="sr-only">
            {caption ?? 'Records'}
            {loading && ' — loading'}
          </caption>

          <thead>
            <tr className="border-steel-800 border-b">
              {columns.map((col) => {
                const isSortable = !!(col.sortKey && onSortChange);
                const dir = getSortDir(col);
                const ariaSort: React.AriaAttributes['aria-sort'] = !col.sortKey
                  ? undefined
                  : dir === 'asc'
                    ? 'ascending'
                    : dir === 'desc'
                      ? 'descending'
                      : 'none';
                return (
                  <th
                    key={col.id}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn(
                      'adm-th text-steel-500 text-left text-xs font-semibold tracking-[0.06em] uppercase',
                      col.hideBelow === 'sm' && 'hidden sm:table-cell',
                      col.hideBelow === 'md' && 'hidden md:table-cell',
                      col.hideBelow === 'lg' && 'hidden lg:table-cell',
                      col.headerClassName,
                    )}
                    style={{ textAlign: col.align, width: col.width, minWidth: col.minWidth }}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSortClick(col)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-sm transition-colors duration-150',
                          'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
                          'hover:text-steel-200',
                          dir !== 'none' && 'text-steel-200',
                        )}
                      >
                        {col.header}
                        <SortIcon direction={dir} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
              {rowActions && (
                <th scope="col" className="adm-th text-right">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonRows colCount={colSpan} count={skeletonRowCount} />
            ) : error ? (
              <ErrorRow colSpan={colSpan} error={error} />
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={colSpan} empty={emptyState} />
            ) : (
              rows.map((row) => (
                <DataRow
                  key={getRowId(row)}
                  row={row}
                  rowId={getRowId(row)}
                  columns={columns}
                  onRowActivate={onRowActivate}
                  rowActions={rowActions}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {loading && (
        <p role="status" className="sr-only">
          Loading records
        </p>
      )}

      {pagination && (
        <DataTablePagination
          pagination={pagination}
          rowCount={rows.length}
          loading={loading}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
        />
      )}
    </div>
  );
}
