import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { View } from 'react-native'

import { TimeSlotsPicker } from '.'

const meta: Meta<typeof TimeSlotsPicker> = {
  component: TimeSlotsPicker,
  title: 'Components/TimeSlotsPicker',
  decorators: [
    (Story) => (
      <View className="flex-1 bg-gray-50 p-4">
        <Story />
      </View>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof TimeSlotsPicker>

const BasicUsage = (args: React.ComponentProps<typeof TimeSlotsPicker>) => {
  const [value, setValue] = useState<number[]>(args.value || [])
  return <TimeSlotsPicker {...args} value={value} onChange={setValue} />
}

export const Default: Story = {
  render: BasicUsage,
  args: {
    value: [],
    label: 'Start Time',
  },
}

export const SingleSelection: Story = {
  render: BasicUsage,
  args: {
    value: [10],
    label: 'Single Slot',
  },
}

export const RangeSelection: Story = {
  render: BasicUsage,
  args: {
    value: [10, 11, 12, 13, 14],
    label: 'Range Slot',
  },
}

export const OvernightRange: Story = {
  render: BasicUsage,
  args: {
    value: [22, 23, 0, 1, 2],
    label: 'Overnight',
  },
}

export const WithUnavailable: Story = {
  render: BasicUsage,
  args: {
    value: [],
    unavailableRanges: [
      { start: 8, end: 10 },
      { start: 13, end: 14 },
      { start: 22, end: 6 },
    ],
  },
}
