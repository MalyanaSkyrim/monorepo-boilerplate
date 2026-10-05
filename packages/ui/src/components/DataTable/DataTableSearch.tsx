'use client'

import { Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Input } from '../Input'

interface DataTableSearchProps {
  /** Current search value */
  value: string
  /** Called when search value changes (already debounced) */
  onChange: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Debounce delay in milliseconds. Default: 300 */
  debounceMs?: number
}

export function DataTableSearch({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}: DataTableSearchProps) {
  const [internalValue, setInternalValue] = useState(value)

  // Sync internal value when external value changes (e.g. reset)
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [internalValue, debounceMs, onChange, value])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
  }, [])

  return (
    <div className="w-full max-w-sm">
      <Input
        type="text"
        icon={Search}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
      />
    </div>
  )
}
