import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'

import { TimeSlotsPicker } from './time-slots-picker'

const meta: Meta<typeof TimeSlotsPicker> = {
  title: 'Components/TimeSlotsPicker',
  component: TimeSlotsPicker,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
  },
}

export default meta

type Story = StoryObj<typeof TimeSlotsPicker>

export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState<number[]>([])
    return (
      <div className="w-[300px]">
        <TimeSlotsPicker {...args} value={value} onChange={setValue} />
      </div>
    )
  },
  args: {
    label: 'Select Time',
    placeholder: 'Select hours',
    unavailableRanges: [],
  },
}

export const PreSelected: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState<number[]>([10, 11, 12, 13])
    return (
      <div className="w-[300px]">
        <TimeSlotsPicker {...args} value={value} onChange={setValue} />
      </div>
    )
  },
  args: {
    label: 'Select Time',
    placeholder: 'Select hours',
    unavailableRanges: [],
  },
}

export const WithUnavailableRanges: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState<number[]>([])
    return (
      <div className="w-[300px]">
        <TimeSlotsPicker {...args} value={value} onChange={setValue} />
      </div>
    )
  },
  args: {
    label: 'Select Time',
    placeholder: 'Select hours',
    unavailableRanges: [
      { start: 14, end: 17 },
      { start: 2, end: 4 },
    ],
  },
}
