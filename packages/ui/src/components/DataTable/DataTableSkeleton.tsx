'use client'

import { Skeleton } from '../Skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../Table'

interface DataTableSkeletonProps {
  columnCount: number
  rowCount?: number
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 5,
}: DataTableSkeletonProps) {
  return (
    <Skeleton.Root>
      <Table>
        <TableHeader>
          <TableRow className="border-0 bg-slate-50 hover:bg-slate-50">
            {Array.from({ length: columnCount }).map((_, i) => (
              <TableHead
                key={`head-skeleton-${i.toString()}`}
                className="px-4 py-3">
                <Skeleton.Row className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIdx) => (
            <TableRow key={`row-skeleton-${rowIdx.toString()}`}>
              {Array.from({ length: columnCount }).map((_, colIdx) => (
                <TableCell
                  key={`cell-skeleton-${rowIdx.toString()}-${colIdx.toString()}`}
                  className="px-4 py-3">
                  <Skeleton.Row className="h-4 max-w-[120px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Skeleton.Root>
  )
}
