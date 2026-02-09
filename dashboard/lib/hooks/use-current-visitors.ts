import useSWR from 'swr'
import { queryPipe } from '../api'
import { useSearchParams } from 'next/navigation'
import { useLogin } from './use-login'

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
  const { isLoggedIn, isLoading: isAuthLoading } = useLogin()

  // Don't fetch if not logged in
  const shouldFetch = isLoggedIn && !isAuthLoading

  const { data } = useSWR(
    shouldFetch ? ['current_visitors', domainParam] : null,
    () => getCurrentVisitors(domainParam)
  )
  return data ?? 0
}
