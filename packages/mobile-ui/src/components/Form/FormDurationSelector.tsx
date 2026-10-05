'use client'

import React from 'react'
import { FieldPath, FieldValues } from 'react-hook-form'
import { View } from 'react-native'

import { DurationSelector } from '../DurationSelector'
import { FormField, FormFieldProps } from './FormField'

export interface FormDurationSelectorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldProps<TFieldValues, TName>, 'children'> {
  label?: string
  min: number
  max: number
  unit: 'hours' | 'months'
}

const FormDurationSelector = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  defaultValue,
  disabled,
  rules,
  shouldUnregister,
  label,
  min,
  max,
  unit,
}: FormDurationSelectorProps<TFieldValues, TName>) => {
  return (
    <FormField
      name={name}
      control={control}
      defaultValue={defaultValue}
      disabled={disabled}
      rules={rules}
      shouldUnregister={shouldUnregister}>
      {({ field, fieldState }) => (
        <View className="gap-2">
          <DurationSelector
            label={label}
            value={typeof field.value === 'number' ? field.value : min}
            onChange={field.onChange}
            min={min}
            max={max}
            unit={unit}
            disabled={disabled}
            error={fieldState.error?.message}
          />
        </View>
      )}
    </FormField>
  )
}

FormDurationSelector.displayName = 'FormDurationSelector'

export { FormDurationSelector }
