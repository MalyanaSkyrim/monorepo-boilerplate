'use client'

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useCallback, useState } from 'react'

import { classMerge as cn } from '../../lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../Table'
import { DataTablePagination } from './DataTablePagination'
import { DataTableSearch } from './DataTableSearch'
import { DataTableSkeleton } from './DataTableSkeleton'
import type { DataTableProps, Row } from './types'

function isServerPagination(
  config: DataTableProps<unknown>['pagination'],
): config is Extract<
  NonNullable<DataTableProps<unknown>['pagination']>,
  { mode: 'server' }
> {
  return config?.mode === 'server'
}

function isServerFilter(
  config: DataTableProps<unknown>['globalFilter'],
): config is Extract<
  NonNullable<DataTableProps<unknown>['globalFilter']>,
  { mode: 'server' }
> {
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

export function DataTable<TData>({
  columns,
  data,
  pagination,
  pageSizeOptions,
  globalFilter: globalFilterConfig,
  searchPlaceholder,
  enableSorting = false,
  enableRowSelection = false,
  getRowId,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  onRowClick,
  emptyMessage = 'No results found.',
  isLoading = false,
  className,
  rowClassName,
  toolbarContent,
}: DataTableProps<TData>) {
  // ── Internal state for client-side features ──
  const [sorting, setSorting] = useState<SortingState>([])
  const [clientGlobalFilter, setClientGlobalFilter] = useState('')
  const [clientPagination, setClientPagination] = useState({
    pageIndex: 0,
    pageSize: pageSizeOptions?.[0] ?? 10,
  })
  const [internalRowSelection, setInternalRowSelection] = useState({})

  // Determine effective row selection state
  const effectiveRowSelection = controlledRowSelection ?? internalRowSelection
  const effectiveOnRowSelectionChange =
    onRowSelectionChange ?? setInternalRowSelection

  // Determine effective global filter
  const effectiveGlobalFilter = isServerFilter(globalFilterConfig)
    ? globalFilterConfig.globalFilter
    : clientGlobalFilter

  // Determine effective pagination
  const effectivePagination = isServerPagination(pagination)
    ? pagination.pagination
    : clientPagination

  const effectiveOnPaginationChange = isServerPagination(pagination)
    ? pagination.onPaginationChange
    : setClientPagination

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: effectiveGlobalFilter,
      pagination: effectivePagination,
      rowSelection: effectiveRowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: isServerFilter(globalFilterConfig)
      ? undefined
      : setClientGlobalFilter,
    onPaginationChange: effectiveOnPaginationChange,
    onRowSelectionChange: effectiveOnRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
    ...(!isServerFilter(globalFilterConfig) &&
      globalFilterConfig && {
        getFilteredRowModel: getFilteredRowModel(),
      }),
    ...(!isServerPagination(pagination) &&
      pagination && {
        getPaginationRowModel: getPaginationRowModel(),
      }),
    ...(isServerPagination(pagination) && {
      manualPagination: true,
      rowCount: pagination.rowCount,
    }),
    ...(isServerFilter(globalFilterConfig) && {
      manualFiltering: true,
    }),
    enableSorting,
    enableRowSelection,
    getRowId,
  })

  const handleSearchChange = useCallback(
    (value: string) => {
      if (isServerFilter(globalFilterConfig)) {
        globalFilterConfig.onGlobalFilterChange(value)
      } else {
        setClientGlobalFilter(value)
      }
      // Reset to first page on search
      if (isServerPagination(pagination)) {
        pagination.onPaginationChange((prev) => ({
          ...prev,
          pageIndex: 0,
        }))
      } else {
        table.setPageIndex(0)
      }
    },
    [globalFilterConfig, pagination, table],
  )

  const handleRowClick = useCallback(
    (row: Row<TData>, e: React.MouseEvent<HTMLTableRowElement>) => {
      if (!onRowClick || isInteractiveElement(e.target, e.currentTarget)) {
        return
      }
      onRowClick(row)
    },
    [onRowClick],
  )

  const handleRowKeyDown = useCallback(
    (row: Row<TData>, e: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (!onRowClick) {
        return
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (!isInteractiveElement(e.target, e.currentTarget)) {
          e.preventDefault()
          onRowClick(row)
        }
      }
    },
    [onRowClick],
  )

  // ── Loading state ──
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex min-h-0 w-full flex-1 flex-col overflow-hidden',
          className,
        )}>
        <DataTableSkeleton columnCount={columns.length} />
      </div>
    )
  }

  const hasToolbar = globalFilterConfig !== undefined || toolbarContent
  const hasPagination = pagination !== undefined

  return (
    <div
      className={cn(
        'flex min-h-0 w-full flex-1 flex-col justify-between overflow-hidden',
        className,
      )}>
      {/* Toolbar: Search + custom content */}
      {hasToolbar && (
        <div className="flex shrink-0 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {globalFilterConfig && (
            <DataTableSearch
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

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-0 bg-slate-50 hover:bg-slate-50">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500',
                        canSort && 'cursor-pointer select-none',
                      )}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }>
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {canSort && (
                          <span className="ml-1">
                            {sorted === 'asc' && (
                              <ArrowUp className="h-3.5 w-3.5" />
                            )}
                            {sorted === 'desc' && (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )}
                            {sorted === false && (
                              <ArrowUpDown className="h-3.5 w-3.5 text-slate-300" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-slate-200">
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-80 px-6 py-12 text-center text-sm text-slate-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const resolvedRowClassName =
                  typeof rowClassName === 'function'
                    ? rowClassName(row)
                    : rowClassName

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? 'button' : undefined}
                    className={cn(
                      onRowClick &&
                        'cursor-pointer transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none',
                      resolvedRowClassName,
                    )}
                    onKeyDown={
                      onRowClick ? (e) => handleRowKeyDown(row, e) : undefined
                    }
                    onClick={
                      onRowClick ? (e) => handleRowClick(row, e) : undefined
                    }>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {hasPagination && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  )
}

// Re-export types and sub-components
export type {
  ClientGlobalFilter,
  ClientPagination,
  ColumnDef,
  DataTableProps,
  GlobalFilterConfig,
  OnChangeFn,
  PaginationConfig,
  PaginationState,
  Row,
  RowSelectionState,
  ServerGlobalFilter,
  ServerPagination,
} from './types'
