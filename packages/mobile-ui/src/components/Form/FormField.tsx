'use client'

import React from 'react'
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form'

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, 'render'> {
  children: (props: {
    field: {
      value: unknown
      onChange: (...event: unknown[]) => void
      onBlur: () => void
      name: string
    }
    fieldState: {
      invalid: boolean
      error?: {
        message?: string
      }
    }
  }) => React.ReactElement
}

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  children,
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  return (
    <Controller
      {...props}
      render={({ field, fieldState }) => {
        return children({
          field,
          fieldState,
        })
      }}
    />
  )
}

FormField.displayName = 'FormField'

export { FormField }
