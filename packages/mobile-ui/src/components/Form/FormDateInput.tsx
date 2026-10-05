'use client'

import React from 'react'
import { FieldPath, FieldValues } from 'react-hook-form'
import { View } from 'react-native'

import { DateInput } from '../DateInput'
import { FormField, FormFieldProps } from './FormField'

export interface FormDateInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldProps<TFieldValues, TName>, 'children'> {
  label?: string
  minimumDate?: Date
  maximumDate?: Date
}

const FormDateInput = <
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
  minimumDate,
  maximumDate,
}: FormDateInputProps<TFieldValues, TName>) => {
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
          <DateInput
            label={label}
            value={field.value instanceof Date ? field.value : new Date()}
            onChange={field.onChange}
            onBlur={field.onBlur}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            disabled={disabled}
            error={fieldState.error?.message}
          />
        </View>
      )}
    </FormField>
  )
}

FormDateInput.displayName = 'FormDateInput'

export { FormDateInput }
