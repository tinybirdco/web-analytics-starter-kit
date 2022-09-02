import { queryPipe } from '../api'
import { TopBrowser, TopBrowsersData } from '../types/top-browsers'
import useDateFilter from './use-date-filter'
import useQuery from './use-query'

async function getTopBrowsers(
  date_from?: string,
  date_to?: string
): Promise<TopBrowser[]> {
  const { data } = await queryPipe<TopBrowsersData>('top_browsers', {
    date_from,
    date_to,
    limit: 4,
  })
  const sortedData = [...data].sort((a, b) => b.visits - a.visits)

  let opacity = 1
  return sortedData.map(({ browser, visits }) => {
    const browsers = {
      chrome: 'Chrome',
      safari: 'Safari',
      opera: 'Opera',
      firefox: 'Firefox',
      ie: 'IE',
    }
    const item = {
      browser: browsers[browser] ?? browser,
      visits,
      opacity,
    }
    opacity -= 0.2
    return item
  })
}

export default function useTopBrowsers() {
  const { startDate, endDate } = useDateFilter()
  return useQuery([startDate, endDate, 'topBrowsers'], getTopBrowsers)
}
