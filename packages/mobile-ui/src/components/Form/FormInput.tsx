'use client'

import React from 'react'
import { FieldPath, FieldValues } from 'react-hook-form'
import { View } from 'react-native'

import { Input } from '../Input'
import { Label } from '../Label'
import { FormField, FormFieldProps } from './FormField'

export interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
  extends
    Omit<FormFieldProps<TFieldValues, TName>, 'children'>,
    Omit<
      React.ComponentProps<typeof Input>,
      'value' | 'onChangeText' | 'error' | 'isError' | 'defaultValue'
    > {
  /** Optional label text to display above the input */
  label?: string
}

const FormInput = <
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
  ...inputProps
}: FormInputProps<TFieldValues, TName>) => {
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
          {label && <Label disabled={disabled}>{label}</Label>}
          <Input
            {...inputProps}
            value={field.value as string}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            isError={fieldState.invalid}
            disabled={disabled}
          />
        </View>
      )}
    </FormField>
  )
}

FormInput.displayName = 'FormInput'

export { FormInput }
