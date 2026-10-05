export type SingleValue = Date | null

export type RangeValue = [Date | null, Date | null]

export type SharedDatePickerProps = {
  disabled?: boolean
  clearable?: boolean
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  isDateUnavailable?: (date: Date) => boolean
  hasConflict?: boolean
  conflictMessage?: string
  permissive?: boolean
}

export type DatePickerProps = SharedDatePickerProps &
  (
    | {
        mode: 'single'
        value: SingleValue
        onChange: (value: SingleValue) => void
      }
    | {
        mode: 'range'
        value: RangeValue
        onChange: (value: RangeValue) => void
      }
  )
