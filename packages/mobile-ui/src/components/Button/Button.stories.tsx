import type { Meta, StoryObj } from '@storybook/react'
import { ChevronLeft } from 'lucide-react-native'
import React from 'react'
import { View } from 'react-native'

import { Button } from '.'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'destructive',
        'outline',
        'outlineDestructive',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  render: (args) => <Button {...args} label="Button" />,
  args: {
    variant: 'primary',
    size: 'md',
  },
}

export const Secondary: Story = {
  render: (args) => <Button {...args} label="Button" />,
  args: {
    variant: 'secondary',
    size: 'md',
  },
}

export const Tertiary: Story = {
  render: (args) => <Button {...args} label="Button" />,
  args: {
    variant: 'tertiary',
    size: 'md',
  },
}

export const Destructive: Story = {
  render: (args) => <Button {...args} label="Button" />,
  args: {
    variant: 'destructive',
    size: 'md',
  },
}

export const Outline: Story = {
  render: (args) => <Button {...args} label="Button" />,
  args: {
    variant: 'outline',
    size: 'md',
  },
}

export const OutlineDestructive: Story = {
  render: (args) => <Button {...args} label="Button" />,
  args: {
    variant: 'outlineDestructive',
    size: 'md',
  },
}

export const Link: Story = {
  render: (args) => <Button {...args} label="Button" />,
  args: {
    variant: 'link',
    size: 'md',
  },
}

export const AllVariants: Story = {
  render: () => (
    <>
      <Button variant="primary" label="Primary" style={{ marginBottom: 8 }} />
      <Button
        variant="secondary"
        label="Secondary"
        style={{ marginBottom: 8 }}
      />
      <Button variant="tertiary" label="Tertiary" style={{ marginBottom: 8 }} />
      <Button
        variant="destructive"
        label="Destructive"
        style={{ marginBottom: 8 }}
      />
      <Button variant="outline" label="Outline" style={{ marginBottom: 8 }} />
      <Button
        variant="outlineDestructive"
        label="Outline Destructive"
        style={{ marginBottom: 8 }}
      />
      <Button variant="link" label="Link" style={{ marginBottom: 8 }} />
    </>
  ),
}

export const Sizes: Story = {
  render: () => (
    <>
      <Button size="xs" label="XSmall" style={{ marginBottom: 8 }} />
      <Button size="sm" label="Small" style={{ marginBottom: 8 }} />
      <Button size="md" label="Medium" style={{ marginBottom: 8 }} />
      <Button size="lg" label="Large" style={{ marginBottom: 8 }} />
    </>
  ),
}

export const IconButton: Story = {
  render: () => (
    <View className="self-start">
      <Button icon={ChevronLeft} className="self-start rounded-full" />
    </View>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <>
      <Button
        label="Left Icon"
        icon={ChevronLeft}
        iconPosition="left"
        style={{ marginBottom: 8 }}
      />
      <Button
        label="Right Icon"
        icon={ChevronLeft}
        iconPosition="right"
        style={{ marginBottom: 8 }}
      />
    </>
  ),
}

export const Loading: Story = {
  render: () => (
    <>
      <Button label="Loading" isLoading style={{ marginBottom: 8 }} />
      <Button
        label="Loading with Icon"
        icon={ChevronLeft}
        isLoading
        style={{ marginBottom: 8 }}
      />
    </>
  ),
}

export const Disabled: Story = {
  render: () => (
    <>
      <Button
        variant="primary"
        disabled
        label="Disabled Primary"
        style={{ marginBottom: 8 }}
      />
      <Button
        variant="secondary"
        disabled
        label="Disabled Secondary"
        style={{ marginBottom: 8 }}
      />
      <Button
        variant="tertiary"
        disabled
        label="Disabled Tertiary"
        style={{ marginBottom: 8 }}
      />
      <Button
        variant="destructive"
        disabled
        label="Disabled Destructive"
        style={{ marginBottom: 8 }}
      />
    </>
  ),
}
