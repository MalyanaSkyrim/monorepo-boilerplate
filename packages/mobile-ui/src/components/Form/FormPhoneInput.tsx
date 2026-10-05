'use client'

import React from 'react'
import { FieldPath, FieldValues } from 'react-hook-form'
import { View } from 'react-native'

import { Label } from '../Label'
import { PhoneInput, type PhoneInputProps } from '../PhoneInput'
import { FormField, type FormFieldProps } from './FormField'

export interface FormPhoneInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
  extends
    Omit<FormFieldProps<TFieldValues, TName>, 'children'>,
    Omit<
      PhoneInputProps,
      'value' | 'onChange' | 'onBlur' | 'error' | 'isError' | 'defaultValue'
    > {
  /** Optional label text to display above the input */
  label?: string
}

const FormPhoneInput = <
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
  ...phoneInputProps
}: FormPhoneInputProps<TFieldValues, TName>) => {
  return (
    <FormField
      name={name}
      control={control}
      defaultValue={defaultValue}
      disabled={disabled}
      rules={rules}
      shouldUnregister={shouldUnregister}>
      {({ field, fieldState }) => {
        const value: string = typeof field.value === 'string' ? field.value : ''
        return (
          <View className="gap-2">
            {label && <Label disabled={disabled}>{label}</Label>}
            <PhoneInput
              {...phoneInputProps}
              value={value}
              onChange={(e164: string) => field.onChange(e164)}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              isError={fieldState.invalid}
              disabled={disabled}
            />
          </View>
        )
      }}
    </FormField>
  )
}

FormPhoneInput.displayName = 'FormPhoneInput'

export { FormPhoneInput }
