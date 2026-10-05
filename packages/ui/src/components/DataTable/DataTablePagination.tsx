'use client'

import type { Table } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { classMerge } from '../../lib/utils'
import { Button } from '../Button'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
}

function buildPageNumbers(currentPage: number, totalPages: number): number[] {
  const pages: number[] = []

  for (let i = 1; i <= totalPages; i++) {
    const isFirstOrLast = i === 1 || i === totalPages
    const isNearCurrent = i >= currentPage - 1 && i <= currentPage + 1

    if (isFirstOrLast || isNearCurrent) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== -1) {
      // -1 represents an ellipsis
      pages.push(-1)
    }
  }

  return pages
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50],
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getRowCount()
  const totalPages = table.getPageCount()
  const currentPage = pageIndex + 1 // convert 0-indexed to 1-indexed

  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalRows)

  const pageNumbers = buildPageNumbers(currentPage, totalPages)

  return (
    <div className="mt-auto flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center justify-between gap-3 sm:justify-start">
        <span className="text-xs font-medium text-slate-500 sm:text-sm">
          Showing {start} to {end} of {totalRows}
        </span>
        <select
          className="shadow-2xs rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 sm:text-sm"
          value={pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}>
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-center gap-1 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="shadow-2xs h-8 w-8 border-slate-300 bg-white p-0 text-slate-700 hover:bg-slate-100 disabled:pointer-events-none disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100 disabled:shadow-none">
          <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
        </Button>
        {pageNumbers.map((n, i) =>
          n === -1 ? (
            <span
              key={`ellipsis-${i.toString()}`}
              className="px-1 text-xs text-slate-400">
              …
            </span>
          ) : (
            <Button
              key={n}
              variant={n === currentPage ? 'default' : 'outline'}
              size="sm"
              className={classMerge(
                'h-8 w-8 p-0 text-xs font-bold',
                n === currentPage
                  ? 'bg-primary shadow-xs text-white'
                  : 'shadow-2xs border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
              )}
              onClick={() => table.setPageIndex(n - 1)}>
              {n}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="shadow-2xs h-8 w-8 border-slate-300 bg-white p-0 text-slate-700 hover:bg-slate-100 disabled:pointer-events-none disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100 disabled:shadow-none">
          <ChevronRight className="h-4 w-4 stroke-[2.5]" />
        </Button>
      </div>
    </div>
  )
}
