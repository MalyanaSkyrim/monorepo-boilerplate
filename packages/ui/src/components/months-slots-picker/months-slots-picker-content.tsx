import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import * as React from 'react'

import { classMerge } from '../../lib/utils'
import type { MonthsSlotsPickerContentProps, SlotState } from './types'

const SLOT_DURATION_DAYS = 30
const NUMBER_OF_SLOTS = 12

export const MonthsSlotsPickerContent: React.FC<
  MonthsSlotsPickerContentProps
> = ({
  value,
  onChange,
  startDate,
  unavailableRanges = [],
  permissive = false,
  hasConflict = false,
}) => {
  const slots = React.useMemo(() => {
    return Array.from({ length: NUMBER_OF_SLOTS }, (_, i) => {
      const slotStart = startOfDay(addDays(startDate, i * SLOT_DURATION_DAYS))
      const slotEnd = addDays(slotStart, SLOT_DURATION_DAYS - 1)
      return {
        id: i,
        start: slotStart,
        end: slotEnd,
        startIso: format(slotStart, 'yyyy-MM-dd'),
        label: format(slotStart, 'd MMMM', { locale: fr }),
      }
    })
  }, [startDate])

  // Compute conflict internally so orange shows immediately on selection
  const internalHasConflict = React.useMemo(() => {
    if (!permissive || value.length === 0) return hasConflict
    return value.some((slotIso) => {
      const slot = slots.find((s) => s.startIso === slotIso)
      if (!slot) return false
      return unavailableRanges.some((range) => {
        const rangeStart = startOfDay(new Date(range.start))
        const rangeEnd = startOfDay(new Date(range.end))
        return (
          (isBefore(slot.start, rangeEnd) || isSameDay(slot.start, rangeEnd)) &&
          (isAfter(slot.end, rangeStart) || isSameDay(slot.end, rangeStart))
        )
      })
    })
  }, [permissive, value, slots, unavailableRanges, hasConflict])

  const isUnavailable = React.useCallback(
    (slotStart: Date, slotEnd: Date) => {
      return unavailableRanges.some((range) => {
        const rangeStart = startOfDay(new Date(range.start))
        const rangeEnd = startOfDay(new Date(range.end))
        return (
          (isBefore(slotStart, rangeEnd) || isSameDay(slotStart, rangeEnd)) &&
          (isAfter(slotEnd, rangeStart) || isSameDay(slotEnd, rangeStart))
        )
      })
    },
    [unavailableRanges],
  )

  const getSlotState = (slotIso: string): SlotState => {
    const selected = value.includes(slotIso)
    if (selected) {
      if (value.length === 1) return 'selected'
      const isStart = value[0] === slotIso
      const isEnd = value[value.length - 1] === slotIso
      if (isStart || isEnd) return 'selected'
      return 'inRange'
    }
    const slot = slots.find((s) => s.startIso === slotIso)
    if (slot && isUnavailable(slot.start, slot.end)) return 'unavailable'
    return 'default'
  }

  const handlePress = (slotIndex: number) => {
    const slot = slots[slotIndex]
    if (!slot || (isUnavailable(slot.start, slot.end) && !permissive)) return

    // 1. First selection or resetting
    if (value.length === 0 || value.length > 1) {
      onChange([slot.startIso])
      return
    }

    // 2. Second selection (Range)
    if (value.length === 1) {
      const startIso = value[0]
      const startSlotIndex = slots.findIndex((s) => s.startIso === startIso)

      if (startSlotIndex === -1) {
        onChange([slot.startIso])
        return
      }

      if (slotIndex === startSlotIndex) {
        return
      }

      const minIndex = Math.min(startSlotIndex, slotIndex)
      const maxIndex = Math.max(startSlotIndex, slotIndex)

      const rangeIsos: string[] = []
      let valid = true

      for (let i = minIndex; i <= maxIndex; i++) {
        const s = slots[i]
        if (s && isUnavailable(s.start, s.end) && !permissive) {
          valid = false
          break
        }
        if (s) {
          rangeIsos.push(s.startIso)
        }
      }

      if (valid) {
        onChange(rangeIsos)
      } else {
        onChange([slot.startIso])
      }
    }
  }

  const rows = React.useMemo(() => {
    const chunked = []
    for (let i = 0; i < slots.length; i += 3) {
      chunked.push(slots.slice(i, i + 3))
    }
    return chunked
  }, [slots])

  return (
    <div className="flex w-full flex-col gap-2">
      {rows.map((rowSlots, rowIndex) => (
        <div key={rowIndex} className="flex w-full flex-row gap-0">
          {rowSlots.map((slot, colIndex) => {
            const state = getSlotState(slot.startIso)
            const isFirstInRow = colIndex === 0
            const isLastInRow = colIndex === rowSlots.length - 1

            let isConnectedLeft = false
            let isConnectedRight = false

            if (state === 'selected' || state === 'inRange') {
              if (!isFirstInRow) {
                const prevSlot = rowSlots[colIndex - 1]
                if (prevSlot && value.includes(prevSlot.startIso)) {
                  isConnectedLeft = true
                }
              }
              if (!isLastInRow) {
                const nextSlot = rowSlots[colIndex + 1]
                if (nextSlot && value.includes(nextSlot.startIso)) {
                  isConnectedRight = true
                }
              }
            }

            return (
              <div key={slot.id} className="flex h-10 flex-1">
                <button
                  type="button"
                  onClick={() => handlePress(slot.id)}
                  disabled={state === 'unavailable' && !permissive}
                  className={classMerge(
                    'flex h-full flex-1 items-center justify-center border border-transparent text-xs font-medium transition-colors',
                    !isConnectedLeft && 'rounded-l-md',
                    !isConnectedRight && 'rounded-r-md',
                    isConnectedLeft && 'ml-[-1px] border-l-0',
                    isConnectedRight && 'mr-[-1px] border-r-0',
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
                  {slot.label}
                </button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
