import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'

import { DatePicker } from './date-picker'

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'radio',
      options: ['single', 'range'],
    },
    disabled: {
      control: 'boolean',
    },
    clearable: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
    minDate: {
      control: 'date',
    },
    maxDate: {
      control: 'date',
    },
  },
}

export default meta

type Story = StoryObj<typeof DatePicker>

export const Single: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState<Date | null>(null)
    return (
      <div className="w-[300px]">
        <DatePicker
          {...args}
          mode="single"
          value={value}
          onChange={(val) => setValue(val)}
        />
      </div>
    )
  },
  args: {
    mode: 'single',
    placeholder: 'Select date',
    clearable: true,
  },
}

export const Range: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState<[Date | null, Date | null]>([
      null,
      null,
    ])
    return (
      <div className="w-[300px]">
        <DatePicker
          {...args}
          mode="range"
          value={value}
          onChange={(val) => setValue(val)}
        />
      </div>
    )
  },
  args: {
    mode: 'range',
    placeholder: 'Select date range',
    clearable: true,
  },
}

export const Disabled: Story = {
  args: {
    mode: 'single',
    disabled: true,
    value: new Date(),
    onChange: () => {},
  },
}

export const WithMinMaxDate: Story = {
  args: {
    mode: 'single',
    minDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    maxDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    value: new Date(),
    onChange: () => {},
  },
}
