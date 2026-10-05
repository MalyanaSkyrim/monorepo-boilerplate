import dayjs from 'dayjs'

import type { RangeValue, SingleValue } from './types'

export const formatDate = (date: SingleValue): string => {
  if (!date) return ''
  return dayjs(date).format('DD/MM/YYYY')
}

export const formatRange = (range: RangeValue): string => {
  const [start, end] = range
  if (!start && !end) return ''
  if (start && !end) return formatDate(start)
  return `${formatDate(start)} - ${formatDate(end)}`
}
