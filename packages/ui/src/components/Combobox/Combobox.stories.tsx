import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

import { Combobox, type ComboboxOption } from '.'

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    emptyText: { control: 'text' },
    disabled: { control: 'boolean' },
    multiple: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Combobox>

const frameworks = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro']

export const Basic: Story = {
  args: {
    placeholder: 'Select a framework',
    searchPlaceholder: 'Search...',
    emptyText: 'No framework found.',
    multiple: false,
  },
  render: function Render(args) {
    const [value, setValue] = useState<string>('')
    return (
      <div className="w-[280px]">
        <Combobox
          {...args}
          items={frameworks}
          value={value}
          onValueChange={(val) => setValue(val as string)}
        />
        {value && (
          <p className="text-muted-foreground mt-2 text-sm">
            Selected: <span className="font-medium">{value}</span>
          </p>
        )}
      </div>
    )
  },
}

export const MultipleWithChips: Story = {
  args: {
    placeholder: 'Add framework',
    searchPlaceholder: 'Search...',
    emptyText: 'No framework found.',
    multiple: true,
  },
  render: function Render(args) {
    const [value, setValue] = useState<string[]>([])
    return (
      <div className="w-[320px]">
        <Combobox
          {...args}
          items={frameworks}
          value={value}
          onValueChange={(val) => setValue(val as string[])}
        />
        {value.length > 0 && (
          <p className="text-muted-foreground mt-2 text-sm">
            Selected: {value.length} — {value.join(', ')}
          </p>
        )}
      </div>
    )
  },
}

export const WithPreselectedValues: Story = {
  render: function Render() {
    const [value, setValue] = useState<string[]>(['Next.js', 'Remix'])
    return (
      <div className="w-[320px]">
        <Combobox
          items={frameworks}
          value={value}
          onValueChange={(val) => setValue(val as string[])}
          multiple
          placeholder="Add framework"
        />
      </div>
    )
  },
}

const manyOptions = Array.from({ length: 20 }, (_, i) => `Option ${i + 1}`)

export const WithManyOptions: Story = {
  render: function Render() {
    const [value, setValue] = useState<string[]>([])
    return (
      <div className="w-[320px]">
        <Combobox
          items={manyOptions}
          value={value}
          onValueChange={(val) => setValue(val as string[])}
          multiple
          placeholder="Select options"
          searchPlaceholder="Search options..."
        />
      </div>
    )
  },
}

const customItems: ComboboxOption[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'svelte', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
]

export const CustomItems: Story = {
  render: function Render() {
    const [value, setValue] = useState<string[]>([])
    return (
      <div className="w-[320px]">
        <Combobox
          items={customItems}
          value={value}
          onValueChange={(val) => setValue(val as string[])}
          multiple
          placeholder="Select framework"
          itemToStringValue={(item) => item.label}
        />
        {value.length > 0 && (
          <p className="text-muted-foreground mt-2 text-sm">
            Values: {value.join(', ')}
          </p>
        )}
      </div>
    )
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Select a framework',
    multiple: false,
  },
  render: (args) => (
    <div className="w-[280px]">
      <Combobox
        {...args}
        items={frameworks}
        value=""
        onValueChange={() => {}}
      />
    </div>
  ),
}
