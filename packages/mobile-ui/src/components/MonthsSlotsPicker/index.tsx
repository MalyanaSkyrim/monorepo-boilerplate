import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar } from 'lucide-react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { tv } from 'tailwind-variants'

import { BottomSheet } from '../BottomSheet'
import { Button } from '../Button'

// Each slot is 30 days
const SLOT_DURATION_DAYS = 30
const NUMBER_OF_SLOTS = 12

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
      inRange: 'text-primary-700',
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

interface MonthsSlotsPickerContentProps {
  value: string[] // Array of ISO date strings (start dates)
  onChange: (value: string[]) => void
  startDate: Date
  unavailableRanges?: { start: string; end: string }[]
}

const MonthsSlotsPickerContent: React.FC<MonthsSlotsPickerContentProps> = ({
  value,
  onChange,
  startDate,
  unavailableRanges = [],
}) => {
  const slots = useMemo(() => {
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

  const isUnavailable = useCallback(
    (slotStart: Date, slotEnd: Date) => {
      return unavailableRanges.some((range) => {
        const rangeStart = startOfDay(new Date(range.start))
        const rangeEnd = startOfDay(new Date(range.end))
        // Check overlap
        return (
          (isBefore(slotStart, rangeEnd) || isSameDay(slotStart, rangeEnd)) &&
          (isAfter(slotEnd, rangeStart) || isSameDay(slotEnd, rangeStart))
        )
      })
    },
    [unavailableRanges],
  )

  const getSlotState = (slotIso: string): SlotState => {
    const slot = slots.find((s) => s.startIso === slotIso)
    if (slot && isUnavailable(slot.start, slot.end)) return 'unavailable'

    if (!value.includes(slotIso)) return 'default'

    if (value.length === 1) return 'selected'

    // Assumes value is sorted by logic in handlePress
    const isStart = value[0] === slotIso
    const isEnd = value[value.length - 1] === slotIso

    if (isStart || isEnd) return 'selected'

    return 'inRange'
  }

  const handlePress = (slotIndex: number) => {
    const slot = slots[slotIndex]
    if (isUnavailable(slot.start, slot.end)) return

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
        // Tapped same slot twice
        return
      }

      // Range selection
      const minIndex = Math.min(startSlotIndex, slotIndex)
      const maxIndex = Math.max(startSlotIndex, slotIndex)

      const rangeIsos: string[] = []
      let valid = true

      for (let i = minIndex; i <= maxIndex; i++) {
        const s = slots[i]
        if (isUnavailable(s.start, s.end)) {
          valid = false
          break
        }
        rangeIsos.push(s.startIso)
      }

      if (valid) {
        onChange(rangeIsos)
      } else {
        onChange([slot.startIso])
      }
    }
  }

  const isInRange = (iso: string) => value.includes(iso)

  // 3 slots per row
  const rows = useMemo(() => {
    const chunked = []
    for (let i = 0; i < slots.length; i += 3) {
      chunked.push(slots.slice(i, i + 3))
    }
    return chunked
  }, [slots])

  return (
    <View className="w-full gap-y-2">
      {rows.map((rowSlots, rowIndex) => (
        <View key={rowIndex} className="w-full flex-row">
          {rowSlots.map((slot, colIndex) => {
            const state = getSlotState(slot.startIso)
            const isRange = isInRange(slot.startIso)
            const isFirstInRow = colIndex === 0
            const isLastInRow = colIndex === 2 // 3 items (0,1,2)

            let connectLeft = false
            let connectRight = false

            if (isRange) {
              if (!isFirstInRow) {
                const prevSlot = rowSlots[colIndex - 1]
                if (isInRange(prevSlot.startIso)) connectLeft = true
              }
              if (!isLastInRow && colIndex + 1 < rowSlots.length) {
                const nextSlot = rowSlots[colIndex + 1]
                if (isInRange(nextSlot.startIso)) connectRight = true
              }
            }

            const isSelected = state === 'selected'

            return (
              <View key={`wrapper-${slot.id}`} className="h-10 flex-1">
                <TouchableOpacity
                  onPress={() => handlePress(slot.id)}
                  disabled={state === 'unavailable'}
                  className={slotStyle({ state, connectLeft, connectRight })}
                  style={isSelected ? shadowStyle : undefined}>
                  <Text className={textStyle({ state })}>{slot.label}</Text>
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
      ))}
    </View>
  )
}

export interface MonthsSlotsPickerProps {
  value: string[]
  onChange: (value: string[]) => void
  startDate?: Date
  unavailableRanges?: { start: string; end: string }[]
  label?: string
  placeholder?: string
  disabled?: boolean
}

export const MonthsSlotsPicker: React.FC<MonthsSlotsPickerProps> = ({
  value,
  onChange,
  startDate = new Date(),
  unavailableRanges,
  label = 'Select Duration',
  placeholder = 'Select months',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempValue, setTempValue] = useState(value)

  const handleOpen = () => {
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
    if (value.length === 1) {
      return format(new Date(value[0]), 'd MMMM', { locale: fr })
    }
    const start = format(new Date(value[0]), 'd MMMM', { locale: fr })
    const end = format(
      addDays(new Date(value[value.length - 1]), SLOT_DURATION_DAYS - 1),
      'd MMMM',
      { locale: fr },
    )
    return `${start} - ${end}`
  }, [value, placeholder])

  return (
    <>
      <Button
        variant="outline"
        className={`justify-start border-gray-200 ${disabled ? 'bg-gray-100' : 'bg-white'}`}
        onPress={handleOpen}
        disabled={disabled}
        icon={Calendar}
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
          <MonthsSlotsPickerContent
            value={tempValue}
            onChange={setTempValue}
            startDate={startDate}
            unavailableRanges={unavailableRanges}
          />
        </View>
      </BottomSheet>
    </>
  )
}
