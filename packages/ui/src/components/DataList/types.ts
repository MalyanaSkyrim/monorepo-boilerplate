import type React from 'react'

export interface ClientPagination {
  mode?: 'client'
}

export interface ServerPagination {
  mode: 'server'
  rowCount: number
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
}

export type PaginationConfig = ClientPagination | ServerPagination

export interface ClientGlobalFilter {
  mode?: 'client'
}

export interface ServerGlobalFilter {
  mode: 'server'
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
}

export type GlobalFilterConfig = ClientGlobalFilter | ServerGlobalFilter

export interface PaginationState {
  pageIndex: number
  pageSize: number
}

export type OnChangeFn<T> = (updaterOrValue: T | ((old: T) => T)) => void

export interface DataListProps<TData> {
  /** Items to render in the list */
  data: TData[]
  /** Render function for each individual item */
  renderItem: (item: TData, index: number) => React.ReactNode
  /** Estimated row height in pixels for TanStack Virtual (default: 80) */
  estimateSize?: number | ((index: number) => number)
  /** Number of buffer items outside viewport (default: 5) */
  bufferSize?: number
  /** Height or max-height of the scroll container (default: "600px") */
  height?: number | string
  /** Pagination configuration (client or server mode) */
  pagination?: PaginationConfig
  /** Available page sizes for pagination dropdown (default: [10, 20, 50]) */
  pageSizeOptions?: number[]
  /** Global search filter configuration (client or server mode) */
  globalFilter?: GlobalFilterConfig
  /** Placeholder text for search bar */
  searchPlaceholder?: string
  /** Message displayed when list is empty */
  emptyMessage?: string
  /** Custom empty state node */
  emptyState?: React.ReactNode
  /** Loading state indicator */
  isLoading?: boolean
  /** Skeleton items count when loading (default: 5) */
  skeletonCount?: number
  /** Custom skeleton renderer */
  renderSkeleton?: () => React.ReactNode
  /** Click handler for list item rows */
  onItemClick?: (item: TData) => void
  /** Unique key extractor for items */
  getItemKey?: (item: TData, index: number) => string | number
  /** Container CSS classes */
  className?: string
  /** Scrollable viewport CSS classes */
  listClassName?: string
  /** Optional custom toolbar actions next to search */
  toolbarContent?: React.ReactNode
}
