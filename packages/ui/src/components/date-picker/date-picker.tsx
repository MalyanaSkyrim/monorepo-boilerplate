'use client'

import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import { DatePicker as MantineDatePicker } from '@mantine/dates'
import '@mantine/dates/styles.css'
import {
  Calendar as CalendarIcon,
  X as XIcon,
  AlertTriangle,
} from 'lucide-react'
import * as React from 'react'

import { classMerge } from '../../lib/utils'
import { Button } from '../Button'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'
import { datePickerStyles } from './styles'
import type { DatePickerProps } from './types'
import { formatDate, formatRange } from './utils'

// Override Mantine's default blue with the app's purple primary
const mantineTheme = createTheme({
  primaryColor: 'violet',
})

export const DatePicker = (props: DatePickerProps) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<
    DatePickerProps['value']
  >(props.value)

  React.useEffect(() => {
    if (open) {
      setInternalValue(props.value)
    }
  }, [open, props.value])

  const handleSelectSingle = (val: unknown) => {
    if (val === null || val instanceof Date) {
      setInternalValue(val)
    } else if (typeof val === 'string') {
      setInternalValue(new Date(val))
    }
  }

  const handleSelectRange = (val: unknown) => {
    if (Array.isArray(val)) {
      const start = typeof val[0] === 'string' ? new Date(val[0]) : val[0]
      const end = typeof val[1] === 'string' ? new Date(val[1]) : val[1]

      if (
        start instanceof Date &&
        end instanceof Date &&
        start.getTime() === end.getTime()
      ) {
        setInternalValue([null, null])
      } else {
        setInternalValue([
          start instanceof Date ? start : null,
          end instanceof Date ? end : null,
        ])
      }
    }
  }

  const handleApply = () => {
    if (props.mode === 'single') {
      props.onChange(Array.isArray(internalValue) ? null : internalValue)
    } else {
      props.onChange(
        Array.isArray(internalValue) ? internalValue : [null, null],
      )
    }
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const handleClear = (e: React.UIEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (props.mode === 'single') {
      props.onChange(null)
    } else {
      props.onChange([null, null])
    }
    setOpen(false)
  }

  const displayValue = React.useMemo(() => {
    if (props.mode === 'single') {
      return formatDate(props.value as Date | null)
    }
    return formatRange(props.value as [Date | null, Date | null])
  }, [props.value, props.mode])

  const isEmpty =
    props.mode === 'single'
      ? !props.value
      : !props.value?.[0] && !props.value?.[1]

  const { permissive, isDateUnavailable, hasConflict, mode } = props

  // Compute conflict from internal picker value so warning icon shows immediately
  const internalHasConflict = React.useMemo(() => {
    if (!permissive || !isDateUnavailable) return hasConflict
    if (mode === 'range' && Array.isArray(internalValue)) {
      const [start, end] = internalValue as [Date | null, Date | null]
      if (start && end) {
        const d = new Date(start)
        while (d <= end) {
          if (isDateUnavailable(d)) return true
          d.setDate(d.getDate() + 1)
        }
      }
    }
    return hasConflict ?? false
  }, [permissive, isDateUnavailable, hasConflict, mode, internalValue])

  const handleGetDayProps = React.useCallback(
    (date: Date) => {
      const isUnavailable = isDateUnavailable?.(date)
      if (!isUnavailable) return {}

      // Check if this unavailable day is within the currently selected range
      if (permissive && mode === 'range' && Array.isArray(internalValue)) {
        const [start, end] = internalValue as [Date | null, Date | null]
        if (start && end) {
          const dateDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          ).getTime()
          const startDay = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
          ).getTime()
          const endDay = new Date(
            end.getFullYear(),
            end.getMonth(),
            end.getDate(),
          ).getTime()

          if (dateDay >= startDay && dateDay <= endDay) {
            const isEndpoint = dateDay === startDay || dateDay === endDay
            // Unavailable + in range → amber (dark for first/last, light for middle)
            // Use custom classes from globals.css to guarantee specificity over Mantine
            return {
              style: { textDecoration: 'line-through' },
              className: isEndpoint
                ? 'date-picker-conflict-endpoint cursor-pointer'
                : 'date-picker-conflict cursor-pointer',
            }
          }
        }
      }

      // Unavailable but NOT in range → original gray styling
      return {
        className: permissive
          ? 'line-through text-slate-400 opacity-50 bg-slate-50 dark:bg-zinc-900/50 cursor-pointer'
          : 'line-through text-slate-400 opacity-50 bg-slate-50 dark:bg-zinc-900/50 cursor-not-allowed',
      }
    },
    [isDateUnavailable, permissive, mode, internalValue],
  )

  return (
    <MantineProvider theme={mantineTheme}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={props.disabled}
            className={classMerge(
              'w-full justify-start bg-white text-left font-normal dark:bg-zinc-950',
              isEmpty && 'text-muted-foreground',
            )}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="flex-1 text-[14px]">
              {isEmpty ? props.placeholder || 'Select date' : displayValue}
            </span>
            {!isEmpty && (props.hasConflict || internalHasConflict) && (
              <div
                className="group/tooltip relative ml-2 flex cursor-pointer items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation()
                }}>
                <AlertTriangle className="h-4 w-4 animate-pulse text-amber-500" />
                <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 origin-bottom -translate-x-1/2 scale-0 rounded-lg bg-slate-900 p-2.5 text-xs text-white shadow-xl transition-all duration-200 group-hover/tooltip:scale-100 group-focus/tooltip:scale-100 dark:bg-zinc-800">
                  <p className="mb-1 font-semibold">Overbooking Warning</p>
                  <p className="text-[11px] leading-normal text-slate-300">
                    {props.conflictMessage ||
                      'Some days in this selected range are fully booked. Walk-in bookings are permissive.'}
                  </p>
                  <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-slate-900 dark:bg-zinc-800" />
                </div>
              </div>
            )}
            {props.clearable && !isEmpty && !props.disabled && (
              <div
                role="button"
                tabIndex={0}
                className="ml-auto flex h-full items-center justify-center hover:opacity-70"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClear(e)
                  }
                }}>
                <XIcon className="h-4 w-4" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {props.mode === 'single' ? (
            <MantineDatePicker
              type="default"
              value={!Array.isArray(internalValue) ? internalValue : null}
              onChange={handleSelectSingle}
              minDate={props.minDate}
              maxDate={props.maxDate}
              getDayProps={handleGetDayProps}
              className="p-3"
              classNames={{ ...datePickerStyles, day: datePickerStyles.day }}
            />
          ) : (
            <MantineDatePicker
              type="range"
              value={
                Array.isArray(internalValue) ? internalValue : [null, null]
              }
              onChange={handleSelectRange}
              minDate={props.minDate}
              maxDate={props.maxDate}
              getDayProps={handleGetDayProps}
              allowSingleDateInRange
              className="p-3"
              classNames={{ ...datePickerStyles, day: datePickerStyles.day }}
            />
          )}
          <div className="flex justify-end gap-2 border-t p-2">
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
    </MantineProvider>
  )
}
