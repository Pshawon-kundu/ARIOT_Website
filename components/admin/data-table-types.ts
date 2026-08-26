import type { ReactNode } from 'react';

/**
 * Admin data-table type contracts — Step 2.4.1.
 *
 * All types are exported from this module so feature pages can import
 * column definitions, sort state, and pagination cursors without depending
 * on the component itself.
 *
 * Architecture principle: the DataTable is a fully controlled presentation
 * primitive.  It never fetches data, manages server state, or assumes an
 * entity type.  All data, sort, filter, and pagination state lives in the
 * parent (usually a server-rendered page or server action).
 */

// ── Sort ─────────────────────────────────────────────────────────────────────

export type DataTableSortDirection = 'asc' | 'desc';

export interface DataTableSort {
  /** Matches `DataTableColumn.sortKey` for the column being sorted. */
  key: string;
  direction: DataTableSortDirection;
}

// ── Column ───────────────────────────────────────────────────────────────────

export interface DataTableColumn<T> {
  /** Stable identifier used as React `key` and for aria attributes. */
  id: string;
  /** Rendered inside `<th>`.  May be a string or any ReactNode. */
  header: ReactNode;
  /** Receives the full row and returns the cell content. */
  cell: (row: T) => ReactNode;
  /**
   * When set, the column header renders a sort-toggle button that calls
   * `onSortChange` with this key.  The key is typically a DB field name.
   * Sorting itself is performed server-side — the table never reorders rows.
   */
  sortKey?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  minWidth?: string;
  /** Tailwind classes applied to `<td>` cells in this column. */
  className?: string;
  /** Tailwind classes applied to the `<th>` header cell. */
  headerClassName?: string;
  /**
   * Hides the column below a responsive breakpoint.
   * `'sm'` → hidden on mobile, visible from `sm` upward.
   * `'md'` → hidden below `md`, etc.
   */
  hideBelow?: 'sm' | 'md' | 'lg';
}

// ── Cursor pagination ─────────────────────────────────────────────────────────

/**
 * Opaque cursor pagination state.
 *
 * Cursor values are treated as opaque strings — the table never parses,
 * modifies, or displays them.  `hasNextPage` / `hasPreviousPage` are the
 * canonical signals for enabling/disabling navigation controls.
 */
export interface DataTableCursorPagination {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string | null;
  previousCursor?: string | null;
  /** Optional: total item count for display ("Showing 20 of 847 records"). */
  itemCount?: number;
  /** Optional: records per page for display. */
  pageSize?: number;
}

// ── Empty / error states ──────────────────────────────────────────────────────

export interface DataTableEmptyState {
  title?: string;
  description?: string;
  /** Optional icon node.  Falls back to the Inbox icon when omitted. */
  icon?: ReactNode;
  /** Optional CTA.  The parent is responsible for creating an honest action. */
  action?: ReactNode;
}

export interface DataTableErrorState {
  title?: string;
  description?: string;
  /** Optional retry callback.  Only shown when provided. */
  onRetry?: () => void;
}

// ── Component props ───────────────────────────────────────────────────────────

export interface DataTableProps<T> {
  columns: ReadonlyArray<DataTableColumn<T>>;
  rows: ReadonlyArray<T>;
  /** Must return a stable unique string for each row (used as React `key`). */
  getRowId: (row: T) => string;

  /** Currently active sort, or null/undefined for no sort. */
  sort?: DataTableSort | null;
  /**
   * Called when the user clicks a sortable column header.
   *
   * Sort cycle: none → asc → desc → asc (cycles).
   * Clicking a different column always starts at `'asc'`.
   * A `null` value is not emitted — sorting always transitions to a direction.
   */
  onSortChange?: (sort: DataTableSort) => void;

  pagination?: DataTableCursorPagination;
  onNextPage?: () => void;
  onPreviousPage?: () => void;

  loading?: boolean;
  /** Number of skeleton rows while loading.  Defaults to 5. */
  skeletonRowCount?: number;
  /** When provided, renders the error state instead of the table body. */
  error?: DataTableErrorState | null;
  /** Custom empty state.  Falls back to a generic "No records found" message. */
  emptyState?: DataTableEmptyState;

  /**
   * Optional slot for filters, search, or bulk-action controls above the table.
   * The table provides layout only; the parent supplies the actual controls.
   */
  toolbar?: ReactNode;

  /** Screen-reader accessible caption for the table.  Defaults to "Records". */
  caption?: string;

  /**
   * Optional row activation callback for list→detail navigation.
   * Only rows for which this is provided become interactive (cursor-pointer,
   * focusable, keyboard-activatable with Enter).
   * Note: clicks on interactive children (buttons/links) inside the row do
   * NOT bubble up to this handler.
   */
  onRowActivate?: (row: T) => void;

  /**
   * Optional per-row actions renderer.  When provided, a final column is
   * appended with a screen-reader-labelled "Actions" header.
   * The parent is responsible for all action semantics and permissions.
   */
  rowActions?: (row: T) => ReactNode;

  className?: string;
}
