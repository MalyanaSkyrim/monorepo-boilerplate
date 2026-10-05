import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { View } from 'react-native'

import { Accordion, type AccordionItem } from '.'

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'unfilled'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: 'select',
      options: ['single', 'multiple'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Accordion>

const items: AccordionItem[] = [
  {
    value: 'item-1',
    title: 'How do I place an order?',
    content:
      'To place an order, simply select the products you want, proceed to checkout, provide shipping and payment information, and finalize your purchase.',
  },
  {
    value: 'item-2',
    title: 'What payment methods do you accept?',
    content:
      'We accept all major credit cards, including Visa, Mastercard, and American Express. We also support payments through PayPal.',
  },
  {
    value: 'item-3',
    title: 'How long does shipping take?',
    content:
      'Shipping typically takes 5-7 business days for standard delivery. Express shipping options are available at checkout for faster delivery.',
  },
]

export const Default: Story = {
  render: (args) => (
    <View className="w-full p-4">
      <Accordion
        items={items}
        type="single"
        isCollapsible={true}
        variant={args.variant}
        size={args.size}
      />
    </View>
  ),
  args: {
    variant: 'filled',
    size: 'md',
  },
}
