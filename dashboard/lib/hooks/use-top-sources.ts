import { useState } from 'react'
import { queryPipe } from '../api'
import { TopSource, TopSources, UTMFilter } from '../types/top-sources'
import useDateFilter from './use-date-filter'
import useQuery from './use-query'

async function getTopSources(
  date_from?: string,
  date_to?: string,
  utm_filter?: UTMFilter
): Promise<TopSources> {
  const { data: queryData } = await queryPipe<TopSource>('top_sources', {
    limit: 8,
    date_from,
    date_to,
    utm_filter,
  })

  const data: TopSource[] = [...queryData]
    .sort((a, b) => b.visits - a.visits)
    .map(({ referrer, utm_filter, visits }) => ({
      referrer: referrer || utm_filter || 'Direct',
      href: referrer ? `https://${referrer}` : undefined,
      visits,
    }))
  const refs = data.map(
    ({ referrer, utm_filter }) => (referrer ?? utm_filter) as string
  )
  const visits = data.map(({ visits }) => visits)

  return {
    data,
    refs,
    visits,
  }
}

export default function useTopSources() {
  const { startDate, endDate } = useDateFilter()
  const [utmFilter, setUtmFilter] = useState<UTMFilter>(UTMFilter.All)
  const query = useQuery(
    [
      startDate,
      endDate,
      utmFilter === UTMFilter.All ? undefined : utmFilter,
      'topSources',
    ],
    getTopSources
  )

  return { utmFilter, setUtmFilter, ...query }
}
