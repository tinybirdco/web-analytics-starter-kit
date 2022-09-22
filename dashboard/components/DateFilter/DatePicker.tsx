import { RangeValue } from 'rc-picker/lib/interface'
import { DatePicker as BaseDatePicker } from 'antd'
import moment, { Moment } from 'moment'
import { DateFilter } from '../../lib/types/date-filter'

type DatePickerProps = {
  onChange: (value: DateFilter, startDate?: string, endDate?: string) => void
  startDate?: string
  endDate?: string
}

export default function DatePicker({
  onChange,
  startDate,
  endDate,
}: DatePickerProps) {
  const handleChange = (range: RangeValue<Moment>) => {
    if (!range) return
    const [startDate, endDate] = range
    if (!startDate || !endDate) return
    onChange(
      DateFilter.Custom,
      startDate.format('YYYY-MM-DD'),
      endDate.format('YYYY-MM-DD')
    )
  }

  return (
    <BaseDatePicker.RangePicker
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
      onChange={handleChange}
      className="flex gap-2 mr-2"
      dropdownClassName="hidden"
    />
  )
}
