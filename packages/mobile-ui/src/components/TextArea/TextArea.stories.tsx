import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { View } from 'react-native'

import { TextArea } from '.'
import { Label } from '../Label'

const meta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    isError: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof TextArea>

export const Default: Story = {
  render: (args) => (
    <>
      <Label style={{ marginBottom: 8 }}>Label</Label>
      <TextArea {...args} placeholder="Placeholder" />
    </>
  ),
  args: {
    disabled: false,
    isError: false,
  },
}

export const WithHint: Story = {
  render: () => (
    <>
      <Label style={{ marginBottom: 8 }}>Label</Label>
      <TextArea
        placeholder="Placeholder"
        hint="This is a hint text to help user"
      />
    </>
  ),
}

export const Filled: Story = {
  render: () => (
    <>
      <Label style={{ marginBottom: 8 }}>Label</Label>
      <TextArea
        placeholder="Placeholder"
        defaultValue="Keep up with our newsletters for the latest updates"
        hint="This is a hint text to help user"
      />
    </>
  ),
}

export const WithMaxLength: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <>
        <Label style={{ marginBottom: 8 }}>Label</Label>
        <TextArea
          value={value}
          onChangeText={setValue}
          placeholder="Placeholder"
          maxLength={200}
          hint="This is a hint text to help user"
        />
      </>
    )
  },
}

export const Error: Story = {
  render: () => (
    <>
      <Label style={{ marginBottom: 8 }}>Label</Label>
      <TextArea
        placeholder="Placeholder"
        defaultValue="Keep up with our newsletters for the latest updates"
        isError
        error="This is an error message"
      />
    </>
  ),
}

export const Disabled: Story = {
  render: () => (
    <>
      <Label style={{ marginBottom: 8 }}>Label</Label>
      <TextArea
        placeholder="Placeholder"
        defaultValue="Disabled value"
        disabled
        hint="This is a hint text to help user"
      />
    </>
  ),
}

export const AllStates: Story = {
  render: () => (
    <>
      <Label style={{ marginBottom: 8 }}>Default</Label>
      <View style={{ marginBottom: 24 }}>
        <TextArea
          placeholder="Placeholder"
          hint="Default state - tap to focus"
        />
      </View>
      <Label style={{ marginBottom: 8 }}>Filled</Label>
      <View style={{ marginBottom: 24 }}>
        <TextArea
          placeholder="Placeholder"
          defaultValue="Value"
          hint="Filled state with value"
        />
      </View>
      <Label style={{ marginBottom: 8 }}>Error</Label>
      <View style={{ marginBottom: 24 }}>
        <TextArea
          placeholder="Placeholder"
          isError
          error="This is an error message"
        />
      </View>
      <Label style={{ marginBottom: 8 }}>Disabled</Label>
      <TextArea
        placeholder="Placeholder"
        defaultValue="Value"
        disabled
        hint="Disabled state"
      />
    </>
  ),
}
