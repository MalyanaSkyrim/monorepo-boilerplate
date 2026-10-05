import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { View } from 'react-native'

import { Toggle } from '.'

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Toggle>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(false)
    return <Toggle {...args} value={value} onValueChange={setValue} />
  },
  args: {
    size: 'md',
  },
}

export const Active: Story = {
  render: (args) => {
    const [value, setValue] = useState(true)
    return <Toggle {...args} value={value} onValueChange={setValue} />
  },
  args: {
    size: 'md',
  },
}

export const Small: Story = {
  render: (args) => {
    const [value, setValue] = useState(false)
    return <Toggle {...args} value={value} onValueChange={setValue} size="sm" />
  },
}

export const Disabled: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Toggle disabled value={false} onValueChange={() => {}} />
      <Toggle disabled value={true} onValueChange={() => {}} />
    </View>
  ),
}

export const AllStates: Story = {
  render: () => {
    const [value1, setValue1] = useState(false)
    const [value2, setValue2] = useState(true)
    const [value3, setValue3] = useState(false)
    const [value4, setValue4] = useState(true)

    return (
      <View style={{ gap: 24 }}>
        <View style={{ gap: 8 }}>
          <Toggle
            value={value1}
            onValueChange={setValue1}
            size="md"
            style={{ marginBottom: 8 }}
          />
          <Toggle
            value={value2}
            onValueChange={setValue2}
            size="md"
            style={{ marginBottom: 8 }}
          />
          <Toggle
            value={value3}
            onValueChange={setValue3}
            size="sm"
            style={{ marginBottom: 8 }}
          />
          <Toggle
            value={value4}
            onValueChange={setValue4}
            size="sm"
            style={{ marginBottom: 8 }}
          />
        </View>
        <View style={{ gap: 8 }}>
          <Toggle disabled value={false} onValueChange={() => {}} size="md" />
          <Toggle disabled value={true} onValueChange={() => {}} size="md" />
          <Toggle disabled value={false} onValueChange={() => {}} size="sm" />
          <Toggle disabled value={true} onValueChange={() => {}} size="sm" />
        </View>
      </View>
    )
  },
}
