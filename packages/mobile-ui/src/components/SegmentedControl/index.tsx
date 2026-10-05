'use client'

import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export interface SegmentedControlOption<T extends string = string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  className?: string
}

const selectedShadow = StyleSheet.create({
  wrap: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
}).wrap

export const SegmentedControl = <T extends string = string>({
  options,
  value,
  onChange,
  disabled = false,
  className,
}: SegmentedControlProps<T>) => {
  return (
    <View
      className={`border-greyscale-100 bg-greyscale-50 flex-row rounded-lg border p-1 ${className ?? ''}`}>
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => !disabled && onChange(option.value)}
            disabled={disabled}
            activeOpacity={0.7}
            style={isSelected ? selectedShadow : undefined}
            className={`flex-1 items-center justify-center rounded-md py-2.5 ${
              isSelected ? 'bg-white' : ''
            } ${disabled ? 'opacity-50' : ''}`}>
            <Text
              className={`text-sm font-semibold ${
                isSelected ? 'text-primary-600' : 'text-greyscale-600'
              }`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
