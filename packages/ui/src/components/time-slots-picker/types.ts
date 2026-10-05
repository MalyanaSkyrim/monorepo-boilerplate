export interface UnavailableRange {
  start: number
  end: number
}

export interface TimeSlotsPickerProps {
  value: number[]
  onChange: (value: number[]) => void
  unavailableRanges?: UnavailableRange[]
  label?: string
  placeholder?: string
  disabled?: boolean
  permissive?: boolean
  hasConflict?: boolean
  conflictMessage?: string
}

export interface TimeSlotsPickerContentProps {
  value: number[]
  onChange: (value: number[]) => void
  unavailableRanges?: UnavailableRange[]
  permissive?: boolean
  hasConflict?: boolean
}

export type SlotState = 'default' | 'selected' | 'inRange' | 'unavailable'
