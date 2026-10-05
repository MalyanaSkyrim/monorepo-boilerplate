import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { endOfDay, isSameDay, startOfDay, startOfMonth } from 'date-fns'
import dayjs from 'dayjs'
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { View } from 'react-native'
import DateTimePicker, { DateType } from 'react-native-ui-datepicker'

import { Button } from '../Button'

export interface DatePickerBaseProps {
  isVisible: boolean
  onClose: () => void
  unavailableDates?: Date[]
  minDate?: Date
  maxDate?: Date
  allowDeselect?: boolean
  onMonthChange?: (monthDate: Date) => void
}

export interface DatePickerSingleProps extends DatePickerBaseProps {
  mode?: 'single'
  value?: Date
  onChange?: (date: Date) => void
}

export interface DatePickerRangeProps extends DatePickerBaseProps {
  mode: 'range'
  value?: { startDate: Date; endDate: Date }
  onChange?: (range: { startDate: Date; endDate: Date }) => void
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps

export const DatePicker = forwardRef<BottomSheetModal, DatePickerProps>(
  (props, ref) => {
    const {
      isVisible,
      onClose,
      unavailableDates,
      minDate,
      maxDate,
      allowDeselect = false,
      mode = 'single',
      onMonthChange,
    } = props

    const bottomSheetModalRef = useRef<BottomSheetModal>(null)
    const displayedMonthRef = useRef<Date>(new Date())

    // Internal state for single date
    const [selectedDate, setSelectedDate] = useState<DateType | undefined>(
      mode === 'single' ? (props as DatePickerSingleProps).value : undefined,
    )

    // Internal state for date range
    const [range, setRange] = useState<{
      startDate: DateType | undefined
      endDate: DateType | undefined
    }>({
      startDate:
        mode === 'range'
          ? (props as DatePickerRangeProps).value?.startDate
          : undefined,
      endDate:
        mode === 'range'
          ? (props as DatePickerRangeProps).value?.endDate
          : undefined,
    })

    // Sync external ref
    React.useImperativeHandle(
      ref,
      () => bottomSheetModalRef.current as BottomSheetModal,
    )

    // Sync internal state with props when keys change
    useEffect(() => {
      if (mode === 'single') {
        const singleProps = props as DatePickerSingleProps
        setSelectedDate(singleProps.value)
        displayedMonthRef.current = singleProps.value ?? new Date()
      } else {
        const rangeProps = props as DatePickerRangeProps
        setRange({
          startDate: rangeProps.value?.startDate,
          endDate: rangeProps.value?.endDate,
        })
        displayedMonthRef.current =
          rangeProps.value?.startDate ?? rangeProps.value?.endDate ?? new Date()
      }
    }, [props, mode])

    // Present/Dismiss based on isVisible prop
    useEffect(() => {
      if (isVisible) {
        bottomSheetModalRef.current?.present()
      } else {
        bottomSheetModalRef.current?.dismiss()
      }
    }, [isVisible])

    const snapPoints = useMemo(() => ['65%', '90%'], [])

    const handleDismiss = useCallback(() => {
      onClose()
    }, [onClose])

    // --- Single Date Logic ---
    const handleDateChange = useCallback(
      (params: { date: DateType }) => {
        const date = params.date
        if (!date) return

        const dateObj = dayjs(date).toDate()

        if (
          allowDeselect &&
          selectedDate &&
          isSameDay(dateObj, dayjs(selectedDate).toDate())
        ) {
          setSelectedDate(undefined)
          return
        }

        setSelectedDate(date)
      },
      [allowDeselect, selectedDate],
    )

    // --- Range Date Logic ---
    const isRangeContainsUnavailableDate = useCallback(
      (startDate: DateType, endDate: DateType) => {
        return unavailableDates?.some((date) => {
          return startDate && date >= startDate && endDate && date <= endDate
        })
      },
      [unavailableDates],
    )

    const handleRangeChange = useCallback(
      (params: { startDate: DateType; endDate: DateType }) => {
        const { startDate, endDate } = params

        if (isRangeContainsUnavailableDate(startDate, endDate)) {
          setRange((prevRange) => {
            // If Start Date matches old start, End Date is new click
            if (dayjs(prevRange.startDate).isSame(startDate)) {
              return { startDate: endDate, endDate: undefined }
            }
            // If End Date matches old Start, Start Date is new click (Backward selection)
            if (dayjs(prevRange.startDate).isSame(endDate)) {
              return { startDate, endDate: undefined }
            }
            // Fallback
            return { startDate, endDate: undefined }
          })
        } else {
          setRange({ startDate, endDate })
        }
      },
      [isRangeContainsUnavailableDate],
    )

    const handleMonthChange = useCallback(
      (month: number) => {
        if (__DEV__) {
          console.log(
            '[DatePicker] month dropdown onMonthChange (index 0–11)',
            month,
          )
        }
        const d = new Date(displayedMonthRef.current)
        d.setMonth(month, 1)
        const nextMonthDate = startOfMonth(d)
        displayedMonthRef.current = nextMonthDate
        onMonthChange?.(nextMonthDate)
      },
      [onMonthChange],
    )

    const handleDisplayedMonthChange = useCallback(
      (date: Date) => {
        if (__DEV__) {
          console.log(
            '[DatePicker] chevron onDisplayedMonthChange (patched library)',
            date.toISOString(),
          )
        }
        const nextMonthDate = startOfMonth(date)
        displayedMonthRef.current = nextMonthDate
        onMonthChange?.(nextMonthDate)
      },
      [onMonthChange],
    )

    const handleYearChange = useCallback(
      (year: number) => {
        if (__DEV__) {
          console.log('[DatePicker] onYearChange', year)
        }
        const nextMonthDate = new Date(displayedMonthRef.current)
        nextMonthDate.setFullYear(year, nextMonthDate.getMonth(), 1)
        displayedMonthRef.current = nextMonthDate
        onMonthChange?.(nextMonthDate)
      },
      [onMonthChange],
    )

    const handleConfirm = useCallback(() => {
      if (mode === 'single') {
        const singleProps = props as DatePickerSingleProps
        if (selectedDate && singleProps.onChange) {
          singleProps.onChange(dayjs(selectedDate).toDate())
          onClose()
        }
      } else {
        const rangeProps = props as DatePickerRangeProps

        if (range.startDate && range.endDate && rangeProps.onChange) {
          const start = startOfDay(dayjs(range.startDate).toDate())
          const end = endOfDay(dayjs(range.endDate).toDate())
          rangeProps.onChange({ startDate: start, endDate: end })
          onClose()
        }
      }
    }, [mode, props, selectedDate, range, onClose])

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    )

    const isDisabled = useMemo(() => {
      if (mode === 'single') {
        return !selectedDate
      }
      return !(range.startDate && range.endDate)
    }, [mode, selectedDate, range])

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={handleDismiss}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#e5e7eb', width: 40 }}
        enablePanDownToClose>
        <BottomSheetView className="p-6">
          {mode === 'single' ? (
            <DateTimePicker
              mode="single"
              date={selectedDate}
              onChange={handleDateChange}
              onMonthChange={handleMonthChange}
              onDisplayedMonthChange={handleDisplayedMonthChange}
              onYearChange={handleYearChange}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={unavailableDates}
              classNames={{
                selected: 'bg-primary-300 rounded-full',
                weekdays: 'h-12',
                day: 'aspect-square',
                day_cell: 'mb-0.5',
                month_selector_label: 'text-lg font-semibold text-gray-800',
                year_selector_label: 'text-lg font-semibold text-gray-800',
                day_label: 'text-base text-gray-800 font-medium',
                selected_label: 'text-white font-semibold',
                weekday_label: 'text-[13px] font-semibold text-gray-500',
                disabled_label: 'text-[#A3A3A3] line-through',
                today_label: 'text-[#4F47EB] font-bold',
              }}
            />
          ) : (
            <DateTimePicker
              mode="range"
              startDate={range.startDate}
              endDate={range.endDate}
              onChange={handleRangeChange}
              onMonthChange={handleMonthChange}
              onDisplayedMonthChange={handleDisplayedMonthChange}
              onYearChange={handleYearChange}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={unavailableDates}
              classNames={{
                selected: 'bg-primary-300 rounded-full',
                range_start: 'bg-primary-300',
                range_end: 'bg-primary-300',
                range_fill: 'bg-primary-25 opacity-[0.3]',
                weekdays: 'h-12',
                day: 'aspect-square',
                day_cell: 'mb-0.5',
                month_selector_label: 'text-lg font-semibold text-gray-800',
                year_selector_label: 'text-lg font-semibold text-gray-800',
                day_label: 'text-base text-gray-800 font-medium',
                selected_label: 'text-white font-semibold',
                weekday_label: 'text-[13px] font-semibold text-gray-500',
                disabled_label: 'text-[#A3A3A3] line-through',
                today_label: 'text-[#4F47EB] font-bold',
              }}
            />
          )}

          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              label="Cancel"
              onPress={onClose}
              className="flex-1"
            />
            <Button
              variant="primary"
              label="Confirm"
              onPress={handleConfirm}
              disabled={isDisabled}
              className="flex-1"
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    )
  },
)

DatePicker.displayName = 'DatePicker'
