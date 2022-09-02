import { RangeValue } from 'rc-picker/lib/interface'
import { DatePicker } from 'antd'
import moment, { Moment } from 'moment'

import { CalendarIcon } from './Icons'
import Select from './Select'
import { OptionType } from '../lib/types/options'
import { DateFilter } from '../lib/types/date-filter'
import useDateFilter from '../lib/hooks/use-date-filter'

const dateFilterOptions: OptionType<DateFilter>[] = [
  { label: 'Today', value: DateFilter.Today },
  { label: 'Yesterday', value: DateFilter.Yesterday },
  { label: 'Last 7 days', value: DateFilter.Last7Days },
  { label: 'Last 30 days', value: DateFilter.Last30Days },
  { label: 'Last 12 months', value: DateFilter.Last12Months },
  { label: 'Custom date', value: DateFilter.Custom },
]

export default function DateSelector() {
  const { lastDays, startDate, endDate, setDateFilter } = useDateFilter()
  const customDateSelected = lastDays === DateFilter.Custom

  const _onChange = (value: RangeValue<Moment>) => {
    if (value && value[0] && value[1]) {
      setDateFilter(
        DateFilter.Custom,
        value[0].format('YYYY-MM-DD'),
        value[1].format('YYYY-MM-DD')
      )
    }
  }

  return (
    <Select
      id="lastDays"
      options={dateFilterOptions}
      value={lastDays}
      icon={<CalendarIcon className="text-secondaryLight" />}
      onChange={setDateFilter}
      renderButton={
        customDateSelected ? (
          <DatePicker.RangePicker
            onClick={ev => {
              ev.preventDefault()
              ev.stopPropagation()
            }}
            format="YYYY-MM-DD"
            suffixIcon={null}
            allowClear={false}
            bordered={false}
            defaultValue={[
              moment(startDate, 'YYYY-MM-DD'),
              moment(endDate, 'YYYY-MM-DD'),
            ]}
            onChange={_onChange}
            className="flex gap-2 mr-2"
            dropdownClassName="hidden"
          />
        ) : null
      }
    />
  )
}
