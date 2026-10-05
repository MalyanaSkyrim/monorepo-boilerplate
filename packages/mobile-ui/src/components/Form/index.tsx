'use client'

import React from 'react'
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'

export interface FormProps<TFieldValues extends FieldValues> extends Omit<
  React.ComponentProps<'form'>,
  'onSubmit'
> {
  form: UseFormReturn<TFieldValues>
  onSubmit: SubmitHandler<TFieldValues>
  children: React.ReactNode
}

const Form = <TFieldValues extends FieldValues>({
  form,
  children,
  ...props
}: FormProps<TFieldValues>) => {
  return (
    <FormProvider {...form} {...props}>
      {children}
    </FormProvider>
  )
}

Form.displayName = 'Form'

export { Form }
