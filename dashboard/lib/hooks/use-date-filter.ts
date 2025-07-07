'use client'

import { parse, format, subDays } from 'date-fns'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DateRangePickerValue } from '@tremor/react'
import { DateFilter, dateFormat } from '../types/date-filter'

export default function useDateFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [dateRangePickerValue, setDateRangePickerValue] =
    useState<DateRangePickerValue>()

  const setDateFilter = useCallback(
    ([startDate, endDate, value]: DateRangePickerValue) => {
      const lastDays = value ?? DateFilter.Custom

      const newSearchParams = new URLSearchParams(searchParams?.toString() || '')
      newSearchParams.set('last_days', lastDays)

      if (lastDays === DateFilter.Custom && startDate && endDate) {
        newSearchParams.set('start_date', format(startDate, dateFormat))
        newSearchParams.set('end_date', format(endDate, dateFormat))
      } else {
        newSearchParams.delete('start_date')
        newSearchParams.delete('end_date')
      }
      router.push(`?${newSearchParams.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  const lastDaysParam = searchParams?.get('last_days') as DateFilter
  const lastDays: DateFilter =
    typeof lastDaysParam === 'string' &&
      Object.values(DateFilter).includes(lastDaysParam)
      ? lastDaysParam
      : DateFilter.Last7Days

  const { startDate, endDate } = useMemo(() => {
    const today = new Date()
    if (lastDays === DateFilter.Custom) {
      const startDateParam = searchParams?.get('start_date')
      const endDateParam = searchParams?.get('end_date')

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
  }, [lastDays, searchParams])

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
