import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import { BarChart, LineChart, type ChartConfig } from '.'

const meta: Meta<typeof BarChart> = {
  title: 'Components/Chart',
  component: BarChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    height: { control: 'number' },
  },
}

export default meta

const barData = [
  { month: 'Jan', bookings: 120 },
  { month: 'Feb', bookings: 98 },
  { month: 'Mar', bookings: 145 },
  { month: 'Apr', bookings: 132 },
  { month: 'May', bookings: 178 },
  { month: 'Jun', bookings: 165 },
]

const lineData = [
  { week: 'W1', revenue: 2400 },
  { week: 'W2', revenue: 1398 },
  { week: 'W3', revenue: 3800 },
  { week: 'W4', revenue: 2908 },
  { week: 'W5', revenue: 4200 },
]

const barConfig: ChartConfig = {
  bookings: { label: 'Bookings', color: 'hsl(var(--primary))' },
}

const lineConfig: ChartConfig = {
  revenue: { label: 'Revenue ($)', color: 'hsl(var(--primary))' },
}

type BarChartStory = StoryObj<typeof BarChart>
type LineChartStory = StoryObj<typeof LineChart>

export const BarChartDefault: BarChartStory = {
  args: {
    data: barData,
    dataKey: 'bookings',
    xAxisKey: 'month',
    height: 300,
  },
  render: (args) => (
    <div className="w-[400px]">
      <BarChart {...args} />
    </div>
  ),
}

export const BarChartWithConfig: BarChartStory = {
  args: {
    data: barData,
    dataKey: 'bookings',
    xAxisKey: 'month',
    config: barConfig,
    height: 300,
  },
  render: (args) => (
    <div className="w-[400px]">
      <BarChart {...args} />
    </div>
  ),
}

export const BarChartCustomHeight: BarChartStory = {
  args: {
    data: barData,
    dataKey: 'bookings',
    xAxisKey: 'month',
    height: 200,
  },
  render: (args) => (
    <div className="w-[400px]">
      <BarChart {...args} />
    </div>
  ),
}

export const LineChartDefault: LineChartStory = {
  args: {
    data: lineData,
    dataKey: 'revenue',
    xAxisKey: 'week',
    height: 300,
  },
  render: (args) => (
    <div className="w-[400px]">
      <LineChart {...args} />
    </div>
  ),
}

export const LineChartWithConfig: LineChartStory = {
  args: {
    data: lineData,
    dataKey: 'revenue',
    xAxisKey: 'week',
    config: lineConfig,
    height: 300,
  },
  render: (args) => (
    <div className="w-[400px]">
      <LineChart {...args} />
    </div>
  ),
}

export const LineChartCustomHeight: LineChartStory = {
  args: {
    data: lineData,
    dataKey: 'revenue',
    xAxisKey: 'week',
    height: 200,
  },
  render: (args) => (
    <div className="w-[400px]">
      <LineChart {...args} />
    </div>
  ),
}
