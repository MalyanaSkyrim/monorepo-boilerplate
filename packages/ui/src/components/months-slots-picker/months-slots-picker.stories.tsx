import type { Meta, StoryObj } from '@storybook/react'
import { format, addDays } from 'date-fns'
import * as React from 'react'

import { MonthsSlotsPicker } from './months-slots-picker'

const meta: Meta<typeof MonthsSlotsPicker> = {
  title: 'Components/MonthsSlotsPicker',
  component: MonthsSlotsPicker,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
  },
}

export default meta

type Story = StoryObj<typeof MonthsSlotsPicker>

const today = new Date()

export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState<string[]>([])
    return (
      <div className="w-[300px]">
        <MonthsSlotsPicker
          {...args}
          value={value}
          onChange={setValue}
          startDate={today}
        />
      </div>
    )
  },
  args: {
    label: 'Select Duration',
    placeholder: 'Select months',
    unavailableRanges: [],
  },
}

export const PreSelected: Story = {
  render: function Render(args) {
    // Select first and second slots
    const startIso1 = format(today, 'yyyy-MM-dd')
    const startIso2 = format(addDays(today, 30), 'yyyy-MM-dd')
    const [value, setValue] = React.useState<string[]>([startIso1, startIso2])

    return (
      <div className="w-[300px]">
        <MonthsSlotsPicker
          {...args}
          value={value}
          onChange={setValue}
          startDate={today}
        />
      </div>
    )
  },
  args: {
    label: 'Select Duration',
    placeholder: 'Select months',
    unavailableRanges: [],
  },
}

export const WithUnavailableRanges: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState<string[]>([])
    return (
      <div className="w-[300px]">
        <MonthsSlotsPicker
          {...args}
          value={value}
          onChange={setValue}
          startDate={today}
        />
      </div>
    )
  },
  args: {
    label: 'Select Duration',
    placeholder: 'Select months',
    unavailableRanges: [
      {
        start: format(addDays(today, 60), 'yyyy-MM-dd'), // 3rd slot disabled
        end: format(addDays(today, 90), 'yyyy-MM-dd'),
      },
    ],
  },
}
