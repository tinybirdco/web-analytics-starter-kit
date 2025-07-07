'use client'

import { Popover } from '@headlessui/react'
import { DateRangePicker } from '@tremor/react'
import { subDays } from 'date-fns'
import { QuestionIcon } from './Icons'

import {
  DateFilter as DateFilterType,
  DateRangePickerOption,
} from '../lib/types/date-filter'
import useDateFilter from '../lib/hooks/use-date-filter'

const dateFilterOptions: DateRangePickerOption[] = [
  { text: 'Today', value: DateFilterType.Today, startDate: new Date() },
  {
    text: 'Yesterday',
    value: DateFilterType.Yesterday,
    startDate: subDays(new Date(), 1),
  },
  {
    text: '7 days',
    value: DateFilterType.Last7Days,
    startDate: subDays(new Date(), 7),
  },
  {
    text: '30 days',
    value: DateFilterType.Last30Days,
    startDate: subDays(new Date(), 30),
  },
  {
    text: '12 months',
    value: DateFilterType.Last12Months,
    startDate: subDays(new Date(), 365),
  },
]

export default function DateFilter() {
  const { dateRangePickerValue, onDateRangePickerValueChange } = useDateFilter()

  return (
    <div className="flex items-center gap-4">
      <Popover className="relative h-4">
        <Popover.Button>
          <QuestionIcon className="text-secondaryLight" />
          <div className="sr-only">What is the time zone used?</div>
        </Popover.Button>
        <Popover.Panel className="absolute bottom-6 -right-10 bg-secondary text-white text-xs font-light rounded py-1 px-2 z-[2] w-24">
          UTC timezone
        </Popover.Panel>
      </Popover>
      <div className="min-w-[165px] z-20">
        <DateRangePicker
          value={dateRangePickerValue}
          onValueChange={onDateRangePickerValueChange}
          options={dateFilterOptions}
          enableYearPagination
        />
      </div>
    </div>
  )
}
