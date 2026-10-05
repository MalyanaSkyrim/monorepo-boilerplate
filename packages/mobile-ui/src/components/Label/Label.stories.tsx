import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import { Label } from '.'

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  render: (args) => <Label {...args}>Label</Label>,
  args: {
    size: 'lg',
  },
}

export const Small: Story = {
  render: () => <Label size="sm">Small Label</Label>,
}

export const Disabled: Story = {
  render: () => <Label disabled>Disabled Label</Label>,
}
