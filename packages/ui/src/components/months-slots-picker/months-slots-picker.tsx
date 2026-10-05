'use client'

import { addDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon, AlertTriangle } from 'lucide-react'
import * as React from 'react'

import { classMerge } from '../../lib/utils'
import { Button } from '../Button'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'
import { MonthsSlotsPickerContent } from './months-slots-picker-content'
import type { MonthsSlotsPickerProps } from './types'

const SLOT_DURATION_DAYS = 30

export const MonthsSlotsPicker: React.FC<MonthsSlotsPickerProps> = ({
  value,
  onChange,
  startDate = new Date(),
  unavailableRanges = [],
  label = 'Select Duration',
  placeholder = 'Select months',
  disabled = false,
  permissive = false,
  hasConflict = false,
  conflictMessage,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<string[]>(value)

  React.useEffect(() => {
    if (isOpen) {
      setInternalValue(value)
    }
  }, [isOpen, value])

  const handleApply = () => {
    onChange(internalValue)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  const displayText = React.useMemo(() => {
    if (!value || value.length === 0) return placeholder
    if (value.length === 1) {
      const singleValue = value[0]
      return singleValue
        ? format(new Date(singleValue), 'd MMMM', { locale: fr })
        : placeholder
    }

    const startValue = value[0]
    const endValue = value[value.length - 1]

    if (!startValue || !endValue) return placeholder

    const start = format(new Date(startValue), 'd MMMM', { locale: fr })
    const end = format(
      addDays(new Date(endValue), SLOT_DURATION_DAYS - 1),
      'd MMMM',
      { locale: fr },
    )
    return `${start} - ${end}`
  }, [value, placeholder])

  const hasSelection = value && value.length > 0

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={classMerge(
            'w-full justify-start bg-white text-left font-normal dark:bg-zinc-950',
            value.length === 0 && 'text-muted-foreground',
          )}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="flex-1 text-[14px]">{displayText}</span>
          {hasSelection && hasConflict && (
            <div
              className="group/tooltip relative ml-2 flex cursor-pointer items-center justify-center"
              onClick={(e) => {
                e.stopPropagation()
              }}>
              <AlertTriangle className="h-4 w-4 animate-pulse text-amber-500" />
              <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 origin-bottom -translate-x-1/2 scale-0 rounded-lg bg-slate-900 p-2.5 text-xs text-white shadow-xl transition-all duration-200 group-hover/tooltip:scale-100 group-focus/tooltip:scale-100 dark:bg-zinc-800">
                <p className="mb-1 font-semibold">Overbooking Warning</p>
                <p className="text-[11px] leading-normal text-slate-300">
                  {conflictMessage ||
                    'Some months in this selected range are fully booked. Walk-in bookings are permissive.'}
                </p>
                <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-slate-900 dark:bg-zinc-800" />
              </div>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-4">
          <h4 className="mb-4 text-center text-sm font-semibold text-slate-800 dark:text-slate-200">
            {label}
          </h4>
          <MonthsSlotsPickerContent
            value={internalValue}
            onChange={setInternalValue}
            startDate={startDate}
            unavailableRanges={unavailableRanges}
            permissive={permissive}
            hasConflict={hasConflict}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 p-2 dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
