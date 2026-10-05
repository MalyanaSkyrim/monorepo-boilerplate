export interface UnavailableRangeString {
  start: string
  end: string
}

export interface MonthsSlotsPickerProps {
  value: string[]
  onChange: (value: string[]) => void
  startDate?: Date
  unavailableRanges?: UnavailableRangeString[]
  label?: string
  placeholder?: string
  disabled?: boolean
  permissive?: boolean
  hasConflict?: boolean
  conflictMessage?: string
}

export interface MonthsSlotsPickerContentProps {
  value: string[]
  onChange: (value: string[]) => void
  startDate: Date
  unavailableRanges?: UnavailableRangeString[]
  permissive?: boolean
  hasConflict?: boolean
}

export type SlotState = 'default' | 'selected' | 'inRange' | 'unavailable'
