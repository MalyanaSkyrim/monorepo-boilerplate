import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

import { DurationSelector } from '.'

const meta: Meta<typeof DurationSelector> = {
  title: 'Components/DurationSelector',
  component: DurationSelector,
}

export default meta
type Story = StoryObj<typeof DurationSelector>

const DurationSelectorWithState = (props: {
  min: number
  max: number
  unit: 'hours' | 'months'
}) => {
  const [value, setValue] = useState(props.min)
  return (
    <DurationSelector
      {...props}
      value={value}
      onChange={setValue}
      label="Duration"
    />
  )
}

export const Hours: Story = {
  render: () => <DurationSelectorWithState min={1} max={12} unit="hours" />,
}

export const Months: Story = {
  render: () => <DurationSelectorWithState min={1} max={12} unit="months" />,
}
