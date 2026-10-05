import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

import { Select, type SelectOption } from '.'

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
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
type Story = StoryObj<typeof Select>

const options: SelectOption[] = [
  { label: 'UX Research', value: 'ux' },
  { label: 'Web Development', value: 'web' },
  { label: 'Cross Platform Development Process', value: 'cross-platform' },
  { label: 'UI Designing', value: 'ui' },
  { label: 'Backend Development', value: 'backend' },
]

export const Default: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<SelectOption>(options[0])
    return (
      <Select
        {...args}
        options={options}
        value={selected.value}
        onChange={setSelected}
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
    return <Select {...args} options={options} isDisabled={true} />
  },
  args: {
    isDisabled: true,
  },
}
