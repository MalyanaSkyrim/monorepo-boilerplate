import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { View } from 'react-native'

import { PhoneInput } from '.'

const meta: Meta<typeof PhoneInput> = {
  title: 'Components/PhoneInput',
  component: PhoneInput,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'lg'],
    },
    defaultCountry: {
      control: 'select',
      options: ['US', 'GB', 'DE', 'FR'],
    },
  },
}

export default meta
type Story = StoryObj<typeof PhoneInput>

export const Default: Story = {
  render: (args) => (
    <PhoneInput
      {...args}
      placeholder="Phone number"
      hint="Enter your phone number"
    />
  ),
  args: {
    size: 'lg',
    defaultCountry: 'US',
  },
}

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [e164, setE164] = useState('')
    return (
      <View>
        <PhoneInput
          {...args}
          value={e164}
          onChange={(v) => setE164(v)}
          placeholder="Phone number"
          hint={e164 ? `E.164: ${e164}` : 'Type to see E.164 below'}
        />
      </View>
    )
  },
  args: {
    size: 'lg',
    defaultCountry: 'US',
  },
}

export const WithError: Story = {
  render: (args) => (
    <PhoneInput
      {...args}
      placeholder="Phone number"
      error="Please enter a valid phone number"
    />
  ),
  args: {
    size: 'lg',
    defaultCountry: 'US',
  },
}

export const WithHint: Story = {
  render: (args) => (
    <PhoneInput
      {...args}
      placeholder="Phone number"
      hint="We'll use this to contact you"
    />
  ),
  args: {
    size: 'lg',
    defaultCountry: 'US',
  },
}

export const SizeSm: Story = {
  render: (args) => (
    <PhoneInput {...args} size="sm" placeholder="Phone number" />
  ),
  args: {
    defaultCountry: 'US',
  },
}

export const Disabled: Story = {
  render: (args) => (
    <PhoneInput
      {...args}
      disabled
      placeholder="Phone number"
      defaultValue="+12125551234"
      hint="Disabled"
    />
  ),
  args: {
    size: 'lg',
    defaultCountry: 'US',
  },
}

export const DefaultCountryGB: Story = {
  render: (args) => (
    <PhoneInput
      {...args}
      defaultCountry="GB"
      placeholder="UK phone number"
      hint="Default country: United Kingdom"
    />
  ),
  args: {
    size: 'lg',
  },
}
