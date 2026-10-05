import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

import { CircularTimePicker } from './index'

const meta: Meta<typeof CircularTimePicker> = {
  component: CircularTimePicker,
  title: 'Components/CircularTimePicker',
  argTypes: {
    onChange: { action: 'changed' },
    disabled: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof CircularTimePicker>

const BasicUsage = (args: React.ComponentProps<typeof CircularTimePicker>) => {
  const [value, setValue] = useState(args.value || { start: 9, end: 17 })
  return <CircularTimePicker {...args} value={value} onChange={setValue} />
}

export const Default: Story = {
  render: BasicUsage,
  args: {
    value: { start: 9, end: 17 },
  },
}

export const WithUnavailableRanges: Story = {
  render: BasicUsage,
  args: {
    value: { start: 10, end: 12 },
    unavailableRanges: [
      { start: 0, end: 6 },
      { start: 18, end: 24 },
    ],
  },
}

export const Overnight: Story = {
  render: BasicUsage,
  args: {
    value: { start: 22, end: 2 },
  },
}
export const Disabled: Story = {
  render: BasicUsage,
  args: {
    value: { start: 9, end: 17 },
    disabled: true,
  },
}

export const ComplexUnavailableRanges: Story = {
  render: BasicUsage,
  args: {
    value: { start: 10, end: 12 },
    unavailableRanges: [
      { start: 2, end: 4 },
      { start: 14, end: 16 },
      { start: 20, end: 23 },
    ],
  },
}
