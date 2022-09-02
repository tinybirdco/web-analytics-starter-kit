import moment from 'moment'

import { useRouter } from 'next/router'
import { DateFilter } from '../types/date-filter'

export default function useDateFilter() {
  const router = useRouter()
  const setDateFilter = (
    value: DateFilter,
    startDate?: string,
    endDate?: string
  ) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('last_days', value)

    if (value === DateFilter.Custom && startDate && endDate) {
      searchParams.set('start_date', startDate)
      searchParams.set('end_date', endDate)
    } else {
      searchParams.delete('start_date')
      searchParams.delete('end_date')
    }
    router.push(
      {
        query: searchParams.toString(),
      },
      undefined,
      { scroll: false }
    )
  }

  const today = new Date(new Date().toISOString().substring(0, 10))
  const lastDaysParam = router.query.last_days as DateFilter
  const lastDays: DateFilter =
    typeof lastDaysParam === 'string' &&
    Object.values(DateFilter).includes(lastDaysParam)
      ? lastDaysParam
      : DateFilter.Last7Days

  if (lastDaysParam === DateFilter.Custom) {
    const startDateParam = router.query.start_date as string
    const endDateParam = router.query.end_date as string

    const startDate =
      startDateParam ||
      moment(today)
        .subtract(+DateFilter.Last7Days, 'days')
        .format('YYYY-MM-DD')
    const endDate = endDateParam || moment(today).format('YYYY-MM-DD')

    return { lastDays, setDateFilter, startDate, endDate }
  }

  const startDate = moment(today)
    .subtract(+lastDays, 'days')
    .format('YYYY-MM-DD')
  const endDate =
    lastDaysParam === DateFilter.Yesterday
      ? moment(today)
          .subtract(+DateFilter.Yesterday, 'days')
          .format('YYYY-MM-DD')
      : moment(today).format('YYYY-MM-DD')

  return { lastDays, setDateFilter, startDate, endDate }
}
