'use client'

import React from 'react'
import { FieldPath, FieldValues } from 'react-hook-form'

import { OtpInput } from '../OtpInput'
import { FormField, FormFieldProps } from './FormField'

export type FormOtpInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Pick<FormFieldProps<TFieldValues, TName>, 'name' | 'control'>

const FormOtpInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
}: FormOtpInputProps<TFieldValues, TName>) => {
  return (
    <FormField name={name} control={control}>
      {({ field, fieldState }) => (
        <OtpInput
          value={typeof field.value === 'string' ? field.value : ''}
          onChangeText={field.onChange}
          error={fieldState.error?.message}
          isError={fieldState.invalid}
        />
      )}
    </FormField>
  )
}

FormOtpInput.displayName = 'FormOtpInput'

export { FormOtpInput }
