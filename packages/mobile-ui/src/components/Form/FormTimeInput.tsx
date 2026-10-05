'use client'

import React from 'react'
import { FieldPath, FieldValues } from 'react-hook-form'
import { View } from 'react-native'

import { TimeInput } from '../TimeInput'
import { FormField, FormFieldProps } from './FormField'

export interface FormTimeInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldProps<TFieldValues, TName>, 'children'> {
  label?: string
}

const FormTimeInput = <
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
}: FormTimeInputProps<TFieldValues, TName>) => {
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
          <TimeInput
            label={label}
            value={field.value instanceof Date ? field.value : new Date()}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
            error={fieldState.error?.message}
          />
        </View>
      )}
    </FormField>
  )
}

FormTimeInput.displayName = 'FormTimeInput'

export { FormTimeInput }
