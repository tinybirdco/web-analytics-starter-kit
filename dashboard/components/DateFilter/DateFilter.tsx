import * as Tooltip from '@radix-ui/react-tooltip'

import { CalendarIcon, QuestionIcon } from '../Icons'
import Select from '../Select'
import { OptionType } from '../../lib/types/options'
import { DateFilter as DateFilterType } from '../../lib/types/date-filter'
import useDateFilter from '../../lib/hooks/use-date-filter'
import VisuallyHidden from '../VisuallyHidden'
import dynamic from 'next/dynamic'
import Loader from '../Loader'

const DatePicker = dynamic(() => import('./DatePicker'), {
  ssr: false,
  loading: () => <Loader size={16} />,
})

const dateFilterOptions: OptionType<DateFilterType>[] = [
  { label: 'Today', value: DateFilterType.Today },
  { label: 'Yesterday', value: DateFilterType.Yesterday },
  { label: 'Last 7 days', value: DateFilterType.Last7Days },
  { label: 'Last 30 days', value: DateFilterType.Last30Days },
  { label: 'Last 12 months', value: DateFilterType.Last12Months },
  { label: 'Custom date', value: DateFilterType.Custom },
]

export default function DateFilter() {
  const { lastDays, startDate, endDate, setDateFilter } = useDateFilter()

  return (
    <div className="flex items-center gap-4">
      <Tooltip.Provider delayDuration={0}>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <QuestionIcon className="text-secondaryLight" />
            <VisuallyHidden>What is the time zone used?</VisuallyHidden>
          </Tooltip.Trigger>
          <Tooltip.Content className="bg-secondary text-white text-xs font-light rounded py-1 px-2">
            UTC timezone
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
      <div className="min-w-[165px]">
        <Select
          id="lastDays"
          options={dateFilterOptions}
          value={lastDays}
          icon={<CalendarIcon className="text-secondaryLight" />}
          onChange={setDateFilter}
          renderButton={
            lastDays === DateFilterType.Custom ? (
              <DatePicker
                onChange={setDateFilter}
                endDate={endDate}
                startDate={startDate}
              />
            ) : null
          }
        />
      </div>
    </div>
  )
}
