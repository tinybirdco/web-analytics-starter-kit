import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { format, subDays, subMonths } from 'date-fns'

export type TimeRangeOption = {
  label: string
  value: string
  period: string
  getRange: () => { date_from: string; date_to: string }
}

const today = new Date()

export const timeRanges: TimeRangeOption[] = [
  {
    label: 'Today',
    value: 'today',
    period: 'day',
    getRange: () => ({
      date_from: format(today, 'yyyy-MM-dd'),
      date_to: format(today, 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    period: 'day',
    getRange: () => {
      const y = subDays(today, 1)
      return {
        date_from: format(y, 'yyyy-MM-dd'),
        date_to: format(y, 'yyyy-MM-dd'),
      }
    },
  },
  {
    label: '7 days',
    value: '7d',
    period: 'week',
    getRange: () => ({
      date_from: format(subDays(today, 6), 'yyyy-MM-dd'),
      date_to: format(today, 'yyyy-MM-dd'),
    }),
  },
  {
    label: '30 days',
    value: '30d',
    period: 'month',
    getRange: () => ({
      date_from: format(subDays(today, 29), 'yyyy-MM-dd'),
      date_to: format(today, 'yyyy-MM-dd'),
    }),
  },
  {
    label: '12 months',
    value: '12m',
    period: 'year',
    getRange: () => ({
      date_from: format(subMonths(today, 12), 'yyyy-MM-dd'),
      date_to: format(today, 'yyyy-MM-dd'),
    }),
  },
]

export function useTimeRange() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Find current value from search params or default to '7d'
  const value = useMemo(() => {
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    // Try to match a range
    const found = timeRanges.find(opt => {
      const { date_from: df, date_to: dt } = opt.getRange()
      return df === date_from && dt === date_to
    })
    return found?.value || '7d'
  }, [searchParams])

  // Set value and update search params
  const setValue = useCallback(
    (newValue: string) => {
      const option = timeRanges.find(opt => opt.value === newValue) || timeRanges[2] // default 7d
      const { date_from, date_to } = option.getRange()
      const params = new URLSearchParams(searchParams.toString())
      params.set('date_from', date_from)
      params.set('date_to', date_to)
      router.replace(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Always ensure search params are set on mount
  useEffect(() => {
    const date_from = searchParams?.get('date_from')
    const date_to = searchParams?.get('date_to')
    if (!date_from || !date_to) {
      setValue('7d')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentOption = timeRanges.find(opt => opt.value === value) || timeRanges[2]
  const { date_from, date_to } = currentOption.getRange()

  return {
    value,
    setValue,
    options: timeRanges,
    date_from,
    date_to,
  }
}
