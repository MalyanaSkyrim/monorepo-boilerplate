import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

import { MultiSelect, type MultiSelectOption } from '.'

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  argTypes: {
    isDisabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof MultiSelect>

const options: MultiSelectOption[] = [
  { label: 'UX Research', value: 'ux' },
  { label: 'Web Development', value: 'web' },
  { label: 'Cross Platform Development Process', value: 'cross-platform' },
  { label: 'UI Designing', value: 'ui' },
  { label: 'Backend Development', value: 'backend' },
]

export const Default: Story = {
  render: (args) => {
    const [values, setValues] = useState<MultiSelectOption[]>([
      options[0],
      options[1],
    ])
    return (
      <MultiSelect
        {...args}
        options={options}
        value={values.map((v) => v.value)}
        onChange={setValues}
        placeholder="Select options"
      />
    )
  },
  args: {
    isDisabled: false,
  },
}

export const Disabled: Story = {
  render: (args) => {
    return (
      <MultiSelect
        {...args}
        options={options}
        value={[options[0].value]}
        onChange={() => {}}
        placeholder="Select options"
      />
    )
  },
  args: {
    isDisabled: true,
  },
}
