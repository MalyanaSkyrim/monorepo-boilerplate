import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import { Checkbox, type CheckboxState } from '.'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  render: (args) => <Checkbox {...args} label="Label" />,
  args: {},
}

export const UncheckedDisabled: Story = {
  render: () => <Checkbox isDisabled label="Label" />,
}

export const CheckedDisabled: Story = {
  render: () => <Checkbox isDisabled state="checked" label="Label" />,
}

export const Controlled: Story = {
  render: () => {
    const [state, setState] = React.useState<CheckboxState>('unchecked')

    return (
      <Checkbox
        state={state}
        onChange={(newState) => setState(newState)}
        label={`Controlled Checkbox (Current: ${state})`}
      />
    )
  },
}

export const Indeterminate: Story = {
  render: () => (
    <Checkbox state="indeterminate" label="Indeterminate Checkbox" />
  ),
}

export const IndeterminateDisabled: Story = {
  render: () => (
    <Checkbox
      state="indeterminate"
      isDisabled
      label="Indeterminate Disabled Checkbox"
    />
  ),
}

export const Sizes: Story = {
  render: () => (
    <>
      <Checkbox size="sm" label="Small" style={{ marginBottom: 8 }} />
      <Checkbox size="md" label="Medium" style={{ marginBottom: 8 }} />
      <Checkbox size="lg" label="Large" />
    </>
  ),
}
