'use client'

import { Skeleton } from '../Skeleton'

interface DataListSkeletonProps {
  itemCount?: number
}

export function DataListSkeleton({ itemCount = 5 }: DataListSkeletonProps) {
  return (
    <Skeleton.Root className="divide-y divide-slate-100 p-4">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div
          key={`skeleton-item-${index.toString()}`}
          className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
          <div className="flex flex-1 items-center gap-4">
            <Skeleton.Row className="h-12 w-12 shrink-0 rounded-lg" />
            <div className="max-w-md flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton.Row className="h-5 w-40" />
                <Skeleton.Row className="h-4 w-16 rounded-md" />
              </div>
              <Skeleton.Row className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton.Row className="h-6 w-20 rounded-full" />
            <Skeleton.Row className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </Skeleton.Root>
  )
}
