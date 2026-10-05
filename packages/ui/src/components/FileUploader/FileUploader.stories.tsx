import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { FileUploader } from './index'

const meta = {
  title: 'Components/FileUploader',
  component: FileUploader,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FileUploader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [urls, setUrls] = useState<string[]>([])
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (files: File[]) => {
      setUploading(true)
      // Simulate network wait
      await new Promise((r) => setTimeout(r, 1000))
      setUploading(false)

      // We just use Object URLs to simulate the uploaded urls
      return files.map((f) => URL.createObjectURL(f))
    }

    return (
      <div className="w-[600px] bg-white p-8">
        <FileUploader
          {...args}
          value={urls}
          onChange={setUrls}
          onUpload={handleUpload}
          isUploading={uploading}
        />
      </div>
    )
  },
}
