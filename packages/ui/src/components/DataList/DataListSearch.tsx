'use client'

import { Search, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Input } from '../Input'

interface DataListSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export function DataListSearch({
  value: externalValue,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}: DataListSearchProps) {
  const [internalValue, setInternalValue] = useState(externalValue)

  useEffect(() => {
    setInternalValue(externalValue)
  }, [externalValue])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== externalValue) {
        onChange(internalValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [internalValue, externalValue, onChange, debounceMs])

  const handleClear = useCallback(() => {
    setInternalValue('')
    onChange('')
  }, [onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
  }, [])

  return (
    <div className="relative max-w-sm flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-9 pl-9 pr-8 text-sm"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Clear search">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
