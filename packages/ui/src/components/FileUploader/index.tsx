import { Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react'
import * as React from 'react'

import { classMerge as cn } from '../../lib/utils'
import { Button } from '../Button'
import { showToast } from '../Toaster/showToast'

export interface FileUploaderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value?: string[]
  onChange?: (urls: string[]) => void
  maxFiles?: number
  onUpload?: (files: File[]) => Promise<string[]>
  isUploading?: boolean
}

export const FileUploader = React.forwardRef<
  HTMLInputElement,
  FileUploaderProps
>(
  (
    {
      className,
      value = [],
      onChange,
      maxFiles = 5,
      onUpload,
      isUploading = false,
      disabled,
      accept = 'image/*',
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (!files.length) return

      if (value.length + files.length > maxFiles) {
        showToast({
          id: 'max-files-limit-exceeded',
          title: `You cannot select more than ${maxFiles} images.`,
          variant: 'error',
        })
        if (inputRef.current) {
          inputRef.current.value = ''
        }
        return
      }

      if (onUpload && files.length > 0) {
        try {
          const newUrls = await onUpload(files)
          onChange?.([...value, ...newUrls])
        } catch (error) {
          console.error('File upload failed:', error)
        }
      } else if (files.length > 0) {
        try {
          const newUrls = await Promise.all(
            files.map(
              (file) =>
                new Promise<string>((resolve, reject) => {
                  const reader = new FileReader()
                  reader.onload = () => resolve(reader.result as string)
                  reader.onerror = reject
                  reader.readAsDataURL(file)
                }),
            ),
          )
          onChange?.([...value, ...newUrls])
        } catch (error) {
          console.error('Failed to read local files:', error)
        }
      }

      // Reset input value to allow selecting same file again
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }

    const removeImage = (indexToRemove: number) => {
      onChange?.(value.filter((_, i) => i !== indexToRemove))
    }

    return (
      <div className={cn('space-y-4', className)}>
        {/* Upload Dropzone */}
        <div
          className={cn(
            'border-muted hover:border-primary flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50/50 px-6 pb-6 pt-5 transition-colors',
            (disabled || isUploading || value.length >= maxFiles) &&
              'pointer-events-none opacity-50',
          )}
          onClick={() =>
            !disabled &&
            !isUploading &&
            value.length < maxFiles &&
            inputRef.current?.click()
          }>
          <div className="space-y-1 text-center">
            <UploadCloud className="text-muted-foreground mx-auto h-12 w-12" />
            <div className="flex justify-center text-sm text-gray-600">
              <span className="text-primary hover:text-primary-dark relative cursor-pointer rounded-md font-medium">
                {isUploading ? 'Uploading...' : 'Upload files'}
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-muted-foreground text-xs">
              {accept.includes('image') ? 'PNG, JPG' : 'Files'} up to 10MB each
            </p>
            <div className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {value.length} / {maxFiles} Selected
            </div>
          </div>
          <input
            ref={(e) => {
              if (typeof ref === 'function') ref(e)
              else if (ref) ref.current = e
              inputRef.current = e
            }}
            type="file"
            className="hidden"
            multiple={maxFiles > 1}
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled || isUploading || value.length >= maxFiles}
            {...props}
          />
        </div>

        {/* Uploaded Images Grid */}
        {value.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {value.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="border-border group relative aspect-square overflow-hidden rounded-lg border">
                {url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ||
                accept.includes('image') ? (
                  <img
                    className="h-full w-full object-cover"
                    src={url}
                    alt={`Uploaded file ${index + 1}`}
                  />
                ) : (
                  <div className="bg-muted flex h-full w-full items-center justify-center">
                    <ImageIcon className="text-muted-foreground h-10 w-10" />
                  </div>
                )}

                {/* Main badge for first image */}
                {index === 0 && (
                  <div className="absolute left-2 top-2">
                    <span className="bg-primary shadow-soft-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Main
                    </span>
                  </div>
                )}

                {/* Action Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {/* Set main overlay (for non-main items) */}
                  {index > 0 && onChange && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/50 bg-transparent py-1 text-xs font-medium text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        const newValues = [...value]
                        const [moved] = newValues.splice(index, 1)
                        newValues.unshift(moved!)
                        onChange(newValues)
                      }}>
                      Set Main
                    </Button>
                  )}

                  {/* Remove button */}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                    disabled={disabled || isUploading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  },
)

FileUploader.displayName = 'FileUploader'
