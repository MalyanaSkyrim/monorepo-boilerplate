import type { Meta, StoryObj } from '@storybook/react'
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  subDays,
} from 'date-fns'
import React, { useState } from 'react'
import { Text, View } from 'react-native'

import { Button } from '../Button'
import { DatePicker, DatePickerProps } from './index'

const DatePickerMeta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  args: {
    isVisible: true,
  },
}

export default DatePickerMeta

type Story = StoryObj<typeof DatePicker>

const DatePickerSingleWrapper = (props: Partial<DatePickerProps>) => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    props.mode === 'single' ? props.value : undefined,
  )

  return (
    <View>
      <Button label="Open Date Picker" onPress={() => setIsVisible(true)} />
      <Text style={{ marginTop: 20, textAlign: 'center' }}>
        Selected Date: {selectedDate ? selectedDate.toDateString() : 'None'}
      </Text>
      <DatePicker
        {...props}
        mode="single"
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        onChange={(date) => {
          setSelectedDate(date)
          console.log('Selected Date:', date)
        }}
        value={selectedDate}
      />
    </View>
  )
}

const DatePickerRangeWrapper = (props: Partial<DatePickerProps>) => {
  const [isVisible, setIsVisible] = useState(false)
  const [range, setRange] = useState<
    | {
        startDate: Date
        endDate: Date
      }
    | undefined
  >(props.mode === 'range' ? props.value : undefined)

  return (
    <View>
      <Button label="Open Range Picker" onPress={() => setIsVisible(true)} />
      <Text style={{ marginTop: 20, textAlign: 'center' }}>
        Start: {range?.startDate ? range.startDate.toDateString() : 'None'}
        {'\n'}
        End: {range?.endDate ? range.endDate.toDateString() : 'None'}
      </Text>
      <DatePicker
        {...props}
        mode="range"
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        onChange={(newRange) => {
          setRange(newRange)
          console.log('Selected Range:', newRange)
        }}
        value={range}
      />
    </View>
  )
}

export const Default: Story = {
  render: (args) => <DatePickerSingleWrapper {...args} />,
}

export const RangeSelection: Story = {
  render: (args) => <DatePickerRangeWrapper {...args} />,
  args: {
    mode: 'range',
  },
}

export const WithPreSelectedDate: Story = {
  render: (args) => <DatePickerSingleWrapper {...args} />,
  args: {
    mode: 'single',
    value: new Date(),
  },
}

export const WithPreSelectedRange: Story = {
  render: (args) => <DatePickerRangeWrapper {...args} />,
  args: {
    mode: 'range',
    value: {
      startDate: new Date(),
      endDate: addDays(new Date(), 5),
    },
  },
}

export const LimitedAvailability: Story = {
  render: (args) => <DatePickerSingleWrapper {...args} />,
  args: {
    unavailableDates: [
      addDays(new Date(), 1),
      addDays(new Date(), 3),
      addDays(new Date(), 4),
      addDays(new Date(), 10),
    ],
  },
}

export const RangeLimitedAvailability: Story = {
  render: (args) => <DatePickerRangeWrapper {...args} />,
  args: {
    mode: 'range',
    unavailableDates: [addDays(new Date(), 2), addDays(new Date(), 5)],
  },
}

export const AllDatesAvailable: Story = {
  render: (args) => <DatePickerSingleWrapper {...args} />,
  args: {
    // No unavailableDates passed
  },
}

export const NoDatesAvailable: Story = {
  render: (args) => <DatePickerSingleWrapper {...args} />,
  args: {
    unavailableDates: eachDayOfInterval({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    }),
  },
}

export const MinMaxDateRestrictions: Story = {
  render: (args) => <DatePickerSingleWrapper {...args} />,
  args: {
    minDate: subDays(new Date(), 5),
    maxDate: addDays(new Date(), 5),
  },
}
