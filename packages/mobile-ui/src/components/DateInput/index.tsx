'use client'

import { format, parse } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { Platform, Pressable, Text, TextInput, View } from 'react-native'

import { Label } from '../Label'

/** Lazy-loaded to avoid loading native module until picker is shown. Returns null if module unavailable. */
function getDateTimePicker(): React.ComponentType<{
  value: Date
  mode: 'date' | 'time'
  display?: 'default' | 'spinner' | 'calendar' | 'clock'
  onChange: (event: unknown, date?: Date) => void
  minimumDate?: Date
  maximumDate?: Date
  onTouchCancel?: () => void
}> | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-community/datetimepicker')
    const Picker = mod?.default ?? mod
    return Picker ?? null
  } catch {
    return null
  }
}

interface DateInputProps {
  label?: string
  value: Date
  onChange: (date: Date) => void
  onBlur?: () => void
  minimumDate?: Date
  maximumDate?: Date
  disabled?: boolean
  error?: string
  className?: string
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  minimumDate,
  maximumDate,
  disabled = false,
  error,
  className,
}) => {
  const [showPicker, setShowPicker] = useState(false)

  const handleChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
      onBlur?.()
    }
    if (selectedDate) {
      onChange(selectedDate)
    }
  }

  const handleClose = () => {
    setShowPicker(false)
    onBlur?.()
  }

  const displayValue = format(value, 'MMM d, yyyy')
  const dateFormat = 'MMM d, yyyy' as const
  const DateTimePicker = getDateTimePicker()

  const [fallbackText, setFallbackText] = useState(displayValue)
  useEffect(() => {
    setFallbackText(displayValue)
  }, [displayValue])
  const handleFallbackBlur = () => {
    try {
      const parsed = parse(fallbackText, dateFormat, value)
      if (!Number.isNaN(parsed.getTime())) {
        onChange(parsed)
      } else {
        setFallbackText(displayValue)
      }
    } catch {
      setFallbackText(displayValue)
    }
    onBlur?.()
  }

  if (DateTimePicker === null) {
    return (
      <View className={className}>
        {label && <Label disabled={disabled}>{label}</Label>}
        <TextInput
          value={fallbackText}
          onChangeText={setFallbackText}
          onBlur={handleFallbackBlur}
          editable={!disabled}
          placeholder="e.g. Jan 15, 2025"
          placeholderTextColor="#9ca3af"
          className={`mt-2 h-12 rounded-[10px] border px-3 text-base ${
            error ? 'border-error-100' : 'border-greyscale-100'
          } ${disabled ? 'bg-greyscale-25 text-greyscale-300' : 'text-greyscale-900 bg-white'}`}
        />
        {error && <Text className="text-error-100 mt-2 text-sm">{error}</Text>}
      </View>
    )
  }

  return (
    <View className={className}>
      {label && <Label disabled={disabled}>{label}</Label>}
      <Pressable
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        className={`mt-2 h-12 flex-row items-center justify-between rounded-[10px] border px-3 ${
          error ? 'border-error-100' : 'border-greyscale-100'
        } ${disabled ? 'bg-greyscale-25' : 'bg-white'}`}>
        <Text
          className={`text-base ${disabled ? 'text-greyscale-300' : 'text-greyscale-900'}`}>
          {displayValue}
        </Text>
      </Pressable>
      {error && <Text className="text-error-100 mt-2 text-sm">{error}</Text>}
      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onTouchCancel={() => Platform.OS === 'ios' && handleClose()}
        />
      )}
      {showPicker && Platform.OS === 'ios' && (
        <Pressable onPress={handleClose} className="mt-2 self-end">
          <Text className="text-primary-300 text-base font-semibold">Done</Text>
        </Pressable>
      )}
    </View>
  )
}
