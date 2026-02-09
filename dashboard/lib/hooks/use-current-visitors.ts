import useSWR from 'swr'
import { queryPipe } from '../api'
import { useSearchParams } from 'next/navigation'

async function getCurrentVisitors(domainParam?: string): Promise<number> {
  const domainFilter =
    domainParam && domainParam !== 'ALL' ? { domain: domainParam } : {}
  const { data } = await queryPipe<{ visits: number }[]>(
    'current_visitors',
    domainFilter
  )
  const [row] = data || []
  return row?.visits ?? 0
}

export default function useCurrentVisitors() {
  const searchParams = useSearchParams()
  const domainParam = searchParams.get('domain') || undefined
  const { data } = useSWR(['current_visitors', domainParam], () =>
    getCurrentVisitors(domainParam)
  )
  return data ?? 0
}
