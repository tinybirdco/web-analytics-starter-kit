import { parse, format, subDays } from 'date-fns'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DateRangePickerValue } from '@tremor/react'
import { DateFilter, dateFormat } from '../types/date-filter'

export default function useDateFilter() {
  const router = useRouter()
  const [dateRangePickerValue, setDateRangePickerValue] =
    useState<DateRangePickerValue>()

  const setDateFilter = useCallback(
    ([startDate, endDate, value]: DateRangePickerValue) => {
      const lastDays = value ?? DateFilter.Custom

      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('last_days', lastDays)

      if (lastDays === DateFilter.Custom && startDate && endDate) {
        searchParams.set('start_date', format(startDate, dateFormat))
        searchParams.set('end_date', format(endDate, dateFormat))
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

  const { startDate, endDate } = useMemo(() => {
    const today = new Date()
    if (lastDays === DateFilter.Custom) {
      const startDateParam = router.query.start_date as string
      const endDateParam = router.query.end_date as string

      const startDate =
        startDateParam ||
        format(subDays(today, +DateFilter.Last7Days), dateFormat)
      const endDate = endDateParam || format(today, dateFormat)

      return { startDate, endDate }
    }

    const startDate = format(subDays(today, +lastDays), dateFormat)
    const endDate =
      lastDays === DateFilter.Yesterday
        ? format(subDays(today, +DateFilter.Yesterday), dateFormat)
        : format(today, dateFormat)

    return { startDate, endDate }
  }, [lastDays, router.query.start_date, router.query.end_date])

  useEffect(() => {
    setDateRangePickerValue([
      parse(startDate, dateFormat, new Date()),
      parse(endDate, dateFormat, new Date()),
      lastDays === DateFilter.Custom ? null : lastDays,
    ])
  }, [startDate, endDate, lastDays])

  const onDateRangePickerValueChange = useCallback(
    ([startDate, endDate, value]: DateRangePickerValue) => {
      if (startDate && endDate) {
        setDateFilter([startDate, endDate, value])
      } else {
        setDateRangePickerValue([startDate, endDate, value])
      }
    },
    [setDateFilter]
  )

  return {
    startDate,
    endDate,
    dateRangePickerValue,
    onDateRangePickerValueChange,
  }
}
