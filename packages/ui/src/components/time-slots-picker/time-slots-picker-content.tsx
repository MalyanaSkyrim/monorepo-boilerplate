import * as React from 'react'

import { classMerge } from '../../lib/utils'
import type { TimeSlotsPickerContentProps, SlotState } from './types'

// 06:00 to 05:00 next day
const HOURS = Array.from({ length: 24 }, (_, i) => (i + 6) % 24)

export const TimeSlotsPickerContent: React.FC<TimeSlotsPickerContentProps> = ({
  value,
  onChange,
  unavailableRanges = [],
  permissive = false,
  hasConflict = false,
}) => {
  // Compute conflict internally so orange shows immediately on selection
  const internalHasConflict = React.useMemo(() => {
    if (!permissive || value.length === 0) return hasConflict
    return value.some((hour) =>
      unavailableRanges.some((range) => {
        if (range.end < range.start) {
          return hour >= range.start || hour < range.end
        }
        return hour >= range.start && hour < range.end
      }),
    )
  }, [permissive, value, unavailableRanges, hasConflict])

  const isUnavailable = React.useCallback(
    (hour: number) => {
      return unavailableRanges.some((range) => {
        if (range.end < range.start) {
          return hour >= range.start || hour < range.end
        }
        return hour >= range.start && hour < range.end
      })
    },
    [unavailableRanges],
  )

  const getSlotState = (hour: number): SlotState => {
    const selected = value.includes(hour)
    if (selected) {
      if (value.length === 1) return 'selected'
      const isStart = value[0] === hour
      const isEnd = value[value.length - 1] === hour
      if (isStart || isEnd) return 'selected'
      return 'inRange'
    }
    if (isUnavailable(hour)) return 'unavailable'
    return 'default'
  }

  const handlePress = (hour: number) => {
    if (isUnavailable(hour) && !permissive) return

    // 1. First selection or resetting to new single
    if (value.length === 0 || value.length > 1) {
      onChange([hour])
      return
    }

    // 2. Second tap (Range selection)
    if (value.length === 1) {
      const start = value[0]
      if (start === undefined || hour === start) {
        return
      }

      // Calculate range
      const range: number[] = []
      let valid = true

      if (hour > start) {
        for (let h = start; h <= hour; h++) {
          if (isUnavailable(h) && !permissive) {
            valid = false
            break
          }
          range.push(h)
        }
      } else {
        // Overnight
        for (let h = start; h < 24; h++) {
          if (isUnavailable(h) && !permissive) {
            valid = false
            break
          }
          range.push(h)
        }
        if (valid) {
          for (let h = 0; h <= hour; h++) {
            if (isUnavailable(h) && !permissive) {
              valid = false
              break
            }
            range.push(h)
          }
        }
      }

      if (valid) {
        onChange(range)
      } else {
        onChange([hour])
      }
    }
  }

  const rows = React.useMemo(() => {
    const chunked = []
    for (let i = 0; i < HOURS.length; i += 6) {
      chunked.push(HOURS.slice(i, i + 6))
    }
    return chunked
  }, [])

  return (
    <div className="flex w-full flex-col gap-2">
      {rows.map((rowHours, rowIndex) => (
        <div key={rowIndex} className="flex w-full flex-row gap-0">
          {rowHours.map((hour, colIndex) => {
            const state = getSlotState(hour)
            const isFirstInRow = colIndex === 0
            const isLastInRow = colIndex === rowHours.length - 1

            let isConnectedLeft = false
            let isConnectedRight = false

            if (state === 'selected' || state === 'inRange') {
              if (!isFirstInRow) {
                const prevHour = rowHours[colIndex - 1]
                if (prevHour !== undefined && value.includes(prevHour)) {
                  isConnectedLeft = true
                }
              }
              if (!isLastInRow) {
                const nextHour = rowHours[colIndex + 1]
                if (nextHour !== undefined && value.includes(nextHour)) {
                  isConnectedRight = true
                }
              }
            }

            return (
              <div key={hour} className="flex h-10 flex-1">
                <button
                  type="button"
                  onClick={() => handlePress(hour)}
                  disabled={state === 'unavailable' && !permissive}
                  className={classMerge(
                    'flex h-full flex-1 items-center justify-center border border-transparent text-xs font-medium transition-colors',
                    // Shape overrides based on connection
                    !isConnectedLeft && 'rounded-l-md',
                    !isConnectedRight && 'rounded-r-md',
                    isConnectedLeft && 'ml-[-1px] border-l-0',
                    isConnectedRight && 'mr-[-1px] border-r-0',
                    // State styles
                    state === 'default' &&
                      'bg-neutral-100 text-slate-800 hover:bg-neutral-200 dark:bg-zinc-800 dark:text-slate-200 dark:hover:bg-zinc-700',
                    state === 'selected' &&
                      (internalHasConflict
                        ? 'z-10 bg-amber-500 text-white shadow-sm'
                        : 'bg-primary z-10 text-white shadow-sm'),
                    state === 'inRange' &&
                      (internalHasConflict
                        ? 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-50'
                        : 'bg-primary-50 text-primary-900 dark:bg-primary-900 dark:text-primary-50'),
                    state === 'unavailable' &&
                      (permissive
                        ? 'bg-slate-50 text-slate-400 line-through opacity-50 hover:bg-slate-100 dark:bg-zinc-900/50 dark:text-zinc-600'
                        : 'cursor-not-allowed bg-slate-50 text-slate-400 line-through opacity-50 dark:bg-zinc-900/50 dark:text-zinc-600'),
                  )}>
                  {hour.toString().padStart(2, '0')}:00
                </button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
