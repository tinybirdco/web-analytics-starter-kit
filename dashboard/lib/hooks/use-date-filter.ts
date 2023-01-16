import moment from 'moment'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import {
  DateFilter,
  dateFormat,
  DateRangePickerValue,
} from '../types/date-filter'

export default function useDateFilter() {
  const router = useRouter()

  const setDateFilter = useCallback(
    ([startDate, endDate, value]: DateRangePickerValue) => {
      const lastDays = value || DateFilter.Custom

      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('last_days', lastDays)

      if (lastDays === DateFilter.Custom && startDate && endDate) {
        searchParams.set('start_date', moment(startDate).format(dateFormat))
        searchParams.set('end_date', moment(endDate).format(dateFormat))
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const lastDaysParam = router.query.last_days as DateFilter
  const lastDays: DateFilter =
    typeof lastDaysParam === 'string' &&
    Object.values(DateFilter).includes(lastDaysParam)
      ? lastDaysParam
      : DateFilter.Last7Days

  return useMemo(() => {
    const today = moment().utc()
    if (lastDaysParam === DateFilter.Custom) {
      const startDateParam = router.query.start_date as string
      const endDateParam = router.query.end_date as string

      const startDate =
        startDateParam ||
        moment(today)
          .subtract(+DateFilter.Last7Days, 'days')
          .format(dateFormat)
      const endDate = endDateParam || moment(today).format(dateFormat)

      return { lastDays, setDateFilter, startDate, endDate }
    }

    const startDate = moment(today)
      .subtract(+lastDays, 'days')
      .format(dateFormat)
    const endDate =
      lastDaysParam === DateFilter.Yesterday
        ? moment(today)
            .subtract(+DateFilter.Yesterday, 'days')
            .format(dateFormat)
        : moment(today).format(dateFormat)

    return { lastDays, setDateFilter, startDate, endDate }
  }, [
    lastDaysParam,
    router.query.start_date,
    router.query.end_date,
    lastDays,
    setDateFilter,
  ])
}
