'use client'

import { ChevronDown, X } from 'lucide-react'
import * as React from 'react'

import { classMerge } from '../../lib/utils'
import { Button } from '../Button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../Command'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxProps {
  /** Options to display. Use string[] for simple items or ComboboxOption[] for custom labels. */
  items: string[] | ComboboxOption[]
  /** Selected value (single) or values (multiple). */
  value: string | string[]
  /** Called when selection changes. */
  onValueChange: (value: string | string[]) => void
  /** Allow multiple selection. */
  multiple?: boolean
  /** Placeholder when nothing selected. */
  placeholder?: string
  /** Placeholder for the search input inside the list. */
  searchPlaceholder?: string
  /** Text when no search results. */
  emptyText?: string
  disabled?: boolean
  triggerClassName?: string
  /** For object items, return the string used for display and filter. */
  itemToStringValue?: (item: ComboboxOption) => string
  /** Label for "select all" button (shown above list when multiple). */
  selectAllLabel?: string
  /** Label for "reset" button (shown above list when multiple). */
  resetLabel?: string
}

const Combobox = ({
  items,
  value,
  onValueChange,
  multiple = false,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No items found.',
  disabled = false,
  triggerClassName,
  itemToStringValue,
  selectAllLabel = 'All',
  resetLabel = 'Reset',
}: ComboboxProps) => {
  const [open, setOpen] = React.useState(false)
  const selectedSet = React.useMemo(() => {
    const v = Array.isArray(value) ? value : value ? [value] : []
    return new Set(v)
  }, [value])

  const options: ComboboxOption[] = React.useMemo(
    () =>
      items.map((item) =>
        typeof item === 'string'
          ? { value: item, label: item, disabled: false }
          : item,
      ),
    [items],
  )

  const toggle = (optionValue: string) => {
    if (multiple) {
      const next = new Set(selectedSet)
      if (next.has(optionValue)) next.delete(optionValue)
      else next.add(optionValue)
      onValueChange(Array.from(next))
    } else {
      onValueChange(optionValue)
      setOpen(false)
    }
  }

  const displayValue = Array.isArray(value) ? value : value ? [value] : []
  const selectedLabels = displayValue.map(
    (v) => options.find((o) => o.value === v)?.label ?? v,
  )

  const remove = (
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
    optionValue: string,
  ) => {
    e.stopPropagation()
    if (multiple && Array.isArray(value)) {
      onValueChange(value.filter((v) => v !== optionValue))
    }
  }

  const selectAll = () => {
    if (multiple) {
      onValueChange(options.filter((o) => !o.disabled).map((o) => o.value))
    }
  }

  const reset = () => {
    if (multiple) {
      onValueChange([])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={classMerge(
            'flex min-h-9 w-full items-center justify-between gap-2 font-normal',
            !displayValue.length && 'text-muted-foreground',
            triggerClassName,
          )}>
          <span className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-1 overflow-hidden">
            {selectedLabels.length > 0 ? (
              multiple ? (
                <>
                  {displayValue.slice(0, 2).map((val, i) => {
                    const label = selectedLabels[i]
                    return (
                      <span
                        key={val}
                        className="bg-muted text-muted-foreground inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-xs">
                        <span className="max-w-[8rem] truncate text-[14px]">
                          {label}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label="Remove"
                          className="hover:bg-muted-foreground/20 cursor-pointer rounded p-0.5"
                          onClick={(e) => remove(e, val)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              remove(e, val)
                            }
                          }}>
                          <X className="h-3 w-3" />
                        </span>
                      </span>
                    )
                  })}
                  {displayValue.length > 2 && (
                    <span className="bg-muted text-muted-foreground inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-xs">
                      +{displayValue.length - 2}
                    </span>
                  )}
                </>
              ) : (
                <span className="truncate text-[14px]">
                  {selectedLabels[0]}
                </span>
              )
            ) : (
              <span className="text-muted-foreground text-[14px]">
                {placeholder}
              </span>
            )}
          </span>
          <span className="shrink-0">
            <ChevronDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start">
        {multiple && (
          <div className="flex items-center justify-end gap-1 border-b p-2">
            <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
              {selectAllLabel}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              {resetLabel}
            </Button>
          </div>
        )}
        <Command className="rounded-lg border-0 shadow-none">
          <CommandInput placeholder={searchPlaceholder} className="border-b" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedSet.has(option.value)
                const isDisabled = option.disabled
                return (
                  <CommandItem
                    key={option.value}
                    value={
                      itemToStringValue
                        ? itemToStringValue(option)
                        : option.label
                    }
                    disabled={isDisabled}
                    onSelect={() => !isDisabled && toggle(option.value)}
                    className="flex cursor-pointer items-center gap-2">
                    {multiple && (
                      <span
                        className={classMerge(
                          'border-input flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                          isSelected &&
                            'bg-primary text-primary-foreground border-primary',
                        )}>
                        {isSelected ? (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : null}
                      </span>
                    )}
                    <span className="text-[14px]">{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

Combobox.displayName = 'Combobox'

export { Combobox }
