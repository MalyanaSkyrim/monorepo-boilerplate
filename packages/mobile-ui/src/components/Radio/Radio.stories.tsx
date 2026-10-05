import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { Text, View } from 'react-native'

import { RadioGroup, type RadioOption } from '.'

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/Radio',
  component: RadioGroup,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
}

export default meta
type Story = StoryObj<typeof RadioGroup>

const options: RadioOption[] = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
]

export const Default: Story = {
  render: (args) => <RadioGroup {...args} options={options} />,
  args: {
    size: 'md',
  },
}

export const WithDefaultValue: Story = {
  render: () => <RadioGroup options={options} defaultValue="option1" />,
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('option1')
    return <RadioGroup options={options} value={value} onChange={setValue} />
  },
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup
      options={[
        { label: 'Disabled unchecked', value: 'disabled1' },
        { label: 'Disabled checked', value: 'disabled2' },
      ]}
      defaultValue="disabled2"
    />
  ),
}

export const Sizes: Story = {
  render: () => (
    <>
      <RadioGroup options={options} size="sm" style={{ marginBottom: 16 }} />
      <RadioGroup options={options} size="md" />
    </>
  ),
}

const cardOptions: RadioOption[] = [
  {
    value: 'vehicle1',
    label: (
      <View className="flex-row items-center gap-4">
        <View className="bg-greyscale-100 h-16 w-16 items-center justify-center rounded-lg">
          <Text className="text-greyscale-400 text-xs">Image</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-greyscale-900 text-base font-semibold">
            Toyota Corolla
          </Text>
          <Text className="text-greyscale-400 text-sm">HG 4676 FH</Text>
        </View>
      </View>
    ),
  },
  {
    value: 'vehicle2',
    label: (
      <View className="flex-row items-center gap-4">
        <View className="bg-greyscale-100 h-16 w-16 items-center justify-center rounded-lg">
          <Text className="text-greyscale-400 text-xs">Image</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-greyscale-900 text-base font-semibold">
            Honda Civic
          </Text>
          <Text className="text-greyscale-400 text-sm">AB 1234 CD</Text>
        </View>
      </View>
    ),
  },
  {
    value: 'vehicle3',
    label: (
      <View className="flex-row items-center gap-4">
        <View className="bg-greyscale-100 h-16 w-16 items-center justify-center rounded-lg">
          <Text className="text-greyscale-400 text-xs">Image</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-greyscale-900 text-base font-semibold">
            Ford Focus
          </Text>
          <Text className="text-greyscale-400 text-sm">EF 5678 GH</Text>
        </View>
      </View>
    ),
  },
]

export const Cards: Story = {
  render: (args) => (
    <RadioGroup {...args} options={cardOptions} variant="cards" />
  ),
  args: {
    variant: 'cards',
  },
}

export const CardsWithDefaultValue: Story = {
  render: () => (
    <RadioGroup options={cardOptions} variant="cards" defaultValue="vehicle1" />
  ),
}

export const CardsControlled: Story = {
  render: () => {
    const [value, setValue] = useState('vehicle1')
    return (
      <RadioGroup
        options={cardOptions}
        variant="cards"
        value={value}
        onChange={setValue}
      />
    )
  },
}

export const CardsWithStringLabels: Story = {
  render: () => (
    <RadioGroup
      variant="cards"
      options={[
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ]}
    />
  ),
}

export const CustomCards: Story = {
  render: () => {
    const handleCardChange = (value: string) => {
      console.log('Selected card value:', value)
    }

    return (
      <RadioGroup
        onChange={handleCardChange}
        direction="row"
        variant="custom"
        customOptions={[
          {
            value: 'card1',
            render: ({ isSelected }) => (
              <View
                className={`rounded-xl border-2 p-6 transition-colors ${
                  isSelected
                    ? 'bg-primary-25 border-primary-200'
                    : 'border-greyscale-100 bg-white'
                }`}>
                <Text className="text-greyscale-900 mb-2 text-lg font-semibold">
                  Premium Plan
                </Text>
                <Text className="text-greyscale-600 text-sm">
                  Get access to all premium features and priority support
                </Text>
              </View>
            ),
          },
          {
            value: 'card2',
            render: ({ isSelected }) => (
              <View
                className={`rounded-xl border-2 p-6 transition-colors ${
                  isSelected
                    ? 'bg-primary-25 border-primary-200'
                    : 'border-greyscale-100 bg-white'
                }`}>
                <Text className="text-greyscale-900 mb-2 text-lg font-semibold">
                  Basic Plan
                </Text>
                <Text className="text-greyscale-600 text-sm">
                  Essential features for getting started
                </Text>
              </View>
            ),
          },
          {
            value: 'card3',
            render: ({ isSelected }) => (
              <View
                className={`rounded-xl border-2 p-6 transition-colors ${
                  isSelected
                    ? 'bg-primary-25 border-primary-200'
                    : 'border-greyscale-100 bg-white'
                }`}>
                <Text className="text-greyscale-900 mb-2 text-lg font-semibold">
                  Enterprise Plan
                </Text>
                <Text className="text-greyscale-600 text-sm">
                  Advanced features with dedicated account management
                </Text>
              </View>
            ),
          },
        ]}
        defaultValue="card1"
      />
    )
  },
}
