'use client';

/**
 * DataTable inner-state components — Step 2.4.1.
 * Extracted to keep data-table.tsx under 300 lines.
 * Contains: SortIcon, SkeletonRows, EmptyRow, ErrorRow.
 */

import { AlertCircle, ArrowDown, ArrowUp, ChevronsUpDown, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { DataTableEmptyState, DataTableErrorState } from './data-table-types';

// ── Sort icon ─────────────────────────────────────────────────────────────────

export function SortIcon({ direction }: { direction: 'asc' | 'desc' | 'none' }) {
  if (direction === 'asc') return <ArrowUp className="h-3.5 w-3.5 text-cyan-400" aria-hidden />;
  if (direction === 'desc') return <ArrowDown className="h-3.5 w-3.5 text-cyan-400" aria-hidden />;
  return <ChevronsUpDown className="text-steel-600 h-3.5 w-3.5" aria-hidden />;
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────

const SK_WIDTHS = ['w-1/2', 'w-3/4', 'w-2/5', 'w-2/3', 'w-3/5'] as const;

export function SkeletonRows({ colCount, count }: { colCount: number; count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <tr key={i} aria-hidden="true">
          {Array.from({ length: colCount }, (_, j) => (
            <td key={j} className="adm-td">
              <div
                className={cn(
                  'bg-steel-800/60 h-4 animate-pulse rounded',
                  SK_WIDTHS[(i + j) % SK_WIDTHS.length],
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function EmptyRow({ colSpan, empty }: { colSpan: number; empty: DataTableEmptyState }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-steel-700">
            {empty.icon ?? <Inbox className="h-10 w-10" aria-hidden />}
          </div>
          <div>
            <p className="text-steel-300 text-sm font-medium">
              {empty.title ?? 'No records found'}
            </p>
            <p className="text-steel-500 mt-1 text-xs">
              {empty.description ?? 'There are no records to display.'}
            </p>
          </div>
          {empty.action && <div className="mt-2">{empty.action}</div>}
        </div>
      </td>
    </tr>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

export function ErrorRow({ colSpan, error }: { colSpan: number; error: DataTableErrorState }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center" role="alert">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="text-danger h-10 w-10" aria-hidden />
          <div>
            <p className="text-steel-300 text-sm font-medium">
              {error.title ?? 'Unable to load records'}
            </p>
            <p className="text-steel-500 mt-1 text-xs">
              {error.description ?? 'Try again or refresh the page.'}
            </p>
          </div>
          {error.onRetry && (
            <button
              type="button"
              onClick={error.onRetry}
              className={cn(
                'border-danger/30 bg-danger/10 mt-1 rounded-md border px-4 py-2',
                'text-danger hover:bg-danger/20 text-sm transition-colors',
                'focus-visible:ring-danger focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              Try again
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
