'use client'

import React from 'react'
import { Pressable, Text, View } from 'react-native'

import { Label } from '../Label'

interface DurationSelectorProps {
  label?: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  unit: 'hours' | 'months'
  disabled?: boolean
  error?: string
  className?: string
}

const unitLabel = (value: number, unit: 'hours' | 'months') => {
  if (unit === 'hours') {
    return value === 1 ? 'hour' : 'hours'
  }
  return value === 1 ? 'month' : 'months'
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  disabled = false,
  error,
  className,
}) => {
  const canDecrement = value > min && !disabled
  const canIncrement = value < max && !disabled

  return (
    <View className={className}>
      {label && <Label disabled={disabled}>{label}</Label>}
      <View
        className={`mt-2 flex-row items-center justify-between rounded-[10px] border px-3 ${
          error ? 'border-error-100' : 'border-greyscale-100'
        } ${disabled ? 'bg-greyscale-25' : 'bg-white'}`}>
        <Pressable
          onPress={() => canDecrement && onChange(value - 1)}
          disabled={!canDecrement}
          className="h-12 w-12 items-center justify-center">
          <Text
            className={`text-xl font-semibold ${
              canDecrement ? 'text-greyscale-900' : 'text-greyscale-300'
            }`}>
            −
          </Text>
        </Pressable>
        <Text
          className={`text-base font-medium ${
            disabled ? 'text-greyscale-300' : 'text-greyscale-900'
          }`}>
          {value} {unitLabel(value, unit)}
        </Text>
        <Pressable
          onPress={() => canIncrement && onChange(value + 1)}
          disabled={!canIncrement}
          className="h-12 w-12 items-center justify-center">
          <Text
            className={`text-xl font-semibold ${
              canIncrement ? 'text-greyscale-900' : 'text-greyscale-300'
            }`}>
            +
          </Text>
        </Pressable>
      </View>
      {error && <Text className="text-error-100 mt-2 text-sm">{error}</Text>}
    </View>
  )
}
