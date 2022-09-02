import { queryPipe } from '../api'
import { TopDevice, TopDevicesData } from '../types/top-devices'
import useDateFilter from './use-date-filter'
import useQuery from './use-query'

async function getTopDevices(
  date_from?: string,
  date_to?: string
): Promise<TopDevice[]> {
  const { data } = await queryPipe<TopDevicesData>('top_devices', {
    date_from,
    date_to,
    limit: 4,
  })
  const sortedData = [...data].sort((a, b) => b.visits - a.visits)

  let opacity = 1
  return sortedData.map(({ device, visits }) => {
    const devices = {
      desktop: 'Desktop',
      'mobile-android': 'Android',
      'mobile-ios': 'iOS',
      bot: 'Bots',
    }
    const item = {
      device: devices[device] ?? device,
      visits,
      opacity,
    }
    opacity -= 0.3
    return item
  })
}

export default function useTopDevices() {
  const { startDate, endDate } = useDateFilter()
  return useQuery([startDate, endDate, 'topDevices'], getTopDevices)
}
