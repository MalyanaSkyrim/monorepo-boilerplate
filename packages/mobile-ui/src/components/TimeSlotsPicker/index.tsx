import { Clock } from 'lucide-react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { tv } from 'tailwind-variants'

import { BottomSheet } from '../BottomSheet'
import { Button } from '../Button'

// 06:00 to 05:00 next day
const HOURS = Array.from({ length: 24 }, (_, i) => (i + 6) % 24)

type SlotState = 'default' | 'selected' | 'inRange' | 'unavailable'

const slotStyle = tv({
  base: 'h-10 flex-1 items-center justify-center border border-transparent',
  variants: {
    state: {
      default: 'bg-white active:bg-gray-50 rounded-lg',
      selected: 'bg-primary-300 z-10',
      inRange: 'bg-primary-25',
      unavailable: 'bg-gray-50 opacity-50 rounded-lg',
    },
    connectLeft: {
      true: 'rounded-l-none border-l-0 ml-[-1px]',
      false: 'rounded-l-lg',
    },
    connectRight: {
      true: 'rounded-r-none border-r-0 mr-[-1px]',
      false: 'rounded-r-lg',
    },
  },
  defaultVariants: {
    connectLeft: false,
    connectRight: false,
  },
})

const textStyle = tv({
  base: 'text-xs font-medium',
  variants: {
    state: {
      default: 'text-gray-900',
      selected: 'text-white',
      inRange: '',
      unavailable:
        'text-gray-600 line-through decoration-gray-700 decoration-2',
    },
  },
})

const shadowStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
}

interface TimeSlotsPickerContentProps {
  value: number[]
  onChange: (value: number[]) => void
  unavailableRanges?: { start: number; end: number }[]
}

const TimeSlotsPickerContent: React.FC<TimeSlotsPickerContentProps> = ({
  value,
  onChange,
  unavailableRanges = [],
}) => {
  const isUnavailable = useCallback(
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
    if (isUnavailable(hour)) return 'unavailable'
    if (!value.includes(hour)) return 'default'

    // If single selection, it's selected
    if (value.length === 1) return 'selected'

    // For ranges, first and last are 'selected', others 'inRange'
    // Note: value array assumption is it's ordered by selection logic (contiguous)
    // but the array might not be sorted if we just appended.
    // However, the logic in handlePress generates a strictly ordered range list.
    // Let's rely on value[0] and value[length-1] AFTER verifying sort order isn't guaranteed by type but by logic.
    // Actually, handlePress logic: `range.push(h)`. It pushes in order.
    // BUT for overnight `22, 23, 0, 1`, 22 is start, 1 is end.
    // simply checking index 0 and length-1 works if valid range.

    const isStart = value[0] === hour
    const isEnd = value[value.length - 1] === hour

    if (isStart || isEnd) return 'selected'

    return 'inRange'
  }

  const handlePress = (hour: number) => {
    if (isUnavailable(hour)) return

    // 1. First selection or resetting to new single
    if (value.length === 0 || value.length > 1) {
      onChange([hour])
      return
    }

    // 2. Second tap (Range selection)
    if (value.length === 1) {
      const start = value[0]
      if (hour === start) {
        return
      }

      // Calculate range
      const range: number[] = []
      let valid = true

      if (hour > start) {
        for (let h = start; h <= hour; h++) {
          if (isUnavailable(h)) {
            valid = false
            break
          }
          range.push(h)
        }
      } else {
        // Overnight
        for (let h = start; h < 24; h++) {
          if (isUnavailable(h)) {
            valid = false
            break
          }
          range.push(h)
        }
        if (valid) {
          for (let h = 0; h <= hour; h++) {
            if (isUnavailable(h)) {
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

  const isInRange = (hour: number) => value.includes(hour)

  const rows = useMemo(() => {
    const chunked = []
    for (let i = 0; i < HOURS.length; i += 6) {
      chunked.push(HOURS.slice(i, i + 6))
    }
    return chunked
  }, [])

  return (
    <View className="w-full gap-y-2">
      {rows.map((rowHours: number[], rowIndex: number) => (
        <View key={rowIndex} className="w-full flex-row">
          {rowHours.map((hour: number, colIndex: number) => {
            const state = getSlotState(hour)

            const isRange = isInRange(hour)
            const isFirstInRow = colIndex === 0
            const isLastInRow = colIndex === 5

            let connectLeft = false
            let connectRight = false

            if (isRange) {
              if (!isFirstInRow) {
                const prevHour = rowHours[colIndex - 1]
                if (isInRange(prevHour)) connectLeft = true
              }
              if (!isLastInRow) {
                const nextHour = rowHours[colIndex + 1]
                if (isInRange(nextHour)) connectRight = true
              }
            }

            const isSelected = state === 'selected'

            return (
              <View key={`wrapper-${hour}`} className="h-10 flex-1">
                <TouchableOpacity
                  onPress={() => handlePress(hour)}
                  disabled={state === 'unavailable'}
                  className={slotStyle({ state, connectLeft, connectRight })}
                  style={isSelected ? shadowStyle : undefined}>
                  <Text className={textStyle({ state })}>
                    {hour.toString().padStart(2, '0')}:00
                  </Text>
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
      ))}
    </View>
  )
}

export interface TimeSlotsPickerProps {
  value: number[]
  onChange: (value: number[]) => void
  unavailableRanges?: { start: number; end: number }[]
  label?: string
  placeholder?: string
  disabled?: boolean
}

export const TimeSlotsPicker: React.FC<TimeSlotsPickerProps> = ({
  value,
  onChange,
  unavailableRanges,
  label = 'Select Time',
  placeholder = 'Select hours',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempValue, setTempValue] = useState(value)

  const handleOpen = () => {
    if (disabled) return
    setTempValue(value)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleConfirm = () => {
    onChange(tempValue)
    setIsOpen(false)
  }

  const displayText = useMemo(() => {
    if (value.length === 0) return placeholder
    if (value.length === 1) return `${value[0].toString().padStart(2, '0')}:00`

    // Sort logic to find start/end correctly esp with overnight wrapping
    const start = value[0]
    const end = value[value.length - 1]
    return `${start.toString().padStart(2, '0')}:00 - ${end.toString().padStart(2, '0')}:00`
  }, [value, placeholder])

  return (
    <>
      <Button
        variant="outline"
        className={`justify-start border-gray-200 ${disabled ? 'bg-gray-100' : 'bg-white'}`}
        onPress={handleOpen}
        disabled={disabled}
        icon={Clock}
        iconClassName={disabled ? 'text-gray-400' : undefined}
        label={displayText}
        labelClassName={`font-normal ${disabled ? 'text-gray-400' : 'text-gray-900'}`}
      />

      <BottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        enableDynamicSizing
        footer={
          <View className="flex-row gap-2 px-4">
            <Button
              variant="secondary"
              label="Cancel"
              onPress={handleClose}
              className="flex-1"
            />
            <Button
              variant="primary"
              label="Confirm"
              onPress={handleConfirm}
              className="flex-1"
            />
          </View>
        }>
        <View className="pb-4">
          <Text className="mb-4 text-center text-lg font-semibold text-gray-900">
            {label}
          </Text>
          <TimeSlotsPickerContent
            value={tempValue}
            onChange={setTempValue}
            unavailableRanges={unavailableRanges}
          />
        </View>
      </BottomSheet>
    </>
  )
}
