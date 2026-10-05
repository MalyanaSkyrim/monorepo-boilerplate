import type { Meta, StoryObj } from '@storybook/react'
import { Eye, Zap } from 'lucide-react-native'
import React from 'react'

import { Input } from '.'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    keyboardType: {
      control: 'select',
      options: ['normal', 'phone'],
    },
    size: {
      control: 'select',
      options: ['sm', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  render: (args) => (
    <Input
      {...args}
      placeholder="Placeholder"
      hint="This is a hint text to help user"
    />
  ),
  args: {
    size: 'lg',
  },
}

export const WithIcons: Story = {
  render: () => (
    <Input
      size="lg"
      leftIcon={Zap}
      rightIcon={Eye}
      placeholder="Placeholder"
      hint="This is a hint text to help user"
    />
  ),
}

export const Filled: Story = {
  render: () => (
    <Input
      size="lg"
      placeholder="Placeholder"
      defaultValue="Some value"
      hint="This is a hint text to help user"
    />
  ),
}

export const Error: Story = {
  render: () => (
    <Input
      size="lg"
      placeholder="Placeholder"
      error="This is an error message"
    />
  ),
}

export const Disabled: Story = {
  render: () => (
    <Input
      size="lg"
      disabled
      placeholder="Placeholder"
      defaultValue="Disabled value"
      hint="This is a hint text to help user"
    />
  ),
}

export const Sizes: Story = {
  render: () => (
    <>
      <Input
        size="sm"
        placeholder="Placeholder"
        hint="This is a hint text"
        style={{ marginBottom: 16 }}
      />
      <Input
        size="lg"
        placeholder="Placeholder"
        hint="This is a hint text"
        style={{ marginBottom: 16 }}
      />
    </>
  ),
}

export const AllStates: Story = {
  render: () => (
    <>
      <Input
        size="lg"
        placeholder="Placeholder"
        hint="Default state - tap to focus"
        style={{ marginBottom: 16 }}
      />
      <Input
        size="lg"
        placeholder="Placeholder"
        defaultValue="Value"
        hint="Filled state with value"
        style={{ marginBottom: 16 }}
      />
      <Input
        size="lg"
        placeholder="Placeholder"
        error="This is an error message"
        style={{ marginBottom: 16 }}
      />
      <Input
        size="lg"
        disabled
        placeholder="Placeholder"
        defaultValue="Value"
        hint="Disabled state"
        style={{ marginBottom: 16 }}
      />
    </>
  ),
}

export const PhoneNumber: Story = {
  render: () => (
    <Input
      size="lg"
      placeholder="+1 (555) 000-0000"
      hint="Enter your phone number"
      keyboardType="phone-pad"
    />
  ),
}
