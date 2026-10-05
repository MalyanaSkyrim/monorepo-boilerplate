import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import { OtpInput } from '.'

const meta: Meta<typeof OtpInput> = {
  title: 'Components/OtpInput',
  component: OtpInput,
}

export default meta
type Story = StoryObj<typeof OtpInput>

const ControlledOtpInput = ({
  initialValue = '',
  error,
}: {
  initialValue?: string
  error?: string
}) => {
  const [value, setValue] = React.useState(initialValue)
  return <OtpInput value={value} onChangeText={setValue} error={error} />
}

export const Default: Story = {
  render: () => <ControlledOtpInput />,
}

export const PartiallyFilled: Story = {
  render: () => <ControlledOtpInput initialValue="123" />,
}

export const WithError: Story = {
  render: () => (
    <ControlledOtpInput initialValue="123456" error="That code is not valid" />
  ),
}
