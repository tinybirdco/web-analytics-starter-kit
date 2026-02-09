import useSWR from 'swr'
import { queryPipe } from '../api'
import { useLogin } from './use-login'

export type Domain = {
  domain: string
  first_seen: string
  last_seen: string
  total_hits: number
}

export function useDomains(tenant_id: string = '') {
  const { isLoggedIn, isLoading: isAuthLoading } = useLogin()

  const fetcher = async () => {
    const params = tenant_id ? { tenant_id } : {}
    const { data } = await queryPipe<Domain[]>('domains', params)
    return data
  }

  // Don't fetch if not logged in
  const shouldFetch = isLoggedIn && !isAuthLoading

  const { data, error, isLoading } = useSWR(
    shouldFetch ? ['domains', tenant_id] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    domains: data,
    error,
    isLoading: isAuthLoading || isLoading,
  }
} 