import type { Meta, StoryObj } from '@storybook/react'
import { addDays, format } from 'date-fns'
import React, { useState } from 'react'
import { View } from 'react-native'

import { MonthsSlotsPicker } from '.'

const meta: Meta<typeof MonthsSlotsPicker> = {
  component: MonthsSlotsPicker,
  title: 'Components/MonthsSlotsPicker',
  decorators: [
    (Story) => (
      <View className="flex-1 bg-gray-50 p-4">
        <Story />
      </View>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof MonthsSlotsPicker>

const BasicUsage = (args: React.ComponentProps<typeof MonthsSlotsPicker>) => {
  const [value, setValue] = useState<string[]>(args.value || [])
  return <MonthsSlotsPicker {...args} value={value} onChange={setValue} />
}

const today = new Date()

export const Default: Story = {
  render: BasicUsage,
  args: {
    value: [],
    label: 'Start Date',
  },
}

export const SingleSelection: Story = {
  render: BasicUsage,
  args: {
    value: [format(today, 'yyyy-MM-dd')],
    label: 'Single Month',
  },
}

export const RangeSelection: Story = {
  render: BasicUsage,
  args: {
    value: [
      format(today, 'yyyy-MM-dd'),
      format(addDays(today, 30), 'yyyy-MM-dd'),
      format(addDays(today, 60), 'yyyy-MM-dd'),
    ],
    label: 'Range Months',
  },
}

export const WithUnavailable: Story = {
  render: BasicUsage,
  args: {
    value: [],
    unavailableRanges: [
      {
        start: format(addDays(today, 32), 'yyyy-MM-dd'), // In the middle of 2nd slot
        end: format(addDays(today, 35), 'yyyy-MM-dd'),
      },
    ],
  },
}
