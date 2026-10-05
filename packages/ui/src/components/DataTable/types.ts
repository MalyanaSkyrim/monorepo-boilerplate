'use client'

import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
} from '@tanstack/react-table'
import type { ReactNode } from 'react'

// ─── Pagination ────────────────────────────────────────────

/** Client-side: total rows are known, table handles slicing internally */
export type ClientPagination = {
  mode: 'client'
}

/** Server-side: parent controls page/pageSize and provides total row count */
export type ServerPagination = {
  mode: 'server'
  /** Total number of rows across all pages (from API response) */
  rowCount: number
  /** Controlled pagination state – lifted to the parent */
  pagination: PaginationState
  /** Called when user changes page or page size */
  onPaginationChange: OnChangeFn<PaginationState>
}

export type PaginationConfig = ClientPagination | ServerPagination

// ─── Global Filter ─────────────────────────────────────────

/** Client-side: TanStack filters the data in-memory */
export type ClientGlobalFilter = {
  mode: 'client'
}

/** Server-side: parent debounces + sends search term to API */
export type ServerGlobalFilter = {
  mode: 'server'
  /** Controlled filter value */
  globalFilter: string
  /** Called when the user types in the search box */
  onGlobalFilterChange: (value: string) => void
}

export type GlobalFilterConfig = ClientGlobalFilter | ServerGlobalFilter

// ─── Main Props ────────────────────────────────────────────

export interface DataTableProps<TData> {
  /** TanStack column definitions – consumer defines columns outside the table */
  columns: ColumnDef<TData, unknown>[]

  /** The data array. For server pagination this is the current page slice */
  data: TData[]

  // ── Pagination ──
  /** Enable pagination. Pass config object to control mode */
  pagination?: PaginationConfig

  /** Page size options shown in the dropdown. Default: [10, 20, 50] */
  pageSizeOptions?: number[]

  // ── Global Filter / Search ──
  /** Enable the global search input above the table */
  globalFilter?: GlobalFilterConfig

  /** Placeholder text for the search input */
  searchPlaceholder?: string

  // ── Sorting ──
  /** Enable column sorting. Defaults to false */
  enableSorting?: boolean

  // ── Row Selection ──
  /** Enable checkbox row selection. Defaults to false */
  enableRowSelection?: boolean

  /**
   * Stable id for each row, used as the key in `rowSelection`. Without it the
   * keys are row indexes, which point at different records after a server-side
   * page change.
   */
  getRowId?: (row: TData, index: number) => string

  /** Controlled row selection state (optional) */
  rowSelection?: RowSelectionState

  /** Called when row selection changes */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>

  // ── Row Interaction ──
  /** Called when a row is clicked */
  onRowClick?: (row: Row<TData>) => void

  // ── Empty State ──
  /** Custom message or ReactNode shown when data is empty */
  emptyMessage?: ReactNode

  // ── Loading ──
  /** Show skeleton rows while data is loading */
  isLoading?: boolean

  // ── Styling ──
  /** Additional className for the outer wrapper */
  className?: string

  /** Additional className applied to each body row */
  rowClassName?: string | ((row: Row<TData>) => string)

  // ── Toolbar ──
  /** Render additional toolbar content (filters, buttons) next to the search */
  toolbarContent?: ReactNode
}

// Re-export core TanStack types for consumer convenience
export type {
  ColumnDef,
  Row,
  PaginationState,
  OnChangeFn,
  RowSelectionState,
} from '@tanstack/react-table'
