import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { Text, View } from 'react-native'

import { CardSelector, type CardSelectorItem } from '.'

const meta: Meta<typeof CardSelector> = {
  title: 'Components/CardSelector',
  component: CardSelector,
}

export default meta
type Story = StoryObj<typeof CardSelector>

const options: CardSelectorItem[] = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
]

export const Default: Story = {
  render: (args) => <CardSelector {...args} items={options} />,
}

export const WithDefaultValue: Story = {
  render: () => (
    <CardSelector items={options} defaultValue={['option1', 'option2']} />
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['option1'])
    return (
      <View className="gap-4">
        <Text className="text-greyscale-900">
          Selected: {value.join(', ') || 'None'}
        </Text>
        <CardSelector items={options} value={value} onChange={setValue} />
      </View>
    )
  },
}

export const Uncontrolled: Story = {
  render: () => {
    return (
      <CardSelector
        items={options}
        defaultValue={['option2']}
        onChange={(values) => {
          console.log('Selected values:', values)
        }}
      />
    )
  },
}

const cardOptions: CardSelectorItem[] = [
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

export const WithComplexLabels: Story = {
  render: () => <CardSelector items={cardOptions} />,
}

export const WithComplexLabelsDefaultValue: Story = {
  render: () => (
    <CardSelector items={cardOptions} defaultValue={['vehicle1']} />
  ),
}

export const WithComplexLabelsControlled: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['vehicle1', 'vehicle3'])
    return (
      <View className="gap-4">
        <Text className="text-greyscale-900">
          Selected: {value.join(', ') || 'None'}
        </Text>
        <CardSelector items={cardOptions} value={value} onChange={setValue} />
      </View>
    )
  },
}
