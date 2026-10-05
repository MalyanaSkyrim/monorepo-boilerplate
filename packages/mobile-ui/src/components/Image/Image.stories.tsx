import type { Meta, StoryObj } from '@storybook/react'
import { MapPin } from 'lucide-react-native'
import React from 'react'
import { View } from 'react-native'

import { UIImage } from '.'

const meta: Meta<typeof UIImage> = {
  title: 'Components/Image',
  component: UIImage,
  argTypes: {
    source: {
      control: 'object',
    },
    className: {
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof UIImage>

export const Default: Story = {
  render: (args) => (
    <View className="gap-4">
      <UIImage
        {...args}
        source={{ uri: 'https://picsum.photos/200/200' }}
        className="h-[200px] w-[200px] rounded-lg"
      />
    </View>
  ),
  args: {
    resizeMode: 'cover',
  },
}

export const WithCustomPlaceholder: Story = {
  render: () => (
    <View className="gap-4">
      <UIImage
        source={{ uri: 'https://picsum.photos/200/200' }}
        className="h-[200px] w-[200px] rounded-lg"
        placeholder={
          <View className="bg-primary-100 h-full w-full items-center justify-center">
            <MapPin size={48} color="#3f46f9" />
          </View>
        }
      />
    </View>
  ),
}

export const ErrorState: Story = {
  render: () => (
    <View className="gap-4">
      <UIImage
        source={{ uri: 'https://invalid-url-that-will-fail.com/image.jpg' }}
        className="h-[200px] w-[200px] rounded-lg"
      />
    </View>
  ),
}

export const LoadingState: Story = {
  render: () => (
    <View className="gap-4">
      <UIImage
        source={{
          uri: 'https://picsum.photos/200/200?slow=true',
        }}
        className="h-[200px] w-[200px] rounded-lg"
      />
    </View>
  ),
}

export const AllStates: Story = {
  render: () => (
    <View className="gap-4">
      <View>
        <UIImage
          source={{ uri: 'https://picsum.photos/200/200' }}
          className="h-[100px] w-[100px] rounded-lg"
        />
      </View>
      <View>
        <UIImage
          source={{ uri: 'https://invalid-url.com/image.jpg' }}
          className="h-[100px] w-[100px] rounded-lg"
        />
      </View>
      <View>
        <UIImage
          source={undefined}
          className="h-[100px] w-[100px] rounded-lg"
        />
      </View>
    </View>
  ),
}
