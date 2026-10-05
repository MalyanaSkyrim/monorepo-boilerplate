'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useMemo, useRef, useState } from 'react'

import { classMerge } from '../../lib/utils'
import { DataListPagination } from './DataListPagination'
import { DataListSearch } from './DataListSearch'
import { DataListSkeleton } from './DataListSkeleton'
import type {
  DataListProps,
  GlobalFilterConfig,
  PaginationConfig,
} from './types'

function isServerFilter(
  config: GlobalFilterConfig | undefined,
): config is Extract<GlobalFilterConfig, { mode: 'server' }> {
  return config?.mode === 'server'
}

function isServerPagination(
  config: PaginationConfig | undefined,
): config is Extract<PaginationConfig, { mode: 'server' }> {
  return config?.mode === 'server'
}

function isInteractiveElement(
  target: EventTarget | null,
  currentTarget: HTMLElement,
): boolean {
  if (target instanceof HTMLElement) {
    const interactive = target.closest(
      'button, a, input, select, textarea, [role="button"], [role="checkbox"], [role="menuitem"], [data-no-row-click]',
    )
    return interactive !== null && interactive !== currentTarget
  }
  return false
}

export function DataList<TData>({
  data,
  renderItem,
  estimateSize = 80,
  bufferSize = 5,
  height = '600px',
  pagination,
  pageSizeOptions = [10, 20, 50],
  globalFilter: globalFilterConfig,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No items found.',
  emptyState,
  isLoading = false,
  skeletonCount = 5,
  renderSkeleton,
  onItemClick,
  getItemKey,
  className,
  listClassName,
  toolbarContent,
}: DataListProps<TData>) {
  const parentRef = useRef<HTMLDivElement>(null)

  // ── Internal state for client-side features ──
  const [clientGlobalFilter, setClientGlobalFilter] = useState('')
  const [clientPagination, setClientPagination] = useState({
    pageIndex: 0,
    pageSize: pageSizeOptions?.[0] ?? 10,
  })

  // Determine effective filter
  const effectiveGlobalFilter = isServerFilter(globalFilterConfig)
    ? globalFilterConfig.globalFilter
    : clientGlobalFilter

  // Determine effective pagination
  const effectivePageIndex = isServerPagination(pagination)
    ? pagination.pagination.pageIndex
    : clientPagination.pageIndex

  const effectivePageSize = isServerPagination(pagination)
    ? pagination.pagination.pageSize
    : clientPagination.pageSize

  const effectiveTotalRows = isServerPagination(pagination)
    ? pagination.rowCount
    : data.length

  // Filtered & Paginated items for client-side mode
  const displayItems = useMemo(() => {
    let items = data

    // Client-side filtering if applicable
    if (!isServerFilter(globalFilterConfig) && clientGlobalFilter.trim()) {
      const query = clientGlobalFilter.toLowerCase()
      items = items.filter((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
          return String(item).toLowerCase().includes(query)
        }
        if (typeof item === 'object' && item !== null) {
          return Object.values(item).some((val) =>
            String(val).toLowerCase().includes(query),
          )
        }
        return false
      })
    }

    // Client-side pagination if applicable
    if (!isServerPagination(pagination) && pagination) {
      const start = clientPagination.pageIndex * clientPagination.pageSize
      const end = start + clientPagination.pageSize
      items = items.slice(start, end)
    }

    return items
  }, [
    data,
    globalFilterConfig,
    clientGlobalFilter,
    pagination,
    clientPagination,
  ])

  // Virtualizer for the list
  const rowVirtualizer = useVirtualizer({
    count: displayItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize:
      typeof estimateSize === 'function' ? estimateSize : () => estimateSize,
    overscan: bufferSize,
  })

  const handleSearchChange = useCallback(
    (value: string) => {
      if (isServerFilter(globalFilterConfig)) {
        globalFilterConfig.onGlobalFilterChange(value)
      } else {
        setClientGlobalFilter(value)
        setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
      }
      if (isServerPagination(pagination)) {
        pagination.onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }))
      }
    },
    [globalFilterConfig, pagination],
  )

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      if (isServerPagination(pagination)) {
        pagination.onPaginationChange((prev) => ({
          ...prev,
          pageIndex: newPageIndex,
        }))
      } else {
        setClientPagination((prev) => ({ ...prev, pageIndex: newPageIndex }))
      }
    },
    [pagination],
  )

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      if (isServerPagination(pagination)) {
        pagination.onPaginationChange((prev) => ({
          ...prev,
          pageSize: newPageSize,
          pageIndex: 0,
        }))
      } else {
        setClientPagination({ pageIndex: 0, pageSize: newPageSize })
      }
    },
    [pagination],
  )

  const handleItemClick = useCallback(
    (item: TData, e: React.MouseEvent<HTMLDivElement>) => {
      if (!onItemClick || isInteractiveElement(e.target, e.currentTarget)) {
        return
      }
      onItemClick(item)
    },
    [onItemClick],
  )

  const handleItemKeyDown = useCallback(
    (item: TData, e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onItemClick) {
        return
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (!isInteractiveElement(e.target, e.currentTarget)) {
          e.preventDefault()
          onItemClick(item)
        }
      }
    },
    [onItemClick],
  )

  // ── Loading state ──
  if (isLoading) {
    return (
      <div
        className={classMerge(
          'flex min-h-0 w-full flex-1 flex-col justify-between overflow-hidden',
          className,
        )}>
        {(globalFilterConfig || toolbarContent) && (
          <div className="flex shrink-0 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            {globalFilterConfig && (
              <DataListSearch
                value={effectiveGlobalFilter}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
              />
            )}
            {toolbarContent && (
              <div className="flex items-center gap-2">{toolbarContent}</div>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-auto">
          {renderSkeleton ? (
            renderSkeleton()
          ) : (
            <DataListSkeleton itemCount={skeletonCount} />
          )}
        </div>
      </div>
    )
  }

  const hasToolbar = globalFilterConfig !== undefined || toolbarContent
  const hasPagination = pagination !== undefined

  return (
    <div
      className={classMerge(
        'flex min-h-0 w-full flex-1 flex-col justify-between overflow-hidden',
        className,
      )}>
      {/* Toolbar */}
      {hasToolbar && (
        <div className="flex shrink-0 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          {globalFilterConfig && (
            <DataListSearch
              value={effectiveGlobalFilter}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
            />
          )}
          {toolbarContent && (
            <div className="flex items-center gap-2">{toolbarContent}</div>
          )}
        </div>
      )}

      {/* Virtualized Scroll Area */}
      <div
        ref={parentRef}
        style={{ maxHeight: height }}
        className={classMerge('min-h-0 flex-1 overflow-y-auto', listClassName)}>
        {displayItems.length === 0 ? (
          (emptyState ?? (
            <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center p-12 text-center text-sm text-slate-500">
              {emptyMessage}
            </div>
          ))
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = displayItems[virtualRow.index]
              if (item === undefined) {
                return null
              }
              const key = getItemKey
                ? getItemKey(item, virtualRow.index)
                : virtualRow.key

              return (
                <div
                  key={key}
                  tabIndex={onItemClick ? 0 : undefined}
                  role={onItemClick ? 'button' : undefined}
                  onClick={
                    onItemClick ? (e) => handleItemClick(item, e) : undefined
                  }
                  onKeyDown={
                    onItemClick ? (e) => handleItemKeyDown(item, e) : undefined
                  }
                  className={classMerge(
                    'transition-colors',
                    onItemClick &&
                      'cursor-pointer hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none',
                  )}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}>
                  {renderItem(item, virtualRow.index)}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {hasPagination && (
        <DataListPagination
          pageIndex={effectivePageIndex}
          pageSize={effectivePageSize}
          totalRows={effectiveTotalRows}
          pageSizeOptions={pageSizeOptions}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}

export type {
  ClientGlobalFilter,
  ClientPagination,
  DataListProps,
  GlobalFilterConfig,
  OnChangeFn,
  PaginationConfig,
  PaginationState,
  ServerGlobalFilter,
  ServerPagination,
} from './types'
